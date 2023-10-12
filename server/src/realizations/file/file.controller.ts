import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  ParseFilePipe,
  UploadedFiles,
  Res,
  ParseIntPipe,
  Req,
  Body,
  PayloadTooLargeException,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileProducer } from './queue/file.producer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createReadStream, createWriteStream } from 'fs';
import { Response } from 'express';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { Public } from 'src/decorators/public-route.decorator';
import { User } from 'src/decorators/req-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { FileEntity } from './entities/file.entity';
import { Action, AppAbility } from 'src/ability/ability-factory';
import { CheckPolicies } from 'src/decorators/check-policies.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { pipeline } from 'stream/promises';
import { join } from 'path';
import { Readable } from 'stream';
import { CreateProductDto } from '../product/dto/create-product.dto';

@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private fileProducer: FileProducer,
  ) {}

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: FileEntity })
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, FileEntity))
  @Get('')
  async getAll() {
    return await this.fileService.findAll();
  }

  @Public()
  @ApiCreatedResponse({ type: FileEntity, isArray: true })
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, FileEntity))
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.fileService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: FileEntity, isArray: true })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'array',
          items: {
            type: 'file',
            format: 'binary',
          },
        },
      },
    },
  })
  @Post(':productId')
  async uploadFile(
    @Req() req,
    @Param('productId', ParseIntPipe) productId: number,
    @User() reqUser: UserEntity,
  ) {
    return await this.fileService.uploadFiles(req, reqUser, productId);
  }

  @ApiProduces('image/png', 'image/jpg', 'image/jpeg')
  @ApiOkResponse({ schema: { type: 'string', format: 'binary' } })
  @Public()
  @Get('/download/:id')
  async downloadOne(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const filePathAndName = await this.fileService.getFilePathAndName(id);
    const file = createReadStream(filePathAndName.path);

    res.set({
      'Content-disposition': `attachment; filename="${filePathAndName.name}"`,
    });
    file.pipe(res);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: FileEntity })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User() reqUser: UserEntity,
  ) {
    return await this.fileService.remove(id, reqUser);
  }
}
