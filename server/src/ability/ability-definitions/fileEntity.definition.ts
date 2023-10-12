import { AbilityBuilder } from '@casl/ability';
import { Role } from 'src/enums/role.enum';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { Action, AppAbility } from '../ability-factory';
import { FileEntity } from 'src/realizations/file/entities/file.entity';
import { CreateFileDto } from 'src/realizations/file/dto/create-file.dto';

type PlainFile = FileEntity & {
  'product.id': FileEntity['product']['id'];
};

export function defineFileEntityAbilitiesFor(
  user: UserEntity,
  userRoles: Role[],
  { can, cannot }: AbilityBuilder<AppAbility>,
) {
  let userProductsId = [];
  if (user.products) {
    userProductsId = user.products.map((prod) => prod.id);
  }

  can(Action.ReadOne, FileEntity);

  cannot(Action.Create, CreateFileDto).because(
    'You can only add images to your products',
  );
  can(Action.Create, CreateFileDto, { productId: { $in: userProductsId } });

  cannot(Action.Delete, FileEntity).because(
    'You are not an Admin / you can delete only files of your products',
  );
  can<PlainFile>(Action.Delete, FileEntity, {
    'product.id': { $in: userProductsId },
  });

  if (userRoles.includes(Role.ADMIN)) {
    can(Action.Read, FileEntity);
    can(Action.Delete, FileEntity);
  }
}
