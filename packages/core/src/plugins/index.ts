import { OiPluginRegistry } from './plugins';

export { OiPluginRegistry } from './plugins';
export { OiPlugin, type OiCoreSchema } from './plugin';
export { OiPluginService } from './service';
export { OnPluginInitHook, RegisterPlugin, WithPluginServices } from './decorators';

export const oiCorePlugins = OiPluginRegistry.getInstance();

