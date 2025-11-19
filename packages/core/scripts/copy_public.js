// Source - https://stackoverflow.com/a
// Posted by Miguel Sanchez Gonzalez, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-20, License - CC BY-SA 4.0

import fs from "node:fs";
// File destination.txt will be created or overwritten by default.
fs.copyFile('public/entry.rsc.tsx', 'dist/entry.rsc.tsx', (err) => {
  if (err) throw err;
  console.log('source.txt was copied to destination.txt');
});

fs.copyFile('public/entry.ssr.tsx', 'dist/entry.ssr.tsx', (err) => {
  if (err) throw err;
  console.log('source.txt was copied to destination.txt');
});


fs.copyFile('public/entry.browser.tsx', 'dist/entry.browser.tsx', (err) => {
  if (err) throw err;
  console.log('source.txt was copied to destination.txt');
});
