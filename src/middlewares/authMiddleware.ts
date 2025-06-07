import { NextFunction,Request, Response,  RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { DecodedUser } from "../interfaces/users";
import config from "../config/config";

export const protect: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  console.log("Extracted Token:", token);

  if (!token) {
    res.status(401).json({ success: false, message: "Unauthorized. Token not provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.key as string) as DecodedUser;
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