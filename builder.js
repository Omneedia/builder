/**
Omneedia Builder
**/

var shortid = require('shortid');
var fs = require('fs');
var path = require('path');

// lib

// ClientSide //
var clean = require('./lib/clean');
var init = require('./lib/init');
var bootstrap = require('./lib/bootstrap');
var libraries = require('./lib/libraries');
var services = require('./lib/services');
var mvc = require('./lib/mvc');
var i18n = require('./lib/i18n');
var bundle = require('./lib/bundle');
var build_index = require('./lib/build_index');

// Resources //
var resources = require('./lib/resources');

// ServerSide //

var api = require('./lib/api');
var sys = require('./lib/sys');
var auth = require('./lib/auth');
var json = require('./lib/json');

// Docker //

var dockerfile = require('./lib/dockerfile');

// config Dockerfile

var DCK = {
	HEAD: [
		"FROM ubuntu:16.04",
		"ENV MYSQL_PASSWORD ROOT",
		"ENV SSH_USER term",
		"ENV SSH_PASSWORD term",
		"ENV MY_OLD_PASSWORD ROOT",
		"RUN apt-get update && apt-get install -y --no-install-recommends apt-utils",
		"RUN wget -qO- https://deb.nodesource.com/setup_8.x | bash -"
	],
	APT: [
		"RUN apt-get update && apt-get install -y",
		"curl",
		"python",
		"make",
		"g++",
		"npm",
		"nodejs",
		"apt-transport-https",
		"build-essential",
		"ca-certificates",
		"curl",
		"gcc",
		"git",
		"ghostscript", 
		"imagemagick",
		"make",
		"sudo",
		"wget",
		"vim",
		"glances"		
	],
	APT_END: "&& rm -rf /var/lib/apt/lists/* && apt-get -y autoclean",
	DCK_FOOT: [
		"EXPOSE 3000",
		"ENTRYPOINT node worker && /bin/bash"	
	]
}

////////////////////////

var CDN = "http://cdn.omneedia.com";
var TPL_PROD="https://github.com/Omneedia/tpl.omneedia.production";

function build(name,cb) {
	var UID = shortid.generate();
	var BUILD = {
		base: __dirname+path.sep+"var"+path.sep+UID+".app",
		api: __dirname+path.sep+"var"+path.sep+UID+".app"+path.sep+"Contents"+path.sep+"api",
		auth: __dirname+path.sep+"var"+path.sep+UID+".app"+path.sep+"Contents"+path.sep+"auth",
		etc: __dirname+path.sep+"var"+path.sep+UID+".app"+path.sep+"Contents"+path.sep+"etc",
		var: __dirname+path.sep+"var"+path.sep+UID+".app"+path.sep+"Contents"+path.sep+"var",
		www: __dirname+path.sep+"var"+path.sep+UID+".app"+path.sep+"Contents"+path.sep+"www"		
	};
	var ROOT = __dirname+path.sep+"var"+path.sep+UID;
	
	var PROJECT_DEV = ROOT + path.sep + "dev";
	
	var Manifest = ROOT+path.sep+"app.manifest";
	
	init(ROOT,BUILD,Manifest,TPL_PROD,name,function(Manifest) {
		
		// Client
		bootstrap(CDN,ROOT,BUILD,Manifest,PROJECT_DEV,function(Settings) {
			libraries(CDN,ROOT,BUILD,Manifest,PROJECT_DEV,Settings,function() {
				services(CDN,ROOT,BUILD,Manifest,PROJECT_DEV,Settings,function() {
					mvc(CDN,ROOT,BUILD,Manifest,PROJECT_DEV,Settings,function() {
						i18n(CDN,ROOT,BUILD,Manifest,PROJECT_DEV,Settings,function() {
							bundle(CDN,ROOT,BUILD,Manifest,PROJECT_DEV,Settings,function() {
								resources(CDN,ROOT,BUILD,Manifest,PROJECT_DEV,Settings,function() {
									build_index(CDN,ROOT,BUILD,Manifest,PROJECT_DEV,Settings,function() {
										// ServerSide
										api(CDN,ROOT,BUILD,Manifest,function() {
											sys(CDN,ROOT,BUILD,Manifest,function() {
												auth(CDN,ROOT,BUILD,Manifest,function() {
													json(CDN,ROOT,BUILD,Manifest,function() {
														// Docker
														dockerfile(CDN,ROOT,BUILD,Manifest,DCK,function() {
															
														});
													});	
												});	
											});
										});
									});
								});
							});
						});					
					});
				});					
			});
		});
		
	});

	
};

console.log(' ');

clean(function() {
	console.log('- Cleaned.');
	build('git_http_link',function(e,r) {
		console.log(e);
	});
});