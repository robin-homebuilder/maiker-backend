const axios = require('axios');
const { getXeroAccessToken, createCustomer, createProject, createInvoice, createPaidInvoice, sendInvoice } = require("../helpers/xero.helper");
const { Package } = require("../models/Package.Model");

exports.processXero = async (req, res) => {
  const { site_address, owners, slug } = req.body;
  
  const parsedOwner = JSON.parse(owners);
  
  const customerInformation = parsedOwner[0];
  
  try {
    const packageData = await Package.findOne({ slug: slug });
    const price = packageData.price;
    const itemCode = packageData.item_code;
    const description = packageData.title;

    const tokenData = await getXeroAccessToken();
    const accessToken = tokenData.access_token;
    
    const customer = await createCustomer(customerInformation, accessToken);

    const contactID = customer.Contacts[0].ContactID;
    await createProject(accessToken, contactID, site_address, price);

    const invoiceData = await createInvoice(accessToken, contactID, itemCode, description, price);

    const invoiceID = invoiceData.Invoices[0].InvoiceID;
    const invoiceNumber = invoiceData.Invoices[0].InvoiceNumber;

    await createPaidInvoice(accessToken, invoiceID, price, invoiceNumber);

    await sendInvoice(accessToken, invoiceID);

    res.status(200).json(1);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}
