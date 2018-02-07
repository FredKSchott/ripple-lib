import {TransactionType} from '../objects';

export interface TxRequest {
  transaction: string,
  binary?: boolean
}

export type TxResponse = TransactionType & {
  hash: string,
  ledger_index: number,
  meta: any,
  validated?: boolean
}
