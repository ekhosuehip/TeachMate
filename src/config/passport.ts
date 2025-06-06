import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from './config';
import { IUser } from '../interfaces/users';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.id!,
      clientSecret: config.google.secret!,
      callbackURL: 'http://localhost:4000/api/v1/auth/google/callback',
      passReqToCallback: true,
    },
    (
      req: Express.Request,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      const user: IUser = {
        name: profile.displayName,
        email: profile.emails?.[0]?.value || '',
        agree: true,
        update: true
      };

      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: IUser, done) => {
  done(null, user);
});