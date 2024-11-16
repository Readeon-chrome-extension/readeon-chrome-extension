const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..', 'dist', 'assets', 'js');

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }

  files.forEach((file) => {
    if (file.startsWith('index.') && file.endsWith('.js')) {
      const filePath = path.join(directoryPath, file);
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return console.log(err);
        }
        const result = data.replace(/Function\("return this"\)\(\)/g, 'globalThis');

        fs.writeFile(filePath, result, 'utf8', (err) => {
          if (err) return console.log(err);
          console.log(`Replaced in ${file}`);
        });
      });
    }
  });
});
