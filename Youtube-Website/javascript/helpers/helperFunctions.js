


export async function addStyleSheetToDocument(url) {
	const link = document.createElement("link");
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("href", url);

	const promise = new Promise((success) => {
		link.onload = () => {
			success();
		};
	});
	
	document.head.append(link);
	return promise;
}

export function getLinkToVideoViewerFile(videoID) {
	return `/pages/video-viewer/video-viewer.html?videoID=${videoID}`;
}


// returns null if no elements where found in the string, otherwise returns a node list 
export function parseHTMLFrom(string) {
	const domParser = new DOMParser();
	const html = domParser.parseFromString(string, "text/html");
	const result = html.body.childNodes;
	if (result.length >= 1) {
		return result;
	} else {
		throw "invalid html";
	}
}

export function appendDuplicatesOf(elementSelectorString, numOfDuplicates) {
	const element = document.querySelector(elementSelectorString);
	for (i = 1; i < numOfDuplicates; i++) {
		const clone = element.cloneNode(true);
		element.parentElement.append(clone);
	}
}

// returns the date as a string with the format 'January 4, 2019'
export function getLongDateStringFrom(date) {
	return date.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// returns the number as a string with the format 2,323,100.1002
export function getLongNumberStringFrom(number) {
	return Number(number).toLocaleString("en-US", { style: "decimal" });
}

// returns the number as a string with the format 100 or 10K or 10M or 10B
export function getShortNumberStringFrom(number) {
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

export function getTimeSinceDateStringFrom(date) {

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


// the callback is executed when any pixel of the element appears on screen after not being visible. The callback is ONLY EXECUTED ONCE, then never again.
export function setUpPaginationObserverOn(element, callback) {
	let observer;
	const observerCallback = (items) => {
		if (items[0].isIntersecting) {
			observer.disconnect();
			callback();
		}
	};
	observer = new IntersectionObserver(observerCallback, { threshold: 0 });
	observer.observe(element);
	return observer;
}


Array.prototype.includesWhere = function(predicate){
	for (const item of this){
		if (predicate(item) === true){return true;}
	}
	return false;
}


// returns true if the elements of both iterable objects are equal
function compareIterableContent(i1, i2) {
	if (i1[Symbol.iterator] === undefined ||
		i2[Symbol.iterator] === undefined) {
		return false
	};

	if (i1.length !== undefined && i2.length !== undefined) {
		if (i1.length !== i2.length) {
			return false;
		}
	}

	for (let i = 0; i < i1.length; i++) {
		if (i1[i] !== i2[i]){
			return false;
		}
	}

	return true;

}
