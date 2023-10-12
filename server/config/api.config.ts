import { registerAs } from '@nestjs/config';

export const apiConfig = registerAs('api', () => ({
  isAuthEnabled: process.env.IS_AUTH_ENABLED === 'false' ? false : true,
}));
