# XRP Ledger Transaction Path Parser

[![npm version](https://badge.fury.io/js/xrpl-tx-path-parser.svg)](https://badge.fury.io/js/xrpl-tx-path-parser)

Get paths through which currency was exchanged in a Payment or OfferCreate transaction.

## Installation

```sh
npm install xrpl-tx-path-parser
```


## Usage

```ts
import { Client } from 'xrpl'
import pathParser from 'xrpl-tx-path-parser'

const client = new Client('wss://xrpl.ws')

await client.connect()
const response = await client.request({
  command: 'tx',
  transaction: '22AD627BC0300761C03BE3B2BE36850F96CDB6115692ACA2F97C7FE49A51D07E',
})

pathParser(response.result)
```

## Example Result

```json
{
  "sourceAccount": "rQQQrUdN1cLdNmxH4dHfKgmX5P4kf3ZrM",
  "destinationAccount": "rQQQrUdN1cLdNmxH4dHfKgmX5P4kf3ZrM",
  "sourceAmount": {
    "currency": "XRP",
    "value": "1"
  },
  "destinationAmount": {
    "currency": "USD",
    "issuer": "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq",
    "value": "0.5263781643315358"
  },
  "paths": [
    [
      {
        "from": {
          "currency": "XRP",
          "value": "0.751491"
        },
        "to": {
          "issuer": "rswh1fvyLqHizBS2awu1vs6QcmwTBd9qiv",
          "currency": "XAH",
          "value": "-2.8680278129"
        },
        "type": {
          "offer": false,
          "amm": true,
          "rippling": false
        }
      },
      {
        "from": {
          "issuer": "rswh1fvyLqHizBS2awu1vs6QcmwTBd9qiv",
          "currency": "XAH",
          "value": "2.8680278130155"
        },
        "to": {
          "issuer": "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq",
          "currency": "USD",
          "value": "-0.3969661226295"
        },
        "type": {
          "offer": false,
          "amm": true,
          "rippling": false
        }
      }
    ],
    [
      {
        "from": {
          "currency": "XRP",
          "value": "0.244308"
        },
        "to": {
          "issuer": "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq",
          "currency": "USD",
          "value": "-0.12824662619"
        },
        "type": {
          "offer": false,
          "amm": true,
          "rippling": false
        }
      }
    ],
    [
      {
        "from": {
          "currency": "XRP",
          "value": "0.004201"
        },
        "to": {
          "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          "currency": "USD",
          "value": "-0.0022214991"
        },
        "type": {
          "offer": false,
          "amm": true,
          "rippling": false
        }
      },
      {
        "rippling": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
        "from": {
          "issuer": "rHUpaqUPbwzKZdzQ8ZQCme18FrgW9pB4am",
          "currency": "USD",
          "value": "0.0022214991"
        },
        "to": {
          "issuer": "rK6hHGXPVgpQrhZHjVDxq7Kv8YUrATEWvD",
          "currency": "USD",
          "value": "-0.002218171836519994"
        },
        "type": {
          "offer": false,
          "amm": false,
          "rippling": true
        }
      },
      {
        "rippling": "rK6hHGXPVgpQrhZHjVDxq7Kv8YUrATEWvD",
        "from": {
          "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          "currency": "USD",
          "value": "0.002218171836519994"
        },
        "to": {
          "issuer": "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq",
          "currency": "USD",
          "value": "-0.002218171836519994"
        },
        "type": {
          "offer": false,
          "amm": false,
          "rippling": true
        }
      }
    ]
  ]
}
```
