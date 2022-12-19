import {BothSides, MixedComponent, Scripts} from "../static-tsx/react-hydrate.ts";
import {React} from "../static-tsx/react.ts";

@BothSides
class ScriptTest extends MixedComponent{
    private props: { test: string };

    constructor(props: { test:string }) {
        super(props);
        this.props = props;
    }

    clickStuff(){
        alert(this.props.test);
    }

    render() {
        return <div onclick={this.clickStuff}>
            <div id="first">
                Test First div
                <div id="second">
                    Test Nested div
                </div>
            </div>
            {this.props.test}
        </div>
    }
}

@BothSides
class ScriptTest2 extends MixedComponent{
    private props: { test: string };

    constructor(props: { test:string }) {
        super(props);
        this.props = props;
    }

    render() {return <div>{this.props.test}</div>}
}

let scriptFile = "./index.js";

const root = ()=>(
<html>
<head>
    <script defer src={scriptFile}/>
</head>
<body>
    <ScriptTest test={"TestValue"}></ScriptTest>
    <div onclick={()=>alert('test')} IIFE class="asdasd">
        <div id={"asd"}>
            Test div
        </div>
        asdads
    </div>
</body>
</html>
)

let content:string = await root().toString();
//content = await htmlPrettify(content);

Deno.writeTextFile("./test.html",content)


Deno.writeTextFile(scriptFile, Scripts)

console.log(content);