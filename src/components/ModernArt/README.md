Todo list:

need to have
1. [half] double auction (need to add validation, need to support case where everyone passes)
2. fixed price (ui to set price + backend) 
3. [done] deal art cards for real 
4. [done] distribute money for acquired art after a round ends 
5. [done] change your player name, change icon
6. [done] change "current auction" photo
7. one offer auction should end itself (do not show `end auction`)

nice to have
1. maybe a way to view the full painting
2. Add link to rules in header
3. Make the `start`, `deal`, `change name` experiences prettier
4. [done] clear submit box after submission
5. show money even if there is no current auction (ie after clicking `start` game)
6. show your "investment returns" (money paid and money garnered for acquired art)  when round ends or game ends

random:

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