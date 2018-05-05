/**
 * Mediator provides communication stream among modules
 */
var mediator = (function(){

    // Storage of events that can be broadcast or listened to
    var events = {};

    // Subscribe/listen to event
    // Supply a callback to be executed when that event is broadcast to
    var subscribe = function(event, func, args) {
        // If event doesn't exist, create it
        if (!events[event]) {
            events[event] = [];
        }

        events[event].push({
            context: this,
            func: func,
            args: args
        });

        return this;
    };

    // Publish/broadcast an event to the rest of the application subscribers
    var publish = function(event, ...args) {
        // If event doesn't exist, return false
        if (!events[event]) {
            return false;
        }

        // All subscribers executes their function subscribed to current event
        for (var i = 0; i < events[event].length; i++) {
            var sub = events[event][i];
            sub.func.apply(sub.context, sub.args || args);
        }

        return this;
    };

    return {
        publish: publish,
        subscribe: subscribe,
        installTo: function(obj) {
            obj.subscribe = subscribe;
            obj.publish = publish;
        }
    }

}());