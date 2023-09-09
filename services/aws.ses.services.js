const dotenv = require('dotenv');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const sesClient  = new SESClient({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey
    }
});

const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
	return new SendEmailCommand({
		Destination: {
			CcAddresses: [],
			ToAddresses: [
				toAddress,
			],
		},
		Message: {
			Body: {
				Html: {
					Charset: "UTF-8",
					Data: body,
				},
				Text: {
					Charset: "UTF-8",
					Data: "TEXT_FORMAT_BODY",
				},
			},
			Subject: {
				Charset: "UTF-8",
				Data: subject,
			},
		},
		Source: fromAddress,
		ReplyToAddresses: []
	});
};

exports.run = async (data) => {
    const sendEmailCommand = createSendEmailCommand(
      data.receiver,
      data.sender,
      data.subject,
      data.body
    );
	
    try {
      	return await sesClient.send(sendEmailCommand);
    } catch (e) {
      	console.error("Failed to send email.");
      	return e;
    }
};