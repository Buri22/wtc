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

        Helper.ajaxCall('register', 'POST', data, function (response) {
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

        Helper.ajaxCall('login', 'POST', data, function (response) {
            if (response.Id && response.UserName) {
                // TODO: use userName to show in menu for logout button
                $('#content').load('templates/main.html');
                ActionProvider.getTaskList();
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
                Helper.setTextById("login_msg", "Your account is blocked.");
            }
            else if (response == 6) {
                Helper.setTextById("login_msg", "Wrong password, please try it again");
            }
            else {
                Helper.setTextById('login_msg', 'Login failed, please try again later.');
            }
        });
    },

    // TODO: finish logOut function
    // Logout
    logOut: function() {
        $('#content').load('templates/login.html', function() {
            Helper.setTextById('login_msg', 'Your login cookie expired, please login again.');
        });
    },

//============ Main Actions ============//
    getTaskList: function(task_id) {
        Helper.ajaxCall("getTaskList", "POST", undefined, function(taskList) {
            if (taskList) {
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
            }
            else {
                $('#content').load('templates/login.html', function() {
                    Helper.setTextById('login_msg', 'You were logged out, please login again.');
                });
            }
        });
    },
    getTask: function(param, id) {
        Helper.ajaxCall("getTaskById", "POST", "task_id=" + id, function(response_work) {

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
    },

//============ Current Task Actions ============//
    createTask: function() {
        Helper.ajaxCall("createTask", "POST", "new_task_name=" + Helper.getValueById("new_task_name"), function(response) {
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
                ActionProvider.logOut();
            }
            else if (response == 4) {
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
            task_id: Helper.getSelectedTaskId(),
            new_task_name: Helper.getValueById("edit_task_name")
        };
        Helper.ajaxCall('editTask', 'POST', data, function (response) {
            if (response == 1) {
                ActionProvider.getTaskList(data.task_id);
                Helper.setTextById("result_msg", "New task name was successfully saved!");
                $('#edit_task').modal('hide');
            }
            else if (response == 2) {
                Helper.setTextById("edit_result_msg", "Please input some creative task name.");
            }
            else if (response == 3) {
                ActionProvider.logOut();
            }
            else if (response == 4) {
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
        Helper.ajaxCall('deleteTask', 'POST', data, function(response) {
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
            task_id: Helper.getSelectedTaskId(),
            last_start: Helper.getCurrentTime() // We store time in seconds
        };
        Helper.ajaxCall("startTask", "POST", data, function(response) {
            if (response == 'logOut') {    // User isn`t logged in
                ActionProvider.logOut();
            }
            else if (response.someTaskAlreadyStarted) {
                Helper.setTextById("result_msg", "You are already working on <strong>" + response.Name + "</strong>");
            }
            else if (response == 2) {
                Helper.setTextById("result_msg", "Parameters to start the task are missing.");
            }
            else if (response.Id && response.SpentTime) {
                localStorage.setItem(wtc_ticking_counter, Helper.secondsToHms(response.SpentTime));
                window.myTime = setInterval(function () {
                    Helper.myTimer(response.Id);
                }, 1000);
                Helper.setTextById("result_msg", 'Started successfully!');
            }
            else Helper.setTextById("result_msg", 'Failed to start this task.');    // failed to UPDATE or SELECT
        });
    },
    stopTicking: function() {
        Helper.ajaxCall("stopTask", "POST", "task_id=" + Helper.getSelectedTaskId(), function(response) {
            if (response == 'logOut') {    // User isn`t logged in
                ActionProvider.logOut();
            }
            else if (response == 'noTaskStarted') {
                Helper.setTextById("result_msg", "You have to start some task first.");
            }
            else if (response == 2) {
                Helper.setTextById("result_msg", "Parameters to stop the task are missing.");
            }
            else if(response.otherTaskStarted) {
                Helper.setTextById("result_msg", "You are already working on <strong>" + response.Name + "</strong>");
            }
            else if (response) {
                clearInterval(window.myTime);   // Stop ticking
                Helper.deleteLocalStorage();    // Clear localStorage
                ActionProvider.getTask('time', Helper.getSelectedTaskId());    // Show tasks spent time from db
                Helper.setTextById("result_msg", "<strong>" + $('#taskList option:selected').text() + "</strong> stopped successfully!");
            }
            else Helper.setTextById("result_msg", 'Stopping failed!');
        });
    }
};