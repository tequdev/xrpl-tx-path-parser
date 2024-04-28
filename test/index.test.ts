import { pathParser } from '../src'
import nonPathPayment from './non-path-payment.json'
import pathPayment from './path-payment.json'

describe('Path Payment', () => {
  const result = pathParser(pathPayment as any)
  it('should Tx.Paths.length == paths.length', () => {
    expect(result.paths.length).toBe(pathPayment.Paths.length)
    result.paths.forEach((path, i) => {
      expect(path.length).toBe(pathPayment.Paths[i].length)
    })
  })
  it('should SendMax == sourceAmount', () => {
    if (typeof pathPayment.SendMax === 'string') {
      expect(result.sourceAmount.currency).toEqual('XRP')
      expect(result.sourceAmount.issuer).toEqual(undefined)
    } else {
      expect(result.sourceAmount.currency).toEqual(pathPayment.SendMax.currency)
      expect(result.sourceAmount.issuer).toEqual(pathPayment.SendMax.issuer)
    }
  })
  it('should Amount == destinationAmount', () => {
    if (typeof pathPayment.meta.delivered_amount === 'string') {
      expect(result.destinationAmount.currency).toEqual('XRP')
      expect(result.destinationAmount.issuer).toEqual(undefined)
    } else {
      expect(result.destinationAmount.currency).toEqual(pathPayment.meta.delivered_amount.currency)
      expect(result.destinationAmount.issuer).toEqual(pathPayment.meta.delivered_amount.issuer)
    }
  })
  it('should Account == sourceAccount', () => {
    expect(result.sourceAccount).toEqual(pathPayment.Account)
  })
  it('should Account == destinationAccount', () => {
    expect(result.destinationAccount).toEqual(pathPayment.Destination)
  })
})

describe('non-Path Payment', () => {
  const result = pathParser(nonPathPayment as any)
  it('should paths.length == 1', () => {
    // direct path
    expect(result.paths.length).toBe(1)
  })
  it('should SendMax == sourceAmount', () => {
    if (typeof nonPathPayment.SendMax === 'string') {
      expect(result.sourceAmount.currency).toEqual('XRP')
      expect(result.sourceAmount.issuer).toEqual(undefined)
    } else {
      expect(result.sourceAmount.currency).toEqual(nonPathPayment.SendMax.currency)
      expect(result.sourceAmount.issuer).toEqual(nonPathPayment.SendMax.issuer)
    }
  })
  it('should Amount == destinationAmount', () => {
    if (typeof nonPathPayment.meta.delivered_amount === 'string') {
      expect(result.destinationAmount.currency).toEqual('XRP')
      expect(result.destinationAmount.issuer).toEqual(undefined)
    } else {
      expect(result.destinationAmount.currency).toEqual(nonPathPayment.meta.delivered_amount.currency)
      expect(result.destinationAmount.issuer).toEqual(nonPathPayment.meta.delivered_amount.issuer)
    }
  })
  it('should Account == sourceAccount', () => {
    expect(result.sourceAccount).toEqual(nonPathPayment.Account)
  })
  it('should Account == destinationAccount', () => {
    expect(result.destinationAccount).toEqual(nonPathPayment.Destination)
  })
  console.log(JSON.stringify(result.paths, null, 2))
})
describe('OfferCreate', () => {
  it.todo('')
})
