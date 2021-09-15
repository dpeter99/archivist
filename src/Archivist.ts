import {Pipeline} from "./Pipeline.ts";
import {IModule} from "./Module/IModule.ts";
import {Content} from "./Content.ts";

import * as ink from 'https://deno.land/x/ink/mod.ts'

export let archivistInst : Archivist;

export class Archivist {

    template: string = "";
    preProcessors: Pipeline[] = [];
    pipelines: Pipeline[] = [];

    outFolder?: string

    constructor(conf: Config) {
        this.pipelines = conf.pipelines ?? [];
        this.preProcessors = conf.preProcessors ?? [];

        this.outFolder = conf.outFolder;

        archivistInst = this;
    }

    async run(){
        ink.terminal.log(`<green>Starting Archivist build</green>`)
        for (const preProcessor of this.preProcessors) {
            await preProcessor.run();
        }


        let w: Promise<any>[] = [];

        for (const pipeline of this.pipelines) {
            let pro = pipeline.run();
            pro.then(res => {

                if(res.error){
                    pipeline.printErrors();
                }
                else {
                    const docs = res.result;
                    ink.terminal.log(`<green>${pipeline.name} ran successfully on the following files: </green>`)
                    console.table(docs!.map((d)=> ({
                        name: d.name,
                        Title: d.metadata.Title,
                        Editor: d.metadata.Authors.map((v)=>{return v.Name})
                    })));
                }

            })
            w.push(pro);
        }

        await Promise.all(w);


    }

}

export class Config{
    template?: string;
    pipelines?: Pipeline[];
    preProcessors?: Pipeline[];

    outFolder?: string;
}
