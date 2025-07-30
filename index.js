const molarMasses = {
  H: 1.008,
  He: 4.00,
  Li: 6.94,
  Be: 9.01,
  B: 10.81,
  C: 12.01,
  N: 14.01,
  O: 16.00,
  F: 19.00,
  Ne: 20.18,
  Na: 22.99,
  Mg: 24.31,
  Al: 26.98,
  Si: 28.09,
  P: 30.97,
  S: 32.07,
  Cl: 35.45,
  Ar: 39.95,
  K: 39.10,
  Ca: 40.08,
  Sc: 44.96,
  Ti: 47.87,
  V: 50.94,
  Cr: 52.00,
  Mn: 54.94,
  Fe: 55.85,
  Co: 58.93,
  Ni: 58.69,
  Cu: 63.55,
  Zn: 65.38,
  Ga: 69.72,
  Ge: 72.63,
  As: 74.92,
  Se: 78.96,
  Br: 79.90,
  Kr: 83.80,
  Rb: 85.47,
  Sr: 87.62,
  Y: 88.91,
  Zr: 91.22,
  Nb: 92.91,
  Mo: 95.95,
  Tc: 98.00,       // Most stable isotope
  Ru: 101.07,
  Rh: 102.91,
  Pd: 106.42,
  Ag: 107.87,
  Cd: 112.41,
  In: 114.82,
  Sn: 118.71,
  Sb: 121.76,
  Te: 127.60,
  I: 126.90,
  Xe: 131.29,
  Cs: 132.91,
  Ba: 137.33,
  La: 138.91,
  Ce: 140.12,
  Pr: 140.91,
  Nd: 144.24,
  Pm: 145.00,      // Most stable isotope
  Sm: 150.36,
  Eu: 151.96,
  Gd: 157.25,
  Tb: 158.93,
  Dy: 162.50,
  Ho: 164.93,
  Er: 167.26,
  Tm: 168.93,
  Yb: 173.05,
  Lu: 174.97,
  Hf: 178.49,
  Ta: 180.95,
  W: 183.84,
  Re: 186.21,
  Os: 190.23,
  Ir: 192.22,
  Pt: 195.08,
  Au: 196.97,
  Hg: 200.59,
  Tl: 204.38,
  Pb: 207.2,
  Bi: 208.98,
  Po: 209.00,      // Most stable isotope
  At: 210.00,      // Most stable isotope
  Rn: 222.00,      // Most stable isotope
  Fr: 223.00,      // Most stable isotope
  Ra: 226.00,      // Most stable isotope
  Ac: 227.00,      // Most stable isotope
  Th: 232.04,
  Pa: 231.04,
  U: 238.03,
  Np: 237.00,      // Most stable isotope
  Pu: 244.00,      // Most stable isotope
  Am: 243.00,      // Most stable isotope
  Cm: 247.00,      // Most stable isotope
  Bk: 247.00,      // Most stable isotope
  Cf: 251.00,      // Most stable isotope
  Es: 252.00,      // Most stable isotope
  Fm: 257.00,      // Most stable isotope
  Md: 258.00,      // Most stable isotope
  No: 259.00,      // Most stable isotope
  Lr: 262.00,      // Most stable isotope
  Rf: 267.00,      // Most stable isotope
  Db: 270.00,      // Most stable isotope
  Sg: 271.00,      // Most stable isotope
  Bh: 270.00,      // Most stable isotope
  Hs: 277.00,      // Most stable isotope
  Mt: 278.00,      // Most stable isotope
  Ds: 281.00,      // Most stable isotope
  Rg: 282.00,      // Most stable isotope
  Cn: 285.00,      // Most stable isotope
  Fl: 289.00,      // Most stable isotope
  Lv: 293.00,      // Most stable isotope
  Ts: 294.00,      // Most stable isotope
  Og: 294.00       // Most stable isotope
};

function normalizeSubscripts(input) {
  const subscriptMap = {
    '₀': '0',
    '₁': '1',
    '₂': '2',
    '₃': '3',
    '₄': '4',
    '₅': '5',
    '₆': '6',
    '₇': '7',
    '₈': '8',
    '₉': '9'
  };

  return input.replace(/[\u2080-\u2089]/g, char => subscriptMap[char] || '');
}

function parseFormula(rawInput) {
  const input = normalizeSubscripts(rawInput)
  .replace(/\s+/g, '')
  .replace(/\[/g, '(')
  .replace(/\]/g, ')');
  let i = 0;

  function parseSection() {
    const tokens = [];

    while (i < input.length) {
      let char = input[i];
      let nextChar = input[i + 1] || '';

      if (char === '(') {
        i++; // Skip '('
        const groupTokens = parseSection(); // Recurse into parentheses

        if (input[i] !== ')') {
          throw new Error("Unmatched parenthesis");
        }
        i++; // Skip ')'

        // Parse multiplier
        let countStr = '';
        while (i < input.length && /[0-9]/.test(input[i])) {
          countStr += input[i];
          i++;
        }
        const multiplier = countStr ? parseInt(countStr) : 1;

        // Multiply and add
        for (const token of groupTokens) {
          token.count *= multiplier;
          tokens.push(token);
        }

      } else if (char === ')') {
        break;

      } else {
        let element = '';
        let countStr = '';

        if (/[A-Z]/.test(char)) {
          // Capital letter → one or two-letter element
          if (/[a-z]/.test(nextChar)) {
            element = char + nextChar;
            i += 2;
          } else {
            element = char;
            i++;
          }

        } else if (/[a-z]/.test(char)) {
          // Lowercase input: handle more carefully
          if (/[a-z]/.test(nextChar)) {
            const maybeTwo = char + nextChar;
            const formatted = maybeTwo.charAt(0).toUpperCase() + maybeTwo.charAt(1);

            const first = char.toUpperCase();
            const second = nextChar.toUpperCase();

            const firstValid = !!molarMasses[first];
            const secondValid = !!molarMasses[second];
            const combinedValid = !!molarMasses[formatted];

            if (combinedValid && (!firstValid || !secondValid)) {
              element = formatted;
              i += 2;
            } else {
              element = first;
              i++;
            }
          } else {
            element = char.toUpperCase();
            i++;
          }

        } else {
          throw new Error(`Invalid character: ${char}`);
        }

        // Parse subscript/multiplier
        while (i < input.length && /[0-9]/.test(input[i])) {
          countStr += input[i];
          i++;
        }

        const count = countStr ? parseInt(countStr) : 1;

        if (!molarMasses[element]) {
          throw new Error(`Unknown element: ${element}`);
        }

        tokens.push({ element, count });
      }
    }

    return tokens;
  }

  // Merge counts
  const parsedTokens = parseSection();
  const elementCounts = {};

  for (const token of parsedTokens) {
    elementCounts[token.element] = (elementCounts[token.element] || 0) + token.count;
  }

  return Object.entries(elementCounts).map(([element, count]) => ({ element, count }));
}

function parseRaw(rawInput) {
  // Normalize subscripts and brackets first
  const cleaned = normalizeSubscripts(rawInput)
    .replace(/\s+/g, '')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    .replace(/\*/g, '·');

  const parts = cleaned.split('·'); // Only split on final symbol now
  const combinedCounts = {};

  for (const part of parts) {
    let i = 0;
    let multiplierStr = '';

    // Extract leading multiplier (e.g., 5 in 5H2O)
    while (i < part.length && /[0-9]/.test(part[i])) {
      multiplierStr += part[i];
      i++;
    }

    const multiplier = multiplierStr ? parseInt(multiplierStr) : 1;
    const formula = part.slice(i); // Strip off the leading number

    const tokens = parseFormula(formula); // Use your existing parser

    for (const { element, count } of tokens) {
      if (combinedCounts[element]) {
        combinedCounts[element] += count * multiplier;
      } else {
        combinedCounts[element] = count * multiplier;
      }
    }
  }

  return Object.entries(combinedCounts).map(([element, count]) => ({ element, count }));
}

export { molarMasses, parseFormula, parseRaw };