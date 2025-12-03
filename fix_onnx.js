const fs = require('fs');
const dir = 'node_modules/onnxruntime-web/dist/';

try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mjs'));

    files.forEach(file => {
        const path = dir + file;
        try {
            let content = fs.readFileSync(path, 'utf8');
            let changed = false;

            // Replace all occurrences
            if (content.includes('import(/*webpackIgnore:true*/e)')) {
                content = content.split('import(/*webpackIgnore:true*/e)').join('Promise.reject("Dynamic import disabled")');
                changed = true;
            }
            if (content.includes('import(e)')) {
                content = content.split('import(e)').join('Promise.reject("Dynamic import disabled")');
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(path, content);
                console.log(`Fixed ${file}`);
            } else {
                console.log(`No changes needed for ${file}`);
            }
        } catch (e) {
            console.error(`Error fixing ${file}:`, e);
        }
    });
} catch (e) {
    console.error('Error reading directory:', e);
}
