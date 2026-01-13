import {
  ObsidianLoader,
  UrlGenerationStep,
  MarkdownRenderStep,
  NavTreeStep,
  OutputStep,
  Pipeline,
  PageIndexStep,
  VFileReporterStep,
  UserConfig,
  AssetStep
} from "@dpeter99/archavist";

const vaultPath = "/home/dpeter99/Documents/Rens Mind/";

const config: UserConfig = {
  baseUrl: "",

  pipeline: new Pipeline()
    .addStep(new ObsidianLoader({ vaultPath, }))
    .addStep(new AssetStep({ vaultPath }))
    .addStep(new UrlGenerationStep({ folderIndex: true }))
    .addStep(new PageIndexStep())
    .addStep(new MarkdownRenderStep())
    .addStep(new VFileReporterStep())
    .addStep(new NavTreeStep())
    .addStep(new OutputStep()),
};

export default config;
