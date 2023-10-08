const express = require("express");

const { 
  createArticle,
  getArticles,
  getSearchArticles,
  getArticleByID,
  updateArticle,
  deleteArticle,
  createClient,
  getClients,
  getClientByID,
  getSearchClients,
  updateClient,
  createConsultant,
  getConsultants,
  getConsultantByID,
  getSearchConsultants,
  updateConsultant,
  createProjectPhoto,
  getProjectPhotos,
  updateProjectPhoto,
  deleteProject
} = require("../controllers/Administration.Controller");

const router = express.Router();

const { upload } = require("../helpers/multerUpload.helper");

//Articles
router.get("/articles", getArticles)
router.get("/articles/:articleID", getArticleByID)

router.patch("/articles/:articleID", upload.fields([
  { name: 'imageFile', maxCount: 1 },
  { name: 'bannerFile', maxCount: 1 }
]), updateArticle);

router.post("/articles", upload.fields([
  { name: 'imageFile', maxCount: 1 },
  { name: 'bannerFile', maxCount: 1 }
]), createArticle);

router.post("/articles/search", getSearchArticles)

router.delete("/articles/:articleID", deleteArticle);

//Clients
router.get("/clients", getClients)
router.get("/clients/:clientID", getClientByID)
router.post("/clients/search", getSearchClients)
router.post("/clients", createClient)

router.patch("/clients/:clientID", updateClient)

//Consultants
router.get("/consultants", getConsultants)
router.get("/consultants/:consultantID", getConsultantByID)

router.post("/consultants/search", getSearchConsultants)
router.post("/consultants", upload.single("insuranceFile"), createConsultant)

router.patch("/consultants/:consultantID", upload.single("insuranceFile"), updateConsultant)

//Project Photo
router.get("/projectphoto", getProjectPhotos)

router.post("/projectphoto", upload.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'other_image' }
]), createProjectPhoto);

router.patch("/projectphoto/:projectID", upload.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'other_image' }
]), updateProjectPhoto);

router.delete("/projectphoto/:projectID", deleteProject);

module.exports = router;