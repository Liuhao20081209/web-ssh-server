const http=require('http'),{Server}=require('ws'),{Client}=require('ssh2');
const SH=process.env.SSH_HOST||'127.0.0.1',SP=+process.env.SSH_PORT||2222,
SU=process.env.SSH_USER||'root',SPw=process.env.SSH_PASS||'root',WPt=+process.env.WEB_PORT||8080;
const MAXC=3,ipM=new Map();
const IP=r=>(r.headers['x-forwarded-for']||'').split(',')[0].trim()||r.socket.remoteAddress||'?';

const HTML=`<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,interactive-widget=resizes-content">
<title>Terminal</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.min.css">
<style>
*{box-sizing:border-box}html,body{margin:0;height:100%;font-family:sans-serif;overflow:hidden}
body.dark{--bg:#0a0f1c;--p:#0d1424;--bd:#1e293b;--tx:#94a3b8;--tx2:#e2e8f0;--kb:#111827;--kh:#1e293b;--ac:#38bdf8}
body.light{--bg:#f1f5f9;--p:#fff;--bd:#cbd5e1;--tx:#475569;--tx2:#0f172a;--kb:#e2e8f0;--kh:#cbd5e1;--ac:#0284c7}
body{background:var(--bg);color:var(--tx)}
#a{display:flex;flex-direction:column;height:100%}
#h{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--p);border-bottom:1px solid var(--bd);font-size:12px;flex-shrink:0}
.d{width:7px;height:7px;border-radius:50%;background:#22c55e}
.t{font-weight:600;color:var(--tx2);font-size:12.5px}.sp{flex:1}
.s{color:var(--tx);font-size:11.5px}.s b{color:var(--ac)}
.b{background:var(--kb);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:4px;text-decoration:none}
.b:hover{background:var(--kh);color:var(--tx2)}.b svg{width:14px;height:14px;fill:currentColor}
#u{display:flex;gap:12px;padding:5px 12px;background:var(--p);border-bottom:1px solid var(--bd);font-size:11px;flex-shrink:0}
#u b{color:var(--tx2)}
#tc{flex:1;padding:8px;overflow:hidden;min-height:0}
#term{height:100%;border-radius:8px;overflow:hidden;border:1px solid var(--bd)}
.xterm{padding:8px}
#b{padding:5px 8px 8px;user-select:none;flex-shrink:0}
.r{display:flex;gap:5px;margin-bottom:5px}.r:last-child{margin-bottom:0}
.k{flex:1;display:flex;align-items:center;justify-content:center;padding:8px 0;background:var(--kb);color:var(--tx);border:1px solid var(--bd);border-radius:6px;font-size:11.5px;font-weight:600;cursor:pointer}
.k:hover{background:var(--kh);color:var(--tx2)}.k.on{background:var(--ac)!important;border-color:var(--ac)!important;color:#fff!important}
#b.hide{display:none}
</style></head><body class="light">
<div id="a"><div id="h"><div class="d"></div><div class="t">网页终端</div><div class="sp"></div>
<div class="s">主机: <b>${SH}:${SP}</b></div>
<button class="b" id="tb" onclick="th()">深色</button>
<a class="b" href="https://github.com/Liuhao20081209/web-ssh-server" target="_blank" rel="noopener"><svg viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>GitHub</a>
</div>
<div id="u"><span id="os">操作系统: 加载中...</span><span id="ar">架构: 加载中...</span>
<span>连接状态: <b id="ws">连接中...</b></span></div>
<div id="tc"><div id="term"></div></div>
<div id="b">
<div class="r"><div class="k" onclick="k('\\x1b')">ESC</div><div class="k" onclick="k('/')">/</div><div class="k" onclick="k('-')">-</div>
<div class="k" onclick="k('\\x1b[H')">HOME</div><div class="k" onclick="k('\\x1b[A')">↑</div>
<div class="k" onclick="k('\\x1b[F')">END</div><div class="k" onclick="k('\\x1b[5~')">PGUP</div></div>
<div class="r"><div class="k" onclick="k('\\x7f')">⌫</div><div class="k" onclick="k('\\t')">TAB</div>
<div class="k" id="ck" onclick="m('c')">CTRL</div><div class="k" id="ak" onclick="m('a')">ALT</div>
<div class="k" onclick="k('\\x1b[D')">←</div><div class="k" onclick="k('\\x1b[B')">↓</div>
<div class="k" onclick="k('\\x1b[C')">→</div><div class="k" onclick="k('\\x1b[6~')">PGDN</div></div>
</div></div>
<script src="https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.min.js"></script>
<script>
const A=document.getElementById('a'),B=document.getElementById('b'),V=visualViewport,
oE=document.getElementById('os'),aE=document.getElementById('ar'),wE=document.getElementById('ws'),
C=document.getElementById('ck'),K=document.getElementById('ak');
let T,F,W,c=0,a=0;
function rs(){const h=V?V.height:innerHeight;A.style.height=h+'px';if(F)setTimeout(()=>F.fit(),60)}
addEventListener('resize',rs);
if(V){V.addEventListener('resize',()=>{B.classList.toggle('hide',innerHeight-V.height>150);rs()});V.addEventListener('scroll',rs)}
function th(){const b=document.body,t=document.getElementById('tb');
  if(b.classList.contains('dark')){b.classList.replace('dark','light');t.textContent='深色';
    T.options.theme={background:'#fff',foreground:'#0f172a',cursor:'#0284c7',selectionBackground:'#cbd5e1'}}
  else{b.classList.replace('light','dark');t.textContent='浅色';
    T.options.theme={background:'#0a0f1c',foreground:'#e2e8f0',cursor:'#38bdf8',selectionBackground:'#1e293b'}}}
function m(n){if(n==='c'){c=!c;C.classList.toggle('on',!!c)}else{a=!a;K.classList.toggle('on',!!a)}}
function cm(d){if(c&&d.length===1){d=String.fromCharCode(d.charCodeAt(0)&31);c=0;C.classList.remove('on')}
  if(a&&d.length===1){d='\\x1b'+d;a=0;K.classList.remove('on')}return d}
function k(x){if(W&&W.readyState===1){W.send(JSON.stringify({type:'data',data:cm(x)}));T.focus()}}
function st(){T=new Terminal({fontFamily:'Menlo,monospace',fontSize:13,cursorBlink:true,
  theme:{background:'#fff',foreground:'#0f172a',cursor:'#0284c7',selectionBackground:'#cbd5e1'}});
  F=new FitAddon.FitAddon();T.loadAddon(F);T.open(document.getElementById('term'));F.fit();
  wE.textContent='已连接';wE.style.color='#4ade80';
  T.onData(d=>{if(W&&W.readyState===1)W.send(JSON.stringify({type:'data',data:cm(d)}))});rs()}
W=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host);
W.onopen=()=>st();
W.onmessage=v=>{let m;try{m=JSON.parse(v.data)}catch{return}
  if(m.type==='sysinfo'){oE.textContent='操作系统: '+m.os+' '+m.kernel;aE.textContent='架构: '+m.arch}
  else if(m.type==='data'){if(T)T.write(m.data)}};
W.onclose=()=>{wE.textContent='断开';wE.style.color='#f87171'};
</script></body></html>`;

const srv=http.createServer((q,r)=>{const ip=IP(q),n=Date.now();
  if(!ipM.has(ip))ipM.set(ip,[]);
  const a=ipM.get(ip).filter(t=>n-t<1000);
  if(a.length>=20){r.writeHead(429);return r.end('Too Many')}
  a.push(n);ipM.set(ip,a);
  r.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});r.end(HTML)});
const wss=new Server({server:srv});
wss.on('connection',(ws,req)=>{
  const ip=IP(req),key=ip+':ws',cur=ipM.get(key)||0;
  if(cur>=MAXC)return ws.close();
  ipM.set(key,cur+1);
  let sc=null,sh=null;
  const c=new Client();
  c.on('ready',()=>{
    c.exec('uname -s; uname -r; uname -m',(e,s)=>{if(e)return;let b='';s.on('data',d=>b+=d);
      s.on('end',()=>{const l=b.trim().split('\n');
        ws.send(JSON.stringify({type:'sysinfo',os:l[0]||'',kernel:l[1]||'',arch:l[2]||''}))})});
    c.shell((e,s)=>{if(e)return ws.close();sh=s;
      s.on('data',d=>ws.send(JSON.stringify({type:'data',data:d.toString()})));
      s.on('close',()=>ws.close())})
  }).on('error',()=>ws.close())
  .connect({host:SH,port:SP,username:SU,password:SPw});
  ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch{return}
    if(m.type==='data'&&sh)sh.write(m.data)});
  ws.on('close',()=>{const c2=ipM.get(key);if(c2)ipM.set(key,Math.max(0,c2-1));
    if(sh)sh.end();if(sc)sc.end();c.end()})});
srv.listen(WPt,()=>console.log('http://localhost:'+WPt));