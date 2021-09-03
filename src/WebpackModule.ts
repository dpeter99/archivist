import {IModule} from "./IModule.ts";
import {Content} from "./Content.ts";


export class WebpackModule implements IModule{
    setup(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async process(docs: Content[]): Promise<any> {

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

    }
    
}