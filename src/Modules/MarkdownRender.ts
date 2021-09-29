import {IModule} from "../Module/IModule.ts";
import {Content} from "../Content.ts";

import {SimpleModule} from "../Module/SimpleModule.ts";

import MarkdownIt from "https://esm.sh/markdown-it";
import markdownItMultimdTable from "https://esm.sh/markdown-it-multimd-table";
//import shiftHeadings from "https://esm.sh/markdown-it-shift-headings";
import markdownItAttrs from "https://esm.sh/markdown-it-attrs";
import markdownItAnchors from "https://cdn.skypack.dev/markdown-it-anchor";
import markdownItIB from "https://deno.land/x/markdown_it_ib@1.0.0/mod.js";
import {MarkdownHeadingNumbers} from "../utils/markdown/MarkdownHeaderNumber.ts";
import {renderPermalink} from "../utils/markdown/MarkdownHeaderLink.ts";

import {Pipeline} from "../Pipeline.ts";

class Options {
    func?: ((md:typeof MarkdownIt) => typeof MarkdownIt);
    shiftHeadersAmount: number = 1;
}

export class MarkdownRender extends SimpleModule{

    markdownIt:any;
    private _props: Options;

    constructor(props?:Options) {
        super();
        this._props = props ?? new Options();

    }


    setup(pipeline:Pipeline, parent?:IModule): Promise<any> {
        super.setup(pipeline, parent);

        this.markdownIt = new MarkdownIt();
        this.markdownIt.use(markdownItMultimdTable);

        //this.markdownIt.use(shiftHeadings);
        this.markdownIt.use(markdownItAttrs,{
            // optional, these are default options
            leftDelimiter: '{',
            rightDelimiter: '}',
            allowedAttributes: []  // empty array = all attributes are allowed
        })
        this.markdownIt.use(MarkdownHeadingNumbers,
            {shiftHeadings: this._props.shiftHeadersAmount}
        );
        this.markdownIt.use(markdownItAnchors, {
            permalink: renderPermalink
        });

        return Promise.resolve();
    }



    async processDoc(doc:Content): Promise<any> {

        //doc.content = marked(doc.content);
        doc.content = this.markdownIt.render(doc.content);
    }

}
