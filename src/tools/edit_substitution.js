
import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {DragSource, DropTarget} from 'react-dnd';

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

export default EpicComponent(self => {

   const onDrop = function (dragSource, dragTarget) {
      const {sourceAlphabet, targetAlphabet} = self.props.substitution;
      const key1 = dragTarget.source;
      const value1 = sourceAlphabet.symbols[dragSource.target.rank];
      const key2 = dragSource.source;
      const value2 = targetAlphabet.symbols[dragTarget.target.rank];
      self.props.onSwapPairs(key1, value1, key2, value2);
   };

   const onReset = function () {
      self.props.onReset();
   };

   self.render = function() {
      const {sourceAlphabet, targetAlphabet, mapping} = self.props.substitution;
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
               {"substitution"}
            </div>
            <div className='panel-body'>
               <Button onClick={onReset}>réinitialiser</Button>
               <div className='grillesSection'>
                  <div className='adfgx-subst'>
                     {mapping.map(renderSubstCell)}
                  </div>
               </div>
            </div>
         </div>
      );
   };

});
