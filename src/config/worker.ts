import express from 'express';
import { Worker, Job } from 'bullmq';
import fs from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { parseFile } from '../utils/fileParser';
import IORedis from 'ioredis';
import config from '../config/config';
import { s3Config } from '../config/queue';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import chunkText from '../utils/chunk';
import { recursiveSummarize } from '../utils/surmarize';
import { cardQuestions } from '../utils/flashcard';
import { fillTheBlanks } from '../utils/fillTheBlank'

const app = express();
const PORT = config.server.port || 5000;

const connection = new IORedis(config.redis.url as string, {
  maxRetriesPerRequest: null,
});

const pubClient = new IORedis(config.redis.url as string, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'fileQueue',
  async (job: Job) => {
    const { filePath: s3Key, originalName, mimeType, difficulty, flashcard, quizz, summary } = job.data;

    console.log(`👷 Starting job ${job.id} for ${originalName}`);

    const tmpFilePath = join(tmpdir(), `${Date.now()}-${originalName}`);

    try {
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
      console.log(`✅ File downloaded to ${tmpFilePath}`);

      const parsedText = await parseFile(tmpFilePath, mimeType);
      console.log(`✅ Parsed text length: ${parsedText.length}`);
      console.log(`✅ Parsed text : ${parsedText}`);

      await fs.unlink(tmpFilePath);
      console.log(`🗑 Temporary file removed: ${tmpFilePath}`);

      const chunks = chunkText(parsedText)
      const summary = await recursiveSummarize(chunks, 12000, 0, difficulty);
      const questions = await cardQuestions(chunks);
      const blankQuestions = await fillTheBlanks(chunks)

      console.log(`📝 Summary generated`);
      console.log(`📝 Summary ${summary}`);
      console.log(`📝 difficulty ${difficulty}`);
      console.log("card", JSON.stringify(questions, null, 2));
      console.log("card", JSON.stringify(blankQuestions, null, 2));

      return { s3Key, summaryText: summary, cardQuestions: questions };
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection,
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 86400 },
  }
);

worker.on('ready', () => console.log('🚀 Worker is ready'));
worker.on('active', (job) => console.log(`⚡ Job ${job.id} is active`));
worker.on('error', (err) => console.error('❌ Worker error:', err));

worker.on('completed', async (job) => {
  console.log(`✅ Job ${job.id} completed`);

  await pubClient.publish(
    'job-completed-channel',
    JSON.stringify({
      jobId: job.id,
      result: job.returnvalue,
    })
  );
});

worker.on('failed', async (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);

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
  console.log(`🌐 Dummy HTTP server listening on port ${PORT}`);
});
