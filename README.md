# text-country

Finds country in text.

## Usage

``` ts

import textCountry from 'text-country';
const lang = 'en';
const text = 'Ministry of Foreign Affairs of Moldova'; // Moldova => md
const results = textCountry(text, lang);
// [{ "country": "md", "rating": 1 }]

```

## API

### (text: string, lang: string, options?: Options): CountryRating[]

Returns a list of founded countries ordered by rating.

#### TS Types

```ts
type Options = {
    // returns first found country
    firstFound?: boolean
}
type CountryRating = {
    country: string
    rating: number
}
```
