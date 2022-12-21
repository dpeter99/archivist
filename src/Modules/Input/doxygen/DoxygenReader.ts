import { expandGlob } from "https://deno.land/std@0.167.0/fs/mod.ts";
import * as Path from "https://deno.land/std@0.167.0/path/mod.ts";
import { Parser, Node, unescapeEntity } from 'https://deno.land/x/xmlparser@v0.2.0/mod.ts'

import {IModule} from "../../../Module/IModule.ts";
import {Content} from "../../../Content.ts";
import {SimpleModule} from "../../../Module/SimpleModule.ts";
import {Pipeline} from "../../../Pipeline.ts";
import {archivistInst} from "../../../Archivist.ts";

export type Declaration = {
    kind: string,
    brief: string,
    detail: string,
}

export type Class = Declaration & {
    $kind: "class",
    kind: "class",
    members: Declaration[],
}

export type MemberKind = "function" | "variable";

export type MemberBase = Declaration & {
    name: string,
    visibility: string,
    static: string,
    type: string,
}

export type Varaible = MemberBase & {
    $kind: "variable",
    kind: "variable",
};

export type Function = MemberBase & {
    $kind: "function",
    kind: "function",
    argsstring: string,
}

export type Other = MemberBase & {
    $kind: "other",
    kind: Exclude<string, MemberKind>
}

export type Member = Function | Varaible | Other;

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

            text = this.addCdataToTag(text, "briefdescription");
            text = this.addCdataToTag(text, "detaileddescription");
            text = this.addCdataToTag(text, "type");


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

    private addCdataToTag(text: string, tag:string) {
        const patter2 = "<"+tag+">([\\S\\s]*?)<\\/"+tag+">";

        const regex = new RegExp(patter2,"gm");
        return text.replaceAll(regex, (_match, text) => "<"+tag+"><![CDATA[" + text + "]]></"+tag+">");
    }

    eachRecursive(obj:any, clk:(obj:any,key:string)=>void) {
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
            this.addRef(node, doc.path);

            const members: Member[] = node.getChildren("sectiondef").flatMap(sec=>sec.getChildren("memberdef")).map(n=>{
                const base = {
                    kind: this.getAttribData(n, "kind"),
                    name: this.getChildData(n,"name"),
                    brief: this.getChildData(n, "briefdescription"),
                    detail: this.getChildData(n, "detaileddescription"),
                    visibility: this.getAttribData(n, "prot"),
                    static: this.getAttribData(n, "static"),
                    type: this.getChildData(n, "type"),
                }
                if(base.kind === "function"){
                    return {
                        ...base,
                        kind: "function",
                        $kind:"function",
                        argsstring: this.getChildData(n, "argsstring"),
                    }
                }
                if(base.kind === "variable"){
                    return {
                        ...base,
                        kind:"variable",
                        $kind:"variable",
                    }
                }
                return {
                    ...base,
                    $kind: "other",
                };

                throw new Error("Unknown class sub declaration: " + base.kind);
            })

            const data : Class = {
                $kind: "class",
                kind: "class",
                brief: this.getChildData(node, "briefdescription"),
                detail: this.getChildData(node, "detaileddescription"),
                members,
            };

            doc.metadata.addData("name", name);
            doc.metadata.addData("code:data", data);
            doc.metadata.addData("type","docs");

            docs.push(doc);
        }

        return docs;
    }

    addRef(node:Node, value:any){
        this.refMap.set(<string>node.getAttr("id"),value);
    }

    getChildData(node:Node, tag:string, removeWhitspace=false, ifNull = ""){
        let val = <string>node.getChildren(tag)[0]?.value ?? ifNull;
        return this.sanitize(val, removeWhitspace);
    }

    getAttribData(node:Node, attr:string, removeWhitspace=false, ifNull = ""){
        let val = <string>node.getAttr(attr) ?? ifNull;
        return this.sanitize(val, removeWhitspace);
    }

    private sanitize(val: string, removeWhitspace: boolean) {
        //val = unescapeEntity(val, {});
        if (removeWhitspace)
            val = val.replaceAll(" ", "");

        val = val.replace(/<para>/gm, "");
        val = val.replace(/<\/para>/gm, "\n\n");

        return val;
    }
}
