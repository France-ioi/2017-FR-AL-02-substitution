
import runTask from 'alkindi-task-lib';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Task from './task';
import Workspace from './tools/index';
import {createWorkspace, updateWorkspace} from './workspace';

import 'normalize.css';
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'rc-tooltip/assets/bootstrap.css';
import './platform.css';
import './style.css';

export function run (container, options) {
  options = {...options, wrapper: App => DragDropContext(HTML5Backend)(App)};
  runTask(container, options, TaskBundle);
};

function TaskBundle (bundle, deps) {

  bundle.defineView('Task', TaskSelector, Task);
  function TaskSelector (state) {
    const {task} = state;
    return {task};
  }

  const workspaceOperations = {
    taskLoaded,
    taskUpdated,
    workspaceLoaded,
    dumpWorkspace,
    isWorkspaceReady
  };

  bundle.addReducer('init', function (state, action) {
    return {...state, workspaceOperations};
  });

  function taskLoaded (state) {
    return {...state, workspace: updateWorkspace(createWorkspace(state.task), {editedPairs: {}})};
  }

  function taskUpdated (state) {
    return {...state, workspace: updateWorkspace(createWorkspace(state.task), state.workspace)};
  }

  function workspaceLoaded (state, dump) {
    return {...state, workspace: updateWorkspace(state.workspace, dump)};
  }

  function dumpWorkspace (state) {
    const {editedPairs} = state.workspace;
    return {editedPairs};
  }

  function isWorkspaceReady (state) {
    return state.workspace.ready;
  }

  function WorkspaceSelector (state, props) {
    const {score, feedback, task, workspace, rootScope, hintRequest, submitAnswer} = state;
    return {score, feedback, task, workspace, rootScope, hintRequest, submitAnswer: submitAnswer || {}};
  }

  bundle.defineAction('substSwapPairs', 'Workspace.Subst.SwapPairs');
  bundle.defineAction('substReset', 'Workspace.Subst.Reset');

  bundle.defineView('Workspace', WorkspaceSelector,
    Workspace(bundle.pack('substSwapPairs', 'substReset', 'showHintRequest', 'requestHint')));

  bundle.addReducer('substSwapPairs', function (state, action) {
    let {workspace} = state;
    let {editedPairs} = state.workspace;
    const {key1, value1, key2, value2} = action;
    const pairs = state
    editedPairs = {...editedPairs, [key1]: value1, [key2]: value2};
    workspace = updateWorkspace(state.workspace, {editedPairs});
    return {...state, workspace};
  });

  bundle.addReducer('substReset', function (state, action) {
    const workspace = updateWorkspace(state.workspace, {editedPairs: {}});
    return {...state, workspace};
  });

};
