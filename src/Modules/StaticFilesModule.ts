import * as fs from "https://deno.land/std@0.106.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.106.0/path/mod.ts";

import {SimpleModule} from "../Module/SimpleModule.ts";


export class StaticFilesModule extends SimpleModule{

    templateFolder: string;

    constructor(templ:string) {
        super();

        this.templateFolder = templ;
    }

    async process(){
        fs.ensureDirSync("./out");

        for await (const file of fs.expandGlob(this.templateFolder+"/**/*")) {


            if(path.extname(file.path) != ".ejs"){
                let sub = path.relative(this.templateFolder, file.path);
                let to = path.join("./out", sub);
                await fs.copy(file.path, to, { overwrite: true });
            }

        }
    }

}
