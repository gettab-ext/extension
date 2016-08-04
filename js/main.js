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
import '../blocks/tableau/tableau';
import '../blocks/todo/todo';
import '../blocks/music/music';

import page from '../blocks/page/page';
import stat from '../blocks/utils/stat';

page.setInited();
stat.sendPageView();
