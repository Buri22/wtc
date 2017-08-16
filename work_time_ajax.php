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
    "GET_TASK_LIST"      => "getTaskList"
);

$headers = getallheaders();
$action = $headers["Ajax-Action"];

if (is_ajax($headers) && $action != null) {
    switch ($action) {
        // Get Work by Id
        case $ajax_actions["GET_TASK_BY_ID"]:
            if (isset($_POST['work_id']) && !empty($_POST['work_id'])) {
                $result = Db::queryOne('
                                SELECT *
                                FROM work
                                WHERE id = ?
                            ', intval($_POST['work_id']));

                echo json_encode($result);
            }
            break;

        // Get list of tasks
        case ($ajax_actions["GET_TASK_LIST"]):
            $result = Db::queryAll('
                            SELECT id, name
                            FROM work
                            ORDER BY id DESC
                        ');

            echo json_encode($result);
            break;

        // Check if task name exists
        case ($ajax_actions["CREATE_TASK"]):
            if (isset($_POST['new_task_name']) && !empty($_POST['new_task_name'])) {
                $result = Db::query('
                                    SELECT *
                                    FROM work
                                    WHERE name = ?
                                ', $_POST['new_task_name']);

                if (!$result) {
                    $newWork = Db::query('
                                    INSERT INTO work (name)
                                    VALUES (?)
                                ', $_POST['new_task_name']);

                    echo json_encode($newWork);
                }
                else echo "taskNameExists";
            }
            break;

        // Check if some Work started
        case ($ajax_actions["CHECK_TASK_STARTED"]):
            $result = Db::queryOne('
                          SELECT *
                          FROM work
                          WHERE work_started = 1
                    ');

            echo json_encode($result);
            break;

        // Start Work and return started work
        case ($ajax_actions["START_TASK"]):
            if (isset($_POST['work_id']) && !empty($_POST['work_id'])
                && isset($_POST['last_start']) && !empty($_POST['last_start'])) {
                $result = Db::query('
                         UPDATE work
                         SET last_start = ?, work_started = true
                         WHERE id = ?
                     ', intval($_POST["last_start"]), intval($_POST['work_id']));

                if ($result) {
                    $work = Db::queryOne('
                                SELECT *
                                FROM work
                                WHERE id = ?
                            ', intval($_POST['work_id']));

                    echo json_encode($work);
                }
                else echo false;
            }
            break;

        // Stop Work
        case ($ajax_actions["STOP_TASK"]):
            if (isset($_POST['work_id']) && !empty($_POST['work_id'])
                && isset($_POST['spent_time']) && !empty($_POST['spent_time'])) {
                $result = Db::query('
                            UPDATE work
                            SET spent_time = ?, work_started = false
                            WHERE id = ?
                        ', intval($_POST["spent_time"]), intval($_POST['work_id']));

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
