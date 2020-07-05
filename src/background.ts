/*
  This runs in the background
*/
import {openList} from './popup';
import 'crx-hotreload';

/**
 * base color for the badge text
 */
let badgeColor: chrome.browserAction.BadgeBackgroundColorDetails = {color: [32, 7, 114, 255]};

/**
 * badge text color while the tab order update timer is active
 */
let tabTimerBadgeColor = {color: [255, 106, 0, 255]};


function initBadgeIcon() {
    // set the badge colour
    chrome.browserAction.setBadgeBackgroundColor(badgeColor);
    updateBadgeText();
}

function showTabCount() {
    return true;
}

/**
 * update the number of open tabs displayed on the extensions badge/icon
 */


function updateBadgeText() {
    if (showTabCount()) {
        let val: number = 0;
        const queryInfo: chrome.tabs.QueryInfo = {currentWindow: true};
        chrome.tabs.query(queryInfo, (result: chrome.tabs.Tab[]) :void => {
            val = result.length;
            chrome.browserAction.setBadgeText({text: val.toString()});
        });
    } else {
        chrome.browserAction.setBadgeText({text: ""});
    }
}

chrome.runtime.onInstalled.addListener(function(details) {
    /*
      contextMenus show up when you right click
     */
    chrome.contextMenus.create({
        "title": "Link-Xtractor",
        "id": "Link-Xtractor-ContextMenuOpen",
        /*
          this allows us to only show the context menus
           when we've made a selection
        */
        "contexts":["selection"]
    });

    chrome.contextMenus.onClicked.addListener((info:chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab): void => {
        console.log(info);
        if (info.menuItemId === "Link-Xtractor-ContextMenuOpen") {
            console.log(info.selectionText);
            openList(info.selectionText);
        }
    });
});


chrome.tabs.onCreated.addListener(updateBadgeText);
chrome.tabs.onRemoved.addListener(updateBadgeText);
chrome.tabs.onReplaced.addListener(updateBadgeText);
chrome.windows.onFocusChanged.addListener(updateBadgeText);

updateBadgeText();
