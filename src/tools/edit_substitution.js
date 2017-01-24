import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {DragSource, DropTarget} from 'react-dnd';
import Python from 'alkindi-task-lib/ui/python';

import {getQualifierClass} from './common_views';

const BareSubstTarget = EpicComponent(self => {
   self.render = function () {
      const {source, target, targetSymbol} = self.props;
      const {isDragging, connectDropTarget, connectDragSource} = self.props;
      const isDragTarget = typeof connectDropTarget === 'function';
      const isDragSource = typeof connectDragSource === 'function';
      const classes = ['adfgx-subst-tgt', isDragSource && 'adfgx-draggable', isDragging && 'dragging'];
      let el = (
         <div className={classnames(classes)}>
            <span className='adfgx-subst-char'>{targetSymbol}</span>
         </div>
      );
      if (isDragTarget)
         el = connectDropTarget(el);
      if (isDragSource)
         el = connectDragSource(el);
      return el;
   };
});

function sourceCollect (connect, monitor) {
   return {
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging()
   };
};
const targetCollect = function (connect, monitor) {
   return {
      connectDropTarget: connect.dropTarget()
   };
};
const sourceSpec = {
   beginDrag: function (props) {
      const {source, target} = props;
      return {source, target};
   }
};
const targetSpec = {
   drop: function (props, monitor, component) {
      const dragSource = monitor.getItem();
      const {source, target} = props;
      const dragTarget = {source, target};
      props.onDrop(dragSource, dragTarget);
   }
};
const SubstTarget =
   DragSource('subst-target', sourceSpec, sourceCollect)(
   DropTarget('subst-target', targetSpec, targetCollect)(
   BareSubstTarget));

export const Component = EpicComponent(self => {

   const onDrop = function (dragSource, dragTarget) {
      const {targetAlphabet} = self.props.scope;
      const key1 = dragTarget.source;
      const value1 = targetAlphabet.symbols[dragSource.target.rank];
      const key2 = dragSource.source;
      const value2 = targetAlphabet.symbols[dragTarget.target.rank];
      self.props.dispatch({type: 'SwapPairs', key1, value1, key2, value2});
   };

   const onReset = function () {
      self.props.dispatch({type: 'Reset'});
   };

   self.render = function() {
      const {inputSubstitutionVariable, outputSubstitutionVariable} = self.props.state;
      const {sourceAlphabet, targetAlphabet, outputSubstitution} = self.props.scope;
      const substitution = outputSubstitution.mapping;
      const renderSubstCell = function (targetCell, sourceRank) {
         const sourceSymbol = sourceAlphabet.symbols[sourceRank];
         const targetSymbol = targetAlphabet.symbols[targetCell.rank];
         const isEditable = targetCell.qualifier !== 'hint';
         const Target = isEditable ? SubstTarget : BareSubstTarget;
         return (
            <div key={sourceRank} className={classnames(['adfgx-subst-pair', getQualifierClass(targetCell.qualifier)])}>
               <div className='adfgx-subst-src'>
                  <span className='adfgx-subst-char'>
                     <span>{sourceSymbol}</span>
                  </span>
               </div>
               <Target source={sourceSymbol} target={targetCell} targetSymbol={targetSymbol} onDrop={onDrop} />
            </div>
         );
      };
      // Button to reset substitution to match order of bigrams frequencies
      // with order of letter frequencies in french.
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputSubstitutionVariable}/>
                     <Python.Call name="modifieSubstitution">
                        <Python.Var name={inputSubstitutionVariable}/>
                        <span>…</span>
                     </Python.Call>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               <Button onClick={onReset}>réinitialiser</Button>
               <div className='grillesSection'>
                  <div className='adfgx-subst'>
                     {substitution.map(renderSubstCell)}
                  </div>
               </div>
            </div>
         </div>
      );
   };

});

export const compute = function (state, scope) {
   const {sourceAlphabet, targetAlphabet, inputSubstitution} = scope;
   const {editedPairs} = state;
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
   console.log(symbolUsed);
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
   scope.outputSubstitution = {sourceAlphabet, targetAlphabet, mapping};
};

export default function EditSubstitution () {
   this.Component = Component;
   this.compute = compute;
   this.reducers = {};
   this.reducers.SwapPairs = function (state, action) {
      const {editedPairs} = state;
      const {key1, value1, key2, value2} = action;
      const pairs = state
      return {
         ...state,
         editedPairs: {...editedPairs, [key1]: value1, [key2]: value2}
      };
   };
   this.reducers.Reset = function (state, action) {
      return {...state, editedPairs: {}};
   };
};
