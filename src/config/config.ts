import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 3000;

const dbURL = process.env.MONGO_URL

const googleId = process.env.GOOGLE_CLIENT_ID
const googleSecret = process.env.GOOGLE_CLIENT_SECRET

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
    }
}

export default config