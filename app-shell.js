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
    const game=new Phaser.Game({ type:Phaser.AUTO, width:1280, height:720, parent:ref.current, backgroundColor:'#fff8ea', scene:[scene], scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH}, render:{antialias:true,pixelArt:false}, input:{activePointers:3} });
    return()=>game.destroy(true);
  },[gameId,round]);
  return React.createElement('div',{className:'phaser-wrap',ref});
}

function Home({onStart}){
  return React.createElement('main',{className:'home'},
    React.createElement('section',{className:'hero'},
      React.createElement('div',{className:'eyebrow'},'ADUGAME · WEB PRACTICE LAB'),
      React.createElement('h1',null,'만져보고, 발견하고, 완성하는 ',React.createElement('span',null,'9개의 실습')),
      React.createElement('p',null,'검증된 아동용 게임의 재미 구조를 웹 실습에 맞게 역설계한 3가지 게임 × 3라운드 데모입니다.'),
      React.createElement('div',{className:'chips'},['React shell','Phaser 3','Mouse + Touch','No Login','9 Rounds'].map(x=>React.createElement('span',{key:x},x)))
    ),
    React.createElement('section',{className:'cards'},GAMES.map(g=>React.createElement('article',{className:'game-card',key:g.id},
      React.createElement('div',{className:'game-icon'},g.icon),React.createElement('h2',null,g.title),React.createElement('p',{className:'dna'},g.dna),
      React.createElement('div',{className:'rounds'},g.rounds.map((r,i)=>React.createElement('button',{key:r,onClick:()=>onStart(g.id,i+1)},React.createElement('b',null,`R${i+1}`),React.createElement('span',null,r),React.createElement('i',null,'›'))))
    )))
  );
}

function App(){
  const [play,setPlay]=useState(null); const [scores,setScores]=useState({});
  const done=(result)=>{ if(result?.home){setPlay(null);return;} if(play){setScores(s=>({...s,[`${play.game}-${play.round}`]:result.score})); const next=play.round<3?{game:play.game,round:play.round+1}:null; setPlay(next); }};
  return React.createElement(React.Fragment,null,
    React.createElement('header',{className:'topbar'},React.createElement('div',{className:'brand',onClick:()=>setPlay(null)},React.createElement('span',{className:'brandmark'},'A'),React.createElement('strong',null,'ADUGAME')),React.createElement('div',{className:'scoreline'},Object.keys(scores).length?`완료 ${Object.keys(scores).length}/9`:'웹 가상실습 데모')),
    play?React.createElement('div',{className:'stage-shell'},React.createElement(PhaserStage,{gameId:play.game,round:play.round,onDone:done})):React.createElement(Home,{onStart:(game,round)=>setPlay({game,round})}),
    React.createElement('footer',null,'Educational web-game prototype · independent original assets & mechanics reconstruction')
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
