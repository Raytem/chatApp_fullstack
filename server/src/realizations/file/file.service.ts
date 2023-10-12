import {
  BadRequestException,
  Inject,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import * as path from 'path';
import { multerConfig } from 'config/multer.config';
import { ConfigType } from '@nestjs/config';
import { appConfig } from 'config/app.config';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { Repository } from 'typeorm';
import { FileProducer } from './queue/file.producer';
import { NoSuchFileException } from 'src/exceptions/NoSuchFile.exception';
import { ProductEntity } from '../product/entities/product.entity';
import { NoSuchProductException } from 'src/exceptions/NoSuchProduct.exception';
import { FilePathAndName } from 'src/interfaces/file-path-and-name.interface';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DeleteFilesEvent } from './events/delete-files.event';
import { UserEntity } from '../user/entities/user.entity';
import { AbilityFactory, Action } from 'src/ability/ability-factory';
import { ForbiddenError } from '@casl/ability';
import { CreateFileDto } from './dto/create-file.dto';
import * as busboy from 'busboy';
import * as fs from 'fs/promises';
import { createReadStream, createWriteStream, rm, unlink } from 'fs';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { Observable, Subject, map, take, takeUntil, tap } from 'rxjs';
import { getValidatedInstance } from 'src/utils/get-validated-instance';
import { CreateProductDto } from '../product/dto/create-product.dto';
import * as sharp from 'sharp';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { googleDriveConfig } from 'config/google-drive.config';
import { fileNameFromOriginalFileName } from 'src/utils/fileName-from-originalFileName';

@Injectable()
export class FileService {
  constructor(
    @Inject(multerConfig.KEY)
    private multerCfg: ConfigType<typeof multerConfig>,

    @Inject(appConfig.KEY)
    private appCfg: ConfigType<typeof appConfig>,

    @Inject(googleDriveConfig.KEY)
    private googleDriveCfg: ConfigType<typeof googleDriveConfig>,

    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,

    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    private googleDriveService: GoogleDriveService,

    private abilityFactory: AbilityFactory,

    private fileProducer: FileProducer,

    private eventEmitter: EventEmitter2,
  ) {}

  async getFilePathAndName(
    id: number,
    fileName?: string,
  ): Promise<FilePathAndName> {
    if (!fileName) {
      const file = await this.findOne(id);
      fileName = file.name;
    }

    const staticFilesPath = path.join(
      process.cwd(),
      this.multerCfg.destination,
    );
    const filePath = path.join(staticFilesPath, fileName);
    try {
      await fs.access(filePath);
    } catch (e) {
      new NoSuchFileException();
    }

    return {
      path: filePath,
      name: fileName,
    };
  }

  async findAll() {
    return await this.fileRepository.find();
  }

  async findOne(id: number) {
    const file = await this.fileRepository.findOneBy({ id });
    if (!file) {
      throw new NoSuchFileException();
    }
    return file;
  }

  async remove(id: number, reqUser: UserEntity) {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: { product: true },
    });
    if (!file) {
      throw new NoSuchFileException();
    }

    try {
      const ability = await this.abilityFactory.defineAbilityFor(reqUser);
      ForbiddenError.from(ability).throwUnlessCan(Action.Delete, file);
    } catch (error) {
      throw error;
    }

    await this.fileRepository.remove(file);
    this.eventEmitter.emit(
      DeleteFilesEvent.eventName,
      new DeleteFilesEvent([file.name]),
    );
    return file;
  }

  async uploadAvatar(
    user: UserEntity,
    avatar: Express.Multer.File,
  ): Promise<FileEntity> {
    const userFolderName = `usr_${user.id}`;

    let userFolder = await this.googleDriveService.findFolder(userFolderName);

    if (!userFolder) {
      userFolder = await this.googleDriveService.createFolder(
        userFolderName,
        this.googleDriveCfg.usersDataFolderId,
      );
    }

    const fileName = fileNameFromOriginalFileName(avatar.originalname);

    if (user.avatar) {
      await this.googleDriveService.removeFile(user.avatar.googleFileId);

      const uploadedFile = await this.googleDriveService.uploadFile(
        avatar,
        userFolder.id,
      );

      await this.fileRepository.update(
        { id: user.avatar.id },
        {
          name: fileName,
          googleFileId: uploadedFile.id,
          link: uploadedFile.webContentLink,
          size_bytes: avatar.size,
        },
      );
      return await this.fileRepository.findOneBy({ id: user.avatar.id });
    }

    const uploadedFile = await this.googleDriveService.uploadFile(
      avatar,
      userFolder.id,
    );

    const newAvatar = await this.fileRepository.save({
      name: fileName,
      googleFileId: uploadedFile.id,
      link: uploadedFile.webContentLink,
      size_bytes: avatar.size,
    });

    await this.userRepository.update(
      { id: user.id },
      {
        avatar: newAvatar,
      },
    );

    return newAvatar;
  }

  async uploadFiles(req, reqUser: UserEntity, productId?: number) {
    let product;
    if (productId) {
      product = await this.productRepository.findOneBy({ id: productId });
      if (!product) {
        throw new NoSuchProductException();
      }
      const ability = await this.abilityFactory.defineAbilityFor(reqUser);
      ForbiddenError.from(ability).throwUnlessCan(
        Action.Create,
        new CreateFileDto(productId),
      );
    }

    const maxFileSize = 2 * 1024 * 1024 * 1024;
    let fileSize = 0;
    let error = null;
    const fileTypeRegexp = /.(png|jpg|jpeg)$/i;

    const bb = busboy({
      headers: req.headers,
      limits: {
        fileSize: maxFileSize,
      },
    });

    let productDto = {};
    const fileData = [];
    let filesCnt = 0;
    bb.on('file', async (name, file, info) => {
      if (!fileTypeRegexp.test(info.filename)) {
        error = new BadRequestException('Invalid file extension');
      }

      filesCnt += 1;
      if (!productId && filesCnt === 1) {
        const data = await getValidatedInstance<CreateProductDto>(
          CreateProductDto,
          productDto,
        );
        if (data.errors.length !== 0) {
          error = new BadRequestException(data.errors);
        } else {
          productDto = data.obj;
          product = await this.productRepository.save({
            ...productDto,
            user: reqUser,
          });
        }
      }

      let { mimeType, filename, encoding } = info;
      filename = `${uuidv4()}.${mimeType.split('/')[1]}`;

      const saveTo = path.join(
        process.cwd(),
        this.multerCfg.destination,
        filename,
      );
      if (!error) {
        file.pipe(createWriteStream(saveTo));
      }

      file
        .on('data', (data) => {
          fileSize += data.length;
          console.log(data.length);
        })
        .on('limit', async () => {
          error = new PayloadTooLargeException(
            `Max file size = ${maxFileSize} bytes`,
          );
          await this.fileProducer.deleteFiles([saveTo]);
        })
        .on('close', () => {
          if (!error) {
            fileData.push({ filename, fileSize });
          }
        });
    });
    if (!productId) {
      bb.on('field', (name, value) => {
        productDto[name] = value;
      });
    }
    await pipeline(req, bb);

    if (error) {
      throw error;
    }

    for (const fInfo of fileData) {
      await this.fileRepository.save({
        name: fInfo.filename,
        product,
        size_bytes: fInfo.fileSize,
      });
    }

    return productId
      ? product.photos.map((photo) => photo)
      : await this.productRepository.findOneBy({ id: product.id });
  }

  @OnEvent(DeleteFilesEvent.eventName, { async: true })
  async handlerDeleteFileEvent(payload: DeleteFilesEvent) {
    const filePaths = [];
    for (const name of payload.fileNames) {
      const filePath = (await this.getFilePathAndName(null, name)).path;
      filePaths.push(filePath);
    }
    await this.fileProducer.deleteFiles(filePaths);
  }
}
