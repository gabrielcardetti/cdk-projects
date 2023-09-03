import pkg from 'aws-sdk';
const { Lambda } = pkg

const formatResponse = () => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Success' }),
    };
};

const formatErrorResponse = (error, statusCode = 500) => {
    return {
        statusCode,
        body: JSON.stringify({
            error,
        }),
    };
};

const isValidEmail = (email) => {
    const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const isValidEmailList = (emails) => {
    let valid = true;
    for (const email of emails) {
        if (!isValidEmail(email)) {
            valid = false;
            break;
        }
    }
    return valid;
};

const handler = async function (event) {
    if (!event.body)
        return formatErrorResponse('No body', 400);

    const body = JSON.parse(event.body);
    const urls = body.urls;
    const emails = body.emails ?? [];

    const validEmails = isValidEmailList(emails);

    if (!validEmails)
        return formatErrorResponse('Invalid emails', 400);
    if (!urls)
        return formatErrorResponse('No urls', 400);

    console.log(`Invoke lambda to zip ${urls.length} urls`);

    const lambda = new Lambda();

    const resp = await lambda.invoke({
        FunctionName: process.env.DOWNLOAD_AND_ZIP_URLS_LAMBDA_NAME,
        Payload: JSON.stringify({
            urls,
            emails,
        }),
        InvocationType: 'Event',  //Invoke the function asynchronously. Send events that fail multiple times to the function's dead-letter queue (if one is configured). 
    }).promise();

    console.log('Download and zip lambda response:', JSON.stringify(resp, undefined, 2));

    return formatResponse();
};

export { handler };