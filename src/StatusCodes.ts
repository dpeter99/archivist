

export class StatusCode{
    tag: string
    name:string
    constructor(tag:string, name:string) {
        this.tag = tag;
        this.name = name
    }
}

export class StatusCodes {

    static codes: StatusCode[] = [];

    static addStatusCode(tag:string, name:string){
        StatusCodes.codes.push(new StatusCode(tag, name));
    }

    static getLongName(tag:string){
        const s = this.codes.find((value => {
            return value.tag == tag
        }));
        if(s != undefined)
            return s.name;
        else
            return "Unknown status"
    }
}

StatusCodes.addStatusCode("ED", "Editors’ Draft" );
StatusCodes.addStatusCode("LS", "Living Standard" );
StatusCodes.addStatusCode("CR", "Candidate Recommendation Snapshot" );
StatusCodes.addStatusCode("WD", "Working Draft" );