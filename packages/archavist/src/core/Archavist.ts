import {ArchavistConfig, UserConfig} from "@/core/config";
import {Pipeline} from "@/core/pipeline";
import {logger} from "@/cli/utils/logger";

/**
 * Default configuration values
 */
const defaultConfig: ArchavistConfig = {
  build: {
    outputPath: process.cwd() + '/dist',
    buildDir: process.cwd() + '/.archavist',
  },
  projectDir: process.cwd(),
  verbose: false,
};

export class Archavist {
  config: ArchavistConfig;
  pipeline: Pipeline;
  
  constructor(config: UserConfig) {
    this.config = {...defaultConfig, ...config}
    
    this.pipeline = config.pipeline;
  }
  
  async build(){
    if (this.config.verbose) {
      logger.info(`Output path: ${this.config.build.outputPath}`);
      logger.log('');
    }
    
    return await this.pipeline.execute(this.config);
  }
  
}