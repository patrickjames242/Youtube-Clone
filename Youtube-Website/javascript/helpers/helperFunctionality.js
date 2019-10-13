
import { documentDidLoadNotification, documentBodyDidChangeNotification, executeWhenDocumentIsLoaded } from "./notifications.js";
import "../libraries/clamp.js";



// clamp functionality
(() => {
    documentDidLoadNotification.anonymousListen(() => {
        clampAllElementsToBeClamped();
    })
    
    function clampAllElementsToBeClamped() {

        const elements = document.querySelectorAll(".clamp");
    
        for (const element of elements) {
            applyClampToElement(element);
        }
    }
})();

// in order for an element to be clamped it must have the "clamp" class in its class string and its data-max-lines attribute must be set to the number of lines it wishes to be clamped by
export function applyClampToElement(element) {
    if (element.classList.contains("clamp") === false) { return; }
    const maxLines = element.dataset.maxLines;
    $clamp(element, { clamp: maxLines });
}




// unsupported feature button functionality 

(() => {

	const unsupportedFeatureButtonClass = "unsupported-feature-button";

	executeWhenDocumentIsLoaded(() => {
		document.querySelectorAll("." + unsupportedFeatureButtonClass).forEach((element) => {
			addClickListenerTo(element);
		});
	});
	
	
	documentBodyDidChangeNotification.anonymousListen((records) => {
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
			alert("Oops ☹️, this button doesn't actually do anything. It's just here for asthetic purposes.")
		});
	}

})();
