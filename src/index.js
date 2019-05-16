import algoreaReactTask from "./algorea_react_task";
import {createWorkspace, updateWorkspace, exportText} from "./utils";

import "normalize.css";
import "font-awesome/css/font-awesome.css";
import "bootstrap/dist/css/bootstrap.css";
import "./style.css";
import "./platform.css";
import "rc-tooltip/assets/bootstrap.css";

import WorkspaceBundle from "./workspace_bundle";

const TaskBundle = {
  actionReducers: {
    appInit: appInitReducer,
    taskInit: taskInitReducer /* possibly move to algorea-react-task */,
    taskRefresh: taskRefreshReducer /* possibly move to algorea-react-task */,
    taskAnswerLoaded: taskAnswerLoaded,
    taskStateLoaded: taskStateLoaded
  },
  includes: [WorkspaceBundle],
  selectors: {
    getTaskState,
    getTaskAnswer
  }
};

if (process.env.NODE_ENV === "development") {
  /* eslint-disable no-console */
  TaskBundle.earlyReducer = function (state, action) {
    console.log("ACTION", action.type, action);
    return state;
  };
}

function appInitReducer (state, _action) {
  const taskMetaData = {
    id: "http://concours-alkindi.fr/tasks/2018/enigma",
    language: "fr",
    version: "fr.01",
    authors: "Sébastien Carlier",
    translators: [],
    license: "",
    taskPathPrefix: "",
    modulesPathPrefix: "",
    browserSupport: [],
    fullFeedback: true,
    acceptedAnswers: [],
    usesRandomSeed: true
  };
  return {...state, taskMetaData};
}

function taskInitReducer (state, _action) {
  const dump = {editedPairs: {}};
  return {
    ...state,
    dump,
    workspace: updateWorkspace(
      state.taskData,
      createWorkspace(state.taskData),
      dump
    ),
    taskReady: true
  };
}

function taskRefreshReducer (state, _action) {
  return {
    ...state,
    workspace: updateWorkspace(
      state.taskData,
      createWorkspace(state.taskData),
      state.dump
    )
  };
}

function getTaskAnswer (state) {
  const clearText = exportText(state.workspace.clearText);
  const dump = state.dump;
  return {clearText, dump};
}

function taskAnswerLoaded (
  state,
  {
    payload: {
      answer: {dump}
    }
  }
) {
  return {
    ...state,
    dump,
    workspace: updateWorkspace(state.taskData, state.workspace, dump)
  };
}

function getTaskState (_state) {
  return {};
}

function taskStateLoaded (state, {payload: {_dump}}) {
  return state;
}

export function run (container, options) {
  return algoreaReactTask(container, options, TaskBundle);
}
