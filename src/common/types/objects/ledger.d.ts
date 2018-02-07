export interface Ledger {
  account_hash: string,
  accounts?: any[],
  close_time: number,
  close_time_human: string,
  close_time_resolution: number,
  closed: boolean,
  ledger_hash: string,
  ledger_index: string,
  parent_hash: string,
  total_coins: string,
  transaction_hash: string,
  transactions: string[] | object[]
}

export type FormattedLedger = {
  // TODO: properties in type don't match response object. Fix!
  // accepted: boolean,
  // closed: boolean,
  stateHash: string,
  closeTime: string,
  closeTimeResolution: number,
  closeFlags: number,
  ledgerHash: string,
  ledgerVersion: number,
  parentLedgerHash: string,
  parentCloseTime: string,
  totalDrops: string,
  transactionHash: string,
  transactions?: Array<Object>,
  rawTransactions?: string,
  transactionHashes?: Array<string>,
  rawState?: string,
  stateHashes?: Array<string>
}
