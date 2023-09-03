import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class UrlsZipS3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const zipBucket = new s3.Bucket(this, 'ZipBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.S3_MANAGED,
      accessControl: s3.BucketAccessControl.PUBLIC_READ,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      publicReadAccess: true,
    });

    const downloadAndZipUrlsLambda = new lambda.Function(this, 'DownloadAndZipUrlsLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'downloadAndZipUrlsLambda.handler',
      environment: {
        ZIP_BUCKET_NAME: zipBucket.bucketName,
        RESEND_API_KEY: 'TODO'
      },
      timeout: cdk.Duration.seconds(300)
    });

    const urlsZipS3Handler = new lambda.Function(this, 'UrlsZipS3Handler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'urlsZipS3Handler.handler',
      environment: {
        DOWNLOAD_AND_ZIP_URLS_LAMBDA_NAME: downloadAndZipUrlsLambda.functionName,
      }
    });

    downloadAndZipUrlsLambda.grantInvoke(urlsZipS3Handler);
    zipBucket.grantReadWrite(downloadAndZipUrlsLambda);


    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: urlsZipS3Handler
    });

  }

}
