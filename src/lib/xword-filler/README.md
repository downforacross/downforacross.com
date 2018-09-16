# xword-filler

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

## API

TODO.

If it's impossible to find a satisfactory fill of the grid (without resorting to inventing new english words), we will indicate this fact, somehow.
