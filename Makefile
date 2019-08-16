KEYSTORE:=$(HOME)/Work/APPS/KeyStore/dilawar.jks

all : run

create:
	cordova create . com.dilawar.hippo Hippo \
	    --template cordova-template-framework7-vue-webpack

init:
	cordova platform add android  || echo "Failed to add android platform"
	cordova platform add browser || echo "Failed to add browser"
	cordova plugin add cordova-plugin-inappbrowser || echo "A"
	cordova plugin add cordova-plugin-mauron85-background-geolocation || echo "B"
	cordova plugin add cordova-plugin-local-notification@0.9.0-beta.2 || echo "D"
	cordova plugin add cordova-plugin-firebase || echo "E"
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
