<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

require_once 'work_time_counter_functions.php';
require_once 'Db.php';
Db::connect('127.0.0.1', 'work_time_counter', 'root', 'Bluegrass');


//if (isset($_GET['work_id'])) {
//    $work_id = intval($_GET['work_id']);
//    //var_dump($work_id);
//    $current_spent_time = checkWork($work_id, "spent_time");
//
//    $current_spent_time_converted = gmdate('H:i:s', $current_spent_time);
//
//    echo $current_spent_time_converted;
//}

$headers = getallheaders();

if (is_ajax($headers)) {
    if (isset($_POST['work_id']) && !empty($_POST['work_id'])) {
        $work_id = intval($_POST['work_id']);
        // echo $work_id;
        // check if current work started
        $current_work = Db::queryOne('
                        SELECT work_started, spent_time, id
                        FROM work
                        WHERE id = ?
                        ', $work_id);

        echo json_encode($current_work);
    }
} else {    // this is not AJAX call
    
}

//Function to check if the request is an AJAX request
function is_ajax($headers) {
    return isset($headers['HTTP_X_REQUESTED_WITH']) && strtolower($headers['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}
