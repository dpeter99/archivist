import {FileReaderModule} from "./src/Modules/FileReaderModule.ts";
import {Content} from "./src/Content.ts";
import {MarkdownRender} from "./src/Modules/MarkdownRender.ts";
import {OutputModule} from "./src/Modules/OutputModule.ts";
import {ExtractMetadata} from "./src/Modules/Metadata/ExtractMetadata.ts";
import {TemplateModule} from "./src/Modules/TemplateModule.ts";
import {Pipeline} from "./src/Pipeline.ts";
import {WebpackModule} from "./src/Modules/WebpackModule.ts";
import {BikeshedMetadata} from "./src/Modules/Metadata/BikeshedMetadata.ts";
import {Config} from "./src/Archivist.ts";
import {StaticFilesModule} from "./src/Modules/StaticFilesModule.ts";
import {FrontMatterMetadata} from "./src/Modules/Metadata/FrontMatterMetadata.ts";

export let config: Config = {
    detailedOutput: false,
    template: "./examples/specs/template/",
    outFolder: "./out",
    preProcessors: [
        Pipeline.fromModules("build_template",
            new WebpackModule(),
            new StaticFilesModule()
        )
    ],
    pipelines:[
        Pipeline.fromModules("spec_files",
            new FileReaderModule("examples/specs/**/*.md"),
            new ExtractMetadata(
                new BikeshedMetadata()
            ),
            new MarkdownRender(),
            new TemplateModule("./examples/specs/template"),
            new OutputModule("./out/")
        ),
        Pipeline.fromModules("blog_files",
            new FileReaderModule("examples/blog/**/*.md"),
            new ExtractMetadata(
                new FrontMatterMetadata()
            ),
            new MarkdownRender(),
            new TemplateModule("./examples/blog/template/"),
            new OutputModule("./out/")
        )
    ]
}
