
export function interpolate(text:string, scope:any){

   return text.replace(/[$]{(.+?)}/g, (match, group1) => lookup(scope, group1))

}

function lookup(obj:any, path:string) {
    let ret = obj
    for (const part of path.split(".")) {
        ret = ret[part]
    }
    return ret
}
