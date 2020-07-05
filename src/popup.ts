/*
  This is the pop up window that comes up from the chrome extension
 */
import * as moment from "moment";
import * as $ from "jquery";

export function copyToClipboard(text: string, callback: (x: string) => void) {
  if (text == null) return;
  const input = document.createElement("textarea");
  input.value = text;
  input.focus();
  input.select();
  document.execCommand("Copy");
  input.remove();
  callback(text);
}

export function copy2cb(selector) {
  //const text = document.getElementById(id).textContent; //innerText;
  const textArea = document.querySelector(selector);
  textArea.classList.remove("copied");
  textArea.select();
  copyToClipboard(textArea.textContent, (t) => {
    textArea.classList.add("copied");
    console.log("copied text: ", t);
  });
}

// add string trim function
String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, "");
};

export function isProbablyUrl(string) {
  var substr = string.substring(0, 4).toLowerCase();
  if (substr == "ftp:" || substr == "www.") return true;

  var substr = string.substring(0, 5).toLowerCase();
  if (substr == "http:") return true;

  var substr = string.substring(0, 6).toLowerCase();
  if (substr == "https:") return true;

  var substr = string.substring(0, 7).toLowerCase();
  if (substr == "chrome:") return true;

  return false;
}

export function openList(list) {
  var strings = list.split(/\r\n|\r|\n/);

  for (var i = 0; i < strings.length; i++) {
    // check empty
    strings[i] = strings[i].trim();
    if (strings[i] == "") continue;

    var url = strings[i];

    if (!isProbablyUrl(url)) {
      // if it looks like a URL we'll open it, otherwise we will do a Google search on it
      url = "http://www.google.com/search?q=" + encodeURI(url);
    }

    //open the new tab
    chrome.tabs.create({ url: url, selected: false });
  }
}

export function openTextAreaList() {
  openList(document.getElementById("list").textContent);
}

export function copyTextAreaList() {
  //alert("fasdd");
  //console.log("got here");
  copy2cb("#list");

  let element = document.getElementById("list") as HTMLDivElement;
  console.log(element);
}

$(function () {
  chrome.windows.getCurrent(function (window) {
    chrome.tabs.query({ windowId: window.id }, function (tabs) {
      if (!tabs.length) return;

      const listTextArea = $("#list");
      const urlList: string[] = new Array<string>();
      for (var i = 0; i < tabs.length; ++i) {
        console.log(tabs[i].url);
        urlList.push(tabs[i].url);
      }

      if (urlList.length > 0) {
        listTextArea.text(() => urlList.join("\n"));
      }
      //listTextArea.focus();
      //if (location.search != "?focusHack") location.search = "?focusHack";
      listTextArea.select();
    });
  });

  $("#openButton").click(openTextAreaList);
  $("#copyButton").click(copyTextAreaList);
  $("#body").addClass("jsloaded");

  // const queryInfo = {
  //   active: true,
  //   currentWindow: true
  // };

  // chrome.tabs.query(queryInfo, function(tabs) {
  //   $('#url').text(tabs[0].url);
  //   $('#time').text(moment().format('YYYY-MM-DD HH:mm:ss'));
  // });

  // chrome.browserAction.setBadgeText({text: count.toString()});
  // $('#countUp').click(()=>{
  //   chrome.browserAction.setBadgeText({text: (++count).toString()});
  // });

  // $('#changeBackground').click(()=>{
  //     // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //     chrome.tabs.query(queryInfo, (tabs) => {
  //         chrome.tabs.sendMessage(tabs[0].id, {color: '#555555'},(msg) => {
  //             console.log("result message:", msg);
  //         });
  //     });
  // });
  //   $('#button1').click(()=> {
  //       console.log('lolol');
  //       return copy2cb('results');
  //   });
  //   $('#button2').click(()=> {
  //       console.log('this bitch is ready');
  //       return copy2cb('errors');
  //   });
});
