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

exports.testAccount = async (req, res) => {
  const slug = "project-quotation";
  const customerInformation = {
    first_name: "robin",
    last_name: "de guzman",
    email: "robin@homebuilder.com.au",
    phone: "123 456"
  }
  try {
    const packageData = await Package.findOne({ slug: slug });

    const price = packageData.price;
    const itemCode = packageData.item_code;
    const description = packageData.title;

    const tokenData = await getXeroAccessToken();
    const accessToken = tokenData.access_token;

    const customer = await createCustomer(customerInformation, accessToken);

    res.status(200).json({ package: packageData, accessToken: accessToken, customer: customer});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.testProject = async (req, res) => {
  const { contactID } = req.body;

  const slug = "project-quotation";
  try {
    const packageData = await Package.findOne({ slug: slug });

    const price = packageData.price;
    const itemCode = packageData.item_code;
    const description = packageData.title;

    const tokenData = await getXeroAccessToken();
    const accessToken = tokenData.access_token;

    const project = await createProject(accessToken, contactID, "1638 Steve Irwin Way, Beerwah QLD 4519, Australia", price);

    res.status(200).json({ package: packageData, accessToken: accessToken, project: project});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.testInvoice = async (req, res) => {
  const { contactID } = req.body;

  const slug = "project-quotation";
  try {
    const packageData = await Package.findOne({ slug: slug });

    const price = packageData.price;
    const itemCode = packageData.item_code;
    const description = packageData.title;

    const tokenData = await getXeroAccessToken();
    const accessToken = tokenData.access_token;

    const invoiceData = await createInvoice(accessToken, contactID, itemCode, description, price);

    res.status(200).json({ package: packageData, accessToken: accessToken, invoiceData: invoiceData});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.testPaidInvoice = async (req, res) => {
  const { contactID, invoiceID, invoiceNumber } = req.body;

  const slug = "project-quotation";
  try {
    const packageData = await Package.findOne({ slug: slug });

    const price = packageData.price;
    const itemCode = packageData.item_code;
    const description = packageData.title;

    const tokenData = await getXeroAccessToken();
    const accessToken = tokenData.access_token;

    const paid = await createPaidInvoice(accessToken, invoiceID, price, invoiceNumber);

    res.status(200).json({ package: packageData, accessToken: accessToken, paid: paid});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.testSendInvoice = async (req, res) => {
  const { invoiceID } = req.body;

  try {
    const tokenData = await getXeroAccessToken();
    const accessToken = tokenData.access_token;

    const send = await sendInvoice(accessToken, invoiceID);

    res.status(200).json({ package: packageData, accessToken: accessToken, send: send});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}