import {jsdom} from 'jsdom';
// init jsdom
global.document = jsdom();
global.window = document.defaultView;
// add support for page visibility api
document.hidden = false;
