
export const makeAlphabet = function (symbols) {
   const size = symbols.length;
   var ranks = {};
   for (var iSymbol = 0; iSymbol < size; iSymbol++) {
      ranks[symbols[iSymbol]] = iSymbol;
   }
   return {symbols, size, ranks};
};

export const clearAlphabet = makeAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
export const cipherAlphabet = clearAlphabet;

export const cellsFromString = function (text, alphabet, qualifier) {
   const cells = [];
   for (let iSymbol = 0; iSymbol < text.length; iSymbol++) {
      const symbol = text.charAt(iSymbol);
      const rank = alphabet.ranks[symbol];
      if (rank !== undefined) {
         cells.push({rank, qualifier});
      } else {
         cells.push({symbol});
      }
   }
   return cells;
};
