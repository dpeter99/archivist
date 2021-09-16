import * as fs from "https://deno.land/std@0.106.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.106.0/path/mod.ts";
import * as ink from 'https://deno.land/x/ink/mod.ts'

import {SimpleModule} from "../Module/SimpleModule.ts";
import {getCompiledTemplateFolder} from "../utils/project-json-helpers.ts";


export class StaticFilesModule extends SimpleModule{

    templateFolder: string;

    constructor(templ:string) {
        super();

        this.templateFolder = getCompiledTemplateFolder(templ);
    }

    async process(){
        fs.ensureDirSync("./out");

        for await (const file of fs.expandGlob(this.templateFolder+"/**/*")) {


            if(path.extname(file.path) != ".ejs"){
                ink.terminal.log(`Starting copy of file: ${file.path}`);
                let sub = path.relative(this.templateFolder, file.path);
                let to = path.join("./out", sub);
                await fs.copy(file.path, to, { overwrite: true });
            }

        }
    }

}
