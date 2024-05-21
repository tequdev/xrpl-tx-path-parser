import type { Balance, Currency, Path, TxResponse } from 'xrpl'
import { type Response, equalCurrency, getAccountBalanceChanges, getAmmAccounts, getOfferChangesAmount } from './utils'

import { Decimal } from 'decimal.js'

export const pathParser = (
  tx: TxResponse['result'],
  sourceAccount: string,
  sourceAmount: Balance,
  destinationAccount: string,
  destinationAmount: Balance,
  paths: Path[]
) => {
  if (typeof tx.meta !== 'object') throw new Error('Invalid transaction metadata')

  const offerChanges = getOfferChangesAmount(tx)
  const offerExchanges = getOfferChangesAmount(tx, false)
  const accountBalanceChanges = getAccountBalanceChanges(tx, tx.meta)

  const ammAccounts = getAmmAccounts(tx.meta)
  // const paths = txPaths

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
