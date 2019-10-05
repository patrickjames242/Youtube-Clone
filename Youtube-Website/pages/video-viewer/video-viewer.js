


import * as Help from '/javascript/helpers.js';
import * as YTHelpers from '/javascript/youtube-api.js';
import NetworkResponse from '/javascript/helpers/NetworkResponse.js';


import VideoDescriptionBox from './descriptionBox/DescriptionBox.js';
import VideoCommentsBox from './videoReviewsBox/VideoReviewsBox.js'
import RecommendedVideosBox from './recommendedVideosBox/RecommendedVideosBox.js';
import VideoTitleBox from './videoTitleBox.js';

const videoID = (new URL(window.location)).searchParams.get("videoID");






class ColumnsHolder{

	constructor(videoID){
		Object.assign(this, ColumnsHolder._getNodes(videoID));
	}

	startFetchingDataFromYoutube(){
		this.videoColumnWrapper.startFetchingDataFromYoutube();
		this.recommendedVideosBoxWrapper.startFetchingVideos();
	}


	static _getNodes(videoID){
		const nodes = {};
		nodes.videoColumnWrapper = new VideoColumn(videoID);
		nodes.recommendedVideosBoxWrapper = new RecommendedVideosBox(videoID);
		nodes.node = div({className: "columns-holder"}, [
			nodes.videoColumnWrapper.node,
			nodes.recommendedVideosBoxWrapper.node
		])
		return nodes;
	}
}




class VideoColumn {

	constructor(videoID) {
		Object.assign(this, VideoColumn._getNodes(videoID));

	}

	startFetchingDataFromYoutube() {

		this.videoCommentsBoxWrapper.startFetchingComments();

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



	static _getNodes(videoID) {
		const nodes = {};
		nodes.videoTitleBoxWrapper = new VideoTitleBox();
		nodes.videoDescriptionBoxWrapper = new VideoDescriptionBox();
		nodes.videoCommentsBoxWrapper = new VideoCommentsBox(videoID);

		nodes.node = div({ className: "video-column" }, [
			div({ className: "video-box-holder" }, [
				div({ className: "video-box" }, [
					div({ id: "player" })
				])
			]),
			nodes.videoTitleBoxWrapper.node,
			nodes.videoDescriptionBoxWrapper.node,
			nodes.videoCommentsBoxWrapper.node
		]);

		return nodes;
	}


}


Help.addHeaderToDocument();

const columnsHolder = new ColumnsHolder(videoID);
document.querySelector("main").append(columnsHolder.node);
columnsHolder.startFetchingDataFromYoutube();

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













// 750