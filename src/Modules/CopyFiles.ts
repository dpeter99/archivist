import * as fs from "https://deno.land/std@0.115.1/fs/mod.ts";

import { regexCopy } from "https://deno.land/x/regex_copy@1.0.3/mod.ts";

import {SimpleModule} from "../Module/SimpleModule.ts";
import {Pipeline} from "../Pipeline.ts";
import {IModule} from "../Module/IModule.ts";
import {path} from "https://deno.land/x/deno_ejs@v0.3.1/deps.ts";
import {WalkEntry} from "https://deno.land/std@0.167.0/fs/_util.ts";
import ProgressBar from "https://deno.land/x/progress@v1.2.4/mod.ts";
import {ensureDir} from "https://deno.land/std@0.167.0/fs/ensure_dir.ts";
import {dirname} from "https://deno.land/std@0.61.0/path/mod.ts";
import {copy} from "https://deno.land/std@0.115.1/fs/copy.ts";
import {archivistInst} from "../Archivist.ts";


/**
 * Copy files from folder to folder
 */
export class CopyFiles extends SimpleModule {
    private from: string;
    private to: string;
    private includes?: string;


    /**
     *
     * @param from Glob pattern of files to copy
     * @param to The destination folder to copy to
     * @param includes
     */
    constructor(from: string, to:string, includes?: string) {
        super();
        this.from = from;
        this.to = to;
        this.includes = includes;
    }

    setup(pipeline: Pipeline, parent?: IModule): Promise<any> {
        super.setup(pipeline, parent);

        this.from = path.join(this.pipeline.ContentRoot, this.from);
        this.to = path.join(this.pipeline.ContentRoot, this.to);

        return Promise.resolve();
    }

    async process() {
        //Make sure we have a place to put the files
        fs.ensureDirSync(this.to);
        if(archivistInst.detailedOutput) {
            console.log("from: " + this.from + " to: " + this.to);
        }
        await copyFiles(this.from, this.to);
    }

}


async function copyFiles(from: string, to: string) {
    fs.ensureDirSync(to);

    let files: WalkEntry[] = await toArray(fs.expandGlob(from + "/**/*"));

    const progress = new ProgressBar({
        title: "Copy files:",
        total: files.length
    });

    let completed1 = 0;

    for (const file of files) {

        let sub = path.relative(from, file.path);
        let dst = path.join(to, sub);
        try {
            await ensureDir(dirname(dst));
            await copy(file.path, dst, {overwrite: true});
        }
        catch (e) {
            //TODO: add error reporting
            //this.pipeline.reportError(this, "Copping: " + file.path + " to: " + dst)
            console.error(e);
        }
        completed1++;
        await progress.render(completed1);
    }
}



async function toArray<T>(asyncIterator: AsyncIterableIterator<T>): Promise<T[]> {
    const arr: T[] = [];
    for await(const i of asyncIterator) arr.push(i);
    return arr;
}
