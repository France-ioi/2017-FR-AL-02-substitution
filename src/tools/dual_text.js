
import React from 'react';
import EpicComponent from 'epic-component';

import {renderCell} from './common_views';

export default EpicComponent(self => {

   self.render = function() {
      const {topText, bottomText, wrapping} = self.props;
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               {"texte chiffré et déchiffré"}
            </div>
            <div className='panel-body'>
               <div className='text-dual'>
                  {renderDualText(topText, bottomText, wrapping)}
               </div>
            </div>
         </div>
      );
   };

});

export const renderDualText = function (topText, bottomText, wrapping) {
   const topAlphabet = topText.alphabet;
   const topCells = topText.cells;
   const clearAlphabet = bottomText.alphabet;
   const clearCells = bottomText.cells;
   const lines = [];
   let line;
   let wrappingCol = wrapping[0];
   const lineHeader = <div key={0} className='dualtext-label'><div className="adfgx-subst-src">{"chiffré"}</div><div className="adfgx-subst-tgt">{"clair"}</div></div>;
   for (let iCell = 0; iCell < topCells.length; iCell += 1) {
      if (iCell === wrappingCol) {
         if (line) {
            lines.push(<div key={lines.length} className="dualtext-line">{line}</div>);
         }
         line = [lineHeader];
         wrappingCol = wrapping ? wrapping[lines.length + 1] : lines.length * 40;
      }
      line.push(
         <div key={line.length} className="dualtext-col">
            <div className="dualtext-top-cell subst-src">
               {renderCell(iCell, topCells[iCell], topAlphabet)}
            </div>
            <div className="dualtext-bottom-cell subst-tgt">
               {renderCell(iCell, clearCells[iCell], clearAlphabet)}
            </div>
         </div>
      );
   }
   if (line.length > 0) {
      lines.push(<div key={lines.length}>{line}</div>)
   }
   return <div className='dualtext-block'>{lines}</div>;
};
