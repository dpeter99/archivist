import {IModule} from "./IModule.ts";
import {Content} from "./Content.ts";


export class SimpleModule implements IModule{

    parent?:IModule;

    async process(docs:Array<Content>): Promise<any> {

        for (const d of docs){
            await this.processDoc(d);
        }

    }

    async processDoc(doc:Content): Promise<any>{

    }

    setup(parent?:IModule): Promise<any> {
        this.parent = parent;

        return Promise.resolve(undefined);
    }

}
