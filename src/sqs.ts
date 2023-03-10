import { Consumer } from 'sqs-consumer';
import { SQSClient } from '@aws-sdk/client-sqs';
import { client, sendMessage } from './bot/bot';
import qrcode from 'qrcode-terminal';
import { Message, MessageAck } from 'whatsapp-web.js';
import { AWS_ACCESS_KEY, AWS_REGION, AWS_SECRET_KEY, EVENT_BUS_NAME, SQS_URL } from './config';
import { EBParams, EBPayload, sendToEventBridge } from './utils/eventBridge';

client.on('qr', (qr: string) => {
  console.log('Generate qr code');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WA Client is ready!');

  interface ISQSData {
    _id: string;
    to: string;
    text: string;
  }
  const app = Consumer.create({
    queueUrl: SQS_URL,
    handleMessage: async (message) => {
      console.log('in handleMessage', message);
      // do some work with `message`
      if (!message.Body) throw new Error('invalid.payload');
      const payload = JSON.parse(message.Body) as ISQSData;
      try {
        const response = await sendMessage(payload.to, payload.text);
        console.log('Response >>> ', response);
      } catch (error) {
        throw new Error('error.sending.message');
      }
    },
    sqs: new SQSClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
      }
    })
  });

  app.on('error', (err) => {
    console.error(err.message);
  });

  app.on('processing_error', (err) => {
    console.error(err.message);
  });

  app.start();
});

/**
 * Receiving message
 */
client.on('message', async (message: Message) => {
  console.log('================= Start On Message =================');
  console.log('Message >>> ', JSON.stringify(message));
  try {
    setTimeout(async () => {
      console.log('message.id.remote >>> ', message.id.remote);
      const chatIdResult = await client.getChatById(message.id.remote);
      const sendSeenResult = await chatIdResult.sendSeen();
      console.log('Data message >>> ', chatIdResult);
      console.log('Send seen >>> ', sendSeenResult);

      const fromNumber = message.from.split('@');
      const EBPayload: EBPayload = {
        _id: message.id.id,
        type: 'message',
        timestamp: message.timestamp, // timestamp in epoch
        fromNumber: fromNumber[0],
        message: {
          type: 'text',
          text: message.body,
        }
      };
      const params: EBParams = {
        EBName: EVENT_BUS_NAME,
        EBDetailType: 'CILOK',
        payload: EBPayload,
        source: 'VENDOR'
      };
      const eventBridgeResult = await sendToEventBridge(params);
      console.log('eventBridgeResult: ', eventBridgeResult);
    }, 500);
  } catch (err) {
    console.log('Error >>> ', err);
  }
  console.log('================= End On Message =================');
});

/**
 * Status of the message (send, received, seen)
 */
client.on('message_ack', async (message: Message, ack: MessageAck) => {
  console.log('================= Start Message ACK =================');
  console.log('Message : ', JSON.stringify(message));
  console.log('ACK >>> ', JSON.stringify(ack));
  if (ack === 2 || ack === 3) {
    const fromNumber = message.from.split('@');
    const EBPayload: EBPayload = {
      _id: message.id.id,
      type: 'message',
      timestamp: message.timestamp, // timestamp in epoch
      fromNumber: fromNumber[0],
      ackType: ack === 2 ? 'reached' : 'seen'
    };
    const params: EBParams = {
      EBName: EVENT_BUS_NAME,
      EBDetailType: 'CILOK',
      payload: EBPayload,
      source: 'VENDOR'
    };
    const eventBridgeResult = await sendToEventBridge(params);
    console.log('eventBridgeResult: ', eventBridgeResult);
  }
  console.log('================= End Message ACK =================');
});

/**
 * Still in research
 */
client.on('auth_failure', (message: string) => {
  console.log('================= Start AUTH_FAILURE =================');
  console.log('Message : ', JSON.stringify(message));
  console.log('================= End AUTH_FAILURE =================');
});

client.initialize();
console.log('start');

/**
 * Call sqs
 * curl --request POST \
 * --url https://jvdqwhtfpuziqparldfpekemli0jcabl.lambda-url.ap-southeast-1.on.aws
 * 
 */
