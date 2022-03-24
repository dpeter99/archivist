import {
    Config,
    ExtractMetadata,
    FileReaderModule,
    FrontMatterMetadata, MarkdownRender, OutputModule,
    Pipeline,
    StaticTemplateFilesModule, TemplateModule,
    run
} from "../../src/index.ts";
import {WebUrlOutputResolver} from "../../src/Modules/WebUrlOutputResolver.ts";


export let config: Config = {
    env:"production",
    detailedOutput: true,
    template: "./theme",
    outputPath: "./out",
    outputURL: "http://127.0.0.1:8888",
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
            new WebUrlOutputResolver(),
            new TemplateModule({}),
            new OutputModule("./out/")
        )
    ]
}

run(config);
