import { Type, plainToInstance } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsString,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

export class AppConfig {
  //app
  @IsNumberString()
  PORT: number;
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;
  @IsString()
  SERVER_HOST: string;
  @IsString()
  SERVER_URL: string;
  @IsString()
  CLIENT_URL: string;

  //database
  @IsString()
  DB_HOST: string;
  @IsNumberString()
  DB_PORT: number;
  @IsString()
  DB_USERNAME: string;
  @IsString()
  DB_PASSWORD: string;
  @IsString()
  DB_NAME: string;

  //jwt
  @IsString()
  ACCESS_TOKEN_SECRET: string;
  @IsString()
  ACCESS_TOKEN_LIFETIME: string;
  @IsString()
  REFRESH_TOKEN_SECRET: string;
  @IsString()
  REFRESH_TOKEN_LIFETIME: string;
  @IsNumberString()
  REFRESH_COOKIE_LIFETIME: number;

  //google-auth
  @IsString()
  GOOGLE_CLIENT_EMAIL: string;
  @IsString()
  GOOGLE_PRIVATE_KEY: string;
  @IsString()
  GOOGLE_CLIENT_ID: string;
  @IsString()
  GOOGLE_CLIENT_SECRET: string;
  @IsString()
  GOOGLE_REDIRECT_URL: string;

  //google-drive
  @IsString()
  GOOGLE_USERS_DATA_FOLDER_ID: string;

  //redis
  @IsString()
  REDIS_HOST: string;
  @IsNumberString()
  REDIS_PORT: number;

  //multer
  @IsString()
  FILE_DESTINATION: string;

  //api
  @IsBooleanString()
  IS_AUTH_ENABLED: boolean;
}

export const validateConfig = (config) => {
  const validatedConfig = plainToInstance(AppConfig, config);
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length !== 0) {
    throw new Error(
      'Environment variables validation error\n' + errors.toString(),
    );
  }

  return validatedConfig;
};
