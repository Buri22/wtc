/**
 * Created by Uživatel on 19.8.2017.
 */

var ActionProvider = {
//================ Account Actions ================//
//    register: function() {
//        // TODO: Show password strength
//        var data = {
//            user_name: $('#userName').val(),
//            email: $('#email').val(),
//            password: $('#password').val(),
//            password_confirm: $('#passwordConfirm').val()
//        };
//
//        Helper.ajaxCall('register', 'POST', data, function (response) {
//            if (response == 1) {  // new user was created successfully
//                ActionProvider.renderLogin('You were successfully registered, please login with your credentials.');
//            }
//            else if (response == 2) {
//                Helper.setTextById("register_msg", "Please, enter all information.");
//            }
//            else if (response == 3) {
//                Helper.setTextById("register_msg", "Email format is not valid.");
//            }
//            else if (response == 4) {
//                Helper.setTextById("register_msg", "Passwords don`t match, please, enter them again.");
//            }
//            else if (response == 5) {
//                Helper.setTextById("register_msg", "You are already registered. Please login with this email.");
//            }
//            else {
//                Helper.setTextById("register_msg", "New user failed to create!");
//            }
//        });
//
//    },
//    login: function() {
//        var data = {
//            email: $('#email').val(),
//            password: $('#password').val()
//        };
//
//        Helper.ajaxCall('login', 'POST', data, function (response) {
//            if (response.Id && response.UserName) {
//                ActionProvider.renderLayout(response);
//            }
//            else if (response == 2) {
//                Helper.setTextById("login_msg", "Please, enter all information.");
//            }
//            else if (response == 3) {
//                Helper.setTextById("login_msg", "Email format is not valid.");
//            }
//            else if (response == 4) {
//                Helper.setTextById("login_msg", "You are not registered yet.");
//            }
//            else if (response == 5) {
//                Helper.setTextById("login_msg", "Your account is blocked.");
//            }
//            else if (response == 6) {
//                Helper.setTextById("login_msg", "Wrong password, please try it again");
//            }
//            else {
//                Helper.setTextById('login_msg', 'Login failed, please try again later.');
//            }
//        });
//    },
    logOut: function() {
        Helper.ajaxCall('logout', 'POST', undefined, function(response) {
            if (response) {
                ActionProvider.renderLogin('You have been successfully logged out.');
            }
        });
    },

//============ Render Views and Modals ============//
    renderLogin: function(msg) {
        $('#content').load('view/login.html', function() {
            Helper.bindEnterSubmitEvent(this, '#login');
            Helper.setTextById('login_msg', msg || "");

            //$('#register_page').click(function() {
            //    $(this).parent().animate({right: '200px', opacity: '0' }, 'slow');
            //});

        });
    },
    renderModal: function(view, $modal, innerData) {
        $.get('view/modal_parts.htm', function(templates) {
            //if (view == 'newTask') {
            //    ActionProvider.getModalTemplate($modal, {
            //        modal_id: 'create_new_task',
            //        title: 'Create new task',
            //        modal_body: $(templates).filter('#modal_body_create').html(),
            //        submit_btn: {
            //            action: 'ActionProvider.createTask()',
            //            text: 'Save'
            //        }
            //    });
            //}
            //else if (view == 'editTask') {
            //    var edit_body = Mustache.render($(templates).filter('#modal_body_edit').html(), innerData);
            //    ActionProvider.getModalTemplate($modal, {
            //        modal_id: 'edit_task',
            //        title: 'Edit task name',
            //        modal_body: edit_body,
            //        submit_btn: {
            //            action: 'ActionProvider.editTask()',
            //            text: 'Save'
            //        }
            //    });
            //}
            //else if (view == 'deleteTask') {
            //    var delete_body = Mustache.render($(templates).filter('#modal_body_delete').html(), innerData);
            //    ActionProvider.getModalTemplate($modal, {
            //        modal_id: 'delete_task',
            //        title: 'Delete current task',
            //        modal_body: delete_body,
            //        submit_btn: {
            //            action: 'ActionProvider.deleteTask()',
            //            text: 'Delete'
            //        }
            //    });
            //}
            //else
            if (view == 'account') {
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
    },
    getModalTemplate: function($modal, data, action) {
        $.get('view/modal.htm', function(template) {
            $modal.append(Mustache.render($(template).html(), data))
                    .modal('show');

            // Bind dynamic action from module
            if (action) {
                // To ensure that element hasn't bind event twice -> off()
                $modal.find('#submit')
                    .off('click')
                    .on('click', action);
            }
        });
    }

};