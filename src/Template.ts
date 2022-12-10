import * as Path from "https://deno.land/std@0.167.0/path/mod.ts";

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

        this.path = Path.join( Deno.cwd() , path);
        const data = getTemplateData(path);

        this.matchers = data.matchers;
        this.compiledPath = Path.join( this.path , data.compiledPath);
        this.ignore= data.ignore;
        this.rootTemplate = data.rootTemplate ? Path.join(this.compiledPath , data.rootTemplate) : undefined;

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
    const packagePath = path+"/template.json";

    let conf: TemplateData|undefined = undefined;
    try{
        conf = JSON.parse( Deno.readTextFileSync(packagePath));
    }
    catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
            throw `Could not find template.json for template at: \"${packagePath}\"`;
        }
    }
    return conf!;
}
