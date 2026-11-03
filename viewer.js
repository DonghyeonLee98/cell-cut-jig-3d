/* Three.js r128; model coordinates are millimetres, Z up. */
(() => {
 'use strict';
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const state={topic:'operation',angle:-19.5,explode:0,section:false,ghost:false,dragMode:false,playing:false,ready:false,error:.02,magnify:500};
 const canvas=$('#scene'),host=$('#viewport');
 let renderer;
 try {renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});}catch(e){$('#loading').textContent='이 기기에서 WebGL을 시작할 수 없습니다. 브라우저 하드웨어 가속을 확인해 주세요.';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xe6ecee);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.localClippingEnabled=true;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.1,3000);camera.up.set(0,0,1);
 const controls=new THREE.OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.10;controls.minDistance=28;controls.maxDistance=1400;controls.maxPolarAngle=Math.PI*.94;
 scene.add(new THREE.HemisphereLight(0xf9fcff,0x87969b,.85));
 for(const [pos,power] of [[[150,-200,300],.9],[[-180,100,170],.45]]){let l=new THREE.DirectionalLight(0xffffff,power);l.position.set(...pos);scene.add(l);}
 const root=new THREE.Group();scene.add(root);
 let meta,meshes=[],selected=null,animStart=0;const pivot=new THREE.Vector3(-80,-20.5,0),ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
 const names={breadboard:'브레드보드 — 모든 부품의 공통 바닥',socket_block:'소켓 블록 — 홀더 어댑터를 고정',adapter_block:'홀더 어댑터 — 실물 치수 확인 전 가정',holder_env:'시료 홀더(가정 외형 24.4×31×25) — 11/9 실측 후 어댑터 소켓 확정',key_dowel:'방향 키 핀 Ø3 — 홀더를 거꾸로 못 넣게 (실물 홀더에 맞춰 다시 정함)',loc_pin:'위치 핀 Ø3 — 플런저가 홀더를 이 두 핀 쪽으로 밉니다',adapter_screw:'누름 볼트 M4×35 — 어댑터를 포켓 바닥에 조임',level_screw:'높이 맞춤 세트나사 M4 — 어댑터 높이·기울기 조절',cld201_body:'토글 클램프 C-LD-201 — 유지력 264 N(카탈로그), 외형은 가정',cld201_handle:'토글 클램프 손잡이 — 젖히면 플런저가 홀더를 밉니다',cld201_plunger:'토글 플런저 Ø6 — 홀더 옆면을 −y로 밉니다',m6_socket:'M6 볼트 — 소켓 블록을 브레드보드에 고정',pivot_block:'피벗 블록 — Ø22 H7 베어링 좌석 2곳',bearing_608_1:'아래 608 베어링 — 축을 지지',bearing_608_2:'위 608 베어링 — 축을 지지',shaft:'Ø8 축 — 레버의 회전 중심',arm:'회전 팔 — 피벗 주위로 ±19.5° 회전',knob:'손잡이 — 이 부분을 움직여 저밉니다',blade:'칼날 — 홀더 면 위 목표 간극 0.02 mm',seat:'칼날 시트 — 날의 자세를 받칩니다',clamp_plate:'클램프 판 — 날을 시트에 고정',arc_rail:'원호 레일 — 볼 이동면의 평탄도가 중요',arc_rail_shim:'SUS304 심 띠 — 레일 위 볼 이동면',ball_transfer:'볼 트랜스퍼 — 팔 끝을 아래에서 받칩니다',cap_bridge:'상부 캡 — 팔이 위로 들리는 것을 제한',rail_riser:'레일 받침 — 바닥에서 레일을 올립니다',stage_adapter:'Z 스테이지 어댑터',zlfd_table:'Z 스테이지 테이블 — 피벗 높이 조절',overhang:'돌출 시료 — 이 부분을 저며 단면을 만듭니다'};
 const partName=n=>names[n]||names[n.replace(/_\d+$/,'')]||n;
 const MU=.15,LIFT=[10,20];
 const chapters={
 operation:{title:'시료는 고정하고, 칼날만 움직입니다.',body:'홀더를 먼저 조여 층을 붙잡습니다. 홀더 면 밖으로 조금 나온 시료를 칼날이 얇게 저밉니다. 팔은 직선이 아니라 피벗을 중심으로 원호를 그립니다.',steps:['소켓·어댑터에 홀더를 고정합니다. 홀더와 시료는 절단 중 움직이지 않습니다.','Z 스테이지로 날과 홀더 면의 간극을 맞춥니다. 설계 목표는 0.02 mm = 20 µm입니다.','손잡이를 −19.5°에서 +19.5°로 움직입니다. 두 베어링이 회전축을 잡고 레일 위 볼이 팔 끝을 받칩니다.'],caption:'손잡이를 움직이면 칼날이 원호를 따라 지나갑니다.',lab:'0.02 mm 간극과 오차의 관계',intro:'조절 막대로 간극과 같은 방향의 오차를 늘려 보세요. 작은 가공 오차도 목표 간극과 비슷해질 수 있습니다.'},
 pivot:{title:'구멍 크기와 두 구멍의 축은 서로 다른 요구입니다.',body:'피벗 블록에 608 베어링 두 개가 들어갑니다. Ø22 H7은 각 구멍의 크기, 동축 Ø0.02는 위아래 구멍이 같은 축을 따르는 정도를 정합니다.',steps:['좌석 2곳의 지름: 22.000–22.021 mm. 이 값은 베어링이 들어갈 구멍의 허용 크기입니다.','기준 A는 위쪽 베어링 좌석의 축입니다. 아래쪽 축은 A 중심의 지름 0.02 mm 원통 영역 안에 있어야 합니다.','동축 허용영역 Ø0.02의 반지름은 0.01 mm입니다. 두 축이 평행한 단순 예에서 중심 편차는 최대 0.01 mm에 해당합니다. 기울기도 별도로 영향을 줍니다.'],caption:'피벗 블록을 강조했습니다. 절개를 켜면 안쪽 베어링이 보입니다.',lab:'두 좌석의 중심이 어긋나면?',intro:'아래 좌석의 중심 편차를 움직입니다. 평행한 축의 단순 예이며, 베어링 변형·유격을 계산하는 해석은 아닙니다.'},
 rail:{title:'매끈한 표면이어도, 길 전체가 평평한 것은 아닙니다.',body:'볼이 원호 레일을 따라 굴러가며 팔 끝을 받칩니다. 레일 높이가 위치마다 달라지면 팔 자세가 바뀌고, 날과 홀더 사이 간극도 달라질 수 있습니다.',steps:['평탄도 0.03 mm: 윗면이 두 평행한 평면 사이 0.03 mm 안에 들어가야 합니다.','평행도 0.03 mm: 레일 윗면이 바닥 기준 C에 대해 얼마나 기울어도 되는지 정합니다. 두께는 13.22 ±0.05 mm입니다.','Ra는 미세한 표면 요철의 평균값입니다. 업체의 Ra 1.6 수락만으로 평탄도·평행도·두께가 자동 충족되는 것은 아닙니다.'],caption:'레일·심 띠·볼을 강조했습니다. 전체 높이와 국소 굴곡은 다릅니다.',lab:'굴곡은 심 한 장으로 모두 없어질까?',intro:'아래 곡선은 높이 변화가 남은 레일의 설명용 예입니다. 간극 변화량을 높이 변화량과 같게 둔 단순 도식이며 실제 레버비·변형·볼 접촉을 계산하지 않습니다.'},
 mount:{title:'홀더는 아래·앞뒤·옆으로는 단단히 잡히지만, 위로 들리는 힘은 마찰만 막습니다.',body:'챔버에서 뺀 홀더(A·B 두 쪽을 M3 볼트로 조인 상태)를 어댑터의 홀더 소켓에 넣습니다. 토글 클램프 플런저가 옆에서 밀어 위치 핀 두 개에 붙입니다. 어댑터는 소켓 블록 포켓 안에서 M4 볼트 4개로 조이고, 높이는 아래 세트나사 3개로 맞춥니다.',steps:['<b>아래(−z)</b>: 홀더는 받침 돌기 3개, 어댑터는 세트나사 3개가 받칩니다. 단단합니다.','<b>앞뒤(±y, 절단 방향)</b>: 홀더 자리에서 날은 거의 y 방향(97 %)으로 지나갑니다. 한쪽은 위치 핀 2개, 반대쪽은 토글 플런저(유지력 264 N)가 막습니다. 추정 절단력 20 N의 13배입니다.','<b>옆(±x)</b>: 절단력의 옆 성분은 약 5 N(25 %)입니다. 소켓 벽 틈 0.05 mm와 마찰이 막습니다. 옆으로 밀려도 날 간극은 바뀌지 않습니다.','<b>위(+z)</b>: 막는 부품이 없습니다. 플런저가 미는 힘에서 생기는 마찰(μ≈0.15)만 버팁니다. 날이 시료를 들어 올리면 홀더가 들려 20 µm 간극이 줄 수 있습니다.'],caption:'결합부만 남겼습니다(소켓 블록은 반투명). 숫자는 오른쪽 표의 번호, 화살표는 힘의 방향입니다.',lab:'위로 들리는 힘을 마찰이 버틸까?',intro:'토글 플런저가 홀더를 미는 힘을 바꿔 봅니다. 들림 힘과 마찰계수는 가정값이며, 실물에서 들림 시험으로 확인해야 합니다.'},
 section:{title:'밖에서 보이지 않는 좌석과 기준면을 확인합니다.',body:'피벗 블록의 절반만 잘라 내부를 봅니다. 위아래 Ø22 좌석 사이에는 Ø22.3 릴리프가 있고, 아래쪽에는 Ø17 관통 구멍과 베어링 받침 턱이 있습니다.',steps:['분해 막대를 움직여 두 베어링·축·팔·레일의 관계를 확인합니다. 분해 중에는 실제 조립 위치가 아닙니다.','베어링 좌석이 정확해도 축·베어링 유격, 레일 설치, 볼트 조임, 심 접착이 남습니다.','조립 뒤 다이얼 인디케이터로 전 행정을 확인해야 합니다. 부품 공차만으로 20 µm 간극을 보증할 수 없습니다.'],caption:'피벗 블록 절반을 절개했습니다. 분해 막대로 부품 사이를 벌려 보세요.',lab:'작은 간극은 실물에서 검증합니다.',intro:'시료·날·홀더의 간극을 도식으로 확대해 봅니다. 실제 CAD의 치수는 바뀌지 않습니다.'}
 };
 function focus(topic){
  const poses={operation:[[360,-430,315],[5,-13,-7]],pivot:[[-155,-125,115],[-80,-20.5,27]],rail:[[250,-175,120],[65,-18,6]],section:[[-155,-125,115],[-80,-20.5,27]],mount:[[92,-128,82],[0,3,-15]]};
  const [p,t]=poses[topic]||poses.operation;controls.target.set(...t);camera.position.set(...p);const fit=Math.max(1,1.1/camera.aspect);camera.position.sub(controls.target).multiplyScalar(fit).add(controls.target);controls.update();
 }
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 new ResizeObserver(resize).observe(host);resize();focus('operation');
 function relevant(n){if(state.topic==='pivot'||state.topic==='section')return /pivot_block|bearing_608|shaft|inner_spacer|preload/.test(n);if(state.topic==='rail')return /arc_rail|ball_transfer|rail_riser|cap_bridge/.test(n);if(state.topic==='mount')return /holder_env|cld201_plunger|loc_pin|key_dowel/.test(n);return /blade|knob|overhang/.test(n);}
 const MOUNT=/^(socket_block|adapter_block|holder_env|overhang|key_dowel|loc_pin|adapter_screw|level_screw|cld201)/;
 // Dimension tags and force arrows for the Nextron holder interface (CAD mm coordinates, holder face z = 0).
 const TAGS=[[[25,-25,0],'1','포켓 50×50 · 깊이 36'],[[-24.8,-24.8,-14],'2','어댑터 49.6□ · 틈 0.2'],[[12.2,15.5,0],'3','홀더 소켓 24.5×31.1'],[[6,-11,-25.2],'4','받침 돌기 3점'],[[21,0,-36],'5','세트나사 M4 ×3'],[[21,21,-5],'6','누름 볼트 M4 ×4'],[[0,32,-10],'7','토글 플런저'],[[-6,-30,-10],'8','위치 핀 ×2'],[[0,-10,.5],'9','돌출 시료 · 날 간극 0.02'],[[0,4,16],'!','위(+z): 마찰만',1]];
 const tagEls=TAGS.map(([p,n,t,w])=>{const d=document.createElement('div');d.className='tag'+(w?' warn':'');d.innerHTML=`<i>${n}</i><span>${t}</span>`;d.title=t;$('#tags').appendChild(d);return{d,v:new THREE.Vector3(...p)};});
 const forces=new THREE.Group();scene.add(forces);
 function arrow(dir,org,len,color){const a=new THREE.ArrowHelper(new THREE.Vector3(...dir).normalize(),new THREE.Vector3(...org),len,color,Math.min(5,len*.35),Math.min(3.2,len*.22));a.traverse(o=>{if(o.material){o.material.depthTest=false;o.material.transparent=true;}o.renderOrder=20;});forces.add(a);}
 arrow([0,-1,0],[0,31,-10],14,0xd9822b);for(const x of[-6,6])arrow([0,1,0],[x,-29,-10],11,0x1f9e8f);
 for(const x of[-21,21])for(const y of[-21,21])arrow([0,0,-1],[x,y,13],11,0x3a6fd8);
 for(const [x,y] of[[-21,0],[21,0],[0,-21]])arrow([0,0,1],[x,y,-50],11,0x1f9e8f);
 for(const [x,y] of[[-6,-11],[6,-11],[0,11]])arrow([0,0,1],[x,y,-34],8,0x1f9e8f);
 arrow([-.248,.969,0],[0,-4,3],20,0xc73a3a);arrow([0,0,1],[0,4,1],15,0x8a4fc7);
 function updateTags(){const on=state.topic==='mount'&&$('#forces').checked&&state.explode<.02;forces.visible=on;$('#tags').hidden=!on;if(!on)return;const w=host.clientWidth,h=host.clientHeight;for(const t of tagEls){const v=t.v.clone().project(camera);t.d.style.left=((v.x+1)/2*w)+'px';t.d.style.top=((1-v.y)/2*h)+'px';t.d.style.display=v.z<1?'flex':'none';}}
 function decorate(){
  for(const m of meshes){const n=m.name,part=m.userData.part;m.material.color.set(part.color);m.material.emissive.set(0);m.material.opacity=1;m.material.transparent=false;
   if(relevant(n)){m.material.color.set(n==='blade'?'#e5af3b':'#258b83');m.material.emissive.set('#062421');}
   if(state.ghost&&/socket_block|pivot_block|rail_riser|arm|cap_bridge|adapter_block/.test(n)){m.material.transparent=true;m.material.opacity=.24;}
   m.visible=state.topic!=='mount'||MOUNT.test(n);
   m.material.clippingPlanes=state.section&&n==='pivot_block'&&state.topic!=='mount'?[new THREE.Plane(new THREE.Vector3(1,0,0),80)]:state.section&&state.topic==='mount'&&/socket_block|adapter_block|holder_env|cld201_body/.test(n)?[new THREE.Plane(new THREE.Vector3(-1,0,0),0)]:[];
   if(state.topic==='mount'&&/socket_block|cld201_body|cld201_handle/.test(n)){m.material.transparent=true;m.material.opacity=.22;m.material.depthWrite=false;}else m.material.depthWrite=true;
   if(state.topic==='mount'&&n==='adapter_block'){m.material.transparent=true;m.material.opacity=.55;}
   if(m===selected){m.material.emissive.set('#6d3300');m.material.color.set('#e39a36');}
   m.material.color.convertSRGBToLinear();m.material.needsUpdate=true;
  }
 }
 function explodeAmount(n,g){
  if(n==='breadboard')return 0;if(n==='bearing_608_1')return 15;if(n==='bearing_608_2')return 35;if(n==='shaft')return 55;
  if(n==='cap_bridge')return 100;if(n==='arc_rail_shim')return 45;if(n==='arc_rail')return 28;
  if(g==='arm')return n==='clamp_plate'?100:n==='blade'?88:n==='seat'?73:65;
  if(/holder|keep|overhang/.test(n))return 42;if(n==='adapter_block')return 20;return 0;
 }
 function applyPose(){
  const a=THREE.MathUtils.degToRad(state.angle),q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),a);
  for(const m of meshes){const p=m.userData.part;m.position.set(0,0,0);m.quaternion.identity();
   // Geometry already contains the exact phi=0 assembly coordinates.
   if(p.group==='arm'){m.quaternion.copy(q);m.position.copy(pivot).sub(pivot.clone().applyQuaternion(q));}
   m.position.z+=state.explode*explodeAmount(m.name,p.group);
  }
  $('#angle').value=state.angle;$('#angleValue').value=(state.angle>=0?'+':'')+state.angle.toFixed(1)+'°';drawLab();
 }
 function setAngle(v){state.angle=Math.max(-19.5,Math.min(19.5,v));applyPose();}
 function setTopic(topic){state.topic=topic;state.playing=false;$('#play').textContent='▶ 한 번 저미기';$$('[data-topic]').forEach(b=>b.classList.toggle('active',b.dataset.topic===topic));const d=chapters[topic];$('#explanation').innerHTML=`<span class="eyebrow">${({operation:'01 · 작동 원리',pivot:'02 · 회전축의 정밀도',rail:'03 · 날의 높이',section:'04 · 내부 구조',mount:'05 · 넥스트론 홀더 결합부'})[topic]}</span><h2>${d.title}</h2><p>${d.body}</p><ol class="steps">${d.steps.map(s=>`<li>${s}</li>`).join('')}</ol><div class="callout">${topic==='mount'?'<b>판정</b>: 아래·앞뒤·옆은 충분합니다. 위 방향은 마찰에만 기대므로 플런저 미는 힘을 정하고 들림 시험을 해야 합니다. 아래 ‘결합부 절개’를 켜면 x = 0 단면이 보입니다.':topic==='operation'?'손잡이 끌기 → 3D 화면을 좌우로 끌거나, 아래 각도 막대를 움직여 보세요.':'공차 도면은 업체가 맞춰야 할 범위이고, 이 화면의 확대 그림은 이해를 위한 도식입니다.'}</div>`;
  $('#topicCaption').textContent=d.caption;$('#labTitle').textContent=d.lab;$('#labIntro').textContent=d.intro;
  const er=$('#error');if(topic==='mount'){er.min=0;er.max=200;er.step=5;state.error=50;}else{er.min=0;er.step=.001;er.max=topic==='pivot'?.04:.08;state.error=topic==='pivot'?.01:.02;}er.value=state.error;
  $('#scaleRow').hidden=$('#scaleNote').hidden=topic==='mount';$('#forceToggle').hidden=topic!=='mount';$('#section').parentElement.lastChild.textContent=topic==='mount'?' 결합부 절개 (x = 0)':' 피벗 절반 절개';
  state.section=topic==='section';$('#section').checked=state.section;
  if(topic==='rail')$('#explanation').insertAdjacentHTML('beforeend',`<div class="metric-grid">
   <div><b>평탄도 · 굴곡</b><svg viewBox="0 0 150 90"><path d="M12 23H138M12 41H138" stroke="#98bab4" stroke-dasharray="3 3"/><path d="M12 32Q43 11 74 32T138 32" fill="none" stroke="#247d73" stroke-width="3"/><path d="M12 65H138" stroke="#748d9b" stroke-width="5"/><text x="12" y="84">두 평면 사이 0.03 mm</text></svg></div>
   <div><b>평행도 · 기울기</b><svg viewBox="0 0 150 90"><path d="M12 42L138 19" stroke="#247d73" stroke-width="3"/><path d="M12 65H138" stroke="#748d9b" stroke-width="5"/><text x="12" y="84">바닥 C에 대해 0.03 mm</text></svg></div>
   <div><b>두께 · 높이</b><svg viewBox="0 0 150 90"><path d="M12 25H115V65H12Z" fill="#dde6e9" stroke="#748d9b"/><path d="M128 25V65M124 25H132M124 65H132" stroke="#247d73" stroke-width="2"/><text x="12" y="84">13.22 ±0.05 mm</text></svg></div>
   <div><b>Ra · 미세 요철</b><svg viewBox="0 0 150 90"><path d="M10 43l5-11 5 17 5-13 5 7 5-18 5 22 5-13 5 10 5-19 5 22 5-12 5 10 5-17 5 13 5-19 5 21 5-8 5 6 5-16 5 14 5-10 5 9 5-12 5 11 5-8" fill="none" stroke="#bd792f"/><path d="M10 39H140" stroke="#b9c6cb" stroke-dasharray="3 3"/><text x="12" y="84">Ra 1.6 µm · 여기만 확대</text></svg></div>
  </div><p class="important">각 그림은 개념도입니다. 평탄도는 기준면 없이, 평행도는 기준 C에 대해 판단합니다. 두께 측정만으로 두 형상 공차를 보증할 수 없습니다.</p>`);
  if(topic==='mount')$('#explanation').insertAdjacentHTML('beforeend',`<div class="legend"><span><em style="background:#d9822b"></em>플런저 미는 힘</span><span><em style="background:#1f9e8f"></em>받치는 힘(핀·돌기·세트나사)</span><span><em style="background:#3a6fd8"></em>볼트 조임</span><span><em style="background:#c73a3a"></em>절단력 ≤20 N(추정)</span><span><em style="background:#8a4fc7"></em>들림 힘(가정)</span></div>
   <h3>결합부 치수 (CAD 261101c)</h3><table class="spec"><tr><th>번호·항목</th><th>값</th></tr>
   <tr><td>① 소켓 블록 포켓</td><td><b>50.0×50.0</b>, 모서리 R3, 깊이 36, 바닥 6 <span class="st ok">JLCCNC 주문</span></td></tr>
   <tr><td>⑤⑥ 포켓 바닥 탭</td><td>M4 관통 7개. ⑥ 누름 볼트 M4×35 ×4 (±21, ±21), ⑤ 높이 세트나사 M4 ×3 (±21, 0)·(0, −21) <span class="st ok">탭은 주문</span></td></tr>
   <tr><td>② 어댑터</td><td><b>49.6×49.6</b> R4, 높이 = 홀더 높이 + 4.5, 포켓과 면당 틈 <b>0.2</b> <span class="st cad">미주문·11/9 후 제작</span></td></tr>
   <tr><td>③ 홀더 소켓</td><td>홀더 + 0.1 → <b>24.5×31.1</b>(면당 0.05), 깊이 홀더 + 0.5 <span class="st wait">홀더 실측 대기</span></td></tr>
   <tr><td>홀더 외형</td><td>24.4×31.0×25 <span class="st wait">가정</span> 실물은 A·B 두 쪽 비대칭, SUS316L(매뉴얼). 넥스트론 도면과 차이가 있어 실측 전 어댑터 제작 금지</td></tr>
   <tr><td>④ 받침</td><td>Ø6 돌기 3개, 높이 0.35, (±6, −11)·(0, 11)</td></tr>
   <tr><td>⑦⑧ 옆 위치</td><td>플런저 Ø6(구멍 Ø7, z = −10)이 −y로 밀고, 위치 핀 Ø3 ×2(x = ±6)와 키 핀 Ø3이 받음 <span class="st wait">핀 자리는 실물 홀더에 맞춰 다시</span></td></tr>
   <tr><td>⑨ 날 간극</td><td><b>0.02 mm</b> = Z 스테이지 + 0.02 심 영점. 끼워맞춤 틈이 아니라 날과 홀더 면 사이 높이</td></tr></table>
   <h3>힘이 가는 길</h3><p>절단력 → 시료 → 홀더 → (앞뒤) 위치 핀·플런저 / (아래) 받침 돌기 → 어댑터 → 누름 볼트·세트나사 → 소켓 블록 → M6 볼트 5개 → 브레드보드.</p>
   <div class="verdict"><b>아래</b><span class="good">충분 · 돌기 3점 + 세트나사 3개</span><b>앞뒤</b><span class="good">충분 · 264 N ÷ 20 N = 13배</span><b>옆</b><span class="good">충분 · 5 N, 벽 틈 0.05 mm</span><b>어댑터</b><span class="good">충분 · M4 4개 조임력 수 kN</span><b>위</b><span class="weak">약함 · 마찰만, 미는 힘이 정해지지 않음</span></div>
   <h3>개선안 (주문 부품은 그대로, 어댑터와 절차만)</h3><ol class="fixes"><li><b>옆 쐐기 누름 추가</b>: 어댑터 +x 벽에 M4 수직 나사(머리는 윗면보다 1 mm 아래) + 45° 쐐기로 홀더를 −x 벽에 밉니다. 100 N이면 위로 버티는 마찰이 0.15×2×(100+100) = 60 N, 추정 들림 20 N의 3배입니다.</li><li><b>플런저 미는 힘을 100 N 이상으로 정함</b>: 푸시풀 게이지로 한 번 재고 스핀들 너트 위치를 표시합니다.</li><li><b>영점은 홀더 면에서</b>: 0.02 심을 홀더 면 두 곳(−15°, +15°)에서 맞추고, 어댑터 윗면은 세트나사로 홀더 면보다 0.10 mm 낮게 둡니다. 날이 어댑터를 치지 않고 홀더 높이 오차와 무관해집니다.</li><li><b>들림 시험</b>: 홀더 면에 다이얼 게이지(1 µm)를 대고 위로 20 N(2 kg 추), 옆으로 20 N을 걸어 이동이 5 µm 이하인지 봅니다.</li><li><b>실물 홀더에 면보다 낮은 턱이 있으면</b>: 어댑터 윗면에 걸림 턱(홀더 면보다 0.3 mm 낮게)을 두어 위로 못 들리게 합니다. 가장 확실한 방법이며 11/9 실측 뒤 정합니다.</li><li>위에서 누르는 클램프는 쓸 수 없습니다. 날이 홀더 면 전체를 지나가기 때문입니다.</li></ol>`);
  decorate();focus(topic);drawLab();location.hash=topic;
 }
 function drawLab(){
  const e=state.error,k=state.magnify,pix=3*k,topic=state.topic;
  $('#errorValue').value=e.toFixed(3)+' mm';
  if(topic==='mount'){
   const F=e,now=MU*2*F,imp=MU*2*(F+100),sx=v=>20+Math.min(v,90)/90*290;
   $('#errorLabel').firstChild.textContent='토글 플런저가 미는 힘 ';$('#errorValue').value=F.toFixed(0)+' N';
   const bar=(y,v,c,t)=>`<rect x="20" y="${y}" width="${sx(v)-20}" height="16" rx="3" fill="${c}"/><text x="${Math.min(sx(v),250)+5}" y="${y+12}">${v.toFixed(0)} N</text><text x="20" y="${y-4}">${t}</text>`;
   $('#schematic').innerHTML=`<svg viewBox="0 0 340 230" role="img" aria-label="위로 버티는 마찰과 들림 힘 비교">${bar(28,now,'#d9822b','지금: 플런저 + 핀 벽 마찰 (0.15 × 2 × F)')}${bar(78,imp,'#146d67','개선: + 옆 쐐기 100 N')}${bar(128,LIFT[0],'#b9a3d9','들림 힘, 날카로운 날 (가정)')}${bar(178,LIFT[1],'#8a4fc7','들림 힘, 무딘 날 (가정)')}<path d="M${sx(LIFT[1])} 18V205" stroke="#8a4fc7" stroke-dasharray="4 3"/><text x="20" y="222">막대 끝 90 N에서 자름 · 홀더 무게 약 1 N은 무시</text></svg>`;
   $('#labReadout').innerHTML=`지금 버티는 힘 <b class="${now<LIFT[1]?'bad':''}">${now.toFixed(0)} N</b> / 개선 후 <b>${imp.toFixed(0)} N</b> / 무딘 날 들림 <b>${LIFT[1]} N</b><br><span class="${now<LIFT[1]?'bad':''}">${now<LIFT[0]?'날카로운 날에서도 홀더가 들릴 수 있습니다.':now<LIFT[1]?'날이 무뎌지면 들릴 수 있습니다. 옆 쐐기나 걸림 턱이 필요합니다.':'마찰은 충분해 보입니다. 미는 힘이 이 값으로 유지되는지 실물에서 확인합니다.'}</span><br>μ = 0.15, 들림 힘 10·20 N은 가정입니다. 결론은 들림 시험(20 N에서 5 µm 이하)으로 냅니다.`;
  } else if(topic==='pivot'){
   const dx=e*pix;$('#errorLabel').firstChild.textContent='아래 좌석 중심 편차 ';
   $('#schematic').innerHTML=`<svg viewBox="0 0 340 215" role="img" aria-label="위아래 베어링 좌석 중심 편차. 오차는 ${k}배 과장"><rect x="42" y="27" width="256" height="155" rx="8" fill="#d5dfe4"/><rect x="130" y="27" width="80" height="155" fill="#f4f7f8"/><path d="M170 15V195" stroke="#25918b" stroke-dasharray="4 4"/><rect x="132" y="40" width="76" height="26" rx="4" fill="#7d9caa"/><rect x="${132+dx}" y="142" width="76" height="26" rx="4" fill="#d2a169"/><path d="M170 53L${170+dx} 155" stroke="#b76b24" stroke-width="3"/><text x="48" y="52">위 좌석</text><text x="48" y="158">아래 좌석</text><text x="184" y="18">기준축 A</text><text x="38" y="207">좌석·축 위치는 설명용 도식 · 오차 ${k}배</text></svg>`;
   $('#labReadout').innerHTML=`중심 편차 <b>${(e*1000).toFixed(0)} µm</b> / 비교할 동축 허용영역 반지름 <b>10 µm</b><br><span class="${e>.010001?'bad':''}">${e>.010001?'평행한 두 축의 예에서도 Ø0.02 영역을 벗어납니다.':'평행한 축의 중심 편차만 비교한 예입니다. 실제 기울기·형상은 별도 검사합니다.'}</span><br>H7의 구멍 크기와 동축 정밀도는 별도로 지정합니다.`;
  } else if(topic==='rail'){
   const pp=e*1000,phase=(state.angle+19.5)/39,delta=e/2*Math.sin(phase*Math.PI*2),gap=.02+delta;
   const railPts=Array.from({length:101},(_,i)=>`${26+i*2.88},${120-Math.sin(i/100*Math.PI*2)*e/2*pix}`).join(' '),x=26+phase*288,y=120-Math.sin(phase*Math.PI*2)*e/2*pix;
   $('#errorLabel').firstChild.textContent='레일 높이 변화 전체 폭 ';
   $('#schematic').innerHTML=`<svg viewBox="0 0 340 215" role="img" aria-label="레일 높이 변화와 움직이는 볼. 오차는 ${k}배 과장"><path d="M26 120H314" stroke="#a8bac3" stroke-dasharray="5 4"/><polyline points="${railPts}" fill="none" stroke="#278a80" stroke-width="4"/><circle cx="${x}" cy="${y-9}" r="9" fill="#a7b8c5" stroke="#4f6b7b"/><path d="M${x-20} ${y-20}H${x+20}" stroke="#344b5a" stroke-width="5"/><text x="25" y="25">볼 이동 위치: ${state.angle.toFixed(1)}°</text><text x="25" y="43">볼 높이 변화도 함께 나타납니다.</text><text x="25" y="191">← 주차　　　　　절단 방향　　　　　끝 →</text><text x="25" y="207">높이 오차만 ${k}배 · 형상은 설명용 사인파</text></svg>`;
   $('#labReadout').innerHTML=`레일 높이 변화 전체 폭 <b>${pp.toFixed(0)} µm</b><br>그림 속 현재 높이 변화 <b>${(delta*1000).toFixed(1)} µm</b><br>1:1 도식의 간극: <b class="${gap<=0?'bad':''}">${(gap*1000).toFixed(1)} µm</b> (20 µm + 현재 변화)<br>${e>.04?'이 단순 예에서는 위치에 따라 간극이 0 이하가 될 수 있습니다.':'평탄도 허용값 30 µm도 목표 간극 20 µm보다 큽니다. 조립 후 전 행정 검사가 필요합니다.'}<br>실제 날 간극의 예측값은 아닙니다.`;
  } else {
   const gap=.02*pix,err=e*pix;
   $('#errorLabel').firstChild.textContent='간극 방향의 오차 크기 ';
   $('#schematic').innerHTML=`<svg viewBox="0 0 340 260" role="img" aria-label="칼날과 홀더의 0.02mm 간극과 오차 ${k}배 확대"><rect x="35" y="175" width="270" height="33" fill="#aabac4"/><rect x="100" y="161" width="70" height="14" fill="#d8af79"/><path d="M52 ${175-gap-24}H284L256 ${175-gap}H52Z" fill="#4b6270"/><path d="M245 ${175-gap}V175" stroke="#17877f" stroke-width="2"/><text x="250" y="${168-gap/2}">20 µm</text><path d="M77 ${175-gap-err}V${175-gap}" stroke="#bc6b28" stroke-width="3"/><text x="38" y="${160-gap-err}">오차 ${Math.round(e*1000)} µm</text><text x="42" y="232">홀더 고정면 / 시료(갈색) / 칼날(진한색)</text><text x="42" y="248">간극·오차 ${k}배 · 시료 두께는 도식</text></svg>`;
   $('#labReadout').innerHTML=`목표 간극 <b>20 µm</b> / 오차 <b>${(e*1000).toFixed(0)} µm</b><br><span class="${e>=.02?'bad':''}">${e>=.02?'오차가 목표 간극과 같거나 큽니다. 오차 방향에 따라 접촉하거나 덜 잘릴 수 있습니다.':'간극보다 작은 오차지만 다른 오차와 합쳐질 수 있습니다.'}</span><br>20 µm는 설계 목표입니다. 실제 조립·측정으로 확인해야 합니다.`;
  }
 }
 function setDragMode(on){state.dragMode=on;controls.enabled=!on;$('#cameraMode').classList.toggle('active',!on);$('#handleMode').classList.toggle('active',on);$('#gestureHint').textContent=on?'3D 화면을 좌우로 끌어 손잡이 작동 · 정밀 조절은 아래 각도 막대':'빈 곳을 끌어 회전 · 휠로 확대 · 우클릭 이동';}
 function pointer(e){const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);}
 let down=null;canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;down={x:e.clientX,y:e.clientY,angle:state.angle};if(state.dragMode){state.playing=false;$('#play').textContent='▶ 한 번 저미기';canvas.setPointerCapture(e.pointerId);}});
 canvas.addEventListener('pointermove',e=>{if(down&&state.dragMode){setAngle(down.angle+(e.clientX-down.x)/canvas.clientWidth*75);e.preventDefault();}});
 canvas.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<5){pointer(e);let hit=ray.intersectObjects(meshes).find(x=>x.object.material.opacity>.25);selected=hit?.object||null;$('#partLabel').textContent=selected?(partName(selected.name)):'부품을 누르면 이름이 나타납니다.';decorate();}down=null;});canvas.addEventListener('pointercancel',()=>{down=null;});
 $$('[data-topic]').forEach(b=>b.onclick=()=>setTopic(b.dataset.topic));$('#cameraMode').onclick=()=>setDragMode(false);$('#handleMode').onclick=()=>setDragMode(true);$('#home').onclick=()=>focus('operation');$('#top').onclick=()=>{camera.position.set(5,-13,540);controls.target.set(5,-13,0);controls.update();};
 $('#angle').oninput=e=>{state.playing=false;$('#play').textContent='▶ 한 번 저미기';setAngle(+e.target.value);};$('#explode').oninput=e=>{state.explode=+e.target.value;applyPose();};$('#section').onchange=e=>{state.section=e.target.checked;decorate();};$('#ghost').onchange=e=>{state.ghost=e.target.checked;decorate();};$('#forces').onchange=()=>updateTags();$('#error').oninput=e=>{state.error=+e.target.value;drawLab();};$('#magnify').onchange=e=>{state.magnify=+e.target.value;drawLab();};
 $('#play').onclick=()=>{state.playing=!state.playing;animStart=performance.now();if(state.playing){state.explode=0;$('#explode').value=0;setAngle(-19.5);}$('#play').textContent=state.playing?'Ⅱ 잠시 멈춤':'▶ 한 번 저미기';};
 $('#reset').onclick=()=>{state.explode=0;state.ghost=false;state.magnify=500;$('#explode').value=0;$('#ghost').checked=false;$('#magnify').value=500;selected=null;setDragMode(false);setTopic('operation');setAngle(-19.5);};
 function frame(t){requestAnimationFrame(frame);if(state.playing){let u=Math.min(1,(t-animStart)/2800);setAngle(-19.5+39*(u*u*(3-2*u)));if(u===1){state.playing=false;$('#play').textContent='▶ 한 번 저미기';}}controls.update();updateTags();renderer.render(scene,camera);}
 setTopic(chapters[location.hash.slice(1)]?location.hash.slice(1):'operation');requestAnimationFrame(frame);
 Promise.all([fetch('assets/parts.json').then(r=>{if(!r.ok)throw Error('metadata '+r.status);return r.json();}),new Promise((resolve,reject)=>new THREE.GLTFLoader().load('assets/lever-261102.glb',resolve,undefined,reject))]).then(([data,gltf])=>{
  meta=data;const byName=new Map(data.parts.map(p=>[p.name,p]));gltf.scene.traverse(o=>{if(!o.isMesh)return;let part=byName.get(o.name);if(!part)throw Error('Missing part metadata '+o.name);o.geometry.computeVertexNormals();o.material=new THREE.MeshStandardMaterial({color:part.color,metalness:.18,roughness:.56,side:THREE.DoubleSide});o.userData.part=part;meshes.push(o);});
  root.add(gltf.scene);state.ready=true;$('#loading').hidden=true;decorate();applyPose();
 }).catch(e=>{console.error(e);$('#loading').textContent='모델을 불러오지 못했습니다. 새로고침 후 다시 확인해 주세요. ('+e.message+')';});
 // Read-only observability for reproducible browser checks.
 window.jigReview={getState:()=>({...state,parts:meshes.length,camera:camera.position.toArray(),selected:selected?.name||null,visible:meshes.filter(m=>m.visible).length,tags:$('#tags').hidden?0:tagEls.filter(t=>t.d.style.display!=='none').length}),partPoint:name=>{const m=meshes.find(x=>x.name===name);if(!m)return null;const v=new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3()).project(camera),r=canvas.getBoundingClientRect();return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};}};
})();
