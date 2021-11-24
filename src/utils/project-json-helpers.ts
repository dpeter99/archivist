
import * as fs from "https://deno.land/std@0.114.0/fs/mod.ts";

/**
 * extracts the data from the template.json
 * @param path
 * @deprecated should not be used
 */
export function getCompiledTemplateFolder(path:string):string{
    let packagePath = path+"/template.json";
    if(!fs.existsSync(packagePath)){
        //this.pipeline.reportError(this,`Could not find template.json for template at: \" ${packagePath} \"`);
        throw `Could not find package.json for template at: \" ${packagePath} \"`;
    }

    let conf = JSON.parse( Deno.readTextFileSync(packagePath));

    if(conf.out != undefined){
        return path + conf.out;
    }

    return path;
}
