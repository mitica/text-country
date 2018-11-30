
import test from 'ava';
import findCountry from './find-country';

test('no country', t => {
    t.deepEqual(findCountry('text', 'en'), []);
    t.is(findCountry('text', 'en1'), null);
})

test('one country', t => {
    t.deepEqual(findCountry('text Moldova', 'en'), [{ country: 'md', rating: 1 }]);
    t.deepEqual(findCountry('text Moldova, Moldova', 'en'), [{ country: 'md', rating: 2 }]);
})

test('more countries', t => {
    const mdro = findCountry('text Moldova, Romania', 'en');
    t.deepEqual(mdro, [
        { country: 'md', rating: 1 },
        { country: 'ro', rating: 1 },
    ]);
})

test('bg', t => {
    t.deepEqual(findCountry('text Bulgaria', 'en'), [{ country: 'bg', rating: 1 }]);
    t.deepEqual(findCountry('text България text', 'bg'), [{ country: 'bg', rating: 1 }]);
    t.deepEqual(findCountry('България text', 'bg'), [{ country: 'bg', rating: 1 }]);
    t.deepEqual(findCountry('text България', 'bg'), [{ country: 'bg', rating: 1 }]);
    t.deepEqual(findCountry('България', 'bg'), [{ country: 'bg', rating: 1 }]);
})
