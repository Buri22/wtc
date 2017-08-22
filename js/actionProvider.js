/**
 * Created by Uživatel on 19.8.2017.
 */

var ActionProvider = {
//================ Account Actions ================//
    // Register
    register: function() {
        // TODO: Show password strength
        var data = {
            user_name: $('#userName').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            password_confirm: $('#passwordConfirm').val()
        };

        Helper.ajaxCall('register', 'POST', 'wtc_ajax.php', data, function (response) {
            if (response == 1) {  // new user was created successfully
                $('#content').load('templates/login.html', function() {
                    Helper.setTextById('login_msg', 'You were successfully registered, please login with your credentials.');
                });
            }
            else if (response == 2) {
                Helper.setTextById("register_msg", "Please, enter all information.");
            }
            else if (response == 3) {
                Helper.setTextById("register_msg", "Email format is not valid.");
            }
            else if (response == 4) {
                Helper.setTextById("register_msg", "Passwords don`t match, please, enter them again.");
            }
            else if (response == 5) {
                Helper.setTextById("register_msg", "You are already registered. Please login with this email.");
            }
            else {
                Helper.setTextById("register_msg", "New user failed to create!");
            }
        });

    },

    // Login
    login: function() {
        var data = {
            email: $('#email').val(),
            password: $('#password').val()
        };

        Helper.ajaxCall('login', 'POST', 'wtc_ajax.php', data, function (response) {
            if (response.Id && response.UserName && response.Email) {
                docCookies.setItem(wtc_login, response.Id);   // Create cookie wtc_login
                $('#content').load('templates/main.html');
                this.getTaskList();
            }
            else if (response == 2) {
                Helper.setTextById("login_msg", "Please, enter all information.");
            }
            else if (response == 3) {
                Helper.setTextById("login_msg", "Email format is not valid.");
            }
            else if (response == 4) {
                Helper.setTextById("login_msg", "You are not registered yet.");
            }
            else if (response == 5) {
                Helper.setTextById("login_msg", "Wrong password, please try it again");
            }
            else {
                Helper.setTextById('login_msg', 'Login failed, please try again later.');
            }
        });
    },

    // Logout
    logOut: function() {
        docCookies.removeItem(wtc_login);
        $('#content').load('templates/login.html', function() {
            Helper.setTextById('login_msg', 'Your login cookie expired, please login again.');
        });
    },

//============ Main Actions ============//
    getTaskList: function(task_id) {
        if (docCookies.getItem(wtc_login)) {
            Helper.ajaxCall("getTaskList", "POST", "wtc_ajax.php", 'user_id=' + docCookies.getItem(wtc_login), function(taskList) {
                var select_box = Helper.clearElementById("taskList");

                for (var i = 0; i < taskList.length; i++) {
                    var option = document.createElement("OPTION");
                    var taskName = document.createTextNode(taskList[i].Name);

                    option.setAttribute("value", taskList[i].Id);
                    option.appendChild(taskName);

                    task_id = task_id || 0;
                    if (taskList[i].Id == task_id) {
                        option.setAttribute("selected", "");
                    }

                    select_box.appendChild(option);
                }

                ActionProvider.getTask('time', Helper.getSelectedTaskId());
            });
        }
    },
    getTask: function(param, id) {
        if (id) {
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
    },

//============ Current Task Actions ============//
    createTask: function() {
        var data = {
            user_id: docCookies.getItem(wtc_login),
            new_task_name: Helper.getValueById("new_task_name")
        };

        if (data.user_id) {
            if (data.new_task_name) {
                Helper.ajaxCall("createTask", "POST", "wtc_ajax.php", data, function(response) {
                    if (response) {
                        if (response == "taskNameExists") {
                            Helper.setTextById("create_result_msg", "This task name already exists, try something different.");
                        }
                        else {
                            ActionProvider.getTaskList();
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
        else ActionProvider.logOut();

    },
    editTask: function() {
        var task_id = Helper.getSelectedTaskId();
        if (task_id) {
            var data = {
                task_id: task_id,
                new_task_name: Helper.getValueById("edit_task_name")
            };

            if (data.new_task_name) {
                Helper.ajaxCall('editTask', 'POST', 'wtc_ajax.php', data, function (response) {
                    if (response) {
                        if (response == "taskNameExists") {
                            Helper.setTextById("edit_result_msg", "This task name already exists, try something different.");
                        }
                        else {
                            ActionProvider.getTaskList(task_id);
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
    },
    renderEditTask: function() {
        $.get('templates/edit_task.htm', function(template) {
            Helper.clearElementById("edit_task");
            var data = { name: $('#taskList option:selected').text() };
            $('#edit_task').append(
                Mustache.render($(template).html(), data)
            );
        });
    },

    // TODO: delete current task
    deleteCurrentTask: function() {
        var task_id = Helper.getSelectedTaskId();
        if (task_id) {
            var data = {
                task_id: task_id,
                password: Helper.getValueById('delete_task_password_confirm')
            };
            Helper.ajaxCall('deleteTask', 'POST', 'wtc_ajax.php', data, function(response) {
                if (response == false) {
                    ActionProvider.getTaskList();
                    Helper.setTextById("result_msg", "Task was deleted successfully.");
                    $('#delete_task').modal('hide');
                }
                else if(response == 2) {
                    Helper.setTextById("delete_result_msg", "Some information is missing.");
                }
                else if(response == 3) {
                    Helper.setTextById("result_msg", "Record of current task is missing in database.");
                    $('#delete_task').modal('hide');
                }
                else if(response == 4) {
                    Helper.setTextById("delete_result_msg", "You entered wrong password.");
                }
                //else {
                //    Helper.setTextById("result_msg", "Failed to delete current task.");
                //    $('#delete_task').modal('hide');
                //}
            });
        }
    },
    renderDeleteTask: function() {
        $.get('templates/delete_task.htm', function(template) {
            Helper.clearElementById("delete_task");
            var data = { name: $('#taskList option:selected').text() };
            $('#delete_task').append(
                Mustache.render($(template).html(), data)
            );
        });
    },

    startTicking: function() {
        var id = Helper.getSelectedTaskId();
        // Check if some Task started
        // TODO: implement userId - we want to check only users tasks
        Helper.ajaxCall("checkTaskStarted", "POST", "wtc_ajax.php", undefined, function(work_started) {
            if (!work_started && id != null && id != "") {   // No other work started
                // Update Task in DB
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
    },
    stopTicking: function() {
        var id = Helper.getSelectedTaskId();
        // Check if some task started
        Helper.ajaxCall("checkTaskStarted", "POST", "wtc_ajax.php", undefined, function(work_started) {
            if (id != null && id != "" && work_started) {
                if (work_started.Id == id) {   // Current work started
                    // Update task in DB
                    var spent_time = work_started.SpentTime + (Helper.getCurrentTime() - work_started.LastStart);
                    var data = "task_id=" + id +
                        "&spent_time=" + spent_time;   // We store time in seconds

                    Helper.ajaxCall("stopTask", "POST", "wtc_ajax.php", data, function(response) {
                        if (response) {
                            clearInterval(window.myTime);   // Stop ticking
                            Helper.deleteLocalStorage();    // Clear localStorage
                            ActionProvider.getTask('time', Helper.getSelectedTaskId());    // Show tasks spent time from db
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
};