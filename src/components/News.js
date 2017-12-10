import './css/news.css';
import React from 'react';

const NEWS_ITEMS = [
  {
    date: '11/27/2017',
    message: <span>Check out our new companion Chrome Extension, <span style={{fontWeight: 600}}>Download a Cross</span>! Available on the <a target="_blank" rel="noopener noreferrer" href="https://chrome.google.com/webstore/detail/download-a-cross/idbdbedhgabnbjfjecpflfomnklpllen?hl=en">Chrome Web Store</a>.</span>,
    hidden: false,
  },
  {
    date: '11/27/2017',
    message: 'Hope you\'re enjoying the site! New updates will be posted here from now on!',
    hidden: false,
  },
];

function NewsItem({date, message, hidden}) {
  if (hidden) return null;
  return (
    <div className='news--item'>
      <div className='news--item--date'>
        {date}
      </div>
      <div className='news--item--message'>
        {message}
      </div>
    </div>
  );
}

export default function News() {
  return (
    <div className='news'>
      <div className='news--title'>
        Announcements
      </div>
      {NEWS_ITEMS.map((item, i) =>
        <NewsItem key={i} {...item} />
        )}
    </div>
  );
}
