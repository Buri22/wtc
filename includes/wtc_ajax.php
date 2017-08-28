<?php
/*
 * Name: - Work Time Counter -
 * Author: Buri22
 * Date: 2017/8/10 19:08
 * Version: 1.0.0
 */
require_once 'Db_connect.php';
require_once 'functions.php';

$ajax_actions = array(
    "GET_TASK_LIST"      => "getTaskList",
    "GET_TASK_BY_ID"     => "getTaskById",
    "START_TASK"         => "startTask",
    "STOP_TASK"          => "stopTask",
    "CREATE_TASK"        => "createTask",
    "EDIT_TASK"          => "editTask",
    "DELETE_TASK"        => "deleteTask",
    "LOGIN"              => "login",
    "CHECK_LOGIN"        => "checkLogin",
    "LOGOUT"             => "logout",
    "REGISTER"           => "register"
);

$headers = getallheaders();
$action = $headers["Ajax-Action"];

if (is_ajax($headers) && $action != null) {
    switch ($action) {
        // Check Login
        case ($ajax_actions["CHECK_LOGIN"]):
            echo json_encode(checkLogin());
            break;

        // Register
        case ($ajax_actions["REGISTER"]):
            // Check if all inputs were entered
            if (!isset($_POST['user_name']) || empty($_POST['user_name'])
                || !isset($_POST['email']) || empty($_POST['email'])
                || !isset($_POST['password']) || empty($_POST['password'])
                || !isset($_POST['password_confirm']) || empty($_POST['password_confirm'])) {
                echo json_encode(2);
                break;
            }
            // Email validation
            if (!isValidEmail(trim($_POST['email']))) {
                echo json_encode(3);
                break;
            }
            // Password == Password_confirm
            if (trim($_POST['password']) != trim($_POST['password_confirm'])) {
                echo json_encode(4);
                break;
            }
            // Check if user is already registered
            $registered = Db::queryOne('
                          SELECT *
                          FROM user
                          WHERE Email = ?
                    ', $_POST['email']);

            if ($registered) {
                echo json_encode(5);
                break;
            }

            $password = password_hash(trim($_POST['password']), PASSWORD_BCRYPT);
            $new_user = Db::query('
                                INSERT INTO user (UserName, Password, Email)
                                VALUES (?, ?, ?)
                            ', trim($_POST['user_name']), $password, trim($_POST['email']));

            echo json_encode($new_user);
            break;

        // Login
        case ($ajax_actions["LOGIN"]):
            sec_session_start();    // Our custom secure way of starting a PHP session.

            // Check if all inputs were entered
            if (!isset($_POST['email']) || empty($_POST['email'])
                || !isset($_POST['password']) || empty($_POST['password'])) {
                echo json_encode(2);
                break;
            }
            // Email validation
            if (!isValidEmail(trim($_POST['email']))) {
                echo json_encode(3);
                break;
            }
            // Try to find user
            $user =  Db::queryOne('
                          SELECT *
                          FROM user
                          WHERE Email = ?
                    ', trim($_POST['email']));

            if (!$user) {    // User has no record in DB
                echo json_encode(4);
                break;
            }
            else if (check_brute($user)){
                echo json_encode(5);
                break;
            }
            else if (!password_verify($_POST['password'], $user['Password'])) {   // Check passwords
                echo json_encode(6);
                break;
            }

            $_SESSION['user_id'] = $user['Id'];
            $_SESSION['login_string'] = hash('sha512', $user['Password'] . $_SERVER['HTTP_USER_AGENT']);

            echo json_encode(getUserForJS($user));
            break;

        // Logout
        case ($ajax_actions['LOGOUT']):
            echo json_encode(logout());
            break;

        // Get Task by Id
        case $ajax_actions["GET_TASK_BY_ID"]:
            if (isset($_POST['task_id']) && !empty($_POST['task_id'])) {
                $result = Db::queryOne('
                                SELECT *
                                FROM task
                                WHERE Id = ?
                            ', intval($_POST['task_id']));

                echo json_encode($result);
            }
            break;

        // Get list of tasks
        case ($ajax_actions["GET_TASK_LIST"]):
            $user = checkLogin();
            if ($user) {
                $result = Db::queryAll('
                            SELECT Id, Name
                            FROM task
                            WHERE UserId = ?
                            ORDER BY Id DESC
                        ', $user['Id']);

                echo json_encode($result);
            }
            else echo json_encode($user);
            break;

        // Create task
        case ($ajax_actions["CREATE_TASK"]):
            if (!isset($_POST['new_task_name']) || empty($_POST['new_task_name'])) {
                echo json_encode(2);
                break;
            }
            $user = checkLogin();
            if (!$user) {
                echo json_encode(3);
                break;
            }
            // Check if task name already exists
            $result = Db::query('
                            SELECT *
                            FROM task
                            WHERE UserId = ? AND Name = ?
                        ', $user['Id'], $_POST['new_task_name']);
            if ($result) {
                echo json_encode(4);
                break;
            }

            $newTask = Db::query('
                        INSERT INTO task (Name, DateCreated, UserId)
                        VALUES (?, ?, ?)
                    ', $_POST['new_task_name'], date("Y-m-d H:i:s"), $user['Id']);
            echo json_encode($newTask);
            break;

        // Edit task
        case ($ajax_actions["EDIT_TASK"]):
            // Check if all inputs were entered
            if (!isset($_POST['new_task_name']) || empty($_POST['new_task_name'])
                || !isset($_POST['task_id']) || empty($_POST['task_id'])) {
                echo json_encode(2);
                break;
            }
            $user = checkLogin();
            if (!$user) {
                echo json_encode(3);
                break;
            }
            // Check if task name already exists
            $result = Db::queryOne('
                            SELECT *
                            FROM task
                            WHERE Name = ? AND UserId = ?
                        ', $_POST['new_task_name'], $user['Id']);
            if ($result && $result['Name'] === $_POST['new_task_name']) {
                echo json_encode(4);
                break;
            }

            // This task name does not exist or is not exactly the same as edited
            if (!$result || $result['Name'] !== $_POST['new_task_name']) {
                $editedTask = Db::query('
                                    UPDATE task
                                    SET Name = ?
                                    WHERE Id = ?
                                ', $_POST['new_task_name'], $_POST['task_id']);
                echo json_encode($editedTask);
            }
            break;

        // Delete task
        case ($ajax_actions["DELETE_TASK"]):
            // Check if all inputs were entered
            if (!isset($_POST['password']) || empty($_POST['password'])
                || !isset($_POST['task_id']) || empty($_POST['task_id'])) {
                echo json_encode(2);
                break;
            }
            // Try to find the task
            $password = Db::queryOne('
                            SELECT Password
                            FROM user
                            LEFT JOIN task ON task.UserId = user.Id
                            WHERE task.Id = ?
                        ', $_POST['task_id']);
            if (!$password) {
                echo json_encode(3);
                break;
            }
            else if(!password_verify($_POST['password'], $password['Password'])) {
                echo json_encode(4);
                break;
            }

            $result = Db::queryOne('
                            DELETE FROM task
                            WHERE Id = ?
                          ', $_POST['task_id']);
            echo json_encode($result);
            break;

        // Start counting and return started task values
        case ($ajax_actions["START_TASK"]):
            $task_started = checkTaskStarted();

            if ($task_started == 'logOut') {
                echo json_encode($task_started);
                break;
            }
            else if ($task_started) {
                $task_started['someTaskAlreadyStarted'] = true;
                echo json_encode($task_started);    // We`re sending task that already started
                break;
            }

            if (!isset($_POST['task_id']) || empty($_POST['task_id'])
                || !isset($_POST['last_start']) || empty($_POST['last_start'])) {
                echo json_encode(2);
                break;
            }

            $result = Db::query('
                         UPDATE task
                         SET LastStart = ?, TaskStarted = true
                         WHERE Id = ?
                     ', intval($_POST["last_start"]), intval($_POST['task_id']));

            if ($result) {
                $work = Db::queryOne('
                            SELECT Id, SpentTime
                            FROM task
                            WHERE Id = ?
                        ', intval($_POST['task_id']));

                echo json_encode($work);
            }
            else echo json_encode($result);
            break;

        // Stop counting
        case ($ajax_actions["STOP_TASK"]):
            $task_started = checkTaskStarted();

            if ($task_started == 'logOut') {
                echo json_encode($task_started);
                break;
            }
            else if (!$task_started) {
                echo json_encode('noTaskStarted');
                break;
            }

            if (!isset($_POST['task_id']) || empty($_POST['task_id'])) {
                echo json_encode(2);
                break;
            }

            if ($_POST['task_id'] != $task_started['Id']) { // Other task started
                $task_started['otherTaskStarted'] = true;
                echo json_encode($task_started);
                break;
            }

            $spent_time = time() - $task_started['LastStart'] + $task_started['SpentTime'];
            $result = Db::query('
                        UPDATE task
                        SET SpentTime = ?, TaskStarted = false
                        WHERE Id = ?
                      ', $spent_time, intval($_POST['task_id']));

            echo json_encode($result);
            break;

        default:
            echo json_encode("Unknown action used.");
    }
} else {
    echo json_encode($headers);
}

// Check if the request is an AJAX request
function is_ajax($headers) {
    return isset($headers['X-Requested-With']) && strtolower($headers['X-Requested-With']) == 'xmlhttprequest';
}

// Validate email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL)
            && preg_match('/[0-9A-z]+@[A-z]+\.[A-z]+/', $email);
}