import { breath, breathDirection, enemy, type Arena } from './arena';
type Ctx = CanvasRenderingContext2D;
function shape(c: Ctx, points: number[][], fill: string | CanvasGradient, stroke = '#172a24') {
  c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x!, y!) : c.moveTo(x!, y!)); c.closePath();
  c.fillStyle = fill; c.fill(); c.strokeStyle = stroke; c.lineWidth = 1.3; c.stroke();
}
function ellipse(c: Ctx, x: number, y: number, rx: number, ry: number, color: string) {
  c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fillStyle=color;c.fill();
}
export function drawCourtyard(c: Ctx) {
  const floor=c.createLinearGradient(0,0,480,320);floor.addColorStop(0,'#344c48');floor.addColorStop(1,'#172b2b');c.fillStyle=floor;c.fillRect(0,0,480,320);
  for(let row=0;row<10;row++) for(let col=0;col<16;col++) {
    const x=col*34+(row%2)*17-20,y=row*34;
    c.fillStyle=['#354942','#3c514a','#30453f'][(row*7+col*3)%3]!;
    c.beginPath();c.roundRect(x,y,32,31,2);c.fill();
    c.strokeStyle='#63766a44';c.lineWidth=0.7;c.beginPath();c.moveTo(x+2,y+1);c.lineTo(x+29,y+1);c.stroke();
    if((row*11+col)%13===0) {c.strokeStyle='#182e29';c.beginPath();c.moveTo(x+7,y+3);c.lineTo(x+13,y+12);c.lineTo(x+10,y+19);c.stroke();}
  }
  // Inlaid approach and central seal, all on walkable ground.
  c.strokeStyle='#82907955';c.lineWidth=1.2;
  for(const r of [57,63,83]) {c.beginPath();c.ellipse(275,145,r,r*0.7,0,0,Math.PI*2);c.stroke();}
  for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.moveTo(275+Math.cos(a)*66,145+Math.sin(a)*46);c.lineTo(275+Math.cos(a)*77,145+Math.sin(a)*54);c.stroke();}
  // Back wall, recessed gate and dressed stone blocks.
  c.fillStyle='#162625';c.fillRect(0,0,480,37);
  for(let row=0;row<2;row++) for(let col=0;col<16;col++) {
    c.fillStyle=row?'#4c6158':'#66796a';c.fillRect(col*34+(row%2)*17-17,row*15,32,13);
  }
  c.fillStyle='#132422';c.beginPath();c.roundRect(206,-19, 60,54,23);c.fill();
  for(let x=216;x<260;x+=8){c.fillStyle='#778477';c.fillRect(x,0,3,30);}
  c.fillStyle='#798472';c.fillRect(201,28,72,6);
  for(const x of [67,359]) {
    shape(c,[[x,18],[x+22,18],[x+22,63],[x+11,73],[x,63]],'#294b58','#aa9665');
    shape(c,[[x+11,30],[x+16,43],[x+11,52],[x+6,43]],'#b5a477');
  }
  // Corner bastions stay outside the central combat space.
  for(const [x,y] of [[15,40],[464,40],[15,286],[464,286]]) {
    ellipse(c,x!,y!+12,24,11,'#08191877');
    c.fillStyle='#3e534c';c.fillRect(x!-15,y!-16,30,34);
    c.fillStyle='#788876';c.fillRect(x!-18,y!-20,36,10);
    for(let k=0;k<3;k++){c.fillStyle='#96a18b';c.fillRect(x!-18+k*14,y!-27,8,10);}
    c.strokeStyle='#243b33';c.beginPath();c.moveTo(x!-14,y!+1);c.lineTo(x!+14,y!+1);c.stroke();
  }
  // Ivy, loose stones and braziers hug the boundary.
  for(let i=0;i<26;i++){const x=i%2?474:6,y=65+(i*31)%210;ellipse(c,x,y,5,3,i%3?'#4a6345':'#6b7b49');}
  for(const x of [49,383]) {
    const light=c.createRadialGradient(x,42,1,x,42,28);light.addColorStop(0,'#efbc583b');light.addColorStop(1,'#efbc5800');c.fillStyle=light;c.fillRect(x-28,14,56,56);
    c.fillStyle='#1e2c29';c.fillRect(x-3,42,6,15);ellipse(c,x,42,8,4,'#ac8e59');
    shape(c,[[x-5,40],[x-2,30],[x+1,34],[x+3,26],[x+6,39]],'#edbd68','#f3d99b');
  }
  c.fillStyle='#192f2b';c.fillRect(0,304,480,16);
  for(let i=0;i<15;i++){c.fillStyle='#4b6155';c.fillRect(i*34,302,31,7);}
}
export function drawDragon(c: Ctx, s: Arena) {
  const facing=breathDirection(s);
  // The exact attack footprint is shared with the combat simulation.
  if(s.phase>=breath.warning && s.phase<breath.end) {
    c.save();c.translate(enemy.x,enemy.y);c.rotate(facing);
    c.beginPath();c.moveTo(0,0);c.arc(0,0,breath.range,-breath.halfAngle,breath.halfAngle);c.closePath();
    c.fillStyle=s.phase<breath.strike?'#d2df6230':'#6eee7440';c.fill();
    c.strokeStyle=s.phase<breath.strike?'#e7e28a':'#b8ffad';c.lineWidth=1.5;c.setLineDash([5,5]);c.stroke();c.setLineDash([]);
    if(s.phase>=breath.strike) {
      const fire=c.createLinearGradient(22,0,breath.range,0);fire.addColorStop(0,'#f2ffc9');fire.addColorStop(0.25,'#b1ff64df');fire.addColorStop(0.7,'#45dd7488');fire.addColorStop(1,'#27a76900');
      shape(c,[[24,-4],[85,-17],[130,-28],[180,-36],[290,-80],[255,-20],[282,15],[200,30],[290,75],[170,36],[90,20],[24,5]],fire,'#a2ff8422');
      for(let i=0;i<25;i++) {
        const travel=((s.phase-breath.strike)*340+i*37)%260;
        const spread=Math.sin(i*2.4)*travel*0.24;
        ellipse(c,30+travel,spread,4+travel*0.016,2+travel*0.012,i%3?'#b9ff7977':'#e6ffadbb');
      }
    }
    c.restore();
  }
  ellipse(c,enemy.x,enemy.y+17,51,21,'#071b2399');
  c.save();c.translate(enemy.x,enemy.y);c.rotate(facing);
  // Tail, webbed wings and ribbing create a readable dragon silhouette.
  shape(c,[[-12,9],[-44,19],[-65,10],[-70,-4],[-59,2],[-43,5],[-15,-9]],'#385d4b');
  for(const sign of [-1,1]) {
    c.save();c.scale(1,sign);
    shape(c,[[-13,1],[-40,25],[-35,57],[-13,43],[4,51],[12,27],[24,13],[7,6]],'#2b4d46');
    shape(c,[[-11,9],[-33,27],[-31,48],[-13,36],[1,44],[5,25],[17,15]],'#68855a');
    c.strokeStyle='#bcc68b';c.lineWidth=1.5;
    for(const [x,y] of [[-31,48],[-13,36],[1,44],[17,15]]){c.beginPath();c.moveTo(-11,9);c.lineTo(x!,y!);c.stroke();}
    shape(c,[[-4,7],[8,19],[20,19],[22,13],[12,12],[8,3]],'#638464');
    for(let i=0;i<3;i++) shape(c,[[17+i*3,14],[23+i*3,18],[18+i*3,19]],'#e3d9aa');
    c.restore();
  }
  ellipse(c,-5,0,24,14,'#385e4b');ellipse(c,1,0,17,10,'#84a171');
  for(let i=0;i<5;i++) shape(c,[[-22+i*7,-4],[-18+i*7,-10],[-15+i*7,-4]],'#c4bd87');
  shape(c,[[10,-10],[25,-12],[38,-7],[41,5],[30,12],[13,9]],'#64875c');
  shape(c,[[14,-8],[9,-23],[20,-13]],'#e1d8ab');shape(c,[[14,8],[9,23],[20,13]],'#e1d8ab');
  ellipse(c,26,-7,4,2,'#e6ff7f');ellipse(c,26,7,4,2,'#e6ff7f');
  c.fillStyle='#182820';c.fillRect(26,-9,1.5,4);c.fillRect(26,5,1.5,4);
  c.strokeStyle='#172f27';c.lineWidth=2;c.beginPath();c.moveTo(33,-6);c.lineTo(39,0);c.lineTo(33,6);c.stroke();
  if(s.phase>=breath.warning) ellipse(c,39,0,4,5,s.phase>=breath.strike?'#eaffac':'#95d96e');
  c.restore();
  c.fillStyle='#102722';c.beginPath();c.roundRect(enemy.x-39,enemy.y-67,78,7,3);c.fill();
  c.fillStyle='#adce77';c.beginPath();c.roundRect(enemy.x-38,enemy.y-66,76*s.enemyHp/6,5,2);c.fill();
  c.fillStyle='#e3e5bc';c.font='bold 8px sans-serif';c.textAlign='center';c.fillText('DRAGÃO DO BASTIÃO',enemy.x,enemy.y-72);
}

/** Original miniature knight, drawn at gameplay scale with a clear sword/shield silhouette. */
export function drawKnight(c: Ctx, s: Arena) {
  c.save();c.translate(s.x,s.y);
  ellipse(c,0,17,20,7,'#091c2699');
  // Split cloak and separate boots keep the outline readable on stone.
  shape(c,[[-8,-8],[7,-8],[14,17],[4,14],[-1,19],[-13,15]],'#244c73','#11283b');
  shape(c,[[-8,-4],[-3,1],[-6,14],[-12,15]],'#39749a','#315c7b');
  for(const x of [-6,5]) {
    shape(c,[[x-4,7],[x+3,7],[x+4,17],[x-4,17]],'#81959f');
    shape(c,[[x-4,14],[x+3,14],[x+5,20],[x-5,20]],'#273c49');
    c.strokeStyle='#b9c8c5';c.lineWidth=1;c.beginPath();c.moveTo(x-3,11);c.lineTo(x+3,11);c.stroke();
  }
  const plate=c.createLinearGradient(-10,-9,12,13);plate.addColorStop(0,'#e0e8df');plate.addColorStop(.4,'#9eafb1');plate.addColorStop(1,'#496274');
  shape(c,[[-9,-9],[9,-9],[11,1],[6,10],[-7,10],[-11,1]],plate);
  shape(c,[[-7,-5],[0,-7],[7,-5],[5,2],[0,5],[-5,2]],'#4b7190','#c4d2ce');
  c.fillStyle='#b39b62';c.fillRect(-9,6,18,3);c.fillStyle='#e5c681';c.fillRect(-2,5,4,5);
  for(const x of [-11,11]) {
    shape(c,[[x-5,-9],[x+4,-9],[x+6,-2],[x-4,1]],plate);
    c.strokeStyle='#e5d7ae';c.beginPath();c.moveTo(x-4,-7);c.lineTo(x+3,-7);c.stroke();
  }
  // Closed sallet, cheek plates and a dark visor rather than a bare square face.
  shape(c,[[-9,-12],[-8,-23],[-4,-27],[5,-27],[9,-22],[10,-12],[5,-8],[-5,-8]],plate);
  shape(c,[[-8,-19],[8,-19],[8,-14],[-7,-14]],'#162b38');
  c.strokeStyle='#ddede2';c.lineWidth=1;c.beginPath();c.moveTo(0,-26);c.lineTo(0,-19);c.moveTo(-7,-22);c.lineTo(-3,-25);c.stroke();
  for(let x=-4;x<=4;x+=4){c.strokeStyle='#3c5360';c.beginPath();c.moveTo(x,-12);c.lineTo(x,-10);c.stroke();}
  shape(c,[[-2,-27],[2,-33],[6,-32],[8,-26],[4,-22],[3,-27]],'#39779b','#244962');
  // Kite shield, metal rim, inset enamel and crest.
  shape(c,[[-21,-4],[-14,-8],[-7,-4],[-8,9],[-14,16],[-20,9]],'#d0c08e');
  shape(c,[[-19,-3],[-14,-5],[-9,-3],[-10,8],[-14,12],[-18,8]],'#285c79','#203f56');
  shape(c,[[-14,-2],[-11,3],[-14,8],[-17,3]],'#e8d7a2','#bca66e');
  // Sword tip, fuller, crossguard, leather grip and pommel.
  c.save();c.translate(15,0);c.rotate(s.slash>0?0.7:0.12);
  shape(c,[[-2,1],[-2,-22],[0,-29],[3,-22],[3,1]],'#dbece7','#506b77');
  c.strokeStyle='#fff8d5';c.lineWidth=1;c.beginPath();c.moveTo(0,-24);c.lineTo(0,0);c.stroke();
  shape(c,[[-6,0],[6,0],[7,3],[2,2],[2,10],[-2,10],[-2,2],[-7,3]],'#bca16a');
  c.fillStyle='#384350';c.fillRect(-1,3,3,6);ellipse(c,0,11,2.5,2.5,'#e1c282');
  c.restore();c.restore();
}
