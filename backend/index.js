//  env variable setup
require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');

app.use(express.json());
app.use(cors());

const routes = require('./routes');


//  Routes for APIs
app.use('/api', routes);





//  Backend Port
app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
})