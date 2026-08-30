function roundClass(game,round,done){
  if(game===1&&round===1)return new G1R1(done); if(game===1&&round===2)return new G1R2(done); if(game===1&&round===3)return new G1R3(done);
  if(game===2&&round===1)return new G2R1(done); if(game===2&&round===2)return new G2R2(done); if(game===2&&round===3)return new G2R3(done);
  const order=round===1?{color:'blue',deco:'star'}:round===2?{color:'green',deco:'flower',container:'round'}:{color:'blue',deco:'star',freeExtra:true};
  return new CraftRound(`G3R${round}`,{gameTitle:'크래프트 스토어',round,title:['2조건 주문을 정확히 만들어요','3조건 주문을 완성해요','필수 주문 + 자유 장식으로 만들어요'][round-1]},done,order);
}

function PhaserStage({gameId,round,onDone}){
  const ref=useRef(null);
  useEffect(()=>{
    const scene=roundClass(gameId,round,onDone);
    const game=new Phaser.Game({type:Phaser.AUTO,width:FEEL.logical.width,height:FEEL.logical.height,parent:ref.current,backgroundColor:'#eef8ff',scene:[scene],scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true,pixelArt:false},input:{activePointers:3}});
    window.__ADUGAME_GAME__=game;
    window.__ADUGAME_SCENE__=()=>game.scene.getScenes(true)[0]||game.scene.getScenes(false)[0];
    window.__ADUGAME_DEBUG__=()=>window.__ADUGAME_SCENE__()?.debugState?.()||null;
    return()=>{if(window.__ADUGAME_GAME__===game){delete window.__ADUGAME_GAME__;delete window.__ADUGAME_SCENE__;delete window.__ADUGAME_DEBUG__;}game.destroy(true);};
  },[gameId,round]);
  return React.createElement('div',{className:'phaser-wrap',ref});
}

function Home({onStart}){
  return React.createElement('main',{className:'home'},
    React.createElement('section',{className:'hero'},
      React.createElement('div',{className:'eyebrow'},'ADUGAME · WEB PRACTICE LAB'),
      React.createElement('h1',null,'만져보고, 발견하고, 완성하는 ',React.createElement('span',null,'9개의 실습')),
      React.createElement('p',null,'생활 도구를 직접 움직이고 반응을 확인하며 익히는 3가지 게임 × 3라운드 가상실습입니다.'),
      React.createElement('div',{className:'chips'},['React shell','Phaser 3','Mouse + Touch','No Login','9 Rounds','Browser E2E'].map(x=>React.createElement('span',{key:x},x)))
    ),
    React.createElement('section',{className:'cards'},GAMES.map(g=>React.createElement('article',{className:'game-card',key:g.id},
      React.createElement('div',{className:'game-icon'},g.icon),React.createElement('h2',null,g.title),React.createElement('p',{className:'dna'},g.dna),
      React.createElement('div',{className:'rounds'},g.rounds.map((r,i)=>React.createElement('button',{key:r,onClick:()=>onStart(g.id,i+1)},React.createElement('b',null,`R${i+1}`),React.createElement('span',null,r),React.createElement('i',null,'›'))))
    )))
  );
}

function initialPlayFromQuery(){const p=new URLSearchParams(location.search),g=Number(p.get('game')),r=Number(p.get('round'));return g>=1&&g<=3&&r>=1&&r<=3?{game:g,round:r}:null;}

function App(){
  const [play,setPlay]=useState(initialPlayFromQuery);const [scores,setScores]=useState({});
  useEffect(()=>{window.__ADUGAME_APP_STATE__=()=>({play,scores});},[play,scores]);
  const done=(result)=>{if(result?.home){setPlay(null);return;}if(play){setScores(s=>({...s,[`${play.game}-${play.round}`]:result.score}));const e2e=new URLSearchParams(location.search).get('e2e')==='1';if(e2e){window.__ADUGAME_LAST_RESULT__={game:play.game,round:play.round,...result};return;}const next=play.round<3?{game:play.game,round:play.round+1}:null;setPlay(next);}};
  return React.createElement(React.Fragment,null,
    React.createElement('header',{className:`topbar${play?' playing':''}`},React.createElement('div',{className:'brand',onClick:()=>setPlay(null)},React.createElement('span',{className:'brandmark'},'A'),React.createElement('strong',null,'ADUGAME')),React.createElement('div',{className:'scoreline'},Object.keys(scores).length?`완료 ${Object.keys(scores).length}/9`:'웹 가상실습 데모')),
    play?React.createElement('div',{className:'stage-shell'},
      React.createElement('div',{className:'rotate-note'},React.createElement('b',null,'↻  가로 화면으로 돌려주세요'),React.createElement('span',null,'도구와 안내를 크게 보고 정확하게 조작할 수 있어요')),
      React.createElement(PhaserStage,{gameId:play.game,round:play.round,onDone:done})
    ):React.createElement(Home,{onStart:(game,round)=>setPlay({game,round})}),
    !play&&React.createElement('footer',null,'ADUGAME · 초등 실과 웹 가상실습')
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
