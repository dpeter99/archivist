#!/usr/bin/env node

import { Command } from 'commander';
import { loadConfig } from '@/cli/utils/config';
import { buildCommand } from './commands/build';
import { logger } from './utils/logger';

const program = new Command();

program
  .name('archavist')
  .description('Static site generator for Obsidian vaults using React 19')
  .version('1.0.0');

// Build command
program
  .command('build')
  .description('Build the static site')
  .option('-v, --verbose', 'Verbose logging')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      await buildCommand(config, options);
    } catch (error) {
      logger.error(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      process.exit(1);
    }
  });

program.parse();
