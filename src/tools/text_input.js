import React from 'react';
import EpicComponent from 'epic-component';
import Python from 'alkindi-task-lib/ui/python';
import Variables from 'alkindi-task-lib/ui/variables';

import {cellsFromString} from './common';
import {renderText} from './common_views';

/*

Persistent state:

   outputTextVariable

Scope inputs:

   alphabet
   text

Scope outputs:

   outputText

*/

export const Component = EpicComponent(self => {

   self.render = function() {
      const {outputTextVariable} = self.props.state;
      const {text, outputText} = self.props.scope;
      const inputVars = [];
      const outputVars = [{label: "Texte chiffré", name: outputTextVariable}];
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputTextVariable}/>
                     <Python.StrLit value={text}/>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               {false && <Variables inputVars={inputVars} outputVars={outputVars} />}
               <div className='text-input'>{renderText(outputText)}</div>
            </div>
         </div>
      );
   };

});

export const compute = function (state, scope) {
   const {alphabet, text} = scope;
   const cells = cellsFromString(text, alphabet);
   scope.outputText = {alphabet, cells};
};

export default function TextInput () {
   this.Component = Component;
   this.compute = compute;
};
