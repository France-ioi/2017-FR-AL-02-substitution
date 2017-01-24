
import React from 'react';
import EpicComponent from 'epic-component';

import TextInput from './text_input';
import Hints from './hints';
import EditSubstitution from './edit_substitution';
import ApplySubstitution from './apply_substitution';
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
    self.props.dispatch({type: actions.requestHint});
  }

  self.render = function () {
    const {task, workspace} = self.props;
    const cipherText = parseText(cipherAlphabet, task.cipherText);
    const hintSubstitution = getHintSubstitution(cipherAlphabet, clearAlphabet, task.hints);
    const editedSubstitution = editSubstitution(hintSubstitution, workspace.editedPairs);
    const clearText = applySubstitution(editedSubstitution, cipherText);
    return (
      <div>
        <TextInput text={cipherText} />
        <Hints substitution={hintSubstitution} onShowHintRequest={onShowHintRequest} onRequestHint={onRequestHint} />
        <EditSubstitution substitution={editedSubstitution} onReset={onSubstReset} onSwapPairs={onSubstSwapPairs} />
        <ApplySubstitution text={clearText} />
      </div>
    );
  };

});

function parseText (alphabet, inputText) {
   const cells = cellsFromString(inputText, alphabet);
   return {alphabet, cells};
}

const unknownHintCell = {qualifier: 'unknown'};
function getHintSubstitution (cipherAlphabet, clearAlphabet, hints) {
  const mapping = cipherAlphabet.symbols.map(_ => unknownHintCell);
  const reverse = clearAlphabet.symbols.map(_ => unknownHintCell);
  Object.keys(hints).forEach(function (cipherLetter) {
    const cipherRank = cipherAlphabet.ranks[cipherLetter];
    const clearLetter = hints[cipherLetter];
    const clearRank = clearAlphabet.ranks[clearLetter];
    mapping[cipherRank] = {qualifier: 'hint', rank: clearRank};
    reverse[clearRank] = {qualifier: 'hint', rank: cipherRank};
  });
  return {
    mapping,
    reverse,
    sourceAlphabet: cipherAlphabet,
    targetAlphabet: clearAlphabet
  };
}

function editSubstitution (inputSubstitution, editedPairs) {
   const {sourceAlphabet, targetAlphabet} = inputSubstitution;
   // Mark symbols in inputSubstitution and editedPairs as used, other target
   // symbols as unused.
   const symbolUsed = Array(targetAlphabet.size).fill(false);
   Object.keys(editedPairs).forEach(function (sourceSymbol) {
      // Ignore editedPairs that are overridden by a hint.
      const sourceRank = sourceAlphabet.ranks[sourceSymbol];
      if (inputSubstitution.mapping[sourceRank].qualifier === 'unknown') {
         const targetRank = targetAlphabet.ranks[editedPairs[sourceSymbol]];
         symbolUsed[targetRank] = 'edit';
      }
   });
   inputSubstitution.mapping.forEach(function (cell) {
      if (cell.qualifier === 'hint') {
         symbolUsed[cell.rank] = 'hint';
      }
   });
   // console.log(symbolUsed);
   let nextUnusedTargetRank = 0;
   function getNextUnusedTargetRank () {
      // Move to the next unused rank.
      while (symbolUsed[nextUnusedTargetRank]) {
         nextUnusedTargetRank += 1;
      }
      // This is our result.
      const result = nextUnusedTargetRank;
      // Skip past this rank for next call.
      nextUnusedTargetRank += 1;
      return result;
   }
   // Generate a mapping using hints+editedPairs and filling with unused symbols.
   const mapping = inputSubstitution.mapping.slice();
   sourceAlphabet.symbols.forEach(function (sourceSymbol, sourceRank) {
      if (mapping[sourceRank].qualifier !== 'unknown') {
         return;
      }
      let targetRank, qualifier;
      if (sourceSymbol in editedPairs) {
         // If there is a hint that maps to this letter, ignore the edit.
         targetRank = targetAlphabet.ranks[editedPairs[sourceSymbol]];
         if (symbolUsed[targetRank] !== 'hint') {
            qualifier = 'edit';
         }
      }
      if (qualifier === undefined) {
         targetRank = getNextUnusedTargetRank();
         qualifier = 'unknown';
      }
      mapping[sourceRank] = {rank: targetRank, qualifier: qualifier};
   });
   return {sourceAlphabet, targetAlphabet, mapping};
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
