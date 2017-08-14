//================ Variables ================//
const wtc_ticking_counter = 'wtc_ticking_counter';

//================ Functions ================//
function showTime(id) {
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            // document is ready. Do your stuff here
            getTime(id);
        }
    };
}

function getTime(id) {
    if (id != null && id != "") {
        xhr(ajax_actions.getWorkById, "POST", "work_time_ajax.php", "work_id=" + id, {success: function(response_work) {

            // Show current work spent time
            if (response_work.work_started && localStorage.getItem(wtc_ticking_counter)) {
                showMessage("counter", localStorage.getItem(wtc_ticking_counter));
            }
            else {
                showMessage("counter", secondsToHms(response_work.spent_time));
            }
        }});
    }
}

function startWorking() {
    var id = getSelectedWorkId();
    // Check if some work started
    xhr(ajax_actions.checkWorkStarted, "POST", "work_time_ajax.php", undefined, {success: function(work_started) {
        if (!work_started && id != null && id != "") {   // No other work started
            // Update work in DB
            var data = "work_id=" + id +
                        "&last_start=" + getCurrentTime();   // We store time in seconds

            xhr(ajax_actions.startWork, "POST", "work_time_ajax.php", data, {success: function(response) {
                if (response) {
                    localStorage.setItem(wtc_ticking_counter, secondsToHms(response.spent_time));
                    window.myTime = setInterval(function () {
                        myTimer(response.id);
                    }, 1000);

                    showMessage("startStopResult", 'Started successfully!');
                }
                else {
                    showMessage("startStopResult", 'Failed to start this task.');
                }
            }});
        }
        else {
            showMessage("startStopResult", "You are already working on: " + work_started.name);
        }
    }});
}

function stopWorking() {
    var id = getSelectedWorkId();
    // Check if some work started
    xhr(ajax_actions.checkWorkStarted, "POST", "work_time_ajax.php", undefined, {success: function(work_started) {
        if (id != null && id != "" && work_started) {
            if (work_started.id == id) {   // Current work started
                // Update work in DB
                var spent_time = work_started.spent_time + (getCurrentTime() - work_started.last_start);
                var data = "work_id=" + id +
                            "&spent_time=" + spent_time;   // We store time in seconds

                xhr(ajax_actions.stopWork, "POST", "work_time_ajax.php", data, {success: function(response) {
                    if (response) {
                        clearInterval(window.myTime);
                        deleteLocalStorage();   // Clear localStorage
                        //getTime(id);
                        showMessage("startStopResult", work_started.name + ' -> stopped successfully!');
                    }
                    else {
                        showMessage("startStopResult", 'Stopped successfully!');
                    }
                }});
            }
            else {  // Some other work already started
                showMessage("startStopResult", "You are already working on: " + work_started.name);
            }
        }
        else {
            showMessage("startStopResult", "Selected task has no record in database.");
        }
    }});
}

function myTimer(started_work_id) {
    var counter_time = localStorage.getItem(wtc_ticking_counter);

    var total_time = counter_time.split(":");
    counter_time = Number(total_time[2]) + Number(total_time[1]) * 60 + Number(total_time[0]) * 60 * 60 + 1;
    counter_time = secondsToHms(counter_time);

    localStorage.setItem(wtc_ticking_counter, counter_time);

    if (started_work_id == getSelectedWorkId()) {
        // Read from localStorage
        document.getElementById("counter").innerHTML = localStorage.getItem(wtc_ticking_counter);
    }

}

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
}

function getCurrentTime() { // in seconds
    return Math.round(new Date().getTime() / 1000);
}

function deleteLocalStorage() {
    localStorage.getItem(wtc_ticking_counter) != null && localStorage.removeItem(wtc_ticking_counter);
}

function getSelectedWorkId() {
    return Number(document.getElementById("work_setlist_id").value);
}

function showMessage(elementId, message) {
    document.getElementById(elementId).innerHTML = message;
}

//================ Execution ================//
function execution() {
    getTime(getSelectedWorkId());
}