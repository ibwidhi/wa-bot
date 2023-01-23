import * as dotenv from 'dotenv';
import { getParams } from '../utils/getNodeArgv';

dotenv.config();
const argv = getParams(['APP_ENV', 'MOBILE']);

export const AWS_REGION = process.env.AWS_REGION || 'not.found';
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || 'not.found';
export const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY || 'not.found';
export const AWS_ACCOUNT_DEV = process.env.AWS_ACCOUNT_DEV || 'not.found';
export const AWS_ACCOUNT_PROD = process.env.AWS_ACCOUNT_PROD || 'not.found';
export const APP_ENV = (argv && 'APP_ENV' in argv ? argv['APP_ENV'] : process.env.APP_ENV) || 'not.found';
export const MOBILE = (argv && 'MOBILE' in argv ? argv['MOBILE'] : process.env.MOBILE) || 'not.found';
export const SQS_URL = `https://sqs.${AWS_REGION}.amazonaws.com/${APP_ENV === 'DEV' ? AWS_ACCOUNT_DEV : AWS_ACCOUNT_PROD}/CILOK-${MOBILE}`;
export const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'not.found';

// console.log('========== START CONFIG ==========');
// console.log('AWS_REGION       : ', AWS_REGION);
// console.log('AWS_ACCESS_KEY   : ', AWS_ACCESS_KEY);
// console.log('AWS_SECRET_KEY   : ', AWS_SECRET_KEY);
// console.log('AWS_ACCOUNT_DEV  : ', AWS_ACCOUNT_DEV);
// console.log('AWS_ACCOUNT_PROD : ', AWS_ACCOUNT_PROD);
// console.log('APP_ENV          : ', APP_ENV);
// console.log('MOBILE           : ', MOBILE);
// console.log('SQS_URL          : ', SQS_URL);
// console.log('EVENT_BUS_NAME   : ', EVENT_BUS_NAME);
// console.log('========== END CONFIG ==========');
