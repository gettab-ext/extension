import 'babel-polyfill';

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ').');
});

import '../blocks/settings/settings';
import '../blocks/search/search';
import '../blocks/settings-panel/settings-panel';
import '../blocks/wallpaper/wallpaper';
import '../blocks/weather/weather';
import '../blocks/apps/apps';
import '../blocks/bookmarks/bookmarks';
import '../blocks/most-visited/most-visited';
import '../blocks/todo/todo';
import '../blocks/music/music';

import storage from '../blocks/utils/storage';
import page from '../blocks/page/page';
import stat from '../blocks/utils/stat';
import {AUTOFOCUS} from '../blocks/config/config';

if (AUTOFOCUS) {
    storage.get('__newtab').then(flag => {
        if (flag === true) {
            storage.set('__newtab', false);
            page.setInited();
            stat.init();
        } else {
            storage.set('__newtab', true);
            chrome.tabs.create({ url: chrome.extension.getURL("index.html") });
            window.close();
        }
    });
}