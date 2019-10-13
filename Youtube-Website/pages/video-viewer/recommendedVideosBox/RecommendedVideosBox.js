

import * as Help from '/javascript/helpers.js';
import * as YTHelpers from '/javascript/youtube-api.js';
import NetworkResponse from '/javascript/helpers/NetworkResponse.js';

Help.addStyleSheetToDocument('/pages/video-viewer/recommendedVideosBox/recommendedVideosBox.css');


const RecVideosBoxPosition = {
    ON_SIDE: Symbol('on_side'),
    ON_BOTTOM: Symbol('on_bottom')
}

export default class RecommendedVideosBox {

    constructor(videoID) {
        this.videoID = videoID;
        Object.assign(this, RecommendedVideosBox._getNodes());
        this._attatchShowMoreVideosButtonClickListener();
    }

    startFetchingVideos() {
        this._fetchAdditionalVideosFromYoutube();
    }

    _currentPosition = RecVideosBoxPosition.ON_BOTTOM;

    notifyThatBoxWasPlacedOnTheSide() {
        this._currentPosition = RecVideosBoxPosition.ON_SIDE;
        this._attachPaginationObserverToLastRecommendedVideoBox();
        this._updateShowMoreButtonVisibility();
    }

    notifyThatBoxWasPlacedOnBottomOfDescriptionBox() {
        this._currentPosition = RecVideosBoxPosition.ON_BOTTOM;
        if (this._currentPaginationObserver !== undefined) {
            this._currentPaginationObserver.disconnect();
        }
        this._updateShowMoreButtonVisibility();
    }




    get _shouldShowMoreVideosButtonBeShown() {
        return this._currentPosition === RecVideosBoxPosition.ON_BOTTOM &&
            this._videosAreCurrentlyBeingFetched === false &&
            this._currentNextPageToken !== undefined;
    }

    _updateShowMoreButtonVisibility() {
        this.showMoreVideosButton.isHidden = this._shouldShowMoreVideosButtonBeShown === false;
    }




    _currentPaginationObserver;

    _currentNextPageToken;

    _currentLastRecommendedVideoBox;

    _videosAreCurrentlyBeingFetched = false;


    _fetchAdditionalVideosFromYoutube(nextPageToken) {

        this.loadingIndicatorBox.isHidden = false;

        this._videosAreCurrentlyBeingFetched = true;
        this._updateShowMoreButtonVisibility();

        YTHelpers.getRecommendedVideosForVideoWithVideoID({ videoId: this.videoID, numberOfVideos: 15, pageToken: nextPageToken})
            .finally(() => {
                this._videosAreCurrentlyBeingFetched = false;
                this.loadingIndicatorBox.isHidden = true;
                this._updateShowMoreButtonVisibility();
            })
            .then((response) => {
                const videos = this._filterThroughNewlyFetchedVideos(response.itemList);

                const recommendedVideoBoxes = videos.map(v => getRecommendedVideoBoxFor(v));
                this.videosHolder.append(...recommendedVideoBoxes);

                this._currentLastRecommendedVideoBox = recommendedVideoBoxes[recommendedVideoBoxes.length - 1];
                this._currentNextPageToken = response.nextPageToken;

                this._updateShowMoreButtonVisibility();

                if (this._currentPosition === RecVideosBoxPosition.ON_SIDE) {
                    this._attachPaginationObserverToLastRecommendedVideoBox();
                }
            });


    }

    _previouslyFetchedVideos = [];

    // because sometimes the yotuube api sends videos in one page that were already sent in the previous ones.
    _filterThroughNewlyFetchedVideos(videos) {
        const filteredVideos = videos.filter(x => {
            return this._previouslyFetchedVideos.includesWhere(y => { y.id === x.id }) === false;
        });
        this._previouslyFetchedVideos.push(...filteredVideos);
        return filteredVideos;
    }

    _attachPaginationObserverToLastRecommendedVideoBox() {
        const lastVideoBox = this._currentLastRecommendedVideoBox;
        const nextPageToken = this._currentNextPageToken;
        if (lastVideoBox !== undefined &&
            nextPageToken !== undefined) {
            this._currentPaginationObserver = Help.setUpPaginationObserverOn(lastVideoBox, () => {
                this._fetchAdditionalVideosFromYoutube(nextPageToken);
            });
        }
    }



    _attatchShowMoreVideosButtonClickListener() {
        this.showMoreVideosButton.addEventListener('click', () => {
            this._respondToShowMoreVideosButtonClicked();
        });
    }

    _respondToShowMoreVideosButtonClicked() {
        this._fetchAdditionalVideosFromYoutube(this._currentNextPageToken);
    }


    static _getNodes() {
        const nodes = {};
        nodes.node = div({ className: "all-recommended-videos-box" }, [
            nodes.videosHolder = div({ className: "videos-holder" }),
            nodes.bottomContentHolder = div({ className: "bottom-content-holder" }, [
                nodes.loadingIndicatorBox = div({ className: "loading-indicator-box" }, [
                    div({ className: "loading-indicator" })
                ]),
                nodes.showMoreVideosButton = div({ className: "show-more-videos-button" }, [
                    text("show more")
                ])
            ])
        ]);
        nodes.loadingIndicatorBox.isHidden = true;
        nodes.showMoreVideosButton.isHidden = true;
        return nodes;
    }
}



function getRecommendedVideoBoxFor(video) {

    let videoTitle, channelTitle, numOfViews;

    const node = a({ className: "recommended-video-box", href: Help.getLinkToVideoViewerFile(video.id) }, [
        div({ className: "recommended-video-thumbnail" }, [
            img({ src: video.thumbnailURL })
        ]),
        div({ className: "recommended-video-info-box" }, [
            videoTitle = p({ className: "recommended-video-title clamp", ["data-max-lines"]: "2" }, [
                text(video.title)
            ]),
            channelTitle = p({ className: "subtitle clamp", ["data-max-lines"]: "1" }, [
                text(video.channelTitle)
            ]),
            numOfViews = p({ className: "subtitle clamp", ["data-max-lines"]: "1" }, [
                text(Help.getShortNumberStringFrom(video.numOfViews) + " views")
            ])
        ])
    ]);

    [videoTitle, channelTitle, numOfViews].forEach(e => Help.applyClampToElement(e));

    return node;
}
