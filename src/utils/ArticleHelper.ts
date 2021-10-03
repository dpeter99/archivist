import * as fs from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import {Content} from "../Content.ts";

export class ArticleHelper {
    private file: string;
    private dir:string;

    constructor(file:string) {
        this.file = file;
        this.dir = path.dirname(this.file);
    }

    public subArticle(f:Content): boolean{
        let common =path.common([this.dir,path.dirname(f.path)])
        common = common.replace(/[\/\\]$/, "")

        return common == this.dir;
    }

}
