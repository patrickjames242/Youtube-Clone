

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

String.prototype.writeToDocument = function () {
    document.write(this);
};

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
