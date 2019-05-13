import React from "react";
import HTML5Backend from "react-dnd-html5-backend";
import {updateWorkspace} from "./utils";
import {connect} from "react-redux";
import {DragDropContext} from "react-dnd";
import DualText from "./tools/dual_text";
import Hints from "./tools/hints";
import EditSubstitution from "./tools/edit_substitution";

function WorkspaceSelector (state) {
  const {
    substSwapPairs,
    substReset,
    substLock,
    setHintRequest,
    requestHint
  } = state.actions;

  const {taskData, workspace, rootScope} = state;
  return {
    substSwapPairs,
    substReset,
    substLock,
    setHintRequest,
    requestHint,
    taskData,
    workspace,
    rootScope
  };
}

const Workspace = props => {
  const {
    dispatch,
    substSwapPairs,
    substReset,
    substLock,
    setHintRequest,
    requestHint,
    workspace,
    taskData
  } = props;

  const {
    cipherText,
    wrapping,
    hintSubstitution,
    editedSubstitution,
    clearText,
    cipherFrequencies,
    targetFrequencies,
    hintRequest
  } = workspace;

  const onSubstSwapPairs = (key1, value1, key2, value2) => {
    dispatch({
      type: substSwapPairs,
      key1,
      value1,
      key2,
      value2
    });
  };

  const onSubstReset = () => {
    dispatch({type: substReset});
  };

  const onSubstLock = (sourceSymbol, targetSymbol) => {
    dispatch({
      type: substLock,
      sourceSymbol,
      targetSymbol
    });
  };

  const onShowHintRequest = request => {
    dispatch({type: setHintRequest, request});
  };

  const onRequestHint = () => {
    dispatch({
      type: requestHint,
      payload: {request: hintRequest}
    });
  };

  return (
    <div>
      <Hints
        task={taskData}
        substitution={hintSubstitution}
        hintRequest={hintRequest}
        onShowHintRequest={onShowHintRequest}
        onRequestHint={onRequestHint}
      />
      <EditSubstitution
        substitution={editedSubstitution}
        cipherFrequencies={cipherFrequencies}
        targetFrequencies={targetFrequencies}
        onReset={onSubstReset}
        onSwapPairs={onSubstSwapPairs}
        onLock={onSubstLock}
      />
      <DualText
        topText={cipherText}
        bottomText={clearText}
        wrapping={wrapping}
      />
    </div>
  );
};

function substSwapPairsReducer (state, action) {
  let {dump} = state;
  let {editedPairs} = state.dump;
  const {key1, value1, key2, value2} = action;
  const target1 = {...editedPairs[key2], symbol: value1};
  const target2 = {...editedPairs[key1], symbol: value2};
  editedPairs = {...editedPairs, [key1]: target1, [key2]: target2};
  dump = {editedPairs};
  const workspace = updateWorkspace(state.taskData, state.workspace, dump);
  return {...state, dump, workspace};
}

function substResetReducer (state, _action) {
  const dump = {editedPairs: {}};
  const workspace = updateWorkspace(state.taskData, state.workspace, dump);
  return {...state, dump, workspace};
}

function substLockReducer (state, action) {
  let {dump} = state;
  let {editedPairs} = state.workspace;
  const {sourceSymbol, targetSymbol} = action;
  let target = editedPairs[sourceSymbol];
  if (target) {
    target = {...target, locked: !target.locked};
  } else {
    target = {symbol: targetSymbol, locked: true};
  }
  editedPairs = {...editedPairs, [sourceSymbol]: target};
  dump = {editedPairs};
  const workspace = updateWorkspace(state.taskData, state.workspace, dump);
  return {...state, dump, workspace};
}

function setHintRequestReducer (state, {request}) {
  return {
    ...state,
    workspace: {...state.workspace, hintRequest: request}
  };
}

export default {
  actions: {
    substSwapPairs: "Workspace.Subst.SwapPairs",
    substReset: "Workspace.Subst.Reset",
    substLock: "Workspace.Subst.Lock",
    setHintRequest: "Hints.Update.HintRequest"
  },
  actionReducers: {
    substSwapPairs: substSwapPairsReducer,
    substReset: substResetReducer,
    substLock: substLockReducer,
    setHintRequest: setHintRequestReducer
  },
  views: {
    Workspace: connect(WorkspaceSelector)(
      DragDropContext(HTML5Backend)(Workspace)
    )
  }
};
