
document.addEventListener("readystatechange", (event) => {
	if (document.readyState !== "interactive") { return; }
	clampAllElementsToBeClamped();
});

function getLinkToVideoViewerFile(videoID){
	return String.raw`video-viewer.html?videoID=${videoID}`;
}

/// requires that the html file has imported the clamp.js file as a script
function clampAllElementsToBeClamped() {
	if (window.$clamp === undefined) { return; }

	const elements = document.querySelectorAll(".clamp");

	for (const element of elements) {
		applyClampToElement(element);
	}
}


Function.prototype.getCachedProperty = function(name, getter){
	const value = this[name];
	if (value === undefined || value === null){
		const newValue = getter();
		this[name] = newValue;
		return newValue;
	} else {
		return value;
	}
};

Node.prototype.flatten = function(){

	function getAllDecendentsOf(node){
		if (node.children.length <= 0){
			return null;
		} else {
			let resultArray = [];
			for (child of node.children){
				resultArray[resultArray.length] = child;
				const decendents = getAllDecendentsOf(child);
				if (decendents !== null){
					for (decendent of decendents){
						resultArray[resultArray.length] = decendent;
					}
				}
			}
			return resultArray;
		}
	}

	return getAllDecendentsOf(this);
}


// returns null if no elements where found in the string, otherwise returns a node list 
function parseHTMLFrom(string){
	const domParser = new DOMParser();
	const html = domParser.parseFromString(string, "text/html");
	const result = html.body.childNodes;
	if (result.length < 1){
		return null;
	} else {
		return result;
	}
}



function applyClampToElement(element) {
	if (window.$clamp === undefined) { return; }
	if (element.classList.contains("clamp") === false) { return; }
	const maxLines = element.dataset.maxLines;
	$clamp(element, { clamp: maxLines });
}

function appendDuplicatesOf(elementSelectorString, numOfDuplicates) {
	const element = document.querySelector(elementSelectorString);
	for (i = 1; i < numOfDuplicates; i++) {
		const clone = element.cloneNode(true);
		element.parentElement.append(clone);
	}
}

// returns the date as a string with the format 'January 4, 2019'
function getLongDateStringFrom(date) {
	return date.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// returns the number as a string with the format 2,323,100.1002
function getLongNumberStringFrom(number) {
	return Number(number).toLocaleString("en-US", { style: "decimal" });
}

// returns the number as a string with the format 100 or 10K or 10M or 10B
function getShortNumberStringFrom(number) {
	number = Math.round(number);

	if (number < 1000) {
		return String(number);
	}

	function round(number) {
		return Number((number > 10) ? number.toFixed(0) : number.toFixed(1));
	}

	const numOfThousands = round(number / 1000);
	const numOfMillions = round(number / 1000000);
	const numOfBillions = round(number / 1000000000);

	if (numOfThousands < 1000) {
		return String(numOfThousands) + "K";
	} else if (numOfMillions < 1000) {
		return String(numOfMillions) + "M";
	} else {
		return String(numOfBillions) + "B";
	}
}

function getTimeSinceDateStringFrom(date) {

	const seconds = Math.round((new Date() - date) / 1000);

	if (seconds >= -61 && seconds <= 59) {
		return "just now";
	}

	function Unit(text, amount, threshold) {
		this.text = text; this.amount = amount; this.threshold = threshold;
	}

	const units = [
		new Unit("minute", seconds / 60, 60),
		new Unit("hour", seconds / 60 / 60, 24),
		new Unit("day", seconds / 60 / 60 / 24, 7),
		new Unit("week", seconds / 60 / 60 / 24 / 7, 5),
		new Unit("month", seconds / 60 / 60 / 24 / 30, 12),
		new Unit("year", seconds / 60 / 60 / 24 / 365, -1)
	];

	const lastUnit = units[units.length - 1];

	for (const unit of units) {
		const val = Math.round(unit.amount);

		if (val < unit.threshold || unit.text === lastUnit.text) {
			return String(val) + " " + unit.text + ((val === 1) ? "" : "s") + " ago";
		}
		
	}

	throw new Error("Should return before it breaks out of the forloop. Check the logic.");
}


class Notification {

	constructor() {
		let listeners = {};

		this.post = function () {
			for (const sender of Object.getOwnPropertySymbols(listeners)) {
				listeners[sender](...arguments);
			}
		}

		this.listen = function (sender, listener) {
			if (typeof listener !== "function") {
				throw new Error("the listener must be a function!!")
			}
			listeners[sender] = listener;
		}

		this.removeListener = function(sender){
			delete listeners[sender];
		}

	}

}

// posted whenever the dom is finished loading
const documentDidLoadNotification = new Notification();

// posted whenever the body or any of its decendents is added or removed. when posted, it includes the array of MutationRecord objects in the parameter.
const documentBodyDidChangeNotification = new Notification();


document.addEventListener("readystatechange", () => {
	if (document.readyState !== "interactive") { return; }
	documentDidLoadNotification.post();
});


(() => {

	const unsupportedFeatureButtonClass = "unsupported-feature-button"

	documentDidLoadNotification.listen(Symbol(), () => {
		document.querySelectorAll("." + unsupportedFeatureButtonClass).forEach((element) => {
			addClickListenerTo(element);
		});
		const observer = new MutationObserver((records) => {
			documentBodyDidChangeNotification.post(records);
		});
		observer.observe(document.body, { childList: true, subtree: true });

	});

	documentBodyDidChangeNotification.listen(Symbol(), (records) => {
		records.forEach((record) => {
			record.addedNodes.forEach(function check(node){
				if ((node instanceof Element) === false){return;}
				if (node.classList.contains(unsupportedFeatureButtonClass)){
					addClickListenerTo(node);
				} else {
					for (const child of node.childNodes){
						check(child);
					}
				}
			});
		});
	});

	function addClickListenerTo(element) {
		element.addEventListener("click", () => {
			alert("Oops ☹️, you're trying to use a feature I didn't feel like implementing. Don't judge me! I'm a busy man!")
		});
	}

})();




(() => {
	const hiddenClass = "hidden";

	// hides element by adding and removing the 'hidden' class
	Object.defineProperty(Element.prototype, "isHidden", {
		get: function(){
			return this.classList.contains(hiddenClass);
		}, 
		set: function(newValue){
			if (newValue === true){
				this.classList.add(hiddenClass);
			} else {
				this.classList.remove(hiddenClass);
			}
		}
	})

	Element.prototype.toggleIsHidden = function(){
		this.isHidden = !this.isHidden;
	}

})();


[
    "div",
    "span",
    "p",
    "section",
    "main",
    "header"
].forEach((tag) => {
    window[tag] = function ({ classString, children }) {
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
        return newEl;
    }
});

function text(string) {
    return new Text(string);
}

function img(src){
    const newImg = document.createElement("img");
    newImg.setAttribute("src", src);
    return newImg;
}