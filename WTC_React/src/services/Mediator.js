/**
 * Mediator provides communication stream among modules
 */
class Mediator {

    constructor() {
        /**
         * Storage of events that can be broadcast or listened to
         */
        this.events = {}
    }

    /**
     * Subscribe/listen to event
     * Supply a callback to be executed when that event is broadcast to
    */
    subscribe(event, func, args) {
        // If event doesn't exist, create it
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push({
            context: this,
            func: func,
            args: args
        });

        return this;
    }

    /**
     * Publish/broadcast an event to the rest of the application subscribers 
    */
    publish(event, ...args) {
        // If event doesn't exist, return false
        if (!this.events[event]) {
            return false;
        }

        // All subscribers executes their function subscribed to current event
        for (let eventSubscriber of this.events[event]) {
            let sub = eventSubscriber;
            sub.func.apply(sub.context, sub.args || args);
        }

        return this;
    }

}

var mediator = new Mediator();
export default mediator;
