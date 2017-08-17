//================ Variables ================//
const wtc_ticking_counter = 'wtc_ticking_counter';

//================ Functions ================//
function getTaskList() {
    Helper.ajaxCall("getTaskList", "POST", "work_time_ajax.php", undefined, function(taskList) {
        var select_box = Helper.clearElementById("taskList");

        for (var i = 0; i < taskList.length; i++) {
            var option = document.createElement("OPTION");
            var taskName = document.createTextNode(taskList[i].name);

            option.setAttribute("value", taskList[i].id);
            option.appendChild(taskName);

            if (i == 0) {
                option.setAttribute("selected", "");
            }

            select_box.appendChild(option);
        }

        getTime(Helper.getSelectedWorkId());
    });
}

function createTask() {
    var new_task_name = Helper.getValueById("new_task_name");

    if (new_task_name) {
        Helper.ajaxCall("createTask", "POST", "work_time_ajax.php", "new_task_name=" + new_task_name, function(response) {
            if (response) {
                if (response == "taskNameExists") {
                    Helper.setTextById("create_result_msg", "This task name already exists, try something different.");
                }
                else {
                    getTaskList();
                    Helper.setValueById("new_task_name", "");
                    Helper.setTextById("result_msg", "New task name was successfully created!");
                    $('#create_new_task').modal('hide');
                }
            }
            else {
                Helper.setTextById("result_msg", "New task name failed to create!");
                $('#create_new_task').modal('hide');
            }
        });
    }
    else {
        Helper.setTextById("create_result_msg", "Please input some creative task name.");
    }

}

function getTime(id) {
    if (id != null && id != "") {
        Helper.ajaxCall("getTaskById", "POST", "work_time_ajax.php", "work_id=" + id, function(response_work) {
            // Show current work spent time
            if (response_work.work_started && localStorage.getItem(wtc_ticking_counter)) {
                Helper.setTextById("counter", localStorage.getItem(wtc_ticking_counter));
            }
            else {
                Helper.setTextById("counter", Helper.secondsToHms(response_work.spent_time));
            }
        });
    }
}

function startWorking() {
    var id = Helper.getSelectedWorkId();
    // Check if some work started
    Helper.ajaxCall("checkTaskStarted", "POST", "work_time_ajax.php", undefined, function(work_started) {
        if (!work_started && id != null && id != "") {   // No other work started
            // Update work in DB
            var data = "work_id=" + id +
                        "&last_start=" + Helper.getCurrentTime();   // We store time in seconds

            Helper.ajaxCall("startTask", "POST", "work_time_ajax.php", data, function(response) {
                if (response) {
                    localStorage.setItem(wtc_ticking_counter, Helper.secondsToHms(response.spent_time));
                    window.myTime = setInterval(function () {
                        Helper.myTimer(response.id);
                    }, 1000);

                    Helper.setTextById("result_msg", 'Started successfully!');
                }
                else Helper.setTextById("result_msg", 'Failed to start this task.');
            });
        }
        else Helper.setTextById("result_msg", "You are already working on: " + work_started.name);
    });
}

function stopWorking() {
    var id = Helper.getSelectedWorkId();
    // Check if some work started
    Helper.ajaxCall("checkTaskStarted", "POST", "work_time_ajax.php", undefined, function(work_started) {
        if (id != null && id != "" && work_started) {
            if (work_started.id == id) {   // Current work started
                // Update work in DB
                var spent_time = work_started.spent_time + (Helper.getCurrentTime() - work_started.last_start);
                var data = "work_id=" + id +
                            "&spent_time=" + spent_time;   // We store time in seconds

                Helper.ajaxCall("stopTask", "POST", "work_time_ajax.php", data, function(response) {
                    if (response) {
                        clearInterval(window.myTime);   // Stop ticking
                        Helper.deleteLocalStorage();    // Clear localStorage
                        getTime(Helper.getSelectedWorkId());    // Show tasks spent time from db
                        Helper.setTextById("result_msg", work_started.name + ' stopped successfully!');
                    }
                    else Helper.setTextById("result_msg", 'Stopping failed!');
                });
            }
            // Some other work already started
            else Helper.setTextById("result_msg", "You are already working on: " + work_started.name);
        }
        else Helper.setTextById("result_msg", "You aren`t working at any task.");
    });
}

//================ Execution ================//
function run() {
    getTaskList();

    //var date = new Date();
    //var templateData = {
    //    name: "Jonny",
    //    timeNow: date.getHours() + ':' + date.getMinutes()
    //};
    //$.get('templates/new_task.html', function(template) {
    //    //var new_task = $(template).filter('#newTask').html();
    //    $('body #create_new_task').html(template);
    //});

    $('#newTask').on('click', function() {
        $('#create_new_task').load('templates/new_task.html');
    });
}



























