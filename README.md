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
