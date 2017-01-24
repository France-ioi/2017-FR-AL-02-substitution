
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

function getHintSubstitution (sourceAlphabet, targetAlphabet, hints) {
  /* Start with identity mappings. */
  const mapping = sourceAlphabet.symbols.map((_, rank) => {return {qualifier: 'unknown'};});
  const reverse = targetAlphabet.symbols.map((_, rank) => {return {qualifier: 'unknown'};});
  /* Apply each hint as swapping pairs of letters. */
  Object.keys(hints).forEach(function (sourceLetter) {
    const sourceRank = sourceAlphabet.ranks[sourceLetter];
    const targetLetter = hints[sourceLetter];
    const targetRank = targetAlphabet.ranks[targetLetter];
    mapping[sourceRank] = {qualifier: 'hint', rank: targetRank};
    reverse[targetRank] = {qualifier: 'hint', rank: sourceRank};
  });
  /* Set a rank on unknown positions. */
  sourceAlphabet.symbols.forEach(function (_, sourceRank) {
    modifySubstitution(mapping, reverse, sourceRank, sourceRank, 'unknown');
  });
  targetAlphabet.symbols.forEach(function (_, targetRank) {
    modifySubstitution(reverse, mapping, targetRank, targetRank, 'unknown');
  });
  return {
    mapping,
    reverse,
    sourceAlphabet,
    targetAlphabet
  };
}

function modifySubstitution (mapping, reverse, sourceRank, targetRank, qualifier) {
  if (mapping[sourceRank].qualifier === 'unknown') {
    while (reverse[targetRank].qualifier !== 'unknown') {
      targetRank = reverse[targetRank].rank;
    }
    mapping[sourceRank] = {qualifier, rank: targetRank};
  }
}

function editSubstitution (inputSubstitution, editedPairs) {
  const {mapping, reverse, sourceAlphabet, targetAlphabet} = inputSubstitution;
  const newMapping = mapping.slice();
  const newReverse = mapping.slice();
  Object.keys(editedPairs).forEach(function (sourceSymbol) {
    const sourceRank = sourceAlphabet.ranks[sourceSymbol];
    const targetRank = targetAlphabet.ranks[editedPairs[sourceSymbol]];
    modifySubstitution(newMapping, reverse, sourceRank, targetRank, 'edit');
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
