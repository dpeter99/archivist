import * as fs from "https://deno.land/std@0.106.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.106.0/path/mod.ts";
import * as ink from 'https://deno.land/x/ink/mod.ts'

import { MultiProgressBar } from "https://deno.land/x/progress@v1.2.4/mod.ts";


import {SimpleModule} from "../Module/SimpleModule.ts";
import {getCompiledTemplateFolder} from "../utils/project-json-helpers.ts";
import {Pipeline} from "../Pipeline.ts";
import {IModule} from "../Module/IModule.ts";
import {archivistInst} from "../Archivist.ts";
import {getTemplate} from "../utils/getTemplate.ts";
import {Template} from "../Template.ts";
import { WalkEntry } from "https://deno.land/std@0.106.0/fs/mod.ts";


export class StaticFilesModule extends SimpleModule {

    path?: string;
    template!: Template;

    outputPath!: string;

    constructor(templ?: string) {
        super();

        this.path = templ;
    }

    setup(pipeline: Pipeline, parent?: IModule): Promise<any> {
        super.setup(pipeline, parent);

        try {
            this.template = getTemplate(this.path);
        } catch (e: any) {
            this.pipeline.reportError(this, e);
        }

        this.outputPath = "./out" + (this.pipeline.outputPath ?? "")

        return Promise.resolve();
    }

    async process() {
        fs.ensureDirSync(this.outputPath);

        let files: WalkEntry[] = await toArray(fs.expandGlob(this.template.compiledPath + "/**/*"));
        files = files.filter(file => path.extname(file.path) != ".ejs");

        let maxFileNameLength: number = files.map(value => path.basename(value.path).length).reduce((p, c) => Math.max(p,c));

        const bars = new MultiProgressBar({
            title:"Copy files",
            // clear: true,
            complete: '=',
            incomplete: '-',
            display: '[:bar] :percent :time :completed/:total :text',
            width: 150,
        });

        let completed1 = 0;

        for (const file of files) {

            if (path.extname(file.path) != ".ejs") {
                let sub = path.relative(this.template.compiledPath, file.path);
                let to = path.join(this.outputPath, sub);
                await fs.copy(file.path, to, {overwrite: true});
                completed1++;
                await bars.render([{
                    completed: completed1,
                    total:files.length,

                    text: path.basename(file.path).padEnd(maxFileNameLength," "),
                }])
            }
            else {
                console.log(`Hmm: ${file.path}\n`)
            }
        }
        console.log("\n");
    }

}

async function toArray<T>(asyncIterator:AsyncIterableIterator<T>):Promise<T[]>{
    const arr :T[] = [];
    for await(const i of asyncIterator) arr.push(i);
    return arr;
}
