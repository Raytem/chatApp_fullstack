import { Action, AppAbility } from 'src/ability/ability-factory';
import { Subject } from '@casl/ability';
import { SetMetadata } from '@nestjs/common';

export const CHECK_POLICIES_KEY = 'check_policies';

export type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export const CheckPolicies = (...handlers: PolicyHandlerCallback[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
