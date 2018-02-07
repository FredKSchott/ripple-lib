import * as _ from 'lodash'
import parseFields from './parse/fields'
import {validate, constants} from '../common'
import {FormattedSettings} from '../common/types/objects/settings'
const AccountFlags = constants.AccountFlags

type SettingsOptions = {
  ledgerVersion?: number
}

function parseFlags(value) {
  const settings = {}
  for (const flagName in AccountFlags) {
    if (value & AccountFlags[flagName]) {
      settings[flagName] = true
    }
  }
  return settings
}

function formatSettings(response) {
  const data = response.account_data
  const parsedFlags = parseFlags(data.Flags)
  const parsedFields = parseFields(data)
  return _.assign({}, parsedFlags, parsedFields)
}

async function getSettings(address: string, options: SettingsOptions = {}
): Promise<FormattedSettings> {
  // 1. Validate
  validate.getSettings({address, options})
  // 2. Make Request
  const response = await this._request('account_info', {
    account: address,
    ledger_index: options.ledgerVersion || 'validated',
    signer_lists: true
  })
  // 3. Return Formatted Response
  return formatSettings(response)
}

export default getSettings
