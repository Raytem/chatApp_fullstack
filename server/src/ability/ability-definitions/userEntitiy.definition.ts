import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { Action, AppAbility } from '../ability-factory';
import { AbilityBuilder } from '@casl/ability';
import { Role } from 'src/enums/role.enum';

export function defineUserEntityAbilitiesFor(
  user: UserEntity,
  userRoles: Role[],
  { can, cannot }: AbilityBuilder<AppAbility>,
) {
  can(Action.ReadOne, UserEntity);
  can(Action.Create, UserEntity);

  cannot(Action.ReadSessionDevices, UserEntity).because(
    'You not an Admin / You can get session devices only of your account',
  );
  can(Action.ReadSessionDevices, UserEntity, { id: user.id });

  cannot(Action.Update, UserEntity).because('You can update only your account');
  can(Action.Update, UserEntity, { id: user.id });

  cannot(Action.Delete, UserEntity).because(
    'You not an Admin / You can delete only your account',
  );
  can(Action.Delete, UserEntity, { id: user.id });

  if (userRoles.includes(Role.ADMIN)) {
    can(Action.Read, UserEntity);
    can(Action.Delete, UserEntity);
    can(Action.ReadSessionDevices, UserEntity);
  }
}
