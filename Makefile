KEYSTORE:=$(HOME)/Work/APPS/KeyStore/dilawar.jks

all : browser

create:
	cordova create . com.dilawar.hippo Hippo \
	    --template cordova-template-framework7-vue-webpack

init_android:
	cordova platform add android  || echo "Failed to add android platform"
	make init

init:
	mkdir -p www
	cordova platform add browser || echo "Failed to add browser"
	cordova plugin add cordova-plugin-inappbrowser || echo "A"
	cordova plugin add cordova-plugin-file
	#cordova plugin add cordova-plugin-browsersync || echo "B"
	#cordova plugin add https://github.com/dilawar/cordova-plugin-background-geolocation --save 
	cordova plugin add cordova-plugin-local-notification --save || echo "D"
	cordova plugin add cordova-plugin-dialogs --save || echo "E"
	cordova plugin add cordova-plugin-firebase-messaging --save 
	cordova plugin add cordova-support-google-services --save 
	cordova plugin add cordova-plugin-whitelist --save
	# https://github.com/arnesson/cordova-plugin-firebase/issues/1083#issuecomment-503650114 
	cordova plugin add cordova-plugin-androidx || echo "F"
	cordova plugin add cordova-plugin-androidx || echo "F"
	cordova plugin add cordova-plugin-androidx-adapter || echo "F"
	cordova plugin add cordova-android-play-services-gradle-release || echo "F"
	cordova plugin add cordova-android-firebase-gradle-release || echo "F"
	cordova plugin add cordova-plugin-splashscreen || echo "SplashScreen failed"
	npm install

browser:
	cordova build --release browser && rsync -azv www/ /var/www/html/hippo/
	cd /var/www/html/hippo/v1 && git pull origin master 
	# sudo chown -R apache:root /var/www/html/hippo/ 

build : 
	@cordova run android 

apk: 
	mkdir -p www
	cordova build android --release \
	    -- --keystore=$(KEYSTORE) \
	    --storePassword=$(KEYSTORE_PASSWORD) \
	    --alias=dilawar \
	    --password=$(KEYSTORE_PASSWORD)
	find platforms -name "*.apk" | xargs -I f du -h f

run:
	cordova run browser -- --live-reload 

upload :
	cordova run android

tiddly:
	tiddlywiki wiki --build index
	mv wiki/output/index.html docs/index.html


.PHONY:  tiddly upload run apk browser
