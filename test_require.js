
try {
    const nw = require('nativewind/metro');
    console.log('nativewind/metro loaded successfully');
} catch (e) {
    console.error('Failed to load nativewind/metro:', e);
}

try {
    const expoMetro = require('expo/metro-config');
    console.log('expo/metro-config loaded successfully');
} catch (e) {
    console.error('Failed to load expo/metro-config:', e);
}
