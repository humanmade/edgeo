Edgeo
=====

A Lambda@Edge function for adding Geo Location headers to response headers.

Designed for use with the "viewer response" CloudFront event it is powered by the free [MaxMind GeoLite2 GeoIP database](https://dev.maxmind.com/geoip/geoip2/geolite2/).


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

## Usage

After cloning this repo you will need to do the following:

1. Upload a [MaxMind GeoIP database from here](https://dev.maxmind.com/geoip/geoip2/geolite2/) to S3
1. `npm install`
2. `npm run tsc`
3. `npm run build-zip`

You will then have a `lambda.zip` file ready to be uploaded to AWS. The file should be ~6mb and can be uploaded through the AWS console.

When configuring the lambda function use the following settings:

- Handler: "build/index.handler"
- Timeout: 5 minutes
- Memory: 640mb
- Environment variables:
  - `EDGEO_BUCKET`: your S3 bucket
  - `EDGEO_PATH`: path inside the bucket to a directory of databases
  - `EDGEO_DB`: database file name
- Execution role: Ensure this has read access to the S3 bucket and path using an IAM policy like so:
  ```json
  {
    "Effect": "Allow",
    "Action": [
      "s3:GetObject"
    ],
    "Resource": [
      "arn:aws:s3:::<bucket>/<path>/*"
    ]
  }
  ```

## Testing

Ensure you have an appropriate `.aws/credentials` file set up with an access key and secret that can access the file on S3. Using the AWS CLI you can create this file by running `aws configure`.

Afterwards create a `.env` file and add the following environment variables:

```
EDGEO_BUCKET=<your bucket>
EDGEO_PATH=<path to directory of databases>
EDGEO_DB=<database file name>
```

## Roadmap

- Support additional headers for ISP, Connection type, anonymous IP
