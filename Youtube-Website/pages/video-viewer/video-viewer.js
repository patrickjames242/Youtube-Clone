


import * as Help from '/javascript/helpers.js';
import * as YTHelpers from '/javascript/youtube-api.js';
import NetworkResponse from '/javascript/helpers/NetworkResponse.js';


import VideoDescriptionBox from './descriptionBox/DescriptionBox.js';
import VideoCommentsBox from './videoCommentsBox/VideoCommentsBox.js'
import RecommendedVideosBox from './recommendedVideosBox/RecommendedVideosBox.js';
import VideoTitleBox from './videoTitleBox/VideoTitleBox.js';


const videoID = (new URL(window.location)).searchParams.get("videoID");



class ContentHolder {
	constructor(videoID) {
		this.videoID = videoID;
		Object.assign(this, ContentHolder._getNodes(videoID));
		this.recommendedVideosBoxWrapper.notifyThatBoxWasPlacedOnTheSide();
		this._respondToWindowWidthDidChange();
		this._setUpWindowWidthListener();
	}

	

	startFetchingDataFromYoutube(){
		
		this.videoCommentsBoxWrapper.startFetchingComments();
		this.recommendedVideosBoxWrapper.startFetchingVideos();

		YTHelpers.getVideoObjectForVideoID(videoID, (callback) => {
			if (callback.status !== NetworkResponse.successStatus) { return; }
			const video = callback.result;

			this.videoTitleBoxWrapper.updateFromVideoObject(video);
			this.videoDescriptionBoxWrapper.updateUsingVideoObject(video);
			this.videoCommentsBoxWrapper.updateWithVideoObject(video);

			YTHelpers.getChannelForChannelID(video.channelID, (callback2) => {
				if (callback2.status !== NetworkResponse.successStatus) { return; }
				const channel = callback2.result;
				this.videoDescriptionBoxWrapper.updateUsingChannelObject(channel);
			});
		});
	}

	_setUpWindowWidthListener(){
		window.onresize = () => {
			this._respondToWindowWidthDidChange();
		};
	}

	_respondToWindowWidthDidChange(){
		if (window.innerWidth <= 900){
			if (this.recommendedVideosBoxWrapper.node.parentNode !== this.videoColumn){
				this.videoDescriptionBoxWrapper.node.after(this.recommendedVideosBoxWrapper.node);
				this.recommendedVideosBoxWrapper.notifyThatBoxWasPlacedOnBottomOfDescriptionBox();
			}
		} else {
			if (this.recommendedVideosBoxWrapper.node.parentNode !== this.node){
				this.videoColumn.after(this.recommendedVideosBoxWrapper.node);
				this.recommendedVideosBoxWrapper.notifyThatBoxWasPlacedOnTheSide();
			}
		}
	}


	static _getNodes(videoID) {
		const nodes = {};
		
		nodes.videoTitleBoxWrapper = new VideoTitleBox();
		nodes.videoDescriptionBoxWrapper = new VideoDescriptionBox();
		nodes.videoCommentsBoxWrapper = new VideoCommentsBox(videoID);
		nodes.recommendedVideosBoxWrapper = new RecommendedVideosBox(videoID);

		nodes.node = div({ className: "content-holder" }, [
			nodes.videoColumn = div({ className: "video-column" }, [
				div({ className: "video-box-holder" }, [
					div({ className: "video-box" }, [
						div({ id: "player" })
					])
				]),
				nodes.videoTitleBoxWrapper.node,
				nodes.videoDescriptionBoxWrapper.node,
				nodes.videoCommentsBoxWrapper.node
			]),
			nodes.recommendedVideosBoxWrapper.node
		]);
		return nodes;
	}
}








Help.addHeaderToDocument();

const contentHolder = new ContentHolder(videoID);
document.querySelector("main").append(contentHolder.node);
contentHolder.startFetchingDataFromYoutube();

configureYoutubePlayer();


function configureYoutubePlayer() {
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
}


