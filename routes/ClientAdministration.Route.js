const express = require("express");

const { 
  getClientsConsultant,
  addConsultantAccess,
  getSearchConsultant,
  deleteConsultantAccess,
  getSiteInformation,
  getSiteInformationDocuments,
  saveSiteInformation,
  addDocument,
  updateDocument,
  deleteSiteDocument,
  getDrawingsAndReports,
  addDrawingsAndReports,
  addDrawingsAndReportsFile,
  updateDrawingsAndReportsFile,
  getDrawingsAndReportsSection,
  updateDrawingsAndReportsSection,
  deleteDrawingsAndReportsSection,
  deleteDrawingsAndReportsFile,
  getAuthorityApprovals,
  addAuthorityApprovals,
  addAuthorityApprovalsFile,
  updateAuthorityApprovalsFile,
  getAuthorityApprovalsSection,
  updateAuthorityApprovalsSection,
  deleteAuthorityApprovalsSection,
  deleteAuthorityApprovalsFile,
  getComplianceOperations,
  addComplianceOperations,
  addComplianceOperationsFile,
  updateComplianceOperationsFile,
  getComplianceOperationsSection,
  updateComplianceOperationsSection,
  deleteComplianceOperationsSection,
  deleteComplianceOperationsFile,
  getProjectPhotos,
  addProjectPhoto,
  deleteProjectPhoto,
  addProgressClaims,
  getProgressClaims,
  updateProgressClaims,
  deleteProgressClaims,
  addInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
  getContractSumAndCompletion,
  getContractSum,
  getPracticalCompletion,
  updateContractSum,
  updatePracticalCompletion,
  getContractDocuments,
  addContractDocument,
  updateContactDocument,
  deleteContractDocument,
  getExtensionTime,
  addExtensionTime,
  updateExtensionTime,
  deleteExtensionTime,
  getVariation,
  addVariation,
  updateVariation,
  deleteVariation,
  getClientDocuments,
  addClientDocument,
  updateClientDocument,
  deleteClientDocument,
  getAdditionalClients,
  addClientAdditional,
  updateClientAdditional,
  deleteClientAdditional
} = require("../controllers/ClientAdministration.Controller");

const router = express.Router();

const { upload } = require("../helpers/multerUpload.helper");

//Consultant Access
router.get("/consultant_access/:clientID", getClientsConsultant)

router.post("/consultant_access", addConsultantAccess)
router.post("/consultant_access/search/:clientID", getSearchConsultant)

router.delete("/consultant_access/:accessID/:consultantID/:clientID", deleteConsultantAccess)

//Client Information
router.get("/client_information/clients/:clientID", getAdditionalClients);
router.get("/client_information/documents/:clientID", getClientDocuments);

router.post("/client_information/documents", upload.single("documentFile"), addClientDocument)
router.post("/client_information/clients", addClientAdditional);

router.patch("/client_information/documents/:documentID", upload.single("documentFile"), updateClientDocument)
router.patch("/client_information/clients/:additonalClientID", updateClientAdditional);

router.delete("/client_information/documents/:documentID/:clientID", deleteClientDocument)
router.delete("/client_information/clients/:additonalClientID", deleteClientAdditional);

//Site Information
router.get("/site_information/:clientID", getSiteInformation)
router.get("/site_information/document/:clientID", getSiteInformationDocuments)

router.post("/site_information/document", upload.single("documentFile"), addDocument)

router.patch("/site_information/:projectID", saveSiteInformation)
router.patch("/site_information/document/:fileID", upload.single("documentFile"), updateDocument)

router.delete("/site_information/document/:documentID/:clientID", deleteSiteDocument)

//Drawings and Reports
router.get("/drawings_reports/:clientID", getDrawingsAndReports)
router.get("/drawings_reports/section/:sectionID", getDrawingsAndReportsSection)

router.post("/drawings_reports/", upload.single("documentFile"), addDrawingsAndReports)
router.post("/drawings_reports/file", upload.single("documentFile"), addDrawingsAndReportsFile)

router.patch("/drawings_reports/file/:fileID", upload.single("documentFile"), updateDrawingsAndReportsFile)
router.patch("/drawings_reports/section/:sectionID", updateDrawingsAndReportsSection)

router.delete("/drawings_reports/section/:sectionID/:clientID", deleteDrawingsAndReportsSection)
router.delete("/drawings_reports/file/:documentID/:sectionID/:clientID", deleteDrawingsAndReportsFile)

//Authority Approval
router.get("/authority_approval/:clientID", getAuthorityApprovals)
router.get("/authority_approval/section/:sectionID", getAuthorityApprovalsSection)

router.post("/authority_approval/", upload.single("documentFile"), addAuthorityApprovals)
router.post("/authority_approval/file", upload.single("documentFile"), addAuthorityApprovalsFile)

router.patch("/authority_approval/file", upload.single("documentFile"), updateAuthorityApprovalsFile)
router.patch("/authority_approval/section/:sectionID", updateAuthorityApprovalsSection)

router.delete("/authority_approval/section/:sectionID/:clientID", deleteAuthorityApprovalsSection)
router.delete("/authority_approval/file/:documentID/:sectionID/:clientID", deleteAuthorityApprovalsFile)

//Compliance and Operations Manual
router.get("/compliance_operation/:clientID", getComplianceOperations)
router.get("/compliance_operation/section/:sectionID", getComplianceOperationsSection)

router.post("/compliance_operation/", upload.single("documentFile"), addComplianceOperations)
router.post("/compliance_operation/file", upload.single("documentFile"), addComplianceOperationsFile)

router.patch("/compliance_operation/file", upload.single("documentFile"), updateComplianceOperationsFile)
router.patch("/compliance_operation/section/:sectionID", updateComplianceOperationsSection)

router.delete("/compliance_operation/section/:sectionID/:clientID", deleteComplianceOperationsSection)
router.delete("/compliance_operation/file/:documentID/:sectionID/:clientID", deleteComplianceOperationsFile)

//Project Photos
router.get("/project_photos/:clientID", getProjectPhotos)

router.post("/project_photos/", upload.single("documentFile"), addProjectPhoto)

router.delete("/project_photos/:photoID/:clientID", deleteProjectPhoto)

//Progress Claims
router.get("/progress_claims/:clientID", getProgressClaims)

router.post("/progress_claims/", upload.single("documentFile"), addProgressClaims)

router.patch("/progress_claims/:progressID", upload.single("documentFile"), updateProgressClaims)

router.delete("/progress_claims/:progressID/:clientID", deleteProgressClaims)

//Invoices
router.get("/invoices/:clientID", getInvoices);

router.post("/invoices/", upload.single("documentFile"), addInvoice)

router.patch("/invoices/:invoiceID", upload.single("documentFile"), updateInvoice)

router.delete("/invoices/:invoiceID/:clientID", deleteInvoice)

//Contract Administration
router.get("/contract_administration/contract_completion/:clientID", getContractSumAndCompletion);
router.get("/contract_administration/contract_sum/:clientID", getContractSum);
router.get("/contract_administration/practical_completion/:clientID", getPracticalCompletion);

router.get("/contract_administration/contract_document/:clientID", getContractDocuments);
router.get("/contract_administration/extension_time/:clientID", getExtensionTime);
router.get("/contract_administration/variation/:clientID", getVariation);

router.post("/contract_administration/contract_document", upload.single("documentFile"), addContractDocument)
router.post("/contract_administration/extension_time", upload.single("documentFile"), addExtensionTime)
router.post("/contract_administration/variation", upload.single("documentFile"), addVariation)

router.patch("/contract_administration/contract_sum/:contractID", updateContractSum)
router.patch("/contract_administration/practical_completion/:completionID", updatePracticalCompletion)

router.patch("/contract_administration/contract_document/:contractID", upload.single("documentFile"), updateContactDocument)
router.patch("/contract_administration/extension_time/:extensionTime", upload.single("documentFile"), updateExtensionTime)
router.patch("/contract_administration/variation/:variationID", upload.single("documentFile"), updateVariation)

router.delete("/contract_administration/contract_document/:contractID/:clientID", deleteContractDocument)
router.delete("/contract_administration/extension_time/:extensionTime/:clientID", deleteExtensionTime)
router.delete("/contract_administration/variation/:variationID/:clientID", deleteVariation)

module.exports = router;