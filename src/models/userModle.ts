import { Schema, model } from 'mongoose';
import { IUser } from '../interfaces/users';

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, trim: true },
  agree: { type: Boolean, default: true },
  update: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

const User = model<IUser>('User', userSchema);
export default User;
