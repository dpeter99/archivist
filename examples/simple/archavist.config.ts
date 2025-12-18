import {
  UserConfig,
  ObsidianLoader,
  AssetStep,
  UrlGenerationStep,
  PageIndexStep,
  MarkdownRenderStep,
  NavTreeStep,
  OutputStep,
  Pipeline,
  VFileReporterStep,
} from "@dpeter99/archavist";

const config: UserConfig = {
  baseUrl: "",

  pipeline: new Pipeline()
    .addStep(new ObsidianLoader({ vaultPath: "./content" }))
    .addStep(new AssetStep({ vaultPath: "./content" }))
    .addStep(new UrlGenerationStep())
    .addStep(new PageIndexStep())
    .addStep(new MarkdownRenderStep())
    .addStep(new VFileReporterStep())
    .addStep(new NavTreeStep())
    .addStep(new OutputStep()),
};

export default config;
