import { BSON } from 'mongodb'

export interface IDelegation {
  _id: BSON.UUID
  userId: BSON.UUID
  agentId: BSON.UUID
  config: unknown
}
