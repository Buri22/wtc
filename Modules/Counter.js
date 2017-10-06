/**
 * Created by Uživatel on 11.9.2017.
 */
var Counter = function() {
    var tasks = null;
    var maxTaskNameLength = 80;
    var modelViewLoadSubscribedForRenderCounter, modelViewLoadSubscribedForRenderMenuItem,
        $counter, $taskList, taskListTemplate, $modal, $taskActionBtns, $startBtn, $stopBtn, $timeCounter, $resultMsg, $menuItem;
    modelViewLoadSubscribedForRenderCounter = modelViewLoadSubscribedForRenderMenuItem = false;

    // Load Task data
    function _loadTaskData() {
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
    }
    _loadTaskData();

    // Load Views & Cache DOM
    $.get('view/counter.htm', function(template) {
        $counter         = $(template);
        $taskList        = $counter.find('#taskList');
        taskListTemplate = $counter.find('#taskListTemplate').html();
        $modal           = $counter.find('#task_action_modal');
        $taskActionBtns  = $counter.filter('#task_action_buttons');
        $startBtn        = $counter.find('#buttonStart');
        $stopBtn         = $counter.find('#buttonStop');
        $timeCounter     = $counter.find('#time_counter');
        $resultMsg       = $counter.find('#result_msg');

        $menuItem        = $counter.find('#menu_item');

        mediator.publish('CounterModelViewLoaded');
    });

    // Bind Events
    function bindCounterEvents() {
        $taskList.on('change', _renderCurrentTaskTime);
        $startBtn.on('click', _startTicking);
        $stopBtn.on('click', _stopTicking);
        $taskActionBtns.on('click', '#newTask, #editTask, #deleteTask', _renderModal);
    }
    function _bindModalEvents($container) {
        var action;
        switch ($container.find('.modal-dialog').attr('id')) {
            case 'create_new_task':
                action = _createTask;
                break;
            case 'edit_task':
                action = _editTask;
                break;
            case 'delete_task':
                action = _deleteTask;
                break;

            default:
                break;
        }

        // Bind submit event
        if (typeof action != 'undefined') {
            $container.find('#submit_btn').off('click').on('click', action);
        }
    }

    function renderCounter($container) {
        // To make sure that tasks and $counter are already defined
        if (tasks == null || typeof $counter == 'undefined') {
            if (!modelViewLoadSubscribedForRenderCounter) { // To subscribe just one time
                mediator.subscribe('CounterModelViewLoaded', renderCounter, $container);
                modelViewLoadSubscribedForRenderCounter = true;
            }
        } else {
            adjustViewForNoTasks();
            _renderTaskList();
            _renderCurrentTaskTime();

            $($container).html($counter);
            bindCounterEvents();
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
            var $templates = $(templates);
            var $submitBtn = $templates.find('#submit_btn');

            // Create data for modal template
            switch (event.target.id) {
                case 'newTask':
                    data = {
                        modal_id: 'create_new_task',
                        title: 'Create new task',
                        modal_body: $templates.filter('#modal_body_create').html(),
                        submit_btn: $submitBtn.text('Create').parent().html()
                    };
                    break;
                case 'editTask':
                    var edit_body = Mustache.render($templates.filter('#modal_body_edit').html(), {
                        taskName: _getTask().Name,
                        taskSpentTime: _getTaskSpentTimeInHms()
                    });
                    data = {
                        modal_id: 'edit_task',
                        title: 'Edit task',
                        modal_body: edit_body,
                        submit_btn: $submitBtn.text('Edit').parent().html()
                    };
                    break;
                case 'deleteTask':
                    var delete_body = Mustache.render($templates.filter('#modal_body_delete').html(), { taskName: _getTask().Name });
                    data = {
                        modal_id: 'delete_task',
                        title: 'Delete current task',
                        modal_body: delete_body,
                        submit_btn: $submitBtn.text('Delete').parent().html()
                    };
                    break;

                default:
                    break;
            }

            Helper.getModalTemplate($modal, data);
        });
    }
    function _renderMenuItem($container) {
        // To make sure that $menuItem is already defined
        if (typeof $menuItem == 'undefined') {
            if (!modelViewLoadSubscribedForRenderMenuItem) {    // To subscribe just one time
                mediator.subscribe('CounterModelViewLoaded', _renderMenuItem, $container);
                modelViewLoadSubscribedForRenderMenuItem = true;
            }
        } else {
            // Bind onclick event for $menuItem
            $menuItem.on('click', function() {
                mediator.publish('CounterMenuItemClick');
            });
            $container.append($menuItem);
        }
    }

    function _startTicking() {
        var data = {
            task_id: _getTask().Id,
            last_start: Helper.getCurrentTime() // We store time in seconds
        };
        Helper.ajaxCall("startTask", "POST", data, function(response) {
            if (response == 'logOut') {    // User isn`t logged in
                mediator.publish('LogOut', 'You were unexpectedly logged out.');
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
                mediator.publish('LogOut', 'You were unexpectedly logged out.');
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
    function _getTaskSpentTimeInHms() {
        var spentTime = _getTask().SpentTime;
        if (spentTime == null || spentTime == "") {
            return Helper.secondsToHms(0);
        }
        return Helper.secondsToHms(spentTime);
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

                adjustViewForNoTasks();
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
                mediator.publish('LogOut', 'You were unexpectedly logged out.');
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
            new_task_name: $modal.find('#edit_task_name').val().trim(),
            new_task_spent_time: $modal.find('#edit_task_spent_time').val().trim()
        };
        Helper.ajaxCall('editTask', 'POST', data, function (response) {
            if (response == 1) {
                // Update model
                _setTask(data.task_id, { name: data.new_task_name, spent_time: Helper.hmsToSeconds(data.new_task_spent_time) });

                _renderTaskList(data.task_id);
                _renderCurrentTaskTime();
                $resultMsg.text("Task was successfully edited!");
                $modal.modal('hide');
            }
            else if (response == 2) {
                $editResultMsg.text("Please input some creative task name.");
            }
            else if (response == 3) {
                mediator.publish('LogOut', 'You were unexpectedly logged out.');
            }
            else if (response == 4) {
                $editResultMsg.text("This task name already exists, try something different.");
            }
            else if (response == 5) {
                $editResultMsg.text("Please insert SpentTime in a valid format (hh:mm:ss).");
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
                // Update model
                tasks.splice(_getTask(data.task_id, 'index'), 1);
                $resultMsg.text("Task was deleted successfully.");

                adjustViewForNoTasks();
                _renderTaskList();
                _renderCurrentTaskTime();
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

    function _clearViewDataModel() {
        tasks = null;
        $taskList.empty();
        $resultMsg.empty();
    }
    function adjustViewForNoTasks() {
        if (tasks.length == 0) {
            $taskList.prop('disabled', true);
            $taskActionBtns.find('#editTask, #deleteTask').prop('disabled', true);
            $counter.filter('#start_stop_section, #output_section').hide();
            $resultMsg.text("Please create task, by clicking on the Create button.");
        } else {
            $taskList.prop('disabled', false);
            $taskActionBtns.find('#editTask, #deleteTask').prop('disabled', false);
            $counter.filter('#start_stop_section, #output_section').show();
        }
    }

    function _setResultMsg(text) {
        $resultMsg.text(text);
    }

    mediator.subscribe('MenuReadyToImportModuleItems', _renderMenuItem);
    mediator.subscribe('UserLogin', _loadTaskData);
    mediator.subscribe('UserLogout', _clearViewDataModel);
    mediator.subscribe('SetResultMessage', _setResultMsg);
    mediator.subscribe('ReadyToBindModalEvents', _bindModalEvents);
    return {
        renderCounter: renderCounter
    };
};