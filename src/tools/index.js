
import React from 'react';
import EpicComponent from 'epic-component';

import DualText from './dual_text';
import Hints from './hints';
import EditSubstitution from './edit_substitution';
import {clearAlphabet, cipherAlphabet, cellsFromString} from './common';

export default actions => EpicComponent(self => {

  function onSubstSwapPairs (key1, value1, key2, value2) {
    self.props.dispatch({type: actions.substSwapPairs, key1, value1, key2, value2});
  }

  function onSubstReset () {
    self.props.dispatch({type: actions.substReset});
  }

  function onShowHintRequest (request) {
    self.props.dispatch({type: actions.showHintRequest, request});
  }

  function onRequestHint () {
    self.props.dispatch({type: actions.requestHint, request: self.props.hintRequest});
  }

  self.render = function () {
    const {task, workspace, hintRequest} = self.props;
    const cipherText = parseText(cipherAlphabet, task.cipherText);
    const wrapping = getTextWrapping(cipherText, 60);
    const hintSubstitution = getHintSubstitution(cipherAlphabet, clearAlphabet, task.hints);
    const editedSubstitution = editSubstitution(hintSubstitution, workspace.editedPairs);
    const clearText = applySubstitution(editedSubstitution, cipherText);
    return (
      <div>
        <Hints task={task} substitution={hintSubstitution} onShowHintRequest={onShowHintRequest} onRequestHint={onRequestHint} hintRequest={hintRequest}/>
        <EditSubstitution substitution={editedSubstitution} onReset={onSubstReset} onSwapPairs={onSubstSwapPairs} />
        <DualText topText={cipherText} bottomText={clearText} wrapping={wrapping} />
      </div>
    );
  };

});


function parseText (alphabet, inputText) {
  const cells = cellsFromString(inputText, alphabet);
  return {alphabet, cells};
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

/* hints: {chiffré → clair} */
function getHintSubstitution (sourceAlphabet, targetAlphabet, hints) {
  /* Start with identity mappings. */
  const mapping = sourceAlphabet.symbols.map((_, rank) => {return {rank, qualifier: 'unknown'};});
  const reverse = targetAlphabet.symbols.map((_, rank) => {return {rank, qualifier: 'unknown'};});
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
    const sourceRank = sourceAlphabet.ranks[sourceSymbol];
    const targetRank = targetAlphabet.ranks[editedPairs[sourceSymbol]];
    modifySubstitution(newMapping, newReverse, sourceRank, targetRank, 'edit');
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
