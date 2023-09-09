const express = require("express");

const { 
  createArticle,
  getArticleBySlug,
  getArticles
} = require("../controllers/Articles.Controller");

const router = express.Router();

const { upload } = require("../helpers/multerUpload.helper");

router.post("/", createArticle);

router.get("/", getArticles);
router.get("/:articleID", getArticleBySlug);

module.exports = router;