
import * as Help from "../../javascript/helpers.js";
import * as YTHelpers from "../../javascript/youtube-api.js";
import NetworkResponse from "../../javascript/helpers/NetworkResponse.js";


Help.executeWhenDocumentIsLoaded(() => {
    Help.addHeaderAndSideBarToDocument();
    fetchAndDisplayYoutubeData();
});



function fetchAndDisplayYoutubeData(){
    YTHelpers.getMostPopularYTVideos(50, (callback) => {
        
        if (callback.status !== NetworkResponse.successStatus){ return; }

        const videos = callback.result;

        const recommendedVideoBoxes = videos.map((video) => {
            return getRecommendedVideoBoxNode(video);
        });

        const recommendedVideosContainer = document.querySelector(".recommended-videos-container");
        recommendedVideosContainer.append(...recommendedVideoBoxes);

    });
}


function getRecommendedVideoBoxNode(video){
    let videoTitle, channelName;
    const node = 
    a({classString: "recommended-video-box", href: Help.getLinkToVideoViewerFile(video.id), children: [
        div({classString: "thumbnail-box", children: [
            img(video.thumbnailURL)
        ]}),
        div({classString: "video-details", children: [
            videoTitle = p({classString: "video-title", children: [
                text(video.title)
            ]}),
            div({classString: "subtitles", children: [
                channelName = p({classString: "channel-name subtitle", children: [
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


