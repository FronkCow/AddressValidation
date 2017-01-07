// @Author - Frank Cao
// @Date - 12/23/2016
// @Last Edited - 12/27/2016
// @Desc - A small utility tool that gives a rough idea if a given address is a real location or a false location.
// The program uses basic JS and google's geocoding service API to help parse a user provided input file or line.

// Developer API_Key to google's geocoding service
API_Key = "AIzaSyCUtleKnuTIvbrNoJguvKiSKs8FECGuO1M";

// The format for calls to google's geocoding service is as follows:
callUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=";

//
// Here are some test addresses I used in developing the sample code below, these
// are the same addresses in the sample text file.
// testAddr = "1600 Amphitheatre Parkway, Mountain View, CA";
// testAddrW = "1234 Does Not, Exist Anywhere, Yo";

// disables user input for multiple files if single address is chosen
function singleLogic() {
    var fileData = document.getElementById('_file');
    var usrText = document.getElementById('usr_input');
    if (this.checked) {
        fileData.disabled = false;
        usrText.disabled = true;
    } else {
        fileData.disabled = true;
        usrText.disabled = false;
    }
}

// disables user input for single files if multiple addresses is chosen
function multiLogic() {
    var fileData = document.getElementById('_file');
    var usrText = document.getElementById('usr_input');
    if (this.checked) {
        fileData.disabled = true;
        usrText.disabled = false;
    } else {
        fileData.disabled = false;
        usrText.disabled = true;
    }
}

// formats the call to google's geocoding API
// "rawAddr" is the basic call without information added
// returns the formatted address to be called
function inputParser(rawAddr) {
    var res = rawAddr.split(" ").join("+");
    var parsed = callUrl + res + "&key=" + API_Key;

    return parsed;
}

// main function called from pressing the submit button, handles single vs multi logic
function processFormData() {
    var fileData = document.getElementById('_file');
    if (fileData.disabled === false) {
        readFile(fileData.files[0]);
    } else {
        var rawText = document.getElementById('usr_input');
        var url = inputParser(rawText.value);
        xhrLogic(url, null, null, null, false, null);
    }
}

// reads the sample text file provided by the user, requests API calls at 250 ms intervals 
// "file" is the user uploaded file
function readFile(file) {
    var reader = new FileReader();
    
    reader.onload = function(progressEvent) {
        var locObj = {};

        var lines = this.result.split('\n');
        var counter = 0;

        // setInterval acts as a timed loop, it repeats every 250 ms until all lines have been read
        var i = setInterval(function() {
            console.log(lines[counter]);
            var url = inputParser(lines[counter]);
            console.log(url);
            xhrLogic(url, lines[counter], locObj, lines.length, true, parseData);
            counter++;
            if (counter === lines.length) {
                console.log(counter);
                clearInterval(i);
            }

        }, 250);
    };
    reader.readAsText(file);
}

// downloads the finished result text to the user machine, currently defaults to "result.txt" name
// "text" is the resultant map converted into a string that is fed into the text file
// NOTE - the logic in this function is unique to the creation of a text file, the creation of a CSV file would
// likely require different considerations
function downloadText(text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', 'result.txt'); // sets the resultant file to be named "result.txt"

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
}

// handles the formation and call of googles geocoding service by using XMLHttpRequest
// "url" is the proper address call
// "line" is the key to the locObj map
// "max" is the number of elements in the user input file
// "isFile" is a boolean that determines whether the data should be sent to a file or a html element
// "callback" is the parseData function that is called on completetion of xhrLogic 
function xhrLogic(url, line, locObj, max, isFile, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true); // false for asynchronous
    var data;

    xhr.onload = function(e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // use the below for more info in output file
                // data = xhr.responseText
                data = JSONParse(xhr.responseText);
                if (isFile) {
                    callback(line, data, locObj, max);
                } else {
                    var h = document.createElement("H1");
                    var t = document.createTextNode(xhr.responseText);
                    // use the below for sparse output in html
                    // var t = document.createTextNode(data);
                    h.appendChild(t);
                    document.body.appendChild(h);
                }
            } else {
                console.error(xhr.statusText);
            }
        }
    };
    xhr.onerror = function(e) {
        console.error(xhr.statusText);
    };
    xhr.send(null);
}

// loads locObj with a mapping between "line" to "data" and handles creation of 
// the text string fed to downloadText when finished parsing lines
// "line" is the key to the locObj map
// "data" is the result of the individual xhrLogic calls
// "locObj" is the map object that contains "line"s and "data"s
// "max" is number of total elements in the user input file
function parseData(line, data, locObj, max) {
    locObj[line] = data; 
    if (Object.keys(locObj).length === max) {
        var text = "";
        for (var key in locObj) {
            // logic to build output goes here, if using CSV format, this would change likely
            text += key + "         " + locObj[key] + "\r\n";
        }
        downloadText(text);
    } 
}

// parses the google geocoding response from JSON to a string value containing the status of the
// provided location
// "responseText" is the full response object provided by google's geocoding service API
// returns the status of the provided location
function JSONParse(responseText) {
    var data = responseText;
    var jsonResponse = JSON.parse(data);
    return jsonResponse['status'];
}
