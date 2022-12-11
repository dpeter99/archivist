import {visit} from 'npm:unist-util-visit'
import {Pipeline} from "../../Pipeline.ts";

export type Config = {
    pipeline: Pipeline;
}

export default function myRemarkPluginToIncreaseHeadings(config: Config) {



    return (tree:any, file:any) => {
        visit(tree, (node:any) => {
            //console.log(node);
            if (node.type === 'link') {
                debugger;
                node.url = config.pipeline.files.find(c=>c.path == node.url)?.meta.url ?? node.url;

            }
        })
    }
}