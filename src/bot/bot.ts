import { Client, LocalAuth, Message } from 'whatsapp-web.js';

const clientConfig = {
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox"],
  },
};

export const client = new Client(clientConfig);

export const sendMessage = (phoneNumber: string, message: string) => {
  const chatId = `${phoneNumber.substring(1)}@c.us`;

  return client.sendMessage(chatId, message);
};