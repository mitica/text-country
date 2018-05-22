
import { LanguageData, getLanguageData, saveLanguageData } from '../data';

export abstract class DataGenerator {
    async generate(): Promise<void> {
        console.log(`Start ${this.constructor.name}`);
        await this.start();
    }

    protected abstract start(): Promise<void>

    protected addLanguageData(lang: string, data: LanguageData) {
        const langData = getLanguageData(lang);
        for (let country of Object.keys(data)) {
            langData[country] = (langData[country] || []).concat(data[country]);
        }
        this.setLanguageData(lang, langData);
    }

    protected setLanguageData(lang: string, data: LanguageData) {
        saveLanguageData(lang, data);
    }
}
