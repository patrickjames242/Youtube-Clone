

[
    "div",
    "span",
    "p",
    "a",
    "section",
    "main",
    "header",
    "form",
    "input",
    "img"
].forEach((tag) => {

    // att stands for attributes. within the att object place all the attributes and attribute values you wish to set on the element
    window[tag] = function ({ className }, children) {
        const newEl = document.createElement(tag);
        if (className !== undefined) {
            newEl.className = className;
        }
        if (children !== undefined) {
            if (children[Symbol.iterator] !== undefined) {
                newEl.append(...children);
            } else {
                newEl.append(children);
            }
        }
        const attributeKeys = Object.keys(arguments[0]).filter((att) => {
            return att !== "className";
        });
        for (const key of attributeKeys) {
            newEl.setAttribute(key, arguments[0][key]);
        }
        return newEl;
    }

});

window.text = function text(string) {
    return new Text(string);
}



export function getStyleElementForStyleSheetAt(url){
    const el = document.createElement("style");
    el.textContent = `@import '${url}';`;
    return el;
}

