import {Content} from "../Content.ts";
import {SimpleModule} from "../Module/SimpleModule.ts";

/**
 * This module is for running a simple function for each file in the
 * pipeline.
 * @example For example to set a default metadata value
 */
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
