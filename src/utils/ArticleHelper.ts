import * as fs from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import {Content} from "../Content.ts";
import {SimpleModule} from "../Module/SimpleModule.ts";
import {Archivist, archivistInst} from "../Archivist.ts";
import {models} from "https://esm.sh/v99/entities@3.0.1/deno/lib/maps/entities.json.js";
import {MarkdownRender} from "../Modules/MarkdownRender.ts";
import {IModule} from "../Module/IModule.ts";
import {Mark} from "https://deno.land/std@0.134.0/encoding/_yaml/mark.ts";
import {UnifiedRenderer} from "../Modules/UnifiedRenderer.ts";

export class ArticleHelper {
    protected file: string;
    protected dir:string;
    protected module: SimpleModule;
    protected globalFilter?: (doc: Content) => boolean;

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
        let common = path.common([this.dir,path.dirname(f.path)])
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

    public async md(text:string){
        if(text === undefined)
            return "";
        let renderer = this.module.pipeline.modules.find<UnifiedRenderer>(isMarkdownRender);
        if(!renderer)
            return "";
        return await renderer.inlineParse(text);
    }

    /**
     * @description
     * Takes an Array<V>, and a grouping function,
     * and returns a Map of the array grouped by the grouping function.
     *
     * @param list An array of type V.
     * @param keyGetter A Function that takes the the Array type V as an input, and returns a value of type K.
     *                  K is generally intended to be a property key of V.
     *
     * @returns Map of the array grouped by the grouping function.
     */
    groupBy<K, V>(list: Array<V>, keyGetter: (input: V) => K): Map<K, Array<V>> {
        const map = new Map<K, Array<V>>();
        list.forEach((item) => {
            const key = keyGetter(item);
            const collection = map.get(key);
            if (!collection) {
                map.set(key, [item]);
            } else {
                collection.push(item);
            }
        });
        return map;
    }


    /**
     * @description
     * Takes an Array<V>, and a grouping function,
     * and returns a Map of the array grouped by the grouping function.
     *
     * @param list An array of type V.
     * @param keyGetter A Function that takes the the Array type V as an input, and returns a value of type K.
     *                  K is generally intended to be a property key of V.
     *
     * @returns An array of key, value objects.
     */
    groupByInObjects<K, V>(list: Array<V>, keyGetter: (input: V) => K) {
        const map: {
            key: K,
            values: V[]
        }[] = [];

        list.forEach((item) => {
            const key = keyGetter(item);
            const collection = map.find(c=>c.key == key);
            if (!collection) {
                map.push({key, values:[item]});
            } else {
                collection.values.push(item);
            }
        });
        return map;
    }

    toFirstUpper(text:string){
        return text[0].toUpperCase() + text.slice(1);
    }
}

function isMarkdownRender(animal: IModule): animal is UnifiedRenderer {
    return animal instanceof UnifiedRenderer
}
