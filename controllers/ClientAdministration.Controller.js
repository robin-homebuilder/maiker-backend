const mongoose = require("mongoose");

const { getSharePointAccessToken, getFormDigestValue, createFolder, uploadFileToSharePoint, createAnonymousLink, uploadFileToSharePointWithFolder, deleteSharepointFile, deleteSharepointFolder } = require("../services/sharePoint.services");
const { uploadFileToS3, deleteWholeFolder } = require("../services/aws.s3.services");

const { Client, ClientProject, ClientConsultant } = require("../models/Client.Model");
const { SiteDocument } = require("../models/SiteDocuments.Model");
const { DrawingsReports } = require("../models/DrawingsReports.Model");
const { AuthorityApprovals } = require("../models/AuthorityApproval.Model");
const { ComplianceOperations } = require("../models/ComplianceOperations.Model");
const { ProjectPhotos } = require("../models/ProjectPhotos.Model");
const { Consultant } = require("../models/Consultant.Model");
const { ProgressClaims, Invoices } = require("../models/ProgressClaimsInvoices.Model");
const { ContractSum } = require("../models/ContractSum.Model");
const { PracticalCompletion } = require("../models/PracticalCompletion.Model");
const { ContractDocument, ExtensionTime, Variation } = require("../models/ContractAdministration.Model");
const { ClientDocument, ClientAdditional } = require("../models/ClientInformation.Model");

exports.getClientsConsultant = async (req, res) => {
  const clientID = req.params.clientID;
  
  try {
    const consultants = await ClientConsultant.find({ client_id: clientID })
      .populate({
        path: "consultant_id",
        select: "id_number name"
      })
      .select("-client_id");
      
    res.status(200).json(consultants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addConsultantAccess = async (req, res) => {
  const { consultantID, clientID } = req.body;
  
  try {
    const newConsultantAccess = new ClientConsultant({
      client_id: clientID,
      consultant_id: consultantID
    })

    await newConsultantAccess.save();

    await Consultant.findOneAndUpdate({ _id: consultantID }, { $addToSet: { access: clientID }});
    
    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getSearchConsultant = async (req, res) => {
  const clientID = req.params.clientID;
  const { search_data } = req.body;
  
  const regex = new RegExp(search_data, 'i');
  
  try {
    const consultants = await Consultant.find({
      id_number: regex,
      access: { $nin: [clientID] }
    }).select("id_number name");
    
    res.status(200).json(consultants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

}

exports.deleteConsultantAccess = async (req, res) => {
  const accessID = req.params.accessID;
  const consultantID = req.params.consultantID;
  const clientID = req.params.clientID;
  
  try {
    await Consultant.updateOne({ _id: consultantID }, { $pull: { access: clientID } });
    
    await ClientConsultant.findOneAndDelete({ _id: accessID });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getAdditionalClients = async (req, res) => {
  const clientID = req.params.clientID

  try {
    const result = await ClientAdditional.find({ client_id: clientID });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addClientAdditional = async (req, res) => {
  const { clientID, client_name, phone, email, mailing_address } = req.body;
  
  try {
    const newClientAdditional = new ClientAdditional({
      client_id: clientID,
      client_name,
      phone,
      email,
      mailing_address
    });

    await newClientAdditional.save();

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateClientAdditional = async (req, res) => {
  const additonalClientID = req.params.additonalClientID;

  const { client_name, phone, email, mailing_address } = req.body;
  
  try {
    const updateData = {
      client_name,
      phone,
      email,
      mailing_address
    }
    
    await ClientAdditional.updateOne({ _id: additonalClientID }, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteClientAdditional = async (req, res) => {
  const additonalClientID = req.params.additonalClientID;
  
  try {
    await ClientAdditional.findOneAndDelete({ _id: additonalClientID });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getClientDocuments = async (req, res) => {
  const clientID = req.params.clientID

  try {
    const result = await ClientDocument.find({ client_id: clientID });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addClientDocument = async (req, res) => {
  const file = req.file;
  const { clientID, name, document_date } = req.body;

  let file_name = "";
  let fileURL = "";
  
  try {
    const clientData = await Client.findOne({ _id: clientID });

    const folderName = `${clientData.project_number}/01. Client Information/Client Documents`;

    if(file){
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        file_name = fileName;
        fileURL = url;
      }
    }
    
    const newClientDocument = new ClientDocument({
      client_id: clientID,
      name,
      document_date,
      file_name: file_name,
      url: fileURL
    });

    await newClientDocument.save();

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateClientDocument = async (req, res) => {
  const documentID = req.params.documentID;

  const file = req.file;
  const { clientID, name, document_date } = req.body;
  
  try {
    const updateData = {
      name,
      document_date
    }

    if(file){
      const clientData = await Client.findOne({ _id: clientID });
      const clientDocumentData = await ClientDocument.findOne({ _id: documentID });
  
      const folderName = `${clientData.project_number}/01. Client Information/Client Documents`;
      const filePath = `${clientData.project_number}/01. Client Information/Client Documents/${clientDocumentData.file_name}`;

      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      await deleteWholeFolder(`documents/${filePath}`);
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      await deleteSharepointFile(accessToken, filePath);
      
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        updateData.file_name = fileName;
        updateData.url = url;
      }
    }
    
    await ClientDocument.updateOne({ _id: documentID }, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteClientDocument = async (req, res) => {
  const documentID = req.params.documentID;
  const clientID = req.params.clientID;
  
  try {
    const clientData = await Client.findOne({ _id: clientID }); 
    const clientDocumentData = await ClientDocument.findOne({ _id: documentID });

    const path = `${clientData.project_number}/01. Client Information/Client Documents/${clientDocumentData.file_name}`
      
    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;

    await deleteSharepointFile(accessToken, path);

    await deleteWholeFolder(`documents/${path}`);

    await ClientDocument.findOneAndDelete({ _id: documentID });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getSiteInformation = async (req, res) => {
  const clientID = req.params.clientID;

  try {
    const site_information = await Client.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(clientID) }
      },
      {
        $lookup: {
          from: 'clients_projects',
          localField: 'project_id',
          foreignField: '_id',
          as: 'projectData'
        }
      },
      {
        $unwind: '$projectData'
      },
      {
        $project: {
          projectID: '$projectData._id',
          site_address: '$projectData.site_address',
          description: '$projectData.description',
          site_area: '$projectData.site_area',
          local_government: '$projectData.local_government'
        }
      }
    ]);

    const siteDocuments = await SiteDocument.findOne({ client_id: clientID });
    
    const result = {
      siteInformationID: {
        id: site_information[0]?.projectID.toString() || ""
      },
      siteDetails: {
        site_address: site_information[0]?.site_address  || "",
        description: site_information[0]?.description || "",
        site_area: site_information[0]?.site_area || "",
        local_government: site_information[0]?.local_government || ""
      },
      siteDocuments: siteDocuments?.documents ?? []
    }
    
    res.status(200).json(result);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}

exports.getSiteInformationDocuments = async (req, res) => {
  const clientID = req.params.clientID;

  try {
    let documents = [];
    const result = await SiteDocument.findOne({ client_id: clientID });

    if(result){
      documents = result.documents;
    }

    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.saveSiteInformation = async (req, res) => {
  const projectID = req.params.projectID;
  const { site_address, description, site_area, local_government } = req.body;
  
  try {
    const updateData = {
      site_address,
      description,
      site_area,
      local_government
    }

    await ClientProject.updateOne({ _id: projectID }, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addDocument = async (req, res) => {
  const file = req.file;
  const { clientID, name, document_date } = req.body;
  
  try {
    const siteDocuments = await SiteDocument.findOne({ clientID: clientID});
    const clientData = await Client.findOne({ _id: clientID });
    
    if(siteDocuments){
      const updateData = {};

      const filter = {
        client_id: mongoose.Types.ObjectId(clientID)
      }
  
      if (file) {
        updateData['$push'] = {
          'documents': {
            name: name,
            document_date,
            url: '',
            file_name: file.originalname,
          },
        };
      }
  
      let folderName = "";
  
      if(clientData){
        folderName = `${clientData.project_number}/02. Site Information/Site Information Documents`
      }
      
      if(file){
        const accessTokenData = await getSharePointAccessToken();
        const accessToken = accessTokenData.access_token;
    
        const digestValueData = await getFormDigestValue(accessToken);
        const formDigestString = digestValueData.FormDigestValue;
        const formDigestValue = formDigestString.split(',')[0];
  
        const fileName = file.originalname;
        const fileBuffer = file.buffer;
        const mimeType = file.mimetype;
        const imageKey = `documents/${folderName}/${fileName}`;
  
        await uploadFileToS3({ fileBuffer, imageKey, mimeType });
        
        const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
        
        if(result){
          const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);

          updateData['$push']['documents'].url = url;
        }
      }
      
      await SiteDocument.updateOne(filter, updateData);
    } else{
      const documents = [];
      const folderName = `${clientData.project_number}/02. Site Information/Site Information Documents`;

      if(file){
        const accessTokenData = await getSharePointAccessToken();
        const accessToken = accessTokenData.access_token;
    
        const digestValueData = await getFormDigestValue(accessToken);
        const formDigestString = digestValueData.FormDigestValue;
        const formDigestValue = formDigestString.split(',')[0];

        const fileName = file.originalname;
        const fileBuffer = file.buffer;
        const mimeType = file.mimetype;
        const imageKey = `documents/${folderName}/${fileName}`;

        await uploadFileToS3({ fileBuffer, imageKey, mimeType });
        
        const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
        
        if(result){
          const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
        
          documents.push({
            name: name,
            file_name: fileName,
            url: url
          });
        }
      }

      const newSiteDocument = new SiteDocument({
        client_id: clientID,
        documents: documents
      });

      await newSiteDocument.save();
    }

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateDocument = async (req, res) => {
  const fileID = req.params.fileID;

  const file = req.file;
  const { clientID, name, document_date } = req.body;
  
  try {
    const filter = {
      client_id: mongoose.Types.ObjectId(clientID),
      'documents._id': mongoose.Types.ObjectId(fileID)
    }

    const updateData = {
      $set: {
        'documents.$.name': name,
        'documents.$.document_date': document_date,
      },
    }
    
    const clientData = await Client.findOne({ _id: clientID });

    let folderName = "";

    if(clientData){
      folderName = `${clientData.project_id}/02. Site Information/Site Information Documents`
    }

    if(file){
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
  
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        updateData.$set['documents.$.url'] = url
      }
      
      updateData.$set['documents.$.file_name'] = fileName
    }
    
    await SiteDocument.updateOne(filter, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteSiteDocument = async (req, res) => {
  const documentID = req.params.documentID;
  const clientID = req.params.clientID;
  
  try {
    const filterFind = {
      client_id: mongoose.Types.ObjectId(clientID),
      'documents._id': mongoose.Types.ObjectId(documentID)
    };
    
    const clientData = await Client.findOne({ _id: clientID });
    const document = await SiteDocument.findOne(filterFind);
    
    const foundDocument = document.documents.find(doc => doc._id.toString() === documentID);

    if(foundDocument){
      const path = `${clientData.project_number}/02. Site Information/Site Information Documents/${foundDocument.file_name}`
  
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;

      await deleteSharepointFile(accessToken, path);

      await deleteWholeFolder(`documents/${path}`);
    }

    const filter = {
      client_id: mongoose.Types.ObjectId(clientID),
    };

    const updateData = {};

    updateData['$pull'] = {
      'documents': {
        _id: documentID,
      },
    };

    await SiteDocument.updateOne(filter, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getDrawingsAndReports = async (req, res) => {
  const clientID = req.params.clientID

  try {
    const result = await DrawingsReports.find({ client_id: clientID });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getDrawingsAndReportsSection = async (req, res) => {
  const sectionID = req.params.sectionID

  try {
    const result = await DrawingsReports.findOne({ _id: sectionID });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateDrawingsAndReportsSection = async (req, res) => {
  const sectionID = req.params.sectionID
  const { section_name } = req.body;

  try {
    const updateData = {
      section_name
    }
    
    await DrawingsReports.updateOne({ _id: sectionID }, updateData);
    
    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteDrawingsAndReportsSection = async (req, res) => {
  const sectionID = req.params.sectionID;
  const clientID = req.params.clientID;
  
  try {
    const sectionData = await DrawingsReports.findOne({ _id: sectionID });
    const clientData = await Client.findOne({ _id: clientID });

    if(sectionData.documents.length > 0){
      const path = `${clientData.project_number}/03. Drawing and Reports/${sectionData.section_name}`;
        
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;

      await deleteSharepointFolder(accessToken, path);

      await deleteWholeFolder(`documents/${path}`);
    }
    
    await DrawingsReports.findOneAndDelete({ _id: sectionID });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addDrawingsAndReports = async (req, res) => {
  const file = req.file;
  const { clientID, section_name, name, document_date, amendment } = req.body;
  
  let documents = [];

  try {
    const clientData = await Client.findOne({ _id: clientID });

    const folderName = `${clientData.project_number}/03. Drawing and Reports/${section_name}`;

    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;
    
    const digestValueData = await getFormDigestValue(accessToken);
    const formDigestString = digestValueData.FormDigestValue;
    const formDigestValue = formDigestString.split(',')[0];

    await createFolder(accessToken, formDigestValue, folderName);

    if(file){
      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        documents.push({
          name: name,
          document_date,
          amendment,
          file_name: fileName,
          url: url
        });
      }
    }

    const newDrawingsReports = new DrawingsReports({
      client_id: clientID,
      section_name: section_name,
      documents: documents
    });

    await newDrawingsReports.save();

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addDrawingsAndReportsFile = async (req, res) => {
  const file = req.file;
  const { clientID, sectionID, name, document_date, amendment } = req.body;

  const updateData = {};

  try {
    const clientData = await Client.findOne({ _id: clientID });
    const sectionData = await DrawingsReports.findOne({ _id: sectionID });

    const folderName = `${clientData.project_number}/03. Drawing and Reports/${sectionData.section_name}`;

    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;
    
    const digestValueData = await getFormDigestValue(accessToken);
    const formDigestString = digestValueData.FormDigestValue;
    const formDigestValue = formDigestString.split(',')[0];
    
    await createFolder(accessToken, formDigestValue, folderName);

    const filter = {
      _id: mongoose.Types.ObjectId(sectionID)
    }

    if (file) {
      updateData['$push'] = {
        'documents': {
          name: name,
          document_date,
          amendment,
          url: '',
          file_name: file.originalname,
        },
      };

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);

        updateData['$push']['documents'].url = url;
      }
    }
    
    await DrawingsReports.updateOne(filter, updateData);

    res.status(200).json(1);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}

exports.updateDrawingsAndReportsFile = async (req, res) => {
  const fileID = req.params.fileID;

  const file = req.file;
  const { clientID, sectionID, name, document_date, amendment } = req.body;
  
  try {
    
    const filter = {
      _id: mongoose.Types.ObjectId(sectionID),
      'documents._id': mongoose.Types.ObjectId(fileID)
    }

    const updateData = {
      $set: {
        'documents.$.name': name,
        'documents.$.document_date': document_date,
        'documents.$.amendment': amendment,
      },
    }

    const clientData = await Client.findOne({ _id: clientID });
    const sectionData = await DrawingsReports.findOne({ _id: sectionID });

    const folderName = `${clientData.project_number}/03. Drawing and Reports/${sectionData.section_name}`;

    if (file) {
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        updateData.$set['documents.$.url'] = url
      }
      
      updateData.$set['documents.$.file_name'] = fileName
    }
    
    await DrawingsReports.updateOne(filter, updateData);

    res.status(200).json(1);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}

exports.deleteDrawingsAndReportsFile = async (req, res) => {
  const documentID = req.params.documentID;
  const sectionID = req.params.sectionID;
  const clientID = req.params.clientID;
  
  try {
    const filterFind = {
      _id: mongoose.Types.ObjectId(sectionID),
      'documents._id': mongoose.Types.ObjectId(documentID)
    };
    
    const clientData = await Client.findOne({ _id: clientID });
    const document = await DrawingsReports.findOne(filterFind);
    
    const foundDocument = document.documents.find(doc => doc._id.toString() === documentID);

    if(foundDocument){
      const path = `${clientData.project_number}/03. Drawing and Reports/${document.section_name}/${foundDocument.file_name}`
      
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;

      await deleteSharepointFile(accessToken, path);

      await deleteWholeFolder(`documents/${path}`);
    }

    const filter = {
      _id: mongoose.Types.ObjectId(sectionID),
    };

    const updateData = {};

    updateData['$pull'] = {
      'documents': {
        _id: documentID,
      },
    };

    await DrawingsReports.updateOne(filter, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getAuthorityApprovals = async (req, res) => {
  const clientID = req.params.clientID

  try {
    const result = await AuthorityApprovals.find({ client_id: clientID });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getAuthorityApprovalsSection = async (req, res) => {
  const sectionID = req.params.sectionID

  try {
    const result = await AuthorityApprovals.findOne({ _id: sectionID });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateAuthorityApprovalsSection = async (req, res) => {
  const sectionID = req.params.sectionID
  const { section_name } = req.body;

  try {
    const updateData = {
      section_name
    }
    
    await DrawingsReports.updateOne({ _id: sectionID }, updateData);
    
    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteAuthorityApprovalsSection = async (req, res) => {
  const sectionID = req.params.sectionID;
  const clientID = req.params.clientID;
  
  try {
    const sectionData = await AuthorityApprovals.findOne({ _id: sectionID });
    const clientData = await Client.findOne({ _id: clientID });

    if(sectionData.documents.length > 0){
      const path = `${clientData.project_number}/04. Authority and Approvals/${sectionData.section_name}`;
        
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;

      await deleteSharepointFolder(accessToken, path);

      await deleteWholeFolder(`documents/${path}`);
    }
    
    await AuthorityApprovals.findOneAndDelete({ _id: sectionID });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addAuthorityApprovals = async (req, res) => {
  const file = req.file;
  const { clientID, section_name, name, document_date, amendment } = req.body;
  
  let documents = [];

  try {
    const clientData = await Client.findOne({ _id: clientID });

    const folderName = `${clientData.project_number}/04. Authority and Approvals/${section_name}`;

    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;
    
    const digestValueData = await getFormDigestValue(accessToken);
    const formDigestString = digestValueData.FormDigestValue;
    const formDigestValue = formDigestString.split(',')[0];

    await createFolder(accessToken, formDigestValue, folderName);

    if(file){
      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        documents.push({
          name: name,
          document_date,
          amendment,
          file_name: fileName,
          url: url
        });
      }
    }

    const newAuthorityApprovals = new AuthorityApprovals({
      client_id: clientID,
      section_name: section_name,
      documents: documents
    });

    await newAuthorityApprovals.save();

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addAuthorityApprovalsFile = async (req, res) => {
  const file = req.file;
  const { clientID, sectionID, name, document_date, amendment } = req.body;

  const updateData = {};

  try {
    const clientData = await Client.findOne({ _id: clientID });
    const sectionData = await AuthorityApprovals.findOne({ _id: sectionID });

    const folderName = `${clientData.project_number}/04. Authority and Approvals/${sectionData.section_name}`;

    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;
    
    const digestValueData = await getFormDigestValue(accessToken);
    const formDigestString = digestValueData.FormDigestValue;
    const formDigestValue = formDigestString.split(',')[0];
    
    await createFolder(accessToken, formDigestValue, folderName);

    const filter = {
      _id: mongoose.Types.ObjectId(sectionID)
    }

    if (file) {
      updateData['$push'] = {
        'documents': {
          name: name,
          document_date,
          amendment,
          url: '',
          file_name: file.originalname,
        },
      };

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
        updateData['$push']['documents'].url = url;
      }
    }
    
    await AuthorityApprovals.updateOne(filter, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateAuthorityApprovalsFile = async (req, res) => {
  const file = req.file;
  const { fileID, clientID, sectionID, name, document_date, amendment } = req.body;

  try {
    
    const filter = {
      _id: mongoose.Types.ObjectId(sectionID),
      'documents._id': mongoose.Types.ObjectId(fileID)
    }

    const updateData = {
      $set: {
        'documents.$.name': name,
        'documents.$.document_date': document_date,
        'documents.$.amendment': amendment,
      },
    }

    const clientData = await Client.findOne({ _id: clientID });
    const sectionData = await AuthorityApprovals.findOne({ _id: sectionID });

    const folderName = `${clientData.project_number}/04. Authority and Approvals/${sectionData.section_name}`;

    if (file) {
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
        
        updateData.$set['documents.$.url'] = url
      }
      
      updateData.$set['documents.$.file_name'] = fileName
    }
    
    await AuthorityApprovals.updateOne(filter, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteAuthorityApprovalsFile = async (req, res) => {
  const documentID = req.params.documentID;
  const sectionID = req.params.sectionID;
  const clientID = req.params.clientID;
  
  try {
    const filterFind = {
      _id: mongoose.Types.ObjectId(sectionID),
      'documents._id': mongoose.Types.ObjectId(documentID)
    };
    
    const clientData = await Client.findOne({ _id: clientID });
    const document = await AuthorityApprovals.findOne(filterFind);
    
    const foundDocument = document.documents.find(doc => doc._id.toString() === documentID);
    
    if(foundDocument){
      const path = `${clientData.project_number}/04. Authority and Approvals/${document.section_name}/${foundDocument.file_name}`
      
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;

      await deleteSharepointFile(accessToken, path);

      await deleteWholeFolder(`documents/${path}`);
    }

    const filter = {
      _id: mongoose.Types.ObjectId(sectionID),
    };

    const updateData = {};

    updateData['$pull'] = {
      'documents': {
        _id: documentID,
      },
    };

    await AuthorityApprovals.updateOne(filter, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getComplianceOperations = async (req, res) => {
  const clientID = req.params.clientID

  try {
    const result = await ComplianceOperations.find({ client_id: clientID });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getComplianceOperationsSection = async (req, res) => {
  const sectionID = req.params.sectionID

  try {
    const result = await ComplianceOperations.findOne({ _id: sectionID });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateComplianceOperationsSection = async (req, res) => {
  const sectionID = req.params.sectionID
  const { section_name } = req.body;

  try {
    const updateData = {
      section_name
    }
    
    await DrawingsReports.updateOne({ _id: sectionID }, updateData);
    
    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteComplianceOperationsSection = async (req, res) => {
  const sectionID = req.params.sectionID;
  const clientID = req.params.clientID;
  
  try {
    const sectionData = await ComplianceOperations.findOne({ _id: sectionID });
    const clientData = await Client.findOne({ _id: clientID });

    if(sectionData.documents.length > 0){
      const path = `${clientData.project_number}/07. Compliance & Operations Manual/${sectionData.section_name}`;
        
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;

      await deleteSharepointFolder(accessToken, path);

      await deleteWholeFolder(`documents/${path}`);
    }
    
    await ComplianceOperations.findOneAndDelete({ _id: sectionID });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addComplianceOperations = async (req, res) => {
  const file = req.file;
  const { clientID, section_name, name, document_date } = req.body;
  
  let documents = [];

  try {
    const clientData = await Client.findOne({ _id: clientID });

    const folderName = `${clientData.project_number}/07. Compliance & Operations Manual/${section_name}`;

    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;
    
    const digestValueData = await getFormDigestValue(accessToken);
    const formDigestString = digestValueData.FormDigestValue;
    const formDigestValue = formDigestString.split(',')[0];

    await createFolder(accessToken, formDigestValue, folderName);

    if(file){
      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        documents.push({
          name: name,
          document_date,
          file_name: fileName,
          url: url
        });
      }
    }

    const newComplianceOperations = new ComplianceOperations({
      client_id: clientID,
      section_name: section_name,
      documents: documents
    });

    await newComplianceOperations.save();

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addComplianceOperationsFile = async (req, res) => {
  const file = req.file;
  const { clientID, sectionID, name, document_date } = req.body;

  const updateData = {};

  try {
    const clientData = await Client.findOne({ _id: clientID });
    const sectionData = await ComplianceOperations.findOne({ _id: sectionID });

    const folderName = `${clientData.project_number}/07. Compliance & Operations Manual/${sectionData.section_name}`;

    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;
    
    const digestValueData = await getFormDigestValue(accessToken);
    const formDigestString = digestValueData.FormDigestValue;
    const formDigestValue = formDigestString.split(',')[0];
    
    await createFolder(accessToken, formDigestValue, folderName);

    const filter = {
      _id: mongoose.Types.ObjectId(sectionID)
    }

    if (file) {
      updateData['$push'] = {
        'documents': {
          name: name,
          document_date,
          url: '',
          file_name: file.originalname,
        },
      };

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
        updateData['$push']['documents'].url = url;
      }
    }
    
    await ComplianceOperations.updateOne(filter, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateComplianceOperationsFile = async (req, res) => {
  const file = req.file;
  const { fileID, clientID, sectionID, name, document_date } = req.body;

  try {
    
    const filter = {
      _id: mongoose.Types.ObjectId(sectionID),
      'documents._id': mongoose.Types.ObjectId(fileID)
    }

    const updateData = {
      $set: {
        'documents.$.name': name,
        'documents.$.document_date': document_date,
      },
    }

    const clientData = await Client.findOne({ _id: clientID });
    const sectionData = await ComplianceOperations.findOne({ _id: sectionID });

    const folderName = `${clientData.project_number}/07. Compliance & Operations Manual/${sectionData.section_name}`;

    if (file) {
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
        
        updateData.$set['documents.$.url'] = url
      }
      
      updateData.$set['documents.$.file_name'] = fileName
    }
    
    await ComplianceOperations.updateOne(filter, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteComplianceOperationsFile = async (req, res) => {
  const documentID = req.params.documentID;
  const sectionID = req.params.sectionID;
  const clientID = req.params.clientID;
  
  try {
    const filterFind = {
      _id: mongoose.Types.ObjectId(sectionID),
      'documents._id': mongoose.Types.ObjectId(documentID)
    };
    
    const clientData = await Client.findOne({ _id: clientID });
    const document = await ComplianceOperations.findOne(filterFind);
    
    const foundDocument = document.documents.find(doc => doc._id.toString() === documentID);
    
    if(foundDocument){
      const path = `${clientData.project_number}/07. Compliance & Operations Manual/${document.section_name}/${foundDocument.file_name}`
      
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;

      await deleteSharepointFile(accessToken, path);

      await deleteWholeFolder(`documents/${path}`);
    }

    const filter = {
      _id: mongoose.Types.ObjectId(sectionID),
    };

    const updateData = {};

    updateData['$pull'] = {
      'documents': {
        _id: documentID,
      },
    };

    await ComplianceOperations.updateOne(filter, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getProjectPhotos = async (req, res) => {
  const clientID = req.params.clientID

  try {
    const clientData = await Client.findOne({ _id: clientID });

    const result = await ProjectPhotos.find({ client_id: clientID });
    
    res.status(200).json({ data: result, project_number: clientData.project_number });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addProjectPhoto = async (req, res) => {
  const file = req.file;
  const { clientID } = req.body;

  let file_name = "";
  let fileURL = "";

  try {
    const clientData = await Client.findOne({ _id: clientID });

    const folderName = `${clientData.project_number}/08. Project Photos`;

    if(file){
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        file_name = fileName;
        fileURL = url;
      }

      const newProjectPhoto = new ProjectPhotos({
        client_id: clientID,
        file_name: file_name,
        url: fileURL
      });

      await newProjectPhoto.save();
    }
    
    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteProjectPhoto = async (req, res) => {
  const photoID = req.params.photoID;
  const clientID = req.params.clientID;
  
  try {
    const clientData = await Client.findOne({ _id: clientID });
    const projectPhoto = await ProjectPhotos.findOne({ _id: photoID });

    const path = `${clientData.project_number}/08. Project Photos/${projectPhoto.file_name}`
      
    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;

    await deleteSharepointFile(accessToken, path);

    await deleteWholeFolder(`documents/${path}`);

    await ProjectPhotos.findOneAndDelete({ _id: photoID });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getProgressClaims = async (req, res) => {
  const clientID = req.params.clientID

  try {
    const result = await ProgressClaims.find({ client_id: clientID });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addProgressClaims = async (req, res) => {
  const file = req.file;
  const { clientID, name, claim_amount, status, document_date } = req.body;

  let file_name = "";
  let fileURL = "";
  
  try {
    const clientData = await Client.findOne({ _id: clientID });

    const folderName = `${clientData.project_number}/06. Progress Claims, Invoices & Receipts/01. Progress Claims`;

    if(file){
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        file_name = fileName;
        fileURL = url;
      }
    }
    
    const newProgressClaim = new ProgressClaims({
      client_id: clientID,
      name,
      claim_amount,
      document_date,
      status,
      file_name: file_name,
      url: fileURL
    });

    await newProgressClaim.save();

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateProgressClaims = async (req, res) => {
  const progressID = req.params.progressID;

  const file = req.file;
  const { clientID, name, claim_amount, status, document_date } = req.body;
  
  try {
    const updateData = {
      name,
      claim_amount,
      document_date,
      status
    }

    if(file){
      const clientData = await Client.findOne({ _id: clientID });
      const progressData = await ProgressClaims.findOne({ _id: progressID });
  
      const folderName = `${clientData.project_number}/06. Progress Claims, Invoices & Receipts/01. Progress Claims`;
      const filePath = `${clientData.project_number}/06. Progress Claims, Invoices & Receipts/01. Progress Claims/${progressData.file_name}`;

      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      await deleteWholeFolder(`documents/${filePath}`);
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      await deleteSharepointFile(accessToken, filePath);
      
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        updateData.file_name = fileName;
        updateData.url = url;
      }
    }
    
    await ProgressClaims.updateOne({ _id: progressID }, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteProgressClaims = async (req, res) => {
  const progressID = req.params.progressID;
  const clientID = req.params.clientID;
  
  try {
    const clientData = await Client.findOne({ _id: clientID }); 
    const progressData = await ProgressClaims.findOne({ _id: progressID });

    const path = `${clientData.project_number}/06. Progress Claims, Invoices & Receipts/01. Progress Claims/${progressData.file_name}`
      
    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;

    await deleteSharepointFile(accessToken, path);

    await deleteWholeFolder(`documents/${path}`);

    await ProgressClaims.findOneAndDelete({ _id: progressID });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getInvoices = async (req, res) => {
  const clientID = req.params.clientID

  try {
    const result = await Invoices.find({ client_id: clientID });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addInvoice = async (req, res) => {
  const file = req.file;
  const { clientID, name, invoice_amount, status, document_date } = req.body;

  let file_name = "";
  let fileURL = "";
  
  try {
    const clientData = await Client.findOne({ _id: clientID });

    const folderName = `${clientData.project_number}/06. Progress Claims, Invoices & Receipts/02. Invoices`;

    if(file){
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        file_name = fileName;
        fileURL = url;
      }
    }
    
    const newInvoice = new Invoices({
      client_id: clientID,
      name,
      document_date,
      invoice_amount,
      status,
      file_name: file_name,
      url: fileURL
    });

    await newInvoice.save();

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateInvoice = async (req, res) => {
  const invoiceID = req.params.invoiceID;

  const file = req.file;
  const { clientID, name, invoice_amount, status, document_date } = req.body;
  
  try {
    const updateData = {
      name,
      invoice_amount,
      document_date,
      status
    }

    if(file){
      const clientData = await Client.findOne({ _id: clientID });
      const invoiceData = await Invoices.findOne({ _id: invoiceID });
  
      const folderName = `${clientData.project_number}/06. Progress Claims, Invoices & Receipts/02. Invoices`;
      const filePath = `${clientData.project_number}/06. Progress Claims, Invoices & Receipts/02. Invoices/${invoiceData.file_name}`;

      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      await deleteWholeFolder(`documents/${filePath}`);
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      await deleteSharepointFile(accessToken, filePath);
      
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        updateData.file_name = fileName;
        updateData.url = url;
      }
    }
    
    await Invoices.updateOne({ _id: invoiceID }, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteInvoice = async (req, res) => {
  const invoiceID = req.params.invoiceID;
  const clientID = req.params.clientID;
  
  try {
    const clientData = await Client.findOne({ _id: clientID }); 
    const invoiceData = await Invoices.findOne({ _id: invoiceID });

    const path = `${clientData.project_number}/06. Progress Claims, Invoices & Receipts/02. Invoices/${invoiceData.file_name}`
      
    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;

    await deleteSharepointFile(accessToken, path);

    await deleteWholeFolder(`documents/${path}`);

    await Invoices.findOneAndDelete({ _id: invoiceID });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getContractSumAndCompletion = async (req, res) => {
  const clientID = req.params.clientID;
  
  try {
    const contractSum = await ContractSum.findOne({ client_id: clientID });

    const practicalCompletion = await PracticalCompletion.findOne({ client_id: clientID });
    
    res.status(200).json({ contractSum, practicalCompletion });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getContractSum = async (req, res) => {
  const clientID = req.params.clientID;
  
  try {
    const contractSum = await ContractSum.findOne({ client_id: clientID });
    
    res.status(200).json(contractSum);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getPracticalCompletion = async (req, res) => {
  const clientID = req.params.clientID;
  
  try {
    const practicalCompletion = await PracticalCompletion.findOne({ client_id: clientID });
    
    res.status(200).json(practicalCompletion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateContractSum = async (req, res) => {
  const contractID = req.params.contractID;
  const { original_contract_sum, variation, revised_contract_sum } = req.body;

  try {
    const updateData = {
      original_contract_sum,
      variation,
      revised_contract_sum
    }

    await ContractSum.updateOne({ _id: contractID }, updateData)
      
    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updatePracticalCompletion = async (req, res) => {
  const completionID = req.params.completionID;
  const { original_practical_completion, approved_extension_of_time, revised_practical_completion } = req.body;
  
  try {
    const updateData = {
      original_practical_completion,
      approved_extension_of_time,
      revised_practical_completion
    }

    await PracticalCompletion.updateOne({ _id: completionID }, updateData)
      
    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getContractDocuments = async (req, res) => {
  const clientID = req.params.clientID

  try {
    const result = await ContractDocument.find({ client_id: clientID });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addContractDocument = async (req, res) => {
  const file = req.file;
  const { clientID, name, document_date } = req.body;

  let file_name = "";
  let fileURL = "";
  
  try {
    const clientData = await Client.findOne({ _id: clientID });

    const folderName = `${clientData.project_number}/05. Contact Administration/01. Contract Documents`;

    if(file){
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        file_name = fileName;
        fileURL = url;
      }
    }
    
    const newContractDocument = new ContractDocument({
      client_id: clientID,
      name,
      document_date,
      file_name: file_name,
      url: fileURL
    });

    await newContractDocument.save();

    res.status(200).json(1);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}

exports.updateContactDocument = async (req, res) => {
  const contractID = req.params.contractID;

  const file = req.file;
  const { clientID, name, document_date } = req.body;
  
  try {
    const updateData = {
      name,
      document_date
    }

    if(file){
      const clientData = await Client.findOne({ _id: clientID });
      const contractData = await ContractDocument.findOne({ _id: contractID });
  
      const folderName = `${clientData.project_number}/05. Contact Administration/01. Contract Documents`;
      const filePath = `${clientData.project_number}/05. Contact Administration/01. Contract Documents/${contractData.file_name}`;

      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      await deleteWholeFolder(`documents/${filePath}`);
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      await deleteSharepointFile(accessToken, filePath);
      
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        updateData.file_name = fileName;
        updateData.url = url;
      }
    }
    
    await ContractDocument.updateOne({ _id: contractID }, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteContractDocument = async (req, res) => {
  const contractID = req.params.contractID;
  const clientID = req.params.clientID;
  
  try {
    const clientData = await Client.findOne({ _id: clientID }); 
    const contractData = await ContractDocument.findOne({ _id: contractID });

    const path = `${clientData.project_number}/05. Contact Administration/01. Contract Documents/${contractData.file_name}`
      
    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;

    await deleteSharepointFile(accessToken, path);

    await deleteWholeFolder(`documents/${path}`);

    await ContractDocument.findOneAndDelete({ _id: contractID });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getExtensionTime = async (req, res) => {
  const clientID = req.params.clientID

  try {
    const result = await ExtensionTime.find({ client_id: clientID });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addExtensionTime = async (req, res) => {
  const file = req.file;
  const { clientID, name, days_submitted, status, document_date } = req.body;

  let file_name = "";
  let fileURL = "";
  
  try {
    const clientData = await Client.findOne({ _id: clientID });

    const folderName = `${clientData.project_number}/05. Contact Administration/02. Extension of Time`;

    if(file){
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        file_name = fileName;
        fileURL = url;
      }
    }
    
    const newExtensionOfTime = new ExtensionTime({
      client_id: clientID,
      name,
      document_date,
      days_submitted,
      status,
      file_name: file_name,
      url: fileURL
    });

    await newExtensionOfTime.save();

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateExtensionTime = async (req, res) => {
  const extensionTime = req.params.extensionTime;

  const file = req.file;
  const { clientID, name, days_submitted, status, document_date } = req.body;
  
  try {
    const updateData = {
      name,
      days_submitted,
      status,
      document_date
    }

    if(file){
      const clientData = await Client.findOne({ _id: clientID });
      const extensionData = await ExtensionTime.findOne({ _id: extensionTime });
  
      const folderName = `${clientData.project_number}/05. Contact Administration/02. Extension of Time`;
      const filePath = `${clientData.project_number}/05. Contact Administration/02. Extension of Time/${extensionData.file_name}`;

      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      await deleteWholeFolder(`documents/${filePath}`);
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      await deleteSharepointFile(accessToken, filePath);
      
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        updateData.file_name = fileName;
        updateData.url = url;
      }
    }
    
    await ExtensionTime.updateOne({ _id: extensionTime }, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteExtensionTime = async (req, res) => {
  const extensionTime = req.params.extensionTime;
  const clientID = req.params.clientID;
  
  try {
    const clientData = await Client.findOne({ _id: clientID }); 
    const extensionData = await ExtensionTime.findOne({ _id: extensionTime });

    const path = `${clientData.project_number}/05. Contact Administration/02. Extension of Time/${extensionData.file_name}`
      
    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;

    await deleteSharepointFile(accessToken, path);

    await deleteWholeFolder(`documents/${path}`);

    await ExtensionTime.findOneAndDelete({ _id: extensionTime });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getVariation = async (req, res) => {
  const clientID = req.params.clientID

  try {
    const result = await Variation.find({ client_id: clientID });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addVariation = async (req, res) => {
  const file = req.file;
  const { clientID, name, amount_submitted, status, document_date } = req.body;

  let file_name = "";
  let fileURL = "";
  
  try {
    const clientData = await Client.findOne({ _id: clientID });

    const folderName = `${clientData.project_number}/05. Contact Administration/03. Variations`;

    if(file){
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        file_name = fileName;
        fileURL = url;
      }
    }
    
    const newVariation = new Variation({
      client_id: clientID,
      name,
      document_date,
      amount_submitted,
      status,
      file_name: file_name,
      url: fileURL
    });

    await newVariation.save();

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateVariation = async (req, res) => {
  const variationID = req.params.variationID;

  const file = req.file;
  const { clientID, name, amount_submitted, status, document_date } = req.body;
  
  try {
    const updateData = {
      name,
      document_date,
      amount_submitted,
      status
    }

    if(file){
      const clientData = await Client.findOne({ _id: clientID });
      const variationData = await Variation.findOne({ _id: variationID });
  
      const folderName = `${clientData.project_number}/05. Contact Administration/03. Variations`;
      const filePath = `${clientData.project_number}/05. Contact Administration/03. Variations/${variationData.file_name}`;

      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
      
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `documents/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      await deleteWholeFolder(`documents/${filePath}`);
      
      const result = await uploadFileToSharePointWithFolder(accessToken, formDigestValue, file, folderName);
      await deleteSharepointFile(accessToken, filePath);
      
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
      
        updateData.file_name = fileName;
        updateData.url = url;
      }
    }
    
    await Variation.updateOne({ _id: variationID }, updateData);

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteVariation = async (req, res) => {
  const variationID = req.params.variationID;
  const clientID = req.params.clientID;
  
  try {
    const clientData = await Client.findOne({ _id: clientID }); 
    const variationData = await Variation.findOne({ _id: variationID });

    const path = `${clientData.project_number}/05. Contact Administration/03. Variations/${variationData.file_name}`
      
    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;

    await deleteSharepointFile(accessToken, path);

    await deleteWholeFolder(`documents/${path}`);

    await Variation.findOneAndDelete({ _id: variationID });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}