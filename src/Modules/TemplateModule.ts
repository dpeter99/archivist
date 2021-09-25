import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";
import {StatusCodes} from "../StatusCodes.ts";
import {Pipeline} from "../Pipeline.ts";
import {IModule} from "../Module/IModule.ts";
import {Template as ArcTemplate} from "../Template.ts";

import * as fs from "https://deno.land/std@0.106.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.106.0/path/mod.ts";

import {compile,render, Template} from "https://deno.land/x/deno_ejs/mod.ts";

import {interpolate} from "../utils/string-interpolator.ts";
import {getCompiledTemplateFolder} from "../utils/project-json-helpers.ts";
import {getTemplate} from "../utils/getTemplate.ts";


function compile_help(text:string, conf:any):Template{
    return compile(text,conf)
}

export class TemplateModule extends SimpleModule{

    /**
     * The root of the template where the template.json is
     */
    path:string

    /**
     * The folder where the static files and
     * the template files are for the template
     */
    template!: ArcTemplate;

    templateFiles: Map<string,CompiledTemplate> = new Map();

    /**
     *
     * @param templatePath The path to the root of the template where the project.json is
     */
    constructor(templatePath:string){
        super();

        this.path = templatePath;
    }

    /**
     *
     * @param pipeline
     * @param parent
     */
    async setup(pipeline:Pipeline, parent?:IModule): Promise<any> {
        await super.setup(pipeline, parent);

        //Get the folder from the template.json
        try {
            this.template = getTemplate(this.path);
        } catch (e: any) {
            this.pipeline.reportError(this, e);
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

            pipeline: this.pipeline
        };

        doc.content = templat.compiled(data)
        doc.metadata.Template = templat.file;
        return Promise.resolve();
    }

    getTemplateForDoc(doc:Content): CompiledTemplate | undefined{
        const temp = doc.metadata.Template;
        if(temp != undefined){
            return this.findTemplate(temp);
        }

        for (const templateMatcher of this.template.matchers) {
            const parsed = interpolate(templateMatcher, doc);
            //console.log(parsed);

            let res = this.findTemplate(parsed);
            if(res != undefined){
                return res;
            }
        }

    }

    findTemplate(name:string): CompiledTemplate | undefined{

        let p = this.template.compiledPath+"/"+name;
        if(fs.existsSync(p)){
            if(this.templateFiles.has(p)){
                return this.templateFiles.get(p);
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

        let compiled = compile_help(text, {filename:path} );

        return new CompiledTemplate(path,text,compiled);
    }
}

