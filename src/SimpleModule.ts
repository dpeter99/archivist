import {IModule} from "./IModule.ts";
import {Content} from "./Content.ts";


export class SimpleModule implements IModule{

    async process(docs:Array<Content>): Promise<any> {

        for (const d of docs){
            await this.processDoc(d);
        }

    }

    async processDoc(doc:Content): Promise<any>{

    }

    setup(): Promise<any> {
        return Promise.resolve(undefined);
    }

}