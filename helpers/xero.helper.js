const axios = require('axios');
const { DateTime } = require('luxon');

exports.getXeroAccessToken = async () => {
  try {
    const tokenUrl = 'https://identity.xero.com/connect/token';

    const clientId = process.env.XERO_CLIENT_ID;
    const clientSecret = process.env.XERO_CLIENT_SECRET;

    const credentials = `${clientId}:${clientSecret}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('scope', 'accounting.transactions accounting.contacts projects');

    const response = await axios.post(tokenUrl, formData, {
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        ...headers
      }
    });

    return response.data;
  } catch (err) {
    return err;
  }
}

exports.getAccounts = async (accessToken) => {
  try {
    const apiURL = 'https://api.xero.com/api.xro/2.0/Accounts';
    
    const headers = {
      'Accept': 'application/json',
    };

    const response = await axios.get(apiURL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...headers
      }
    });

    return response.data;
  } catch (err) {
    return err;
  }
}

exports.createCustomer = async (customerInformation, accessToken) => {
  const body = {
    "Name": `${customerInformation.first_name} ${customerInformation.last_name}`,
    "FirstName": customerInformation.first_name,
    "LastName": customerInformation.last_name,
    "EmailAddress": customerInformation.email,
    "Phones": [
      {
        "PhoneType": "MOBILE",
        "PhoneNumber": customerInformation.phone
      }
    ]
  }
  
  try {
    const apiURL = 'https://api.xero.com/api.xro/2.0/Contacts';
    
    const headers = {
      'Accept': 'application/json',
    };

    const response = await axios.post(apiURL, body, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...headers
      }
    });
    
    return response.data;
  } catch (err) {
    console.log(err.message)
    return err;
  }
}

exports.createProject = async (accessToken, contactID, site_address, amount) => {
  const now = DateTime.utc();
  const deadline = now.plus({ days: 7 });

  const formattedDeadline = deadline.toISO();
  
  const body = {
    "contactId": contactID,
    "name": site_address,
    "deadlineUtc": formattedDeadline,
    "estimateAmount": amount
  }

  try {
    const apiURL = 'https://api.xero.com/projects.xro/2.0/Projects';
    
    const headers = {
      'Accept': 'application/json',
    };

    const response = await axios.post(apiURL, body, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...headers
      }
    });
    
    return response.data;

  } catch (err) {
    console.log(err.message)
    return err;
  }
}