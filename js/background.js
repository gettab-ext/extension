import 'babel-polyfill';

import '../blocks/action-button/action-button';
import '../blocks/weather/weather-backend';

import initAutofocus from '../blocks/utils/autofocus';
import stat from '../blocks/utils/stat';

initAutofocus();
stat.init();
