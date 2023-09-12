const { Client, ClientProject } = require("../models/Client.Model");

const { uploadFileToS3 } = require("../services/aws.s3.services");
const { createLeadInZoho } = require("../services/zoho.services");

const { getSharePointAccessToken, getFormDigestValue, createFolder, uploadFileToSharePoint } = require("../services/sharePoint.services");

exports.createNewClient = async (req, res) => {
  const uploadedFiles = req.files;
  const { site_address, owners } = req.body;
  
  const parsedOwner = JSON.parse(owners);
  
  const defaultOwner = parsedOwner[0];
  
  try {
    //Create New Client
    const newClient = new Client({
      type: defaultOwner.type,
      first_name: defaultOwner.first_name,
      last_name: defaultOwner.last_name,
      phone: defaultOwner.phone,
      email: defaultOwner.email,
      company_name: defaultOwner?.company_name ?? "",
      abn: defaultOwner?.abn ?? "",
      trustee_name: defaultOwner?.trustee_name ?? "",
      trust_name: defaultOwner?.trust_name ?? ""
    })

    const clientData = await newClient.save();
    //End New Client

    //Create New Project
    let lastProjectNumber;
    let project_id;

    const lastProject = await ClientProject.findOne({}, {}, { sort: { 'createdAt': -1 } });
    
    if(lastProject){
      lastProjectNumber = lastProject.project_no + 1;
    } else{
      lastProjectNumber = 10000;
    }
      
    if(defaultOwner.type == "company_owner"){
      project_id = `${lastProjectNumber} - ${defaultOwner?.company_name ?? ""}`
    } else if(defaultOwner.type == "trust_owner"){
      project_id = `${lastProjectNumber} - ${defaultOwner?.trustee_name ?? ""}`
    } else{
      project_id = `${lastProjectNumber} - ${defaultOwner.last_name}`
    }

    const newProject = new ClientProject({
      project_id: project_id,
      project_no: lastProjectNumber,
      site_address: site_address,
    });
    
    const projectData = await newProject.save();
    //End New Project

    //Update Client
    const updateData = {
      project_id: projectData._id
    }
    
    await Client.updateOne({ _id: clientData._id }, updateData);
    //End Update Client

    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;

    const digestValueData = await getFormDigestValue(accessToken);
    const formDigestString = digestValueData.FormDigestValue;
    const formDigestValue = formDigestString.split(',')[0];

    await createFolder(accessToken, formDigestValue, project_id);
    await createFolder(accessToken, formDigestValue, `${project_id}/01. Client Information`);
    await createFolder(accessToken, formDigestValue, `${project_id}/01. Client Information/Client Documents`);

    const documents = [];

    if(uploadedFiles.length > 0){
      await Promise.all(uploadedFiles.map(async (file) => {
        const currentDate = new Date();
        const time = currentDate.getTime();

        const fileName = `${time}_${file.originalname}`;
        const fileBuffer = file.buffer;
        const mimeType = file.mimetype;
        const imageKey = `documents/${project_id}/${fileName}`;

        await uploadFileToS3({ fileBuffer, imageKey, mimeType });
        
        await uploadFileToSharePoint(accessToken, formDigestValue, file, project_id);

        documents.push({
          name: fileName,
          url: imageKey
        });
      }));
    }

    //Update Project
    const updateProjectData = {
      documents: documents
    }
    
    await ClientProject.updateOne({ _id: projectData._id }, updateProjectData);
    //End Update Project

    await createLeadInZoho(defaultOwner);

    res.status(200).json({project_id: project_id});
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}
