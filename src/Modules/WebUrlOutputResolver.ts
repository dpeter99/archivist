import * as path from "https://deno.land/std@0.127.0/path/mod.ts";
import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";
import {archivistInst} from "../Archivist.ts";


export class WebUrlOutputResolver extends SimpleModule{


    constructor() {
        super();
    }


    // deno-lint-ignore require-await
    override async processDoc(doc: Content): Promise<any> {

        const file_name = doc.name.replace(path.extname(doc.name),"");
        const parent_dir = path.basename(path.dirname(doc.path));

        if(path.dirname(doc.path)+"\\" != this.pipeline.ContentRoot) {

            let new_path = doc.path;
            if (file_name == parent_dir) {
                new_path = path.dirname(doc.path) + path.sep + "index.html";
            } else if(file_name != "index") {
                new_path = path.dirname(doc.path) + path.sep + file_name + path.sep + "index.html";
            }
            else{
                new_path = doc.path.replace(path.extname(doc.path),".html");
            }
            doc.metadata.addData("outputPath", new_path);

            let url = archivistInst.outputURL + "/" + this.getFileRelativePath(path.dirname(new_path))
            url = url.replace("\\", "/");
            doc.metadata.addData("url",url);

            //console.log(new_path);
        }
        else{
            let new_path = doc.path.replace(path.extname(doc.path),".html");
            doc.metadata.addData("outputPath", new_path);
        }
        //Domain / .. / .. / name
    }

}
