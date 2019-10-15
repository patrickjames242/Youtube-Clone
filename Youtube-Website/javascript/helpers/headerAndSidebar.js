
import './htmlHelpers.js';
import * as HelperFunctions from './helperFunctions.js';

import { parseHTMLFrom } from './helperFunctions.js';
import { SVGIcons } from './svg-icons.js';
import { windowSizeDidChangeNotification } from './notifications.js';
import NodeController from './NodeController.js';


export async function addHeaderToDocument() {
	return Promise.all([addheaderStyleSheet(), addSidebarStyleSheet()]).finally(() => {

		const headerController = new HeaderController();
		headerController.menuButton.addEventListener("click", () => {
			document.body.prepend((new SlideInSideBarController()).node);
		});
		document.body.prepend(headerController.node);
	});
}

export async function addHeaderAndSideBarToDocument() {
	return Promise.all([addheaderStyleSheet(), addSidebarStyleSheet()]).finally(() => {

		const sideBarController = new SideBarController();
		const headerController = new HeaderController();

		headerController.menuButton.addEventListener("click", () => {
			sideBarController.notifyThatHeaderMenuButtonWasClicked();
		});

		document.body.prepend(headerController.node, sideBarController.node);

	})
}

async function addheaderStyleSheet() {
	return HelperFunctions.addStyleSheetToDocument('/css/header.css');
}

async function addSidebarStyleSheet() {
	return HelperFunctions.addStyleSheetToDocument('/css/sidebar.css');
}

class HeaderController extends NodeController {

	constructor() {
		super();
		this._addSearchBoxButtonClickListener();
	}

	_addSearchBoxButtonClickListener() {
		this.searchButtonBox.addEventListener("click", () => {
			if (window.shouldAllowSearchTextBoxFormSubmission()) {
				this.searchBoxForm.submit();
			}
		});
	}

	static getNewProperties() {
		return getNewHeaderProperties();
	}
}

function getNewHeaderProperties() {

	const properties = {};

	let textField;

	window.shouldAllowSearchTextBoxFormSubmission = () => {
		return textField.value !== undefined &&
			textField.value !== null &&
			textField.value.trim() !== "";
	}

	properties.node = header({}, [

		div({ className: "header-content" }, [
			div({ className: "left-content" }, [
				properties.menuButton = div({ className: "menu-icon button header-icon" }, [
					...parseHTMLFrom(SVGIcons.menuButton())
				]),
				a({ className: "youtube-logo", href: "/index.html" }, [
					...parseHTMLFrom(SVGIcons.youtubeLogo())
				])
			]),

			div({ className: "center-content" }, [
				div({ className: "search-box-container" }, [
					div({ className: "search-box" }, [
						properties.searchBoxForm = form({ action: "/pages/search-results/search-results.html", onsubmit: "return shouldAllowSearchTextBoxFormSubmission();" }, [
							textField = input({ className: "search-placeholder subtitle", type: "search", placeholder: "Search", size: "1", name: "searchText" })
						]),
						properties.searchButtonBox = div({ className: "search-button-box" }, [
							div({ className: "search-icon" }, [
								...parseHTMLFrom(SVGIcons.searchIcon())
							])
						])
					])
				])
			]),

			div({ className: "right-content" }, [
				div({ className: "search-icon header-icon unsupported-feature-button" }, [
					...parseHTMLFrom(SVGIcons.searchIcon())
				]),
				div({ className: "apps-icon header-icon unsupported-feature-button" }, [
					...parseHTMLFrom(SVGIcons.youtubeAppsIcon())
				]),
				div({ className: "notifications-icon header-icon unsupported-feature-button" }, [
					...parseHTMLFrom(SVGIcons.notificationsAppIcon())
				]),
				getNewSignInButton(),
			])
		])
	]);

	return properties;
}




class SideBarController extends NodeController {


	constructor() {
		super();
		this._updateVisibleSideBarIfNeeded();
		this._setUpWindowResizeListener();

		
	}

	_userWantsToMinimizeSideBar = false;

	notifyThatHeaderMenuButtonWasClicked() {
		this._userWantsToMinimizeSideBar = !this._userWantsToMinimizeSideBar;
		this._updateVisibleSideBarIfNeeded();
	}

	_setUpWindowResizeListener() {
		windowSizeDidChangeNotification.anonymousListen(() => {
			this._updateVisibleSideBarIfNeeded();
		});
	}



	_updateVisibleSideBarIfNeeded() {
		const desired = this._currentDesiredSideBarType();
		if (this._currentlyVisibleSideBarType !== desired) {
			this._currentlyVisibleSideBarType = desired;
		}
	}


	static SideBarType = {
		WIDE: Symbol("wide"),
		NARROW: Symbol("narrow"),
		NONE: Symbol("none")
	}


	_currentDesiredSideBarType() {
		const width = window.innerWidth;
		if (width > 1125 && this._userWantsToMinimizeSideBar === false) {
			return SideBarController.SideBarType.WIDE;
		} else if (width > 750) {
			return SideBarController.SideBarType.NARROW;
		} else {
			return SideBarController.SideBarType.NONE;
		}
	}

	get _currentlyVisibleSideBarType() {
		switch (this.node.childNodes.item(0)) {
			case this.wideSideBar: return SideBarController.SideBarType.WIDE;
			case this.narrowSideBar: return SideBarController.SideBarType.NARROW;
			default: return SideBarController.SideBarType.NONE;
		}
	}

	set _currentlyVisibleSideBarType(newValue) {

		for (const child of this.node.childNodes) {
			child.remove();
		}
		switch (newValue) {
			case SideBarController.SideBarType.WIDE:
				this.node.append(this.wideSideBar); break;
			case SideBarController.SideBarType.NARROW:
				this.node.append(this.narrowSideBar); break;
			case SideBarController.SideBarType.NONE: break;
		}
		this._updateMainElementLeftMarginValue();
	}

	nodeWasAddedToDocument() {
		this._updateMainElementLeftMarginValue();
	}

	_updateMainElementLeftMarginValue() {
		document.querySelector("main").style.marginLeft = getComputedStyle(this.node).width;
	}


	static getNewProperties() {
		const properties = {};

		properties.narrowSideBar = getNewNarrowSideBarNode();
		properties.wideSideBar = getNewWideSideBarNode();
		properties.node = div({
			className: "side-bar-holder",
			style: `
			position: fixed;
			top: var(--header-height);
			bottom: 0;
			left: 0;
			overflow: scroll;
			background-color: var(--side-bar-background-color);
		`})
		return properties;
	}

}



class SlideInSideBarController extends NodeController{

	constructor(){
		super();
		this._addDimmerDivClickListener();
	}

	

	nodeWasAddedToDocument(){
		setTimeout(() => {
			this._setPresented(true);	
		}, 50);
	}

	_setPresented(presented){
		const presentedClass = "presented";
		if (presented){
			this.node.classList.add(presentedClass);
		} else {
			this.node.classList.remove(presentedClass);
		}
		document.body.style.overflow = presented ? "hidden" : "initial";
	}

	_addDimmerDivClickListener(){
		this.dimmerDiv.addEventListener("click", () => {
			this._setPresented(false);
			setTimeout(() => {
				this.node.remove();
			}, 1000);
		});
	}

	static getNewProperties(){
		const properties = {};

		properties.node = div({className: "slide-in-side-bar-screen"}, [
			properties.dimmerDiv = div({className: "dimmer-div"}),
			div({className: "side-bar-holder"}, [
				getNewWideSideBarNode()
			])
		]);

		return properties;
	}
}



function getNewNarrowSideBarNode() {

	function getNewNarrowIconCell(labelTitle) {
		const iconMethodName = String(labelTitle).toLowerCase() + "Icon"
		return div({ className: "cell unsupported-feature-button" }, [
			div({ className: "icon" }, [
				...parseHTMLFrom(SVGIcons[iconMethodName]())
			]),
			p({ className: "label" }, [
				text(labelTitle)
			])
		]);
	}

	return div({ className: "side-bar narrow-side-bar" }, [
		...([
			"Home",
			"Trending",
			"Subscriptions",
			"Library",
		].map((x) => getNewNarrowIconCell(x)))
	]);
}


function getNewWideSideBarNode() {

	function getNewWideIconCell(labelTitle) {
		const iconMethodName = String(labelTitle).toLowerCase() + "Icon";
		return div({ className: "cell padded-cell unsupported-feature-button" }, [
			div({ className: "icon" }, [
				...parseHTMLFrom(SVGIcons[iconMethodName]())
			]),
			p({ className: "label" }, [
				text(labelTitle)
			])
		]);
	}

	return div({ className: "side-bar wide-side-bar" }, [
		div({ className: "cell-segment underlined" }, [
			...([
				"Home",
				"Trending",
				"Subscriptions"
			].map((x) => getNewWideIconCell(x)))
		]),

		div({ className: "cell-segment underlined" }, [
			...([
				"Library",
				"History"
			].map((x) => getNewWideIconCell(x)))
		]),

		div({ className: "sign-in-segment cell-segment underlined padded-cell" }, [
			p({ className: "text" }, [
				text("Sign in to like videos, comment, and subscribe.")
			]),
			p({ className: "sign-in-button unsupported-feature-button" }, [
				div({ className: "icon" }, [
					...parseHTMLFrom(SVGIcons.signInButtonIcon())
				]),
				p({ className: "text" }, [
					text("sign in")
				])
			])
		]),

		div({ className: "footer-cell-segment cell-segment padded-cell" }, [

			div({ className: "links links1" }, [
				...([
					"About",
					"Press",
					"Copyright",
					"Contact us",
					"Creators",
					"Advertise",
					"Developers"
				].map((x) => {
					return span({ className: "link unsupported-feature-button" }, [
						text(x)
					])
				}))
			]),

			div({ className: "links links2" }, [
				...([
					"Terms",
					"Privacy",
					"Policy & Safety",
					"Test New Features"
				].map((x) => {
					return span({ className: "link unsupported-feature-button" }, [
						text(x)
					])
				}))
			]),

			div({ className: "copyright-info subtitle" }, [
				...parseHTMLFrom("&#169; 2019 YouTube, LLC")
			])
		])
	])

}










function getNewSignInButton() {
	return div({ className: "sign-in-button unsupported-feature-button" }, [
		div({ className: "icon" }, [
			...parseHTMLFrom(SVGIcons.signInButtonIcon())
		]),
		p({ className: "text" }, [
			text("sign in")
		])
	]);
}


