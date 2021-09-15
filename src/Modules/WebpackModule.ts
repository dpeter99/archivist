import {IModule} from "../Module/IModule.ts";
import {Content} from "../Content.ts";
import {SimpleModule} from "../Module/SimpleModule.ts";
import { Pipeline } from "../Pipeline.ts";

import {Deno} from "../utils/deno.d.ts";


export class WebpackModule extends SimpleModule {

    templateFolder: string;

    constructor(path: string) {
        super();
        this.templateFolder = path;
    }

    setup(pipeline:Pipeline, parent?:IModule): Promise<any> {

        return Promise.resolve();
    }

    async process(docs: Content[]): Promise<any> {

        console.group("Starting build of the template")

        const p = Deno.run({
            cmd: [
                "cmd",
                "/c",
                "npm",
                "run",
                "build"
            ],
            cwd: "C:\\Users\\dpete\\Documents\\Programing\\Archivist\\template",
            stdout: "piped",
            stderr: "piped",

        });

        const { code } = await p.status();

        // Reading the outputs closes their pipes
        const rawOutput = await p.output();
        const rawError = await p.stderrOutput();

        if (code === 0) {
            await Deno.stdout.write(rawOutput);
        } else {
            const errorString = new TextDecoder().decode(rawError);
            console.log(errorString);
        }

        console.groupEnd();

    }

}
