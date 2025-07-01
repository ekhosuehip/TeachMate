import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { getPresignedUrl, notifyUpload } from '../controllers/uploadController';
import { validate } from '../middlewares/joi'
import { preSignedUrlSchema } from '../middlewares/joiSchema'

const router = express.Router();

// router.use(protect)

router.post('/s3url', getPresignedUrl);

router.post('/notify', notifyUpload);

export default router;
