const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

try {
    require('dotenv').config();
} catch (e) {
    console.log('dotenv not found, relying on environment variables');
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // Use SERVICE_ROLE_KEY for bypassing RLS if needed, or ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_KEY in environment variables.');
    console.error('Please add them to your .env file or pass them when running the script.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const jsonPath = path.join(__dirname, 'app/(tabs)/समाजवादी टेक फोर्स से जुड़ें — बने समाजवाद की डिजिटल आवाज़! (Responses) (5).json');

async function seed() {
    try {
        console.log('Reading JSON file...');
        const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        // Filter out null/undefined items
        const validData = rawData.filter(item => item);
        console.log(`Found ${validData.length} items in JSON.`);

        const volunteers = validData.map(v => ({
            name: v['Column2'] || v['आपका पूरा नाम क्या है? '],
            mobile: v['Column3'] || v['आपका मोबाइल नंबर '],
            district: v['Column4'] || v['जिला '],
            vidhan_sabha: v['Column5'] || v['आपकी विधानसभा (Vidhan Sabha) कौन सी है? '],
            age: v['Column6'] || v['आपकी उम्र क्या है? '],
            role: v['Column9'] || v['अगर हाँ, तो पार्टी से आपका संबंध क्या है? '],
            social_media: v['Column10'] || v['आप किन-किन सोशल मीडिया प्लेटफॉर्म पर सक्रिय हैं? '],
            email: v['Column13'] || v['E Mail ID '],
            qualification: v['Column14'] || v['क्वालिफिकेशन '],
            can_visit_office: v['Column15'] || v['क्या डिजिटल ट्रेनिंग व मीटिंग के लिए समाजवादी पार्टी कार्यालय आ सकते है ?'],
            verification_status: v['वेरिफिकेशन स्टेटस '] || 'Pending',
            mindset: v['बातचीत के दौरान उसका माइंडसेट कैसा है '],
            timestamp: v['Column1'] || v['Timestamp'],
            // Add other fields as needed
        })).filter(v => v.name); // Ensure name exists

        console.log(`Prepared ${volunteers.length} volunteers for seeding.`);

        const BATCH_SIZE = 100;
        for (let i = 0; i < volunteers.length; i += BATCH_SIZE) {
            const batch = volunteers.slice(i, i + BATCH_SIZE);
            const { error } = await supabase.from('volunteers').insert(batch);

            if (error) {
                console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
            } else {
                console.log(`Inserted batch ${i / BATCH_SIZE + 1} (${batch.length} records)`);
            }
        }

        console.log('Seeding completed!');

    } catch (err) {
        console.error('Error during seeding:', err);
    }
}

seed();
