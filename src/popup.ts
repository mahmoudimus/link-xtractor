import * as moment from 'moment';
import * as $ from 'jquery';


function copyToClipboard(text: string, callback: (x:string) => void){
    if (text == null) return;
    const input = document.createElement('textarea');
    input.value = text;
    input.focus();
    input.select();
    document.execCommand('Copy');
    input.remove();
    callback(text);
}


function copy2cb(id) {
    const text = document.getElementById(id).innerText;
    copyToClipboard(text, (x) => x);
}


var download_hosts_of_interest = {
  'ifile.it': function ifileit(url) {
    return url.attr('source');
  },
  'filesonic.com': function filesonic(url) {
    // if the url starts with /file, its downloadable
    if (url.attr('path') !== null &&
      url.attr('path').indexOf('/file') === 0) {
      return url.attr('source');
    }
    // else return null
    return null;
  },
  'filepost.com': function filepost(url) {
    // if the url starts with /file, its downloadable
    if (url.attr('path') !== null &&
      url.attr('path').indexOf('/files') === 0) {
      return url.attr('source');
    }
    // else return null
    return null;
  },
  'fp.io': function filepost(url) {
    return url.attr('source');
  },
  'rapidshare.com': function rapidshare(url) {
    return url.attr('source');
  },
  'uploaded.net': function uploaded(url) {
    return url.attr('source');
  },
  'ul.to': function uploaded(url) {
    return 'uploaded.net/file' + url.attr('path');
  },
  'ryushare.com': function uploaded(url) {
    return url.attr('source');
  },
  'livefile.org': function uploaded(url) {
    return url.attr('source');
  },
  'k2s.cc': function uploaded(url) {
    return url.attr('source');
  },
  'keep2share.cc': function uploaded(url) {
    return url.attr('source');
  }
};

function noDownloadableLink(location) {
  $('#errors').html(function (index, old_html) {
      return old_html + '<br>' + location;
  });
}

function appendURL(link) {
  $('#results').html(function (index, old_html) {
      return old_html + '<br>' + link;
  });
}

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(handleExtractedText);
});


function handleExtractedText(message) {
  console.log(message);
  var location = message.loc;
  var extracted_urls = message.result;
  var downloadable_link = null;
  var url;
  var host;
  var added = false;

  for (var u = 0; u < extracted_urls.length; ++u) {
    const url = new URL(extracted_urls[u]);
    host = url.host.replace('www.', '');

    /* We check to see if the url has a host that's interesting to us */
    if (download_hosts_of_interest.hasOwnProperty(host) === true &&
        downloadable_link === null)
    {
      downloadable_link = download_hosts_of_interest[host](url);

      if (downloadable_link !== null)
      {
        if(downloadable_link.indexOf('http') != 0) {
          downloadable_link = 'http://' + downloadable_link;
        }
        appendURL([
          downloadable_link,
          message.metadata,
          message.title
        ].join(','));
        downloadable_link = null;
        added = true;
      }
    }
    /*
     This case handles urls that are are part of a ?url= parameter
     It also ensure that downloadable link hasn't been set.
     */
    else if (url.href !== null && downloadable_link === null) {
      const url_ = new URL(url.href);
      host = url_.host.replace('www.', '');
      if (download_hosts_of_interest.hasOwnProperty(host) === true) {
        downloadable_link = download_hosts_of_interest[host](url_);
      }
    }

  } //end for

  // check to see if the downloadable link had something
  if (downloadable_link == null && added === false) {
    noDownloadableLink([
      location,
      message.metadata,
      message.title
    ].join(','));
  }


} // end addListener
function onLoad() {

  chrome.storage.sync.get('interesting_hosts', function (data) {
    var hosts_of_interest = data['interesting_hosts'] || [];
    // for all the tabs in the current window
    chrome.windows.getAll({
        populate: true
      },
      function handleWindows(windows) {
        var url = null
          , current_tab = null;
        for (var i = 0; i < windows.length; ++i) {
          for (var j = 0; j < windows[i].tabs.length; ++j) {
            current_tab = windows[i].tabs[j];
            const url = new URL(current_tab.url);
            // if we're not interested in this url, continue
            if (hosts_of_interest.indexOf(url.host) === -1) {
              continue;
            }
            chrome.tabs.executeScript(
              current_tab.id,
              {file: "content_script.js"},
              function (r) {
                handleExtractedText(r[0]);
              });
          } // end for (j)
        } // end for (i)
      });
  });
}


$(window).on("load", onLoad);

let count: number  = 0;

$(function() {

  const queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    $('#url').text(tabs[0].url);
    $('#time').text(moment().format('YYYY-MM-DD HH:mm:ss'));
  });

  chrome.browserAction.setBadgeText({text: count.toString()});
  $('#countUp').click(()=>{
    chrome.browserAction.setBadgeText({text: (++count).toString()});
  });

  $('#changeBackground').click(()=>{
      // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.query(queryInfo, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {color: '#555555'},(msg) => {
              console.log("result message:", msg);
          });
      });
  });
    $('#button1').click(()=> {
        console.log('lolol');
        return copy2cb('results');
    });
    $('#button2').click(()=> {
        console.log('this bitch is ready');
        return copy2cb('errors');
    });

});
