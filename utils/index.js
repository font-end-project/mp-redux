exports.createStore = createStore;
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
exports.dispatch = dispatch;
exports.getState = getState;
exports.clearState = clearState;

exports.redux = Behavior({
  lifetimes: {
    attached() {
      subscribe(this.__wxExparserNodeId__, this.updateData, this);
      this.updateData.call(this, true);
    },
    detached() {
      unsubscribe(this.__wxExparserNodeId__);
    }
  },

  definitionFilter(defFields) {
    var selector = defFields.selector;
    if (!selector) {
      throw new Error("no selector function");
    }

    if (!defFields.methods) {
      defFields.methods = {};
    }
    defFields.methods._selector = selector;

    if (defFields.componentDidUpdate) {
      defFields.methods._componentDidUpdate = defFields.componentDidUpdate;
    }
  },

  methods: {
    updateData(isPageCome) {
      const pageData = this._selector(state);
      this.setData(pageData);

      if (!isPageCome) {
        if (this._componentDidUpdate) {
          if (preState) {
            this._componentDidUpdate(this._selector(preState));
          } else {
            this._componentDidUpdate({});
          }
        }
      }
    }
  }
});

let preState, state;
let listeners = [];
let reducers, sagas;
let action = {};

function createStore(reducer, saga) {
  reducers = reducer;
  sagas = saga || undefined;
  state = updateStore(reducers, preState);
}

function getState() {
  return JSON.parse(JSON.stringify(state));
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
  console.log(
    "prev state:",
    preState,
    "" + "\n",
    _action,
    "" + "\n",
    "next state:",
    state
  );
  notify();
  handleSagas();
}

function notify() {
  listeners.forEach(child => child.listener.call(child.that));
}

function handleSagas() {
  if (sagas) {
    if (sagas[action.type]) {
      sagas[action.type].forEach(cb => cb(state, action));
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
