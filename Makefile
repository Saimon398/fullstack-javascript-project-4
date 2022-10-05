install:
	npm ci
test:
	NODE_OPTIONS=--experimental-vm-modules npx jest .
lint:
	npx eslint .
publish:
	npm publish --dry-run
test-coverage:
	npm test -- --coverage --coverageProvider=v8

