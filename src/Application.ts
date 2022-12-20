
import { parse } from "https://deno.land/std@0.131.0/flags/mod.ts";
import {debounce, DebouncedFunction} from "https://deno.land/std@0.131.0/async/mod.ts";
import { MuxAsyncIterator } from "https://deno.land/std@0.131.0/async/mod.ts";

import {Archivist, Config} from "./Archivist.ts";

export class Application {

    archivist!: Archivist;

    async startup(conf:Config){
        const params = parse(Deno.args);
        console.dir(params);

        this.archivist = new Archivist(conf);

        if(params.watch == true){
            await this.watch();
        }
        else{
            this.archivist.run();
        }
    }


    async run(){

    }

    async watch(){

        for (const pipeline of this.archivist.pipelines) {
            const watcher = Deno.watchFs(pipeline.ContentRoot);

            new Promise(async resolve => {

                const running = null;

                const compile = new RunOnce(
                    async () => {
                        console.log("Function debounced after 200ms with %s");
                        pipeline.reset();
                        const res = await pipeline.run();
                        this.archivist.processPipelineRes(res, pipeline);
                    }
                );

                for await (const event of watcher) {
                    //console.log(">>>> event", event);
                    compile.run();
                    // Example event: { kind: "create", paths: [ "/home/alice/deno/foo.txt" ] }
                }
            })

        }

    }
}

class RunOnce {

    running?: Promise<void>;

    func: () => Promise<void>;

    constructor(
        fn: () => Promise<void>
    ) {
        this.func = fn;
    }

    run(){
        if(this.running == null){
            this.running = this.func();
            this.running.then(()=>{
                this.running = undefined;
            })
        }
    }

}



