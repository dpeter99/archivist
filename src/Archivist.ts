import {Pipeline, Result} from "./Pipeline.ts";
import {IModule} from "./Module/IModule.ts";
import {Content} from "./Content.ts";

import * as ink from 'https://deno.land/x/ink/mod.ts';
import * as path from "https://deno.land/std@0.114.0/path/mod.ts";
import {Template} from "./Template.ts";

export let archivistInst: Archivist;

export class Archivist {

    template?: Template | undefined;
    preProcessors: Pipeline[] = [];
    pipelines: Pipeline[] = [];

    /**
     * The relative output path
     */
    outputPath?: string

    /**
     * The top level of the output URL
     * This is not necessary
     */
    outputURL?: string

    /**
     * Option to get detailed output info useful for debugging
     */
    detailedOutput: boolean;

    environment: "development" | "production";

    constructor(conf: Config) {
        this.pipelines = conf.pipelines ?? [];
        this.preProcessors = conf.preProcessors ?? [];

        this.outputPath = conf.outputPath;
        this.outputURL = conf.outputURL;

        if(conf.template){
            try {
                this.template = new Template(conf.template);
            }
            catch (e) {
                ink.terminal.log(`<bg-red>Error:${e}</bg-red>`)
            }
        }

        this.detailedOutput = conf.detailedOutput;

        this.environment = conf.env;


        archivistInst = this;
    }

    /**
     * Runs the build process
     * Steps:
     * 1. It runs each preprocessor in async
     * 2. It runs each main pipeline in async.
     */
    async run() {
        ink.terminal.log(`<green>Starting Archivist build</green>`)
        let hasErrors: boolean = false;

        let wait_pre: Promise<any>[] = [];
        for (const preProcessor of this.preProcessors) {
            let pro = preProcessor.run();
            wait_pre.push(pro);

            pro.then(res => {
                this.processPipelineRes(res, preProcessor, false);
                if (res.error) hasErrors = true;
            })
        }

        await Promise.all(wait_pre);

        if (hasErrors) {
            ink.terminal.log(`<bg-red>There were errors running preprocessors.</bg-red>`)
            return;
        }

        let w: Promise<any>[] = [];

        for (const pipeline of this.pipelines) {
            let pro = pipeline.run();
            pro.then(res => {

                this.processPipelineRes(res, pipeline);

            })
            w.push(pro);
        }

        await Promise.all(w);


    }

    private processPipelineRes(res: Result, pipeline: Pipeline, printFilesList: boolean = true) {
        if (res.error) {
            pipeline.printErrors();
        } else {
            const docs = res.result;
            if (printFilesList) {
                ink.terminal.log(`<green>${pipeline.name} ran successfully on the following files: </green>`)
                if (this.detailedOutput) {

                    for (const doc of docs!) {
                        console.log(doc);
                    }

                } else {
                    console.table(docs!.map((d) => ({
                        name: d.name,
                        Title: d.metadata.Title,
                        //Editor: d.metadata.Authors.map((v)=>{return v.Name}),
                        Template: path.basename(d.metadata.Template ?? ""),
                        State: JSON.stringify( d.meta.state)
                    })));
                }
            } else {
                ink.terminal.log(`<green>${pipeline.name} ran successfully</green>`)
            }
        }
    }
}

export class Config {
    template?: string;
    pipelines?: Pipeline[];
    preProcessors?: Pipeline[];

    outputPath?: string;
    outputURL?: string;

    detailedOutput: boolean = false;

    env: "development" | "production"  = "development";
}
