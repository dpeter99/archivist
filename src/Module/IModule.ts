import {Content} from "../Content.ts";
import {Pipeline} from "../Pipeline.ts";


export interface IModule {

    process(docs:Content[]):Promise<any>

    setup(pipeline:Pipeline, parent?:IModule):Promise<any>

}

