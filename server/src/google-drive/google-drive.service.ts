import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { googleAuthConfig } from 'config/google-auth.config';
import { Auth, GoogleApis, drive_v3, google } from 'googleapis';
import * as path from 'path';
import { ConfigType } from '@nestjs/config';
import * as sharp from 'sharp';
import { Readable } from 'stream';
import { fileNameFromOriginalFileName } from 'src/utils/fileName-from-originalFileName';

@Injectable({})
export class GoogleDriveService implements OnModuleInit {
  private drive: drive_v3.Drive;

  constructor(
    @Inject(googleAuthConfig.KEY)
    private googleAuthCfg: ConfigType<typeof googleAuthConfig>,
  ) {}

  async onModuleInit() {
    const auth: Auth.GoogleAuth = new google.auth.GoogleAuth({
      credentials: {
        client_email: this.googleAuthCfg.clientEmail,
        private_key: this.googleAuthCfg.privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.drive = await google.drive({
      version: 'v3',
      auth: auth,
    });
  }

  async findFolder(folderName: string): Promise<drive_v3.Schema$File> {
    const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`;

    const foldersData = await this.drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const folders = foldersData.data.files;
    if (!folders.length) {
      return null;
    }

    const searchedFolder = folders[0];
    return searchedFolder;
  }

  async createFolder(
    folderName: string,
    parent: string,
  ): Promise<drive_v3.Schema$File> {
    const folderData = await this.drive.files.create({
      fields: 'id, name',
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parent],
      },
    });

    return folderData.data;
  }

  async removeFolder(folderId: string) {
    try {
      const deletedFile = await this.drive.files.delete({
        fileId: folderId,
      });
      await this.drive.files.emptyTrash();

      return deletedFile.data;
    } catch {
      console.log('no such folder');
    }
  }

  async getFile(fileId) {
    const file = await this.drive.files.get({
      fileId,
      fields: 'id, name, webContentLink',
    });

    return file.data;
  }

  async uploadFile(
    file: Express.Multer.File,
    parent: string,
  ): Promise<drive_v3.Schema$File> {
    const fileBuffer = await sharp(file.buffer)
      .resize(160, 160, {
        fit: 'cover',
        position: 'centre',
      })
      .jpeg({
        quality: 75,
      })
      .toBuffer();

    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    const fileName = fileNameFromOriginalFileName(file.originalname);

    const uploadedFileData = await this.drive.files.create({
      media: {
        mimeType: 'image/jpeg',
        body: bufferStream,
      },
      requestBody: {
        name: `${fileName}.jpeg`,
        parents: [parent],
      },
      fields: 'id, webContentLink',
    });

    return uploadedFileData.data;
  }

  async removeFile(fileId: string) {
    try {
      const deletedFileData = await this.drive.files.delete({
        fileId: fileId,
      });

      await this.drive.files.emptyTrash();

      return deletedFileData.data;
    } catch {
      console.log('no such file');
    }
  }
}
