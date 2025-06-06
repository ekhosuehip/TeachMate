import { DecodedUser } from '../interfaces/user';
import { Multer } from 'multer';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
      file?: Multer.File;
    }
  }
}

export {}; 