import type { TxResponse } from 'xrpl'

import { parseOfferCreate } from './OfferCreate'
import { parsePayment } from './Payment'
import type { Response } from './utils'

const pathParser = (tx: TxResponse['result']): Response => {
  if (typeof tx.meta !== 'object') throw new Error('Invalid transaction metadata')
  if (tx.meta.TransactionResult !== 'tesSUCCESS') throw new Error('Transaction not successful')

  if (tx.TransactionType === 'Payment') {
    return parsePayment(tx)
  }
  if (tx.TransactionType === 'OfferCreate') {
    return parseOfferCreate(tx)
  }

  throw new Error('Invalid transaction')
}

export default pathParser
