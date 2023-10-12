import { NextFunction } from 'express';

export function loggerMiddleware(req, res: Response, next: NextFunction) {
  console.log(
    `---> Method: ${req.method}, Path: ${req.url},\n` +
      `Body: ${
        Object.keys(req.body).length ? JSON.stringify(req.body, null, 2) : null
      }` +
      ``,
  );
  next();
}
