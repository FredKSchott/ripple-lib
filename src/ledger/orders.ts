import * as _ from 'lodash'
import * as utils from './utils'
import {validate} from '../common'
import parseAccountOrder from './parse/account-order'
import {RippleAPI} from '../api'
import {FormattedOrder} from '../common/types/objects'
import {AccountOffersResponse} from '../common/types/commands'

export type GetOrdersOptions = {
  limit?: number,
  ledgerVersion?: number
}

function formatResponse(
  address: string, responses: AccountOffersResponse[]
): FormattedOrder[] {
  let orders: FormattedOrder[] = []
  for (const response of responses) {
    const offers = response.offers.map(offer => {
      return parseAccountOrder(address, offer)
    })
    orders = orders.concat(offers)
  }
  return _.sortBy(orders, order => order.properties.sequence)
}

export default async function getOrders(
  this: RippleAPI, address: string, options: GetOrdersOptions = {}
): Promise<FormattedOrder[]> {
  // 1. Validate
  validate.getOrders({address, options})
  // 2. Make Request
  const responses = await this._requestAll('account_offers', {
    account: address,
    ledger_index: options.ledgerVersion || await this.getLedgerVersion(),
    limit: utils.clamp(options.limit, 10, 400) || undefined
  })
  // 3. Return Formatted Response
  return formatResponse(address, responses)
}
