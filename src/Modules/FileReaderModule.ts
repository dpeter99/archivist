import {IModule} from "../Module/IModule.ts";
import {Content} from "../Content.ts";

import { expandGlob, WalkEntry } from "https://deno.land/std@0.106.0/fs/mod.ts";


export class FileReaderModule implements IModule{

    pattern: string;

    constructor(pattern: string) {
        this.pattern = pattern;
    }

    setup(): Promise<any> {
        return Promise.resolve();
    }

    async process(docs: Content[]): Promise<any> {

        for await (const file of expandGlob(this.pattern)) {
            let name = String(file.path);
            if(name.indexOf("node_modules") == -1){
                //console.log(file);

                docs.push(await Content.load(name));
            }

        }

    }

}
