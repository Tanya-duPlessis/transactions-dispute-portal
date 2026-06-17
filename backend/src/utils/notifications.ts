import nodemailer from 'nodemailer';
import { logger } from './logger';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS) {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: process.env.ETHEREAL_USER, pass: process.env.ETHEREAL_PASS },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    logger.info('Ethereal test account created', { user: testAccount.user });
  }

  return transporter;
};

export const sendDisputeConfirmationEmail = async (to: string, name: string, disputeId: string) => {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: '"Dispute Portal" <noreply@disputes.demo>',
      to,
      subject: 'Dispute Submitted Successfully',
      text: `Hi ${name},\n\nYour dispute (ID: ${disputeId}) has been submitted and is under review.\n\nWe will notify you of any updates.\n\nRegards,\nDispute Portal Team`,
    });
    logger.info('Dispute confirmation email sent', {
      to,
      disputeId,
      preview: nodemailer.getTestMessageUrl(info),
    });
  } catch (err) {
    logger.error('Failed to send dispute confirmation email', { error: err });
  }
};

export const sendStatusUpdateEmail = async (
  to: string,
  name: string,
  disputeId: string,
  newStatus: string,
) => {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: '"Dispute Portal" <noreply@disputes.demo>',
      to,
      subject: `Dispute Update: ${newStatus}`,
      text: `Hi ${name},\n\nYour dispute (ID: ${disputeId}) status has been updated to: ${newStatus}.\n\nLogin to the portal to view the full details.\n\nRegards,\nDispute Portal Team`,
    });
    logger.info('Status update email sent', {
      to,
      disputeId,
      newStatus,
      preview: nodemailer.getTestMessageUrl(info),
    });
  } catch (err) {
    logger.error('Failed to send status update email', { error: err });
  }
};
