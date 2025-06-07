import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from './config';
import { S3Client } from '@aws-sdk/client-s3';

const connection = new IORedis(config.redis.url as string);

export const fileQueue = new Queue('fileQueue', { connection });


export const s3Config = new S3Client({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.key!,
      secretAccessKey: config.aws.secret!,
    },
  });
