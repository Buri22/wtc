//================ Variables ================//
const wtc_ticking_counter = 'wtc_ticking_counter';

//================ Functions ================//
function getTaskList(id) {
    id = id || 0;
    Helper.ajaxCall("getTaskList", "POST", "work_time_ajax.php", undefined, function(taskList) {
        var select_box = Helper.clearElementById("taskList");

        for (var i = 0; i < taskList.length; i++) {
            var option = document.createElement("OPTION");
            var taskName = document.createTextNode(taskList[i].name);

            option.setAttribute("value", taskList[i].id);
            option.appendChild(taskName);

            if (taskList[i].id == id) {
                option.setAttribute("selected", "");
            }

            select_box.appendChild(option);
        }

        getTask('time', Helper.getSelectedTaskId());
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

function editTask(id) {
    if (id != null && id != "") {
        var edit_task_name = Helper.getValueById("edit_task_name");
        var data = {
            task_id: id,
            new_task_name: edit_task_name
        };

        if (edit_task_name) {
            Helper.ajaxCall('editTask', 'POST', 'work_time_ajax.php', data, function (response) {
                if (response) {
                    if (response == "taskNameExists") {
                        Helper.setTextById("edit_result_msg", "This task name already exists, try something different.");
                    }
                    else {
                        getTaskList(id);
                        Helper.setTextById("result_msg", "New task name was successfully created!");
                        $('#edit_task').modal('hide');
                    }
                }
                else {
                    Helper.setTextById("result_msg", "Edit task name failed!");
                    $('#edit_task').modal('hide');
                }
            });
        }
        else {
            Helper.setTextById("edit_result_msg", "Please input some creative task name.");
        }
    }
}

function getTask(param, id) {
    if (id != null && id != "") {
        Helper.ajaxCall("getTaskById", "POST", "work_time_ajax.php", "work_id=" + id, function(response_work) {

            switch(param) {
                // Show current work spent time
                case 'time':
                    if (response_work.work_started && localStorage.getItem(wtc_ticking_counter)) {
                        Helper.setTextById("counter", localStorage.getItem(wtc_ticking_counter));
                    }
                    else {
                        Helper.setTextById("counter", Helper.secondsToHms(response_work.spent_time));
                    }
                    break;
                // Return name of current task
                case 'name':
                    return response_work.name;

                default:
                    break;
            }

        });
    }
}

function startWorking() {
    var id = Helper.getSelectedTaskId();
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
    var id = Helper.getSelectedTaskId();
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
                        getTask('time', Helper.getSelectedTaskId());    // Show tasks spent time from db
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

    //============ Current Task Actions ============//
    $('#newTask').on('click', function() {
        $('#create_new_task').load('templates/new_task.html');
    });
    $('#editTask').on('click', function() {
        $.get('templates/edit_task.htm', function(template) {
            Helper.clearElementById("edit_task");
            $('#edit_task').append(
                Mustache.render($(template).html(), { name: $('#taskList option:selected').text() })
            );
        });
    });
}



























