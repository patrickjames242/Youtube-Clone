
import './htmlHelpers.js';
import { parseHTMLFrom } from './helperFunctions.js';
import { SVGIcons } from './svg-icons.js';


export function addHeaderToDocument(){
	document.body.prepend(getNewHeader());
}

export function addHeaderAndSideBarToDocument(){
	document.body.prepend(getNewHeader(), getNewSideBarNode());
}



function getNewHeader(){
	return header({children: [
		div({classString: "header-content", children: [
			div({classString: "left-content", children: [
				div({classString: "menu-icon header-icon unsupported-feature-button", children: [
					...parseHTMLFrom(SVGIcons.menuButton())
				]}),
				a({classString: "youtube-logo", href: "/index.html", children: [
					...parseHTMLFrom(SVGIcons.youtubeLogo())
				]})
			]}),

			div({classString: "center-content", children: [
				div({classString: "search-box-container", children: [
					div({classString: "search-box", children: [
						form({action: "/pages/search-results/search-results.html", children: [
							input({classString: "search-placeholder subtitle", type: "search", placeholder: "Search", size: "1", name: "searchText"})
						]}),
						div({classString: "search-button-box", children: [
							div({classString: "search-icon", children:[
								...parseHTMLFrom(SVGIcons.searchIcon())
							]})
						]})
					]})
				]})
			]}),

			div({classString: "right-content", children: [
				div({classString: "search-icon header-icon unsupported-feature-button", children: [
					...parseHTMLFrom(SVGIcons.searchIcon())
				]}),
				div({classString: "apps-icon header-icon unsupported-feature-button", children: [
					...parseHTMLFrom(SVGIcons.youtubeAppsIcon())
				]}),
				div({classString: "notifications-icon header-icon unsupported-feature-button", children: [
					...parseHTMLFrom(SVGIcons.notificationsAppIcon())
				]}),
				getNewSignInButton(),
			]})
		]})
	]});
}




function getNewSideBarNode(){
	return div({classString: "side-bar", children: [
		div({classString: "wide-content", children: [
			div({classString: "cell-segment underlined", children: [
				...([
					"Home",
					"Trending",
					"Subscriptions"
				].map((x) => getNewWideIconCell(x)))
			]}),

			div({classString: "cell-segment underlined", children: [
				...([
					"Library", 
					"History"
				].map((x) => getNewWideIconCell(x)))
			]}),

			div({classString: "sign-in-segment cell-segment underlined padded-cell", children: [
				p({classString: "text", children: [
					text("Sign in to like videos, comment, and subscribe.")
				]}),
				p({classString: "sign-in-button unsupported-feature-button", children: [
					div({classString: "icon", children: [
						...parseHTMLFrom(SVGIcons.signInButtonIcon())
					]}),
					p({classString: "text", children: [
						text("sign in")
					]})
				]})
			]}),

			div({classString: "footer-cell-segment cell-segment padded-cell", children: [

				div({classString: "links links1", children: [
					...([
						"About",
						"Press",
						"Copyright",
						"Contact us",
						"Creators",
						"Advertise",
						"Developers"
					].map((x) => {
						return span({classString: "link", children: [
							text(x)
						]})
					}))
				]}),

				div({classString: "links links2", children: [
					...([
						"Terms",
						"Privacy",
						"Policy & Safety",
						"Test new features"
					].map((x) => {
						return span({classString: "link", children: [
							text(x)
						]})
					}))
				]}), 

				div({classString: "copyright-info subtitle", children: [
					...parseHTMLFrom("&#169; 2019 YouTube, LLC")
				]})
			]})
		]}), 
		div({classString: "narrow-content", children: [
			...([
				"Home",
				"Trending",
				"Subscriptions",
				"Library",	
			].map((x) => getNewNarrowIconCell(x)))
		]})
	]})
}




function getNewNarrowIconCell(labelTitle){
	const iconMethodName = String(labelTitle).toLowerCase() + "Icon"
	return div({classString: "cell", children: [
		div({classString: "icon", children: [
			...parseHTMLFrom(SVGIcons[iconMethodName]())
		]}),
		p({classString: "label", children: [
			text(labelTitle)
		]})
	]});
}

function getNewWideIconCell(labelTitle){
	const iconMethodName = String(labelTitle).toLowerCase() + "Icon";
	return div({classString: "cell padded-cell", children: [
		div({classString: "icon", children: [
			...parseHTMLFrom(SVGIcons[iconMethodName]())
		]}),
		p({classString: "label", children: [
			text(labelTitle)
		]})
	]});
}








function getNewSignInButton(){
	return div({classString: "sign-in-button unsupported-feature-button", children: [
		div({classString: "icon", children: [
			...parseHTMLFrom(SVGIcons.signInButtonIcon())
		]}),
		p({classString: "text", children: [
			text("sign in")
		]})
	]});
}


