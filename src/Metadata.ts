
type MetadataKey = keyof Metadata;

export class Metadata {

    public Title?:string

    Author: Author[] = []

    addData(key: string, val: string){
        if(hasKey(this, key)){
            const oKey = key as MetadataKey
            let a : string | string[] = this[oKey];
            if(Array.isArray(a)){
                this[oKey] = [...a, val];
            }
            else{
                this[oKey] = [a, val];
            }
        }
        else {
            this[key] = val;
        }
    }
}

export class Author{
    constructor(public Name:string) {

    }
}


function hasKey(o:any, name:string):boolean{
    return  Object.keys(o).includes(name) != undefined;
}

function getVal(o: any, name: string) {

}
