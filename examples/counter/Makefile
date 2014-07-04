LJS=../../node_modules/.bin/ljs

all : README.md bacon.md

README.md : counter.js
	$(LJS) -o README.md counter.js
	
bacon.md : counter-bacon.js
	$(LJS) -o bacon.md counter-bacon.js
