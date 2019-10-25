import { ready } from './utils/ready';

ready(() => {
  [...document.querySelectorAll('.decklist')].forEach(decklist => {
    if (!decklist.querySelector('.decklist__data')) { return; }
    console.log(decklist);

    const actions = document.createElement('div');
    actions.classList.add('decklist__actions');
    const copyButton = document.createElement('button');
    copyButton.classList.add('decklist__copy');
    copyButton.innerText = 'Copy Decklist';
    copyButton.addEventListener('click', event => {
      copyButton.innerText = 'Copied to clipboard!';
      const previousFocus = document.activeElement;
      decklist.querySelector('.decklist__data').classList.add('decklist__data--selecting');
      decklist.querySelector('.decklist__data').select();
      document.execCommand('copy');
      decklist.querySelector('.decklist__data').classList.remove('decklist__data--selecting');
      previousFocus.focus();
      setTimeout(() => copyButton.innerText = 'Copy Decklist', 2000);
    });
    actions.appendChild(copyButton);
    decklist.appendChild(actions);
  })
})
