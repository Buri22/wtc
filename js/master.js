//================ Variables ================//
const wtc_ticking_counter = 'wtc_ticking_counter';

//================ Functions ================//
function getTask(param, id) {
    if (id != null && id != "") {
        Helper.ajaxCall("getTaskById", "POST", "wtc_ajax.php", "task_id=" + id, function(response_work) {

            switch(param) {
                // Show current work spent time
                case 'time':
                    if (response_work.TaskStarted && localStorage.getItem(wtc_ticking_counter)) {
                        Helper.setTextById("counter", localStorage.getItem(wtc_ticking_counter));
                    }
                    else {
                        Helper.setTextById("counter", Helper.secondsToHms(response_work.SpentTime));
                    }
                    break;
                // Return name of current task
                case 'name':
                    return response_work.Name;

                default:
                    break;
            }

        });
    }
}

function getTaskList(user_id, task_id) {
    if (user_id) {
        Helper.ajaxCall("getTaskList", "POST", "wtc_ajax.php", 'user_id=' + user_id, function(taskList) {
            var select_box = Helper.clearElementById("taskList");

            for (var i = 0; i < taskList.length; i++) {
                var option = document.createElement("OPTION");
                var taskName = document.createTextNode(taskList[i].Name);

                option.setAttribute("value", taskList[i].Id);
                option.appendChild(taskName);

                task_id = task_id || taskList.length - 1;
                if (taskList[i].Id == task_id) {
                    option.setAttribute("selected", "");
                }

                select_box.appendChild(option);
            }

            getTask('time', Helper.getSelectedTaskId());
        });
    }
}

function createTask() {
    var new_task_name = Helper.getValueById("new_task_name");

    if (new_task_name) {
        Helper.ajaxCall("createTask", "POST", "wtc_ajax.php", "new_task_name=" + new_task_name, function(response) {
            if (response) {
                if (response == "taskNameExists") {
                    Helper.setTextById("create_result_msg", "This task name already exists, try something different.");
                }
                else {
                    getTaskList(docCookies.getItem('wtc_login'));
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
            Helper.ajaxCall('editTask', 'POST', 'wtc_ajax.php', data, function (response) {
                if (response) {
                    if (response == "taskNameExists") {
                        Helper.setTextById("edit_result_msg", "This task name already exists, try something different.");
                    }
                    else {
                        getTaskList(docCookies.getItem('wtc_login'), id);
                        Helper.setTextById("result_msg", "New task name was successfully saved!");
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

function startWorking() {
    var id = Helper.getSelectedTaskId();
    // Check if some work started
    Helper.ajaxCall("checkTaskStarted", "POST", "wtc_ajax.php", undefined, function(work_started) {
        if (!work_started && id != null && id != "") {   // No other work started
            // Update work in DB
            var data = "task_id=" + id +
                        "&last_start=" + Helper.getCurrentTime();   // We store time in seconds

            Helper.ajaxCall("startTask", "POST", "wtc_ajax.php", data, function(response) {
                if (response) {
                    localStorage.setItem(wtc_ticking_counter, Helper.secondsToHms(response.SpentTime));
                    window.myTime = setInterval(function () {
                        Helper.myTimer(response.Id);
                    }, 1000);

                    Helper.setTextById("result_msg", 'Started successfully!');
                }
                else Helper.setTextById("result_msg", 'Failed to start this task.');
            });
        }
        else Helper.setTextById("result_msg", "You are already working on: " + work_started.Name);
    });
}

function stopWorking() {
    var id = Helper.getSelectedTaskId();
    // Check if some work started
    Helper.ajaxCall("checkTaskStarted", "POST", "wtc_ajax.php", undefined, function(work_started) {
        if (id != null && id != "" && work_started) {
            if (work_started.Id == id) {   // Current work started
                // Update work in DB
                var spent_time = work_started.SpentTime + (Helper.getCurrentTime() - work_started.LastStart);
                var data = "task_id=" + id +
                            "&spent_time=" + spent_time;   // We store time in seconds

                Helper.ajaxCall("stopTask", "POST", "wtc_ajax.php", data, function(response) {
                    if (response) {
                        clearInterval(window.myTime);   // Stop ticking
                        Helper.deleteLocalStorage();    // Clear localStorage
                        getTask('time', Helper.getSelectedTaskId());    // Show tasks spent time from db
                        Helper.setTextById("result_msg", work_started.Name + ' stopped successfully!');
                    }
                    else Helper.setTextById("result_msg", 'Stopping failed!');
                });
            }
            // Some other work already started
            else Helper.setTextById("result_msg", "You are already working on: " + work_started.Name);
        }
        else Helper.setTextById("result_msg", "You aren`t working at any task.");
    });
}

//================ Execution ================//
function run() {

    // Check if user is logged in
    if (!docCookies.getItem('wtc_login')){  // Go to Login page

        $('#content').load('templates/login.html');

    }
    else {    // User is logged in

        $('#content').load('templates/main.html');
        getTaskList(docCookies.getItem('wtc_login'));

        //var date = new Date();
        //var templateData = {
        //    name: "Jonny",
        //    timeNow: date.getHours() + ':' + date.getMinutes()
        //};
        //$.get('templates/new_task.html', function(template) {
        //    //var new_task = $(template).filter('#newTask').html();
        //    $('body #create_new_task').html(template);
        //});

        //============ Current Task Action Listeners ============//
        $('#newTask').on('click', function() {
            $('#create_new_task').load('templates/new_task.html');
        });
        $('#editTask').on('click', function() {
            $.get('templates/edit_task.htm', function(template) {
                Helper.clearElementById("edit_task");
                var data = {
                    name: $('#taskList option:selected').text()
                };
                $('#edit_task').append(
                    Mustache.render($(template).html(), data)
                );
            });
        });
    }
}



























