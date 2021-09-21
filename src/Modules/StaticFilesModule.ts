import * as fs from "https://deno.land/std@0.106.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.106.0/path/mod.ts";
import * as ink from 'https://deno.land/x/ink/mod.ts'

import {SimpleModule} from "../Module/SimpleModule.ts";
import {getCompiledTemplateFolder} from "../utils/project-json-helpers.ts";
import {Pipeline} from "../Pipeline.ts";
import {IModule} from "../Module/IModule.ts";
import {archivistInst} from "../Archivist.ts";
import {getTemplate} from "../utils/getTemplate.ts";
import {Template} from "../Template.ts";


export class StaticFilesModule extends SimpleModule {

    path?: string;
    template!: Template;

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

        return Promise.resolve();
    }

    async process() {
        fs.ensureDirSync("./out");

        for await (const file of fs.expandGlob(this.template.compiledPath + "/**/*")) {


            if (path.extname(file.path) != ".ejs") {
                ink.terminal.log(`Starting copy of file: ${file.path}`);
                let sub = path.relative(this.template.compiledPath, file.path);
                let to = path.join("./out", sub);
                await fs.copy(file.path, to, {overwrite: true});
            }

        }
    }

}
