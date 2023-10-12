import { BadRequestException } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';

export interface ValidatedInstance<T> {
  errors: ValidationError[];
  obj: T;
}

export async function getValidatedInstance<T>(
  cls,
  obj,
): Promise<ValidatedInstance<T>> {
  const validatedObj = plainToInstance(cls, obj);
  const errors = await validate(validatedObj, {
    skipMissingProperties: false,
  });

  return {
    errors,
    obj: validatedObj as T,
  };
}
