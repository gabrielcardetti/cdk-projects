import pkg from 'aws-sdk';
const { S3 } = pkg

import request from 'request';
import async from 'async';
import archiver from 'archiver';
import { Resend } from 'resend';

const sendEmail = async (url, emails) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    for (const email of emails) {
        try {
            const data = await resend.emails.send({
                from: 'Acme <onboarding@resend.dev>',
                to: [email],
                subject: 'New zip with files',
                html: `<strong>Download your zip file <a href="${url}">here</a></strong>`,
            });
        } catch (error) {
            console.error(error);
        }
    }

};

const uploadToS3 = async (buffer, keyName) => {
    const s3 = new S3();
    const params = {
        Bucket: process.env.ZIP_BUCKET_NAME,
        Key: keyName,
        Body: buffer,
        acl: 'public-read'
    };
    const res = await s3.upload(params).promise();
    return res.Location;
};

const uploadZipAndSendEmail = async (bufferData, emails) => {
    const keyName = `zip-${Date.now()}.zip`;
    const url = await uploadToS3(bufferData, keyName);
    console.log('Finish upload to s3');
    const response = await sendEmail(url, emails);
    return url;
};

const zipFileAndTriggerEmail = async (attachments, emails) => {
    console.log('Start zip file');
    return new Promise((resolve, reject) => {
        let zipArchive = archiver('zip');
        async.each(
            attachments,
            (elem, callback) => {
                const options = {
                    url: elem,
                    method: 'get',
                    encoding: null,
                };
                request(options, (error, _response, body) => {
                    if (error) callback(error);
                    else {
                        const name = elem.split('/').pop();
                        zipArchive.append(body, { name });
                        callback();
                    }
                });
            },
            (err) => {
                if (err) {
                    console.log(err.message, err);
                    reject(err);
                } else {
                    zipArchive.finalize();
                }
            },
        );

        let buffer = [];

        zipArchive.on('data', (data) => buffer.push(data));

        zipArchive.on('end', async () => {
            let data = Buffer.concat(buffer);
            console.log('Finish zip');
            const url = await uploadZipAndSendEmail(data, emails);
            resolve(url);
        });
    });
};


const handler = async function (event) {
    const urls = event.urls ?? [];
    const emails = event.emails ?? [];

    console.log('Urls: ', urls.length);
    console.log('Emails: ', emails.length);

    try {
        const url = await zipFileAndTriggerEmail(urls, emails);
        console.log(url);
    } catch (error) {
        console.log('Error downloading images and making zip file');
        console.log('Error: ', error.message);
        console.error(error);
    }

    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Zip uploaded\n`
    };
};



export { handler };