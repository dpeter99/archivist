import {IModule} from "../Module/IModule.ts";
import {Content} from "../Content.ts";
import {SimpleModule} from "../Module/SimpleModule.ts";
import { Pipeline } from "../Pipeline.ts";


export class WebpackModule extends SimpleModule {

    templateFolder: string;

    constructor(path: string) {
        super();
        this.templateFolder = Deno.cwd() + path;
    }

    setup(pipeline:Pipeline, parent?:IModule): Promise<any> {

        return Promise.resolve();
    }

    async process(docs: Content[]): Promise<any> {

        console.group("Starting build of the template at: " + this.templateFolder)

        const p = Deno.run({
            cmd: [
                "cmd",
                "/c",
                "npm",
                "run",
                "build"
            ],
            cwd: this.templateFolder,
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
