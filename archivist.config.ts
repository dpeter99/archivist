import {FileReaderModule} from "./src/Modules/FileReaderModule.ts";
import {Content} from "./src/Content.ts";
import {MarkdownRender} from "./src/Modules/MarkdownRender.ts";
import {OutputModule} from "./src/Modules/OutputModule.ts";
import {ExtractMetadata} from "./src/Modules/ExtractMetadata.ts";
import {TemplateModule} from "./src/Modules/TemplateModule.ts";
import {Pipeline} from "./src/Pipeline.ts";
import {WebpackModule} from "./src/WebpackModule.ts";
import {BikeshedMetadata} from "./src/Modules/BikeshedMetadata.ts";
import {Config} from "./src/Archivist.ts";

export let config: Config = {
    template: "./template",
    preProcessors: [
        Pipeline.fromModules("build_template",
            new WebpackModule()
        )
    ],
    pipelines:[
        Pipeline.fromModules("root_files",
            new FileReaderModule("*.md"),
            new ExtractMetadata(
                new BikeshedMetadata()
            ),
            new MarkdownRender(),
            new TemplateModule("./template"),
            new OutputModule("./out/")
        ),
        Pipeline.fromModules("blog_files",
            new FileReaderModule("example/blog/*.md"),
            new ExtractMetadata(
                new BikeshedMetadata()
            ),
            new MarkdownRender(),
            new TemplateModule("./example/blog/template"),
            new OutputModule("./out/")
        )
    ]
}
