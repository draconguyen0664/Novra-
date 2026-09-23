import fs from 'node:fs';
let s=fs.readFileSync('scripts/scaffold.mjs','utf8');
s=s.replace(/className=\{`site-header[^\n]+?`\}/,'className={"site-header "+(open?"menu-open":"")}');
s=s.replace(/`\$\{-52\.75\+i\*12\.5\}deg`/,'(-52.75+i*12.5)+"deg"');
fs.writeFileSync('scripts/scaffold.mjs',s);
