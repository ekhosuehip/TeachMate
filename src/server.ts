import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import IORedis from 'ioredis';
import mongoose from 'mongoose';
import config from './config/config';
import passport from 'passport';
import session from 'express-session';
import authRoute from './routes/authRoutes'
import uploadRoute from './routes/uploadRoutes'

const app = express();

// Connect to database
mongoose.connect(config.mongo.url as string)
.then(()=> console.log("Connected to database successfully 🚀"))
.catch((error)=> console.log("error connecting to database", error))

// socket.io
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: '*' },
});

// Middlewares
app.use(cors())
app.use(
  session({
    secret: config.session.key as string,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());


// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'Server is running smoothly',
    environment: process.env.NODE_ENV || 'development'
  });
  console.log('check complete');
  
});

// Auth Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v2/upload', uploadRoute);


// Subscribe to channels
const subClient = new IORedis(config.redis.url as string);
subClient.subscribe('job-completed-channel', 'job-failed-channel');

subClient.on('message', (channel, message) => {
  if (channel === 'job-completed-channel') {
    const data = JSON.parse(message);
    io.emit('jobCompleted', data);
  } else if (channel === 'job-failed-channel') {
    const data = JSON.parse(message);
    io.emit('jobFailed', data);
  }
});

// Error handler
app.use((req, res) => {
  res.status(500).json({ error: 'Something went wrong!' });
});


server.listen(config.server.port, () => {
  console.log(`🚀 Server running successfully on port ${config.server.port}`);
});
