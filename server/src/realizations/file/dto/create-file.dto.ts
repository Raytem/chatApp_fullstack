import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateFileDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  constructor(productId) {
    this.productId = productId;
  }
}
