import { BSON } from 'mongodb'

export interface IAgent {
  _id: BSON.UUID
  userId: BSON.UUID
  type: 'service' | 'web' | 'client'

  name: string
  note: string
  publicKey: string
}
