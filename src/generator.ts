import {BufReader} from "https://deno.land/std@0.125.0/io/buffer.ts";

const dylib = Deno.dlopen("c:\\windows\\system32\\msvcrt.dll", {
    "_getch": { parameters: [], result: "i32" },
    "_getwch": { parameters: [], result: "i32" },
    "_kbhit": { parameters: [], result: "i32" },
});

while (true){
    //@ts-ignore
    let char = dylib.symbols._getwch()
    await Deno.stdout.write(new TextEncoder().encode("New Char:\n"));
    await Deno.stdout.write(new TextEncoder().encode(char.toString()+"\n"));
    await Deno.stdout.write(Uint8Array.of(char));
    await Deno.stdout.write(new TextEncoder().encode("\n"));

    if(char == 3)
        Deno.exit(0);
}



let options = [
    "A: asaaaa",
    "B: asaaaa",
    "C: asaaaa",
]

let reader = new BufReader(Deno.stdin);

do {
    writeMenu(options,0);

    let buffer = new Uint8Array(1);

    await reader.read(buffer);

    console.log(buffer);
} while (true)


async function writeMenu(options: string[], selected: number) {
    //Console.Clear();

    for (const v of options) {
        const i = options.indexOf(v);
        if (i == selected) {
            await Deno.stdout.write(new TextEncoder().encode("> "));
            //Console.Write("> ");
        } else {
            await Deno.stdout.write(new TextEncoder().encode("  "));
        }

        await Deno.stdout.write(new TextEncoder().encode(v + "\n"));
    }

}
