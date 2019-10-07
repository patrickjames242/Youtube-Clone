
import * as Help from "../../javascript/helpers.js";
import * as YTHelpers from "../../javascript/youtube-api.js";
import NetworkResponse from "../../javascript/helpers/NetworkResponse.js";



const searchText = (new URL(window.location)).searchParams.get("searchText");

const loadingIndicatorBox = div({className: "loading-indicator-box"}, [
    div({className: "loading-indicator"})
])

Help.executeWhenDocumentIsLoaded(() => {
    Help.addHeaderAndSideBarToDocument();
    fetchAndDisplayAdditionalResults();
    document.querySelector(".search-box-container .search-placeholder").setAttribute("value", searchText);
});



function fetchAndDisplayAdditionalResults(nextPageToken){

    const searchResultsHolder = document.querySelector(".search-results-holder");
    searchResultsHolder.append(loadingIndicatorBox);

    YTHelpers.getSearchResultsForSearchText({searchText: searchText, pageToken: nextPageToken, numberOfResults: 30,  completion: (callback) => {
        loadingIndicatorBox.remove();
        if (callback.status !== NetworkResponse.successStatus){return;}
        
        const searchResultsCells = callback.result.itemList.map((e) => getNewSearchResultsCell(e));
        searchResultsHolder.append(...searchResultsCells);

        const lastSearchResultCell = searchResultsCells[searchResultsCells.length - 1];
        const newNextPageToken = callback.result.nextPageToken;

        Help.setUpPaginationObserverOn(lastSearchResultCell, () => {
            fetchAndDisplayAdditionalResults(newNextPageToken);
        });
    }});
}



function getNewSearchResultsCell(video){
    let title, videoDetails;
    const node = 
    a({className: "cell", href: Help.getLinkToVideoViewerFile(video.id)}, [
        div({className: "thumbnail-holder"}, [
            img({src: video.thumbnailURL})
        ]),
        div({className: "info-box"}, [
            title = p({className: "title clamp", ["data-max-lines"]: "2"}, [
                text(video.title)
            ]),
            videoDetails = p({className: "video-details clamp", ["data-max-lines"]: "1"}, [
                text(`${video.channelTitle} • ${Help.getShortNumberStringFrom(video.numOfViews) + " views"} • ${Help.getTimeSinceDateStringFrom(video.publishedAtDate)}`)
            ]),
            p({className: "video-description clamp", ["data-max-lines"]: "2"}, [
                text(video.description)
            ])
        ])
    ]);

    [title, videoDetails].forEach((e) => Help.applyClampToElement(e));
    return node;
}