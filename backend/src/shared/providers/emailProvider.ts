import { Resend } from 'resend';
import ApiError from '../errors/ApiError';
import { env } from '../../config/env';

const resend = new Resend(env.RESEND_API_KEY);

const sendVerificationEmail = async (email: string, code: string) => {
  const { error } = await resend.emails.send({
    from: 'Forged <noreply@arshpreetsingh.dev>',
    to: [email],
    subject: 'hello world',
    html: `<strong>Your verification code is: ${code}</strong>`,
  });

  if (error) {
    throw new ApiError(500, 'Failed to send verification email');
  }
};

export { sendVerificationEmail };
