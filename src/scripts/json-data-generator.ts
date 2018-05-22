
import fetch from 'node-fetch';
import { DataGenerator } from './data-generator';
import { CountryName, CountryNameType, LanguageData } from '../data';

export class JsonDataGenerator extends DataGenerator {
    constructor(private setOrAdd: 'set' | 'add' = 'set') {
        super();
    }
    protected async start(): Promise<void> {
        const jsonData: any[] = await fetch('https://raw.githubusercontent.com/mledoze/countries/master/countries.json')
            .then(response => response.json());

        const countriesData = jsonData.map(data => formatCountryData(data));

        const map: Map<string, LanguageData> = new Map();
        for (let countryData of countriesData) {
            const country = countryData.cca2.toLowerCase();
            for (let lang of Object.keys(countryData.names)) {
                const names = countryData.names[lang];
                if (!map.has(lang)) {
                    map.set(lang, {});
                }
                const langData = map.get(lang);
                langData[country] = (langData[country] || []).concat(names);
            }
        }
        for (let lang of map.keys()) {
            if (this.setOrAdd === 'add') {
                this.addLanguageData(lang, map.get(lang));
            } else {
                this.setLanguageData(lang, map.get(lang));
            }
        }
    }
}

function formatCountryData(item: any): CountryData {
    const data: CountryData = {
        cca2: item.cca2,
        cca3: item.cca3,
        names: {
            en: [
                { name: item.name.official, type: CountryNameType.OFFICIAL },
                { name: item.name.common, type: CountryNameType.COMMON },
            ],
        }
    };

    const translations = Object.assign({}, item.translations, item.name.native);
    let langs = Object.keys(translations);

    for (let lang of langs) {
        data.names[shortLang(lang)] = [
            { name: translations[lang].official, type: CountryNameType.OFFICIAL },
            { name: translations[lang].common, type: CountryNameType.COMMON },
        ];
    }

    return data;
}

type CountryData = {
    cca2: string
    cca3: string
    names: { [lang: string]: CountryName[] }
}

function shortLang(lang: string) {
    return lang.substr(0, 2).toLowerCase();
}
