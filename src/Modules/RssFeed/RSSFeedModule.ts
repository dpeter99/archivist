import * as fs from "https://deno.land/std@0.115.1/fs/mod.ts";
import { copy, copySync } from "https://deno.land/std@0.115.1/fs/copy.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import {ensureDir} from "https://deno.land/std@0.115.1/fs/mod.ts";
import {dirname} from "https://deno.land/std@0.61.0/path/mod.ts";

import * as ink from 'https://deno.land/x/ink/mod.ts'
import {compile,render, Template} from "https://deno.land/x/deno_ejs/mod.ts";

import ProgressBar from "https://deno.land/x/progress@v1.2.4/mod.ts";


import {SimpleModule} from "../../Module/SimpleModule.ts";
import {Pipeline} from "../../Pipeline.ts";
import {IModule} from "../../Module/IModule.ts";
import {archivistInst} from "../../Archivist.ts";
import {getTemplate} from "../../utils/getTemplate.ts";

import { Content } from "../../Content.ts";
import { ArticleHelper } from "../../utils/ArticleHelper.ts";

//import template_string from "./RssTemplate.ejs" assert { type: "string" };



interface RssFeedModuleParams {
    
    helper?: (path:string, module:RssFeedModule)=>ArticleHelper
}

/**
 * This module is responsible for copying the static files of your template
 * It does this by copying every file in your templates "compiledPath" that
 * isn't matched by the "ignore" list in your template.
 */
export class RssFeedModule extends SimpleModule {

    path?: string;
    template!: Template;

    compiled:any;

    private _helper: (path:string, module:RssFeedModule) => ArticleHelper;

    constructor({helper}:RssFeedModuleParams) {
        super();

        if(helper == null){
            if(archivistInst.detailedOutput)
                console.log("[INFO] No helper provider was given for RssModule");
            
            this._helper = (path:string, module:RssFeedModule)=>{
                return new ArticleHelper(path, module);
            };
        }
        else{
            this._helper = helper;
        }


        //this.template.compile();
    }

    async setup(pipeline: Pipeline, parent?: IModule): Promise<any> {
        super.setup(pipeline, parent);

        const __dirname = dirname(import.meta.url);
        const template_path = __dirname+"/./RssTemplate.ejs";
        console.log(template_path);
        const template_string =  await (await fetch(template_path)).text();

        this.template = compile_help(template_string,{});


        //return Promise.resolve();
    }

    // deno-lint-ignore require-await
    override async process(docs:Array<Content>): Promise<any> {
        
        let data = {
            title: "asd",
            description: "asdasdasda",

            helper: this._helper(this.pipeline.ContentRoot + "rss.xml", this),

            pipeline: this.pipeline
        };
        
        if(archivistInst.detailedOutput){
            //console.log(data.helper);
            console.log(data.helper.subArticles());
        }

        const content = this.template(data);

        const rssFile = new Content("rss.xml",content);
        rssFile.metadata.addData("outputPath", this.pipeline.ContentRoot + "rss.xml");

        docs.push(rssFile);

        return Promise.resolve();
    }

}


class RssHelper extends ArticleHelper{



}

function compile_help(text:string, conf:any):Template{
    return compile(text,conf)
}