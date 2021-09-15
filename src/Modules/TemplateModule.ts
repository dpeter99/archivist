import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";
import {StatusCodes} from "../StatusCodes.ts";
import {Pipeline} from "../Pipeline.ts";
import {IModule} from "../Module/IModule.ts";


import * as fs from "https://deno.land/std@0.106.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.106.0/path/mod.ts";

import {compile,render, Template} from "https://deno.land/x/deno_ejs/mod.ts";

import stringInterpolation from 'https://cdn.skypack.dev/string-interpolation';




function compile_help(text:string, conf:any):Template{
    return compile(text,conf)
}

export class TemplateModule extends SimpleModule{

    /**
     * The root of the template where the package.json is
     */
    templateRootFolder:string

    /**
     * The folder where the static files and
     * the template files are for the template
     */
    templateFolder!: string;

    template!:string;
    compiled : any;

    templates: Map<string,CompiledTemplate> = new Map();

    /**
     *
     * @param templatePath The path to the root of the template where the project.json is
     */
    constructor(templatePath:string){
        super();

        this.templateRootFolder = templatePath;
    }

    /**
     *
     * @param pipeline
     * @param parent
     */
    async setup(pipeline:Pipeline, parent?:IModule): Promise<any> {
        await super.setup(pipeline, parent);

        //Get the folder from the package.json
        this.templateFolder = this.getCompiledTemplateFolder(this.templateRootFolder);

        if(!fs.existsSync(this.templateFolder+"/page.html.ejs")){
            this.pipeline.reportError(this,`Can not find template file at: ${this.templateFolder+"/page.html.ejs"}`);
            return;
        }

        this.template = Deno.readTextFileSync(this.templateFolder+"/page.html.ejs");

        this.compiled = compile_help(this.template, {} );

    }

    /**
     * extracts the data from the package.json
     * @param path
     */
    getCompiledTemplateFolder(path:string):string{
        let packagePath = path+"/package.json";
        if(!fs.existsSync(packagePath)){
            this.pipeline.reportError(this,`Could not find package.json for template at: \" ${packagePath} \"`);
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
            meta: Object.fromEntries(doc.metadata.data),
            StatusCodes: StatusCodes
        };

        doc.content = this.compiled(data)

        return Promise.resolve();
    }


    templateMathcers = [
        "spec-{meta.Status}.html.ejs",
        "spec.html.ejs"
    ]

    getTemplateForDoc(doc:Content){
        const temp = doc.metadata.Template;
        if(temp != undefined){
            return "";
        }
    }
}


class CompiledTemplate {
    constructor(
        public text:string,
        public compiled: any
    ) {}
}
