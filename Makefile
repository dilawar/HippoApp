create:
	cordova create . com.dilawar.hippo Hippo \
	    --template cordova-template-framework7-vue-webpack

init:
	cordova platform add android  || echo "Failed to add android platform"
	cordova platform add browser || echo "Failed to add browser"
	npm install font-awesome 
	npm install vue vuex

apk:
	cordova build android --release
	find platforms -name "*.apk" | xargs -I f du -h f

run:
	cordova run browser -- --live-reload

