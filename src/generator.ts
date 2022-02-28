import {goUp, hideCursor, showCursor} from "https://denopkg.com/iamnathanj/cursor@v2.2.0/mod.ts";
import {beginListeningToKeyboard, keyboardInput, stopListeningToKeyboard, Action} from "./utils/keypress/keypress.ts";


type HitData = ({ type: "text"; text: string; shiftPressed?: boolean; controlPressed?: boolean; altPressed?: boolean } & { code: ArrayLike<number> }) | ({ type: "control"; action: Action; controlPressed?: boolean; altPressed?: boolean } & { code: ArrayLike<number> }) | ({ type: "end of input" } & { code: ArrayLike<number> }) | ({ type: "unknown" } & { code: ArrayLike<number> });


abstract class Prompt {

    running = true;
    isDirty = false;

    question="";

    framebuffer = "";
    startline = 0;

    constructor(q:string) {
        this.question = q;
    }


    async startPrompt() {
        await hideCursor();

        this.drawFramebuffer();

        while (this.running){
            await this.printFramebuffer();

            beginListeningToKeyboard();

            const hit = (await keyboardInput().next()).value!;

            if ( hit.type == 'text' && hit.controlPressed && hit.text == 'c' ){
                this.running = false;
            }

            this.processInput(hit)

            stopListeningToKeyboard();

            this.drawFramebuffer();

        }

    }

    async printFramebuffer(){
        if(this.isDirty){
            await goUp(this.framebuffer.split("\n").length-1)
        }

        await Deno.stdout.write(new TextEncoder().encode(this.framebuffer));
        this.isDirty = true;
    }

    async finish(){
        await showCursor();
    }

    protected drawFramebuffer():void{
        this.framebuffer = "[?] " + this.question + "\n";
    }

    abstract processInput(hit: HitData):void;

}

class OptionsPrompt extends Prompt{

    selected = 0;
    get Selected() {return this.selected;}
    set Selected(val:number) {
        if(val > this.options.length-1){
            this.selected = 0;
        }
        else if(val < 0){
            this.selected = this.options.length-1;
        }
        else
            this.selected = val;
    }

    constructor(q: string, options: string[]) {
        super(q);
        this.options = options;
    }


    options = [
        "A options",
        "B options",
        "C options",
        "D options",
    ]

    protected override drawFramebuffer():void {
        super.drawFramebuffer();

        for (const v of this.options){
            const i = this.options.indexOf(v);
            if (i == this.Selected) {
                this.framebuffer += "> ";
            } else {
                this.framebuffer += "  ";
            }
            this.framebuffer += v + "\n";
        }
    }

    override processInput(hit: HitData) {

        if(hit.type == "control" && hit.action == "up"){
            this.Selected--;
        }

        if(hit.type == "control" && hit.action == "down"){
            this.Selected++;
        }

    }

}



let prompt = new OptionsPrompt("What build system do you want to use for the template?",[
    "Simple",
    "Webpack"
]);

prompt.startPrompt();
