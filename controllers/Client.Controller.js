const { Client } = require("../models/Client.Model");

const { uploadFileToS3 } = require("../services/aws.s3.services");
const { createLeadInZoho } = require("../services/zoho.services");

exports.createNewClient = async (req, res) => {
  const uploadedFiles = req.files;
  const { site_address, owners } = req.body;
  
  const parsedOwner = JSON.parse(owners);
  
  const defaultOwner = parsedOwner[0];
  
  try {
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

    await createLeadInZoho(defaultOwner);

    if(uploadedFiles.length > 0){
      await Promise.all(uploadedFiles.map(async (file) => {
        const fileName = file.originalname;
        const fileBuffer = file.buffer;
        const mimeType = file.mimetype;
        const imageKey = `files/${clientData._id}/${fileName}`;

        await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      }));
    }

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
