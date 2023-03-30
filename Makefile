export

.PHONY: dev-build dev-start clean

DEV_DC = docker-compose -p casperexplorer-middleware -f docker/docker-compose.dev.yml --env-file ./.env
PROD_DC = docker-compose -f docker/docker-compose.prod.yml --env-file ./.env

dev-build:
	$(DEV_DC) build

dev-start:
	$(DEV_DC) up

prod-build:
	$(PROD_DC) build

prod-start:
	$(PROD_DC) up

clean:
	$(PROD_DC) stop
	$(DEV_DC) stop


middleware-all: middleware-install middleware-audit middleware-lint middleware-test

middleware-install:
	cd nest-app && npm install

middleware-ci-install:
	cd nest-app && npm ci

middleware-audit:
	cd nest-app && npm audit

middleware-lint:
	cd nest-app && npm run lint

middleware-test:
	cd nest-app && npm run test
