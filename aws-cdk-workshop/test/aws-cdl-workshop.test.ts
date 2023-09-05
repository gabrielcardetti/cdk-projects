import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AWSCdkWorkshopStack } from '../lib/aws-cdk-workshop-stack';

test('TEST', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new AWSCdkWorkshopStack(app, 'MyTestStack');
  // THEN

  const template = Template.fromStack(stack);

});
