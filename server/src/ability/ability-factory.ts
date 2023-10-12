import {
  AbilityBuilder,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFileDto } from 'src/realizations/file/dto/create-file.dto';
import { FileEntity } from 'src/realizations/file/entities/file.entity';
import { CreateProductDto } from 'src/realizations/product/dto/create-product.dto';
import { ProductEntity } from 'src/realizations/product/entities/product.entity';
import { RoleEntity } from 'src/realizations/role/entities/role.entity';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { Repository } from 'typeorm';
import { defineUserEntityAbilitiesFor } from './ability-definitions/userEntitiy.definition';
import { defineProductEntityAbilitiesFor } from './ability-definitions/productEntity.definition';
import { defineFileEntityAbilitiesFor } from './ability-definitions/fileEntity.definition';
import { defineRoleEntityAbilitiesFor } from './ability-definitions/roleEntity.definition';

export enum Action {
  Manage = 'manage',
  Read = 'read',
  ReadOne = 'readOne',
  Create = 'create',
  Add = 'add',
  Update = 'update',
  Delete = 'delete',
  ReadSessionDevices = 'readSessionDevices',
}

export type Subjects = InferSubjects<
  | typeof UserEntity
  | typeof ProductEntity
  | typeof CreateProductDto
  | typeof FileEntity
  | typeof CreateFileDto
  | typeof RoleEntity
  | 'all'
>;
export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}
  async defineAbilityFor(user: UserEntity) {
    const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user) {
      user = await this.userRepo.findOne({
        where: { id: user.id },
        relations: { products: true },
      });
      const userRoles = user.roles.map((role) => role.name);

      defineUserEntityAbilitiesFor(user, userRoles, builder);

      defineProductEntityAbilitiesFor(user, userRoles, builder);

      defineFileEntityAbilitiesFor(user, userRoles, builder);

      defineRoleEntityAbilitiesFor(user, userRoles, builder);
    }

    return builder.build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
