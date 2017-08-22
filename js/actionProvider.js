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

        Helper.ajaxCall("createTask", "POST", "wtc_ajax.php", data, function(response) {
            if (response == 1) {
                ActionProvider.getTaskList();
                Helper.setValueById("new_task_name", "");
                Helper.setTextById("result_msg", "New task name was successfully created!");
                $('#create_new_task').modal('hide');
            }
            else if (response == 2) {
                Helper.setTextById("create_result_msg", "Please input some creative task name.");
            }
            else if (response == 3) {
                Helper.setTextById("create_result_msg", "This task name already exists, try something different.");
            }
            else {
                Helper.setTextById("result_msg", "New task name failed to create!");
                $('#create_new_task').modal('hide');
            }
        });
    },
    editTask: function() {
        var data = {
            user_id: docCookies.getItem(wtc_login),
            task_id: Helper.getSelectedTaskId(),
            new_task_name: Helper.getValueById("edit_task_name")
        };

        Helper.ajaxCall('editTask', 'POST', 'wtc_ajax.php', data, function (response) {
            if (response == 1) {
                ActionProvider.getTaskList(data.task_id);
                Helper.setTextById("result_msg", "New task name was successfully saved!");
                $('#edit_task').modal('hide');
            }
            else if (response == 2) {
                Helper.setTextById("edit_result_msg", "Please input some creative task name.");
            }
            else if (response == 3) {
                Helper.setTextById("edit_result_msg", "This task name already exists, try something different.");
            }
            else {
                Helper.setTextById("result_msg", "Edit task name failed!");
                $('#edit_task').modal('hide');
            }
        });
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

    deleteTask: function() {
        var data = {
            task_id: Helper.getSelectedTaskId(),
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
        });
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
        var data = {
            user_id: docCookies.getItem(wtc_login),
            task_id: Helper.getSelectedTaskId(),
            last_start: Helper.getCurrentTime() // We store time in seconds
        };
        // Check if some Task started
        Helper.ajaxCall("checkTaskStarted", "POST", "wtc_ajax.php", data, function(work_started) {
            if (!work_started) {   // No other work started
                // Update Task in DB
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
            else if (work_started == 2) {   // User id is missing
                this.logOut();
            }
            else if (work_started.Name) {
                Helper.setTextById("result_msg", "You are already working on <strong>" + work_started.Name + "</strong>");
            }
        });
    },
    stopTicking: function() {
        var data = {
            user_id: docCookies.getItem(wtc_login),
            task_id: Helper.getSelectedTaskId()
        };
        // Check if some task started
        Helper.ajaxCall("checkTaskStarted", "POST", "wtc_ajax.php", data, function(work_started) {
            if (work_started) {
                if (work_started.Id == data.task_id) {   // Current work started
                    data['spent_time'] = work_started.SpentTime + (Helper.getCurrentTime() - work_started.LastStart);   // We store time in seconds
                    // Update task in DB
                    Helper.ajaxCall("stopTask", "POST", "wtc_ajax.php", data, function(response) {
                        if (response) {
                            clearInterval(window.myTime);   // Stop ticking
                            Helper.deleteLocalStorage();    // Clear localStorage
                            ActionProvider.getTask('time', Helper.getSelectedTaskId());    // Show tasks spent time from db
                            Helper.setTextById("result_msg", "<strong>" + work_started.Name + "</strong> stopped successfully!");
                        }
                        else Helper.setTextById("result_msg", 'Stopping failed!');
                    });
                }
                // Some other work already started
                else Helper.setTextById("result_msg", "You are already working on <strong>" + work_started.Name + "</strong>");
            }
            else if (work_started == 2) {   // User id is missing
                this.logOut();
            }
            else Helper.setTextById("result_msg", "You aren`t working at any task.");
        });
    }
};