import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('app/domains/page.js', 'utf8');

// Find the broken pattern and fix it
c = c.replace(
  /(\s+)\n(\s+)href=\{`\/domains\/\$\{domain\.id\}`\}/,
  '$1<a\n$2href={`/domains/${domain.id}`}'
);

writeFileSync('app/domains/page.js', c);
console.log('Fixed!');