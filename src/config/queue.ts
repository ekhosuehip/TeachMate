import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from './config';

const connection = new IORedis(config.redis.url as string);

export const fileQueue = new Queue('fileQueue', { connection });
