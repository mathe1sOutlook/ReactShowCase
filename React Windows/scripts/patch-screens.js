/**
 * Patches react-native-screens for Windows compatibility.
 * The src/fabric/ codegen files are incompatible with RN 0.75 Windows.
 * This script redirects Metro to use pre-compiled lib/ files instead.
 */
const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, '..', 'node_modules', 'react-native-screens');
if (!fs.existsSync(screensDir)) process.exit(0);

// Patch package.json to use compiled lib instead of src (avoids codegen)
const pkgPath = path.join(screensDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg['react-native'] = 'lib/commonjs/index';
pkg['source'] = 'lib/commonjs/index';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log('Patched react-native-screens for Windows compatibility.');
