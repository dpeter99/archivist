import {
  UserConfig,
  ObsidianLoader,
  UrlGenerationStep,
  PageIndexStep,
  MarkdownRenderStep,
  NavTreeStep,
  OutputStep,
  Pipeline,
} from "@dpeter99/archavist";

const config: UserConfig = {
  baseUrl: "",

  pipeline: new Pipeline()
    .addStep(new ObsidianLoader({ vaultPath: "./content" }))
    .addStep(new UrlGenerationStep())
    .addStep(new PageIndexStep())
    .addStep(new MarkdownRenderStep())
    .addStep(new NavTreeStep())
    .addStep(new OutputStep()),
};

export default config;
