const mongoose = require('mongoose');
const seederAdmin = require('../seeder/seederAdmin');

mongoose.set('strictQuery', true);
const uri = process.env.DB_URL;

const dbConnection = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connection Successful:', uri);

        // Setup tasks (previously inside db.once)
        const db = mongoose.connection;

        // Create the 2dsphere index on the 'coords' field
        await db.collection('shops').createIndex({ coords: '2dsphere' });
        console.log('2dsphere index created on shops.coords.');

        // Create the 2dsphere index on the 'location' field
        await db.collection('ips').createIndex({ location: '2dsphere' });
        console.log('2dsphere index created on ips.location.');

        // Call seederAdmin() after setup
        await seederAdmin();
        console.log('seederAdmin execution complete.');
        
    } catch (err) {
        console.error('Error:', err);
    }
};

module.exports = dbConnection;
