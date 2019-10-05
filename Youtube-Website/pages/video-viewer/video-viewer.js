


import * as Help from '/javascript/helpers.js';
import * as YTHelpers from '/javascript/youtube-api.js';
import NetworkResponse from '/javascript/helpers/NetworkResponse.js';


import VideoDescriptionBox from './descriptionBox/DescriptionBox.js';
import VideoCommentsBox from './videoReviewsBox/VideoReviewsBox.js'
import RecommendedVideosBox from './recommendedVideosBox/RecommendedVideosBox.js';
import VideoTitleBox from './videoTitleBox.js';

const videoID = (new URL(window.location)).searchParams.get("videoID");
const videoDescriptionBox = new VideoDescriptionBox();
const videoCommentsBox = new VideoCommentsBox(videoID);
const recommendedVideosBox = new RecommendedVideosBox(videoID);
const videoTitleBox = new VideoTitleBox();

Help.executeWhenDocumentIsLoaded(() => {
	Help.addHeaderToDocument();
	document.querySelector(".video-box-holder").after(videoTitleBox.node);
	document.querySelector(".sections-holder .video-section .video-title-box").after(videoDescriptionBox.node, videoCommentsBox.node);
	document.querySelector(".video-section").after(recommendedVideosBox.node);
	
	
});


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

// (() => {

// 	let recommendedVideosSection;

// 	let previousWindowWidth;

// 	const recVideosPosition = {
// 		RIGHT_SIDE: "RIGHT_SIDE",
// 		BOTTOM: "BOTTOM",
// 	}

// 	Help.executeWhenDocumentIsLoaded(() => {
// 		// setUpRecommendedVideosPositionCode();
// 	})


// 	// called when the DOM is loaded
// 	function setUpRecommendedVideosPositionCode() {
// 		recommendedVideosSection = document.querySelector(".recommended-videos-section");
// 		moveRecomendedVideosIfNeeded(window.innerWidth);
// 		updateRecommendedVideosClasses();
// 		window.onresize = () => {
// 			moveRecomendedVideosIfNeeded(window.innerWidth);
// 		};
// 	}



// 	function moveRecomendedVideosIfNeeded(currentWidth) {
// 		if (currentWidth === previousWindowWidth) { return; }

// 		if (currentWidth <= 750) {
// 			moveRecommendedVideosTo(recVideosPosition.BOTTOM);
// 		} else {
// 			moveRecommendedVideosTo(recVideosPosition.RIGHT_SIDE);
// 		}

// 		previousWindowWidth = currentWidth;

// 	}



// 	function moveRecommendedVideosTo(position) {
// 		if (currentRecommendedVideosPosition() === position) { return; }

// 		switch (position) {
// 			case recVideosPosition.RIGHT_SIDE:
// 				document.querySelector(".video-section").after(recommendedVideosSection);
// 				break;

// 			case recVideosPosition.BOTTOM:
// 				document.querySelector(".video-description-box").after(recommendedVideosSection);
// 				break;
// 		}
// 		updateRecommendedVideosClasses();
// 	}

// 	function currentRecommendedVideosPosition() {

// 		const parentHasClass = (className) => {
// 			return recommendedVideosSection.parentElement.classList.contains(className);
// 		};

// 		if (parentHasClass("sections-holder")) {
// 			return recVideosPosition.RIGHT_SIDE;
// 		} else if (parentHasClass("video-section")) {
// 			return recVideosPosition.BOTTOM;
// 		} else {
// 			throw new Error('could not determine currentRecommendedVideosPosition');
// 		}
// 	}

// 	function updateRecommendedVideosClasses() {

// 		const whenOnBottom_class = "recommended-videos-section-whenOnBottom";
// 		const whenOnSide_class = "recommended-videos-section-whenOnSide";

// 		recommendedVideosSection.classList.remove(whenOnSide_class, whenOnBottom_class);
// 		switch (currentRecommendedVideosPosition()) {

// 			case recVideosPosition.RIGHT_SIDE:
// 				recommendedVideosSection.classList.add(whenOnSide_class);
// 				break;

// 			case recVideosPosition.BOTTOM:
// 				recommendedVideosSection.classList.add(whenOnBottom_class);
// 				break;
// 		}
// 	}
// })();














/// YOTUUBE API DATA FETCHING AND DISPLAYING



(() => {



	Help.executeWhenDocumentIsLoaded(() => {
		fetchAndDisplayYoutubeData();
	});


	function fetchAndDisplayYoutubeData() {
		videoCommentsBox.startFetchingComments();

		YTHelpers.getVideoObjectForVideoID(videoID, (callback) => {
			if (callback.status !== NetworkResponse.successStatus) { return; }
			const video = callback.result;
			// updateUIWithVideoInfo(video);
			videoTitleBox.updateFromVideoObject(video);
			videoDescriptionBox.updateUsingVideoObject(video);
			videoCommentsBox.updateWithVideoObject(video);

			YTHelpers.getChannelForChannelID(video.channelID, (callback2) => {
				if (callback2.status !== NetworkResponse.successStatus) { return; }
				const channel = callback2.result;
				videoDescriptionBox.updateUsingChannelObject(channel);
			});
		});


		recommendedVideosBox.startFetchingVideos();
		

	}


	

	


})();








