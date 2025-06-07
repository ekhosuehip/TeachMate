import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import config from './config/config';
import passport from 'passport';
import session from 'express-session';
import authRoute from './routes/authRoutes'
import uploadRoute from './routes/uploadRoutes'



const server = express();

// Connect to database
mongoose.connect(config.mongo.url as string)
.then(()=> console.log("Connected to database successfully 🚀"))
.catch((error)=> console.log("error connecting to database", error))

server.use(
  session({
    secret: config.session.key as string,
    resave: false,
    saveUninitialized: true,
  })
);
server.use(express.json());

server.use(passport.initialize());
server.use(passport.session());


// Health check
server.get('/api/health', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'Server is running smoothly',
    environment: process.env.NODE_ENV || 'development'
  });
  console.log('check complete');
  
});

// Auth Routes
server.use('/api/v1/auth', authRoute);
server.use('/api/v2/upload', uploadRoute);

server.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});




server.listen(config.server.port, ()=> console.log(`🚀 Server running succesffully on port ${config.server.port}`))