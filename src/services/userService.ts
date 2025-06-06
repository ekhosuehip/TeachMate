import User from "../models/userModle";
import { IUser } from "../interfaces/users";

class UserService {
    // create a new user
    async createUser (data: IUser) {
        return await User.create(data)
    }

    // fetch user
    async fetchUser (email: string) {
        return await User.findOne({email}, { _id: 0, createdAt: 0, updatedAt: 0 , agree: 0, update: 0})
    }
}

const userService = new UserService

export default userService