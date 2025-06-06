import { Request, Response, NextFunction} from 'express'
import userService from '../services/userService'
import { IUser } from '../interfaces/users';

export const registerWithGoogle = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const name = user.name
    const email = user.email

    if(!name || !email){
        res.status(400).json({
            success: false,
            message: 'Unsuccessful request'
        })
        return;
    }
    
    try {
        // check existing user 
        const existingUser = await userService.fetchUser(email);
        if (existingUser){
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: existingUser
            })
            return;
        }

        const userName = name.split(" ")
        const fullName = `${userName[0]} ${userName[userName.length - 1]}`

        const newUser: IUser = {
            name: fullName,
            email: email,
            agree: true,
            update: false
        }

        await userService.createUser(newUser);

        res.redirect(`http://localhost:3000/otp`);
    } catch (error) {
        console.log(error)
    }
}