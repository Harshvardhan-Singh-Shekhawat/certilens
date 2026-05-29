import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('app/domains/page.js', 'utf8');

// Fix blank line before <a tag
c = c.replace(/\n\s*\n<a\n/, '\n                        <a\n');

writeFileSync('app/domains/page.js', c);
console.log('Fixed!');