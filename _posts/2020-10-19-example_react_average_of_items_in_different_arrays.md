---
layout:     post
title:      Quick example to get the average of items in different arrays
published:  true
date:       2020-10-19 08:15:18
summary:    Example how to calculate the average of different arrays Javascript (map, reduce, concat, ...)
categories: react
thumbnail: react
tags:
 - react
 - javascript
---

# ⚠ Disclaimer

This is a quick example how to calculate the average of different items in different arrays. If there are better solutions, please let me know.

# Overview

The data basis are three fruit baskets with different kinds of fruits an the number ot items in the basket. With a React webpage the severla baskets can be choosed and the average of the items will be calculated.

```json
const fruitBaskets = [
  {
    name: "fruitBasket1",
    fruitBasket: [
      { fruitName: "Apple", count: 5 },
      { fruitName: "Banana", count: 3 },
      { fruitName: "Strawberry", count: 9 },
      { fruitName: "Lemon", count: 7 }
    ]
  },
  {
    name: "fruitBasket2",
    fruitBasket: [
      { fruitName: "Apple", count: 5 },
      { fruitName: "Banana", count: 8 },
      { fruitName: "Lemon", count: 3 }
    ]
  },
  {
    name: "fruitBasket3",
    fruitBasket: [
      { fruitName: "Apple", count: 5 },
      { fruitName: "Banana", count: 3 },
      { fruitName: "Orange", count: 3 },
      { fruitName: "Lemon", count: 9 },
      { fruitName: "Strawberry", count: 5 }
    ]
  }
];
```

# Implementation

The implementation looks as follows:

## The webpage - App.js

The `App.js` contains the selection of the fruit baskets via a dropdown and a table for the results. The coding is [here](https://stackblitz.com/edit/example-react-average-of-items-in-different-arrays?file=src%2FApp.js).

![app.js]({{ site.baseurl }}/img/2020-10-19-example_react_average_of_items_in_different_arrays/react_frui_basket_selection.png)

## The calculation - data.js

The `data.js` contains the data of the fruit baskets and the calculation input data. The coding is [here](https://stackblitz.com/edit/example-react-average-of-items-in-different-arrays?file=src%2Fdata.js).

The calculation has three steps

### merge

### sum 

### average


# Result

![result]({{ site.baseurl }}/img/2020-10-19-example_react_average_of_items_in_different_arrays/result.gif)

# Coding

See the Coding on GitHub or StackBlitz:

[GitHub](https://github.com/JohannesKonings/example-react-average-of-items-in-different-arrays)

[StackBlitz](https://stackblitz.com/edit/example-react-average-of-items-in-different-arrays)








