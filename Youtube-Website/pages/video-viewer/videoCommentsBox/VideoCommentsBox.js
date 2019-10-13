

import * as Help from '/javascript/helpers.js';
import * as YTHelpers from '/javascript/youtube-api.js';
import CommentBox from './CommentBox.js';

Help.addStyleSheetToDocument('/pages/video-viewer/videoCommentsBox/videoComments.css');

export default class VideoCommentsBox {


    constructor(videoID) {
        this.videoID = videoID;
        Object.assign(this, VideoCommentsBox._getNodes());

    }

    updateWithVideoObject(video) {
        this.numberOfCommentsBox.innerHTML = Help.getLongNumberStringFrom(video.numOfComments) + " Comments";
    }

    startFetchingComments() {
        this._fetchAndDisplayAdditionalComments();
    }


    _loadingIndicatorBox = div({ className: "loading-indicator-box" }, [
        div({ className: "loading-indicator" })
    ]);


    _fetchAndDisplayAdditionalComments(pageToken) {
        this.node.append(this._loadingIndicatorBox);
        YTHelpers.getCommentsForVideoWithVideoID({ videoID: this.videoID, numberOfComments: 20 })
            .finally(() => {
                this._loadingIndicatorBox.remove();
            })
            .then((result) => {
                const commentBoxes = result.itemList.map((comment) => new CommentBox(comment));
                const nextPageToken = result.nextPageToken;

                const nodes = commentBoxes.map((box) => box.node);
                this.node.append(...nodes);
                const lastCommentBoxNode = nodes[nodes.length - 1];

                Help.setUpPaginationObserverOn(lastCommentBoxNode, () => {
                    this._fetchAndDisplayAdditionalComments(nextPageToken);
                });
            });

    }



    static _getNodes() {
        const nodes = {};

        nodes.node = div({ className: "all-video-comments-box" }, [
            nodes.numberOfCommentsBox = p({ className: "num-of-comments" }),
            div({ className: "add-comment-box" }, [
                img({ className: "profile-image", src: "/images/blank_user.png" }),
                p({ className: "add-comment-text subtitle underlined unsupported-feature-button" }, [
                    text("Add a public comment")
                ])
            ])
        ]);
        return nodes;
    }

}

