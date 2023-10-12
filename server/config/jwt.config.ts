import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenLifetime: process.env.ACCESS_TOKEN_LIFETIME,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenLifetime: process.env.REFRESH_TOKEN_LIFETIME,
  refreshCookieLifetime: +process.env.REFRESH_COOKIE_LIFETIME,
}));
