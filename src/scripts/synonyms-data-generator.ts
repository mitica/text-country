
import { getEntities } from 'wiki-entity';
import { DataGenerator } from './data-generator';
import { CountryNameType, LanguageData, getLanguages, seriesPromise, getLanguageData, uniq } from '../data';

export class SynonymsDataGenerator extends DataGenerator {
    protected async start(): Promise<void> {
        const languages = getLanguages();

        await seriesPromise(languages, async lang => {
            const data = getLanguageData(lang);
            const countries = Object.keys(data);
            const langData: LanguageData = {};
            await seriesPromise(countries, async country => {
                const countryName = data[country].find(item => item.type === CountryNameType.OFFICIAL);
                const commonName = data[country].find(item => item.type === CountryNameType.COMMON);
                const capitalName = data[country].find(item => item.type === CountryNameType.CAPITAL);

                const names: string[] = []
                if (countryName) {
                    names.push(countryName.name);
                }
                if (commonName) {
                    names.push(commonName.name);
                }
                if (capitalName) {
                    names.push(capitalName.name);
                }
                if (names.length) {
                    let variants = await getNamesVariants(uniq(names), lang);
                    if (variants && variants.length) {
                        variants = uniq(variants);
                        console.log(`found variants: ${variants}`);
                        langData[country] = variants.map(name => ({ name, type: CountryNameType.VARIANT }));
                    } else {
                        console.log(`NOT found variants: ${names[0]}`);
                    }
                }
            });
            if (Object.keys(langData).length) {
                this.addLanguageData(lang, langData);
            }
        });
    }
}

async function getNamesVariants(names: string[], lang: string) {
    console.log('exploring titles ', names);
    try {
        let entities = await getEntities({
            language: lang,
            titles: names,
            redirects: true,
            extract: 0,
            claims: 'none',
        });

        if (entities) {
            entities = entities.filter(item => !!item);

            return entities.reduce<string[]>((prev, current) => prev.concat(current.redirects || []), []);
        }
    } catch (e) {
        console.log(e);
    }
}
