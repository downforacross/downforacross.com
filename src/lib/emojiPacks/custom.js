import _ from 'lodash';
const emojis = {
  rilakkuma: 'http://www.stickpng.com/assets/thumbs/5a67a25201d15068bdfe87c9.png',
  rilakkuma1: 'https://i.pinimg.com/originals/1b/c3/3b/1bc33bdfd0ec831221b6ba454419001c.png',
  'rilakkuma_and_friends': 'http://www.stickpng.com/assets/images/5a67a15c01d15068bdfe87bb.png',
  pawn: 'https://www.google.com/imgres?imgurl=https%3A%2F%2Fcdn3.vectorstock.com%2Fi%2F1000x1000%2F75%2F07%2Fchess-pawn-vector-347507.jpg&imgrefurl=https%3A%2F%2Fwww.vectorstock.com%2Froyalty-free-vector%2Fchess-pawn-vector-347507&docid=L8AObIMKdgXVoM&tbnid=xc5DNeckuBfYyM%3A&vet=10ahUKEwj5oZSB8bHdAhUKllQKHbMHB3MQMwjWASgDMAM..i&w=700&h=1080&bih=617&biw=1120&q=pawn&ved=0ahUKEwj5oZSB8bHdAhUKllQKHbMHB3MQMwjWASgDMAM&iact=mrc&uact=8',
  knight: 'https://static.thenounproject.com/png/337860-200.png',
  rook: 'https://static.thenounproject.com/png/1553132-200.png',
  bishop: 'https://thenounproject.com/term/chess/337861',
  queen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLyR_o_IXIJE1-3GEqG6yPu95roaso7PNcs5lJuzmurpsQai_y3w',
  king: 'https://image.spreadshirtmedia.com/image-server/v1/mp/designs/12774644,width=178,height=178/king-chess-pieces-king.png',

  // prickly pear stolen from https://www.buzzfeed.com/generationzero/a-definitive-ranking-of-facebooks-cactus-stickers-1bx4k
  'prickly_pear_happy': 'https://img.buzzfeed.com/buzzfeed-static/static/2015-03/5/18/enhanced/webdr14/enhanced-5744-1425599687-28.jpg?downsize=715:*&output-format=auto&output-quality=auto',
  'prickly_pear_worried': 'http://123emoji.com/wp-content/uploads/2016/08/9443631487203546021.png',
  'prickly_pear_party': 'https://img.buzzfeed.com/buzzfeed-static/static/2015-03/5/18/enhanced/webdr09/enhanced-510-1425599314-5.jpg?downsize=715:*&output-format=auto&output-quality=auto',
  'prickly_pear_stressed': 'https://img.buzzfeed.com/buzzfeed-static/static/2015-03/5/18/enhanced/webdr11/enhanced-32207-1425598891-1.jpg?downsize=715:*&output-format=auto&output-quality=auto',
  'prickly_pear_book': 'https://img.buzzfeed.com/buzzfeed-static/static/2015-03/5/18/enhanced/webdr07/enhanced-31715-1425599530-19.jpg?downsize=715:*&output-format=auto&output-quality=auto',
  'prickly_pear_nerd': 'https://img.buzzfeed.com/buzzfeed-static/static/2015-03/5/18/enhanced/webdr14/enhanced-4422-1425599609-3.jpg?downsize=715:*&output-format=auto&output-quality=auto',
  'prickly_pear_grumpy': 'https://img.buzzfeed.com/buzzfeed-static/static/2015-03/5/18/enhanced/webdr02/enhanced-25477-1425599139-2.jpg?downsize=715:*&output-format=auto&output-quality=auto',
  'prickly_pear_enthusiastic': 'https://i.imgur.com/UczCbsJ.png',
  'prickly_pear_barf': 'https://img.buzzfeed.com/buzzfeed-static/static/2015-03/5/18/enhanced/webdr11/enhanced-21802-1425598766-12.jpg?downsize=715:*&output-format=auto&output-quality=auto',
  'prickly_pear_barf': 'https://img.buzzfeed.com/buzzfeed-static/static/2015-03/5/18/enhanced/webdr11/enhanced-21802-1425598766-12.jpg?downsize=715:*&output-format=auto&output-quality=auto',
};

export default _.reduce(_.keys(emojis), (r, key) => ({
  ...r,
  [key]: {
    url: emojis[key],
  },
}), {});
