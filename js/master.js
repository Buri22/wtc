//================ Variables ================//
const wtc_ticking_counter = 'wtc_ticking_counter';

//================ Functions ================//
function createTask() {
    var new_task_name = getValueById("new_work_name");

    if (new_task_name) {
        xhr(ajax_actions.createTask, "POST", "work_time_ajax.php", "new_work_name=" + new_task_name, {success: function(response) {
            if (response) {
                if (response == "taskNameExists") {
                    setTextById("createResult", "This task name already exists, try something different.");
                }
                else {
                    setValueById("new_work_name", "");
                    setTextById("createResult", "New task name was successfully created!");
                }
            }
            else setTextById("createResult", "New task name failed to create!");
        }});
    }
    else {
        setTextById("createResult", "Please input some creative task name.");
    }

}
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
                setTextById("counter", localStorage.getItem(wtc_ticking_counter));
            }
            else {
                setTextById("counter", secondsToHms(response_work.spent_time));
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

                    setTextById("startStopResult", 'Started successfully!');
                }
                else setTextById("startStopResult", 'Failed to start this task.');
            }});
        }
        else setTextById("startStopResult", "You are already working on: " + work_started.name);
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
                        setTextById("startStopResult", work_started.name + ' -> stopped successfully!');
                    }
                    else setTextById("startStopResult", 'Stopped successfully!');
                }});
            }
            // Some other work already started
            else setTextById("startStopResult", "You are already working on: " + work_started.name);
        }
        else setTextById("startStopResult", "Selected task has no record in database.");
    }});
}

function myTimer(started_work_id) {
    var counter_time = localStorage.getItem(wtc_ticking_counter);

    var total_time = counter_time.split(":");
    counter_time = Number(total_time[2]) + Number(total_time[1]) * 60 + Number(total_time[0]) * 60 * 60 + 1;
    counter_time = secondsToHms(counter_time);

    localStorage.setItem(wtc_ticking_counter, counter_time);

    if (started_work_id == getSelectedWorkId()) {   // Read from localStorage
        setTextById("counter", counter_time);
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

function setTextById(elementId, message) {
    document.getElementById(elementId).innerHTML = message;
}

function getValueById(elementId) {
    return document.getElementById(elementId).value;
}
function setValueById(elementId, value) {
    document.getElementById(elementId).value = value;
}

//================ Execution ================//
function execution() {
    getTime(getSelectedWorkId());
}