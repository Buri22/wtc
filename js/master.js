//================ Variables ================//
const wtc_ticking_counter = 'wtc_ticking_counter';

//================ Functions ================//
function createTask() {
    var new_task_name = Helper.getValueById("new_task_name");

    if (new_task_name) {
        xhr(ajax_actions.createTask, "POST", "work_time_ajax.php", "new_task_name=" + new_task_name, {success: function(response) {
            if (response) {
                if (response == "taskNameExists") {
                    Helper.setTextById("createResult", "This task name already exists, try something different.");
                }
                else {
                    Helper.setValueById("new_task_name", "");
                    Helper.setTextById("createResult", "New task name was successfully created!");
                }
            }
            else Helper.setTextById("createResult", "New task name failed to create!");
        }});
    }
    else {
        Helper.setTextById("createResult", "Please input some creative task name.");
    }

}

function getTime(id) {
    if (id != null && id != "") {
        xhr(ajax_actions.getWorkById, "POST", "work_time_ajax.php", "work_id=" + id, {success: function(response_work) {

            // Show current work spent time
            if (response_work.work_started && localStorage.getItem(wtc_ticking_counter)) {
                Helper.setTextById("counter", localStorage.getItem(wtc_ticking_counter));
            }
            else {
                Helper.setTextById("counter", Helper.secondsToHms(response_work.spent_time));
            }
        }});
    }
}

function startWorking() {
    var id = Helper.getSelectedWorkId();
    // Check if some work started
    xhr(ajax_actions.checkWorkStarted, "POST", "work_time_ajax.php", undefined, {success: function(work_started) {
        if (!work_started && id != null && id != "") {   // No other work started
            // Update work in DB
            var data = "work_id=" + id +
                        "&last_start=" + Helper.getCurrentTime();   // We store time in seconds

            xhr(ajax_actions.startWork, "POST", "work_time_ajax.php", data, {success: function(response) {
                if (response) {
                    localStorage.setItem(wtc_ticking_counter, Helper.secondsToHms(response.spent_time));
                    window.myTime = setInterval(function () {
                        Helper.myTimer(response.id);
                    }, 1000);

                    Helper.setTextById("startStopResult", 'Started successfully!');
                }
                else Helper.setTextById("startStopResult", 'Failed to start this task.');
            }});
        }
        else Helper.setTextById("startStopResult", "You are already working on: " + work_started.name);
    }});
}

function stopWorking() {
    var id = Helper.getSelectedWorkId();
    // Check if some work started
    xhr(ajax_actions.checkWorkStarted, "POST", "work_time_ajax.php", undefined, {success: function(work_started) {
        if (id != null && id != "" && work_started) {
            if (work_started.id == id) {   // Current work started
                // Update work in DB
                var spent_time = work_started.spent_time + (Helper.getCurrentTime() - work_started.last_start);
                var data = "work_id=" + id +
                            "&spent_time=" + spent_time;   // We store time in seconds

                xhr(ajax_actions.stopWork, "POST", "work_time_ajax.php", data, {success: function(response) {
                    if (response) {
                        clearInterval(window.myTime);
                        Helper.deleteLocalStorage();   // Clear localStorage
                        Helper.setTextById("startStopResult", work_started.name + ' -> stopped successfully!');
                    }
                    else Helper.setTextById("startStopResult", 'Stopped successfully!');
                }});
            }
            // Some other work already started
            else Helper.setTextById("startStopResult", "You are already working on: " + work_started.name);
        }
        else Helper.setTextById("startStopResult", "Selected task has no record in database.");
    }});
}

//================ Execution ================//
function execution() {
    getTime(Helper.getSelectedWorkId());
}