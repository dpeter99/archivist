/*
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
import {FunctionModule} from "./src/Modules/FunctionModule.ts";
*/

import * as archivist from "./src/index.ts";

export let config: archivist.Config = {
    detailedOutput: false,
    template: "./examples/specs/template/",
    outFolder: "./out",
    preProcessors: [
        archivist.Pipeline.fromModules({name:"build_template"},
            new archivist.WebpackModule(),
            new archivist.StaticFilesModule(),
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
            new archivist.StaticFilesModule()
        )
    ]
}

archivist.run(config);
