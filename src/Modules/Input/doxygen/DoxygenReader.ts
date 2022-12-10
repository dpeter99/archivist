import { expandGlob } from "https://deno.land/std@0.167.0/fs/mod.ts";
import * as Path from "https://deno.land/std@0.167.0/path/mod.ts";
import { Parser, Node } from 'https://deno.land/x/xmlparser@v0.2.0/mod.ts'

import {IModule} from "../../../Module/IModule.ts";
import {Content} from "../../../Content.ts";
import {SimpleModule} from "../../../Module/SimpleModule.ts";
import {Pipeline} from "../../../Pipeline.ts";
import {archivistInst} from "../../../Archivist.ts";


/**
 * This module reader in code documentation from a folder containing Doxygen XML files.
 */
export class DoxygenReader extends SimpleModule{

    docPath: string;

    refMap: Map<string,any> = new Map<string, any>();

    constructor(doc_path: string) {
        super();
        this.docPath = doc_path;
    }

    async setup(pipeline: Pipeline, parent?: IModule): Promise<any> {
        await super.setup(pipeline, parent);

        if(!Path.isAbsolute(this.docPath))
            this.docPath = Path.join(this.pipeline.ContentRoot,this.docPath);

        return Promise.resolve();
    }

    async process(docs: Content[]): Promise<any> {

        if(archivistInst.detailedOutput)
            console.log("Doc root is: " + this.docPath);

        const arser = new Parser({
            reflectAttrs: false,
            reflectValues: false,
        });

        for await (const file of expandGlob(this.docPath,{root:this.pipeline.ContentRoot})) {

            if(archivistInst.detailedOutput)
                console.log("Reading in: " + file.path);

            if(file.isDirectory)
                continue;

            const name = String(file.path);

            let text = await Deno.readTextFile(name);

            const patter = /<briefdescription>([\S\s]*?)<\/briefdescription>/gm
            text = text.replaceAll(patter,(match, text)=>"<briefdescription><![CDATA[" + text + "]]></briefdescription>" );

            const patter2 = /<type>([\S\s]*?)<\/type>/gm
            text = text.replaceAll(patter2,(match, text)=>"<type><![CDATA[" + text + "]]></type>" );


            const data = arser.parse(text);

            const doxyfile = data.children[0];

            doxyfile.children.forEach(child => {
                if(child.tag == "compounddef")
                    docs.push(...this.parseCompounddef(child));
            });
        }

        docs.forEach(doc=>{
            const data = doc.meta["code:data"];

            this.eachRecursive(data,(obj, key)=>{
                if(obj[key] !== undefined && typeof obj[key] === "string")
                    obj[key] = this.resolveRef(obj[key]);
            })
        })

    }

    eachRecursive(obj:any, clk:(obj:any,key:string)=>void)
    {
        for (var k in obj) {
            if (typeof obj[k] == "object" && obj[k] !== null)
                this.eachRecursive(obj[k], clk);
            else
                clk(obj, k);
        }
    }

    resolveRef(text:string){
        const pattern = /<ref refid="(?<ref>.*?)" kindref="(?<kind>.*?)">(?<text>[\S\s]*?)<\/ref>/gm
        return text.replaceAll(pattern,(_match,ref,_kind,text)=>{
            return "[" + text + "](" + (this.refMap.get(ref) ?? "") + ")";
        });
    }

    parseCompounddef(node:Node){
        const docs:Content[] = [];

        if(node.attr["kind"] == "class"){
            const name :string = <string> node.getChildren("compoundname")[0].value;

            const doc = new Content("doc/"+name.replaceAll("::","/")+".class", "");
            this.addRef(node, "/"+doc.path);

            const desc :string = <string> node.getChildren("briefdescription")[0].value;

            const members = node.getChildren("sectiondef").flatMap(sec=>sec.getChildren("memberdef")).map(n=>{
                return {
                    name: n.getChildren("name")[0]?.value ?? "",
                    kind: n.getAttr("kind"),
                    visibility: n.getAttr("prot"),
                    static: n.getAttr("static"),
                    brief: n.getChildren("briefdescription")[0].value != 0 ? n.getChildren("briefdescription")[0].value : "",
                    type: n.getChildren("type")[0]?.value,
                }
            })

            const data = {
                kind: "class",
                desc,
                members,
            };

            //console.log(data);

            doc.metadata.addData("name", name);
            doc.metadata.addData("code:data", data);



            docs.push(doc);
        }

        return docs;
    }

    addRef(node:Node, value:any){
        this.refMap.set(<string>node.getAttr("id"),value);
    }

}
