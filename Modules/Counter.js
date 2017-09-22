/**
 * Created by Uživatel on 11.9.2017.
 */
var Counter = function() {
    var tasks = {};
    var maxTaskNameLength = 80;

    // Cache DOM
    var $page             = $('#page'),
        $taskList         = $page.find('#taskList'),
        taskListTemplate  = $page.find('#taskListTemplate').html(),
        $modal            = $page.find('#task_action_modal'),
        $taskActionBtns   = $page.find('#task_action_buttons'),
        $startBtn         = $page.find('#buttonStart'),
        $stopBtn          = $page.find('#buttonStop'),
        $timeCounter      = $page.find('#timeCounter'),
        $resultMsg        = $page.find('#result_msg');

    // Bind Events
    $taskList.on('change', _renderCurrentTaskTime);
    $startBtn.on('click', _startTicking);
    $stopBtn.on('click', _stopTicking);
    $taskActionBtns.on('click', '#newTask, #editTask, #deleteTask', _renderModal);

    function _renderModal(event) {
        $.get('view/modal_parts.htm', function(templates) {
            var data = {};
            var action;
            var $templates = $(templates);

            // Create data for modal template
            switch (event.target.id) {
                case 'newTask':
                    data = {
                        modal_id: 'create_new_task',
                        title: 'Create new task',
                        modal_body: $templates.filter('#modal_body_create').html(),
                        submit_btn_text: 'Create'
                    };
                    action = _createTask;
                    break;
                case 'editTask':
                    var edit_body = Mustache.render($templates.filter('#modal_body_edit').html(), { taskName: _getTask().Name });
                    data = {
                        modal_id: 'edit_task',
                        title: 'Edit task name',
                        modal_body: edit_body,
                        submit_btn_text: 'Edit'
                    };
                    action = _editTask;
                    break;
                case 'deleteTask':
                    var delete_body = Mustache.render($templates.filter('#modal_body_delete').html(), { taskName: _getTask().Name });
                    data = {
                        modal_id: 'delete_task',
                        title: 'Delete current task',
                        modal_body: delete_body,
                        submit_btn_text: 'Delete'
                    };
                    action = _deleteTask;
                    break;

                default:
                    break;
            }

            ActionProvider.getModalTemplate($modal, data, action);
        });
    }

    function _renderTaskList(task_id) {
        var taskList = [];
        for (var i = 0; i < tasks.length; i++) {
            var taskName = tasks[i].Name;
            if (taskName.length > maxTaskNameLength) {
                taskName = taskName.substring(0, maxTaskNameLength - 3) + '...';
            }
            taskList.push({ Id: tasks[i].Id, Name: taskName });
        }
        $taskList.empty();
        $taskList.html(Mustache.render(taskListTemplate, {options: taskList}));

        // Set selected task
        task_id = task_id || taskList[0].Id;
        $taskList.find('option[value="' + task_id + '"]').attr('selected', '');
    }

    function _getTask(id) {
        var task = {};
        id = id || Number($taskList.val());

        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].Id == id) {
                task = tasks[i];
                break;
            }
        }

        return task;
    }
    function _setTask(id, data) {
        id = id || Number($taskList.val());
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].Id == id) {
                tasks[i].Name        = data.name || tasks[i].Name;
                tasks[i].LastStart   = data.last_start || tasks[i].LastStart;
                tasks[i].SpentTime   = data.spent_time || tasks[i].SpentTime;
                tasks[i].TaskStarted = data.task_started == 0 ? 0 : data.task_started || tasks[i].TaskStarted;
                break;
            }
        }
    }
    function _renderCurrentTaskTime() {
        var task = _getTask(),
            text = '';

        if (task.TaskStarted && localStorage.getItem(wtc_ticking_counter)) {
            text = localStorage.getItem(wtc_ticking_counter);
        }
        else {
            text = Helper.secondsToHms(task.SpentTime);
        }
        event.type == 'change' && $resultMsg.text('');
        $timeCounter.text(text);
    }

    function _startTicking() {
        var data = {
            task_id: _getTask().Id,
            last_start: Helper.getCurrentTime() // We store time in seconds
        };
        Helper.ajaxCall("startTask", "POST", data, function(response) {
            if (response == 'logOut') {    // User isn`t logged in
                ActionProvider.logOut();
            }
            else if (response.someTaskAlreadyStarted) {
                $resultMsg.html("You are already working on <strong>" + response.Name + "</strong>");
            }
            else if (response == 2) {
                $resultMsg.text('Parameters to start the task are missing.');
            }
            else if (response.Id) {
                // Update model
                data.task_started = 1;
                _setTask(response.Id, data);

                localStorage.setItem(wtc_ticking_counter, Helper.secondsToHms(response.SpentTime || 0));
                window.myTime = setInterval(function () {
                    Helper.myTimer(response.Id);
                }, 1000);
                $resultMsg.text('Started successfully!');
            }
            else {
                $resultMsg.text('Failed to start this task.');
            }
        });
    }
    function _stopTicking() {
        Helper.ajaxCall("stopTask", "POST", "task_id=" + Number($taskList.val()), function(response) {
            if (response == 'logOut') {    // User isn`t logged in
                ActionProvider.logOut();
            }
            else if (response == 'noTaskStarted') {
                $resultMsg.text("You have to start some task first.");
            }
            else if (response == 2) {
                $resultMsg.text("Parameters to stop the task are missing.");
            }
            else if(response.otherTaskStarted) {
                $resultMsg.html("You are already working on <strong>" + response.Name + "</strong>");
            }
            else if (response) {
                // Update model
                _setTask(null, {
                    spent_time: response.SpentTime || 0,
                    task_started: 0
                });

                clearInterval(window.myTime);   // Stop ticking
                Helper.deleteLocalStorage();    // Clear localStorage
                _renderCurrentTaskTime();
                $resultMsg.html("<strong>" + _getTask().Name + "</strong> stopped successfully!");
            }
            else $resultMsg.text('Stopping failed!');
        });
    }

    function _createTask() {
        var $newTaskName = $modal.find('#new_task_name');
        var $createResultMsg = $modal.find('#create_result_msg');
        Helper.ajaxCall("createTask", "POST", "new_task_name=" + $newTaskName.val().trim(), function(response) {
            if (response == 1) {
                getTaskList();
                $newTaskName.val('');
                $resultMsg.text("New task was successfully created!");
                $modal.modal('hide');
            }
            else if (response == 2) {
                $createResultMsg.text("Please input some creative task name.");
            }
            else if (response == 3) {
                ActionProvider.logOut();
            }
            else if (response == 4) {
                $createResultMsg.text("This task name already exists, try something different.");
            }
            else {
                $resultMsg.text("New task name failed to create!");
                $modal.modal('hide');
            }
        });
    }
    function _editTask() {
        var $editResultMsg = $modal.find('#edit_result_msg');
        var data = {
            task_id: _getTask().Id,
            new_task_name: $modal.find('#edit_task_name').val().trim()
        };
        Helper.ajaxCall('editTask', 'POST', data, function (response) {
            if (response == 1) {
                getTaskList(data.task_id);
                $resultMsg.text("Task name was successfully edited!");
                $modal.modal('hide');
            }
            else if (response == 2) {
                $editResultMsg.text("Please input some creative task name.");
            }
            else if (response == 3) {
                ActionProvider.logOut();
            }
            else if (response == 4) {
                $editResultMsg.text("This task name already exists, try something different.");
            }
            else {
                $resultMsg.text("Edit task name failed!");
                $modal.modal('hide');
            }
        });
    }
    function _deleteTask() {
        var $deleteResultMsg = $modal.find('#delete_result_msg');
        var data = {
            task_id: _getTask().Id,
            password: $modal.find('#delete_task_password_confirm').val().trim()
        };
        Helper.ajaxCall('deleteTask', 'POST', data, function(response) {
            if (response == false) {
                getTaskList();
                $resultMsg.text("Task was deleted successfully.");
                $modal.modal('hide');
            }
            else if(response == 2) {
                $deleteResultMsg.text("Some information is missing.");
            }
            else if(response == 3) {
                $resultMsg.text("Record of current task is missing in database.");
                $modal.modal('hide');
            }
            else if(response == 4) {
                $deleteResultMsg.text("You entered wrong password.");
            }
        });
    }

    function getTaskList(task_id) {
        Helper.ajaxCall("getTaskList", "POST", undefined, function(taskListData) {
            tasks = taskListData;
            if (taskListData) {
                _renderTaskList(task_id);
                _renderCurrentTaskTime();
            }
            else {
                ActionProvider.renderLogin('You were logged out, please login again.');
            }
        });
    }

    return {
        getTaskList: getTaskList
    };
};