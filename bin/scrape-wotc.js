const url = 'https://magic.wizards.com/en/articles/archive/mtgo-standings/pioneer-league-2019-10-28';

const axios = require('axios');
const cheerio = require('cheerio');

const stringifyCard = ({ count, name }) => `${count} ${name}`;

try {
    (async function() {
        const html = (await axios.get(url)).data;
        const $ = cheerio.load(html);
        const [, date] = $('body').attr('class').match(/page-articles-archive-mtgo-standings-.+-league-(.+) /);
        const parseRow = (i, row) => ({
            count: $(row).find('.card-count').text(),
            name: $(row).find('.card-name').text()
        });
        const decks = $('.bean_block_deck_list').map((i, deck) => {
            const [title] = $(deck).find('.deck-meta h4').text().split(' (');
            const id = $(deck).find('a[name]').attr('name');
            const deckUrl = `${url}#${id}`;
            const decklist = $(deck).find('.sorted-by-overview-container .row').map(parseRow).get();
            const sideboard = $(deck).find('.sorted-by-sideboard-container .row').map(parseRow).get();
            return {
                url: deckUrl,
                date,
                title,
                decklist: `${decklist.map(stringifyCard).join('\n')}

Sideboard:
${sideboard.map(stringifyCard).join('\n')}`,
            }
        }).get();
        console.log(decks);
    })();
}
catch (e) {
    console.error(e);
}