import { Client, LocalAuth, Message, MessageAck, WAState } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import express, { Request, Response } from 'express';

const clientConfig = {
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox"],
  },
};
const client = new Client(clientConfig);

const sendMessage = (phoneNumber: string, message: string) => {
  const chatId = `${phoneNumber.substring(1)}@c.us`;

  return client.sendMessage(chatId, message);
};

client.on("qr", (qr) => {
  console.log('Auth using QRCode');
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");

  const app = express();

  app.post("/wa", async (req: Request, res: Response) => {
    const { phoneNumber, message } = req.query;
    if (!phoneNumber || !message) {
      res.send("invalid");
      return;
    }
    console.log("check request query >>> ", req.query);

    let isSuccessSendMessage = false;
    try {
      const statusMessage = await sendMessage(phoneNumber as string, message as string);
      console.log("Status message >>> ", statusMessage);
      isSuccessSendMessage = true;
    } catch (err) {
      isSuccessSendMessage = false;
    }

    const status = {
      phoneNumber,
      message,
      isSuccessSendMessage,
    };
    res.send(status);
  });

  app.post("/seen/:chatId", async (req: Request, res: Response) => {
    const { chatId } = req.params;
    console.log("Chat ID : ", chatId);
    try {
      const chatIdResult = await client.getChatById(chatId);
      const sendSeenResult = await chatIdResult.sendSeen();
      console.log("Data message >>> ", chatIdResult);
      console.log("Send seen >>> ", sendSeenResult);
    } catch (err) {
      console.log("Error >>> ", err);
    }
    res.send("success");
  });

  app.listen(3400, () => console.log("http://localhost:3400"));

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
    }, 500);
  } catch (err) {
    console.log('Error >>> ', err);
  }
  console.log('================= End On Message =================');
});

/**
 * Status of the message (send, received, seen)
 */
client.on('message_ack', (message: Message, ack: MessageAck) => {
  console.log('================= Start Message ACK =================');
  console.log('Message : ', JSON.stringify(message));
  console.log('ACK >>> ', JSON.stringify(ack));
  if (ack === 3) {
    console.log('Send information to sns');
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

/**
 * Disconnected
 */
client.on('disconnected', (reason: WAState) => {
  console.log('================= Start disconnected =================');
  console.log('Reason disconnected : ', JSON.stringify(reason));
  console.log('================= End disconnected =================');
});

client.initialize();

console.log('hello');