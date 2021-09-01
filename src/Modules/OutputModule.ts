import {IModule} from "../IModule.ts";
import {Document} from "../Document.ts";





export class OutputModule implements IModule{

    constructor() {

    }

    async process(docs:Array<Document>): Promise<any> {

        for (const d of docs){
            await Deno.writeTextFile(d.path+".html", d.content);
        }

    }

}