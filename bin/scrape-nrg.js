const tournaments = [
  {
    urls: [
      'https://nerdragegaming.wpengine.com/decklists-archive/pioneer-nrg-ct-november-2019/',
      'http://nerdragegaming.wpengine.com/decklists-archive/pioneer-nrg-ct-november-2019/pioneer-nrg-ct-november-2019-33-64/',
      'http://nerdragegaming.wpengine.com/decklists-archive/pioneer-nrg-ct-november-2019/pioneer-nrg-ct-november-2019-65-96/',
      'http://nerdragegaming.wpengine.com/decklists-archive/pioneer-nrg-ct-november-2019/pioneer-nrg-ct-november-2019-97-128/',
      'http://nerdragegaming.wpengine.com/decklists-archive/pioneer-nrg-ct-november-2019/pioneer-nrg-ct-november-2019-129-160/',
    ],
    date: '2019-11-03',
    event: 'NRG Championship',
  },
];

const axios = require('axios');
const _ = require('lodash');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const pkgDir = require('pkg-dir');

const scrapeTournament = async tournament => {
  const { urls, date, event } = tournament;
  const deckScrapes = await Promise.all(
    urls.map(async url => {
      const html = (await axios.get(url)).data;
      const $ = cheerio.load(html);
      const decks = await Promise.all(
        $('.decklist-title, .decklist-title-text-top16')
          .map((i, decklistTitle) => {
            //const list = $(decklistTitle).next('.crystal-catalog-helper-list');
            const [, pilot, record] = $(decklistTitle)
              .find('.decklist-player-name')
              .text()
              .match(/(.+) \((.+)\)/);
            const decklistUrl = $(decklistTitle)
              .find('.decklist-download')
              .attr('href');
            return {
              url,
              event,
              record,
              date,
              pilot,
              decklistUrl,
            };
          })
          .get()
          .map(async decklist => {
            let text = decklist.decklistUrl;
            try {
              text = (await axios.get(decklist.decklistUrl)).data;
            } catch (e) {
              console.error(`Could not GET ${decklist.decklistUrl}`);
            }
            decklist.decklist = text;
            delete decklist.decklistUrl;
            return decklist;
          })
      );
      return decks;
    })
  );
  return {
    type: 'paper',
    url: tournament.urls[0],
    date,
    decks: _.flatten(deckScrapes),
  };
};

const saveTournament = async tournament => {
  const baseDir = await pkgDir(__dirname);
  console.log(
    `Scraped ${tournament.decks.length} decks from ${tournament.url}`
  );
  return fs.writeFile(
    `${baseDir}/data/decklists/paper/${tournament.date}.json`,
    JSON.stringify(tournament.decks)
  );
};

try {
  (async function() {
    (await Promise.all(tournaments.map(scrapeTournament))).forEach(
      saveTournament
    );
  })();
} catch (e) {
  console.error(e);
}
