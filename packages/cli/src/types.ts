import { Command } from 'commander';

export interface CommandPlugin {
  register(): Command;
}
