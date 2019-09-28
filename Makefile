KEYSTORE:=$(HOME)/Work/APPS/KeyStore/dilawar.jks

all : run

create:
	cordova create . com.dilawar.hippo Hippo \
	    --template cordova-template-framework7-vue-webpack

init:
	mkdir -p www
	cordova platform add android  || echo "Failed to add android platform"
	cordova platform add browser || echo "Failed to add browser"
	cordova plugin add cordova-plugin-inappbrowser || echo "A"
	cordova plugin add cordova-plugin-browsersync || echo "B"
	cordova plugin add https://github.com/dilawar/cordova-plugin-background-geolocation --save 
	cordova plugin add cordova-plugin-local-notification --save || echo "D"
	npm install

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
