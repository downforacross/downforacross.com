Todo list:

need to have
1. [done] double auction
2. [done] fixed price (ui to set price + backend) 
3. [done] deal art cards for real 
4. [done] distribute money for acquired art after a round ends 
5. [done] change your player name, change icon
6. [done] change "current auction" photo
7. [done] one offer auction should end itself but currently if the last player skips then the auction does not end. also, do not need to show `end auction`. also, there's also a bug where player 1 bids x, player 2 bids x - 1 and wins.
8. [done] hidden auction: fix bid handling. right now, last bidder wins
9. [done] double auction: [done] ending a round w/ a double doesn't work, [done] need to support case where everyone passes, [done] do not allow players to try to play two doubles, [done] enforce that both cards are same color, [done] check whether doubles are scored correctly, other validation
10. [done] prevent bid <= 0
11: [done] fixed price: force auctioneer to buy painting if everyone else refuses
12: [done] include previous valuations when distributing money
13: [done] make sure that painting goes to correct person if there's a hidden auction tie
14: [done] dealing results in duplicates

nice to have
1. maybe a way to view the full painting
2. Add link to rules in header
3. Make the `start`, `deal`, `change name` experiences prettier
4. [done] clear submit box after submission
5. show money even if there is no current auction (ie after clicking `start` game)
6. show your "investment returns" (money paid and money garnered for acquired art)  when round ends or game ends
7. add button to "hide your hand" in case youre sitting by people
8. after a double auction ends, only the non double painting remains in the "current auction" section (since we clear state.currentDouble)

card distribution:

      // yellow 12 (was: red)
      // AuctionType.DOUBLE, 2
      // AuctionType.FIXED, 2
      // AuctionType.HIDDEN, 2
      // AuctionType.OPEN, 3
      // AuctionType.ONE_OFFER, 3

      // blue 13 (was: green)
      // AuctionType.DOUBLE, 2
      // AuctionType.FIXED, 3
      // AuctionType.HIDDEN, 3
      // AuctionType.OPEN, 3
      // AuctionType.ONE_OFFER, 2

      // red 14 (was: orange)
      // AuctionType.DOUBLE, 2
      // AuctionType.FIXED, 3
      // AuctionType.HIDDEN, 3
      // AuctionType.OPEN, 3
      // AuctionType.ONE_OFFER, 3

      // green 15 (was: blue)
      // AuctionType.DOUBLE, 3
      // AuctionType.FIXED, 3
      // AuctionType.HIDDEN, 3
      // AuctionType.OPEN, 3
      // AuctionType.ONE_OFFER, 3

      // orange 16 (was: yellow)
      // AuctionType.DOUBLE, 3
      // AuctionType.FIXED, 3
      // AuctionType.HIDDEN, 3
      // AuctionType.OPEN, 4
      // AuctionType.ONE_OFFER, 3