export class Style {
    static combinators = [' ', '>', '~', '+', '|']
    styles: { [index: string]: any } | string

    constructor(styles: { [index: string]: any } | string | Style) {
        if (styles instanceof Style) {
            this.styles = styles.styles
        } else {
            this.styles = styles
        }
    }

    toString() {
        const styles = this.styles
        if (typeof styles === 'string') return styles
        return Object.keys(styles)
            .map(k => (styles[k] instanceof Object ? '' : `${k}:${styles[k]}`))
            .filter(Boolean)
            .join(';')
    }

    toSheetString() {
        const styles = this.styles
        if (typeof styles === 'string') return {str: styles, rem: []}
        const rem: { selector: string; sheet: any }[] = []
        const str = Object.keys(styles)
            .map(k => {
                if (styles[k] instanceof Object) {
                    rem.push({selector: k, sheet: styles[k]})
                } else {
                    return `${k}:${styles[k]}`
                }
            })
            .filter(Boolean)
            .join(';')
        return {str, rem}
    }
}