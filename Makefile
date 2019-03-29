KEYSTORE:=$(HOME)/Work/APPS/KeyStore/dilawar.jks

all : apk

create:
	cordova create . com.dilawar.hippo Hippo \
	    --template cordova-template-framework7-vue-webpack

init:
	cordova platform add android  || echo "Failed to add android platform"
	cordova platform add browser || echo "Failed to add browser"
	npm install 

build : 
	@cordova run android 

apk: 
	cordova build android --release \
	    -- --keystore=$(KEYSTORE) \
	    --storePassword=$(KEYSTORE_PASSWORD) \
	    --alias=dilawar \
	    --password=$(KEYSTORE_PASSWORD)
	find platforms -name "*.apk" | xargs -I f du -h f

run:
	cordova run browser -- --live-reload

