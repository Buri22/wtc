/**
 * Created by Uživatel on 11.9.2017.
 */
var Counter = function(models) {
    var Item = null;
    var items = null;
    var userId = null;
    var activeItemIndex = null;
    var $parentContainer, $counter, $itemList, $activeListItem, taskListTemplate, $pagination, paginationTpl, $paginationItemsPerPage, paginationIPPTpl,
        $modal, $newItemBtn, $resultMsg, $menuItem, $sideMenuItem;

    var pagination = {
        totalItems: null,
        itemsPerPage: [10, 20, 50, 100],
        itemsPerPageIndex: 0,
        currentPage: 1
    };

    // Load Views & Cache DOM
    $.get('view/counter.htm', function(template) {
        $counter                = $(template);
        $itemList               = $counter.find('#taskList');
        taskListTemplate        = $counter.find('#taskListTemplate').html();
        $pagination             = $counter.find('.pagination');
        paginationTpl           = $counter.find('#paginationTemplate').html();
        $paginationItemsPerPage = $counter.find('.paginationItemsPerPage');
        paginationIPPTpl        = $counter.find('#paginationIPPTemplate').html();
        $modal                  = $counter.find('#task_action_modal');
        $newItemBtn             = $counter.find('#newTask');
        $resultMsg              = $counter.find('#result_msg');
        $menuItem               = $counter.find('#counter_menu_item');
        $sideMenuItem           = $counter.find('#counter_side_menu_active_item');

        mediator.publish('CounterViewLoaded');
    });

    // Load Item Model
    function loadItemModel() {
        Item = models[0];
        items = null;
    }
    loadItemModel();

    // Bind Events
    function bindCounterEvents() {
        $newItemBtn.off('click').on('click', _renderModal);
        $itemList.find('li').on('click', _renderModal);
        $itemList.find('li .start').on('click', _startTicking);
        $itemList.find('li .stop').on('click', _stopTicking);
        $sideMenuItem.find('.stop').off('click').on('click', _stopTicking);
        $pagination.find('li a').off('click').on('click', _changeTablePage);
        $paginationItemsPerPage.off('change').on('change', _changeNumOfItemsPerPage);
        $menuItem.off('click').on('click', renderCounter);
    }
    function bindModalEvents($container) {
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
        if ($container != null && typeof $container != 'undefined' || typeof $parentContainer != 'undefined') {
            var startTicking = true;
            if (typeof $container.currentTarget != 'undefined' && $container.currentTarget.id == 'counter_menu_item') {
                startTicking = false;
            }
            if (!($container instanceof jQuery)) {
                $container = $parentContainer;
            }
            if (!$parentContainer) {
                $parentContainer = $container;
            }
            // Load model items for counting
            items = Item.getItems();
            // To make sure that items and $counter are already defined
            if (items == null) {
                mediator.subscribe('CounterModelLoaded', renderCounter, $container);
            }
            else if (typeof $counter == 'undefined') {
                mediator.subscribe('CounterViewLoaded', renderCounter, $container);
            } else {
                _renderTaskList();
                _adjustViewForNoTasks();
                _checkTickingTask(startTicking);

                $($container).html($counter);
                adjustItemsNameLength();
                bindCounterEvents();
            }
        }

    }
    function _renderTaskList(startIndex) {
        // Render TaskList table
        var itemList = [];
        // TODO: Make sure that items are defined
        pagination.totalItems = items.length;
        var itemsPerPage = pagination.itemsPerPage[pagination.itemsPerPageIndex];
        if ((pagination.currentPage - 1) * itemsPerPage > pagination.totalItems) {
            pagination.currentPage = 1;
        }
        startIndex = startIndex || (pagination.currentPage - 1) * itemsPerPage;
        var endIndex = startIndex + itemsPerPage;
        for (var i = 0; i < pagination.totalItems; i++) {
            // Save ticking task by defining activeItemIndex
            if (items[i].TaskStarted) {
                activeItemIndex = i;
            }

            if (i >= startIndex && i < endIndex) {
                itemList.push({
                    index: pagination.totalItems - i,
                    Id: i,
                    Name: items[i].Name,
                    SpentTime: secondsToHms(items[i].SpentTime)
                });
            }
        }
        $itemList.empty();
        $itemList.html(Mustache.render(taskListTemplate, { listItems: itemList }));

        // Render Pagination
        var numOfPaginationItems = Math.ceil(pagination.totalItems / itemsPerPage);
        if (numOfPaginationItems > 1) {
            var paginationItems = [];
            var active = '';
            for (i = 0; i < numOfPaginationItems; i++) {
                if (i == pagination.currentPage - 1) {
                    active = ' active';
                }
                paginationItems.push({ pageNum: i + 1, active: active });
                active = '';
            }
            $pagination.empty();
            $pagination.html(Mustache.render(paginationTpl, { paginationItems: paginationItems }));

            // Select box for items/page
            var options = [];
            var selected = '';
            for (i = 0; i < pagination.itemsPerPage.length; i++) {
                if (i == pagination.itemsPerPageIndex) {
                    selected = 'selected';
                }
                if (pagination.totalItems >= pagination.itemsPerPage[i]) {
                    options.push({ index: i, number: pagination.itemsPerPage[i], selected: selected });
                }
                selected = '';
            }
            $paginationItemsPerPage.empty().show();
            $paginationItemsPerPage.html(Mustache.render(paginationIPPTpl, { options: options }));
        }
        else {
            $paginationItemsPerPage.hide();
        }

        // Set active task list item
        if (activeItemIndex != null) {
            $activeListItem = $itemList.find('li[data-id="' + activeItemIndex + '"]');
            setActiveTaskListItem();
        }

        adjustItemsNameLength();
    }

    function _changeTablePage(event) {
        var pageNum = Number(event.target.dataset.page_num);
        pagination.currentPage = pageNum;
        var startIndex = (pageNum - 1) * pagination.itemsPerPage[pagination.itemsPerPageIndex];
        _renderTaskList(startIndex);
        bindCounterEvents();
        _checkTickingTask();
    }
    function _renderModal(event) {
        $.get('view/modal_parts.htm', function(templates) {
            var data = {};
            var $templates = $(templates);
            var $submitBtn = $templates.find('#submit_btn');

            // Define data for modal template0
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
                var itemIndex = Number(event.target.getAttribute('data-id') || event.target.parentElement.getAttribute('data-id'));
                var spentTime = secondsToHms(items[itemIndex].SpentTime);
                var storageTickingItem = localStorage.getObject(WTC_TICKING_COUNTER + '-' + userId);
                if (storageTickingItem != null && typeof storageTickingItem.spent_time != 'undefined') {
                    spentTime = storageTickingItem.spent_time;
                }

                var edit_delete_body = Mustache.render($templates.filter('#modal_body_edit_delete').html(), {
                    taskName: items[itemIndex].Name,
                    taskSpentTime: spentTime
                });

                Helper.getModalTemplate($modal, {
                    modal_id: 'edit_task',
                    title: 'Edit task',
                    modal_body: edit_delete_body,
                    submit_btn: $submitBtn.addClass('edit_btn').attr('data-id', itemIndex).prop('disabled', true)
                                            .text('Edit').parent().html()
                                + $submitBtn.addClass('delete_btn').attr('data-id', itemIndex).prop('disabled', false)
                                            .hide().text('Delete').parent().html()
                });
            }
        });
    }
    function renderMenuItem($container) {
        // To make sure that $menuItem is already defined
        if (typeof $menuItem == 'undefined') {
            mediator.subscribe('CounterViewLoaded', renderMenuItem, $container);
        } else {
            $container.append($menuItem);
        }
    }
    function renderPermanentSideMenuItems($container) {
        // To make sure that $menuItem is already defined
        if (typeof $newItemBtn == 'undefined') {
            mediator.subscribe('CounterViewLoaded', renderPermanentSideMenuItems, $container);
        } else {
            // Render items into SideMenu
            //$container.append($newItemBtn);	// Render Create Button
        }
    }
    function getTickingSideMenuItem(itemIndex, items) {
        var spentTimeHms = secondsToHms(items[itemIndex].SpentTime);
        var storageTickingItem = _getStorageTickingItem();
        if (storageTickingItem != null && storageTickingItem.spent_time) {
            spentTimeHms = storageTickingItem.spent_time;
        }

        //$sideMenuItem.find('.task_index').text(items.length - itemIndex + '.');
        $sideMenuItem.find('.name').text(items.length - itemIndex + '. ' + items[itemIndex].Name);
        $sideMenuItem.find('.spent_time').text(spentTimeHms);
        $sideMenuItem.attr('data-id', itemIndex);

        return $sideMenuItem;
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
        $activeListItem.find('.spent_time').text(counter_time);
        $sideMenuItem.find('.spent_time').text(counter_time);
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
    // Checks ticking objects $activeListItem, storageTickingItem to render ticking spent_time or startMyTimer
    function _checkTickingTask(startTicking) {
        var storageTickingItem = _getStorageTickingItem();
        // TODO: Make sure that activeItemIndex is defined
        // Storage Ticking Item is ok
        if (storageTickingItem != null
            && storageTickingItem.spent_time
            && storageTickingItem.task_id
            && activeItemIndex != null && items[activeItemIndex].Id == storageTickingItem.task_id) {
            if (startTicking) {
                startMyTimer(items[activeItemIndex], storageTickingItem.spent_time);
                mediator.publish('AddItemToSideMenu', getTickingSideMenuItem(activeItemIndex, items));
            }
            else {  // Just render ticking time
                myTimer(true);
            }
        }
        else if (startTicking && activeItemIndex != null) {    // Storage Ticking Item is missing
            startMyTimer(items[activeItemIndex]);
            mediator.publish('AddItemToSideMenu', getTickingSideMenuItem(activeItemIndex, items));
        }
    }
    function setActiveTaskListItem() {
        $itemList.find('li button.start').prop('disabled', true);
        $activeListItem.addClass('active');
        $activeListItem.find('button.start').hide();
        //$activeListItem.find('button.stop').show();
        $activeListItem.find('button.stop').css({'display': 'block', 'margin-top': '-28px'});
    }
    function unsetActiveTaskListItem() {
        $itemList.find('li button.start').prop('disabled', false);
        $activeListItem.removeClass('active');
        $activeListItem.find('button.start').show();
        $activeListItem.find('button.stop').hide();
        //$activeListItem.find('button.stop').css({'display': 'block', 'margin-top': '-28px'});
        $activeListItem = null;
    }
    function _startTicking(event) {
        var itemIndex = Number(event.target.parentElement.dataset.id);
        var data = {
            task_id: items[itemIndex].Id,
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
                items[itemIndex].TaskStarted = 1;
                items[itemIndex].LastStart = data.last_start;

                userId = app.getLoggedUserId();
                $activeListItem = $itemList.find('li[data-id="' + itemIndex + '"]');
                startMyTimer(response);

                $sideMenuItem.find('.stop').on('click', _stopTicking);
                setActiveTaskListItem();
                mediator.publish('AddItemToSideMenu', getTickingSideMenuItem(itemIndex, items));
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
        var itemIndex = Number(event.target.parentElement.dataset.id);
        if (data == null || typeof data.task_id == 'undefined' || typeof data.spent_time == 'undefined') {
            data = {
                task_id: items[itemIndex].Id
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
                items[itemIndex].SpentTime = response.SpentTime || 0;
                items[itemIndex].TaskStarted = 0;

                clearInterval(window.myTime);   // Stop ticking
                deleteLocalStorage();   // Clear localStorage
                userId = null;          // Reset user id
                unsetActiveTaskListItem();
                mediator.publish('RemoveItemFromSideMenu', $sideMenuItem.attr('id'));
                activeItemIndex = null;
                $resultMsg.html("<strong>" + items[itemIndex].Name + "</strong> stopped successfully!");
            }
            else $resultMsg.text('Stopping failed!');
        });
        event.stopPropagation();
    }

    function _createTask() {
        var $newTaskName = $modal.find('#new_task_name');
        var $createResultMsg = $modal.find('#create_result_msg');

        Helper.ajaxCall("createTask", "POST", "new_task_name=" + $newTaskName.val().trim(), function(response) {
            if (response.Name == $newTaskName.val().trim()) {
                // Update model
                items.unshift(response);    // Adds created Task to the beginning of items array
                pagination.totalItems = items.length;

                _renderTaskList();
                bindCounterEvents();
                _checkTickingTask();
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
        var itemIndex = Number(event.target.dataset.id);
        var data = {
            task_id: items[itemIndex].Id,
            new_task_name: $modal.find('#edit_task_name').val().trim(),
            new_task_spent_time: $modal.find('#edit_task_spent_time').val().trim()
        };
        Helper.ajaxCall('editTask', 'POST', data, function (response) {
            if (response == 1) {
                // Update model
                items[itemIndex].Name = data.new_task_name;
                items[itemIndex].SpentTime = hmsToSeconds(data.new_task_spent_time);

                _renderTaskList();
                bindCounterEvents();
                _checkTickingTask();
                $resultMsg.text("Task was successfully edited!");
                $modal.modal('hide');

                animateEditedItem(Number(event.target.dataset.id));
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
            task_id: items[task_index].Id,
            password: $modal.find('#delete_task_password_confirm').val().trim()
        };
        Helper.ajaxCall('deleteTask', 'POST', data, function(response) {
            if (response == false) {
                // Update model
                items.splice(task_index, 1);
                pagination.totalItems = items.length;
                $resultMsg.text("Task was deleted successfully.");

                _renderTaskList();
                _adjustViewForNoTasks();
                bindCounterEvents();
                _checkTickingTask();
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

    function clearViewDataModel() {
        clearInterval(window.myTime);   // Stop ticking
        userId = null;
        items = null;
        Item = null;
        $activeListItem = null;
        pagination.totalItems = null;
        pagination.currentPage = 1;

        $itemList.empty();
        $pagination.empty();
        $resultMsg.empty();

        //mediator.publish('ClearDataModel');
    }
    function _adjustViewForNoTasks() {
        if (items.length == 0) {
            $itemList.empty();
            $resultMsg.text("Please create task, by clicking on the Create button.");
        }
    }
    function animateEditedItem(item_id) {
        if (typeof item_id != 'undefined') {
            $itemList.find('li[data-id="' + item_id + '"] span.edit_animation_box')
                .css('opacity', '1')
                .animate({opacity: '0'}, 3000);
        }
    }
    function setResultMsg(text) {
        $resultMsg.text(text);
    }
    function _changeNumOfItemsPerPage(event) {
        pagination.itemsPerPageIndex = Number($(event.target).val());

        _renderTaskList();
        bindCounterEvents();
        _checkTickingTask();
    }
    // Edit view according to SideMenu position
    function adjustItemsListForActiveSideMenu() {
        // To make sure that $itemList is already defined
        if (typeof $itemList == 'undefined') {
            mediator.subscribe('CounterViewLoaded', adjustItemsListForActiveSideMenu);
        } else {
            $itemList.parent()
                .removeClass('col-md-8 col-md-offset-2')
                .addClass('col-md-10 col-md-offset-1');
            //.addClass('col-md-12')

            adjustItemsNameLength();
        }
    }
    function adjustItemsNameLength() {
        var itemNames = $itemList.find('span.name');
        var maxHeight = $itemList.find('span.task_index').height();
        for (var i = 0; i < itemNames.length; i++) {
            var $itemName = $(itemNames[i]);
            while ($itemName.height() > maxHeight + 5) {	// + 5 for variability
                var name = $itemName.text();
                var lastIndexOfSpace = name.lastIndexOf(" ");
                $itemName.text(name.substring(0, lastIndexOfSpace) + '...');
            }
        }
    }

    mediator.subscribe('MenuReadyToImportModuleItems', renderMenuItem);
    mediator.subscribe('PageReadyToImportModuleItems', renderCounter);
    mediator.subscribe('PageReadyToImportSideMenuItems', renderPermanentSideMenuItems);
    mediator.subscribe('CounterMenuItemClick', renderCounter);
    mediator.subscribe('UserLogin', loadItemModel);
    mediator.subscribe('UserLogout', clearViewDataModel);
    mediator.subscribe('SetResultMessage', setResultMsg);
    mediator.subscribe('ReadyToBindModalEvents', bindModalEvents);
    mediator.subscribe('ActiveSideMenu', adjustItemsListForActiveSideMenu);

    return {
        //renderCounter: renderCounter
    };
};