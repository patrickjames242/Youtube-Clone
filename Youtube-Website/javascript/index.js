


documentDidLoadNotification.listen(Symbol(), () => {
    fetchAndDisplayYoutubeData();
});

function fetchAndDisplayYoutubeData(){
    getMostPopularYTVideos(50, (callback) => {
        
        if (callback.status !== NetworkResponse.successStatus){ return; }

        const videos = callback.result;

        const recommendedVideoBoxesHTML = videos.map((video) => {
            return getRecommendedVideoBoxHtml(video);
        }).join("");

        const recommendedVideosContainer = document.querySelector(".recommended-videos-container")
        recommendedVideosContainer.innerHTML += recommendedVideoBoxesHTML;
        
        document.querySelectorAll(".recommended-videos-container .clamp")
        .forEach((element) => applyClampToElement(element));
    });
}


