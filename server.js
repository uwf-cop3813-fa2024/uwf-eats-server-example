// Import environment variables from .env file
require('dotenv').config({ path: './.env' });

const app = require('./src/app.js');

// We'll use port 3001 for our server since the React app will be running on 3000
app.set('port', process.env.PORT || 3001);
app.listen(app.get('port'), function () {
    console.log(`Express started on http://localhost:${app.get('port')}; press Ctrl-C to terminate.`);
});