import { Type } from '@sinclair/typebox'
import { defineRouter } from '../../index.js'
import jwt from 'jsonwebtoken'
import { ILoginToken } from '../../../model/token.js'
import { BSON } from 'mongodb'

export const v1LoginRouter = defineRouter(async (server) => {
  for (const idp of Object.values(server.app.identityProviders)) {
    server.post(
      `/${idp.id}`,
      {
        schema: {
          body: Type.Object({
            data: idp.loginSchema ?? Type.Any()
          })
        }
      },
      async (req) => {
        const userId = await idp.login(req.body.data)
        return {
          token: jwt.sign({ type: 'login' }, server.app.keyPair.privateKey, {
            algorithm: 'RS256',
            keyid: server.app.system.serverAgentId.toString(),
            expiresIn: '5min',
            subject: userId.toString()
          })
        }
      }
    )
  }
  server.post(
    '/bind',
    {
      schema: {
        body: Type.Object({
          token: Type.String(),
          agentId: Type.String({ format: 'uuid' }),
          publicKey: Type.String()
        })
      }
    },
    async (req) => {
      // const decoded = jwt.verify(req.body.token, server.app.keyPair.publicKey) as ILoginToken
      // const agentId = new BSON.UUID(req.body.agentId)
      // await server.app.mongo.agents.insertOne({
      //   _id: agentId,
      //   userId: new BSON.UUID(decoded.userId),
      //   type: 'web',
      //   name: 'UAAA Web Console',
      //   note: '',
      //   publicKey: req.body.publicKey
      // })
      // await server.app.mongo.
    }
  )
})
