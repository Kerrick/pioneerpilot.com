import { ready } from './utils/ready';

ready(() => {
  [...document.querySelectorAll('.mid-article-response')].forEach(mar => {
    const tweetText = decodeURIComponent(mar.querySelector('.mid-article-response__tweet').getAttribute('href').split('text=')[1]);
    console.log(tweetText);
    const [tweetPrefix, tweetContent] = tweetText.split('...').map(s => s.trim());
    const tweetSeparator = '… ';
    console.log(tweetPrefix, tweetContent);
    mar.removeChild(mar.querySelector('.mid-article-response__tweet'));
    const form = document.createElement('form');
    form.classList.add('mid-article-response__form');
    form.innerHTML = `<label class="mid-article-response__form-label">
<textarea class="mid-article-response__form-response" maxlength="${280 - tweetPrefix.length - tweetSeparator.length}">${tweetContent}</textarea>
<button class="mid-article-response__form-submit" type="submit">Post Comment</button>
</label>`;
    form.addEventListener('submit', event => {
      window.open(
        `https://twitter.com/intent/tweet?text=${tweetPrefix}${tweetSeparator}${event.target.querySelector('.mid-article-response__form-response').value}`,
        '',
        'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=600,height=280'
        );

      event.preventDefault();
      return false;
    });
    mar.appendChild(form);
  });
})
