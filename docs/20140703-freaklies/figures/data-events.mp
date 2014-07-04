input macros;

verbatimtex
%&latex
\documentclass{article}
\begin{document}
etex

dim = 1.5cm;

beginfig(1);

path p;
p = (-dim,0)..(0,-dim)..(dim,0);
fill p{up}..(0,0){-1,-2}..{up}cycle;
draw p..(0,dim)..cycle;

draw thelabel(btex \textbf{data}  etex, (-.5dim, 0)) withcolor .0white;
draw thelabel(btex \textbf{events} etex, (.5dim, 0)) withcolor white;

endfig;

verbatimtex
\end{document}
etex
end
