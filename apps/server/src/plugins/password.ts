import bcrypt from 'bcrypt'
import { definePlugin } from '../plugin.js'
import { defineIdentityProvider } from '../idp.js'
import { Type } from '@sinclair/typebox'

declare module '../model/user.js' {
  interface IUser {
    password?: string
  }
}

export default definePlugin({
  id: 'builtin:password',
  name: 'Password IdP',
  setup(app) {
    app.hook.register('registerIdentityProvider', () =>
      defineIdentityProvider({
        id: 'password',
        name: 'Password',
        loginSchema: Type.Object({
          login: Type.String(),
          password: Type.String()
        }),
        async login(data) {
          const user = await app.mongo.users.findOne({ 'profile.login': data.login })
          if (!user) throw new Error(`User not found`)
          if (!user.password) throw new Error(`Password not set`)
          if (!(await bcrypt.compare(data.password, user.password)))
            throw new Error(`Invalid password`)
          return user._id
        },
        bindSchema: Type.Object({
          password: Type.String()
        }),
        async bind(userId, data) {
          const hash = await bcrypt.hash(data.password, 10)
          await app.mongo.users.updateOne({ _id: userId }, { $set: { password: hash } })
        },
        async unbind(userId) {
          await app.mongo.users.updateOne({ _id: userId }, { $unset: { password: 1 } })
        }
      })
    )
  }
})
