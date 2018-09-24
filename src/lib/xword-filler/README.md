# xword-filler

## API

`fillGrid(partialGrid, wordlist)`

**partialGrid**: _rows_ by _cols_ array of `Cell` types, where `Cell` is an object of shape `{value, pencil}`

**wordlist**: The pre-randomized word list to use. Should be of shape `{[word]: { score, stdev }}`. Defaults to `DEFAULT_WORDLIST`.

**returns**: `grid`, which has the same shape as `partialGrid`. New cells will be `pencil: true`.

If it's impossible to find a satisfactory fill of the grid (without resorting to inventing new english words), we will return a `grid` with empty cells.

## Overview

Given an input grid, e.g.

```
ABC .
    .


..
```

return a randomly generated grid that matches the existing pattern, e.g.

```
ABCD.
HOOP.
EARLY
MTGII
..AXZ
```

The goal will be to maximize the "score" of the crossword.

## How is score defined?

The score of a grid will be a function of the set of words used to fill the puzzle.
We will use a scored wordlist (a dictionary that maps from `string`s to `int`s), and maximize the sum of the scores.

For example, your wordlist might be

```
EGG (5)
HOUSE (4)
SQUISH (6)
OLEO (2)
ARIA (3)
OTOE (1)
ALOE (3)
```

Then a grid containing words "EGG", "HOUSE", and "OLEO" (note: it's actually impossible to actually fill a grid with exactly just 3 words) will be
`5 + 4 + 2 = 11`.

## How do we do the search?

Since the search space is large (e.g. for a 7x7 grid, 26^49 possible ways to fill it with english letters), we aggressively prune the search.

_Work in Progress_

We use the following **grid heuristic** to rank candidate partial-grids:

- For each entry in the grid, we assign a _fillability_ score to it.
- Fillability of a partially filled entry is some function of the number of matches it has.
- The overall heurisitic of the grid is an aggregation of the fillabilities.

This heuristic is a measure of how much flexibility the unfilled parts of the grid have.

We use the following **entry heuristic** to hint the search algorithm the best entry to iterate on when deepening the search.

- For each entry, compute the fillability and report that as its constrained-ness.

This heuristic describes how constrained each entry is within a grid.

The search algorithm will be a variant of beam search, with K ~ 100, C ~ 3.

- Maintain a list of K candidate grids
- For each grid, generate a list of C children grids (by using the constrained-ness heuristic to pick, for each candidate, an entry to iterate through the matches of)
- Of the C \* K resulting children grids, select the best K (by using the fillability-heuristic) of them to be the next iteration's candidate grids
