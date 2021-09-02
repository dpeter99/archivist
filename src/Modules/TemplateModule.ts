import {SimpleModule} from "../SimpleModule.ts";
import {Content} from "../Content.ts";

import {compile,render, Template} from "https://deno.land/x/deno_ejs/mod.ts";
import {StatusCodes} from "../StatusCodes.ts";

//"https://deno.land/x/dejs@0.9.3/mod.ts";

function compile_help(text:string, conf:any):Template{
    return compile(text,conf)
}

export class TemplateModule extends SimpleModule{

    template:string;

    compiled : any

    constructor(){
        super();

        this.template = Deno.readTextFileSync("./template/page.html.ejs");

        this.compiled = compile_help(this.template, {} );

    }


    processDoc(doc: Content): Promise<any> {
        
        const docContent = doc.content;
    
        let data = {
            content: docContent,
            meta: Object.fromEntries(doc.metadata),
            StatusCodes: StatusCodes
        };

        doc.content = this.compiled(data)


        return Promise.resolve();
    }
}