// Fired when a connection is made from a content script (content_script.js)
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
    $('#errors').html(old_html + '<br>' + location);
  });
}

function appendURL(link) {
  $('#results').html(function (index, old_html) {
    $('#results').html(old_html + '<br>' + link);
  });
}

chrome.extension.onConnect.addListener(function (port) {
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
    url = $.url(extracted_urls[u]);
    host = url.attr('host').replace('www.', '');

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
    else if (url.param('url') !== null && downloadable_link === null) {
      var url_ = $.url(url.param('url'));
      host = url_.attr('host').replace('www.', '');
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
  // for all the tabs in the current window
  chrome.windows.getAll(
    {populate: true},
    function handleWindows(windows) {
      var hosts_of_interest = [
          'library.nu',
          'avaxhome.ws',
          'avaxhome.bz',
          'tutolearning.com',
          'avaxho.me',
          'avaxhome.cc',
          'avaxhm.com'
        ]
        , url = null
        , current_tab = null
        , bkg = chrome.extension.getBackgroundPage()
        , extracted_urls = null;

      for (var i = 0; i < windows.length; ++i) {
        for (var j = 0; j < windows[i].tabs.length; ++j) {
          current_tab = windows[i].tabs[j];

          url = $.url(current_tab.url);
          // if we're not interested in this url, continue
          if (hosts_of_interest.indexOf(url.attr('host')) === -1) {
            continue;
          }
          chrome.tabs.executeScript(current_tab.id, {file: "content_script.js"}, function(r) {
            handleExtractedText(r[0]);
          });
        } // end for (j)
      } // end for (i)
    });
}

Clipboard = {};
Clipboard.utilities = {};
Clipboard.utilities.createTextArea = function (value) {
  var txt = document.createElement('textarea');
  txt.style.position = "absolute";
  txt.style.left = "-100%";
  if (value != null)
    txt.value = value;
  document.body.appendChild(txt);
  return txt;
};
Clipboard.copy = function (data) {
  if (data == null) return;
  var txt = Clipboard.utilities.createTextArea(data);
  txt.select();
  document.execCommand('Copy');
  document.body.removeChild(txt);
};

function copy2cb(id) {
  var src = document.getElementById(id).innerText;
  Clipboard.copy(src);
}

$(window).load(onLoad);
$(document).ready(function(){
  $('#button1').click(function() {
    console.log('lolol');
    return copy2cb('results');
  });
  $('#button2').click(function() {
    console.log('this bitch is ready');
    return copy2cb('errors');
  });
});
