import {IModule} from "../Module/IModule.ts";
import {Content} from "../Content.ts";

import {SimpleModule} from "../Module/SimpleModule.ts";
import {headingNumbers} from "../utils/MarkdownHeaderNumber.ts";

import { createRequire } from "https://deno.land/std/node/module.ts";
import {renderPermalink} from "../utils/MarkdownHeaderLink.ts";

const require = createRequire(import.meta.url);
var MarkdownIt = require('markdown-it')
var shiftHeadings = require('markdown-it-shift-headings');
//var markdownItAutoParnum = require('markdown-it-auto-parnum')
var markdownItAttrs = require('markdown-it-attrs');
var markdownItAnchors = require('markdown-it-anchor');

import markdownItMultimdTable from "https://esm.sh/markdown-it-multimd-table"
import {Pipeline} from "../Pipeline.ts";


export class MarkdownRender extends SimpleModule{

    markdownIt:any;

    setup(pipeline:Pipeline, parent?:IModule): Promise<any> {
        super.setup(pipeline, parent);

        this.markdownIt = new MarkdownIt();
        this.markdownIt.use(markdownItMultimdTable);

        this.markdownIt.use(shiftHeadings);
        this.markdownIt.use(markdownItAttrs,{
            // optional, these are default options
            leftDelimiter: '{',
            rightDelimiter: '}',
            allowedAttributes: []  // empty array = all attributes are allowed
        })
        this.markdownIt.use(headingNumbers.MarkdownHeadingNumbers,
            {shiftHeadings: 1}
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
