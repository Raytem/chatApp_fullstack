import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('nest-test_1')
  .setDescription('Created by Daniil Rummo, first nestjs app.')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
