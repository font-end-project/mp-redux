import { subscribe, unsubscribe, getState, getPreState } from "./redux";
import { getType, isEqualForArray } from "./util";

const connect = Behavior({
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

    if (defFields.stateUpdated) {
      defFields.methods._stateUpdated = defFields.stateUpdated;
    }
  },

  methods: {
    _checkState(isAttached) {
      const result = this._selector(this.data);

      if (!result || (!isAttached && !result.needUpdate)) {
        return;
      }

      this._updateData(result);
    },
    _updateData(result) {
      const { pageState, prePageState } = result;

      pageState && this.setData(pageState);

      if (this._stateUpdated) {
        if (prePageState) {
          this._stateUpdated(prePageState);
        }
      }
    },
  },
});

function stateSelector(_createSelector, data) {
  if (data && getType(data) !== "Object") {
    throw new Error(
      "the second arg of stateSelector should be object or undefined"
    );
  }

  return _createSelector(data);
}

function createSelector(...args) {
  return (data) => {
    if (!args || (args && args.length <= 1)) {
      return null;
    }

    const devFnList = args.slice(0, -1);
    const renderFn = args[args.length - 1];

    const devResList = devFnList.map((getDev) => getDev(getState(), data));

    if (!getPreState()) {
      return { needUpdate: false, pageState: renderFn(...devResList) };
    }

    const preDevResList = devFnList.map((getDev) =>
      getDev(getPreState(), data)
    );

    const needUpdate = !isEqualForArray(devResList, preDevResList);

    return {
      needUpdate,
      pageState: renderFn(...devResList),
      prePageState: needUpdate ? renderFn(...preDevResList) : null,
    };
  };
}

export { connect, stateSelector, createSelector };
