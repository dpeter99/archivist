import {IModule} from "./Module/IModule.ts";
import {Content} from "./Content.ts";

import * as ink from 'https://deno.land/x/ink/mod.ts'
import * as path from "https://deno.land/std@0.109.0/path/mod.ts";
import {archivistInst} from "./Archivist.ts";


export class Pipeline{

    modules: IModule[] = [];
    name:string;

    /**
     * The relative output root folder path for this pipeline
     */
    private outputPath?: string;

    /**
     * The relative content root path for this pipeline
     */
    private contentRoot: string;

    public files: Content[] =[];

    constructor(opt:Options) {
        this.name = opt.name;
        this.outputPath = opt.outputPath;
        this.contentRoot = (opt.contentRoot ?? "");
    }

    addModule(m:IModule): Pipeline{
        this.modules.push(m);
        return this;
    }

    addModules(...m:IModule[]): Pipeline{
        this.modules.push(...m);
        return this;
    }

    static fromModules(opt:Options,...m:IModule[]):Pipeline{
        return new Pipeline(opt).addModules(...m);
    }



    /**
     * Runs the setup functions of each module
     * This is done in sync.
     * @private returns if it ran successfully
     */
    private async setup():Promise<boolean>{
        for (const module of this.modules) {
            await module.setup(this);
        }
        return !this.hasErrors();
    }

    async run(): Promise<Result>{
        if(!await this.setup()){
            return new Result(true);
        }

        //let content: Content[] = [];

        for (const module of this.modules) {
            await module.process(this.files);

        }

        if(this.hasErrors()){
            return new Result(true);
        }

        return new Result(false, this.files);
    }


    public get OutputPath(){
        return path.normalize((archivistInst.outputPath ?? "") + "/" + (this.outputPath ?? ""));
    }

    public get ContentRoot(){
        return Deno.cwd() + this.contentRoot;
    }

    errors: Array<string> = new Array<string>();

    reportError(module:IModule ,text:string){
        this.errors.push(`Module: ${module.constructor.name} Error: ${text}`);
    }

    hasErrors():boolean{
        return this.errors.length > 0;
    }

    printErrors(){
        const head = ink.colorize(`<red>There was an error running ${this.name}:</red>`)
        //console.error(`There was an error running ${this.name}:`)
        console.group(head);
        for (const error of this.errors) {
            console.error(error);
        }
        console.groupEnd();
    }

}

class Options {
    public name!:string;
    public outputPath?:string;
    public contentRoot?: string

}

export class Result {
    error:boolean;
    result?: Content[];

    constructor(error: boolean, res?:Content[]) {
        this.error = error;
        this.result = res;
    }
}
