---
title: "Quick example: pass data to a React component and get the changed value back"
published: true
date: 2020-08-31 08:15:18
summary: An quick example how to pass data to componenents and get data from components
categories: react
thumbnail: react
tags:
  - react
  - react components
---

# ⚠ Disclaimer

This is a quick example how I pass data to a React component and get the changed data back. If there are better solutions, please let me know.

# Overview

In different cases it's neccessary to pass data to a component and get the data back. In this quick example there are two child components. One is used to determine the height of increase in the count. The other one is used to increase the count via a button click with the height of increase from the other component.

![result]({{ site.baseurl }}/img/2020-08-31-example_react_component_props_events/components_overview.png)

# Implementation

The implementation looks as follows:

## App.js

The `App.js` contains the two child components `CounterSteps.js` and `Button.js`.
From the `CounterSteps.js` the `App.js` get the height of the increase via a event and store it in the `counterSteps` state. The `counterSteps` value will be passed to `Button.js`. After each time the Button was pressed the `App.js` get the value back.

```javascript
import React, { useState } from "react";
import CounterSteps from "./CounterSteps";
import Button from "./Button";
import "./style.css";

export default function App() {
  const [counterSteps, setCounterSteps] = useState(0);
  const [count, setCount] = useState(0);

  const handleCurrentInput = currentInput => {
    setCounterSteps(currentInput);
  };

  const handleCounterIncreased = counterSteps => {
    const newCount = count + parseInt(counterSteps);
    setCount(newCount);
  };

  return (
    <div>
      <h1>Hello StackBlitz!</h1>
      <p>current counterStepsInput: {counterSteps}</p>
      <p>current count: {count}</p>
      <CounterSteps onCurrentInput={handleCurrentInput} />
      <Button
        counterSteps={counterSteps}
        onCounterIncreased={handleCounterIncreased}
      />
    </div>
  );
}
```
## CounterSteps.js

In the `CounterSteps.js` is a input field. Every change of the value will be passed via a event to the parent component.

```javascript
import React, { useState } from "react";
import PropTypes from "prop-types";
import "./style.css";

export default function CounterSteps(props) {
  const [count, setCount] = useState(0);
  const { onCurrentInput } = props;

  const handleInput = event => {
    onCurrentInput(event.target.value);
  };

  return (
    <div>
      <p>
        <input
          type="number"
          name="counterSteps"
          placeholder="counterSteps"
          onKeyDown={e => /[\+\-\.\,]$/.test(e.key) && e.preventDefault()}
          onInput={handleInput}
        />
      </p>
    </div>
  );
}

CounterSteps.propTypes = {
  onCurrentInput: PropTypes.func
};
```
## Button.js

The `Button.js` receive the height of the inccrease from the parent component. A Button click calls the event and pass the height of increase back. In the `App.js` the total count is calculated.

```javascript
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./style.css";

export default function Button(props) {
  const [counterSteps, setCounterSteps] = useState(0);
  const { onCounterIncreased } = props;

  useEffect(() => {
    setCounterSteps(props.counterSteps);
  }, [props]);

  const increaseCount = () => {
    onCounterIncreased(counterSteps);
  };

  return (
    <div>
      <button onClick={increaseCount}>increase counter</button>
    </div>
  );
}

Button.propTypes = {
  onCounterIncreased: PropTypes.func
};
```

# Result

![result]({{ site.baseurl }}/img/2020-08-31-example_react_component_props_events/result.gif)

# Coding

See the Coding on GitHub or StackBlitz:

[GitHub](https://github.com/JohannesKonings/example-react-component-props-events)

[StackBlitz](https://stackblitz.com/edit/example-react-component-props-events)








