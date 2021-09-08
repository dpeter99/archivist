import {IModule} from "./IModule.ts";
import {Content} from "./Content.ts";
import {SimpleModule} from "./SimpleModule.ts";


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

    setup(parent?:IModule): Promise<any> {
        super.setup(parent);

        for (const module of this.modules) {
            module.setup(this);
        }

        return Promise.resolve(undefined);
    }



}
