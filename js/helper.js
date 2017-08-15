/**
 * Created by Uživatel on 15.8.2017.
 * Helper contains all functions that helps to manipulate with:
 * HTML DOM tree, localStorage, time variables...
 */

var Helper = {

    myTimer: function(started_work_id) {
        var counter_time = localStorage.getItem(wtc_ticking_counter);

        var total_time = counter_time.split(":");
        counter_time = Number(total_time[2]) + Number(total_time[1]) * 60 + Number(total_time[0]) * 60 * 60 + 1;
        counter_time = this.secondsToHms(counter_time);

        localStorage.setItem(wtc_ticking_counter, counter_time);

        if (started_work_id == this.getSelectedWorkId()) {   // Read from localStorage
            this.setTextById("counter", counter_time);
        }

    },

    secondsToHms: function(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
        return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    },

    getCurrentTime: function() { // in seconds
        return Math.round(new Date().getTime() / 1000);
    },

    deleteLocalStorage: function() {
        localStorage.getItem(wtc_ticking_counter) != null && localStorage.removeItem(wtc_ticking_counter);
    },

    getSelectedWorkId: function() {
        return Number(document.getElementById("work_setlist").value);
    },

    setTextById: function(elementId, message) {
        document.getElementById(elementId).innerHTML = message;
    },

    getValueById: function(elementId) {
        return document.getElementById(elementId).value;
    },
    setValueById: function(elementId, value) {
        document.getElementById(elementId).value = value;
    },

    clearElementById: function(id) {
        var myNode = document.getElementById(id);
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
        return myNode;
    }

};