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
  outputPath: "./build",
  baseUrl: "",

  site: {
    title: "Ren's Mind",
    description: "Chronicles of the group",
    lang: "en"
  },

  pipeline: new Pipeline()
    .addStep(new ObsidianLoader({ vaultPath: "/home/dpeter99/Documents/TTRPG/CoS_Orsi_ver/Rens-Mind/", }))
    .addStep(new UrlGenerationStep({ folderIndex: true }))
    .addStep(new MarkdownRenderStep())
    .addStep(new NavTreeStep())
    .addStep(new OutputStep()),
};

export default config;
