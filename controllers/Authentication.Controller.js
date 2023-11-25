const { Client } = require("../models/Client.Model");
const { User } = require("../models/Users.Model");
const slugify = require("slugify");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ user_email: email, user_pass: password}).select("type account_id user_email user_role");

    const result = {
      email: user?.user_email || "",
      role: user?.user_role || "",
      client: user?.account_id?.toString() || "",
      userID: user._id
    }
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getUserCredential = async (req, res) => {
  const userID = req.params.userID;
  
  try {
    const user = await User.findOne({ _id: userID });

    res.status(200).json(user);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}

exports.saveUserCredential = async (req, res) => {
  const { id, password } = req.body;
  
  try {
    await User.updateOne({ _id: id }, { user_pass: password });

    res.status(200).json(1);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}