
var j = document.createElement('script');
j.src = chrome.extension.getURL('../assets/jquery-1.10.2.min.js');
(document.head || document.documentElement).appendChild(j);

var g = document.createElement('script');
g.src = chrome.extension.getURL('../assets/gmail.js');
(document.head || document.documentElement).appendChild(g);

var d = document.createElement('script');
d.src = chrome.extension.getURL('../assets/md5.js');
(document.head || document.documentElement).appendChild(d);

var p = document.createElement('script');
p.src = chrome.extension.getURL('../assets/phpcrypt.js');
(document.head || document.documentElement).appendChild(p);

var z = document.createElement('script');
z.src = chrome.extension.getURL('../assets/pako.js');
(document.head || document.documentElement).appendChild(z);

var c = document.createElement('script');
c.src = chrome.extension.getURL('../assets/crc32.js');
(document.head || document.documentElement).appendChild(c);

var s = document.createElement('script');
s.src = chrome.extension.getURL('../assets/mautic.js');
(document.head || document.documentElement).appendChild(s);

var l = document.createElement('link');
l.href = chrome.extension.getURL('../assets/mautic.css');
l.rel  = 'stylesheet';
l.type = 'text/css';
(document.head || document.documentElement).appendChild(l);

function mytrim(str){
	if (typeof str !== 'string') return str;
	return str.replace(/\/*$/, '');
}

// Get Mautic data from storage
kango.invokeAsync('kango.storage.getItem', 'url', function(url) {
	if (typeof(Storage) !== "undefined") {
		localStorage.mautic_url = mytrim(url);
	    localStorage.mautic_secret = kango.storage.getItem('secret');
	}
	
	// var fullURL = chrome.extension.getURL("icons/icon32.png");
	// console.log(fullURL);

	// var info = kango.getExtensionInfo();
	// var bn = kango.browser.getName(); // chrome, firefox, safari, ie
	// if (bn === "chrome") {
	// 	var ext_id = info.id || undefined;
	// 	var ext_path = "chrome-extension://__MSG_@@" + ext_id + "__/";
	// 	console.log(ext_path);
	// } else if (bn === 'firefox') {
	// 	var data = require('self').data;
	// 	console.log(data.url('somefile.js')); // prints the resource uri to the file.
	// }

});

