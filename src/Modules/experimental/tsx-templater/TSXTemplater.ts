import {SimpleModule} from "../../../Module/SimpleModule.ts";
import {Content} from "../../../Content.ts";
import {ArticleHelper} from "../../../utils/ArticleHelper.ts";
import {Component} from "./static-tsx/react.ts";

export class Experimental_TSXTemplater extends SimpleModule {
    private root: Component;

    constructor(root: Component) {
        super();
        this.root = root;
    }

    async processDoc(doc: Content): Promise<any> {
        await super.processDoc(doc);
        let helper = new TSXHelper(doc.path,this);

        //let root = (await import("./template/root.tsx")).root;

        let page_root = this.root(doc, helper);

        doc.content = await page_root.toString();
    }
}

export class TSXHelper extends ArticleHelper{
    public getPipeline(){ return this["module"].pipeline; }

    /**
     * Returns true if the given file is under the current file in the folder structure
     * @param f
     */
    public static subArticle(p:string, f:Content): boolean{
        const fPath = f.meta.url.replaceAll("\\", "/");

        if(p.includes("EntitySystem") && f.path.includes("EntitySystem")) debugger;

        return fPath.startsWith(p);
    }

}
