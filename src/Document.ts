
import { basename } from "https://deno.land/std@0.106.0/path/mod.ts";

export class Document {

    name:string
    path:string
    content:string

    constructor(path:string, content:string) {
        this.name = basename(path);
        this.path = path;
        this.content = content;
    }

    static async load(path: string): Promise<Document>{

        // @ts-ignore
        const text = await Deno.readTextFile(path);

        let doc = new Document(path,text);

        return doc;
    }

    toString():string{
        return this.name
    }
}