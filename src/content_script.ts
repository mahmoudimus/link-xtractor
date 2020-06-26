function extractLinks() {
    var result = [];
    var metadata = '';
    var title = document.title;
    var links = document.getElementsByTagName('a');
    var el = document.querySelector(
        'div#main-info-container > \
div[id^="news"] > \
div.text.clear-both'
    );
    var info = el ? (el.textContent) : '';
    if(info !== '') {
        let links: any[] = info.trim().split('\n');
        title = links[0].toString().replace(/\s+/g, ' ');
        metadata = links[1].toString().trim()
            .replace(/[\|\s]+/g, ' ')
            .replace(' Pages ISBN:', 'pg ')
            .replace(/\s+/g, ',');
    }
    for (var i = 0; i < links.length; i++) {
        result.push(links[i].href);
    }
    return {
        'result': result,
        'loc': window.location.href,
        'title': '"' + title + '"',
        'metadata': metadata
    };
}


chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {

    if (msg.color) {
        console.log('Receive color = ' + msg.color);
        document.body.style.backgroundColor = msg.color;
        sendResponse('Change color to ' + msg.color);
    } else {
        sendResponse('Color message is none.');
    }
});


var result = extractLinks();
// this is a content script, so the last expression evaluated
// (not an assignment) is the only thing that can be returned.
result;
