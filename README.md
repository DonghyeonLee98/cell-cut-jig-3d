# 절단지그 — 움직이며 이해하기

Live: https://donghyeonlee98.github.io/cell-cut-jig-3d/

2026-11-03: 기본 화면을 최신 **레버식** 설계로 바꿨습니다. 아래 초기 리니어 방식은 [legacy.html](legacy.html)에 보존했습니다.

2026-11-10: **실측(11/10)** 섹션을 추가했습니다(`#measured`). 실물 홀더 사진 5장(휴대폰용 축소, EXIF 제거), 캘리퍼 실측 22.02 × 30.99 × 21.01 mm, 이전 가정과의 차이, 어댑터 v2 맞음 판정입니다. 3D 모델의 홀더 외형은 아직 가정값이며 바꾸지 않았습니다.

2026-11-03 오후: **05 넥스트론 결합부** 탭을 추가했습니다. 소켓 블록·어댑터·홀더·토글 클램프만 남기고, 번호 표지(오른쪽 치수 표와 같은 번호), 힘 화살표, x = 0 절개, 플런저 미는 힘과 마찰을 비교하는 막대 그림을 보여 줍니다. 판정: 아래·앞뒤·옆은 충분하고 위(+z)는 마찰에만 기댑니다. 홀더 치수는 우리 CAD 가정값만 싣고, 넥스트론 도면에서 읽은 값은 공개 페이지에 넣지 않았습니다(도면이 RESTRICTED).

## 지금 해볼 것

1. **손잡이 끌기**를 누르고 3D 화면을 좌우로 드래그합니다. 레버가 −19.5°에서 +19.5° 사이로 움직입니다. **시점 회전**은 물체를 돌려 보는 모드이며, 실제 기구 각도와 구분됩니다.
2. 4개 설명 탭으로 작동 → 피벗 → 레일 → 단면을 확인합니다. 부품을 누르면 이름과 역할이 나옵니다.
3. 분해 막대, 피벗 절반 절개, 몸체 투명을 조절합니다. 분해 0이 실제 조립 배치입니다.
4. 공차 도식의 오차 크기와 과장 배율을 바꿔 봅니다. CAD 자체 치수는 바뀌지 않습니다. 1배는 도식 기준이며 디스플레이의 실물 크기를 의미하지 않습니다.
5. [통합 공차 PDF](assets/jlccnc_tolerance_drawings_261102.pdf): 피벗·레일 2쪽. 업체의 특별 공차 수락·비용·납기는 아직 미확인입니다.

## 형상 근거와 한계

- `assets/lever-261102.glb`: local OpenCascade CAD `build_lever_261101c.py`의 90개 조립 부품, 79,483개 삼각형. 원본 mm 좌표를 유지했습니다. `jlccnc_261102/seat.step`와 `clamp_plate.step`의 실제 업로드 수정 형상으로 교체했습니다.
- `assets/parts.json`: 부품 이름·그룹·표시색·경계와 회전축. 팔 그룹만 실제 피벗(−80, −20.5) 주위에서 회전합니다.
- 홀더 인터페이스와 구매품 외형은 설계 가정입니다. 11/9 실물 치수 확인 전이며, 27 mm 스탠드오프의 와셔 조합도 확인해야 합니다. 모델은 기존 25 mm 몸통 + 2 mm 와셔 조건입니다.
- 공차 도식은 이해를 위한 기하학적 예입니다. 레일 높이 변화와 간극 변화를 1:1로 둔 그림은 실제 레버비·탄성·유격을 계산하지 않습니다. FEA나 실물 성능 검증 결과가 아닙니다.
- 목표 간극 20 µm는 설계 목표입니다. 레일 평탄도 30 µm도 이보다 크므로 조립 후 전 행정 다이얼 인디케이터 검사가 필요합니다.
- Ra 1.6 µm 수락은 원 Ra 0.8의 거칠기 완화입니다. 두께 13.22±0.05 mm, 평탄도 0.03 mm, 평행도 0.03 mm를 포기한다는 뜻은 아닙니다.

## 재현·검증

Three.js r128 / OrbitControls / GLTFLoader를 기존 페이지와 같은 버전으로 `vendor/`에 보관해 CDN 접속 없이 새 화면·기존 화면이 작동합니다. Three.js is MIT-licensed; see `vendor/LICENSE-three.txt`.

- mesh export: `python export_viewer.py <local-CAD-directory>` (cadquery-ocp, numpy, trimesh). 원 CAD 파일을 읽기만 하며 웹용 GLB와 메타데이터만 만듭니다.
- local server: `python -m http.server 8767`
- interaction checks: `python browser_smoke.py http://127.0.0.1:8767/ <QA-directory>` (Playwright Chromium; 설치된 Edge로 돌리려면 `PW_CHANNEL=msedge`). 05 결합부 보기의 부품 분리·번호 표지·절개·마찰 막대·375 px 가로 넘침도 확인합니다. 실제 마우스·터치 드래그, 시점 회전, 각도 재생, 분해·절개·투명, 4개 공차 도식, PDF, 모바일 가로 넘침, 기존 블레이드 전환·연습을 확인합니다.
- GitHub Pages: repository `main` branch, root directory.

---

## 초기 리니어 방식 기록 (2026-10-30)

# 셀 단면 절단 지그 3D · Cell cross-section cutting jig 3D

보기 / View: https://donghyeonlee98.github.io/cell-cut-jig-3d/

부산대 이동현, 2026-10-30. Nextron RBC-2EP 셀을 홀더에 조여 고정한 뒤 돌출부를 얇게 저며 단면을 만드는 손으로 쓰는 절단 지그(적층대 + 절단대)의 3D 보기와 운용 연습.
Donghyeon Lee, Pusan National University, 2026-10-30. A hand-operated jig (stacking base + cutting base) that slices the overhang off a clamped RBC-2EP cell to expose a cross-section: 3D viewer and operation practice.

## 한국어

- **3D 모델**: 끌어서 회전, 확대, 부품을 누르면 이름과 재질. 칼날 종류 전환 S35 (Feather 80×8×0.254) / SNAP18 (18 mm 스냅오프, 금색 TiN). 캐리지 주차/절단 위치 전환.
- **운용 연습**: 10단계 (홀더 눕히기 → Zn 포일 → 분리막 → Ti 포일 → 펜스·볼트 → 가위 → 인서트에 끼우기 → 날 높이 → 한 번에 저미기 → 덮개·단면 확인·전해액). 단계마다 움직임과 강조, 한두 줄 설명. 7단계에서 “거꾸로 끼우기”를 누르면 키가 막아 들어가지 않는 모습과 경고. 마지막에 점검표.
- **재질**: 베이스·캐리지·클램프·받침판 Al 6061-T6 흑색 아노다이즈. 소켓 인서트(기준면, 평면도 0.02)는 SUS303 무도금 (아노다이즈 두께가 평면도를 해치고 홀더를 끼울 때마다 마모).
- **가정·미확인**: 홀더 외피 Ø30×25와 키 위치(RBC-2EP 입고 11/9 후 실측), SNAP18 칼날 치수(길이 ~100 → 모델 56 mm, 폭 18, 두께 0.5, 날 40°), 리니어 레일 블록 치수는 데이터시트 미확인. 포일·분리막 두께는 보이게 과장했다.
- 홀더는 우리가 만든 모의 형상이며 업체 도면·STEP은 포함하지 않았다. 설계용 모델이지 제작도가 아니다.

## English

- **3D model**: drag to rotate, zoom, tap a part for its name and material. Blade option S35 (Feather 80×8×0.254) or SNAP18 (18 mm snap-off, gold TiN). Carriage parked or at the cutting position.
- **Practice**: 10 steps (lay holder, Zn foil, separator, Ti foil, fence and bolts, scissors, seat in insert, set blade height, one slicing stroke, cover/inspect/fill electrolyte), each with animation, highlight and a 1–2 line instruction. In step 7 "Insert backwards" shows the key blocking the holder with a warning. Final checklist at the end.
- **Materials**: base, carriage, clamp and seat Al 6061-T6 black anodised; the socket insert (reference face, flatness 0.02) SUS303 bare, because anodising would spoil the flatness and the face wears with every insertion.
- **Assumed / unconfirmed**: holder envelope Ø30×25 and key position (to be measured after the RBC-2EP arrives, 11/9); SNAP18 blade dimensions (length ~100, modelled 56 mm; width 18, thickness 0.5, edge 40°); linear-guide block dimensions are from memory, not a datasheet. Foil and separator thicknesses are exaggerated.
- The holder is our own mock shape; no vendor drawing or STEP is included. A design model, not a manufacturing drawing.

Files: `index.html` (viewer, three.js r128 from a CDN), `cutter.js` (base64 GLB of the CAD assembly, both blade types).
