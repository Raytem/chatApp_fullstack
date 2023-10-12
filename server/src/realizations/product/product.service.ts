/* eslint-disable prefer-const */
import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
import { FileEntity } from '../file/entities/file.entity';
import { UserEntity } from '../user/entities/user.entity';
import { NoSuchUserException } from 'src/exceptions/NoSuchUser.exception';
import { NoSuchProductException } from 'src/exceptions/NoSuchProduct.exception';
import { FileService } from '../file/file.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeleteFilesEvent } from '../file/events/delete-files.event';
import { AbilityFactory, Action } from 'src/ability/ability-factory';
import { ForbiddenError } from '@casl/ability';
import { Multer } from 'multer';
import { extractFileNames } from 'src/utils/extract-file-names';
import { Request } from 'express';
import * as busboy from 'busboy';
import { getValidatedInstance } from 'src/utils/get-validated-instance';
import { pipeline } from 'stream/promises';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,

    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    private abilityFactory: AbilityFactory,

    private fileService: FileService,

    private eventEmitter: EventEmitter2,
  ) {}

  async create(req: Request, reqUser: UserEntity) {
    // const ability = await this.abilityFactory.defineAbilityFor(reqUser);
    // ForbiddenError.from(ability).throwUnlessCan(
    //   Action.Create,
    //   createProductDto,
    // );

    return await this.fileService.uploadFiles(req, reqUser);
  }

  async findAll() {
    return await this.productRepository.find({
      relations: { user: true },
    });
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!product) {
      throw new NoSuchProductException();
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    reqUser: UserEntity,
  ) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!product) {
      throw new NoSuchProductException();
    }

    const ability = await this.abilityFactory.defineAbilityFor(reqUser);
    ForbiddenError.from(ability).throwUnlessCan(Action.Update, product);

    await this.productRepository.update(id, updateProductDto);

    return await this.productRepository.findOne({
      where: { id },
      relations: { user: true },
    });
  }

  async remove(id: number, reqUser: UserEntity) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!product) {
      throw new NoSuchProductException();
    }

    const ability = await this.abilityFactory.defineAbilityFor(reqUser);
    ForbiddenError.from(ability).throwUnlessCan(Action.Delete, product);

    const fileNames = product.photos.map((file) => file.name);
    this.eventEmitter.emit(
      DeleteFilesEvent.eventName,
      new DeleteFilesEvent(fileNames),
    );

    await this.productRepository.remove(product);
    return product;
  }
}
