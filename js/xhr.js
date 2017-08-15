/*
 * XML HTTP Request object sends AJAX call
 */
function xhr (action, type, url, data, options) {
    options = options || {};
    var request = create_XMLHTTPRequestObject();

    request.open(type, url, true);

    // Define request headers
    if(type === "POST"){
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    request.setRequestHeader("Http-X-Requested-With", "xmlhttprequest");
    request.setRequestHeader("Ajax-Action", action);

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status >= 200 && this.status < 400) {
                options.success && options.success(parse(this.responseText));
            } else {
                options.error && options.error(this.status);
            }
        }
    };

    request.send(data);
}

function create_XMLHTTPRequestObject() {
    if (window.XMLHttpRequest) {
        // Code for IE7+, Firefox, Chrome, Opera, Safari
        return new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
}

function parse(text){
    try {
        return JSON.parse(text);
    } catch(e){
        return text;
    }
}

