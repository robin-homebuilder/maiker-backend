const { getSharePointAccessToken, getFormDigestValue, createFolder, uploadFileToSharePointQuestionnaire, createAnonymousLink } = require("../services/sharePoint.services");

const { uploadFileToS3 } = require("../services/aws.s3.services");
const { run } = require("../services/aws.ses.services");

const { questionnaire } = require("../templates/emails/questionnaire");

exports.processQuestionnaire = async (req, res) => {
  const uploadedFiles = req.files;

  const { 
    client_information, 
    mail_address, 
    site_address, 
    project_information_one, 
    project_information_two, 
    client_brief 
  } = req.body;

  const parsedOwner = JSON.parse(client_information);
  const parsedMailAddress = JSON.parse(mail_address);
  const parsedSiteAddress = JSON.parse(site_address);
  const parsedProjectOne = JSON.parse(project_information_one);
  const parsedProjectTwo = JSON.parse(project_information_two);
  const parsedClientBrief = JSON.parse(client_brief);

  try {
    const documents = [];

    if(uploadedFiles.length > 0){
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
  
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];
  
      const currentDate = new Date();
      const folderName = currentDate.getTime();
  
      await createFolder(accessToken, formDigestValue, `Questionnaire/${folderName}`);

      await Promise.all(uploadedFiles.map(async (file) => {
        const fileName = file.originalname;
        const fileBuffer = file.buffer;
        const mimeType = file.mimetype;
        const imageKey = `questionnaire/${folderName}/${fileName}`;

        await uploadFileToS3({ fileBuffer, imageKey, mimeType });
        
        const result = await uploadFileToSharePointQuestionnaire(accessToken, formDigestValue, file, folderName);
        
        console.log(result)
        if(result){
          const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
          
          documents.push({
            url: url,
            fileName: result.Name
          });
        }
      }));
    }

    //Send Change Email Notification
    const body = await questionnaire({ 
      files: documents,
      parsedOwner: parsedOwner,
      parsedProjectOne: parsedProjectOne,
      parsedMailAddress: parsedMailAddress,
      parsedSiteAddress: parsedSiteAddress,
      parsedProjectTwo: parsedProjectTwo,
      parsedClientBrief: parsedClientBrief
    });
    
    const emailParameter = {
      sender: process.env.QUESTIONNAIRE_EMAIL,
      receiver: process.env.QUESTIONNAIRE_RECEIVER,
      body: body,
      subject: "Questionnaire Submitted"
    }
    
    await run(emailParameter)
    .then((result) => {
      // console.log(result)
    })
    .catch((error) => {
      // console.log(error)
    });
    //END Send Change Email Notification

    res.status(200).json(1);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}