import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";
import {Pipeline} from "../Pipeline.ts";
import {IModule} from "../Module/IModule.ts";

import * as Path from "https://deno.land/std@0.167.0/path/mod.ts";
import {ensureDir} from "https://deno.land/std@0.167.0/fs/mod.ts";
import {archivistInst} from "../Archivist.ts";


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
            this.pipeline.reportError(this, "There was no output folder defined");
        }

        return Promise.resolve();
    }

    async processDoc(doc:Content): Promise<any> {

        let path = this.getFileOutputLoc(doc.path);

        if(doc.meta.outputpath){
            path = this.getFileOutputLoc(doc.meta.outputpath);
        }

        const dir = Path.dirname(path);
        if(archivistInst.detailedOutput)
            console.log("[INFO] Outputting file to:" + path + " in dir: "+ dir);

        await ensureDir(dir);

        await Deno.writeTextFile(path, doc.content);
    }

}
