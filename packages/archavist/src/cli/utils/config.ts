import {cosmiconfig} from 'cosmiconfig';
import {ArchavistConfig} from "@/core/config";

/**
 * Default configuration values
 */
const defaultConfig: Partial<ArchavistConfig> = {
  outputPath: './build',
  baseUrl: '',
  site: {
    title: 'My Site',
    description: '',
    lang: 'en',
  },
  dev: {
    port: 3000,
    host: 'localhost',
    open: false,
  },
  watch: {
    ignored: ['**/.*', '**/node_modules/**', '**/.git/**'],
    debounce: 300,
  },
  build: {
    clean: true,
  },
  // pipeline is omitted - user provides this in their config, or we use default steps
};

/**
 * Load configuration from file or defaults
 */
export async function loadConfig(
  configPath?: string
): Promise<ArchavistConfig> {
  const explorer = cosmiconfig('archavist');

  let result;
  if (configPath) {
    // Load specific config file
    result = await explorer.load(configPath);
  } else {
    // Search for config file
    result = await explorer.search();
  }

  const userConfig = result?.config || {};

  // Merge with defaults
  return Object.assign({}, defaultConfig, userConfig);
}
