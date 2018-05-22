
const GEONAMES_USERNAME = process.env.GEONAMES_USERNAME;

if (!GEONAMES_USERNAME) {
    throw new Error(`env GEONAMES_USERNAME is required`);
}

import { JsonDataGenerator } from './json-data-generator';
import { DataGenerator } from './data-generator';
import { seriesPromise } from '../data';
import { CapitalDataGenerator } from './capital-data-generator';

const generators: DataGenerator[] = [
    new JsonDataGenerator(),
    new CapitalDataGenerator(GEONAMES_USERNAME),
];

function generate() {
    return seriesPromise(generators, generator => generator.generate());
}

generate()
    .then(() => console.log('DONE!'))
    .catch(e => console.log(e));
