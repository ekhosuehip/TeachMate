import { DecodedUser } from "../../interfaces/User";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}

export {}; 
å