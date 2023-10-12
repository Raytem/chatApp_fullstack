/* eslint-disable prefer-const */
import { Process, Processor } from '@nestjs/bull';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Job } from 'bull';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Processor('file-operation')
export class FileConsumer {
  @Process('delete-files')
  async deleteFiles(job: Job) {
    const jobData: any = job.data;
    for (let path of jobData.paths) {
      await fs.unlink(path).catch((err) => {
        console.log(new BadRequestException(err.message));
      });
    }
    return {};
  }

  @Process('upload-files')
  async uploadFiles(job: Job) {
    const jobData: { files: Array<Express.Multer.File> } = job.data;
    const files = jobData.files;
    // eslint-disable-next-line prettier/prettier
    const uploadFolder = path.join(process.cwd(), 'uploads');

    try {
      await fs.access(uploadFolder);
    } catch (e) {
      await fs.mkdir(uploadFolder, { recursive: true });
    }

    try {
      files.forEach(async (file: Express.Multer.File) => {
        await fs.writeFile(
          path.join(uploadFolder, `${uuidv4()}.${file.mimetype.split('/')[1]}`),
          Buffer.from(file.buffer),
        );
      });
    } catch (e) {
      throw new InternalServerErrorException(
        `Fail when write files: ${JSON.stringify(files)}`,
      );
    }
  }
}
