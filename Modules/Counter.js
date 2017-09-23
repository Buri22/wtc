/**
 * Created by Uživatel on 11.9.2017.
 */
var Counter = function() {
    var tasks = [];
    var maxTaskNameLength = 80;
    var modelViewLoadedSubscribed = false;
    var $counter, $taskList, taskListTemplate, $modal, $taskActionBtns, $startBtn, $stopBtn, $timeCounter, $resultMsg;

    // Load Task data
    Helper.ajaxCall("getTaskList", "POST", undefined, function(taskListData) {
        if (taskListData) {
            // Define task model
            tasks = taskListData;

            mediator.publish('CounterModelViewLoaded');
        }
        else {  // Just in case user is not logged in
            mediator.publish('RenderLogin', 'You were logged out, please login again.');
        }
    });

    // Load Views & Cache DOM
    $.get('view/counter.htm', function(template) {
        $counter         = $(template);
        $taskList        = $counter.find('#taskList');
        taskListTemplate = $counter.find('#taskListTemplate').html();
        $modal           = $counter.find('#task_action_modal');
        $taskActionBtns  = $counter.filter('#task_action_buttons');
        $startBtn        = $counter.find('#buttonStart');
        $stopBtn         = $counter.find('#buttonStop');
        $timeCounter     = $counter.find('#timeCounter');
        $resultMsg       = $counter.find('#result_msg');

        mediator.publish('CounterModelViewLoaded');
    });

    // Bind Events
    function bindCounterEvents() {
        $taskList.on('change', _renderCurrentTaskTime);
        $startBtn.on('click', _startTicking);
        $stopBtn.on('click', _stopTicking);
        $taskActionBtns.on('click', '#newTask, #editTask, #deleteTask', _renderModal);
    }

    function renderCounter($container) {
        if (tasks.length == 0 || typeof $counter == 'undefined') {
            if (!modelViewLoadedSubscribed) {
                mediator.subscribe('CounterModelViewLoaded', renderCounter, $container);
                modelViewLoadedSubscribed = true;
            }
        } else {
            _renderTaskList();
            _renderCurrentTaskTime();

            bindCounterEvents();
            $($container).html($counter);
        }
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
        task_id = task_id || taskList[0] && taskList[0].Id;
        $taskList.find('option[value="' + task_id + '"]').attr('selected', '');
    }
    function _renderCurrentTaskTime(event) {
        var task = _getTask();

        if (typeof task.Id == 'undefined') {
            $timeCounter.html(LOADING_GIF);
        }
        else if (task.TaskStarted && localStorage.getItem(WTC_TICKING_COUNTER)) {
            $timeCounter.text(localStorage.getItem(WTC_TICKING_COUNTER));
        }
        else {
            $timeCounter.text(Helper.secondsToHms(task.SpentTime));
        }

        typeof event != 'undefined' && event.type == 'change' && $resultMsg.empty();  // Clear result msg on change
    }
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
    function _renderMenuItem() {
        // TODO: html kod presunout do counter.htm
        $('#main_menu').empty().append('<li class="active"><a href="#">Counter</a></li>');
    }

    function _startTicking() {
        var data = {
            task_id: _getTask().Id,
            last_start: Helper.getCurrentTime() // We store time in seconds
        };
        Helper.ajaxCall("startTask", "POST", data, function(response) {
            if (response == 'logOut') {    // User isn`t logged in
                mediator.publish('LogOut');
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

                localStorage.setItem(WTC_TICKING_COUNTER, Helper.secondsToHms(response.SpentTime || 0));
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
                mediator.publish('LogOut');
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

    function _getTask(id, param) {
        var task = {};
        var index = 0;
        // Without id parameter gets selected task id
        id = id || Number($taskList.val());

        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].Id == id) {
                task = tasks[i];
                index = i;
                break;
            }
        }

        if (param == 'index') {
            return index;
        }
        else {
            return task;
        }
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

    function _createTask() {
        var $newTaskName = $modal.find('#new_task_name');
        var $createResultMsg = $modal.find('#create_result_msg');

        Helper.ajaxCall("createTask", "POST", "new_task_name=" + $newTaskName.val().trim(), function(response) {
            if (response.Name == $newTaskName.val().trim()) {
                // Update model
                tasks.unshift(response);    // Adds created Task to the beginning of tasks array

                _renderTaskList();
                _renderCurrentTaskTime();
                $newTaskName.val('');
                $resultMsg.text("New task was successfully created!");
                $modal.modal('hide');
            }
            else if (response == 2) {
                $createResultMsg.text("Please input some creative task name.");
            }
            else if (response == 3) {
                mediator.publish('LogOut');
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
                // Update model
                _setTask(data.task_id, { name: data.new_task_name });

                _renderTaskList(data.task_id);
                _renderCurrentTaskTime();
                $resultMsg.text("Task name was successfully edited!");
                $modal.modal('hide');
            }
            else if (response == 2) {
                $editResultMsg.text("Please input some creative task name.");
            }
            else if (response == 3) {
                mediator.publish('LogOut');
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
                //getTaskList();
                // Update model
                tasks.splice(_getTask(data.task_id, 'index'), 1);

                _renderTaskList();
                _renderCurrentTaskTime();
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
            else if(response == 5) {
                $resultMsg.text("You have to stop current task, to delete it.");
                $modal.modal('hide');
            }
        });
    }

    mediator.subscribe('MenuReadyToImportModuleItems', _renderMenuItem);
    return {
        renderCounter: renderCounter
    };
};