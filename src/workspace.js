
const cipherAlphabet = makeAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
const clearAlphabet = makeAlphabet('abcdefghijklmnopqrstuvwxyz'.split(''));

const referenceFrequencies = [
  0.0812034849,
  0.0090109472,
  0.0334497677,
  0.0366833299,
  0.1713957515,
  0.0106596728,
  0.0086628177,
  0.0073654812,
  0.0757827046,
  0.0054442497,
  0.0004856863,
  0.0545455020,
  0.0296764091,
  0.0709375766,
  0.0540474291,
  0.0302070784,
  0.0136181215,
  0.0655187521,
  0.0794667491,
  0.0724311434,
  0.0636770558,
  0.0162804083,
  0.0011404083,
  0.0038646285,
  0.0030803592,
  0.0013644851
];
const referenceRanks =
  referenceFrequencies.map((frequency, rank) => {return {frequency, rank};})
    .sort(function (s1, s2) {
      const f1 = s1.frequency, f2 = s2.frequency;
      return f1 > f2 ? -1 : (f1 < f2 ? 1 : 0);
    });

export function createWorkspace (task) {
  const cipherText = parseText(cipherAlphabet, task.cipherText);
  const wrapping = getTextWrapping(cipherText, 35);
  let cipherFrequencies, targetFrequencies, mapping;
  if (task.version === 1) {
    mapping = cipherAlphabet.symbols.map((_, rank) => {return {rank, qualifier: 'unknown'};});
  } else {
    targetFrequencies = referenceFrequencies;
    cipherFrequencies = getFrequencies(cipherText);
    mapping = new Array(cipherAlphabet.size);
    referenceRanks.forEach(function (clearStat, index) {
      const cipherStat = cipherFrequencies[index];
      mapping[cipherStat.rank] = {rank: clearStat.rank, qualifier: 'unknown'};
    });
  }
  const baseSubstitution = {
    sourceAlphabet: cipherAlphabet,
    targetAlphabet: clearAlphabet,
    mapping,
    reverse: reverseMapping(mapping)
  };
  const hintSubstitution = applyHints(baseSubstitution, task.hints);
  return {
    cipherText, wrapping,
    cipherFrequencies, targetFrequencies,
    hintSubstitution
  };
};

export function updateWorkspace (task, workspace, dump) {
  const editedPairs = filterEditedPairs(task.hints, dump.editedPairs);
  const {hintSubstitution, cipherText} = workspace;
  const editedSubstitution = editSubstitution(hintSubstitution, editedPairs);
  const clearText = applySubstitution(editedSubstitution, cipherText);
  return {...workspace,
    editedPairs,
    editedSubstitution,
    clearText,
    ready: true
  };
};

function makeAlphabet (symbols) {
   const size = symbols.length;
   var ranks = {};
   for (var iSymbol = 0; iSymbol < size; iSymbol++) {
      ranks[symbols[iSymbol]] = iSymbol;
   }
   return {symbols, size, ranks};
}

function parseText (alphabet, textStr) {
  const cells = [];
  for (let iSymbol = 0; iSymbol < textStr.length; iSymbol++) {
    const symbol = textStr.charAt(iSymbol);
    const rank = alphabet.ranks[symbol];
    if (rank !== undefined) {
      cells.push({rank});
    } else {
      cells.push({symbol});
    }
  }
  return {alphabet, cells};
}

function getFrequencies (text) {
  const {alphabet, cells} = text;
  const stats = Array(alphabet.size);
  for (let iSymbol = 0; iSymbol < alphabet.size; iSymbol++) {
    stats[iSymbol] = {rank: iSymbol, count: 0};
  }
  for (let iCell = 0; iCell < cells.length; iCell++) {
    const cell = cells[iCell];
    if (cell.rank !== undefined) {
      stats[cell.rank].count += 1;
    }
  }
  stats.forEach(function (s, i) {
    s.frequency = s.count / cells.length;
    s.percentage = (s.frequency * 100).toFixed(1);
  });
  stats.sort(function (s1, s2) {
    const c1 = s1.count, c2 = s2.count;
    return c1 > c2 ? -1 : (c1 < c2 ? 1 : 0);
  });
  return stats;
}

/* Returns an array of wrapping positions in the text. */
function getTextWrapping (text, maxWidth) {
  const {cells} = text;
  const lineStartCols = [0];
  let col = 0;
  let lastNonAlphabet = maxWidth - 1;
  let lastNonAlphabetBeforeLetter = 0;
  for (let iCell = 0; iCell < cells.length; iCell++) {
    if (col >= maxWidth) {
      const startCol = lastNonAlphabetBeforeLetter + 1;
      lineStartCols.push(startCol);
      lastNonAlphabet = lineStartCols.length * maxWidth - 1;
      col = iCell - startCol;
    }
    const cell = cells[iCell];
    if ('rank' in cell) {
      lastNonAlphabetBeforeLetter = lastNonAlphabet;
    } else {
      lastNonAlphabet = iCell;
    }
    col++;
  }
  lineStartCols.push(cells.length);
  return lineStartCols;
}

function reverseMapping (mapping) {
  const reverse = Array(mapping.size);
  mapping.forEach(function (cell, rank) {
    const {qualifier} = cell;
    reverse[cell.rank] = {rank, qualifier};
  });
  return reverse;
}

/* hints: {chiffré → clair} */
function applyHints (substitution, hints) {
  const {sourceAlphabet, targetAlphabet, mapping, reverse} = substitution;
  /* Apply each hint as swapping pairs of letters. */
  Object.keys(hints).forEach(function (sourceLetter) {
    const sourceRank = sourceAlphabet.ranks[sourceLetter];
    const targetLetter = hints[sourceLetter];
    const targetRank = targetAlphabet.ranks[targetLetter];
    modifySubstitution(mapping, reverse, sourceRank, targetRank, 'hint');
  });
  return {sourceAlphabet, targetAlphabet, mapping, reverse};
}

function modifySubstitution (mapping, reverse, sourceRank, targetRank, qualifier) {
  const oldTarget = mapping[sourceRank];
  const oldSource = reverse[targetRank];
  if (oldTarget.qualifier !== 'unknown' || oldSource.qualifier !== 'unknown') {
    console.log('skipped', oldSource, sourceRank, oldTarget, targetRank, qualifier);
    return;
  }
  /* Perform a swap in mapping so that mapping[sourceRank].rank === targetRank. */
  swap(mapping, sourceRank, oldSource.rank, qualifier);
  swap(reverse, targetRank, oldTarget.rank, qualifier);
}

/* Swap the values at rank1 and rank2 in mapping, updating the qualifier in
   the new value for rank1.  The qualifier is set even if rank1 === rank2. */
function swap (mapping, rank1, rank2, qualifier) {
  const temp = {...mapping[rank2], qualifier};
  mapping[rank2] = mapping[rank1];
  mapping[rank1] = temp;
}

function editSubstitution (inputSubstitution, editedPairs) {
  const {mapping, reverse, sourceAlphabet, targetAlphabet} = inputSubstitution;
  const newMapping = mapping.slice();
  const newReverse = reverse.slice();
  Object.keys(editedPairs).forEach(function (sourceSymbol) {
    const target = editedPairs[sourceSymbol];
    const sourceRank = sourceAlphabet.ranks[sourceSymbol];
    const targetRank = targetAlphabet.ranks[target.symbol];
    modifySubstitution(newMapping, newReverse, sourceRank, targetRank, target.locked ? 'edit' : 'unknown');
  });
  return {sourceAlphabet, targetAlphabet, mapping: newMapping};
}

function applySubstitution (substitution, inputText) {
  const targetCells = inputText.cells.map(function (cell) {
    if ('rank' in cell) {
      return substitution.mapping[cell.rank];
    } else {
      return cell;
    }
  });
  return {alphabet: substitution.targetAlphabet, cells: targetCells};
}

export function exportText (text) {
  const {alphabet, cells} = text;
  const {symbols} = alphabet;
  return cells.map(function (cell) {
    return 'symbol' in cell ? cell.symbol : symbols[cell.rank]
  }).join('');
}

function filterEditedPairs (hints, editedPairs) {
  const reverseHints = new Map();
  Object.keys(hints).forEach(function (cipherSymbol) {
    const clearSymbol = hints[cipherSymbol];
    reverseHints.set(clearSymbol, cipherSymbol);
  });
  const validPairs = {};
  Object.keys(editedPairs).forEach(function (cipherSymbol) {
    const target = editedPairs[cipherSymbol];
    if (!reverseHints.has(target.symbol)) {
      validPairs[cipherSymbol] = target;
    }
  });
  return validPairs;
}
