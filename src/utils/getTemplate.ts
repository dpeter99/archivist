import {archivistInst} from "../Archivist.ts";
import {Template} from "../Template.ts";


export function getTemplate(path:string|undefined) : Template {

    if(path != undefined){
        return new Template(path);
    }

    if(archivistInst.template != undefined){
        return archivistInst.template;
    }

    throw "There is no template defined"

}
