import { registerAs } from '@nestjs/config';

export const multerConfig = registerAs('multer', () => ({
  
  destination: process.env.FILE_DESTINATION,
}));
