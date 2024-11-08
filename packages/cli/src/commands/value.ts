import { OiCommand } from '../command';
import { OiCore, OiConfig, OiLoggerInterface } from '@openibex/core';

export default class ValueCommand extends OiCommand {
  constructor(core: OiCore, config: OiConfig, logger: OiLoggerInterface) {
    super(core, config, logger);
    this.name('value')
      .description('Set, get and delete keys from the core key-value database.')
      .argument('<action>', 'Can be set, get, del.')
      .argument('<valname>', 'Value name, dotted form.')
      .option('--tag <tag>', 'Tag of the value (if any)')
      .argument('[value]', 'Only required when set is used.')
      .action(this.execute.bind(this));
  }

  async execute(action: string, valname: string, value: string, options: { tag?: string;}) {
    
    if (action === 'set') {
      this.logger.info(`Setting ${valname} ${options.tag ? `with tag ${options.tag}` : ''} to ${value}`)
      await this.oiCore.setVal(value, valname, options.tag);

    } else if (action === 'del') {
      this.logger.info(`Deleting ${valname} ${options.tag ? `with tag ${options.tag}` : ''}.`);
      await this.oiCore.delVal(valname, options.tag);
    }

    const getVal = await this.oiCore.getVal(valname, options.tag)
    this.logger.info(`Get ${valname} ${options.tag ? `/ tag ${options.tag}` : ''}: ${getVal}`);
  }
}
