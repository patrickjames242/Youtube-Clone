
import NetworkResponse from "./helpers/NetworkResponse.js"; 

const ytAPIKey = "AIzaSyDvO-B0N8F6yG_Yh2_7PiEpp1r9dTHiiaE";

// const ytAPIKey = "AIzaSyDXn6ZJ1Zi01Zlp8irQY0g_Z-WBgR7UDdc";

export class YoutubeAPIListReponse{
    constructor(itemList, previousPageToken, nextPageToken){
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


export function getMostPopularYTVideos({numberOfVideos, pageToken, completion}) {

    numberOfVideos = Math.max(Math.min(numberOfVideos, 50), 1);
    let url = `https://www.googleapis.com/youtube/v3/videos?key=${ytAPIKey}&part=snippet,statistics&chart=mostPopular&maxResults=${numberOfVideos}`;

    if (pageToken !== undefined){
        url = url + "&pageToken=" + pageToken;
    }

    getJsonDataFromURL(url, (callback) => {
        const response = callback.mapSuccess((json) => {
            const nextPageToken = json.nextPageToken;
            const previousPageToken = json.previousPageToken;
            const videos = json.items.map((item) => {
                return new Video(item);
            });
            return new YoutubeAPIListReponse(videos, previousPageToken, nextPageToken);
        })
        completion(response);
    });
}

export function getVideoObjectForVideoID(videoID, completion) {
    const url = String.raw`https://www.googleapis.com/youtube/v3/videos?key=${ytAPIKey}&part=id,snippet,statistics&id=${videoID}`;
    getJsonDataFromURL(url, (callback) => {
        const completionResult = callback.flatMapSuccess((result) => {
            const items = result.items;
            if (items.length < 1) {
                return NetworkResponse.failure("The video information could not be found for the video id provided");
            } else {
                const video = new Video(items[0]);
                return NetworkResponse.success(video);
            }
        })
        completion(completionResult);
    });
}




export function getRecommendedVideosForVideoWithVideoID({videoId, numberOfVideos, pageToken, completion}) {

    numberOfVideos = Math.max(Math.min(numberOfVideos, 50), 1);

    let recommendedVideosURL = String.raw`https://www.googleapis.com/youtube/v3/search?key=${ytAPIKey}&relatedToVideoId=${videoId}&part=snippet&type=video&maxResults=${numberOfVideos}`;

    if (pageToken !== undefined){
        recommendedVideosURL += "&pageToken=" + pageToken;
    }

    getJsonDataFromURL(recommendedVideosURL, (callback) => {

        if (callback.status === NetworkResponse.failureStatus) {
            completion(callback); return;
        }

        const nextPageToken = callback.result.nextPageToken;
        const previousPageToken = callback.result.previousPageToken;
    
        const ytIDs = callback.result.items.map((item) => {
            return item.id.videoId;
        })

        getYoutubeVideosFor(ytIDs, (callback1) => {
            const response = callback1.mapSuccess((result) => {
                return new YoutubeAPIListReponse(result, previousPageToken, nextPageToken);
            });
            completion(response);
        });
    });
}




export function getCommentsForVideoWithVideoID({videoID, pageToken, numberOfComments, completion}) {

    numberOfComments = Math.max(Math.min(numberOfComments, 100), 1);

    let url = String.raw`https://www.googleapis.com/youtube/v3/commentThreads?key=${ytAPIKey}&videoId=${videoID}&maxResults=${numberOfComments}&part=snippet,id&order=relevance`;
    if (pageToken !== undefined){
        url += "&pageToken=" + videoID;
    }


    getJsonDataFromURL(url, (callback) => {

        const response = callback.mapSuccess((json) => {
            const nextPageToken = json.nextPageToken;
            const previousPageToken = json.previousPageToken;
            const itemList = json.items.map((item) => {
                return new VideoComment(item);
            });
            return new YoutubeAPIListReponse(itemList, previousPageToken, nextPageToken);
        })
        completion(response);
    });
}

export function getRepliesToCommentWithCommentID(commentID, completion) {
    const url = String.raw`https://www.googleapis.com/youtube/v3/comments?key=${ytAPIKey}&part=snippet&parentId=${commentID}&maxResults=100`;
    getJsonDataFromURL(url, (callback) => {
        const newResult = callback.mapSuccess((result) => {
            return result.items.map((json) => new VideoComment(json));
        });
        completion(newResult);
    });
}


export function getChannelForChannelID(channelID, completion) {
    const url = String.raw`https://www.googleapis.com/youtube/v3/channels?key=${ytAPIKey}&id=${channelID}&part=snippet,statistics`;
    getJsonDataFromURL(url, (callback) => {
        const response = callback.flatMapSuccess((result) => {
            const items = result.items;
            if (items.length > 0) {
                return NetworkResponse.success(new Channel(items[0]));
            } else {
                return NetworkResponse.failure("The channel for the provided channel id could not be found.");
            }
        });
        completion(response);
    });
}

export function getSearchResultsForSearchText(searchText, numberOfResults, completion) {
    numberOfResults = Math.max(Math.min(numberOfResults, 50), 1);
    const url = String.raw`https://www.googleapis.com/youtube/v3/search?key=${ytAPIKey}&part=snippet&maxResults=${numberOfResults}&q=${searchText}`;
    getJsonDataFromURL(url, (callback) => {
        if (callback.status === NetworkResponse.failureStatus) {
            completion(callback);
            return;
        }
        const videoIDs = callback.result.items.map((item) => item.id.videoId);

        getYoutubeVideosFor(videoIDs, (callback) => completion(callback));

    });
}


function getYoutubeVideosFor(videoIDs, completion) {
    const ytIDsString = videoIDs.join();

    const videoInfoURL = String.raw`https://www.googleapis.com/youtube/v3/videos?key=${ytAPIKey}&part=snippet,statistics&id=${ytIDsString}`;

    getJsonDataFromURL(videoInfoURL, (callback) => {
        const response = callback.mapSuccess((json) => {
            return json.items.map((item) => {
                return new Video(item);
            });
        })
        completion(response);
    });
}


function getJsonDataFromURL(url, completion) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = () => {
        if (xhr.status !== 200) {
            console.log("getJsonDataFromURL function encountered an error. Here it is: ", xhr.response);
            const response = NetworkResponse.failure("Something went wrong when trying to fetch data from Youtube");
            completion(response);
            return;
        }

        const json = JSON.parse(xhr.responseText);
        const response = NetworkResponse.success(json);
        completion(response);
    };
    xhr.send();
}


