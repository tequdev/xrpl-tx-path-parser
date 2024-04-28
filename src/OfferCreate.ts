import type { Balance, OfferCreate, Path, TxResponse } from 'xrpl'
import { pathParser } from './PathParser'
import { amountToBalance, getAccountBalanceChanges, getOfferChangesAmount } from './utils'

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
      {
        currency: destination.currency,
        issuer: destination.issuer,
      },
    ],
  ]
}

export const parseOfferCreate = (tx: TxResponse<OfferCreate>['result']) => {
  if (typeof tx.meta !== 'object') throw new Error('Invalid transaction metadata')

  const accountBalanceChanges = getAccountBalanceChanges(tx.meta)
  const balances = accountBalanceChanges.find((change) => change.account === tx.Account)?.balances
  const ammBalanceChanges = accountBalanceChanges.filter((change) => change.isAMM)

  const offerChanges = getOfferChangesAmount(tx)

  if (!balances) throw new Error('Account balance not found')
  let sourceAmount = balances.find(
    (balance) =>
      amountToBalance(tx.TakerGets).currency === balance.currency &&
      amountToBalance(tx.TakerGets).issuer === balance.issuer,
  )
  let destinationAmount = balances.find(
    (balance) =>
      amountToBalance(tx.TakerPays).currency === balance.currency &&
      amountToBalance(tx.TakerPays).issuer === balance.issuer,
  )

  if (offerChanges.length === 0 && ammBalanceChanges.length === 0) {
    sourceAmount = amountToBalance(tx.TakerGets)
    sourceAmount.value = '0'
    destinationAmount = amountToBalance(tx.TakerPays)
    destinationAmount.value = '0'
  } else if (!sourceAmount || !destinationAmount) {
    throw new Error('Invalid OfferCreate execution')
  }

  const sourceAccount = tx.Account
  const destinationAccount = tx.Account
  const txPaths = createOfferCreatePaths(sourceAmount, destinationAmount)

  return pathParser(tx, sourceAccount, sourceAmount, destinationAccount, destinationAmount, txPaths)
}
