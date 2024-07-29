import * as React from 'react';
import { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import {
  goBack,
  goTo,
  popToTop,
  Link,
  Router,
  getCurrent,
  getComponentStack,
} from 'react-chrome-extension-router';

import Login from './pages/auth/Login.js';
import Timer from './components/Timer.js';

const Three = ({ message }: any) => (
  <div onClick={() => popToTop()}>
    <h1>{message}</h1>
    <p>Click me to pop to the top</p>
  </div>
);

const Two = ({ message }: any) => (
  <div>
    This is component Two. I was passed a message:
    <p>{message}</p>
    <button onClick={() => goBack()}>
      Click me to go back to component One
    </button>
    <button onClick={() => goTo(Three, { message })}>
      Click me to go to component Three!
    </button>
  </div>
);

const One = () => {
  return (
    <div>
    <Link component={Login} props={{ message: 'I came from component one!' }}>
      Login
    </Link>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const { component, props } = getCurrent();
    console.log(
      component
        ? `There is a component on the stack! ${component} with ${props}`
        : `The current stack is empty so Router's direct children will be rendered`
    );
    const components = getComponentStack();
    console.log(`The stack has ${components.length} components on the stack`);
  }, []);

  return (
    <>
      <Router>
        <One />
      </Router>
      <Timer />
    </>
  );
};

export default App;
