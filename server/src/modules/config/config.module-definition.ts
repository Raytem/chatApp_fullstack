import { ConfigurableModuleBuilder } from '@nestjs/common';
import { IConfigModuleOptions } from '../../interfaces/config-module-options.interface';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<IConfigModuleOptions>()
  .setExtras<{ isGlobal?: boolean }>(
    { isGlobal: false },
    (definition, extras) => ({ ...definition, global: extras.isGlobal }),
  )
  .build();
