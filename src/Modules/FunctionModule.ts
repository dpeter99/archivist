import {Content} from "../Content.ts";
import {SimpleModule} from "../Module/SimpleModule.ts";


export class FunctionModule extends SimpleModule{

    func : (doc:Content) => Promise<void>;

    constructor(fn:(doc:Content) => Promise<void>) {
        super();
        this.func= fn;
    }


    async processDoc(doc: Content): Promise<any> {
        return this.func(doc);
    }
}
