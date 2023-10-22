const { ClientProject } = require("../models/Client.Model");
const { Consultant } = require("../models/Consultant.Model");

exports.getClients = async (req, res) => {
  const consultantID = req.params.consultantID;

  try {
    const result = await Consultant.findOne({ _id: consultantID }).populate({
      path: 'access',
      populate: {
        path: 'project_id',
        model: ClientProject
      }
    });
    
    res.status(200).json(result.access);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}

exports.getSearchClients = async (req, res) => {
  const { search_data, consultantID } = req.body;

  const regex = new RegExp(search_data, "i");

  try {
    const result = await Consultant.findOne({ _id: consultantID }).populate({
      path: 'access',
      populate: {
        path: 'project_id',
        model: ClientProject
      }
    });

    const filteredData = result.access.filter(item => {
      const { first_name, last_name, project_id } = item;

      return first_name.match(regex) || last_name.match(regex) || project_id.site_address.match(regex);
    });
    
    res.status(200).json(filteredData);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
}