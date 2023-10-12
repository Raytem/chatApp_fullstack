import { AbilityBuilder } from '@casl/ability';
import { Role } from 'src/enums/role.enum';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { Action, AppAbility } from '../ability-factory';
import { ProductEntity } from 'src/realizations/product/entities/product.entity';
import { RoleEntity } from 'src/realizations/role/entities/role.entity';

export type FlatProduct = ProductEntity & {
  'user.id': ProductEntity['user']['id'];
};

export function defineRoleEntityAbilitiesFor(
  user: UserEntity,
  userRoles: Role[],
  { can, cannot }: AbilityBuilder<AppAbility>,
) {
  if (userRoles.includes(Role.ADMIN)) {
    can(Action.Manage, RoleEntity);
  }
}
