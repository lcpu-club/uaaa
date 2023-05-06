import { BSON, MongoClient } from 'mongodb'
import { env } from '../config.js'
import { getCollections } from '../mongo.js'
import { generateKeyPairSync } from 'crypto'
import bcrypt from 'bcrypt'

export const CURRENT_DB_VERSION = 1

export interface IMigrateDbOptions {
  url?: string
  initPassphrase?: string
}

export async function migrateDb({ url, initPassphrase }: IMigrateDbOptions) {
  const client = new MongoClient(env.string('MONGO_URL', url))
  await client.connect()
  const db = client.db()
  const collections = getCollections(db)
  const system = await collections.system.findOne()
  if (system) {
    throw new Error(`Not implemented yet`)
  } else {
    if (!initPassphrase) throw new Error(`Passphrase is required for init`)
    const adminPassword = new BSON.UUID().toString()
    const { insertedId: adminId } = await collections.users.insertOne({
      _id: new BSON.UUID(),
      profile: {
        login: 'admin',
        name: 'Administrator',
        email: 'admin@uaaa.dev',
        status: ''
      },
      capability: {},
      password: await bcrypt.hash(adminPassword, 10)
    })

    console.log(`Admin user created with password=${adminPassword}`)

    const keyPair = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: initPassphrase
      }
    })

    console.log(`RSA key pair generated`)

    const { insertedId: selfId } = await collections.agents.insertOne({
      _id: new BSON.UUID(),
      userId: adminId,
      type: 'service',
      name: 'UAAA Server',
      note: 'UAAA Server',
      publicKey: keyPair.publicKey
    })

    console.log(`UAAA server agent created`)

    await collections.system.insertOne({
      dbVersion: CURRENT_DB_VERSION,
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      serverAgentId: selfId
    })
  }
  client.close()
}
