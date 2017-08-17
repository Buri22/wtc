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
    "GET_TASK_BY_ID"     => "getTaskById",
    "CHECK_TASK_STARTED" => "checkTaskStarted",
    "START_TASK"         => "startTask",
    "STOP_TASK"          => "stopTask",
    "CREATE_TASK"        => "createTask",
    "EDIT_TASK"          => "editTask",
    "GET_TASK_LIST"      => "getTaskList"
);

$headers = getallheaders();
$action = $headers["Ajax-Action"];

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
                            ORDER BY Id DESC
                        ');

            echo json_encode($result);
            break;

        // Create task
        case ($ajax_actions["CREATE_TASK"]):
            if (isset($_POST['new_task_name']) && !empty($_POST['new_task_name'])) {
                // Check if task name exists
                $result = Db::query('
                                    SELECT *
                                    FROM task
                                    WHERE Name = ?
                                ', $_POST['new_task_name']);

                if (!$result) {
                    $newTask = Db::query('
                                    INSERT INTO task (Name, DateCreated)
                                    VALUES (?, ?)
                                ', $_POST['new_task_name'], date("Y-m-d H:i:s"));

                    echo json_encode($newTask);
                }
                else echo json_encode("taskNameExists");
            }
            break;

        // Edit task
        case ($ajax_actions["EDIT_TASK"]):
            if (isset($_POST['new_task_name']) && !empty($_POST['new_task_name'])
                && isset($_POST['task_id']) && !empty($_POST['task_id'])) {
                // Check if task name exists
                $result = Db::query('
                                    SELECT *
                                    FROM task
                                    WHERE Name = ?
                                ', $_POST['new_task_name']);

                if (!$result) {
                    $editedTask = Db::query('
                                    UPDATE task
                                    SET Name = ?
                                    WHERE Id = ?
                                ', $_POST['new_task_name'], $_POST['task_id']);

                    echo json_encode($editedTask);
                }
                else echo json_encode("taskNameExists");
            }
            break;

        // Check if some task started
        case ($ajax_actions["CHECK_TASK_STARTED"]):
            $result = Db::queryOne('
                          SELECT *
                          FROM task
                          WHERE TaskStarted = 1
                    ');

            echo json_encode($result);
            break;

        // Start task and return started task
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

        // Stop Work
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

        default:
            echo "Unknown action used.";
    }
} else {
    echo json_encode($headers);
}

// Check if the request is an AJAX request
function is_ajax($headers) {
    return isset($headers['Http-X-Requested-With']) && strtolower($headers['Http-X-Requested-With']) == 'xmlhttprequest';
}
