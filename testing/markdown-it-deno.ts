import markdownIt from "https://esm.sh/markdown-it";

import markdownItMultimdTable from "https://esm.sh/markdown-it-multimd-table";

//var shiftHeadings = require('markdown-it-shift-headings');
import shiftHeadings from "https://esm.sh/markdown-it-shift-headings";

//var markdownItAttrs = require('markdown-it-attrs');
import markdownItAttrs from "https://esm.sh/markdown-it-attrs";

//var markdownItAnchors = require('markdown-it-anchor');
//import markdownItAnchors from "https://esm.sh/markdown-it-anchor?no-check";
import markdownItAnchors from "https://cdn.skypack.dev/markdown-it-anchor";

import markdownItIB from "https://deno.land/x/markdown_it_ib@1.0.0/mod.js";

import {MarkdownHeadingNumbers} from "../src/utils/markdown/MarkdownHeaderNumber.ts";
import {renderPermalink} from "../src/utils/markdown/MarkdownHeaderLink.ts";
import {test} from "../src/utils/markdown/MarkdownUtils.ts";
test();

const md = markdownIt()
    .use(markdownItIB)
    .use(markdownItMultimdTable)
    .use(shiftHeadings)
    .use(markdownItAttrs,{
        // optional, these are default options
        leftDelimiter: '{',
        rightDelimiter: '}',
        allowedAttributes: []  // empty array = all attributes are allowed
    })
    /*
    .use(MarkdownHeadingNumbers,
        {shiftHeadings: 1}
    )
    */
    .use(markdownItAnchors, {
        //permalink: renderPermalink
    });

const output = md.render("*A* **B** _C_ __D__");
console.log(output);
