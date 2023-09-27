const express = require("express");

const { 
  getArticles,
  getArticleByID
} = require("../controllers/Administration.Controller");

const router = express.Router();

const { upload } = require("../helpers/multerUpload.helper");

router.get("/articles", getArticles)
router.get("/articles/:articleID", getArticleByID)

// router.post("/article", createArticle);
// router.post("/article", createArticle);

// router.get("/", getArticles);
// router.get("/:articleID", getArticleBySlug);

module.exports = router;