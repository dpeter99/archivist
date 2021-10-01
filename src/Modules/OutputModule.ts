import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";

import * as Path from "https://deno.land/std/path/mod.ts";

import {ensureDir} from "https://deno.land/std/fs/mod.ts";
import {Archivist, archivistInst} from "../Archivist.ts";
import {Pipeline} from "../Pipeline.ts";
import {IModule} from "../Module/IModule.ts";

/**
 * The output module is responsible for writing the files to the output folder.
 * The path is determined by the following:
 * A. The path that is given to the constructor.
 * B. The following pattern: {out folder of archivist}/{out folder of the pipeline}
 */
export class OutputModule extends SimpleModule{

    conf_path?:string

    outputPath!:string

    constructor(path?:string) {
        super();
        this.conf_path = path;
    }

    setup(pipeline: Pipeline, parent?: IModule): Promise<any> {
        super.setup(pipeline, parent);

        this.outputPath = this.conf_path ?? this.OutputPath;

        if(this.outputPath == undefined){
            this.pipeline.reportError(this, "There was no output folder definied");
        }

        return Promise.resolve();
    }

    async processDoc(doc:Content): Promise<any> {

        let path = this.getFileOutputLoc(doc.path);
        path = path.replace(Path.extname(path),".html");

        await ensureDir(Path.dirname(path));

        await Deno.writeTextFile(path, doc.content);


    }

}
