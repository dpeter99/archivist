import * as fs from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";


export class CopyModule extends SimpleModule{

    source: string;
    target?:string;

    constructor(opts:{source:string, target?:string}) {
        super();

        this.source = opts.source;
        this.target = opts.target;
    }


    async process(docs: Array<Content>): Promise<any> {
        super.process(docs);

        const targ = this.target ?? this.getFileOutputLoc(Deno.cwd() + this.source);

        fs.copySync(this.source,targ);

    }
}
