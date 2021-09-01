import {Document} from "./Document.ts";


export interface IModule {

    process(docs:Document[]):Promise<any>

}

