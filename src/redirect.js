let redirected = false;
export default (url, message = 'Redirecting...') => {
  if (redirected) return;
  redirected = true;
  alert(message);
  window.location.replace(url);
};


