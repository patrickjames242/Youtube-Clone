
const searchText = (new URL(window.location)).searchParams.get("searchText");

documentDidLoadNotification.listen(Symbol(), () => {
    
    fetchAndDisplayYoutubeData();
    document.querySelector(".search-box-container .search-placeholder").setAttribute("value", searchText);
});




function fetchAndDisplayYoutubeData(){
    
    getSearchResultsForSearchText(searchText, 30, (callback) => {
        if (callback.status !== NetworkResponse.successStatus){return;}
        const searchResultsHolderSelector = ".search-results-holder";
        const searchResultsHolder = document.querySelector(searchResultsHolderSelector);
        const searchResultsCellsHTML = callback.result.map((video) => getSearchResultsCell(video)).join("");
        searchResultsHolder.innerHTML += searchResultsCellsHTML;

        document.querySelectorAll(searchResultsHolderSelector + " .clamp").forEach((element) => applyClampToElement(element))

    });
}