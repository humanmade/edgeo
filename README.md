Edgeo
=====

A Lambda@Edge function for fetching Geo Location data and sending custom response headers. Ideal for analytics.

This implementation requires [ip-api.com](https://ip-api.com), it is recommended to use it with a pro subscription to avoid hitting the rate limits.

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
- X-Client-Location-Currency: Currency code

## Usage

After cloning this repo you will need to do the following:

1. `npm install`
1. `npm run tsc`
1. Add your API key to the `package.json` config section
1. `npm run build-zip`

You will then have a `lambda.zip` file ready to be uploaded to AWS. The file should be ~60kb and can be uploaded through the AWS console.

When configuring the lambda function use the following settings:

- Handler: "build/index.handler"
- Timeout: 5 seconds
- Memory: 128mb

## Testing

Run `npm run test` to check the location headers are added.

## Roadmap

- Support additional results for ISP, Connection type, anonymous IP
