import {Pipeline, Result} from "./Pipeline.ts";
import {Template} from "./Template.ts";

import * as ink from 'https://deno.land/x/ink@1.3/mod.ts';
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";

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
        let hasErrors = false;

        const wait_pre: Promise<any>[] = this.preProcessors.map(p=>{
            return p.run().then(res => {
                this.processPipelineRes(res, p, false);
                if (res.error) hasErrors = true;}
            );
        })
        await Promise.all(wait_pre);

        if (hasErrors) {
            ink.terminal.log(`<bg-red>There were errors running preprocessors.</bg-red>`)
            return;
        }

        const w: Promise<any>[] = this.pipelines.map(p=>{
            return p.run().then(res => {
                this.processPipelineRes(res, p);
            })
        });
        await Promise.all(w);


    }

    processPipelineRes(res: Result, pipeline: Pipeline, printFilesList: boolean = true) {
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
                        Draft: d.meta.draft,
                        Template: path.basename(d.metadata.Template ?? ""),
                        //State: JSON.stringify( d.meta.state),
                        //outputPath: d.meta.outputpath
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
