import {Content} from "./Content.ts";


export interface IModule {

    process(docs:Content[]):Promise<any>

    setup(parent?:IModule):Promise<any>

}

