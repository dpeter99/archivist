
type MetadataKey = keyof Metadata;

export class Meta {
    data: Map<string, any> = new Map()

    constructor() {
        this.data.set("Author", []);
    }

    addData<T>(key: string, val: T) {
        let a: any | undefined = this.data.get(key);
        if (a !== undefined) {
            if (Array.isArray(a)) {
                this.data.set(key, [...a, val])
            } else {
                this.data.set(key, [a, val])
            }
        } else {
            this.data.set(key, val);
        }
    }

    hasData(key:string){
        return this.data.has(key);
    }

    getString(key:string):string|undefined{
        const r = this.data.get(key);
        return this.data.get(key) as string;
    }
}

export class Metadata extends Meta{


    get Title(): string | undefined {
        return this.getString("Title");
    }

    get Authors(): Author[] {
        return  this.data.get("Author") as Author[]
    }

    get Template(): string | undefined{
        return this.getString("Template");
    }

    set Template(val){
        this.data.set("Template",val);
    }
}



export class Author{
    public company?: string

    constructor(public name:string) {

    }
}


function hasKey(o:any, name:string):boolean{
    return  Object.keys(o).includes(name) != undefined;
}

function getVal(o: any, name: string) {

}
