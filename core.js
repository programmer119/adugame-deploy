const { useEffect, useMemo, useRef, useState } = React;

const FEEL = {
  pickupScale: 1.06,
  pickupDuration: 80,
  objectLiftY: -8,
  correctSnapDuration: 160,
  wrongReturnDuration: 240,
  targetPulseScale: 1.05,
  targetPulseDuration: 420,
  correctSfxDelay: 30,
  particleDelay: 100,
  reactionDelay: 180,
  nextTaskDelay: 800,
  roundClearHold: 1200,
  minHitPx: 72,
  hitScale: 1.25,
  hintDelay: [4000, 5500, 7000],
  hintRepeatOnceAfter: 2200,
  slime: { stretchMax: 1.35, squashMin: 0.82, releaseDuration: 220, mixAngle: 900, minMixTime: 1350 },
  screwdriver: { requiredAngle: 540 },
  brush: { requiredDistance: 420 }
};

const COLORS = {
  ink: 0x24314a,
  cream: 0xfff8ea,
  sky: 0xcceeff,
  aqua: 0x7bdff2,
  mint: 0xb2f7ef,
  yellow: 0xffe66d,
  peach: 0xffb4a2,
  coral: 0xff7f6a,
  pink: 0xffc6df,
  purple: 0xb8a1ff,
  green: 0x8bd17c,
  blue: 0x5aa9e6,
  red: 0xff6b6b,
  brown: 0x9a6b43,
  white: 0xffffff,
  gray: 0xd9e1e8,
  dark: 0x2e4057
};

const GAMES = [
  { id: 1, title: '생활 실습', dna: '단계 숙달 · 친절한 성공감', icon: '🧼', rounds: ['빗질하기', '손 씻기', '식사 준비'] },
  { id: 2, title: '인터랙티브 하우스', dna: '자유 조작 · 발견의 재미', icon: '🏠', rounds: ['샌드위치 주방', '세탁실', '장난감 수리'] },
  { id: 3, title: '크래프트 스토어', dna: '주문 · 촉감 · 소유감 · 보상', icon: '🫧', rounds: ['2조건 주문', '3조건 주문', '자유 장식 주문'] }
];

function makeAudio() {
  let ctx = null;
  const ensure = () => ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)());
  const tone = (freq, dur = 0.08, type = 'sine', gain = 0.035, delay = 0) => {
    try {
      const c = ensure();
      const t = c.currentTime + delay;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur);
    } catch (_) {}
  };
  return {
    pickup(){ tone(520, .04, 'triangle', .018); },
    boop(){ tone(210, .08, 'sine', .02); },
    plop(){ tone(140, .1, 'sine', .03); tone(95, .08, 'sine', .02, .025); },
    pop(){ tone(680, .04, 'square', .015); tone(900, .05, 'triangle', .02, .03); },
    success(){ tone(523, .08, 'triangle', .025); tone(659, .09, 'triangle', .026, .06); tone(784, .12, 'triangle', .03, .12); },
    coin(){ tone(980, .05, 'square', .015); tone(1318, .08, 'triangle', .02, .05); }
  };
}

const audio = makeAudio();

function hex(c){ return '#' + c.toString(16).padStart(6,'0'); }

class BaseRound extends Phaser.Scene {
  constructor(key, meta, done){ super(key); this.meta = meta; this.doneCb = done; this.score = 100; this.errors = 0; this.hints = 0; this.lastInputAt = 0; this.hintFired = false; this.reactionIndex = 0; }
  create(){
    this.cameras.main.setBackgroundColor('#fff8ea');
    this.drawFrame();
    this.input.on('pointerdown', () => { this.lastInputAt = this.time.now; this.hintFired = false; });
    this.time.addEvent({ delay: 900, loop: true, callback: () => this.checkHint() });
    this.lastInputAt = this.time.now;
  }
  drawFrame(){
    const g = this.add.graphics();
    g.fillStyle(0xffffff, .92).fillRoundedRect(24, 20, 1232, 680, 28);
    g.lineStyle(3, COLORS.ink, .12).strokeRoundedRect(24, 20, 1232, 680, 28);
    this.add.text(54, 43, `${this.meta.gameTitle}  ·  ROUND ${this.meta.round}`, { fontFamily:'Arial, sans-serif', fontSize:'25px', fontStyle:'bold', color:'#24314a' });
    this.add.text(54, 79, this.meta.title, { fontFamily:'Arial, sans-serif', fontSize:'17px', color:'#607086' });
    this.add.text(1180, 44, '⌂', { fontSize:'28px', color:'#718096' }).setOrigin(.5).setInteractive({useHandCursor:true}).on('pointerup', () => this.doneCb({home:true}));
  }
  makeLabel(x,y,text,w=160,color=COLORS.white){
    const c=this.add.container(x,y); const g=this.add.graphics();
    g.fillStyle(color,1).fillRoundedRect(-w/2,-28,w,56,18); g.lineStyle(2,COLORS.ink,.12).strokeRoundedRect(-w/2,-28,w,56,18);
    const t=this.add.text(0,0,text,{fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5); c.add([g,t]); return c;
  }
  circleFace(x,y,scale=1){
    const c=this.add.container(x,y); const g=this.add.graphics();
    g.fillStyle(COLORS.peach,1).fillCircle(0,0,72*scale); g.lineStyle(5,COLORS.ink,.85).strokeCircle(0,0,72*scale);
    g.fillStyle(COLORS.brown,1).fillEllipse(0,-52*scale,128*scale,58*scale);
    g.fillStyle(COLORS.ink,1).fillCircle(-24*scale,-6*scale,6*scale).fillCircle(24*scale,-6*scale,6*scale);
    g.lineStyle(4,COLORS.ink,.85).beginPath().arc(0,13*scale,24*scale,0.1,Math.PI-0.1).strokePath();
    c.add(g); c.faceG=g; return c;
  }
  happy(face){
    this.tweens.add({targets:face, scaleX:1.06, scaleY:1.06, yoyo:true, duration:180, ease:'Back.Out'}); audio.success();
  }
  curious(target){ this.tweens.add({targets:target, angle:{from:-3,to:3}, yoyo:true, repeat:2, duration:75, onComplete:()=>target.setAngle(0)}); audio.boop(); }
  sparkle(x,y,count=8){
    for(let i=0;i<count;i++){
      const s=this.add.text(x,y,['✦','★','✧'][i%3],{fontSize:`${18+(i%3)*4}px`,color:i%2?'#ffb703':'#ff7f6a'}).setOrigin(.5);
      const a=(Math.PI*2*i/count)+.2; const d=55+Math.random()*45;
      this.tweens.add({targets:s,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,alpha:0,scale:1.5,duration:520,ease:'Cubic.Out',onComplete:()=>s.destroy()});
    }
  }
  checkHint(){
    const idx=this.meta.round-1; const wait=FEEL.hintDelay[idx];
    if(!this.hintFired && this.time.now-this.lastInputAt>=wait){ this.hintFired=true; this.hints++; this.score=Math.max(60,this.score-5); this.showHint(); }
  }
  showHint(){ if(!this.hintTarget) return; const t=this.hintTarget; const ring=this.add.circle(t.x,t.y,44,0xffd166,.12).setStrokeStyle(5,0xffd166,.9); this.tweens.add({targets:ring,scale:1.45,alpha:0,duration:900,ease:'Cubic.Out',onComplete:()=>ring.destroy()}); }
  dragify(obj, opts={}){
    obj.setInteractive(new Phaser.Geom.Rectangle(-Math.max(FEEL.minHitPx,obj.width||72)/2,-Math.max(FEEL.minHitPx,obj.height||72)/2,Math.max(FEEL.minHitPx,obj.width||72),Math.max(FEEL.minHitPx,obj.height||72)), Phaser.Geom.Rectangle.Contains);
    this.input.setDraggable(obj);
    obj.home={x:obj.x,y:obj.y};
    obj.on('dragstart',()=>{ audio.pickup(); obj.setDepth(1000); this.tweens.add({targets:obj,scale:FEEL.pickupScale,y:obj.y+FEEL.objectLiftY,duration:FEEL.pickupDuration,ease:'Cubic.Out'}); opts.start?.(obj); });
    obj.on('drag',(p,x,y)=>{ obj.x=x;obj.y=y; opts.drag?.(obj,p); });
    obj.on('dragend',(p)=>{ opts.end?.(obj,p); if(!opts.keepDepth)obj.setDepth(10); });
    return obj;
  }
  wrongReturn(obj){ this.errors++; if(this.errors>1)this.score=Math.max(60,this.score-2); audio.boop(); this.tweens.add({targets:obj,x:obj.home.x,y:obj.home.y,scale:1,angle:{from:-3,to:3},duration:FEEL.wrongReturnDuration,ease:'Cubic.Out',onComplete:()=>obj.setAngle(0)}); }
  snap(obj,x,y,cb){ this.tweens.add({targets:obj,x,y,scale:1,duration:FEEL.correctSnapDuration,ease:'Back.Out',onComplete:()=>{ audio.pop(); this.sparkle(x,y,5); cb?.(); }}); }
  finish(extra={}){
    this.time.delayedCall(FEEL.roundClearHold,()=>{
      const overlay=this.add.rectangle(640,360,1280,720,0x21304a,.7).setDepth(9997).setInteractive();
      const card=this.add.graphics().setDepth(9998); card.fillStyle(0xffffff,1).fillRoundedRect(410,220,460,280,30);
      this.add.text(640,270,'ROUND COMPLETE',{fontFamily:'Arial',fontSize:'24px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5).setDepth(9999);
      const finalScore=extra.score ?? this.score;
      const stars=finalScore>=90?'★★★':finalScore>=75?'★★☆':'★☆☆';
      this.add.text(640,335,stars,{fontSize:'52px',color:'#ffb703'}).setOrigin(.5).setDepth(9999);
      this.add.text(640,395,String(Math.round(finalScore)),{fontFamily:'Arial',fontSize:'34px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5).setDepth(9999);
      const next=this.add.text(640,455,'계속하기  ›',{fontFamily:'Arial',fontSize:'20px',fontStyle:'bold',color:'#ffffff',backgroundColor:'#5aa9e6',padding:{left:24,right:24,top:12,bottom:12}}).setOrigin(.5).setDepth(9999).setInteractive({useHandCursor:true});
      next.on('pointerup',()=>this.doneCb({score:finalScore}));
    });
  }
}
