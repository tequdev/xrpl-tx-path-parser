import type { Balance, Currency, Payment, TxResponse } from 'xrpl'
import {
  type Response,
  amountToBalance,
  getAccountBalanceChanges,
  getAmmAccounts,
  getOfferChangesAmount,
} from './utils'

export const parsePathPayment = (tx: TxResponse<Payment>['result']) => {
  if (typeof tx.meta !== 'object') throw new Error('Invalid transaction metadata')
  if (!tx.meta.delivered_amount) throw new Error('Invalid transaction type')

  if (!tx.SendMax) throw new Error('SendMax not found / Not a Path Payment')
  if (!tx.Paths) throw new Error('Paths not found / Not a Path Payment')

  const offerChanges = getOfferChangesAmount(tx)
  const accountBalanceChanges = getAccountBalanceChanges(tx.meta)

  const ammAccounts = getAmmAccounts(tx.meta)
  const sourceAmount = amountToBalance(tx.SendMax)
  const destinationAmount = amountToBalance(tx.meta.delivered_amount)

  const equalCurrency = (a: Balance | Currency, b: Balance | Currency) =>
    a.issuer === b.issuer && a.currency === b.currency

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

  const paths = tx.Paths.map((path): Response['paths'][number] => {
    let current_currency: Balance = sourceAmount
    return path.map((step) => {
      if (step.issuer || step.currency) {
        // type: 16(currency) or type: 32(issuer) or type: 48(issuer+currency)
        const offer = stepOffers(current_currency, step as Currency)
        const amm = stepAMMs(current_currency, step as Currency)

        const from =
          offer && amm
            ? //
              {
                ...offer.takerPaid,
                value: String(Number.parseFloat(offer.takerPaid.value) + Number.parseFloat(amm.ammGot.value)),
              }
            : offer
              ? offer.takerPaid
              : amm?.ammGot

        const to =
          offer && amm
            ? {
                ...offer.takerGot,
                value: String(Number.parseFloat(offer.takerGot.value) + Number.parseFloat(amm.ammPaid.value)),
              }
            : offer
              ? offer.takerGot
              : amm?.ammPaid

        if (!from || !to) throw new Error('Invalid Offer/AMM')

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
        if (!change) throw new Error('Account Balance Change not found')
        const from = change.balances.find((balance) => !balance.value.includes('-'))
        const to = change.balances.find((balance) => balance.value.includes('-'))

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
    sourceAccount: tx.Account,
    destinationAccount: tx.Destination,
    sourceAmount,
    destinationAmount,
    paths,
  }

  return result
}
