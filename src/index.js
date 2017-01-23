
import runTask from 'alkindi-task-lib';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Task from './task';
import AnswerDialog from './answer_dialog';
import WorkspaceBuilder from './tools';
import {setupTools, makeRootScope} from './tools/index';

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

  bundle.include(WorkspaceBuilder(setupTools, makeRootScope));

};
