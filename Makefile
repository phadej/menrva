all : test

SRC=lib/*.js
TESTSRC=test

DISTDIR=dist
DISTPREFIX=menrva

BUNDLESRC=lib/menrva.js
BUNDLEDST=$(DISTDIR)/$(DISTPREFIX).standalone.js
BUNDLEVAR=menrva

MINSRC=$(BUNDLEDST)
MINDST=$(DISTDIR)/$(DISTPREFIX).min.js
MINMAP=$(DISTDIR)/$(DISTPREFIX).min.js.map

LJSSRC=lib/menrva.js

.PHONY : all test jshint mocha istanbul browserify typify literate dist

BINDIR=node_modules/.bin

MOCHA=$(BINDIR)/_mocha
ISTANBUL=$(BINDIR)/istanbul
JSHINT=$(BINDIR)/jshint
BROWSERIFY=$(BINDIR)/browserify
UGLIFY=$(BINDIR)/uglifyjs
TYPIFY=$(BINDIR)/typify
LJS=$(BINDIR)/ljs
COVERALLS=$(BINDIR)/coveralls

test : jshint mocha istanbul typify

jshint :
	$(JSHINT) $(SRC)

mocha : 
	$(MOCHA) --reporter=spec $(TESTSRC)

istanbul :
	$(ISTANBUL) cover $(MOCHA) $(TESTSRC)
	$(ISTANBUL) check-coverage --statements 100 --branches 100 --functions 100

browserify : $(SRC)
	mkdir -p $(DISTDIR)
	$(BROWSERIFY) -s $(BUNDLEVAR) -o $(BUNDLEDST) $(BUNDLESRC)

uglify : browserify $(SRC)
	mkdir -p $(DISTDIR)
	$(UGLIFY) -o $(MINDST) --source-map $(MINMAP) $(MINSRC)

typify :
	$(TYPIFY) $(MOCHA) $(TESTSRC)

literate :
	$(LJS) -c false -o README.md $(LJSSRC)

coveralls :
	if [ ! -z `node --version | grep v0.10` ]; then cat ./coverage/lcov.info | $(COVERALLS); fi

dist : test uglify literate
	git clean -fdx -e node_modules
