import {Archivist, Config} from "./Archivist.ts";

import * as fs from "https://deno.land/std@0.106.0/fs/mod.ts";
import {Application} from "./Application.ts";

export async function run(config: Config | undefined) : Promise<any> {

    if(config == undefined) {
        const confFile = Deno.cwd() + "/archivist.config.ts";
        if (!fs.existsSync(confFile)) {
            console.error("There is no config file at: '" + confFile);
        }

        let confmodule = await import("file://" + Deno.cwd() + "\\archivist.config.ts");

        if (confmodule.config == undefined) {
            console.error("The given config file does not export a 'config'");
        }

        config = confmodule.config;
    }

    //const arch: Archivist = new Archivist(config!);

    //await arch.run();

    const app = new Application();

    await app.startup(config!);

}

export let version = "0.2.0-alpha02";

export * from "./Content.ts";
export * from "./Module/SimpleModule.ts";
export * from "./Archivist.ts";
export * from "./Pipeline.ts";
export * from "./utils/ArticleHelper.ts"
export * from "./Modules/modules.ts";
