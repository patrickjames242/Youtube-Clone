



const videoID = (new URL(window.location)).searchParams.get("videoID");


(() => {

	const ytPlayerScript = document.createElement("script");
	ytPlayerScript.setAttribute("src", "https://www.youtube.com/iframe_api");
	document.head.appendChild(ytPlayerScript);

	var player;
	function onYouTubeIframeAPIReady() {
		player = new YT.Player('player', {
			height: '100%',
			width: '100%',
			videoId: videoID,
			events: {
				'onReady': onPlayerReady,
			}
		});
	}

	window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

	function onPlayerReady(event) {
		// player.playVideo();
	}

})();









/// RECOMMENDED VIDEO SECTION POSITION ADJUSTMENT CODE

(() => {

	documentDidLoadNotification.listen(Symbol(), () => {
		setUpRecommendedVideosPositionCode();
	});


	let recommendedVideosSection;


	// called when the DOM is loaded
	function setUpRecommendedVideosPositionCode() {
		recommendedVideosSection = document.querySelector(".recommended-videos-section");
		moveRecomendedVideosIfNeeded(window.innerWidth);
		updateRecommendedVideosClasses();
		window.onresize = () => {
			moveRecomendedVideosIfNeeded(window.innerWidth);
		};
	}

	let previousWindowWidth;

	function moveRecomendedVideosIfNeeded(currentWidth) {
		if (currentWidth === previousWindowWidth) { return; }

		if (currentWidth <= 750) {
			moveRecommendedVideosTo(recVideosPosition.BOTTOM);
		} else {
			moveRecommendedVideosTo(recVideosPosition.RIGHT_SIDE);
		}

		previousWindowWidth = currentWidth;

	}

	const recVideosPosition = {
		RIGHT_SIDE: "RIGHT_SIDE",
		BOTTOM: "BOTTOM",
	}

	function moveRecommendedVideosTo(position) {
		if (currentRecommendedVideosPosition() === position) { return; }

		switch (position) {
			case recVideosPosition.RIGHT_SIDE:
				document.querySelector(".video-section").after(recommendedVideosSection);
				break;

			case recVideosPosition.BOTTOM:
				document.querySelector(".video-description-box").after(recommendedVideosSection);
				break;
		}
		updateRecommendedVideosClasses();
	}

	function currentRecommendedVideosPosition() {

		const parentHasClass = (className) => {
			return recommendedVideosSection.parentElement.classList.contains(className);
		};

		if (parentHasClass("sections-holder")) {
			return recVideosPosition.RIGHT_SIDE;
		} else if (parentHasClass("video-section")) {
			return recVideosPosition.BOTTOM;
		} else {
			throw new Error('could not determine currentRecommendedVideosPosition');
		}
	}

	function updateRecommendedVideosClasses() {

		const whenOnBottom_class = "recommended-videos-section-whenOnBottom";
		const whenOnSide_class = "recommended-videos-section-whenOnSide";

		recommendedVideosSection.classList.remove(whenOnSide_class, whenOnBottom_class);
		switch (currentRecommendedVideosPosition()) {

			case recVideosPosition.RIGHT_SIDE:
				recommendedVideosSection.classList.add(whenOnSide_class);
				break;

			case recVideosPosition.BOTTOM:
				recommendedVideosSection.classList.add(whenOnBottom_class);
				break;
		}
	}
})();














/// YOTUUBE API DATA FETCHING AND DISPLAYING



(() => {
	documentDidLoadNotification.listen(Symbol(), () => {
		fetchAndDisplayYoutubeData();
	});

	function fetchAndDisplayYoutubeData() {

		getVideoObjectForVideoID(videoID, (callback) => {
			if (callback.status !== NetworkResponse.successStatus) { return; }
			const video = callback.result;
			updateUIWithVideoInfo(video);

			getChannelForChannelID(video.channelID, (callback2) => {
				if (callback2.status !== NetworkResponse.successStatus) { return; }
				const channel = callback2.result;

				updateUIWithChannelInfo(channel);
			});
		});

		getCommentsForVideoWithVideoID(videoID, 30, (callback) => {
			if (callback.status !== NetworkResponse.successStatus) { return; }
			const comments = callback.result;
			updateUIWithComments(comments);
		});

		getRecommendedVideosForVideoWithVideoID(videoID, 25, (callback) => {
			if (callback.status !== NetworkResponse.successStatus) { return; }
			const videos = callback.result;
			updateUIWithRecommendedVideos(videos);
		});

	}

	function updateUIWithVideoInfo(video) {
		document.querySelector(".video-description-box .description-text").innerHTML = video.description;
		document.querySelector(".video-title-box .watch-on-youtube-link").setAttribute("href", "https://youtube.com/watch?v=" + video.id);
		document.querySelector(".video-section .video-title-box .title").innerHTML = video.title;
		document.querySelector(".video-description-box .channel-info .publish-date").innerHTML = "Published on " + getLongDateStringFrom(video.publishedAtDate);
		document.querySelector(".video-section .video-title-box .views").innerHTML = getLongNumberStringFrom(video.numOfViews) + " views";
		document.querySelector(".video-reviews .num-of-comments").innerHTML = getLongNumberStringFrom(video.numOfComments) + " Comments";
		document.querySelector(".video-description-box .channel-info .channel-name").innerHTML = video.channelTitle;
		document.querySelector(".video-title-box .like-dislike-box .likes .num").innerHTML = getShortNumberStringFrom(video.numOfLikes);
		document.querySelector(".video-title-box .like-dislike-box .dislikes .num").innerHTML = getShortNumberStringFrom(video.numOfDislikes);
	}

	function updateUIWithChannelInfo(channel) {
		document.querySelector(".video-description-box .channel-info .subscribe-button").innerHTML = "subscribe " + getShortNumberStringFrom(channel.numOfSubscribers);
		(function () {
			const channelImage = document.createElement("img");
			channelImage.setAttribute("src", channel.profileImage);
			document.querySelector(".video-description-box .channel-info .channel-image").appendChild(channelImage);
		})();
	}

	function updateUIWithComments(comments) {
		const commentBoxes = comments.map((comment) => new CommentBox(comment));
		const nodes = commentBoxes.map((box) => box.node);
		document.querySelector(".video-reviews").append(...nodes);
	}

	function updateUIWithRecommendedVideos(videos) {
		const recommendedVideoBoxesHTML = videos.map((video) => getRecommendedVideoBoxFor(video)).join("");
		document.querySelector(".recommended-videos-section").innerHTML += recommendedVideoBoxesHTML;
		document.querySelectorAll(".recommended-video-box .clamp").forEach((element) => applyClampToElement(element));
	}
})();













// DESCRIPTION TEXT EXPANDING AND COLLAPSING CODE


function toggleDescriptionTextCollapsedState() {

	const showMoreButton = document.querySelector(".video-description-box .show-more-button");
	const descriptionTextElement = document.querySelector(".video-description-box .description-text");

	const showMoreButtonText = "show more";
	const showLessButtonText = "show less";

	const collapsedClass = "collapsed"

	descriptionTextElement.classList.toggle(collapsedClass);

	showMoreButton.innerHTML = (descriptionTextElement.classList.contains(collapsedClass)) ? showMoreButtonText : showLessButtonText
}





class CommentBox {

	constructor(comment) {
		this.comment = comment;
		this.isCurrentlyFetchingReplies = false;
		this.node = this._getNewNodeForComment(comment);
		this._configureViewRepliesButton();
		this._addDocumentBodyDidChangeListener();
	}

	_addDocumentBodyDidChangeListener(){
		const bodyDidChangeSymbol = Symbol("comment box observer");

		documentBodyDidChangeNotification.listen(bodyDidChangeSymbol, (records) => {
			for (const record of records){
				for (const addedNode of record.addedNodes){
					if (addedNode === this || addedNode.contains(this.node)){
						this._collapseCommentTextIfNeeded();
						documentBodyDidChangeNotification.removeListener(bodyDidChangeSymbol);
					}
				}
			}
		});
	}

	_getNewNodeForComment(comment){

		const node = div({classString: "user-comment-box", children: [
			div({classString: "profile-image", children: [
				img(comment.authorProfileImageURL)
			]}),
			div({classString: "right-content", children: [
				p({classString: "top-text", children: [
					span({classString: "name", children: [
						text(comment.authorName)
					]}),
					span({classString: "time subtitle", children: [
						text(getTimeSinceDateStringFrom(comment.publishedAtDate))
					]})
				]}),

				this.reviewTextBox = p({classString: "review-text", children: [
					...parseHTMLFrom(comment.text)
				]}),

				this.readMoreButton = p({classString: "read-more-button button"}),

			 	div({classString: "like-dislike-buttons", children: [
					div({classString: "like-button like-dislike-button unsupported-feature-button", children: [
						...parseHTMLFrom(SVGIcons.likeButton())
					]}),
					div({classString: "num-of-likes", children: [
						text(getShortNumberStringFrom(comment.numOfLikes))
					]}),
					div({classString: "dislike-button like-dislike-button unsupported-feature-button", children: [
						...parseHTMLFrom(SVGIcons.dislikeButton())
					]}),
					p({classString: "reply-button uppercase-text-button unsupported-feature-button", children: [
						text("reply")
					]})
				]}),

				this.viewRepliesButton = div({classString: "view-replies-button button"}),

				this.repliesBox = div({classString: "replies-box", children: [

					this.loadingIndicatorBox = div({classString: "replies-loading-indicator-box", children: [
						div({classString: "loading-indicator"})
					]}),

					this.repliesHolder = div({classString: "replies-holder"})
				]})
			]})
		]});

		this.readMoreButton.isHidden = true;
		this.loadingIndicatorBox.isHidden = true;
		this.repliesBox.isHidden = true;

		return node;
	}

	_collapseCommentTextIfNeeded() {
		if (this.reviewTextBox.clientHeight >= 80) {
			this.readMoreButton.isHidden = false;
			this._toggleCommentCollapsedState();
			this.readMoreButton.addEventListener("click", () => {
				this._toggleCommentCollapsedState();
			});
		}
	}

	_configureViewRepliesButton() {
		const numOfReplies = this.comment.numOfReplies;
		if (numOfReplies < 1) { return; }

		this.viewRepliesButton.isHidden = false;
		this.viewRepliesButton.addEventListener("click", () => {
			this._toggleRepliesBoxVisibility();
		});

		this.viewRepliesButton.innerHTML = this._viewRepliesExpandButtonText;
	}

	_toggleCommentCollapsedState() {
		const readMoreText = "Read more";
		const readLessText = "Read less";
		const collapsedClass = "collapsed";

		this.reviewTextBox.classList.toggle(collapsedClass);
		this.readMoreButton.innerHTML = this.reviewTextBox.classList.contains(collapsedClass) ? readMoreText : readLessText
	}

	get _viewRepliesExpandButtonText() {
		const numOfReplies = this.comment.numOfReplies;
		if (numOfReplies === 1) {
			return String.raw`View reply`;
		} else {
			const replyCountString = getLongNumberStringFrom(numOfReplies);
			return String.raw`View all ${replyCountString} replies`;
		}
	}

	get _viewRepliesCollapseButtonText() {
		return "Hide replies";
	}

	_toggleRepliesBoxVisibility() {
		this.repliesBox.toggleIsHidden();
		this.viewRepliesButton.innerHTML = this.repliesBox.isHidden ? this._viewRepliesExpandButtonText : this._viewRepliesCollapseButtonText;
		this._fetchAndDisplayRepliesIfNeeded();
	}


	_fetchAndDisplayRepliesIfNeeded(){
		const hasLoadedReplies = this.repliesHolder.children.length !== 0;
		
		if (hasLoadedReplies === false &&
			this.isCurrentlyFetchingReplies === false) {
			
			this.loadingIndicatorBox.isHidden = false;
			this.isCurrentlyFetchingReplies = true
			getRepliesToCommentWithCommentID(this.comment.id, (callback) => {
				this.loadingIndicatorBox.isHidden = true;
				this.isCurrentlyFetchingReplies = false;
				if (callback.status === NetworkResponse.failureStatus) { return; }
				this._setRepliesTo(callback.result);
			});
		}
	}

	_setRepliesTo(comments) {
		const commentBoxes = comments.map((comment) => new CommentBox(comment))
		const newCommentNodes = commentBoxes.map((box) => box.node);
		this.repliesHolder.append(...newCommentNodes);
		
	}


}
