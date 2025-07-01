import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from './config';
import { S3Client } from '@aws-sdk/client-s3';
import OpenAI from 'openai';

const connection = new IORedis(config.redis.url as string);

export const fileQueue = new Queue('fileQueue', { connection });

export const openAIClient = new OpenAI({
  apiKey: config.openAI.key as string,
});


export const s3Config = new S3Client({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.key!,
      secretAccessKey: config.aws.secret!,
    },
  });
