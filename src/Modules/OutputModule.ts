import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";

import { relative, extname, dirname } from "https://deno.land/std/path/mod.ts";

import {ensureDir} from "https://deno.land/std/fs/mod.ts";
import {Archivist, archivistInst} from "../Archivist.ts";
import {Pipeline} from "../Pipeline.ts";
import {IModule} from "../Module/IModule.ts";

export class OutputModule extends SimpleModule{

    path:string

    constructor(path?:string) {
        super();
        this.path = path ?? archivistInst.outFolder!;
    }

    setup(pipeline: Pipeline, parent?: IModule): Promise<any> {
        return super.setup(pipeline, parent);

        if(this.path == undefined){
            this.pipeline.reportError(this, "There was no output folder definied");
        }
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
