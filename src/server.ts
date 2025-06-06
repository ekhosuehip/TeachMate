import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import config from './config/config';
import passport from 'passport';
import session from 'express-session';
import authRoute from './routes/authRoutes'



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

server.use(passport.initialize());
server.use(passport.session());

// Auth Routes
server.use('/api/v1/auth', authRoute);



server.listen(config.server.port, ()=> console.log(`🚀 Server running succesffully on port ${config.server.port}`))