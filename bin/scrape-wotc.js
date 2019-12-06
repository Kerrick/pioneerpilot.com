const leagues = ['2019-10-28', '2019-10-31'];
const leagueUrl = date =>
  `https://magic.wizards.com/en/articles/archive/mtgo-standings/pioneer-league-${date}`;

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const pkgDir = require('pkg-dir');

const stringifyCard = ({ count, name }) => `${count} ${name}`;

const scrapeLeague = async date => {
  const url = leagueUrl(date);
  const html = (await axios.get(url)).data;
  const $ = cheerio.load(html);
  const parseRow = (i, row) => ({
    count: $(row)
      .find('.card-count')
      .text(),
    name: $(row)
      .find('.card-name')
      .text(),
  });
  const decks = $('.bean_block_deck_list')
    .map((i, deck) => {
      const [pilot] = $(deck)
        .find('.deck-meta h4')
        .text()
        .split(' (');
      const id = $(deck)
        .find('a[name]')
        .attr('name');
      const deckUrl = `${url}#${id}`;
      const decklist = $(deck)
        .find('.sorted-by-overview-container .row')
        .map(parseRow)
        .get();
      const sideboard = $(deck)
        .find('.sorted-by-sideboard-container .row')
        .map(parseRow)
        .get();
      return {
        url: deckUrl,
        event: 'MTGO League',
        record: '5-0',
        date,
        pilot,
        decklist: `${decklist.map(stringifyCard).join('\n')}

Sideboard:
${sideboard.map(stringifyCard).join('\n')}`,
      };
    })
    .get();
  return {
    type: 'league',
    date,
    decks,
  };
};

const saveLeague = async league => {
  const baseDir = await pkgDir(__dirname);
  return fs.writeFile(
    `${baseDir}/data/decklists/leagues/${league.date}.json`,
    JSON.stringify(league.decks)
  );
};

try {
  (async function() {
    (await Promise.all(leagues.map(scrapeLeague))).forEach(saveLeague);
  })();
} catch (e) {
  console.error(e);
}
