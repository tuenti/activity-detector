# activity-detector

[![npm](https://img.shields.io/npm/v/activity-detector.svg)](https://www.npmjs.com/package/activity-detector)
[![npm](https://img.shields.io/npm/l/activity-detector.svg)](https://www.npmjs.com/package/activity-detector)
[![Build Status](https://travis-ci.org/tuenti/activity-detector.svg)](https://travis-ci.org/tuenti/activity-detector)

This module helps you detecting when the user becomes idle (does not interact with the page for some time) or active in your page.

## Install
```
$ npm install --save activity-detector
```

Or load it from npmcdn:
```html
<script src="https://npmcdn.com/activity-detector/dist/activity-detector.min.js"></script>
```

## How to use
### Basic example
```javascript
import createActivityDetector from 'activity-detector';

const activityDetector = createActivityDetector();

activityDetector.on('idle', () => {
	console.log('The user is not interacting with the page');
});

activityDetector.on('active', () => {
	console.log('The user is using the page');
});
```
### Advanced options
Activity detector allows you to configure some parameters:
- ```timeToIdle```: number of milliseconds of inactivity which makes activity detector transition to 'idle' (```30000``` by default),
- ```activityEvents```: the user events which make activity detector transition from 'idle' to 'active'. The default list of activityEvents is ```['click', 'mousemove', 'keydown', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'focus']```
- ```inactivityEvents```: the list of events which make the activity detector transition from 'active' to 'idle' without waiting for ```timeToIdle``` timeout. By default: ```['blur']```
- ```initialState```: can be ```"idle"``` or ```"active"``` (```"active"``` by default),
- ```autoInit```: when ```true``` the activity detector starts just after creation, when ```false```, it doesn't start until you call the ```.init()``` method (```true``` by default),

For example:
```javascript
const activityDetector = createActivityDetector({
	timeToIdle: 20000, // wait 20s of inactivity to consider the user is idle
	autoInit: false // I don't want to start the activity detector yet.
});

activityDetector.on('idle', handleUserIdle);

...
...

// I want to start the activity detector now!
activityDetector.init();

```

### Instance methods
An activity detector instance has the following methods:

#### ```start(initialState = 'active')```
Initializes the activity detector in the given state. This method should only be used if you created the activity detector with the ```autoInit``` option ```false```.

This method receives the ```initialState``` param. It can be ```'idle'``` or ```'active'``` (default)

#### ```on(event, handler)```
Registers an event listener for the required event

```event``` can be ```'idle'``` or ```'active'```.

```handler``` must be a function.

#### ```stop()```
Stops the activity detector and cleans the listeners.

## Development
### Run tests
```
$ npm install
$ npm test
```
