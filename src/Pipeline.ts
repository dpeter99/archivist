import {IModule} from "./IModule.ts";
import {Content} from "./Content.ts";


export class Pipeline {

    modules: IModule[] = [];

    addModule(m:IModule){
        this.modules.push(m);
    }

    async run(): Promise<Content[]>{
        let content: Content[] = [];

        for (const module of this.modules) {
            await module.process(content);
        }

        return content;
    }

}