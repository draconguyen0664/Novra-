import { chromium } from 'playwright';
import fs from 'node:fs/promises';
await fs.mkdir('docs/reference', {recursive:true});
const browser = await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe'});
const page = await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
await page.goto('https://wama.com.br/',{waitUntil:'networkidle',timeout:90000});
await page.waitForTimeout(4000);
await fs.writeFile('docs/reference/page.html',await page.content());
await page.screenshot({path:'docs/reference/desktop-top.png'});
const inspect = () => [...document.querySelectorAll('h1,h2,h3,h4,section,header,footer,[data-framer-name]')].map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {tag:e.tagName,name:e.getAttribute('data-framer-name'),id:e.id,text:(e.textContent||'').slice(0,160),x:Math.round(r.x),y:Math.round(r.y+scrollY),w:Math.round(r.width),h:Math.round(r.height),display:s.display,position:s.position,bg:s.backgroundColor,color:s.color,font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,line:s.lineHeight,spacing:s.letterSpacing,padding:s.padding,gap:s.gap,columns:s.gridTemplateColumns,transform:s.transform,radius:s.borderRadius}}).filter(e=>e.w&&e.h);
await fs.writeFile('docs/reference/desktop-elements.json',JSON.stringify(await page.evaluate(inspect),null,2));
await fs.writeFile('docs/reference/assets.json',JSON.stringify(await page.evaluate(()=>({images:[...document.images].map(e=>({src:e.currentSrc||e.src,alt:e.alt,w:e.naturalWidth,h:e.naturalHeight})),links:[...document.querySelectorAll('a')].map(e=>({text:e.textContent,href:e.href})),fonts:performance.getEntriesByType('resource').map(e=>e.name).filter(x=>/woff|ttf|otf/.test(x))})),null,2));
const height=await page.evaluate(()=>document.body.scrollHeight);
for(let y=700;y<height;y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(200);}
await page.waitForTimeout(1000);
await page.screenshot({path:'docs/reference/desktop-full.png',fullPage:true});
for(const [w,h] of [[1920,1080],[1366,768],[1280,800],[1024,768],[834,1194],[768,1024],[430,932],[412,915],[390,844],[375,812],[360,800]]){
 await page.setViewportSize({width:w,height:h});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(1000);
 await page.screenshot({path:`docs/reference/${w}-top.png`});
 await fs.writeFile(`docs/reference/${w}-elements.json`,JSON.stringify(await page.evaluate(inspect),null,2));
 if(w===390){for(let y=700;y<await page.evaluate(()=>document.body.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(80);}await page.screenshot({path:'docs/reference/mobile-full.png',fullPage:true});}
}
await browser.close();
console.log('Reference captures complete');
