import {Component, DocType, Props, React} from "../static-tsx/react.ts";
import {Element} from "../lib.dom.d.ts";

export let Scripts = "";

type Constructor<T> = new (...params: any[]) => T;

function markFunctions<T>(constructor: Constructor<T>) {

    const keys = Reflect.ownKeys(constructor.prototype);
    keys.forEach(key =>{
        if(typeof constructor.prototype[key] === "function"){
            constructor.prototype[key]["parent"] = constructor.prototype;
            console.log(key)
        }
    });

}

export function BothSides(constructor: Constructor<any>) {
    markFunctions(constructor);
    Scripts += constructor.toString() + "\n\n";
}
export function ClientSide(constructor: Constructor<any>) {
    markFunctions(constructor);
    Scripts += constructor.toString() + "\n\n";
}

export abstract class MixedComponent extends Component{
    private _props: Props;

    constructor(props:Props) {
        super();
        this._props = props;
    }

    static idMap : { [index: string]: number } = {
        "ScriptTest": 1
    }

    static getNextID(constructor: string): number{
        if(this.idMap[constructor])
            return this.idMap[constructor]++;

        this.idMap[constructor] = 0;
        return 0

    }

    async stringify(type: DocType): Promise<string> {
        const construct = Object.getPrototypeOf(this).constructor.name;
        let ID = `${construct}-${MixedComponent.getNextID(construct)}`;

        let props = JSON.stringify(this._props);


        Scripts += `\n ${construct}.attach(${construct},document.getElementById("${ID}"), ${props});`

        return `<${construct.toString()} id="${ID}">
            ${await super.stringify(type)}
        </${construct.toString()}>
        `
    }
}

namespace ClientLib{

    @ClientSide
    class MixedComponent {
        static allDescendants (node: Element, fn: (n:Element)=>void) {
            for (var i = 0; i < node.children.length; i++) {
                var child = node.children[i];
                this.allDescendants(child, fn);
                fn(child);
            }
        }

        static attach<T>(ctor:new (props:Props)=>T, element: Element, props: Props){
            const component = new ctor(props);

            //@ts-ignore
            element["component"] = component;

            this.allDescendants(element, (n)=>{
                const attrs = Array.from(n.attributes)
                attrs.forEach(attr=>{
                    const res = attr.name.match(/^bind:on(.*)/);
                    if(res) {
                        /// @ts-ignore
                        n.addEventListener(res[1], component[attr.value].bind(component));
                    }
                });
            });
        }
    }
}