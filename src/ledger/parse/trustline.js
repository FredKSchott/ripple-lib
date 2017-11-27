/* @flow */

import assert from 'assert'
import {parseQuality} from './utils'
import {txFlags, removeUndefined} from '../../common'
const flags = txFlags.TrustSet

function parseFlag(flagsValue, trueValue, falseValue) {
  if (flagsValue & trueValue) {
    return true
  }
  if (flagsValue & falseValue) {
    return false
  }
  return undefined
}

function parseTrustline(tx: Object): Object {
  assert(tx.TransactionType === 'TrustSet')

  return removeUndefined({
    limit: tx.LimitAmount.value,
    currency: tx.LimitAmount.currency,
    counterparty: tx.LimitAmount.issuer,
    qualityIn: parseQuality(tx.QualityIn),
    qualityOut: parseQuality(tx.QualityOut),
    ripplingDisabled: parseFlag(
      tx.Flags, flags.SetNoRipple, flags.ClearNoRipple),
    frozen: parseFlag(tx.Flags, flags.SetFreeze, flags.ClearFreeze),
    authorized: parseFlag(tx.Flags, flags.SetAuth, 0)
  })
}

export default parseTrustline
