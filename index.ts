import {FileReaderModule} from "./src/Modules/FileReaderModule.ts";
import {Content} from "./src/Content.ts";
import {MarkdownRender} from "./src/Modules/MarkdownRender.ts";
import {OutputModule} from "./src/Modules/OutputModule.ts";
import {ExtractMetadata} from "./src/Modules/ExtractMetadata.ts";
import {TemplateModule} from "./src/Modules/TemplateModule.ts";

// First, create instance of Handlebars

//const handle = new Handlebars();





//const text = await Deno.readTextFile("./test.md");
//console.log(text);
let docs :Content[] = [];


let m = new FileReaderModule("**/*.md");
await m.process(docs);

let meta = new ExtractMetadata();
await meta.process(docs);

let mark = new MarkdownRender();
await mark.process(docs);

let template = new TemplateModule();
await template.process(docs);

let out = new OutputModule("./out/");
await out.process(docs);

console.table(docs.map((d)=> ({
    name: d.name,
    title: d.metadata.get("Title")
})));
