FIGURES:=data-events

all : $(FIGURES:%=%.mps) $(FIGURES:%=%.svg)

MPOST=mpost
SVGPARAMS=-s outputformat='"svg"' -s outputtemplate='"%j.svg"'
MPSPARAMS=-s outputformat='"mps"' -s outputtemplate='"%j.mps"'

%.mps : %.mp macros.mp
	$(MPOST) $(MPSPARAMS) $<

%.svg : %.mp macros.mp
	$(MPOST) $(SVGPARAMS) $<
