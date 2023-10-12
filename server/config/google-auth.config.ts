import { registerAs } from '@nestjs/config';

export const googleAuthConfig = registerAs('googleAuth', () => ({
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  privateKey: process.env.GOOGLE_PRIVATE_KEY,
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUrl: process.env.GOOGLE_REDIRECT_URL,
}));
