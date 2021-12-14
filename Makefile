KEYSTORE:=$(HOME)/Work/Apps/KeyStore/dilawar.jks

UID=$(shell id -u)
GID=$(shell id -g)

IMAGENAME="dilawars/hippoapp"

IMAGE:=docker run -it \
	   -v /tmp/.X11-unix:/tmp/.X11-unix \
	   -v $(PWD):/app \
	   --network="host" \
	   -p 8000:8000 \
	   -u $(UID):$(GID) $(IMAGENAME)

CORDOVA:=$(IMAGE) cordova
NPM:=$(IMAGE) npm

all : build_image browser

build_image: Dockerfile.cordova
	docker build -t $(IMAGENAME) --build-arg UID=$(UID) --build-arg GID=$(GID) \
		-f $< .

create:
	$(CORDOVA) create . com.dilawar.hippo Hippo \
	    --template $(CORDOVA)-template-framework7-vue-webpack

init_android:
	$(CORDOVA) platform add android  || echo "Failed to add android platform"
	make init

init:
	mkdir -p www
	$(CORDOVA) platform add browser || echo "Failed to add browser"
	$(CORDOVA) plugin add $(CORDOVA)-plugin-inappbrowser
	$(CORDOVA) plugin add $(CORDOVA)-plugin-file
	$(CORDOVA) plugin add $(CORDOVA)-plugin-local-notification --save
	$(CORDOVA) plugin add $(CORDOVA)-plugin-dialogs --save
	$(CORDOVA) plugin add $(CORDOVA)-plugin-firebase-messaging --save
	$(CORDOVA) plugin add $(CORDOVA)-support-google-services --save
	$(CORDOVA) plugin add $(CORDOVA)-plugin-whitelist --save
	$(CORDOVA) plugin add $(CORDOVA)-plugin-androidx
	$(CORDOVA) plugin add $(CORDOVA)-plugin-androidx
	$(CORDOVA) plugin add $(CORDOVA)-plugin-androidx-adapter
	$(CORDOVA) plugin add $(CORDOVA)-android-play-services-gradle-release
	$(CORDOVA) plugin add $(CORDOVA)-android-firebase-gradle-release
	$(CORDOVA) plugin add $(CORDOVA)-plugin-splashscreen
	$(NPM) install

browser:
	$(CORDOVA) build browser --release -- --webpack.mode=production
	rsync -azv www/ /var/www/html/hippo/
	cd /var/www/html/hippo/v1 && git pull origin master
	# sudo chown -R apache:root /var/www/html/hippo/

build :
	@$(CORDOVA) run android

apk:
	mkdir -p www
	$(CORDOVA) build android --release \
	    -- --keystore=$(KEYSTORE) \
	    --storePassword=$(KEYSTORE_PASSWORD) \
	    --alias=dilawar \
	    --password=$(KEYSTORE_PASSWORD) \
	    --webpack.mode=production
	find platforms -name "*.apk" | xargs -I f du -h f

aab:
	mkdir -p www
	$(CORDOVA) build android --release \
	    -- --keystore=$(KEYSTORE) \
	    --storePassword=$(KEYSTORE_PASSWORD) \
	    --alias=dilawar \
	    --password=$(KEYSTORE_PASSWORD) \
	    --packageType=bundle \
	    --webpack.mode=production
	find platforms -name "*.aab" | xargs -I f du -h f

run:
	$(CORDOVA) run browser -- --live-reload

upload :
	$(CORDOVA) run android

tiddly:
	tiddlywiki wiki --build index
	mv wiki/output/index.html docs/index.html


.PHONY:  tiddly upload run apk browser
