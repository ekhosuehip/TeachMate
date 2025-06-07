import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';

// Custom middleware for validating request body
export function validate<T>(schema: ObjectSchema<T>) {
  return async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    try {
      const { error, value } = schema.validate(req.body, { abortEarly: false });

      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      req.body = value; 
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}

