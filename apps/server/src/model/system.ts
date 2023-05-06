import { BSON } from 'mongodb'

export interface ISystemState {
  dbVersion: number
  privateKey: string // PEM encoded
  publicKey: string // PEM encoded
  serverAgentId: BSON.UUID
}
