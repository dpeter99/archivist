import {FileReaderModule} from "./src/Modules/FileReaderModule.ts";
import {Content} from "./src/Content.ts";
import {MarkdownRender} from "./src/Modules/MarkdownRender.ts";
import {OutputModule} from "./src/Modules/OutputModule.ts";
import {ExtractMetadata} from "./src/Modules/ExtractMetadata.ts";
import {TemplateModule} from "./src/Modules/TemplateModule.ts";
import {Pipeline} from "./src/Pipeline.ts";


let pipe = new Pipeline();
pipe.addModules(
    new FileReaderModule("**/*.md"),
    new ExtractMetadata(),
    new MarkdownRender(),
    new TemplateModule("./template"),
    new OutputModule("./out/")
);

let docs:Content[] = await pipe.run();

console.table(docs.map((d)=> ({
    name: d.name,
    Title: d.metadata.get("Title")
})));
