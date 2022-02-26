import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";
import {StatusCodes} from "../StatusCodes.ts";
import {Pipeline} from "../Pipeline.ts";
import {IModule} from "../Module/IModule.ts";
import {Template as ArcTemplate} from "../Template.ts";

import * as fs from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

import {compile,render, Template} from "https://deno.land/x/deno_ejs/mod.ts";

import {interpolate} from "../utils/string-interpolator.ts";
import {getTemplate} from "../utils/getTemplate.ts";
import {ArticleHelper} from "../utils/ArticleHelper.ts";


function compile_help(text:string, conf:any):Template{
    return compile(text,conf)
}

interface TemplateModuleParams {
    templatePath?:string,
    helper?: (path:string, module:TemplateModule)=>object
}

export class TemplateModule extends SimpleModule{

    /**
     * The root of the template where the template.json is
     */
    path?:string

    /**
     * The folder where the static files and
     * the template files are for the template
     */
    template!: ArcTemplate;

    templateFiles: Map<string,CompiledTemplate> = new Map();

    rootTemplate?: CompiledTemplate;
    private _helper: (path:string, module:TemplateModule) => object;



    /**
     *
     * @param templatePath The path to the root of the template where the project.json is
     * @param helper
     */
    constructor({templatePath, helper}:TemplateModuleParams){
        super();

        this.path = templatePath;
        if(helper == null){
            this._helper = (path:string, module:TemplateModule)=>{
                return new ArticleHelper(path, module);
            };
        }
        else{
            this._helper = helper;
        }

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

        if(this.template.rootTemplate){
           this.rootTemplate = CompiledTemplate.from(this.template.rootTemplate);
        }

    }


    async process(docs: Array<Content>): Promise<any> {
        docs.forEach(d=>this.prepareData(d));

        return super.process(docs);
    }

    processDoc(doc: Content): Promise<any> {

        const docContent = doc.content;

        const templat = this.getTemplateForDoc(doc);

        if(templat == undefined){
            this.pipeline.reportError(this, `could not find template for file: ${doc.path}`);
            return Promise.resolve();
        }

        let data = {
            doc : doc,
            content: docContent,
            meta: doc.meta,

            StatusCodes: StatusCodes,

            helper: this._helper(doc.path, this),

            pipeline: this.pipeline
        };

        if(this.rootTemplate != null){
            // @ts-ignore
            data["template"] = templat.file;

            doc.content = this.rootTemplate.compiled(data);
        }
        else {
            doc.content = templat.compiled(data)
        }
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

    prepareData(doc:Content){
        for (const must of this.template.metadata.mustBeArray) {
            doc.metadata.forceArray(must);
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

        if(fs.existsSync(path)) {
            let text = Deno.readTextFileSync(path);

            let compiled = compile_help(text, {filename:path} );

            return new CompiledTemplate(path,text,compiled);
        }
        else {
            console.log("Couldn't find file: " + path);
            throw "Couldn't find file: " + path;
        }


    }
}

function subFolderFiles(f:string){

}
