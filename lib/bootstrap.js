module.exports = function(CDN,ROOT,BUILD,manifest,PROJECT_DEV,cb) {
	var fs = require('fs');
	var path = require('path');
	var htmlparser = require('htmlparser2');
	var Request = require('request');
	
	var util = require('./util');
	
	// make Settings
	function do_settings(cb) {
		Settings= {
			NAMESPACE: manifest.namespace,
			TITLE: manifest.title,
			DESCRIPTION: manifest.description,
			COPYRIGHT: manifest.copyright,
			TYPE: manifest.type,
			PLATFORM: manifest.targets,
			TYPE: manifest.platform,
			LANGS: manifest.langs,
			AUTH: {
				passports: [

				]
				, passport: {}
			}		
		};
		for (var i = 0; i < manifest.auth.length; i++) {
			var t0 = __dirname + path.sep + "auth.template" + path.sep + manifest.auth[i] + ".config";
			if (fs.existsSync(t0)) {
				t0 = JSON.parse(fs.readFileSync(t0, 'utf-8'));
				Settings.AUTH.passports.push(t0.type);
				Settings.AUTH.passport[t0.type] = {
					caption: "PASSPORT_" + manifest.auth[i].toUpperCase()
				};
			}
		};
		var frameworks = [];
		var resources = [];
		for (var i = 0; i < manifest.frameworks.length; i++) {
			var m = manifest.frameworks[i];
			if (m.src) {
				if (m.src.constructor === Array) {
					for (var zz = 0; zz < m.src.length; zz++) {
						var src = m.src[zz].replace(/{version}/g, m.version);
						src = src.replace(/{theme}/g, m.theme);
						src = src.replace(/{style}/g, m.style);
						frameworks.push(src);
					}
				}
				else {
					var src = m.src.replace(/{version}/g, m.version);
					src = src.replace(/{theme}/g, m.theme);
					src = src.replace(/{style}/g, m.style);
					frameworks.push(src);
				}
			};
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
		Settings.FRAMEWORKS = frameworks;
		Settings.RESOURCES = resources;
		if (manifest.platform == "desktop") {
			Settings.RESOURCES.push(CDN + "/omneedia/res/webapp.css");
			Settings.RESOURCES.push("Contents/Resources/webapp.css");
		};
		if (manifest.platform == "mobile") {
			Settings.RESOURCES.push(CDN + "/omneedia/res/mobi.css");
			Settings.RESOURCES.push("Contents/Resources/mobi.css");
		};
		if (manifest.libraries) Settings.LIBRARIES = manifest.libraries;
		else Settings.LIBRARIES = [];

		fs.readFile(__dirname + require('path').sep + 'omneedia.modules', function(e,r) {
			if (e) {
				util.error(ROOT,"OMNEEDIA_MODULES_NOT_FOUND");
				return false;
			};
			try {
				var SETMODULES = JSON.parse(r.toString('utf-8'));
			} catch(e) {
				util.error(ROOT,"OMNEEDIA_MODULES_UNREADABLE")
			};
			for (var i = 0; i < manifest.frameworks.length; i++) {
				if (manifest.frameworks[i].name == "EXTJS") {
					var _framework_version = manifest.frameworks[i].version.split('.')[0] + '.x';
					var _framework_theme = manifest.frameworks[i].theme;
				}
			};	

			// we load omneedia.modules

			Settings.PATHS = {
				"Contents": "Contents/Application/app"
				, "Culture": "Contents/Culture"
				, "omneedia": CDN + "/omneedia"
				, "Ext": CDN + "/ext/" + _framework_version + '/' + _framework_theme
				, "Ext.ux": CDN + "/ext/ux/" + _framework_version
				, "Ext.plugin": CDN + "/ext/plugin/" + _framework_version
				, "Ext.util": CDN + "/ext/util/" + _framework_version
				, "Lib": "Contents/Application/app/libraries"
			};
			// new way to manipulate css ux
			for (var i = 0; i < manifest.modules.length; i++) {
				var module = manifest.modules[i];
				//get directory of module
				for (var el in Settings.PATHS) {
					if (module.indexOf(el) > -1) var dir_module = Settings.PATHS[el] + '/' + module + '/';
				};
				if (dir_module) {
					dir_module = dir_module.replace('/ux/', '/res/') + _framework_theme + '.css';
					Settings.RESOURCES.push(dir_module);
				};
			};		

			Settings.CONTROLLERS = [];
			for (var i = 0; i < manifest.controllers.length; i++) Settings.CONTROLLERS.push(manifest.controllers[i]);
			Settings.MODULES = SETMODULES['*'];
			Settings.LIBRARIES = [];
			if (manifest.libraries)
				for (var i = 0; i < manifest.libraries.length; i++) Settings.LIBRARIES.push(manifest.libraries[i]);
			if (manifest.platform == "desktop") {
				for (var i = 0; i < SETMODULES.desktop.length; i++) {
					Settings.MODULES.push(SETMODULES.desktop[i]);
				}
			};
			if (manifest.platform == "mobile") {
				for (var i = 0; i < SETMODULES.mobile.length; i++) {
					Settings.MODULES.push(SETMODULES.mobile[i]);
				}
			};
			for (var i = 0; i < manifest.modules.length; i++) Settings.MODULES.push(manifest.modules[i]);
			Settings.AUTHORS = [];
			Settings.API = [];
			Settings.API.push('__QUERY__');
			for (var i = 0; i < manifest.api.length; i++) Settings.API.push(manifest.api[i]);
			Settings.AUTHORS.push({
				role: "creator"
				, name: manifest.author.name
				, mail: manifest.author.mail
				, twitter: manifest.author.twitter
				, web: manifest.author.web
				, github: manifest.author.github
			});		
			for (var el in manifest.team) {
				var tabx = manifest.team[el];
				var role = el;
				for (var i = 0; i < tabx.length; i++) {
					Settings.AUTHORS.push({
						role: role
						, name: tabx[i].name
						, mail: tabx[i].mail
						, twitter: tabx[i].twitter
						, web: tabx[i].web
						, github: tabx[i].github
					});
				};
			};
			Settings.VERSION = manifest.version;
			Settings.BUILD = manifest.build;
			Settings.CDN = CDN;
			if (manifest.blur) Settings.blur = manifest.blur;
			else Settings.blur = 1;		
			/* REMOTES
			try {
				if (MSettings) {
					if (MSettings.remote) {
						if (MSettings.remote.auth) {
							Settings.REMOTE_AUTH = MSettings.remote.auth;
						}
						if (MSettings.remote.api) {
							Settings.REMOTE_API = MSettings.remote.api;
						}
					};
				};
			}
			catch (e) {};

			*/

			cb(Settings);

		});		
	};
	
	function do_bootstrap(cb) {
		var BOOTSTRAP_FILES = [];
		console.log('- Building bootstrap');
		function download(bootstraps,i, RESULT , callback) {
			if (!bootstraps[i]) return callback(RESULT);
			console.log('	- loading '+bootstraps[i].src);
			var o=bootstraps[i];
			if (o.type == "local") {
				fs.readFile(o.src,function(e,r) {
					if (e) util.error('SCRIPT_NOT_FOUND');
					var text=r.toString('utf-8');
					if (o.src.indexOf('Settings.js') > -1) {
						try {
							var settings=JSON.parse(text);
							var extend = require('util')._extend;
							var _JSON = extend({}, settings);
							delete(_JSON.FRAMEWORKS);
							delete(_JSON.LIBRARIES);
							delete(_JSON.RESOURCES);
							delete(_JSON.PLUGINS);
							delete(_JSON.SIGN);
							var text = "Settings=" + JSON.stringify(_JSON) + ';var __SOCKET__=';
						} catch(e) {
							util.error('SETTINGS_MISMATCHED');
						};
					};
					RESULT.push(text);
					download(bootstraps,i+1, RESULT , callback)
				});
			}
			else {
				Request({
					url: o.src
					, encoding: null
				}, function (err, res, body) {
					try {
						RESULT.push(body.toString());
						download(bootstraps,i+1, RESULT , callback);
					}
					catch (ex) {
						console.log(ex);
						util.error('SCRIPT_NOT_FOUND');
					}
				});
			};
		};
		fs.readFile(ROOT + path.sep + "src" + path.sep + "index.html",function(e,r) {
			if (e) util.error("CAN'T_ACCESS_INDEX.HTML");
			function onOpenTAG(name,attribs) {
				if (name === "script" && attribs.type === "text/javascript") {
					if (attribs.src.indexOf('http')!=-1) {
						if (attribs.src.indexOf('require') == -1) BOOTSTRAP_FILES.push({
							type: 'remote'
							, src: attribs.src
						});
					} else {
						if (attribs.src != "Contents/Application/app.js") BOOTSTRAP_FILES.push({
							type: 'local'
							, src: ROOT + path.sep + 'src' + path.sep + attribs.src
						});
					};
				}	
			};
			function onCloseTAG(tagname) {
				if (tagname === "html") {
					BOOTSTRAP_FILES.unshift({
						type: "local"
						, src: PROJECT_DEV + path.sep + "Settings.js"
					});
					BOOTSTRAP_FILES.push({
						type: "remote"
						, src: "https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.5/socket.io.js"
					});
					BOOTSTRAP_FILES.push({
						type: "remote"
						, src: "http://cdn.omneedia.com/public/requirejs/require.js"
					});
					for (var i = 0; i < Settings.FRAMEWORKS.length; i++) {
						if (!fs.existsSync(ROOT + path.sep + 'src' + path.sep + Settings.FRAMEWORKS[i])) {
							BOOTSTRAP_FILES.push({
								type: 'remote'
								, src: Settings.FRAMEWORKS[i]
							});
						}
						else {
							BOOTSTRAP_FILES.push({
								type: 'local'
								, src: ROOT + path.sep + 'src' + path.sep + Settings.FRAMEWORKS[i]
							});
						};
					};
					download(BOOTSTRAP_FILES,0,[],function(results) {
						
						console.log('- Packaging bootstrap cache');
						var bootstrap = results.join('\n');	
						fs.writeFile(PROJECT_DEV+path.sep+'bootstrap.cache',bootstrap,function() {
							cb();
						});
				
					});
				}
			};
			var parser = new htmlparser.Parser({
				onopentag: onOpenTAG,
				onclosetag: onCloseTAG
			});
			var html=r.toString('utf-8');
			parser.write(html);
			parser.end();
		});		
	};
	
	do_settings(function(Settings) {
		fs.writeFile(PROJECT_DEV+path.sep+"Settings.js",JSON.stringify(Settings),function() {
			do_bootstrap(function() {
				//console.log('done.');
				cb(Settings);
			});	
		});
	});
	
};