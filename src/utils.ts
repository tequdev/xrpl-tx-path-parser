// @ts-ignore
import { extractExchanges } from '@xrplkit/txmeta'
import {
  type Amount,
  type Balance,
  type Currency,
  type ModifiedNode,
  type TxResponse,
  dropsToXrp,
  getBalanceChanges,
  isModifiedNode,
} from 'xrpl'
import type { RippleState } from 'xrpl/dist/npm/models/ledger'
import type { PaymentMetadata } from 'xrpl/dist/npm/models/transactions/payment'

export type OfferExchange = {
  hash: string
  maker: string
  taker: string
  sequence: number
  takerPaid: Balance
  takerGot: Balance
}
export type AccountBalanceChange = {
  isAMM: boolean
  isOffer: boolean
  isRippling: boolean
  isDirect: boolean
  account: string
  balances: Balance[]
}
export type Path = {
  from: Balance
  to: Balance
  type: {
    offer: boolean
    amm: boolean
    rippling: boolean
  }
}[]

export type Response = {
  sourceAccount: string
  destinationAccount: string
  sourceAmount: Balance
  destinationAmount: Balance
  offerExchanges: OfferExchange[]
  accountBalanceChanges: AccountBalanceChange[]
  paths: Path[]
}

const lsfAMMNode = 0x01000000

export const equalCurrency = (a: Balance | Currency, b: Balance | Currency) =>
  a.issuer === b.issuer && a.currency === b.currency

export const getOfferChangesAmount = (tx: TxResponse['result'], collapsed = true) => {
  return extractExchanges(tx, { collapse: collapsed }) as OfferExchange[]
}

export const getAmmAccounts = (meta: PaymentMetadata): string[] => {
  const modifiedAMMNodes = meta.AffectedNodes.filter(
    (node) =>
      isModifiedNode(node) &&
      node.ModifiedNode.LedgerEntryType === 'RippleState' &&
      lsfAMMNode & (node.ModifiedNode.FinalFields?.Flags as number),
  ) as ModifiedNode[]

  const modifiedAmmAccount = modifiedAMMNodes.map((node) => {
    const finalFields = node.ModifiedNode.FinalFields as unknown as RippleState
    return finalFields.Balance.value.startsWith('-') ? finalFields.HighLimit.issuer : finalFields.LowLimit.issuer
  })

  const unique = modifiedAmmAccount.filter((elem, index, self) => self.indexOf(elem) === index)

  return unique
}

export const getAccountBalanceChanges = (tx: TxResponse['result']) => {
  if (!tx.meta) throw new Error('Transaction metadata not found')
  if (typeof tx.meta === 'string') throw new Error('Transaction metadata should be an object')

  const ammAccounts = getAmmAccounts(tx.meta)
  const exchanges = extractExchanges(tx, { collapse: false })

  return getBalanceChanges(tx.meta).map((change) => {
    const isAMM = ammAccounts.includes(change.account)
    const isOffer = exchanges.filter((offer: { maker: string }) => offer.maker === change.account).length > 0
    const isDirect = change.balances.length === 1
    const isRippling = !(isAMM || isOffer || isDirect)
    return {
      ...change,
      isAMM,
      isOffer,
      isRippling,
      isDirect,
    }
  })
}

export const amountToBalance = (amount: Amount): Balance => {
  if (typeof amount === 'string') {
    return {
      currency: 'XRP',
      value: dropsToXrp(amount).toString(),
    }
  }
  return amount
}
