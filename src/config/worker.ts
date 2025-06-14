import express from 'express';
import { Worker, Job } from 'bullmq';
import fs from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { parseFile } from '../utils/fileParser';
import IORedis from 'ioredis';
import config from '../config/config';
import { s3Config} from '../config/queue';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { chunkText, runSummarizer} from '../utils/surmarize'

const app = express();
const PORT = config.server.port || 3000;

const connection = new IORedis(config.redis.url as string, {
  maxRetriesPerRequest: null,
});

const pubClient = new IORedis(config.redis.url as string, {
  maxRetriesPerRequest: null,
});

const worker = new Worker('fileQueue', async (job: Job) => {

  const { filePath: s3Key, originalName, mimeType } = job.data;

  const tmpFilePath = join(tmpdir(), `${Date.now()}-${originalName}`);
  const s3Stream = await s3Config.send(
    new GetObjectCommand({
      Bucket: config.aws.bucket,
      Key: s3Key,
    })
  );


  const bodyStream = s3Stream.Body;

  if (!bodyStream || !(bodyStream instanceof Readable)) {
    throw new Error('S3 Body stream is not readable');
  }

  await pipeline(bodyStream, createWriteStream(tmpFilePath));
  const parsedText = await parseFile(tmpFilePath, mimeType);

  console.log('🔍 Parsed Text Preview:\n', parsedText.slice(0, 1000)); // print first 1000 chars


  await fs.unlink(tmpFilePath);

  const chunks = chunkText(parsedText)
  console.log(`Parsed file from ${s3Key}, text length: ${parsedText.length}`);

  const summaries = [];
  for (const chunk of chunks) {
    const summary = await runSummarizer(chunk);
    summaries.push(summary);
  }

  const initialsummaries = summaries.join('\n\n');

  const finalSummary = await runSummarizer(initialsummaries)

  return { s3Key, summary: finalSummary };
}, {
  connection,
  removeOnComplete: { age: 3600, count: 1000 },
  removeOnFail: { age: 86400 },
});

worker.on('ready', () => console.log('🚀 Worker is ready'));
worker.on('active', (job) => console.log(`👷 Job ${job.id} is active`));
worker.on('error', (err) => console.error('❌ Worker error:', err));

worker.on('completed', async (job) => {
  console.log(`Job ${job.id} completed!`);
  await pubClient.publish(
    'job-completed-channel',
    JSON.stringify({
      jobId: job.id,
      result: job.returnvalue,
    })
  );
});
worker.on('failed', async (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
  await pubClient.publish(
    'job-failed-channel',
    JSON.stringify({
      jobId: job?.id,
      error: err?.message,
    })
  );
});



app.get('/', (req, res) => {
  res.send('Worker is running');
});

app.listen(PORT, () => {
  console.log(`Dummy HTTP server listening on port ${PORT}`);
});