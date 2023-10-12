import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: +process.env.PORT || 3030,
  nodeEnv: process.env.NODE_ENV,
  serverHost: process.env.SERVER_HOST,
  serverUrl: process.env.SERVER_URL,
  clientUrl: process.env.CLIENT_URL,
}));
