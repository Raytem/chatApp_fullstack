import { ContextIdFactory, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { json } from 'express';
import { AggregateByTenantContextIdStrategy } from './strategys/tenant.strategy';
import { ConfigService } from '@nestjs/config';
import {
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { MyLoggerService } from './my-logger/my-logger.service';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './swagger.config';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    httpsOptions: {
      key: fs.readFileSync(join(process.cwd(), 'secrets', 'install-key.pem')),
      cert: fs.readFileSync(join(process.cwd(), 'secrets', 'install.pem')),
    },
  });
  app.useLogger(app.get(MyLoggerService));
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  app.enableCors({
    origin: [configService.get('app.clientUrl')],
    exposedHeaders: ['x-total-count'],
    credentials: true,
  });

  app.use(
    json(),
    cookieParser(),
    compression(),
    // session(sessionOptions),
    loggerMiddleware,
  );
  app.use(
    '/uploads',
    express.static(
      join(process.cwd(), `${configService.get('multer.destination')}`),
    ),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      transform: true,
    }),
  );

  ContextIdFactory.apply(new AggregateByTenantContextIdStrategy());

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = configService.get('app.port');
  await app.listen(port);
  console.log(`--> Server started on port: ${port}`);
}
bootstrap();
