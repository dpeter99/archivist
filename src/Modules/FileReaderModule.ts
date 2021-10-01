import {IModule} from "../Module/IModule.ts";
import {Content} from "../Content.ts";

import { expandGlob, WalkEntry } from "https://deno.land/std/fs/mod.ts";
import {SimpleModule} from "../Module/SimpleModule.ts";
import {Pipeline} from "../Pipeline.ts";


export class FileReaderModule extends SimpleModule{

    pattern: string;

    constructor(pattern: string) {
        super();
        this.pattern = pattern;
    }

    async setup(pipeline: Pipeline, parent?: IModule): Promise<any> {
        await super.setup(pipeline, parent);

        return Promise.resolve();
    }

    async process(docs: Content[]): Promise<any> {

        for await (const file of expandGlob(this.pattern,{root:this.pipeline.ContentRoot})) {

            let name = String(file.path);
            if(name.indexOf("node_modules") == -1){
                //console.log(file);

                docs.push(await Content.load(name));
            }

        }

    }

}
