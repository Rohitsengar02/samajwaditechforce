const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("wasm");
config.resolver.assetExts.push("bin");
config.resolver.assetExts.push("onnx");
config.resolver.sourceExts.push("mjs");

module.exports = withNativeWind(config, { input: "./app/global.css" });
