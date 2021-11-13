import {IModule} from "../Module/IModule.ts";
import {Content} from "../Content.ts";

import {SimpleModule} from "../Module/SimpleModule.ts";

import MarkdownIt from "https://esm.sh/markdown-it";
import markdownItMultimdTable from "https://esm.sh/markdown-it-multimd-table";
import markdownItAttrs from "https://esm.sh/markdown-it-attrs";
import markdownItAnchors from "https://cdn.skypack.dev/markdown-it-anchor";
import markdownItIB from "https://deno.land/x/markdown_it_ib@1.0.0/mod.js";
import markdownItCheckbox from "https://cdn.skypack.dev/@gerhobbelt/markdown-it-checkbox"
import markdownItContainer from 'https://cdn.skypack.dev/markdown-it-container';

import {MarkdownHeadingNumbers} from "../utils/markdown/MarkdownHeaderNumber.ts";
import {renderPermalink} from "../utils/markdown/MarkdownHeaderLink.ts";



import {Pipeline} from "../Pipeline.ts";

class Options {
    /**
     * Function to return a custom MarkdownIt instance (The supplied instance is a fresh one)
     */
    func?: ((md:typeof MarkdownIt) => typeof MarkdownIt);
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

        if(this._props.func != undefined){
            this.markdownIt = this._props.func(this.markdownIt);
        }
        else {
            this.markdownIt.use(markdownItMultimdTable);
            this.markdownIt.use(markdownItCheckbox,{readonly: true, disabled: true});
            this.markdownIt.use(markdownItContainer, 'warning');
            this.markdownIt.use(markdownItAttrs, {
                // optional, these are default options
                leftDelimiter: '{',
                rightDelimiter: '}',
                allowedAttributes: []  // empty array = all attributes are allowed
            })
            this.markdownIt.use(MarkdownHeadingNumbers,
                {
                    shiftHeadings: this._props.shiftHeadersAmount,
                    addNumbers: this._props.addHeadingNumbers
                }
            );
            this.markdownIt.use(markdownItAnchors, {
                permalink: renderPermalink
            });
        }
        return Promise.resolve();
    }



    async processDoc(doc:Content): Promise<any> {

        //doc.content = marked(doc.content);
        doc.content = this.markdownIt.render(doc.content);
    }

}
