
import * as Help from '/javascript/helpers.js';
import * as YTHelpers from '/javascript/youtube-api.js';



import VideoDescriptionBox from '../descriptionBox/DescriptionBox.js';
import VideoCommentsBox from '../videoCommentsBox/VideoCommentsBox.js'
import RecommendedVideosBox from '../recommendedVideosBox/RecommendedVideosBox.js';
import VideoTitleBox from '../videoTitleBox/VideoTitleBox.js';


Help.addStyleSheetToDocument('/pages/video-viewer/contentHolder/contentHolder.css');

export default class ContentHolder {
	constructor(videoID) {
		this.videoID = videoID;
		Object.assign(this, ContentHolder._getNodes(videoID));
		this.recommendedVideosBoxWrapper.notifyThatBoxWasPlacedOnTheSide();
		this._respondToWindowResize();
		this._setUpWindowResizeObserver();
	}



	startFetchingDataFromYoutube() {

		this.videoCommentsBoxWrapper.startFetchingComments();
		this.recommendedVideosBoxWrapper.startFetchingVideos();
		YTHelpers.getVideoObjectForVideoID(this.videoID)
			.then((video) => {
				this.videoTitleBoxWrapper.updateFromVideoObject(video);
				this.videoDescriptionBoxWrapper.updateUsingVideoObject(video);
				this.videoCommentsBoxWrapper.updateWithVideoObject(video);
				return YTHelpers.getChannelForChannelID(video.channelID);
			}).then((channel) => {
				this.videoDescriptionBoxWrapper.updateUsingChannelObject(channel);
			});
	}

	_setUpWindowResizeObserver() {
		window.onresize = () => {
			this._respondToWindowResize();
		};
	}

	_collapsedClassString = "collapsed";

	get _isCollapsed() {
		return this.node.classList.contains(this._collapsedClassString);
	}

	set _isCollapsed(newValue) {
		if (newValue) {
			this.node.classList.add(this._collapsedClassString);
			this.recommendedVideosBoxWrapper.notifyThatBoxWasPlacedOnBottomOfDescriptionBox();
		} else {
			this.node.classList.remove(this._collapsedClassString);
			this.recommendedVideosBoxWrapper.notifyThatBoxWasPlacedOnTheSide();
		}
	}

	_respondToWindowResize() {
		if (window.innerWidth >= 1000) {
			if (this._isCollapsed) {
				this._isCollapsed = false;
			}
		} else {
			if (this._isCollapsed === false) {
				this._isCollapsed = true;
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
			div({ className: "grid-video-box-block" }, [
				div({ className: "video-box" }, [
					div({ id: "player" })
				])
			]),
			div({ className: "grid-title-box-block" }, [
				nodes.videoTitleBoxWrapper.node,
			]),
			div({ className: "grid-description-box-block" }, [
				nodes.videoDescriptionBoxWrapper.node,
			]),
			div({ className: "grid-comments-box-block" }, [
				nodes.videoCommentsBoxWrapper.node,
			]),
			div({ className: "grid-recommended-videos-box-block" }, [
				nodes.recommendedVideosBoxWrapper.node
			])
		]);
		return nodes;
	}
}

