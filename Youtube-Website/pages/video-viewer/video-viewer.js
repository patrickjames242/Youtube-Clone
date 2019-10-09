


import * as Help from '/javascript/helpers.js';
import ContentHolder from './contentHolder/ContentHolder.js';

const videoID = (new URL(window.location)).searchParams.get("videoID");

Help.executeWhenDocumentIsLoaded(() => {

	Help.addHeaderToDocument();

	const contentHolder = new ContentHolder(videoID);
	document.querySelector("main").append(contentHolder.node);
	contentHolder.startFetchingDataFromYoutube();

	configureYoutubePlayer();

});


function configureYoutubePlayer() {
	const ytPlayerScript = document.createElement("script");
	ytPlayerScript.setAttribute("src", "https://www.youtube.com/iframe_api");
	document.head.appendChild(ytPlayerScript);

	var player;
	function onYouTubeIframeAPIReady() {
		player = new YT.Player('player', {
			height: '100%',
			width: '100%',
			videoId: videoID,
			events: {
				'onReady': onPlayerReady,
			}
		});
	}

	window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

	function onPlayerReady(event) {
		player.playVideo();
	}
}



