import _ from 'lodash';

// input { a: 'bcd', ... }
// returns { a: { url: 'bcd' }, ... }
export const parseRawUrls = (urls) =>
  _.reduce(
    _.keys(urls),
    (r, key) => ({
      ...r,
      [key]: {
        url: urls[key],
      },
    }),
    {}
  );
