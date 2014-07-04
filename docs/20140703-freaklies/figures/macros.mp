prologues      := 3;

dimX=2.5cm;
dimY=-1.5cm;

dimC=2pt;

vardef clippathp(expr p, a, b) =
	save s, t, r;

	numeric s;
	numeric t;
	path r;

	(whatever, t1) = a intersectiontimes p;
	(whatever, t2) = b intersectiontimes (reverse p);

	subpath (t1, length(p) - t2) of p
enddef;

vardef clippath(expr p, a, b) =
	clippathp(p, bbox(a), bbox(b))
enddef;

def midpoint(expr p) = point 0.5 of p enddef;

vardef largerbbox(expr p) = 
	save q, z;
	path q;
	pair z[];

	q = bbox p;

	z1 = ulcorner q shifted (-3mm, 1mm);
	z2 = urcorner q shifted (3mm, 1mm);
	z3 = lrcorner q shifted (3mm, -1mm);
	z4 = llcorner q shifted (-3mm, -1mm);

	z1--z2--z3--z4--cycle
enddef;

color greenColor, blueColor, redColor, orangeColor, greyColor;

greenColor := (0, 0.5, 0);
blueColor := (0, 0, 0.5);
redColor := (0.5, 0, 0);
orangeColor := (1, 0.5, 0);
greyColor := (0.5, 0.5, 0.5);
