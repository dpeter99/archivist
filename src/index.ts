import {Archivist, Config} from "./Archivist.ts";

export function run(config:any) {

    const arch: Archivist = new Archivist(config);

    arch.run();

}


export let version = "0.1.0-alpha02";

export * from "./Archivist.ts";
export * from "./Pipeline.ts";
export * from "./Modules/modules.ts";
