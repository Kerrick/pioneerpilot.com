const fs = require('fs').promises;
const pkgDir = require('pkg-dir');
const chalk = require('chalk');
const _ = require('lodash');
const deckParser = require('./utils/deck-parser');

const containsAtLeast = (number, name, deck) => {
  const found = deck.cards.find(card => card.name === name);
  return !!found && found.number >= number;
};
const containsCounterspells = deck =>
  containsAtLeast(1, 'Dissolve', deck) ||
  containsAtLeast(1, 'Absorb', deck) ||
  containsAtLeast(1, 'Syncopate', deck) ||
  containsAtLeast(1, 'Disallow', deck) ||
  containsAtLeast(1, 'Dissipate', deck) ||
  containsAtLeast(1, 'Supreme Will', deck) ||
  containsAtLeast(1, `Dovin's Veto`, deck) ||
  containsAtLeast(1, 'Sinister Sabotage', deck);

const containsSweepers = deck =>
  containsAtLeast(1, 'Supreme Verdict', deck) ||
  containsAtLeast(1, 'Settle the Wreckage', deck) ||
  containsAtLeast(1, 'Hour of Revelation', deck) ||
  containsAtLeast(1, 'Fumigate', deck) ||
  containsAtLeast(1, `Kaya's Wrath`, deck) ||
  containsAtLeast(1, 'Drown in Sorrow', deck) ||
  containsAtLeast(1, 'Languish', deck) ||
  containsAtLeast(1, 'Cry of the Carnarium', deck) ||
  containsAtLeast(1, 'Flaying Tendrils', deck) ||
  containsAtLeast(1, 'Anger of the Gods', deck) ||
  containsAtLeast(1, 'Deafening Clarion', deck) ||
  containsAtLeast(1, 'Gates Ablaze', deck) ||
  containsAtLeast(1, `Kozilek's Return`, deck) ||
  containsAtLeast(1, 'Radiant Flames', deck) ||
  containsAtLeast(1, 'Sweltering Suns', deck);

const containsAzoriusLands = deck =>
  containsAtLeast(1, 'Glacial Fortress', deck) ||
  containsAtLeast(1, 'Hallowed Fountain', deck) ||
  containsAtLeast(1, 'Irrigated Farmland', deck) ||
  containsAtLeast(1, 'Port Town', deck) ||
  containsAtLeast(1, 'Prairie Stream', deck) ||
  containsAtLeast(1, 'Temple of Enlightenment', deck);

const containsDimirLands = deck =>
  containsAtLeast(1, 'Choked Estuary', deck) ||
  containsAtLeast(1, 'Drowned Catacomb', deck) ||
  containsAtLeast(1, 'Fetid Pools', deck) ||
  containsAtLeast(1, 'Sunken Hollow', deck) ||
  containsAtLeast(1, 'Temple of Deceit', deck) ||
  containsAtLeast(1, 'Watery Grave', deck);

const containsIzzetLands = deck =>
  containsAtLeast(1, 'Shivan Reef', deck) ||
  containsAtLeast(1, 'Spirebluff Canal', deck) ||
  containsAtLeast(1, 'Steam Vents', deck) ||
  containsAtLeast(1, 'Sulfur Falls', deck) ||
  containsAtLeast(1, 'Temple of Epiphany', deck) ||
  containsAtLeast(1, 'Wandering Fumarole', deck);

const containsOrzhovLands = deck =>
  containsAtLeast(1, 'Caves of Koilos', deck) ||
  containsAtLeast(1, 'Concealed Courtyard', deck) ||
  containsAtLeast(1, 'Godless Shrine', deck) ||
  containsAtLeast(1, 'Isolated Chapel', deck) ||
  containsAtLeast(1, 'Shambling Vent', deck) ||
  containsAtLeast(1, 'Temple of Silence', deck);

const containsRakdosLands = deck =>
  containsAtLeast(1, 'Blood Crypt', deck) ||
  containsAtLeast(1, 'Canyon Slough', deck) ||
  containsAtLeast(1, 'Dragonskull Summit', deck) ||
  containsAtLeast(1, 'Foreboding Ruins', deck) ||
  containsAtLeast(1, 'Smoldering Marsh', deck) ||
  containsAtLeast(1, 'Temple of Malice', deck);

const containsBorosLands = deck =>
  containsAtLeast(1, 'Battlefield Forge', deck) ||
  containsAtLeast(1, 'Clifftop Retreat', deck) ||
  containsAtLeast(1, 'Inspiring Vantage', deck) ||
  containsAtLeast(1, 'Needle Spires', deck) ||
  containsAtLeast(1, 'Sacred Foundry', deck) ||
  containsAtLeast(1, 'Tempmle of Triumph', deck);

const containsGruulLands = deck =>
  containsAtLeast(1, 'Cinder Glade', deck) ||
  containsAtLeast(1, 'Game Trail', deck) ||
  containsAtLeast(1, 'Rootbound Crag', deck) ||
  containsAtLeast(1, 'Sheltered Thicket', deck) ||
  containsAtLeast(1, 'Stomping Ground', deck) ||
  containsAtLeast(1, 'Temple of Abandon', deck);

const containsSimicLands = deck =>
  containsAtLeast(1, 'Botanical Sanctum', deck) ||
  containsAtLeast(1, 'Breeding Pool', deck) ||
  containsAtLeast(1, 'Hinterland Harbor', deck) ||
  containsAtLeast(1, 'Lumbering Falls', deck) ||
  containsAtLeast(1, 'Temple of Mystery', deck) ||
  containsAtLeast(1, 'Yavimaya Coast', deck);

const containsSelesnyaLands = deck =>
  containsAtLeast(1, 'Canopy Vista', deck) ||
  containsAtLeast(1, 'Fortified Village', deck) ||
  containsAtLeast(1, 'Scattered Groves', deck) ||
  containsAtLeast(1, 'Sunpetal Grove', deck) ||
  containsAtLeast(1, 'Temple Garden', deck) ||
  containsAtLeast(1, 'Temple of Plenty', deck);

const containsGolgariLands = deck =>
  containsAtLeast(1, 'Blooming Marsh', deck) ||
  containsAtLeast(1, 'Hissing Quagmire', deck) ||
  containsAtLeast(1, 'Llanowar Wastes', deck) ||
  containsAtLeast(1, 'Overgrown Tomb', deck) ||
  containsAtLeast(1, 'Temple of Malady', deck) ||
  containsAtLeast(1, 'Woodland Cemetary', deck);

const atLeastOfFactory = number => (...bools) =>
  bools.filter(Boolean).length >= number;
const noneOf = (...bools) => !bools.some(Boolean);
const atLeastOneOf = atLeastOfFactory(1);
const atLeastTwoOf = atLeastOfFactory(2);
const atLeastThreeOf = atLeastOfFactory(3);

const containsGrixisLands = deck =>
  atLeastTwoOf(
    containsDimirLands(deck),
    containsRakdosLands(deck),
    containsIzzetLands(deck)
  );

const containsBantLands = deck =>
  atLeastTwoOf(
    containsSelesnyaLands(deck),
    containsSimicLands(deck),
    containsAzoriusLands(deck)
  );

const containsEsperLands = deck =>
  atLeastTwoOf(
    containsDimirLands(deck),
    containsOrzhovLands(deck),
    containsAzoriusLands(deck)
  );

const containsAbzanLands = deck =>
  containsAtLeast(1, 'Sandsteppe Citadel', deck) ||
  atLeastTwoOf(
    containsSelesnyaLands(deck),
    containsOrzhovLands(deck),
    containsGolgariLands(deck)
  );

const tests = new Map([
  [
    'Black Aggro',
    deck =>
      containsAtLeast(14, 'Swamp', deck) &&
      containsAtLeast(3, 'Bloodsoaked Champion', deck),
  ],
  [
    'Tokens',
    deck =>
      containsAtLeast(2, 'Nissa, Voice of Zendikar', deck) &&
      atLeastOneOf(
        containsAtLeast(1, 'Raise the Alarm', deck),
        containsAtLeast(1, 'Saproling Migration', deck)
      ),
  ],
  [
    'Jeskai Ascendancy Combo',
    deck => containsAtLeast(4, 'Jeskai Ascendancy', deck),
  ],
  ['Soulflayer', deck => containsAtLeast(4, 'Soulflayer', deck)],
  [
    'Five Color Niv-Mizzet',
    deck => containsAtLeast(3, 'Niv-Mizzet Reborn', deck),
  ],
  [
    'Orzhov Midrange',
    deck =>
      containsAtLeast(4, 'Thoughtseize', deck) &&
      containsOrzhovLands(deck) &&
      noneOf(
        containsRakdosLands(deck),
        containsGolgariLands(deck),
        containsSelesnyaLands(deck),
        containsDimirLands(deck)
      ),
  ],
  [
    'Golgari Midrange',
    deck =>
      containsAtLeast(4, 'Grim Flayer', deck) &&
      noneOf(
        containsRakdosLands(deck),
        containsOrzhovLands(deck),
        containsGruulLands(deck),
        containsSelesnyaLands(deck),
        containsSimicLands(deck),
        containsDimirLands(deck)
      ),
  ],
  [
    'Grixis Dragons',
    deck =>
      containsAtLeast(4, `Silumgar's Scorn`, deck) && containsGrixisLands(deck),
  ],
  [
    'Black Devotion',
    deck => containsAtLeast(4, 'Gray Merchant of Asphodel', deck),
  ],
  [
    'Red Deck Wins',
    deck =>
      (containsAtLeast(4, 'Monastery Swiftspear', deck) ||
        containsAtLeast(4, 'Soul-Scar Mage', deck)) &&
      containsAtLeast(8, 'Mountain', deck),
  ],
  [
    'Simic Aggro',
    deck =>
      containsAtLeast(4, 'Steel Leaf Champion', deck) &&
      containsSimicLands(deck),
  ],
  [
    'Boros Aggro',
    deck =>
      containsAtLeast(4, 'Monastery Swiftspear', deck) &&
      containsBorosLands(deck),
  ],
  [
    'Gruul Monsters',
    deck =>
      atLeastTwoOf(
        containsAtLeast(1, 'Bonecrusher Giant', deck),
        containsAtLeast(1, 'Steel Leaf Champion', deck),
        containsAtLeast(1, 'Lovestruck Beast', deck),
        containsAtLeast(1, 'Ghor-Clan Rampager', deck)
      ) && containsGruulLands(deck),
  ],
  [
    'Gruul Aggro',
    deck =>
      containsAtLeast(4, 'Pelt Collector', deck) && containsGruulLands(deck),
  ],
  [
    'Lands',
    deck =>
      containsAtLeast(1, 'Scapeshift', deck) ||
      containsAtLeast(1, `Maze's End`, deck) ||
      containsAtLeast(4, 'Field of the Dead', deck),
  ],
  [
    'Green Devotion',
    deck =>
      containsAtLeast(3, 'Nykthos, Shrine to Nyx', deck) &&
      containsAtLeast(4, 'Leyline of Abundance', deck) &&
      containsAtLeast(3, 'Nissa, Who Shakes the World', deck),
  ],
  [
    'Bant Company',
    deck =>
      containsBantLands(deck) && containsAtLeast(4, 'Collected Company', deck),
  ],
  [
    'Simic Nexus',
    deck =>
      containsAtLeast(1, 'Nexus of Fate', deck) &&
      containsAtLeast(4, 'Wilderness Reclamation', deck),
  ],
  [
    'Green Aggro',
    deck =>
      containsAtLeast(8, 'Forest', deck) &&
      containsAtLeast(4, 'Pelt Collector', deck) &&
      !containsGruulLands(deck),
  ],
  ['Humans', deck => containsAtLeast(3, `Thalia's Lieutenant`, deck)],
  ['Hardened Scales', deck => containsAtLeast(3, 'Hardened Scales', deck)],
  ['Scissors', deck => containsAtLeast(3, 'Ensoul Artifact', deck)],
  [
    'Temur Midrange',
    deck =>
      containsAtLeast(1, 'Tireless Tracker', deck) &&
      containsAtLeast(1, 'Chandra, Torch of Defiance', deck) &&
      containsAtLeast(1, 'Hydroid Krasis', deck),
  ],
  [
    'Abzan Midrange',
    deck =>
      containsAtLeast(4, 'Thoughtseize', deck) &&
      containsAbzanLands(deck) &&
      noneOf(
        containsRakdosLands(deck),
        containsBorosLands(deck),
        containsGruulLands(deck)
      ),
  ],
  ['Kethis Combo', deck => containsAtLeast(3, 'Kethis, the Hidden Hand', deck)],
  [
    'Copycat',
    deck =>
      containsAtLeast(3, 'Felidar guardián', deck) &&
      containsAtLeast(3, 'Saheeli Rai', deck),
  ],
  ['Rally', deck => containsAtLeast(4, 'Rally the Ancestors', deck)],
  ['Heroic', deck => containsAtLeast(4, 'Favored Hoplite', deck)],
  ['Superfriends', deck => containsAtLeast(2, 'Interplanar Beacon', deck)],
  ['Blue Devotion', deck => containsAtLeast(4, 'Master of Waves', deck)],
  [
    'Esper Control',
    deck =>
      containsSweepers(deck) &&
      containsCounterspells(deck) &&
      containsEsperLands(deck),
  ],
  [
    'Dimir Control',
    deck =>
      containsSweepers(deck) &&
      containsCounterspells(deck) &&
      noneOf(containsAzoriusLands(deck), containsIzzetLands(deck)) &&
      containsDimirLands(deck),
  ],
  [
    'Azorius Control',
    deck =>
      containsSweepers(deck) &&
      containsCounterspells(deck) &&
      noneOf(containsDimirLands(deck), containsIzzetLands(deck)) &&
      containsAzoriusLands(deck),
  ],
  [
    'Grixis Pyromancer',
    deck =>
      containsAtLeast(4, 'Young Pyromancer', deck) && containsGrixisLands(deck),
  ],
  [
    'Grixis Midrange',
    deck =>
      !containsCounterspells(deck) &&
      containsAtLeast(4, 'Thoughtseize', deck) &&
      !containsAtLeast(1, 'Young Pyromancer', deck) &&
      containsGrixisLands(deck),
  ],
  [
    'Eldrazi',
    deck =>
      containsAtLeast(3, 'Thought-Knot Seer', deck) &&
      (containsAtLeast(1, 'Matter Reshaper', deck) ||
        containsAtLeast(1, 'Reality Smasher', deck)),
  ],
  [
    'Mardu Black',
    deck =>
      containsAtLeast(1, 'Siege Rhino', deck) &&
      containsAtLeast(1, `Kolaghan's Command`, deck),
  ],
]);

try {
  (async function() {
    const baseDir = await pkgDir(__dirname);
    const leagueDir = `${baseDir}/data/decklists/leagues`;
    const paperDir = `${baseDir}/data/decklists/paper`;
    let categorized = [];
    let uncategorized = 0;
    const decks = _.flatten(
      (await Promise.all(
        (await fs.readdir(paperDir)).map(filename =>
          fs.readFile(`${paperDir}/${filename}`)
        )
      )).map(json => JSON.parse(json))
    )
      .map(({ decklist }) => decklist)
      .forEach(decklist => {
        const parsed = deckParser.parse(decklist);
        let found = null;
        for (let [name, test] of tests) {
          if (test(parsed)) {
            found = name;
            continue;
          }
        }
        if (found) {
          categorized.push(found);
          //console.log(chalk.green(`Categorized deck "${found}"`));
          //console.log(chalk.green(decklist));
        } else {
          uncategorized++;
          console.log(chalk.bgRed(`Could not categorize deck`));
          console.log(chalk.red(decklist));
        }
      });
    console.log(
      chalk.blue(
        `Categorized ${Math.round(
          (categorized.length / (categorized.length + uncategorized)) * 100
        )}% (${categorized.length} of ${categorized.length + uncategorized})`
      )
    );
    console.log(
      chalk.blue(`Identified ${_.uniq(categorized).length} decks so far.`)
    );
    const largestCategorizedCount = _.sortBy(
      Object.values(_.countBy(categorized))
    ).reverse()[0];
    console.table(
      _.mapValues(
        _.fromPairs(
          _.reverse(
            _.sortBy(
              _.toPairs(_.countBy(categorized)),
              ([name, count]) => count
            )
          )
        ),
        n => _.repeat('=', n).padEnd(largestCategorizedCount + 1, ' ')
      )
    );
  })();
} catch (e) {
  console.error(e);
}
