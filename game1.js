class G1R1 extends BaseRound {
  constructor(done){ super('G1R1',{gameTitle:'생활 실습',round:1,title:'빗으로 머리를 정돈해요'},done); }
  create(){ super.create();
    const face=this.circleFace(730,330,1.25); this.hintTarget={x:330,y:410};
    const hair=this.add.graphics(); hair.setPosition(730,255); hair.setDepth(3); this.hair=hair; this.progress=0; this.drawHair();
    const comb=this.add.container(330,410); const g=this.add.graphics(); g.fillStyle(COLORS.purple,1).fillRoundedRect(-62,-16,124,32,12); for(let i=-48;i<50;i+=14)g.fillStyle(COLORS.ink,.8).fillRect(i,13,4,34); comb.add(g); comb.setSize(140,80); comb.width=140; comb.height=80;
    this.makeLabel(330,505,'빗을 머리 위에서 좌우로 움직여요',310,COLORS.mint);
    let last=null, total=0;
    this.dragify(comb,{drag:(o,p)=>{
      if(Phaser.Math.Distance.Between(o.x,o.y,730,280)<135){ if(last){ total+=Phaser.Math.Distance.Between(last.x,last.y,o.x,o.y); this.progress=Math.min(1,total/FEEL.brush.requiredDistance); this.drawHair(); } last={x:o.x,y:o.y}; }
      else last=null;
    },end:(o)=>{ if(this.progress>=1){ this.snap(o,615,470,()=>{ this.happy(face); this.sparkle(730,250,9); this.finish(); }); } else this.wrongReturn(o); }});
    this.tweens.add({targets:comb,scale:1.08,yoyo:true,duration:350,ease:'Sine.InOut',delay:700});
  }
  drawHair(){ const g=this.hair; g.clear(); const messy=1-this.progress; g.lineStyle(10,COLORS.brown,1); for(let i=-65;i<=65;i+=18){ const wob=(i%36===0?1:-1)*22*messy; g.beginPath();g.moveTo(i,-22);g.lineTo(i+wob,15);g.lineTo(i-wob*.4,52);g.strokePath(); } }
}

class G1R2 extends BaseRound {
  constructor(done){ super('G1R2',{gameTitle:'생활 실습',round:2,title:'손 씻기 순서를 직접 완성해요'},done); }
  create(){ super.create(); this.step=0; this.face=this.circleFace(910,290,.8); this.hands=this.add.container(660,410); const hg=this.add.graphics(); hg.fillStyle(COLORS.peach,1).fillRoundedRect(-95,-45,85,90,34).fillRoundedRect(10,-45,85,90,34); this.hands.add(hg);
    this.status=this.add.text(660,525,'물을 먼저 틀어볼까요?',{fontFamily:'Arial',fontSize:'20px',fontStyle:'bold',color:'#607086'}).setOrigin(.5);
    const faucet=this.tool(250,250,'🚰','물'); faucet.setInteractive({useHandCursor:true}).on('pointerup',()=>this.action('water',faucet));
    const soap=this.tool(250,390,'🧼','비누'); this.dragify(soap,{end:o=>this.dropTool('soap',o)});
    const towel=this.tool(250,530,'🧻','수건'); this.dragify(towel,{end:o=>this.dropTool('towel',o)});
    this.hintTarget={x:250,y:250};
    this.hands.setInteractive(new Phaser.Geom.Rectangle(-110,-60,220,120),Phaser.Geom.Rectangle.Contains); this.hands.on('pointermove',p=>{ if(p.isDown && this.step===2){ this.scrub=(this.scrub||0)+Math.abs(p.velocity.x)+Math.abs(p.velocity.y); if(this.scrub>420)this.action('scrub',this.hands); }});
  }
  tool(x,y,emoji,label){ const c=this.add.container(x,y); const g=this.add.graphics(); g.fillStyle(0xffffff,1).fillRoundedRect(-70,-48,140,96,22);g.lineStyle(2,COLORS.ink,.14).strokeRoundedRect(-70,-48,140,96,22); const e=this.add.text(0,-8,emoji,{fontSize:'40px'}).setOrigin(.5); const t=this.add.text(0,30,label,{fontFamily:'Arial',fontSize:'15px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5);c.add([g,e,t]); c.setSize(140,96); c.width=140;c.height=96; return c; }
  dropTool(type,o){ if(Phaser.Math.Distance.Between(o.x,o.y,660,410)<150){ this.action(type,o); if(type!=='towel')this.tweens.add({targets:o,x:o.home.x,y:o.home.y,scale:1,duration:180}); } else this.wrongReturn(o); }
  action(type,obj){ const expected=['water','soap','scrub','water','towel'][this.step]; if(type!==expected){ this.curious(obj); if(obj.home)this.wrongReturn(obj); return; }
    this.step++; const texts=['손이 젖었어요','거품을 묻혔어요','손가락 사이까지 문질렀어요','깨끗하게 헹궜어요','완벽하게 마무리했어요']; this.status.setText(texts[this.step-1]); this.sparkle(660,410,4);
    if(type==='water'){ const drops=[]; for(let i=0;i<8;i++){ const d=this.add.circle(570+i*24,340,5,COLORS.aqua,.9); drops.push(d); this.tweens.add({targets:d,y:430,alpha:0,duration:450,delay:i*20,onComplete:()=>d.destroy()}); }}
    if(type==='soap') this.add.text(660,390,'○  ○   ○',{fontSize:'28px',color:'#7bdff2'}).setOrigin(.5);
    if(this.step===2)this.status.setText('손을 좌우로 문질러 거품을 내요');
    if(this.step===5){ this.happy(this.face); this.finish(); }
    else { const hints=[{x:250,y:390},{x:660,y:410},{x:250,y:250},{x:250,y:530}]; this.hintTarget=hints[this.step-1]||this.hintTarget; }
  }
}

class G1R3 extends BaseRound {
  constructor(done){ super('G1R3',{gameTitle:'생활 실습',round:3,title:'식사 전 준비를 순서대로 완성해요'},done); }
  create(){ super.create(); this.step=0; this.face=this.circleFace(1030,300,.75); this.table=this.add.graphics().fillStyle(0xd6a56e,1).fillRoundedRect(420,340,500,210,24); this.table.setDepth(0); this.msg=this.add.text(670,590,'배운 순서를 떠올려 직접 준비해보세요',{fontFamily:'Arial',fontSize:'18px',color:'#607086'}).setOrigin(.5);
    const specs=[['🧼','손 씻기',260,205],['🧽','테이블 닦기',260,310],['🍽️','접시 놓기',260,415],['🥪','음식 준비',260,520],['🗑️','정리',1040,500]];
    this.items=specs.map((s,i)=>{ const c=this.makeItem(s[2],s[3],s[0],s[1]); this.dragify(c,{end:o=>this.tryStep(i,o)}); return c;}); this.hintTarget={x:260,y:205};
  }
  makeItem(x,y,emoji,label){ const c=this.add.container(x,y); const g=this.add.graphics();g.fillStyle(0xffffff,1).fillRoundedRect(-75,-40,150,80,18);g.lineStyle(2,COLORS.ink,.12).strokeRoundedRect(-75,-40,150,80,18);const e=this.add.text(-42,0,emoji,{fontSize:'32px'}).setOrigin(.5);const t=this.add.text(18,0,label,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5);c.add([g,e,t]);c.setSize(150,80);c.width=150;c.height=80;return c; }
  tryStep(idx,o){ if(idx!==this.step){this.wrongReturn(o);return;} const spots=[[500,430],[610,430],[720,430],[830,430],[940,520]]; this.snap(o,spots[idx][0],spots[idx][1],()=>{this.step++;this.score=Math.max(60,this.score);this.sparkle(o.x,o.y,4); if(this.step===5){this.happy(this.face);this.finish();} else {this.hintTarget={x:this.items[this.step].home.x,y:this.items[this.step].home.y};}}); }
}
