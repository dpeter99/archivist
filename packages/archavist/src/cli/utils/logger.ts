import pc from 'picocolors';

/**
 * Colored console logging utilities
 */
export const logger = {
  info(message: string): void {
    console.log(pc.blue('ℹ'), message);
  },

  success(message: string): void {
    console.log(pc.green('✔'), message);
  },

  warn(message: string): void {
    console.warn(pc.yellow('⚠'), message);
  },

  error(message: string): void {
    console.error(pc.red('✖'), message);
  },

  log(message: string): void {
    console.log(message);
  },

  dim(message: string): string {
    return pc.dim(message);
  },

  bold(message: string): string {
    return pc.bold(message);
  },
};
