// Copyright 2018 westcide.com All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
// Add a listener to create the initial context menu items,
// context menu items only need to be created at runtime.onInstalled
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
  let regex = RegExp('[0-9]{4}','g');
  let securityCode = regex.exec(item.selectionText);
  let url =
//    'https://google.' + item.menuItemId + '/search?q=' + item.selectionText;
    item.menuItemId.replace(/\<CODE\>/,securityCode[0]);
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
