import { pathParser } from '../src'
import iouPayment from './iou-payment.json'
import nonPathPayment from './non-path-payment.json'
import pathPayment from './path-payment.json'
import xrpPayment from './xrp-payment.json'

describe('Path Payment', () => {
  const sourceTxn = pathPayment as any
  const result = pathParser(sourceTxn)
  it('should Tx.Paths.length == paths.length', () => {
    expect(result.paths.length).toBe(sourceTxn.Paths.length)
    result.paths.forEach((path, i) => {
      expect(path.length).toBe(sourceTxn.Paths[i].length)
    })
  })
  it('should SendMax == sourceAmount', () => {
    if (typeof sourceTxn.SendMax === 'string') {
      expect(result.sourceAmount.currency).toEqual('XRP')
      expect(result.sourceAmount.issuer).toEqual(undefined)
    } else {
      expect(result.sourceAmount.currency).toEqual(sourceTxn.SendMax.currency)
      expect(result.sourceAmount.issuer).toEqual(sourceTxn.SendMax.issuer)
    }
  })
  it('should Amount == destinationAmount', () => {
    if (typeof sourceTxn.meta.delivered_amount === 'string') {
      expect(result.destinationAmount.currency).toEqual('XRP')
      expect(result.destinationAmount.issuer).toEqual(undefined)
    } else {
      expect(result.destinationAmount.currency).toEqual(sourceTxn.meta.delivered_amount.currency)
      expect(result.destinationAmount.issuer).toEqual(sourceTxn.meta.delivered_amount.issuer)
    }
  })
  it('should Account == sourceAccount', () => {
    expect(result.sourceAccount).toEqual(sourceTxn.Account)
  })
  it('should Account == destinationAccount', () => {
    expect(result.destinationAccount).toEqual(sourceTxn.Destination)
  })
})

describe('non-Path Payment', () => {
  const sourceTxn = nonPathPayment as any
  const result = pathParser(sourceTxn as any)
  it('should paths.length == 1', () => {
    // direct path
    expect(result.paths.length).toBe(1)
  })
  it('should SendMax == sourceAmount', () => {
    if (typeof sourceTxn.SendMax === 'string') {
      expect(result.sourceAmount.currency).toEqual('XRP')
      expect(result.sourceAmount.issuer).toEqual(undefined)
    } else {
      expect(result.sourceAmount.currency).toEqual(sourceTxn.SendMax.currency)
      expect(result.sourceAmount.issuer).toEqual(sourceTxn.SendMax.issuer)
    }
  })
  it('should Amount == destinationAmount', () => {
    if (typeof sourceTxn.meta.delivered_amount === 'string') {
      expect(result.destinationAmount.currency).toEqual('XRP')
      expect(result.destinationAmount.issuer).toEqual(undefined)
    } else {
      expect(result.destinationAmount.currency).toEqual(sourceTxn.meta.delivered_amount.currency)
      expect(result.destinationAmount.issuer).toEqual(sourceTxn.meta.delivered_amount.issuer)
    }
  })
  it('should Account == sourceAccount', () => {
    expect(result.sourceAccount).toEqual(sourceTxn.Account)
  })
  it('should Account == destinationAccount', () => {
    expect(result.destinationAccount).toEqual(sourceTxn.Destination)
  })
})

describe('IOU Payment', () => {
  const sourceTxn = iouPayment as any
  const result = pathParser(sourceTxn as any)
  it('should paths.length == 0', () => {
    // direct path
    expect(result.paths.length).toBe(0)
  })
  it('should SendMax == Amount', () => {
    if (typeof sourceTxn.Amount === 'string') {
      expect(result.sourceAmount.currency).toEqual('XRP')
      expect(result.sourceAmount.issuer).toEqual(undefined)
    } else {
      expect(result.sourceAmount.currency).toEqual(sourceTxn.Amount.currency)
      expect(result.sourceAmount.issuer).toEqual(sourceTxn.Amount.issuer)
    }
  })
  it('should Amount == destinationAmount', () => {
    if (typeof sourceTxn.meta.delivered_amount === 'string') {
      expect(result.destinationAmount.currency).toEqual('XRP')
      expect(result.destinationAmount.issuer).toEqual(undefined)
    } else {
      expect(result.destinationAmount.currency).toEqual(sourceTxn.meta.delivered_amount.currency)
      expect(result.destinationAmount.issuer).toEqual(sourceTxn.meta.delivered_amount.issuer)
    }
  })
  it('should Account == sourceAccount', () => {
    expect(result.sourceAccount).toEqual(sourceTxn.Account)
  })
  it('should Account == destinationAccount', () => {
    expect(result.destinationAccount).toEqual(sourceTxn.Destination)
  })
})

describe('XRP Payment', () => {
  const sourceTxn = xrpPayment as any
  const result = pathParser(sourceTxn as any)
  it('should paths.length == 0', () => {
    // direct path
    expect(result.paths.length).toBe(0)
  })
  it('should SendMax == Amount', () => {
    if (typeof sourceTxn.Amount === 'string') {
      expect(result.sourceAmount.currency).toEqual('XRP')
      expect(result.sourceAmount.issuer).toEqual(undefined)
    } else {
      expect(result.sourceAmount.currency).toEqual(sourceTxn.Amount.currency)
      expect(result.sourceAmount.issuer).toEqual(sourceTxn.Amount.issuer)
    }
  })
  it('should Amount == destinationAmount', () => {
    if (typeof sourceTxn.meta.delivered_amount === 'string') {
      expect(result.destinationAmount.currency).toEqual('XRP')
      expect(result.destinationAmount.issuer).toEqual(undefined)
    } else {
      expect(result.destinationAmount.currency).toEqual(sourceTxn.meta.delivered_amount.currency)
      expect(result.destinationAmount.issuer).toEqual(sourceTxn.meta.delivered_amount.issuer)
    }
  })
  it('should Account == sourceAccount', () => {
    expect(result.sourceAccount).toEqual(sourceTxn.Account)
  })
  it('should Account == destinationAccount', () => {
    expect(result.destinationAccount).toEqual(sourceTxn.Destination)
  })
})

describe('OfferCreate', () => {
  it.todo('')
})
