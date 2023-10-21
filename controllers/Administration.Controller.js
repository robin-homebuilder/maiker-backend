const mongoose = require("mongoose");

const slugify = require("slugify");

const { Client, ClientProject } = require("../models/Client.Model");
const { Article } = require("../models/Articles.Model");
const { Consultant } = require("../models/Consultant.Model");
const { Project } = require("../models/Projects.Model");
const { User } = require("../models/Users.Model");

const { uploadFileToS3, deleteWholeFolder } = require("../services/aws.s3.services");

const { getSharePointAccessToken, getFormDigestValue, createFolder, uploadFileToSharePointInsurances, createAnonymousLink } = require("../services/sharePoint.services");

const { ROLES_LIST } = require("../config/roles_list");

exports.createArticle = async (req, res) => {
  const { imageFile, bannerFile } = req.files;
  const { title, sub_title, author, company, issued_date, content, with_sidebar, external_links } = req.body;

  const parsedLinks = JSON.parse(external_links);

  try {
    const titleWithoutSpecialChars = title ? title.replace(/[^\w\s]/gi, '') : "";
    const itemSlug = slugify(titleWithoutSpecialChars ?? "" , { lower: true });

    let uniqueSlug = itemSlug; 

    const checkSlug = await Article.findOne({ slug: itemSlug });

    if (checkSlug) {
        let count = 1;
        let newSlug = itemSlug;
        while (true) {
          newSlug = `${itemSlug}-${count}`;
          const checkNewSlug = await Article.findOne({ slug: newSlug });
          if (!checkNewSlug) {
            uniqueSlug = newSlug;
            break;
          }
          count++;
        }
    }

    let imageKeyURL = "";
    let bannerKeyURL = "";

    if(imageFile){
      const fileData = imageFile[0];
      
      const fileName = fileData.originalname;
      const fileBuffer = fileData.buffer;
      const mimeType = fileData.mimetype;
      const imageKey = `articles/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });

      imageKeyURL = imageKey;
    }

    if(bannerFile){
      const fileData = bannerFile[0];
      
      const fileName = fileData.originalname;
      const fileBuffer = fileData.buffer;
      const mimeType = fileData.mimetype;
      const imageKey = `articles/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });

      bannerKeyURL = imageKey;
    }

    const countArticle = await Article.findOne({}).sort('-order').limit(1);

    const newArticle = new Article({
      title, 
      sub_title, 
      slug: uniqueSlug,
      author, 
      content,
      issued_date,
      company,
      with_sidebar,
      banner: bannerKeyURL,
      image: imageKeyURL,
      external_links: parsedLinks,
      order: parseInt(countArticle?.order ?? 0) + 1,
    });

    await newArticle.save();
    
    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find({}).select("title author issued_date").sort({ order: 1});
    
    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getSearchArticles = async (req, res) => {
  const { search_data } = req.body;

  const regex = new RegExp(`.*${search_data}.*`, "i");
  
  try {
    const articles = await Article.find({title: regex}).select("title author issued_date").sort({ order: 1});
    
    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getArticleByID = async (req, res) => {
  const articleID = req.params.articleID;
  
  try {
    const article = await Article.findOne({ _id: articleID });

    res.status(200).json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateArticle = async (req, res) => {
  const articleID = req.params.articleID;
  const { imageFile, bannerFile } = req.files;
  const { title, sub_title, author, company, issued_date, content, with_sidebar, external_links } = req.body;
  
  const parsedLinks = JSON.parse(external_links);
  
  try {
    let filteredArray = [];

    if(parsedLinks.length > 0){
      filteredArray = parsedLinks.map(({ _id, ...rest }) => rest);
    }
    
    const updateData = {
      title,
      sub_title,
      author,
      company,
      issued_date,
      content,
      with_sidebar,
      external_links: filteredArray
    }

    if(imageFile){
      const fileData = imageFile[0];
      
      const fileName = fileData.originalname;
      const fileBuffer = fileData.buffer;
      const mimeType = fileData.mimetype;
      const imageKey = `articles/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });

      updateData.image = imageKey;
    }

    if(bannerFile){
      const fileData = bannerFile[0];
      
      const fileName = fileData.originalname;
      const fileBuffer = fileData.buffer;
      const mimeType = fileData.mimetype;
      const imageKey = `articles/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });

      updateData.banner = imageKey;
    }

    await Article.updateOne({ _id: articleID }, updateData);
    
    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.deleteArticle = async (req, res) => {
  const articleID = req.params.articleID;
  
  try {

    await Article.findOneAndDelete({ _id: articleID });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getClients = async (req, res) => {
  try {
    const clients = await Client.aggregate([
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
          type: 1,
          first_name: 1,
          last_name: 1,
          company_name: 1,
          trustee_name: 1,
          site_address: '$projectData.site_address'
        }
      }
    ]);
    
    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getClientByID = async (req, res) => {
  const clientID = req.params.clientID;
  
  try {
    let result = {};
    // const clients = await Client.findOne({ _id: clientID}).select("type first_name last_name company_name trustee_name phone email").populate("project_id", "-_id site_address");
    const client = await Client.aggregate([ 
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
          type: 1,
          first_name: 1,
          last_name: 1,
          company_name: 1,
          trustee_name: 1,
          phone: 1,
          email: 1,
          abn: 1,
          trust_name: 1,
          site_address: '$projectData.site_address',
          project_status: 1
        }
      }
    ]);

    if(client[0]){
      result = client[0]
    }
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getClientCredentialByID = async (req, res) => {
  const clientID = req.params.clientID;
  
  try {
    const data = {
      id: clientID
    }
    
    const user = await User.findOne({ account_id: clientID, type: "client" })
    
    if(user){
      data.email = user.user_email;
      data.password = user.user_pass
    } else{
      const client = await Client.findOne({ _id: clientID })

      if(client){
        data.email = client.email;
        data.password = ""
      } else{
        data.email = "";
        data.password = ""
      }
    }
    
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.saveClientCredentials = async (req, res) => {
  const { id, email, password } = req.body;

  try {
    const user = await User.findOne({ account_id: id, type: "client" });

    if(user){
      await User.updateOne({ _id: user._id, type: "client" }, { user_pass: password });
    } else{
      const newUser = new User({
        type: "client",
        account_id: id,
        user_email: email,
        user_pass: password,
        user_role: ROLES_LIST.Client,
        status: 1
      });

      await newUser.save();
    }

    res.status(200).json(1);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}

exports.getSearchClients = async (req, res) => {
  const { search_data } = req.body;

  const regex = new RegExp(`.*${search_data}.*`, "i");

  try {
    const clients = await Client.aggregate([
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
          type: 1,
          first_name: 1,
          last_name: 1,
          company_name: 1,
          trustee_name: 1,
          site_address: '$projectData.site_address'
        }
      },
      {
        $match: {
          $or: [
            { first_name: regex },
            { last_name: regex },
            { site_address: regex }
          ]
        }
      }
    ]);
    
    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.createClient = async (req, res) => {
  const { type, phone, email, site_address, first_name, last_name, company_name, trustee_name, trust_name, abn } = req.body;

  try {
    //Create New Project
    let lastProjectNumber;
    let project_id;

    const lastProject = await ClientProject.findOne({}, {}, { sort: { 'createdAt': -1 } });
    
    if(lastProject){
      lastProjectNumber = lastProject.project_no + 1;
    } else{
      lastProjectNumber = 10000;
    }
      
    if(type == "company_owner"){
      project_id = `${lastProjectNumber} - ${company_name}`
    } else if(type == "trust_owner"){
      project_id = `${lastProjectNumber} - ${trustee_name}`
    } else{
      project_id = `${lastProjectNumber} - ${last_name}`
    }

    const newProject = new ClientProject({
      project_id: project_id,
      project_no: lastProjectNumber,
      site_address,
    });
    
    const projectData = await newProject.save();
    //End New Project

    const newClient = new Client({
      type,
      first_name,
      last_name,
      phone,
      email,
      company_name,
      trustee_name,
      trust_name,
      abn,
      project_id: projectData._id,
      project_number: project_id,
      project_status: 301
    });

    await newClient.save();

    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;

    const digestValueData = await getFormDigestValue(accessToken);
    const formDigestString = digestValueData.FormDigestValue;
    const formDigestValue = formDigestString.split(',')[0];

    await createFolder(accessToken, formDigestValue, project_id);
    await createFolder(accessToken, formDigestValue, `${project_id}/01. Client Information`);
    await createFolder(accessToken, formDigestValue, `${project_id}/01. Client Information/Client Documents`);
    await createFolder(accessToken, formDigestValue, `${project_id}/02. Site Information`);
    await createFolder(accessToken, formDigestValue, `${project_id}/02. Site Information/Site Information Documents`);
    await createFolder(accessToken, formDigestValue, `${project_id}/03. Drawing and Reports`);
    await createFolder(accessToken, formDigestValue, `${project_id}/04. Authority and Approvals`);
    await createFolder(accessToken, formDigestValue, `${project_id}/05. Contact Administration`);
    await createFolder(accessToken, formDigestValue, `${project_id}/05. Contact Administration/01. Contract Documents`);
    await createFolder(accessToken, formDigestValue, `${project_id}/05. Contact Administration/02. Extension of Time`);
    await createFolder(accessToken, formDigestValue, `${project_id}/05. Contact Administration/03. Variations`);
    await createFolder(accessToken, formDigestValue, `${project_id}/06. Progress Claims, Invoices & Receipts`);
    await createFolder(accessToken, formDigestValue, `${project_id}/06. Progress Claims, Invoices & Receipts/01. Progress Claims`);
    await createFolder(accessToken, formDigestValue, `${project_id}/06. Progress Claims, Invoices & Receipts/02. Invoices`);
    await createFolder(accessToken, formDigestValue, `${project_id}/06. Progress Claims, Invoices & Receipts/03. Receipts`);
    await createFolder(accessToken, formDigestValue, `${project_id}/07. Compliance & Operations Manual`);
    await createFolder(accessToken, formDigestValue, `${project_id}/08. Project Photos`);

    
    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateClient = async (req, res) => {
  const clientID = req.params.clientID;

  const { type, phone, email, site_address, first_name, last_name, company_name, trustee_name, trust_name, abn } = req.body;
  
  try {
    let updateData = {};

    if(type == "individual_owner"){
      updateData = {
        first_name,
        last_name,
        type,
        phone,
        email,
        abn: "",
        company_name: "",
        trustee_name: "",
        trust_name: ""
      }
    } else if(type == "company_owner"){
      updateData = {
        first_name,
        last_name,
        type,
        phone,
        email,
        abn,
        company_name,
        trustee_name: "",
        trust_name: ""
      }
    } else if(type == "trust_owner"){
      updateData = {
        first_name,
        last_name,
        type,
        phone,
        email,
        abn,
        company_name: "",
        trustee_name,
        trust_name
      }
    }

    await Client.updateOne({ _id: clientID }, updateData);

    const clientData = await Client.findOne({ _id: clientID }).select("-_id project_id");

    const updateProjectData = {
      site_address
    }

    await ClientProject.updateOne({ _id: clientData.project_id }, updateProjectData);
    
    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateClientProjectStatus = async (req, res) => {
  const clientID = req.params.clientID;

  const { status } = req.body;
  
  try {
    const updateData = {
      project_status: status
    }

    await Client.updateOne({ _id: clientID }, updateData);
    
    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.createConsultant = async (req, res) => {
  const file = req.file;
  const { name, licence, insurance, insurance_expiry, email } = req.body;
  
  try {
    let insuranceLink;
    let insuranceName;

    let consultantNumber;

    const lastConsultant = await Consultant.findOne({}, {}, { sort: { 'createdAt': -1 } });
    
    if(lastConsultant){
      consultantNumber = parseInt(lastConsultant.id_number) + 1;
    } else{
      consultantNumber = 10000;
    }

    if(file){
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
  
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];
  
      const folderName = `${consultantNumber}`;
  
      await createFolder(accessToken, formDigestValue, `Insurances/${folderName}`);

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `insurances/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointInsurances(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
        
        insuranceLink = url;
        insuranceName = insurance
      }
    }

    const newConsultant = new Consultant({
      id_number: consultantNumber,
      name, 
      licence, 
      insurance: insuranceName,
      insurance_link: insuranceLink, 
      insurance_expiry, 
      email
    });

    await newConsultant.save();
    
    res.status(200).json(1);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}

exports.updateConsultant = async (req, res) => {
  const consultantID = req.params.consultantID;
  
  const file = req.file;
  const { name, licence, insurance, insurance_expiry, email, id_number } = req.body;
  
  try {
    const updateData = {
      name,
      licence,
      insurance_expiry,
      email
    };

    if(file){
      const accessTokenData = await getSharePointAccessToken();
      const accessToken = accessTokenData.access_token;
  
      const digestValueData = await getFormDigestValue(accessToken);
      const formDigestString = digestValueData.FormDigestValue;
      const formDigestValue = formDigestString.split(',')[0];
  
      const folderName = `${id_number}`;
  
      await createFolder(accessToken, formDigestValue, `Insurances/${folderName}`);

      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const imageKey = `insurances/${folderName}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      
      const result = await uploadFileToSharePointInsurances(accessToken, formDigestValue, file, folderName);
      
      if(result){
        const url = await createAnonymousLink(accessToken, result.ServerRelativeUrl);
        
        updateData.insurance = insurance;
        updateData.insurance_link = url;
      }
    }

    await Consultant.updateOne({ _id: consultantID }, updateData);

    res.status(200).json(1);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}

exports.getConsultants = async (req, res) => {
  try {
    const consultants = await Consultant.find({});
    
    res.status(200).json(consultants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getConsultantByID = async (req, res) => {
  const consultantID = req.params.consultantID;

  try {
    const consultant = await Consultant.findOne({ _id: consultantID });
    
    res.status(200).json(consultant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getConsultantCredentialByID = async (req, res) => {
  const consultantID = req.params.consultantID;
  
  try {
    const data = {
      id: consultantID
    }
    
    const user = await User.findOne({ account_id: consultantID, type: "consultant" })
    
    if(user){
      data.email = user.user_email;
      data.password = user.user_pass
    } else{
      const consultant = await Consultant.findOne({ _id: consultantID })

      if(consultant){
        data.email = consultant.email;
        data.password = ""
      } else{
        data.email = ""
        data.password = ""
      }
    }
    
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.saveConsultantCredentials = async (req, res) => {
  const { id, email, password } = req.body;

  try {
    const user = await User.findOne({ account_id: id, type: "consultant" });

    if(user){
      await User.updateOne({ _id: user._id, type: "consultant" }, { user_pass: password });
    } else{
      const newUser = new User({
        type: "consultant",
        account_id: id,
        user_email: email,
        user_pass: password,
        user_role: ROLES_LIST.Consultant,
        status: 1
      });

      await newUser.save();
    }

    res.status(200).json(1);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}

exports.getSearchConsultants = async (req, res) => {
  const { search_data } = req.body;
  
  const regex = new RegExp(`.*${search_data}.*`, "i");
  
  try {
    const consultants = await Consultant.find({ name: regex });
    
    res.status(200).json(consultants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.createProjectPhoto = async (req, res) => {
  const { main_image, other_image } = req.files
  
  try {
    let mainImage = "";
    let image_base_url = "";

    const otherImage = [];

    let projectNumber;

    const lastProject = await Project.findOne({}, {}, { sort: { 'createdAt': -1 } });
    
    if(lastProject){
      projectNumber = parseInt(lastProject.title.split(" ")[1]) + 1;
    } else{
      projectNumber = 0;
    }

    image_base_url = `projects/project-${projectNumber}`;

    if(main_image){
      const fileData = main_image[0];
      
      const fileName = fileData.originalname;
      const fileBuffer = fileData.buffer;
      const mimeType = fileData.mimetype;
      const imageKey = `${image_base_url}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });

      mainImage = fileName;
    }

    if(other_image){
      await Promise.all(other_image.map(async (file) => {
        const fileName = file.originalname;
        const fileBuffer = file.buffer;
        const mimeType = file.mimetype;
        const imageKey = `${image_base_url}/${fileName}`;

        await uploadFileToS3({ fileBuffer, imageKey, mimeType });

        otherImage.push(fileName);
      }));
    }

    const newProjectPhoto = new Project({
      title: `Project ${projectNumber}`,
      image_base_url: `/${image_base_url}`,
      main_image: mainImage,
      other_image: otherImage
    })

    await newProjectPhoto.save();

    res.status(200).json(1);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}

exports.getProjectPhotos = async (req, res) => {
  try {
    const projects = await Project.find({});
    
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateProjectPhoto = async (req, res) => {
  const projectID = req.params.projectID;
  const { main_image, other_image } = req.files;
  const { otherImageList } = req.body;
  const parsedImageList = JSON.parse(otherImageList);

  try {
    const projectData = await Project.findOne({ _id: projectID });

    const formattedString = projectData.title.toLowerCase().replace(/\s+/g, '-');

    const updateData = {
      other_image: parsedImageList
    }

    if(main_image){
      const fileData = main_image[0];
      
      const fileName = fileData.originalname;
      const fileBuffer = fileData.buffer;
      const mimeType = fileData.mimetype;
      const imageKey = `projects/${formattedString}/${fileName}`;

      await uploadFileToS3({ fileBuffer, imageKey, mimeType });

      updateData.main_image = fileName;
    }

    if(other_image){
      await Promise.all(other_image.map(async (file) => {
        
        const fileName = file.originalname;
        const fileBuffer = file.buffer;
        const mimeType = file.mimetype;
        const imageKey = `projects/${formattedString}/${fileName}`;

        await uploadFileToS3({ fileBuffer, imageKey, mimeType });
      }));
    }

    await Project.updateOne({ _id: projectID }, updateData);

    res.status(200).json(1);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}

exports.deleteProject = async (req, res) => {
  const projectID = req.params.projectID;
  
  try {
    const projectData = await Project.findOne({ _id: projectID });

    const formattedString = projectData.title.toLowerCase().replace(/\s+/g, '-');

    await deleteWholeFolder(`projects/${formattedString}`);

    await Project.findOneAndDelete({ _id: projectID });

    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}