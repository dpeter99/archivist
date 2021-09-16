import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";
import {StatusCodes} from "../StatusCodes.ts";
import {Pipeline} from "../Pipeline.ts";
import {IModule} from "../Module/IModule.ts";


import * as fs from "https://deno.land/std@0.106.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.106.0/path/mod.ts";

import {compile,render, Template} from "https://deno.land/x/deno_ejs/mod.ts";

import {interpolate} from "../utils/string-interpolator.ts";
import {getCompiledTemplateFolder} from "../utils/project-json-helpers.ts";


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
        try{
            this.templateFolder = getCompiledTemplateFolder(this.templateRootFolder);
        }
        catch (e:any){
            this.pipeline.reportError(this,e);
        }

    }



    processDoc(doc: Content): Promise<any> {

        const docContent = doc.content;

        const templat = this.getTemplateForDoc(doc);

        if(templat == undefined){
            this.pipeline.reportError(this, `could not find template for file: ${doc.name}`);
            return Promise.resolve();
        }

        let data = {
            content: docContent,
            meta: Object.fromEntries(doc.metadata.data),
            StatusCodes: StatusCodes,
            originPath: "/"
        };

        doc.content = templat.compiled(data)
        doc.metadata.Template = templat.file;
        return Promise.resolve();
    }


    templateMathcers = [
        "spec-${meta.Status}.html.ejs",
        "spec.html.ejs"
    ]

    getTemplateForDoc(doc:Content): CompiledTemplate | undefined{
        const temp = doc.metadata.Template;
        if(temp != undefined){
            return this.findTemplate(temp);
        }

        //const interpolator = new Interpolator();

        for (const templateMathcer of this.templateMathcers) {
            const parsed = interpolate(templateMathcer, doc);
            console.log(parsed);

            let res = this.findTemplate(parsed);
            if(res != undefined){
                return res;
            }
        }

    }

    findTemplate(name:string): CompiledTemplate | undefined{

        let p = this.templateFolder+"/"+name;
        if(fs.existsSync(p)){
            if(this.templates.has(p)){
                return this.templates.get(p);
            }
            return CompiledTemplate.from(p);
        }

    }
}


class CompiledTemplate {
    constructor(
        public file:string,
        public text:string,
        public compiled: any
    ) {}

    static from(path: string) : CompiledTemplate {
        let text = Deno.readTextFileSync(path);

        let compiled = compile_help(text, {} );

        return new CompiledTemplate(path,text,compiled);
    }
}

