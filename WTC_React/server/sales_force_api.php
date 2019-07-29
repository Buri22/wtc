<?php 

class SalesForceAPI {
    // public $aMemberVar = 'aMemberVar Member Variable';
    // public $aFuncName = 'aMemberFunc'; 
    private $version = 'v46.0';
    private $instance_url = '';
    private $access_token = '';
    
    function connect($client_id, $client_secret, $username, $password)
    {
        $url = 'https://login.salesforce.com/services/oauth2/token';
        $fields = array(
            'grant_type'    => 'password',
            'client_id'     => $client_id,
            'client_secret' => $client_secret,
            'username'      => $username,
            'password'      => $password
        );
    
        $fields_string = http_build_query($fields);
    
        $ch = curl_init();
        curl_setopt($ch,CURLOPT_URL, $url);
        curl_setopt($ch,CURLOPT_POST, count($fields));
        curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
        curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
    
        $result = curl_exec($ch);
        curl_close($ch);
            
        $connection = json_decode($result);
            
        if($connection != null)
        {
            $this->instance_url = $connection->instance_url;
            $this->access_token = $connection->access_token;
            //return $connection;
        }
        else {
            // TODO: Handle connectToSF errors
            //return false;
        }
    }

    function basicRequest($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Authorization: Bearer ' . $this->access_token ));

        // Execute post
        $result = curl_exec($ch);
        curl_close($ch);

        return json_decode($result);
    }

    function edit($sobject, $id, $data) {
        // Create url to edit data in SF
        //$url = $this->instance_url . '/services/data/' . $this->version . '/sobjects/' . $sobject . '/' . $id;
        $url = implode('/', array($this->instance_url, 'services/data', $this->version, 'sobjects', $sobject, $id));
        //$data = array("FirstName" => "Bertha2");                                                                    
        $data_string = json_encode($data);
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array( 
            'Authorization: Bearer ' . $this->access_token,
            'Content-Type: application/json',
            'Content-Length: ' . strlen($data_string)
        ));
    
        // Execute post
        $result = curl_exec($ch);
        curl_close($ch);
        $response = json_decode($result);
    
        return $response;
    }

    function search($seach_request) {
        // Create url to search data in SF - SOSL - FIND {Test*}
        $url = implode('/', array($this->instance_url, 'services/data', $this->version, 'search/?q=' . urlencode($seach_request)));
        
        return $this->basicRequest($url, $this->access_token);
    }

    function query($query_request) {
        // Create url to query data from SF - SOQL - SELECT Id, Name FROM TimeRecord__c
        $url = implode('/', array($this->instance_url, 'services/data', $this->version, 'query/?q=' . str_replace(' ', '+', $query_request)));

        return $this->basicRequest($url, $this->access_token);
    }
} 

?>