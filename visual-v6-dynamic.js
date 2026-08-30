// Dynamic scene-polish guard: changing house floors must also change the decorative room layer.
(() => {
  const redraw=scene=>{
    scene.children.list.filter(o=>o?.name==='v6_house_details'||o?.name==='v6_house_dynamic_details').forEach(o=>o.destroy?.());
    scene.children.list.filter(o=>o?.type==='Text'&&o.name==='v6_house_dynamic_label').forEach(o=>o.destroy());
    const g=scene.add.graphics().setDepth(3).setName('v6_house_dynamic_details'),f=scene.currentFloor;
    const label=(x,y,t)=>scene.add.text(x,y,t,{fontFamily:'Arial, sans-serif',fontSize:'14px',fontStyle:'bold',color:'#53657b',backgroundColor:'#ffffffcc',padding:{left:7,right:7,top:2,bottom:2}}).setOrigin(.5).setDepth(4).setName('v6_house_dynamic_label');
    if(f===0){g.fillStyle(0xf8fbfd,.9).fillRoundedRect(495,190,250,110,18);g.lineStyle(4,0xb3c2ca,.5).strokeRoundedRect(495,190,250,110,18);g.fillStyle(0x90b8c8,.28).fillRoundedRect(515,210,210,70,12);label(620,245,'작업대');}
    else if(f===1){g.fillStyle(0xd6b27d,1).fillRoundedRect(590,520,360,18,8);g.fillStyle(0xffe5a8,.62).fillEllipse(770,505,250,55);}
    else if(f===2){g.fillStyle(0x9ed9e8,.2).fillRoundedRect(175,188,230,125,16);g.fillStyle(0xffffff,.82).fillRoundedRect(185,198,210,105,14);g.fillStyle(0x83c7db,.42).fillRoundedRect(1005,185,95,225,16);}
    else{g.fillStyle(0xffffff,.8).fillRoundedRect(500,178,205,145,18);g.fillStyle(0xbce3f4,.6).fillRoundedRect(514,192,177,117,14);g.lineStyle(4,0xffffff,.8).lineBetween(602,195,602,307).lineBetween(516,250,688,250);}
    scene.v6Polish=`house-floor-${f+1}`;
  };
  if(typeof G2R1!=='undefined'){
    [G2R1,G2R2,G2R3].forEach(K=>{
      const oldCreate=K.prototype.create;K.prototype.create=function(){oldCreate.call(this);redraw(this);};
      const oldShow=K.prototype.showFloor;K.prototype.showFloor=function(f,initial=false){const r=oldShow.call(this,f,initial);this.time?.delayedCall?.(0,()=>redraw(this));return r;};
    });
  }
  window.__ADUGAME_VISUAL_V6_DYNAMIC__={loaded:true,version:'6.2.2',floorSceneFollowsState:true};
})();
