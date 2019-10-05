


import * as Help from '/javascript/helpers.js';


export default class VideoDescriptionBox {

	constructor() {
		Object.assign(this, VideoDescriptionBox._getNodes());
		this.showMoreButton.addEventListener("click", () => this._toggleDescriptionTextCollapsedState());
	}

	updateUsingVideoObject(video) {

		this.channelNameBox.innerHTML = video.channelTitle;
		this.publishDateBox.innerHTML = "Published on " + Help.getLongDateStringFrom(video.publishedAtDate);

		if (video.description.trim() !== ""){
			this.node.append(this.descriptionTextBox);
			this.descriptionTextBox.innerHTML = video.description;
			this._collapseDescriptionTextInitiallyIfNeeded();
		}

	}

	updateUsingChannelObject(channel) {
		this.subscribeButton.innerHTML = "subscribe " + Help.getShortNumberStringFrom(channel.numOfSubscribers);

		(() => {
			const channelImage = document.createElement("img");
			channelImage.setAttribute("src", channel.profileImage);
			this.channelImageBox.appendChild(channelImage);
		})();

	}


	_collapseDescriptionTextInitiallyIfNeeded() {
		if (this.descriptionTextBox.offsetHeight > 80) {
			this.node.append(this.showMoreButton);
			this._toggleDescriptionTextCollapsedState();
		}
	}


	_toggleDescriptionTextCollapsedState() {
		const showMoreButtonText = "show more";
        const showLessButtonText = "show less";
        const collapsedClass = "collapsed";

		this.descriptionTextBox.classList.toggle(collapsedClass);
		this.showMoreButton.innerHTML = (this.descriptionTextBox.classList.contains(collapsedClass)) ? showMoreButtonText : showLessButtonText;
		
	}

	static _getNodes() {
		const properties = {};

		properties.descriptionTextBox = p({ className: "description-text" });
        properties.showMoreButton = div({ className: "show-more-button uppercase-text-button"});
        
        const style = Help.getStyleElementForStyleSheetAt('/pages/video-viewer/descriptionBox/descriptionBox.css');

		properties.node = div({ className: "video-description-box underlined" }, [

            style,

			div({ className: "channel-info" }, [
				properties.channelImageBox = div({ className: "channel-image" }),
				div({ className: "text-box" }, [
					properties.channelNameBox = p({ className: "channel-name" }),
					properties.publishDateBox = p({ className: "publish-date subtitle" })
				]),
				properties.subscribeButton = div({ className: "subscribe-button unsupported-feature-button" }, [
					p({}, [text("subscribe")])
				])
			])
		]);

		return properties;
    }

}







