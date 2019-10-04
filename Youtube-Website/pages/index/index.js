
import * as Help from "../../javascript/helpers.js";
import * as YTHelpers from "../../javascript/youtube-api.js";
import NetworkResponse from "../../javascript/helpers/NetworkResponse.js";


const loadingIndicatorBox = div({
    classString: "loading-indicator-box", children: [
        div({ classString: "loading-indicator" })
    ]
})



Help.executeWhenDocumentIsLoaded(() => {
    Help.addHeaderAndSideBarToDocument();
    fetchAndDisplayAdditionalYoutubeVideos();
});



function fetchAndDisplayAdditionalYoutubeVideos(nextPageToken) {

    const recommendedVideosContainer = document.querySelector(".recommended-videos-container");
    recommendedVideosContainer.append(loadingIndicatorBox);
    
    YTHelpers.getMostPopularYTVideos({
        pageToken: nextPageToken,
        numberOfVideos: 50,
        completion: (callback) => {
            loadingIndicatorBox.remove();
            if (callback.status !== NetworkResponse.successStatus) { return; }

            const videos = callback.result.itemList;
            const nextPageToken = callback.result.nextPageToken;

            const recommendedVideoBoxes = videos.map((video) => {
                return getRecommendedVideoBoxNode(video);
            });

            recommendedVideosContainer.append(...recommendedVideoBoxes);
            const lastVideoBox = recommendedVideoBoxes[recommendedVideoBoxes.length - 1];
            if (lastVideoBox !== undefined){
                setUpPaginationObserver(lastVideoBox, nextPageToken);
            }
        }
    });
}

function setUpPaginationObserver(lastVideoBox, nextPageToken) {
    let observer;
    const observerCallback = (items) => {
        
        if (items[0].isIntersecting){
            observer.disconnect();
            fetchAndDisplayAdditionalYoutubeVideos(nextPageToken);
        }
    };
    observer = new IntersectionObserver(observerCallback, {threshold: 0});
    observer.observe(lastVideoBox);
}



function getRecommendedVideoBoxNode(video) {
    let videoTitle, channelName;
    const node =
    a({classString: "recommended-video-box", href: Help.getLinkToVideoViewerFile(video.id), children: [
        div({classString: "thumbnail-box", children: [
            img(video.thumbnailURL)
        ]}),
        div({classString: "video-details", children: [
            videoTitle = p({classString: "video-title clamp", ["data-max-lines"]: "2", children: [
                text(video.title)
            ]}),
            div({classString: "subtitles", children: [
                channelName = p({classString: "channel-name subtitle clamp", ["data-max-lines"]: "1", children: [
                    text(video.channelTitle)
                ]}),
                p({classString: "views-date subtitle", children: [
                    text(`${Help.getShortNumberStringFrom(video.numOfViews)} views · ${Help.getTimeSinceDateStringFrom(video.publishedAtDate)}`)
                ]})
            ]})
        ]})
    ]});

    [videoTitle, channelName].forEach((x) => Help.applyClampToElement(x))

    return node;
}


