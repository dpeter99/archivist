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
  vaultPath: "/home/dpeter99/Documents/TTRPG/CoS_Orsi_ver/Rens-Mind/",

  outputPath: "./build",

  baseUrl: "",

  site: {
    title: "Ren's Mind",
    description: "Chronicles of the group",
    lang: "en"
  },

  pipeline: new Pipeline()
    .addStep(new ObsidianLoader())
    .addStep(new UrlGenerationStep())
    .addStep(new MarkdownRenderStep())
    .addStep(new NavTreeStep())
    .addStep(new OutputStep()),
};

export default config;
