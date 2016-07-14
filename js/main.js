import 'babel-polyfill';

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ').');
});

import '../blocks/utils/storage';
import '../blocks/settings/settings';
import '../blocks/page/page';
import '../blocks/search/search';
import '../blocks/settings-panel/settings-panel';
import '../blocks/wallpaper/wallpaper';
import '../blocks/weather/weather';
import '../blocks/apps/apps';

