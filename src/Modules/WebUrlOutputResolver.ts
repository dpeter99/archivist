import * as path from "https://deno.land/std@0.127.0/path/mod.ts";
import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";
import {archivistInst} from "../Archivist.ts";
import {Pipeline} from "../Pipeline.ts";
import {IModule} from "../Module/IModule.ts";


export class WebUrlOutputResolver extends SimpleModule{


    constructor() {
        super();
    }

    baseURL: string = "";

    async setup(pipeline: Pipeline, parent?: IModule): Promise<any> {
        await super.setup(pipeline, parent);
        this.baseURL = archivistInst.outputURL ?? "";
    }

// deno-lint-ignore require-await
    override async processDoc(doc: Content): Promise<any> {

        const file_name = doc.name.replace(path.extname(doc.name),"");
        const parent_dir = path.basename(path.dirname(doc.path));

        if(path.dirname(doc.path)+"\\" != this.pipeline.ContentRoot || true) {

            let new_path: string;
            //If we are the same name as the dir than we are the index file of that dir
            if (file_name == parent_dir) {
                new_path = path.dirname(doc.path) + path.sep + "index.html";
            }
            //If we are not an index file than we need to be put into a subdir and be the index of that dir
            else if(file_name != "index") {
                new_path = path.dirname(doc.path) + path.sep + file_name + path.sep + "index.html";
            }
            else{
                new_path = doc.path.replace(path.extname(doc.path),".html");
            }
            new_path = path.normalize(new_path);

            doc.metadata.addData("outputPath", new_path);

            let url = this.baseURL + "/" + this.getFileRelativePath(path.dirname(new_path))

            if(archivistInst.detailedOutput)
                console.log( this.baseURL + "  /  " + this.getFileRelativePath(path.dirname(new_path)) )

            url = url.replaceAll("\\", "/");
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
