
import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import Python from 'alkindi-task-lib/ui/python';

/*

Transient state:

   selectedLetterRank
   selectedCipherPos
   selectedDecipherPos

Scope:

   outputSubstitution

*/

const unknownHintCell = {qualifier: 'unknown'};

const compute = function (state, scope) {
   // Compute the substitution.
   const {cipherAlphabet, clearAlphabet, hints} = scope;
   const mapping = cipherAlphabet.symbols.map(_ => unknownHintCell);
   Object.keys(hints).forEach(function (cipherLetter) {
      const cipherRank = cipherAlphabet.ranks[cipherLetter];
      const clearLetter = hints[cipherLetter];
      const clearRank = clearAlphabet.ranks[clearLetter];
      mapping[cipherRank] = {qualifier: 'hint', rank: clearRank};
   });
   scope.outputSubstitution = {
      mapping,
      sourceAlphabet: cipherAlphabet,
      targetAlphabet: clearAlphabet
   };
};

const Component = EpicComponent(self => {

   self.render = function () {
      const {outputSubstitutionVariable} = self.props.state;
      const {hints, outputSubstitution} = self.props.scope;
      return (
         <div className='panel panel-default task-hints'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputSubstitutionVariable}/>
                     <Python.Dict dict={hints} renderValue={x => `"${x}"`}/>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               <p>{JSON.stringify(outputSubstitution.mapping)}</p>
            </div>
         </div>
      );
   };

});

export default function Hints () {
   this.Component = Component;
   this.compute = compute;
   this.reducers = {};
};
