

import { SVGIcons } from '../../javascript/helpers/svg-icons.js';
import * as Help from "../../javascript/helpers.js";
import * as YTHelpers from "../../javascript/youtube-api.js";
import NetworkResponse from "../../javascript/helpers/NetworkResponse.js";


export default class CommentBox {


	constructor(comment) {
		this.comment = comment;
		Object.assign(this, getCommentBoxNodeProperties(comment));
		this.readMoreButton.isHidden = true;
		this.loadingIndicatorBox.isHidden = true;
		this.repliesBox.isHidden = true;
		this._configureViewRepliesButton();
		this._addDocumentBodyDidChangeListener();
	}

	
	_addDocumentBodyDidChangeListener(){
		const bodyDidChangeSymbol = Symbol("comment box observer");

		Help.documentBodyDidChangeNotification.listen(bodyDidChangeSymbol, (records) => {
			for (const record of records){
				for (const addedNode of record.addedNodes){
					if (addedNode === this || addedNode.contains(this.node)){
						this._collapseCommentTextIfNeeded();
						Help.documentBodyDidChangeNotification.removeListener(bodyDidChangeSymbol);
					}
				}
			}
		});
	}


	_collapseCommentTextIfNeeded() {
		if (this.reviewTextBox.clientHeight >= 80) {
			this.readMoreButton.isHidden = false;
			this._toggleCommentCollapsedState();
			this.readMoreButton.addEventListener("click", () => {
				this._toggleCommentCollapsedState();
			});
		}
	}

	_configureViewRepliesButton(){
		const numOfReplies = this.comment.numOfReplies;
		if (numOfReplies < 1) { return; }

		this.viewRepliesButton.isHidden = false;
		this.viewRepliesButton.addEventListener("click", () => {
			this._toggleRepliesBoxVisibility();
		});

		this.viewRepliesButton.innerHTML = this._viewRepliesExpandButtonText;
	};

	_toggleCommentCollapsedState() {
		const readMoreText = "Read more";
		const readLessText = "Read less";
		const collapsedClass = "collapsed";

		this.reviewTextBox.classList.toggle(collapsedClass);
		this.readMoreButton.innerHTML = this.reviewTextBox.classList.contains(collapsedClass) ? readMoreText : readLessText
	}

	get _viewRepliesExpandButtonText() {
		const numOfReplies = this.comment.numOfReplies;
		if (numOfReplies === 1) {
			return String.raw`View reply`;
		} else {
			const replyCountString = Help.getLongNumberStringFrom(numOfReplies);
			return String.raw`View all ${replyCountString} replies`;
		}
	}

	get _viewRepliesCollapseButtonText() {
		return "Hide replies";
	}

	_toggleRepliesBoxVisibility() {
		this.repliesBox.toggleIsHidden();
		this.viewRepliesButton.innerHTML = this.repliesBox.isHidden ? this._viewRepliesExpandButtonText : this._viewRepliesCollapseButtonText;
		this._fetchAndDisplayRepliesIfNeeded();
	}

	isCurrentlyFetchingReplies = false;

	_fetchAndDisplayRepliesIfNeeded(){
		const hasLoadedReplies = this.repliesHolder.children.length !== 0;
		
		if (hasLoadedReplies === false &&
			this.isCurrentlyFetchingReplies === false) {
			
			this.loadingIndicatorBox.isHidden = false;
			this.isCurrentlyFetchingReplies = true
			YTHelpers.getRepliesToCommentWithCommentID(this.comment.id, (callback) => {
				this.loadingIndicatorBox.isHidden = true;
				this.isCurrentlyFetchingReplies = false;
				if (callback.status === NetworkResponse.failureStatus) { return; }
				this._setRepliesTo(callback.result);
			});
		}
	}

	_setRepliesTo(comments) {
		const commentBoxes = comments.map((comment) => new CommentBox(comment))
		const newCommentNodes = commentBoxes.map((box) => box.node);
		this.repliesHolder.append(...newCommentNodes);
		
	}


}










// returns an object containing all the nodes as properties, that must be set on each comment box
function getCommentBoxNodeProperties(comment){
	const objectToReturn = {};
	objectToReturn.node = div({classString: "user-comment-box", children: [
		div({classString: "profile-image", children: [
			img(comment.authorProfileImageURL)
		]}),
		div({classString: "right-content", children: [
			p({classString: "top-text", children: [
				span({classString: "name", children: [
					text(comment.authorName)
				]}),
				span({classString: "time subtitle", children: [
					text(Help.getTimeSinceDateStringFrom(comment.publishedAtDate))
				]})
			]}),

			objectToReturn.reviewTextBox = p({classString: "review-text", children: [
				...Help.parseHTMLFrom(comment.text)
			]}),

			objectToReturn.readMoreButton = p({classString: "read-more-button button"}),

			div({classString: "like-dislike-buttons", children: [
				div({classString: "like-button like-dislike-button unsupported-feature-button", children: [
					...Help.parseHTMLFrom(SVGIcons.likeButton())
				]}),
				div({classString: "num-of-likes", children: [
					text(Help.getShortNumberStringFrom(comment.numOfLikes))
				]}),
				div({classString: "dislike-button like-dislike-button unsupported-feature-button", children: [
					...Help.parseHTMLFrom(SVGIcons.dislikeButton())
				]}),
				p({classString: "reply-button uppercase-text-button unsupported-feature-button", children: [
					text("reply")
				]})
			]}),

			objectToReturn.viewRepliesButton = div({classString: "view-replies-button button"}),

			objectToReturn.repliesBox = div({classString: "replies-box", children: [

				objectToReturn.loadingIndicatorBox = div({classString: "replies-loading-indicator-box", children: [
					div({classString: "loading-indicator"})
				]}),

				objectToReturn.repliesHolder = div({classString: "replies-holder"})
			]})
		]})
	]});
	return objectToReturn;
}