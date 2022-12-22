import {dirname} from "https://deno.land/std@0.61.0/path/mod.ts";
import {compile} from "https://deno.land/x/deno_ejs@v0.3.1/mod.ts";

import {SimpleModule} from "../../Module/SimpleModule.ts";
import {Pipeline} from "../../Pipeline.ts";
import {IModule} from "../../Module/IModule.ts";
import {archivistInst} from "../../Archivist.ts";

import { Content } from "../../Content.ts";
import { ArticleHelper } from "../../utils/ArticleHelper.ts";
import {TemplateFunction} from "../../utils/markdown/markdown.d.ts";

//import template_string from "./RssTemplate.ejs" assert { type: "string" };

interface SiteDetails{
    title: string;
    description: string;
    language: string;
    email: string;
}

interface RssFeedModuleParams {
    siteInfo: SiteDetails;
    helper?: (path:string, module:RssFeedModule)=>ArticleHelper
}

/**
 * This module is used for generating an RSS feed file from the documents in the project
 * It uses an RSS template file and uses ejs for templating.
 */
export class RssFeedModule extends SimpleModule {

    path?: string;
    template!: TemplateFunction;

    siteData: SiteDetails;

    private _helper: (path:string, module:RssFeedModule) => ArticleHelper;

    constructor({siteInfo,helper}:RssFeedModuleParams) {
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

        this.siteData = siteInfo == null ?
                    {title: "Placeholder", description:"Site description", email:"person@place.com", language:"eng"} :
                    siteInfo;
    }

    async setup(pipeline: Pipeline, parent?: IModule): Promise<any> {
        await super.setup(pipeline, parent);

        const __dirname = dirname(import.meta.url);
        const template_path = __dirname+"/./RssTemplate.ejs";

        if(archivistInst.detailedOutput)
            console.log(template_path);

        const template_string =  await (await fetch(template_path)).text();

        this.template = compile_help(template_string,{});

        //return Promise.resolve();
    }

    // deno-lint-ignore require-await
    override async process(docs:Array<Content>): Promise<any> {
        
        const data = {
            siteData: this.siteData,
            siteURL: archivistInst.outputURL,

            helper: this._helper(this.pipeline.ContentRoot + "rss.xml", this),

            pipeline: this.pipeline
        };
        
        if(archivistInst.detailedOutput)
            console.log(data.helper.subArticles());

        const content = this.template(data);

        const rssFile = new Content("rss.xml",content);
        rssFile.metadata.addData("outputPath", this.pipeline.ContentRoot + "rss.xml");

        docs.push(rssFile);

        return Promise.resolve();
    }

}

class RssHelper extends ArticleHelper{

}

function compile_help(text:string, conf:any):TemplateFunction{
    return compile(text,conf)
}