const { Article } = require("../models/Articles.Model");
const slugify = require("slugify");

exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find({}).select("title author createdAt").sort({ order: 1});
    
    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getArticleByID = async (req, res) => {
  const articleID = req.params.articleID;
  
  try {
    const article = await Article.findOne({ _id: articleID });

    res.status(200).json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}