/**
 * Created by Uživatel on 11.9.2017.
 */
var Counter = function() {
    var tasks = [];

    // Cache DOM
    var $page           = $('#page');
    var $taskList       = $page.find('#taskList');
    var $modal          = $page.find('#task_action_modal');
    //var $taskActionBtns = $page.find('#task_action_buttons');
    var $newTaskBtn     = $page.find('#newTask');
    var $editTaskBtn    = $page.find('#editTask');
    var $deleteTaskBtn  = $page.find('#deleteTask');
    var $startBtn       = $page.find('#buttonStart');
    var $stopBtn        = $page.find('#buttonStop');
    var $timeCounter    = $page.find('#timeCounter');
    var $resultMsg      = $page.find('#result_msg');

    // Bind Events
    $newTaskBtn.on('click', createTask);

    function renderModal(view) {
        $.get('view/modal_parts.htm', function(templates) {
            if (view == 'create') {
                ActionProvider.getModalTemplate({
                    modal_id: 'create_new_task',
                    title: 'Create new task',
                    modal_body: $(templates).filter('#modal_body_create').html(),
                    submit_btn: {
                        action: 'ActionProvider.createTask()',
                        text: 'Save'
                    }
                });
            }
            else if (view == 'edit') {
                var edit_body = Mustache.render(
                    $(templates).filter('#modal_body_edit').html(),
                    { taskName: $('#taskList option:selected').text() }
                );
                ActionProvider.getModalTemplate({
                    modal_id: 'edit_task',
                    title: 'Edit task name',
                    modal_body: edit_body,
                    submit_btn: {
                        action: 'ActionProvider.editTask()',
                        text: 'Save'
                    }
                });
            }
            else if (view == 'delete') {
                var delete_body = Mustache.render(
                    $(templates).filter('#modal_body_delete').html(),
                    { taskName: $('#taskList option:selected').text() }
                );
                ActionProvider.getModalTemplate({
                    modal_id: 'delete_task',
                    title: 'Delete current task',
                    modal_body: delete_body,
                    submit_btn: {
                        action: 'ActionProvider.deleteTask()',
                        text: 'Delete'
                    }
                });
            }
            else if (view == 'account') {
                Helper.ajaxCall("checkLogin", "POST", undefined, function(user) {
                    var account_body = Mustache.render(
                        $(templates).filter('#modal_body_account').html(),
                        { userName: user.UserName, email: user.Email }
                    );
                    ActionProvider.getModalTemplate({
                        modal_id: 'user_account',
                        title: 'Account settings',
                        modal_body: account_body,
                        submit_btn: {
                            action: 'ActionProvider.saveAccount()',
                            text: 'Save'
                        }
                    });
                });
            }
        });
    }

    function createTask(name) {
        this.renderModal();
        Helper.ajaxCall("createTask", "POST", "new_task_name=" + Helper.getValueById("new_task_name"), function(response) {
            if (response == 1) {
                ActionProvider.getTaskList();
                Helper.setValueById("new_task_name", "");
                Helper.setTextById("result_msg", "New task name was successfully created!");
                $('#task_action_modal').modal('hide');
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
                $('#task_action_modal').modal('hide');
            }
        });
    }

    return {
        createTask: createTask
    };
};