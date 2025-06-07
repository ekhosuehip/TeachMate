import { Router } from 'express';
import '../config/passport'
import passport from 'passport';
import { registerWithGoogle } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
const router = Router()

router.use(protect)

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], accessType: 'offline', prompt: 'consent'}))

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }), registerWithGoogle
);

export default router