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

result = extractLinks();
// this is a content script, so the last expression evaluated
// (not an assignment) is the only thing that can be returned.
result