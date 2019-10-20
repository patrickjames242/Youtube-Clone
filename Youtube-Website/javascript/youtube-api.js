


const ytAPIKey = "AIzaSyDvO-B0N8F6yG_Yh2_7PiEpp1r9dTHiiaE";

// const ytAPIKey = "AIzaSyDXn6ZJ1Zi01Zlp8irQY0g_Z-WBgR7UDdc";

// const ytAPIKey = "AIzaSyCzmh3xADhaPmhiC5-FF1078d0_akxieOE";

export class YoutubeAPIListReponse {
    constructor(itemList, previousPageToken, nextPageToken) {
        this.itemList = itemList;
        this.previousPageToken = previousPageToken;
        this.nextPageToken = nextPageToken;
    }
}


export class Video {

    /// requires that the json have BOTH the snippet and statistics parts
    constructor(ytVideoJsonObject) {

        // console.log(ytVideoJsonObject);

        this.id = ytVideoJsonObject.id

        const snippet = ytVideoJsonObject.snippet;

        this.title = snippet.title;
        this.description = snippet.description;
        this.channelID = snippet.channelId;
        this.channelTitle = snippet.channelTitle;
        this.thumbnailURL = snippet.thumbnails.high.url;
        this.publishedAtDate = new Date(snippet.publishedAt);

        const statistics = ytVideoJsonObject.statistics;
        this.numOfComments = statistics.commentCount;
        this.numOfViews = Number(statistics.viewCount);

        this.numOfLikes = Number(statistics.likeCount);
        this.numOfDislikes = Number(statistics.dislikeCount);
        // console.log(this);
    }
}


export class VideoComment {
    constructor(ytCommentItem) {
        // console.log(ytCommentItem);

        const setPropertiesFromSnippet = (snippet) => {
            this.authorName = snippet.authorDisplayName;
            this.publishedAtDate = new Date(snippet.publishedAt);
            this.authorProfileImageURL = snippet.authorProfileImageUrl;
            this.numOfLikes = snippet.likeCount;
            this.text = snippet.textDisplay;
            this.videoID = snippet.videoId;
            this.parentCommentID = snippet.parentId;
        };

        switch (ytCommentItem.kind) {

            case "youtube#commentThread":
                setPropertiesFromSnippet(ytCommentItem.snippet.topLevelComment.snippet);
                this.id = ytCommentItem.snippet.topLevelComment.id;
                this.numOfReplies = ytCommentItem.snippet.totalReplyCount;
                break;

            case "youtube#comment":
                setPropertiesFromSnippet(ytCommentItem.snippet);
                this.id = ytCommentItem.id;
                this.numOfReplies = 0;
                break;
        }
        // console.log(this);
    }
}

export class Channel {
    constructor(ytChannelItem) {
        // console.log(ytChannelItem);
        this.id = ytChannelItem.id;

        const snippet = ytChannelItem.snippet;
        this.title = snippet.title;
        this.profileImage = snippet.thumbnails.medium.url;
        this.description = snippet.description;


        const statistics = ytChannelItem.statistics;
        this.numOfSubscribers = statistics.subscriberCount;
        // console.log(this);
    }
}


export async function getMostPopularYTVideos({ numberOfVideos, pageToken }) {

    numberOfVideos = Math.max(Math.min(numberOfVideos, 50), 1);
    let url = `https://www.googleapis.com/youtube/v3/videos?key=${ytAPIKey}&part=snippet,statistics&chart=mostPopular&maxResults=${numberOfVideos}`;

    if (pageToken !== undefined) {
        url = url + "&pageToken=" + pageToken;
    }

    const json = await getJsonDataFromURL(url);

    const nextPageToken = json.nextPageToken;
    const previousPageToken = json.previousPageToken;
    const videos = json.items.map(item => new Video(item));

    return new YoutubeAPIListReponse(videos, previousPageToken, nextPageToken);
}

export async function getVideoObjectForVideoID(videoID) {
    const url = String.raw`https://www.googleapis.com/youtube/v3/videos?key=${ytAPIKey}&part=id,snippet,statistics&id=${videoID}`;
    const json = await getJsonDataFromURL(url);
    const items = json.items;
    if (items.length < 1) {
        return Promise.reject("The video information could not be found for the video id provided");
    } else {
        const video = new Video(items[0]);
        return video;
    }
}




export async function getRecommendedVideosForVideoWithVideoID({ videoId, numberOfVideos, pageToken}) {

    numberOfVideos = Math.max(Math.min(numberOfVideos, 50), 1);

    let recommendedVideosURL = String.raw`https://www.googleapis.com/youtube/v3/search?key=${ytAPIKey}&relatedToVideoId=${videoId}&part=snippet&type=video&maxResults=${numberOfVideos}`;

    if (pageToken !== undefined) {
        recommendedVideosURL += "&pageToken=" + pageToken;
    }

    const json = await getJsonDataFromURL(recommendedVideosURL);

    const nextPageToken = json.nextPageToken;
    const previousPageToken = json.previousPageToken;

    const ytIDs = json.items.map((item) => {
        return item.id.videoId;
    })

    const videos = await getYoutubeVideosFor(ytIDs);
    return new YoutubeAPIListReponse(videos, previousPageToken, nextPageToken);

}




export async function getCommentsForVideoWithVideoID({ videoID, pageToken, numberOfComments}) {

    numberOfComments = Math.max(Math.min(numberOfComments, 100), 1);

    let url = String.raw`https://www.googleapis.com/youtube/v3/commentThreads?key=${ytAPIKey}&videoId=${videoID}&maxResults=${numberOfComments}&part=snippet,id&order=relevance`;
    if (pageToken !== undefined) {
        url += "&pageToken=" + videoID;
    }

    const json = await getJsonDataFromURL(url);

    const nextPageToken = json.nextPageToken;
    const previousPageToken = json.previousPageToken;
    const itemList = json.items.map((item) => {
        return new VideoComment(item);
    });
    return new YoutubeAPIListReponse(itemList, previousPageToken, nextPageToken);

}

export async function getRepliesToCommentWithCommentID(commentID) {
    const url = String.raw`https://www.googleapis.com/youtube/v3/comments?key=${ytAPIKey}&part=snippet&parentId=${commentID}&maxResults=100`;
    const json = await getJsonDataFromURL(url);
    return json.items.map((json) => new VideoComment(json));
}


export async function getChannelForChannelID(channelID) {
    const url = String.raw`https://www.googleapis.com/youtube/v3/channels?key=${ytAPIKey}&id=${channelID}&part=snippet,statistics`;
    const json = await getJsonDataFromURL(url);
    const items = json.items;
    if (items.length > 0) {
        return new Channel(items[0]);
    } else {
        return Promise.reject("The channel for the provided channel id could not be found.");
    }

}

export async function getSearchResultsForSearchText({ searchText, numberOfResults, pageToken }) {
    numberOfResults = Math.max(Math.min(numberOfResults, 50), 1);
    let url = String.raw`https://www.googleapis.com/youtube/v3/search?key=${ytAPIKey}&part=snippet&maxResults=${numberOfResults}&q=${searchText}&type=video`;

    if (pageToken !== undefined) {
        url += "&pageToken=" + pageToken;
    }

    const searchResultsJson = await getJsonDataFromURL(url);

    const nextPageToken = searchResultsJson.nextPageToken;
    const previousPageToken = searchResultsJson.previousPageToken;
    const videoIDs = searchResultsJson.items.map((item) => item.id.videoId);

    const videosArray = await getYoutubeVideosFor(videoIDs);

    return new YoutubeAPIListReponse(videosArray, previousPageToken, nextPageToken);
}


async function getYoutubeVideosFor(videoIDs) {
    const ytIDsString = videoIDs.join();
    const videoInfoURL = String.raw`https://www.googleapis.com/youtube/v3/videos?key=${ytAPIKey}&part=snippet,statistics&id=${ytIDsString}`;
    const json = await getJsonDataFromURL(videoInfoURL);

    return json.items.map((item) => {
        return new Video(item);
    });
}


async function getJsonDataFromURL(url) {
    return new Promise((success, failure) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = () => {
            if (xhr.status !== 200) {
                failure("Something went wrong when trying to fetch data from Youtube");
                return;
            }
            const json = JSON.parse(xhr.responseText);
            success(json);
        };
        xhr.send();
    });
}


