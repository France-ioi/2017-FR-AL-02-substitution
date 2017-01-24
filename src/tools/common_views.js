
import React from 'react';
import classnames from 'classnames';

///////////////////////////////////////////////////////////////////////
//
// Rendering
//

const qualifierClasses = {
   'unknown':   'adfgx-q-unconfirmed',
   'hint':      'adfgx-q-hint',
   'edit':      'adfgx-q-guess'
};

export const getQualifierClass = function(qualifier) {
   return qualifierClasses[qualifier];
};

export const renderCell = function (key, cell, alphabet) {
   if ('rank' in cell) {
      const symbol = alphabet.symbols[cell.rank];
      const classes = classnames(['adfgx-cell', getQualifierClass(cell.qualifier)]);
      return <span key={key} className={classes}>{symbol}</span>;
   } else {
      return <span key={key} className="adfgx-cell">{cell.symbol}</span>;
   }
};

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
   if (line.length > 0) {
      lines.push(<div key={lines.length}>{line}</div>)
   }
   return <div className='adfgx-text'>{lines}</div>;
};
