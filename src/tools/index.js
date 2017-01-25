
import React from 'react';
import EpicComponent from 'epic-component';

import DualText from './dual_text';
import Hints from './hints';
import EditSubstitution from './edit_substitution';

export default actions => EpicComponent(self => {

  function onSubstSwapPairs (key1, value1, key2, value2) {
    self.props.dispatch({type: actions.substSwapPairs, key1, value1, key2, value2});
  }

  function onSubstReset () {
    self.props.dispatch({type: actions.substReset});
  }

  function onShowHintRequest (request) {
    self.props.dispatch({type: actions.showHintRequest, request});
  }

  function onRequestHint () {
    self.props.dispatch({type: actions.requestHint, request: self.props.hintRequest});
  }

  self.render = function () {
    const {task, workspace, hintRequest} = self.props;
    const {cipherText, wrapping, hintSubstitution, editedSubstitution, clearText, cipherFrequencies, targetFrequencies} = workspace;
    return (
      <div>
        <Hints task={task} substitution={hintSubstitution} onShowHintRequest={onShowHintRequest} onRequestHint={onRequestHint} hintRequest={hintRequest}/>
        <EditSubstitution substitution={editedSubstitution} onReset={onSubstReset} onSwapPairs={onSubstSwapPairs}
          cipherFrequencies={cipherFrequencies} targetFrequencies={targetFrequencies} />
        <DualText topText={cipherText} bottomText={clearText} wrapping={wrapping} />
      </div>
    );
  };

});
