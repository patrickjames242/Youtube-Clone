

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
	objectToReturn.node = div({className: "user-comment-box"}, [
		div({className: "profile-image"}, [
			img(comment.authorProfileImageURL)
		]),
		div({className: "right-content"}, [
			p({className: "top-text"}, [
				span({className: "name"}, [
					text(comment.authorName)
				]),
				span({className: "time subtitle"}, [
					text(Help.getTimeSinceDateStringFrom(comment.publishedAtDate))
				])
			]),

			objectToReturn.reviewTextBox = p({className: "review-text"}, [
				...Help.parseHTMLFrom(comment.text)
			]),

			objectToReturn.readMoreButton = p({className: "read-more-button button"}),

			div({className: "like-dislike-buttons"}, [
				div({className: "like-button like-dislike-button unsupported-feature-button"}, [
					...Help.parseHTMLFrom(SVGIcons.likeButton())
				]),
				div({className: "num-of-likes"}, [
					text(Help.getShortNumberStringFrom(comment.numOfLikes))
				]),
				div({className: "dislike-button like-dislike-button unsupported-feature-button"}, [
					...Help.parseHTMLFrom(SVGIcons.dislikeButton())
				]),
				p({className: "reply-button uppercase-text-button unsupported-feature-button"}, [
					text("reply")
				])
			]),

			objectToReturn.viewRepliesButton = div({className: "view-replies-button button"}),

			objectToReturn.repliesBox = div({className: "replies-box"}, [

				objectToReturn.loadingIndicatorBox = div({className: "replies-loading-indicator-box"}, [
					div({className: "loading-indicator"})
				]),

				objectToReturn.repliesHolder = div({className: "replies-holder"})
			])
		])
	]);
	return objectToReturn;
}