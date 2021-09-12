import {IModule} from "./IModule.ts";
import {Content} from "../Content.ts";
import {SimpleModule} from "./SimpleModule.ts";
import {Pipeline} from "../Pipeline.ts";


export class CompositeModule extends SimpleModule{

    modules: IModule[] = [];

    constructor(...m: IModule[]) {
        super();

        this.modules = m;
    }

    addModules(...m:IModule[]){
        this.modules.push(...m);
    }

    process(docs: Content[]): Promise<any> {
        return Promise.resolve(undefined);
    }

    setup(pipeline:Pipeline, parent?:IModule): Promise<any> {
        super.setup(pipeline,parent);

        for (const module of this.modules) {
            module.setup(pipeline,this);
        }

        return Promise.resolve(undefined);
    }



}
