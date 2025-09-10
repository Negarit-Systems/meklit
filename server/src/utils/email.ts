import axios from 'axios';
import { config } from 'src/config/config.js';
import { EmailPayload } from 'src/types/email-payload.js';

const { n8nWebHookURL } = config();

export async function sendEmail(
  payload: EmailPayload,
): Promise<void> {
  await axios.post(n8nWebHookURL, {
    to: payload.to,
    subject: payload.subject,
    body: payload.body,
  });
}
