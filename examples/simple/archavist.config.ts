import {
  ArchavistConfig,
  ObsidianLoader,
  OutputStep,
  Pipeline,
} from "archavist";

const config: ArchavistConfig = {
  // Path to your Obsidian vault (required)
  vaultPath: "./content",

  outputPath: "./build",

  baseUrl: "",

  pipeline: new Pipeline()
    .addStep(new ObsidianLoader())
    .addStep(new OutputStep()),
};

export default config;
