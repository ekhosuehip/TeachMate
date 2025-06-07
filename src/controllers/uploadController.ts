import { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import config from '../config/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.key!,
      secretAccessKey: config.aws.secret!,
    },
  });

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
        const url = await getSignedUrl(s3, command, { expiresIn: 300 });
        res.status(200).json({
            success: true,
            url: url
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