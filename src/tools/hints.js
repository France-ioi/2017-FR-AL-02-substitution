
import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';

import {getQualifierClass} from './common_views';

export default EpicComponent(self => {

  const onShowHintRequest = function (event) {
    const rank = parseInt(event.currentTarget.getAttribute('data-rank'));
    const source = event.currentTarget.getAttribute('data-in')
    self.props.onShowHintRequest({rank, source});
  };

  self.render = function () {
    const {hints, substitution} = self.props;
    const {mapping, reverse, sourceAlphabet, targetAlphabet} = substitution;
    const renderDecipherPair = function (sourceSymbol, sourceRank) {
      const targetCell = mapping[sourceRank];
      const {qualifier} = targetCell;
      const isHint = qualifier === 'hint';
      const targetSymbol = isHint ? targetAlphabet.symbols[targetCell.rank] : '?';
      const pairClasses = ['adfgx-subst-pair', getQualifierClass(qualifier)];
      const tgtCharClasses = ['adfgx-subst-tgt', isHint || 'adfgx-clickable'];
      return (
        <div key={sourceRank} className={classnames(pairClasses)}>
          <div className='adfgx-subst-src'>
            <span className='adfgx-subst-char'>
              <span>{sourceSymbol}</span>
            </span>
          </div>
          <div className={classnames(tgtCharClasses)} onClick={isHint || onShowHintRequest} data-rank={sourceRank} data-in={'cipher'}>
            <span className='adfgx-subst-char'>
              <span>{targetSymbol || '?'}</span>
            </span>
          </div>
        </div>
      );
    };
    const renderCipherPair = function (targetSymbol, targetRank) {
      const sourceCell = reverse[targetRank];
      const {qualifier} = sourceCell;
      const isHint = qualifier === 'hint';
      const sourceSymbol = isHint ? sourceAlphabet.symbols[sourceCell.rank] : '?';
      const pairClasses = ['adfgx-subst-pair-rev', getQualifierClass(qualifier)];
      const srcCharClasses = ['adfgx-subst-src', isHint || 'adfgx-clickable'];
      return (
        <div key={targetRank} className={classnames(pairClasses)}>
          <div className={classnames(srcCharClasses)} onClick={isHint || onShowHintRequest} data-rank={targetRank} data-in={'clear'}>
            <span className='adfgx-subst-char'>
              <span>{sourceSymbol}</span>
            </span>
          </div>
          <div className='adfgx-subst-tgt'>
            <span className='adfgx-subst-char'>
              <span>{targetSymbol}</span>
            </span>
          </div>
        </div>
      );
    };
    return (
      <div className='panel panel-default task-hints'>
        <div className='panel-heading'>
          {"indices"}
        </div>
        <div className='panel-body'>
          <div>
            <p className='hug-bottom'>{"Substitution de déchiffrage :"}</p>
            <div className='adfgx-subst'>
              {sourceAlphabet.symbols.map(renderDecipherPair)}
            </div>
          </div>
          <div>
            <p className='hug-bottom'>{"Substitution de chiffrage :"}</p>
            <div className='adfgx-subst'>
              {targetAlphabet.symbols.map(renderCipherPair)}
            </div>
          </div>
        </div>
      </div>
    );
  };

});
