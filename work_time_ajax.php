<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

require_once 'Db.php';
require_once 'AJAX_Actions.php';
Db::connect('127.0.0.1', 'work_time_counter', 'root', 'Bluegrass');

$headers = getallheaders();
$action = $headers["AJAX_Action"];

if (is_ajax($headers) && $action != null) {
    switch ($action) {
        // Get Work by Id
        case (AJAX_Actions::GET_WORK_BY_ID):
            if (isset($_POST['work_id']) && !empty($_POST['work_id'])) {
                $result = Db::queryOne('
                                SELECT *
                                FROM work
                                WHERE id = ?
                            ', intval($_POST['work_id']));

                echo json_encode($result);
            }
            break;

        // Check if some Work started
        case (AJAX_Actions::CHECK_WORK_STARTED):
            $result = Db::queryOne('
                          SELECT *
                          FROM work
                          WHERE work_started = 1
                    ');

            echo json_encode($result);
            break;

        // Start Work and return started work
        case (AJAX_Actions::START_WORK):
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
        case (AJAX_Actions::STOP_WORK):
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
            echo false;
    }
} else {    // this is not AJAX call or $action in null
    
}

// Check if the request is an AJAX request
function is_ajax($headers) {
    return isset($headers['HTTP_X_REQUESTED_WITH']) && strtolower($headers['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}
