var request = require('request');
const fs = require('fs');

url = 'https://www.fanfiction.net/tv/Sherlock/?&srt=1&lan=1&r=4&s=2&c1=50137&c2=50136&p=';
page = 1;

getBody();

function getBody() {
	request(url + page, function (error, response, body) {
	  	if (!error && response.statusCode == 200) {
	  		if (body.indexOf("No entries found with current filters") >= 0) {
	  			return;
	  		}
	    	processBody(body);
	    	page++;
	    	getBody();
	  	}
	})
}

function processBody (body) {
	var ids = [];
	var indices = getIndicesOf('href="/s/', body);
	var result = [];
	for (var i = indices.length - 1; i >= 0; i--) {
		var text = body.substring(indices[i]+ 'href="'.length , indices[i] + 30);
		var urlArray = text.split('/');
		if (ids.indexOf(urlArray[2]) < 0) {
			ids.push(urlArray[2]);
			result[i] = "https://www.fanfiction.net/s/" + urlArray[2]  + "\r\n";
		}
	}
	writeUrl(result);
}

function getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}


function writeUrl(urlsArray) {
	var urlsString = urlsArray.join('');
	fs.appendFile('url.txt', urlsString, (err) => {
	 	if (err) throw err;
	 	console.log('The "data to append" was appended to file!');
	});
}
