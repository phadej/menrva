BENCHMARKS=diamond

.PHONY : all quick full clean

all : quick

quick : $(BENCHMARKS:%=%.quick.txt)

full : $(BENCHMARKS:%=%.txt)

clean :
	rm -f $(BENCHMARKS:%=%.txt) $(BENCHMARKS:%=%.quick.txt)

%.txt : %.js
	node $< | tee $@

%.quick.txt : %.js
	node $< --quick | tee $@
