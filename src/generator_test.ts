import { goHome, goUp } from "https://denopkg.com/iamnathanj/cursor@v2.2.0/mod.ts";

import { keyboardInput, beginListeningToKeyboard, stopListeningToKeyboard } from "./utils/keypress/keypress.ts";


let framebuffer = "";

const options = [
    "A: asaaaa",
    "B: asaaaa",
    "C: asaaaa",
]

let selected = 0;

await writeMenu(options,selected);

do {

    beginListeningToKeyboard();

    const hit = (await keyboardInput().next()).value!;

    if(hit.type == "control" && hit.action == "up"){
        selected = selected - 1 < 0 ? options.length-1 : selected-1;
    }

    if(hit.type == "control" && hit.action == "down"){
        selected = selected + 1 > options.length-1 ? 0 : selected+1;
    }

    stopListeningToKeyboard();

    await clearScreen();

    await writeMenu(options,selected);

} while (true)


async function writeMenu(options: string[], selected: number) {
    //Console.Clear();
    framebuffer = "";

    for (const v of options){
        const i = options.indexOf(v);
        if (i == selected) {
            framebuffer += "> ";
        } else {
            framebuffer += "  ";
        }
        framebuffer += v + "\n";
    }

    await Deno.stdout.write(new TextEncoder().encode(framebuffer));
}

async function clearScreen() {
    await goUp(framebuffer.split("\n").length-1)
}
