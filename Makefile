init :
	cordova platform add android 
	cordova platform add browser
	npm install font-awesome 
	npm install vue

build :
	cordova build android --release
	find platforms -name "*.apk" | xargs -I f du -h f

run :
	cordova run browser -- --live-reload

