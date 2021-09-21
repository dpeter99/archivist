import * as fs from "https://deno.land/std@0.106.0/fs/mod.ts";

export class Template{
    path: string;
    matchers: string[];
    compiledPath: string;

    constructor(path:string) {

        this.path = Deno.cwd() + path;
        const data = getTemplateData(path);

        this.matchers = data.matchers;
        this.compiledPath = data.compiledPath;
    }

}

class TemplateData {
    compiledPath!:string;
    matchers!:string[];
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
