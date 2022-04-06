'use strict';
importScripts('sites.js');

chrome.runtime.onInstalled.addListener(function() {
  for (let key of Object.keys(kSites)) {
    chrome.contextMenus.create({
      id: key,
      title: kSites[key],
      type: 'normal',
      contexts: ['selection'],
    });
  }
});

chrome.contextMenus.onClicked.addListener(function(item, tab) {
  let query = "";
  if(item.menuItemId.match(/twitter\.com/)){
    let replaced = item.selectionText.replace(/[\t\n\r]+/g," ");
    let regex = RegExp('([0-9]{4})(.+)','g');
    let parsed = regex.exec(replaced);
    let word = "";
    if(parsed[2]){
      let a = parsed[2].split(" ");
      word = a[0]?a[0]:a[1];
    }
    query = parsed[1]+" "+word;
  }else if(item.menuItemId.match(/textream\.yahoo\.co\.jp/)){
    let replaced = item.selectionText.replace(/[\t\n\r]+/g," ");
    let regex = RegExp('(.+)','g');
    let parsed = regex.exec(replaced);
    let word = "";
    if(parsed[1]){
      let a = parsed[1].split(" ");
      word = a[0]?a[0]:a[1];
    }
    query = word;
  }else{
    let regex = RegExp('[0-9]{4}','g');
    let securityCode = regex.exec(item.selectionText);
    query = securityCode[0];
  }
  let url = item.menuItemId.replace(/\<CODE\>/,query);
  if(item.menuItemId.match(/kabuka\.biz/)&&url&&query){
    url = url.replace(/\<CODE2\>/,query.substr(0,1));
  }  

  chrome.tabs.create({url: url, index: tab.index + 1});
});

chrome.storage.onChanged.addListener(function(list, sync) {
  let newlyDisabled = [];
  let newlyEnabled = [];
  let currentRemoved = list.removedContextMenu.newValue;
  let oldRemoved = list.removedContextMenu.oldValue || [];
  for (let key of Object.keys(kSites)) {
    if (currentRemoved.includes(key) && !oldRemoved.includes(key)) {
      newlyDisabled.push(key);
    } else if (oldRemoved.includes(key) && !currentRemoved.includes(key)) {
      newlyEnabled.push({
        id: key,
        title: kSites[key]
      });
    }
  }
  for (let locale of newlyEnabled) {
    chrome.contextMenus.create({
      id: locale.id,
      title: locale.title,
      type: 'normal',
      contexts: ['selection'],
    });
  }
  for (let locale of newlyDisabled) {
    chrome.contextMenus.remove(locale);
  }
});
