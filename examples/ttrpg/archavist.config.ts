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

const config: UserConfig = {
  baseUrl: "",

  pipeline: new Pipeline()
    .addStep(new ObsidianLoader({ vaultPath: "/home/dpeter99/Documents/TTRPG/CoS_Orsi_ver/Rens-Mind/", }))
    .addStep(new AssetStep({ vaultPath: "/home/dpeter99/Documents/TTRPG/CoS_Orsi_ver/Rens-Mind/" }))
    .addStep(new UrlGenerationStep({ folderIndex: true }))
    .addStep(new PageIndexStep())
    .addStep(new MarkdownRenderStep())
    .addStep(new VFileReporterStep())
    .addStep(new NavTreeStep())
    .addStep(new OutputStep()),
};

export default config;
