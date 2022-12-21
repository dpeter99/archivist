import "../../src/index.ts";
import {DoxygenReader} from "../../src/Modules/Input/doxygen/DoxygenReader.ts";
import * as Arch from "../../src/index.ts";
import {Pipeline, CopyTemplateFiles, WebUrlOutputResolver} from "../../src/index.ts";
import {UnifiedRenderer} from "../../src/Modules/UnifiedRenderer.ts";


export let config: Arch.Config = {
    env:"production",
    detailedOutput: false,
    template: "./template",
    outputPath: "./out",
    preProcessors: [
        Pipeline.fromModules({name:"build_template"},
            new CopyTemplateFiles(),
        )
    ],
    pipelines:[
        Arch.Pipeline.fromModules({name:"posts"},
            new DoxygenReader("doxygen-out/**/*"),
            new Arch.ExtractMetadata(
                new Arch.FrontMatterMetadata()
            ),
            new WebUrlOutputResolver(),
            new UnifiedRenderer(),

            new Arch.TemplateModule({templatePath:"./template"}),
            new Arch.OutputModule("./out/")
        )
    ]
}
