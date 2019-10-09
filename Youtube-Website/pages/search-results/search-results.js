
import * as Help from "../../javascript/helpers.js";
import * as YTHelpers from "../../javascript/youtube-api.js";
import NetworkResponse from "../../javascript/helpers/NetworkResponse.js";





class ContentHolder {

    constructor(searchText) {
        this.searchText = searchText;
        Object.assign(this, ContentHolder._getNodes());
    }

    _loadingIndicatorBox = div({ className: "loading-indicator-box" }, [
        div({ className: "loading-indicator" })
    ]);

    startFetchingYoutubeSearchResults() {
        this._fetchAndDisplayAdditionalResults();
    }

    _fetchAndDisplayAdditionalResults(nextPageToken) {

        this.searchResultsHolder.append(this._loadingIndicatorBox);

        YTHelpers.getSearchResultsForSearchText({
            searchText: this.searchText, pageToken: nextPageToken, numberOfResults: 30, completion: (callback) => {
                this._loadingIndicatorBox.remove();
                if (callback.status !== NetworkResponse.successStatus) { return; }
                const videos = this._filterDuplicatesFrom(callback.result.itemList);
                const searchResultsCells = videos.map((e) => getNewSearchResultsCell(e));
                this.searchResultsHolder.append(...searchResultsCells);

                const lastSearchResultCell = searchResultsCells[searchResultsCells.length - 1];
                const newNextPageToken = callback.result.nextPageToken;

                Help.setUpPaginationObserverOn(lastSearchResultCell, () => {
                    this._fetchAndDisplayAdditionalResults(newNextPageToken);
                });
            }
        });
    }

    _previouslyFetchedVideos = [];

    _filterDuplicatesFrom(newVideos) {
        const videosToReturn = newVideos.filter(x => {
            return this._previouslyFetchedVideos.includesWhere(y => {x.id === y.id}) === false;
        });
        this._previouslyFetchedVideos.push(...videosToReturn);
        return videosToReturn;

    }


    static _getNodes() {
        const nodes = {};
        nodes.node = div({ className: "main-content" }, [
            nodes.searchResultsHolder = div({ className: "search-results-holder" })
        ]);
        return nodes
    }
}




function getNewSearchResultsCell(video) {
    let title, videoDetails;
    const node =
        a({ className: "cell", href: Help.getLinkToVideoViewerFile(video.id) }, [
            div({ className: "thumbnail-holder" }, [
                img({ src: video.thumbnailURL })
            ]),
            div({ className: "info-box" }, [
                title = p({ className: "title clamp", ["data-max-lines"]: "2" }, [
                    text(video.title)
                ]),
                videoDetails = p({ className: "video-details clamp", ["data-max-lines"]: "1" }, [
                    text(`${video.channelTitle} • ${Help.getShortNumberStringFrom(video.numOfViews) + " views"} • ${Help.getTimeSinceDateStringFrom(video.publishedAtDate)}`)
                ]),
                p({ className: "video-description clamp", ["data-max-lines"]: "2" }, [
                    text(video.description)
                ])
            ])
        ]);

    [title, videoDetails].forEach((e) => Help.applyClampToElement(e));
    return node;
}






const searchText = (new URL(window.location)).searchParams.get("searchText");

Help.executeWhenDocumentIsLoaded(() => {
    Help.addHeaderAndSideBarToDocument();
    const contentHolder = new ContentHolder(searchText);
    contentHolder.startFetchingYoutubeSearchResults();
    document.querySelector("main").append(contentHolder.node);
    document.querySelector(".search-box-container .search-placeholder").setAttribute("value", searchText);
});






