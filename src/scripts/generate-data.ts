
const GENERATORS = process.env.GENERATORS || process.argv[2];

if (!GENERATORS) {
    throw new Error(`env GENERATORS or argv is required`);
}


import { JsonDataGenerator } from './json-data-generator';
import { DataGenerator } from './data-generator';
import { seriesPromise, uniq } from '../data';
import { CapitalDataGenerator } from './capital-data-generator';
import { SynonymsDataGenerator } from './synonyms-data-generator';

const generators: DataGenerator[] = [];

const GENERATORS_NAMES = uniq(GENERATORS.split(/[,;\s]+/g));

if (~GENERATORS_NAMES.indexOf('json')) {
    generators.push(new JsonDataGenerator());
}

if (~GENERATORS_NAMES.indexOf('capital')) {
    generators.push(new CapitalDataGenerator());
}

if (~GENERATORS_NAMES.indexOf('synonym')) {
    generators.push(new SynonymsDataGenerator());
}

function generate() {
    return seriesPromise(generators, generator => generator.generate());
}

generate()
    .then(() => console.log('DONE!'))
    .catch(e => console.log(e));
