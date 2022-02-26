import {IModule} from "../Module/IModule.ts";
import {Content} from "../Content.ts";
import {SimpleModule} from "../Module/SimpleModule.ts";
import { Pipeline } from "../Pipeline.ts";
import {archivistInst} from "../Archivist.ts";
import {getTemplate} from "../utils/getTemplate.ts";
import {Template} from "../Template.ts";

import { delay } from "https://deno.land/std/async/mod.ts";
import { exec, OutputMode } from "https://deno.land/x/exec/mod.ts";
import os from "https://deno.land/x/dos@v0.11.0/mod.ts";
import { copy } from "https://deno.land/std@0.104.0/io/util.ts";


export class WebpackModule extends SimpleModule {

    path?:string

    template!: Template;


    constructor(path?: string) {
        super();

        this.path = path;
    }

    setup(pipeline:Pipeline, parent?:IModule): Promise<any> {
        super.setup(pipeline, parent);

        try {
            this.template = getTemplate(this.path);
        } catch (e: any) {
            this.pipeline.reportError(this, e);
        }

        return Promise.resolve();
    }

    async process(docs: Content[]): Promise<any> {

        console.group("Starting build of the template at: " + this.template.path)

        let cmd = ["npm" , "run"];
        if(archivistInst.environment == "production"){
            cmd = [...cmd,"build:prod"];
        }
        else {
            cmd = [...cmd,"build"];
        }
        if(os.platform() == "windows")
            cmd = ["cmd", "/c", ...cmd];

        const p = Deno.run({
            cmd: cmd,
            cwd: this.template.path,
            stdout: "piped",
            stderr: "piped",
        });

        copy(p.stdout, Deno.stdout);

        const { code } = await p.status();

        // Reading the outputs closes their pipes
        //const rawOutput = await p.output();
        //const rawError = await p.stderrOutput();


        if (code === 0) {
            //await Deno.stdout.write(rawOutput);
        } else {
            //await Deno.stdout.write(rawOutput);
            //const errorString = new TextDecoder().decode(rawError);
            //console.log(errorString);

        }
        p.close();

        console.groupEnd();

    }

}
