import {Archivist, Config} from "./Archivist.ts";

import * as fs from "https://deno.land/std@0.106.0/fs/mod.ts";

export async function run(config: Config | null) : Promise<any> {

    const confFile = Deno.cwd() + "/archivist.config.ts";
    if (!fs.existsSync(confFile)) {
        console.error("There is no config file at: '" + confFile);
    }

    let confmodule = await import("file://" + Deno.cwd() + "\\archivist.config.ts");

    if (confmodule.config == undefined) {
        console.error("The given config file does not export a 'config'");
    }

    config = confmodule.config;

    const arch: Archivist = new Archivist(config!);

    await arch.run();

}

await run(null);


export let version = "0.2.0-alpha01";

export * from "./Archivist.ts";
export * from "./Pipeline.ts";
export * from "./Modules/modules.ts";
