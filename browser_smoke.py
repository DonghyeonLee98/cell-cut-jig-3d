"""Browser interaction checks, against local or deployed Pages.
Usage: python browser_smoke.py [url] [QA-output-directory]
Requires playwright + installed Chromium; no credentials are used.
"""
import sys,json,time,os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8767/').rstrip('/')+'/'
OUT=Path(sys.argv[2] if len(sys.argv)>2 else str(Path.home()/'.cache/cell-cut-jig-qa-261103'));OUT.mkdir(parents=True,exist_ok=True)
results=[]
def check(name,value):
 assert value,name
 results.append({'check':name,'passed':True})
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,channel=os.environ.get('PW_CHANNEL') or None,args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 page=browser.new_page(viewport={'width':1450,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE,wait_until='networkidle');page.wait_for_function('window.jigReview?.getState().ready',timeout=60000)
 get=lambda:page.evaluate('window.jigReview.getState()')
 check('90 actual CAD parts load',get()['parts']==90)
 page.wait_for_timeout(400);page.screenshot(path=str(OUT/'desktop-final.png'))
 # Mouse orbit changes the camera while the arm stays stationary.
 rect=page.locator('#scene').bounding_box();x=rect['x']+rect['width']*.55;y=rect['y']+rect['height']*.5
 before=get();page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+65,y+25,steps=12);page.mouse.up();page.wait_for_timeout(300)
 after=get();check('mouse orbit changes camera only',before['camera']!=after['camera'] and before['angle']==after['angle'])
 page.locator('#home').click();page.locator('#handleMode').click();before=get()['angle']
 pt=page.evaluate('window.jigReview.partPoint("knob")');page.mouse.move(pt['x'],pt['y']);page.mouse.down();page.mouse.move(pt['x']+125,pt['y'],steps=14);page.mouse.up()
 check('dragging handle changes arm angle',get()['angle']>before+2)
 page.locator('#play').click();page.wait_for_timeout(3100);check('one cutting stroke reaches +19.5 deg',abs(get()['angle']-19.5)<.01)
 # Real range control, not direct application-state mutation.
 page.locator('#angle').focus();page.keyboard.press('Home');check('slider returns to -19.5 deg',get()['angle']==-19.5)
 page.locator('#explode').focus();page.keyboard.press('End');check('exploded view control',get()['explode']==1)
 page.locator('[data-topic=section]').click();check('section chapter enables pivot cutaway',get()['section'])
 page.locator('#ghost').check();check('body transparency control',get()['ghost'])
 page.wait_for_timeout(250);page.screenshot(path=str(OUT/'section-final.png'))
 page.locator('#reset').click();check('reset restores true assembly state',get()['explode']==0 and not get()['section'] and not get()['ghost'])
 page.locator('[data-topic=pivot]').click();page.locator('#error').focus();page.keyboard.press('End');check('pivot offset warning', '벗어납니다' in page.locator('#labReadout').inner_text())
 page.locator('#magnify').select_option('1');check('unexaggerated error setting',get()['magnify']==1)
 page.locator('[data-topic=rail]').click();check('four form/roughness concept diagrams',page.locator('.metric-grid svg').count()==4)
 page.wait_for_timeout(250);page.screenshot(path=str(OUT/'rail-final.png'),full_page=True)
 # Nextron holder interface view: isolated parts, numbered dimension tags, force arrows, x = 0 cutaway, friction lab.
 page.locator('[data-topic=mount]').click();page.wait_for_timeout(300);g=get()
 check('mount view isolates interface parts',g['topic']=='mount' and 0<g['visible']<40)
 check('mount view shows numbered dimension tags',g['tags']>=8)
 check('mount spec table lists ordered pocket 50x50','50.0×50.0' in page.locator('.spec').inner_text())
 page.locator('#section').check();check('mount cutaway at x = 0',get()['section'])
 page.locator('#error').focus();page.keyboard.press('End');check('friction lab reaches 200 N push','200 N' in page.locator('#errorValue').inner_text())
 page.locator('#forces').uncheck();check('dimension/force overlay can be hidden',get()['tags']==0)
 page.wait_for_timeout(250);page.screenshot(path=str(OUT/'mount-final.png'))
 page.locator('[data-topic=operation]').click();check('other chapters restore magnify row and all parts',page.locator('#scaleRow').is_visible() and get()['visible']==90)
 r=page.request.get(BASE+'assets/jlccnc_tolerance_drawings_261102.pdf');check('two-page PDF resource available',r.ok and r.body()[:4]==b'%PDF')
 check('no application JS exceptions on desktop',not errors)
 # Touch-enabled mobile, with an actual touch pointer drag on the canvas.
 mobile=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1)
 mobile.goto(BASE,wait_until='networkidle');mobile.wait_for_function('window.jigReview?.getState().ready');mobile.locator('#handleMode').tap()
 box=mobile.locator('#scene').bounding_box();tx=box['x']+box['width']*.4;ty=box['y']+box['height']*.58
 session=mobile.context.new_cdp_session(mobile)
 session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':tx,'y':ty}]})
 for dx in (15,30,45,65,85):session.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':tx+dx,'y':ty}]})
 session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 check('touch drag controls arm without page pan',mobile.evaluate('window.jigReview.getState().angle')>-17)
 check('mobile has no horizontal overflow',mobile.evaluate('document.documentElement.scrollWidth<=window.innerWidth'))
 mobile.locator('[data-topic=mount]').tap();mobile.wait_for_timeout(300);check('mobile mount view has no horizontal overflow',mobile.evaluate('document.documentElement.scrollWidth<=window.innerWidth'))
 mobile.screenshot(path=str(OUT/'mobile-mount.png'),full_page=True);mobile.locator('[data-topic=operation]').tap()
 mobile.screenshot(path=str(OUT/'mobile-final.png'),full_page=True)
 # Previous version remains available, including both blades and practice mode.
 legacy=browser.new_page(viewport={'width':1280,'height':900});legacy_errors=[];legacy.on('pageerror',lambda e:legacy_errors.append(str(e)))
 legacy.goto(BASE+'legacy.html',wait_until='networkidle');legacy.wait_for_function('window.__cut && Object.keys(window.__cut.meshes).length>20',timeout=30000)
 legacy.locator('#b-SNAP18').click();check('legacy SNAP18 selection retained',legacy.locator('#b-SNAP18').get_attribute('aria-pressed')=='true')
 legacy.locator('#m-prac').click();check('legacy practice retained',legacy.evaluate('window.__cut.mode')=='prac')
 legacy.locator('#s-next').click();check('legacy next-step animation retained',legacy.evaluate('window.__cut.step')==1)
 check('no legacy JS exceptions',not legacy_errors)
 browser.close()
(OUT/'browser-results.json').write_text(json.dumps({'url':BASE,'checks':results,'passed':len(results),'errors':errors},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'url':BASE,'passed':len(results),'errors':errors,'output':str(OUT)},ensure_ascii=False))
