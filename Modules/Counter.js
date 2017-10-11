/**
 * Created by Uživatel on 11.9.2017.
 */
var Counter = function() {
    var tasks = null;
    var userId = null;
    var maxTaskNameLength = 80;
    var modelViewLoadSubscribedForRenderCounter, modelViewLoadSubscribedForRenderMenuItem,
        $counter, $taskList, $activeTaskListItem, taskListTemplate, $modal, $newTaskBtn, $timeCounter, $resultMsg, $menuItem;
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
        $newTaskBtn      = $counter.find('#newTask');
        $timeCounter     = $counter.find('#time_counter');
        $resultMsg       = $counter.find('#result_msg');

        $menuItem        = $counter.find('#menu_item');

        mediator.publish('CounterModelViewLoaded');
    });

    // Bind Events
    function bindCounterEvents() {
        $taskList.find('li').on('click', _renderModal);
        $taskList.find('li .start').on('click', _startTicking);
        $taskList.find('li .stop').on('click', _stopTicking);
        $newTaskBtn.off('click').on('click', _renderModal);
    }
    function _bindModalEvents($container) {
        switch ($container.find('.modal-dialog').attr('id')) {
            case 'create_new_task':
                $container.find('#submit_btn').off('click').on('click', _createTask);
                break;
            case 'edit_task':
                // Submit btn actions
                $container.find('#submit_btn.edit_btn').off('click').on('click', _editTask);
                $container.find('#submit_btn.delete_btn').off('click').on('click', _deleteTask);

                // Edit/Delete tab click event
                $container.find('#edit_page').off('click').on('click', function() {
                    $container.find('#edit_page').addClass('active');
                    $container.find('#delete_page').removeClass('active');
                    $container.find('.modal-header .modal-title').text('Edit task');
                    $container.find('#edit_body, #submit_btn.edit_btn').show();
                    $container.find('#delete_body, #submit_btn.delete_btn').hide();

                    $container.find('#edit_task_name').get(0).focus();
                    $container.find('#edit_result_msg').empty();

                    Helper.bindKeyShortcutEvent($container, '#submit_btn.edit_btn');
                });
                $container.find('#delete_page').off('click').on('click', function() {
                    $container.find('#edit_page').removeClass('active');
                    $container.find('#delete_page').addClass('active');
                    $container.find('.modal-header .modal-title').text('Delete task');
                    $container.find('#edit_body, #submit_btn.edit_btn').hide();
                    $container.find('#delete_body, #submit_btn.delete_btn').show();

                    $container.find('#delete_task_password_confirm').get(0).focus();
                    $container.find('#edit_result_msg').empty();

                    Helper.bindKeyShortcutEvent($container, '#submit_btn.delete_btn');
                });

                // Handle submit button according to changed form data
                Helper.checkFormToDisableSubmitBtn($container.find('form'), $container.find('#submit_btn'));
                break;

            default:
                break;
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
            _adjustViewForNoTasks();    // TODO: refactor
            _renderTaskList();
            _checkTickingTask();

            $($container).html($counter);
            bindCounterEvents();
        }
    }

    function _renderTaskList() {
        var taskList = [];
        var activeTaskIndex = null;
        for (var i = 0; i < tasks.length; i++) {
            var taskName = tasks[i].Name;
            // Adjust task name length
            if (taskName.length > maxTaskNameLength) {
                taskName = taskName.substring(0, maxTaskNameLength - 3) + '...';
            }
            // Save ticking task
            if (tasks[i].TaskStarted) {
                activeTaskIndex = i;
            }
            taskList.push({ index: i + 1, Id: i, Name: taskName, SpentTime: secondsToHms(tasks[i].SpentTime) });
        }
        $taskList.empty();
        $taskList.html(Mustache.render(taskListTemplate, { listItems: taskList }));

        // Set active task list item
        if (activeTaskIndex != null) {
            $activeTaskListItem = $taskList.find('li[data-id="' + activeTaskIndex + '"]');
            setActiveTaskListItem();
        }
    }
    function _renderModal(event) {
        $.get('view/modal_parts.htm', function(templates) {
            var data = {};
            var $templates = $(templates);
            var $submitBtn = $templates.find('#submit_btn');

            // Define data for modal template
            // Create new task
            if (event.target.id == 'newTask') {
                Helper.getModalTemplate($modal, {
                    modal_id: 'create_new_task',
                    title: 'Create new task',
                    modal_body: $templates.filter('#modal_body_create').html(),
                    submit_btn: $submitBtn.text('Create').parent().html()
                });
            }
            // Edit/Delete task
            else if (event.target.getAttribute('data-id') || event.target.parentElement.getAttribute('data-id')) {
                var taskIndex = Number(event.target.getAttribute('data-id') || event.target.parentElement.getAttribute('data-id'));
                var edit_delete_body = Mustache.render($templates.filter('#modal_body_edit_delete').html(), {
                    taskName: tasks[taskIndex].Name,
                    taskSpentTime: secondsToHms(tasks[taskIndex].SpentTime)
                });

                Helper.getModalTemplate($modal, {
                    modal_id: 'edit_task',
                    title: 'Edit task',
                    modal_body: edit_delete_body,
                    submit_btn: $submitBtn.addClass('edit_btn').attr('data-id', taskIndex).prop('disabled', true)
                                            .text('Edit').parent().html()
                                + $submitBtn.addClass('delete_btn').attr('data-id', taskIndex).prop('disabled', false)
                                            .hide().text('Delete').parent().html()
                });
            }
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

    function secondsToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
        return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    }
    function hmsToSeconds(s) {
        var hms_time = s.split(":");
        return Number(hms_time[2]) + Number(hms_time[1]) * 60 + Number(hms_time[0]) * 60 * 60;
    }
    function myTimer(noAdd) {
        var storageTickingItem = localStorage.getObject(WTC_TICKING_COUNTER + '-' + userId);
        var counter_time = storageTickingItem.spent_time;

        if (noAdd !== true) {
            counter_time = hmsToSeconds(counter_time) + 1;
            counter_time = secondsToHms(counter_time);
        }
        storageTickingItem.spent_time = counter_time;

        localStorage.setObject(WTC_TICKING_COUNTER + '-' + userId, storageTickingItem);

        // Render ticking time
        $activeTaskListItem.find('.spent_time').text(counter_time);
    }
    function startMyTimer(task, storageSpentTime) {
        var storageTickingItem = {
            task_id: task.Id,
            spent_time: storageSpentTime || secondsToHms(task.SpentTime || 0)
        };
        localStorage.setObject(WTC_TICKING_COUNTER + '-' + userId, storageTickingItem);

        window.myTime = setInterval(function () {
            myTimer();
        }, 1000);
        myTimer();
    }
    function deleteLocalStorage() {
        localStorage.getItem(WTC_TICKING_COUNTER + '-' + userId) != null && localStorage.removeItem(WTC_TICKING_COUNTER + '-' + userId);
    }
    function _getStorageTickingItem() {
        if (userId == null) {
            userId = app.getLoggedUserId();
        }

        return localStorage.getObject(WTC_TICKING_COUNTER + '-' + userId);
    }
    function _checkTickingTask() {
        if ($activeTaskListItem != null) {
            var storageTickingItem = _getStorageTickingItem();
            var taskIndex = Number($activeTaskListItem.data('id'));
            // Storage Ticking Item is ok
            if (storageTickingItem != null
                && storageTickingItem.spent_time
                && storageTickingItem.task_id
                && tasks[taskIndex].Id == storageTickingItem.task_id) {
                startMyTimer(tasks[taskIndex], storageTickingItem.spent_time);
            }
            else {  // Storage Ticking Item is missing
                startMyTimer(tasks[taskIndex]);
            }
        }
    }
    function setActiveTaskListItem() {
        $taskList.find('li button.start').prop('disabled', true);
        $activeTaskListItem.addClass('active');
        $activeTaskListItem.find('button.start').hide();
        //$activeTaskListItem.find('button.stop').show();
        $activeTaskListItem.find('button.stop').css({'display': 'block', 'margin-top': '-28px'});
    }
    function unsetActiveTaskListItem() {
        $taskList.find('li button.start').prop('disabled', false);
        $activeTaskListItem.removeClass('active');
        $activeTaskListItem.find('button.start').show();
        $activeTaskListItem.find('button.stop').hide();
        //$activeTaskListItem.find('button.stop').css({'display': 'block', 'margin-top': '-28px'});
        $activeTaskListItem = null;
    }
    function _startTicking(event) {
        var taskIndex = Number(event.target.parentElement.dataset.id);
        var data = {
            task_id: tasks[taskIndex].Id,
            last_start: Math.round(new Date().getTime() / 1000) // We store time in seconds
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
                tasks[taskIndex].TaskStarted = 1;
                tasks[taskIndex].LastStart = data.last_start;

                userId = app.getLoggedUserId();
                $activeTaskListItem = $taskList.find('li[data-id="' + taskIndex + '"]');
                startMyTimer(response);

                setActiveTaskListItem();
                $resultMsg.text('Started successfully!');
            }
            else {
                $resultMsg.text('Failed to start this task.');
            }
        });
        event.stopPropagation();
    }
    function _stopTicking(event) {
        var data = _getStorageTickingItem();
        var taskIndex = Number(event.target.parentElement.dataset.id);
        if (data == null || typeof data.task_id == 'undefined' || typeof data.spent_time == 'undefined') {
            data = {
                task_id: tasks[taskIndex].Id
            }
        }
        Helper.ajaxCall("stopTask", "POST", data, function(response) {
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
                tasks[taskIndex].SpentTime = response.SpentTime || 0;
                tasks[taskIndex].TaskStarted = 0;

                clearInterval(window.myTime);   // Stop ticking
                deleteLocalStorage();   // Clear localStorage
                userId = null;          // Reset user id
                $resultMsg.html("<strong>" + tasks[taskIndex].Name + "</strong> stopped successfully!");
                unsetActiveTaskListItem();
            }
            else $resultMsg.text('Stopping failed!');
        });
        event.stopPropagation();
    }

    //function _getTask(id, param) {
    //    var task = {};
    //    var index = 0;
    //    // Without id parameter gets selected task id
    //    id = id || Number($taskList.val());
    //
    //    for (var i = 0; i < tasks.length; i++) {
    //        if (tasks[i].Id == id) {
    //            task = tasks[i];
    //            index = i;
    //            break;
    //        }
    //    }
    //
    //    if (param == 'index') {
    //        return index;
    //    }
    //    else {
    //        return task;
    //    }
    //}
    //function _setTask(id, data) {
    //    for (var i = 0; i < tasks.length; i++) {
    //        if (tasks[i].Id == id) {
    //            tasks[i].Name        = data.name || tasks[i].Name;
    //            tasks[i].LastStart   = data.last_start || tasks[i].LastStart;
    //            tasks[i].SpentTime   = data.spent_time || tasks[i].SpentTime;
    //            tasks[i].TaskStarted = data.task_started == 0 ? 0 : data.task_started || tasks[i].TaskStarted;
    //            break;
    //        }
    //    }
    //}

    function _createTask() {
        var $newTaskName = $modal.find('#new_task_name');
        var $createResultMsg = $modal.find('#create_result_msg');

        Helper.ajaxCall("createTask", "POST", "new_task_name=" + $newTaskName.val().trim(), function(response) {
            if (response.Name == $newTaskName.val().trim()) {
                // Update model
                tasks.unshift(response);    // Adds created Task to the beginning of tasks array

                _adjustViewForNoTasks();    // Does this need to be here?
                _renderTaskList();
                bindCounterEvents();
                myTimer(true);
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
    function _editTask(event) {
        var $editResultMsg = $modal.find('#edit_result_msg');
        var taskIndex = Number(event.target.dataset.id);
        var data = {
            task_id: tasks[taskIndex].Id,
            new_task_name: $modal.find('#edit_task_name').val().trim(),
            new_task_spent_time: $modal.find('#edit_task_spent_time').val().trim()
        };
        Helper.ajaxCall('editTask', 'POST', data, function (response) {
            if (response == 1) {
                // Update model
                tasks[taskIndex].Name = data.new_task_name;
                tasks[taskIndex].SpentTime = hmsToSeconds(data.new_task_spent_time);

                _renderTaskList();
                bindCounterEvents();
                $resultMsg.text("Task was successfully edited!");
                $modal.modal('hide');

                animateEditedTask(Number(event.target.dataset.id));
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
                $editResultMsg.text("Please insert Spent time in a valid format (hh:mm:ss).");
            }
            else {
                $resultMsg.text("Edit task name failed!");
                $modal.modal('hide');
            }
        });
    }
    function _deleteTask(event) {
        var task_index = Number(event.target.dataset.id);
        var $deleteResultMsg = $modal.find('#edit_result_msg');
        var data = {
            task_id: tasks[task_index].Id,
            password: $modal.find('#delete_task_password_confirm').val().trim()
        };
        Helper.ajaxCall('deleteTask', 'POST', data, function(response) {
            if (response == false) {
                // Update model
                tasks.splice(task_index, 1);
                $resultMsg.text("Task was deleted successfully.");

                _adjustViewForNoTasks();
                _renderTaskList();
                bindCounterEvents();
                myTimer(true);
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
        clearInterval(window.myTime);   // Stop ticking
        userId = null;
        tasks = null;
        $taskList.empty();
        $resultMsg.empty();
    }
    function _adjustViewForNoTasks() {
        if (tasks.length == 0) {
            $taskList.prop('disabled', true);
            $counter.filter('#start_stop_section, #output_section').hide();
            $resultMsg.text("Please create task, by clicking on the Create button.");
        } else {
            $taskList.prop('disabled', false);
            $counter.filter('#start_stop_section, #output_section').show();
        }
    }
    function animateEditedTask(task_id) {
        if (typeof task_id != 'undefined') {
            $taskList.find('li[data-id="' + task_id + '"] span.edit_animation_box')
                .css('opacity', '1')
                .animate({opacity: '0'}, 3000);
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