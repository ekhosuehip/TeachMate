import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";


export interface IUser {
  name: string,
  email: string,
  agree: boolean,
  update: boolean
}

export interface IAuthPayload {
  userId: Types.ObjectId,
  fullName: string,
  email: string
}

export interface DecodedUser extends JwtPayload {
  userId: string,
  email: string
}