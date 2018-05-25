import $ from 'jquery';
import 'bootstrap';
import 'bootstrap-datepicker';

import {mediator} from '../mediator';
import {dataProvider} from '../dataProvider';
import {WTC_TICKING_COUNTER, DATEPICKER_OPTIONS} from '../constants';

import Helper from '../helper';
import TaskList from '../model/task';

/**
 * Counter module object
 * Manipulates with task object
 */
export default class Counter {

    constructor() {
        this.itemList = null;
        //this.items = null;
        this.userId = null;
        this.activeItemIndex = null;
        this.$parentContainer, this.$counter, this.$itemList, this.$activeListItem, this.taskListTemplate, 
        this.$pagination, this.paginationTpl, this.$paginationItemsPerPage, this.paginationIPPTpl,
        this.$modal, this.$newItemBtn, this.$resultMsg, this.$menuItem, this.$sideMenuItem;

        this.pagination = {
            totalItems: null,
            itemsPerPage: [10, 20, 50, 100],
            itemsPerPageIndex: 0,
            currentPage: 1
        };

        // Load Model
        this.loadItemModel();

        // Load Views & Cache DOM
        $.get('view/counter.htm', (template) => {
            this.$counter                = $(template);
            this.$itemList               = this.$counter.find('#taskList');
            this.taskListTemplate        = this.$counter.find('#taskListTemplate').html();
            this.$pagination             = this.$counter.find('.pagination');
            this.paginationTpl           = this.$counter.find('#paginationTemplate').html();
            this.$paginationItemsPerPage = this.$counter.find('.paginationItemsPerPage');
            this.paginationIPPTpl        = this.$counter.find('#paginationIPPTemplate').html();
            this.$modal                  = this.$counter.find('#task_action_modal');
            this.$newItemBtn             = this.$counter.find('#newTask');
            this.$resultMsg              = this.$counter.find('#result_msg');
            this.$menuItem               = this.$counter.find('#counter_menu_item');
            this.$sideMenuItem           = this.$counter.find('#counter_side_menu_active_item');

            mediator.publish('CounterViewLoaded');
        });

        // Subscribe to listen for calls from outside
        mediator.subscribe('MenuReadyToImportModuleItems', this.renderMenuItem.bind(this));
        mediator.subscribe('PageReadyToImportModuleItems', this.renderCounter.bind(this));
        mediator.subscribe('PageReadyToImportSideMenuItems', this.renderPermanentSideMenuItems.bind(this));
        mediator.subscribe('CounterMenuItemClick', this.renderCounter.bind(this));
        mediator.subscribe('UserLogin', this.loadItemModel.bind(this));
        mediator.subscribe('UserLogout', this.clearViewDataModel.bind(this));
        mediator.subscribe('SetResultMessage', this.setResultMsg.bind(this));
        mediator.subscribe('ReadyToBindModalEvents', this.bindModalEvents.bind(this));
        mediator.subscribe('ActiveSideMenu', this.adjustItemsListForActiveSideMenu.bind(this));
    }
    
    // Load itemList Model
    loadItemModel() {
        dataProvider.provide('getTaskList').done((taskListData) => {
            if (taskListData) {
                this.itemList = new TaskList(taskListData).taskList;

                mediator.publish('CounterModelLoaded');
            }
            else {  // Just in case user is not logged in
                mediator.publish('RenderLogin', 'You were logged out, please login again.');
            }
        });
    }

    // Bind Events
    bindCounterEvents() {
        this.$newItemBtn.off('click').on('click', this._renderModal.bind(this));
        this.$itemList.find('li').on('click', this._renderModal.bind(this));
        this.$itemList.find('li .start').on('click', this._startTicking.bind(this));
        this.$itemList.find('li .stop').on('click', this._stopTicking.bind(this));
        this.$sideMenuItem.find('.stop').off('click').on('click', this._stopTicking.bind(this));
        this.$pagination.find('li a').off('click').on('click', this._changeTablePage.bind(this));
        this.$paginationItemsPerPage.off('change').on('change', this._changeNumOfItemsPerPage.bind(this));
        this.$menuItem.off('click').on('click', this.renderCounter.bind(this));
    }
    bindModalEvents($container) {
        switch ($container.find('.modal-dialog').attr('id')) {
            case 'create_new_task':
                $container.find('.submit_btn').off('click').on('click', this._createTask);
                $container.find('#new_task_date_created').datepicker(DATEPICKER_OPTIONS);
                break;
            case 'edit_task':
                // Submit btn actions
                $container.find('.submit_btn.edit_btn').off('click').on('click', this._editTask);
                $container.find('.submit_btn.delete_btn').off('click').on('click', this._deleteTask);

                // Edit/Delete tab click event
                $container.find('#edit_page').off('click').on('click', () => {
                    $container.find('#edit_page').addClass('active');
                    $container.find('#delete_page').removeClass('active');
                    $container.find('.modal-header .modal-title').text('Edit task');
                    $container.find('#edit_body, .submit_btn.edit_btn').show();
                    $container.find('#delete_body, .submit_btn.delete_btn').hide();

                    $container.find('#edit_name').get(0).focus();
                    $container.find('#edit_result_msg').empty();

                    Helper.bindKeyShortcutEvent($container, '.submit_btn.edit_btn');
                });
                $container.find('#delete_page').off('click').on('click', () => {
                    $container.find('#edit_page').removeClass('active');
                    $container.find('#delete_page').addClass('active');
                    $container.find('.modal-header .modal-title').text('Delete task');
                    $container.find('#edit_body, .submit_btn.edit_btn').hide();
                    $container.find('#delete_body, .submit_btn.delete_btn').show();

                    $container.find('#delete_task_password_confirm').get(0).focus();
                    $container.find('#edit_result_msg').empty();

                    Helper.bindKeyShortcutEvent($container, '.submit_btn.delete_btn');
                });

                $container.find('#edit_date_created').datepicker(DATEPICKER_OPTIONS);
                // Handle submit button according to changed form data
                Helper.checkFormToDisableSubmitBtn($container.find('#edit_body input'), $container.find('.submit_btn.edit_btn'));
                break;

            default:
                break;
        }
    }

    renderCounter($container) {
        if ($container != null && typeof $container != 'undefined' || typeof this.$parentContainer != 'undefined') {
            let startTicking = true;
            if (typeof $container.currentTarget != 'undefined' && $container.currentTarget.id == 'counter_menu_item') {
                startTicking = false;
            }
            if (!($container instanceof jQuery)) {
                $container = this.$parentContainer;
            }
            if (!this.$parentContainer) {
                this.$parentContainer = $container;
            }
            // Load model items for counting
            //items = this.itemList.getTasklist();
            // To make sure that items and $counter are already defined
            if (this.itemList == null) {
                mediator.subscribe('CounterModelLoaded', this.renderCounter, $container);
            }
            else if (typeof this.$counter == 'undefined') {
                mediator.subscribe('CounterViewLoaded', this.renderCounter, $container);
            } else {
                this._renderTaskList();
                this._adjustViewForNoTasks();
                this._checkTickingTask(startTicking);

                $($container).html(this.$counter);
                this.adjustItemsNameLength();
                this.bindCounterEvents();
            }
        }

    }
    _renderTaskList(startIndex) {
        // Render TaskList table
        let itemList = [];
        // Make sure that items are defined
        // if (!items) {
        //     items = this.itemList.getTasklist();
        // }
        this.pagination.totalItems = this.itemList.length;
        let itemsPerPage = this.pagination.itemsPerPage[this.pagination.itemsPerPageIndex];
        if ((this.pagination.currentPage - 1) * itemsPerPage > this.pagination.totalItems) {
            this.pagination.currentPage = 1;
        }
        startIndex = startIndex || (this.pagination.currentPage - 1) * itemsPerPage;
        var endIndex = startIndex + itemsPerPage;
        for (var i = 0; i < this.pagination.totalItems; i++) {
            // Save ticking task by defining activeItemIndex
            if (this.itemList[i].taskStarted) {
                this.activeItemIndex = i;
            }

            if (i >= startIndex && i < endIndex) {
                itemList.push({
                    index: this.pagination.totalItems - i,
                    Id: i,
                    Name: this.itemList[i].name,
                    SpentTime: this.secondsToHms(this.itemList[i].spentTime)
                });
            }
        }
        this.$itemList.empty();
        this.$itemList.html(Mustache.render(this.taskListTemplate, { listItems: itemList }));

        // Render Pagination
        // TODO: adjust pagination for too much items
        var numOfPaginationItems = Math.ceil(this.pagination.totalItems / itemsPerPage);
        if (numOfPaginationItems > 1) {
            var paginationItems = [];
            var active = '';
            for (i = 0; i < numOfPaginationItems; i++) {
                if (i == this.pagination.currentPage - 1) {
                    active = ' active';
                }
                paginationItems.push({ pageNum: i + 1, active: active });
                active = '';
            }
            this.$pagination.empty();
            this.$pagination.html(Mustache.render(this.paginationTpl, { paginationItems: paginationItems }));

            // Select box for items/page
            var options = [];
            var selected = '';
            for (i = 0; i < this.pagination.itemsPerPage.length; i++) {
                if (i == this.pagination.itemsPerPageIndex) {
                    selected = 'selected';
                }
                if (this.pagination.totalItems >= this.pagination.itemsPerPage[i]) {
                    options.push({ index: i, number: this.pagination.itemsPerPage[i], selected: selected });
                }
                selected = '';
            }
            this.$paginationItemsPerPage.empty().show();
            this.$paginationItemsPerPage.html(Mustache.render(this.paginationIPPTpl, { options: options }));
        }
        else {
            this.$paginationItemsPerPage.hide();
        }

        // Set active task list item
        if (this.activeItemIndex != null) {
            this.$activeListItem = this.$itemList.find('li[data-id="' + this.activeItemIndex + '"]');
            this.setActiveTaskListItem();
        }

        this.adjustItemsNameLength();
    }

    _changeTablePage(event) {
        var pageNum = Number(event.target.dataset.page_num);
        this.pagination.currentPage = pageNum;
        var startIndex = (pageNum - 1) * this.pagination.itemsPerPage[this.pagination.itemsPerPageIndex];
        this._renderTaskList(startIndex);
        this.bindCounterEvents();
        this._checkTickingTask();
    }
    _renderModal(event) {
        $.get('view/modal_parts.htm', (templates) => {
            var data = {};
            var $templates = $(templates);
            var $submitBtn = $templates.find('.submit_btn');

            // Define data for modal template0
            // Create new task
            if (event.target.id == 'newTask') {
                var create_body = Mustache.render($templates.filter('#modal_body_create').html(), {
                    taskSpentTime: '00:00:00',
                    taskDateCreated: Helper.getFormatedDate()
                });
                Helper.getModalTemplate(this.$modal, {
                    modal_id: 'create_new_task',
                    title: 'Create new task',
                    modal_body: create_body,
                    submit_btn: $submitBtn.text('Create').parent().html()
                });
            }
            // Edit/Delete task
            else if (event.target.getAttribute('data-id') || event.target.parentElement.getAttribute('data-id')) {
                var itemIndex = Number(event.target.getAttribute('data-id') || event.target.parentElement.getAttribute('data-id'));
                var spentTime = this.secondsToHms(this.itemList[itemIndex].SpentTime);
                var storageTickingItem = localStorage.getObject(WTC_TICKING_COUNTER + '-' + this.userId);
                if (storageTickingItem != null && typeof storageTickingItem.spent_time != 'undefined') {
                    spentTime = storageTickingItem.spent_time;
                }

                var edit_delete_body = Mustache.render($templates.filter('#modal_body_edit_delete').html(), {
                    taskName: this.itemList[itemIndex].Name,
                    taskSpentTime: spentTime,
                    taskDateCreated: Helper.getFormatedDate(this.itemList[itemIndex].DateCreated)
                });

                Helper.getModalTemplate(this.$modal, {
                    modal_id: 'edit_task',
                    title: 'Edit task',
                    modal_body: edit_delete_body,
                    submit_btn: $submitBtn.addClass('edit_btn').attr('data-id', itemIndex).prop('disabled', true)
                                            .text('Edit').parent().html()
                                + $submitBtn.removeClass('edit_btn').addClass('delete_btn').attr('data-id', itemIndex).prop('disabled', false)
                                            .hide().text('Delete').parent().html()
                });
            }
        });
    }
    renderMenuItem($container) {
        // To make sure that this.$menuItem is already defined
        if (typeof this.$menuItem == 'undefined') {
            mediator.subscribe('CounterViewLoaded', this.renderMenuItem, $container);
        } else {
            $container.append(this.$menuItem);
        }
    }
    renderPermanentSideMenuItems($container) {
        // To make sure that this.$menuItem is already defined
        if (typeof this.$newItemBtn == 'undefined') {
            mediator.subscribe('CounterViewLoaded', this.renderPermanentSideMenuItems, $container);
        } else {
            // Render items into SideMenu
            //$container.append(this.$newItemBtn);	// Render Create Button
        }
    }
    getTickingSideMenuItem(itemIndex) {
        var spentTimeHms = this.secondsToHms(this.itemList[itemIndex].SpentTime);
        var storageTickingItem = this._getStorageTickingItem();
        if (storageTickingItem != null && storageTickingItem.spent_time) {
            spentTimeHms = storageTickingItem.spent_time;
        }

        //this.$sideMenuItem.find('.task_index').text(this.itemList.length - itemIndex + '.');
        this.$sideMenuItem.find('.name').text(this.itemList.length - itemIndex + '. ' + this.itemList[itemIndex].Name);
        this.$sideMenuItem.find('.spent_time').text(spentTimeHms);
        this.$sideMenuItem.attr('data-id', itemIndex);

        return this.$sideMenuItem;
    }

    secondsToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
        return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    }
    hmsToSeconds(s) {
        var hms_time = s.split(":");
        return Number(hms_time[2]) + Number(hms_time[1]) * 60 + Number(hms_time[0]) * 60 * 60;
    }
    myTimer(noAdd) {
        var storageTickingItem = localStorage.getObject(WTC_TICKING_COUNTER + '-' + this.userId);
        var counter_time = storageTickingItem.spent_time;

        if (noAdd !== true) {
            counter_time = this.hmsToSeconds(counter_time) + 1;
            counter_time = this.secondsToHms(counter_time);
        }
        storageTickingItem.spent_time = counter_time;

        localStorage.setObject(WTC_TICKING_COUNTER + '-' + this.userId, storageTickingItem);

        // Render ticking time
        this.$activeListItem.find('.spent_time').text(counter_time);
        this.$sideMenuItem.find('.spent_time').text(counter_time);
    }
    startMyTimer(task, storageSpentTime) {
        var storageTickingItem = {
            task_id: task.id,
            spent_time: storageSpentTime || this.secondsToHms(task.spentTime || 0)
        };
        localStorage.setObject(WTC_TICKING_COUNTER + '-' + this.userId, storageTickingItem);

        window.myTime = setInterval(() => {
            this.myTimer();
        }, 1000);
        this.myTimer();
    }
    deleteLocalStorage() {
        localStorage.getItem(WTC_TICKING_COUNTER + '-' + this.userId) != null && localStorage.removeItem(WTC_TICKING_COUNTER + '-' + this.userId);
    }
    _getStorageTickingItem() {
        if (this.userId == null) {
            // TODO: This isn't working => dataProvider should serve this data
            //this.userId = app.getLoggedUserId();
            //this.userId = mediator.publish('GetLoggedUserId')
            this.userId = dataProvider.getValue('LoggedUserId');
        }

        return localStorage.getObject(WTC_TICKING_COUNTER + '-' + this.userId);
    }
    // Checks ticking objects $activeListItem, storageTickingItem to render ticking spent_time or startMyTimer
    _checkTickingTask(startTicking) {
        var storageTickingItem = this._getStorageTickingItem();
        // Storage Ticking Item is ok
        if (storageTickingItem != null
            && storageTickingItem.spent_time
            && storageTickingItem.task_id
            && this.activeItemIndex != null && this.itemList[this.activeItemIndex].Id == storageTickingItem.task_id) {
            if (startTicking) {
                this.startMyTimer(this.itemList[this.activeItemIndex], storageTickingItem.spent_time);
                mediator.publish('AddItemToSideMenu', this.getTickingSideMenuItem(this.activeItemIndex));
            }
            else {  // Just render ticking time
                this.myTimer(true);
            }
        }
        else if (startTicking && this.activeItemIndex != null) {    // Storage Ticking Item is missing
            this.startMyTimer(this.itemList[this.activeItemIndex]);
            mediator.publish('AddItemToSideMenu', this.getTickingSideMenuItem(this.activeItemIndex));
        }
    }
    setActiveTaskListItem() {
        this.$itemList.find('li button.start').prop('disabled', true);
        this.$activeListItem.addClass('active');
        this.$activeListItem.find('button.start').hide();
        //this.$activeListItem.find('button.stop').show();
        this.$activeListItem.find('button.stop').css({'display': 'block', 'margin-top': '-28px'});
    }
    unsetActiveTaskListItem() {
        this.$itemList.find('li button.start').prop('disabled', false);
        this.$activeListItem.removeClass('active');
        this.$activeListItem.find('button.start').show();
        this.$activeListItem.find('button.stop').hide();
        //this.$activeListItem.find('button.stop').css({'display': 'block', 'margin-top': '-28px'});
        this.$activeListItem = null;
    }
    _startTicking(event) {
        var itemIndex = Number(event.target.parentElement.dataset.id);
        var data = {
            task_id: this.itemList[itemIndex].Id,
            last_start: Math.round(new Date().getTime() / 1000) // We store time in seconds
        };
        dataProvider.provide("startTask", data).done((response) => {
            if (response == 'logOut') {    // User isn`t logged in
                mediator.publish('LogOut', 'You were unexpectedly logged out.');
            }
            else if (response.someTaskAlreadyStarted) {
                this.$resultMsg.html("You are already working on <strong>" + response.Name + "</strong>");
            }
            else if (response == 2) {
                this.$resultMsg.text('Parameters to start the task are missing.');
            }
            else if (response.Id) {
                // Update model
                this.itemList[itemIndex].TaskStarted = 1;
                this.itemList[itemIndex].LastStart = data.last_start;

                // TODO: This isn't working => dataProvider should serve this data
                //this.userId = app.getLoggedUserId();
                //this.userId = mediator.publish('GetLoggedUserId');
                this.userId = dataProvider.getValue('LoggedUserId');
                this.$activeListItem = this.$itemList.find('li[data-id="' + itemIndex + '"]');
                this.startMyTimer(response);

                this.$sideMenuItem.find('.stop').on('click', this._stopTicking);
                this.setActiveTaskListItem();
                mediator.publish('AddItemToSideMenu', this.getTickingSideMenuItem(itemIndex, this.itemList));
                this.$resultMsg.text('Started successfully!');
            }
            else {
                this.$resultMsg.text('Failed to start this task.');
            }
        });
        event.stopPropagation();
    }
    _stopTicking(event) {
        var data = this._getStorageTickingItem();
        var itemIndex = Number(event.target.parentElement.dataset.id);
        if (data == null || typeof data.task_id == 'undefined' || typeof data.spent_time == 'undefined') {
            data = {
                task_id: this.itemList[itemIndex].Id
            }
        }
        dataProvider.provide("stopTask", data).done((response) => {
            if (response == 'logOut') {    // User isn`t logged in
                mediator.publish('LogOut', 'You were unexpectedly logged out.');
            }
            else if (response == 'noTaskStarted') {
                this.$resultMsg.text("You have to start some task first.");
            }
            else if (response == 2) {
                this.$resultMsg.text("Parameters to stop the task are missing.");
            }
            else if(response.otherTaskStarted) {
                this.$resultMsg.html("You are already working on <strong>" + response.Name + "</strong>");
            }
            else if (response) {
                // Update model
                this.itemList[itemIndex].SpentTime = response.SpentTime || 0;
                this.itemList[itemIndex].TaskStarted = 0;

                clearInterval(window.myTime);   // Stop ticking
                this.deleteLocalStorage();   // Clear localStorage
                this.userId = null;          // Reset user id
                this.unsetActiveTaskListItem();
                mediator.publish('RemoveItemFromSideMenu', this.$sideMenuItem.attr('id'));
                this.activeItemIndex = null;
                this.$resultMsg.html("<strong>" + this.itemList[itemIndex].Name + "</strong> stopped successfully!");
            }
            else this.$resultMsg.text('Stopping failed!');
        });
        event.stopPropagation();
    }

    _createTask() {
        var $createResultMsg = this.$modal.find('#create_result_msg');
        var data = {
            new_name:         this.$modal.find('#new_task_name').val().trim(),
            new_spent_time:   this.$modal.find('#new_task_spent_time').val().trim(),
            new_date_created: this.$modal.find('#new_task_date_created').val().trim()
        };

        dataProvider.provide("createTask", data).done((response) => {
            if (response.Name == data.new_name) {
                // Update model
                this.itemList.unshift(response);    // Adds created Task to the beginning of this.itemList array
                this.pagination.totalItems = this.itemList.length;

                this._renderTaskList();
                this.bindCounterEvents();
                this._checkTickingTask();
                //$newTaskName.val('');
                this.$resultMsg.text("New task was successfully created!");
                this.$modal.modal('hide');
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
                this.$resultMsg.text("New task name failed to create!");
                this.$modal.modal('hide');
            }
        });
    }
    _editTask(event) {
        var $editResultMsg = this.$modal.find('#edit_result_msg');
        var itemIndex = Number(event.target.dataset.id);
        var data = {
            item_id:          this.itemList[itemIndex].Id,
            new_name:         this.$modal.find('#edit_name').val().trim(),
            new_spent_time:   this.$modal.find('#edit_spent_time').val().trim(),
            new_date_created: this.$modal.find('#edit_date_created').val().trim()
        };
        dataProvider.provide('editTask', data).done((response) => {
            if (response.Name == data.new_name) {
                // Update model
                this.itemList[itemIndex].Name        = response.Name;
                this.itemList[itemIndex].SpentTime   = response.SpentTime;
                this.itemList[itemIndex].DateCreated = response.DateCreated;

                this._renderTaskList();
                this.bindCounterEvents();
                this._checkTickingTask();
                this.$resultMsg.text("Task was successfully edited!");
                this.$modal.modal('hide');

                this.animateEditedItem(Number(event.target.dataset.id));
            }
            else if (response == 2) {
                $editResultMsg.text("Please input some creative Name.");
            }
            else if (response == 3) {
                mediator.publish('LogOut', 'You were unexpectedly logged out.');
            }
            else if (response == 4) {
                $editResultMsg.text("This Name already exists, try something different.");
            }
            else if (response == 5) {
                $editResultMsg.text("Please insert Spent Time in a valid time and format (hh:mm:ss).");
            }
            else if (response == 6) {
                $editResultMsg.text("Please insert Date Created as a valid date and format (dd.mm.yyyy).");
            }
            else {
                this.$resultMsg.text("Edit task name failed!");
                this.$modal.modal('hide');
            }
        });
    }
    _deleteTask(event) {
        var task_index = Number(event.target.dataset.id);
        var $deleteResultMsg = this.$modal.find('#edit_result_msg');
        var data = {
            task_id: this.itemList[task_index].Id,
            password: this.$modal.find('#delete_task_password_confirm').val().trim()
        };
        dataProvider.provide('deleteTask', data).done((response) => {
            if (response == false) {
                // Update model
                this.itemList.splice(task_index, 1);
                this.pagination.totalItems = this.itemList.length;
                this.$resultMsg.text("Task was deleted successfully.");

                this._renderTaskList();
                this._adjustViewForNoTasks();
                this.bindCounterEvents();
                this._checkTickingTask();
                this.$modal.modal('hide');
            }
            else if(response == 2) {
                $deleteResultMsg.text("Some information is missing.");
            }
            else if(response == 3) {
                this.$resultMsg.text("Record of current task is missing in database.");
                this.$modal.modal('hide');
            }
            else if(response == 4) {
                $deleteResultMsg.text("You entered wrong password.");
            }
            else if(response == 5) {
                this.$resultMsg.text("You have to stop current task, to delete it.");
                this.$modal.modal('hide');
            }
        });
    }

    clearViewDataModel() {
        clearInterval(window.myTime);   // Stop ticking
        this.userId = null;
        this.itemList = null;
        this.$activeListItem = null;
        this.pagination.totalItems = null;
        this.pagination.currentPage = 1;

        this.$itemList.empty();
        this.$pagination.empty();
        this.$resultMsg.empty();

        //mediator.publish('ClearDataModel');
    }
    _adjustViewForNoTasks() {
        if (this.itemList.length == 0) {
            this.$itemList.empty();
            this.$resultMsg.text("Please create task, by clicking on the Create button.");
        }
    }
    animateEditedItem(item_id) {
        if (typeof item_id != 'undefined') {
            this.$itemList.find('li[data-id="' + item_id + '"] span.edit_animation_box')
                .css('opacity', '1')
                .animate({opacity: '0'}, 3000);
        }
    }
    setResultMsg(text) {
        this.$resultMsg.text(text);
    }
    _changeNumOfItemsPerPage(event) {
        this.pagination.itemsPerPageIndex = Number($(event.target).val());

        this._renderTaskList();
        this.bindCounterEvents();
        this._checkTickingTask();
    }
    // Edit view according to SideMenu position
    adjustItemsListForActiveSideMenu() {
        // To make sure that $itemList is already defined
        if (typeof this.$itemList == 'undefined') {
            mediator.subscribe('CounterViewLoaded', this.adjustItemsListForActiveSideMenu);
        } else {
            this.$itemList.parent()
                .removeClass('col-md-8 col-md-offset-2')
                .addClass('col-md-10 col-md-offset-1');

            this.adjustItemsNameLength();
        }
    }
    adjustItemsNameLength() {
        var itemNames = this.$itemList.find('span.name');
        var maxHeight = this.$itemList.find('span.task_index').height();
        if (itemNames.length != 0 && typeof maxHeight != 'undefined' && maxHeight > 0) {
            for (var i = 0; i < itemNames.length; i++) {
                var $itemName = $(itemNames[i]);
                while ($itemName.height() > maxHeight + 5) {	// + 5 for variability
                    var name = $itemName.text();
                    var lastIndexOfSpace = name.lastIndexOf(" ");
                    $itemName.text(name.substring(0, lastIndexOfSpace) + '...');
                }
            }
        }
    }

}