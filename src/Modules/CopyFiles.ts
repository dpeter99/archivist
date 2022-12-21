import * as fs from "https://deno.land/std@0.115.1/fs/mod.ts";

import { regexCopy } from "https://deno.land/x/regex_copy@1.0.3/mod.ts";

import {SimpleModule} from "../Module/SimpleModule.ts";
import {Pipeline} from "../Pipeline.ts";
import {IModule} from "../Module/IModule.ts";


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
     */
    constructor(from: string, to:string, includes?: string) {
        super();
        this.from = from;
        this.to = to;
        this.includes = includes;
    }

    setup(pipeline: Pipeline, parent?: IModule): Promise<any> {
        super.setup(pipeline, parent);

        return Promise.resolve();
    }

    async process() {
        //Make sure we have a place to put the files
        fs.ensureDirSync(this.to);

        regexCopy(this.from, this.to);
    }

}

async function toArray<T>(asyncIterator: AsyncIterableIterator<T>): Promise<T[]> {
    const arr: T[] = [];
    for await(const i of asyncIterator) arr.push(i);
    return arr;
}
