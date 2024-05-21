import type { Balance, Currency, Path, TxResponse } from 'xrpl'
import { type Response, equalCurrency, getAccountBalanceChanges, getAmmAccounts, getOfferChangesAmount } from './utils'

import { Decimal } from 'decimal.js'

export const pathParser = (
  tx: TxResponse['result'],
  sourceAccount: string,
  sourceAmount: Balance,
  destinationAccount: string,
  destinationAmount: Balance,
  txPaths: Path[]
) => {
  if (typeof tx.meta !== 'object') throw new Error('Invalid transaction metadata')

  const offerChanges = getOfferChangesAmount(tx)
  const offerExchanges = getOfferChangesAmount(tx, false)
  const accountBalanceChanges = getAccountBalanceChanges(tx.meta)

  const ammAccounts = getAmmAccounts(tx.meta)

  const stepOffers = (
    current_currency: Currency | Balance,
    stepCurrency: Currency | Balance,
  ): Record<'takerPaid' | 'takerGot', Balance> | undefined => {
    const offer = offerChanges.find((offerChange) => {
      return equalCurrency(offerChange.takerPaid, current_currency) && equalCurrency(offerChange.takerGot, stepCurrency)
    })
    return offer
  }

  const stepAMMs = (
    current_currency: Currency | Balance,
    stepCurrency: Currency | Balance,
  ): Record<'ammPaid' | 'ammGot', Balance> | undefined => {
    const ammChange = accountBalanceChanges.find(
      (change) =>
        ammAccounts.includes(change.account) &&
        change.balances.every((c) => equalCurrency(c, current_currency) || equalCurrency(c, stepCurrency)),
    )
    if (!ammChange) return undefined
    const _ammGot = ammChange.balances.find((change) => equalCurrency(change, current_currency))
    const _ammPaid = ammChange.balances.find((change) => equalCurrency(change, stepCurrency))
    if (!_ammGot || !_ammPaid) throw new Error('AMM Balance not found')
    return {
      ammGot: _ammGot,
      ammPaid: _ammPaid,
    }
  }

  const paths = txPaths.map((path): Response['paths'][number] => {
    let current_currency: Balance = sourceAmount
    return path.map((step) => {
      if (step.issuer || step.currency) {
        // type: 16(currency) or type: 32(issuer) or type: 48(issuer+currency)
        const offer = stepOffers(current_currency, step as Currency)
        const amm = stepAMMs(current_currency, step as Currency)

        let from =
          offer && amm
            ? //
              {
                ...offer.takerPaid,
                value: new Decimal(offer.takerPaid.value).abs().plus(new Decimal(amm.ammGot.value).abs()).toString(),
              }
            : offer
              ? offer.takerPaid
              : amm?.ammGot

        let to =
          offer && amm
            ? {
                ...offer.takerGot,
                value: new Decimal(offer.takerGot.value).abs().plus(new Decimal(amm.ammPaid.value).abs()).toString(),
              }
            : offer
              ? offer.takerGot
              : amm?.ammPaid

        if (!from) {
          from = { ...current_currency, value: '0' }
        }
        if (!to) {
          to = { ...(step as Balance), value: '0' }
        }

        current_currency = to

        return {
          from,
          to,
          type: {
            offer: !!offer,
            amm: !!amm,
            rippling: false,
          },
        }
      }
      if (step.account) {
        // type: 1(account)(rippling)
        const change = accountBalanceChanges.find((change) => change.account === step.account)
        let from: Balance | undefined
        let to: Balance | undefined
        if (!change) {
          from = { ...current_currency, value: '0' }
          to = { ...destinationAmount, value: '0' }
        } else {
          from = change.balances.find((balance) => !balance.value.startsWith('-'))
          to = change.balances.find((balance) => balance.value.startsWith('-'))
        }

        if (!from || !to) throw new Error('Invalid Account Balance Change')

        current_currency = to

        return {
          rippling: step.account,
          from: from,
          to: to,
          type: {
            offer: false,
            amm: false,
            rippling: true,
          },
        }
      }
      throw new Error('Invalid Path step')
    })
  })

  const result: Response = {
    sourceAccount,
    destinationAccount,
    sourceAmount,
    destinationAmount,
    paths,
    offerExchanges,
    accountBalanceChanges
  }

  return result
}
