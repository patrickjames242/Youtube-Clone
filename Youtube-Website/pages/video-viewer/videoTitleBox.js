
import * as Help from '/javascript/helpers.js';
import {SVGIcons} from '/javascript/helpers/svg-icons.js';

export default class VideoTitleBox{
    constructor(){
        Object.assign(this, VideoTitleBox._getNodes());
    }

    updateFromVideoObject(video){
        this.titleBox.innerHTML = video.title;
        this.numberOfViewsBox.innerHTML = Help.getLongNumberStringFrom(video.numOfViews) + " views";
        this.numberOfLikesBox.innerHTML = Help.getShortNumberStringFrom(video.numOfLikes);
        this.numberOfDislikesBox.innerHTML = Help.getShortNumberStringFrom(video.numOfDislikes);
    }


    static _getNodes(){
        const nodes = {};

        nodes.node = div({className: "video-title-box underlined"}, [
            nodes.titleBox = p({className: "title"}),
            nodes.numberOfViewsBox = p({className: "subtitle views"}),
            div({className: "bottom-right-content-box"}, [
                div({className: "like-dislike-box"}, [
                    div({className: "likes"}, [
                        div({className: "icon"}, [
                            ...Help.parseHTMLFrom(SVGIcons.likeButton())
                        ]),
                        nodes.numberOfLikesBox = p({className: "num"})
                    ]), 
                    div({className: "dislikes"}, [
                        div({className: "icon"}, [
                            ...Help.parseHTMLFrom(SVGIcons.dislikeButton())
                        ]),
                        nodes.numberOfDislikesBox = p({className: "num"})
                    ])
                ]),
                nodes.watchOnYoutubeLink = a({href: "", className: "watch-on-youtube-link uppercase-text-button", target: "_target"}, [text("watch on youtube")])
            ])
        ])

        return nodes;
    }
}


