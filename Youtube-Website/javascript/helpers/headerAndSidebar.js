
import './htmlHelpers.js';
import * as HelperFunctions from './helperFunctions.js';

import { parseHTMLFrom } from './helperFunctions.js';
import { SVGIcons } from './svg-icons.js';



export function addHeaderToDocument() {
	addheaderStyleSheet();
	document.body.prepend(getNewHeader());
}

export function addHeaderAndSideBarToDocument() {
	addheaderStyleSheet();
	addSidebarStyleSheet();
	document.body.prepend(getNewHeader(), getNewSideBarNode());
}

function addheaderStyleSheet() {
	HelperFunctions.addStyleSheetToDocument('/css/header.css');
}

function addSidebarStyleSheet() {
	HelperFunctions.addStyleSheetToDocument('/css/sidebar.css');
}

function getNewHeader() {

	let textField, searchButtonBox, searchBoxForm;

	window.shouldAllowSearchTextBoxFormSubmission = () => {
		return textField.value !== undefined &&
			textField.value !== null &&
			textField.value.trim() !== "";
	}

	const headerToReturn = header({}, [

		div({ className: "header-content" }, [
			div({ className: "left-content" }, [
				div({ className: "menu-icon header-icon unsupported-feature-button" }, [
					...parseHTMLFrom(SVGIcons.menuButton())
				]),
				a({ className: "youtube-logo", href: "/index.html" }, [
					...parseHTMLFrom(SVGIcons.youtubeLogo())
				])
			]),

			div({ className: "center-content" }, [
				div({ className: "search-box-container" }, [
					div({ className: "search-box" }, [
					 	searchBoxForm = form({ action: "/pages/search-results/search-results.html", onsubmit: "return shouldAllowSearchTextBoxFormSubmission();" }, [
							textField = input({ className: "search-placeholder subtitle", type: "search", placeholder: "Search", size: "1", name: "searchText" })
						]),
						searchButtonBox = div({ className: "search-button-box" }, [
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

	searchButtonBox.addEventListener("click", () => {
		if (window.shouldAllowSearchTextBoxFormSubmission()){
			searchBoxForm.submit();
		}
	});

	return headerToReturn;
}




function getNewSideBarNode() {

	return div({ className: "side-bar" }, [

		div({ className: "wide-content" }, [
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
		]),
		div({ className: "narrow-content" }, [
			...([
				"Home",
				"Trending",
				"Subscriptions",
				"Library",
			].map((x) => getNewNarrowIconCell(x)))
		])
	])
}




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


