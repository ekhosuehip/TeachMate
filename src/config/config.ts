import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 3000;

const dbURL = process.env.MONGO_URL

const redisURL = process.env.REDIS_URL

const googleId = process.env.GOOGLE_CLIENT_ID
const googleSecret = process.env.GOOGLE_CLIENT_SECRET
const JWT_SECRET = process.env.JWT_SECRET

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECREAT_KEY
const AWS_REGION = process.env.AWS_REGION
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME

const sessionSecret = process.env.SESSION_SECRET


const config = {
    server: {
       port: PORT 
    },
    mongo: {
        url: dbURL
    },
    google: {
        id: googleId,
        secret: googleSecret
    },
    session: {
        key: sessionSecret
    },
    jwt: {
        key: JWT_SECRET
    },
    redis: {
        url: redisURL
    },
    aws: {
        key: AWS_ACCESS_KEY_ID,
        secret: AWS_SECRET_ACCESS_KEY,
        region: AWS_REGION,
        bucket: AWS_BUCKET_NAME
    }
}

export default config