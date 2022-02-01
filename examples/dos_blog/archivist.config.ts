
import {Config} from "../../src/Archivist.ts";
import {Pipeline} from "../../src/Pipeline.ts";
import {
    StaticTemplateFilesModule,
    FileReaderModule,
    ExtractMetadata,
    FrontMatterMetadata,
    MarkdownRender,
    TemplateModule,
    OutputModule
} from "../../src/Modules/modules.ts";


export let config: Config = {
    env:"production",
    detailedOutput: true,
    template: "./theme",
    outputPath: "./out",
    preProcessors: [
        Pipeline.fromModules({name:"build_template"},
            new StaticTemplateFilesModule(),
        )
    ],
    pipelines:[
        Pipeline.fromModules({name:"posts",contentRoot:"./content/"},
            new FileReaderModule("**/*.md"),
            new ExtractMetadata(
                new FrontMatterMetadata()
            ),
            new MarkdownRender(),
            new TemplateModule(),
            new OutputModule("./out/")
        )
    ]
}
