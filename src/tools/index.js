
import React from 'react';
import EpicComponent from 'epic-component';

import Answer from './answer';
import DualText from './dual_text';
import Hints from './hints';
import EditSubstitution from './edit_substitution';
import {exportText} from '../workspace';

export default actions => EpicComponent(self => {

  function onSubmitAnswer () {
    const clearText = exportText(self.props.workspace.clearText);
    const answer = {clearText};
    self.props.dispatch({type: actions.submitAnswer, answer});
  }

  function onDismissAnswerFeedback () {
    self.props.dispatch({type: actions.dismissAnswerFeedback});
  }

  function onSubstSwapPairs (key1, value1, key2, value2) {
    self.props.dispatch({type: actions.substSwapPairs, key1, value1, key2, value2});
  }

  function onSubstReset () {
    self.props.dispatch({type: actions.substReset});
  }

  function onSubstLock (sourceSymbol, targetSymbol) {
    self.props.dispatch({type: actions.substLock, sourceSymbol, targetSymbol});
  }

  function onShowHintRequest (request) {
    self.props.dispatch({type: actions.showHintRequest, request});
  }

  function onRequestHint () {
    self.props.dispatch({type: actions.requestHint, request: self.props.hintRequest});
  }

  self.render = function () {
    const {task, workspace, score, submitAnswer, hintRequest} = self.props;
    const {cipherText, wrapping, hintSubstitution, editedSubstitution, clearText, cipherFrequencies, targetFrequencies} = workspace;
    return (
      <div>
        <Answer score={score} submitAnswer={submitAnswer} SaveButton={actions.SaveButton}
          onSubmitAnswer={onSubmitAnswer} onDismissAnswerFeedback={onDismissAnswerFeedback} />
        <Hints task={task} substitution={hintSubstitution} hintRequest={hintRequest}
          onShowHintRequest={onShowHintRequest} onRequestHint={onRequestHint} />
        <EditSubstitution substitution={editedSubstitution}
          cipherFrequencies={cipherFrequencies} targetFrequencies={targetFrequencies}
          onReset={onSubstReset} onSwapPairs={onSubstSwapPairs} onLock={onSubstLock} />
        <DualText topText={cipherText} bottomText={clearText} wrapping={wrapping} />
      </div>
    );
  };

});
