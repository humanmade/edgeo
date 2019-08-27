Edgeo
=====

A Lambda@Edge function for adding Geo Location headers to response headers.

Designed for use with the "viewer response" CloudFront event it is powered by the free [MaxMind GeoLite2 GeoIP database](https://dev.maxmind.com/geoip/geoip2/geolite2/).

## Usage

After cloning this repo run the following commands:

1. `npm install`
2. `npm run tsc`
3. `npm run build-zip`

You will then have a `lambda.zip` file ready to be uploaded to AWS.

## Output

The Lambda function will add the following headers to responses:

- `X-Client-Geo-TimeZone`: eg. "Europe/London"
- `X-Client-Geo-Continent`: one of
  - AF - Africa
  - AN - Antarctica
  - AS - Asia
  - EU - Europe
  - NA - North America
  - OC - Oceania
  - SA - South America
- `X-Client-Geo-Country`: [ISO-3166-1](https://en.wikipedia.org/wiki/ISO_3166-1) 2 letter country code
- `X-Client-Geo-City`: English name of the city if found
- `X-Client-Geo-Latitude`: Approximate latitude
- `X-Client-Geo-Longitude`: Approximate longitude
- `X-Client-Geo-PostalCode`: Approximate postal code
- `X-Client-Geo-Region`: [ISO-3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) 2-3 letter country subdivision code
- `X-Client-Geo-EU`: Value is 1 if the country is in the European Union, otherwise 0

## Roadmap

- Support compilation with enterprise `mmdb` database files
- Support additional headers for ISP, Connection type, anonymous IP
