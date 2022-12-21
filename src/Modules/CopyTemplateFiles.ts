import * as fs from "https://deno.land/std@0.115.1/fs/mod.ts";
import { copy } from "https://deno.land/std@0.115.1/fs/copy.ts";
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";
import {WalkEntry} from "https://deno.land/std@0.167.0/fs/mod.ts";
import {ensureDir} from "https://deno.land/std@0.167.0/fs/mod.ts";
import {dirname} from "https://deno.land/std@0.61.0/path/mod.ts";

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
export class CopyTemplateFiles extends SimpleModule {
    path?: string;
    template!: Template;

    constructor(templ?: string) {
        super();
        this.path = templ;
    }

    setup(pipeline: Pipeline, parent?: IModule): Promise<any> {
        super.setup(pipeline, parent);

        try {
            //Get this or default template
            this.template = getTemplate(this.path);
        } catch (e: any) {
            this.pipeline.reportError(this, e);
        }

        return Promise.resolve();
    }

    async process() {
        //Make sure we have a place to put the files
        fs.ensureDirSync(this.OutputPath);

        let files: WalkEntry[] = await toArray(fs.expandGlob(this.template.compiledPath + "/**/*"));

        files = files.filter(file => {
            let include = !this.template.ignore?.some(i => {
                const reg = path.globToRegExp(i)

                let m = path.relative(this.template.compiledPath, file.path).match(reg);
                let ignore = m != null;

                return ignore;
            });

            include = include && file.isFile;

            return include;
        })

        const progress = new ProgressBar({
            title: "Copy files:",
            total: files.length
        });

        let completed1 = 0;

        for (const file of files) {

            let sub = path.relative(this.template.compiledPath, file.path);
            let to = path.join(this.OutputPath, sub);
            try {
                await ensureDir(dirname(to));
                await copy(file.path, to, {overwrite: true});
            }
            catch (e) {
                this.pipeline.reportError(this, "Copping: " + file.path + " to: " + to)
                console.error(e);
            }
            completed1++;
            await progress.render(completed1);
        }
    }

}

async function toArray<T>(asyncIterator: AsyncIterableIterator<T>): Promise<T[]> {
    const arr: T[] = [];
    for await(const i of asyncIterator) arr.push(i);
    return arr;
}
