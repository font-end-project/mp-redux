import { getType } from "./util";

let wmpRedux = {
  preState: null,
  state: null,
  listeners: [],
  action: {},
  reducers: null,
  effects: null,
  logger: false,
};

function createStore(reducers, effects = null, logger = false) {
  if (!reducers) {
    throw new Error("There must be a Reducer for wmp-redux");
  }

  if (reducers) {
    if (getType(reducers) !== "Object") {
      throw new Error("Reducer must be a Object");
    }
  }

  if (effects) {
    if (getType(effects) !== "Object") {
      throw new Error("Effects must be a Object");
    }
  }

  wmpRedux = {
    ...wmpRedux,
    reducers,
    effects,
    logger,
  };

  initStore();
}

function initStore() {
  setState(updateStore(wmpRedux.reducers, getPreState()));
}

function getState() {
  return wmpRedux.state;
}

function setState(stateValueOf) {
  if (getType(stateValueOf) === "Function") {
    wmpRedux.state = stateValueOf();
    return;
  }

  wmpRedux.state = stateValueOf;
}

function getPreState() {
  return wmpRedux.preState;
}

function setPreState(preStateValueOf) {
  if (getType(preStateValueOf) === "Function") {
    wmpRedux.preState = preStateValueOf();
    return;
  }

  wmpRedux.preState = preStateValueOf;
}

function setAction(action) {
  wmpRedux.action = action;
}

function subscribe(id, listener, that) {
  const { listeners } = wmpRedux;

  let bol = true;
  for (let i in listeners) {
    if (listeners[i].id === id) {
      bol = false;
      break;
    }
  }

  bol && listeners.push({ id, listener, that });
}

function unsubscribe(id) {
  const { listeners } = wmpRedux;

  let idx = -1;
  for (let i in listeners) {
    if (listeners[i].id === id) {
      idx = +i;
      break;
    }
  }

  idx !== -1 && listeners.splice(idx, 1);
}

function dispatch(action) {
  if (!action) {
    throw new Error("there must commit a action when use dispatch");
  }

  if (getType(action) !== "Object") {
    throw new Error("action must be a object");
  }

  setAction(action);
  setPreState(getState());
  setState(updateStore(wmpRedux.reducers, getPreState()));
  showLogger();
  notify();
  handleEffects();
}

function showLogger() {
  const { logger, action } = wmpRedux;

  if (logger) {
    console.log(
      "prev state:",
      getPreState(),
      "" + "\n",
      action,
      "" + "\n",
      "next state:",
      getState()
    );
  }
}

function notify() {
  wmpRedux.listeners.forEach((child) => child.listener.call(child.that));
}

function handleEffects() {
  const { effects, action } = wmpRedux;

  if (effects) {
    if (effects[action.type]) {
      effects[action.type].forEach((cb) => cb(getState(), action));
    }
  }
}

function updateStore(reducer, state = undefined) {
  const res = {};

  for (let i in reducer) {
    if (getType(reducer[i]) === "Function") {
      res[i] = reducer[i]((state && state[i]) || undefined, wmpRedux.action);
    } else {
      res[i] = updateStore(reducer[i], (state && state[i]) || undefined);
    }
  }

  return res;
}

function clearState() {
  setPreState(getState());
  setAction({});
  setState(updateStore(wmpRedux.reducers));
  notify();
}

export {
  createStore,
  getState,
  getPreState,
  dispatch,
  clearState,
  subscribe,
  unsubscribe,
};
