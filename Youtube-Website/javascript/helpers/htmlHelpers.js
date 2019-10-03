

[
    "div",
    "span",
	"p",
	"a",
    "section",
    "main",
	"header",
    "form",
    "input"
].forEach((tag) => {

	// att stands for attributes. within the att object place all the attributes and attribute values you wish to set on the element
    window[tag] = function ({ classString, children, config}) {
        const newEl = document.createElement(tag);
        if (classString !== undefined) {
            newEl.className = classString
        }
        if (children !== undefined) {
            if (children[Symbol.iterator] !== undefined){
                newEl.append(...children);
            } else {
                newEl.append(children);
            }
		}
		const attributeKeys = Object.keys(arguments[0]).filter((att) => {
			return att !== "classString" && att !== "children" && att !== "config";
		});
		for (const key of attributeKeys){
			newEl.setAttribute(key, arguments[0][key]);
		}
		
		if (config !== undefined){
			config(newEl);
		}
		
		return newEl;
	}
	
});

window.text = function text(string) {
    return new Text(string);
}


window.img = function img(src){
    const newImg = document.createElement("img");
    newImg.setAttribute("src", src);
    return newImg;
}

