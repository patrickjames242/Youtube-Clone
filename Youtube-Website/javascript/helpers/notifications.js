

export default class Notification {

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

		this.anonymousListen = function(listener){
			this.listen(Symbol(), listener);
		}

		this.removeListener = function (sender) {
			delete listeners[sender];
		}
	}
}

// posted whenever the dom is finished loading
export const documentDidLoadNotification = new Notification();

// posted whenever the body or any of its decendents is added or removed. when posted, it includes the array of MutationRecord objects in the parameter.
export const documentBodyDidChangeNotification = new Notification();


// posted whenever the size of the window changes
export const windowSizeDidChangeNotification = new Notification();

(() => {
	window.onresize = () => {
		windowSizeDidChangeNotification.post();
	};
})();


(() => {
	let shouldPostDocumentDidLoadNotificaiton = true;

	document.addEventListener("readystatechange", () => {
		if (shouldPostDocumentDidLoadNotificaiton === false ||
			document.readyState === "loading") { return; }
		shouldPostDocumentDidLoadNotificaiton = false;
		documentDidLoadNotification.post();
	});
})()



export function executeWhenDocumentIsLoaded(action) {
	if (document.readyState === "loading") {
		const symbol = Symbol("notification")
		documentDidLoadNotification.listen(symbol, () => {
			action();
			documentBodyDidChangeNotification.removeListener(symbol);
		});
	} else {
		action();
	}
}

executeWhenDocumentIsLoaded(() => {
	const observer = new MutationObserver((records) => {
		documentBodyDidChangeNotification.post(records);
	});
	observer.observe(document.body, { childList: true, subtree: true });
})

