
import { basename } from "https://deno.land/std@0.106.0/path/mod.ts";

export class Content {

    name:string
    path:string
    content:string

    metadata = new Map();

    constructor(path:string, content:string) {
        this.name = basename(path);
        this.path = path;
        this.content = content;
    }

    static async load(path: string): Promise<Content>{

        // @ts-ignore
        let text = await Deno.readTextFile(path);
        text = text.replaceAll("\r\n","\n");

        let doc = new Content(path,text);

        return doc;
    }

    toString():string{
        return this.name
    }
}