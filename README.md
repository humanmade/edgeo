Edgeo
=====

A Lambda@Edge function for fetching Geo Location data and sending custom response headers. Ideal for analytics.

This repo uses Serverless to create 2 lambda functions, one for Lambda@Edge and another to perform the lookups from the MaxMind GeoLite2 database.

## Output

- X-Client-Location-TimeZone: eg. "Europe/London"
- X-Client-Location-Continent: one of
  - AF - Africa
  - AN - Antarctica
  - AS - Asia
  - EU - Europe
  - NA - North America
  - OC - Oceania
  - SA - South America
- X-Client-Location-Country: ISO-3166-1 2 letter country code
- X-Client-Location-City: English name of the city if found
- X-Client-Location-Latitude: Approximate latitude
- X-Client-Location-Longitude: Approximate longitude
- X-Client-Location-PostalCode: Approximate postal code
- X-Client-Location-Region: ISO-3166-2 2-3 letter country subdivision code
- X-Client-Location-EU: 1 if country is in in EU or 0 otherwise.

## Usage

After cloning this repo you will need to do the following:

1. `npm install`
1. `npm run deploy`

Serverless will create the two lambda functions, after which you can log in to the AWS console and get the ARN for the `edgeo-main` function to add to your CloudFront origin under the behaviours tab.

## Testing

Run `npm run test` to check the location headers are added after the initial deploy.
