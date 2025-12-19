/**
 * Email attachment definition
 */
export interface EmailAttachment {
  id: string;
  filename: string;
  content_type: string;
  content_disposition: string;
  content_id?: string;
}

/**
 * Email data definition
 */
export interface EmailData {
  email_id: string;
  created_at: string;
  from: string;
  to: string[];
  bcc: string[];
  cc: string[];
  message_id: string;
  subject: string;
  attachments: EmailAttachment[];
}

/**
 * Email received event definition
 */
export interface EmailReceivedEvent {
  type: "email.received";
  created_at: string;
  data: EmailData;
}
