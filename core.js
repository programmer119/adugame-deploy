const { useEffect, useRef, useState } = React;

// All gameplay tuning lives here. Values are logical-pixel / millisecond targets.
// SOURCE tags are documented in docs/01_GAMEPLAY_REVERSE_ENGINEERING_SPEC.md.
const FEEL = {
  logical: { width: 1280, height: 720, fps: 60 },
  input: {
    pickupScale: 1.06,
    pickupDuration: 80,
    objectLiftY: -8,
    hitScale: 1.25,
    minHitPx: 72,
    dragDeadzonePx: 2,
    meaningfulMovePx: 8,
    maxTapMs: 260
  },
  snap: {
    correctDuration: 160,
    wrongReturnDuration: 240,
    magnetMin: 56,
    magnetMax: 96,
    targetPulseScale: 1.05,
    targetPulseDuration: 420
  },
  feedback: {
    correctSfxDelay: 30,
    particleDelay: 100,
    reactionDelay: 180,
    voiceDelay: 260,
    nextTaskDelay: 800,
    roundClearHold: 900,
    resultMinHold: 900,
    wrongWobbleDeg: 3,
    wrongWobbleDuration: 210
  },
  hint: {
    delay: [4000, 5500, 7000],
    repeatOnceAfter: 2200,
    ghostDuration: 1400,
    failurePulseAt: 2,
    ghostAt: 3
  },
  character: { idleMin: 6000, idleMax: 10000, blinkMs: 140, reactMs: 180 },
  brush: {
    requiredDistance: 420,
    hairRadius: 145,
    minStrokePx: 24,
    maxAcceptedSpeedPxPerSec: 1900,
    progressCuts: [0,.33,.66,1]
  },
  wash: {
    faucetTurnDeg: 34,
    pumpTravelPx: 26,
    scrubDistance: 460,
    wipeDistance: 560,
    rinseHoldMs: 450,
    towelDistance: 260
  },
  toaster: { leverMs: 150, heatMs: 1100, popAtMs: 1250, risePx: 22 },
  eat: { mouthRadius: 78, biteMs: 120, chewMs: 730, smileAtMs: 850 },
  screwdriver: { requiredAngle: 540 },
  slime: {
    mixAngle: 900,
    minMixTime: 1350,
    stretchMax: 1.42,
    squashMin: .78,
    releaseDuration: 300,
    spring: .16,
    damping: .72,
    pointCount: 18,
    grabRadius: 155,
    baseRx: 126,
    baseRy: 78,
    maxPointPull: 120
  }
};

const COLORS = {
  ink: 0x24314a, cream: 0xfff8ea, sky: 0xcceeff, aqua: 0x7bdff2, mint: 0xb2f7ef,
  yellow: 0xffe66d, peach: 0xffb4a2, coral: 0xff7f6a, pink: 0xffc6df, purple: 0xb8a1ff,
  green: 0x8bd17c, blue: 0x5aa9e6, red: 0xff6b6b, brown: 0x9a6b43, white: 0xffffff,
  gray: 0xd9e1e8, dark: 0x2e4057
};

const GAMES = [
  { id: 1, title: '생활 실습', dna: '단계 숙달 · 친절한 성공감', icon: '🧼', rounds: ['빗질하기', '손 씻기', '식사 준비'] },
  { id: 2, title: '인터랙티브 하우스', dna: '자유 조작 · 발견의 재미', icon: '🏠', rounds: ['샌드위치 주방', '세탁실', '장난감 수리'] },
  { id: 3, title: '크래프트 스토어', dna: '주문 · 촉감 · 소유감 · 보상', icon: '🫧', rounds: ['2조건 주문', '3조건 주문', '자유 장식 주문'] }
];

function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function dist(a,b,c,d){ return Phaser.Math.Distance.Between(a,b,c,d); }
function nowMs(){ return performance.now(); }

function telemetry(type, data={}){
  const evt={t:Math.round(performance.now()),type,...data};
  window.__ADUGAME_TELEMETRY__ = window.__ADUGAME_TELEMETRY__ || [];
  window.__ADUGAME_TELEMETRY__.push(evt);
  return evt;
}

function makeAudio(){
  let ctx=null;
  const ensure=()=>ctx||(ctx=new (window.AudioContext||window.webkitAudioContext)());
  const tone=(freq,dur=.08,type='sine',gain=.035,delay=0)=>{try{const c=ensure(),t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur);}catch(_){}};
  return {
    pickup(){tone(520,.04,'triangle',.018)}, boop(){tone(210,.08,'sine',.02)}, plop(){tone(140,.1,'sine',.03);tone(95,.08,'sine',.02,.025)},
    pop(){tone(680,.04,'square',.015);tone(900,.05,'triangle',.02,.03)}, water(){tone(360,.06,'sine',.012);tone(510,.04,'sine',.008,.03)},
    scrub(){tone(170,.035,'triangle',.008)}, success(){tone(523,.08,'triangle',.025);tone(659,.09,'triangle',.026,.06);tone(784,.12,'triangle',.03,.12)},
    coin(){tone(980,.05,'square',.015);tone(1318,.08,'triangle',.02,.05)}, click(){tone(420,.025,'square',.008)}
  };
}
const audio=makeAudio();

class BaseRound extends Phaser.Scene {
  constructor(key, meta, done){
    super(key); this.meta=meta; this.doneCb=done; this.score=100; this.errors=0; this.hints=0; this.lastInputAt=0;
    this.hintCountForIdle=0; this.failureByAction={}; this.roundComplete=false; this.interactionLocked=false; this._idleTimer=null;
  }
  create(){
    this.cameras.main.setBackgroundColor('#fff8ea'); this.drawFrame(); this.lastInputAt=this.time.now;
    this.input.on('pointerdown',p=>{this.markMeaningfulInput('pointerdown',{x:Math.round(p.x),y:Math.round(p.y)});});
    this.time.addEvent({delay:250,loop:true,callback:()=>this.checkHint()});
    this.scheduleCharacterIdle();
    telemetry('round_start',{game:this.meta.gameTitle,round:this.meta.round,key:this.scene.key});
  }
  markMeaningfulInput(type,data={}){ this.lastInputAt=this.time.now; this.hintCountForIdle=0; this.clearGhostHint(); telemetry(type,{round:this.scene.key,...data}); }
  drawFrame(){
    const g=this.add.graphics(); g.fillStyle(0xffffff,.94).fillRoundedRect(24,20,1232,680,28); g.lineStyle(3,COLORS.ink,.12).strokeRoundedRect(24,20,1232,680,28);
    this.add.text(54,43,`${this.meta.gameTitle}  ·  ROUND ${this.meta.round}`,{fontFamily:'Arial, sans-serif',fontSize:'25px',fontStyle:'bold',color:'#24314a'});
    this.add.text(54,79,this.meta.title,{fontFamily:'Arial, sans-serif',fontSize:'17px',color:'#607086'});
    this.add.text(1180,44,'⌂',{fontSize:'28px',color:'#718096'}).setOrigin(.5).setInteractive({useHandCursor:true}).on('pointerup',()=>this.doneCb({home:true}));
  }
  makeLabel(x,y,text,w=160,color=COLORS.white){ const c=this.add.container(x,y),g=this.add.graphics();g.fillStyle(color,1).fillRoundedRect(-w/2,-28,w,56,18);g.lineStyle(2,COLORS.ink,.12).strokeRoundedRect(-w/2,-28,w,56,18);const t=this.add.text(0,0,text,{fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5);c.add([g,t]);c.setSize(w,56);c.width=w;c.height=56;return c; }
  circleFace(x,y,scale=1){ const c=this.add.container(x,y);c.faceScale=scale;const g=this.add.graphics();g.fillStyle(COLORS.peach,1).fillCircle(0,0,72*scale);g.lineStyle(5,COLORS.ink,.85).strokeCircle(0,0,72*scale);g.fillStyle(COLORS.brown,1).fillEllipse(0,-52*scale,128*scale,58*scale);g.fillStyle(COLORS.ink,1).fillCircle(-24*scale,-6*scale,6*scale).fillCircle(24*scale,-6*scale,6*scale);g.lineStyle(4,COLORS.ink,.85).beginPath().arc(0,13*scale,24*scale,.1,Math.PI-.1).strokePath();c.add(g);return c; }
  scheduleCharacterIdle(){ if(!this.face)return; if(this._idleTimer)this._idleTimer.remove(false); const delay=Phaser.Math.Between(FEEL.character.idleMin,FEEL.character.idleMax); this._idleTimer=this.time.delayedCall(delay,()=>{if(!this.interactionLocked&&!this.roundComplete)this.idleReact(this.face);this.scheduleCharacterIdle();}); }
  idleReact(face){ const mode=Phaser.Math.Between(0,2); if(mode===0)this.tweens.add({targets:face,scaleY:.96,yoyo:true,duration:FEEL.character.blinkMs}); else if(mode===1)this.tweens.add({targets:face,angle:3,yoyo:true,duration:260,ease:'Sine.InOut'}); else this.tweens.add({targets:face,y:face.y-3,yoyo:true,duration:420,ease:'Sine.InOut'}); }
  happy(face){ telemetry('character_react',{state:'happy'});this.tweens.add({targets:face,scaleX:1.07,scaleY:1.07,yoyo:true,duration:FEEL.character.reactMs,ease:'Back.Out'});audio.success(); }
  curious(target){ telemetry('character_react',{state:'curious'});this.tweens.add({targets:target,angle:{from:-FEEL.feedback.wrongWobbleDeg,to:FEEL.feedback.wrongWobbleDeg},yoyo:true,repeat:2,duration:75,onComplete:()=>target.setAngle(0)});audio.boop(); }
  sparkle(x,y,count=8){ for(let i=0;i<count;i++){const s=this.add.text(x,y,['✦','★','✧'][i%3],{fontSize:`${18+(i%3)*4}px`,color:i%2?'#ffb703':'#ff7f6a'}).setOrigin(.5).setDepth(3000);const a=Math.PI*2*i/count+.2,d=55+Math.random()*45;this.tweens.add({targets:s,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,alpha:0,scale:1.5,duration:520,ease:'Cubic.Out',onComplete:()=>s.destroy()});} }
  checkHint(){ if(this.roundComplete||!this.hintTarget)return; const wait=FEEL.hint.delay[this.meta.round-1]; const elapsed=this.time.now-this.lastInputAt; const threshold=wait+(this.hintCountForIdle?FEEL.hint.repeatOnceAfter:0); if(this.hintCountForIdle<2&&elapsed>=threshold){this.hintCountForIdle++;this.hints++;this.score=Math.max(60,this.score-5);this.showGhostHint();telemetry('hint',{count:this.hintCountForIdle,target:this.hintTarget});this.lastInputAt=this.time.now-(wait-FEEL.hint.repeatOnceAfter);}}
  clearGhostHint(){ if(this._ghost){this._ghost.destroy();this._ghost=null;} }
  showGhostHint(){ this.clearGhostHint();const t=this.hintTarget;const c=this.add.container(t.x,t.y).setDepth(3500);const ring=this.add.circle(0,0,44,0xffd166,.12).setStrokeStyle(5,0xffd166,.9);const hand=this.add.text(-8,-8,'☝',{fontSize:'34px'}).setOrigin(.5);c.add([ring,hand]);this._ghost=c;this.tweens.add({targets:c,scale:1.35,alpha:0,duration:FEEL.hint.ghostDuration,ease:'Cubic.Out',onComplete:()=>{if(this._ghost===c)this._ghost=null;c.destroy();}}); }
  registerFailure(actionId,target){ this.failureByAction[actionId]=(this.failureByAction[actionId]||0)+1;const n=this.failureByAction[actionId]; if(n===FEEL.hint.failurePulseAt&&target)this.pulseTarget(target); if(n>=FEEL.hint.ghostAt&&target){this.hintTarget={x:target.x,y:target.y};this.showGhostHint();} }
  pulseTarget(target){ this.tweens.add({targets:target,scaleX:FEEL.snap.targetPulseScale,scaleY:FEEL.snap.targetPulseScale,yoyo:true,duration:FEEL.snap.targetPulseDuration/2,ease:'Sine.InOut'}); }
  dragify(obj,opts={}){
    const w=Math.max(FEEL.input.minHitPx,(obj.width||72)*FEEL.input.hitScale),h=Math.max(FEEL.input.minHitPx,(obj.height||72)*FEEL.input.hitScale);
    obj.setInteractive(new Phaser.Geom.Rectangle(-w/2,-h/2,w,h),Phaser.Geom.Rectangle.Contains);this.input.setDraggable(obj);obj.home={x:obj.x,y:obj.y};obj._baseScaleX=obj.scaleX;obj._baseScaleY=obj.scaleY;
    obj.on('dragstart',(p)=>{if(this.interactionLocked)return;this.markMeaningfulInput('drag_start',{id:obj.name||obj.kind||'object'});audio.pickup();obj.setDepth(1000);this.tweens.add({targets:obj,scaleX:obj._baseScaleX*FEEL.input.pickupScale,scaleY:obj._baseScaleY*FEEL.input.pickupScale,y:obj.y+FEEL.input.objectLiftY,duration:FEEL.input.pickupDuration,ease:'Cubic.Out'});opts.start?.(obj,p);});
    obj.on('drag',(p,x,y)=>{if(this.interactionLocked)return;obj.x=x;obj.y=y;opts.drag?.(obj,p);});
    obj.on('dragend',(p)=>{if(this.interactionLocked)return;opts.end?.(obj,p);if(!opts.keepDepth)obj.setDepth(10);});return obj;
  }
  wrongReturn(obj,actionId='wrong',target=null){this.errors++;if(this.errors>1)this.score=Math.max(60,this.score-2);this.registerFailure(actionId,target);audio.boop();telemetry('wrong',{actionId});this.tweens.add({targets:obj,x:obj.home?.x??obj.x,y:obj.home?.y??obj.y,scaleX:obj._baseScaleX||1,scaleY:obj._baseScaleY||1,angle:{from:-FEEL.feedback.wrongWobbleDeg,to:FEEL.feedback.wrongWobbleDeg},duration:FEEL.snap.wrongReturnDuration,ease:'Cubic.Out',onComplete:()=>obj.setAngle(0)});}
  snap(obj,x,y,cb){this.tweens.add({targets:obj,x,y,scaleX:obj._baseScaleX||1,scaleY:obj._baseScaleY||1,duration:FEEL.snap.correctDuration,ease:'Back.Out',onComplete:()=>{audio.pop();this.sparkle(x,y,5);telemetry('snap',{x:Math.round(x),y:Math.round(y)});cb?.();}});}
  addProgressDots(x,y,total){const c=this.add.container(x,y);c.dots=[];for(let i=0;i<total;i++){const d=this.add.circle(i*26,0,7,COLORS.gray,1);c.add(d);c.dots.push(d);}c.setPosition(x-(total-1)*13,y);return c;}
  setProgressDots(c,n){c.dots.forEach((d,i)=>d.setFillStyle(i<n?COLORS.green:COLORS.gray,1));}
  finish(extra={}){ if(this.roundComplete)return;this.roundComplete=true;this.interactionLocked=true;const finalScore=extra.score??this.score;telemetry('round_complete',{round:this.scene.key,score:finalScore,errors:this.errors,hints:this.hints});this.time.delayedCall(FEEL.feedback.roundClearHold,()=>{const overlay=this.add.rectangle(640,360,1280,720,0x21304a,.7).setDepth(9997).setInteractive();const card=this.add.graphics().setDepth(9998);card.fillStyle(0xffffff,1).fillRoundedRect(410,220,460,280,30);this.add.text(640,270,'ROUND COMPLETE',{fontFamily:'Arial',fontSize:'24px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5).setDepth(9999);const stars=finalScore>=90?'★★★':finalScore>=75?'★★☆':'★☆☆';this.add.text(640,335,stars,{fontSize:'52px',color:'#ffb703'}).setOrigin(.5).setDepth(9999);this.add.text(640,395,String(Math.round(finalScore)),{fontFamily:'Arial',fontSize:'34px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5).setDepth(9999);const next=this.add.text(640,455,'계속하기  ›',{fontFamily:'Arial',fontSize:'20px',fontStyle:'bold',color:'#ffffff',backgroundColor:'#5aa9e6',padding:{left:24,right:24,top:12,bottom:12}}).setOrigin(.5).setDepth(9999);this.time.delayedCall(FEEL.feedback.resultMinHold,()=>next.setInteractive({useHandCursor:true}).on('pointerup',()=>this.doneCb({score:finalScore})));}); }
  debugState(){return {key:this.scene.key,roundComplete:this.roundComplete,score:this.score,errors:this.errors,hints:this.hints,meta:this.meta};}
}

// A deformable 2D blob implemented as a spring ring. It is not a texture-scale trick: grabbed vertices
// move independently, neighbors follow, and the silhouette visibly lags/springs back.
class JellyBlob {
  constructor(scene,x,y,color=COLORS.purple){
    this.scene=scene;this.x=x;this.y=y;this.color=color;this.points=[];this.grabIndex=-1;this.vel=[];this.graphics=scene.add.graphics().setDepth(20);
    const n=FEEL.slime.pointCount;for(let i=0;i<n;i++){const a=Math.PI*2*i/n;this.points.push({x:Math.cos(a)*FEEL.slime.baseRx,y:Math.sin(a)*FEEL.slime.baseRy,bx:Math.cos(a)*FEEL.slime.baseRx,by:Math.sin(a)*FEEL.slime.baseRy});this.vel.push({x:0,y:0});}
    this.zone=scene.add.zone(x,y,FEEL.slime.baseRx*2.5,FEEL.slime.baseRy*2.8).setInteractive(new Phaser.Geom.Ellipse(0,0,FEEL.slime.baseRx*2.6,FEEL.slime.baseRy*2.9),Phaser.Geom.Ellipse.Contains).setDepth(50);
    scene.input.setDraggable(this.zone);this.zone.on('dragstart',(p)=>this.grab(p));this.zone.on('drag',(p)=>this.drag(p));this.zone.on('dragend',()=>this.release());this.draw();
  }
  setColor(c){this.color=c;this.draw();}
  nearestIndex(localX,localY){let best=0,bd=1e9;this.points.forEach((p,i)=>{const d=(p.x-localX)**2+(p.y-localY)**2;if(d<bd){bd=d;best=i;}});return best;}
  grab(p){const lx=p.x-this.x,ly=p.y-this.y;this.grabIndex=this.nearestIndex(lx,ly);audio.pickup();telemetry('slime_grab',{i:this.grabIndex});}
  drag(p){if(this.grabIndex<0)return;const lx=clamp(p.x-this.x,-FEEL.slime.baseRx-FEEL.slime.maxPointPull,FEEL.slime.baseRx+FEEL.slime.maxPointPull),ly=clamp(p.y-this.y,-FEEL.slime.baseRy-FEEL.slime.maxPointPull,FEEL.slime.baseRy+FEEL.slime.maxPointPull);const n=this.points.length;for(let k=-2;k<=2;k++){const i=(this.grabIndex+k+n)%n,w=[.25,.55,1,.55,.25][k+2];this.points[i].x=Phaser.Math.Linear(this.points[i].x,lx,w);this.points[i].y=Phaser.Math.Linear(this.points[i].y,ly,w);}this.draw();}
  release(){this.grabIndex=-1;telemetry('slime_release');}
  update(){let moving=false;for(let i=0;i<this.points.length;i++){if(i===this.grabIndex)continue;const p=this.points[i],v=this.vel[i];v.x=(v.x+(p.bx-p.x)*FEEL.slime.spring)*FEEL.slime.damping;v.y=(v.y+(p.by-p.y)*FEEL.slime.spring)*FEEL.slime.damping;p.x+=v.x;p.y+=v.y;if(Math.abs(v.x)+Math.abs(v.y)>.05)moving=true;}if(moving)this.draw();}
  draw(){const pts=this.points.map(p=>new Phaser.Geom.Point(this.x+p.x,this.y+p.y));this.graphics.clear();this.graphics.fillStyle(this.color,.94);this.graphics.lineStyle(5,COLORS.ink,.14);this.graphics.beginPath();this.graphics.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)this.graphics.lineTo(pts[i].x,pts[i].y);this.graphics.closePath();this.graphics.fillPath();this.graphics.strokePath();}
  contains(x,y){return dist(x,y,this.x,this.y)<FEEL.slime.grabRadius;}
}
