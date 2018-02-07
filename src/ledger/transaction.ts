import * as _ from 'lodash'
import * as utils from './utils'
import parseTransaction from './parse/transaction'
import {validate, errors} from '../common'
import {Connection} from '../common'
import {RippleAPI} from '../api'
import {ensureLedgerVersion} from './utils'
import {TxResponse} from '../common/types/commands/tx'
import {FormattedTransactionType} from '../transaction/types'
import {LedgerResponse} from '../common/types/commands/index'

type GetTransactionOptions = {
  minLedgerVersion?: number,
  maxLedgerVersion?: number
}

async function attachTransactionDate(
  api: RippleAPI, tx: any
): Promise<TxResponse> {
  if (tx.date) {
    return Promise.resolve(tx)
  }

  const ledgerVersion = tx.ledger_index || tx.LedgerSequence

  if (!ledgerVersion) {
    return new Promise(() => {
      throw new errors.NotFoundError(
        'ledger_index and LedgerSequence not found in tx')
    })
  }

  let response: LedgerResponse
  try {
    response = await api._request('ledger', {ledger_index: ledgerVersion})
  } catch (err) {
    throw new errors.NotFoundError('Transaction ledger not found')
  }
  if (typeof response.ledger.close_time !== 'number') {
    throw new errors.UnexpectedError('Ledger missing close_time')
  }
  return _.assign({date: response.ledger.close_time}, tx)
}

function isTransactionInRange(tx: any, options: GetTransactionOptions) {
  return (!options.minLedgerVersion
          || tx.ledger_index >= options.minLedgerVersion)
      && (!options.maxLedgerVersion
          || tx.ledger_index <= options.maxLedgerVersion)
}

function convertError(connection: Connection, options: GetTransactionOptions,
  error: Error
): Promise<Error> {
  const _error = (error.message === 'txnNotFound') ?
    new errors.NotFoundError('Transaction not found') : error
  if (_error instanceof errors.NotFoundError) {
    return utils.hasCompleteLedgerRange(connection, options.minLedgerVersion,
      options.maxLedgerVersion).then(hasCompleteLedgerRange => {
      if (!hasCompleteLedgerRange) {
        return utils.isPendingLedgerVersion(
          connection, options.maxLedgerVersion)
          .then(isPendingLedgerVersion => {
            return isPendingLedgerVersion ?
              new errors.PendingLedgerVersionError() :
              new errors.MissingLedgerHistoryError()
          })
      }
      return _error
    })
  }
  return Promise.resolve(_error)
}

function formatResponse(options: GetTransactionOptions, tx: TxResponse
): FormattedTransactionType {
  if (tx.validated !== true || !isTransactionInRange(tx, options)) {
  throw new errors.NotFoundError('Transaction not found')
  }
  return parseTransaction(tx)
}

async function getTransaction(
  this: RippleAPI, id: string, options: GetTransactionOptions = {}
): Promise<FormattedTransactionType> {
  try {
    // 1. Validate
    validate.getTransaction({id, options})
    options = await ensureLedgerVersion.call(this, options)
    // 2. Make Request
    const response = await this._request('tx', {
      transaction: id,
      binary: false
    })
    const responseWithDate = await attachTransactionDate(this, response)
    // 3. Return Formatted Response
    return formatResponse(options, responseWithDate)
  } catch (err) {
    throw await convertError(this.connection, options, err)
  }
}

export default getTransaction
