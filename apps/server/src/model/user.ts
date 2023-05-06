import { BSON } from 'mongodb'

export interface IUserProfile {
  login: string
  name: string
  email: string
  status: string
}

export interface IUserCapability {
  admin?: boolean
}

export interface IUser {
  _id: BSON.UUID
  profile: IUserProfile
  capability: IUserCapability
}
