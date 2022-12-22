import { copy, copySync } from "https://deno.land/std@0.115.1/fs/copy.ts";
import * as path from "https://deno.land/std/path/mod.ts";

import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";

/**
 * @deprecated Use CopyFiles
 * This is a simple copy module that copies files to the output folder
 * Useful for ``static`` folders where you might keep images that are not directly referenced in your MD files
 * For files directly ref-ed in MD files use the @see {@link ExtractResources} module.
 *
 * The options are:
 * - source: string - The folder from witch to copy this is relative to the cwd
 * - target?: string - The target (optional) the FULL path of the target. If not specified than it is calculated automatically.
 */
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

        const targ = this.target ?? this.getFileOutputLoc(path.join(Deno.cwd() , this.source));

        try {
            copySync(this.source, targ);
        }
        catch (e){
          console.error(e);
        }

    }
}
