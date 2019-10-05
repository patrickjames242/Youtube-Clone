

import CommentBox from './CommentBox.js';
import * as Help from '../../javascript/helpers.js';
import * as YTHelpers from '../../javascript/youtube-api.js';
import NetworkResponse from '../../javascript/helpers/NetworkResponse.js';
import { SVGIcons } from '../../javascript/helpers/svg-icons.js';



const videoID = (new URL(window.location)).searchParams.get("videoID");


Help.executeWhenDocumentIsLoaded(() => {
	Help.addHeaderToDocument();
	addLikeAndDislikeIconsToPage();
});


function addLikeAndDislikeIconsToPage() {
	document.querySelector(".video-title-box .bottom-right-content-box .like-dislike-box .likes .icon").append(...Help.parseHTMLFrom(SVGIcons.likeButton()));
	document.querySelector(".video-title-box .bottom-right-content-box .like-dislike-box .dislikes .icon").append(...Help.parseHTMLFrom(SVGIcons.dislikeButton()));
}



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

	let recommendedVideosSection;

	let previousWindowWidth;

	const recVideosPosition = {
		RIGHT_SIDE: "RIGHT_SIDE",
		BOTTOM: "BOTTOM",
	}

	Help.executeWhenDocumentIsLoaded(() => {
		setUpRecommendedVideosPositionCode();
	})


	// called when the DOM is loaded
	function setUpRecommendedVideosPositionCode() {
		recommendedVideosSection = document.querySelector(".recommended-videos-section");
		moveRecomendedVideosIfNeeded(window.innerWidth);
		updateRecommendedVideosClasses();
		window.onresize = () => {
			moveRecomendedVideosIfNeeded(window.innerWidth);
		};
	}



	function moveRecomendedVideosIfNeeded(currentWidth) {
		if (currentWidth === previousWindowWidth) { return; }

		if (currentWidth <= 750) {
			moveRecommendedVideosTo(recVideosPosition.BOTTOM);
		} else {
			moveRecommendedVideosTo(recVideosPosition.RIGHT_SIDE);
		}

		previousWindowWidth = currentWidth;

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

	const reviewsLoadingIndicator = div({
		className: "loading-indicator-box"}, [
			div({ className: "loading-indicator" })
		]
	);
	const recommendedVideosLoadingIndicator = reviewsLoadingIndicator.cloneNode();

	Help.executeWhenDocumentIsLoaded(() => {
		fetchAndDisplayYoutubeData();
	});


	function fetchAndDisplayYoutubeData() {

		YTHelpers.getVideoObjectForVideoID(videoID, (callback) => {
			if (callback.status !== NetworkResponse.successStatus) { return; }
			const video = callback.result;
			updateUIWithVideoInfo(video);

			YTHelpers.getChannelForChannelID(video.channelID, (callback2) => {
				if (callback2.status !== NetworkResponse.successStatus) { return; }
				const channel = callback2.result;

				updateUIWithChannelInfo(channel);
			});
		});

		fetchAndDisplayAdditionalCommentsForVideo();


		YTHelpers.getRecommendedVideosForVideoWithVideoID(videoID, 25, (callback) => {
			if (callback.status !== NetworkResponse.successStatus) { return; }
			const videos = callback.result;
			updateUIWithRecommendedVideos(videos);
		});

	}

	function fetchAndDisplayAdditionalCommentsForVideo(nextPageToken) {
		const videoReviewsBox = document.querySelector(".video-reviews");
		videoReviewsBox.append(reviewsLoadingIndicator);
		YTHelpers.getCommentsForVideoWithVideoID({videoID: videoID, numberOfComments: 20, completion: (callback) => {
			reviewsLoadingIndicator.remove();
			if (callback.status !== NetworkResponse.successStatus) { return; }

			const commentBoxes = callback.result.itemList.map((comment) => new CommentBox(comment));
			const nextPageToken = callback.result.nextPageToken;

			const nodes = commentBoxes.map((box) => box.node);
			videoReviewsBox.append(...nodes);
			const lastCommentBoxNode = nodes[nodes.length - 1];
			setUpPaginationObserverForComment(lastCommentBoxNode, nextPageToken);
		}});
	}

	function setUpPaginationObserverForComment(lastCommentBox, nextPageToken) {
		let observer;
		const observerCallback = (items) => {

			if (items[0].isIntersecting) {
				observer.disconnect();
				fetchAndDisplayAdditionalCommentsForVideo(nextPageToken);
			}
		};
		observer = new IntersectionObserver(observerCallback, { threshold: 0 });
		observer.observe(lastCommentBox);
	}


	function updateUIWithVideoInfo(video) {
		document.querySelector(".video-description-box .description-text").innerHTML = video.description;
		document.querySelector(".video-title-box .watch-on-youtube-link").setAttribute("href", "https://youtube.com/watch?v=" + video.id);
		document.querySelector(".video-section .video-title-box .title").innerHTML = video.title;
		document.querySelector(".video-description-box .channel-info .publish-date").innerHTML = "Published on " + Help.getLongDateStringFrom(video.publishedAtDate);
		document.querySelector(".video-section .video-title-box .views").innerHTML = Help.getLongNumberStringFrom(video.numOfViews) + " views";
		document.querySelector(".video-reviews .num-of-comments").innerHTML = Help.getLongNumberStringFrom(video.numOfComments) + " Comments";
		document.querySelector(".video-description-box .channel-info .channel-name").innerHTML = video.channelTitle;
		document.querySelector(".video-title-box .like-dislike-box .likes .num").innerHTML = Help.getShortNumberStringFrom(video.numOfLikes);
		document.querySelector(".video-title-box .like-dislike-box .dislikes .num").innerHTML = Help.getShortNumberStringFrom(video.numOfDislikes);

		collapseDescriptionIfNeeded();
	}

	function updateUIWithChannelInfo(channel) {
		document.querySelector(".video-description-box .channel-info .subscribe-button").innerHTML = "subscribe " + Help.getShortNumberStringFrom(channel.numOfSubscribers);
		(function () {
			const channelImage = document.createElement("img");
			channelImage.setAttribute("src", channel.profileImage);
			document.querySelector(".video-description-box .channel-info .channel-image").appendChild(channelImage);
		})();
	}

	

	function updateUIWithRecommendedVideos(videos) {
		const recommendedVideoBoxes = videos.map(v => getRecommendedVideoBoxFor(v));
		document.querySelector(".recommended-videos-section").append(...recommendedVideoBoxes);
	}

	function getRecommendedVideoBoxFor(video) {

		let videoTitle, channelTitle, numOfViews;

		const node = a({
			className: "recommended-video-box", href: Help.getLinkToVideoViewerFile(video.id)}, [
				div({
					className: "recommended-video-thumbnail"}, [
						img(video.thumbnailURL)
					]
				),
				div({
					className: "recommended-video-info-box"}, [
						videoTitle = p({ className: "recommended-video-title clamp", ["data-max-lines"]: "2"}, [text(video.title)] ),
						channelTitle = p({ className: "subtitle clamp", ["data-max-lines"]: "1"}, [text(video.channelTitle)] ),
						numOfViews = p({
							className: "subtitle clamp", ["data-max-lines"]: "1"}, [
								text(Help.getShortNumberStringFrom(video.numOfViews) + " views")
							]
						)
					]
				)
			]
		);

		[videoTitle, channelTitle, numOfViews].forEach(e => Help.applyClampToElement(e));

		return node;
	}



})();













// DESCRIPTION TEXT EXPANDING AND COLLAPSING CODE




window.toggleDescriptionTextCollapsedState = function () {

	const showMoreButton = document.querySelector(".video-description-box .show-more-button");
	const descriptionTextElement = document.querySelector(".video-description-box .description-text");

	const showMoreButtonText = "show more";
	const showLessButtonText = "show less";

	const collapsedClass = "collapsed"

	descriptionTextElement.classList.toggle(collapsedClass);

	showMoreButton.innerHTML = (descriptionTextElement.classList.contains(collapsedClass)) ? showMoreButtonText : showLessButtonText
}

function collapseDescriptionIfNeeded(){
	const showMoreButton = document.querySelector(".video-description-box .show-more-button");
	const descriptionTextElement = document.querySelector(".video-description-box .description-text");

	if (descriptionTextElement.offsetHeight > 80){
		toggleDescriptionTextCollapsedState();
		showMoreButton.classList.remove("hidden");
	}
}  
