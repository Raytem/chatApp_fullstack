import { AbilityBuilder } from '@casl/ability';
import { Role } from 'src/enums/role.enum';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { Action, AppAbility } from '../ability-factory';
import { ProductEntity } from 'src/realizations/product/entities/product.entity';
import { CreateProductDto } from 'src/realizations/product/dto/create-product.dto';

export type FlatProduct = ProductEntity & {
  'user.id': ProductEntity['user']['id'];
};

export function defineProductEntityAbilitiesFor(
  user: UserEntity,
  userRoles: Role[],
  { can, cannot }: AbilityBuilder<AppAbility>,
) {
  can(Action.Read, ProductEntity);
  can(Action.ReadOne, ProductEntity);

  cannot(Action.Create, CreateProductDto).because(
    'You can create a product just for yourself',
  );
  cannot(Action.Update, ProductEntity).because(
    'You can update only your products',
  );
  can<FlatProduct>(Action.Update, ProductEntity, { 'user.id': user.id });

  cannot(Action.Delete, ProductEntity).because(
    'You are not an Admin / you can delete only your products',
  );
  can<FlatProduct>(Action.Delete, ProductEntity, { 'user.id': user.id });

  if (userRoles.includes(Role.ADMIN)) {
    can(Action.Delete, ProductEntity);
  }
}
