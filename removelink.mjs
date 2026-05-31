import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('app/domains/page.js', 'utf8');

// Replace the <a> tag with a plain span
c = c.replace(
  /<a[\s\S]*?href=\{`\/domains\/\$\{domain\.id\}`\}[\s\S]*?>/,
  '<span'
);
c = c.replace('</a>', '</span>');

writeFileSync('app/domains/page.js', c);
console.log('done');