import { ForbiddenError } from '@casl/ability';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from 'src/ability/ability-factory';
import {
  CHECK_POLICIES_KEY,
  PolicyHandlerCallback,
} from 'src/decorators/check-policies.decorator';
import { UserEntity } from 'src/realizations/user/entities/user.entity';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext) {
    const handlers =
      this.reflector.get<PolicyHandlerCallback[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    if (!handlers.length) return true;

    const req = context.switchToHttp().getRequest();
    const reqUser: UserEntity = req.user;

    const ability = await this.abilityFactory.defineAbilityFor(reqUser);

    return handlers.every((handler) => {
      return handler(ability);
    });
  }
}
