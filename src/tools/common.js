
export const makeAlphabet = function (symbols) {
   const size = symbols.length;
   var ranks = {};
   for (var iSymbol = 0; iSymbol < size; iSymbol++) {
      ranks[symbols[iSymbol]] = iSymbol;
   }
   return {symbols, size, ranks};
};

export const clearAlphabet = makeAlphabet('ABCDEFGHIJKLMNOPQRSTUVXYZ'.split(''));
export const cipherAlphabet = clearAlphabet;

export const cellsFromString = function (text, alphabet, defaultQ) {
   const cells = [];
   for (let iLetter = 0; iLetter < text.length; iLetter++) {
      const letter = text.charAt(iLetter);
      const rank = alphabet.ranks[letter];
      if (rank !== undefined) {
         cells.push({l: rank, q: defaultQ});
      } else {
         cells.push({c: letter});
      }
   }
   return cells;
};
