
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const atonic = require('atonic');

const GEONAMES_USERNAME = process.env.GEONAMES_USERNAME;
const START_COUNTRY = process.env.START_COUNTRY;

if (!GEONAMES_USERNAME) {
    throw new Error(`env GEONAMES_USERNAME is required`);
}

function generate() {
    return fetch('https://raw.githubusercontent.com/mledoze/countries/master/countries.json')
        .then(response => response.json())
        .then(data => saveData(data));
}

function saveData(items) {
    const DATA = {};

    if (START_COUNTRY) {
        const languages = require('../data/languages.json');
        for (let lang of languages) {
            DATA[lang] = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', lang + '.json'), 'utf8'));
        }
        items = items.slice(items.findIndex(item => item.cca2.toLowerCase() === START_COUNTRY.toLowerCase()));
    }

    function mergeData(item) {
        // console.log('merge item', item);
        for (let lang of Object.keys(item.names)) {
            DATA[lang] = DATA[lang] || {};
            const country = item.cca2.toLowerCase().substr(0, 2);
            DATA[lang][country] = DATA[lang][country] || [];
            DATA[lang][country] = DATA[lang][country].concat(item.names[lang]);
        }
    }

    return seriesPromise(items, item => formatCountryData(item).then(r => mergeData(r)))
        .then(() => {
            const languages = Object.keys(DATA).sort();
            const file = path.join(__dirname, '..', 'data', 'languages.json');
            fs.writeFileSync(file, JSON.stringify(languages), 'utf8');

            for (let lang of languages) {
                const data = DATA[lang];
                for (let country of Object.keys(data)) {
                    // concat atonic names
                    data[country] = data[country].concat(data[country].map(item => atonic(item)));
                    // uniq names
                    data[country] = uniq(data[country]);
                }

                const file = path.join(__dirname, '..', 'data', lang + '.json');
                fs.writeFileSync(file, JSON.stringify(data), 'utf8');
            }
        });
}

function formatCountryData(item) {
    const data = {
        cca2: item.cca2,
        cca3: item.cca3,
        names: {
            en: [item.name.official, item.name.common],
        }
    }

    const translations = Object.assign({}, item.translations, item.name.native);
    let langs = Object.keys(translations);

    for (let lang of langs) {
        data.names[shortLang(lang)] = [translations[lang].official, translations[lang].common];
    }

    const country = data.cca2.toLowerCase().substr(0, 2);

    langs.push('en');
    langs = langs.map(lang => shortLang(lang));

    return seriesPromise(langs, lang => getCapitalName(lang, country)
        .then(name => {
            if (name) {
                data.names[lang].push(name)
            } else {
                console.log(`not found capital for: ${lang}_${country}`);
            }
        }))
        .then(() => delay(1000 * 3))
        .then(() => data);
}

function shortLang(lang) {
    return lang.substr(0, 2).toLowerCase();
}

function getCapitalName(lang, country) {
    return fetch(`http://api.geonames.org/countryInfoCSV?lang=${lang}&country=${country}&username=${GEONAMES_USERNAME}`)
        .then(response => response.text())
        .then(text => {
            // console.log('===================');
            // console.log(text);
            // console.log('-------------------');
            const parts = text.split(/\n/).filter(item => item);
            return parts[1].split(/\t/g)[5];
        });
}

function seriesPromise(arr, iteratorFn) {
    return arr.reduce((p, item) => p.then(() => iteratorFn(item)), Promise.resolve(null));
}

function uniq(items) {
    return items.filter((value, index, self) => self.indexOf(value) === index);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

generate()
    .then(() => console.log('DONE!'))
    .catch(error => console.error(error));
