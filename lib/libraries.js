module.exports = function(CDN,ROOT,BUILD,manifest,PROJECT_DEV,Settings,cb) {
	var fs = require('fs');
	var path = require('path');
	var Request = require('request');
	var util = require('./util');
	var shortid = require('shortid');
	
	var PATH = {};	
	var pluscode = "";
	
	function download(o,i,callback,PACK) {
		if (!PACK) PACK=[];
		if (!o[i]) return callback(PACK);
		console.log('	- loading '+o[i].src);
		if (o[i].type == "local") {
			fs.readFile(o[i].src,function(e,r) {
				if (e) util.error(ROOT,'SCRIPT_NOT_FOUND');
				PACK.push(r.toString('utf-8'));
				download(o,i+1,callback,PACK);
			});
		}
		else {
			Request({
				url: o[i].src
				, encoding: null
			}, function (err, res, body) {
				try {
					PACK.push(body.toString('utf-8'));
					download(o,i+1,callback,PACK);
				}
				catch (ex) {
					console.log(ex);
					if (ex) util.error(ROOT,'SCRIPT_NOT_FOUND');
				}
			});
		};
	};	
	
	console.log('- Building libraries');
	var app = ROOT + path.sep + "src" + path.sep + "Contents" + path.sep + "Application" + path.sep + "app.js";
	fs.readFile(app, function(e,r) {
		if (e) util.error(ROOT,'APPJS_NOT_FOUND');
		var code=r.toString('utf-8');
		APP_NAMESPACE = code.split('APP_NAMESPACE')[1].split(';')[0];
		pluscode = "APP_NAMESPACE " + APP_NAMESPACE + ";\n";
		APP_NAMESPACE = code.split('LANGS')[1].split(';')[0];
		pluscode += "LANGS " + APP_NAMESPACE + "LANGS;\n";
		for (var el in Settings.PATHS) {
			if (Settings.PATHS[el].indexOf('http')==-1) PATH[el]=ROOT + path.sep + "src" + path.sep + Settings.PATHS[el]; else PATH[el]=Settings.PATHS[el];
		};

		var _require = Settings.MODULES;
		for (var i = 0; i < _require.length; i++) {
			var element = _require[i];
			if (element != "") {
				for (var el in PATH) {
					if (el == element.substr(0, el.length)) {
						var tmp = element.substr(el.length, element.length).split('.');
						var _tmp = "";
						for (var j = 0; j < tmp.length; j++) {
							if (j > 0) _tmp += "/" + tmp[j];
							else _tmp = PATH[el] + tmp[j];
						};
						_require[i] = _tmp + ".js";
					};
					if (el == element.substr(1, el.length)) {
						var tmp = element.substr(el.length + 1, element.length).split('.');
						var _tmp = "";
						for (var j = 0; j < tmp.length; j++) {
							if (j > 0) _tmp += "/" + tmp[j];
							else _tmp = PATH[el] + tmp[j];
						};
						_require[i] = _tmp + ".js";
					};
				}
			}
			else _require.splice(i);
		};
		var require = [];			
		for (var i = 0; i < _require.length; i++) {
			if (_require[i].indexOf('http')>-1) {
				require.push({
					type: "remote"
					, src: _require[i] + "?" + shortid.generate()
				});
			}
			else {
				require.push({
					type: "local"
					, src: _require[i]
				});
			}
		};
		
		download(require,0,function(PACK) {
			console.log('- Packaging library');
			var library = PACK.join('\n');	
			fs.writeFile(PROJECT_DEV+path.sep+'library.pack',pluscode+'\n'+library,function() {
				cb();
			});
		});
	});
	
}