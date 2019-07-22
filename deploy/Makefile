PWD := $(shell pwd)

all : ./docker-compose.yml
	docker-compose build 

run:
	docker-compose up

test:
	docker run \
	    -it \
	    --net host \
	    -v $(PWD)/..:/srv/www/htdocs/hippo \
	    dilawars/hippo $(CMD)
