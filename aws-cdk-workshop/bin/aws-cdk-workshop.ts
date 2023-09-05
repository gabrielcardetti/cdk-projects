#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AWSCdkWorkshopStack } from '../lib/aws-cdk-workshop-stack';

const app = new cdk.App();
new AWSCdkWorkshopStack(app, 'AWSCdkWorkshopStack');
