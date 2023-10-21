const { getSharePointAccessToken, getFormDigestValue, uploadFileToSharePoint, createAnonymousLink, createShareableLink } = require("../services/sharePoint.services");

exports.getAccessToken = async (req, res) => {
  try {
    const accessToken = await getSharePointAccessToken();

    res.status(200).json(accessToken);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getFormDigestValue = async (req, res) => {
  try {
    const accessToken = await getSharePointAccessToken();
    const digestValue = await getFormDigestValue(accessToken.access_token);

    res.status(200).json(digestValue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.fileUploadToSharePoint = async (req, res) => {
  const files = req.files;
  const test = files[0];
  
  try {
    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;

    const digestValueData = await getFormDigestValue(accessToken);
    const formDigestString = digestValueData.FormDigestValue;
    const formDigestValue = formDigestString.split(',')[0];
    
    const data = await uploadFileToSharePoint(accessToken, formDigestValue, test);
    
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.createAnonymousLink = async (req, res) => {
  const { path } = req.body;
  
  try {
    const accessTokenData = await getSharePointAccessToken();
    const accessToken = accessTokenData.access_token;
    
    const url = await createAnonymousLink(accessToken, path);
    // const url = await createShareableLink(accessToken, path);
    
    res.status(200).json(url);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}