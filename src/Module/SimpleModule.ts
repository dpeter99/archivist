import {IModule} from "./IModule.ts";
import {Content} from "../Content.ts";
import {Pipeline} from "../Pipeline.ts";


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

}
