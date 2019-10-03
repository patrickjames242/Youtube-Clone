
import * as Help from "../../javascript/helpers.js";
import * as YTHelpers from "../../javascript/youtube-api.js";
import NetworkResponse from "../../javascript/helpers/NetworkResponse.js";



const searchText = (new URL(window.location)).searchParams.get("searchText");

Help.executeWhenDocumentIsLoaded(() => {
    Help.addHeaderAndSideBarToDocument();
    fetchAndDisplayYoutubeData();
    document.querySelector(".search-box-container .search-placeholder").setAttribute("value", searchText);
});



function fetchAndDisplayYoutubeData(){
    
    YTHelpers.getSearchResultsForSearchText(searchText, 30, (callback) => {
        if (callback.status !== NetworkResponse.successStatus){return;}
        const searchResultsHolderSelector = ".search-results-holder";
        const searchResultsHolder = document.querySelector(searchResultsHolderSelector);
        const searchResultsCells = callback.result.map((e) => getNewSearchResultsCell(e));
        searchResultsHolder.append(...searchResultsCells);
    });
}



function getNewSearchResultsCell(video){
    let title, videoDetails, videoDescription;
    const node = 
    a({classString: "cell", href: Help.getLinkToVideoViewerFile(video.id), children: [
        div({classString: "thumbnail-holder", children: [
            img(video.thumbnailURL)
        ]}),
        div({classString: "info-box", children: [
            title = p({classString: "title clamp", ["data-max-lines"]: "2", children: [
                text(video.title)
            ]}),
            videoDetails = p({classString: "video-details clamp", ["data-max-lines"]: "1", children: [
                text(`${video.channelTitle} • ${Help.getShortNumberStringFrom(video.numOfViews) + " views"} • ${Help.getTimeSinceDateStringFrom(video.publishedAtDate)}`)
            ]}),
            // p({classString: "video-description clamp", ["data-max-lines"]: "2", children: [
            //     text(video.description)
            // ]}),
            videoDescription = p({classString: "video-description clamp", ["data-max-lines"]: "2", children: [
                text("Lorem ipsum dolor sit amet consectetur, adipisicing elit. Illo ex consectetur sunt maiores a vel ea beatae provident dolore delectus natus ipsam quibusdam porro perferendis eligendi nam esse, corporis velit fugit reprehenderit fuga! Temporibus consequuntur quisquam accusantium fugit reprehenderit rerum voluptate suscipit id nemo ducimus exercitationem quo fugiat, eaque in?")
            ]})
        ]})
    ]});

    [title, videoDetails, videoDescription].forEach((e) => Help.applyClampToElement(e));
    return node;
}