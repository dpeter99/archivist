import {cosmiconfig} from 'cosmiconfig';
import {ArchavistConfig, UserConfig} from "@/core/config";



/**
 * Load configuration from file or defaults
 */
export async function loadConfig(
  configPath?: string
): Promise<UserConfig> {
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
  return userConfig;
}
