import test from 'tape';
import './dom-setup';
import createActivityDetector from '../src/activity-detector';
import sinon from 'sinon';

const fireEvent = (target, eventName) => {
    const event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, true);
    target.dispatchEvent(event);
};

const fireWinEvent = eventName => fireEvent(window, eventName);
const fireDocEvent = eventName => fireEvent(document, eventName);

/**
 * This aditional time is needed when mocking the time because
 * callbacks are executed asynchronously, so we can not spy
 * callbacks until at least 1 tick after the timeToIdle.
 */
test('Activity detector fires "idle" event when no activity', t => {
    const clock = sinon.useFakeTimers();
    const onIdle = sinon.spy();
    const timeToIdle = 30000;

    const activityDetector = createActivityDetector({timeToIdle});
    activityDetector.on('idle', onIdle);

    clock.tick(timeToIdle);

    t.ok(onIdle.called, 'onIdle callback is called');

    activityDetector.stop();

    clock.restore();
    t.end();
});

test('Activity detector does not fire "idle" event when activity', t => {
    const clock = sinon.useFakeTimers();
    const onIdle = sinon.spy();
    const timeToIdle = 30000;
    const shortTime = 25000;

    const activityDetector = createActivityDetector({timeToIdle});
    activityDetector.on('idle', onIdle);

    clock.tick(shortTime);
    fireWinEvent('click');

    clock.tick(shortTime);
    fireWinEvent('click');

    clock.tick(shortTime);
    t.notOk(onIdle.called, 'onIdle callback is not called');

    clock.restore();
    activityDetector.stop();
    t.end();
});

test('Activity detector fires "idle" 30s after last user activity', t => {
    const clock = sinon.useFakeTimers();
    const onIdle = sinon.spy();
    const timeToIdle = 30000;
    const shortTime = 10000;

    const activityDetector = createActivityDetector({timeToIdle});
    activityDetector.on('idle', onIdle);

    clock.tick(shortTime);
    fireWinEvent('click');
    clock.tick(timeToIdle);

    t.ok(onIdle.called, 'onIdle callback is called');

    clock.restore();
    activityDetector.stop();
    t.end();
});

test('Activity detector fires "active" event when activity registered after being idle', t => {
    const activityEvents = [
        'click',
        'mousemove',
        'keydown',
        'DOMMouseScroll',
        'mousewheel',
        'mousedown',
        'touchstart',
        'touchmove',
        'focus',
    ];
    const ignoredEventsWhenIdle = [];
    activityEvents.forEach(eventName =>
        t.test(`Fires "active" for user event ${eventName}`, t => {
            const activityDetector = createActivityDetector({initialState: 'idle', activityEvents, ignoredEventsWhenIdle});

            activityDetector.on('active', () => {
                t.pass('onActive callback is called');
                activityDetector.stop();
                t.end();
            });

            fireWinEvent(eventName);
        })
    );
    t.end();
});

test('Activity detector fires "idle" event when the window goes background', t => {
    const activityDetector = createActivityDetector();

    activityDetector.on('idle', () => {
        t.pass('onIdle callback is called');
        activityDetector.stop();
        t.end();
    });

    fireWinEvent('blur');
});

test('ActivityDetector fires "idle" event when document becomes hidden', t => {
    const activityDetector = createActivityDetector();

    activityDetector.on('idle', () => {
        t.pass('onIdle callback is called');
        activityDetector.stop();
        t.end();
    });
    document.hidden = true;
    fireDocEvent('visibilitychange');
});

test('ActivityDetector fires "active" event when document becomes visible', t => {
    const activityDetector = createActivityDetector({initialState: 'idle'});

    activityDetector.on('active', () => {
        t.pass('onActive callback is called');
        activityDetector.stop();
        t.end();
    });

    document.hidden = false;
    fireDocEvent('visibilitychange');
});

test('Activity detector accepts multiple callbacks for the same event', t => {
    const activityDetector = createActivityDetector();

    Promise.all([
        new Promise(fulfill => activityDetector.on('idle', fulfill)),
        new Promise(fulfill => activityDetector.on('idle', fulfill)),
        new Promise(fulfill => activityDetector.on('idle', fulfill)),
    ]).then(() => {
        t.pass('all the callbacks where called');
        activityDetector.stop();
        t.end();
    });

    fireWinEvent('blur');
});

test('Activity detector ignores some events on idle', t => {
    const ignoredEventsWhenIdle = ['mousemove'];
    const inactivityEvents = ['blur'];
    const activityEvents = ['click', 'mousemove'];

    const activityDetector = createActivityDetector({
        initialState: 'idle',
        ignoredEventsWhenIdle,
        activityEvents,
        inactivityEvents,
    });

    let isActive = false;

    activityDetector.on('active', () => {
        isActive = true;
    });
    activityDetector.on('idle', () => {
        isActive = false;
    });

    fireWinEvent('click');
    t.true(isActive);

    fireWinEvent('blur');
    t.false(isActive);

    fireWinEvent('mousemove');
    t.false(isActive);

    fireWinEvent('click');
    t.true(isActive);

    activityDetector.stop();
    t.end();
});
