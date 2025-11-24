import {
  ArchavistConfig,
  ObsidianLoader,
  UrlGenerationStep,
  MarkdownRenderStep,
  NavTreeStep,
  OutputStep,
  Pipeline,
} from "@dpeter99/archavist";

const config: ArchavistConfig = {
  // Path to your Obsidian vault (required)
  vaultPath: "./content",

  outputPath: "./build",

  baseUrl: "",

  pipeline: new Pipeline()
    .addStep(new ObsidianLoader())
    .addStep(new UrlGenerationStep())
    .addStep(new MarkdownRenderStep())
    .addStep(new NavTreeStep())
    .addStep(new OutputStep()),
};

export default config;
