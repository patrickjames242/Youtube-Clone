

import * as Help from '/javascript/helpers.js';
import * as YTHelpers from '/javascript/youtube-api.js';
import CommentBox from './CommentBox.js';
import NetworkResponse from '/javascript/helpers/NetworkResponse.js';


export default class VideoCommentsBox{


    constructor(videoID){
        this.videoID = videoID;
        Object.assign(this, VideoCommentsBox._getNodes());

    }

    updateWithVideoObject(video){
        this.numberOfCommentsBox.innerHTML = Help.getLongNumberStringFrom(video.numOfComments) + " Comments";
    }
    
    startFetchingComments(){
        this._fetchAndDisplayAdditionalComments();
    }


    _loadingIndicatorBox = div({className: "loading-indicator-box"}, [
        div({className: "loading-indicator"})
    ]);


    _fetchAndDisplayAdditionalComments(pageToken){
        this.node.append(this._loadingIndicatorBox);
        YTHelpers.getCommentsForVideoWithVideoID({
            videoID: this.videoID, numberOfComments: 20, completion: (callback) => {
				this._loadingIndicatorBox.remove();
				if (callback.status !== NetworkResponse.successStatus) { return; }

				const commentBoxes = callback.result.itemList.map((comment) => new CommentBox(comment));
				const nextPageToken = callback.result.nextPageToken;

				const nodes = commentBoxes.map((box) => box.node);
				this.node.append(...nodes);
                const lastCommentBoxNode = nodes[nodes.length - 1];
                this._setUpPaginationObserverForCommentBox(lastCommentBoxNode, nextPageToken);
			}
		});
    }

    _setUpPaginationObserverForCommentBox(commentBox, nextPageToken){
        let observer;
		const observerCallback = (items) => {

			if (items[0].isIntersecting) {
				observer.disconnect();
                this._fetchAndDisplayAdditionalComments(nextPageToken);
			}
		};
		observer = new IntersectionObserver(observerCallback, { threshold: 0 });
		observer.observe(commentBox);
    }




    static _getNodes(){
        const nodes = {};

        const style = Help.getStyleElementForStyleSheetAt('/pages/video-viewer/videoCommentsBox/videoComments.css');

        nodes.node = div({className: "all-video-comments-box"}, [
            style,
            nodes.numberOfCommentsBox = p({className: "num-of-comments"}),
            div({className: "add-comment-box"}, [
                img({className: "profile-image",src: "/images/blank_user.png"}),
                p({className: "add-comment-text subtitle underlined unsupported-feature-button"}, [
                    text("Add a public comment")
                ])
            ])
        ]); 
        return nodes;
    }


}

