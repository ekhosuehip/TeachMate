import { Router } from 'express';
import '../config/passport'
import passport from 'passport';
import { registerWithGoogle } from '../controllers/authController';
const router = Router()

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], accessType: 'offline', prompt: 'consent'}))

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }), registerWithGoogle
);

export default router