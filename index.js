const express  = require("express");
const dotenv  = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());

const projectRoutes = require("./routes/Projects.Route");
const packageRoutes = require("./routes/Package.Route");
const stripeRoutes = require("./routes/Stripe.Route");
const zohoRoutes = require("./routes/Zoho.Route");
const clientRoutes = require("./routes/Client.Route");
const xeroRoutes = require("./routes/Xero.Route");
const sharePointRoutes = require("./routes/SharePoint.Route");
const articlesRoutes = require("./routes/Articles.Route");
const questionnaireRoutes = require("./routes/Questionnaire.Route");
const administrationRoutes = require("./routes/Administration.Route");
const clientAdministrationRoutes = require("./routes/ClientAdministration.Route");
const consultantDashboardRoutes = require("./routes/ConsultantAdministration.Route");
const authenticationRoutes = require("./routes/Authentication.Route");


app.use(express.json());

app.get("/", (req, res) => {
    res.send(`Welcome`);
});

/* ROUTES */
app.use("/project", projectRoutes);
app.use("/package", packageRoutes);
app.use("/stripe", stripeRoutes);
app.use("/zoho", zohoRoutes);
app.use("/client", clientRoutes);
app.use("/xero", xeroRoutes);
app.use("/sharepoint", sharePointRoutes);
app.use("/articles", articlesRoutes);
app.use("/questionnaire", questionnaireRoutes);
app.use("/administration", administrationRoutes);
app.use("/client_administration", clientAdministrationRoutes);
app.use("/consultant_dashboard", consultantDashboardRoutes);
app.use("/authentication", authenticationRoutes);
/* END ROUTES */

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(port, () => {console.log(`Server Port: ${port}`)});
}).catch((error) => console.log(`${error} did not connect`));