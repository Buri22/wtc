<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

require_once 'work_time_counter_functions.php';
require_once 'Db.php';
Db::connect('127.0.0.1', 'work_time_counter', 'root', 'Bluegrass');

$headers = getallheaders();

if (is_ajax($headers)) {
    if (isset($_POST["start_work"])) {          // Start Work
        $work_id = intval($_POST['work_id']);
        $last_start = intval($_POST["last_start"]);

        $result = Db::query('
                     UPDATE work
                     SET last_start = ?, work_started = true
                     WHERE id = ?
                     ', $last_start, $work_id);

        echo json_encode($result);
    }
    else if (isset($_POST["work_started"])) {     // Check if some Work started
        $works = Db::queryOne('
                  SELECT *
                  FROM work
                  WHERE work_started = 1
              ');

        echo json_encode($works);
    }
    else if (isset($_POST['work_id']) && !empty($_POST['work_id'])) {   // Get Work by Id
        $work_id = intval($_POST['work_id']);
        $current_work = Db::queryOne('
                        SELECT *
                        FROM work
                        WHERE id = ?
                        ', $work_id);

        echo json_encode($current_work);
    }
} else {    // this is not AJAX call
    
}

// Check if the request is an AJAX request
function is_ajax($headers) {
    return isset($headers['HTTP_X_REQUESTED_WITH']) && strtolower($headers['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}
