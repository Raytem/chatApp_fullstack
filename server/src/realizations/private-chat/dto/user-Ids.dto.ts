import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray } from 'class-validator';

export class UserIdsDto {
  @ApiProperty({
    isArray: true,
    minItems: 1,
    maxItems: 2,
    items: {
      type: 'number',
    },
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @Type(() => Number)
  userIds: number[];
}
