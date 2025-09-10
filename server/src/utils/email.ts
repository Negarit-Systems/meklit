import axios from 'axios';
import { config } from 'src/config/config.js';
import { EmailPayload } from 'src/types/email-payload.js';

const { n8nWebHookURL } = config();

export async function sendEmail(
  payload: EmailPayload,
): Promise<void> {
  try {
    await axios.post(n8nWebHookURL, {
      to: payload.to,
      subject: payload.subject,
      body: payload.body,
    });
  } catch (error) {
    console.error(
      `Failed to send email via webhook to ${payload.to}:`,
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}
