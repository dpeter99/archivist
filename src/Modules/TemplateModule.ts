import {SimpleModule} from "../SimpleModule.ts";
import {Content} from "../Content.ts";

import { exists, existsSync} from "https://deno.land/std@0.106.0/fs/mod.ts";
import {compile,render, Template} from "https://deno.land/x/deno_ejs/mod.ts";
import {StatusCodes} from "../StatusCodes.ts";

//"https://deno.land/x/dejs@0.9.3/mod.ts";

function compile_help(text:string, conf:any):Template{
    return compile(text,conf)
}

export class TemplateModule extends SimpleModule{

    templateFolder: string;

    template:string;
    compiled : any


    constructor(templatePath:string){
        super();

        this.templateFolder = this.getCompiledTemplateFolder(templatePath)
        console.log(this.templateFolder);

        this.template = Deno.readTextFileSync(this.templateFolder+"/page.html.ejs");

        this.compiled = compile_help(this.template, {} );



    }

    getCompiledTemplateFolder(path:string):string{
        let packagePath = path+"/package.json";
        if(!existsSync(packagePath)){
            console.warn(`Could not find package.json for template at: \" {packagePath} \"`);
            return path;
        }

        let conf = JSON.parse( Deno.readTextFileSync(packagePath));

        if(conf.out != undefined){
            return path + conf.out;
        }

        return path;
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