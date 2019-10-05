
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
            // p({className: "video-description clamp", ["data-max-lines"]: "2"}, [
            //     text(video.description)
            // ]}),
            videoDescription = p({className: "video-description clamp", ["data-max-lines"]: "2"}, [
                text("Lorem ipsum dolor sit amet consectetur, adipisicing elit. Illo ex consectetur sunt maiores a vel ea beatae provident dolore delectus natus ipsam quibusdam porro perferendis eligendi nam esse, corporis velit fugit reprehenderit fuga! Temporibus consequuntur quisquam accusantium fugit reprehenderit rerum voluptate suscipit id nemo ducimus exercitationem quo fugiat, eaque in?")


                // text("alskdjfalksdjflkasjdflkajsdlkfjasldkfjlaksdjflkasdjlfkajsdlkfjslkdjflskdjflksdjflksdjflksdjflkjsdlkfjsdlkfjsdlkfjsldkjflksdjflksdjlfkjsdlkfjsdlkfjsdlkfjsdlkjflksdjflksdjflksjdlkfjsdklfjsdklfjksdjfklsdjfksjdkfjsdklfjsdkljflksdjfklsdjlfjsdljfs")
            ])
        ])
    ]);

    [title, videoDetails, videoDescription].forEach((e) => Help.applyClampToElement(e));
    return node;
}