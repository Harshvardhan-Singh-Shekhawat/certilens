import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('app/domains/page.js', 'utf8');

// Fix View Chain button - remove navigation, restore toggle
c = c.replace(
  /onClick=\{\(e\) => \{ e\.stopPropagation\(\); const id = e\.currentTarget\.dataset\.id; window\.location\.href=`\/domains\/\$\{id\}`; \}\} data-id=\{domain\.id\}/,
  'onClick={() => toggleExpanded(domain.id)}'
);

writeFileSync('app/domains/page.js', c);
console.log('done');