import type { TxResponse } from 'xrpl'

import { parsePathPayment } from './PathPayment'

export const pathParser = (tx: TxResponse['result']) => {
  if (typeof tx.meta !== 'object') throw new Error('Invalid transaction metadata')
  if (tx.meta.TransactionResult !== 'tesSUCCESS') throw new Error('Transaction not successful')

  if (tx.TransactionType === 'Payment') {
    if (tx.Paths) return parsePathPayment(tx)
  }

  throw new Error('Invalid transaction')
}
