module.exports = function(CDN,ROOT,BUILD,manifest,PROJECT_DEV,Settings,cb) {
	var fs = require('fs');
	var path = require('path');
	var request = require('request');
	//var Request = request.defaults({'proxy':'http://localproxy.com'})
	var Request = request.defaults({});
	var util = require('./util');
	var shortid = require('shortid');
	
	var result = [];
	
	function process_lang(LNG,i,cb) {
		if (!LNG[i]) return cb(result);
		console.log('	- adding ['+LNG[i]+'] to package');
		var src=CDN + "/framework.lang/" + Settings.TYPE + "/ext-lang-" + LNG[i] + ".js";
		Request({
			url: src, encoding: null
		}, function (err, res, body) {
			if (!err) result.push(body);
			fs.readFile(ROOT + path.sep + 'src' + path.sep + "Contents" + path.sep + "Culture" + path.sep + Settings.LANGS[i] + ".js",function(err,body) {
				if (!err) result.push(body.toString('utf-8'));
				process_lang(LNG,i+1,cb);
			});
		})
	};
			
	console.log('- Loading i18n');
	
	process_lang(Settings.LANGS,0,function(result) {
		fs.writeFile(PROJECT_DEV+path.sep+'i18n.pack',result.join('\n'),cb);
	});
	
}