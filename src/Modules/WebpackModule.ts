import {IModule} from "../Module/IModule.ts";
import {Content} from "../Content.ts";
import {SimpleModule} from "../Module/SimpleModule.ts";
import { Pipeline } from "../Pipeline.ts";
import {archivistInst} from "../Archivist.ts";
import {getTemplate} from "../utils/getTemplate.ts";
import {Template} from "../Template.ts";


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

        const p = Deno.run({
            cmd: [
                "npm",
                "run",
                "build"
            ],
            cwd: this.template.path,
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
