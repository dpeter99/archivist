import {FileReaderModule} from "./src/Modules/FileReaderModule.ts";
import {Document} from "./src/Document.ts";
import {MarkdownRender} from "./src/Modules/MarkdownRender.ts";
import {OutputModule} from "./src/Modules/OutputModule.ts";

// First, create instance of Handlebars

//const handle = new Handlebars();





//const text = await Deno.readTextFile("./test.md");
//console.log(text);
let docs :Document[] = [];


let m = new FileReaderModule("**/*.md");
await m.process(docs);

let mark = new MarkdownRender();
await mark.process(docs);

let out = new OutputModule();
await out.process(docs);

console.table(docs.map((d)=> ({
    name: d.name
})));
