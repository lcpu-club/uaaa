import { type Db, MongoClient } from 'mongodb'
import { defineInit } from './app.js'
import { IUser, IAgent, ISystemState, IDelegation } from './model/index.js'
import { CURRENT_DB_VERSION } from './migration/index.js'
import { KeyObject, createPrivateKey, createPublicKey } from 'crypto'

declare module './app.js' {
  interface App {
    mongo: IAppMongoContext
    system: ISystemState
    keyPair: {
      publicKey: KeyObject
      privateKey: KeyObject
    }
  }
}

export function getCollections(db: Db) {
  return {
    system: db.collection<ISystemState>('system'),
    users: db.collection<IUser>('users'),
    agents: db.collection<IAgent>('agents'),
    delegations: db.collection<IDelegation>('delegations')
  }
}

export interface IAppMongoContext extends ReturnType<typeof getCollections> {
  client: MongoClient
  db: Db
}

function checkKeyPair(privateKey: KeyObject, publicKey: KeyObject) {
  const derivedPublicKey = createPublicKey(privateKey)
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' })
  const derivedPem = derivedPublicKey.export({ type: 'spki', format: 'pem' })
  return publicPem === derivedPem
}

export const initMongo = defineInit(async (app) => {
  const client = new MongoClient(app.config.mongoUrl)
  await client.connect()
  const db = client.db()
  const collections = getCollections(db)
  const system = await collections.system.findOne()
  if (system?.dbVersion !== CURRENT_DB_VERSION) {
    throw new Error(`Database version mismatch. Please do migration first.`)
  }
  app.system = system
  const privateKey = createPrivateKey({
    key: app.system.privateKey,
    format: 'pem',
    passphrase: app.config.keyPassphrase
  })
  const publicKey = createPublicKey({
    key: app.system.publicKey,
    format: 'pem'
  })
  if (!checkKeyPair(privateKey, publicKey)) {
    throw new Error(`Private key passphrase mismatch`)
  }
  app.keyPair = { privateKey, publicKey }
  const mongo = (app.mongo = {
    client,
    db,
    ...collections
  })
  await mongo.users.createIndex({ [`profile.login`]: 1 }, { unique: true })
  await mongo.tokens.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 })
})
