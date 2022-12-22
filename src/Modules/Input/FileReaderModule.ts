import {IModule} from "../../Module/IModule.ts";
import {Content} from "../../Content.ts";

import { expandGlob, WalkEntry } from "https://deno.land/std/fs/mod.ts";
import {SimpleModule} from "../../Module/SimpleModule.ts";
import {Pipeline} from "../../Pipeline.ts";
import {Archivist, archivistInst} from "../../Archivist.ts";

/**
 * This is the input of most pipelines.
 * It reads a set of files defined by the pattern.
 * @example ``"./** /*.md"``
 */
export class FileReaderModule extends SimpleModule{

    pattern: string;

    /**
     *
     * @param pattern Glob pattern to read in files.
     * It is relative to the content root of the pipeline's content root
     */
    constructor(pattern: string) {
        super();
        this.pattern = pattern;
    }

    async setup(pipeline: Pipeline, parent?: IModule): Promise<any> {
        await super.setup(pipeline, parent);

        return Promise.resolve();
    }

    async process(docs: Content[]): Promise<any> {

        if(archivistInst.detailedOutput)
            console.log("Current content root is: " + this.pipeline.ContentRoot);

        for await (const file of expandGlob(this.pattern, {root: this.pipeline.ContentRoot, globstar: true})) {

            if(archivistInst.detailedOutput)
                console.log("Reading in: " + file.path);

            let name = String(file.path);
            if(name.indexOf("node_modules") == -1){
                //console.log(file);
                if(docs.find(doc=>doc.path == name) == null){
                    docs.push(await Content.load(name));
                }

            }

        }

    }

}
