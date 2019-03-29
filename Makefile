create:
	cordova create . com.dilawar.hippo Hippo \
	    --template cordova-template-framework7-vue-webpack

init:
	cordova platform add android  || echo "Failed to add android platform"
	cordova platform add browser || echo "Failed to add browser"
	npm install 

sign : 
	@cordova run android --release \
	    -- --keystore=~/Work/APPS/KeyStore/ \
	    --storePassword=$(KEYSTORE_PASSWORD) \



apk: 
	cordova build android --release \
	    -- --keystore=~/Work/APPS/AndroidSpecific \
	    --storePassword=$(KEYSTORE_PASSWORD) \
	    --alias=dilawar \
	    --password=$(KEYSTORE_PASSWORD)
	find platforms -name "*.apk" | xargs -I f du -h f

run:
	cordova run browser -- --live-reload

