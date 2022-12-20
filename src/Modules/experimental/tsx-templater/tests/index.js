class MixedComponent {
        static allDescendants(node, fn) {
            for(var i = 0; i < node.children.length; i++){
                var child = node.children[i];
                this.allDescendants(child, fn);
                fn(child);
            }
        }
        static attach(ctor, element, props) {
            const component = new ctor(props);
            //@ts-ignore
            element["component"] = component;
            this.allDescendants(element, (n)=>{
                const attrs = Array.from(n.attributes);
                attrs.forEach((attr)=>{
                    const res = attr.name.match(/^bind:on(.*)/);
                    if (res) {
                        /// @ts-ignore
                        n.addEventListener(res[1], component[attr.value].bind(component));
                    }
                });
            });
        }
    }

class ScriptTest extends MixedComponent {
    props;
    constructor(props){
        super(props);
        this.props = props;
    }
    clickStuff() {
        alert(this.props.test);
    }
    render() {
        return /*#__PURE__*/ React.createElement("div", {
            onclick: this.clickStuff
        }, /*#__PURE__*/ React.createElement("div", {
            id: "first"
        }, "Test First div", /*#__PURE__*/ React.createElement("div", {
            id: "second"
        }, "Test Nested div")), this.props.test);
    }
}

class ScriptTest2 extends MixedComponent {
    props;
    constructor(props){
        super(props);
        this.props = props;
    }
    render() {
        return /*#__PURE__*/ React.createElement("div", null, this.props.test);
    }
}


 ScriptTest.attach(ScriptTest,document.getElementById("ScriptTest-1"), {"test":"TestValue"});