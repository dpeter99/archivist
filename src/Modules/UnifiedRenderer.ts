import {unified} from 'npm:unified@10.1.2'
import {reporter} from 'npm:vfile-reporter'
import remarkParse from 'npm:remark-parse'
import remarkRehype from 'npm:remark-rehype'
//import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'npm:rehype-stringify'


import {IModule} from "../Module/IModule.ts";
import {Content} from "../Content.ts";
import {SimpleModule} from "../Module/SimpleModule.ts";
import {Pipeline} from "../Pipeline.ts";
import {swarhk} from "https://esm.sh/v99/entities@3.0.1/deno/lib/maps/entities.json.js";
import resolveLinks from "../utils/unified/resolveLinks.ts";

class Options {
    /**
     * Function to return a custom MarkdownIt instance (The supplied instance is a fresh one)
     */
    func?: ((md:any) => any);
    /**
     * Amount to shift the heading numbers by
     */
    shiftHeadersAmount?: number = 1;
    /**
     * Enable/Disable heading numbering
     */
    addHeadingNumbers?:boolean = true;
}

/**
 * This module is responsible for rendering the markdown to html. It is one of the most important modules.
 * The options currently allow you to set how the heading numbers should be calculated,or disable them completly.
 * You can also choose to provide your own MarkdownIt and configure it as you see fit.
 * Currently it has the following markdown-it plugins:
 * - markdownItMultimdTable : For md tables
 * - markdownItAttrs: custom attributes on elements
 * - MarkdownHeadingNumbers: From utils folder, to shift and display heading numbering
 * - markdownItAnchors: To display link for each heading
 */
export class UnifiedRenderer extends SimpleModule{

    private _props: Options;

    private parser:any;

    constructor(props?:Options) {
        super();
        this._props = props ?? new Options();
    }


    async setup(pipeline: Pipeline, parent?: IModule): Promise<any> {
        await super.setup(pipeline, parent);

        this.parser = unified()
            .use(remarkParse)
            .use(resolveLinks, {pipeline:this.pipeline})
            /// @ts-ignore
            .use(remarkRehype)
            /// @ts-ignore
            .use(rehypeStringify)
            ;

        return Promise.resolve();
    }



    async processDoc(doc:Content): Promise<any> {
        const res = await this.parser.process(doc.content);
        //console.error(reporter(res))
        doc.content = res;
    }

    resolveLink(link:string, env:any){

    }

    public async inlineParse(text:string){
        return await this.parser.process(text);
    }

}
