chrome.browserAction.onClicked.addListener(function(tab) {

  console.log('lucy is the best!');

//  function handleWindows(windows) {
//    var hosts_of_interest = [
//        'library.nu',
//        'avaxhome.ws',
//        'avaxhome.bz',
//        'tutolearning.com',
//        'avaxho.me',
//        'avaxhome.cc',
//        'avaxhm.com'
//      ]
//      , url = null
//      , current_tab = null
//      , bkg = chrome.extension.getBackgroundPage()
//      , extracted_urls = null;
//
//    for (var i = 0; i < windows.length; ++i) {
//      for (var j = 0; j < windows[i].tabs.length; ++j) {
//        current_tab = windows[i].tabs[j];
//
//        url = $.url(current_tab.url);
//        // if we're not interested in this url, continue
//        if (hosts_of_interest.indexOf(url.attr('host')) === -1) {
//          continue;
//        }
//        chrome.tabs.executeScript(current_tab.id, {file: 'jquery.min.js'}, function () {
//          console.log(current_tab.url + ' --- ' + current_tab.id);
//          chrome.tabs.executeScript(current_tab.id, {file: "content_script.js"});
//        })
//      } // end for (j)
//    } // end for (i)
//  });
});