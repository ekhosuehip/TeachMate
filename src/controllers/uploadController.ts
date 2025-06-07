import { Request, Response } from 'express';
import {  PutObjectCommand } from '@aws-sdk/client-s3';
import config from '../config/config';
import {fileQueue, s3Config} from '../config/queue';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const getPresignedUrl = async (req: Request, res: Response) => {
    const { fileName, contentType} = req.body

    if (!fileName || !contentType) {
        res.status(400).json({
            sucess: false,
            message: 'fileName or contentType missing'
        })
        return;
    }

    const key = `${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: config.aws.bucket,
        Key: key,
        ContentType: contentType,
        ACL: 'private'
    })

    try {
        const url = await getSignedUrl(s3Config, command, { expiresIn: 300 });
        res.status(200).json({
            success: true,
            url: url,
            key: key
        })
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        res.status(500).json({
        success: false,
        message: 'Failed to generate presigned URL',
        });
        return
    }
}

export const notifyUpload = async (req: Request, res: Response) => {
    const { s3Key, originalName, mimeType } = req.body

    if(!s3Key || !originalName || !mimeType){
        res.status(400).json({
            success: false,
            message: 's3Key, originalName and mimeType required'
        })
        return;
    }
    try {
        const job = await fileQueue.add('fileQueue' ,{
            filePath: s3Key,
            originalName,
            mimeType,
        });
        res.status(200).json({
            success: true,
            message: 'File successfully queued for processing',
            jobId: job.id,
        });
  } catch (error) {
    console.error('Failed to enqueue job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enqueue file processing job',
    });
    return
  }

}