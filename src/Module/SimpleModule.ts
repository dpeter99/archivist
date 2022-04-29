import {IModule} from "./IModule.ts";
import {Content} from "../Content.ts";
import {Pipeline} from "../Pipeline.ts";
import {archivistInst} from "../Archivist.ts";

import * as path from "https://deno.land/std/path/mod.ts";

export class SimpleModule implements IModule{
    pipeline!: Pipeline;

    parent?:IModule;

    async process(docs:Array<Content>): Promise<any> {

        for (const d of docs){
            await this.processDoc(d);
        }

    }

    async processDoc(doc:Content): Promise<any>{

    }

    setup(pipeline:Pipeline, parent?:IModule): Promise<any> {
        this.parent = parent;
        this.pipeline = pipeline;

        return Promise.resolve(undefined);
    }

    public get OutputPath(){
        return this.pipeline.OutputPath;
    }

    /**
     * Returns the relative path of the file compared to the Content root
     * @param p 
     * @returns 
     */
    public getFileRelativePath(p:string):string{
       return path.relative(this.pipeline.ContentRoot,p);
    }

    public getFileOutputLoc(file:string){
        const fileRel = this.getFileRelativePath(file);
        return this.OutputPath + fileRel;
    }

}
