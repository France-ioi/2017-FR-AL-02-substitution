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
   if ('c' in cell) {
      return <span key={key} className="adfgx-cell">{cell.c}</span>;
   } else {
      const c0 = alphabet.symbols[cell.l];
      const q0 = classnames(['adfgx-cell', getQualifierClass(cell.q)]);
      return <span key={key} className={q0}>{c0}</span>;
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
