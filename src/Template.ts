import * as fs from "https://deno.land/std@0.106.0/fs/mod.ts";
import * as Path from "https://deno.land/std@0.109.0/path/mod.ts";

export class Template{
    path: string;
    matchers: string[];
    compiledPath: string;
    ignore?: string[];
    rootTemplate?:string;

    metadata:{
        mustBeArray:string[]
    }

    constructor(path:string) {

        this.path = Deno.cwd() + path;
        const data = getTemplateData(path);

        this.matchers = data.matchers;
        this.compiledPath = this.path + data.compiledPath;
        this.ignore= data.ignore;
        this.rootTemplate = data.rootTemplate ? Path.join(this.compiledPath , data.rootTemplate) : "";

        this.metadata = {
            mustBeArray : (data.metadata?.mustBeArray ?? [])
        }
    }

}

class TemplateData {
    compiledPath!:string;
    matchers!:string[];
    ignore?:string[];
    rootTemplate?:string;
    metadata?:{
        mustBeArray?:string[]
    };
}

/**
 * extracts the data from the template.json
 * @param path
 */
export function getTemplateData(path:string):TemplateData{
    let packagePath = path+"/template.json";
    if(!fs.existsSync(packagePath)){
        //this.pipeline.reportError(this,`Could not find template.json for template at: \" ${packagePath} \"`);
        throw `Could not find template.json for template at: \"${packagePath}\"`;
    }

    let conf = JSON.parse( Deno.readTextFileSync(packagePath));

    return conf;
}
