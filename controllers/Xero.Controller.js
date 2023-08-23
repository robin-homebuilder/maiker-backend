const axios = require('axios');
const { getXeroAccessToken, createCustomer, createProject } = require("../helpers/xero.helper");

exports.processXero = async (req, res) => {
  const { site_address, owners, price } = req.body;
  
  const parsedOwner = JSON.parse(owners);
  
  const customerInformation = parsedOwner[0];
  
  try {
    const tokenData = await getXeroAccessToken();
    const accessToken = tokenData.access_token;
    
    const customer = await createCustomer(customerInformation, accessToken);

    const contactID = customer.Contacts[0].ContactID;
    await createProject(accessToken, contactID, site_address, price);

    res.status(200).json(1);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}
