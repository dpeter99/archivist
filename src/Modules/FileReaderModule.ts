import {IModule} from "../IModule.ts";
import {Document} from "../Document.ts";

import { expandGlob, WalkEntry } from "https://deno.land/std@0.106.0/fs/mod.ts";


export class FileReaderModule implements IModule{

    pattern: string;

    constructor(pattern: string) {
        this.pattern = pattern;
    }

    async process(docs: Document[]): Promise<any> {

        for await (const file of expandGlob(this.pattern)) {
            let name = String(file.path);
            if(name.indexOf("node_modules") == -1){
                //console.log(file);

                docs.push(await Document.load(name));
            }

        }

    }

}