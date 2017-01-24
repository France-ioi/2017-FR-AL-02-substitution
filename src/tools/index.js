
import TextInput from './text_input';
import Hints from './hints';
import EditSubstitution from './edit_substitution';
/*
import EnumeratePermutations from './enumerate_permutations';
import ApplyPermutation from './apply_permutation';
import ApplySubstitution from './apply_substitution';
*/

import {clearAlphabet, cipherAlphabet} from './common';

export const makeRootScope = function (task) {
   return {
      ...task,
      clearAlphabet,
      cipherAlphabet
   };
};

export function setupTools (addTool) {

   const iTextInput = addTool(TextInput, function (scopes, scope) {
      // Set up the input scope for the tool's compute function.
      // Each scope inherits prototypically from the root scope.
      scope.alphabet = scope.cipherAlphabet;
      scope.text = scope.cipherText;
      // → scope.outputText
   }, {
      outputTextVariable: "texteChiffré"
   });

   const iHints = addTool(Hints, function (scopes, scope) {
      // → scope.outputSubstitution
   }, {
      outputSubstitutionVariable: "substitutionIndices"
   });

   const iEditSubstitution = addTool(EditSubstitution, function (scopes, scope) {
      scope.sourceAlphabet = scope.cipherAlphabet;
      scope.targetAlphabet = scope.clearAlphabet;
      scope.inputSubstitution = scopes[iHints].outputSubstitution;
   }, {
      editedPairs: {}, // ex. {'A': 'E'}
      inputSubstitutionVariable: 'substitutionIndices',
      outputSubstitutionVariable: 'substitutionÉditée'
   });

/*

   const iApplySubstitution = addTool(ApplySubstitution, function (scopes, scope) {
      scope.cipherText = scopes[iApplyPermutation].outputText;
      scope.substitution = scopes[iFrequencyAnalysis].outputSubstitution;
   }, {
      inputTextVariable: 'texteAprèsPermutation',
      inputSubstitutionVariable: 'substitutionÉditée',
      outputClearTextVariable: 'texteDéchiffré'
   });
*/

};
