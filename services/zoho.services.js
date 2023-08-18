const axios = require('axios');
const FormData = require('form-data');

exports.createLeadInZoho = async (owner) => {
  const { first_name, last_name, email, phone, company } = owner;
  
  const zoho_url = process.env.ZOHO_API_URL;

  let data = JSON.stringify({
    "data": [
      {
        "Lead_Source": "Maiker Website",
        "First_Name": first_name,
        "Last_Name": last_name,
        "Email": email,
        "Phone": phone,
        "Company": company || ""
      }
    ]
  });

  try {
    const accessToken = await generateAccessToken();

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${zoho_url}/crm/v5/Leads`,
      headers: { 
        'Authorization': `Zoho-oauthtoken ${accessToken}`, 
        'Content-Type': 'application/json'
      },
      data : data
    };

    axios.request(config)
    .then((response) => {
      return true;
    })
    .catch((error) => {
      return false;
    });

  } catch (err) {
    return false;
  }
}

const generateAccessToken = async (req, res) => {
  const account_url = process.env.ZOHO_ACCOUNT_URL;
  const client_id = process.env.ZOHO_CLIENT_ID;
  const client_secret = process.env.ZOHO_CLIENT_SECRET;
  const refresh_token = process.env.ZOHO_REFRESH_TOKEN;

  let data = new FormData();

  try {
    data.append('grant_type', 'refresh_token');
    data.append('client_id', client_id);
    data.append('client_secret', client_secret);
    data.append('refresh_token', refresh_token);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${account_url}/oauth/v2/token`,
      data : data
    };
    
    const response = await axios.request(config);

    const result = response.data;
    return result.access_token;
  } catch (err) {
    throw new Error(err.message);
  }
}