import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";

import { relative, extname, dirname } from "https://deno.land/std@0.106.0/path/mod.ts";

import {ensureDir} from "https://deno.land/std@0.106.0/fs/mod.ts";

export class OutputModule extends SimpleModule{

    path:string

    constructor(path:string) {
        super();
        this.path = path;
    }

    async processDoc(doc:Content): Promise<any> {

        let relPath = relative(Deno.cwd(),doc.path);
        relPath = relPath.replace(extname(relPath),".html");

        const path = this.path + relPath

        //console.log(path + " dir: " + dirname(path))

        await ensureDir(dirname(path));

        await Deno.writeTextFile(path, doc.content);


    }

}
