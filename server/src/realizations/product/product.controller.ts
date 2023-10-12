import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/decorators/public-route.decorator';
import { User } from 'src/decorators/req-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductEntity } from './entities/product.entity';
import { Request } from 'express';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ProductEntity })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        price: {
          type: 'number',
        },
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
  @Post()
  async create(@Req() req: Request, @User() reqUser: UserEntity) {
    return await this.productService.create(req, reqUser);
  }

  @ApiCreatedResponse({ type: ProductEntity, isArray: true })
  @Public()
  @Get()
  async findAll() {
    return await this.productService.findAll();
  }

  @ApiCreatedResponse({ type: ProductEntity })
  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ProductEntity })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @User() reqUser: UserEntity,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.update(id, updateProductDto, reqUser);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ProductEntity })
  @Delete(':id')
  async remove(
    @User() reqUser: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.productService.remove(id, reqUser);
  }
}
