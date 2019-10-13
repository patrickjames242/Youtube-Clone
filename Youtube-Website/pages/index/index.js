
import * as Help from "../../javascript/helpers.js";
import * as YTHelpers from "../../javascript/youtube-api.js";


const loadingIndicatorBox = div({ className: "loading-indicator-box" }, [
    div({ className: "loading-indicator" })
]);



Help.executeWhenDocumentIsLoaded(() => {
    Help.addHeaderAndSideBarToDocument();
    fetchAndDisplayAdditionalYoutubeVideos();
});



function fetchAndDisplayAdditionalYoutubeVideos(nextPageToken) {

    const recommendedVideosContainer = document.querySelector(".recommended-videos-container");
    recommendedVideosContainer.append(loadingIndicatorBox);

    YTHelpers.getMostPopularYTVideos({ pageToken: nextPageToken, numberOfVideos: 50 })
        .finally(() => {
            loadingIndicatorBox.remove();
        })
        .then((result) => {
            
            const videos = result.itemList;
            const nextPageToken = result.nextPageToken;

            const recommendedVideoBoxes = videos.map((video) => {
                return getRecommendedVideoBoxNode(video);
            });

            recommendedVideosContainer.append(...recommendedVideoBoxes);
            const lastVideoBox = recommendedVideoBoxes[recommendedVideoBoxes.length - 1];
            if (lastVideoBox !== undefined) {
                Help.setUpPaginationObserverOn(lastVideoBox, () => {
                    fetchAndDisplayAdditionalYoutubeVideos(nextPageToken);
                });
            }
        });
}


function getRecommendedVideoBoxNode(video) {
    let videoTitle, channelName;
    const node =
        a({ className: "recommended-video-box", href: Help.getLinkToVideoViewerFile(video.id) }, [
            div({ className: "thumbnail-box" }, [
                img({ src: video.thumbnailURL })
            ]),
            div({ className: "video-details" }, [
                videoTitle = p({ className: "video-title clamp", ["data-max-lines"]: "2" }, [
                    text(video.title)
                ]),
                div({ className: "subtitles" }, [
                    channelName = p({ className: "channel-name subtitle clamp", ["data-max-lines"]: "1" }, [
                        text(video.channelTitle)
                    ]),
                    p({ className: "views-date subtitle" }, [
                        text(`${Help.getShortNumberStringFrom(video.numOfViews)} views · ${Help.getTimeSinceDateStringFrom(video.publishedAtDate)}`)
                    ])
                ])
            ])
        ]);

    [videoTitle, channelName].forEach((x) => Help.applyClampToElement(x))

    return node;
}


