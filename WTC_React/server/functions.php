<?php
include_once 'config.php';
include_once 'sales_force_api.php';

function sendRequestToSalesForce() {
    $user = checkLogin();
    if ($user) {        
        //$salesForceManager = new SalesForceAPI();
        //return $_SESSION['sales_force_manager']->search($_POST['SFAction']);
        return $_SESSION['sales_force_manager']->query($_POST['SFAction']);
    }
    else {
        return "User checkLogin failed";
    }
}

// https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_query.htm
// https://developer.salesforce.com/docs/atlas.en-us.220.0.soql_sosl.meta/soql_sosl/sforce_api_calls_sosl_examples.htm
function sendChangeDataRequestToSalesForce() {
    $user = checkLogin();
    if ($user) {
        // Create url to request data from SF
        $url = $_SESSION['instance_url'].'/services/data/v46.0/sobjects/Lead/00Q2o000014fhIYEAY';
        $data = array("FirstName" => "Bertha2");                                                                    
        $data_string = json_encode($data);
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array( 
            'Authorization: Bearer ' . $_SESSION['access_token'],
            'Content-Type: application/json',
            'Content-Length: ' . strlen($data_string)
        ));
    
        // Execute post
        $result = curl_exec($ch);
        curl_close($ch);
        $response = json_decode($result);
        //$this->query_url = $_SESSION['instance_url'].$response->query.'?q=';
    
        return $response;
    }
    else {
        return "User checkLogin failed";
    }
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

function sec_session_start() {
    $session_name = 'sec_session_id';   // Set a custom session name
    $secure = SECURE;
    // This stops JavaScript being able to access the session id.
    $httponly = true;
    // Forces sessions to only use cookies.
    if (ini_set('session.use_only_cookies', 1) === FALSE) {
        // TODO: relocate by JS
        header("Location: ../error.php?err=Could not initiate a safe session (ini_set)");
        exit();
    }
    // Gets current cookies params.
    $cookieParams = session_get_cookie_params();
    session_set_cookie_params($cookieParams["lifetime"], $cookieParams["path"], $cookieParams["domain"], $secure, $httponly);
    // Sets the session name to the one set above.
    session_name($session_name);
    session_start();            // Start the PHP session
    session_regenerate_id();    // regenerated the session, delete the old one.
}

function check_brute($user) {
    $now = time();  // Get timestamp of current time
    $login_attempts = $user['LoginAttempts'] + 1;
    $last_attempt = $user['LastAttempt'] == null ? $now : $user['LastAttempt'];
    $result = false;

    if ($login_attempts > MAX_LOGIN_ATTEMPTS) { // This is the MAX_LOGIN_ATTEMPTS + 1 attempt to login
        if (($now - intval($last_attempt)) < LAST_ATTEMPT_MIN_TIME) { // Block the account
            $result = true;
        }
        else {
            --$login_attempts;
        }
    }

    // Update users LoginAttempts and LastAttempt
    Db::query('
        UPDATE user
        SET LoginAttempts = ?, LastAttempt = ?
        WHERE Id = ?
    ', $login_attempts, $now, $user['Id']);

    return $result;
}

// Check if user is logged in and return User for JS manipulation
function checkLogin() {
    sec_session_start();
    // Check if all session variables are set
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['login_string'])) {
        return false;
    }
    // Try to get user from db
    $user =  Db::queryOne('
              SELECT *
              FROM user
              WHERE Id = ?
            ', $_SESSION['user_id']);
    if (!$user) {    // User has no record in DB
        return false;
    }
    // Check if login_string stored in session equals to $login_check
    $login_check = hash('sha512', $user['Password'] . $_SERVER['HTTP_USER_AGENT']);
    if (!hash_equals($login_check, $_SESSION['login_string'])) {
        return false;
    }

    return getUserForJS($user);
}

// Check if some task started
function checkTaskStarted() {
    $userId = getUserId();
    if ($userId == NULL) {
        return false;
    }
    $task = Db::queryOne('
        SELECT *
        FROM task
        WHERE TaskStarted = 1 AND UserId = ?
    ', $userId);

    return $task;   // returns task that started or false
}

// Define User object for JS manipulation
function getUserForJS($user) {
    $result = array();

    $result['Id']          = $user['Id'];
    $result['UserName']    = $user['UserName'];
    $result['Email']       = $user['Email'];
    $result['AppSettings'] = $user['AppSettings'];
    $result['Categories']  = getUserCategories($user['Id']);

    return $result;
}

function getUserCategories($userId) {

    $result = Db::queryAll('
                        SELECT *
                        FROM category
                        WHERE UserId = ?
                    ', $userId);

    return $result;
}

function createCategories($categoriesToCreate, &$response) {
    // Get userId
    $userId = getUserId();
    if ($userId == NULL) {
        return;
    }

    // Get current new category edited children
    $currentCatOriginalEditedChildren = json_decode($_POST["categoriesToEdit"]);
    $currentCatEditedChildren = json_decode($_POST["categoriesToEdit"]);

    // Get new categories with existing parent
    $newCatsWithExistingParent = array_filter($categoriesToCreate, 'parentCategoryExists');
    for ($i=0; $i < count($newCatsWithExistingParent); $i++) {
        $currentCat = $newCatsWithExistingParent[$i];
        // Insert new category
        $newCatResult = Db::queryOne('
            INSERT INTO category (Name, ParentId, UserId)
            VALUES (?, ?, ?)
        ', $currentCat->name, $currentCat->parentId, $userId);

        // TODO: fix check in case insertion failed, refactor also createTask()
        // if ($newCatResult == false) {
        //     array_push($response["results"]["new"], 'Insertion failed - category: ' . $currentCat->name);
        // }
        // else {
        // }
        // Get new created category Id
        $newCategoryId = Db::getLastId();

        // Get current new category new children
        $currentCatNewChildren = array_filter($categoriesToCreate, function ($child) use ($currentCat) {
            return $child->parentId == $currentCat->id;
        });
        // Loop through potential new children
        foreach ($currentCatNewChildren as $childCat) {
            // Set new category Id to children parentIds
            $childCat->parentId = $newCategoryId;
            // Add fixed child to $newCatsWithExistingParent array
            array_push($newCatsWithExistingParent, $childCat);
        }

        // Loop through potential edited children
        foreach ($currentCatOriginalEditedChildren as $key => $childCat) {
            // Set new category Id to edited children parentIds
            if ($childCat->parentId == $currentCat->id) {
                $currentCatEditedChildren[$key]->parentId = $newCategoryId;   
            }
        }

        // Set result to response
        $result = Db::queryOne('SELECT * From category WHERE Id = ?', $newCategoryId);
        array_push($response["results"]["new"], $result);
    }

    // Save changes to edited categories
    $_POST["categoriesToEdit"] = json_encode($currentCatEditedChildren);
}
function parentCategoryExists($category) {
    // Categories with parentId = null -> are root categories
    if ($category->parentId == null) return true;

    $result = Db::querySingle('
        SELECT COUNT(*)
        FROM category
        WHERE Id = ?
    ', $category->parentId);

    return $result > 0 ? true : false;
}

function editCategories($categoriesToEdit, &$response) {
    // Loop throught all edited categories to create single SQL query with multiple UPDATE statements
    foreach ($categoriesToEdit as $category) {
        $data = array(
            "Name" => trim($category->name),
            "ParentId" => $category->parentId
        );
        $result = Db::update('category', array(
            "Name" => trim($category->name),
            "ParentId" => $category->parentId
        ), 'WHERE Id = ' . $category->id);

        array_push($response["results"]["edit"], $result);
    }

}
function deleteCategories($categoriesToRemove, &$response) {
    // Prepare string of category ids for delete SQL query 
    $categoryIdsToRemove = '(';
    foreach ($categoriesToRemove as $categoryId) {
        if (!is_int($categoryId)) {
            // Make record to result errors
            array_push($response["errors"], 'Category Id is not a integer: ' . $categoryId);
        }
        else {
            $categoryIdsToRemove .= $categoryId . ', ';
            // Add result to response
            array_push($response["results"]["delete"], $categoryId);
        }
    }
    $categoryIdsToRemove = substr($categoryIdsToRemove, 0, -2) . ')';

    // Check if deleted category is parent/has children, if yes, get its parent id (may be null) and put it to its children parentIds
    Db::queryAll('
        UPDATE category child
        INNER JOIN category parent 
            ON parent.Id = child.ParentId 
        SET child.ParentId = parent.ParentId
        WHERE parent.Id IN 
    ' . $categoryIdsToRemove);
    
    $result = Db::queryOne('
                DELETE FROM category
                WHERE Id IN 
            ' . $categoryIdsToRemove);
}
function updateCategories() {
    $response = array(
        "results" => array(
            "new" => array(),
            "edit" => array(),
            "delete" => array()
        ),
        "errors" => array()
    );

    // Get userId
    $userId = getUserId();

    if ($userId != NULL) {
        foreach (unserialize(CUSTOM_CATEGORIES_EDIT_FUNCTIONS) as $key => $value) {
            if (isset($_POST[$key])) {
                $decodedValue = json_decode($_POST[$key]);
                if (is_array($decodedValue)) {
                    if (count($decodedValue) > 0) {
                        call_user_func_array($value, array($decodedValue, &$response));
                    }
                }
                else {
                    array_push($response["errors"], 'We could not decode array from ' . $key . ' variable.');
                }
            }
        }
    
        $response["updatedCategories"] = getUserCategories($userId);
    }
    else {
        array_push($response["errors"], 'User login session expired.');
    }

    return $response;
}

function getUserId() {
    if (!isset($_SESSION['user_id'])) {
        $user = checkLogin();

        if (!$user) { // User is not logged in
            return NULL;
        }

        $_SESSION['user_id'] = $user["Id"];
    }
    return $_SESSION['user_id'];
}

function register() {
    // Check if all inputs were entered
    if (!isset($_POST['userName']) || empty($_POST['userName'])
        || !isset($_POST['email']) || empty($_POST['email'])
        || !isset($_POST['password']) || empty($_POST['password'])
        || !isset($_POST['passwordConfirm']) || empty($_POST['passwordConfirm'])
    ) { return WTCError::Input; }

    // Email validation
    if (!isValidEmail(trim($_POST['email']))) { return WTCError::Email; }

    // Password validation
    if (trim($_POST['password']) != trim($_POST['passwordConfirm'])) { return WTCError::EqualPasswords; }

    // Check if user is already registered
    $registered = Db::queryOne('
                          SELECT *
                          FROM user
                          WHERE Email = ?
                    ', $_POST['email']);

    if ($registered) { return WTCError::Registered; }

    $password = password_hash(trim($_POST['password']), PASSWORD_BCRYPT);
    $app_settings = json_encode(unserialize(DEFAULT_APP_SETTINGS));
    $newUser = Db::query('
                    INSERT INTO user (UserName, Password, Email, AppSettings)
                    VALUES (?, ?, ?, ?)
                ', trim($_POST['userName']), $password, trim($_POST['email']), $app_settings);

    return $newUser;
}

function login() {
    sec_session_start();    // Our custom secure way of starting a PHP session.

    // Check if all inputs were entered
    if (!isset($_POST['email']) || empty($_POST['email'])
        || !isset($_POST['password']) || empty($_POST['password'])) {
        return WTCError::Input;
    }
    // Email validation
    if (!isValidEmail(trim($_POST['email']))) {
        return WTCError::Email;
    }
    // Try to find user
    $user =  Db::queryOne('
                          SELECT *
                          FROM user
                          WHERE Email = ?
                    ', trim($_POST['email']));

    if (!$user) {    // User has no record in DB
        return WTCError::Unregistered;
    }
    else if (check_brute($user)){
        return WTCError::Brute;
    }
    else if (!password_verify($_POST['password'], $user['Password'])) {   // Check passwords
        return WTCError::Password;
    }

    if (USE_SF) {
        // Create SalesForceManager instance and store it in the SESSION variable
        $_SESSION['sales_force_manager'] = new SalesForceAPI();
        $_SESSION['sales_force_manager']->connect(SF_APP_ID, SF_APP_SECRET, $_POST['email'], $_POST['password'] . $user['SFSecureKey']);
        
        // $_SESSION['instance_url'] = $sfConnection->instance_url;
        // $_SESSION['access_token'] = $sfConnection->access_token;
    }

    $_SESSION['user_id'] = $user['Id'];
    $_SESSION['login_string'] = hash('sha512', $user['Password'] . $_SERVER['HTTP_USER_AGENT']);
    return getUserForJS($user);
}

function logout() {
    sec_session_start();

    // Unset all session values
    $_SESSION = array();

    // get session parameters
    $params = session_get_cookie_params();

    // Delete the actual cookie.
    setcookie(session_name(),
        '', time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );

    // Destroy session
    session_destroy();

    return true;
}

// Update User Account data
function editAccount() {
    // Check if all inputs were entered
    if (!isset($_POST['userName']) || empty($_POST['userName'])
        || !isset($_POST['email']) || empty($_POST['email'])
        || ($_POST['changePassword'] == "true"
            && (!isset($_POST['passwordCurrent']) || empty($_POST['passwordCurrent'])
            || !isset($_POST['passwordNew']) || empty($_POST['passwordNew'])
            || !isset($_POST['passwordConfirm']) || empty($_POST['passwordConfirm'])))) {
        return WTCError::Input;
    }

    $userId = getUserId();
    if ($userId == NULL) {
        return WTCError::Login;
    }

    // Email validation
    if (!isValidEmail(trim($_POST['email']))) {
        return WTCError::Email;
    }
    // Check that edited email isn't already registered
    $registered = Db::queryOne('
                          SELECT *
                          FROM user
                          WHERE Email = ?
                    ', $_POST['email']);
    if ($registered && $registered['Id'] != $userId) {
        return WTCError::Registered;
    }

    // Define SQL query data
    $data = array(
        'UserName' => trim($_POST['userName']),
        'Email' => trim($_POST['email'])

    );

    // User wants to change his password
    if ($_POST['changePassword'] == "true") {
        $loggedIn_user = Db::queryOne('SELECT * FROM user WHERE Id = ?', $userId);
        if ($loggedIn_user) {
            // Check passwords
            if (!password_verify($_POST['passwordCurrent'], $loggedIn_user['Password'])) { return WTCError::Password; }

            // New password validation
            if (trim($_POST['passwordNew']) != trim($_POST['passwordConfirm'])) { return WTCError::EqualPasswords; }

            // Define new password
            $data['Password'] = password_hash(trim($_POST['passwordNew']), PASSWORD_BCRYPT);
            // Update session login_string
            $_SESSION['login_string'] = hash('sha512', $loggedIn_user['Password'] . $_SERVER['HTTP_USER_AGENT']);
        }
    }

    $condition = 'WHERE Id = ' . $userId;
    $result = Db::update('user', $data, $condition);

    return $result;
}
function editAppSettings() {
    // Check if all inputs were entered
    if (!isset($_POST['app_settings']) || empty($_POST['app_settings'])) {
        return WTCError::Input;
    }
    
    $userId = getUserId();
    if ($userId == NULL) {
        return WTCError::Login;
    }

	$data = array(
		'AppSettings' => $_POST['app_settings']
	);
    $condition = 'WHERE Id = ' . $userId;
    $result = Db::update('user', $data, $condition);
	
	return $result;
}

// Unused function... Deprecated?
function getTask() {
    if (!isset($_POST['task_id']) || empty($_POST['task_id'])) {
        return WTCError::Input;
    }
    $result = Db::queryOne('
                    SELECT *
                    FROM task
                    WHERE Id = ?
                ', intval($_POST['task_id']));
    return $result;
}

// Get list of tasks
function getTaskList() {
    $userId = getUserId();
    if ($userId == NULL) {
        return WTCError::Login;
    }

    $result = Db::queryAll('
        SELECT *
        FROM task
        WHERE UserId = ?
        ORDER BY Id DESC
    ', $userId);

    return $result;

    // $user = checkLogin();
    // return $user;
    // if ($user) {
    //     $result = Db::queryAll('
    //                     SELECT *
    //                     FROM task
    //                     WHERE UserId = ?
    //                     ORDER BY Id DESC
    //                 ', $user['Id']);

    //     return $result;
    // }
    // else return $user;
}

function createTask() {
    if (!isset($_POST['new_name']) || empty($_POST['new_name'])
        || !isset($_POST['new_spent_time']) || empty($_POST['new_spent_time'])
        || !isset($_POST['new_date_created']) || empty($_POST['new_date_created'])
        || !isset($_POST['new_category_id'])) {
        return WTCError::Input;
    }
    $userId = getUserId();
    if ($userId == NULL) {
        return WTCError::Login;
    }

    // Validate task spent time format
    if (!validateSpentTime($_POST['new_spent_time'])) {
        return WTCError::TaskSpentTime;
    }
    // Validate task date created format
    $date = explode(".", $_POST['new_date_created']);
    if (!checkdate(intval($date[1]), intval($date[0]), intval($date[2]))) {
        return WTCError::TaskDateCreated;
    }

    // Insert new task
    $newTaskResult = Db::queryOne('
        INSERT INTO task (Name, SpentTime, DateCreated, CategoryId, UserId)
        VALUES (?, ?, ?, ?, ?)
        ', trim($_POST['new_name'])
        , hmsToSeconds($_POST['new_spent_time'])
        , date_create($date[2] . "-" . $date[1] . "-" . $date[0])->format('Y-m-d')
        , $_POST['new_category_id'] == "" ? NULL : intval($_POST['new_category_id'])
        , $userId
    );
    // TODO: implement check whether insertion failed as in createCategories()
    // Get new Task Id
    $newTaskId = Db::getLastId();

    $insertedTask = Db::queryOne('
                SELECT *
                FROM task
                WHERE Id = ?
            ', $newTaskId);

    return $insertedTask;

    // // Define data for insert query
    // $data = array();
    // $data['Name']        = trim($_POST['new_name']);
    // $data['SpentTime']   = hmsToSeconds($_POST['new_spent_time']);
    // $data['DateCreated'] = date_create($date[2] . "-" . $date[1] . "-" . $date[0])->format('Y-m-d');
    // $data['UserId']      = $userId;

    // $newTask = Db::insert('task', $data);

    // if ($newTask == 1) {
    //     $insertedTask = Db::queryOne('
    //                 SELECT *
    //                 FROM task
    //                 WHERE UserId = ? AND Name = ?
    //             ', $userId, $_POST['new_name']);
    //     return $insertedTask;
    // }
    // return $newTask;
}

function editTask() {
    // Check if all inputs were entered
    if (!isset($_POST['new_name']) || empty($_POST['new_name'])
        || !isset($_POST['new_spent_time']) || empty($_POST['new_spent_time'])
        || !isset($_POST['new_date_created']) || empty($_POST['new_date_created'])
        || !isset($_POST['item_id']) || empty($_POST['item_id'])
        || !isset($_POST['new_category_id'])) {
        return WTCError::Input;
    }

    // Validate task spent time format
    if (!validateSpentTime($_POST['new_spent_time'])) {
        return WTCError::TaskSpentTime;
    }
    // Validate task date created format
    $date = explode(".", $_POST['new_date_created']);
    if (!checkdate(intval($date[1]), intval($date[0]), intval($date[2]))) {
        return WTCError::TaskDateCreated;
    }

    // Define data for update query
    $data = array();
    $data['Name'] = trim($_POST['new_name']);
    $data['SpentTime'] = hmsToSeconds($_POST['new_spent_time']);
    $data['DateCreated'] = date_create($date[2] . "-" . $date[1] . "-" . $date[0])->format('Y-m-d');
    $data['CategoryId'] = intval($_POST['new_category_id']);

    $condition = 'WHERE Id = ' . intval($_POST['item_id']);

    $result = Db::update('task', $data, $condition);

    if ($result == 1) {
        return $data;
    }

    return $result;
}

function deleteTask() {
    // Check if all inputs were entered
    if (!isset($_POST['password']) || empty($_POST['password'])
        || !isset($_POST['task_id']) || empty($_POST['task_id'])
    ) { return WTCError::Input; }

    // Prevent from deleting running Task
    $runningTask = checkTaskStarted();
    if ($runningTask && $runningTask['Id'] == $_POST['task_id']) {
        return WTCError::TaskRunning;
    }

    // Try to find the task
    $password = Db::queryOne('
                        SELECT Password
                        FROM user
                        LEFT JOIN task ON task.UserId = user.Id
                        WHERE task.Id = ?
                    ', $_POST['task_id']);
    if (!$password) {
        return WTCError::TaskMissing;
    }
    else if(!password_verify($_POST['password'], $password['Password'])) {
        return WTCError::Password;
    }

    $result = Db::queryOne('
                    DELETE FROM task
                    WHERE Id = ?
                  ', $_POST['task_id']);
    return $result;
}

// Start counting and return started task values
function startCounting() {
    $task_started = checkTaskStarted();

    if ($task_started == WTCError::Logout) {
        return $task_started;
    }
    else if ($task_started) {
        $task_started['someTaskAlreadyStarted'] = true;
        return $task_started;    // We`re sending task that already started
    }

    if (!isset($_POST['task_id']) || empty($_POST['task_id'])
        || !isset($_POST['last_start']) || empty($_POST['last_start'])
    ) { return WTCError::Input; }

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

        return $work;
    }
    else return $result;
}

function stopCounting() {
    $task_started = checkTaskStarted();

    if ($task_started == WTCError::Logout) {
        return $task_started;
    }
    else if (!$task_started) {
        return WTCError::TaskStarted;
    }

    if (!isset($_POST['task_id']) || empty($_POST['task_id'])) {
        return WTCError::Input;
    }

    if ($_POST['task_id'] != $task_started['Id']) { // Other task started
        $task_started['otherTaskStarted'] = true;
        return $task_started;
    }

    $spent_time = time() - $task_started['LastStart'] + $task_started['SpentTime'];
    if (isset($_POST['spent_time']) && !empty($_POST['spent_time'])) {
        $spent_time = (int)$_POST['spent_time'];
    }
    $result = Db::query('
                    UPDATE task
                    SET SpentTime = ?, TaskStarted = false
                    WHERE Id = ?
                  ', $spent_time, intval($_POST['task_id']));
    if ($result) {
        $result = array('SpentTime' => $spent_time);
    }

    return $result;
}

function hmsToSeconds($text) {
    $spentTime = explode(':', $text);
    return intval($spentTime[0]) * 60 * 60 + intval($spentTime[1]) * 60 + intval($spentTime[2]);
}
function validateSpentTime($spentTime) {
    if (preg_match('/^[0-9]+:[0-5]\d:[0-5]\d$/', $spentTime)) {
        return true;
    }
    return false;
}
















