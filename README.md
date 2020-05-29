微信小程序的类Redux工具，可以像react-redux一样，state改变自动更新到页面、组件。
PS：本程序纯属练习之用，工作之余写的

安装：
```
yarn add wmp-redux
```

使用：
```
// app.js
import Redux from 'wmp-redux’;
import Reducer from ‘../reducers/index’;
import Effects from ‘../effects/index’;

Redux.createStore(Reducer[, Effects, true(false)])     // 第三个参数代表是否使用类似redux-logger的功能
```

wmp-redux的action与redux的action完全一样

reducer 示例：
```
// reducers/user.js
const accountInitialState = {
  isLogin: false
};

function accountReducer(action, state = accountInitialState) 
  switch (action.type) {
    case "LOGIN": {
      return {
        ...state,
      };
    }

    case "LOGIN_COMPLETION": {
      const { error } = action;
      if (error) {
        return {
          ...state,
          isLogin: false
        };
      }
  
      return {
        ...state,
        isLogin: true
      };
    }

    default:
      return state;
  }
}

export default {
  user: {
    account: accountReducer;
  }
}
```
```
// reducers/index.js
import account from “./user";
const reducers = Object.assign({}, user);

export default reducers;
```

Effects 使用 async/await处理异步，简单，便捷
```
// effects/user.js
import Redux from "wmp-redux";
import { loginCompletion } from "../actions/index";
import { requestLogin } from "../utils/util”;
const { dispatch } = Redux;

const watchLogin = {
  action: "LOGIN”,      // LOGIN，即action的type，dispatch action后会执行Saga[action.type]的全部effect
  effect: async () => {
    const res = await requestLogin();

    if (res.code !== 0) {
      dispatch(loginCompletion("error"));
      return;
    }

    dispatch(loginCompletion());
  },
};

export default [watchLogin];
```

```
// effects/index.js
import userEffect from “./user";

function initEffect(…effectList) {
  return effectList.flat(2).reduce((acc, cur) => {
    if (acc[cur.action]) {
      acc[cur.action].push(cur.effect);
    } else {
      acc[cur.action] = [cur.effect];
    }

    return acc;
  }, {});
}

export default initEffect(userEffect);

// 最终Effects 结构：
{
  ‘LOGIN’: [function, function],
  ‘LOAD_USER_DETAIL’: [function, function],
  ...
}
```


页面、组件使用：
```
import Redux from "wmp-redux";
import { actions } from "app-libs”;
const { connect, dispatch, stateSelector, createSelector } = Redux;
const { login } = actions;

// 与 reselect 相似
const selector = createSelector(
  (state) => state.user.account,
  (_, data) => data.num,
  (account, num) => {
    const { isLogin } = account;
    const numAdd = num + 5;

    return {
      isLogin,
      numAdd,
    };
  }
);

Component({
  behaviors: [connect],
  selector: (data) => stateSelector(selector, data),

  data: {
    num: 5,
  },

  stateUpdated: function (preState) {
    const { isLogin } = this.data;

    if (preState.isLogin !== isLogin) {
      if (isLogin) {
        console.log('成功登录');
      }
    }
  },

  methods: {
    handleLogin() {
      dispatch(Login());
    },

    handlePrint() {
      console.log(this.data);   // { aa: ‘aa’, isLogin: false, numAdd: 10 }
    },
  },
});
```

使用 wmp-redux 的 connect 功能，必须是 Component 构造器

stateUpdated(preState) 是当前页面组件需要的状态变动的监听，preState为上一份selector的return数据
