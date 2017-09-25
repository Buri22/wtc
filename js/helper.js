/**
 * Created by U�ivatel on 15.8.2017.
 * Helper contains all functions that helps to manipulate with:
 * HTML DOM tree, localStorage, time variables...
 */

var Helper = {

    ajaxCall: function(action, type, data, callback) {
        callback = callback || {};

        // Define request headers
        var headers = {
            'Ajax-Action': action
        };
        if (type == 'POST') {
            headers['Content-type'] = 'application/x-www-form-urlencoded';
        }

        $.ajax({
            url: 'includes/wtc_ajax.php',
            headers: headers,
            type: type,
            data: data,
            dataType: 'json',
            success: callback
        });
    },

    myTimer: function(started_task_id) {
        var counter_time = localStorage.getItem(WTC_TICKING_COUNTER);

        var total_time = counter_time.split(":");
        counter_time = Number(total_time[2]) + Number(total_time[1]) * 60 + Number(total_time[0]) * 60 * 60 + 1;
        counter_time = this.secondsToHms(counter_time);

        localStorage.setItem(WTC_TICKING_COUNTER, counter_time);

        if (started_task_id == this.getSelectedTaskId()) {   // Read from localStorage
            this.setTextById("timeCounter", counter_time);
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
        localStorage.getItem(WTC_TICKING_COUNTER) != null && localStorage.removeItem(WTC_TICKING_COUNTER);
    },

    getSelectedTaskId: function() {
        return Number($("#taskList").val());
    },

    // TODO: add param type = success/warning => green/red text by adding css class
    setTextById: function(elementId, message) {
        document.getElementById(elementId).innerHTML = message;
    },

    // Binds Enter keyup event to make click() on element by selector
    bindEnterSubmitEvent: function(obj, selector) {
        // To ensure that element hasn't bind event twice -> off()
        $(obj).off('keydown').on('keydown', function(e) {
            if  (e.which == 13) {
                $(selector).click();
            }
        });
    },

    getModalTemplate: function($modal, data, action) {
        $.get('view/modal.htm', function(template) {
            $modal.append(Mustache.render($(template).html(), data))
                .modal('show');

            // Bind dynamic action from module
            if (action) {
                // To ensure that element hasn't bind event twice -> off()
                $modal.find('#submit')
                    .off('click')
                    .on('click', action);
            }
        });
    }

};