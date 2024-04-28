import type { Amount, Balance, Path, Payment, TxResponse } from 'xrpl'
import { pathParser } from './PathParser'
import { amountToBalance } from './utils'

const createPaymentDefaultPaths = (source: Balance, destination: Balance): Path[] => {
  if (source.currency === destination.currency && source.issuer === destination.issuer) {
    return []
  }
  return [
    [
      {
        currency: destination.currency,
        issuer: destination.issuer,
      },
    ],
  ]
}

const createSourceAmount = (sendMax: Amount | undefined, amount: Amount): Balance => {
  if (sendMax) {
    return amountToBalance(sendMax)
  }
  return amountToBalance(amount)
}

export const parsePayment = (tx: TxResponse<Payment>['result']) => {
  if (typeof tx.meta !== 'object') throw new Error('Invalid transaction metadata')
  if (!tx.meta.delivered_amount) throw new Error('Invalid transaction type')

  const sourceAmount = createSourceAmount(tx.SendMax, tx.Amount)
  const destinationAmount = amountToBalance(tx.meta.delivered_amount)
  const sourceAccount = tx.Account
  const destinationAccount = tx.Destination
  const txPaths = tx.Paths || createPaymentDefaultPaths(sourceAmount, destinationAmount)

  return pathParser(tx, sourceAccount, sourceAmount, destinationAccount, destinationAmount, txPaths)
}
