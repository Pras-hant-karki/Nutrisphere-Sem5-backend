import dotenv from "dotenv";
dotenv.config();

export const PORT: number = 
    process.env.PORT ? parseInt(process.env.PORT) : 5000;
export const MONGO_URI: string = 
    process.env.MONGO_URI || 'mongodb://localhost:27017/prashant_db';
// Application level constants, with fallbacks 
// if .env variables are not set

export const JWT_SECRET: string = 
    process.env.JWT_SECRET || 'default'

export const CLIENT_URL: string =
    process.env.CLIENT_URL || 'http://localhost:3000';

export const EMAIL_USER: string =
    process.env.EMAIL_USER || '';

export const EMAIL_PASS: string =
    process.env.EMAIL_PASS || '';