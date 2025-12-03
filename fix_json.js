const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/(tabs)/समाजवादी टेक फोर्स से जुड़ें — बने समाजवाद की डिजिटल आवाज़! (Responses) (5).json');

try {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log('File read successfully. Length:', content.length);

    // Remove existing [ and ] if they exist at start/end to avoid double wrapping
    content = content.trim();
    if (content.startsWith('[')) content = content.substring(1);
    if (content.endsWith(']')) content = content.substring(0, content.length - 1);

    // Replace all occurrences of "}\n{" or "}\r\n{" or "}{" with "},{"
    // We use a regex to match } followed by whitespace followed by {
    content = content.replace(/}\s*{/g, '},{');

    // Wrap in brackets
    content = '[' + content + ']';

    // Verify if it parses
    try {
        JSON.parse(content);
        console.log('JSON parsed successfully!');
    } catch (e) {
        console.error('Warning: JSON still invalid after fix attempt:', e.message);
        // We might still want to write it if it's better than before, or maybe not.
        // Let's try to find where it fails.
        const match = e.message.match(/position (\d+)/);
        if (match) {
            const pos = parseInt(match[1]);
            console.log('Context around error:', content.substring(pos - 50, pos + 50));
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('File written successfully.');

} catch (err) {
    console.error('Error:', err);
}
