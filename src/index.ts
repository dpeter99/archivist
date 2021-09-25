import {Archivist, Config} from "./Archivist.ts";

import * as fs from "https://deno.land/std@0.106.0/fs/mod.ts";

const confFile = Deno.cwd() + "/archivist.config.ts";
if(!fs.existsSync(confFile)){
    console.error("There is no config file at: '" + confFile );
}

let confmodule = await import("file://"+confFile);

if(confmodule.config == undefined){
    console.error("The given config file does not export a 'config'");
}

const conf: Config = confmodule.config;

const arch: Archivist = new Archivist(conf);

arch.run();


export * from "./Archivist.ts";
export * from "./Modules/modules.ts";
