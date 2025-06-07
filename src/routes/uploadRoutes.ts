import express from 'express';
import { getPresignedUrl } from '../controllers/uploadController';
import { validate } from '../middlewares/joi'
import { preSignedUrlSchema } from '../middlewares/joiSchema'

const router = express.Router();

router.post('/s3url', validate(preSignedUrlSchema), getPresignedUrl);

export default router;
