# Urls zip s3

The main idea is to send a list of urls to a lambda function, which will download the files and upload them to an s3 bucket, and then return the url of the zip file.

The lambda function is triggered by an API Gateway, which will receive the list of urls in the body of the request.

Flow

1. Send a POST request to /download with a list of urls.
2. The lambda function will trigger another lambda function.
3. The other lambda function will download the files and compress them into a zip file.
4. After the zip file is created, the lambda function will upload the zip file to s3 bucket.
5. The lambda function will send a email to the list of emails in the request body.

Example

POST
{
    "urls": [
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    ],
    "emails": ["test@gmail.com"]
}

Response
{
    "url": "https://bucket.s3.amazonaws.com/zip.zip"
}

TODO:

- [] Create a secret to store the api key of the email service.

## Useful commands

- `npm run build`   compile typescript to js
- `npm run watch`   watch for changes and compile
- `npm run test`    perform the jest unit tests
- `cdk deploy`      deploy this stack to your default AWS account/region
- `cdk diff`        compare deployed stack with current state
- `cdk synth`       emits the synthesized CloudFormation template
