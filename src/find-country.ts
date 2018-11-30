import { Options, DEFAULT_OPTIONS } from "./options";
import { getLanguages, getLanguageData } from "./data";
const { WORD_BOUNDARY } = require('unicode-wb');

const LANGUAGES = getLanguages();
const CACHE: { [lang: string]: DataItem[] } = {}

export type CountryRating = {
    country: string
    rating: number
}

export default function findCountry(text: string, lang: string, options?: Options): CountryRating[] {
    if (typeof lang !== 'string') {
        throw new Error(`Invalid 'lang' param`);
    }
    if (LANGUAGES.indexOf(lang) < 0) {
        return null;
    }
    if (typeof text !== 'string') {
        throw new Error(`Invalid 'text' param`);
    }
    options = { ...options, ...DEFAULT_OPTIONS };

    const items = getDataItems(lang);
    const results: CountryRating[] = []
    const resultsMap: Map<string, CountryRating> = new Map();

    for (let item of items) {
        while (item.reg.exec(text) !== null) {
            if (!resultsMap.has(item.country)) {
                const result: CountryRating = {
                    country: item.country,
                    rating: 1,
                };
                resultsMap.set(item.country, result);
                results.push(result);
            } else {
                resultsMap.get(item.country).rating++;
            }
            if (options.firstFound) {
                return results;
            }
        }
    }

    return results.sort((a, b) => b.rating - a.rating);
}

function getDataItems(lang: string): DataItem[] {
    if (CACHE[lang] === undefined) {
        const data = getLanguageData(lang);
        const items = Object.keys(data).map(country => {
            const arr: string[] = data[country].map(it => it.name.replace(/([\(\)\[\]\.])/g, '\\$1'));
            return {
                country,
                reg: new RegExp(WORD_BOUNDARY + '(' + arr.join('|') + ')' + WORD_BOUNDARY, 'gi'),
            };
        });
        CACHE[lang] = items;
    }

    return CACHE[lang];
}

type DataItem = {
    reg: RegExp
    country: string
}
