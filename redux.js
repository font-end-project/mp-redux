let wmpRedux = {
  preState: null,
  state: null,
  listeners: [],
  action: {},
  reducers: null,
  sagas: null,
  logger: false,
};

function createStore(reducers, sagas = null, logger = false) {
  if (!reducers) {
    throw new Error("There must be a Reducer for wmp-redux");
  }

  if (reducers) {
    if (typeof reducers !== "object") {
      throw new Error("Reducer must be a Object");
    }
    if (reducers.constructor !== Object) {
      throw new Error("Reducer must be a Object");
    }
  }

  if (sagas) {
    if (typeof sagas !== "object") {
      throw new Error("Saga must be a Object");
    }
    if (sagas.constructor !== Object) {
      throw new Error("Saga must be a Object");
    }
  }

  wmpRedux = {
    ...wmpRedux,
    reducers,
    sagas,
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
  if (typeof stateValueOf === "function") {
    wmpRedux.state = stateValueOf();
    return;
  }

  wmpRedux.state = stateValueOf;
}

function getPreState() {
  return wmpRedux.preState;
}

function setPreState(preStateValueOf) {
  if (typeof preStateValueOf === "function") {
    wmpRedux.preState = preStateValueOf();
    return;
  }

  wmpRedux.preState = preStateValueOf;
}

function setAction(action) {
  wmpRedux.action = action;
}

function subscribe(id, listener, that) {
  let bol = true;
  for (let i in wmpRedux.listeners) {
    if (wmpRedux.listeners[i].id === id) {
      bol = false;
      break;
    }
  }
  bol && wmpRedux.listeners.push({ id, listener, that });
}

function unSubscribe(id) {
  let idx = -1;
  for (let i in wmpRedux.listeners) {
    if (wmpRedux.listeners[i].id === id) {
      idx = +i;
      break;
    }
  }

  idx !== -1 && wmpRedux.listeners.splice(idx, 1);
}

function dispatch(action) {
  if (!action) {
    throw new Error("there must commit a action when use dispatch");
  }

  if (action) {
    if (typeof action !== "object") {
      throw new Error("action must be a object");
    }
    if (action.constructor !== Object) {
      throw new Error("action must be a object");
    }
  }

  setAction(action);
  setPreState(getState());
  setState(updateStore(wmpRedux.reducers, getPreState()));
  showLogger();
  notify();
  handleSagas();
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

function handleSagas() {
  const { sagas, action } = wmpRedux;

  if (sagas) {
    if (sagas[action.type]) {
      sagas[action.type].forEach((cb) => cb(getState(), action));
    }
  }
}

function updateStore(reducer, state = undefined) {
  const res = {};

  for (let i in reducer) {
    if (typeof reducer[i] === "function") {
      res[i] = reducer[i](wmpRedux.action, (state && state[i]) || undefined);
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
  unSubscribe,
};
