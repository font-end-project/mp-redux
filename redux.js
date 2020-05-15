let preState, state;
let listeners = [];
let reducers, sagas;
let action = {};
let logger = false;

function createStore(reducer, saga, needLogger) {
  needLogger && (logger = true);
  reducers = reducer;
  sagas = saga || undefined;

  state = updateStore(reducers, preState);
}

function getState() {
  return state;
}

function getPreState() {
  return preState;
}

function subscribe(id, listener, that) {
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
  let idx = -1;
  for (let i in listeners) {
    if (listeners[i].id === id) {
      idx = +i;
      break;
    }
  }

  idx !== -1 && listeners.splice(idx, 1);
}

function dispatch(_action) {
  action = _action;
  preState = state;
  state = updateStore(reducers, preState);

  logger && showLogger();

  notify();
  handleSagas();
}

function showLogger() {
  console.log(
    "prev state:",
    preState,
    "" + "\n",
    action,
    "" + "\n",
    "next state:",
    state
  );
}

function notify() {
  listeners.forEach((child) => child.listener.call(child.that));
}

function handleSagas() {
  if (sagas) {
    if (sagas[action.type]) {
      sagas[action.type].forEach((cb) => cb(state, action));
    }
  }
}

function updateStore(reducer, state) {
  const res = {};
  for (let i in reducer) {
    if (typeof reducer[i] === "function") {
      if (state && state[i]) {
        res[i] = reducer[i](action, state[i]);
      } else {
        res[i] = reducer[i](action);
      }
    } else {
      if (state && state[i]) {
        res[i] = updateStore(reducer[i], state[i]);
      } else {
        res[i] = updateStore(reducer[i]);
      }
    }
  }
  return res;
}

function clearState() {
  preState = state;
  action = {};
  state = updateStore(reducers);
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
