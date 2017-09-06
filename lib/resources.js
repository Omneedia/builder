module.exports = function(CDN,ROOT,BUILD,manifest,PROJECT_DEV,Settings,cb) {
	var fs = require('fs');
	var path = require('path');
	var request = require('request');
	var IM = require('imagemagick');
	var UglifyCSS = require("uglifycss");
	//var Request = request.defaults({'proxy':'http://localproxy.com'})
	var Request = request.defaults({});
	var util = require('./util');
	var shortid = require('shortid');
	
	var result = [];
	var CSS = [];
				
	console.log('- Building resources');
	
	var resources = [];
	
	function getMIME(filename) {
		if (filename.indexOf('.gif')>-1) return "image/gif";
		if (filename.indexOf('.jpg')>-1) return "image/jpeg";
		if (filename.indexOf('.png')>-1) return "image/png";
	};
	function convert(GP,i,cb) {
		if (!GP[i]) return cb();
		var cmd=[
			GP[i].in
		];
		var args=GP[i].cmd.split(' ');
		for (var z=0;z<args.length;z++) cmd.push(args[z]);
		cmd.push(GP[i].out);
		IM.convert(cmd, function() {
			convert(GP,i+1,cb);	
		});
	};
	function logoApp(cb) {
		var GRAPHICS = [];
		if (manifest.platform == "desktop") {
			GRAPHICS.push({
				in: ROOT + path.sep + manifest.icon.file,
				out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'favicon.ico',
				cmd: '-bordercolor white -border 0 -resize x16 -gravity center -background transparent -flatten -colors 256'
			});
			GRAPHICS.push({
				in: ROOT + path.sep + manifest.splashscreen.file,
				out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'startup' + path.sep + 'logo.png',
				cmd: '-resize 256x256' 
			});
			GRAPHICS.push({
				in: ROOT + path.sep + manifest.icon.file,
				out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'webapp' + path.sep + 'ico.png',
				cmd: '-resize x16' 
			});			
			convert(GRAPHICS,0,cb);
		};
		if (manifest.platform == "mobile") {
			GRAPHICS.push({
				in: ROOT + path.sep + manifest.splashscreen.file,
				out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'startup' + path.sep + '640x920.png',
				cmd: '-gravity center -background "'+ROOT + path.sep + manifest.splashscreen.background+'" -resize 510 -extent 640x920'
			});
			GRAPHICS.push({
				in: ROOT + path.sep + manifest.splashscreen.file,
				out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'startup' + path.sep + '640x1096.png',
				cmd: '-gravity center -background "'+ROOT + path.sep + manifest.splashscreen.background+'" -resize 510 -extent 640x1096'
			});
			GRAPHICS.push({
				in: ROOT + path.sep + manifest.splashscreen.file,
				out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'startup' + path.sep + 'default.png',
				cmd: '-gravity center -background "'+ROOT + path.sep + manifest.splashscreen.background+'" -resize 320x460 -extent 320x460'
			});
			GRAPHICS.push({
				in: ROOT + path.sep + manifest.splashscreen.file,
				out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'startup' + path.sep + '768x1004.png',
				cmd: '-gravity center -background "'+ROOT + path.sep + manifest.splashscreen.background+'" -resize 510 -extent 768x1004'
			});
			GRAPHICS.push({
				in: ROOT + path.sep + manifest.splashscreen.file,
				out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'startup' + path.sep + '748x1024.png',
				cmd: '-gravity center -background "'+ROOT + path.sep + manifest.splashscreen.background+'" -resize 510 -extent 748x1024'
			});
			GRAPHICS.push({
				in: ROOT + path.sep + manifest.splashscreen.file,
				out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'startup' + path.sep + '1496x2048.png',
				cmd: '-gravity center -background "'+ROOT + path.sep + manifest.splashscreen.background+'" -resize 510 -extent 1496x2048'
			});
			GRAPHICS.push({
				in: ROOT + path.sep + manifest.splashscreen.file,
				out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'startup' + path.sep + '1536x2008.png',
				cmd: '-gravity center -background "'+ROOT + path.sep + manifest.splashscreen.background+'" -resize 510 -extent 1536x2008'
			});
			GRAPHICS.push({
				in: ROOT + path.sep + manifest.splashscreen.file,
				out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'startup' + path.sep + '2048x1496.png',
				cmd: '-gravity center -background "'+ROOT + path.sep + manifest.splashscreen.background+'" -resize 510 -extent 2048x1496'
			});
			GRAPHICS.push({
				in: ROOT + path.sep + manifest.splashscreen.file,
				out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'startup' + path.sep + 'logo.png',
				cmd: '-resize 256x256'
			});
			fs.mkdir(ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'icons',function() {
					GRAPHICS.push({
						in: ROOT + path.sep + manifest.icon.file,
						out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'icons' + path.sep + 'icon.png',
						cmd: '-flatten -resize 57x57 -background "'+manifest.icon.background+'"'
					});	
					GRAPHICS.push({
						in: ROOT + path.sep + manifest.icon.file,
						out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'icons' + path.sep + 'icon@72.png',
						cmd: '-flatten -resize 72x72 -background "'+manifest.icon.background+'"'
					});
					GRAPHICS.push({
						in: ROOT + path.sep + manifest.icon.file,
						out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'icons' + path.sep + 'icon@114.png',
						cmd: '-flatten -resize 114x114 -background "'+manifest.icon.background+'"'
					});					
					GRAPHICS.push({
						in: ROOT + path.sep + manifest.icon.file,
						out: ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'icons' + path.sep + 'icon@144.png',
						cmd: '-flatten -resize 144x144 -background "'+manifest.icon.background+'"'
					});
					convert(GRAPHICS,0,cb);
			});			
		}
	};	
	function loadBase64Image(o,i,cb,arr) {
		if (!arr) var arr=[];
		if (!o[i]) return cb(arr);
		if (o[i]=='-1') {
			arr.push('-1');
			loadBase64Image(o,i+1,cb,arr);
			return;
		};
		if (o[i].indexOf('http')==-1)
		{
			fs.readFile(ROOT+path.sep+'src'+path.sep+o[i],function(e,body) {
				if (body) {
					var base64prefix = 'data:' + getMIME(o[i]) + ';base64,'
						, image = body.toString('base64');
						arr.push(base64prefix + image);					
				} else {
					var str = "	! NOT FOUND: " + o[i];
					//console.log(str);					
					arr.push("");
				};
				loadBase64Image(o,i+1,cb,arr);
			});
		} else {
			Request({
				url: o[i]
				, encoding: null
				, gzip: true
			}, function (err, res, body) {
				if (!err && res.statusCode == 200) {
					// So as encoding set to null then request body became Buffer object
					var base64prefix = 'data:' + res.headers['content-type'] + ';base64,'
						, image = body.toString('base64');
						arr.push(base64prefix + image);
				}
				else {
					var str = "	! NOT FOUND: " + o[i];
					//console.log(str);
					arr.push("");
				}
				loadBase64Image(o,i+1,cb,arr);
			});	
		}
	};
	
	function compileCSS(body,cb,url) {
		console.log('	- processing '+url);

		// remote content
		var durl = url.lastIndexOf('/');
		durl = url.substr(0, durl);
		var result = body.split('url(');
		var o = [];
		o[0] = "-1";
		for (var i = 1; i < result.length; i++) {
			var tt = result[i].indexOf(')');
			var test = result[i].substr(0, tt);
			var type = test.lastIndexOf('.');
			var type = test.substr(type + 1, test.length).toLowerCase();
			if ((type == "gif") || (type == "jpg") || (type == "png")) {
				o.push(durl + '/' + test);
			}
			else o.push("-1");
		};		
		loadBase64Image(o,0,function(r) {
			for (var i = 0; i < r.length; i++) {
				var element = r[i];
				if (element != -1) {
				var tt = result[i].indexOf(')');
				result[i] = element + result[i].substr(tt, result[i].length);
				}
			};
			result = result.join('url(');
			CSS.push(result);
			cb();	
		});

	};
	
	function getCSS(i,cb) {
		if (!resources[i]) return cb();
		if (resources[i].indexOf('http')>-1) {
			// remote CSS
			Request({
				url: resources[i], 
				encoding: null
			}, function (err, res, body) {
				if (err) util.error('REMOTE_CSS_NOT_FOUND');
				compileCSS(body.toString('utf-8'),function() {
					getCSS(i+1,cb);	
				},resources[i]);
			})
		} else {
			// local CSS
			fs.readFile(ROOT+path.sep+'src'+path.sep+resources[i],function(e,r) {
				if (e) util.error('LOCAL_CSS_NOT_FOUND');
				compileCSS(r.toString('utf-8'),function() {
					getCSS(i+1,cb);	
				},resources[i]);
			});
		}
	};
	
	fs.readFile(ROOT+path.sep+'app.manifest',function(e,manifest) {
		if (e) util.error('MANIFEST_NOT_FOUND');
		manifest=manifest.toString('utf-8');
		try {
			manifest=JSON.parse(manifest);
		} catch(e) {
			util.error('MANIFEST_NOT_READABLE');
		};
		for (var i = 0; i < manifest.frameworks.length; i++) {
			var m = manifest.frameworks[i];
			if (m.res) {
				if (m.res.constructor === Array) {
					for (var zz = 0; zz < m.res.length; zz++) {
						var res = m.res[zz].replace(/{version}/g, m.version);
						res = res.replace(/{theme}/g, m.theme);
						res = res.replace(/{style}/g, m.style);
						resources.push(res);
					}
				}
				else {
					var res = m.res.replace(/{version}/g, m.version);
					res = res.replace(/{theme}/g, m.theme);
					res = res.replace(/{style}/g, m.style);
					resources.push(res);
				}
			};
		};
		if (manifest.platform == "desktop") {
			resources.push(CDN + "/omneedia/res/webapp.css");
			resources.push("Contents/Resources/webapp.css");
		};
		if (manifest.platform == "mobile") {
			resources.push(CDN + "/omneedia/res/mobi.css");
			resources.push("Contents/Resources/mobi.css");
		};
		for (var i = 0; i < manifest.frameworks.length; i++) {
			if (manifest.frameworks[i].name == "EXTJS") {
				var _framework_version = manifest.frameworks[i].version.split('.')[0] + '.x';
				var _framework_theme = manifest.frameworks[i].theme;
			}
		};		
		for (var i = 0; i < manifest.modules.length; i++) {
			var module = manifest.modules[i];
			//get directory of module
			for (var el in Settings.PATHS) {
				if (module.indexOf(el) > -1) var dir_module = Settings.PATHS[el] + '/' + module + '/';
			};
			if (dir_module) {
				dir_module = dir_module.replace('/ux/', '/res/') + _framework_theme + '.css';
				resources.push(dir_module);
			};
		};	
		fs.mkdir(ROOT + path.sep + 'src' + path.sep + 'Contents' + path.sep + 'Resources' + path.sep + 'startup',function() {
			logoApp(function() {
				getCSS(0,function() {
					console.log('- Bundle Resources');
					CSS = UglifyCSS.processString(CSS.join('\n'));
					fs.writeFile(BUILD.www + path.sep + 'Contents' + path.sep + 'Resources.css',CSS,cb);
				});				
			})		
		});
	});
	
}