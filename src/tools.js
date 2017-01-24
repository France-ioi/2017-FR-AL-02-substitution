
import React from 'react';
import EpicComponent from 'epic-component';

export default function WorkspaceBuilder (setupTools, makeRootScope) {

  return function (bundle, deps) {

    const workspaceOperations = {
      taskLoaded,
      taskUpdated,
      workspaceLoaded,
      dumpWorkspace,
      isWorkspaceReady
    };

    /* The 'init' action sets the workspace operations in the global state. */
    bundle.addReducer('init', function (state, action) {
      return {...state, workspaceOperations};
    });

    /* taskInitialized is called to update the global state when the task is first loaded. */
    function taskLoaded (state) {
      const tools = connectTools(setupTools);
      return {...state, workspace};
    }

    /* taskUpdated is called to update the global state when the task is updated. */
    function taskUpdated (state) {
      return state;
    }

    /* workspaceLoaded is called to update the global state when a workspace dump is loaded. */
    function workspaceLoaded (state, dump) {
      let {workspace} = state;
      if (dump.version === 1 && workspace.tools.length == dump.tools.length) {
        const tools = workspace.tools.map(function (tool, i) {
          return {...tool, state: tool.load(dump[i].state)};
        });
        workspace = {...workspace, tools};
        return {...state, workspace, lastWorkspace: workspace};
      }
      // TODO: indicate load error in state
      return state;
    }

    /* dumpWorkspace is called to build a serializable workspace dump.
       It should return the smallest part of the workspace that is needed to
       rebuild it.  */
    function dumpWorkspace (state) {
      const {workspace} = state;
      const tools = workspace.tools.map(tool => tool.dump(tool.state));
      return {version: 1, tools};
    }

    function isWorkspaceReady (state) {
      return !!state.workspace;
    }

    bundle.defineAction('workspaceTool', 'Workspace.Tool');
    bundle.addReducer('workspaceTool', function (state, action) {
      const workspace = toolReducer(state.workspace, action);
      return {
        ...state,
        workspace,
        unsavedChanges: true
      };
    });

    bundle.addLateReducer(function (state, action) {
      if (state.)
    });

    function WorkspaceSelector (state, props) {
      const {score, feedback, task, workspace, rootScope, hintRequest, submitAnswer} = state;
      return {score, feedback, task, workspace, rootScope, hintRequest, submitAnswer: submitAnswer || {}};
    }

    bundle.defineView('Workspace', WorkspaceSelector, EpicComponent(self => {

      // When a tool calls its dispatch prop with an action, a workspaceTool
      // action is dispatch with its 'subtype' set to the action's original type,
      // and the tool's index is added as 'toolIndex'.
      const toolDispatch = function (action) {
        self.props.dispatch({
          ...action,
          type: deps.workspaceTool,
          subtype: action.type,
          toolIndex: this.index
        });
      };

      // Maintain a cache of dispatch functions bound to each tool.
      let dispatchCache = new WeakMap();
      const getLocalDispatch = function (tool) {
        let dispatch;
        if (dispatchCache.has(tool)) {
          dispatch = dispatchCache.get(tool);
        } else {
          dispatch = toolDispatch.bind(tool);
          dispatchCache.set(tool, dispatch);
        }
        return dispatch;
      };

      self.componentWillReceiveProps = function (nextProps) {
        // Clear the cache if the dispatch function changes.
        if (nextProps.dispatch !== self.props.dispatch) {
          dispatchCache = new WeakMap();
        }
      };

      self.render = function () {
        const {rootScope, workspace, dispatch} = self.props;
        if (!workspace) {
          return <div>Workspace not loaded.</div>;
        }
        const scope = {...rootScope};
        const renderTool = function (tool) {
          const {index, wire, compute, Component, state} = tool;
          const localDispatch = getLocalDispatch(tool);
          const toolProps = {dispatch, localDispatch};
          compute(state, scope);
          Object.assign(toolProps, wire(scope, state, self.props));
          return <Component key={index} ...toolProps/>;
        };
        return <div>{workspace.tools.map(renderTool)}</div>;
      };

    }));

  };

};

const connectTools = function (setupTools) {
  const tools = [];
  const workspace = {tools};
  const addTool = function (factory, options, initialDump) {
    const index = tools.length;
    const tool = {
      index,
      options,
      reducers: {},
      props: {},
      dump: initialDump || {},
      dumpToProps: dump => props,
      propsToDump: props => dump
    };
    factory.call(tool);
    tool.props = tool.dumpToProps(tool.dump);
    tools.push(tool);
    return index;
  };
  setupTools(addTool);
  return tools;
};

/* Apply a task tool action (type prefixed with 'Task.Tool.'). */
const toolReducer = function (workspace, action) {
  const {tools} = workspace;
  const {subtype, toolIndex} = action;
  if (!subtype || typeof toolIndex !== 'number') {
    return workspace;
  }
  const tool = tools[toolIndex];
  if (!tool) {
    return workspace;
  }
  const reducer = tool.reducers[subtype];
  if (!reducer || typeof reducer !== 'function') {
    return workspace;
  }
  const newTools = tools.slice();
  const newState = reducer(tool.state, action);
  const newTool = {...tool, state: newState};
  newTools[toolIndex] = newTool;
  return {...workspace, tools: newTools};
};
