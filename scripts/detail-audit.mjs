import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto('https://wama.com.br/',{waitUntil:'networkidle'});
await page.waitForTimeout(2000);
const tree=await page.evaluate(()=>{const pick=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {tag:e.tagName,name:e.getAttribute('data-framer-name'),id:e.id,class:e.className,text:e.children.length?undefined:e.textContent?.slice(0,160),style:{x:r.x,y:r.y+scrollY,w:r.width,h:r.height,display:s.display,position:s.position,overflow:s.overflow,padding:s.padding,gap:s.gap,bg:s.backgroundColor,font:s.fontFamily,size:s.fontSize,line:s.lineHeight,columns:s.gridTemplateColumns,transform:s.transform,aspect:s.aspectRatio},image:e.tagName==='IMG'?{src:e.currentSrc||e.src,alt:e.alt}:undefined,children:[...e.children].filter(c=>!['SCRIPT','STYLE'].includes(c.tagName)).map(pick)}};return pick(document.querySelector('main'));});
await fs.writeFile('docs/reference/tree.json',JSON.stringify(tree,null,2));
await fs.writeFile('docs/reference/styles.css',await page.evaluate(()=>[...document.styleSheets].flatMap(s=>{try{return [...s.cssRules].map(r=>r.cssText)}catch{return[]}}).join('\n')));
for(const [name,selector] of [['clients','#clientes'],['projects','#cases'],['words','section[data-framer-name="Palavras"]'],['services','#services'],['stats','#big-numbers'],['faq','[data-framer-name="FAQ"]'],['blog','[data-framer-name="Blog"]'],['contact','#contato']]){
 const loc=page.locator(selector).first();if(!await loc.count())continue;
 await loc.scrollIntoViewIfNeeded();await page.waitForTimeout(1500);await page.screenshot({path:`docs/reference/section-${name}.png`});
}
await page.evaluate(()=>scrollTo(0,19000));await page.waitForTimeout(1000);await page.screenshot({path:'docs/reference/lower.png'});
await fs.writeFile('docs/reference/interactive.json',JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('button,input,textarea,[role="button"]')].map(e=>({tag:e.tagName,text:e.textContent?.slice(0,100),name:e.getAttribute('name'),aria:e.getAttribute('aria-label'),type:e.getAttribute('type'),framer:e.getAttribute('data-framer-name')}))),null,2));
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(1500);
await fs.writeFile('docs/reference/mobile-nav.html',await page.locator('nav').first().evaluate(e=>e.outerHTML));
await browser.close();
