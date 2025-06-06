import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { DecodedUser } from "../interfaces/users";
import dotenv from 'dotenv'

dotenv.config();

// This middleware function checks if the request has a valid JWT token in the cookies or the authorization header.
export interface AuthenticatedRequest extends Request {
  user?: DecodedUser;
  file?: Express.Multer.File;
}
const secretKey: string | undefined = process.env.JWT_SECRET;

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  console.log("Extracted Token:", token);
  
  if (!token) {
    res.status(401).json({ success: false, message: "Unauthorized. Token not provided." });
    console.log("no tokenfound");
    return;
  }
  try {
  const decoded = jwt.verify(token, secretKey as string) as DecodedUser ;
  if (!decoded) {
    res.status(401).json({ success: false, message: "Invalid token." });
    return;
  }

  req.user = decoded;
  
  
  next();
  } catch (error) {
    res.status(401).json({ success: false, message: "token verification failed." });
}
};
