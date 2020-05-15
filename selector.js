import { subscribe, unsubscribe, getState, getPreState } from "./redux";

const redux = Behavior({
  lifetimes: {
    attached() {
      subscribe(this.__wxExparserNodeId__, this._checkState, this);
      this._checkState.call(this, true);
    },
    detached() {
      unsubscribe(this.__wxExparserNodeId__);
    },
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

    if (defFields.stateDidUpdate) {
      defFields.methods._stateDidUpdate = defFields.stateDidUpdate;
    }
  },

  methods: {
    _checkState(isAttached) {
      const result = this._selector(this.data);

      if (!result) {
        return;
      }

      this._updateData(result, isAttached);
    },
    _updateData(result, isAttached) {
      const { pageState, prePageState } = result;

      pageState && this.setData(pageState);

      if (!isAttached) {
        if (this._stateDidUpdate) {
          if (prePageState) {
            this._stateDidUpdate(prePageState);
          } else {
            this._stateDidUpdate({});
          }
        }
      }
    },
  },
});

function stateSelector(_createSelect, data) {
  if (data && typeof data !== "object") {
    throw new Error(
      "the second arg of stateSelector should be object or undefined"
    );
  }
  if (data && data.constructor !== Object) {
    throw new Error(
      "the second arg of stateSelector should be object or undefined"
    );
  }

  return _createSelect(data || {});
}

function createSelect(...args) {
  return (data) => {
    if (!args || (args && args.length <= 1)) {
      return null;
    }

    const devs = args.slice(0, -1);
    const cb = args[args.length - 1];

    const devsList = devs.map((getDev) => getDev(getState(), data));

    if (!getPreState()) {
      return { pageState: cb(...devsList) };
    }

    const preDevsList = devs.map((getDev) => getDev(getPreState(), data));

    let needUpdate = false;
    const length = devsList.length;
    for (let i = 0; i < length; i++) {
      if (devsList[i] !== preDevsList[i]) {
        needUpdate = true;
        break;
      }
    }

    if (needUpdate) {
      return { pageState: cb(...devsList), prePageState: cb(...preDevsList) };
    } else {
      return null;
    }
  };
}

export { redux, stateSelector, createSelect };
