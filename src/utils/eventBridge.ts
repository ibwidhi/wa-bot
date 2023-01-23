export type EBPayload = {
  _id: string,
  type: 'ack' | 'message',
  timestamp: number, // timestamp in epoch
  fromNumber: string,

  ackType?: 'reached' | 'seen',
  message?: {
    type: 'text',
    text: string,
  }
}

export type EBParams = { EBName: string, EBDetailType: string, payload: EBPayload, source: string };

import { EventBridgeClient, PutEventsCommand, PutEventsCommandInput } from '@aws-sdk/client-eventbridge';
import { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY } from '../config/index';

const client = new EventBridgeClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY
  }
});

export async function sendToEventBridge(payload: EBParams) {
  const params: PutEventsCommandInput = {
    Entries: [
      {
        EventBusName: payload.EBName,
        DetailType: payload.EBDetailType,
        Detail: JSON.stringify(payload.payload),
        Source: payload.source
      }
    ]
  };
  try {
    await client.send(new PutEventsCommand(params));
  } catch (e) {
    console.log(e);
  }
}