

import * as Help from '/javascript/helpers.js';
import * as YTHelpers from '/javascript/youtube-api.js';
import NetworkResponse from '/javascript/helpers/NetworkResponse.js';


export default class RecommendedVideosBox{

    constructor(videoID){
        this.videoID = videoID;
        Object.assign(this, RecommendedVideosBox._getNodes());
    }


    startFetchingVideos(){
        YTHelpers.getRecommendedVideosForVideoWithVideoID(this.videoID, 25, (callback) => {
			if (callback.status !== NetworkResponse.successStatus) { return; }
            const videos = callback.result;
            const recommendedVideoBoxes = videos.map(v => getRecommendedVideoBoxFor(v));
			this.node.append(...recommendedVideoBoxes);
		});
    }

    notifyThatBoxIsOnBottom(){

    }

    notifyThatBoxIsOnRight(){

    }


    static _getNodes() {
        const nodes = {};
        nodes.node = section({className: "recommended-videos-column recommended-videos-column-whenOnSide"});
        return nodes;
    }
}



function getRecommendedVideoBoxFor(video) {

    let videoTitle, channelTitle, numOfViews;

    const node = a({ className: "recommended-video-box", href: Help.getLinkToVideoViewerFile(video.id) }, [
        div({ className: "recommended-video-thumbnail" }, [
            img({src: video.thumbnailURL})
        ]),
        div({ className: "recommended-video-info-box" }, [
            videoTitle = p({ className: "recommended-video-title clamp", ["data-max-lines"]: "2" }, [text(video.title)]),
            channelTitle = p({ className: "subtitle clamp", ["data-max-lines"]: "1" }, [text(video.channelTitle)]),
            numOfViews = p({ className: "subtitle clamp", ["data-max-lines"]: "1" }, [
                text(Help.getShortNumberStringFrom(video.numOfViews) + " views")
            ])
        ])
    ]);

    [videoTitle, channelTitle, numOfViews].forEach(e => Help.applyClampToElement(e));

    return node;
}





