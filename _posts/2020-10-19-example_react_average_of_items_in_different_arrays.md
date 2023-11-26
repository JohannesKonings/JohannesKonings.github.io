---
layout:     post
title:      Quick example to get the average of items from different arrays
published:  true
date:       '2020-10-19 08:15:18'
summary:    Example how to calculate the average of different arrays Javascript (map, reduce, concat, ...)
categories: react
thumbnail: react
tags:
 - react
 - javascript
---

# ⚠ Disclaimer

This is a quick example how to calculate the average of different items from different arrays. If there are better solutions, please let me know.

# Overview

The data basis are three fruit baskets with different kinds of fruits an the number ot items in the basket. With a React webpage the several baskets can be choosed and the average of the items will be calculated.

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

The calculation has three steps and is described with the baskets 1 and 2 and is in this format.

```json
  [
    [
      { fruitName: "Apple", count: 5 },
      { fruitName: "Banana", count: 3 },
      { fruitName: "Strawberry", count: 9 },
      { fruitName: "Lemon", count: 7 }
    ],
    [
      { fruitName: "Apple", count: 5 },
      { fruitName: "Banana", count: 8 },
      { fruitName: "Lemon", count: 3 }
    ]
  ]
```  

### merge

Basket 1 and 2 are selected. This two arrays will be merged with this coding.

```javascript
  selectedFruitBaskets.forEach(selectedFruitBasket => {
    const found = fruitBaskets.find(
      fruitBasket => fruitBasket.name === selectedFruitBasket.name
    );
    fruits.push(found.fruitBasket);
  });

  const basketCounts = fruits.length;

  const mergedBasket = [].concat(...fruits);
  ```

  **After**

```json
  [
    { fruitName: "Apple", count: 5 },
    { fruitName: "Banana", count: 3 },
    { fruitName: "Strawberry", count: 9 },
    { fruitName: "Lemon", count: 7 },
    { fruitName: "Apple", count: 5 },
    { fruitName: "Banana", count: 8 },
    { fruitName: "Lemon", count: 3 }
  ]
```

### sum 

At this step the number of fruits of each kind will be summed

```javascript
  const basketSum = mergedBasket.reduce((acc, curr) => {
    if (!acc[curr.fruitName]) {
      acc[curr.fruitName] = { ...curr, countInBaskets: 1, sum: curr.count };
      return acc;
    }
    acc[curr.fruitName].countInBaskets += 1;
    acc[curr.fruitName].sum += curr.count;

    return acc;
  }, {});
```
  **After**

```json
{
    "Apple": {
        "count": 5,
        "countInBaskets": 2,
        "fruitName": "Apple",
        "sum": 10
    },
    "Banana": {
        "count": 3,
        "countInBaskets": 2,
        "fruitName": "Banana",
        "sum": 11
    },
    "Lemon": {
        "count": 7,
        "countInBaskets": 2,
        "fruitName": "Lemon",
        "sum": 10
    },
    "Strawberry": {
        "count": 9,
        "countInBaskets": 1,
        "fruitName": "Strawberry",
        "sum": 9
    }
}
```

### average

After the summation the average can be calulated.

```javascript
  const basketAverage = Object.keys(basketSum).map(fruitName => {
    const item = basketSum[fruitName];
    return {
      fruitName: item.fruitName,
      averageCountOverall: item.sum / basketCounts,
      averageCountWithMinOne: item.sum / item.countInBaskets,
      sum: item.sum
    };
  });
  return basketAverage;
```

  **After**

```json
[
    {
        "averageCountOverall": 5,
        "averageCountWithMinOne": 5,
        "fruitName": "Apple",
        "sum": 10
    },
    {
        "averageCountOverall": 5.5,
        "averageCountWithMinOne": 5.5,
        "fruitName": "Banana",
        "sum": 11
    },
    {
        "averageCountOverall": 4.5,
        "averageCountWithMinOne": 9,
        "fruitName": "Strawberry",
        "sum": 9
    },
    {
        "averageCountOverall": 5,
        "averageCountWithMinOne": 5,
        "fruitName": "Lemon",
        "sum": 10
    }
]
```

# Result

![result]({{ site.baseurl }}/img/2020-10-19-example_react_average_of_items_in_different_arrays/result.gif)

# Coding

See the Coding on GitHub or StackBlitz:

[GitHub](https://github.com/JohannesKonings/example-react-average-of-items-in-different-arrays)

[StackBlitz](https://stackblitz.com/edit/example-react-average-of-items-in-different-arrays)








