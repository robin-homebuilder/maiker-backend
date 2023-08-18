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
/* END ROUTES */

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(port, () => {console.log(`Server Port: ${port}`)});
}).catch((error) => console.log(`${error} did not connect`));