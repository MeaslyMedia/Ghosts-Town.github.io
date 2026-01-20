// Reading text from a file sourced from: https://stackoverflow.com/questions/28828029/html-read-txt-file-from-url-location-in-javascript
// Parsing XML: https://developer.mozilla.org/en-US/docs/Web/XML/Guides/Parsing_and_serializing_XML
// Sticking HTML into... HTML: https://stackoverflow.com/questions/584751/inserting-html-into-a-div

// Local path to the rss feed file
const FEED_XML_FILE_URL = "feed.xml";

// The HTML for our individual episode
// Note the /EPISODE_HEADER/ and /EPISODE_MP3/ strings, we use for later replacement
const EPISODE_TEMPLATE_BODY_HTML = `
    <div class="episode">
        <h3>/EPISODE_HEADER/</h3>
        <audio controls>
        <source src="/EPISODE_MP3/"/>
        </audio>
    </div>`
;

// FUNCTIONS AND CLASSES

// Shortcut function to scrape stuff out of a node
function getTextFromXMLNode(node, name) {
    return node.getElementsByTagName(name)[0].innerHTML;
}

// Classes can be COMPLICATED, but you can think of them like actors in videogames
// ie a Mario class would have variables like position, height, isBigMario, etc...
// BUT you can also give classes behaviour, so doJump(), die(), etc...

// PodcastEpisode is a container for podcast data, partitioned into a class so our
// code is slightly nicer to work with
class PodcastEpisode {
    constructor(xmlNode) {
        // Alll the tag names of the stuff we wanna rip out
        const EPISODE_TITLE_TAG_NAME = "title";
        const EPISODE_MP3_TAG_NAME = "enclosure";
        const EPISODE_SEASON_TAG_NAME = "itunes:season"; // we're gonna steal iTunes' data for our own purposes, hehe
        const EPISODE_EPISODE_TAG_NAME = "itunes:episode";

        this.title = getTextFromXMLNode(xmlNode, EPISODE_TITLE_TAG_NAME);
        this.link = xmlNode.getElementsByTagName(EPISODE_MP3_TAG_NAME)[0].attributes[0].nodeValue; // There is no better way to do this
        this.season = getTextFromXMLNode(xmlNode, EPISODE_SEASON_TAG_NAME);
        this.episode = getTextFromXMLNode(xmlNode, EPISODE_EPISODE_TAG_NAME);
    }
};

// Build a list of episodes (as HTML) and stick it in the page nice n good...
function buildEpisodeList(episodes) {
    // Get a reference to the div in our html file that we wanna stick the episodes in
    const episodesDiv = document.getElementById("episodes");

    // Another way of doing 'for' loops, this time we don't need to worry about indexes
    // though, so we have our komputer give us the episodes directly
    episodes.forEach(episode => {
        // Construct our episode header (ie S1E3: bonetown)
        var episodeHeader = `S${episode.season}E${episode.episode}: ${episode.title}`;

        // Take our template HTML, then swap our values in place of the temporary ones we left
        var newEpisodeHTML = EPISODE_TEMPLATE_BODY_HTML.replace("/EPISODE_HEADER/", episodeHeader)
                                                       .replace("/EPISODE_MP3/", episode.link);

        // Stick our new HTML onto the old HTML. Wahoo! We're done!
        episodesDiv.innerHTML += newEpisodeHTML;
    });
}

function parseXMLFeedAndGetEpisodes(xmlString) {
    // Each of these tags correspond to values in the xml
    // We define them all up here to make modification easier, and 
    const EPISODE_ROOT_OBJECT_TAG_NAME = "item";
    
    // Object to get data out of an XML string
    const parser = new DOMParser();

    // Our XML contents, represented in a more "programatic" way
    const document = parser.parseFromString(xmlString, "application/xml");

    // Catch any errors (probably unnecessary)
    const errorNode = document.querySelector("parsererror");
    if (errorNode) {
        // If we had an error, log something, and get out of the function!!
        console.log("Couldn't parse!");
        return;
    }

    // Get a list of our epsides given the episode item
    const episodeNodeList = document.getElementsByTagName(EPISODE_ROOT_OBJECT_TAG_NAME);
    var episodeList = []; // Create an empty array to store our episodes in

    // Iterate over this list, and start constructing our episode data
    for (var index = 0; index < episodeNodeList.length; index++) {
        var episodeNode = episodeNodeList[index];
        var episode = new PodcastEpisode(episodeNode);

        episodeList.push(episode);
    }

    return episodeList;
}

// Our "main function", where most of our logic happens
// Note that having a 'main' is common in other languages, not so common in JavaScript. You can kind of just chuck shit out wherever you want lmao and it'll "generally" work
// I added a main because I hate Javascript, and wanted some organization!!
function main() {
    // Get the file from the given url
    fetch(FEED_XML_FILE_URL)
        // .then is a shitty Javascript convention that lets you run a piece of code when the first piece is finished
        // In this case, we extract the text from the file
        // Note the convention of x => x.someOperation(). This is a lambda. It's a tiny function
        .then(rawFile => rawFile.text())
        // then once we've gotten the text out, we fire it off to a function to parse it into a list
        .then(text => {
            // Get the episodes as a list
            var episodes = parseXMLFeedAndGetEpisodes(text);
            
            // Then insert them into the page
            buildEpisodeList(episodes);
        });
}

main();