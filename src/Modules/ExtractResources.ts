import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";

import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import * as fs from "https://deno.land/std@0.109.0/fs/mod.ts"
import * as path from "https://deno.land/std@0.109.0/path/mod.ts";

/**
 * This Module extracts resources that are referenced in the doc and
 * copies them to the output folder into the correct path
 * Currently this only scans img tags!
 */
export class ExtractResources extends SimpleModule{

    async process(docs: Content[]): Promise<any> {

        let filewait = [];

        for (const doc of docs) {
            await super.processDoc(doc);

            const htmlDom = new DOMParser().parseFromString(doc.content, "text/html")!;

            let files: string[] = [];

            htmlDom.querySelectorAll("img")!.forEach((e) => {
                if (e instanceof Element) {
                    const a: Element = <Element>e;
                    files.push(a.getAttribute("src")!);
                }
                //console.log(e);
            });

            for (const file of files) {
                const p = path.dirname(doc.path) + "/" + file;

                if (fs.existsSync(p)) {
                    const targetPath = this.getFileOutputLoc(p);

                    fs.ensureDirSync(path.dirname(targetPath));

                    let prom = fs.copy(p, targetPath).then(value => {

                    });

                    filewait.push(prom);
                }
            }
        }

        await Promise.all(filewait);

    }
}
