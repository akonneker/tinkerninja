// Explicit display annotations keep the original prose/JSON human-readable.
// Match whole expressions longest-first, so a short ratio cannot consume part
// of an equation. This is not a general plain-text-to-LaTeX converter.
export type MathFragment = { text: string; tex: string };
const tex = String.raw;
export const proseMath: MathFragment[] = [
  { text: 'λ', tex: tex`\lambda` },
  { text: 'k = ρCᴅA/(2m)', tex: tex`k=\frac{\rho C_D A}{2m}` },
  { text: 'y(0) = y′(0) = 0', tex: tex`y(0)=y'(0)=0` },
  {
    text: 'y = [cosh(λx) − 1]/λ',
    tex: tex`y=\frac{\cosh(\lambda x)-1}{\lambda}`,
  },
  { text: 'y = λx²/2', tex: tex`y=\frac{\lambda x^2}{2}` },
  { text: 'y(±1)', tex: tex`y(\pm1)` },
  { text: 'm = 0', tex: tex`m=0` },
  { text: 'm = 1', tex: tex`m=1` },
  { text: '9.81 m/s²', tex: tex`9.81\,\mathrm{m}/\mathrm{s}^2` },
  { text: 'r = a/(1 + e cos t)', tex: tex`r=\frac{a}{1+e\cos t}` },
  { text: 'e = 0', tex: tex`e=0` },
  { text: '0 < e < 1', tex: tex`0<e<1` },
  { text: 'e = 1', tex: tex`e=1` },
  { text: 'e > 1', tex: tex`e>1` },
  { text: 'r = a cos(kt)', tex: tex`r=a\cos(kt)` },
  { text: '2k', tex: tex`2k` },
  { text: 'r = a(1 + k cos t)', tex: tex`r=a(1+k\cos t)` },
  { text: '0 < k ≤ 0.5', tex: tex`0<k\leq\frac12` },
  { text: '0.5 < k < 1', tex: tex`\frac12<k<1` },
  { text: 'k > 1', tex: tex`k>1` },
  { text: 'r = a(t/2π)^p', tex: tex`r=a\left(\frac{t}{2\pi}\right)^p` },
  { text: 'r = a exp(bt)', tex: tex`r=ae^{bt}` },
  { text: 'p = 1/2', tex: tex`p=\frac12` },
  { text: 'p = −1/2', tex: tex`p=-\frac12` },
  { text: 'p = 1', tex: tex`p=1` },
  { text: 'p = −1', tex: tex`p=-1` },
  { text: 'u = t − 10', tex: tex`u=t-10` },
  { text: '(±a, 0)', tex: tex`(\pm a,0)` },
  { text: '(1.2a)²', tex: tex`(1.2a)^2` },
  { text: 'rⁿ = aⁿ cos(nθ)', tex: tex`r^n=a^n\cos(n\theta)` },
  { text: 'n = 1/3', tex: tex`n=\frac13` },
  { text: 'x = r sin u', tex: tex`x=r\sin u` },
  { text: 'y = r cos u', tex: tex`y=r\cos u` },
  { text: 'u=t−10', tex: tex`u=t-10` },
  { text: 'u=t', tex: tex`u=t` },
  { text: 'P₀=(0,0)', tex: tex`P_0=(0,0)` },
  { text: 'P₁=(0,2a)', tex: tex`P_1=(0,2a)` },
  { text: 'P₂=(a,−a)', tex: tex`P_2=(a,-a)` },
  { text: 'P₃=(2a,a)', tex: tex`P_3=(2a,a)` },
  { text: 'R:r = n:1', tex: tex`R:r=n:1` },
  { text: 'd/r = 1 or 2', tex: tex`\frac dr=1\text{ or }2` },
  { text: 'R/r', tex: tex`\frac Rr` },
];
const ordered = [...proseMath].sort((a, b) => b.text.length - a.text.length);
const word = /[\p{L}\p{N}_]/u;
const numericAssignment = /^(d\/r|R|r|k|a) = ([−-]?\d+(?:\.\d+)?|⅓)/;
const numericSymbol = /^(\d+(?:\.\d+)?)(π|a)/;

export function splitMathText(text: string): (string | MathFragment)[] {
  const parts: (string | MathFragment)[] = [];
  let plain = '';
  for (let i = 0; i < text.length;) {
    const boundary = i === 0 || !word.test(text[i - 1]);
    let match = boundary
      ? ordered.find(
          (entry) =>
            text.startsWith(entry.text, i) &&
            (!text[i + entry.text.length] ||
              !word.test(text[i + entry.text.length])),
        )
      : undefined;
    if (!match && boundary) {
      const assignment = text.slice(i).match(numericAssignment);
      const symbol = text.slice(i).match(numericSymbol);
      if (assignment) {
        const [, variable, value] = assignment;
        match = {
          text: assignment[0],
          tex: `${variable === 'd/r' ? tex`\frac dr` : variable}=${value === '⅓' ? tex`\frac13` : value.replace('−', '-')}`,
        };
      } else if (symbol) {
        match = {
          text: symbol[0],
          tex: `${symbol[1]}${symbol[2] === 'π' ? tex`\pi` : 'a'}`,
        };
      }
      if (
        match &&
        text[i + match.text.length] &&
        /[\p{L}\p{N}_/]/u.test(text[i + match.text.length])
      )
        match = undefined;
    }
    if (match) {
      if (plain) parts.push(plain);
      parts.push(match);
      plain = '';
      i += match.text.length;
    } else {
      plain += text[i];
      i++;
    }
  }
  if (plain) parts.push(plain);
  return parts;
}
