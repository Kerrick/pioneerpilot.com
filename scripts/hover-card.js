import { ready } from './utils/ready';

ready(() => {
  document.body.addEventListener('mouseover', event => {
    if (event.target.tagName !== 'A' || !event.target.getAttribute('href') || !event.target.getAttribute('href').startsWith('https://scryfall.com/card/') || event.target.querySelector('img')) { return; }

    const [, set, number] = event.target.getAttribute('href').match(/https:\/\/scryfall.com\/card\/(\w+)\/(\d+)(\/.*|$)/);
    const png = `https://api.scryfall.com/cards/${set}/${number}/?format=image&version=png`;
    const img = document.createElement('img');
    img.src = png;
    img.className = 'hover-zoom';
    // TODO: Make sure the images don't go off screen for a better user experience.
    img.style.top = `${event.clientY + 10}px`
    img.style.left = `${event.clientX + 10}px`
    document.body.appendChild(img);
    const listener = event.target.addEventListener('mouseleave', leaveEvent => {
      img.remove();
      leaveEvent.target.removeEventListener('mouseleave', listener);
    });
  });
})
