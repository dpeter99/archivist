import * as fs from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import {Content} from "../Content.ts";
import {SimpleModule} from "../Module/SimpleModule.ts";
import {Archivist, archivistInst} from "../Archivist.ts";

export class ArticleHelper {
    private file: string;
    private dir:string;
    private module: SimpleModule;
    private globalFilter?: (doc: Content) => boolean;

    constructor(file:string, module:SimpleModule, globalFilter?:(doc:Content)=>boolean) {
        this.file = file;
        this.globalFilter = globalFilter;
        this.dir = path.dirname(this.file);
        this.module = module;
    }

    /**
     * Helper function to return all articles that are (in the file hierarchy) under the current one,
     * or at the same level.
     * @param sortByDate If the results should be sorted by date
     * @returns 
     */
    public subArticles(sortByDate = true):Content[]{
        let res = this.module.pipeline.files.filter((d) => this.filterListArticles(d));
        if(sortByDate){
            res = res.sort((a,b)=>{
                return +new Date(b.meta.date) -  +new Date(a.meta.date)
            })
        }
        return res;
    }


    public filterListArticles(f:Content) : boolean{
        let res : boolean = this.subArticle(f) 
                    && !this.isDraft(f) 
                    && this.isNotOfType(f,"list");
        let global = true;
        if(this.globalFilter != null){
            global = this.globalFilter(f);
        }
        res = res && global;

        return res;
    }

    /**
     * Returns true if the given file is under the current file in the folder structure
     * @param f
     */
    public subArticle(f:Content): boolean{
        let common =path.common([this.dir,path.dirname(f.path)])
        common = common.replace(/[\/\\]$/, "")

        return common == this.dir && f.path != this.file;
    }

    /**
     * Returns weather the given article is a draft, defaults to false
     * @param f 
     * @returns 
     */
    public isDraft(f:Content): boolean{
        return ((f.meta.draft ?? false));
    }

    /**
     * Checks if the given article is not of a given type.
     * Usually used to filter types of content
     * @param f 
     * @param type 
     * @returns 
     */
    public isNotOfType(f:Content, type:String) : boolean{
        return f.meta.type != type;
    }

    public getLink(f:Content){
        if(f.meta.url){
            return f.meta.url;
        }

        let p = this.module.getFileOutputLoc(f.path);
        p = path.relative(this.module.pipeline.OutputPath,p);
        p = p.replace(path.extname(p),".html");
        return "/" + p;
    }

    public getRootURL(): string | undefined{
        return archivistInst.outputURL
    }
}
