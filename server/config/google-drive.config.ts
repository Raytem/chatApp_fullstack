import { registerAs } from '@nestjs/config';

export const googleDriveConfig = registerAs('googleDrive', () => ({
  usersDataFolderId: process.env.GOOGLE_USERS_DATA_FOLDER_ID,
}));
