
import * as archivist from "./src/index.ts";

export let config: archivist.Config = {
    env:"production",
    detailedOutput: false,
    template: "./examples/specs/template/",
    outputPath: "./out",
    preProcessors: [
        archivist.Pipeline.fromModules({name:"build_template"},
            new archivist.WebpackModule(),
            new archivist.CopyTemplateFiles(),
            new archivist.WebpackModule("./examples/blog/template/"),
        )
    ],
    pipelines:[
        archivist.Pipeline.fromModules({name:"spec_files"},
            new archivist.FileReaderModule("examples/specs/**/*.md"),
            new archivist.ExtractMetadata(
                new archivist.BikeshedMetadata()
            ),
            new archivist.MarkdownRender(),
            new archivist.TemplateModule("./examples/specs/template"),
            new archivist.OutputModule("./out/")
        ),
        archivist.Pipeline.fromModules({name:"blog_files",outputPath:"./examples/blog"},
            new archivist.FileReaderModule("examples/blog/**/*.md"),
            new archivist.ExtractMetadata(
                new archivist.FrontMatterMetadata()
            ),
            new archivist.FunctionModule(((doc: { metadata: { hasData: (arg0: string) => any; addData: (arg0: string, arg1: string) => void; }; }) => {
                if(!doc.metadata.hasData("type")){
                    doc.metadata.addData("type","post");
                }
                return Promise.resolve();
            })),
            new archivist.MarkdownRender(),
            new archivist.TemplateModule(),
            new archivist.OutputModule("./out/"),
            new archivist.CopyTemplateFiles()
        )
    ]
}

archivist.run(config);
