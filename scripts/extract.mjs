import {chromium} from 'playwright';import fs from 'node:fs/promises';
const b=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe'});const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto('https://wama.com.br/',{waitUntil:'networkidle'});await p.waitForTimeout(2500);
const data=await p.evaluate(()=>{
 const img=e=>e?{src:e.currentSrc||e.src,alt:e.alt}:null;
 const hero=[...document.querySelectorAll('#hero img')].map(e=>({ ...img(e),style:e.parentElement.getAttribute('style'),own:e.getAttribute('style')}));
 const projects=[...document.querySelectorAll('#cases a')].filter(e=>e.querySelector('h3')).map(e=>({title:e.querySelector('h3').textContent,href:e.href,tags:[...e.querySelectorAll('[data-framer-name="Tag"]')].map(x=>x.textContent),image:img(e.querySelector('img')),video:e.querySelector('video')?.src}));
 const logos=[...document.querySelectorAll('#clientes img')].map(img);
 const services=[...document.querySelectorAll('#services h3')].map(e=>{const root=e.closest('[data-framer-name="Text"]').parentElement;return {title:e.textContent,description:root.querySelector('[data-framer-name="Subtitle"]')?.textContent,images:[...root.querySelectorAll('img')].map(img),videos:[...root.querySelectorAll('video')].map(v=>({src:v.currentSrc||v.src,poster:v.poster}))}});
 const faq=[...document.querySelectorAll('[data-framer-name="FAQs"] [data-framer-name="Que"]')].map(e=>({question:e.querySelector('h4')?.textContent,answer:e.parentElement.querySelector('[data-framer-name="Ans"]')?.textContent}));
 const blogs=[...document.querySelectorAll('a[data-framer-name="Blog mini"]')].map(e=>({title:e.querySelector('h2')?.textContent,description:e.querySelector('[data-framer-name="Description"]')?.textContent,date:e.querySelector('[data-framer-name="Date"]')?.textContent,href:e.href,image:img(e.querySelector('img'))}));
 return {hero,projects,logos,services,faq,blogs,extraImages:[...document.querySelectorAll('#big-numbers img,section[data-framer-name="Desktop"] img')].map(img),nav:[...document.querySelectorAll('nav a')].map(e=>({text:e.textContent,href:e.href})),footerLinks:[...document.querySelectorAll('section[data-framer-name="Desktop"] a')].map(e=>({text:e.textContent,href:e.href}))};
});
await fs.writeFile('docs/reference/content.json',JSON.stringify(data,null,2));
const states=[];const sample=async label=>states.push({label,state:await p.evaluate(()=>({scroll:scrollY,hero:[...document.querySelectorAll('#hero img')].map(e=>({transform:getComputedStyle(e.parentElement).transform,box:e.getBoundingClientRect().toJSON()})),words:[...document.querySelectorAll('section[data-framer-name="Palavras"] span')].slice(0,30).map(e=>({text:e.textContent,transform:getComputedStyle(e).transform,opacity:getComputedStyle(e).opacity}))}))});
await sample('hero at rest');await p.mouse.move(620,650);await p.waitForTimeout(500);await sample('hero hover');
const wordY=await p.locator('section[data-framer-name="Palavras"]').evaluate(e=>e.getBoundingClientRect().top+scrollY);
for(const offset of [0,450,900,1500,2300,3200,4000]){await p.evaluate(y=>scrollTo(0,y),wordY+offset);await p.waitForTimeout(400);await sample('words '+offset);}
await p.locator('[data-framer-name="FAQs"] [data-framer-name="Que"]').nth(1).click();await p.waitForTimeout(500);await p.screenshot({path:'docs/reference/faq-open.png'});
await p.setViewportSize({width:390,height:844});await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(500);console.log('Mobile nav',await p.locator('nav').first().innerText());
console.log('Nav targets',await p.locator('nav').first().evaluate(e=>[...e.querySelectorAll('[data-framer-name],button')].map(x=>({tag:x.tagName,name:x.getAttribute('data-framer-name'),role:x.getAttribute('role')}))));
await fs.writeFile('docs/reference/motion-states.json',JSON.stringify(states,null,2));
await b.close();
console.log('Extracted',Object.fromEntries(Object.entries(data).map(([k,v])=>[k,v.length])));
