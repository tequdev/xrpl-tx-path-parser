import type { Amount, Balance, OfferCreate, Path, Payment, TxResponse } from 'xrpl'
import { pathParser } from './PathParser'
import { amountToBalance, getAccountBalanceChanges } from './utils'

const createOfferCreatePaths = (source: Balance, destination: Balance): Path[] => {
  if (source.currency === 'XRP' || destination.currency === 'XRP') {
    return [
      [
        {
          currency: destination.currency,
          issuer: destination.issuer,
        },
      ],
    ]
  }
  return [
    [
      {
        currency: destination.currency,
        issuer: destination.issuer,
      },
    ],
    [
      {
        currency: 'XRP',
      },
    ],
  ]
}

export const parseOfferCreate = (tx: TxResponse<OfferCreate>['result']) => {
  if (typeof tx.meta !== 'object') throw new Error('Invalid transaction metadata')

  const accountBalanceChanges = getAccountBalanceChanges(tx.meta)
  const balances = accountBalanceChanges.find((change) => change.account === tx.Account)?.balances
  if (!balances) throw new Error('Account balance not found')
  const sourceAmount = balances.find(
    (balance) =>
      amountToBalance(tx.TakerGets).currency === balance.currency &&
      amountToBalance(tx.TakerGets).issuer === balance.issuer,
  )
  const destinationAmount = balances.find(
    (balance) =>
      amountToBalance(tx.TakerPays).currency === balance.currency &&
      amountToBalance(tx.TakerPays).issuer === balance.issuer,
  )

  if (!sourceAmount || !destinationAmount) throw new Error('Source or destination amount not found')

  const sourceAccount = tx.Account
  const destinationAccount = tx.Account
  const txPaths = createOfferCreatePaths(sourceAmount, destinationAmount)

  return pathParser(tx, sourceAccount, sourceAmount, destinationAccount, destinationAmount, txPaths)
}
