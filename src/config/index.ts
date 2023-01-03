import * as dotenv from 'dotenv';

dotenv.config();

export const AWS_REGION = process.env.AWS_REGION || 'not.found';
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || 'not.found';
export const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY || 'not.found';