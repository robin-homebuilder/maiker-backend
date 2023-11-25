const axios = require('axios');
const FormData = require('form-data');

exports.getSharePointAccessToken = async () => {
  const sharepointDomain = process.env.SHAREPOINT_DOMAIN;
  const clientId = process.env.SHAREPOINT_CLIENT_ID;
  const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET;
  const tenantID = process.env.SHAREPOINT_TENANT_ID;
  const resource = process.env.SHAREPOINT_RESOURCE;

  try {
    let data = new FormData();
    data.append('grant_type', 'client_credentials');
    data.append('client_id', `${clientId}@${tenantID}`);
    data.append('client_secret', clientSecret);
    data.append('resource', `${resource}/${sharepointDomain}@${tenantID}`);

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://accounts.accesscontrol.windows.net/${tenantID}/tokens/OAuth/2`,
      headers: { 
        'Content-Type': 'application/json;odata=verbose', 
        'Accept': 'application/json;odata=verbose', 
        ...data.getHeaders()
      },
      data : data
    };

    const response = await axios.request(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
    
    return response;
  } catch (err) {
    return err;
  }
}

exports.getFormDigestValue = async (accessToken) => {
  const sharepointDomain = process.env.SHAREPOINT_DOMAIN;
  const sharepointSite = process.env.SHAREPOINT_SITE;
  
  try {
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://${sharepointDomain}/${sharepointSite}/_api/contextinfo`,
      headers: { 
        'Accept': 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=verbose',
        'Authorization': `Bearer ${accessToken}` 
      }
    };

    const response = await axios.request(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
    
    return response;
  } catch (err) {
    return err;
  }
}

exports.uploadFileToSharePoint = async (accessToken, digestValue, file, parentFolder) => {
  const sharepointDomain = process.env.SHAREPOINT_DOMAIN;
  const sharepointSite = process.env.SHAREPOINT_SITE;

  const currentDate = new Date();
  const time = currentDate.getTime();
  
  const fileName = `${time}_${file.originalname}`;
  const fileBuffer = file.buffer;

  const encodedFilename = encodeURIComponent(fileName);

  try {
    const apiURL = `https://${sharepointDomain}/${sharepointSite}/_api/web/GetFolderByServerRelativeURL('/sites/MaikerConstructionsProjects/Shared Documents/${parentFolder}/01%2E%20Client%20Information/Client%20Documents')/Files/add(url='${encodedFilename}', overwrite=false)`;
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: apiURL,
      headers: { 
        'Accept': 'application/json;odata=nometadata',
        'Authorization': `Bearer ${accessToken}`,
        'X-RequestDigest': digestValue
      },
      data: fileBuffer
    };

    const response = await axios.request(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });

    return response;
  } catch (err) {
    return err;
  }
}

exports.uploadFileToSharePointWithFolder = async (accessToken, digestValue, file, parentFolder) => {
  const sharepointDomain = process.env.SHAREPOINT_DOMAIN;
  const sharepointSite = process.env.SHAREPOINT_SITE;
  
  const fileName = file.originalname;
  const fileBuffer = file.buffer;

  const encodedFilename = encodeURIComponent(fileName);

  try {
    const apiURL = `https://${sharepointDomain}/${sharepointSite}/_api/web/GetFolderByServerRelativeURL('/sites/MaikerConstructionsProjects/Shared Documents/${parentFolder}')/Files/add(url='${encodedFilename}', overwrite=false)`;
    
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: apiURL,
      headers: { 
        'Accept': 'application/json;odata=nometadata',
        'Authorization': `Bearer ${accessToken}`,
        'X-RequestDigest': digestValue
      },
      data: fileBuffer
    };

    const response = await axios.request(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });

    return response;
  } catch (err) {
    return err;
  }
}

exports.uploadFileToSharePointQuestionnaire = async (accessToken, digestValue, file, parentFolder) => {
  const sharepointDomain = process.env.SHAREPOINT_DOMAIN;
  const sharepointSite = process.env.SHAREPOINT_SITE;
  
  const fileName = file.originalname;
  const fileBuffer = file.buffer;

  const encodedFilename = encodeURIComponent(fileName);

  try {
    const apiURL = `https://${sharepointDomain}/${sharepointSite}/_api/web/GetFolderByServerRelativeURL('/sites/MaikerConstructionsProjects/Shared Documents/Questionnaire/${parentFolder}')/Files/add(url='${encodedFilename}', overwrite=true)`;
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: apiURL,
      headers: { 
        'Accept': 'application/json;odata=nometadata',
        'Authorization': `Bearer ${accessToken}`,
        'X-RequestDigest': digestValue
      },
      data: fileBuffer
    };

    const response = await axios.request(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });

    return response;
  } catch (err) {
    return err;
  }
}

exports.uploadFileToSharePointInsurances = async (accessToken, digestValue, file, parentFolder) => {
  const sharepointDomain = process.env.SHAREPOINT_DOMAIN;
  const sharepointSite = process.env.SHAREPOINT_SITE;
  
  const fileName = file.originalname;
  const fileBuffer = file.buffer;

  const encodedFilename = encodeURIComponent(fileName);

  try {
    const apiURL = `https://${sharepointDomain}/${sharepointSite}/_api/web/GetFolderByServerRelativeURL('/sites/MaikerConstructionsProjects/Shared Documents/Insurances/${parentFolder}')/Files/add(url='${encodedFilename}', overwrite=true)`;
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: apiURL,
      headers: { 
        'Accept': 'application/json;odata=nometadata',
        'Authorization': `Bearer ${accessToken}`,
        'X-RequestDigest': digestValue
      },
      data: fileBuffer
    };

    const response = await axios.request(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });

    return response;
  } catch (err) {
    return err;
  }
}

exports.createFolder = async (accessToken, digestValue, folderURL) => {
  const sharepointDomain = process.env.SHAREPOINT_DOMAIN;
  const sharepointSite = process.env.SHAREPOINT_SITE;

  try {
    const apiURL = `https://${sharepointDomain}/${sharepointSite}/_api/web/folders`;

    const body = {
      "__metadata": {
        "type": "SP.Folder"
      },
      "ServerRelativeUrl": `Shared Documents/${folderURL}`
    }

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: apiURL,
      headers: { 
        'Accept': 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=verbose',
        'Authorization': `Bearer ${accessToken}`,
        'X-RequestDigest': digestValue
      },
      data: body
    };

    const response = await axios.request(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });

    return response;
  } catch (err) {
    return err;
  }
}

exports.createAnonymousLink = async (accessToken, relativePath) => {
  const sharepointDomain = process.env.SHAREPOINT_DOMAIN;
  const sharepointSite = process.env.SHAREPOINT_SITE;

  const encodedRelativePath = encodeURIComponent(`https://${sharepointDomain}${relativePath}`);
  
  try {
    const apiURL = `https://${sharepointDomain}/${sharepointSite}/_api/SP.Web.CreateAnonymousLink`;

    const body = {
      "url": `https://${sharepointDomain}${relativePath}`
    }

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: apiURL,
      headers: { 
        'Accept': 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=verbose',
        'Authorization': `Bearer ${accessToken}`,
      },
      data: JSON.stringify(body)
    };

    const response = await axios.request(config)
    .then((response) => {
      return response.data.value;
    })
    .catch((error) => {
      return error;
    });

    return response;
  } catch (err) {
    return err;
  }
}

exports.deleteSharepointFile = async (accessToken, path) => {
  const sharepointDomain = process.env.SHAREPOINT_DOMAIN;
  const sharepointSite = process.env.SHAREPOINT_SITE;

  const relativePath = `/sites/MaikerConstructionsProjects/Shared Documents/${path}`
  
  try {
    const apiURL = `https://${sharepointDomain}/${sharepointSite}/_api/web/GetFileByServerRelativePath(decodedurl='${relativePath}')`;

    const headers = {
      'Accept': 'application/json;odata=verbose',
      'Content-Type': 'application/json;odata=verbose',
      'Authorization': `Bearer ${accessToken}`,
    };

    const config = {
      method: 'delete',
      url: apiURL,
      headers: headers,
    };

    const response = await axios.request(config);
    
  } catch (error) {
    return error.message;
  }
} 

exports.deleteSharepointFolder = async (accessToken, path) => {
  const sharepointDomain = process.env.SHAREPOINT_DOMAIN;
  const sharepointSite = process.env.SHAREPOINT_SITE;

  const relativePath = `/sites/MaikerConstructionsProjects/Shared Documents/${path}`;

  try {
    const apiURL = `https://${sharepointDomain}/${sharepointSite}/_api/web/GetFolderByServerRelativePath(decodedurl='${relativePath}')`;

    const headers = {
      'Accept': 'application/json;odata=verbose',
      'Content-Type': 'application/json;odata=verbose',
      'Authorization': `Bearer ${accessToken}`,
    };

    const config = {
      method: 'delete',
      url: apiURL,
      headers: headers,
    };

    const response = await axios.request(config);
  } catch (error) {
    return error.message;
  }
}

exports.createShareableLink = async (accessToken, relativePath) => {
  const sharepointDomain = process.env.SHAREPOINT_DOMAIN;
  const sharepointSite = process.env.SHAREPOINT_SITE;

  try {
    const apiURL = `https://${sharepointDomain}/${sharepointSite}/_api/SP.Sharing.DocumentLibrarySharingManager/GetFileByServerRelativePath(decodedUrl='${relativePath}')/ShareLink`;
    
    const body = {
      "request": {
        "createLink": true,
        "settings": {
          "expiration": "never",
          "role": 2 // View
        }
      }
    };

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: apiURL,
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
        'Authorization': `Bearer ${accessToken}`,
      },
      data: body,
    };

    const response = await axios.request(config)
      .then((response) => {
        return response.data.d.CreateLink;
      })
      .catch((error) => {
        return error;
      });

    return response;
  } catch (err) {
    return err;
  }
}