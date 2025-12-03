const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Hardcoded URI from backend/.env
const MONGO_URI = 'mongodb+srv://samajwaditech01:SaMahWadi6655@samajwaditechforce.85hdqaw.mongodb.net/test';

if (!MONGO_URI) {
    console.error('MONGO_URI not found');
    process.exit(1);
}

// Define Volunteer Schema matching the JSON data
const volunteerSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    district: String,
    vidhanSabha: String,
    age: String,
    role: String, // Party connection
    socialMedia: String,
    email: String,
    qualification: String,
    canVisitOffice: String,
    verificationStatus: String,
    mindset: String,
    timestamp: String,
    whatsappLink: String,
    // Add raw data for reference
    rawData: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Use 'volunteers' collection
const Volunteer = mongoose.model('Volunteer', volunteerSchema, 'volunteers');

const jsonPath = path.join(__dirname, 'app/(tabs)/समाजवादी टेक फोर्स से जुड़ें — बने समाजवाद की डिजिटल आवाज़! (Responses) (5).json');

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('Reading JSON file...');
        const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const validData = rawData.filter(item => item); // Filter nulls

        console.log(`Found ${validData.length} items in JSON.`);

        const volunteers = validData.map(v => ({
            name: v['Column2'] || v['आपका पूरा नाम क्या है? '],
            mobile: v['Column3'] || v['आपका मोबाइल नंबर '],
            district: v['Column4'] || v['जिला '],
            vidhanSabha: v['Column5'] || v['आपकी विधानसभा (Vidhan Sabha) कौन सी है? '],
            age: v['Column6'] || v['आपकी उम्र क्या है? '],
            role: v['Column9'] || v['अगर हाँ, तो पार्टी से आपका संबंध क्या है? '],
            socialMedia: v['Column10'] || v['आप किन-किन सोशल मीडिया प्लेटफॉर्म पर सक्रिय हैं? '],
            email: v['Column13'] || v['E Mail ID '],
            qualification: v['Column14'] || v['क्वालिफिकेशन '],
            canVisitOffice: v['Column15'] || v['क्या डिजिटल ट्रेनिंग व मीटिंग के लिए समाजवादी पार्टी कार्यालय आ सकते है ?'],
            verificationStatus: v['वेरिफिकेशन स्टेटस '] || 'Pending',
            mindset: v['बातचीत के दौरान उसका माइंडसेट कैसा है '],
            timestamp: v['Column1'] || v['Timestamp'],
            whatsappLink: v['Column16'],
            rawData: v
        })).filter(v => v.name); // Ensure name exists

        console.log(`Prepared ${volunteers.length} volunteers for seeding.`);

        // Optional: Clear existing collection
        // await Volunteer.deleteMany({});
        // console.log('Cleared existing volunteers collection.');

        // Insert in batches
        const BATCH_SIZE = 100;
        for (let i = 0; i < volunteers.length; i += BATCH_SIZE) {
            const batch = volunteers.slice(i, i + BATCH_SIZE);
            await Volunteer.insertMany(batch);
            console.log(`Inserted batch ${i / BATCH_SIZE + 1} (${batch.length} records)`);
        }

        console.log('Seeding completed successfully!');

        await mongoose.disconnect();
        console.log('Disconnected.');

    } catch (err) {
        console.error('Error during seeding:', err);
        process.exit(1);
    }
}

seed();
