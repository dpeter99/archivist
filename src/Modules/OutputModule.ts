import {IModule} from "../IModule.ts";
import {Content} from "../Content.ts";


export class OutputModule implements IModule{

    constructor() {

    }

    async process(docs:Array<Content>): Promise<any> {

        for (const d of docs){
            await Deno.writeTextFile(d.path+".html", d.content);
        }

    }

}