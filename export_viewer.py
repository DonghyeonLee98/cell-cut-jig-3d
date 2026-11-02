"""Read-only web mesh export from latest local CAD build. Usage: python export_viewer.py <CAD-folder>."""
from pathlib import Path
import sys,json,hashlib
import numpy as np
import trimesh
from OCP.STEPControl import STEPControl_Reader
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
CAD=Path(sys.argv[1]).resolve();sys.path.insert(0,str(CAD))
import build_lever_261101c as src
import build_lever_261101 as bl
OUT=Path(__file__).resolve().parent/'assets';OUT.mkdir(exist_ok=True)
parts,hd=bl.assemble_cut(bl.LP['G_NOM'],0.,0.,src.static_parts_c(0.))
def bbox(s):
 b=Bnd_Box();BRepBndLib.AddOptimal_s(s,b,False,False);return b.Get()
scene=trimesh.Scene();meta=[]
colors={'black':'#454c55','alsil':'#a4b0ba','seat':'#4b5967','steel':'#aebac8','hard':'#718695','hold':'#e1c796','pla':'#d49b54','gold':'#d4a93a','pom':'#202934','rail':'#94a4b2','insert':'#91a5b0'}
for n,s,k,g in parts:
 old=bbox(s)
 if n in ('seat','clamp_plate'):
  f=CAD/'jlccnc_261102'/f'{n}.step';r=STEPControl_Reader();r.ReadFile(str(f));r.TransferRoots()
  s=bl.shift(r.OneShape(),(old[0]+old[3])/2,(old[1]+old[4])/2,old[2])
 v,f=bl.mesh(s,defl=.13,ang=.25)
 if not len(f):continue
 mesh=trimesh.Trimesh(vertices=np.round(v,4),faces=f,process=False)
 scene.add_geometry(mesh,node_name=n,geom_name=n)
 meta.append({'name':n,'kind':k,'group':g,'color':colors.get(k,'#98a8b6'),'bounds':[list(v.min(0)),list(v.max(0))],'triangles':len(f)})
scene.export(OUT/'lever-261102.glb')
data={'revision':'261101c + 261102 seat/clamp edge updates','units':'mm','pivot':list(bl.pivot_xy()),'swing':list(bl.LP['SWING']),'parts':meta,'nominalGap':.02,'holderAssumed':True,'sourceFiles':['build_lever_261101c.py','jlccnc_261102/seat.step','jlccnc_261102/clamp_plate.step'],'caveat':'Purchased-part envelopes and holder are CAD assumptions; standoff model is 25 mm + 2 mm washers, verify new 27 mm purchased version before assembly.'}
(OUT/'parts.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
print('EXPORTED',len(meta),'parts,',sum(x['triangles'] for x in meta),'triangles,', (OUT/'lever-261102.glb').stat().st_size,'bytes')
