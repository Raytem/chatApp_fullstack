import { Response } from 'express';

export function setRefreshTokenCookie(
  res: Response,
  token: string,
  maxAge: number,
) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    maxAge,
    secure: true,
    sameSite: 'none',
  });
}
