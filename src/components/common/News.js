import './css/news.css';
import React from 'react';
import Emoji from './Emoji';

const NEWS_ITEMS = [
  {
    date: '09/01/2018',
    message: (
      <span>
        Interested in testing out new features? Check out DFAC 
        {' '}
        <a href="/beta">beta</a>
        ! Any
        {' '}
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdVg3TyUfQkR9WggQw1YFbMeVATczq8gkwf1yXCKCn4LLKN_Q/viewform">
          feedback
        </a>
        {' '}
        helps 
        {' '}
        <Emoji emoji="prickly_pear_enthusiastic" />
        {' '}
      </span>
    ),
    hidden: false,
  },
  {
    date: '12/25/2017',
    message: <span>Log in with Facebook to view and track your game history. Merry Christmas!</span>,
    hidden: false,
  },
  {
    date: '11/27/2017',
    message: (
      <span>
        Check out our new companion Chrome Extension, 
        {' '}
        <span style={{fontWeight: 600}}>Download a Cross</span>
        !
        Available on the
        {' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://chrome.google.com/webstore/detail/download-a-cross/idbdbedhgabnbjfjecpflfomnklpllen?hl=en"
        >
          Chrome Web Store
        </a>
        .
      </span>
    ),
    hidden: false,
  },
  {
    date: '11/27/2017',
    message: "Hope you're enjoying the site! New updates will be posted here from now on!",
    hidden: false,
  },
];

function NewsItem({date, message, hidden}) {
  if (hidden) return null;
  return (
    <div className="news--item">
      <div className="news--item--date">{date}</div>
      <div className="news--item--message">{message}</div>
    </div>
  );
}

export default function News() {
  return (
    <div className="news">
      <div className="news--title">Announcements</div>
      {NEWS_ITEMS.map((item, i) => (
        <NewsItem key={i} {...item} />
      ))}
    </div>
  );
}
