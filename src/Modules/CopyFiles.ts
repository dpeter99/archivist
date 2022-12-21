import * as fs from "https://deno.land/std@0.115.1/fs/mod.ts";
import { copy } from "https://deno.land/std@0.115.1/fs/copy.ts";
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";
import {WalkEntry} from "https://deno.land/std@0.167.0/fs/mod.ts";
import {ensureDir} from "https://deno.land/std@0.167.0/fs/mod.ts";
import {dirname} from "https://deno.land/std@0.61.0/path/mod.ts";

import { regexCopy } from "https://deno.land/x/regex_copy@1.0.3/mod.ts";

import ProgressBar from "https://deno.land/x/progress@v1.2.4/mod.ts";

import {SimpleModule} from "../Module/SimpleModule.ts";
import {Pipeline} from "../Pipeline.ts";
import {IModule} from "../Module/IModule.ts";
import {getTemplate} from "../utils/getTemplate.ts";
import {Template} from "../Template.ts";


/**
 * This module is responsible for copying the static files of your template
 * It does this by copying every file in your templates "compiledPath" that
 * isn't matched by the "ignore" list in your template.
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
