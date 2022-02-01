import * as fs from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import {Content} from "../Content.ts";
import {SimpleModule} from "../Module/SimpleModule.ts";

export class ArticleHelper {
    private file: string;
    private dir:string;
    private module: SimpleModule;

    constructor(file:string, module:SimpleModule) {
        this.file = file;
        this.dir = path.dirname(this.file);
        this.module = module;
    }

    /**
     * Returns true if the given file is under this file in the folder structure
     * @param f
     */
    public subArticle(f:Content): boolean{
        let common =path.common([this.dir,path.dirname(f.path)])
        common = common.replace(/[\/\\]$/, "")

        return common == this.dir && f.path != this.file && ((f.meta.draft ?? false) == false);
    }

    public getLink(f:Content){
        let p = this.module.getFileOutputLoc(f.path);
        p = path.relative(this.module.pipeline.OutputPath,p);
        p = p.replace(path.extname(p),".html");
        return "/" + p;
    }

}
