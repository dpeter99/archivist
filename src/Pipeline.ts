import {IModule} from "./Module/IModule.ts";
import {Content} from "./Content.ts";

import * as ink from 'https://deno.land/x/ink/mod.ts'


export class Pipeline{

    modules: IModule[] = [];
    name:string;

    constructor(name:string) {
        this.name = name;
    }

    addModule(m:IModule): Pipeline{
        this.modules.push(m);
        return this;
    }

    addModules(...m:IModule[]): Pipeline{
        this.modules.push(...m);
        return this;
    }

    static fromModules(name:string,...m:IModule[]):Pipeline{
        return new Pipeline(name).addModules(...m);
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

        let content: Content[] = [];

        for (const module of this.modules) {
            await module.process(content);
        }

        return new Result(false, content);
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


export class Result {
    error:boolean;
    result?: Content[];

    constructor(error: boolean, res?:Content[]) {
        this.error = error;
        this.result = res;
    }
}
