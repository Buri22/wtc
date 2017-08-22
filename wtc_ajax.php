<?php
/*
 * Name: - Work Time Counter -
 * Author: Buri22
 * Date: 2017/8/10 19:08
 * Version: 1.0.0
 */

require_once 'Db.php';
require_once 'Db_config.php';

Db::connect($host, $database, $userName, $password);

$ajax_actions = array(
    "GET_TASK_LIST"      => "getTaskList",
    "GET_TASK_BY_ID"     => "getTaskById",
    "CHECK_TASK_STARTED" => "checkTaskStarted",
    "START_TASK"         => "startTask",
    "STOP_TASK"          => "stopTask",
    "CREATE_TASK"        => "createTask",
    "EDIT_TASK"          => "editTask",
    "DELETE_TASK"        => "deleteTask",
    "LOGIN"              => "login",
    "REGISTER"           => "register"
);

$headers = getallheaders();
$action = $headers["Ajax-Action"];
$error_code = 0;

if (is_ajax($headers) && $action != null) {
    switch ($action) {
        // Get Work by Id
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
            $result = Db::queryAll('
                            SELECT Id, Name
                            FROM task
                            WHERE UserId = ?
                            ORDER BY Id DESC
                        ', $_POST['user_id']);

            echo json_encode($result);
            break;

        // Create task
        case ($ajax_actions["CREATE_TASK"]):
            if (!isset($_POST['user_id']) || empty($_POST['user_id'])
                || !isset($_POST['new_task_name']) || empty($_POST['new_task_name'])) {
                echo json_encode($error_code = 2);
                break;
            }
            // Check if task name exists
            $result = Db::query('
                            SELECT *
                            FROM task
                            WHERE UserId = ? AND Name = ?
                        ', $_POST['user_id'], $_POST['new_task_name']);
            if ($result) {
                echo json_encode($error_code = 3);
                break;
            }

            if ($error_code === 0) {
                $newTask = Db::query('
                            INSERT INTO task (Name, DateCreated, UserId)
                            VALUES (?, ?, ?)
                        ', $_POST['new_task_name'], date("Y-m-d H:i:s"), $_POST['user_id']);

                echo json_encode($newTask);
            }
            break;

        // Edit task
        case ($ajax_actions["EDIT_TASK"]):
            // Check if all inputs were entered
            if (!isset($_POST['new_task_name']) || empty($_POST['new_task_name'])
                || !isset($_POST['task_id']) || empty($_POST['task_id'])
                || !isset($_POST['user_id']) || empty($_POST['user_id'])) {
                echo json_encode($error_code = 2);
                break;
            }

            // Check if task name already exists
            $result = Db::queryOne('
                            SELECT *
                            FROM task
                            WHERE Name = ? AND UserId = ?
                        ', $_POST['new_task_name'], $_POST['user_id']);
            if ($result && $result['Name'] === $_POST['new_task_name']) {
                echo json_encode($error_code = 3);
                break;
            }

            if ((!$result || $result['Name'] !== $_POST['new_task_name']) && $error_code === 0) {
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
                && !isset($_POST['task_id']) || empty($_POST['task_id'])) {
                echo json_encode($error_code = 2);
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
                echo json_encode($error_code = 3);
                break;
            }
            else if(!password_verify($_POST['password'], $password['Password'])) {
                echo json_encode($error_code = 4);
                break;
            }

            if ($error_code === 0) {
                $result = Db::queryOne('
                                DELETE FROM task
                                WHERE Id = ?
                              ', $_POST['task_id']);
                echo json_encode($result);
            }
            break;

        // Check if some task started
        case ($ajax_actions["CHECK_TASK_STARTED"]):
            if (!isset($_POST['user_id']) || empty($_POST['user_id'])) {
                echo json_encode($error_code = 2);
                break;
            }
            else {
                $result = Db::queryOne('
                          SELECT *
                          FROM task
                          WHERE TaskStarted = 1 AND UserId = ?
                    ', $_POST['user_id']);

                echo json_encode($result);
            }
            break;

        // Start counting and return started task values
        case ($ajax_actions["START_TASK"]):
            if (isset($_POST['task_id']) && !empty($_POST['task_id'])
                && isset($_POST['last_start']) && !empty($_POST['last_start'])) {
                $result = Db::query('
                         UPDATE task
                         SET LastStart = ?, TaskStarted = true
                         WHERE Id = ?
                     ', intval($_POST["last_start"]), intval($_POST['task_id']));

                if ($result) {
                    $work = Db::queryOne('
                                SELECT *
                                FROM task
                                WHERE Id = ?
                            ', intval($_POST['task_id']));

                    echo json_encode($work);
                }
                else echo false;
            }
            break;

        // Stop counting
        case ($ajax_actions["STOP_TASK"]):
            if (isset($_POST['task_id']) && !empty($_POST['task_id'])
                && isset($_POST['spent_time']) && !empty($_POST['spent_time'])) {
                $result = Db::query('
                            UPDATE task
                            SET SpentTime = ?, TaskStarted = false
                            WHERE Id = ?
                        ', intval($_POST["spent_time"]), intval($_POST['task_id']));

                echo json_encode($result);
            }
            break;

        // Register
        case ($ajax_actions["REGISTER"]):
            // Check if all inputs were entered
            if (!isset($_POST['user_name']) || empty($_POST['user_name'])
                || !isset($_POST['email']) || empty($_POST['email'])
                || !isset($_POST['password']) || empty($_POST['password'])
                || !isset($_POST['password_confirm']) || empty($_POST['password_confirm'])) {
                echo json_encode($error_code = 2);
                break;
            }
            // Email validation
            if (!isValidEmail(trim($_POST['email']))) {
                echo json_encode($error_code = 3);
                break;
            }
            // Password == Password_confirm
            if (trim($_POST['password']) != trim($_POST['password_confirm'])) {
                echo json_encode($error_code = 4);
                break;
            }
            // Check if user is already registered
            $registered = Db::queryOne('
                          SELECT *
                          FROM user
                          WHERE Email = ?
                    ', $_POST['email']);

            if ($registered) {
                echo json_encode($error_code = 5);
                break;
            }

            if ($error_code === 0) {
                $password = password_hash(trim($_POST['password']), PASSWORD_BCRYPT);
                $new_user = Db::query('
                                    INSERT INTO user (UserName, Password, Email)
                                    VALUES (?, ?, ?)
                                ', trim($_POST['user_name']), $password, trim($_POST['email']));

                echo json_encode($new_user);
            }
            break;

        // Login
        case ($ajax_actions["LOGIN"]):
            // Check if all inputs were entered
            if (!isset($_POST['email']) || empty($_POST['email'])
                || !isset($_POST['password']) || empty($_POST['password'])) {
                echo json_encode($error_code = 2);
                break;
            }
            // Email validation
            if (!isValidEmail(trim($_POST['email']))) {
                echo json_encode($error_code = 3);
                break;
            }
            // Try to find user
            $user =  Db::queryOne('
                          SELECT *
                          FROM user
                          WHERE Email = ?
                    ', trim($_POST['email']));

            if (!$user) {    // User has no record in DB
                echo json_encode($error_code = 4);
                break;
            }
            else if (!password_verify($_POST['password'], $user['Password'])) {   // Check passwords
                echo json_encode($error_code = 5);
                break;
            }

            if ($error_code === 0) {
                unset($user['Password']);
                echo json_encode($user);
            }
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