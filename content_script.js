function extractLinks() {
  var result = [];
  var metadata = '';
  var title = document.title;
  var links = document.getElementsByTagName('a');
  var info = document.querySelector(
    'div#main-info-container > \
     div[id^="news"] > \
     div.text.clear-both'
    ).innerText;
  if(info !== '') {
    info = info.trim().split('\n');
    title = info[0].replace(/\s+/g, ' ');
    metadata = info[1].trim()
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


///* starts a long running connection process to the background.html page */
//function sendPayload() {
//  var message = extractLinks();
//  chrome.extension.connect().postMessage(message);
//  return message;
//}
//
//chrome.extension.onMessage.addListener(
//  function (request, sender, sendResponse) {
//    if (request.action == "sendPayload") {
//      sendResponse({'response': sendPayload()});
//    }
//    else
//      sendResponse({}); // Send nothing.
//  }
//);
//
///* basically a main function */
//sendPayload();
result = extractLinks();
result