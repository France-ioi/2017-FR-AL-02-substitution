import React from 'react';
import EpicComponent from 'epic-component';
import Python from 'alkindi-task-lib/ui/python';
import Variables from 'alkindi-task-lib/ui/variables';

export const renderText = function (text) {
   const {alphabet, cells} = text;
   const lines = [];
   let line = [];
   cells.forEach(function (cell, iCell) {
      line.push(renderCell(iCell, cell, alphabet));
      if (line.length === 40) {
         lines.push(<div key={lines.length} className="adfgx-line">{line}</div>);
         line = [];
      }
   });
   if (line.length > 0)
      lines.push(<div key={lines.length}>{line}</div>)
   return <div className='adfgx-text'>{lines}</div>;
};

export const Component = EpicComponent(self => {

   self.render = function() {
      const {inputTextVariable, inputSubstitutionVariable, outputClearTextVariable} = self.props.state;
      const {outputText} = self.props.scope;
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputClearTextVariable}/>
                     <Python.Call name="appliqueSubstitution">
                        <Python.Var name={inputTextVariable}/>
                        <Python.Var name={inputSubstitutionVariable}/>
                     </Python.Call>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               <div className='adfgx-deciphered-text'>
                  {renderText(outputText)}
               </div>
            </div>
         </div>
      );
   };

});

export const compute = function (state, scope) {
   const {cipheredText, substitution} = scope;
   const targetCells = cipheredText.cells.map(function (cell) {
      return substitution.mapping[cell.l];
   });
   scope.outputText = {alphabet: substitution.targetAlphabet, cells: targetCells};
};

export default function ApplySubstitution () {
   this.Component = Component;
   this.compute = compute;
};
