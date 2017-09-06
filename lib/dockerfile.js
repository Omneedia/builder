module.exports = function(CDN,ROOT,BUILD,Manifest,DCK,cb) {
	var fs = require('fs');
	var path = require('path');
	var request = require('request');
	//var Request = request.defaults({'proxy':'http://localproxy.com'})
	var Request = request.defaults({});
	var shortid = require('shortid');
	
	var util = require('./util');
	
	var DOCKERFILE=DCK.HEAD;	
	var paths=[];
	
	console.log('- Processing Dockerfile');
	
	function docker_add(files,i,cb) {
		if (!files[i]) return cb();
		if (files[i].indexOf('registry.json')==-1) {
			var file=files[i].substr(BUILD.base.length,files[i].length);
			file="/opt/"+Manifest.namespace+file;
			var path=file.substr(0,file.lastIndexOf('/'));
			if (paths.indexOf(path)==-1) {
				DOCKERFILE.push('RUN mkdir -p '+path);
				paths.push(path);
			};
			DOCKERFILE.push('ADD '+files[i].substr(BUILD.base.length+1,files[i].length)+' '+file);
			docker_add(files,i+1,cb);
		} else docker_add(files,i+1,cb);
	};
	var aptget=[];
	for (var i=0;i<DCK.APT.length;i++) {
		aptget.push(DCK.APT[i]);
	};
	if (Manifest.apt) {
		for (var i=0;i<Manifest.apt.length;i++) {	
			aptget.push(Manifest.apt[i]);
		}
	};
	DOCKERFILE.push(aptget.join(' ')+DCK.APT_END);
	
	DOCKERFILE.push('RUN ln -s `which nodejs` /usr/bin/node');
	
	// making work directory
	DOCKERFILE.push('RUN mkdir -p /opt/'+Manifest.namespace);
	for (var el in BUILD) {
		if (el=='base') DOCKERFILE.push('RUN mkdir -p /opt/'+Manifest.namespace); 
		else DOCKERFILE.push('RUN mkdir -p /opt/'+Manifest.namespace+'/'+el);
	};
	
	DOCKERFILE.push('ENV PATH "$PATH:/opt/'+Manifest.namespace+'/"');

	// reading BUILD Directory
	util.walk(BUILD.base,function(e,files) {
		docker_add(files,0,function() {	
			
			DOCKERFILE.push("WORKDIR /opt/"+Manifest.namespace+"/Contents");
			DOCKERFILE.push("RUN npm install");
			for (var i=0;i<DCK.DCK_FOOT.length;i++) DOCKERFILE.push(DCK.DCK_FOOT[i]);
			fs.writeFile(BUILD.base+path.sep+'Dockerfile',DOCKERFILE.join('\n'),cb);
		});
	});
	
}