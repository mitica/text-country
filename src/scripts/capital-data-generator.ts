
import fetch from 'node-fetch';
import { DataGenerator } from './data-generator';
import { CountryNameType, LanguageData, getLanguages, seriesPromise, getLanguageData, delay } from '../data';

export class CapitalDataGenerator extends DataGenerator {
    constructor(private username: string) {
        super();
    }
    protected async start(): Promise<void> {
        const languages = getLanguages();

        await seriesPromise(languages, async lang => {
            const data = getLanguageData(lang);
            const countries = Object.keys(data);
            const langData: LanguageData = {};
            await seriesPromise(countries, async country => {
                const name = await getCapitalName(lang, country, this.username);
                if (name && name.trim().length > 2) {
                    langData[country] = [{ name, type: CountryNameType.CAPITAL }];
                    console.log(`Found capital for: ${lang}_${country}`);
                } else {
                    console.log(`Not found capital name for: ${lang}_${country}`);
                }
                console.log(`waiting for 2 sec...`);
                return await delay(1000 * 2);
            });
            if (Object.keys(langData).length) {
                this.addLanguageData(lang, langData);
            }
        });
    }
}

function getCapitalName(lang: string, country: string, username: string) {
    return fetch(`http://api.geonames.org/countryInfoCSV?lang=${lang}&country=${country}&username=${username}`)
        .then(response => response.text())
        .then(text => {
            const parts = text.split(/\n/).filter(item => item);
            return parts[1].split(/\t/g)[5];
        });
}
