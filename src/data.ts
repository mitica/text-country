import { join } from "path";
import { writeFileSync, readFileSync } from "fs";
const atonic = require('atonic');

let LANGUAGES: string[];

export function getCountries(): string[] {
    const data = getLanguageData('en');
    return Object.keys(data);
}

export function getLanguages() {
    if (!LANGUAGES) {
        try {
            LANGUAGES = JSON.parse(readFileSync(formatLanguagesFile(), 'utf8'));
        } catch (e) {
            LANGUAGES = [];
        }
    }
    return LANGUAGES;
}

function addLanguages(languages: string[]) {
    LANGUAGES = uniq(getLanguages().concat(languages));
    saveLanguages(LANGUAGES);
}

function formatLanguageFile(lang: string) {
    return join(__dirname, '..', 'data', lang + '.json');
}

function formatLanguagesFile() {
    return join(__dirname, '..', 'data', 'languages.json');
}

export function getLanguageData(lang: string): LanguageData {
    let data: LanguageData;

    try {
        data = JSON.parse(readFileSync(formatLanguageFile(lang), 'utf8'));
    } catch (e) {
        console.log(e.message);
        data = {}
    }

    for (let country of Object.keys(data)) {
        data[country].forEach(item => item.type = convertCountryNameType(item.type))
    }

    return data;
}

export function saveLanguageData(lang: string, data: LanguageData) {
    const languages = getLanguages();
    if (languages.indexOf(lang) < 0) {
        addLanguages([lang]);
    }

    Object.keys(data).forEach(country => {
        data[country] = data[country].concat(data[country].map(item => ({ name: atonic(item.name), type: CountryNameType.ATONIC })));
        data[country] = uniqProp(data[country], 'name');
    });

    writeFileSync(formatLanguageFile(lang), JSON.stringify(data), 'utf8');
}

function saveLanguages(languages: string[]) {
    languages = uniq(languages).sort();
    writeFileSync(formatLanguagesFile(), JSON.stringify(languages), 'utf8');
}

export type LanguageData = {
    [country: string]: CountryName[]
}

export type CountryName = {
    name: string
    type: CountryNameType
}

export enum CountryNameType {
    OFFICIAL = 'O',
    COMMON = 'C',
    ATONIC = 'A',
    SYNONYM = 'S',
    VARIANT = 'V',
    CAPITAL = 'P',
}

export function seriesPromise<T>(arr: T[], iteratorFn: (item: T) => Promise<any>) {
    return arr.reduce((p, item) => p.then(() => iteratorFn(item)), Promise.resolve(null));
}

export function uniq<T>(items: T[]) {
    return items.filter((value, index, self) => self.indexOf(value) === index);
}

export function uniqProp<T>(items: T[], prop: keyof T): T[] {
    const map: { [index: string]: any } = {}
    const list: T[] = []

    for (let item of items) {
        if (map[(<any>item)[prop]] === undefined) {
            map[(<any>item)[prop]] = 1;
            list.push(item)
        }
    }

    return list;
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function convertCountryNameType(s: string): CountryNameType {
    switch (s) {
        case CountryNameType.ATONIC: return CountryNameType.ATONIC;
        case CountryNameType.COMMON: return CountryNameType.COMMON;
        case CountryNameType.OFFICIAL: return CountryNameType.OFFICIAL;
        case CountryNameType.SYNONYM: return CountryNameType.SYNONYM;
        case CountryNameType.VARIANT: return CountryNameType.VARIANT;
        case CountryNameType.CAPITAL: return CountryNameType.VARIANT;
    }
    throw new Error(`Invalid CountryNameType=${s}`);
}
