<?php
/*
 * Name: - Work Time Counter -
 * Author: Buri22
 * Date: 2017/8/10 19:08
 * Version: 1.0.0
 */
require_once 'Db_connect.php';
require_once 'functions.php';
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, Ajax-Action, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

$headers = getallheaders();
$action = $headers["Ajax-Action"];

if (is_ajax($headers) && $action != null) {
    switch ($action) {
        case "checkLogin":
            $user = checkLogin();
            if (!$user) {
                echo WTCError::Login;   // User is not logged in
            } else {
                echo json_encode($user);
            }
            break;

        case "register":
            echo json_encode(register());
            break;

        case "login":
            echo json_encode(login());
            break;

        case "logout":
            echo json_encode(logout());
            break;

        case "editAccount":
            echo json_encode(editAccount());
            break;

        case "editAppSettings":
            echo json_encode(editAppSettings());
            break;

        case "getTaskList":
            echo json_encode(getTaskList());
            break;

        case "createTask":
            echo json_encode(createTask());
            break;

        case "editTask":
            echo json_encode(editTask());
            break;

        case "deleteTask":
            echo json_encode(deleteTask());
            break;

        case "startTask":
            echo json_encode(startCounting());
            break;

        case "stopTask":
            echo json_encode(stopCounting());
            break;

        default:
            echo json_encode("Unknown action used.");
    }
} else {
    echo json_encode($headers);
}