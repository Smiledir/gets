<?php

    require_once 'utils.inc';
/*
    Function adds category to database

    Params:
	name - any non existent name of category (max 300 symbols)
	projectName - the project name or main admin login (max 300 symbols, non required)
	token - the user token (user should be an admin user)
	description - any short category description (max 2048 symbols, not required)
	url - any url for corresponded category (max 2048 symbols, not required)

    Return: id of added category

    Example of usage: curl -d "<methodCall><methodName>addCategory</methodName><params><param><struct><member><name>token</name><value>bhbmdlbm</value></member><member><name>name</name><value>shops</value></member><member><name>projectName</name><value>gets2</value></member><member><name>description</name><value>Shops, markets, etc.</value></member><member><name>url</name><value>http://en.wikipedia.org/wiki/Market</value></member></struct></param></params></methodCall>" http://geo2tag.cs.prv/gets/geo2tag.php
 */

    function addcategory_func($method_name, $params, $app_data)
    {
	global $dbconn;

	if (array_key_exists("name", $params[0])) {
	    $name = $params[0]["name"];
	    $name = pg_escape_string($name);
	    $name = "'$name'";
	} else {
	    trigger_error("Category name did not specified", E_USER_ERROR);
	    die();
	}

	if (array_key_exists("description", $params[0])) {
	    $description = $params[0]["description"];
	    $description = pg_escape_string($description);
	    $description = "'$description'";
	} else {
	    $description = "NULL";
	}

	if (array_key_exists("projectName", $params[0])) {
	    $projectName = $params[0]["projectName"];
	    $projectName = pg_escape_string($projectName);
	    $projectName = "'$projectName'";
	} else {
	    $projectName = "NULL";
	}
	    
	if (array_key_exists("token", $params[0])) {
	    $token = $params[0]["token"];
	}
	    
	if (array_key_exists("url", $params[0])) {
	    $url = $params[0]["url"];
	    $url = pg_escape_string($url);
	    $url = "'$url'";
	} else {
	    $url = "NULL";
	}

	/* check project name if exists */
	if ($projectName != "NULL") {
	    $sql_request = "select id from users where users.login=$projectName;";
	    $res = pg_query($dbconn, $sql_request);
	    
	    if (!$res) {
		trigger_error("SQL error", E_USER_ERROR);
		die();
	    }

	    $row = pg_fetch_row($res);
	    if (!$row) {
		trigger_error("SQL error", E_USER_ERROR);
		die();
	    }
	    $projectID=$row[0];
	    if (!$projectID > 0) {
		trigger_error("The project name doesn't exists");
		die();
	    }
	}else{
	    $projectID=0;
	}

	/* check user rights */
	if (!isset($token) || !isset($projectID) || !has_admin_rights($token, $projectID)) {
	    trigger_error("User don't have admin rights");
	}

	/* check availability category name */

	if ($projectName != "NULL")
	{
	    $sql_request = "select count(*) from category,users where category.name=$name and category.owner_id=users.id and users.login=$projectName;";
	} else {
	    $sql_request = "select count(*) from category where category.name=$name;";
	}
	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$row = pg_fetch_row($res);

	if ($row[0] > 0) {
	    trigger_error("The category name already exists");
	    die();
	}

	$sql_request = "insert into category (name, description, url, owner_id) values ($name, $description, $url, $projectID);";
	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$sql_request = "select category.id from category where category.name=$name;";
	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}
	$row = pg_fetch_row($res);
	if (!$row) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$name = $row[0];

        return "$name";
    }
    
/*
    Function update category in database

    Params:
        id - the ID of updated category
	name - any non existent name of category (max 300 symbols, non required)
	projectName - the project name or main admin login (max 300 symbols)
	token - the user token (user should be an admin user)
	description - any short category description (max 2048 symbols, not required)
	url - any url for corresponded category (max 2048 symbols, not required)

    Return: id of updated category or error message

    Example of usage: curl -d "<methodCall><methodName>updateCategory</methodName><params><param><struct><member><name>id</name><value>23</value></member><member><name>token</name><value>bhbmdlbm</value></member><member><name>name</name><value>shops</value></member><member><name>projectName</name><value>gets2</value></member><member><name>description</name><value>Shops, markets, etc.</value></member><member><name>url</name><value>http://en.wikipedia.org/wiki/Market</value></member></struct></param></params></methodCall>" http://geo2tag.cs.prv/gets/geo2tag.php
 */

    function updatecategory_func($method_name, $params, $app_data)
    {
	global $dbconn;

	if (array_key_exists("id", $params[0])) {
	    $id = $params[0]["id"];
	    $id = pg_escape_string($id);
	} else {
	    trigger_error("Category ID did not specified", E_USER_ERROR);
	    die();
	}

	if (array_key_exists("name", $params[0])) {
	    $name = $params[0]["name"];
	    $name = pg_escape_string($name);
	    $name = "'$name'";
	}

	if (array_key_exists("description", $params[0])) {
	    $description = $params[0]["description"];
	    $description = pg_escape_string($description);
	    $description = "'$description'";
	}

	if (array_key_exists("projectName", $params[0])) {
	    $projectName = $params[0]["projectName"];
	    $projectName = pg_escape_string($projectName);
	    $projectName = "'$projectName'";
	}
	    
	if (array_key_exists("token", $params[0])) {
	    $token = $params[0]["token"];
	}
	    
	if (array_key_exists("url", $params[0])) {
	    $url = $params[0]["url"];
	    $url = pg_escape_string($url);
	    $url = "'$url'";
	}

	/* check project name if exists */
	if (isset($projectName)) {
	    $sql_request = "select id from users where users.login=$projectName;";
	    $res = pg_query($dbconn, $sql_request);
	    
	    if (!$res) {
		trigger_error("SQL error", E_USER_ERROR);
		die();
	    }

	    $row = pg_fetch_row($res);
	    if (!$row) {
		trigger_error("SQL error", E_USER_ERROR);
		die();
	    }
	    $projectID=$row[0];
	    if (!$projectID > 0) {
		trigger_error("The project name doesn't exists");
		die();
	    }
	}else{
	    $projectID=0;
	}

	/* check user rights */
	if (!isset($token) || !isset($projectID) || !has_admin_rights($token, $projectID)) {
	    trigger_error("User don't have admin rights");
	}

	/* check availability category name */

	if (isset($projectName))
	{
	    $sql_request = "select count(*) from category,users where category.name=$name and category.owner_id=users.id and users.login=$projectName and (category.id < $id or category.id > $id);";
	} else {
	    $sql_request = "select count(*) from category where category.name=$name and (category.id < $id or category.id > $id);";
	}
	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$row = pg_fetch_row($res);

	if ($row[0] > 0) {
	    trigger_error("The category name already exists");
	    die();
	}

	$sql_request = "update category SET ";
	$and_flag=0;
	if (isset($name)) {
	    $sql_request .= ($and_flag == 1? ", ":"") . "name=$name"; 
	    $and_flag=1;
	}
	if (isset($description)) {$sql_request .= ($and_flag == 1? ", ":"") . "description=$description"; $and_flag=1;}
	if (isset($url)) {$sql_request .= ($and_flag == 1? ", ":"") . "url=$url"; $and_flag=1;}
	
	$sql_request .= " where id=$id;";
	
	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$sql_request = "select category.id from category where category.name=$name;";
	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}
	$row = pg_fetch_row($res);
	if (!$row) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$name = $row[0];

        return "$name";
    }

/*
    Function gets list of categories

    Params:
	projectName - the project name or main admin login (max 300 symbols, non required)

    Example of usage: curl -d "<methodCall><methodName>getCategories</methodName><params><param><struct><member><name>projectName</name><value>gets2</value></member></struct></param></params></methodCall>" http://geo2tag.cs.prv/gets/geo2tag.php
 */
    function getcategories_func($method_name, $params, $app_data)
    {
	global $dbconn;

	if ($params > 0 && array_key_exists("projectName", $params[0])) {
	    $projectName = $params[0]["projectName"];
	    $projectName = pg_escape_string($projectName);
	    $projectName = "'$projectName'";
	} else {
	    $projectName = "NULL";
	}

	if ($projectName != "NULL") {
	    $sql_request = "select category.id, category.name, category.description, category.url from category, users where category.owner_id=users.id and users.login=$projectName;";
	} else {
	    $sql_request = "select category.id, category.name, category.description, category.url from category";
	}
	$res = pg_query($dbconn, $sql_request);
	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	return pg_fetch_all($res);
    }

/*
    Function removes category from list

    Params:
	id - category id
	projectName - the project name or main admin login (max 300 symbols, non required)
	token - the user token (user should be an admin user)

    Example of usage: curl -d "<methodCall><methodName>deleteCategory</methodName><params><param><struct><member><name>id</name><value>2</value></member><member><name>projectName</name><value>gets</value></member><member><name>token</name><value>gljt434jlgt435jlvj3l</value></member></struct></param></params></methodCall>" http://geo2tag.cs.prv/gets/geo2tag.php
 */
    function deletecategory_func($method_name, $params, $app_data)
    {
	global $dbconn;

	if (array_key_exists("id", $params[0])) {
	    $id = $params[0]["id"];
	    $id = pg_escape_string($id);
	    $id = intval($id);
	} else {
	    trigger_error("Category id did not specified", E_USER_ERROR);
	    die();
	}

	if (array_key_exists("projectName", $params[0])) {
	    $projectName = $params[0]["projectName"];
	    $projectName = pg_escape_string($projectName);
	    $projectName = "'$projectName'";
	} else {
	    trigger_error("ProjectName did not specified", E_USER_ERROR);
	    die();
	}
	    
	if (array_key_exists("token", $params[0])) {
	    $token = $params[0]["token"];
	    $token = pg_escape_string($token);
	}

	/* check project name if exists */
	if ($projectName != "NULL") {
	    $sql_request = "select id from users where users.login=$projectName;";
	    $res = pg_query($dbconn, $sql_request);
	    
	    if (!$res) {
		trigger_error("SQL error", E_USER_ERROR);
		die();
	    }

	    $row = pg_fetch_row($res);
	    if (!$row) {
		trigger_error("SQL error", E_USER_ERROR);
		die();
	    }
	    $projectID=$row[0];
	    if (!$projectID > 0) {
		trigger_error("The project name doesn't exists");
		die();
	    }
	}else{
	    $projectID=0;
	}

	/* check user rights */
	if (!isset($token) || !isset($projectID) || !has_admin_rights($token, $projectID)) {
	    trigger_error("User don't have admin rights");
	    die();
	}

	/* remove category */

	$sql_request = array("id" => $id, "owner_id" => $projectID);
	$res = pg_delete($dbconn, 'category', $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$sql_request = "select count(*) from category where id=$id;";
	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}
	$row = pg_fetch_row($res);
	if (!$row) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	if ($row[0] > 0) {
	    trigger_error("The rows was not deleted");
	    die();
	}

        return $id;

    }


/*
    Function ensures that private category-channel for given category_id exists and returns it's name

    category_id - id of category
    gets_token - gets token
 */
    function getCategoryChannel_func($method_name, $params, $app_data) {
        global $dbconn;

        $category_id = get_parameter($params, 'category_id');
        $gets_token = get_parameter($params, 'gets_token');

        $email = pg_escape_string($dbconn, receive_email_by_token($gets_token));
        if ($email == null) {
            trigger_error('Wrong token or GeTS error', E_USER_ERROR);
            die();
        }

        // Receive category name
        $category_id_escaped = pg_escape_string($dbconn, $category_id);
        $category_request = "SELECT category.name FROM category WHERE category.id='${category_id_escaped}';";
        $cat_resp = pg_query($dbconn, $category_request);
        $cat_row = pg_fetch_row($cat_resp);

        if (!$cat_row || count($cat_row) == 0) {
            trigger_error('Wrong category id', E_USER_ERROR);
            die();
        }

        $category_name = $cat_row[0];

        // Receive user name
        $user_name_request = "SELECT users.login, users.id FROM users WHERE users.email='${email}';";
        $user_resp = pg_query($dbconn, $user_name_request);
        $user_row = pg_fetch_row($user_resp);

        if (!$user_row || count($user_row) == 0) {
            trigger_error('Can\'t find user name');
        }

        $user_name = $user_row[0];
        $user_id = $user_row[1];

        $channel_name = "ch+${category_id}+${user_id}";
        $channel_name_escaped = pg_escape_string($dbconn, $channel_name);

        $select_request = "SELECT channel.id FROM channel WHERE channel.name='${channel_name_escaped}';";
        $select_resp = pg_query($dbconn, $select_request);
        if (pg_num_rows($select_resp) == 0) {
            $desc_array = array('description' => "Private channel for category ${category_name} user ${user_name}",
                    'category_id' => "${category_id}");
            $description = pg_escape_string($dbconn, json_encode($desc_array));

            $insert_request = "INSERT INTO channel (name, description, url, owner_id) VALUES ('${channel_name_escaped}', '${description}', '{}', ${user_id}) RETURNING channel.id;";
            $insert_resp = pg_query($dbconn, $insert_request);
            $tmp_row = pg_fetch_row($insert_resp);
            $channel_id = $tmp_row[0];

            $insert_subscribe_request = "INSERT INTO subscribe VALUES (${channel_id}, ${user_id})";
            pg_query($dbconn, $insert_subscribe_request);
        }

        return $channel_name;
    }
?>
