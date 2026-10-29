/* 哪都通 · 异人论坛 应用逻辑
   由原 index.html 内联脚本提取。 */


/* ==================================================================
   哪都通 · 双面网站（明面快递 / 暗面异人内网）
   纯本地数据：localStorage，无后端，可直接部署 Netlify
   ================================================================== */

/* ---------- 工具函数 ---------- */
const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const genId=(p='id')=>p+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function nowStr(){const d=new Date();const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;}
function relTime(t){if(!t)return'';const d=new Date(String(t).replace(' ','T'));if(Number.isNaN(d.getTime()))return String(t);const diff=(Date.now()-d.getTime())/1000;if(diff<60)return'刚刚';if(diff<3600)return Math.floor(diff/60)+'分钟前';if(diff<86400)return Math.floor(diff/3600)+'小时前';if(diff<2592000)return Math.floor(diff/86400)+'天前';if(diff<31536000)return Math.floor(diff/2592000)+'个月前';return Math.floor(diff/31536000)+'年前';}
function toast(msg,type=''){const w=$('#toast');const el=document.createElement('div');el.className='toast '+(type?'t-'+type:'');el.textContent=msg;w.appendChild(el);setTimeout(()=>{el.style.opacity='0';el.style.transition='.3s';setTimeout(()=>el.remove(),300)},2400);}
function modal(html){return new Promise(resolve=>{const mask=document.createElement('div');mask.className='modal-mask';mask.innerHTML=`<div class="modal">${html}</div>`;document.body.appendChild(mask);mask._close=v=>{if(mask.dataset.closing==='1')return;mask.dataset.closing='1';resolve(v);setTimeout(()=>mask.remove(),0)};mask.addEventListener('click',e=>{if(e.target===mask)mask._close(null);});});}
function confirmDlg(title,body){return modal(`<h3>${esc(title)}</h3><div class="m-body">${esc(body)}</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">确定</button></div>`).then(v=>v==='yes');}
function avText(name){return (name||'?').slice(0,1).toUpperCase();}
function avHtml(user,cls=''){if(user&&user.avatar&&user.avatar.startsWith('http'))return `<img class="${cls}" src="${esc(user.avatar)}" alt="">`;return `<span class="${cls}">${esc(avText(user?user.name:'?'))}</span>`;}

/* 新建一个独立聊天室 */
function makeRoom(name){return {id:genId('room'),name,members:[],messages:[],mode:'create',speed:'natural',proactive:true};}

/* ---------- 本地数据库 ---------- */
const DB_KEY='ndt_db_v1';
/* 存储适配：IndexedDB（大容量，可存数百 MB）+ localStorage 兜底 */
const Store={
  idb:null,
  // 串行化 IndexedDB 写入，避免连续保存时较早的快照最后才落盘。
  _writeQueue:Promise.resolve(),
  open(){return new Promise(res=>{
    try{
      if(typeof indexedDB==='undefined'){this.idb=null;res();return;}
      const r=indexedDB.open('ndt_store',1);
      r.onupgradeneeded=()=>{try{if(!r.result.objectStoreNames.contains('kv'))r.result.createObjectStore('kv');}catch(e){}};
      r.onsuccess=()=>{this.idb=r.result;res();};
      r.onerror=()=>{this.idb=null;res();};
      r.onblocked=()=>{this.idb=null;res();};
    }catch(e){this.idb=null;res();}
  });},
  async set(k,v){
    let localOK=false,idbOK=false;
    try{localStorage.setItem(k,v);localOK=true;}catch(e){}
    if(this.idb){
      const write=()=>new Promise((resolve,reject)=>{
        let tx;
        try{tx=this.idb.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);}
        catch(e){reject(e);return;}
        tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||new Error('IndexedDB 写入失败'));tx.onabort=()=>reject(tx.error||new Error('IndexedDB 写入中止'));
      });
      const pending=this._writeQueue.then(write);
      this._writeQueue=pending.catch(()=>{});
      try{await pending;idbOK=true;}catch(e){}
    }
    return localOK||idbOK;
  },
  async get(k){
    if(this.idb){
      try{const value=await new Promise((resolve,reject)=>{const tx=this.idb.transaction('kv','readonly');const rq=tx.objectStore('kv').get(k);rq.onsuccess=()=>resolve(rq.result);rq.onerror=()=>reject(rq.error);});if(value!=null)return value;}catch(e){}
    }
    try{return localStorage.getItem(k);}catch(e){return null;}
  }
};
const DB={
  data:null,
  async load(){
    const raw=await Store.get(DB_KEY);
    if(raw){
      try{this.data=JSON.parse(raw);}
      catch(e){
        // 解析失败时先尽力备份原始内容，再初始化；避免损坏数据被静默覆盖。
        try{await Store.set(DB_KEY+'_corrupt_backup_'+Date.now(),String(raw));}catch(_e){}
        this.data=null;
        toast('本地数据读取异常：已尝试备份损坏数据，并载入初始数据。请检查后尽快导出数据。','warn');
      }
    }
    if(!this.data)this.data=seedDB();
    this.migrate();
    await this.persist();
  },
  migrate(){
    const d=this.data;
    if(d.theme==='night'||d.theme==='terminal')d.theme=d.theme==='night'?'default':'cyber';
    if(!d.proactiveSessionToken)d.proactiveSessionToken=genId('login');
    if(!d.chats)d.chats={};
    if(!Array.isArray(d.posts))d.posts=[];
    if(!Array.isArray(d.answers))d.answers=[];
    if(!Array.isArray(d.forumNotices))d.forumNotices=[];
    // 将旧版内置示例帖子升级为新的管理员事件帖；只识别固定种子 ID，不动用户自建帖子。
    const legacySeedIds=new Set(['p-1','p-2','p-3','p-4','p-5','p-6','p-7','p-8','p-9']);
    const legacySeedAuthors=new Set(['徐三','徐四','诸葛青','张楚岚','王也','冯宝宝','张灵玉','论坛管理员']);
    const hasLegacySeed=d.posts.some(p=>legacySeedIds.has(p?.id)&&legacySeedAuthors.has(p?.authorName||'')) && !d.posts.some(p=>p?.id==='p-20');
    if(hasLegacySeed){
      const fresh=seedDB();
      d.posts=d.posts.filter(p=>!legacySeedIds.has(p?.id)).concat(fresh.posts);
      d.answers=d.answers.filter(a=>!legacySeedIds.has(a?.postId));
      d.answers.push(...fresh.answers);
    } else {
      // 清理旧版 p-21 至 p-28 的主角八卦种子帖，并迁移为两条不涉及主角的普通异人热帖。
      const oldGossipIds=new Set(Array.from({length:8},(_,i)=>`p-${21+i}`));
      const oldGossipAuthors=new Set(['吃瓜不嫌事大','龙虎山游客转异人','山门口卖茶的','匿名路过的道门弟子','武当山脚下的包子铺','术数爱好者小青','今天也没转正','算盘成精的散修']);
      const removedIds=new Set(d.posts.filter(p=>oldGossipIds.has(p?.id)&&oldGossipAuthors.has(p?.authorName||'')).map(p=>p.id));
      if(removedIds.size){
        d.posts=d.posts.filter(p=>!removedIds.has(p?.id));
        d.answers=d.answers.filter(a=>!removedIds.has(a?.postId));
      }
      const fresh=seedDB();
      const newSeedIds=new Set(['p-29','p-30']);
      const missingPosts=fresh.posts.filter(p=>newSeedIds.has(p.id)&&!d.posts.some(old=>old?.id===p.id));
      if(missingPosts.length){
        d.posts.push(...missingPosts);
        const missingIds=new Set(missingPosts.map(p=>p.id));
        d.answers.push(...fresh.answers.filter(a=>missingIds.has(a.postId)&&!d.answers.some(old=>old?.id===a.id)));
      }
      // 对已经升级到 20 条初始帖子、但还没有内置回复的本地数据补齐回复；不覆盖用户自己的回复。
      const seedPostIds=new Set(Array.from({length:20},(_,i)=>`p-${i+1}`));
      const hasAllSeedPosts=Array.from(seedPostIds).every(id=>d.posts.some(p=>p?.id===id));
      const hasSeedAnswers=d.answers.some(a=>String(a?.id||'').startsWith('seed-a-p-'));
      if(hasAllSeedPosts&&!hasSeedAnswers){
        d.answers.push(...fresh.answers.filter(a=>!newSeedIds.has(a.postId)));
      }
    }
    if(!Array.isArray(d.users))d.users=[];
    if(!Array.isArray(d.packages))d.packages=[];
    if(!Array.isArray(d.boards))d.boards=['公告','异人讨论','功法交流','天下见闻','求助','灌水'];
    if(!Array.isArray(d.archives))d.archives=[];
    if(!Array.isArray(d.events))d.events=[];
    if(!Array.isArray(d.library))d.library=[];
    if(!Array.isArray(d.publicLibrary))d.publicLibrary=[
      {id:'pub-1',cat:'势力与流派',title:'龙虎山天师府',summary:'正一道重要传承之一，异人界常以符箓、雷法等形象呈现。',content:`【条目概览】龙虎山天师府与正一传统关系密切。在《一人之下》的世界观中，天师府是重要门派，重视传承、戒律与个人修为。
【常见关键词】天师、符箓、雷法、罗天大醮。
【档案备注】本条收录门派源流、常见术法与异人界往来记录；人物经历、能力与事件可继续通过内部档案交叉查证。`,tags:'龙虎山,天师府,正一,门派'},
      {id:'pub-2',cat:'势力与流派',title:'武当山与内家修习',summary:'与道教文化、内丹思想及传统武术传承联系密切。',content:`【条目概览】武当山是中国著名道教圣地之一，也与传统武术文化紧密相关。不同历史时期的修习、宗派和武术传承各有脉络，不宜简单视为单一体系。
【异人界索引】武当传承重视清静修持与内家功法，异人门人修行路数各有差异，具体人物与术法以本库档案为准。`,tags:'武当,道教,武术,流派'},
      {id:'pub-3',cat:'势力与流派',title:'全性',summary:'异人界中的传统组织，成员来历复杂，行事风格各有差异。',content:`【条目概览】全性为异人界长期活动的组织，成员来历、立场与行事方式各不相同，宜结合人物经历与事件档案判断。
【检索提示】阅读相关人物档案时，可结合人物经历、师承、事件记录交叉理解，避免只凭单一标签判断人物。`,tags:'全性,异人组织,人物关系'},
      {id:'pub-4',cat:'人物志',title:'无根生',summary:'与甲申之乱及八奇技起源线索相关的重要人物。',content:`【人物概览】无根生是《一人之下》世界观中的关键人物，其经历与甲申之乱、三十六贼及八奇技的来历存在重要关联。
【阅读方向】建议结合甲申之乱、三十六贼、八奇技等条目阅读；涉及未揭晓内容时，以原作已公开信息为准。`,tags:'无根生,甲申之乱,八奇技,人物'},
      {id:'pub-5',cat:'文献与民俗',title:'道教典籍索引：道德经',summary:'道家思想经典，常被用于理解中国传统思想文化。',content:`【文献简介】《道德经》是中国古代重要思想典籍，围绕“道”“德”、治理、处世与自然观展开。它属于思想文献，不是异人术法操作手册。
【阅读关键词】道、自然、无为、柔弱。
【世界观关联】可作为角色背景、门派理念与台词创作的文化参考。`,tags:'道教文化,道德经,典籍,思想'},
      {id:'pub-6',cat:'文献与民俗',title:'佛教基础索引：因果、慈悲与戒律',summary:'用于了解佛教基本观念的入门索引。',content:`【条目简介】佛教内部传统丰富，因果、慈悲、戒律、缘起等概念在不同宗派和文献中的阐释各有侧重。
【阅读提示】不要将佛教、道教与民间信仰混为一谈；若用于角色设定，可注明具体传统、地域与时代背景。`,tags:'佛教,因果,慈悲,戒律'},
      {id:'pub-7',cat:'文献与民俗',title:'民间信仰与“出马仙”文化',summary:'东北部分地区民间信仰与地方叙事中的相关称谓。',content:`【条目简介】“出马仙”通常出现在东北地区部分民间信仰与民俗叙事中，涉及地方仪式、口述传统及对仙家等观念的理解。不同家庭、地区和讲述者之间差异很大。
【记录原则】将其作为民俗与民间信仰条目介绍，不把不同地域实践概括成统一教派，也不将传说内容当作经科学验证的事实。
【关联线索】可结合地方传闻、家族口述、仪式记录与人物背景互相印证；不同地区的讲述往往存在差异。`,tags:'出马仙,东北民俗,民间信仰,口述传统'},
      {id:'pub-8',cat:'文献与民俗',title:'异人界名词索引：炁、术、法器',summary:'异人界常用概念的交叉索引，涵盖修行、术法与法器。',content:`【炁】异人修行与运转术法所涉及的核心概念，具体理解因传承而异。
【术】异人施展能力的方式，常与师承、修习路径及个人悟性有关。
【法器】在故事中承载特殊功能的器物。
【归档说明】本词条汇总异人界常用称谓，细节可由各门派谱系与已结案事件进一步补充。`,tags:'炁,术法,法器,设定索引'}
    ];
    // 旧版公开典藏条目改为内部档案口吻；仅替换已知的默认句子，不覆盖用户自定义内容。
    if(Array.isArray(d.publicLibrary)){
      const phraseMoves=[
        ['【档案备注】本条兼顾现实文化背景与作品设定；作品中的具体人物、能力和事件以原作设定为准。','【档案备注】本条收录门派源流、常见术法与异人界往来记录；人物经历、能力与事件可继续通过内部档案交叉查证。'],
        ['【异人界索引】作品中的武当门人和术法属于虚构设定，勿将其直接等同于现实宗教实践。','【异人界索引】武当传承重视清静修持与内家功法，异人门人修行路数各有差异，具体人物与术法以本库档案为准。'],
        ['【条目概览】全性是《一人之下》中的虚构异人组织，成员立场、行事方式并不完全一致。','【条目概览】全性为异人界长期活动的组织，成员来历、立场与行事方式各不相同，宜结合人物经历与事件档案判断。'],
        ['【创作参考】适合用于民俗调查笔记、地方传闻、人物背景与虚构世界观素材。','【关联线索】可结合地方传闻、家族口述、仪式记录与人物背景互相印证；不同地区的讲述往往存在差异。'],
        ['【炁】作品中用于描述异人修行与能力体系的重要概念。','【炁】异人修行与运转术法所涉及的核心概念，具体理解因传承而异。'],
        ['【术】角色施展能力的具体方式，作品中不同门派和人物有不同表达。','【术】异人施展能力的方式，常与师承、修习路径及个人悟性有关。'],
        ['【说明】以上均为作品语境下的整理词条，不等同于现实科学术语或宗教实践的统一定义。','【归档说明】本词条汇总异人界常用称谓，细节可由各门派谱系与已结案事件进一步补充。']
      ];
      d.publicLibrary.forEach(entry=>{if(!entry||typeof entry!=='object')return;phraseMoves.forEach(([from,to])=>{if(typeof entry.content==='string'&&entry.content.includes(from))entry.content=entry.content.replace(from,to);});if(entry.id==='pub-3'&&entry.summary==='作品中行事不拘常规、成员背景复杂的异人组织。')entry.summary='异人界中的传统组织，成员来历复杂，行事风格各有差异。';if(entry.id==='pub-8'&&entry.summary==='作品世界观常用概念的交叉索引。')entry.summary='异人界常用概念的交叉索引，涵盖修行、术法与法器。';});
    }
    if(!Array.isArray(d.wanted))d.wanted=[{id:'w-1',name:'夏禾',code:'ND-WANTED-007',danger:'A级',reward:'¥ 500,000',faction:'全性·四张狂',skill:'刮骨刀：操控情欲',lastSeen:'华北地区',note:'疑似参与多起异人界冲突。请勿擅自接触，发现线索立即上报哪都通。',status:'在逃'},{id:'w-2',name:'吕良',code:'ND-WANTED-009',danger:'B级',reward:'¥ 300,000',faction:'原吕家成员',skill:'明魂术',lastSeen:'行踪不明',note:'掌握记忆相关异术，具有较高情报价值。',status:'在逃'},{id:'w-3',name:'马仙洪',code:'ND-WANTED-010',danger:'S级',reward:'¥ 2,000,000',faction:'碧游村',skill:'神机百炼',lastSeen:'疑似流动',note:'涉嫌制造危险法器与修身炉，严禁个人行动。',status:'在逃'}];
    // 员工关系网采用空白画布，不预设任何人物或势力节点。
    if(!d.networks||typeof d.networks!=='object')d.networks={};
    const presetFactionIds=new Set(['fac-root','fac-north','fac-tianshi','fac-wudang','fac-quanxing','fac-tianxia','fac-biyou']);
    const presetFactionEdgeIds=new Set(['fac-e1','fac-e2','fac-e3','fac-e4','fac-e5']);
    const presetPeopleIds=new Set(['kp-root','kp-baobao','kp-ye','kp-qing','kp-lingyu','kp-zhang','kp-liujin']);
    const presetPeopleEdgeIds=new Set(['kp-e1','kp-e2','kp-e3','kp-e4','kp-e5','kp-e6']);
    for(const [key,title,presetNodes,presetEdges] of [
      ['factions','势力关系网',presetFactionIds,presetFactionEdgeIds],
      ['keyPeople','重点异人关系网',presetPeopleIds,presetPeopleEdgeIds]
    ]){
      const net=d.networks[key]&&typeof d.networks[key]==='object'?d.networks[key]:{};
      net.title=title;
      if(!Array.isArray(net.nodes))net.nodes=[];
      if(!Array.isArray(net.edges))net.edges=[];
      // 清除旧版自动预置条目，保留用户后来新建的节点和关系。
      net.nodes=net.nodes.filter(n=>n&&n.id&&!presetNodes.has(n.id));
      const remainingIds=new Set(net.nodes.map(n=>n.id));
      net.edges=net.edges.filter(e=>e&&e.id&&!presetEdges.has(e.id)&&remainingIds.has(e.from)&&remainingIds.has(e.to));
      net.rootId=null;
      net.nodes.forEach(n=>{if(n.root)delete n.root;});
      d.networks[key]=net;
    }
    // 多聊天室（最多3个，各自独立）：迁移旧单房间
    if(!Array.isArray(d.rooms)){
      if(d.room&&Array.isArray(d.room.messages)){
        d.room.name='聊天室1';d.room.mode=d.room.mode||'create';d.room.speed=d.room.speed||'natural';d.room.proactive=d.room.proactive!==false;
        d.room.id=d.room.id||genId('room');
        d.rooms=[d.room];
      }else d.rooms=[makeRoom('聊天室1')];
    }
    while(d.rooms.length<1)d.rooms.push(makeRoom('聊天室'+(d.rooms.length+1)));
    delete d.room;
    if(!d.theme)d.theme='default';
    if(!d.workgroup)d.workgroup={members:[],messages:[]};
    if(!Array.isArray(d.workgroup.members))d.workgroup.members=[];
    if(!Array.isArray(d.workgroup.messages))d.workgroup.messages=[];
    // 清理旧版本中因红包/转账提前返回而遗留的等待锁，避免主动回复永久卡住。
    const clearReplyLock=box=>{if(!box||typeof box!=='object')return;box.replyPending=false;box.queuedReply=false;};
    Object.values(d.chats).forEach(box=>{clearReplyLock(box);box.unread=Math.max(0,Number(box.unread)||0);box.readNoReply=!!box.readNoReply;if(!Array.isArray(box.messages))box.messages=[];});
    d.rooms.forEach(box=>{clearReplyLock(box);box.unread=Math.max(0,Number(box.unread)||0);box.readNoReply=!!box.readNoReply;if(!Array.isArray(box.messages))box.messages=[];});
    clearReplyLock(d.workgroup);d.workgroup.unread=Math.max(0,Number(d.workgroup.unread)||0);d.workgroup.readNoReply=!!d.workgroup.readNoReply;d.workgroup.mode=d.workgroup.mode||'card';d.workgroup.speed=d.workgroup.speed||'natural';d.workgroup.proactive=d.workgroup.proactive!==false;
    if(!Array.isArray(d.oa))d.oa=[];
    if(!d.divination)d.divination={};
    if(!d.codes)d.codes={emp:'NDT-EMP',mgr:'NDT-MGR',user:'NDT-USER'};
    if(!d.codes.user)d.codes.user='NDT-USER';
    d.users.forEach(u=>{if(!Array.isArray(u.cards))u.cards=[];if(!Array.isArray(u.rels))u.rels=[];});
    d.archives.forEach(r=>{if(!Array.isArray(r.rels))r.rels=[];});
    /* V16：论坛等级配置 / 积分规则 / 个人能力 / 积分字段 */
    if(!Array.isArray(d.forumLevels)||d.forumLevels.length<1)d.forumLevels=DEFAULT_FORUM_LEVELS.map(x=>({...x}));
    if(!d.pointsRule||typeof d.pointsRule!=='object')d.pointsRule={...DEFAULT_POINTS_RULE};
    d.users.forEach(u=>{
      if(!Number.isFinite(Number(u.points)))u.points=0;
      abilityOf(u);
    });
  },
  save(){return this.persist();},
  // 同一轮事件循环内的多次 save 合并为一次序列化/写入，减少重复 JSON.stringify。
  _persistScheduled:false,
  _persistWaiters:[],
  persist(){
    return new Promise(resolve=>{
      this._persistWaiters.push(resolve);
      if(this._persistScheduled)return;
      this._persistScheduled=true;
      Promise.resolve().then(()=>this._flushPersist());
    });
  },
  async _flushPersist(){
    this._persistScheduled=false;
    const waiters=this._persistWaiters.splice(0);
    let ok=false;
    try{
      const raw=JSON.stringify(this.data);
      ok=await Store.set(DB_KEY,raw);
      if(!ok)this._reportPersistError('本地保存失败：浏览器存储不可用或空间不足。请先导出数据，避免关闭页面后丢失修改。');
    }catch(e){
      this._reportPersistError('本地数据无法序列化或保存失败。请先导出数据，避免关闭页面后丢失修改。');
      ok=false;
    }
    waiters.forEach(resolve=>resolve(!!ok));
    // 如果写入期间又有 save 请求，确保它们也会被处理。
    if(this._persistWaiters.length&&!this._persistScheduled){
      this._persistScheduled=true;
      Promise.resolve().then(()=>this._flushPersist());
    }
  },
  _lastPersistErrorAt:0,
  _reportPersistError(message){const now=Date.now();if(now-this._lastPersistErrorAt>5000){this._lastPersistErrorAt=now;toast(message,'err');}},
  reset(){this.data=seedDB();this.migrate();return this.persist();},
  get user(){return this.data.users.find(u=>u.id===this.data.session)||null;},
  level(){const u=this.user;return u?u.level:0;}
};

/* ============================================================
   云端账号（Cloudflare Pages Functions + D1）
   - 未登录云端：所有功能走本地（离线单机，原有体验不变）
   - 登录云端后：论坛帖子 / 回复 / 点赞 / 积分走服务器，多人共享
   ============================================================ */
const Cloud={
  base:'/api',
  token:null,
  user:null,
  init(){
    try{this.token=localStorage.getItem('ndt-cloud-token')||null;}catch(e){this.token=null;}
  },
  get connected(){return !!(this.token&&this.user);},
  async request(path,opts={}){
    const headers=Object.assign({'Content-Type':'application/json'},opts.headers||{});
    if(this.token)headers.Authorization='Bearer '+this.token;
    let res;
    try{res=await fetch(this.base+path,Object.assign({headers},opts));}
    catch(e){throw new Error('无法连接云端（可能离线，或后端未部署/未绑定）');}
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data.error||('请求失败 ('+res.status+')'));
    return data;
  },
  setSession(d){
    this.token=d.token;this.user=d.user;
    try{localStorage.setItem('ndt-cloud-token',d.token);}catch(e){}
  },
  async register(login,password,name){
    this.setSession(await this.request('/auth/register',
      {method:'POST',body:JSON.stringify({login,password,name})}));
    return this.user;
  },
  async login(login,password){
    this.setSession(await this.request('/auth/login',
      {method:'POST',body:JSON.stringify({login,password})}));
    return this.user;
  },
  async refresh(){
    if(!this.token)return null;
    try{this.user=(await this.request('/auth/me')).user;return this.user;}
    catch(e){
      if(/未登录|登录/.test(e.message))this.clear();
      return null;
    }
  },
  clear(){
    this.token=null;this.user=null;
    try{localStorage.removeItem('ndt-cloud-token');}catch(e){}
  },
  logout(){this.clear();},
  /* 论坛数据 */
  async listPosts(board,sort){
    const q=new URLSearchParams();
    if(board)q.set('board',board);
    q.set('sort',sort||'latest');
    return (await this.request('/posts?'+q.toString())).posts;
  },
  async getPost(id){return await this.request('/posts/'+encodeURIComponent(id));},
  async createPost(board,title,content){
    return (await this.request('/posts',
      {method:'POST',body:JSON.stringify({board,title,content})})).post;
  },
  async reply(postId,content,parentId){
    const payload={content};
    if(parentId)payload.parentId=parentId;
    return (await this.request('/posts/'+encodeURIComponent(postId)+'/replies',
      {method:'POST',body:JSON.stringify(payload)})).reply;
  },
  async toggleLike(type,id){
    return (await this.request('/like',
      {method:'POST',body:JSON.stringify({type,id})})).liked;
  },
  /* 删除帖子（作者本人或管理员） */
  async deletePost(id){
    return await this.request('/posts/'+encodeURIComponent(id),{method:'DELETE'});
  },
  /* 删除评论（作者本人或管理员） */
  async deleteReply(id){
    return await this.request('/replies/'+encodeURIComponent(id),{method:'DELETE'});
  },
  /* 置顶 / 取消置顶（管理员）；不传 pinned 时由后端切换当前状态 */
  async pinPost(id,pinned){
    const payload={};
    if(pinned!==undefined)payload.pinned=!!pinned;
    return await this.request('/posts/'+encodeURIComponent(id)+'/pin',
      {method:'POST',body:JSON.stringify(payload)});
  },
  /* 禁言 / 解除禁言 / 拉黑 / 解除拉黑（管理员） */
  async moderateUser(id,action){
    return await this.request('/users/'+encodeURIComponent(id),
      {method:'POST',body:JSON.stringify({action})});
  },
  /* 全部成员列表（管理员） */
  async listUsers(){
    return (await this.request('/users')).users;
  },
  /* 删除账号（管理员） */
  async deleteUser(id){
    return await this.request('/users/'+encodeURIComponent(id),{method:'DELETE'});
  },
  /* ---------- 通知 ---------- */
  notif:{unread:0,total:0,list:[]},
  async fetchNotifications(filter){
    const q=new URLSearchParams();if(filter)q.set('filter',filter);
    const d=await this.request('/notifications?'+q.toString());
    if(!filter){this.notif.unread=d.unread;this.notif.total=d.total;this.notif.list=d.notifications;}
    return d;
  },
  async readNotifications(id){
    return await this.request('/notifications',
      {method:'POST',body:JSON.stringify({action:'read',id:id||null})});
  },
  async readNotificationsForPost(postId){
    return await this.request('/notifications',
      {method:'POST',body:JSON.stringify({action:'readPost',postId})});
  },
  async clearReadNotifications(){
    return await this.request('/notifications',
      {method:'POST',body:JSON.stringify({action:'clear'})});
  },
  /* 后台静默刷新通知（用于红点/轮询），失败不抛 */
  async pollNotifications(){
    if(!this.connected)return;
    try{
      const d=await this.request('/notifications');
      this.notif.unread=d.unread;this.notif.total=d.total;this.notif.list=d.notifications;
    }catch(e){}
  }
};

/* ---------- 云端账号视图 ---------- */
function cloudFormsHtml(mode){
  const isLogin=mode==='login';
  return `<div class="cloud-tabs">
      <button class="ct ${isLogin?'on':''}" id="cloud-tab-login">登录</button>
      <button class="ct ${!isLogin?'on':''}" id="cloud-tab-register">注册</button>
    </div>
    <div id="cloud-msg" class="cloud-msg"></div>
    <div class="cloud-form">
      <label class="fl">云端账号</label>
      <input class="field" id="cf-login" placeholder="3-20 位字母/数字/下划线" autocomplete="username">
      ${!isLogin?`<label class="fl">昵称（论坛显示名）</label>
      <input class="field" id="cf-name" placeholder="例如 华北小异人">`:''}
      <label class="fl">密码</label>
      <input class="field" id="cf-pass" type="password" placeholder="至少 6 位" autocomplete="${isLogin?'current-password':'new-password'}">
      <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-orange" id="cf-sub">${isLogin?'登录云端':'注册并登录'}</button>
      </div>
    </div>
    <p class="ph-sub" style="margin-top:16px">说明：云端账号由服务器保存，密码经 PBKDF2 加盐哈希，不会明文存储；与本地的离线账号相互独立。</p>`;
}
function cloudAccountHtml(u){
  const av=u.avatar&&u.avatar.startsWith('data')
    ?`<img src="${u.avatar}" style="width:100%;height:100%;object-fit:cover">`
    :esc(avText(u.name));
  return `<div class="cloud-account">
    <div class="cloud-account-head">
      <div class="cloud-av">${av}</div>
      <div style="min-width:0">
        <h3 style="margin:0">${esc(u.name)}</h3>
        <p class="ph-sub" style="margin:4px 0 0">账号 ${esc(u.login)} · 云端编号 ${esc(u.id)}</p>
      </div>
      <span class="grade-badge grade-badge-l${Math.min(5,Math.max(1,Math.ceil(u.level/4)))}">Lv${u.level} · ${esc(u.levelName)}</span>
    </div>
    <div class="cloud-stats">
      <div class="cs"><span>积分</span><b>${u.points}</b></div>
      <div class="cs"><span>等级</span><b>Lv${u.level}</b></div>
      <div class="cs"><span>称号</span><b>${esc(u.levelName)}</b></div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a class="btn btn-orange btn-sm" href="#/forum">进入共享论坛</a>
      <button class="btn btn-ghost btn-sm" id="cloud-logout">退出云端账号</button>
      <button class="btn btn-ghost btn-sm" id="cloud-refresh">刷新资料</button>
    </div>
    <p class="ph-sub" style="margin-top:14px">云端共享：论坛帖子、回复、点赞与积分等级。<br>仍保留在本地：聊天/聊天室、抽签问卦、小游戏、界面主题与个人设置。</p>
    ${u.role>=3?`<div class="cloud-mod" id="cloud-mod">
      <div class="cloud-mod-head"><strong>成员管理</strong><button class="btn btn-sm btn-ghost" id="cm-reload">刷新列表</button></div>
      <div class="cloud-mod-list"><div class="cloud-loading"><span class="cl-spin"></span>正在加载成员…</div></div>
    </div>`:''}
  </div>`;
}
/* 成员管理列表 HTML（管理员） */
function cloudModListHtml(users){
  if(!users.length)return '<div class="empty">暂无成员</div>';
  return users.map(u=>{
    const isMe=u.id===Cloud.user.id;
    const tags=[];
    if(u.role>=3)tags.push('<span class="tag tag-blue">管理员</span>');
    if(u.muted)tags.push('<span class="tag tag-amber">已禁言</span>');
    if(u.banned)tags.push('<span class="tag tag-red">已拉黑</span>');
    return `<div class="cm-row ${u.banned?'is-banned':u.muted?'is-muted':''}">
      <span class="mini-av">${esc(avText(u.name))}</span>
      <div class="cm-info">
        <div class="cm-name"><b>${esc(u.name)}</b>${tags.join('')}</div>
        <div class="ph-sub">${esc(u.login)} · Lv${u.level} ${esc(u.levelName)} · ${u.points}积分</div>
      </div>
      ${isMe?'<span class="ph-sub cm-self">本人</span>':`<div class="cm-actions">
        <button class="btn btn-sm btn-ghost" data-cm="${u.muted?'unmute':'mute'}:${u.id}">${u.muted?'解除禁言':'禁言'}</button>
        <button class="btn btn-sm btn-ghost" data-cm="${u.banned?'unban':'ban'}:${u.id}" ${u.banned?'':'style="color:#FF9DA0"'}>${u.banned?'解除拉黑':'拉黑'}</button>
        <button class="btn btn-sm btn-ghost" data-cmdel="${u.id}" style="color:#FF6B6B">删除账号</button>
      </div>`}
    </div>`;
  }).join('');
}
/* 加载并渲染成员管理列表 */
async function loadCloudMod(){
  const box=document.querySelector('.cloud-mod-list');
  if(!box)return;
  try{
    const users=await Cloud.listUsers();
    box.innerHTML=cloudModListHtml(users);
  }catch(e){
    box.innerHTML=`<div class="empty">加载失败：${esc(e.message)}</div>`;
  }
}
function viewCloud(){
  const c=`<div class="p-crumb">论坛 / <b>云端账号</b></div>
  <div class="p-panel">
    <h2>云端账号</h2>
    <div class="ph-sub">登录云端后，论坛变为多人共享的真实论坛；未登录时仍可离线单机使用，原有功能不受影响。</div>
    <div id="cloud-box">${Cloud.connected?cloudAccountHtml(Cloud.user):cloudFormsHtml('login')}</div>
  </div>`;
  const html=portalShell('cloud',c);
  if(Cloud.connected&&Cloud.user.role>=3)setTimeout(loadCloudMod,0);
  return html;
}

/* 云端动作后，按当前路由静默重渲染（不闪 loading） */
async function cloudRerender(){
  const {seg,query}=parseHash();
  if(seg[0]==='post'&&seg[1]){
    const d=await Cloud.getPost(seg[1]);
    const post={
      id:d.post.id,board:d.post.board,title:d.post.title,content:d.post.content,
      authorId:d.post.authorId,authorName:d.post.authorName,
      createdAt:d.post.createdAt,pinned:d.post.pinned,views:d.post.views,
      votes:d.post.votes||[],simulatedLikes:0};
    const replies=(d.replies||[]).map(r=>({
      id:r.id,postId:r.postId,parentId:r.parentId||null,
      authorId:r.authorId,authorName:r.authorName,
      content:r.content,createdAt:r.createdAt,votes:r.votes||[]}));
    $('#app').innerHTML=portalShell('forum',
      postDetailHtml(post,replies,Cloud.user.id,Cloud.user.role>=3,true));
  }else{
    const board=seg[0]==='forum'&&seg[1]?decodeURIComponent(seg[1]):'全部';
    const sort=query.sort||'latest';
    const posts=await Cloud.listPosts(board,sort);
    const el=document.getElementById('cloud-forum-list');
    if(el)el.innerHTML=forumListHtml(sortForumPosts(posts,sort),Cloud.user.id);
  }
}

/* ---------- 表情包（同人自绘风格文字贴纸） ---------- */
const STICKERS=['😀','😅','😱','🤔','🤫','😴','🥲','😤','🤝','👻','🔥','⚡','🧧','🗡️','☯️','🐒','🧠','📦','🚚','💨','🙏','👀','🧎','🌪️','💢','🕯️'];

/* ---------- 空间装修模板 ---------- */
const TEMPLATES={
 default:[{id:'blue',name:'深蓝公务',a:'#1A2C78',b:'#2E47B8'},{id:'ink',name:'墨蓝夜航',a:'#0E1B52',b:'#243B9B'},{id:'ember',name:'灰烬橙',a:'#3A2015',b:'#D06E35'},{id:'plain',name:'素白',a:'#F2F4FA',b:'#DDE3F0'}],
 day:[{id:'paper',name:'晨光纸白',a:'#FFFFFF',b:'#EDF2FA'},{id:'mist',name:'雾蓝',a:'#DCE6F7',b:'#A9C1EA'},{id:'blossom',name:'樱粉',a:'#FBE4EC',b:'#E7A8BF'},{id:'sage',name:'竹青',a:'#E4F0E6',b:'#A9CCB0'}],
 classic:[{id:'xuan',name:'宣纸',a:'#EDE8D8',b:'#C9C2AE'},{id:'zhu',name:'朱砂',a:'#8E2328',b:'#D0484D'},{id:'jade',name:'青玉',a:'#1F5E52',b:'#3E9C86'},{id:'mo',name:'墨竹',a:'#2A2A28',b:'#5C5A50'}],
 cyber:[{id:'neon',name:'霓虹紫',a:'#0B1E52',b:'#7C2BFF'},{id:'pulse',name:'脉冲青',a:'#071A2C',b:'#00E5FF'},{id:'acid',name:'酸性绿',a:'#0A1F0E',b:'#3BE08F'},{id:'magenta',name:'洋红警报',a:'#2A0018',b:'#FF2E88'}],
 rose:[{id:'rose-gold',name:'玫瑰金',a:'#C98B7E',b:'#EAC3B4'},{id:'cream',name:'奶油白',a:'#FDF6F1',b:'#F0DCD0'},{id:'blush',name:'胭脂粉',a:'#E7A7A0',b:'#F6D6D0'},{id:'champagne',name:'香槟金',a:'#D9B896',b:'#F2E0C4'}],
 aurora:[{id:'aurora-teal',name:'极光青',a:'#0E2A3A',b:'#37D6BE'},{id:'aurora-violet',name:'星河紫',a:'#1D1448',b:'#8B7CFF'},{id:'aurora-green',name:'极光绿',a:'#0C2A26',b:'#4BE3A4'},{id:'aurora-pink',name:'星云粉',a:'#2A1238',b:'#E07CF5'}]
};
const tplOf=id=>{const all=Object.values(TEMPLATES).flat();const t=all.find(x=>x.id===id)||TEMPLATES[DB.data?.theme||'default']?.[0]||TEMPLATES.default[0];return {...t,cover:`linear-gradient(120deg,${t.a},${t.b})`,main:t.b,zikaBg:t.a,zikaColor:'#FFFFFF'};};

/* ---------- 种子数据 ---------- */
function seedDB(){
  const posts=[
    {id:'p-1',board:'公告',pinned:1,title:'【论坛守则】异人论坛使用须知（新手必读）',content:'一、本论坛仅供异人及相关人员内部交流，禁止向普通社会公开传播内部信息。\n二、禁止泄露本人及他人真实身份、住址、行动路线与功法细节。\n三、禁止煽动门派冲突、传播未经核实的危险情报或教唆违法行为。\n四、遇到全性成员及其他高危目标，优先联系辖区负责人，不得擅自围堵、跟踪或交手。\n五、涉及重大事件的帖子请标注时间、地点、信息来源与可信等级；未经证实的内容请勿当作事实传播。\n六、管理员有权对涉密内容进行折叠、移板或删除，处理记录将留档。\n七、请尊重不同门派与地区成员，理性讨论，禁止人身攻击。\n\n——哪都通论坛管理组',authorId:'',authorName:'论坛管理员',createdAt:'2026-10-01 09:00',votes:['v-1','v-2','v-3','v-4','v-5','v-6','v-7','v-8','v-9','v-10','v-11','v-12'],views:2486,editedBy:[]},
    {id:'p-2',board:'公告',pinned:0,title:'【事件通报】龙虎山罗天大醮期间异常情况汇总',content:'管理组整理公开流传的现场报告：赛事期间出现身份不明人员闯入、多个区域通讯中断，以及部分人员受伤等情况。各地转帖时请勿补充未经证实的姓名与行踪，后续以各区正式通报为准。',authorId:'',authorName:'论坛管理员',createdAt:'2026-10-24 08:30',votes:['v-1','v-2','v-3','v-4','v-5','v-6','v-7'],views:18640,editedBy:[]},
    {id:'p-3',board:'天下见闻',pinned:0,title:'【资料整理】碧游村事件时间线：目前能确认的几个节点',content:'根据各区已公开的简报，事件涉及修身炉、人员失联与跨区协同行动。此帖只列已确认时间节点，不推测参与者个人动机，也不转发现场人员的私人信息。欢迎补充可核验的公开资料。',authorId:'',authorName:'华东档案员·许闻',createdAt:'2026-10-23 20:15',votes:['v-1','v-2','v-3','v-4','v-5','v-6'],views:14230,editedBy:[]},
    {id:'p-4',board:'公告',pinned:0,title:'关于近期跨区任务报备与临时联络频道调整的通知',content:'自即日起，跨区协作任务须在出发前登记负责人、预计时段及紧急联络方式。临时频道只用于任务信息，不得转发到公共板块。遇到频道失联，请按各区既有应急流程处理。',authorId:'',authorName:'论坛管理员',createdAt:'2026-10-22 11:00',votes:['v-1','v-2','v-3'],views:6120,editedBy:[]},
    {id:'p-5',board:'天下见闻',pinned:0,title:'【讨论】全性近期活动范围是否有扩大迹象？仅汇总公开线索',content:'近来不同地区出现几起性质相似但尚未确认有关联的异常事件。先提醒：相似不代表同一组织所为。本帖欢迎按地区、日期和来源整理线索，请勿发布未经核实的个人照片或坐标。',authorId:'',authorName:'秦岭散人',createdAt:'2026-10-21 19:42',votes:['v-1','v-2','v-3','v-4','v-5'],views:11080,editedBy:[]},
    {id:'p-6',board:'异人讨论',pinned:0,title:'罗天大醮之后，各门派公开交流活动会不会减少？',content:'今年大赛后，几处原定的交流活动都传出延期消息。是例行安保调整，还是各派在重新评估公开活动的风险？欢迎讨论行业趋势，勿猜测具体个人的私下安排。',authorId:'',authorName:'青城外门弟子',createdAt:'2026-10-20 16:25',votes:['v-1','v-2','v-3','v-4'],views:9370,editedBy:[]},
    {id:'p-7',board:'功法交流',pinned:0,title:'资料帖：公开场合使用术法的风险与善后原则',content:'无论术法规模大小，公开场合都要优先考虑普通人的安全与后续影响。建议各派新人熟悉现场隔离、伤者协助、信息保密和事后报备流程。本文是经验归纳，不涉及任何具体功法的操作细节。',authorId:'',authorName:'南区善后组·老邱',createdAt:'2026-10-19 09:10',votes:['v-1','v-2','v-3'],views:4760,editedBy:[]},
    {id:'p-8',board:'公告',pinned:0,title:'论坛新增“事件核验”标签：发帖请标注消息来源',content:'为减少传言造成的误判，事件类帖子可使用“官方通报”“现场目击”“二手转述”“尚待核实”标签。管理员会优先整理有时间、地点和来源的内容；匿名爆料不等于已证实情报。',authorId:'',authorName:'论坛管理员',createdAt:'2026-10-18 12:00',votes:['v-1','v-2','v-3','v-4','v-5','v-6'],views:7540,editedBy:[]},
    {id:'p-9',board:'求助',pinned:0,title:'求问：任务途中发现疑似异常痕迹，如何规范留档？',content:'本区新人整理现场记录时遇到问题：照片、时间、目击描述应该分开记录吗？希望有经验的同道分享通用的留档规范。请不要在回复中公开真实任务地点或未结案细节。',authorId:'',authorName:'闽南新人·阿禾',createdAt:'2026-10-17 21:08',votes:['v-1','v-2'],views:2680,editedBy:[]},
    {id:'p-10',board:'天下见闻',pinned:0,title:'十佬会议相关传闻很多，哪些消息值得继续观察？',content:'这两天关于十佬会面的说法不少，但目前没有足够材料确认议题与结论。欢迎大家区分“确有其事”和“推测解读”，避免把茶馆传闻写成正式决议。',authorId:'',authorName:'洛阳听客',createdAt:'2026-10-16 18:34',votes:['v-1','v-2','v-3','v-4'],views:6890,editedBy:[]},
    {id:'p-11',board:'异人讨论',pinned:0,title:'异人界近年跨区协作增多，是好事还是隐患？',content:'大型事件越来越难靠单一区域处理，协作效率明显重要；但人员权限、情报边界与责任划分也更复杂。想听听不同地区的工作经验，尽量谈制度，不点名评价个人。',authorId:'',authorName:'西南联络员',createdAt:'2026-10-15 10:20',votes:['v-1','v-2','v-3'],views:5320,editedBy:[]},
    {id:'p-12',board:'功法交流',pinned:0,title:'新人入门资料索引更新：先看安全守则，再看基础概念',content:'管理组把公开可讨论的基础术语、门派分类和安全提醒做了索引。这里不提供危险术法的练习步骤，也不建议任何人脱离指导私自尝试。若发现过时条目，请附上可核验来源。',authorId:'',authorName:'论坛管理员',createdAt:'2026-10-14 14:05',votes:['v-1','v-2','v-3','v-4','v-5'],views:8240,editedBy:[]},
    {id:'p-13',board:'灌水',pinned:0,title:'说说各地营业部最离谱的“普通快递”备注',content:'轻松一下：不涉及真实客户信息的前提下，大家遇到过哪些让人摸不着头脑的备注？请注意打码，不要上传面单、电话、地址，也别把任务经历写成段子泄密。',authorId:'',authorName:'华北仓库小赵',createdAt:'2026-10-13 22:17',votes:['v-1'],views:1870,editedBy:[]},
    {id:'p-14',board:'天下见闻',pinned:0,title:'【复盘】大型异人事件后，普通社会的信息隔离怎么做更稳妥？',content:'事件结束不代表风险结束。现场目击者安置、损坏设施解释、网络传言澄清都需要配合。欢迎分享各区通用做法，但请勿透露真实处置方案与可被利用的流程漏洞。',authorId:'',authorName:'论坛管理员',createdAt:'2026-10-12 08:55',votes:['v-1','v-2','v-3','v-4','v-5','v-6','v-7'],views:12760,editedBy:[]},
    {id:'p-15',board:'求助',pinned:0,title:'有没有跨区任务结束后的心理恢复与休整建议？',content:'连续出勤后容易出现睡眠紊乱、注意力下降等状态。想收集一些不涉及个人隐私的休整经验：如何安排轮班、如何做交接、什么时候应该主动申请暂停任务。',authorId:'',authorName:'山西小医馆学徒',createdAt:'2026-10-11 17:45',votes:['v-1','v-2','v-3'],views:3910,editedBy:[]},
    {id:'p-16',board:'公告',pinned:0,title:'关于论坛旧帖归档与敏感信息清理的说明',content:'管理组将分批检查旧帖中的失效链接、个人信息与未核实传闻。涉及安全风险的内容可能被折叠或移入内部归档；正常讨论会保留。若认为误处理，可通过站内渠道提交复核。',authorId:'',authorName:'论坛管理员',createdAt:'2026-10-10 09:30',votes:['v-1','v-2'],views:3220,editedBy:[]},
    {id:'p-17',board:'异人讨论',pinned:0,title:'门派交流会取消或延期后，年轻弟子该如何补足经验？',content:'线下交流减少后，基础理论、礼仪、风险识别和案例复盘仍然可以继续。希望各位分享合法合规、不会暴露门派机密的学习方式，不要发布内部教材扫描件。',authorId:'',authorName:'武当外院弟子',createdAt:'2026-10-09 13:12',votes:['v-1','v-2','v-3'],views:4460,editedBy:[]},
    {id:'p-18',board:'天下见闻',pinned:0,title:'甲申之乱相关资料再被提起：请先区分史料与民间传说',content:'近期又有帖子把不同版本的甲申之乱传闻拼在一起。此类历史材料来源复杂，建议注明出处、形成时间与是否有交叉印证。不要将推测直接指向现存门派或具体人物。',authorId:'',authorName:'旧书摊掌柜',createdAt:'2026-10-08 20:40',votes:['v-1','v-2','v-3','v-4','v-5'],views:9760,editedBy:[]},
    {id:'p-19',board:'灌水',pinned:0,title:'异人界也有淡季吗？最近大家都在忙什么日常事务',content:'不聊机密任务，单纯问问各地最近的日常：培训、资料整理、器材维护还是轮休？感觉大事件之后论坛都安静了不少。',authorId:'',authorName:'成都值班小哥',createdAt:'2026-10-07 19:02',votes:[],views:960,editedBy:[]},
    {id:'p-20',board:'功法交流',pinned:0,title:'术法研究记录如何写，才能让后来者看得懂又不泄密？',content:'建议把观察现象、环境条件、个人推测和结论分开写；不记录无关身份信息，不公开危险步骤，对无法复现的内容明确标注不确定性。欢迎补充一份适用于公开交流的记录模板。',authorId:'',authorName:'研究记录爱好者',createdAt:'2026-10-06 15:26',votes:['v-1','v-2'],views:2140,editedBy:[]},
    {id:'p-29',board:'天下见闻',pinned:0,title:'【高楼热帖】最近几场异人交易会，怎么总有人拿来历不明的旧物当压轴？',content:'先说好，楼主只是跑过几次公开交易会的散修，不认识卖家，也没什么内幕。最近几场集市上，几件旧法器被吹得神乎其神，报价还一个比一个离谱。到底是行情变了，还是大家都爱给老物件编故事？欢迎聊公开见闻，别贴真实摊位位置和卖家身份。',authorId:'',authorName:'关中跑集散修',createdAt:'2026-10-26 09:18',votes:Array.from({length:132},(_,i)=>`seed-v-p29-${i}`),views:48620,editedBy:[]},
    {id:'p-30',board:'灌水',pinned:0,title:'【热议】各地山门最近都在收紧访客登记？是巧合还是新规风向？',content:'这周听几位外地同道提到，去别家山门拜访要提前报备的地方变多了。也可能只是各家自己的安排，未必是统一新规。有没有人遇到过类似情况？只聊公开的访客流程和出行体验，不猜具体门派的内部部署。',authorId:'',authorName:'江南访友客',createdAt:'2026-10-26 08:42',votes:Array.from({length:109},(_,i)=>`seed-v-p30-${i}`),views:39780,editedBy:[]}
  ];
  const replySeeds={
    'p-1':[
      ['巡山的青符','已读。尤其是第五条，最近转帖太快，最好把来源写清楚。'],
      ['华东小周','新人报到，先把守则收藏了。'],
      ['白云观外门弟子','补充一句：遇到不确定的情况先找辖区联络员，别急着在论坛里求证具体身份。']
    ],
    'p-2':[
      ['龙虎山脚下的茶摊','当时山脚临时封了几条路，具体原因我不清楚，还是等正式通报吧。'],
      ['川渝办事员','我们这边收到的提醒也是不要转发现场偷拍视频，避免给后续核查添麻烦。'],
      ['符纸批发老陈','希望受伤的同道都平安，后续有确认消息再更新。']
    ],
    'p-3':[
      ['档案室小许','时间线整理得挺清楚，建议把“已确认”和“待核实”分成两栏。'],
      ['华南临时联络员','跨区协作部分可以补一条公开通报的发布时间，方便对照。']
    ],
    'p-4':[
      ['北区跑腿阿梁','收到，已经提醒组里出发前检查联络方式。'],
      ['青城山记事员','建议加个报备模板，省得新人每次漏填预计返程时间。']
    ],
    'p-5':[
      ['湘西采风客','我看到的几起情况地点相隔很远，暂时看不出能串起来的证据。'],
      ['不爱吃瓜','赞同谨慎一点，别看到相似手法就直接归到全性头上。'],
      ['关中散人','如果有可核实的公开来源，最好只贴来源摘要，不要搬个人信息。']
    ],
    'p-6':[
      ['太行山小道士','我们这边的交流会只是改成小规模了，没听说全面取消。'],
      ['苏杭器材管理员','大型活动的安保成本确实高，短期内可能都会更谨慎。']
    ],
    'p-7':[
      ['临时工预备役','现场先疏散普通人这点很重要，别只顾着处理异常。'],
      ['老邱修器材','善后记录也要写清损坏物品和交接人，后面省很多麻烦。']
    ],
    'p-8':[
      ['论坛常驻观察员','希望以后能显示来源标签，光靠标题真不好判断。'],
      ['华中档案员','二手转述我建议默认标黄，等补充来源后再改状态。']
    ],
    'p-9':[
      ['闽南小许','分开记录比较好：原始观察单独存，推测另开一栏，之后复盘不容易混。'],
      ['山门值班生','照片记得保留原始时间信息，但上传论坛前先清掉可能暴露位置的元数据。']
    ],
    'p-10':[
      ['洛阳酒馆听客','茶馆版本一天一个样，还是等会议后有正式口径再说吧。'],
      ['津门旧闻','十佬之间的事外人很难知道全貌，别把推测当结论就行。']
    ],
    'p-11':[
      ['西南联络员','协作效率是高了，但跨区权限最好在任务开始前说清楚。'],
      ['小门派事务人','对小门派来说，统一流程也能少一些信息不对称。']
    ],
    'p-12':[
      ['刚入门的木木','这个索引对新人挺友好，终于不用到处翻旧帖了。'],
      ['资料控老唐','建议加个最后校订日期，旧资料最怕被当成现行规则。']
    ],
    'p-13':[
      ['华北仓库小赵','见过备注写“易碎，轻拿轻放”，箱子里其实全是泡沫填充物。'],
      ['西区夜班','我们这边有次写“请勿摇晃”，结果大家都以为里面是法器，最后是豆浆机。'],
      ['匿名路过','提醒一下，照片再搞笑也记得把条码和面单信息裁掉。']
    ],
    'p-14':[
      ['江南善后组','对外解释要统一口径，但别为了圆说法编造细节，后面更难收场。'],
      ['现场记录员','我觉得人员安置和信息澄清应该并行，不要等舆情起来才处理。']
    ],
    'p-15':[
      ['值班表管理员','我们会强制留出交接时间，连续出勤后不要直接接下一班。'],
      ['山西小医馆学徒','休整不是偷懒，睡眠和补水都做好，状态不对就及时报备。']
    ],
    'p-16':[
      ['老帖收藏家','只要不是涉及隐私或安全的内容，希望能保留有价值的历史讨论。'],
      ['版务协助员','可以给被折叠的帖子留个原因说明，方便作者知道怎么修改。']
    ],
    'p-17':[
      ['武当外院弟子','基础理论和案例复盘也很重要，实战不是唯一的学习方式。'],
      ['岭南器械师','跨门派交流时先讲清楚哪些能公开，避免双方都尴尬。']
    ],
    'p-18':[
      ['旧书摊掌柜','同一段传闻在不同抄本里差异很大，确实不能拼起来当成完整史实。'],
      ['档案整理员','最好保留原始出处和转引链条，后人才能判断可信度。'],
      ['关外访客','涉及具体门派的部分尤其谨慎，别因为一份孤证就下结论。']
    ],
    'p-19':[
      ['成都值班小哥','最近忙着清点器材和补觉，论坛安静点也挺好。'],
      ['新手符匠','我们在整理培训笔记，终于有时间把之前欠的基础课补完。']
    ],
    'p-20':[
      ['研究记录爱好者','我会把观察、猜想、验证结果分开写，隔几天回看经常能发现自己想当然的地方。'],
      ['东北资料员','模板里加一项“无法确认的条件”也不错，提醒读者别过度解读。']
    ],
    'p-29':[
      ['旧物行的阿沅','有些东西年份确实久，但年份久不等于术法厉害。最近报价里故事比货多。'],
      ['西北散修老韩','我只看过公开摊位，有人连来历都说不清就开天价，围观的人还真不少。'],
      ['鉴器学徒小唐','建议先看材质、保存情况和能不能查到旧记录，别听一句“祖传”就上头。'],
      ['路过的账房先生','高价成交的那几件未必是真热门，也可能只是传得响，实际买家没几个。'],
      ['南城摆摊人','集市每年都有这种热闹，散场以后真正愿意复检的反而不多。'],
      ['版务协助员','提醒一下，别发摊位定位或摊主身份，交易纠纷请走正式渠道。']
    ],
    'p-30':[
      ['岭南访客','我上个月去拜访也要提前递帖子，感觉是那家最近接待的人多，不一定是统一新规。'],
      ['山门值守小周','登记访客本来就不奇怪，尤其活动多的时候，提前打招呼能省不少麻烦。'],
      ['青州行脚客','不同地方差别很大。有的只记姓名和来意，有的得由熟人引荐。'],
      ['关外小道童','别把几家山门的做法直接说成新规吧，我这边目前没收到统一通知。'],
      ['江边茶摊老板','最近拜访的人确实多，登记细一点也正常，未必有什么大事。']
    ]
  };
  const answers=Object.entries(replySeeds).flatMap(([postId,items],pi)=>items.map((item,i)=>({id:`seed-a-${postId}-${i+1}`,postId,authorId:'',authorName:item[0],content:item[1],createdAt:`2026-10-${String(Math.max(1,26-Math.floor(pi/2))).padStart(2,'0')} ${String(9+(i*3)%12).padStart(2,'0')}:${String((pi*7+i*13)%60).padStart(2,'0')}`,votes:Array.from({length:(pi*3+i*2)%6},(_,n)=>`seed-v-${postId}-${i}-${n}`),editedBy:[]})));
  const archives=[
    {id:'r-1',code:'ND-YR-001',name:'张楚岚',gender:'男',faction:'天师府传人 / 哪都通华北区编外',skill:'金光咒·阳五雷；疑似持有八奇技「炁体源流」',danger:'A',status:'在控（编外员工）',sec:2,aliases:'不摇碧莲、张处男',note:'张怀义之孙，甲申之乱关键线索人物。表面吊儿郎当，实际心思极深。罗天大醮冠军。其炁体源流来源与继承方式需持续跟进。'},
    {id:'r-2',code:'ND-YR-002',name:'冯宝宝',gender:'女',faction:'哪都通华北区临时工',skill:'无明确功法；本能格斗术，自愈能力极强，疑似不老不死',danger:'未知',status:'在控（临时工）',sec:3,aliases:'宝宝',note:'身世不明，被发现于四川，记忆缺失。身体机能与常人迥异，数十年容貌未变。与甲申之乱、无根生存在未知关联，为最高优先级观察对象。'},
    {id:'r-3',code:'ND-YR-003',name:'张灵玉',gender:'男',faction:'龙虎山天师府',skill:'阴五雷；后获「通天箓」',danger:'B',status:'观察',sec:2,aliases:'灵玉真人',note:'老天师弟子，因心结改练阴五雷。罗天大醮负于张楚岚。性格方正，与全性夏禾有旧，注意情感弱点。'},
    {id:'r-4',code:'ND-YR-004',name:'王也',gender:'男',faction:'武当山（已离山）',skill:'八奇技「风后奇门」',danger:'A',status:'观察',sec:2,aliases:'王道长',note:'清华肄业后入武当，意外习得风后奇门。可自定中宫、拨弄格局。多次表示不愿卷入纷争，但其能力使其无法置身事外。'},
    {id:'r-5',code:'ND-YR-005',name:'诸葛青',gender:'男',faction:'诸葛世家',skill:'武侯奇门；后悟三昧真火',danger:'B',status:'观察',sec:1,aliases:'',note:'诸葛世家传人，术字门天才。罗天大醮后一度执着于风后奇门，最终破除心障、三昧真火觉醒。现与王也交好。'},
    {id:'r-6',code:'ND-YR-006',name:'夏禾',gender:'女',faction:'全性「四张狂」',skill:'刮骨刀——操控情欲，可使人群失控相残',danger:'A',status:'在逃',sec:2,aliases:'',note:'全性四张狂之一，天生异质，非其本意。与张灵玉有旧。接触建议：女性员工或心性坚定者出面，禁止单人接触。'},
    {id:'r-7',code:'ND-YR-007',name:'张之维',gender:'男',faction:'龙虎山天师府 · 第六十五代天师',skill:'阳五雷，当世绝顶',danger:'S',status:'正道泰斗',sec:2,aliases:'老天师',note:'异人界公认战力天花板。罗天大醮主持者。为清理门户曾单人追杀全性，十佬亦难制衡。其立场即天师府立场。'},
    {id:'r-8',code:'ND-YR-008',name:'龚庆',gender:'男',faction:'全性代掌门',skill:'不明（疑似精神/记忆类）',danger:'A',status:'在逃',sec:3,aliases:'',note:'全性代掌门，潜伏龙虎山多年，策划田晋中遇害案以夺取甲申之乱记忆。年轻但城府极深，全性实际运转者。'},
    {id:'r-9',code:'ND-YR-009',name:'吕良',gender:'男',faction:'吕家',skill:'明魂术——抽取、篡改记忆与灵魂',danger:'B',status:'在逃',sec:3,aliases:'',note:'吕家嫡传，明魂术与八奇技「双全手」疑似同源。曾为张楚岚传递张怀义记忆。被家族除名后下落不明，危险等级可能上调。'},
    {id:'r-10',code:'ND-YR-010',name:'马仙洪',gender:'男',faction:'碧游村村长',skill:'八奇技「神机百炼」',danger:'S',status:'在逃',sec:3,aliases:'',note:'可炼制傀儡、法器乃至「修身炉」，能将普通人批量转化为异人。碧游村事件主谋。自称八奇技传人后裔，与哪都通有复杂渊源。'},
    {id:'r-11',code:'ND-YR-011',name:'陈朵',gender:'女',faction:'药仙会 / 碧游村十二上根器',skill:'蛊毒——体内养蛊，触之即死',danger:'A',status:'已故',sec:3,aliases:'',note:'自幼被药仙会炼为蛊身，后为哪都通华南区临时工，被马仙洪带走。碧游村事件后自愿赴死。华南区负责人廖忠因此殉职。'},
    {id:'r-12',code:'ND-YR-012',name:'肖自在',gender:'男',faction:'哪都通华东区临时工',skill:'少林功夫；杀人冲动倾向',danger:'A',status:'在控（临时工）',sec:3,aliases:'',note:'少林还俗，病态嗜杀，以公司任务为约束。战斗经验极强，对弱者有分寸。需定期心理评估，失控后果严重。'},
    {id:'r-13',code:'ND-YR-013',name:'王震球',gender:'男',faction:'哪都通西南区临时工',skill:'杂学多家手段（爱之马杀鸡等）',danger:'B',status:'在控（临时工）',sec:2,aliases:'',note:'性格跳脱，好奇心旺盛，手段杂而精。与张楚岚互称损友，行动中常不按常理出牌。'},
    {id:'r-14',code:'ND-YR-014',name:'黑管儿',gender:'男',faction:'哪都通大区临时工',skill:'横练硬功，近身搏杀',danger:'B',status:'在控（临时工）',sec:2,aliases:'',note:'看似粗犷实则心细，碧游村行动主力。'},
    {id:'r-15',code:'ND-YR-015',name:'廖忠',gender:'男',faction:'哪都通华南区负责人',skill:'综合格斗',danger:'B',status:'殉职',sec:3,aliases:'',note:'陈朵的监护人与负责人。在押送陈朵过程中为不伤害她而被蛊毒侵蚀，殉职。'},
    {id:'r-16',code:'ND-YR-016',name:'陆瑾',gender:'男',faction:'三一门',skill:'逆生三重；曾持「通天箓」',danger:'A',status:'十佬',sec:2,aliases:'',note:'三一门唯一传人，逆生三重可逆转生机。罗天大醮后将通天箓赠予张灵玉。性情刚烈，与全性有灭门之仇。'},
    {id:'r-17',code:'ND-YR-017',name:'风正豪',gender:'男',faction:'天下会会长',skill:'八奇技「拘灵遣将」',danger:'A',status:'观察',sec:2,aliases:'',note:'以企业家身份经营天下会，掌握拘灵遣将，可拘收灵体为己用。枭雄性格，能屈能伸，试图拉拢张楚岚。'},
    {id:'r-18',code:'ND-YR-018',name:'风沙燕',gender:'女',faction:'天下会',skill:'空间穿梭（短距瞬移）',danger:'B',status:'观察',sec:1,aliases:'',note:'风正豪之女，性格火辣，战力不俗。'},
    {id:'r-19',code:'ND-YR-019',name:'张怀义',gender:'男',faction:'天师府 / 三十六贼',skill:'八奇技「炁体源流」领悟者',danger:'S',status:'已故',sec:4,aliases:'',note:'张楚岚祖父，甲申之乱三十六贼之一。临终前将炁体源流与真相托付。其死亡牵出数十名异人界元老，是甲申之乱的活钥匙。'},
    {id:'r-20',code:'ND-YR-020',name:'无根生',gender:'男',faction:'全性掌门',skill:'神明灵——万法不侵，拆解一切炁构成的手段',danger:'S',status:'下落不明',sec:4,aliases:'',note:'三十六贼之首，全性百年唯一掌门。甲申之乱核心人物，八奇技的诞生与其密切相关。冯宝宝身世之谜的另一极。现存最危险的谜团。'}
  ];
  const events=[
    {id:'e-0',year:'1949以后',date:'1949以后',title:'哪都通成立，异人纳入公司化管理',loc:'全国',sec:1,hot:0,content:'异人活动被纳入统一管理体系，以快递公司为掩护，各大区设负责人与临时工编制，维持异人界与普通社会的隔离。'},
    {id:'e-1',year:'1944',date:'1944年秋',title:'甲申之乱：三十六贼结义，八奇技现世',loc:'陕西/四川一带',sec:4,hot:1,content:'三十六名各门派弟子结义，其中八人悟出八种逆天手段，史称「八奇技」。事后各派追杀，三十六贼星散，成为异人界最大悬案。'},
    {id:'e-2',year:'1949-1990',date:'时间不详',title:'冯宝宝出现于四川',loc:'四川',sec:3,hot:0,content:'一名不老不死的少女被徐家收养，容貌数十年不变。她没有记忆，却拥有超常的战斗本能。'},
    {id:'e-3',year:'近年',date:'罗天大醮期间',title:'罗天大醮于龙虎山召开，张楚岚夺冠',loc:'江西龙虎山',sec:2,hot:1,content:'天师府以选拔继承人为名召开罗天大醮，各派年轻异人云集。张楚岚最终以阳五雷击败张灵玉夺冠。'},
    {id:'e-4',year:'近年',date:'罗天大醮当夜',title:'全性大闹龙虎山，田晋中遇害',loc:'江西龙虎山',sec:3,hot:1,content:'全性趁醮会攻山，代掌门龚庆向田晋中逼问甲申之乱记忆后将其杀害。老天师震怒，随后下山清剿全性。'},
    {id:'e-5',year:'近年',date:'罗天大醮之后',title:'碧游村事件：修身炉与临时工联合行动',loc:'碧游村',sec:3,hot:1,content:'马仙洪以神机百炼建造修身炉，企图批量制造异人。各大区临时工联合行动，碧游村覆灭，马仙洪在押解途中逃脱。'},
    {id:'e-6',year:'近年',date:'碧游村事件',title:'陈朵之死与廖忠殉职',loc:'碧游村',sec:3,hot:0,content:'蛊身少女陈朵在事件尽头选择了自己的结局；华南区负责人廖忠此前已为她殉职。'},
    {id:'e-7',year:'近年',date:'碧游村之后',title:'秦岭：二十四节通天谷探索',loc:'秦岭',sec:3,hot:0,content:'众人深入秦岭秘境，寻找无根生留下的线索与宝藏，三十六贼往事再掀波澜。'}
  ];
  const library=[
    {id:'l-1',cat:'八奇技',title:'炁体源流',sec:4,content:'领悟者：张怀义。被称为"术之尽头"，疑似能将炁与生命本源合一，元婴化形、生生不息。张楚岚身上的"老农"与其相关。具体原理至今成谜。'},
    {id:'l-2',cat:'八奇技',title:'通天箓',sec:2,content:'领悟者：郑子布。不用设坛、不用纸笔，念动即符箓成型，可瞬间释放大量符箓。陆瑾曾持有，后转交张灵玉。'},
    {id:'l-3',cat:'八奇技',title:'风后奇门',sec:3,content:'领悟者：周圣。奇门遁甲的极致，可自定中宫、拨乱时间空间，转盘之内我即规则。王也习得，代价是被天道反噬。'},
    {id:'l-4',cat:'八奇技',title:'神机百炼',sec:3,content:'领悟者：马仙洪一脉。可瞬间完成御物、炼化物，能造傀儡、法器乃至修身炉，是"造物"的极致。'},
    {id:'l-5',cat:'八奇技',title:'双全手',sec:4,content:'领悟者：端木瑛。操纵肉身与灵魂，可救人亦可杀人，明魂术被疑为其残缺分支。吕家因此背负巨大秘密。'},
    {id:'l-6',cat:'八奇技',title:'拘灵遣将',sec:2,content:'领悟者：风天养。可拘收灵体、令其为将，风家因此受灵界忌惮，家族承诺"不王天下"。'},
    {id:'l-7',cat:'八奇技',title:'六库仙贼',sec:3,content:'领悟者：阮丰。以六库偷天，可吞噬他人生机、延年益寿，近乎不死，但永受饥饿之苦。'},
    {id:'l-8',cat:'八奇技',title:'大罗洞观',sec:4,content:'领悟者：谷畸亭。八奇技中最神秘的一种，疑似与观想、时空错觉有关，现世记录极少。'},
    {id:'l-9',cat:'基础',title:'异人与炁',sec:1,content:'炁是生命本源的能量，能感知并操纵炁的人称为异人。异人为少数，多数隐于市井。炁的运用分化为各门功法：符箓、奇门、炼体、御物、蛊毒等。'},
    {id:'l-10',cat:'组织',title:'全性',sec:2,content:'千年邪教，门人多为不被正道接纳的异人，信奉"全性保真"，实为各派通缉对象。百年仅认无根生为掌门，现由龚庆代掌。'},
    {id:'l-11',cat:'组织',title:'哪都通与临时工制度',sec:1,content:'哪都通以快递为掩护管理异人事务。正式员工之外，各大区可雇佣"临时工"：多为戴罪或难以安置的异人，以任务换自由，行动灵活但风险极高。'},
    {id:'l-12',cat:'组织',title:'十佬',sec:1,content:'异人界十个最有话语权的人物与家族组成的议事机构，老天师、陆瑾、风正豪等位列其中，负责调解各派、裁决大事。'},
    {id:'l-13',cat:'历史',title:'甲申之乱与三十六贼',sec:4,content:'1944年，三十六名来自各派的弟子结义，其中八人悟出八奇技。各派为灭口与夺技展开追杀，三十六贼或死或隐。真相被各方刻意掩埋，至今仍是异人界最大的禁忌。'},
    {id:'l-14',cat:'仪式',title:'罗天大醮',sec:1,content:'道门最高规格的醮仪，天师府借此选拔天师继承人。年轻异人公开比斗，是异人界少有的"盛世"，也是各方势力的角力场。'}
  ];
  const packages=[
    {id:'pk-1',code:'NDT7770001234',from:'北京·海淀转运中心',to:'成都·武侯区科华北路',weight:'1.2kg',status:'已签收',
      timeline:[
        {t:'2026-10-14 09:12',title:'已揽收',desc:'北京海淀中关村营业部已揽收',state:'done'},
        {t:'2026-10-14 21:40',title:'到达转运中心',desc:'北京转运中心已发出',state:'done'},
        {t:'2026-10-15 14:05',title:'到达成都转运中心',desc:'下一站：武侯营业部',state:'done'},
        {t:'2026-10-16 08:30',title:'派送中',desc:'快递员 王师傅 正在派送',state:'done'},
        {t:'2026-10-16 11:02',title:'已签收',desc:'本人签收，感谢使用哪都通',state:'done'}]},
    {id:'pk-2',code:'NDT6660005678',from:'青岛·崂山营业部',to:'上海·浦东新区张江镇',weight:'3.6kg',status:'派送中',
      timeline:[
        {t:'2026-10-18 16:20',title:'已揽收',desc:'青岛崂山营业部已揽收',state:'done'},
        {t:'2026-10-19 02:00',title:'到达济南转运中心',desc:'',state:'done'},
        {t:'2026-10-19 23:50',title:'到达上海转运中心',desc:'下一站：张江营业部',state:'done'},
        {t:'2026-10-20 07:40',title:'派送中',desc:'快递员 李师傅 正在派送，电话 138****6688',state:'cur'},
        {t:'',title:'待签收',desc:'',state:''}]}
  ];
  return {version:1,session:null,users:[],posts,answers,archives,events,library,packages,
    chats:{},
    rooms:[makeRoom('聊天室1')],
    theme:'default',
    workgroup:{members:[],messages:[]},
    oa:[],
    divination:{},
    codes:{emp:'NDT-EMP',mgr:'NDT-MGR',user:'NDT-USER'},
    boards:['公告','异人讨论','功法交流','天下见闻','求助','灌水']};
}

/* ---------- 认证 / 权限 ---------- */
const Auth={
  login(account,pwd){
    const u=DB.data.users.find(x=>(x.code&&x.code.toUpperCase()===account.toUpperCase())||x.name===account);
    if(!u)return{ok:false,msg:'账号不存在'};
    if(u.password!==pwd)return{ok:false,msg:'密码错误'};
    DB.data.session=u.id;DB.data.proactiveSessionToken=genId('login');
    resetProactiveWaitForLogin();DB.save();return{ok:true,user:u};
  },
  register(name,pwd){
    if(!name||name.length<2)return{ok:false,msg:'昵称至少 2 个字符'};
    if(DB.data.users.some(x=>x.name===name))return{ok:false,msg:'昵称已被占用'};
    const u={id:genId('u'),code:'',name,password:pwd,level:1,avatar:'',bio:'这个人很懒，什么都没留下。',zika:'新成员',zikaColor:'',tpl:'blue',main:'',regAt:nowStr(),friends:[],notice:''};
    DB.data.users.push(u);DB.data.session=u.id;DB.data.proactiveSessionToken=genId('login');
    resetProactiveWaitForLogin();DB.save();return{ok:true,user:u};
  },
  logout(){DB.data.session=null;DB.data.proactiveSessionToken=null;DB.save();},
  activate(code){
    const c=(code||'').trim().toUpperCase();
    const u=DB.user;if(!u)return{ok:false,msg:'请先登录'};
    if(c===DB.data.codes.mgr){u.level=3;DB.save();return{ok:true,msg:'已提升为管理员，全档案开放'};}
    if(c===DB.data.codes.emp){u.level=2;DB.save();return{ok:true,msg:'员工身份已激活，档案/事件/资料库已开放'};}
    if(c===DB.data.codes.user){u.level=1;DB.save();return{ok:true,msg:'已恢复为普通异人身份'};}
    return{ok:false,msg:'激活码无效'};
  },
  canViewSec(sec){return DB.level()>=(sec>=4?3:2);}
};

/* ---------- 投票 / 编辑通用 ---------- */
function toggleVote(arr){
  const u=DB.user;if(!u){toast('请先登录后再操作','warn');return false;}
  const i=arr.indexOf(u.id);if(i>=0)arr.splice(i,1);else arr.push(u.id);DB.save();return true;
}
function syncVoteUI(kind,id,votes){
  const buttons=kind==='post'?$$('[data-vote]').filter(b=>b.dataset.vote===id):$$('[data-avote]').filter(b=>b.dataset.avote===id);
  if(kind==='post'&&$('#p-vote')&&curPostId()===id)buttons.push($('#p-vote'));
  const selected=!!(DB.user&&votes.includes(DB.user.id));
  buttons.forEach(btn=>{
    btn.classList.toggle('on',selected);
    btn.dataset.voted=selected?'1':'0';
    btn.setAttribute('aria-pressed',selected?'true':'false');
    btn.setAttribute('aria-label',selected?'取消赞同':'赞同帖子');
    const label=btn.querySelector('.vote-label');
    if(label)label.textContent=selected?'已赞同':'赞同';
    const count=btn.closest('.q-vote')?.querySelector('.vote-count');
    if(count)count.textContent=String(votes.length+(kind==='post'?(Number(DB.data.posts.find(p=>p.id===id)?.simulatedLikes)||0):0));
  });
  if(kind==='post'&&$('.q-vote-detail .vote-count'))$('.q-vote-detail .vote-count').textContent=String(votes.length+(Number(DB.data.posts.find(p=>p.id===id)?.simulatedLikes)||0));
  if(kind==='post'&&$('.q-vote-detail .vote-caption'))$('.q-vote-detail .vote-caption').textContent='人赞同';
}
function recordEdit(item){
  const u=DB.user;if(!u)return;
  item.editedBy=item.editedBy||[];
  item.editedBy.push({name:u.name,at:nowStr()});
}
/* 帖子/回答的显示作者（可被编辑覆盖，方便做论坛体） */
function postAuthor(p){
  const u=DB.data.users.find(x=>x.id===p.authorId)||{name:'未知'};
  return p.authorName||u.name;
}
function ansAuthor(a){
  const u=DB.data.users.find(x=>x.id===a.authorId)||{name:'未知'};
  return a.authorName||u.name;
}
/* 直接设置赞同数（本地道具数据） */
function setVoteCount(arr,n){
  n=Math.max(0,parseInt(n)||0);
  const me=DB.user;
  const keep=me&&arr.includes(me.id)?[me.id]:[];
  const out=keep.slice();
  for(let i=0;out.length<n;i++)out.push('syn-vote-'+i);
  arr.splice(0,arr.length,...out.slice(0,n));
}

/* ==================================================================
   明面：快递网站视图
   ================================================================== */
function surfaceHeader(on){
  return `<div class="topbar"><div class="wrap"><span>客服热线：400-888-0000（7×24小时）</span>
    <div class="tb-r"><a href="#/sites">网点查询</a>${DB.user?`<a href="#/space/${DB.user.id}">${esc(DB.user.name)}</a><a id="lg-out" href="javascript:void(0)">退出</a>`:`<a href="#/login">登录</a><a href="#/register">注册</a>`}</div></div></div>
  <header class="header"><div class="wrap">
    <div class="logo" id="logo-go"><img src="assets/logo.png" alt="哪都通"><div class="logo-txt">哪都通快递<small>NADUTONG EXPRESS</small></div></div>
    <nav class="nav">
      <a href="#/" class="${on==='home'?'on':''}">首页</a>
      <a href="#/track" class="${on==='track'?'on':''}">查快递</a>
      <a href="#/sites" class="${on==='sites'?'on':''}">网点查询</a>
      <a href="#/service" class="${on==='service'?'on':''}">寄件服务</a>
      <a href="#/news" class="${on==='news'?'on':''}">新闻公告</a>
      <a href="#/about" class="${on==='about'?'on':''}">关于我们</a>
    </nav>
  </div></header>`;
}
function surfaceFooter(){
  return `<footer class="footer"><div class="wrap">
    <div class="fgrid">
      <div><div class="logo" style="margin-bottom:14px"><img src="assets/logo.png" alt="哪都通" style="height:40px"></div>
        <p>哪都通快递有限公司，成立以来始终专注于为客户提供高效、安全、可靠的快递物流服务。您的包裹，无处不达。</p></div>
      <div><h4>自助服务</h4><a href="#/track">快递查询</a><a href="#/service">在线寄件</a><a href="#/sites">网点查询</a><a href="#/service">运费查询</a></div>
      <div><h4>客户服务</h4><a href="#/about">服务条款</a><a href="#/about">隐私政策</a><a href="#/about">理赔说明</a><a href="#/about">联系我们</a></div>
      <div><h4>关于哪都通</h4><a href="#/about">公司简介</a><a href="#/news">新闻公告</a><a href="#/about">加入我们</a><a href="#/author">作者信息</a></div>
    </div>
    <div class="copy">哪都通快递有限公司 版权所有 | 京ICP备00000000号 | 本网站为同人非盈利娱乐作品，一切为虚拟娱乐切勿当真<br>
    <a href="#/gate" style="color:#46548C;font-size:11px">员工入口</a></div>
  </div></footer>`;
}

/* ---------- 首页 ---------- */
function viewHome(){
  return surfaceHeader('home')+
  `<div class="hero"><div class="wrap">
    <h1>您的包裹，无处不达</h1>
    <p>覆盖全国的高效物流网络，准时、安全、可信赖。输入运单号，实时掌握包裹动态。</p>
    <div class="track-box"><input id="tb-code" placeholder="请输入运单号，如 NDT7770001234"><button class="btn btn-orange" id="tb-go">查快递</button></div>
    <div class="hero-stats">
      <div class="s"><b>31省</b><span>全国覆盖</span></div>
      <div class="s"><b>99.8%</b><span>准时送达率</span></div>
      <div class="s"><b>24小时</b><span>全天客服</span></div>
      <div class="s"><b>0丢件</b><span>安全承诺</span></div>
    </div>
  </div></div>
  <div class="section"><div class="wrap">
    <h2>核心服务</h2><div class="sub">为个人与企业客户提供一站式物流解决方案</div>
    <div class="grid g4">
      <div class="svc-card"><div class="svc-ico">${svgIco('box')}</div><h3>同城急送</h3><p>同城范围内专人专送，最快 1 小时上门取件、当日送达。</p></div>
      <div class="svc-card"><div class="svc-ico">${svgIco('truck')}</div><h3>标准快递</h3><p>全国 31 省高效中转，多数城市次日达，全程可追踪。</p></div>
      <div class="svc-card"><div class="svc-ico">${svgIco('plane')}</div><h3>航空快运</h3><p>长距离急件优先空运，重点城市 24 小时内送达。</p></div>
      <div class="svc-card"><div class="svc-ico">${svgIco('biz')}</div><h3>企业物流</h3><p>为电商与企业客户提供仓配一体、批量寄件的定制方案。</p></div>
    </div>
  </div></div>
  <div class="section" style="background:#fff"><div class="wrap">
    <h2>新闻公告</h2><div class="sub">了解哪都通的最新动态</div>
    <div class="grid g2">
      ${viewNewsList(4).map(n=>`<div class="news-item"><div class="nd"><b>${n.d}</b><span>${n.m}</span></div><div><h3>${esc(n.t)}</h3><p>${esc(n.p)}</p></div></div>`).join('')}
    </div>
    <div style="text-align:center;margin-top:26px"><a class="btn btn-ghost" href="#/news">查看全部公告</a></div>
  </div></div>
  <div class="band"><h2>寄快递，就找哪都通</h2><p>上门取件 · 在线下单 · 全程保价</p><a class="btn btn-orange" href="#/service">立即寄件</a></div>`
  +surfaceFooter();
}

/* ---------- 新闻数据 ---------- */
function viewNewsList(n){
  const all=[
    {d:'18',m:'10月',t:'哪都通新增 12 个城市次日达线路',p:'华东、西南地区转运网络升级，更多城市实现次日达。'},
    {d:'10',m:'10月',t:'国庆假期快递服务安排公告',p:'假期期间正常揽收派送，部分偏远地区时效略有调整。'},
    {d:'26',m:'09月',t:'哪都通快递员安全驾驶培训圆满完成',p:'全国各网点开展安全驾驶与服务规范专项培训。'},
    {d:'15',m:'09月',t:'生鲜寄递专项通道上线',p:'冷链包装、优先中转，为生鲜包裹提供全程保障。'},
    {d:'01',m:'09月',t:'哪都通开展秋季客户服务月活动',p:'服务升级，保价理赔流程进一步简化。'},
    {d:'20',m:'08月',t:'智能分拣中心投入使用',p:'自动化分拣大幅提升中转效率与准确率。'}
  ];
  return all.slice(0,n||all.length);
}
function viewNews(){
  return surfaceHeader('news')+`<div class="page-head"><div class="wrap"><h1>新闻公告</h1><p>哪都通最新动态与服务通知</p></div></div>
  <div class="section"><div class="wrap"><div class="card-box">
    ${viewNewsList().map(n=>`<div class="news-item"><div class="nd"><b>${n.d}</b><span>${n.m}</span></div><div><h3>${esc(n.t)}</h3><p>${esc(n.p)}</p></div></div>`).join('')}
  </div></div></div>`+surfaceFooter();
}

/* ---------- 网点查询（七大区） ---------- */
const REGIONS=[
 {id:'huabei',name:'华北区',hq:'北京 · 华北大区管理中心',outlets:[
   {city:'北京',addr:'海淀区中关村大街 27 号',tel:'010-8800****'},
   {city:'天津',addr:'和平区南营门街 12 号',tel:'022-2700****'},
   {city:'石家庄',addr:'长安区建设北大街 60 号',tel:'0311-8600****'},
   {city:'太原',addr:'迎泽区解放南路 18 号',tel:'0351-4000****'},
   {city:'呼和浩特',addr:'新城区新华大街 88 号',tel:'0471-6900****'}]},
 {id:'huadong',name:'华东区',hq:'上海 · 华东大区管理中心',outlets:[
   {city:'上海',addr:'浦东新区张江高科技园区博云路 2 号',tel:'021-5800****'},
   {city:'南京',addr:'鼓楼区中山北路 30 号',tel:'025-8300****'},
   {city:'杭州',addr:'西湖区文三路 259 号',tel:'0571-8800****'},
   {city:'合肥',addr:'庐阳区长江中路 150 号',tel:'0551-6200****'},
   {city:'福州',addr:'鼓楼区五四路 158 号',tel:'0591-8700****'},
   {city:'南昌',addr:'东湖区八一大道 368 号',tel:'0791-8600****'},
   {city:'济南',addr:'历下区泉城路 188 号',tel:'0531-8600****'}]},
 {id:'huanan',name:'华南区',hq:'广州 · 华南大区管理中心',outlets:[
   {city:'广州',addr:'天河区天河路 208 号',tel:'020-8700****'},
   {city:'深圳',addr:'福田区华强北路 1050 号',tel:'0755-8300****'},
   {city:'南宁',addr:'青秀区民族大道 136 号',tel:'0771-5500****'},
   {city:'海口',addr:'龙华区国贸路 45 号',tel:'0898-6600****'}]},
 {id:'huazhong',name:'华中区',hq:'武汉 · 华中大区管理中心',outlets:[
   {city:'郑州',addr:'金水区花园路 100 号',tel:'0371-6500****'},
   {city:'武汉',addr:'江汉区解放大道 690 号',tel:'027-8500****'},
   {city:'长沙',addr:'芙蓉区五一大道 589 号',tel:'0731-8400****'}]},
 {id:'xinan',name:'西南区',hq:'成都 · 西南大区管理中心',outlets:[
   {city:'重庆',addr:'渝中区解放碑民族路 128 号',tel:'023-6300****'},
   {city:'成都',addr:'武侯区科华北路 62 号',tel:'028-8500****'},
   {city:'贵阳',addr:'云岩区中华中路 120 号',tel:'0851-8500****'},
   {city:'昆明',addr:'五华区东风西路 99 号',tel:'0871-6300****'},
   {city:'拉萨',addr:'城关区北京中路 46 号',tel:'0891-6300****'}]},
 {id:'xibei',name:'西北区',hq:'西安 · 西北大区管理中心',outlets:[
   {city:'西安',addr:'雁塔区高新路 25 号',tel:'029-8800****'},
   {city:'兰州',addr:'城关区庆阳路 168 号',tel:'0931-8400****'},
   {city:'西宁',addr:'城西区五四大街 38 号',tel:'0971-6100****'},
   {city:'银川',addr:'兴庆区解放西街 126 号',tel:'0951-6000****'},
   {city:'乌鲁木齐',addr:'天山区光明路 118 号',tel:'0991-2800****'}]},
 {id:'dongbei',name:'东北区',hq:'沈阳 · 东北大区管理中心',outlets:[
   {city:'沈阳',addr:'沈河区青年大街 126 号',tel:'024-2200****'},
   {city:'长春',addr:'朝阳区人民大街 4500 号',tel:'0431-8800****'},
   {city:'哈尔滨',addr:'南岗区红军街 50 号',tel:'0451-5300****'}]}
];
function viewSites(){
  const tabs=REGIONS.map((r,i)=>`<button class="site-tab ${i===0?'on':''}" data-site-tab="${r.id}">${r.name}</button>`).join('');
  const panels=REGIONS.map((r,i)=>`<div class="site-panel" data-site-panel="${r.id}" ${i?'hidden':''}>
    <div class="region-hq"><span class="rhq-ic">◈</span>大区管理中心：${esc(r.hq)}</div>
    <div class="outlet-grid">${r.outlets.map(o=>`<div class="card-box outlet-card">
      <h4>${esc(o.city)}</h4>
      <div class="muted">地址：${esc(o.addr)}</div>
      <div class="muted">电话：${esc(o.tel)}</div>
      <div class="muted" style="margin-top:6px">营业时间：08:30 - 18:00</div>
    </div>`).join('')}</div>
  </div>`).join('');
  return surfaceHeader('sites')+`<div class="page-head"><div class="wrap"><h1>网点查询</h1><p>全国七大区网点一览，就近选择</p></div></div>
  <div class="section"><div class="wrap">
    <div class="site-tabs">${tabs}</div>
    ${panels}
  </div></div>`+surfaceFooter();
}

/* ---------- 快递查询 ---------- */
function packageStamp(date){
  const p=n=>String(n).padStart(2,'0');
  return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}`;
}
function genPackage(code){
  // 用运单号生成稳定的模拟路径；日期通过 Date 运算处理跨月/跨年，避免拼出 2026-10--1 之类非法日期。
  const normalized=String(code||'').trim().toUpperCase();
  let h=0;for(let i=0;i<normalized.length;i++)h=(Math.imul(h,31)+normalized.charCodeAt(i))>>>0;
  const cities=['北京','上海','广州','成都','武汉','西安','青岛','杭州','南京','重庆'];
  const fromIndex=h%cities.length;
  let toIndex=(h>>>3)%cities.length;
  if(toIndex===fromIndex)toIndex=(toIndex+3)%cities.length;
  const from=cities[fromIndex],to=cities[toIndex];
  const stage=h%4;
  const base=new Date();base.setHours(9,0,0,0);
  const makeTime=(dayOffset,hour,minute)=>{const d=new Date(base);d.setDate(d.getDate()+dayOffset);d.setHours(hour,minute,0,0);return packageStamp(d);};
  const all=[
    {t:makeTime(-2,10,12),title:'已揽收',desc:`${from}始发营业部已完成揽收，包裹等待发往分拨中心。`},
    {t:makeTime(-1,4,26),title:'运输中',desc:`包裹已到达${from}转运中心，正在进行分拣与装车。`},
    {t:makeTime(0,7,48),title:'到达目的地',desc:`包裹已抵达${to}分拨中心，准备转入末端网点。`},
    {t:makeTime(0,9,16),title:'派送中',desc:`${to}派送员已接收包裹，正在按路线派送。`},
    {t:makeTime(0,11,8),title:'已签收',desc:'包裹已完成签收，感谢使用哪都通。'}
  ];
  const visibleCount=[1,2,3,4,5][stage];
  const timeline=all.slice(0,visibleCount).map((x,i)=>({...x,state:i===visibleCount-1?'cur':'done'}));
  const states=['已揽收','运输中','派送中','已签收'];
  // stage 2 显示派送状态，stage 3 显示签收；目的地到达作为上一节点。
  if(stage===2){timeline[timeline.length-1].title='派送中';timeline[timeline.length-1].desc=`${to}派送员已接收包裹，正在按路线派送。`;timeline[timeline.length-1].t=makeTime(0,9,16);}
  if(stage===3){timeline[timeline.length-1].state='done';timeline.push({...all[4],state:'cur'});}
  return {id:genId('pk'),code:normalized,from:`${from}转运中心`,to:`${to}派送网点`,weight:'待称重',status:states[stage],timeline};
}
function isValidPackageStamp(value){
  if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(String(value||'')))return false;
  return Number.isFinite(new Date(String(value).replace(' ','T')).getTime());
}
function findOrGen(code){
  const normalized=String(code||'').trim().toUpperCase();
  let pk=(DB.data.packages||[]).find(x=>String(x.code||'').trim().toUpperCase()===normalized);
  if(!pk){if(!/^NDT/i.test(normalized)||DB.data.packages.length<200){pk=genPackage(normalized);if(!Array.isArray(DB.data.packages))DB.data.packages=[];DB.data.packages.push(pk);DB.save();}else{pk=genPackage(normalized);}}
  // 修复历史版本可能保存下来的非法日期（例如跨月时出现的 2026-10--1）。
  if(!Array.isArray(pk.timeline))pk.timeline=[];
  const hasInvalidDate=pk.timeline.some(x=>x&&x.t&&!isValidPackageStamp(x.t));
  if(hasInvalidDate){
    const fixed=genPackage(normalized),keepId=pk.id;
    Object.assign(pk,fixed,{id:keepId||fixed.id,code:normalized});DB.save();
  }else{
    pk.timeline=pk.timeline.filter(x=>x&&x.title).map(x=>({...x,t:String(x.t||''),desc:String(x.desc||'物流节点已更新，详情请以最新状态为准。')}));
  }
  return pk;
}
function trackHtml(pk){
  return `<div class="card-box" style="margin-bottom:20px">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;align-items:center">
      <div><b style="font-size:17px">${esc(pk.code)}</b><span class="tag ${pk.status==='已签收'?'tag-green':'tag-orange'}" style="margin-left:10px">${esc(pk.status)}</span></div>
      <div class="muted" style="font-size:13px">${esc(pk.from)} → ${esc(pk.to)} | 重量 ${esc(pk.weight)}</div>
    </div></div>
    <div class="card-box"><div class="tl">
      ${pk.timeline.filter(x=>x&&x.title).map(x=>`<div class="tl-item ${esc(x.state||'')} ${x.state==='cur'?'current':''}"><div class="t">${esc(x.t||'时间待更新')}</div><h4>${esc(x.title)}</h4><p>${esc(x.desc||'物流节点已更新，详情请以最新状态为准。')}</p></div>`).join('')||'<div class="empty">暂无物流轨迹</div>'}
    </div></div>`;
}
function viewTrack(code){
  return surfaceHeader('track')+`<div class="page-head"><div class="wrap"><h1>快递查询</h1><p>输入运单号，实时查询包裹动态</p></div></div>
  <div class="section"><div class="wrap">
    <div class="track-box" style="max-width:none;margin:0 0 28px"><input id="tb-code" placeholder="请输入运单号，如 NDT7770001234" value="${esc(code||'')}"><button class="btn btn-orange" id="tb-go">查询</button></div>
    <div id="track-result">${code?trackHtml(findOrGen(code)):`<div class="card-box empty" style="color:var(--muted)"><div class="es">📦</div>请输入运单号开始查询<br><span style="font-size:12.5px">试试示例单号：NDT7770001234 或 NDT6660005678</span></div>`}</div>
  </div></div>`+surfaceFooter();
}

/* ---------- 寄件服务 ---------- */
function viewService(){
  return surfaceHeader('service')+`<div class="page-head"><div class="wrap"><h1>寄件服务</h1><p>在线下单，快递员上门取件</p></div></div>
  <div class="section"><div class="wrap"><div class="grid g2">
    <div class="card-box">
      <h3 style="margin-bottom:6px">在线下单</h3><p class="muted" style="font-size:13.5px;margin-bottom:10px">填写寄件信息，我们将安排快递员上门取件。</p>
      <label class="fl">寄件人姓名</label><input class="field" id="s-name" placeholder="请输入姓名">
      <label class="fl">取件地址</label><input class="field" id="s-addr" placeholder="请输入详细地址">
      <label class="fl">收件地址</label><input class="field" id="s-to" placeholder="请输入收件地址">
      <label class="fl">物品类型</label><select class="field" id="s-type"><option>普通物品</option><option>文件</option><option>生鲜</option><option>易碎品</option></select>
      <button class="btn btn-block" style="margin-top:20px" id="s-sub">提交订单</button>
    </div>
    <div>
      <div class="card-box" style="margin-bottom:18px"><h3>运费参考</h3>
        <table style="width:100%;margin-top:12px;border-collapse:collapse;font-size:14px">
          <tr style="background:#F2F5FC"><th style="padding:10px;text-align:left">服务类型</th><th style="padding:10px;text-align:left">时效</th><th style="padding:10px;text-align:left">首重价</th></tr>
          <tr><td style="padding:10px">同城急送</td><td>当日达</td><td>12 元起</td></tr>
          <tr><td style="padding:10px">标准快递</td><td>1-3 日</td><td>10 元起</td></tr>
          <tr><td style="padding:10px">航空快运</td><td>次日达</td><td>23 元起</td></tr>
        </table></div>
      <div class="card-box"><h3>包装与保价</h3><p class="muted" style="font-size:13.5px;margin-top:8px">提供纸箱、防水袋、防震包装；贵重物品可声明保价，丢损按保价金额赔付。</p></div>
    </div>
  </div></div></div>`+surfaceFooter();
}

/* ---------- 关于我们 ---------- */
function viewAbout(){
  return surfaceHeader('about')+`<div class="page-head"><div class="wrap"><h1>关于我们</h1><p>哪都通快递——您的包裹，无处不达</p></div></div>
  <div class="section"><div class="wrap"><div class="card-box" style="max-width:860px;margin:0 auto">
    <h3 style="margin-bottom:10px">公司简介</h3>
    <p style="color:var(--muted);line-height:1.9">哪都通快递有限公司是一家全国性综合快递物流企业，服务网络覆盖全国 31 个省、自治区、直辖市。公司始终秉承"安全、准时、可信赖"的服务理念，为千千万万客户提供包裹揽收、中转、派送的一体化服务。</p>
    <h3 style="margin:24px 0 10px">我们的承诺</h3>
    <div class="grid g3" style="gap:14px">
      <div class="svc-card" style="padding:20px"><h3 style="font-size:15px">准时</h3><p>高效中转网络，时效有保障。</p></div>
      <div class="svc-card" style="padding:20px"><h3 style="font-size:15px">安全</h3><p>全程追踪，保价理赔。</p></div>
      <div class="svc-card" style="padding:20px"><h3 style="font-size:15px">贴心</h3><p>7×24 小时客户服务。</p></div>
    </div>
    <h3 style="margin:24px 0 10px">联系方式</h3>
    <p style="color:var(--muted);line-height:2">客服热线：400-888-0000<br>商务合作：商务合作部（请通过官网业务合作入口联系）<br>总部地址：华北区域运营中心</p>
  </div></div></div>`+surfaceFooter();
}

/* ---------- 隐藏页面：作者信息（仅通过页脚入口访问） ---------- */
function viewAuthorInfo(){
  return surfaceHeader()+`<div class="page-head"><div class="wrap"><h1>作者信息</h1></div></div>
  <div class="section"><div class="wrap"><div class="card-box" style="max-width:680px;margin:0 auto;line-height:2.1">
    <p><strong>本网站作者：</strong>闻沄鉴</p>
    <p><strong>抖音：</strong>Wenyunjian63</p>
    <p><strong>红薯：</strong>95634279293</p>
    <p style="margin-top:14px">本网站为非营利同人产物</p>
    <p>如果你对乙代梦抱有恶意请不要使用本网站</p>
  </div></div></div>`+surfaceFooter();
}

/* ---------- 明面登录 / 注册 ---------- */
function viewLogin(){
  return surfaceHeader()+`<div class="section"><div class="wrap"><div class="card-box" style="max-width:420px;margin:0 auto">
    <h3 style="text-align:center;font-size:20px;margin-bottom:4px">登录哪都通</h3>
    <p class="muted" style="text-align:center;font-size:13px;margin-bottom:16px">员工可用工号登录，普通用户用昵称登录</p>
    <label class="fl">账号 / 工号</label><input class="field" id="lg-acc" placeholder="昵称 或 NDT-0001">
    <label class="fl">密码</label><input class="field" id="lg-pwd" type="password" placeholder="请输入密码">
    <button class="btn btn-block" style="margin-top:20px" id="lg-go">登录</button>
    <p style="text-align:center;margin-top:16px;font-size:13.5px" class="muted">还没有账号？<a href="#/register">立即注册</a></p>
  </div></div></div>`+surfaceFooter();
}
function viewRegister(){
  return surfaceHeader()+`<div class="section"><div class="wrap"><div class="card-box" style="max-width:420px;margin:0 auto">
    <h3 style="text-align:center;font-size:20px;margin-bottom:4px">注册哪都通</h3>
    <p class="muted" style="text-align:center;font-size:13px;margin-bottom:16px">注册后可在异人论坛发帖交流</p>
    <label class="fl">昵称</label><input class="field" id="rg-name" placeholder="给自己起个昵称">
    <label class="fl">密码</label><input class="field" id="rg-pwd" type="password" placeholder="设置一个密码">
    <button class="btn btn-orange btn-block" style="margin-top:20px" id="rg-go">注册并登录</button>
    <p style="text-align:center;margin-top:16px;font-size:13.5px" class="muted">已有账号？<a href="#/login">直接登录</a></p>
  </div></div></div>`+surfaceFooter();
}

/* ==================================================================
   暗面：异人内网
   ================================================================== */
function svgIco(n){
  const p={
    box:'M3 7l9-4 9 4-9 4-9-4zm0 0v10l9 4 9-4V7M12 11v10',
    truck:'M3 6h11v9H3zM14 9h4l3 3v3h-7M7.5 18.5a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6zm10 0a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6z',
    plane:'M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z',
    biz:'M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01',
    search:'M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-4.3-4.3',
    pen:'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z',
    user:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
    users:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8',
    file:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h6',
    clock:'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
    book:'M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5zM4 19.5V22h16',
    home:'M3 12l9-9 9 9M5 10v10h14V10',
    gear:'M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 00-.1-1.3l2-1.6-2-3.4-2.4 1a7.4 7.4 0 00-2.2-1.3L14.3 2h-4.6l-.4 2.4A7.4 7.4 0 007 5.7l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 000 2.6l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 002.2 1.3l.4 2.4h4.6l.4-2.4a7.4 7.4 0 002.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3z',
    shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    cloud:'M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.7 1.6A4 4 0 0 0 6.5 19z',
    back:'M19 12H5M12 19l-7-7 7-7'
  };
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${p[n]||p.file}"/></svg>`;
}
function lvlName(l){return ['','普通异人','哪都通员工','管理员'][l]||'';}
function unreadCount(section){
  const d=DB.data||{};
  if(section==='forum'){
    if(Cloud.connected)return Cloud.notif.unread||0;
    const u=DB.user;return u?(d.forumNotices||[]).filter(n=>n.userId===u.id&&!n.read&&n.kind!=='growth').reduce((s,n)=>s+Math.max(1,Number(n.count)||1),0):0;}
  if(section==='messages')return Object.values(d.chats||{}).reduce((n,c)=>n+Math.max(0,Number(c&&c.unread)||0),0);
  if(section==='room')return (d.rooms||[]).reduce((n,r)=>n+Math.max(0,Number(r&&r.unread)||0),0);
  if(section==='workgroup')return Math.max(0,Number((d.workgroup||{}).unread)||0);
  if(section==='oa'){
    const u=DB.user;if(!u)return 0;
    if(Number(u.level)>=3)return (d.oa||[]).filter(x=>x.status==='pending').length;
    const seen=Number(u.oaSeenAt)||0;
    return (d.oa||[]).filter(x=>x.userId===u.id&&x.status!=='pending'&&Number(x.reviewedAt||0)>seen).length;
  }
  return 0;
}
function unreadBadge(count,cls='side-unread-badge'){
  const n=Math.max(0,Number(count)||0);return n?`<span class="${cls}" aria-label="${n} 条未读消息">${n>99?'99+':n}</span>`:'';
}
function syncUnreadBadges(){
  const map={forum:0,'forum-notices':unreadCount('forum'),messages:unreadCount('messages'),room:unreadCount('room'),workgroup:unreadCount('workgroup'),oa:unreadCount('oa')};
  Object.entries(map).forEach(([id,count])=>{
    const item=$(`.side-item[data-section="${id}"]`);if(!item)return;
    let badge=item.querySelector('.side-unread-badge');
    if(count){if(!badge){badge=document.createElement('span');badge.className='side-unread-badge';item.appendChild(badge);}badge.textContent=count>99?'99+':String(count);badge.setAttribute('aria-label',count+' 条未读消息');}
    else if(badge)badge.remove();
  });
}
function portalShell(active,content){
  const u=DB.user;
  const item=(hash,ico,name,minLvl,id)=>{
    const locked=minLvl&&u.level<minLvl;
    const section=['forum','forum-notices','messages','room','workgroup','oa'].includes(id)?id:'';
    const unreadKey=section==='forum-notices'?'forum':section;
    // 论坛首页不显示未读红点；回复与点赞的未读提示只在“帖子消息”里生效。
    const badge=(section&&id!=='forum')?unreadBadge(unreadCount(unreadKey)):'';
    return `<div class="side-item ${active===id?'on':''}" data-section="${section}" data-hash="${locked?'':hash}">${svgIco(ico)}<span class="side-item-label">${name}</span>${badge}${locked?'<span class="lock">锁</span>':''}</div>`;
  };
  const th=DB.data.theme||'default';
  const themeClasses={day:'theme-day',classic:'theme-classic',cyber:'theme-cyber',rose:'theme-rose',aurora:'theme-aurora'};
  const thCls=themeClasses[th]||'';
  const themeBtn=(v,label)=>`<button data-theme-set="${v}" class="${th===v?'on':''}">${label}</button>`;
  return `<div class="portal ${thCls} portal--${active||'none'}">
    <div class="portal-top">
      <div class="p-logo" id="p-home"><span class="mk">${svgIco('shield')}</span>哪都通 · 异人论坛<small>YIREN FORUM</small></div>
      <div class="theme-switch" title="整体主题">
        ${themeBtn('default','默认')}${themeBtn('day','日间')}${themeBtn('classic','古风卷宗')}${themeBtn('cyber','赛博霓虹')}${themeBtn('rose','玫瑰金')}${themeBtn('aurora','极光星河')}
      </div>
      <div class="user-chip" id="p-space">
        <div class="av">${avHtml(u,'av')}</div>
        <div class="un">${esc(u.name)}<small>${lvlName(u.level)}</small></div>
      </div>
      <button class="btn btn-sm btn-ghost" id="p-logout" style="margin-left:0">退出论坛</button>
    </div>
    <div class="portal-body">
      <div class="nav-wrap">
      <aside class="sidebar">
        <div class="sd-group">论坛</div>
        ${item('#/forum','home','论坛首页',0,'forum')}
        ${item('#/forum-notices','bell','帖子消息',0,'forum-notices')}
        ${item('#/wanted','shield','在逃异人',0,'wanted')}
        ${item('#/codex','book-open','异闻典藏',0,'codex')}
        ${item('#/ask','pen','发帖提问',0,'ask')}
        ${item('#/room','users','论坛聊天室',0,'room')}
        ${item('#/cloud','cloud','云端账号',0,'cloud')}
        <div class="sd-group">业务系统</div>
        ${item('#/archives','file','异人档案',2,'archives')}
        ${item('#/events','clock','事件档案',2,'events')}
        ${item('#/library','book','资料库',2,'library')}
        ${u.level>=2?item('#/network/factions','users','势力关系网',2,'network-factions'):''}
        ${u.level>=2?item('#/network/keyPeople','users','重点异人关系网',2,'network-keyPeople'):''}
        ${u.level>=2?item('#/staff-card','biz','专属名片',2,'staff-card'):''}
        ${u.level>=2?item('#/workgroup','users','工作组',2,'workgroup'):''}
        ${u.level>=2?item('#/oa','file','OA 办公',2,'oa'):''}
        ${u.level>=3?item('#/dashboard','gear','管理员工作台',3,'dashboard'):''}
        <div class="sd-group">个人</div>
        ${item('#/messages','users','私信',0,'messages')}
        ${item('#/friends','users','我的好友',0,'friends')}
        ${item('#/divination','clock','抽签问吉',0,'divination')}
        ${item('#/yijing','book','伏羲六十四卦',0,'yijing')}
        ${item('#/space/me','user','个人空间',0,'space')}
        ${item('#/ability','star','个人能力详情',0,'ability')}
        ${item('#/tetris','biz','方块小游戏',0,'tetris')}
        ${item('#/decorate','pen','空间装修',0,'decorate')}
        ${item('#/settings','gear','数据中心',0,'settings')}
      </aside>
      </div>
      <main class="p-main">${content}</main>
    </div></div>`;
}

/* ---------- 员工 / 管理员专属名片 ---------- */
function staffCardOf(u){
  const stored=u.staffCard&&typeof u.staffCard==='object'?u.staffCard:{};
  const fallbackNo=u.code||(u.id?'NDT-'+String(u.id).replace(/[^a-z0-9]/gi,'').slice(-6).toUpperCase():'');
  return {
    displayName:stored.displayName??u.name??'',
    employeeNo:stored.employeeNo??fallbackNo,
    department:stored.department??'待分配部门',
    position:stored.position??(u.level>=3?'管理员':'正式员工'),
    rank:stored.rank??(u.level>=3?'管理岗':'员工'),
    joinDate:stored.joinDate??(u.regAt?u.regAt.slice(0,10):''),
    workStatus:stored.workStatus??'在职',
    contact:stored.contact??'',
    specialty:stored.specialty??'',
    motto:stored.motto??'恪尽职守，使命必达。',
    profile:stored.profile??''
  };
}
function viewStaffCard(){
  const u=DB.user;
  if(!u||u.level<2)return portalShell('staff-card',accessDenied());
  const c=staffCardOf(u);
  const show=(v,alt='未填写')=>esc(v||alt);
  const html=`<div class="p-crumb">内部业务系统 / <b>专属名片</b></div>
    <div class="p-panel">
      <h2>我的专属名片</h2>
      <div class="ph-sub">员工与管理员专属 · 展示个人岗位档案，可随时修改并保存</div>
      <section class="staff-card-preview" aria-label="专属人员名片预览">
        <div class="staff-card-top">
          <div class="staff-emblem">${svgIco('shield')}</div>
          <div class="staff-card-brand">哪都通 · 内部人员名片<small>STAFF IDENTITY CARD / CONFIDENTIAL</small></div>
          <span class="lvl-badge ${u.level>=3?'lvl-3':'lvl-2'}">${esc(lvlName(u.level))}</span>
        </div>
        <div class="staff-card-hero">
          <div class="staff-card-avatar">${esc(avText(c.displayName||u.name))}</div>
          <div style="min-width:0">
            <span class="staff-card-eyebrow">OFFICIAL PROFILE</span>
            <h3>${show(c.displayName,u.name)}</h3>
            <p>${show(c.position,u.level>=3?'管理员':'正式员工')} · ${show(c.department,'待分配部门')}</p>
          </div>
        </div>
        <div class="staff-card-grid">
          <div class="staff-card-item"><span>员工工号</span><b>${show(c.employeeNo)}</b></div>
          <div class="staff-card-item"><span>职务级别</span><b>${show(c.rank)}</b></div>
          <div class="staff-card-item"><span>入职日期</span><b>${show(c.joinDate)}</b></div>
          <div class="staff-card-item"><span>在职状态</span><b>${show(c.workStatus)}</b></div>
          <div class="staff-card-item"><span>工作联系方式</span><b>${show(c.contact)}</b></div>
          <div class="staff-card-item"><span>专长 / 所属小组</span><b>${show(c.specialty)}</b></div>
        </div>
        <div class="staff-card-note"><strong>个人简介 / 职责说明</strong>${show(c.profile,'暂无简介，可在下方编辑。')}</div>
        <div class="staff-card-note"><strong>个人格言</strong>${show(c.motto,'暂无格言')}</div>
      </section>
    </div>
    <div class="p-panel">
      <h2>编辑名片信息</h2>
      <div class="ph-sub">以下信息由你自行维护；留空的字段会在名片上显示“未填写”</div>
      <div class="staff-card-edit-grid">
        <div><label class="fl" for="sc-name">名片姓名 / 称呼</label><input class="field" id="sc-name" maxlength="40" value="${esc(c.displayName)}" placeholder="填写展示姓名"></div>
        <div><label class="fl" for="sc-no">员工工号</label><input class="field" id="sc-no" maxlength="40" value="${esc(c.employeeNo)}" placeholder="例如 NDT-0001"></div>
        <div><label class="fl" for="sc-dept">部门 / 所属区域</label><input class="field" id="sc-dept" maxlength="80" value="${esc(c.department)}" placeholder="例如华北区 / 北京分部"></div>
        <div><label class="fl" for="sc-position">职务</label><input class="field" id="sc-position" maxlength="60" value="${esc(c.position)}" placeholder="例如区域调度员"></div>
        <div><label class="fl" for="sc-rank">职务级别 / 职称</label><input class="field" id="sc-rank" maxlength="60" value="${esc(c.rank)}" placeholder="例如主管 / 资深员工"></div>
        <div><label class="fl" for="sc-date">入职日期</label><input class="field" id="sc-date" type="date" value="${esc(c.joinDate)}"></div>
        <div><label class="fl" for="sc-status">在职状态</label><input class="field" id="sc-status" maxlength="40" value="${esc(c.workStatus)}" placeholder="例如在职 / 外勤中"></div>
        <div><label class="fl" for="sc-contact">工作联系方式</label><input class="field" id="sc-contact" maxlength="100" value="${esc(c.contact)}" placeholder="可填写内线或工作邮箱"></div>
        <div class="wide"><label class="fl" for="sc-specialty">专长 / 所属小组</label><input class="field" id="sc-specialty" maxlength="120" value="${esc(c.specialty)}" placeholder="例如情报研判、异常件处置、运输调度"></div>
        <div class="wide"><label class="fl" for="sc-profile">个人简介 / 职责说明</label><textarea class="field" id="sc-profile" maxlength="600" rows="3" placeholder="介绍你的工作职责、负责区域或个人经历">${esc(c.profile)}</textarea></div>
        <div class="wide"><label class="fl" for="sc-motto">个人格言</label><input class="field" id="sc-motto" maxlength="120" value="${esc(c.motto)}" placeholder="例如恪尽职守，使命必达。"></div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px"><button type="button" class="btn btn-orange" id="sc-save">保存名片</button><button type="button" class="btn btn-ghost" id="sc-cancel">放弃本次修改</button></div>
      <div class="staff-card-hint">说明：本网站当前使用浏览器本地存储，保存的信息只会保存在当前浏览器的数据中；清理浏览器数据或更换设备前，请在“数据中心”导出备份。</div>
    </div>`;
  return portalShell('staff-card',html);
}

/* ---------- 进入内网：高级感加载动效 ---------- */
function enterPortal(targetHash){
  if(document.getElementById('portal-entry')){location.hash=targetHash;return;}
  const steps=['建立加密安全通道','校验身份凭证','同步异人档案','接入异人论坛'];
  const ov=document.createElement('div');
  ov.id='portal-entry';
  ov.className='portal-entry';
  ov.innerHTML=`
    <div class="pe-bg"></div>
    <div class="pe-box">
      <div class="pe-ring">
        <div class="pe-ring-rot"></div>
        <div class="pe-ring-rot pe-ring-rot2"></div>
        <div class="pe-shield">${svgIco('shield')}</div>
      </div>
      <div class="pe-title">哪都通 · 异人论坛</div>
      <div class="pe-step" id="pe-step">${steps[0]}<span class="pe-dots"></span></div>
      <div class="pe-bar"><div class="pe-bar-fill" id="pe-bar-fill"></div></div>
      <div class="pe-percent" id="pe-percent">0%</div>
    </div>`;
  document.body.appendChild(ov);
  document.body.style.overflow='hidden';
  requestAnimationFrame(()=>ov.classList.add('is-in'));
  let i=0;
  const stepTimer=setInterval(()=>{i++;if(i<steps.length){const s=$('#pe-step');if(s)s.innerHTML=steps[i]+'<span class="pe-dots"></span>';}},420);
  let p=0;
  const progTimer=setInterval(()=>{
    p=Math.min(100,p+Math.random()*13+7);
    const f=$('#pe-bar-fill');if(f)f.style.width=p+'%';
    const pc=$('#pe-percent');if(pc)pc.textContent=Math.floor(p)+'%';
    if(p>=100){clearInterval(progTimer);clearInterval(stepTimer);}
  },110);
  setTimeout(()=>{
    location.hash=targetHash;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      ov.classList.add('is-leaving');document.body.style.overflow='';
      setTimeout(()=>ov.remove(),620);
    }));
  },1720);
}

/* ---------- 内网登录门 ---------- */
function viewGate(){
  if(DB.user)return viewForum();
  return `<div class="staff-gate" style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:
    radial-gradient(900px 500px at 70% -10%,rgba(46,71,184,.35),transparent),#0C1740">
    <div style="width:100%;max-width:420px">
      <div class="p-panel" style="text-align:center">
        <div style="width:60px;height:60px;border-radius:14px;background:var(--blue-2);display:flex;align-items:center;justify-content:center;margin:0 auto 14px">${svgIco('shield')}</div>
        <h2>哪都通异人论坛</h2><div class="ph-sub">本系统仅供授权人员使用，所有操作均会记录</div>
        <div style="text-align:left">
          <label class="fl">账号 / 工号</label>
          <input class="field" id="g-acc" placeholder="昵称 或 NDT-0001">
          <label class="fl">密码</label>
          <input class="field" id="g-pwd" type="password" placeholder="请输入密码">
          <button class="btn btn-orange btn-block" style="margin-top:20px" id="g-go">登录</button>
          <button class="btn btn-block" style="margin-top:10px;background:#16255F;border-color:#2A3A7E" id="g-reg">注册普通账号</button>
        </div>
        <div class="ph-sub" style="margin-top:18px;font-size:12px;line-height:1.8">
          无初始账号，请先注册；登录后在「数据中心」输入激活码：<br>
          员工码 NDT-EMP · 管理员码 NDT-MGR · 恢复普通异人 NDT-USER</div>
      </div>
      <div style="text-align:center;margin-top:14px"><a href="#/" style="color:#6E7FBE;font-size:13px">← 返回快递官网</a></div>
    </div></div>`;
}


/* ---------- 论坛关键词自动回复与回帖通知 ---------- */
const DEFAULT_FORUM_AUTO_REPLY_RULES=[
  {id:'rule-oa',enabled:true,keys:['请假','加班','报销','oa','审批','申请','打卡'],reply:'这类事项建议先在 OA 办公中提交申请，填写清楚事由和时间，再留意审批结果。'},
  {id:'rule-group',enabled:true,keys:['工作组','群聊','群消息','聊天室'],reply:'需要协作的话，可以到工作组或论坛聊天室联系相关成员；涉及内部信息时注意权限范围。'},
  {id:'rule-notify',enabled:true,keys:['通知','提醒','手机','后台','推送','消息提示'],reply:'如果需要手机后台提醒，请先在论坛点击“开启回复提醒”并允许浏览器通知。网页保持本地运行时才能处理本地事件；跨设备推送还需要后台服务。'},
  {id:'rule-help',enabled:true,keys:['求助','怎么办','请问','求建议','不懂'],reply:'建议补充一下发生的时间、具体情况和已经尝试过的办法，这样其他成员更容易给出有针对性的建议。'},
  {id:'rule-cultivation',enabled:true,keys:['功法','修炼','术法','招式'],reply:'交流修习经验时，建议说明适用条件与风险，未经核实的传闻先标注来源，供大家交叉确认。'},
  {id:'rule-task',enabled:true,keys:['任务','行动','报备','联络'],reply:'涉及任务协作时，最好写明负责人、时间范围和紧急联络方式；敏感细节请转到有权限的内部渠道。'}
];
function forumAutoConfig(){
  const d=DB.data;
  if(!d.forumAutoReplyConfig||typeof d.forumAutoReplyConfig!=='object')d.forumAutoReplyConfig={enabled:true,frequency:'always',rules:DEFAULT_FORUM_AUTO_REPLY_RULES.map(r=>({...r,keys:[...r.keys]}))};
  const c=d.forumAutoReplyConfig;
  if(!Array.isArray(c.rules))c.rules=DEFAULT_FORUM_AUTO_REPLY_RULES.map(r=>({...r,keys:[...r.keys]}));
  if(!['always','half','third','rare'].includes(c.frequency))c.frequency='always';
  if(!Number.isFinite(Number(c.delayMin)))c.delayMin=3;if(!Number.isFinite(Number(c.delayMax)))c.delayMax=18;
  if(typeof c.enabled!=='boolean')c.enabled=true;
  return c;
}
function forumKeywordRule(text){
  const s=String(text||'').toLowerCase();
  const c=forumAutoConfig();
  return c.rules.find(rule=>rule.enabled!==false&&(rule.keys||[]).some(k=>String(k).trim()&&s.includes(String(k).trim().toLowerCase())))||null;
}
function forumKeywordReply(text){const r=forumKeywordRule(text);return r?String(r.reply||'').trim():'';}
function openForumAutoSettings(){
  const c=forumAutoConfig();
  const rowHtml=r=>`<div class="forum-rule-row" data-rule-row="${esc(r.id||genId('rule'))}" style="border:1px solid var(--pt-border);border-radius:10px;padding:10px;margin:10px 0;display:grid;gap:8px">
    <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" data-rule-enabled ${r.enabled===false?'':'checked'}> 启用此规则</label>
    <label class="fl" style="margin:0">关键词（逗号/顿号/换行分隔）</label><input class="field" data-rule-keys value="${esc((r.keys||[]).join('，'))}" placeholder="例如：请假，报销，打卡">
    <label class="fl" style="margin:0">自动回复内容</label><textarea class="field" data-rule-reply rows="3" placeholder="匹配后回复的内容">${esc(r.reply||'')}</textarea>
    <label class="fl" style="margin:0">回复显示名称</label><input class="field" data-rule-author value="${esc(r.authorName||'论坛助手')}" placeholder="例如：论坛助手、值班管理员">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px">
      <div><label class="fl" style="margin:0">单条触发频率</label><select class="field" data-rule-frequency><option value="global" ${(r.frequency||'global')==='global'?'selected':''}>跟随全局</option><option value="always" ${r.frequency==='always'?'selected':''}>每次</option><option value="half" ${r.frequency==='half'?'selected':''}>约 50%</option><option value="third" ${r.frequency==='third'?'selected':''}>约 33%</option><option value="rare" ${r.frequency==='rare'?'selected':''}>约 20%</option></select></div>
      <div><label class="fl" style="margin:0">最短延迟（秒）</label><input class="field" type="number" min="0" max="86400" data-rule-min value="${r.delayMin!=null&&Number.isFinite(Number(r.delayMin))?Number(r.delayMin):''}" placeholder="跟随全局"></div>
      <div><label class="fl" style="margin:0">最长延迟（秒）</label><input class="field" type="number" min="0" max="86400" data-rule-max value="${r.delayMax!=null&&Number.isFinite(Number(r.delayMax))?Number(r.delayMax):''}" placeholder="跟随全局"></div>
    </div>
    <button class="btn btn-sm btn-danger-soft" type="button" data-rule-delete style="justify-self:end">删除规则</button>
  </div>`;
  const mask=openMask(`<h3>论坛自动回复设置</h3><div class="m-body">
    <p class="ph-sub" style="margin-top:0">支持规则批量维护、JSON 导入导出、单条触发频率、延迟时间和自定义回复显示名。</p>
    <label style="display:flex;gap:8px;align-items:center;margin:10px 0"><input id="forum-auto-enabled" type="checkbox" ${c.enabled?'checked':''}> 开启关键词自动回复</label>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px">
      <div><label class="fl">全局触发频率</label><select id="forum-auto-frequency" class="field"><option value="always" ${c.frequency==='always'?'selected':''}>每次命中</option><option value="half" ${c.frequency==='half'?'selected':''}>约 50%</option><option value="third" ${c.frequency==='third'?'selected':''}>约 33%</option><option value="rare" ${c.frequency==='rare'?'selected':''}>约 20%</option></select></div>
      <div><label class="fl">全局最短延迟（秒）</label><input id="forum-auto-delay-min" class="field" type="number" min="0" max="86400" value="${Math.max(0,Number(c.delayMin)||0)}"></div>
      <div><label class="fl">全局最长延迟（秒）</label><input id="forum-auto-delay-max" class="field" type="number" min="0" max="86400" value="${Math.max(0,Number(c.delayMax)||0)}"></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0"><button class="btn btn-sm btn-ghost" type="button" id="forum-rule-add">＋ 添加规则</button><button class="btn btn-sm btn-ghost" type="button" id="forum-rule-bulk">批量添加</button><button class="btn btn-sm btn-ghost" type="button" id="forum-rule-export">导出规则 JSON</button><button class="btn btn-sm btn-ghost" type="button" id="forum-rule-import-btn">导入规则 JSON</button><input id="forum-rule-import-file" type="file" accept=".json,application/json" class="hide"></div>
    <div id="forum-rule-bulk-box" class="hide"><label class="fl">批量添加格式：每行一条，关键词 | 回复内容 | 回复人（可省略）</label><textarea class="field" id="forum-rule-bulk-text" rows="5" placeholder="请假,报销 | 请先提交 OA 申请。 | 事务助手&#10;工作组,群聊 | 请到对应工作组联系成员。 | 协作助手"></textarea><button class="btn btn-sm" type="button" id="forum-rule-bulk-apply" style="margin-top:8px">添加这些规则</button></div>
    <div id="forum-rule-list">${c.rules.map(rowHtml).join('')}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn btn-sm" type="button" id="forum-rule-save" style="margin-left:auto">保存设置</button></div>
    <div style="font-size:12px;color:var(--pt-muted);line-height:1.7;margin-top:10px">规则按列表顺序匹配，命中第一条后停止；不会对自动回复本身再次触发。延迟是网页运行中的计时，刷新或关闭页面可能中断等待中的回复。</div>
  </div>`);
  const list=mask.querySelector('#forum-rule-list');
  list.addEventListener('click',e=>{const b=e.target.closest('[data-rule-delete]');if(b)b.closest('[data-rule-row]').remove();});
  mask.querySelector('#forum-rule-add').addEventListener('click',()=>{list.insertAdjacentHTML('beforeend',rowHtml({id:genId('rule'),enabled:true,keys:[],reply:'',authorName:'论坛助手',frequency:'global'}));});
  mask.querySelector('#forum-rule-bulk').addEventListener('click',()=>mask.querySelector('#forum-rule-bulk-box').classList.toggle('hide'));
  mask.querySelector('#forum-rule-bulk-apply').addEventListener('click',()=>{const raw=mask.querySelector('#forum-rule-bulk-text').value;let n=0;raw.split(/\r?\n/).forEach(line=>{if(!line.trim())return;const parts=line.split('|').map(x=>x.trim());if(parts.length<2||!parts[0]||!parts[1])return;list.insertAdjacentHTML('beforeend',rowHtml({id:genId('rule'),enabled:true,keys:parts[0].split(/[，,、]/).map(x=>x.trim()).filter(Boolean),reply:parts[1],authorName:parts[2]||'论坛助手',frequency:'global'}));n++;});toast(`已添加 ${n} 条规则，请保存生效`,'ok');});
  mask.querySelector('#forum-rule-export').addEventListener('click',()=>{const data={version:1,exportedAt:new Date().toISOString(),config:{enabled:mask.querySelector('#forum-auto-enabled').checked,frequency:mask.querySelector('#forum-auto-frequency').value,delayMin:Number(mask.querySelector('#forum-auto-delay-min').value)||0,delayMax:Number(mask.querySelector('#forum-auto-delay-max').value)||0},rules:[...list.querySelectorAll('[data-rule-row]')].map(row=>({id:row.dataset.ruleRow,enabled:row.querySelector('[data-rule-enabled]').checked,keys:row.querySelector('[data-rule-keys]').value.split(/[，,、\n]/).map(x=>x.trim()).filter(Boolean),reply:row.querySelector('[data-rule-reply]').value.trim(),authorName:row.querySelector('[data-rule-author]').value.trim(),frequency:row.querySelector('[data-rule-frequency]').value,delayMin:row.querySelector('[data-rule-min]').value===''?null:Number(row.querySelector('[data-rule-min]').value),delayMax:row.querySelector('[data-rule-max]').value===''?null:Number(row.querySelector('[data-rule-max]').value)}))};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='论坛关键词自动回复规则.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  mask.querySelector('#forum-rule-import-btn').addEventListener('click',()=>mask.querySelector('#forum-rule-import-file').click());
  mask.querySelector('#forum-rule-import-file').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());const rules=Array.isArray(data)?data:(data.rules||data.config?.rules);if(!Array.isArray(rules))throw new Error('找不到 rules 规则列表');list.innerHTML='';rules.forEach(r=>list.insertAdjacentHTML('beforeend',rowHtml({...r,id:r.id||genId('rule'),keys:Array.isArray(r.keys)?r.keys:String(r.keys||'').split(/[，,、\n]/).filter(Boolean)})));const cfg=data.config||data;if(cfg.frequency)mask.querySelector('#forum-auto-frequency').value=cfg.frequency;if(cfg.enabled!==undefined)mask.querySelector('#forum-auto-enabled').checked=!!cfg.enabled;if(cfg.delayMin!==undefined)mask.querySelector('#forum-auto-delay-min').value=cfg.delayMin;if(cfg.delayMax!==undefined)mask.querySelector('#forum-auto-delay-max').value=cfg.delayMax;toast(`已导入 ${rules.length} 条规则，请检查后保存`,'ok');}catch(err){toast('导入失败：请使用本功能导出的 JSON 格式','err');}});
  mask.querySelector('#forum-rule-save').addEventListener('click',()=>{
    const rules=[...list.querySelectorAll('[data-rule-row]')].map(row=>({id:row.dataset.ruleRow||genId('rule'),enabled:row.querySelector('[data-rule-enabled]').checked,keys:row.querySelector('[data-rule-keys]').value.split(/[，,、\n]/).map(x=>x.trim()).filter(Boolean),reply:row.querySelector('[data-rule-reply]').value.trim(),authorName:row.querySelector('[data-rule-author]').value.trim()||'论坛助手',frequency:row.querySelector('[data-rule-frequency]').value,delayMin:row.querySelector('[data-rule-min]').value===''?null:Math.max(0,Number(row.querySelector('[data-rule-min]').value)||0),delayMax:row.querySelector('[data-rule-max]').value===''?null:Math.max(0,Number(row.querySelector('[data-rule-max]').value)||0)})).filter(r=>r.keys.length&&r.reply);
    c.enabled=mask.querySelector('#forum-auto-enabled').checked;c.frequency=mask.querySelector('#forum-auto-frequency').value;c.delayMin=Math.max(0,Number(mask.querySelector('#forum-auto-delay-min').value)||0);c.delayMax=Math.max(c.delayMin,Number(mask.querySelector('#forum-auto-delay-max').value)||0);c.rules=rules;
    DB.data.forumAutoReplyConfig=c;DB.save();mask.remove();toast(`自动回复设置已保存（${rules.length} 条有效规则）`,'ok');
  });
}
function requestForumNotificationPermission(){
  if(!('Notification' in window)){toast('当前浏览器不支持网页通知；仍可使用站内未读提示。','warn');return;}
  if(Notification.permission==='granted'){toast('浏览器通知已开启','ok');return;}
  if(Notification.permission==='denied'){toast('通知权限已被浏览器禁止，请到网站设置中手动允许通知。','warn');return;}
  Notification.requestPermission().then(p=>toast(p==='granted'?'回复通知已开启':'你没有允许浏览器通知，站内未读提示仍会保留',p==='granted'?'ok':'warn')).catch(()=>toast('无法申请通知权限，请检查浏览器设置。','warn'));
}
async function showSiteNotification(title,body,url,tag){
  if(!('Notification' in window)||Notification.permission!=='granted')return false;
  const options={body:String(body||'有新动态').slice(0,180),tag:tag||'ndt-forum',data:{url:url||'#/forum'},renotify:true};
  try{
    if('serviceWorker' in navigator && window.isSecureContext){
      const reg=await navigator.serviceWorker.getRegistration();
      if(reg && reg.showNotification){await reg.showNotification(title,options);return true;}
    }
  }catch(e){}
  try{
    if(!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)){
      const n=new Notification(title,options);
      n.onclick=()=>{window.focus();location.hash=options.data.url;n.close();};
      return true;
    }
  }catch(e){}
  return false;
}
function addForumNotice(post,answer){
  const me=DB.user;
  if(!post||!answer||!post.authorId||post.authorId===answer.authorId)return;
  DB.data.forumNotices=Array.isArray(DB.data.forumNotices)?DB.data.forumNotices:[];
  if(DB.data.forumNotices.some(n=>n.answerId===answer.id&&n.userId===post.authorId))return;
  const excerpt=String(answer.content||'').replace(/\[img\][\s\S]*?\[\/img\]/g,'[图片]').slice(0,100);
  // 同一帖子未及时查看的未读回复自动堆叠为一条，避免数量多时刷屏。
  const isReplyNotice=n=>n.kind==null||n.kind==='reply';
  let stack=DB.data.forumNotices.find(n=>n.userId===post.authorId&&String(n.postId)===String(post.id)&&!n.read&&isReplyNotice(n));
  let currentCount=1;
  if(stack){
    stack.count=Math.max(1,Number(stack.count)||1)+1;
    stack.at=nowStr();
    stack.answerId=answer.id;
    stack.excerpt=excerpt;
    currentCount=stack.count;
  }else{
    const notice={id:genId('fn'),userId:post.authorId,postId:post.id,answerId:answer.id,count:1,authorName:answer.authorName||(DB.data.users.find(u=>u.id===answer.authorId)?.name)||'论坛成员',excerpt,at:nowStr(),read:false};
    DB.data.forumNotices.push(notice);
  }
  if(me&&post.authorId===me.id){
    const title=currentCount>1?`您收到 ${currentCount} 条新回复`:'您收到一条新回复';
    if(document.hidden)showSiteNotification(title,excerpt,'#/post/'+post.id,'ndt-forum-'+post.id);
    else if(!(parseHash().seg[0]==='post'&&parseHash().seg[1]===post.id))toast(title,'ok');
  }
}
function addForumLikeNotice(post,actorId){
  // 点赞通知接收者是帖子作者，而不是当前点赞者。
  if(!post||!post.authorId||!actorId||String(post.authorId)===String(actorId))return;
  const recipientId=String(post.authorId);
  DB.data.forumNotices=Array.isArray(DB.data.forumNotices)?DB.data.forumNotices:[];
  let n=DB.data.forumNotices.find(x=>String(x.userId)===recipientId&&x.kind==='like'&&String(x.postId)===String(post.id)&&!x.read);
  if(n){n.count=Math.max(1,Number(n.count)||1)+1;n.at=nowStr();}
  else{n={id:genId('fn'),userId:recipientId,kind:'like',postId:post.id,authorName:'',excerpt:'',count:1,at:nowStr(),read:false};DB.data.forumNotices.push(n);}
  // 点赞事件调用方统一 DB.save()，通知持久化与点赞状态同轮完成。
  if(DB.user&&String(DB.user.id)===recipientId){
    if(document.hidden)showSiteNotification(n.count>1?`您收到 ${n.count} 条新的点赞`:'您收到一条新的点赞',String(post.title||''),'#/post/'+post.id,'ndt-like-'+post.id);
    else if(!(parseHash().seg[0]==='post'&&parseHash().seg[1]===post.id))toast(n.count>1?`您收到 ${n.count} 条新的点赞`:'您收到一条新的点赞','ok');
  }
}
/* 模拟热度增长带来的“他人点赞”：同样要在帖子消息中心生成/堆叠点赞通知，
   否则楼主只看到点赞数上涨，却收不到任何提示。静默记录，不弹 toast。 */
function addSimulatedLikeNotice(post,increment){
  if(!post||!post.authorId||!(increment>0))return;
  const me=DB.user;
  if(me&&String(post.authorId)!==String(me.id))return;
  DB.data.forumNotices=Array.isArray(DB.data.forumNotices)?DB.data.forumNotices:[];
  const recipientId=String(post.authorId);
  let n=DB.data.forumNotices.find(x=>String(x.userId)===recipientId&&x.kind==='like'&&String(x.postId)===String(post.id)&&!x.read);
  if(n){n.count=Math.max(1,Number(n.count)||1)+increment;n.at=nowStr();}
  else{n={id:genId('fn'),userId:recipientId,kind:'like',postId:post.id,authorName:'',excerpt:'',count:increment,at:nowStr(),read:false};DB.data.forumNotices.push(n);}
}
function runForumAutoReply(post,source,sourceText){
  if(!post||!DB.data||!Array.isArray(DB.data.answers))return false;
  const cfg=forumAutoConfig();if(!cfg.enabled)return false;
  const text=`${post.title||''}\n${sourceText||''}`;
  const rule=forumKeywordRule(text);if(!rule||!String(rule.reply||'').trim())return false;
  const sourceId=source&&source.id?String(source.id):'post:'+post.id;
  if(DB.data.answers.some(a=>a.autoReplyFor===sourceId)||DB.data.forumPendingAutoReplies?.some(a=>a.sourceId===sourceId))return false;
  const freq=rule.frequency&&rule.frequency!=='global'?rule.frequency:cfg.frequency;
  const chance={always:1,half:.5,third:1/3,rare:.2}[freq]||1;
  if(Math.random()>chance)return false;
  const min=rule.delayMin==null?Number(cfg.delayMin)||0:Math.max(0,Number(rule.delayMin)||0);
  const max=rule.delayMax==null?Number(cfg.delayMax)||0:Math.max(min,Number(rule.delayMax)||0);
  const delay=Math.round((min+Math.random()*(Math.max(min,max)-min))*1000);
  const pending={sourceId,postId:post.id,reply:String(rule.reply).trim(),authorName:String(rule.authorName||'论坛助手').trim()||'论坛助手',dueAt:Date.now()+delay};
  DB.data.forumPendingAutoReplies=Array.isArray(DB.data.forumPendingAutoReplies)?DB.data.forumPendingAutoReplies:[];
  DB.data.forumPendingAutoReplies.push(pending);DB.save();
  setTimeout(()=>{
    const queue=DB.data&&Array.isArray(DB.data.forumPendingAutoReplies)?DB.data.forumPendingAutoReplies:[];
    const idx=queue.findIndex(x=>x.sourceId===sourceId);if(idx<0)return;
    const job=queue.splice(idx,1)[0];const livePost=DB.data.posts.find(p=>p.id===job.postId);
    if(!livePost||DB.data.answers.some(a=>a.autoReplyFor===sourceId)){DB.save();return;}
    const bot={id:genId('a'),postId:livePost.id,authorId:'forum-auto-reply',authorName:job.authorName,content:job.reply,createdAt:nowStr(),votes:[],editedBy:[],autoReplyFor:sourceId};
    DB.data.answers.push(bot);addForumNotice(livePost,bot);DB.save();syncUnreadBadges();
    if(!document.hidden)toast(`「${job.authorName}」已回复帖子`,'ok');else showSiteNotification('论坛有新的自动回复',`${job.authorName}：${job.reply}`,'#/post/'+livePost.id,'ndt-auto-'+livePost.id);
    if(parseHash().seg[0]==='post'&&parseHash().seg[1]===livePost.id)router();
  },delay);
  return true;
}
function openWorkgroupCardManager(){
  const wg=workgroupOf();const me=DB.user;
  const ids=[...new Set([me.id,...(wg.members||[])])].filter(id=>{const u=userOfId(id);return u&&Number(u.level)>=2;});
  const mask=openMask(`<h3>工作组字卡管理</h3><div class="m-body"><p class="ph-sub" style="margin-top:0">选择工作组成员，管理该成员的文字、图片和组合字卡。</p>
    ${ids.map(id=>{const u=userOfId(id);return `<button type="button" class="mem-row" data-wg-card-person="${esc(id)}" style="width:100%;text-align:left;cursor:pointer"><span class="av" style="width:30px;height:30px;font-size:12px">${avatarHtml32(u)}</span><span style="flex:1">${esc(u.name)}${id===me.id?'（我）':''}</span><span style="font-size:12px;color:var(--pt-muted)">${(u.cards||[]).length} 张字卡　›</span></button>`;}).join('')||'<div class="empty">没有可管理的员工/管理员</div>'}
    <div style="display:flex;margin-top:12px"><button type="button" class="btn btn-sm btn-ghost" id="wg-card-cancel" style="margin-left:auto">关闭</button></div></div>`);
  mask.querySelector('#wg-card-cancel').addEventListener('click',()=>mask.remove());
  mask.addEventListener('click',e=>{const b=e.target.closest('[data-wg-card-person]');if(!b)return;const id=b.dataset.wgCardPerson;mask.remove();cardManager(id);});
}
function simulateForumGrowth(){
  if(!DB.user||!DB.data||!Array.isArray(DB.data.posts))return;
  const now=Date.now(),cfg=DB.data.forumGrowthConfig||{enabled:true};if(cfg.enabled===false)return;
  const own=DB.data.posts.filter(p=>p.authorId===DB.user.id&&!p.pinned);if(!own.length)return;
  let last=Number(DB.data.forumGrowthLastAt)||0;if(now-last<45000)return;DB.data.forumGrowthLastAt=now;
  let changed=false,hitGoal=false;
  const likeHits=[]; // 本轮新增的模拟点赞：{post,inc}
  own.forEach(p=>{
    let likeInc=0;
    const g=p.heatGoal;if(!g||!g.targetAt)return;
    const start=Number(g.createdAt)||now,duration=Math.max(1,g.targetAt-start),progress=Math.min(1,Math.max(0,(now-start)/duration));
    const targetViews=Math.max(0,Number(g.views)||0),targetLikes=Math.max(0,Number(g.likes)||0);
    const desiredViews=Math.round(targetViews*progress),currentViews=Number(p.views)||0;
    if(currentViews<targetViews){const gap=Math.max(0,desiredViews-currentViews);const increment=now>=g.targetAt?targetViews-currentViews:Math.min(gap,Math.max(0,Math.floor(Math.random()*Math.max(1,Math.ceil(gap*.35)))+(gap>0?1:0)));if(increment>0){p.views=Math.min(targetViews,currentViews+increment);changed=true;}}
    const currentLikes=Number(p.simulatedLikes)||0,desiredLikes=Math.round(targetLikes*progress),likeGap=Math.max(0,desiredLikes-currentLikes);
    if(currentLikes<targetLikes&&likeGap>0&&(now>=g.targetAt||Math.random()<.7)){const increment=now>=g.targetAt?targetLikes-currentLikes:Math.min(likeGap,Math.random()<.35?2:1);if(increment>0){p.simulatedLikes=Math.min(targetLikes,currentLikes+increment);likeInc+=increment;changed=true;}}
    if(now>=g.targetAt){if((Number(p.views)||0)<targetViews){p.views=targetViews;changed=true;}if((Number(p.simulatedLikes)||0)<targetLikes){const backfill=targetLikes-Number(p.simulatedLikes);p.simulatedLikes=targetLikes;likeInc+=backfill;changed=true;}if(!g.completedAt){g.completedAt=now;hitGoal=true;}}
    if(likeInc>0)likeHits.push({post:p,inc:likeInc});
  });
  // 保留没有单独目标的帖子原有的低频本地演示增长逻辑
  const noGoal=own.filter(p=>!p.heatGoal);if(noGoal.length){const count=Math.random()<.22?2:1;for(let i=0;i<count;i++){const p=noGoal[Math.floor(Math.random()*noGoal.length)];p.views=Math.max(0,Number(p.views)||0)+1+Math.floor(Math.random()*3);if(Math.random()<.22){p.simulatedLikes=Math.max(0,Number(p.simulatedLikes)||0)+1;likeHits.push({post:p,inc:1});}changed=true;}}
  if(!changed)return;
  // 把本轮模拟点赞写入帖子消息中心（自动堆叠），并刷新未读角标。
  likeHits.forEach(h=>addSimulatedLikeNotice(h.post,h.inc));
  DB.save();
  if(likeHits.length)syncUnreadBadges();
}
function markForumNoticesSeen(postId){
  const me=DB.user;if(!me||!Array.isArray(DB.data.forumNotices))return;
  let changed=false;
  DB.data.forumNotices.forEach(n=>{if(n.userId===me.id&&!n.read&&(!postId||n.postId===postId)){n.read=true;changed=true;}});
  if(changed){DB.save();syncUnreadBadges();}
}

/* ---------- 云端消息中心 HTML ---------- */
function cloudNoticesHtml(list,unread,total,filter){
  return `<section class="p-panel forum-notice-center">
    <div class="fnc-head"><div><div class="fnc-kicker">CLOUD ACTIVITY</div><h2>帖子消息中心</h2><p class="ph-sub">云端共享：这里收录你在论坛里收到的新回复和点赞，所有成员的互动实时同步。</p></div><div class="fnc-count"><strong>${unread}</strong><span>条未读</span></div></div>
    <div class="fnc-toolbar"><div class="fnc-filters">
      <a class="btn btn-sm ${filter==='all'?'':'btn-ghost'}" href="#/forum-notices">全部 ${total}</a>
      <a class="btn btn-sm ${filter==='unread'?'':'btn-ghost'}" href="#/forum-notices?filter=unread">未读 ${unread}</a>
      <a class="btn btn-sm ${filter==='read'?'':'btn-ghost'}" href="#/forum-notices?filter=read">已读</a>
    </div><div class="fnc-actions">
      <button class="btn btn-sm btn-ghost" id="fnc-read-all" ${unread?'':'disabled'}>全部标为已读</button>
      <button class="btn btn-sm btn-ghost" id="fnc-clear-read" ${total-unread?'':'disabled'}>清理已读</button>
    </div></div>
    <div class="fnc-list">${list.length?list.map(n=>{
      const like=n.type==='like';
      const target=like?(n.targetType==='reply'?'评论':'帖子'):'帖子';
      const titleTxt=like?`${esc(n.actorName)} 赞了你的${target}`:`${esc(n.actorName)} 回复了你的帖子`;
      return `<article class="fnc-item ${n.read?'is-read':'is-unread'}" data-cn-item="${esc(n.id)}">
        <span class="fnc-icon ${like?'is-growth':'is-reply'}">${like?'♥':'✦'}</span>
        <div class="fnc-body">
          <div class="fnc-title-row"><strong>${titleTxt}</strong><time>${esc(n.createdAt||'')}</time></div>
          ${like?'':`<p>${esc(n.excerpt||'')}</p>`}
          <div class="fnc-post-title">${esc(n.postTitle||'原帖子可能已删除')}</div>
          <div class="fnc-item-actions">
            ${n.postId?`<a class="btn btn-sm btn-orange" href="#/post/${encodeURIComponent(n.postId)}" data-cn-open="${esc(n.id)}">查看帖子</a>`:''}
            ${n.read?'':`<button class="btn btn-sm btn-ghost" data-cn-read="${esc(n.id)}">标为已读</button>`}
          </div>
        </div>${n.read?'':'<span class="fnc-dot" title="未读"></span>'}
      </article>`;}).join(''):'<div class="empty fnc-empty"><div class="es">✦</div><strong>这里暂时很安静</strong><p>当你的帖子收到新回复或点赞时，会出现在这里。</p></div>'}</div>
  </section>`;
}

/* ---------- 帖子消息中心：仅收录帖子回复与帖子热度通知 ---------- */
function viewForumNotices(filter='all'){
  if(Cloud.connected){
    filter=filter||'all';
    const loading=`<section class="p-panel"><div class="cloud-loading"><span class="cl-spin"></span>正在从云端加载消息…</div></section>`;
    setTimeout(()=>{
      Cloud.fetchNotifications(filter).then(d=>{
        $('#app').innerHTML=portalShell('forum-notices',cloudNoticesHtml(d.notifications,d.unread,d.total,filter));
      }).catch(e=>{
        $('#app').innerHTML=portalShell('forum-notices',`<div class="p-panel empty">消息加载失败：${esc(e.message)}<br><a class="btn btn-sm" href="#/cloud">前往云端账号</a></div>`);
      });
    },0);
    return portalShell('forum-notices',loading);
  }
  const me=DB.user;if(!me)return viewGate();
  const noticeCount=n=>Math.max(1,Number(n.count)||1);
  const all=(DB.data.forumNotices||[]).filter(n=>n.userId===me.id&&n.kind!=='growth').slice().sort((a,b)=>String(b.at||'').localeCompare(String(a.at||'')));
  const list=all.filter(n=>filter==='unread'?!n.read:filter==='read'?!!n.read:true);
  const unread=all.filter(n=>!n.read).reduce((s,n)=>s+noticeCount(n),0);
  const c=`<section class="p-panel forum-notice-center">
    <div class="fnc-head"><div><div class="fnc-kicker">FORUM ACTIVITY</div><h2>帖子消息中心</h2><p class="ph-sub">这里只收录你发出的帖子收到的新回复和点赞。私信、论坛聊天室和工作组消息不会出现在这里。</p></div><div class="fnc-count"><strong>${unread}</strong><span>条未读</span></div></div>
    <div class="fnc-toolbar"><div class="fnc-filters"><a class="btn btn-sm ${filter==='all'?'':'btn-ghost'}" href="#/forum-notices">全部 ${all.length}</a><a class="btn btn-sm ${filter==='unread'?'':'btn-ghost'}" href="#/forum-notices?filter=unread">未读 ${unread}</a><a class="btn btn-sm ${filter==='read'?'':'btn-ghost'}" href="#/forum-notices?filter=read">已读</a></div><div class="fnc-actions"><button class="btn btn-sm btn-ghost" id="fnc-read-all" ${unread?'':'disabled'}>全部标为已读</button><button class="btn btn-sm btn-ghost" id="fnc-clear-read" ${all.some(n=>n.read)?'':'disabled'}>清理已读</button></div></div>
    <div class="fnc-list">${list.length?list.map(n=>{const post=DB.data.posts.find(p=>p.id===n.postId);const like=n.kind==='like';const cnt=noticeCount(n);return `<article class="fnc-item ${n.read?'is-read':'is-unread'}" data-fnc-item="${esc(n.id)}"><span class="fnc-icon ${like?'is-growth':'is-reply'}">${like?'♥':'✦'}${cnt>1?`<em class="fnc-icon-num">${cnt}</em>`:''}</span><div class="fnc-body"><div class="fnc-title-row"><strong>${like?(cnt>1?`您收到 ${cnt} 条新的点赞`:'您收到一条新的点赞'):(cnt>1?`您收到 ${cnt} 条新回复`:'您收到一条新回复')}</strong><time>${esc(n.at||'')}</time></div>${like?'':`<p>${esc(n.excerpt||'')}</p>`}<div class="fnc-post-title">${esc(post?.title||'原帖子可能已删除')}</div><div class="fnc-item-actions">${post?`<a class="btn btn-sm btn-orange" href="#/post/${encodeURIComponent(post.id)}" data-fnc-open="${esc(n.id)}">查看帖子</a>`:''}${n.read?'':`<button class="btn btn-sm btn-ghost" data-fnc-read="${esc(n.id)}">标为已读</button>`}</div></div>${n.read?'':'<span class="fnc-dot" title="未读"></span>'}</article>`;}).join(''):'<div class="empty fnc-empty"><div class="es">✦</div><strong>这里暂时很安静</strong><p>当你的帖子收到新回复或点赞时，会出现在这里。</p></div>'}</div>
  </section>`;
  return portalShell('forum-notices',c);
}
/* ---------- 论坛首页 ---------- */
/* 归一化本地帖子为统一形状（与云端一致） */
function localForumPosts(board){
  let list=DB.data.posts.slice();
  if(board!=='全部')list=list.filter(p=>p.board===board);
  return list.map(p=>({
    id:p.id, board:p.board, title:p.title, content:p.content,
    authorId:p.authorId, authorName:postAuthor(p),
    createdAt:p.createdAt, pinned:!!p.pinned,
    views:p.views, votes:p.votes||[],
    simulatedLikes:Number(p.simulatedLikes)||0,
    replyCount:DB.data.answers.filter(a=>a.postId===p.id).length
  }));
}
/* 论坛列表项 HTML（统一形状 + 当前用户 id；showPin 仅本地管理员置顶用） */
function forumListHtml(list,curId,showPin){
  if(!list.length)return `<div class="empty"><div class="es">🕳️</div>这个板块还没有帖子</div>`;
  return list.map(p=>{
    const likeCount=p.votes.length+(p.simulatedLikes||0);
    const liked=p.votes.includes(curId);
    return `<div class="q-item">
      <div class="q-vote q-vote-list"><button type="button" class="vt ${liked?'on':''}" data-vote="${p.id}" aria-label="赞同帖子" aria-pressed="${liked?'true':'false'}"><span class="vote-arrow">▲</span><span class="vote-label">赞同</span></button><b class="vote-count">${likeCount}</b></div>
      <div class="q-main">
        <h3 data-open="${p.id}">${p.pinned?'<span class="tag tag-red" style="margin-right:6px">置顶</span>':''}${esc(p.title)}</h3>
        <div class="q-ex">${esc(p.content)}</div>
        <div class="q-meta">
          <span class="mini-av">${esc(avText(p.authorName))}</span><span>${esc(p.authorName)}</span>
          <span class="tag">${p.board}</span>
          <span class="qm" data-open="${p.id}">💬 ${p.replyCount} 个回答</span>
          <span>👁 ${p.views}</span>
          <span>${relTime(p.createdAt)}</span>
          ${showPin?`<button class="btn btn-sm btn-ghost" data-pin="${p.id}" style="margin-left:auto">${p.pinned?"取消置顶":"置顶"}</button>`:''}
        </div>
      </div></div>`;}).join('');
}
function sortForumPosts(list,sort){
  list.sort((a,b)=>{
    if(a.pinned!==b.pinned)return a.pinned?-1:1;
    if(sort==='hot')return (b.votes.length+b.replyCount*2)-(a.votes.length+a.replyCount*2);
    return new Date(b.createdAt)-new Date(a.createdAt);
  });
  return list;
}
function viewForum(board,sort){
  board=board||'全部';sort=sort||'latest';
  const cloudOn=Cloud.connected;
  const curId=cloudOn?Cloud.user.id:DB.user.id;
  const cloudBadge=cloudOn
    ?`<span class="cloud-pill on">☁ 云端已连接 · 共享中</span>`
    :`<a class="cloud-pill" href="#/cloud">☁ 云端账号（未连接）</a>`;
  const localTools=!cloudOn
    ?`<button class="btn btn-ghost btn-sm" id="forum-notify-enable">回复提醒</button>
      <button class="btn btn-ghost btn-sm" id="forum-auto-settings">自动回复</button>`:'';
  const shell=listHtml=>`<div class="p-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <h2>异人论坛</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        ${cloudBadge}
        ${localTools}
        <button class="btn btn-orange btn-sm" id="f-ask">+ 发帖提问</button>
      </div>
    </div>
    <div class="ph-sub">${cloudOn?'当前为云端共享论坛，所有成员看到的帖子实时同步':'有问题，上论坛；知道的事，说给同道听（当前为本地离线模式）'}</div>
    <div class="forum-tabs">
      ${['全部'].concat(DB.data.boards).map(b=>`<button class="ft ${b===board?'on':''}" data-b="${b}">${b}</button>`).join('')}
    </div>
    <div class="forum-tabs" style="margin-top:-8px">
      <button class="ft ${sort==='latest'?'on':''}" data-sort="latest">最新</button>
      <button class="ft ${sort==='hot'?'on':''}" data-sort="hot">热门</button>
      ${!cloudOn?'<button class="ft" id="bd-manage" style="margin-left:auto">管理分类</button>':''}
    </div>
    <div id="cloud-forum-list">${listHtml}</div>
  </div>`;
  if(cloudOn){
    const c=shell('<div class="cloud-loading"><span class="cl-spin"></span>正在从云端加载帖子…</div>');
    setTimeout(()=>{
      Cloud.listPosts(board,sort).then(posts=>{
        const el=document.getElementById('cloud-forum-list');
        if(el)el.innerHTML=forumListHtml(sortForumPosts(posts,sort),curId,Cloud.user.role>=3);
      }).catch(e=>{
        const el=document.getElementById('cloud-forum-list');
        if(el)el.innerHTML=`<div class="empty"><div class="es">⚠️</div>云端加载失败：${esc(e.message)}<br><a class="btn btn-sm" href="#/cloud">前往云端账号</a></div>`;
      });
    },0);
    return portalShell('forum',c);
  }
  const showPin=DB.user.level>=3;
  const posts=sortForumPosts(localForumPosts(board),sort);
  return portalShell('forum',shell(forumListHtml(posts,curId,showPin)));
}

/* ---------- 发帖 ---------- */
function viewAsk(){
  /* 云端管理员可在公告分类下发帖；其余情况隐藏公告分类 */
  const canPostAnnounce=Cloud.connected&&Cloud.user.role>=3;
  const askBoards=DB.data.boards.filter(b=>canPostAnnounce||b!=='公告');
  const c=`<div class="p-panel">
    <h2>发帖提问</h2><div class="ph-sub">发帖前请先阅读论坛守则，不泄露真实身份信息</div>
    <label class="fl">所属板块</label>
    <select class="field" id="a-board">${askBoards.map(b=>`<option>${b}</option>`).join('')}</select>
    <label class="fl">标题</label>
    <input class="field" id="a-title" placeholder="一句话说清你想问什么">
    <label class="fl">内容（可使用表情包）</label>
    <textarea class="field" id="a-body" style="min-height:160px" placeholder="补充背景、细节和你想知道的答案……"></textarea>
    <details style="margin-top:14px;border:1px solid var(--pt-border);border-radius:10px;padding:12px"><summary style="cursor:pointer;font-weight:700">设置帖子热度目标</summary><p class="ph-sub">可选。热度会在指定时长内随机、缓慢增长。</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px"><div><label class="fl">目标点赞数</label><input class="field" id="a-goal-likes" type="number" min="0" max="1000000" value="0"></div><div><label class="fl">目标浏览量</label><input class="field" id="a-goal-views" type="number" min="0" max="1000000" value="0"></div><div><label class="fl">达成时间（小时）</label><input class="field" id="a-goal-hours" type="number" min="0.1" max="8760" step="0.1" value="24"></div></div>
    </details>
    <div class="editor-bar"><button class="eb" id="a-stk">插入表情包</button><label class="eb" style="margin:0">插入图片<input type="file" id="a-img-file" accept="image/*" class="hide"></label></div>
    <div class="stk-picker hide" id="a-stk-box">${STICKERS.map(s=>`<button data-s="${s}">${s}</button>`).join('')}</div>
    <div style="margin-top:20px;display:flex;gap:10px"><button class="btn btn-orange" id="a-sub">发布</button><a class="btn btn-ghost btn-sm" href="#/forum">取消</a></div>
  </div>`;
  return portalShell('ask',c);
}

/* 归一化本地回复 */
function localReplies(postId){
  return DB.data.answers.filter(a=>a.postId===postId).map(a=>({
    id:a.id,postId:a.postId,parentId:a.parentId||null,
    authorId:a.authorId,authorName:ansAuthor(a),
    content:a.content,createdAt:a.createdAt,votes:a.votes||[]
  }));
}
/* 由扁平回复构建楼中楼树：顶层按点赞数，子级按时间 */
function buildReplyTree(replies){
  const map=new Map();
  replies.forEach(r=>map.set(r.id,{...r,children:[]}));
  const roots=[];
  map.forEach(r=>{
    if(r.parentId&&map.has(r.parentId)){
      const p=map.get(r.parentId);
      p.children.push(r);r.parentName=p.authorName;
    }
    else roots.push(r);
  });
  const byTime=arr=>{arr.sort((a,b)=>a.createdAt<b.createdAt?-1:1);arr.forEach(c=>byTime(c.children));};
  roots.sort((a,b)=>b.votes.length-a.votes.length);
  roots.forEach(r=>byTime(r.children));
  return roots;
}
/* 楼中楼子回复（递归；视觉缩进最多 2 层，更深的以“回复 @某某”前缀平铺） */
function subReplyHtml(node,depth,curId,isAdmin,cloudOn){
  const liked=node.votes.includes(curId);
  const canDelReply=cloudOn?(node.authorId===curId||isAdmin):isAdmin;
  const indent=Math.min(depth,2);
  const prefix=node.parentId?`<span class="sr-to">回复 @${esc(node.parentName||'')}：</span>`:'';
  return `<div class="sub-reply depth-${indent}">
    <div class="sr-line">
      <span class="mini-av sm">${esc(avText(node.authorName))}</span>
      <span class="sr-name">${esc(node.authorName)}</span>
      <span class="sr-time">${relTime(node.createdAt)}</span>
      <button type="button" class="sr-vote ${liked?'on':''}" data-avote="${node.id}" aria-label="赞同">▲ ${node.votes.length}</button>
      <button type="button" class="sr-reply" data-rreply="${node.id}" data-rname="${esc(node.authorName)}">回复</button>
      ${canDelReply?`<button type="button" class="sr-del" data-adel="${node.id}">删除</button>`:''}
    </div>
    <div class="sr-body">${prefix}${renderBody(node.content)}</div>
    ${node.children.length?`<div class="sub-reply-children">${node.children.map(c=>subReplyHtml(c,depth+1,curId,isAdmin,cloudOn)).join('')}</div>`:''}
  </div>`;
}
/* 帖子详情两面板 HTML（统一形状） */
function postDetailHtml(post,replies,curId,isAdmin,cloudOn){
  const postLiked=post.votes.includes(curId);
  const postCount=post.votes.length+(post.simulatedLikes||0);
  const canDelPost=cloudOn?(post.authorId===curId||isAdmin):isAdmin;
  const bread=`<div class="p-crumb"><a href="#/forum">论坛</a> / <b>${esc(post.board)}</b></div>`;
  const panel1=`<div class="p-panel">
    <h2 style="font-size:23px;line-height:1.4">${esc(post.title)}</h2>
    <div class="q-meta" style="margin:12px 0 4px">
      <span class="mini-av">${esc(avText(post.authorName))}</span><span>${esc(post.authorName)}</span>
      <span>${relTime(post.createdAt)}</span><span>👁 ${post.views||0}</span>
      ${!cloudOn?`<button class="btn btn-sm btn-ghost" data-pin="${post.id}" style="margin-left:auto">${post.pinned?"取消置顶":"置顶"}</button>
      <span class="qm" id="p-edit">✎ 编辑帖子</span>
      ${isAdmin?'<span class="qm" id="p-del" style="color:#FF9DA0">🗑 删除帖子</span>':''}`
      :(`${isAdmin?`<button type="button" class="btn btn-sm btn-ghost" data-pin="${post.id}">${post.pinned?"取消置顶":"置顶"}</button>`:''}
        ${canDelPost?'<button type="button" class="btn btn-sm btn-ghost" id="p-del" style="margin-left:auto;color:#FF9DA0">🗑 删除帖子</button>':''}`)}
    </div>
    <div style="color:var(--pt-text);font-size:15px;line-height:1.95;white-space:pre-wrap;margin-top:14px;word-break:break-word">${renderBody(post.content)}</div>
    <div class="q-vote q-vote-detail">
      <button type="button" class="vt ${postLiked?'on':''}" data-vote="${post.id}" aria-label="赞同帖子" aria-pressed="${postLiked?'true':'false'}"><span class="vote-arrow">▲</span><span class="vote-label">赞同</span></button>
      <b class="vote-count">${postCount}</b><span class="vote-caption">人赞同</span>
    </div>
  </div>`;
  const tree=buildReplyTree(replies);
  const rootHtml=a=>{
    const liked=a.votes.includes(curId);
    const canDelReply=cloudOn?(a.authorId===curId||isAdmin):isAdmin;
    return `<div class="answer">
      <div class="q-vote q-vote-answer"><button type="button" class="vt ${liked?'on':''}" data-avote="${a.id}" aria-label="赞同回答" aria-pressed="${liked?'true':'false'}"><span class="vote-arrow">▲</span></button><b class="vote-count">${a.votes.length}</b></div>
      <div class="q-main">
        <div class="q-meta"><span class="mini-av">${esc(avText(a.authorName))}</span><span>${esc(a.authorName)}</span><span>${relTime(a.createdAt)}</span>
          ${!cloudOn?`<span class="qm" data-aedit="${a.id}">✎ 编辑</span>
          ${isAdmin?`<span class="qm" data-adel="${a.id}" style="color:#FF9DA0">🗑 删除</span>`:''}`
          :(canDelReply?`<span class="qm" data-adel="${a.id}" style="color:#FF9DA0">🗑 删除</span>`:'')}
        </div>
        <div class="a-body" style="margin-top:8px">${renderBody(a.content)}</div>
        <div class="reply-actions"><button type="button" class="rp-btn" data-rreply="${a.id}" data-rname="${esc(a.authorName)}">💬 回复</button></div>
        ${a.children.length?`<div class="sub-replies">
          <div class="sub-replies-head">全部 ${a.children.length} 条回复</div>
          ${a.children.map(c=>subReplyHtml(c,1,curId,isAdmin,cloudOn)).join('')}
        </div>`:''}
        <div class="inline-reply hide" id="ir-${a.id}">
          <textarea class="field ir-body" placeholder="回复 @${esc(a.authorName)}：" style="min-height:70px"></textarea>
          <div class="ir-foot"><button class="btn btn-sm btn-ghost ir-cancel" data-rcancel="${a.id}">取消</button>
          <button class="btn btn-sm btn-orange ir-send" data-rsub="${a.id}">发送</button></div>
        </div>
      </div></div>`;
  };
  const panel2=`<div class="p-panel">
    <h2>${replies.length} 个回答</h2>
    ${tree.map(rootHtml).join('')||'<div class="empty">还没有回答，来写第一个回答吧</div>'}
    <div style="margin-top:20px">
      <label class="fl">写下你的回答</label>
      <textarea class="field" id="ans-body" style="min-height:130px" placeholder="分享你的见解……"></textarea>
      <div class="editor-bar"><button class="eb" id="ans-stk">插入表情包</button><button class="btn btn-orange btn-sm" id="ans-sub" style="margin-left:auto">提交回答</button></div>
      <div class="stk-picker hide" id="ans-stk-box">${STICKERS.map(s=>`<button data-s="${s}">${s}</button>`).join('')}</div>
    </div>
  </div>`;
  return bread+panel1+panel2;
}
/* ---------- 帖子详情 ---------- */
function viewPost(id){
  markForumNoticesSeen(id);
  const cloudOn=Cloud.connected;
  const curId=cloudOn?Cloud.user.id:DB.user.id;
  const isAdmin=cloudOn?(Cloud.user.role>=3):(DB.user.level>=3);
  if(cloudOn){
    const loading=`<div class="p-panel"><div class="cloud-loading"><span class="cl-spin"></span>正在从云端加载帖子…</div></div>`;
    setTimeout(()=>{
      Cloud.getPost(id).then(d=>{
        const post={
          id:d.post.id,board:d.post.board,title:d.post.title,content:d.post.content,
          authorId:d.post.authorId,authorName:d.post.authorName,
          createdAt:d.post.createdAt,pinned:d.post.pinned,views:d.post.views,
          votes:d.post.votes||[],simulatedLikes:0};
        const replies=(d.replies||[]).map(r=>({
          id:r.id,postId:r.postId,parentId:r.parentId||null,
          authorId:r.authorId,authorName:r.authorName,
          content:r.content,createdAt:r.createdAt,votes:r.votes||[]}));
        $('#app').innerHTML=portalShell('forum',postDetailHtml(post,replies,curId,isAdmin,true));
        /* 进入帖子即把该帖相关通知标为已读，并刷新红点 */
        Cloud.readNotificationsForPost(id).then(async()=>{
          await Cloud.pollNotifications();syncUnreadBadges();
        }).catch(()=>{});
      }).catch(e=>{
        $('#app').innerHTML=portalShell('forum',`<div class="p-panel empty">帖子加载失败：${esc(e.message)}<br><a class="btn btn-sm" href="#/forum">返回论坛</a></div>`);
      });
    },0);
    return portalShell('forum',loading);
  }
  const p=DB.data.posts.find(x=>x.id===id);
  if(!p)return portalShell('forum',`<div class="p-panel empty">帖子不存在或已被删除</div>`);
  const post={
    id:p.id,board:p.board,title:p.title,content:p.content,
    authorId:p.authorId,authorName:postAuthor(p),
    createdAt:p.createdAt,pinned:!!p.pinned,views:p.views,
    votes:p.votes||[],simulatedLikes:Number(p.simulatedLikes)||0};
  const replies=localReplies(id).sort((a,b)=>b.votes.length-a.votes.length);
  return portalShell('forum',postDetailHtml(post,replies,curId,isAdmin,false));
}

/* 正文渲染：图片 token + 贴纸 emoji + 其余原样 */
function renderBody(t){
  const imgs=[];
  let s=esc(t).replace(/\[img\](data:image\/[^\[]+)\[\/img\]/g,(m,u)=>{
    imgs.push(u);return `\u0000${imgs.length-1}\u0000`;});
  s=s.replace(/(\p{Extended_Pictographic}[\uFE0f\uFE0e]?(\u200d\p{Extended_Pictographic}[\uFE0f\uFE0e]?)*)/gu,
    m=>`<span class="sticker" style="font-size:26px;width:auto;height:auto">${m}</span>`);
  s=s.replace(/\u0000(\d+)\u0000/g,(m,i)=>`<img class="inline-img" src="${imgs[i]}">`);
  return s;
}
/* ---------- 权限不足 ---------- */
function accessDenied(){
  return `<div class="p-panel empty"><div class="es">🔒</div>该模块为哪都通员工业务系统<br>
  <span style="font-size:13px">普通异人可在论坛交流；若你是员工，请在「数据中心」输入员工激活码</span>
  <div style="margin-top:18px"><a class="btn btn-sm" href="#/settings">前往数据中心</a></div></div>`;
}
function dangerTag(d){
  const m={S:'tag-red',A:'tag-orange',B:'tag',C:'tag-green',D:'tag-gray'};
  return `<span class="tag ${m[d]||'tag-gray'}">危险 ${esc(d)}</span>`;
}
function secName(s){return {1:'内部公开',2:'内部',3:'机密',4:'绝密'}[s];}
function secTag(s){return `<span class="sec-badge sec-${s}">${secName(s)}</span>`;}

/* ---------- 异人档案 ---------- */
function viewArchives(q,da){
  if(DB.level()<2)return portalShell('archives',accessDenied());
  q=q||'';da=da||'';
  let list=DB.data.archives.slice();
  if(q){const k=q.toLowerCase();list=list.filter(r=>[r.name,r.faction,r.skill,r.aliases,r.code].join(' ').toLowerCase().includes(k));}
  if(da)list=list.filter(r=>r.danger===da);
  list.sort((a,b)=>({S:0,A:1,B:2,C:3,D:4}[a.danger]??9)-({S:0,A:1,B:2,C:3,D:4}[b.danger]??9));
  const c=`<div class="p-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <h2>异人档案库</h2>
      <button class="btn btn-sm btn-orange" id="arc-new">＋ 新增档案</button>
    </div>
    <div class="ph-sub">登记在册的异人信息，按权限与机密等级分级开放，可新增、可修改</div>
    <div class="search-row">
      <input class="field" id="ar-q" placeholder="搜索姓名 / 门派 / 功法 / 编号" value="${esc(q)}">
      <select class="field" id="ar-d"><option value="">全部危险等级</option>${['S','A','B','C','D'].map(x=>`<option value="${x}" ${x===da?'selected':''}>${x} 级</option>`).join('')}</select>
      <button class="btn btn-sm" id="ar-go">搜索</button>
    </div>
    <div class="arc-grid">
      ${list.map(r=>{
        const locked=!Auth.canViewSec(r.sec);
        if(locked)return `<div class="arc-card" data-arc="${r.id}">
          <div class="av">🔒</div>
          <div style="min-width:0;flex:1">
            <h3>****</h3>
            <div class="ac-meta">**** · ****</div>
          </div></div>`;
        return `<div class="arc-card" data-arc="${r.id}">
          <div class="av">${esc(avText(r.name))}</div>
          <div style="min-width:0;flex:1">
            <h3>${esc(r.name)} ${secTag(r.sec)}</h3>
            <div class="ac-meta">${esc(r.code)} · ${esc(r.faction)}</div>
            <div style="margin-top:6px">${dangerTag(r.danger)} <span class="tag tag-gray">${esc(r.status)}</span></div>
          </div></div>`;}).join('')||'<div class="empty">没有匹配的档案</div>'}
    </div>
  </div>`;
  return portalShell('archives',c);
}
function viewArchive(id){
  if(DB.level()<2)return portalShell('archives',accessDenied());
  const r=DB.data.archives.find(x=>x.id===id);
  if(!r)return portalShell('archives',`<div class="p-panel empty">档案不存在</div>`);
  const locked=!Auth.canViewSec(r.sec);
  const c=`<div class="p-crumb"><a href="#/archives" >异人档案库</a> / <b>${locked?'****':esc(r.name)}</b></div>
  <div class="p-panel dossier">
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <div class="av" style="width:72px;height:72px;font-size:28px;background:var(--blue-2);border-radius:50%;display:flex;align-items:center;justify-content:center">${locked?'🔒':esc(avText(r.name))}</div>
      <div><h2 style="font-size:24px">${locked?'****':esc(r.name)} ${secTag(r.sec)}</h2>
      <div class="ph-sub" style="margin:4px 0 0">${locked?'****':esc(r.code)+' · '+esc(r.aliases||'无曾用名')}</div></div>
      <div style="margin-left:auto">${locked?'':dangerTag(r.danger)}</div>
    </div>
    ${locked?`<div class="empty" style="padding:30px"><div class="es">⛔</div>该档案为${secName(r.sec)}级别，需相应权限调阅<br>
      <span class="muted" style="font-size:12.5px">（姓名、编号等信息已隐藏，有权限后自动显示）</span></div>`:
    `<div style="margin-top:18px;text-align:right"><span class="qm" id="arc-edit">✎ 编辑档案</span></div>
      <div class="d-row"><div class="dk">性别</div><div class="dv">${esc(r.gender)}</div></div>
      <div class="d-row"><div class="dk">派系 / 所属</div><div class="dv">${esc(r.faction)}</div></div>
      <div class="d-row"><div class="dk">功法 / 手段</div><div class="dv">${esc(r.skill)}</div></div>
      <div class="d-row"><div class="dk">当前状态</div><div class="dv">${esc(r.status)}</div></div>
      <div class="d-note">${esc(r.note)}</div>
    </div>`}
  </div>
  ${locked?'':`<div class="p-panel" style="margin-top:14px">
    <h3 style="font-size:16px">关系树</h3>
    <div class="ph-sub">标注该人物的关系网络，可自由增删</div>
    ${relTreeHtml(r)}
  </div>`}
  </div>`;
  return portalShell('archives',c);
}

/* ---------- 事件档案 ---------- */
function viewEvents(){
  if(DB.level()<2)return portalShell('events',accessDenied());
  const c=`<div class="p-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <h2>事件档案</h2>
      <button class="btn btn-sm btn-orange" id="ev-new">＋ 新增事件</button>
    </div>
    <div class="ph-sub">异人相关重大事件记录，按时间排列，可新增、可修改</div>
    <div class="ev-tl" style="margin-top:20px">
      ${DB.data.events.map(e=>{
        const locked=!Auth.canViewSec(e.sec);
        if(locked)return `<div class="ev-item" data-ev="${e.id}">
          <div class="ey">**** ${secTag(e.sec)}</div>
          <h3>****</h3>
          <p>****</p>
        </div>`;
        return `<div class="ev-item ${e.hot?'hot':''}" data-ev="${e.id}">
          <div class="ey">${esc(e.date)} ${secTag(e.sec)}</div>
          <h3>${esc(e.title)}</h3>
          <p>${esc(e.content.slice(0,60))}……</p>
        </div>`;}).join('')}
    </div>
  </div>`;
  return portalShell('events',c);
}
function viewEvent(id){
  if(DB.level()<2)return portalShell('events',accessDenied());
  const e=DB.data.events.find(x=>x.id===id);
  if(!e)return portalShell('events',`<div class="p-panel empty">事件不存在</div>`);
  const locked=!Auth.canViewSec(e.sec);
  const c=`<div class="p-crumb"><a href="#/events" >事件档案</a> / <b>${locked?'****':esc(e.title)}</b></div>
  <div class="p-panel">
    <div class="ey" style="font-family:var(--mono);color:var(--orange);font-size:13px">${locked?'****':esc(e.date)+' · '+esc(e.loc)} ${secTag(e.sec)}</div>
    <h2 style="margin:10px 0 16px;font-size:22px">${locked?'****':esc(e.title)}
      ${locked?'':'<span class="qm" id="ev-edit" style="font-size:13px;margin-left:12px">✎ 编辑事件</span>'}</h2>
    ${locked?`<div class="empty"><div class="es">⛔</div>该事件为${secName(e.sec)}级别，需相应权限<br>
      <span class="muted" style="font-size:12.5px">（标题、时间、地点等信息已隐藏，有权限后自动显示）</span></div>`
      :`<p style="color:#D6DEFA;line-height:2;white-space:pre-wrap;font-size:15px">${esc(e.content)}</p>`}
  </div>`;
  return portalShell('events',c);
}

/* ---------- 资料库 ---------- */
function viewLibrary(){
  if(DB.level()<2)return portalShell('library',accessDenied());
  const cats=[...new Set(DB.data.library.map(l=>l.cat))];
  const c=`<div class="p-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <h2>资料库</h2>
      <button class="btn btn-sm btn-orange" id="lib-new">＋ 新增资料</button>
    </div>
    <div class="ph-sub">功法、组织与历史资料检索，可新增、可修改</div>
    ${cats.map(cat=>{
      const items=DB.data.library.filter(l=>l.cat===cat);
      return `<h3 style="font-size:15px;margin:18px 0 10px">${esc(cat)}</h3>
        ${items.map(l=>{
          const locked=!Auth.canViewSec(l.sec);
          if(locked)return `<div class="lib-item">
            <h3>**** ${secTag(l.sec)}</h3>
            <p style="margin-top:6px">****</p>
          </div>`;
          return `<div class="lib-item" data-lib="${l.id}">
            <h3>${esc(l.title)} ${secTag(l.sec)}
              <span class="qm" data-libedit="${l.id}" style="font-size:12px;margin-left:10px">✎ 编辑</span></h3>
            <p style="margin-top:6px">${esc(l.content)}</p>
          </div>`;}).join('')}`;
    }).join('')}
  </div>`;
  return portalShell('library',c);
}

/* ---------- 异闻典藏：全员可读的公开知识库 ---------- */
function viewCodex(q=''){
  const rows=DB.data.publicLibrary||[];
  const query=String(q||'').trim().toLowerCase();
  const filtered=rows.filter(x=>!query||[x.cat,x.title,x.summary,x.content,x.tags].join(' ').toLowerCase().includes(query));
  const cats=[...new Set(filtered.map(x=>x.cat))];
  const c=`<div class="p-panel codex-panel">
    <div class="codex-head"><div><div class="ey">ARCHIVE OF THE UNUSUAL</div><h2>异闻典藏</h2><p class="ph-sub">门派谱系、人物轶闻与文献民俗索引</p></div><button class="btn btn-sm btn-orange" id="codex-new">＋ 收录条目</button></div>
    <form class="codex-search" id="codex-search"><input class="field" id="codex-q" value="${esc(q)}" placeholder="搜索门派、人物、典籍或关键词"><button class="btn btn-sm" type="submit">检索</button></form>
    <div class="codex-cats">${cats.map(cat=>`<span class="codex-cat">${esc(cat)}</span>`).join('')}</div>
    ${cats.map(cat=>`<section class="codex-section"><h3>${esc(cat)}</h3><div class="codex-grid">${filtered.filter(x=>x.cat===cat).map(x=>`<article class="codex-card"><div class="codex-card-kicker">NDT / REFERENCE</div><h4>${esc(x.title)}</h4><p class="codex-summary">${esc(x.summary||'')}</p><details><summary>展开典藏条目</summary><div class="codex-content">${esc(x.content||'')}</div><div class="codex-tags">${esc(x.tags||'')}</div></details><div class="codex-actions"><button class="btn btn-sm btn-ghost" data-codex-edit="${esc(x.id)}">编辑条目</button><button class="btn btn-sm btn-ghost" data-codex-del="${esc(x.id)}">移除</button></div></article>`).join('')}</div></section>`).join('')||'<div class="empty">未找到相关条目，试试其他关键词。</div>'}
    <p class="codex-foot">典藏索引 · 可由站内成员共同补充</p>
  </div>`;
  return portalShell('codex',c);
}
function codexForm(item={id:'',cat:'势力与流派',title:'',summary:'',content:'',tags:''}){
  const isNew=!item.id;
  modal(`<h3>${isNew?'收录典藏条目':'修订典藏条目'}</h3><div class="m-body"><label class="fl">分类</label><input class="field" id="cd-cat" value="${esc(item.cat)}" placeholder="势力与流派 / 人物志 / 文献与民俗"><label class="fl">条目名称</label><input class="field" id="cd-title" value="${esc(item.title)}"><label class="fl">摘要</label><input class="field" id="cd-summary" value="${esc(item.summary)}"><label class="fl">正文</label><textarea class="field" id="cd-content" style="min-height:190px">${esc(item.content)}</textarea><label class="fl">检索标签</label><input class="field" id="cd-tags" value="${esc(item.tags)}" placeholder="用逗号分隔"></div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-codex-save="yes">保存条目</button></div>`).then(v=>{if(v!=='yes')return;const val={id:item.id||genId('pub'),cat:$('#cd-cat').value.trim()||'未分类',title:$('#cd-title').value.trim(),summary:$('#cd-summary').value.trim(),content:$('#cd-content').value.trim(),tags:$('#cd-tags').value.trim()};if(!val.title){toast('请填写条目名称','warn');return;}if(!Array.isArray(DB.data.publicLibrary))DB.data.publicLibrary=[];if(isNew)DB.data.publicLibrary.unshift(val);else{const i=DB.data.publicLibrary.findIndex(x=>x.id===item.id);if(i>=0)DB.data.publicLibrary[i]=val;}DB.save();router();toast(isNew?'已收录条目':'条目已修订','ok');});
}

/* ---------- 主管工作台 ---------- */
function viewDashboard(){
  if(DB.level()<3)return portalShell('dashboard',accessDenied());
  const u=DB.data.users;
  const c=`<div class="p-panel">
    <h2>管理员工作台</h2><div class="ph-sub">区域数据总览（本机数据）</div>
    <div class="stat-strip">
      <div class="ss"><b>${DB.data.archives.length}</b><span>在册异人</span></div>
      <div class="ss"><b>${DB.data.events.length}</b><span>归档事件</span></div>
      <div class="ss"><b>${DB.data.posts.length}</b><span>论坛帖子</span></div>
      <div class="ss"><b>${u.length}</b><span>本地用户</span></div>
    </div>
    <h3 style="font-size:15px;margin:16px 0 8px">绝密条目（仅主管可见）</h3>
    ${DB.data.archives.filter(r=>r.sec>=4).map(r=>`<div class="lib-item" data-arc="${r.id}"><h3>${esc(r.name)}</h3><div class="lm">${esc(r.code)} · ${esc(r.faction)}</div></div>`).join('')}
    ${DB.data.library.filter(l=>l.sec>=4).map(l=>`<div class="lib-item" data-lib="${l.id}"><h3>${esc(l.title)}</h3><div class="lm">${esc(l.cat)}</div></div>`).join('')}
  </div>`;
  return portalShell('dashboard',c);
}
/* ---------- 个人空间 ---------- */
function viewSpace(id){
  if(!DB.user)return viewGate();
  const t=id==='me'?DB.user:DB.data.users.find(u=>u.id===id);
  if(!t)return portalShell('space',`<div class="p-panel empty">用户不存在</div>`);
  const tpl=tplOf(t.tpl);
  const isMe=t.id===DB.user.id;
  const isFriend=DB.user.friends.includes(t.id);
  const myPosts=DB.data.posts.filter(p=>p.authorId===t.id);
  const friends=DB.data.users.filter(u=>t.friends.includes(u.id));
  const cover=t.coverImg?`background-image:url('${t.coverImg}');background-size:cover;background-position:center`
    :`background:${tpl.cover}`;
  const c=`<div class="p-panel" style="padding:0;overflow:hidden">
      <div class="space-cover" style="${cover};--tpl-a:${tpl.a||'#1A2C78'};--tpl-b:${tpl.b||'#2E47B8'}"></div>
      <div class="space-head">
        <div class="av" style="border-width:${t.avatarBorder==='thick'?'6px':t.avatarBorder==='thin'?'2px':'0'};border-color:var(--pt-panel)">${t.avatar&&t.avatar.startsWith('data')?`<img src="${t.avatar}" style="width:100%;height:100%;object-fit:cover">`:esc(avText(t.name))}</div>
        <div class="sh-info">
          <h2 style="color:${t.nameColor||'var(--pt-text)'}">${esc(t.name)}</h2>
          <div class="sh-badges">${gradeBadge(t,{mini:true})}</div>
          <div class="sh-sub">${esc(t.bio||'')}</div>
        </div>
        <div class="space-actions">
          ${isMe?`<a class="btn btn-sm btn-orange" href="#/decorate">装修空间</a>`:
            `<button class="btn btn-sm ${isFriend?'btn-ghost':''}" id="sp-add">${isFriend?'已加好友':'+ 加好友'}</button>`}
        </div>
      </div>
      <div style="padding:20px 26px 26px">
        <div class="space-level-card">
          <div class="slc-head">${gradeBadge(t)}<span class="slc-points">${userPoints(t)} 积分</span></div>
          ${gradeProgress(t)}
          ${isMe?`<button class="btn btn-sm btn-ghost space-level-manage" id="sp-lv-manage">${svgIco('gear')}<span>管理等级与积分</span></button>`:''}
        </div>
        <h3 style="font-size:15px;margin:18px 0 10px">个人动态</h3>
        <div class="portal-notice-text" style="--user-zika-bg:${t.zikaBg||'var(--pt-panel-2)'};background:var(--user-zika-bg);padding:10px;border-radius:8px">${esc(t.notice||'（还没有发布动态）')}</div>
        <h3 style="font-size:15px;margin:20px 0 10px">TA 的帖子（${myPosts.length}）</h3>
        ${myPosts.map(p=>`<div class="lib-item" data-open="${p.id}"><h3 style="font-size:14px">${esc(p.title)}</h3><div class="lm">${relTime(p.createdAt)} · ${p.votes.length} 赞同</div></div>`).join('')||'<div class="empty" style="padding:20px">暂无帖子</div>'}
        <h3 style="font-size:15px;margin:20px 0 10px">好友（${friends.length}）</h3>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${friends.map(f=>`<a href="#/space/${f.id}" class="friend-card" style="margin:0;padding:10px 14px"><span class="av" style="width:36px;height:36px;font-size:14px">${esc(avText(f.name))}</span><span><b>${esc(f.name)}</b></span></a>`).join('')||'<span class="ph-sub">还没有好友</span>'}
        </div>
      </div>
    </div>`;
  return portalShell('space',c);
}

/* 个人空间内：管理论坛等级与积分规则（与数据中心共用同一套数据） */
function openSpaceLevelManage(){
  const rule=pointsRule();
  const levels=forumLevels();
  const ruleLabels=[['post','发帖'],['reply','回帖'],['like','点赞'],['gamePerLine','游戏每消一行'],['gameCap','游戏单局上限']];
  const html=`
    <h3 style="margin:0 0 4px">论坛等级与积分</h3>
    <div class="ph-sub" style="font-size:12.5px">自定义积分规则与各等级名称、升级所需积分（最高 20 级）</div>
    <div class="slv-rule-grid">
      ${ruleLabels.map(([k,label])=>`<div class="sr-cell"><span>${label}</span>
        <input type="number" min="0" class="field" data-spv-rule="${k}" value="${Number(rule[k])||0}"></div>`).join('')}
    </div>
    <div class="slv-edit-list">
      ${levels.map((lv,i)=>`
        <div class="slv-edit-row"><span class="slv-no">${i+1} 级</span>
          <input class="field" data-spv-name="${i}" maxlength="10" value="${esc(lv.name)}" placeholder="等级名">
          <input type="number" min="0" class="field" data-spv-min="${i}" value="${Number(lv.min)||0}"></div>`).join('')}
    </div>
    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-orange" id="spv-save">保存</button>
      <button class="btn btn-ghost btn-sm" id="spv-reset">恢复默认</button>
    </div>`;
  return modal(html);
}

/* ---------- 空间装修 ---------- */
function viewDecorate(){
  if(!DB.user)return viewGate();
  const u=DB.user;
  const c=`<div class="p-panel">
    <h2>空间装修</h2><div class="ph-sub">选择模板、自定义字卡与头像，打造你自己的空间</div>
    <h3 style="font-size:14px;margin:18px 0 10px">昵称（可随时修改，本地保存）</h3>
    <input class="field" id="d-name" value="${esc(u.name)}" placeholder="你的昵称">
    <h3 style="font-size:14px;margin:22px 0 10px">空间模板</h3>
    <div class="tpl-grid">
      ${(TEMPLATES[DB.data.theme||'default']||TEMPLATES.default).map(t=>`<div class="tpl-card ${u.tpl===t.id?'on':''}" data-tpl="${t.id}">
        <div class="tc-cover" style="--tpl-a:${t.a};--tpl-b:${t.b};background:linear-gradient(120deg,var(--tpl-a),var(--tpl-b))"></div><div class="tc-name">${t.name}</div></div>`).join('')}
    </div>
    <h3 style="font-size:14px;margin:22px 0 10px">封面图</h3>
    <input class="field" id="d-cover-url" placeholder="封面图片 URL（可选）" value="${esc(u.coverImg&&u.coverImg.startsWith('http')?u.coverImg:'')}">
    <label class="btn btn-ghost btn-sm" style="margin-top:8px">上传封面图片（自动压缩）<input type="file" id="d-cover-file" accept="image/*" class="hide"></label>
    <h3 style="font-size:14px;margin:22px 0 10px">字卡底色</h3>
    <div class="color-row">${['var(--pt-panel-2)','#FFFFFF','#EDE8D8','#FBE4EC','#0B1E52','#00E5FF','#FF2E88'].map(c=>`<button type="button" data-zika-color="${c}" title="${c}" style="background:${c};border-color:var(--pt-border)"></button>`).join('')}</div>
    <label class="fl">自定义字卡底色</label><input type="color" id="d-zika-custom" value="${/^#[0-9a-f]{6}$/i.test(u.zikaBg||'')?u.zikaBg:'#F2F4FA'}">
    <h3 style="font-size:14px;margin:22px 0 10px">头像边框</h3><select class="field" id="d-avatar-border"><option value="none" ${!u.avatarBorder||u.avatarBorder==='none'?'selected':''}>无</option><option value="thin" ${u.avatarBorder==='thin'?'selected':''}>细边框</option><option value="thick" ${u.avatarBorder==='thick'?'selected':''}>粗边框</option></select>
    <h3 style="font-size:14px;margin:22px 0 10px">昵称颜色</h3><select class="field" id="d-name-color"><option value="var(--pt-text)">跟随主题</option><option value="var(--pt-accent)" ${u.nameColor==='var(--pt-accent)'?'selected':''}>主题强调色</option><option value="var(--pt-highlight)" ${u.nameColor==='var(--pt-highlight)'?'selected':''}>主题重点色</option><option value="#FFFFFF" ${u.nameColor==='#FFFFFF'?'selected':''}>白色</option><option value="#111827" ${u.nameColor==='#111827'?'selected':''}>深色</option></select>
    <h3 style="font-size:14px;margin:22px 0 10px">头像</h3>
    <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
      <div class="av" style="width:64px;height:64px;background:var(--blue-2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;overflow:hidden">${u.avatar&&u.avatar.startsWith('data')?`<img src="${u.avatar}" style="width:100%;height:100%;object-fit:cover">`:esc(avText(u.name))}</div>
      <input class="field" id="d-av-url" style="flex:1;min-width:200px" placeholder="头像图片 URL（可选）" value="${u.avatar&&u.avatar.startsWith('http')?u.avatar:''}">
      <label class="btn btn-ghost btn-sm" style="margin:0">上传本地图片<input type="file" id="d-av-file" accept="image/*" class="hide"></label>
    </div>
    <h3 style="font-size:14px;margin:22px 0 10px">个人简介</h3>
    <textarea class="field" id="d-bio" style="min-height:70px">${esc(u.bio||'')}</textarea>
    <h3 style="font-size:14px;margin:22px 0 10px">个人动态</h3>
    <textarea class="field" id="d-notice" style="min-height:70px" placeholder="写点什么吧……">${esc(u.notice||'')}</textarea>
    <div style="margin-top:22px;display:flex;gap:10px"><button class="btn btn-orange" id="d-save">保存装修</button><a class="btn btn-ghost btn-sm" href="#/space/me">预览空间</a></div>
  </div>`;
  return portalShell('decorate',c);
}
function compressAvatar(file,cb){
  const r=new FileReader();
  r.onload=e=>{const img=new Image();
    img.onload=()=>{const sz=128;const c=document.createElement('canvas');c.width=sz;c.height=sz;
      const ctx=c.getContext('2d');const r0=Math.min(img.width,img.height);
      ctx.drawImage(img,(img.width-r0)/2,(img.height-r0)/2,r0,r0,0,0,sz,sz);
      cb(c.toDataURL('image/jpeg',.85));};
    img.src=e.target.result;};
  r.readAsDataURL(file);
}
/* 通用图片压缩（用于聊天/帖子发照片，maxW 限制最长边） */
function compressImage(file,maxW,cb,onError){
  try{
    const r=new FileReader();
    r.onerror=()=>{if(onError)onError(r.error||new Error('文件读取失败'));};
    r.onload=e=>{const img=new Image();
      img.onerror=()=>{if(onError)onError(new Error('图片解码失败'));};
      img.onload=()=>{try{let w=img.width,h=img.height;
        if(w>maxW){h=Math.round(h*maxW/w);w=maxW;}
        const c=document.createElement('canvas');c.width=w;c.height=h;
        const ctx=c.getContext('2d');if(!ctx)throw new Error('无法创建图片画布');
        ctx.drawImage(img,0,0,w,h);
        cb(c.toDataURL('image/jpeg',.72));
      }catch(err){if(onError)onError(err);else toast('图片处理失败，请换一张图片重试。','err');}};
      img.src=e.target.result;};
    r.readAsDataURL(file);
  }catch(err){if(onError)onError(err);else toast('图片处理失败，请换一张图片重试。','err');}
}
/* 聊天用法提示 */
function chatHint(){
  modal(`<h3>私信使用说明</h3><div class="m-body" style="line-height:2">
    1. 在下方输入框打字，回车发送（Shift+回车换行）；<br>
    2. 点对方头像（或“+ TA 回复一条”），对方就回复一条“请输入内容”，点几次回复几条；<br>
    3. 点击任意气泡可修改文字，照片可改配文；<br>
    4. 点图片按钮可发送照片，帖子和回答里也能插入图片；<br>
    5. 所有内容仅保存在本机，可在数据中心导出。</div>
    <div class="m-foot"><button class="btn btn-sm" data-m="ok">我知道了</button></div>`);
}

/* ---------- 档案 / 事件 / 资料 表单（新增与编辑共用） ---------- */
function archiveForm(r){
  const isNew=!r.id;
  modal(`<h3>${isNew?'新增档案':'编辑档案'}</h3><div class="m-body">
    <div style="display:flex;gap:10px">
      <div style="flex:1"><label class="fl">姓名</label><input class="field" id="m-name" value="${esc(r.name||'')}"></div>
      <div style="flex:1"><label class="fl">编号</label><input class="field" id="m-code" value="${esc(r.code||'')}"></div>
      <div style="flex:1"><label class="fl">性别</label><input class="field" id="m-gender" value="${esc(r.gender||'')}"></div>
    </div>
    <label class="fl">派系 / 所属</label><input class="field" id="m-faction" value="${esc(r.faction||'')}">
    <label class="fl">功法 / 手段</label><input class="field" id="m-skill" value="${esc(r.skill||'')}">
    <div style="display:flex;gap:10px">
      <div style="flex:1"><label class="fl">危险等级</label>
        <select class="field" id="m-danger">${['S','A','B','C','D','未知'].map(x=>`<option ${x===r.danger?'selected':''}>${x}</option>`).join('')}</select></div>
      <div style="flex:1"><label class="fl">状态</label><input class="field" id="m-status" value="${esc(r.status||'')}"></div>
      <div style="flex:1"><label class="fl">机密等级</label>
        <select class="field" id="m-sec">${[1,2,3,4].map(x=>`<option value="${x}" ${x===(r.sec||2)?'selected':''}>${secName(x)}</option>`).join('')}</select></div>
    </div>
    <label class="fl">别名</label><input class="field" id="m-aliases" value="${esc(r.aliases||'')}">
    <label class="fl">备注</label><textarea class="field" id="m-note" style="min-height:120px">${esc(r.note||'')}</textarea></div>
    <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">保存</button></div>`)
    .then(v=>{if(v==='yes'){
      r.name=$('#m-name').value.trim();r.code=$('#m-code').value.trim();r.gender=$('#m-gender').value.trim();
      r.faction=$('#m-faction').value.trim();r.skill=$('#m-skill').value.trim();
      r.danger=$('#m-danger').value;r.status=$('#m-status').value.trim();
      r.sec=parseInt($('#m-sec').value);
      r.aliases=$('#m-aliases').value.trim();r.note=$('#m-note').value;
      if(isNew){r.id=genId('r');DB.data.archives.push(r);}
      DB.save();router();toast(isNew?'档案已新增':'档案已保存','ok');}});
}
function eventForm(e){
  const isNew=!e.id;
  modal(`<h3>${isNew?'新增事件':'编辑事件'}</h3><div class="m-body">
    <div style="display:flex;gap:10px">
      <div style="flex:1"><label class="fl">发生时间</label><input class="field" id="m-date" value="${esc(e.date||'')}" placeholder="如 2026年春"></div>
      <div style="flex:1"><label class="fl">地点</label><input class="field" id="m-loc" value="${esc(e.loc||'')}"></div>
      <div style="flex:1"><label class="fl">机密等级</label>
        <select class="field" id="m-sec">${[1,2,3,4].map(x=>`<option value="${x}" ${x===(e.sec||1)?'selected':''}>${secName(x)}</option>`).join('')}</select></div>
    </div>
    <label class="fl">标题</label><input class="field" id="m-title" value="${esc(e.title||'')}">
    <label class="fl">内容</label><textarea class="field" id="m-body" style="min-height:150px">${esc(e.content||'')}</textarea></div>
    <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">保存</button></div>`)
    .then(v=>{if(v==='yes'){
      e.date=$('#m-date').value.trim();e.loc=$('#m-loc').value.trim();
      e.title=$('#m-title').value.trim();e.content=$('#m-body').value;
      e.sec=parseInt($('#m-sec').value);
      if(isNew){e.id=genId('e');DB.data.events.push(e);}
      DB.save();router();toast(isNew?'事件已新增':'事件已保存','ok');}});
}
function libForm(l){
  const isNew=!l.id;
  modal(`<h3>${isNew?'新增资料':'编辑资料'}</h3><div class="m-body">
    <div style="display:flex;gap:10px">
      <div style="flex:1"><label class="fl">分类</label><input class="field" id="m-cat" value="${esc(l.cat||'')}" placeholder="如 八奇技、组织、基础"></div>
      <div style="flex:1"><label class="fl">机密等级</label>
        <select class="field" id="m-sec">${[1,2,3,4].map(x=>`<option value="${x}" ${x===(l.sec||1)?'selected':''}>${secName(x)}</option>`).join('')}</select></div>
    </div>
    <label class="fl">标题</label><input class="field" id="m-title" value="${esc(l.title||'')}">
    <label class="fl">内容</label><textarea class="field" id="m-body" style="min-height:170px">${esc(l.content||'')}</textarea></div>
    <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">保存</button></div>`)
    .then(v=>{if(v==='yes'){
      l.cat=$('#m-cat').value.trim();l.title=$('#m-title').value.trim();l.content=$('#m-body').value;
      l.sec=parseInt($('#m-sec').value);
      if(isNew){l.id=genId('l');DB.data.library.push(l);}
      DB.save();router();toast(isNew?'资料已新增':'资料已保存','ok');}});
}

/* ---------- 论坛分类管理 ---------- */
function boardManage(){
  const html=`<h3>管理论坛分类</h3><div class="m-body">
    ${DB.data.boards.map((b,i)=>{
      const n=DB.data.posts.filter(p=>p.board===b).length;
      return `<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <input class="field bd-name" data-i="${i}" value="${esc(b)}">
        <span class="muted" style="font-size:12px;white-space:nowrap">${n}帖</span>
        <button class="btn btn-sm btn-ghost bd-del" data-i="${i}" ${n?'disabled title="分类下还有帖子，不能删除"':''}>删除</button>
      </div>`;}).join('')}
    <label class="fl">新增分类</label>
    <div style="display:flex;gap:8px"><input class="field" id="bd-add" placeholder="输入新分类名称" maxlength="10">
    <button class="btn btn-sm btn-orange" id="bd-add-go">添加</button></div>
    <p class="muted" style="font-size:12px;margin-top:10px">改名会同步到该分类下所有帖子；分类下有帖子时不能删除。</p></div>
    <div class="m-foot"><button class="btn btn-sm" id="bd-done">完成</button></div>`;
  const mask=openMask(html);
  mask.querySelectorAll('.bd-del').forEach(btn=>{
    btn.addEventListener('click',()=>{
      if(btn.disabled)return;
      const i=parseInt(btn.dataset.i);
      DB.data.boards.splice(i,1);DB.save();
      mask._close('reopen');
    });
  });
  mask.querySelector('#bd-add-go').addEventListener('click',()=>{
    const v=mask.querySelector('#bd-add').value.trim();
    if(!v)return toast('请输入分类名称','warn');
    if(DB.data.boards.includes(v))return toast('分类已存在','warn');
    DB.data.boards.push(v);DB.save();
    mask._close('reopen');
  });
  mask.querySelector('#bd-done').addEventListener('click',()=>{
    mask.querySelectorAll('.bd-name').forEach(inp=>{
      const i=parseInt(inp.dataset.i);
      const old=DB.data.boards[i];
      const nv=inp.value.trim();
      if(old&&nv&&nv!==old){
        DB.data.boards[i]=nv;
        DB.data.posts.forEach(p=>{if(p.board===old)p.board=nv;});
      }
    });
    mask._close('done');
  });
  p.then(v=>{
    if(v==='reopen'){boardManage();return;}
    if(v==='done'){DB.save();router();toast('分类已更新','ok');}
  });
}

/* ---------- 好友 ---------- */
function viewFriends(){
  if(!DB.user)return viewGate();
  const me=DB.user;
  const friends=DB.data.users.filter(u=>me.friends.includes(u.id));
  const others=DB.data.users.filter(u=>u.id!==me.id&&!me.friends.includes(u.id));
  const c=`<div class="p-panel">
    <h2>我的好友</h2><div class="ph-sub">本机注册的用户都可以加为好友并访问其空间</div>
    ${friends.map(f=>`<div class="friend-card">
      <span class="av">${f.avatar&&f.avatar.startsWith('data')?`<img src="${f.avatar}" style="width:100%;height:100%;object-fit:cover">`:esc(avText(f.name))}</span>
      <div><h4>${esc(f.name)}</h4><p>${esc(f.bio||'').slice(0,30)}</p></div>
      <div class="fc-actions"><a class="btn btn-sm btn-ghost" href="#/space/${f.id}">访问空间</a><button class="btn btn-sm" data-rm="${f.id}">删除</button></div>
    </div>`).join('')||'<div class="empty">还没有好友，从下面添加吧</div>'}
    <h3 style="font-size:15px;margin:22px 0 10px">添加好友</h3>
    ${others.length?`<div class="search-row"><select class="field" id="fr-sel" style="flex:1">
      ${others.map(f=>`<option value="${f.id}">${esc(f.name)}（${esc(f.bio||'').slice(0,16)}）</option>`).join('')}
    </select><button class="btn btn-sm btn-orange" id="fr-add">+ 添加</button></div>`
      :'<div class="ph-sub">没有可添加的用户了</div>'}
  </div>`;
  return portalShell('friends',c);
}

/* ---------- 数据中心 ---------- */
function viewSettings(){
  if(!DB.user)return viewGate();
  const size=Math.round(new Blob([localStorage.getItem(DB_KEY)||'']).size/1024);
  const c=`<div class="p-panel">
    <h2>数据中心</h2><div class="ph-sub">纯本地独立数据：所有内容仅保存在你当前浏览器中</div>
    <h3 style="font-size:15px;margin:16px 0 8px">身份 / 权限</h3>
    <div style="font-size:14px;margin-bottom:10px">当前身份：<span class="lvl-badge lvl-${DB.user.level}">${lvlName(DB.user.level)}</span></div>
    <div class="search-row"><input class="field" id="set-code" style="flex:1" placeholder="输入身份激活码">
      <button class="btn btn-sm" id="set-act">激活</button></div>
    <p class="ph-sub" style="font-size:12.5px;margin-top:6px">员工 NDT-EMP · 管理员 NDT-MGR · 恢复普通异人 NDT-USER</p>
    <h3 style="font-size:15px;margin:22px 0 8px">数据备份 / 迁移</h3>
    <p class="ph-sub" style="font-size:12.5px">当前本地数据约 ${size} KB。导出 JSON 可分享给好友，或在其他浏览器导入。</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-sm" id="set-export">导出数据</button>
      <label class="btn btn-sm btn-ghost" style="margin:0">导入数据<input type="file" id="set-import" accept="application/json" class="hide"></label>
      <button class="btn btn-sm btn-orange" id="set-reset">重置为初始数据</button>
    </div>
    <h3 style="font-size:15px;margin:22px 0 8px">关于本网站</h3>
    <p class="ph-sub" style="font-size:12.5px;line-height:1.9">所有数据均保存在本地浏览器，可在上方导出备份或迁移到其他设备。</p>
  </div>
  <div class="p-panel">
    <h2>论坛等级配置</h2><div class="ph-sub">自定义积分规则与各等级名称、升级所需积分（最高 20 级）</div>
    <h3 style="font-size:14px;margin:16px 0 8px">积分规则</h3>
    <div class="points-rule-grid">
      ${[['post','发帖',1],['reply','回帖',1],['like','点赞',1],['gamePerLine','游戏每消一行',1],['gameCap','游戏单局上限',1]].map(([k,label])=>`
        <div class="prg-row"><span>${label}</span><input type="number" min="0" id="prg-${k}" class="field" value="${Number(pointsRule()[k])||0}"></div>`).join('')}
    </div>
    <h3 style="font-size:14px;margin:20px 0 8px">等级名称与升级积分（累计）</h3>
    <div class="level-cfg-list">
      ${forumLevels().map((lv,i)=>`
        <div class="lcfg-row"><span class="lcfg-no">${i+1} 级</span>
          <input class="field lcfg-name" data-lcfg-name="${i}" maxlength="10" value="${esc(lv.name)}" placeholder="等级名">
          <input type="number" min="0" class="field lcfg-min" data-lcfg-min="${i}" value="${Number(lv.min)||0}"></div>`).join('')}
    </div>
    <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-orange" id="lv-cfg-save">保存等级配置</button>
      <button class="btn btn-ghost btn-sm" id="lv-cfg-reset">恢复默认等级</button>
    </div>
  </div>`;
  return portalShell('settings',c);
}

/* ==================================================================
   消息渲染共用（私信 / 群聊）
   ================================================================== */
function roomsOf(){
  if(!Array.isArray(DB.data.rooms))DB.data.rooms=[makeRoom('聊天室1')];
  return DB.data.rooms;
}
/* 按 id 取聊天室；找不到返回第一个 */
function roomById(id){
  const rooms=roomsOf();
  return rooms.find(r=>r.id===id)||rooms[0];
}
/* 兼容旧调用：默认返回第一个聊天室 */
function roomOf(){return roomsOf()[0];}
function avatarHtml32(u){
  if(u&&u.avatar&&(u.avatar.startsWith('data')||u.avatar.startsWith('http')))
    return `<img src="${esc(u.avatar)}" style="width:100%;height:100%;object-fit:cover">`;
  return esc(avText(u?u.name:'?'));
}
function ctxData(kind,key,id){
  return JSON.stringify({kind,key,id}).replace(/"/g,'&quot;');
}
function voiceBars(len){
  let h='';
  const n=Math.min(16,Math.max(6,Math.round(len*1.2)));
  for(let i=0;i<n;i++){const hh=5+Math.round(14*Math.abs(Math.sin(i*1.7)));h+=`<i style="height:${hh}px"></i>`;}
  return h;
}
function voiceInner(m){
  return `<span class="voice-wrap">
    <span class="voice-play">▶</span>
    <span class="voice-bars">${voiceBars(m.len||1)}</span>
    <span class="voice-len">${m.len||1}″</span></span>
    ${m.text?`<span class="voice-txt">${esc(m.text)}</span>`:''}`;
}
function quoteInner(q){
  if(!q)return '';
  return `<span class="quote-box"><b>${esc(q.name)}：</b>${esc((q.text||'').slice(0,40))}</span>`;
}
function bubbleContent(m){
  if(m.type==='redpacket'||m.type==='transfer')return moneyBubbleHtml(m);
  const q=m.quote?quoteInner(m.quote):'';
  const ph=m.photo?`<img class="msg-photo" src="${m.photo}" alt="照片">`:'';
  const body=m.type==='voice'?voiceInner(m):(m.text?`<span>${esc(m.text)}</span>`:'');
  return q+ph+body;
}
function formatChatTimestamp(at){
  const raw=String(at||'').trim();
  const d=new Date(raw.replace(' ','T'));
  if(!raw)return '时间未记录';
  if(Number.isNaN(d.getTime()))return raw;
  const pad=n=>String(n).padStart(2,'0');
  const today=new Date();
  const hhmm=`${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return d.getFullYear()===today.getFullYear()&&d.getMonth()===today.getMonth()&&d.getDate()===today.getDate()
    ?hhmm:`${pad(d.getMonth()+1)}月${pad(d.getDate())}日 ${hhmm}`;
}
function chatTimestampHtml(m,kind,key,previous){
  // 像常见聊天软件一样：连续聊天不逐条显示时间，首条消息、间隔较久或跨日期时才显示。
  const current=new Date(String(m.at||'').replace(' ','T')).getTime();
  const prev=previous?new Date(String(previous.at||'').replace(' ','T')).getTime():NaN;
  const show=!previous||!Number.isFinite(current)||!Number.isFinite(prev)||current-prev>=5*60*1000||new Date(current).toDateString()!==new Date(prev).toDateString();
  if(!show)return '';
  return `<div class="chat-time-row"><button class="chat-time-node" type="button" data-timeedit="${ctxData(kind,key,m.id)}" title="修改这条时间节点">${esc(formatChatTimestamp(m.at))}</button></div>`;
}
function messageIsMoney(m){return m.type==='redpacket'||m.type==='transfer';}
function moneyNoticeHtml(m,kind,key){
  const mine=kind==='chat'?m.side==='me':m.uid===DB.user.id;
  const recipientName=kind==='chat'?(userOfId(key)?.name||'对方'):(userOfId(m.receivedBy)?.name||'群成员');
  if(m.type==='redpacket'&&m.opened){
    return `<div class="chat-system-row"><span class="money-notice">${mine?esc(recipientName)+'领取了红包':'你领取了红包'} · ¥${fmtMoney(m.amount)}</span></div>`;
  }
  if(m.type==='transfer'){
    if(m.returned)return `<div class="chat-system-row"><span class="money-notice">${mine?esc(recipientName)+'已退还转账':'你已退还转账'} · ¥${fmtMoney(m.amount)}</span></div>`;
    if(m.received)return `<div class="chat-system-row"><span class="money-notice">${mine?esc(recipientName)+'已收款':'你已收款'} · ¥${fmtMoney(m.amount)}</span></div>`;
  }
  return '';
}
function quoteBarHtml(){
  const q=window._quote;
  if(!q)return '';
  return `<div class="quote-bar">引用 <b>${esc(q.name)}</b>：${esc((q.text||'').slice(0,30))}<span class="qx" id="quote-cancel">×</span></div>`;
}
/* 定位消息：返回 {arr,m} */
function locateMsg(data){
  if(data.kind==='room'){
    const room=roomsOf().find(r=>r.id===data.key);
    const arr=room&&Array.isArray(room.messages)?room.messages:[];
    return {arr,m:arr.find(x=>x.id===data.id)||null};
  }
  if(data.kind==='workgroup'){
    const wg=workgroupOf();
    return {arr:wg.messages,m:wg.messages.find(x=>x.id===data.id)};
  }
  const ch=DB.data.chats[data.key];
  return {arr:ch?ch.messages:[],m:ch?ch.messages.find(x=>x.id===data.id):null};
}
function editMessageTime(data){
  const {m}=locateMsg(data);
  if(!m)return;
  const localValue=String(m.at||nowStr()).replace(' ','T').slice(0,16);
  const mask=openMask(`<h3>修改时间节点</h3><div class="m-body">
    <p class="ph-sub" style="margin-top:0">调整后，聊天记录会按新的时间显示。</p>
    <label class="fl">日期与时间</label>
    <input class="field" id="edit-msg-time" type="datetime-local" value="${esc(localValue)}" required>
    <div class="m-foot" style="padding-left:0;padding-right:0;padding-bottom:0">
      <button type="button" class="btn btn-sm btn-ghost" id="edit-time-cancel" style="margin-left:auto">取消</button>
      <button type="button" class="btn btn-sm" id="edit-time-save">保存时间</button>
    </div>
  </div>`);
  mask.querySelector('#edit-time-cancel').addEventListener('click',()=>mask.remove());
  mask.querySelector('#edit-time-save').addEventListener('click',()=>{
    const value=mask.querySelector('#edit-msg-time').value;
    if(!value){toast('请选择日期和时间','warn');return;}
    m.at=value.replace('T',' ');
    DB.save();mask.remove();router();
  });
}

/* ==================================================================
   论坛聊天室（群聊，最多3个独立房间）
   ================================================================== */
function targetIsOpen(target){
  const {seg}=parseHash();
  if(target.kind==='chat')return seg[0]==='chat'&&seg[1]===target.key;
  if(target.kind==='room')return seg[0]==='room'&&activeRoom().id===target.roomId;
  if(target.kind==='workgroup')return seg[0]==='workgroup';
  return false;
}
function conversationBox(kind,key){
  if(kind==='chat')return chatOf(key);if(kind==='room')return roomById(key);if(kind==='workgroup')return workgroupOf();return null;
}

/* ==================================================================
   微信式聊天输入行（统一用于 私信 / 聊天室 / 工作组）
   红包、转账、图片、表情、语音、拍照全部收纳在 ＋ 面板里
   ================================================================== */
function chatTargetFromPrefix(prefix){
  if(prefix==='ch'){const {seg}=parseHash();return {kind:'chat',key:seg[1],side:'them'};}
  if(prefix==='rm'){return {kind:'room',roomId:activeRoom()&&activeRoom().id};}
  return {kind:'workgroup'};
}
function chatInputRow(prefix,opts={}){
  const withVoice=opts.voice!==false;
  const taId=prefix+'-text',sendId=prefix+'-send',photoId=prefix+'-photo-file',camId=prefix+'-camera-file';
  const recBtn=prefix==='ch'?('chat:'+(opts.uid||'')):(prefix==='rm'?'room':'workgroup');
  const emojiGrid=STICKERS.map(s=>`<button type="button" data-emoji-insert="${s}">${s}</button>`).join('');
  return `<div class="chat-input-row" data-prefix="${prefix}">
    <div class="chat-input-panels">
      <div class="emoji-panel hide" id="${prefix}-emoji-panel">
        <div class="ep-grid">${emojiGrid}</div>
        <button type="button" class="ep-back" data-emoji-backspace title="删除">⌫</button>
      </div>
      <div class="plus-panel hide" id="${prefix}-plus-panel">
        <button type="button" class="plus-item" data-plus-act="redpacket"><span class="pi-ic">🧧</span><small>红包</small></button>
        <button type="button" class="plus-item" data-plus-act="transfer"><span class="pi-ic">💳</span><small>转账</small></button>
        <label class="plus-item"><span class="pi-ic">🖼️</span><small>图片</small><input type="file" id="${photoId}" accept="image/*" class="hide"></label>
        <button type="button" class="plus-item" data-plus-act="emoji"><span class="pi-ic">😀</span><small>表情</small></button>
        ${withVoice?`<button type="button" class="plus-item" data-plus-act="voice"><span class="pi-ic">🎙️</span><small>语音</small></button>`:`<span class="plus-item is-placeholder"></span>`}
        <label class="plus-item"><span class="pi-ic">📷</span><small>拍照</small><input type="file" id="${camId}" accept="image/*" capture="environment" class="hide"></label>
      </div>
    </div>
    <div class="chat-input-line">
      ${withVoice?`<button class="ci-ib" id="${prefix}-voice-toggle" type="button" title="语音输入" aria-label="语音输入">
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="18" x2="12" y2="22"/></svg>
      </button>`:''}
      <span class="ci-text-wrap">
        <span class="ci-text-mode" id="${prefix}-text-mode">
          <textarea id="${taId}" rows="1" placeholder="输入消息，回车发送…"></textarea>
        </span>
        <span class="ci-hold-mode hide" id="${prefix}-hold-mode">
          <span class="hold-talk" id="${prefix}-hold" data-recbtn="${recBtn}">按住 说话</span>
        </span>
      </span>
      <button class="ci-ib ci-emoji" data-emoji-toggle="${prefix}" type="button" title="表情" aria-label="表情">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
      </button>
      <button class="ci-ib ci-plus" data-plus-toggle="${prefix}" type="button" title="更多功能" aria-label="更多功能">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <button class="ci-send" id="${sendId}" type="button">发送</button>
    </div>
  </div>`;
}
function closeChatPanels(prefix){
  const row=prefix?document.querySelector(`.chat-input-row[data-prefix="${prefix}"]`):document.querySelector('.chat-input-row');
  if(!row)return;
  row.querySelectorAll('.emoji-panel,.plus-panel').forEach(p=>p.classList.add('hide'));
  row.classList.remove('plus-open','emoji-open');
}
function toggleChatPanel(prefix,which){
  const row=document.querySelector(`.chat-input-row[data-prefix="${prefix}"]`);if(!row)return;
  const panel=row.querySelector('.'+which+'-panel');if(!panel)return;
  const willOpen=panel.classList.contains('hide');
  closeChatPanels(prefix);
  if(willOpen){panel.classList.remove('hide');row.classList.add(which==='plus'?'plus-open':'emoji-open');}
}
function syncChatSendState(prefix){
  const row=document.querySelector(`.chat-input-row[data-prefix="${prefix}"]`);if(!row)return;
  const ta=row.querySelector('textarea');const has=ta&&ta.value.trim().length>0;
  row.classList.toggle('has-text',!!has);
}
function markConversationSeen(kind,key){
  const box=conversationBox(kind,key);if(!box)return;
  if((Number(box.unread)||0)!==0){box.unread=0;DB.save();}
}
function syncDocumentTitle(){const n=unreadCount('messages')+unreadCount('room')+unreadCount('workgroup');const base='哪都通快递 — 您的包裹，无处不达';document.title=(!document.hidden&&n===0)?base:(n?'('+n+') ':'')+base;}
function markIncomingMessage(target,m){
  const box=targetBox(target);
  if(targetIsOpen(target))box.unread=0;
  else box.unread=Math.max(0,Number(box.unread)||0)+1;
  DB.save();
  if(document.hidden&&'Notification' in window&&Notification.permission==='granted'){
    const title=target.kind==='chat'?(userOfId(target.key)?.name||'新私信'):'新的群组消息';
    const preview=String(m?.text|| (m?.type==='redpacket'?'发来一个红包':m?.type==='transfer'?'发来一笔转账':'收到新消息')).slice(0,100);
    const dest=target.kind==='chat'?'#/chat/'+target.key:target.kind==='room'?'#/room':'#/workgroup';
    showSiteNotification(title,preview,dest,'ndt-'+target.kind+'-'+(target.key||target.roomId||'wg'));
  }
  syncDocumentTitle();
  // 消息抵达时立即更新侧栏红点；若正在看私信列表，也同步联系人右侧的未读数。
  setTimeout(()=>{
    syncUnreadBadges();
    const {seg}=parseHash();
    if(seg[0]==='messages'){
      const item=$(`.chat-list-item[data-chat="${target.kind==='chat'?target.key:''}"]`);
      if(item&&target.kind==='chat'){
        const right=item.querySelector('.chat-contact-right');
        if(right)right.innerHTML=unreadBadge(targetBox(target)?.unread,'chat-unread-badge');
      }
    }
  },0);
}
function messageReceiptHtml(){return ''; /* 取消逐条消息已读/未读状态；聊天列表通知提示仍保留 */}
function viewRoom(idx){
  const me=DB.user;
  const rooms=roomsOf();
  let i=Math.max(0,Math.min(rooms.length-1,idx||0));
  const room=rooms[i];
  markConversationSeen('room',room.id);
  const userOf=id=>DB.data.users.find(u=>u.id===id)||{id,id,name:'未知',avatar:''};
  const isCard=room.mode==='card';
  const roomPageKey='room:'+room.id;
  const roomTotalPages=Math.max(1,Math.ceil(room.messages.length/CHAT_PAGE_SIZE));
  const roomPage=Math.max(0,Math.min(roomTotalPages-1,Number(CHAT_PAGE_STATE[roomPageKey]||0)));
  CHAT_PAGE_STATE[roomPageKey]=roomPage;
  const roomEnd=room.messages.length-roomPage*CHAT_PAGE_SIZE;
  const roomStart=Math.max(0,roomEnd-CHAT_PAGE_SIZE);
  const roomPageMessages=room.messages.slice(roomStart,roomEnd);
  const roomTabs=rooms.map((r,k)=>`<button class="room-tab ${k===i?'on':''}" data-room-tab="${k}">${esc(r.name)}${unreadBadge(r.unread,'room-unread-badge')}</button>`).join('')
    +(rooms.length<3?`<button class="room-tab add" id="room-add" title="新建聊天室">＋ 新建</button>`:'');
  const c=`<div class="room-tabs-bar">${roomTabs}</div>
  <div class="p-panel chat-window">
    <div class="chat-head">
      <span class="av" style="background:var(--orange)">👥</span>
      <div><h3>${esc(room.name)}</h3><div class="ch-hint">${room.members.length} 位成员 · 群内消息均可修改</div></div>
      <div class="ch-actions">
        <button class="btn btn-sm btn-ghost" id="rm-rename" title="改名">✎</button>
        <button class="btn btn-sm btn-danger-soft" data-clear-room="${esc(room.id)}" title="只清除此聊天室的消息">⌫ 清除此窗口</button>
        <span class="pop-wrap"><button class="btn btn-sm btn-orange" id="rm-speak">TA 发言 ▾</button></span>
        <button class="btn btn-sm btn-ghost" id="rm-members">成员管理</button>
        <button class="btn btn-sm btn-ghost" id="rm-cfg-open" title="聊天室设置" aria-label="聊天室设置">⚙ 设置</button>
      </div>
    </div>
    <div class="chat-scroll" id="ch-scroll">
      ${roomPageMessages.map((m,mi)=>{
        const u=userOf(m.uid);
        const mine=m.uid===me.id;
        const timeNode=chatTimestampHtml(m,'room',room.id,room.messages[mi-1]);
        if(m.recalled)return `${timeNode}<div class="msg recalled"><span class="recall-txt">${esc(u.name)} 撤回了一条消息</span></div>`;
        const avAttr=mine?'':`data-room-av="${m.uid}" title="点 TA 头像，TA 发言一条"`;
        const money=messageIsMoney(m);
        const content=money
          ?`<span class="msg-attachment" data-msgctx="${ctxData('room',room.id,m.id)}">${bubbleContent(m)}</span>`
          :`<span class="bubble ${m.photo?'has-photo':''}" data-msgctx="${ctxData('room',room.id,m.id)}">${bubbleContent(m)}</span>`;
        return `${timeNode}<div class="msg ${mine?'me':'them'} ${money?'money-msg':''}">
          <span class="m-av" ${avAttr}>${avatarHtml32(u)}</span>
          <span class="msg-content-stack">
            ${mine?'':`<span class="m-name">${esc(u.name)}</span>`}
            ${content}
            ${messageReceiptHtml(m,mine)}
          </span>
        </div>${money?moneyNoticeHtml(m,'room',room.id):''}`;}).join('')||'<div class="empty">聊天室还没有消息。点“TA 发言”让成员说话，或在下方打字。</div>'}
    </div>
    <div class="chat-pagination" style="display:flex;gap:8px;align-items:center;justify-content:center;padding:10px">
      <button class="btn btn-sm btn-ghost" data-room-page="older" data-room-id="${esc(room.id)}" ${roomPage>=roomTotalPages-1?'disabled':''}>更早消息</button>
      <span>第 ${roomPage+1}/${roomTotalPages} 页 · 共 ${room.messages.length} 条</span>
      <button class="btn btn-sm btn-ghost" data-room-page="newer" data-room-id="${esc(room.id)}" ${roomPage<=0?'disabled':''}>更新消息</button>
    </div>
    ${quoteBarHtml()}
    ${chatInputRow('rm',{voice:true})}
  </div>`;
  window._roomId=room.id;
  setTimeout(()=>maybeProactive({kind:'room',roomId:room.id}),0);
  return portalShell('room',c);
}

/* ==================================================================
   私信聊天
   ================================================================== */
function chatOf(uid){
  if(!DB.data.chats[uid])DB.data.chats[uid]={messages:[]};
  return DB.data.chats[uid];
}
/* ---------- 微信式私信：共享数据与左栏 ---------- */
function wxEntries(){
  return Object.keys(DB.data.chats||{}).map(k=>{
    const u=DB.data.users.find(x=>x.id===k);
    const ch=DB.data.chats[k];
    const history=Array.isArray(ch?.messages)?ch.messages:[];
    return {u,ch,history,last:history.length?history[history.length-1]:null};
  }).filter(x=>x.u&&x.history.length>0&&(!DB.user||String(x.u.id)!==String(DB.user.id)))
    .sort((a,b)=>Number(!!b.ch.pinned)-Number(!!a.ch.pinned)||String(b.last?.at||'').localeCompare(String(a.last?.at||'')));
}
function wxListTime(at){
  const d=new Date(String(at||'').replace(' ','T'));
  if(Number.isNaN(d.getTime()))return '';
  const pad=n=>String(n).padStart(2,'0');
  const sameDay=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
  const today=new Date();
  const yest=new Date();yest.setDate(yest.getDate()-1);
  if(sameDay(d,today))return pad(d.getHours())+':'+pad(d.getMinutes());
  if(sameDay(d,yest))return '昨天';
  const todayMid=new Date(today);todayMid.setHours(0,0,0,0);
  const dMid=new Date(d);dMid.setHours(0,0,0,0);
  const diffDays=Math.round((todayMid-dMid)/86400000);
  if(diffDays>=0&&diffDays<7)return ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()];
  if(d.getFullYear()===today.getFullYear())return (d.getMonth()+1)+'/'+d.getDate();
  return d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate();
}
function wxPreview(last){
  if(!last)return '';
  if(last.type==='redpacket')return '[红包]';
  if(last.type==='transfer')return '[转账]';
  if(last.type==='voice')return '[语音]';
  if(last.type==='photo')return '[图片]';
  return last.text||'';
}
function wxAsideHtml(activeUid){
  const me=DB.user;
  const entries=wxEntries();
  return `<div class="wx-aside">
    <div class="wx-aside-head">
      <h2>私信</h2>
      <span class="wx-spacer">
        <button class="wx-icon-btn" id="wx-new-toggle" type="button" title="发起新聊天" aria-label="发起新聊天">＋</button>
        <button class="wx-icon-btn" id="msg-hint" type="button" title="使用说明" aria-label="使用说明" style="font-size:13px">？</button>
      </span>
    </div>
    <div class="wx-search"><input id="wx-search" type="search" placeholder="搜索联系人" autocomplete="off"></div>
    <div class="wx-new-row" id="wx-new-row" style="display:none">
      <select id="msg-new" aria-label="选择用户发起聊天">
        <option value="">— 选择用户 —</option>
        ${DB.data.users.filter(u=>u.id!==me.id).map(u=>`<option value="${u.id}">${esc(u.name)}（${lvlName(u.level)}）</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-orange" id="msg-open" type="button">打开</button>
    </div>
    <div class="wx-list">
      ${entries.length?entries.map(({u,ch,last})=>`<div class="wx-item ${u.id===activeUid?'is-active':''} ${ch.pinned?'is-pinned':''}" data-chat="${u.id}" data-name="${esc(u.name)}">
        <span class="wx-av">${avatarHtml32(u)}${unreadBadge(ch.unread,'chat-unread-badge')}</span>
        <span class="wx-copy"><h4>${esc(u.name)}</h4><p>${esc(wxPreview(last))}</p></span>
        <span class="wx-meta"><time>${esc(wxListTime(last.at))}</time><button class="wx-pin-btn" type="button" data-chat-pin="${u.id}" title="${ch.pinned?'取消置顶':'置顶联系人'}" aria-label="${ch.pinned?'取消置顶':'置顶联系人'}">${ch.pinned?'★':'☆'}</button></span>
      </div>`).join('')
      :'<div class="empty"><div class="es">💬</div>还没有聊天记录<br>点右上角 ＋ 发起一个吧</div>'}
    </div>
  </div>`;
}
function wxEmptyHtml(icon,txt){
  return `<div class="wx-main"><div class="wx-empty"><div class="wx-empty-ic">${icon}</div><p>${esc(txt)}</p></div></div>`;
}
function viewMessages(){
  const c=`<div class="wx-im wx-on-list">
    ${wxAsideHtml('')}
    ${wxEmptyHtml('💬','选择一个会话开始聊天')}
  </div>`;
  return portalShell('messages',c);
}

const CHAT_PAGE_SIZE=50;
const CHAT_PAGE_STATE=window.__ndtChatPages||(window.__ndtChatPages={});
function viewChat(uid){
  const me=DB.user;
  // 不能给自己发私信：命中自己的会话时回到列表并提示，同时清理可能残留的自发会话。
  if(me&&String(uid)===String(me.id)){
    if(DB.data&&DB.data.chats&&DB.data.chats[me.id]){delete DB.data.chats[me.id];DB.save();}
    try{localStorage.removeItem('ndt-last-chat-uid');sessionStorage.removeItem('ndt-last-chat-uid');}catch(e){}
    toast('不能给自己发私信','warn');
    const c=`<div class="wx-im wx-on-list">${wxAsideHtml('')}${wxEmptyHtml('🚫','不能给自己发私信')}</div>`;
    return portalShell('messages',c);
  }
  // 记住最近打开的私信对象；离开其他模块后再次点“私信”，优先恢复这段对话。
  try{if(uid){localStorage.setItem('ndt-last-chat-uid',String(uid));sessionStorage.setItem('ndt-last-chat-uid',String(uid));}}catch(e){try{sessionStorage.setItem('ndt-last-chat-uid',String(uid));}catch(e2){}}
  const fu=DB.data.users.find(u=>u.id===uid);
  if(!fu){
    const c=`<div class="wx-im wx-on-list">${wxAsideHtml('')}${wxEmptyHtml('⚠️','用户不存在')}</div>`;
    return portalShell('messages',c);
  }
  const ch=chatOf(uid);
  markConversationSeen('chat',uid);
  const totalPages=Math.max(1,Math.ceil(ch.messages.length/CHAT_PAGE_SIZE));
  const page=Math.max(0,Math.min(totalPages-1,Number(CHAT_PAGE_STATE[uid]||0)));
  CHAT_PAGE_STATE[uid]=page;
  const end=ch.messages.length-page*CHAT_PAGE_SIZE;
  const start=Math.max(0,end-CHAT_PAGE_SIZE);
  const pageMessages=ch.messages.slice(start,end);
  const c=`<div class="wx-im wx-on-chat">
    ${wxAsideHtml(uid)}
    <div class="wx-main">
      <div class="wx-head">
        <a class="wx-back" id="wx-back" href="javascript:void(0)" aria-label="返回会话列表">‹</a>
        <h3>${esc(fu.name)}</h3>
        <button class="wx-more" id="wx-more" type="button" title="聊天设置" aria-label="聊天设置">⋯</button>
      </div>
      <div class="wx-scroll" id="ch-scroll">
        ${pageMessages.map((m,mi)=>{
          const mine=m.side==='me';
          const timeNode=chatTimestampHtml(m,'chat',uid,ch.messages[mi-1]);
          if(m.recalled)return `${timeNode}<div class="msg recalled"><span class="recall-txt">${mine?'你':esc(fu.name)}撤回了一条消息</span></div>`;
          const av=mine
            ?`<span class="m-av">${avatarHtml32(me)}</span>`
            :`<span class="m-av" data-them-av="1" title="点 TA 头像，TA 回复一条">${avatarHtml32(fu)}</span>`;
          const money=messageIsMoney(m);
          const content=money
            ?`<span class="msg-attachment" data-msgctx="${ctxData('chat',uid,m.id)}">${bubbleContent(m)}</span>`
            :`<span class="bubble ${m.photo?'has-photo':''}" data-msgctx="${ctxData('chat',uid,m.id)}">${bubbleContent(m)}</span>`;
          return `${timeNode}<div class="msg ${mine?'me':'them'} ${money?'money-msg':''}">
            ${av}<span class="msg-content-stack">${content}${messageReceiptHtml(m,mine)}</span>
          </div>${money?moneyNoticeHtml(m,'chat',uid):''}`;}).join('')||'<div class="empty">还没有消息。先发一条，再点右上角“···”让 TA 回复吧。</div>'}
      </div>
      <div class="wx-page-bar">
        <button class="btn btn-sm btn-ghost" type="button" data-chat-page="older" data-chat-uid="${esc(uid)}" ${page>=totalPages-1?'disabled':''}>‹ 更早</button>
        <span>第 ${page+1}/${totalPages} 页 · 共 ${ch.messages.length} 条</span>
        <button class="btn btn-sm btn-ghost" type="button" data-chat-page="newer" data-chat-uid="${esc(uid)}" ${page<=0?'disabled':''}>最新 ›</button>
      </div>
      <div class="wx-input-wrap">
        ${quoteBarHtml()}
        ${chatInputRow('ch',{voice:true,uid})}
      </div>
    </div>
  </div>`;
  setTimeout(()=>maybeProactive({kind:'chat',key:uid,side:'them'}),0);
  return portalShell('messages',c);
}

/* ---------- 微信式私信：聊天设置抽屉 ---------- */
function closeWxCfg(){
  const o=document.getElementById('wx-cfg-overlay');if(o)o.remove();
  const p=document.getElementById('ch-cfg');if(p)p.remove();
}
function openWxCfg(uid){
  closeWxCfg();
  const ch=chatOf(uid);
  const overlay=document.createElement('div');
  overlay.className='wx-cfg-overlay';overlay.id='wx-cfg-overlay';
  const panel=document.createElement('div');
  panel.className='wx-cfg-panel card-cfg';panel.id='ch-cfg';
  panel.innerHTML=`
    <div class="wx-cfg-head"><h3>聊天设置</h3><button class="wx-cfg-close" id="wx-cfg-close" type="button" aria-label="关闭">×</button></div>
    <div class="wx-cfg-body">
      <div class="wx-cfg-section">
        <span class="wx-cfg-label">回复模式</span>
        <span class="mode-switch">
          <button type="button" data-mode="create" class="${ch.mode==='card'?'':'on'}">创作模式</button>
          <button type="button" data-mode="card" class="${ch.mode==='card'?'on':''}">字卡模式</button>
        </span>
      </div>
      <div class="wx-cfg-section card-only" style="display:${ch.mode==='card'?'inline-flex':'none'}">
        <span class="wx-cfg-label">字卡设置</span>
        <div class="wx-cfg-row"><select id="ch-speed" title="回复速度">
          <option value="instant" ${ch.speed==='instant'?'selected':''}>秒回（8秒内）</option>
          <option value="natural" ${ch.speed==='natural'?'selected':''}>自然（60秒内）</option>
          <option value="deep" ${ch.speed==='deep'?'selected':''}>深思（3分钟内）</option>
        </select></div>
        <label class="wx-cfg-check"><input type="checkbox" id="ch-proactive" ${ch.proactive===false?'':'checked'}> 主动行为</label>
        <div class="wx-cfg-row"><select id="ch-activity" title="主动消息频率">
          <option value="active" ${ch.proactiveActivity==='active'?'selected':''}>活跃（约1分钟一条）</option>
          <option value="normal" ${(ch.proactiveActivity||'normal')==='normal'?'selected':''}>正常（约3分钟一条）</option>
          <option value="quiet" ${ch.proactiveActivity==='quiet'?'selected':''}>安静（约10分钟一条）</option>
          <option value="custom" ${ch.proactiveActivity==='custom'?'selected':''}>自定义</option>
        </select>
        <input id="ch-activity-sec" type="number" min="30" max="3600" step="10" value="${ch.proactiveInterval||120}" title="平均秒数" style="display:${ch.proactiveActivity==='custom'?'inline-block':'none'}"></div>
        <label class="wx-cfg-check"><input type="checkbox" id="ch-read-no-reply" ${ch.readNoReply?'checked':''}> 已读不回</label>
      </div>
      <div class="wx-cfg-actions">
        <button class="btn btn-sm" id="ch-cards" type="button">字卡管理</button>
        <button class="btn btn-sm btn-ghost" id="ch-add-them" type="button">＋ TA 回复一条</button>
        <button class="btn btn-sm btn-danger-soft" type="button" data-clear-chat="${esc(uid)}">⌫ 清除此窗口</button>
        <button class="btn btn-sm btn-ghost" id="ch-hint" type="button">使用说明</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  // 抽屉挂到 .portal 内，才能继承当前主题的 --pt-* 变量（含默认/日间/古风/赛博），
  // 否则挂在 body 上会因拿不到主题变量而背景透明。
  (document.querySelector('.portal')||document.body).appendChild(panel);
  overlay.addEventListener('click',closeWxCfg);
  panel.querySelector('#wx-cfg-close').addEventListener('click',closeWxCfg);
}

/* ---------- 通用：会话设置抽屉（聊天室 / 工作组，与私信抽屉同款） ---------- */
function closeConvDrawer(){
  const o=document.getElementById('conv-drawer-overlay');if(o)o.remove();
  const p=document.querySelector('.wx-cfg-panel[data-conv-drawer]');if(p)p.remove();
}
function openConvDrawer({cfgId,title,bodyHtml}){
  closeConvDrawer();
  const overlay=document.createElement('div');
  overlay.className='wx-cfg-overlay';overlay.id='conv-drawer-overlay';
  const panel=document.createElement('div');
  panel.className='wx-cfg-panel card-cfg';panel.id=cfgId;panel.setAttribute('data-conv-drawer','1');
  panel.innerHTML=`
    <div class="wx-cfg-head"><h3>${title}</h3><button class="wx-cfg-close" type="button" aria-label="关闭">×</button></div>
    <div class="wx-cfg-body">${bodyHtml}</div>`;
  document.body.appendChild(overlay);
  // 挂到 .portal 内以继承当前主题变量；否则拿不到 --pt-* 会背景透明。
  (document.querySelector('.portal')||document.body).appendChild(panel);
  overlay.addEventListener('click',closeConvDrawer);
  panel.querySelector('.wx-cfg-close').addEventListener('click',closeConvDrawer);
  return panel;
}
/* 模式切换块（与私信一致） */
function convModeSwitchHtml(box){
  const isCard=box.mode==='card';
  return `<span class="mode-switch">
    <button type="button" data-mode="create" class="${isCard?'':'on'}">创作模式</button>
    <button type="button" data-mode="card" class="${isCard?'on':''}">字卡模式</button>
  </span>`;
}
/* 字卡设置块（prefix 决定元素 id，复用现有 speed/proactive/activity 处理） */
function convCardSettingsHtml(prefix,box){
  const isCard=box.mode==='card';
  const speedId=prefix+'-speed',proactiveId=prefix+'-proactive',activityId=prefix+'-activity',
        activitySecId=prefix+'-activity-sec',readNoReplyId=prefix+'-read-no-reply';
  return `<div class="wx-cfg-section card-only" style="display:${isCard?'inline-flex':'none'}">
    <span class="wx-cfg-label">字卡设置</span>
    <div class="wx-cfg-row"><select id="${speedId}" title="回复速度">
      <option value="instant" ${box.speed==='instant'?'selected':''}>秒回（8秒内）</option>
      <option value="natural" ${box.speed==='natural'?'selected':''}>自然（60秒内）</option>
      <option value="deep" ${box.speed==='deep'?'selected':''}>深思（3分钟内）</option>
    </select></div>
    <label class="wx-cfg-check"><input type="checkbox" id="${proactiveId}" ${box.proactive===false?'':'checked'}> 主动行为</label>
    <div class="wx-cfg-row"><select id="${activityId}" title="主动消息频率">
      <option value="active" ${box.proactiveActivity==='active'?'selected':''}>活跃（约1分钟一条）</option>
      <option value="normal" ${(box.proactiveActivity||'normal')==='normal'?'selected':''}>正常（约3分钟一条）</option>
      <option value="quiet" ${box.proactiveActivity==='quiet'?'selected':''}>安静（约10分钟一条）</option>
      <option value="custom" ${box.proactiveActivity==='custom'?'selected':''}>自定义</option>
    </select>
    <input id="${activitySecId}" type="number" min="30" max="3600" step="10" value="${box.proactiveInterval||120}" title="平均秒数" style="display:${box.proactiveActivity==='custom'?'inline-block':'none'}"></div>
    <label class="wx-cfg-check"><input type="checkbox" id="${readNoReplyId}" ${box.readNoReply?'checked':''}> 已读不回</label>
  </div>`;
}
/* 聊天室设置抽屉 */
function openRoomCfg(){
  const room=activeRoom();
  const body=`
    <div class="wx-cfg-section">
      <span class="wx-cfg-label">回复模式</span>
      ${convModeSwitchHtml(room)}
    </div>
    ${convCardSettingsHtml('rm',room)}
    <div class="wx-cfg-actions">
      <button class="btn btn-sm" id="rm-cards" type="button">字卡管理</button>
    </div>`;
  openConvDrawer({cfgId:'rm-cfg',title:'聊天室设置',bodyHtml:body});
}
/* 工作组设置抽屉 */
function openWgCfg(){
  const wg=workgroupOf();
  const body=`
    <div class="wx-cfg-section">
      <span class="wx-cfg-label">回复模式</span>
      ${convModeSwitchHtml(wg)}
    </div>
    ${convCardSettingsHtml('wg',wg)}
    <div class="wx-cfg-actions">
      <button class="btn btn-sm" id="wg-cards" type="button">字卡管理</button>
    </div>`;
  openConvDrawer({cfgId:'wg-cfg',title:'工作组设置',bodyHtml:body});
}
/* 新建聊天展开 / 抽屉打开（独立监听，不影响既有委托） */
document.addEventListener('click',e=>{
  const t=e.target;
  const nt=t.closest('#wx-new-toggle');
  if(nt){const r=document.getElementById('wx-new-row');if(r)r.style.display=r.style.display==='none'?'flex':'none';return;}
  const mo=t.closest('#wx-more');
  if(mo){const seg=parseHash().seg;if(seg[1])openWxCfg(seg[1]);return;}
  const wb=t.closest('#wx-back');
  if(wb){try{sessionStorage.setItem('ndt-force-list','1');}catch(e){}location.hash='#/messages';return;}
});
/* 点抽屉里的操作按钮前先关闭抽屉（捕获阶段，既有委托随后执行） */
document.addEventListener('click',e=>{
  const t=e.target;
  if(!t.closest('#ch-cfg'))return;
  if(t.closest('#ch-cards')||t.closest('#ch-add-them')||t.closest('[data-clear-chat]')||t.closest('#ch-hint'))closeWxCfg();
},true);
/* 会话列表实时过滤 */
document.addEventListener('input',e=>{
  if(e.target.id!=='wx-search')return;
  const q=e.target.value.trim().toLowerCase();
  document.querySelectorAll('.wx-list .wx-item').forEach(it=>{
    const name=(it.dataset.name||'').toLowerCase();
    it.style.display=(!q||name.indexOf(q)>=0)?'':'none';
  });
});
/* 路由切换时关闭设置抽屉 */
window.addEventListener('hashchange',closeWxCfg);

/* ==================================================================
   群聊 / 私信 动作逻辑
   ================================================================== */
function scrollRoom(){setTimeout(()=>{const sc=$('#ch-scroll');if(sc&&sc.scrollHeight-sc.scrollTop-sc.clientHeight<140)sc.scrollTop=sc.scrollHeight;},30);}
function activeRoom(){
  const{seg}=parseHash();
  if(seg[0]==='room'){
    const rooms=roomsOf();const idx=seg[1]?parseInt(seg[1],10):0;
    return rooms[Math.max(0,Math.min(rooms.length-1,idx))];
  }
  return roomsOf()[0];
}
function roomSpeak(room,uid){
  if(!room)room=activeRoom();
  if(!room.members.includes(uid))room.members.push(uid);
  const m={id:genId('m'),uid,type:'text',text:'请输入内容',at:nowStr()};markIncomingMessage({kind:'room',roomId:room.id},m);
  room.messages.push(m);CHAT_PAGE_STATE['room:'+room.id]=0;DB.save();router();scrollRoom();
}
function themReply(uid){
  if(DB.user&&String(uid)===String(DB.user.id)){toast('不能给自己发私信','warn');return;}
  const ch=chatOf(uid);const m={id:genId('m'),side:'them',type:'text',text:'请输入内容',at:nowStr()};
  markIncomingMessage({kind:'chat',key:uid},m);ch.messages.push(m);CHAT_PAGE_STATE[uid]=0;
  DB.save();router();scrollRoom();
}
function toggleVoice(p){
  const tm=$('#'+p+'-text-mode'),hm=$('#'+p+'-hold-mode');
  if(tm.classList.contains('hide')){tm.classList.remove('hide');hm.classList.add('hide');}
  else{tm.classList.add('hide');hm.classList.remove('hide');}
}
/* 统一的本人消息提交入口：会话定位、引用消费、持久化、界面刷新和自动回复保持同一顺序。 */
function commitOutgoingMessage(target,msg,options={}){
  if(!DB.user){toast('当前账号状态已变化，消息未发送。','warn');return false;}
  const box=targetBox(target);
  if(!box||!Array.isArray(box.messages)){toast('目标会话不存在，消息未发送。','warn');return false;}
  if(window._quote&&!msg.quote){msg.quote=window._quote;window._quote=null;}
  box.messages.push(msg);if(target.kind==='chat')CHAT_PAGE_STATE[target.key]=0;else if(target.kind==='room')CHAT_PAGE_STATE['room:'+target.roomId]=0;else if(target.kind==='workgroup')CHAT_PAGE_STATE['workgroup:main']=0;
  // 用户主动发送后暂停主动触发，由本条消息对应的 autoReply 统一调度。
  box.proactiveWaiting=true;
  DB.save();
  refreshIfActive(target);
  if(targetIsOpen(target))scrollRoom();
  if(options.autoReply!==false)autoReply(target);
  return true;
}
function sendRoom(room){
  const ta=$('#rm-text');const text=ta.value.trim();
  if(!text){toast('请输入消息内容','warn');return;}
  if(!room)room=activeRoom();
  if(!room||!roomsOf().some(r=>r.id===room.id)){toast('当前聊天室不存在，消息未发送。','warn');return;}
  commitOutgoingMessage({kind:'room',roomId:room.id},{id:genId('m'),uid:DB.user.id,type:'text',text,at:nowStr()});
}
function sendChat(uid){
  const ta=$('#ch-text');const text=ta.value.trim();
  if(!text){toast('请输入消息内容','warn');return;}
  if(DB.user&&String(uid)===String(DB.user.id)){toast('不能给自己发私信','warn');return;}
  if(!uid||!DB.data.users.some(u=>u.id===uid)){toast('当前私聊对象不存在，消息未发送。','warn');return;}
  commitOutgoingMessage({kind:'chat',key:uid,side:'them'},{id:genId('m'),side:'me',type:'text',text,at:nowStr()});
}
/* 消息发送人名字（用于编辑/引用） */
function msgSenderName(kind,key,m){
  if(kind==='room'||kind==='workgroup'){const u=DB.data.users.find(x=>x.id===m.uid);return u?u.name:'?';}
  return m.side==='me'?DB.user.name:((DB.data.users.find(x=>x.id===key)||{name:'?'}).name);
}
/* 编辑消息（点气泡） */
function editMsg(data){
  const{arr,m}=locateMsg(data);
  if(!m)return;
  const isVoice=m.type==='voice';
  const name=msgSenderName(data.kind,data.key,m);
  modal(`<h3>编辑消息 · ${esc(name)}</h3><div class="m-body">
    ${m.photo?`<img src="${m.photo}" style="max-width:100%;border-radius:8px;margin-bottom:10px"><label style="display:flex;gap:6px;align-items:center;font-size:13px;color:var(--muted);margin-bottom:10px"><input type="checkbox" id="m-rm-photo"> 删除这张照片</label>`:''}
    ${isVoice?`<label style="font-size:13px;color:var(--muted)">语音时长（秒）</label>
      <input class="field" id="m-len" type="number" min="1" value="${m.len||1}" style="margin-bottom:10px">
      <label style="font-size:13px;color:var(--muted)">语音转文字内容</label>
      <textarea class="field" id="m-msg" style="min-height:80px" placeholder="语音内容">${esc(m.text||'')}</textarea>`
      :`<textarea class="field" id="m-msg" style="min-height:90px" placeholder="消息内容（可留空）">${esc(m.text||'')}</textarea>`}
  </div>
  <div class="m-foot">
    <button class="btn btn-sm btn-ghost" data-m="del" style="color:#FF9DA0;margin-right:auto">彻底删除</button>
    <button class="btn btn-sm btn-ghost" data-m="no">取消</button>
    <button class="btn btn-sm" data-m="yes">保存</button>
  </div>`)
  .then(v=>{
    if(v==='del'){
      const idx=arr.findIndex(x=>x.id===m.id);if(idx>=0)arr.splice(idx,1);
      DB.save();router();toast('消息已删除');return;
    }
    if(v==='yes'){
      if(isVoice)m.len=Math.max(1,parseInt($('#m-len').value,10)||1);
      m.text=$('#m-msg').value;
      if(m.photo&&$('#m-rm-photo')&&$('#m-rm-photo').checked)m.photo='';
      if(!isVoice&&!m.text&&!m.photo){const i=arr.findIndex(x=>x.id===m.id);if(i>=0)arr.splice(i,1);}
      DB.save();router();toast('消息已修改','ok');
    }
  });
}
/* 长按上下文菜单 */
function showMsgMenu(xy,data){
  closeMsgMenu();
  const{arr,m}=locateMsg(data);
  if(!m)return;
  const menu=document.createElement('div');menu.className='msg-menu';menu.id='msg-menu';
  menu.innerHTML=`<button data-act="quote">引用</button>
    <button data-act="time">修改时间</button>
    <button data-act="recall">撤回</button>
    <button data-act="del" class="danger">删除</button>`;
  document.body.appendChild(menu);
  window._menuGuard=1;
  const w=menu.offsetWidth,h=menu.offsetHeight;
  let x=xy.x,y=xy.y;
  if(x+w>innerWidth-8)x=innerWidth-w-8;
  if(y+h>innerHeight-8)y=innerHeight-h-8;
  menu.style.left=x+'px';menu.style.top=y+'px';
  menu.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
    const act=b.dataset.act;closeMsgMenu();
    if(act==='quote'){
      const name=msgSenderName(data.kind,data.key,m);
      const txt=m.type==='voice'?'[语音] '+(m.text||''):m.text;
      window._quote={name,text:txt};
      router();toast('已引用，回复时将带上');
    }else if(act==='time'){
      editMessageTime(data);
    }else if(act==='recall'){
      m.recalled=true;DB.save();router();
    }else if(act==='del'){
      const i=arr.findIndex(x=>x.id===m.id);if(i>=0)arr.splice(i,1);
      DB.save();router();toast('消息已删除');
    }
  }));
  setTimeout(()=>document.addEventListener('click',closeMsgMenuOnce),0);
  if(navigator.vibrate)navigator.vibrate(25);
}
function closeMsgMenu(){const m=$('#msg-menu');if(m)m.remove();}
function closeMsgMenuOnce(e){
  if(e.target.closest('#msg-menu'))return;
  if(window._menuGuard>0){window._menuGuard--;return;}
  closeMsgMenu();document.removeEventListener('click',closeMsgMenuOnce);
}
/* 长按检测（触摸 + 鼠标） */
let pressTimer=null,pressXY=null,pressData=null;
function pressStart(e){
  const el=e.target.closest('[data-msgctx]');
  if(!el)return;
  const pt=e.touches&&e.touches[0]?e.touches[0]:e;
  pressXY={x:pt.clientX,y:pt.clientY};
  pressData=JSON.parse(el.dataset.msgctx);
  window._longPressed=false;
  pressTimer=setTimeout(()=>{
    pressTimer=null;window._longPressed=true;
    showMsgMenu(pressXY,pressData);
  },460);
}
function pressEnd(){if(pressTimer){clearTimeout(pressTimer);pressTimer=null;}}
document.addEventListener('touchstart',pressStart,{passive:true});
document.addEventListener('touchend',pressEnd);
document.addEventListener('touchmove',pressEnd,{passive:true});
document.addEventListener('mousedown',pressStart);
document.addEventListener('mouseup',pressEnd);
document.addEventListener('mousemove',pressEnd);
/* 成员管理 */
function roomMembers(room){
  if(!room)room=activeRoom();
  const me=DB.user;
  const others=DB.data.users.filter(u=>u.id!==me.id);
  others.sort((a,b)=>{
    const fa=(me.friends||[]).includes(a.id)?0:1,fb=(me.friends||[]).includes(b.id)?0:1;
    return fa-fb;
  });
  modal(`<h3>聊天室成员</h3><div class="m-body">
    <div class="ph-sub">勾选要加入聊天室的用户（好友优先）；取消勾选即移出。</div>
    <label class="mem-row" style="border-bottom:1px solid #2A3A7E;margin-bottom:4px">
      <input type="checkbox" checked disabled>
      <span class="av" style="width:30px;height:30px;font-size:12px">${avatarHtml32(me)}</span>
      <span>${esc(me.name)}（我）</span></label>
    ${others.map(u=>`<label class="mem-row">
      <input type="checkbox" class="mem-ck" value="${u.id}" ${room.members.includes(u.id)?'checked':''}>
      <span class="av" style="width:30px;height:30px;font-size:12px">${avatarHtml32(u)}</span>
      <span>${esc(u.name)} <span style="font-size:12px">（${lvlName(u.level)}）</span></span>
      ${(me.friends||[]).includes(u.id)?'<span class="tag-mini" style="margin-left:auto;color:var(--orange)">好友</span>':''}
    </label>`).join('')||'<div class="empty">暂无其他用户，先去注册账号吧。</div>'}
  </div>
  <div class="m-foot"><button class="btn btn-sm btn-ghost" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">保存</button></div>`)
  .then(v=>{if(v==='yes'){
    const sel=[...document.querySelectorAll('.mem-ck')].filter(c=>c.checked).map(c=>c.value);
    room.members=[me.id,...sel];
    DB.save();router();toast('成员已更新','ok');
  }});
}
/* TA 发言下拉 */
function speakPop(btn,room){
  closePop();
  if(!room)room=activeRoom();
  const me=DB.user;
  const others=DB.data.users.filter(u=>u.id!==me.id);
  others.sort((a,b)=>{
    const fa=room.members.includes(a.id)?0:1,fb=room.members.includes(b.id)?0:1;
    return fa-fb;
  });
  const rect=btn.getBoundingClientRect();
  const pop=document.createElement('div');pop.className='pop';
  // 将菜单挂到 body，并按视口计算位置，避免被卡片/面板裁切或跑出屏幕。
  pop.style.position='fixed';
  pop.style.top='8px';pop.style.left='8px';
  pop.style.maxWidth=Math.max(100,window.innerWidth-16)+'px';
  pop.style.maxHeight=Math.max(100,Math.min(280,window.innerHeight-24))+'px';
  pop.innerHTML=others.map(u=>`<span class="pop-item" data-speak="${u.id}">
    <span class="av" style="width:26px;height:26px;font-size:11px">${avatarHtml32(u)}</span>
    <span class="pop-name">${esc(u.name)}</span>
    <span class="tag-mini">${room.members.includes(u.id)?'成员':'未加入'}</span></span>`).join('')
    ||'<div class="pop-item" style="cursor:default">暂无其他用户</div>';
  document.body.appendChild(pop);
  const w=pop.offsetWidth,h=pop.offsetHeight;
  let x=rect.right-w;
  x=Math.max(8,Math.min(x,window.innerWidth-w-8));
  let y=rect.bottom+6;
  if(y+h>window.innerHeight-8)y=rect.top-h-6;
  y=Math.max(8,Math.min(y,window.innerHeight-h-8));
  pop.style.left=x+'px';pop.style.top=y+'px';
  pop.addEventListener('click',e=>{
    const it=e.target.closest('[data-speak]');
    if(it){closePop();roomSpeak(room,it.dataset.speak);}
  });
  bindPopDismiss();
}
function closePop(){document.querySelectorAll('.pop').forEach(p=>p.remove());}
function bindPopDismiss(){setTimeout(()=>document.addEventListener('click',closePopOnce),0);}
function closePopOnce(e){
  if(e.target.closest('.pop')||e.target.closest('#rm-speak'))return;
  closePop();document.removeEventListener('click',closePopOnce);
}
/* 模拟语音录制 */
let recState=null,recTimer=null,recTouchY=0;
function startRec(btn){
  const recTarget=btn.dataset.recbtn;
  recState={target:recTarget,roomId:recTarget==='room'?activeRoom()?.id:null,userId:DB.user?.id,start:Date.now(),cancel:false};
  const ov=document.createElement('div');ov.className='rec-overlay';ov.id='rec-overlay';
  ov.innerHTML=`<div class="rec-box">
    <div class="rec-mic">🎙</div>
    <div class="rec-timer" id="rec-timer">0:00</div>
    <div class="rec-tip" id="rec-tip">松开发送，上滑取消</div></div>`;
  document.body.appendChild(ov);
  recTimer=setInterval(()=>{
    const s=Math.floor((Date.now()-recState.start)/1000);
    const el=$('#rec-timer');if(el)el.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
  },200);
}
function endRec(send){
  if(!recState)return;
  const len=Math.max(1,Math.round((Date.now()-recState.start)/1000));
  const target=recState.target,roomId=recState.roomId,userId=recState.userId;
  clearInterval(recTimer);recTimer=null;
  const ov=$('#rec-overlay');if(ov)ov.remove();
  recState=null;
  if(!send)return;
  const pr=modal(`<h3>语音转文字</h3><div class="m-body">
    <div class="ph-sub">语音时长 ${len}″。请补录此条语音的文字内容，便于聊天记录留档。</div>
    <textarea class="field" id="voice-text" style="min-height:100px" placeholder="请输入语音内容，Ctrl+Enter 发送"></textarea>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
      ${['嗯。','在的。','稍等。','好，我知道了。'].map(q=>`<button class="btn btn-sm btn-ghost" data-quick="${q}">${q}</button>`).join('')}
    </div></div>
    <div class="m-foot"><button class="btn btn-sm btn-ghost" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">发送语音</button></div>`);
  setTimeout(()=>{const ta=$('#voice-text');if(ta)ta.focus();},60);
  document.querySelectorAll('[data-quick]').forEach(b=>b.addEventListener('click',()=>{
    const ta=$('#voice-text');insertAt(ta,b.dataset.quick);
  }));
  pr.then(v=>{if(v==='yes'){
    if(!DB.user||DB.user.id!==userId){toast('账号状态已变化，语音未发送。','warn');return;}
    const text=($('#voice-text')?.value||'').trim();
    if(!text){toast('请填写语音转文字内容','warn');return;}
    if(target==='room'){
      const room=roomsOf().find(r=>r.id===roomId);
      if(!room){toast('原聊天室已不存在，语音未发送。','warn');return;}
      const msg={id:genId('m'),uid:DB.user.id,type:'voice',len,text,at:nowStr()};
      if(window._quote){msg.quote=window._quote;window._quote=null;}
      commitOutgoingMessage({kind:'room',roomId:room.id},msg);
    }else{
      const uid=target.split(':')[1];const ch=chatOf(uid);
      const msg={id:genId('m'),side:'me',type:'voice',len,text,at:nowStr()};
      if(window._quote){msg.quote=window._quote;window._quote=null;}
      commitOutgoingMessage({kind:'chat',key:uid,side:'them'},msg);
    }
  }});
}
document.addEventListener('mousedown',e=>{const b=e.target.closest('[data-recbtn]');if(b)startRec(b);});
document.addEventListener('mouseup',()=>{if(recState)endRec(true);});
document.addEventListener('touchstart',e=>{
  const b=e.target.closest('[data-recbtn]');
  if(b){recTouchY=e.touches[0].clientY;startRec(b);}
},{passive:true});
document.addEventListener('touchmove',e=>{
  if(recState&&e.touches[0]){
    const dy=recTouchY-e.touches[0].clientY;
    recState.cancel=dy>60;
    const tip=$('#rec-tip');if(tip)tip.textContent=dy>60?'松开手指，取消发送':'松开发送，上滑取消';
  }
},{passive:true});
document.addEventListener('touchend',()=>{if(recState)endRec(!recState.cancel);});

/* ==================================================================
   字卡模式 / 红包转账 / 抽签 / OA / 工作组 / 关系树
   ================================================================== */
const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
function userOfId(id){return DB.data.users.find(u=>u.id===id);}
function workgroupOf(){
  if(!DB.data.workgroup||typeof DB.data.workgroup!=='object')DB.data.workgroup={members:[],messages:[]};
  const wg=DB.data.workgroup;
  if(!Array.isArray(wg.members))wg.members=[];
  if(!Array.isArray(wg.messages))wg.messages=[];
  if(!wg.mode)wg.mode='create';
  if(!wg.speed)wg.speed='natural';
  if(typeof wg.proactive!=='boolean')wg.proactive=true;
  if(!wg.proactiveActivity)wg.proactiveActivity='normal';
  if(!Number.isFinite(Number(wg.proactiveInterval)))wg.proactiveInterval=120;
  if(!Number.isFinite(Number(wg.unread)))wg.unread=0;
  return wg;
}
/* 模式配置 */
function speedDelay(sp){
  if(sp==='instant')return 1000+Math.random()*7000;
  if(sp==='deep')return 30000+Math.random()*150000;
  return 5000+Math.random()*55000;
}
function modeCfg(box){
  if(!box.mode)box.mode='create';
  if(!box.speed)box.speed='natural';
  return box;
}
/* 通用弹层（返回 mask，便于复杂管理） */
function openMask(html){
  const mask=document.createElement('div');mask.className='modal-mask';
  mask.innerHTML=`<div class="modal">${html}</div>`;
  document.body.appendChild(mask);
  mask.addEventListener('click',e=>{if(e.target===mask)mask.remove();});
  return mask;
}
/* ---------- 字卡管理 ---------- */
const CARD_LIMIT=999;
function cardManager(personId){
  const u=userOfId(personId);
  if(!u){toast('用户不存在','err');return;}
  if(!Array.isArray(u.cards))u.cards=[];
  const norm=t=>(t||'').trim();
  const dupText=t=>u.cards.some(c=>!c.photo&&norm(c.text)===t);
  const listHtml=()=>u.cards.map((c,i)=>`<div class="card-item" data-card-index="${i}">
      ${c.photo?`<img src="${c.photo}" alt="图片字卡预览">`:(c.text&&[...c.text].length<=2?`<span class="ci-emoji">${esc(c.text)}</span>`:'')}
      <div class="ci-body"><p>${c.photo?`<span class="ci-type">图片</span> ${esc(c.text||'图片字卡')}`:esc(c.text||'（空白字卡）')}</p>
        <div class="ci-meta">${c.photo?'图片卡':`文字卡 · ${[...(c.text||'')].length} 字`}${c.combo&&c.combo.length?` · 组合 ${c.combo.length} 条`:''}</div>
        ${c.combo&&c.combo.length?`<div class="ci-combo">${esc(c.combo.map(x=>x.text||'[图]').join(' / ').slice(0,72))}</div>`:''}
      </div>
      ${!c.photo?`<button class="ci-edit" data-cedit="${i}" type="button">编辑</button>`:''}
      <button data-cdel="${i}" type="button">删除</button></div>`).join('')
      ||'<div class="empty">还没有字卡，在下方添加</div>';
  const mask=openMask(`<h3>字卡工作台 · ${esc(u.name)} <span class="card-count" style="font-size:12px;color:var(--pt-muted);font-weight:400">（${u.cards.length}/${CARD_LIMIT}）</span></h3><div class="m-body">
    <div class="card-manager-intro">支持文字、表情、图片和连续组合字卡；可搜索、编辑、批量导入并导出备份。</div>
    <input class="field card-search" id="card-search" type="search" placeholder="搜索字卡内容或组合内容……" aria-label="搜索字卡">
    <div class="card-list" id="card-list">${listHtml()}</div>
    <hr style="border-color:var(--pt-border);margin:14px 0">
    <label class="fl">① 添加文字字卡（文字、表情都算文字）</label>
    <textarea class="field" id="card-one" style="min-height:54px" placeholder="字卡内容（文字或表情）"></textarea>
    <label class="fl" style="margin-top:10px">组合回复（可选，一行一条，按顺序连发）</label>
    <textarea class="field" id="card-combo" style="min-height:46px" placeholder="一行一条组合消息"></textarea>
    <div style="display:flex;margin-top:10px"><button class="btn btn-sm" id="card-add" style="margin-left:auto">添加文字字卡</button></div>
    <hr style="border-color:var(--pt-border);margin:14px 0">
    <label class="fl">② 添加图片字卡（图片单独成卡）</label>
    <div style="display:flex;gap:8px;align-items:center">
      <label class="btn btn-sm btn-ghost">选择图片<input type="file" id="card-img" accept="image/*" class="hide"></label>
      <span id="card-img-name" style="font-size:12px;color:var(--pt-muted)"></span>
    </div>
    <hr style="border-color:var(--pt-border);margin:14px 0">
    <label class="fl">③ 批量添加文字字卡（一行一个，重复自动跳过）</label>
    <textarea class="field" id="card-batch" style="min-height:80px" placeholder="一行一个字卡"></textarea>
    <div style="display:flex;margin-top:10px"><button class="btn btn-sm" id="card-batch-add" style="margin-left:auto">批量添加</button></div>
    <hr style="border-color:var(--pt-border);margin:14px 0">
    <label class="fl">④ 导入 / 导出</label>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <label class="btn btn-sm btn-ghost">导入字卡<input type="file" id="card-import" accept=".txt,.json,text/plain,application/json" class="hide"></label>
      <button class="btn btn-sm btn-ghost" id="card-export-txt">导出文字卡(.txt)</button>
      <button class="btn btn-sm btn-ghost" id="card-export-json">导出全部(.json)</button>
    </div>
    <div style="display:flex;margin-top:14px"><button class="btn btn-sm" id="card-close" style="margin-left:auto">完成</button></div>
  </div>`);
  const list=mask.querySelector('#card-list');
  const applyCardSearch=()=>{const q=(mask.querySelector('#card-search').value||'').trim().toLocaleLowerCase();list.querySelectorAll('.card-item').forEach(row=>{row.hidden=!!q&&!row.textContent.toLocaleLowerCase().includes(q);});};
  const refresh=()=>{list.innerHTML=listHtml();
    const cap=mask.querySelector('.card-count');if(cap)cap.textContent=`（${u.cards.length}/${CARD_LIMIT}）`;
    applyCardSearch();};
  mask.querySelector('#card-search').addEventListener('input',applyCardSearch);
  const roomLeft=()=>CARD_LIMIT-u.cards.length;
  /* 图片字卡：选图后直接添加（图片单独成卡） */
  mask.querySelector('#card-img').addEventListener('change',e=>{
    const f=e.target.files[0];if(!f)return;
    if(roomLeft()<=0){toast('该用户字卡已达 999 上限','warn');e.target.value='';return;}
    compressImage(f,480,d=>{
      u.cards.push({id:genId('c'),text:'',photo:d,combo:[]});
      DB.save();refresh();toast('图片字卡已添加','ok');
      mask.querySelector('#card-img-name').textContent='';e.target.value='';
    });
    mask.querySelector('#card-img-name').textContent='已选图片，处理中…';
  });
  list.addEventListener('click',e=>{
    const edit=e.target.closest('[data-cedit]');
    if(edit){
      const index=parseInt(edit.dataset.cedit,10),card=u.cards[index];if(!card)return;
      const editMask=openMask(`<h3>编辑文字字卡</h3><div class="m-body"><label class="fl">字卡内容</label><textarea class="field" id="card-edit-text" maxlength="2000" rows="4" placeholder="输入文字或表情">${esc(card.text||'')}</textarea><label class="fl" style="margin-top:12px">连续组合（可选，每行一条）</label><textarea class="field" id="card-edit-combo" rows="4" placeholder="一行一条">${esc((card.combo||[]).map(x=>x.text||'').join('\n'))}</textarea><div class="card-edit-foot">修改后会保留当前字卡顺序。</div></div><div class="m-foot"><button class="btn btn-sm btn-ghost" id="card-edit-cancel" type="button">取消</button><button class="btn btn-sm" id="card-edit-save" type="button">保存修改</button></div>`);
      editMask.querySelector('#card-edit-cancel').addEventListener('click',()=>editMask.remove());
      editMask.querySelector('#card-edit-save').addEventListener('click',()=>{const text=editMask.querySelector('#card-edit-text').value.trim();if(!text){toast('字卡内容不能为空','warn');return;}const combo=editMask.querySelector('#card-edit-combo').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(text=>({text}));card.text=text;card.combo=combo;DB.save();editMask.remove();refresh();toast('字卡已更新','ok');});
      return;
    }
    const b=e.target.closest('[data-cdel]');if(!b)return;
    const index=parseInt(b.dataset.cdel,10);if(!Number.isFinite(index)||!u.cards[index])return;
    u.cards.splice(index,1);DB.save();refresh();toast('字卡已删除');
  });
  /* 添加文字字卡 */
  mask.querySelector('#card-add').addEventListener('click',()=>{
    const text=norm(mask.querySelector('#card-one').value);
    if(!text){toast('请填写字卡内容','warn');return;}
    if(roomLeft()<=0){toast('该用户字卡已达 999 上限','warn');return;}
    if(dupText(text)){toast('重复字卡，已跳过','warn');return;}
    const combo=mask.querySelector('#card-combo').value.split('\n').map(norm).filter(Boolean).map(x=>({text:x}));
    u.cards.push({id:genId('c'),text,combo});
    DB.save();refresh();toast('文字字卡已添加','ok');
    mask.querySelector('#card-one').value='';mask.querySelector('#card-combo').value='';
  });
  /* 批量文字字卡 */
  mask.querySelector('#card-batch-add').addEventListener('click',()=>{
    const lines=mask.querySelector('#card-batch').value.split('\n').map(norm).filter(Boolean);
    let add=0,skip=0;
    lines.forEach(t=>{
      if(roomLeft()<=0)return;
      if(dupText(t))skip++;
      else{u.cards.push({id:genId('c'),text:t,combo:[]});add++;}
    });
    DB.save();refresh();mask.querySelector('#card-batch').value='';
    toast(`添加 ${add} 张，跳过重复 ${skip} 张`,'ok');
  });
  /* 导入：支持 txt（一行一个）与 JSON（卡片数组或含 cards 的对象） */
  mask.querySelector('#card-import').addEventListener('change',e=>{
    const f=e.target.files[0];if(!f)return;
    const rd=new FileReader();
    rd.onload=()=>{
      let add=0,skip=0;const addCard=c=>{
        if(roomLeft()<=0)return;
        if(c.photo){u.cards.push({id:genId('c'),text:c.text||'',photo:c.photo,combo:Array.isArray(c.combo)?c.combo:[]});add++;}
        else{const t=norm(c.text);if(!t)return;if(dupText(t))skip++;else{u.cards.push({id:genId('c'),text:t,combo:Array.isArray(c.combo)?c.combo:[]});add++;}}
      };
      const txt=rd.result;
      if(f.name.toLowerCase().endsWith('.json')){
        try{
          let data=JSON.parse(txt);
          if(data&&!Array.isArray(data)&&Array.isArray(data.cards))data=data.cards;
          if(Array.isArray(data))data.forEach(addCard);
          else toast('JSON 格式无法识别','warn');
        }catch(err){toast('JSON 解析失败','err');}
      }else{
        txt.split(/\r?\n/).map(norm).filter(Boolean).forEach(t=>{
          if(roomLeft()<=0)return;
          if(dupText(t))skip++;else{u.cards.push({id:genId('c'),text:t,combo:[]});add++;}
        });
      }
      DB.save();refresh();toast(`导入 ${add} 张，跳过重复 ${skip} 张`,'ok');e.target.value='';
    };
    rd.readAsText(f);
  });
  /* 导出文字卡 txt */
  mask.querySelector('#card-export-txt').addEventListener('click',()=>{
    const blob=new Blob([u.cards.filter(c=>!c.photo).map(c=>c.text).filter(Boolean).join('\n')],{type:'text/plain'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='zika-'+u.name+'.txt';a.click();
    URL.revokeObjectURL(a.href);toast('文字卡已导出','ok');
  });
  /* 导出全部 JSON（含图片） */
  mask.querySelector('#card-export-json').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(u.cards)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='zika-'+u.name+'.json';a.click();
    URL.revokeObjectURL(a.href);toast('全部字卡已导出','ok');
  });
  mask.querySelector('#card-close').addEventListener('click',()=>mask.remove());
}
/* ---------- 发字卡 / 自动回复 ---------- */
function targetBox(target){
  if(target.kind==='chat')return chatOf(target.key);
  if(target.kind==='room')return roomById(target.roomId);
  return workgroupOf();
}
function targetArr(target){return targetBox(target).messages;}
function emitCard(target,part){
  const arr=targetArr(target);
  const m={id:genId('m'),at:nowStr()};
  if(target.kind==='chat')m.side=target.side;else m.uid=(part.uid||target.uid);
  if(part.photo){m.type='photo';m.photo=part.photo;m.text=part.text||'';}
  else{m.type='text';m.text=part.text||'';}
  if(target.kind==='chat'?m.side!=='me':m.uid!==DB.user.id)markIncomingMessage(target,m);else {/* 逐条已读状态已取消 */}
  arr.push(m);
  DB.save();refreshIfActive(target);
}
function emitCardWithCombo(target,card){
  const t2={...target,uid:card.uid||target.uid};
  emitCard(t2,card);
  (card.combo||[]).forEach((c,i)=>setTimeout(()=>emitCard({...t2,uid:c.uid||card.uid||target.uid},c),600*(i+1)));
}
/* 字卡 burst：每次回复随机 1-5 条（含组合），顺序整洁 */
function weightedReplyCount(){
  // 1、2 条最常见；消息越多，概率越低。
  const r=Math.random();
  if(r<0.46)return 1;
  if(r<0.76)return 2;
  if(r<0.91)return 3;
  if(r<0.98)return 4;
  return 5;
}
function emitCardBurst(target,people,onDone){
  const eligible=(Array.isArray(people)?people:[people]).filter(p=>p&&Array.isArray(p.cards)&&p.cards.length);
  if(!eligible.length){if(onDone)onDone();return 0;}
  const count=weightedReplyCount(),queue=[],generation=_replyGeneration,sessionUser=DB.user?.id;
  for(let i=0;i<count;i++){
    const person=pick(eligible),card=pick(person.cards);
    const parts=[card,...(Array.isArray(card.combo)?card.combo:[])].filter(part=>part&&(part.text||part.photo));
    const part=parts.length?pick(parts):card;
    queue.push({person,part});
  }
  queue.forEach((entry,i)=>setTimeout(()=>{
    if(generation!==_replyGeneration||!DB.user||DB.user.id!==sessionUser)return;
    const t2=target.kind==='chat'?{...target,side:target.side||'them'}:{...target,uid:entry.person.id};
    emitCard(t2,entry.part);
    if(i===queue.length-1&&onDone)onDone();
  },420*i));
  return queue.length?420*(queue.length-1):0;
}
function renderConversationMessages(target){
  const kind=target.kind;
  let key='',box=null,arr=[];
  if(kind==='chat'){
    key=target.key;box=chatOf(key);arr=Array.isArray(box.messages)?box.messages:[];
  }else if(kind==='room'){
    key=target.roomId;box=roomsOf().find(r=>r.id===key);arr=box&&Array.isArray(box.messages)?box.messages:[];
  }else if(kind==='workgroup'){
    box=workgroupOf();arr=Array.isArray(box.messages)?box.messages:[];
  }else return '';
  if(!arr.length)return kind==='chat'
    ?'<div class="empty">还没有消息。先发一条，再点 TA 的头像让 TA 回复吧。</div>'
    :kind==='room'
      ?'<div class="empty">聊天室还没有消息。点“TA 发言”让成员说话，或在下方打字。</div>'
      :'<div class="empty">工作组还没有消息。</div>';
  const me=DB.user;
  const other=kind==='chat'?DB.data.users.find(u=>u.id===key):null;
  return arr.map((m,mi)=>{
    const timeNode=chatTimestampHtml(m,kind,key,arr[mi-1]);
    if(kind==='chat'){
      const mine=m.side==='me';
      if(m.recalled)return `${timeNode}<div class="msg recalled"><span class="recall-txt">${mine?'你':esc((other||{name:'对方'}).name)}撤回了一条消息</span></div>`;
      const av=mine?`<span class="m-av">${avatarHtml32(me)}</span>`:`<span class="m-av" data-them-av="1" title="点 TA 头像，TA 回复一条">${avatarHtml32(other||{name:'对方'})}</span>`;
      const money=messageIsMoney(m);
      const content=money?`<span class="msg-attachment" data-msgctx="${ctxData('chat',key,m.id)}">${bubbleContent(m)}</span>`:`<span class="bubble ${m.photo?'has-photo':''}" data-msgctx="${ctxData('chat',key,m.id)}">${bubbleContent(m)}</span>`;
      return `${timeNode}<div class="msg ${mine?'me':'them'} ${money?'money-msg':''}">${av}<span class="msg-content-stack">${content}${messageReceiptHtml(m,mine)}</span></div>${money?moneyNoticeHtml(m,'chat',key):''}`;
    }
    const u=DB.data.users.find(x=>x.id===m.uid)||{name:'未知',avatar:''};
    const mine=m.uid===me.id;
    if(m.recalled)return `${timeNode}<div class="msg recalled"><span class="recall-txt">${esc(u.name)} 撤回了一条消息</span></div>`;
    const ctxKind=kind==='room'?'room':'workgroup';
    const avAttr=mine?'':kind==='room'?`data-room-av="${m.uid}" title="点 TA 头像，TA 发言一条"`:`data-wg-av="${m.uid}"`;
    const money=messageIsMoney(m);
    const content=money?`<span class="msg-attachment" data-msgctx="${ctxData(ctxKind,key,m.id)}">${bubbleContent(m)}</span>`:`<span class="bubble ${m.photo?'has-photo':''}" data-msgctx="${ctxData(ctxKind,key,m.id)}">${bubbleContent(m)}</span>`;
    return `${timeNode}<div class="msg ${mine?'me':'them'} ${money?'money-msg':''}"><span class="m-av" ${avAttr}>${avatarHtml32(u)}</span><span class="msg-content-stack">${mine?'':`<span class="m-name">${esc(u.name)}</span>`}${content}${messageReceiptHtml(m,mine)}</span></div>${money?moneyNoticeHtml(m,ctxKind,key):''}`;
  }).join('');
}
function refreshConversationDom(target){
  const sc=$('#ch-scroll');
  if(!sc)return false;
  const wasNearBottom=sc.scrollHeight-sc.scrollTop-sc.clientHeight<90;
  const oldTop=sc.scrollTop;
  sc.innerHTML=renderConversationMessages(target);
  if(wasNearBottom)sc.scrollTop=sc.scrollHeight;
  else sc.scrollTop=oldTop;
  const hash=location.hash||'#/';
  const old=routeViewPositions[hash]||{y:window.scrollY||0};
  old.chatTop=sc.scrollTop;routeViewPositions[hash]=old;
  persistViewPositions();
  return true;
}
function refreshIfActive(target){
  const{seg}=parseHash();
  if(target.kind==='chat'&&seg[0]==='chat'&&seg[1]===target.key){
    if(!refreshConversationDom(target)){router();scrollRoom();}
    syncUnreadBadges();return;
  }
  if(target.kind==='chat'&&seg[0]==='messages'){router();return;}
  if(target.kind==='room'&&seg[0]==='room'){
    const targetRoom=roomsOf().find(r=>r.id===target.roomId);
    const currentRoom=activeRoom();
    if(targetRoom&&currentRoom&&targetRoom.id===currentRoom.id){
      if(!refreshConversationDom(target)){router();scrollRoom();}
    }else syncUnreadBadges();
    return;
  }
  if(target.kind==='workgroup'&&seg[0]==='workgroup'){
    if(!refreshConversationDom(target)){router();scrollRoom();}
    syncUnreadBadges();return;
  }
  syncUnreadBadges();
}
function replyPeople(target,box){
  if(target.kind==='chat')return [userOfId(target.key)].filter(Boolean);
  const members=(box.members||[]).filter(id=>id!==DB.user.id).map(userOfId).filter(Boolean);
  return members;
}
let _replyGeneration=0;
function finishAutoReply(target,box,generation=_replyGeneration){
  if(generation!==_replyGeneration||!DB.user||targetBox(target)!==box)return;
  box.replyPending=false;
  if(box.queuedReply){
    box.queuedReply=false;box.proactiveWaiting=false;box.replyPending=true;DB.save();
    setTimeout(()=>{if(generation!==_replyGeneration||!DB.user||targetBox(target)!==box)return;box.replyPending=false;autoReply(target);},180);
  }else{
    // 一轮结束后不锁死等待用户回复；给对话留出自然的空档，再由全局调度器判断是否继续。
    box.proactiveWaiting=false;
    box.proactiveNextAt=0;box.proactiveLastTickAt=Date.now();
    DB.save();
  }
}
function autoReply(target){
  const box=targetBox(target),cfg=modeCfg(box);
  if(!DB.user||cfg.mode!=='card')return;
  if(box.replyPending){box.queuedReply=true;box.proactiveWaiting=false;DB.save();return;}
  const generation=_replyGeneration,sessionUser=DB.user.id;
  box.replyPending=true;box.proactiveWaiting=false;DB.save();
  setTimeout(()=>{
    if(generation!==_replyGeneration||!DB.user||DB.user.id!==sessionUser||targetBox(target)!==box||modeCfg(box).mode!=='card'){
      if(targetBox(target)===box){box.replyPending=false;box.queuedReply=false;DB.save();}
      return;
    }
    const people=replyPeople(target,box);
    // 启用“已读不回”时，有 20% 概率不触发回复；界面不显示逐条已读状态。
    if(box.readNoReply&&Math.random()<0.20){finishAutoReply(target,box,generation);refreshIfActive(target);return;}
    // 对面偶尔会发来红包或转账；群聊随机由一位成员发出。
    if(people.length&&Math.random()<0.22){
      const sender=pick(people),t2=target.kind==='chat'?{...target,side:'them'}:{...target,uid:sender.id};
      emitMoney(t2,Math.random()<0.5?'redpacket':'transfer',randMoney(),Math.random()<0.5?'收下，别客气。':'一点心意。');
      finishAutoReply(target,box,generation);return;
    }
    const withCards=people.filter(p=>Array.isArray(p.cards)&&p.cards.length);
    if(!withCards.length){finishAutoReply(target,box,generation);return;}
    emitCardBurst(target.kind==='chat'?{...target,side:'them'}:target,withCards,()=>finishAutoReply(target,box,generation));
  },speedDelay(cfg.speed));
}
function resetProactiveWaitForLogin(){
  _replyGeneration++;
  const reset=box=>{if(!box||typeof box!=='object')return;if(box.proactive!==false){box.proactiveWaiting=false;box.replyPending=false;box.queuedReply=false;box.proactiveLastTickAt=Date.now();}};
  Object.values(DB.data.chats||{}).forEach(reset);(DB.data.rooms||[]).forEach(reset);reset(DB.data.workgroup);DB.save();
}
function maybeProactive(target){const box=targetBox(target);if(box&&!box.proactiveLastTickAt)box.proactiveLastTickAt=Date.now();if(box)DB.save();}
function proactiveTargets(){
 const targets=[];
 Object.entries(DB.data.chats||{}).forEach(([key,box])=>{if(box&&box.proactive!==false)targets.push({kind:'chat',key,side:'them'});});
 (DB.data.rooms||[]).forEach(room=>{if(room&&room.proactive!==false)targets.push({kind:'room',roomId:room.id});});
 const wg=workgroupOf();if(DB.user&&DB.user.level>=2&&wg&&wg.proactive!==false)targets.push({kind:'workgroup'});
 return targets;
}
function isInternalPage(){
  if(!DB.user)return false;
  const {seg}=parseHash();
  return ['forum','room','workgroup','oa','divination','post','ask','wanted','archives','archive','network','events','event','library','codex','dashboard','staff-card','space','decorate','messages','chat','friends','settings'].includes(seg[0]);
}
function proactiveMessageTime(m){
  if(!m||!m.at)return 0;
  const n=new Date(String(m.at).replace(' ','T')).getTime();
  return Number.isFinite(n)?n:0;
}
function proactiveLastWasIncoming(target,last){
  if(!last)return false;
  return target.kind==='chat'?last.side!=='me':last.uid!==DB.user?.id;
}
function activityProbability(box,gap){
 const activity=box.proactiveActivity||'normal';
 const base={active:.20,normal:.08,quiet:.025,custom:.08}[activity]||.08;
 if(activity==='custom'&&Number(box.proactiveInterval)>0)return 1-Math.exp(-15000/(Math.max(30,Math.min(3600,Number(box.proactiveInterval)))*1000));
 if(gap>10*60*1000)return Math.min(.6,base*2.5);
 if(gap>3*60*1000)return Math.min(.4,base*1.6);
 return base;
}
function sendProactiveRound(target,box,people){
 if(!DB.user||!box||box.proactive===false||box.mode!=='card'||box.replyPending)return;
 people=people||replyPeople(target,box).filter(p=>Array.isArray(p.cards)&&p.cards.length);if(!people.length)return;
 const generation=_replyGeneration;box.replyPending=true;DB.save();
 const sender=pick(people),t2=target.kind==='chat'?{...target,side:'them'}:{...target,uid:sender.id};
 if(Math.random()<.08){emitMoney(t2,Math.random()<.5?'redpacket':'transfer',randMoney(),'一点心意。');finishAutoReply(target,box,generation);}
 else emitCardBurst(target.kind==='chat'?{...target,side:'them'}:target,people,()=>finishAutoReply(target,box,generation));
}
function runProactiveScheduler(){
 if(!DB.user||!isInternalPage())return;
 // 后台仍继续调度；浏览器可能节流定时器，因此采用短 tick + 有上限的补算，避免恢复前台后集中刷屏。
 const isHidden=document.visibilityState==='hidden';
 const now=Date.now();
 for(const target of proactiveTargets()){
  const box=targetBox(target);
  if(!box||box.proactive===false||box.mode!=='card'||box.replyPending)continue;
  const people=replyPeople(target,box).filter(p=>Array.isArray(p?.cards)&&p.cards.length);if(!people.length)continue;
  const last=Number(box.proactiveLastTickAt)||now;const gap=now-last;const tickMs=15000;
  if(gap<tickMs)continue;
  const missed=Math.min(40,Math.floor(gap/tickMs));box.proactiveLastTickAt=now;
  const p=activityProbability(box,gap,missed);let fired=false;
  // 隐藏页保留正常触发概率；只对积压窗口封顶，不因切到后台而直接停发。
  for(let i=0;i<missed;i++){if(Math.random()<p){fired=true;break;}}
  if(!fired)continue;
  if(DB.data.proactiveGlobalNextAt&&now<DB.data.proactiveGlobalNextAt)continue;
  DB.data.proactiveGlobalNextAt=now+20000+Math.random()*40000;
  sendProactiveRound(target,box,people);break;
 }
 DB.save();
}
function maybeLoginProactive(){
  if(!DB.user||!isInternalPage())return;
  // 只初始化所有可用会话的随机触发时间；后续由常驻调度器持续检查。
  proactiveTargets().forEach(target=>{const box=targetBox(target);if(box&&box.proactiveNextAt==null)box.proactiveNextAt=Date.now()+45000+Math.random()*120000;});
  DB.save();
}
/* ---------- 红包 / 转账（模拟） ---------- */
function randMoney(){
  const r=Math.random();
  if(r<0.88)return Math.floor(Math.random()*49501)+500; // 88%：500—50000
  if(r<0.96)return Math.floor(Math.random()*400)+100;  // 8%：100—499
  return Math.floor(Math.random()*150000)+50001;       // 4%：50001—200000
}
const fmtMoney=n=>n.toLocaleString('zh-CN');
function moneyDialog(target,type){
  const mask=openMask(`<h3>${type==='redpacket'?'发红包':'转账'}</h3><div class="m-body">
    <label class="fl">金额（元）</label>
    <input class="field" id="m-amount" type="number" min="0.01" value="${type==='redpacket'?'88':'1000'}">
    <label class="fl" style="margin-top:10px">${type==='redpacket'?'祝福语':'备注'}</label>
    <input class="field" id="m-note" value="${type==='redpacket'?'恭喜发财，大吉大利':''}">
    
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-sm btn-ghost" id="m-cancel" style="margin-left:auto">取消</button>
      <button class="btn btn-sm" id="m-ok">发送</button></div>
  </div>`);
  mask.querySelector('#m-cancel').addEventListener('click',()=>mask.remove());
  mask.querySelector('#m-ok').addEventListener('click',()=>{
    const amt=Math.floor(parseFloat(mask.querySelector('#m-amount').value)*100)/100;
    if(!(amt>0)||amt>100000000){toast('请输入 0~1 亿之间的金额','warn');return;}
    const note=mask.querySelector('#m-note').value.trim();
    const t2=target.kind==='chat'?{...target,side:'me'}:{...target,uid:DB.user.id};
    emitMoney(t2,type,amt,note);mask.remove();
  });
}
function emitMoney(target,type,amount,note){
  const arr=targetArr(target);
  const m={id:genId('m'),at:nowStr(),type,amount,note,opened:false};
  if(target.kind==='chat')m.side=target.side;else m.uid=target.uid;
  const sentByMe=target.kind==='chat'?m.side==='me':m.uid===DB.user.id;
  if(!sentByMe)markIncomingMessage(target,m);
  arr.push(m);DB.save();refreshIfActive(target);
  if(sentByMe)scheduleCounterpartyMoneyAction(target,m);
}
function scheduleCounterpartyMoneyAction(target,message){
  // 本网站是单人角色扮演环境：对方的收取动作以延迟状态更新体现，不需要切换成对方账号。
  const box=targetBox(target);
  const potential=replyPeople(target,box);
  const recipient=potential.length?pick(potential):(target.kind==='chat'?userOfId(target.key):null);
  if(recipient)message.receivedBy=recipient.id;
  setTimeout(()=>{
    const current=(box.messages||[]).find(m=>m.id===message.id);
    if(!current||current.returned||current.opened||current.received)return;
    if(current.type==='redpacket'){
      // 大多数情况下对方很快领取；少数情况下稍后再打开，避免红包永远卡在待领取。
      if(Math.random()<0.92){current.opened=true;current.openedAt=nowStr();}
      else setTimeout(()=>{
        const late=(box.messages||[]).find(m=>m.id===message.id);
        if(!late||late.opened)return;
        late.opened=true;late.openedAt=nowStr();DB.save();refreshIfActive(target);
      },3500+Math.random()*3500);
    }else if(current.type==='transfer'){
      const r=Math.random();
      if(r<0.86){current.received=true;current.receivedAt=nowStr();current.returned=false;}
      else if(r<0.96){current.returned=true;current.returnedAt=nowStr();current.received=false;}
      else setTimeout(()=>{
        const late=(box.messages||[]).find(m=>m.id===message.id);
        if(!late||late.received||late.returned)return;
        late.received=true;late.receivedAt=nowStr();late.returned=false;DB.save();refreshIfActive(target);
      },3500+Math.random()*3500);
    }
    DB.save();refreshIfActive(target);
  },1800+Math.random()*4200);
}
function moneyBubbleHtml(m){
  if(m.type==='redpacket'){
    return `<span class="money-bubble">
      <button type="button" class="redpack-bub ${m.opened?'is-opened':''}" data-rpopen="${esc(m.id)}" aria-label="打开红包">
        <span class="rp-ic">${m.opened?'✓':'福'}</span>
        <span class="rp-txt"><b>${esc(m.note||'恭喜发财，大吉大利')}</b><small>${m.opened?'已领取':'哪都通红包'}</small></span>
        <span class="rp-chevron">${m.opened?'已开':'›'}</span>
      </button>
    </span>`;
  }
  const received=!!m.received&&!m.returned;
  const returned=!!m.returned;
  return `<span class="money-bubble">
    <button type="button" class="transfer-bub ${received?'is-received':''} ${returned?'is-returned':''}" data-tfopen="${esc(m.id)}" aria-label="查看转账">
      <span class="tf-ic">${returned?'↩':(received?'✓':'¥')}</span>
      <span class="tf-txt"><b>¥${fmtMoney(m.amount)}</b><small>${returned?'已退还':(received?'已收款':esc(m.note||'转账'))}</small></span>
      <span class="tf-chevron">${returned?'已退':(received?'已收':'›')}</span>
    </button>
  </span>`;
}
function moneyDetailDialog(m, kind){
  const isRed=kind==='redpacket';
  const fromMe=Object.prototype.hasOwnProperty.call(m,'side')?m.side==='me':m.uid===DB.user.id;
  const mask=document.createElement('div');
  mask.className='money-detail-mask';
  const already=isRed?!!m.opened:(!!m.received||!!m.returned);
  const returned=!isRed&&!!m.returned;
  const title=isRed?(already?'红包已领取':'恭喜发财，大吉大利'):(returned?'转账已退还':(already?'转账已收款':(fromMe?'转账已发出':'收到一笔转账')));
  const status=returned?'该笔转账已退回':(already?(isRed?'红包已收下':'已确认收款'):(isRed?(fromMe?'等待对方领取':'恭喜发财，好运常在'):(fromMe?'等待对方收款':'待收款')));
  const actionHtml=!already&&!fromMe
    ?`<button type="button" class="money-detail-action" id="money-confirm">${isRed?'开':'确认收款'}</button>`
    :(!isRed&&!returned&&already&&!fromMe
      ?'<button type="button" class="money-detail-action" id="money-return" style="margin-top:12px;padding:10px 24px;background:#F3F4F6;color:#4B5563">退还转账</button>'
      :(already?'<div class="money-detail-done">✓ 已完成</div>':`<div class="money-detail-done">${fromMe?'等待对方处理':'处理中'}</div>`));
  mask.innerHTML=`<div class="money-detail ${isRed?'money-detail-red':'money-detail-transfer'}">
    <button type="button" class="money-detail-close" aria-label="关闭">×</button>
    <div class="money-detail-brand">${isRed?'哪都通红包':'哪都通转账'}</div>
    <div class="money-detail-icon">${isRed?(already?'✓':'福'):(returned?'↩':(already?'✓':'¥'))}</div>
    <div class="money-detail-title">${title}</div>
    <div class="money-detail-note">${esc(m.note||(isRed?'哪都通专属红包':'转账'))}</div>
    <div class="money-detail-amount">¥${fmtMoney(m.amount)}</div>
    <div class="money-detail-status">${status}</div>
    ${actionHtml}
    <div class="money-detail-foot">哪都通 · 内部通讯</div>
  </div>`;
  document.body.appendChild(mask);
  const close=()=>mask.remove();
  mask.querySelector('.money-detail-close').addEventListener('click',close);
  mask.addEventListener('click',e=>{if(e.target===mask)close();});
  const confirm=mask.querySelector('#money-confirm');
  if(confirm)confirm.addEventListener('click',()=>{
    if(isRed){m.opened=true;m.openedAt=nowStr();}
    else {m.received=true;m.receivedAt=nowStr();m.returned=false;}
    DB.save();close();router();
  });
  const returnBtn=mask.querySelector('#money-return');
  if(returnBtn)returnBtn.addEventListener('click',()=>{
    m.returned=true;m.returnedAt=nowStr();m.received=false;
    DB.save();close();router();
  });
}
/* ---------- 抽签问吉 ---------- */
const FORTUNE_GRADES=[
  {g:'大吉',c:'#E8533B'},{g:'中吉',c:'#E8874A'},{g:'小吉',c:'#D8B15E'},
  {g:'平',c:'#8EA0DC'},{g:'小凶',c:'#7A86B8'},{g:'凶',c:'#9AA6D6'}
];
const FORTUNES=[
  {g:'大吉',poem:'云开见月正当空，行路何须问远踪。\n一点灵光随炁转，万般如意自从容。',mean:'诸事顺遂，谋望可成。今日宜主动出击、宜会友、宜立誓；炁运昌隆，所行皆有回响。'},
  {g:'中吉',poem:'东风轻叩小窗纱，渐有佳音到水涯。\n守得云开终见日，慢些火候也开花。',mean:'运势向好，需稍待时日。今日宜稳扎稳打，旧事将有转机，贵人在侧。'},
  {g:'小吉',poem:'山涧细流归大海，林间新笋破青苔。\n虽无惊浪拍天起，一步一安也快哉。',mean:'小有所得，平安是福。今日宜独处、宜练功、宜整理旧事，不宜冒进。'},
  {g:'平',poem:'行到水穷云起处，坐看云卷又云舒。\n无喜无悲心自定，平平淡淡是真如。',mean:'运势平稳，无大起落。今日守成为上，勿争口舌，静心自处即安。'},
  {g:'小凶',poem:'风急林深鸟不鸣，歧路多端莫轻行。\n且把锋芒收一半，待时再作化龙声。',mean:'小有阻滞，宜守不宜攻。今日少言少动，避开争执与险地，过午自解。'},
  {g:'凶',poem:'黑云压顶雨将来，急水行舟易失桅。\n谨守本心毋妄动，炁沉丹田待春回。',mean:'运势欠佳，凡事谨慎。今日不签约、不独行、不涉险；心存正念，自可化煞。'},
  {g:'大吉',poem:'紫气东来照远山，故人携喜叩门环。\n心中所愿终有应，一路清风送我还。',mean:'适合推进搁置已久的计划，也适合主动联络重要的人。机遇已近，记得把握分寸。'},
  {g:'中吉',poem:'细雨初收石径新，半窗花影半窗春。\n莫嫌眼下行程缓，前路自有识途人。',mean:'事情正在逐渐明朗。适合收集信息、请教前辈，先打好基础再行动。'},
  {g:'小吉',poem:'一枝新绿出墙来，几缕清风入砚台。\n寻常日子藏惊喜，回首方知福自来。',mean:'今日容易在小事中收获好心情。留意身边人的善意，不必事事追求结果。'},
  {g:'平',poem:'长街灯火各成行，檐下微风过旧墙。\n不求一步登云去，且将心事慢慢量。',mean:'适合整理思绪、按计划完成日常事务。暂时没有答案的事，可以再观察一阵。'},
  {g:'小凶',poem:'雾锁前山路未明，莫因心急乱行程。\n暂收快马听风向，云散自然见月生。',mean:'容易因信息不全而判断失误。重要决定先缓一缓，确认细节后再行动。'},
  {g:'大吉',poem:'千峰过后见平川，旧约重提喜讯传。\n若问此行何处好，心安之地即桃源。',mean:'适合和解、合作、重启旧计划。与人沟通时坦诚一些，容易得到积极回应。'},
  {g:'中吉',poem:'青竹经霜色未凋，云边雁字渐迢迢。\n此时不妨多蓄力，待到春深自过桥。',mean:'当前更适合积累而不是急于证明自己。持续投入会带来回报，别被短期起伏影响。'},
  {g:'小吉',poem:'窗前一盏小灯明，案上新茶香气清。\n偶得闲时宜自省，心宽万事便轻盈。',mean:'适合休息、学习和整理生活。把注意力放回自己，状态会慢慢回升。'},
  {g:'平',poem:'潮来潮去不留痕，花落花开自有因。\n今日但求无挂碍，寻常也可度良辰。',mean:'保持平常心即可。不要因为别人进度更快就打乱自己的节奏。'},
  {g:'小凶',poem:'急雨敲窗夜未央，言多容易惹心伤。\n且把锋芒藏袖底，明朝再议短和长。',mean:'今天要留意语气和沟通方式，尤其避免在情绪上头时争论或承诺。'},
  {g:'中吉',poem:'远客来时带信笺，旧疑今日可开篇。\n若能耐住三分性，柳暗花明在眼前。',mean:'有机会获得新消息或解决旧疑问。把问题说清楚，别急着下结论。'},
  {g:'大吉',poem:'云帆高挂趁东风，千里关山一望通。\n胸有丘壑行有度，此番所向不虚空。',mean:'适合开始有准备的新行动。把目标拆成几步，稳稳推进，成功机会更高。'},
  {g:'小吉',poem:'庭前小草已抽芽，檐角新晴落晚霞。\n莫问收成何日到，认真耕种自开花。',mean:'付出正在积累，暂时看不见成果也不必灰心。把眼前能做好的事做好。'},
  {g:'平',poem:'山色湖光两不争，行人自有去来程。\n若将得失都放下，一身清气伴长明。',mean:'适合平稳推进手头任务。少比较、少内耗，按自己的节奏做事即可。'},
  {g:'小凶',poem:'孤灯照壁影参差，未辨真章莫妄疑。\n留得三分回旋地，免教小事变成痴。',mean:'不要只凭片面消息猜测他人想法。先核实事实，重要事情保留余地。'},
  {g:'中吉',poem:'石上清泉绕竹流，旧时烦恼渐回头。\n一番细理千丝绪，自有轻舟过渡头。',mean:'适合处理积压事务，逐项解决比一次解决所有问题更有效。'},
  {g:'大吉',poem:'星河入梦照归途，久候佳音今日呼。\n但把初心牢牢记，乘风自可上云衢。',mean:'努力可能得到认可，也适合表达真实想法。机会来临时大胆一点，但仍要做好准备。'},
  {g:'小吉',poem:'陌上花开燕子回，闲云舒卷映春台。\n有人轻轻添暖意，莫将真心锁起来。',mean:'人际关系有转暖的迹象。主动表达感谢或关心，会让关系更自然。'},
  {g:'平',poem:'一页书翻一盏茶，日升日落是生涯。\n不妨暂把纷繁放，听雨听风听落花。',mean:'今日宜减少不必要的消耗，给自己留出休息空间，先照顾好状态。'},
  {g:'小凶',poem:'岔路横生莫逞强，暗潮未退水犹凉。\n先寻旧地图重看，稳住船头再启航。',mean:'计划可能临时变化。准备备用方案，遇到阻碍时先稳住局面。'},
  {g:'中吉',poem:'故纸翻开见旧章，迷云散处有微光。\n若能回看初来路，便知下一步何方。',mean:'复盘过去的经验会带来帮助。适合修正方法、补齐短板，而不是全盘推倒重来。'},
  {g:'大吉',poem:'春雷一响百花醒，长夜将阑晓色清。\n心定自能担大任，乘时万里踏新程。',mean:'适合承担责任、提出方案或迈出关键一步。相信准备过的自己，也要记得听取建议。'},
  {g:'小吉',poem:'清风有意过庭除，喜事无声入草庐。\n一言一笑皆珍贵，寻常相伴胜珍珠。',mean:'值得珍惜日常里的小确幸。和熟悉的人好好相处，简单的陪伴就是好运。'},
  {g:'平',poem:'不争高下不争先，且把平常日子安。\n心头若有清明在，何惧浮云遮远山。',mean:'不必急着与人争胜。按规则办事、保持清醒，今天就能平稳度过。'},
  {g:'小凶',poem:'风过松林声渐急，临门一步更须思。\n莫因一时求速决，回头细看少疏失。',mean:'越接近完成越要检查细节。签字、提交、转账等操作务必再核对一次。'},
  {g:'中吉',poem:'新枝渐长旧痕消，远处钟声过小桥。\n不必时时催结果，水到渠成自有招。',mean:'进展可能比预期慢，但方向并没有错。继续保持稳定投入，给事情一些时间。'},
  {g:'大吉',poem:'明珠久藏匣中光，今日开匣照四方。\n胸中自有千般策，落笔成章事事昌。',mean:'适合展示能力、提交作品或争取机会。把成果清楚地表达出来，别低估自己的价值。'},
  {g:'小吉',poem:'一轮明月过东墙，半卷闲书半榻凉。\n烦恼随风轻轻散，醒来仍是好时光。',mean:'适合放松和恢复精力。先让自己休息好，很多困扰会变得没那么难处理。'},
  {g:'凶',poem:'夜路迢迢雨未停，前方虚实尚难明。\n收灯暂避风波急，待得天清再启程。',mean:'遇事以安全和稳妥为先。暂缓冒险、冲动消费或仓促承诺，等信息更充分再决定。'}
];
FORTUNES.push(
 {g:'大吉',poem:'长风送我过千山，云外晴光入眼宽。\n此去不须频问路，心中有定自平安。',mean:'适合推进重要事项，先明确目标，再按步骤行动。遇到帮助时记得回应善意。'},
 {g:'中吉',poem:'庭前新雨洗尘沙，竹影摇风映碧纱。\n旧事不妨从此理，清明自会到人家。',mean:'适合整理积压问题、补齐资料。循序处理比急着求结果更有效。'},
 {g:'小吉',poem:'一声鸟语破晨烟，几缕清风到案前。\n寻常细处藏佳意，放慢脚步即安然。',mean:'小事容易带来好心情。把注意力放在当下，别忽略身边值得珍惜的人。'},
 {g:'平',poem:'潮平岸阔舟徐行，日暖云轻水自明。\n今日无须争早晚，守常亦是好心情。',mean:'适合照常推进计划。没有必要为了追赶别人而临时改变节奏。'},
 {g:'小凶',poem:'纸上新痕墨未干，匆忙落笔易生难。\n停灯再把前文看，一处周全胜百般。',mean:'注意合同、消息和数字细节。重要内容先复核，避免因疏忽返工。'},
 {g:'中吉',poem:'隔岸钟声入晚晴，旧时疑处渐分明。\n若将心事从容说，自有知音听此声。',mean:'适合沟通、澄清误会、寻求建议。表达具体需求，比让别人猜测更容易得到回应。'},
 {g:'大吉',poem:'春到山河草木新，千门灯火照归人。\n但将善意常存念，所遇多添一段春。',mean:'适合合作、拜访和开启新计划。保持坦诚，好的机会更容易持续。'},
 {g:'小吉',poem:'书页翻开见旧知，窗前花影落清池。\n今日若能多学一寸，明朝便少一分迟。',mean:'学习和复盘会有收获。适合读资料、练技能或把经验整理成可复用的方法。'},
 {g:'凶',poem:'山口风高雾未开，前途未辨莫轻猜。\n暂收脚步观来势，天色清时再剪裁。',mean:'信息不足时不要仓促决策。优先保障安全，重要选择等情况更清楚再定。'},
 {g:'中吉',poem:'小径回环不算遥，青松深处有溪桥。\n莫嫌眼下行程缓，稳步终能过石礁。',mean:'进展虽慢但仍可推进。把大任务拆小，持续完成眼前一步。'},
 {g:'平',poem:'一盏清茶半卷书，窗边日影渐移除。\n不将琐事都牵挂，留点闲心看自如。',mean:'适合恢复精力、安排日常。适度休息不是拖延，而是为了更稳定地继续。'},
 {g:'小凶',poem:'人声纷杂各言真，未见全篇莫信闻。\n多问一层求实据，免教误会累情分。',mean:'谨慎对待传闻和二手消息。先确认来源，避免未经核实就转发或指责。'},
 {g:'大吉',poem:'积雪初消见远峰，长年勤勉渐成踪。\n今朝若把良机握，前路清和万事从。',mean:'适合展示准备已久的成果、争取机会。主动一点，同时把后续安排准备充分。'},
 {g:'小吉',poem:'檐下微光照旧琴，风来一曲洗尘心。\n不求万事皆如意，能有片时自在深。',mean:'适合放松、创作和与亲近的人相处。给自己留一点不被任务占满的时间。'},
 {g:'中吉',poem:'旧结抽丝渐可分，耐心细理见真文。\n不因一时无头绪，便把前功付水云。',mean:'遇到复杂问题时，列出已知与未知再逐项处理。不要因为暂时卡住就否定之前的努力。'},
 {g:'平',poem:'花开花谢有时节，云聚云开自有涯。\n今日只须行稳步，心宽处处是生涯。',mean:'维持稳定就好。对暂时无法控制的事情，减少反复消耗，把精力放回可行动的部分。'},
 {g:'小凶',poem:'急水滩头石未平，孤舟切莫逆风行。\n先将绳缆牢牢系，待得波缓再启程。',mean:'避免冲动消费、仓促承诺或情绪化争执。先稳住局面，再决定下一步。'},
 {g:'小吉',poem:'晨光穿叶落书台，久困心情渐次开。\n身边小事勤料理，清风自会入门来。',mean:'适合整理环境、完成小任务。把周围收拾清爽，思路也会更容易理顺。'},
 {g:'中吉',poem:'远山含翠水含烟，旧友新知话有缘。\n若肯先将诚意递，往来渐暖不须言。',mean:'适合建立联系、修复关系或开展合作。真诚表达比刻意表现更有力量。'},
 {g:'大吉',poem:'星火微明可燎原，寸功累积不徒然。\n今日再添一分力，回看已在高峰前。',mean:'适合持续推进长期目标。小幅但稳定的进展，往往比一时冲刺更可靠。'},
 {g:'平',poem:'晴窗静坐听风过，案上闲花自在开。\n不问浮名争几许，先将手边事情裁。',mean:'适合完成手边事务，不必同时开启太多新项目。清晰的优先级能减少疲惫。'},
 {g:'小凶',poem:'夜色深时路更长，心头有火语偏伤。\n且把争端留明日，睡醒再论短和长。',mean:'避免在疲惫或情绪激动时作重大决定。必要时暂停对话，等双方冷静后再谈。'},
 {g:'小吉',poem:'檐雨初停石径香，云边一线透晴光。\n不须急问何时好，先把今朝过稳当。',mean:'眼前的阻滞有机会逐步缓解。先做好可控的事情，不必反复追问结果何时出现。'},
 {g:'中吉',poem:'案头旧稿又添新，反复推敲见本真。\n今日适宜修一字，来时方不负初心。',mean:'适合修改、打磨和完善已有成果。细节上的耐心，会让最终结果更扎实。'}
);

function todayStr(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
/* ---------- 周易六十四卦：卦名与卦象按通行文王卦序；不使用生成式文本补造经文 ---------- */
const YJ_TRIGRAMS=[
 {name:'乾',symbol:'☰',bits:[1,1,1]}, {name:'兑',symbol:'☱',bits:[1,1,0]},
 {name:'离',symbol:'☲',bits:[1,0,1]}, {name:'震',symbol:'☳',bits:[1,0,0]},
 {name:'巽',symbol:'☴',bits:[0,1,1]}, {name:'坎',symbol:'☵',bits:[0,1,0]},
 {name:'艮',symbol:'☶',bits:[0,0,1]}, {name:'坤',symbol:'☷',bits:[0,0,0]}
];
const YJ_NAMES=['乾','坤','屯','蒙','需','讼','师','比','小畜','履','泰','否','同人','大有','谦','豫','随','蛊','临','观','噬嗑','贲','剥','复','无妄','大畜','颐','大过','坎','离','咸','恒','遁','大壮','晋','明夷','家人','睽','蹇','解','损','益','夬','姤','萃','升','困','井','革','鼎','震','艮','渐','归妹','丰','旅','巽','兑','涣','节','中孚','小过','既济','未济'];
/* 离线经典库：收录经文与传文，原文保持繁体字形。 */
const YJ_CLASSIC_DB={
'乾':{source:'维基文库《周易/乾》',url:'https://zh.wikisource.org/wiki/周易/乾',layers:[
{title:'经文·卦辞',text:'乾：元亨。利貞。'},
{title:'经文·爻辞',text:'初九：潛龍勿用。\n九二：見龍在田，利見大人。\n九三：君子終日乾乾，夕惕若；厲，无咎。\n九四：或躍在淵，无咎。\n九五：飛龍在天，利見大人。\n上九：亢龍，有悔。\n用九：見羣龍无首，吉。'},
{title:'彖传',text:'大哉乾元，萬物資始，乃統天。雲行雨施，品物流形，大明終始，六位時成。時乘六龍以御天，乾道變化，各正性命，保合大和（一作太和），乃利貞。首出庶物，萬國咸寧。'},
{title:'象传',text:'天行健，君子以自強不息。\n潛龍勿用，陽在下也。\n見龍在田，德施普也。\n終日乾乾，反復道也。\n或躍在淵，進无咎也。\n飛龍在天，大人造也。\n亢龍有悔，盈不可久也。\n用九，天德不可為首也。'},
{title:'文言（节录：乾卦相关）',text:'元者，善之長也。亨者，嘉之會也。利者，義之和也。貞者，事之幹也。君子體仁足以長人，嘉會足以合禮，利物足以和義，貞固足以幹事。君子行此四德者，故曰：「乾，元、亨、利、貞。」'}]},
'坤':{source:'维基文库《周易/坤》',url:'https://zh.wikisource.org/wiki/周易/坤',layers:[
{title:'经文·卦辞',text:'坤：元亨。利牝馬之貞。君子有攸往，先迷後得主，利。西南得朋，東北喪朋。安貞吉。'},
{title:'经文·爻辞',text:'初六：履霜，堅冰至。\n六二：直方大，不習无不利。\n六三：含章可貞。或從王事，无成有終。\n六四：括囊，无咎无譽。\n六五：黃裳，元吉。\n上六：龍戰于野，其血玄黃。\n用六：利永貞。'},
{title:'彖传',text:'至哉坤元，萬物資生，乃順承天。坤厚載物，德合无疆。含弘光大，品物咸亨。牝馬地類，行地无疆，柔順利貞。君子攸行，先迷失道，後順得常。西南得朋，乃與類行；東北喪朋，乃終有慶。安貞之吉，應地无疆。'},
{title:'象传',text:'地勢坤，君子以厚德載物。\n履霜堅冰，陰始凝也。馴致其道，至堅冰也。\n六二之動，直以方也。不習无不利，地道光也。\n含章可貞，以時發也。或從王事，知光大也。\n括囊无咎，慎不害也。\n黃裳元吉，文在中也。\n龍戰于野，其道窮也。\n用六永貞，以大終也。'}]}
 ,'比':{source:'常先·易古籍书库《周易·比》',url:'https://changxianyi.com/guji/zhouyi/ws-20260914/gua-08/',layers:[
{title:'经文·卦辞及爻辞',text:'比：吉。原筮元永贞，无咎。不宁方来，后夫凶。\n初六：有孚，比之，无咎。有孚盈缶，终来有它，吉。\n六二：比之自内，贞吉。\n六三：比之匪人。\n六四：外比之，贞吉。\n九五：显比。王用三驱，失前禽，邑人不诫，吉。\n上六：比之无首，凶。'},
{title:'彖传',text:'比，吉也。比，辅也，下顺从也。原筮，元永贞，无咎，以刚中也。不宁方来，上下应也。后夫凶，其道穷也。'},
{title:'象传',text:'地上有水，比；先王以建万国，亲诸侯。\n比之初六，有它吉也。\n比之自内，不自失也。\n比之匪人，不亦伤乎！\n外比于贤，以从上也。\n显比之吉，位正中也。舍逆取顺，失前禽也。邑人不诫，上使中也。\n比之无首，无所终也。'}]},
'履':{source:'常先·易古籍书库《周易·履》',url:'https://changxianyi.com/guji/zhouyi/ws-20260914/gua-10/',layers:[
{title:'经文·卦辞及爻辞',text:'履虎尾，不咥人，亨。\n初九：素履，往无咎。\n九二：履道坦坦，幽人贞吉。\n六三：眇能视，跛能履，履虎尾，咥人，凶。武人为于大君。\n九四：履虎尾，愬愬终吉。\n九五：夬履，贞厉。\n上九：视履考祥，其旋元吉。'},
{title:'彖传',text:'履，柔履刚也。说而应乎乾，是以履虎尾，不咥人，亨。刚中正，履帝位而不疚，光明也。'},
{title:'象传',text:'上天下泽，履；君子以辨上下，定民志。\n素履之往，独行愿也。\n幽人贞吉，中不自乱也。\n眇能视，不足以有明也。跛能履，不足以与行也。咥人之凶，位不当也。武人为于大君，志刚也。\n愬愬终吉，志行也。\n夬履贞厉，位正当也。\n元吉在上，大有庆也。'}]},
'豫':{source:'常先·易古籍书库《周易·豫》',url:'https://changxianyi.com/guji/zhouyi/ws-20260914/gua-16/',layers:[
{title:'经文·卦辞及爻辞',text:'豫：利建侯行师。\n初六：鸣豫，凶。\n六二：介于石，不终日，贞吉。\n六三：盱豫，悔。迟有悔。\n九四：由豫，大有得。勿疑。朋盍簪。\n六五：贞疾，恒不死。\n上六：冥豫，成有渝，无咎。'},
{title:'彖传',text:'豫，刚应而志行，顺以动，豫。豫，顺以动，故天地如之，而况建侯行师乎？天地以顺动，故日月不过，而四时不忒；圣人以顺动，则刑罚清而民服。豫之时义大矣哉！'},
{title:'象传',text:'雷出地奋，豫。先王以作乐崇德，殷荐之上帝，以配祖考。\n初六鸣豫，志穷凶也。\n不终日，贞吉；以中正也。\n盱豫有悔，位不当也。\n由豫，大有得；志大行也。\n六五贞疾，乘刚也。恒不死，中未亡也。\n冥豫在上，何可长也。'}]},
'节':{source:'常先·易古籍书库《周易·节》',url:'https://changxianyi.com/guji/zhouyi/ws-20260914/gua-60/',layers:[
{title:'经文·卦辞及爻辞',text:'节：亨。苦节不可贞。\n初九：不出户庭，无咎。\n九二：不出门庭，凶。\n六三：不节若，则嗟若，无咎。\n六四：安节，亨。\n九五：甘节，吉；往有尚。\n上六：苦节，贞凶，悔亡。'},
{title:'彖传',text:'节，亨，刚柔分，而刚得中。苦节不可贞，其道穷也。说以行险，当位以节，中正以通。天地节而四时成。节以制度，不伤财，不害民。'},
{title:'象传',text:'泽上有水，节；君子以制数度，议德行。\n不出户庭，知通塞也。\n不出门庭，失时极也。\n不节之嗟，又谁咎也。\n安节之亨，承上道也。\n甘节之吉，居位中也。\n苦节贞凶，其道穷也。'}]}
,'屯':{source:'维基文库《周易/屯》',url:'https://zh.wikisource.org/wiki/周易/屯',layers:[
{title:'经文·卦辞及爻辞',text:'屯：元亨，利貞。勿用有攸往，利建侯。\n初九：磐桓；利居貞，利建侯。\n六二：屯如，邅如，乘馬班如。匪寇婚媾。女子貞不字，十年乃字。\n六三：即鹿无虞，惟入于林中，君子幾，不如舍，往吝。\n六四：乘馬班如，求婚媾，往吉，无不利。\n九五：屯其膏，小貞吉，大貞凶。\n上六：乘馬班如，泣血漣如。'},
{title:'彖传',text:'屯，剛柔始交而難生。動乎險中，大亨貞。雷雨之動滿盈，天造草昧，宜建侯而不寧。'},
{title:'象传',text:'雲雷，屯；君子以經綸。\n雖磐桓，志行正也。以貴下賤，大得民也。\n六二之難，乘剛也。十年乃字，反常也。\n即鹿无虞，以從禽也。君子舍之，往吝窮也。\n求而往，明也。\n屯其膏，施未光也。\n泣血漣如，何可長也。'}]},
'蒙':{source:'维基文库《周易/蒙》',url:'https://zh.wikisource.org/wiki/周易/蒙',layers:[
{title:'经文·卦辞及爻辞',text:'蒙：亨。匪我求童蒙，童蒙求我。初筮告，再三瀆，瀆則不告。利貞。\n初六：發蒙，利用刑人，用說桎梏；以往吝。\n九二：包蒙，吉。納婦，吉；子克家。\n六三：勿用取女，見金夫，不有躬，无攸利。\n六四：困蒙，吝。\n六五：童蒙，吉。\n上九：擊蒙，不利為寇，利禦寇。'},
{title:'彖传',text:'蒙，山下有險，險而止，蒙。蒙亨，以亨行，時中也。匪我求童蒙，童蒙求我，志應也。初筮告，以剛中也。再三瀆，瀆則不告，瀆蒙也。蒙以養正，聖功也。'},
{title:'象传',text:'山下出泉，蒙；君子以果行育德。\n利用刑人，以正法也。\n子克家，剛柔接也。\n勿用取女，行不順也。\n困蒙之吝，獨遠實也。\n童蒙之吉，順以巽也。\n利用禦寇，上下順也。'}]},
'需':{source:'维基文库《周易/需》',url:'https://zh.wikisource.org/wiki/周易/需',layers:[
{title:'经文·卦辞及爻辞',text:'需：有孚，光亨，貞吉。利涉大川。\n初九：需于郊，利用恒，无咎。\n九二：需于沙，小有言，終吉。\n九三：需于泥，致寇至。\n六四：需于血，出自穴。\n九五：需于酒食，貞吉。\n上六：入于穴，有不速之客三人來，敬之終吉。'},
{title:'彖传',text:'需，須也，險在前也。剛健而不陷，其義不困窮矣。需有孚，光亨，貞吉，位乎天位，以正中也。利涉大川，往有功也。'},
{title:'象传',text:'雲上於天，需；君子以飲食宴樂。\n需于郊，不犯難行也。利用恒，无咎，未失常也。\n需于沙，衍在中也。雖小有言，以終吉也。\n需于泥，災在外也。自我致寇，敬慎不敗也。\n需于血，順以聽也。\n酒食貞吉，以中正也。\n不速之客來，敬之終吉。雖不當位，未大失也。'}]},
'讼':{source:'维基文库《周易/讼》',url:'https://zh.wikisource.org/wiki/周易/讼',layers:[
{title:'经文·卦辞及爻辞',text:'訟：有孚，窒惕，中吉，終凶。利見大人，不利涉大川。\n初六：不永所事，小有言，終吉。\n九二：不克訟，歸而逋，其邑人三百戶，无眚。\n六三：食舊德，貞厲，終吉；或從王事，无成。\n九四：不克訟，復即命，渝，安貞吉。\n九五：訟，元吉。\n上九：或錫之鞶帶，終朝三褫之。'},
{title:'彖传',text:'訟，上剛下險，險而健，訟。訟有孚窒惕，中吉，剛來而得中也。終凶，訟不可成也。利見大人，尚中正也。不利涉大川，入于淵也。'},
{title:'象传',text:'天與水違行，訟；君子以作事謀始。\n不永所事，訟不可長也。雖小有言，其辯明也。\n不克訟，歸逋竄也。自下訟上，患至掇也。\n食舊德，從上吉也。\n復即命，渝安貞，不失也。\n訟元吉，以中正也。\n以訟受服，亦不足敬也。'}]},
'师':{source:'维基文库《周易/师》',url:'https://zh.wikisource.org/wiki/周易/师',layers:[
{title:'经文·卦辞及爻辞',text:'師：貞，丈人吉，无咎。\n初六：師出以律，否臧凶。\n九二：在師中吉，无咎，王三錫命。\n六三：師或輿尸，凶。\n六四：師左次，无咎。\n六五：田有禽，利執言，无咎。長子帥師，弟子輿尸，貞凶。\n上六：大君有命，開國承家，小人勿用。'},
{title:'彖传',text:'師，眾也，貞正也，能以眾正，可以王矣。剛中而應，行險而順，以此毒天下而民從之，吉又何咎矣。'},
{title:'象传',text:'地中有水，師；君子以容民畜眾。\n師出以律，失律凶也。\n在師中吉，承天寵也。王三錫命，懷萬邦也。\n師或輿尸，大无功也。\n左次无咎，未失常也。\n長子帥師，以中行也。弟子輿尸，使不當也。\n大君有命，以正功也。小人勿用，必亂邦也。'}]},
'小畜':{source:'常先·易古籍书库《周易·小畜》',url:'https://changxianyi.com/guji/zhouyi/ws-20260914/gua-09/',layers:[
{title:'经文·卦辞及爻辞',text:'小畜：亨。密雲不雨，自我西郊。\n初九：復自道，何其咎，吉。\n九二：牽復，吉。\n九三：輿說輻，夫妻反目。\n六四：有孚，血去惕出，无咎。\n九五：有孚攣如，富以其鄰。\n上九：既雨既處，尚德載。婦貞厲，月幾望，君子征凶。'},
{title:'彖传',text:'小畜，柔得位而上下應之，曰小畜。健而巽，剛中而志行，乃亨。密雲不雨，尚往也。自我西郊，施未行也。'},
{title:'象传',text:'風行天上，小畜；君子以懿文德。\n復自道，其義吉也。\n牽復在中，亦不自失也。\n夫妻反目，不能正室也。\n有孚惕出，上合志也。\n有孚攣如，不獨富也。\n既雨既處，德積載也。君子征凶，有所疑也。'}]}

,'泰':{source:'维基文库《周易/泰》',url:'https://zh.wikisource.org/wiki/周易/泰',layers:[
{title:'经文·卦辞及爻辞',text:'泰：小往大來，吉亨。\n初九：拔茅茹，以其彙，征吉。\n九二：包荒，用馮河，不遐遺。朋亡，得尚于中行。\n九三：无平不陂，无往不復。艱貞无咎。勿恤其孚，于食有福。\n六四：翩翩，不富以其鄰，不戒以孚。\n六五：帝乙歸妹，以祉元吉。\n上六：城復于隍，勿用師。自邑告命，貞吝。'},
{title:'彖传',text:'泰，小往大來，吉亨。則是天地交而萬物通也，上下交而其志同也。內陽而外陰，內健而外順，內君子而外小人，君子道長，小人道消也。'},
{title:'象传',text:'天地交，泰；后以財成天地之道，輔相天地之宜，以左右民。\n拔茅征吉，志在外也。\n包荒，得尚于中行，以光大也。\n无往不復，天地際也。\n翩翩不富，皆失實也。不戒以孚，中心願也。\n以祉元吉，中以行願也。\n城復于隍，其命亂也。'}]},
'否':{source:'维基文库《周易/否》',url:'https://zh.wikisource.org/wiki/周易/否',layers:[
{title:'经文·卦辞及爻辞',text:'否：否之匪人，不利君子貞，大往小來。\n初六：拔茅茹，以其彙，貞吉亨。\n六二：包承，小人吉，大人否亨。\n六三：包羞。\n九四：有命无咎，疇離祉。\n九五：休否，大人吉。其亡其亡，繫于苞桑。\n上九：傾否，先否後喜。'},
{title:'彖传',text:'否之匪人，不利君子貞，大往小來。則是天地不交而萬物不通也，上下不交而天下无邦也。內陰而外陽，內柔而外剛，內小人而外君子。小人道長，君子道消也。'},
{title:'象传',text:'天地不交，否；君子以儉德辟難，不可榮以祿。\n拔茅貞吉，志在君也。\n大人否亨，不亂群也。\n包羞，位不當也。\n有命无咎，志行也。\n大人之吉，位正當也。\n否終則傾，何可長也。'}]},
'同人':{source:'维基文库《周易/同人》',url:'https://zh.wikisource.org/wiki/周易/同人',layers:[
{title:'经文·卦辞及爻辞',text:'同人：同人于野，亨。利涉大川，利君子貞。\n初九：同人于門，无咎。\n六二：同人于宗，吝。\n九三：伏戎于莽，升其高陵，三歲不興。\n九四：乘其墉，弗克攻，吉。\n九五：同人，先號咷而後笑。大師克相遇。\n上九：同人于郊，无悔。'},
{title:'彖传',text:'同人，柔得位得中而應乎乾，曰同人。同人曰，同人于野，亨，利涉大川，乾行也。文明以健，中正而應，君子正也。唯君子為能通天下之志。'},
{title:'象传',text:'天與火，同人；君子以類族辨物。\n出門同人，又誰咎也。\n同人于宗，吝道也。\n伏戎于莽，敵剛也。三歲不興，安行也。\n乘其墉，義弗克也。其吉，則困而反則也。\n同人之先，以中直也。大師相遇，言相克也。\n同人于郊，志未得也。'}]},
'大有':{source:'维基文库《周易/大有》',url:'https://zh.wikisource.org/wiki/周易/大有',layers:[
{title:'经文·卦辞及爻辞',text:'大有：元亨。\n初九：无交害，匪咎，艱則无咎。\n九二：大車以載，有攸往，无咎。\n九三：公用亨于天子，小人弗克。\n九四：匪其彭，无咎。\n六五：厥孚交如，威如，吉。\n上九：自天祐之，吉无不利。'},
{title:'彖传',text:'大有，柔得尊位，大中而上下應之，曰大有。其德剛健而文明，應乎天而時行，是以元亨。'},
{title:'象传',text:'火在天上，大有；君子以遏惡揚善，順天休命。\n大有初九，无交害也。\n大車以載，積中不敗也。\n公用亨于天子，小人害也。\n匪其彭，无咎；明辨晳也。\n厥孚交如，信以發志也。威如之吉，易而无備也。\n大有上吉，自天祐也。'}]},
'谦':{source:'维基文库《周易/谦》',url:'https://zh.wikisource.org/wiki/周易/谦',layers:[
{title:'经文·卦辞及爻辞',text:'謙：亨，君子有終。\n初六：謙謙君子，用涉大川，吉。\n六二：鳴謙，貞吉。\n九三：勞謙，君子有終，吉。\n六四：无不利，撝謙。\n六五：不富以其鄰，利用侵伐，无不利。\n上六：鳴謙，利用行師，征邑國。'},
{title:'彖传',text:'謙，亨。天道下濟而光明，地道卑而上行。天道虧盈而益謙，地道變盈而流謙，鬼神害盈而福謙，人道惡盈而好謙。謙尊而光，卑而不可踰，君子之終也。'},
{title:'象传',text:'地中有山，謙；君子以裒多益寡，稱物平施。\n謙謙君子，卑以自牧也。\n鳴謙貞吉，中心得也。\n勞謙君子，萬民服也。\n无不利，撝謙；不違則也。\n利用侵伐，征不服也。\n鳴謙，志未得也。可用行師，征邑國也。'}]},
'随':{source:'维基文库《周易/随》',url:'https://zh.wikisource.org/wiki/周易/随',layers:[
{title:'经文·卦辞及爻辞',text:'隨：元亨利貞，无咎。\n初九：官有渝，貞吉。出門交有功。\n六二：係小子，失丈夫。\n六三：係丈夫，失小子。隨有求得，利居貞。\n九四：隨有獲，貞凶。有孚在道，以明，何咎。\n九五：孚于嘉，吉。\n上六：拘係之，乃從維之。王用亨于西山。'},
{title:'彖传',text:'隨，剛來而下柔，動而說，隨。大亨貞，无咎，而天下隨時。隨時之義大矣哉！'},
{title:'象传',text:'澤中有雷，隨；君子以嚮晦入宴息。\n官有渝，從正吉也。出門交有功，不失也。\n係小子，弗兼與也。\n係丈夫，志舍下也。\n隨有獲，其義凶也。有孚在道，明功也。\n孚于嘉吉，位正中也。\n拘係之，上窮也。'}]}


,'颐':{source:'常先·易古籍书库《周易·颐》',url:'https://changxianyi.com/guji/zhouyi/ws-20260914/gua-27/',layers:[
{title:'经文·卦辞及爻辞',text:'颐：貞吉。觀頤，自求口實。\n初九：舍爾靈龜，觀我朵頤，凶。\n六二：顛頤，拂經，于丘頤，征凶。\n六三：拂頤，貞凶，十年勿用，无攸利。\n六四：顛頤吉，虎視眈眈，其欲逐逐，无咎。\n六五：拂經，居貞吉，不可涉大川。\n上九：由頤，厲吉，利涉大川。'},
{title:'彖传',text:'頤貞吉，養正則吉也。觀頤，觀其所養也；自求口實，觀其自養也。天地養萬物，聖人養賢，以及萬民；頤之時義大矣哉！'},
{title:'象传',text:'山下有雷，頤；君子以慎言語，節飲食。\n觀我朵頤，亦不足貴也。\n六二征凶，行失類也。\n十年勿用，道大悖也。\n顛頤之吉，上施光也。\n居貞之吉，順以從上也。\n由頤厲吉，大有慶也。'}]}
,'未济':{source:'常先·易古籍书库《周易·未济》',url:'https://changxianyi.com/guji/zhouyi/ws-20260914/gua-64/',layers:[
{title:'经文·卦辞及爻辞',text:'未濟：亨。小狐汔濟，濡其尾，无攸利。\n初六：濡其尾，吝。\n九二：曳其輪，貞吉。\n六三：未濟，征凶，利涉大川。\n九四：貞吉，悔亡，震用伐鬼方，三年有賞于大國。\n六五：貞吉，无悔，君子之光，有孚，吉。\n上九：有孚于飲酒，无咎，濡其首，有孚失是。'},
{title:'彖传',text:'未濟，亨；柔得中也。小狐汔濟，未出中也。濡其尾，无攸利；不續終也。雖不當位，剛柔應也。'},
{title:'象传',text:'火在水上，未濟；君子以慎辨物居方。\n濡其尾，亦不知極也。\n九二貞吉，中以行正也。\n未濟征凶，位不當也。\n貞吉悔亡，志行也。\n君子之光，其暉吉也。\n飲酒濡首，亦不知節也。'}]}

};
function yjClassicSearch(q){q=(q||'').trim().toLowerCase();return YJ_NAMES.map((name,i)=>({name,no:i+1,entry:YJ_CLASSIC_DB[name]})).filter(x=>!q||x.name.toLowerCase().includes(q)||String(x.no)===q||(x.entry||{}).layers?.some(l=>l.text.toLowerCase().includes(q)));}
function yjClassicMarkup(name){const entry=YJ_CLASSIC_DB[name];if(!entry)return ``;return `<div class="yj-classic-entry"><div class="yj-classic-source">底本：<a href="${entry.url}" target="_blank" rel="noopener">${esc(entry.source)}</a></div>${entry.layers.map(l=>`<section class="yj-classic-layer"><h4>${esc(l.title)}</h4><pre>${esc(l.text)}</pre></section>`).join('')}</div>`;}

/* 卦象结构由维基文库《周易》“六十四卦速查表”的上下卦组合表推导：每卦六爻按初爻至上爻排列。 */
const YJ_PAIR_BY_NAME={
'乾':['乾','乾'],'夬':['兑','乾'],'大有':['离','乾'],'大壮':['震','乾'],'小畜':['巽','乾'],'需':['坎','乾'],'大畜':['艮','乾'],'泰':['坤','乾'],
'履':['乾','兑'],'兑':['兑','兑'],'睽':['离','兑'],'归妹':['震','兑'],'中孚':['巽','兑'],'节':['坎','兑'],'损':['艮','兑'],'临':['坤','兑'],
'同人':['乾','离'],'革':['兑','离'],'离':['离','离'],'丰':['震','离'],'家人':['巽','离'],'既济':['坎','离'],'贲':['艮','离'],'明夷':['坤','离'],
'无妄':['乾','震'],'随':['兑','震'],'噬嗑':['离','震'],'震':['震','震'],'益':['巽','震'],'屯':['坎','震'],'颐':['艮','震'],'复':['坤','震'],
'姤':['乾','巽'],'大过':['兑','巽'],'鼎':['离','巽'],'恒':['震','巽'],'巽':['巽','巽'],'井':['坎','巽'],'蛊':['艮','巽'],'升':['坤','巽'],
'讼':['乾','坎'],'困':['兑','坎'],'未济':['离','坎'],'解':['震','坎'],'涣':['巽','坎'],'坎':['坎','坎'],'蒙':['艮','坎'],'师':['坤','坎'],
'遁':['乾','艮'],'咸':['兑','艮'],'旅':['离','艮'],'小过':['震','艮'],'渐':['巽','艮'],'蹇':['坎','艮'],'艮':['艮','艮'],'谦':['坤','艮'],
'否':['乾','坤'],'萃':['兑','坤'],'晋':['离','坤'],'豫':['震','坤'],'观':['巽','坤'],'比':['坎','坤'],'剥':['艮','坤'],'坤':['坤','坤']
};
const YJ_TRIGRAM_BY_NAME=Object.fromEntries(YJ_TRIGRAMS.map(t=>[t.name,t]));
const YJ_GUA=YJ_NAMES.map(name=>{const pair=YJ_PAIR_BY_NAME[name];if(!pair)throw new Error('缺少卦象映射：'+name);return [...YJ_TRIGRAM_BY_NAME[pair[0]].bits,...YJ_TRIGRAM_BY_NAME[pair[1]].bits];});
function yjFind(bits){let i=YJ_GUA.findIndex(a=>a.join('')===bits.join(''));return i<0?null:{no:i+1,name:YJ_NAMES[i],bits:YJ_GUA[i]};}
function yjLineMarkup(bits, moving=[]){return bits.map((v,i)=>`<div class="yj-line-row"><span>${['初','二','三','四','五','上'][i]}爻</span><b class="${v?'yang':'yin'} ${moving.includes(i)?'moving':''}">${v?'━━━━━━':'━━　━━'}</b><small>${moving.includes(i)?'动爻':''}</small></div>`).reverse().join('');}
function viewDivination(){
  const today=todayStr();
  const rec=DB.data.divination||{};
  const done=rec.date===today;
  const f=done?rec.result:null;
  const sticks=()=>{let h='';for(let i=0;i<9;i++){h+=`<i style="height:${90+Math.round(40*Math.abs(Math.sin(i*1.3)))}px"></i>`;}return h;};
  const c=`<div class="p-panel">
    <div class="div-wrap">
      <h2>抽签问吉</h2>
      <div class="ph-sub">心诚则灵，每日一签，问一日之运</div>
      <div class="div-stage" style="margin-top:18px">
        ${f?`<div class="div-jian">— 今日签 —</div>
          <div class="div-grade" style="color:${f.color}">${f.g}</div>
          <div class="div-poem">${esc(f.poem)}</div>
          <div class="div-mean">${esc(f.mean)}</div>`
          :`<div class="div-sticks">${sticks()}</div>
            <div style="color:#C6CFEE;font-size:14px">静心凝神，默念所问之事</div>
            <button class="btn btn-orange" id="div-draw" style="margin-top:16px">摇签</button>`}
      </div>
      ${done?'<div class="ph-sub" style="margin-top:12px">今日已问过，明日再来</div>':''}
    </div>
  </div>`;
  return portalShell('divination',c);
}

/* ---------- 伏羲六十四卦独立模块 ---------- */
function viewYijing(){
 const rec=DB.data.yijing||{};
 const c=`<div class="p-panel yj-module"><div class="yj-head"><div class="yj-kicker">周易 · 原典工具</div><h2>伏羲六十四卦</h2><p>六爻法 · 梅花易数</p><p class="yj-note">卦名与卦序采用通行《周易》文王卦序；卦象组合参考《周易》六十四卦速查表。原文保持繁体字形，并按经文、传文分层呈现。</p></div>
 <div class="yj-tabs"><button class="btn ${rec.method!=='meihua'?'btn-orange':'btn-ghost'}" data-yj-method="liuyao">六爻法（三钱起卦）</button><button class="btn ${rec.method==='meihua'?'btn-orange':'btn-ghost'}" data-yj-method="meihua">梅花易数（数字起卦）</button></div>
 ${rec.method==='meihua'?`<section class="yj-card"><h3>梅花易数 · 数字起卦</h3><p>输入两个数字，按先天八卦数取上下卦；第三数取动爻。此处采用一种常见的先天八卦数约定：“乾1、兑2、离3、震4、巽5、坎6、艮7、坤8”。梅花易数存在不同取数与起卦法，本工具只实现页面明示的数字法，不把它说成唯一标准。</p><div class="yj-inputs"><label>上卦数<input id="yj-a" type="number" min="1" value="${esc(rec.a||1)}"></label><label>下卦数<input id="yj-b" type="number" min="1" value="${esc(rec.b||2)}"></label><label>动爻数<input id="yj-c" type="number" min="1" value="${esc(rec.c||3)}"></label></div><button class="btn btn-orange" id="yj-calc-meihua">起卦</button></section>`:
 `<section class="yj-card"><h3>六爻法 · 三枚铜钱，六次投掷</h3><p>依次生成初爻至上爻。数字标记：6老阴（动）、7少阳、8少阴、9老阳（动）。每次投掷结果可重摇，六爻齐全后显示本卦与变卦。</p><div id="yj-throws">${(rec.throws||[]).map((v,i)=>`<span class="yj-throw">${['初','二','三','四','五','上'][i]}爻：${v}</span>`).join(' ')}</div><div class="yj-actions"><button class="btn btn-ghost" id="yj-reset">重新起卦</button><button class="btn btn-orange" id="yj-throw">${(rec.throws||[]).length>=6?'重新起卦':'投掷一爻'}</button></div></section>`}
 ${rec.hex?`<section class="yj-card"><div class="yj-result"><div><small>本卦</small><h3>第${rec.hex.no}卦 · ${esc(rec.hex.name)}</h3>${yjLineMarkup(rec.hex.bits,rec.moving||[])}</div>${rec.changed?`<div><small>变卦</small><h3>第${rec.changed.no}卦 · ${esc(rec.changed.name)}</h3>${yjLineMarkup(rec.changed.bits)}</div>`:''}</div><p class="yj-note">卦象按六爻自下而上计算。当前版本不生成未经校勘的卦辞、爻辞或断语；请打开底本核对原文。六爻排盘结果不等同于纳甲六亲、世应、月建日辰等完整六爻断法。</p><p class="yj-source">本卦原文：<a href="https://zh.wikisource.org/wiki/周易/${encodeURIComponent(rec.hex.name)}" target="_blank" rel="noopener">打开维基文库《周易/${esc(rec.hex.name)}》</a> · <a href="https://ctext.org/book-of-changes/yi-jing" target="_blank" rel="noopener">中国哲学书电子化计划《周易》总目</a></p><p class="yj-note">原典分层：可打开底本核对卦辞、爻辞及传文。不同版本可能有异体字、断句或文字差异；本工具不擅自统一异文。</p></section>`:''}
 <section class="yj-card yj-library"><h3>经典原文库 · 离线查询</h3><p>可按卦名、卦序或原文关键词检索，原文采用繁体字形。</p><div class="yj-library-search"><input id="yj-classic-query" type="search" placeholder="搜索卦名、卦序或原文关键词（如：潜龙、元亨、11）" autocomplete="off"><button class="btn btn-orange" id="yj-classic-search">查询</button></div><div id="yj-classic-results" class="yj-classic-results">${yjClassicMarkup('乾')}</div></section>
 <section class="yj-card"><h3>六十四卦索引</h3><p>按通行文王卦序列出卦名。点选卦名可查看其卦象结构；本索引不将现代释义冒充经文。</p><div class="yj-index">${YJ_NAMES.map((n,i)=>`<button class="yj-index-item" data-yj-index="${i}"><small>${String(i+1).padStart(2,'0')}</small><span>${esc(n)}</span></button>`).join('')}</div></section>
 </div>`;
 return portalShell('yijing',c);
}
/* ---------- OA 系统 ---------- */
function oaForm(type){
  const val=id=>{const el=document.getElementById(id);return el?el.value.trim():'';};
  const mask=openMask(`<h3>${type==='task'?'填报任务表':'请假申请'}</h3><div class="m-body">
    ${type==='task'?`
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div style="flex:2;min-width:180px"><label class="fl">任务名称</label><input class="field" id="oa-title" placeholder="如：碧游村外围巡查"></div>
        <div style="flex:1;min-width:120px"><label class="fl">任务类型</label>
          <select class="field" id="oa-ttype"><option>巡查</option><option>调查</option><option>抓捕</option><option>护送</option><option>潜伏</option><option>后勤</option><option>其他</option></select></div>
        <div style="flex:1;min-width:120px"><label class="fl">优先级</label>
          <select class="field" id="oa-prio"><option>普通</option><option>紧急</option><option>特急</option></select></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:130px"><label class="fl">开始时间</label><input class="field" id="oa-start" type="datetime-local"></div>
        <div style="flex:1;min-width:130px"><label class="fl">截止时间</label><input class="field" id="oa-end" type="datetime-local"></div>
        <div style="flex:1;min-width:130px"><label class="fl">任务地点</label><input class="field" id="oa-loc" placeholder="如：碧游村周边"></div>
      </div>
      <label class="fl" style="margin-top:10px">任务目标</label><textarea class="field" id="oa-goal" style="min-height:56px" placeholder="本次任务要达成的核心目标"></textarea>
      <label class="fl" style="margin-top:10px">执行计划</label><textarea class="field" id="oa-plan" style="min-height:80px" placeholder="分步骤说明执行安排"></textarea>
      <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:160px"><label class="fl">所需资源 / 支援</label><input class="field" id="oa-res" placeholder="人员、装备、载具等"></div>
        <div style="flex:1;min-width:160px"><label class="fl">风险评估</label><input class="field" id="oa-risk" placeholder="可能的风险与应对"></div>
      </div>
      <label class="fl" style="margin-top:10px">预期成果</label><textarea class="field" id="oa-result" style="min-height:50px" placeholder="预期产出 / 交付物"></textarea>`
      :`<label class="fl">请假类型</label>
        <select class="field" id="oa-ltype"><option>事假</option><option>病假</option><option>调休</option><option>年假</option></select>
        <div style="display:flex;gap:10px;margin-top:10px">
          <div style="flex:1"><label class="fl">开始</label><input class="field" id="oa-start" type="date"></div>
          <div style="flex:1"><label class="fl">结束</label><input class="field" id="oa-end" type="date"></div>
        </div>
      <label class="fl" style="margin-top:10px">请假事由</label>
      <textarea class="field" id="oa-content" style="min-height:100px"></textarea>`}
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn btn-sm btn-ghost" id="oa-cancel" style="margin-left:auto">取消</button>
      <button class="btn btn-sm" id="oa-ok">提交</button></div>
  </div>`);
  mask.querySelector('#oa-cancel').addEventListener('click',()=>mask.remove());
  mask.querySelector('#oa-ok').addEventListener('click',()=>{
    const me=DB.user;
    let item;
    if(type==='task'){
      const title=val('oa-title');
      if(!title){toast('请填写任务名称','warn');return;}
      const detail={
        ttype:val('oa-ttype'),prio:val('oa-prio'),
        s:val('oa-start'),e:val('oa-end'),loc:val('oa-loc'),
        goal:val('oa-goal'),plan:val('oa-plan'),res:val('oa-res'),
        risk:val('oa-risk'),result:val('oa-result')
      };
      item={id:genId('oa'),type:'task',userId:me.id,userName:me.name,title,detail,
        content:detail.goal,status:'pending',createdAt:nowStr(),reviewNote:''};
    }else{
      const lt=val('oa-ltype');
      const s=val('oa-start'),e=val('oa-end');
      const content=val('oa-content');
      if(!s||!e){toast('请选择起止日期','warn');return;}
      item={id:genId('oa'),type:'leave',userId:me.id,userName:me.name,title:lt+' '+s+'~'+e,content,s,e,status:'pending',createdAt:nowStr(),reviewNote:''};
    }
    DB.data.oa.push(item);DB.save();mask.remove();router();toast('申请已提交：审批人可在 OA 待办中看到提醒','ok');
  });
}
function oaDetailHtml(d){
  const row=(k,v)=>v?`<p><span style="color:var(--pt-muted)">${k}：</span>${esc(v)}</p>`:'';
  const dt=v=>v?String(v).replace('T',' '):'';
  return `<div class="oa-detail">
    ${row('类型',d.ttype)}${row('优先级',d.prio)}
    ${row('开始',dt(d.s))}${row('截止',dt(d.e))}${row('地点',d.loc)}
    ${row('目标',d.goal)}${row('执行计划',d.plan)}
    ${row('资源/支援',d.res)}${row('风险评估',d.risk)}${row('预期成果',d.result)}
  </div>`;
}
function viewOA(tab){
  const me=DB.user;const isMgr=me.level>=3;
  if(!isMgr){me.oaSeenAt=Date.now();DB.save();}
  const t=tab||'mine';
  const items=DB.data.oa.filter(x=>t==='all'?true:x.userId===me.id);
  const stName={pending:'待审批',approved:'已批准',rejected:'已驳回'};
  const c=`<div class="p-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <h2>OA 办公</h2>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm" id="oa-task">填报任务</button>
        <button class="btn btn-sm btn-ghost" id="oa-leave">请假申请</button>
      </div>
    </div>
    <div class="oa-tabs" style="margin-top:16px">
      <button class="${t==='mine'?'on':''}" data-oatab="mine">我的申请</button>
      ${isMgr?'<button class="'+(t==='all'?'on':'')+'" data-oatab="all">全部审批</button>':''}
    </div>
    ${items.length?items.map(x=>`<div class="oa-item">
      <div class="oa-top">
        <h4>${x.type==='task'?'[任务] ':'[请假] '}${esc(x.title)}</h4>
        <span class="oa-st ${x.status}">${stName[x.status]}</span>
      </div>
      ${x.type==='task'&&x.detail?oaDetailHtml(x.detail):`<p>${esc(x.content)}</p>`}
      ${x.reviewNote?`<p style="color:#E8C87A">审批意见：${esc(x.reviewNote)}</p>`:''}
      <div class="oa-meta">${esc(x.userName)} · 提交于 ${esc(x.createdAt)}</div>
      ${isMgr&&x.status==='pending'?`<div class="oa-actions">
        <button class="btn btn-sm" data-oaap="approved:${x.id}">批准</button>
        <button class="btn btn-sm btn-ghost" data-oaap="rejected:${x.id}">驳回</button>
        <button class="btn btn-sm btn-ghost" data-oadel="${x.id}" style="margin-left:auto;color:#FF9DA0">删除</button>
      </div>`:isMgr?`<div class="oa-actions"><button class="btn btn-sm btn-ghost" data-oadel="${x.id}" style="margin-left:auto;color:#FF9DA0">删除</button></div>`:''}
    </div>`).join(''):'<div class="empty">暂无记录</div>'}
  </div>`;
  return portalShell('oa',c);
}
/* ---------- 工作组群聊 ---------- */
function viewWorkgroup(){
  const me=DB.user;
  const wg=workgroupOf();
  if(!me||Number(me.level)<2)return portalShell('workgroup',accessDenied());
  // 当前员工/管理员自动加入工作组；成员管理只允许选择 level >= 2 的账号。
  if(!wg.members.includes(me.id)){wg.members.unshift(me.id);DB.save();}
  markConversationSeen('workgroup','');
  const isCard=wg.mode==='card';
  const pageKey='workgroup:main';
  const totalPages=Math.max(1,Math.ceil(wg.messages.length/CHAT_PAGE_SIZE));
  const page=Math.max(0,Math.min(totalPages-1,Number(CHAT_PAGE_STATE[pageKey]||0)));
  CHAT_PAGE_STATE[pageKey]=page;
  const end=wg.messages.length-page*CHAT_PAGE_SIZE;
  const startAt=Math.max(0,end-CHAT_PAGE_SIZE);
  const pageMessages=wg.messages.slice(startAt,end);
  const getUser=id=>DB.data.users.find(u=>u.id===id)||{id,name:'已离职成员',avatar:''};
  const c=`<div class="p-panel chat-window workgroup-window">
    <div class="chat-head">
      <span class="av" style="background:var(--blue-2)">🏢</span>
      <div class="wg-title"><h3>工作组</h3><div class="ch-hint">员工与管理员内部群 · ${wg.members.length} 位成员</div></div>
      <div class="ch-actions">
        <button class="btn btn-sm btn-orange" id="wg-speak" type="button">TA 发言 ▾</button>
        <button class="btn btn-sm btn-danger-soft" id="wg-clear-messages" type="button" title="只清除工作组消息">⌫ 清除此窗口</button>
        <button class="btn btn-sm btn-ghost" id="wg-members" type="button">成员管理</button>
        <button class="btn btn-sm btn-ghost" id="wg-cfg-open" type="button" title="工作组设置" aria-label="工作组设置">⚙ 设置</button>
      </div>
    </div>
    <div class="chat-scroll" id="ch-scroll">
      ${pageMessages.map((m,mi)=>{
        const u=getUser(m.uid),mine=m.uid===me.id;
        const globalIndex=startAt+mi;
        const timeNode=chatTimestampHtml(m,'workgroup','',wg.messages[globalIndex-1]);
        if(m.recalled)return `${timeNode}<div class="msg recalled"><span class="recall-txt">${esc(u.name)} 撤回了一条消息</span></div>`;
        const money=messageIsMoney(m);
        const content=money
          ?`<span class="msg-attachment" data-msgctx="${ctxData('workgroup','',m.id)}">${bubbleContent(m)}</span>`
          :`<span class="bubble ${m.photo?'has-photo':''}" data-msgctx="${ctxData('workgroup','',m.id)}">${bubbleContent(m)}</span>`;
        return `${timeNode}<div class="msg ${mine?'me':'them'} ${money?'money-msg':''}">
          <span class="m-av" ${mine?'':`data-wg-av="${esc(m.uid)}" title="点成员头像让 TA 发言"`}>${avatarHtml32(u)}</span>
          <span class="msg-content-stack">${mine?'':`<span class="m-name">${esc(u.name)}</span>`}${content}${messageReceiptHtml(m,mine)}</span>
        </div>${money?moneyNoticeHtml(m,'workgroup',''):''}`;
      }).join('')||'<div class="empty"><div class="es">💬</div>工作组还没有消息。发一条消息，大家就可以在这里交流。</div>'}
    </div>
    <div class="chat-pagination">
      <button class="btn btn-sm btn-ghost" type="button" data-wg-page="older" ${page>=totalPages-1?'disabled':''}>更早消息</button>
      <span>第 ${page+1}/${totalPages} 页 · 共 ${wg.messages.length} 条</span>
      <button class="btn btn-sm btn-ghost" type="button" data-wg-page="newer" ${page<=0?'disabled':''}>更新消息</button>
    </div>
    ${quoteBarHtml()}
    ${chatInputRow('wg',{voice:false})}
  </div>`;
  setTimeout(()=>maybeProactive({kind:'workgroup'}),0);
  return portalShell('workgroup',c);
}
/* 工作组成员管理（仅员工/管理员） */
function groupMembers(box,groupName){
  const me=DB.user;
  const elig=DB.data.users.filter(u=>u.level>=2&&u.id!==me.id);
  const mask=openMask(`<h3>${groupName}成员</h3><div class="m-body">
    <label class="mem-row" style="border-bottom:1px solid #2A3A7E;margin-bottom:4px">
      <input type="checkbox" checked disabled>
      <span class="av" style="width:30px;height:30px;font-size:12px">${avatarHtml32(me)}</span>
      <span>${esc(me.name)}（我）</span></label>
    ${elig.map(u=>`<label class="mem-row">
      <input type="checkbox" class="mem-ck" value="${u.id}" ${box.members.includes(u.id)?'checked':''}>
      <span class="av" style="width:30px;height:30px;font-size:12px">${avatarHtml32(u)}</span>
      <span>${esc(u.name)} <span style="font-size:12px">（${lvlName(u.level)}）</span></span>
    </label>`).join('')||'<div class="empty">暂无其他员工/管理员</div>'}
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-sm btn-ghost" id="g-cancel" style="margin-left:auto">取消</button><button class="btn btn-sm" id="g-ok">保存</button></div>
  </div>`);
  mask.querySelector('#g-cancel').addEventListener('click',()=>mask.remove());
  mask.querySelector('#g-ok').addEventListener('click',()=>{
    const sel=[...mask.querySelectorAll('.mem-ck')].filter(c=>c.checked).map(c=>c.value);
    box.members=[me.id,...sel];
    DB.save();mask.remove();router();toast('成员已更新','ok');
  });
}
/* 工作组 TA 发言（直接插入可编辑消息） */
function groupSpeak(box,uid){
  if(!box.members.includes(uid))box.members.push(uid);
  const m={id:genId('m'),uid,type:'text',text:'请输入内容',at:nowStr()};markIncomingMessage({kind:'workgroup'},m);
  box.messages.push(m);DB.save();router();scrollRoom();
}
/* 工作组 TA 发言下拉 */
function groupSpeakPop(btn,box,kind){
  closePop();
  const me=DB.user;
  const elig=DB.data.users.filter(u=>u.id!==me.id&&(kind==='workgroup'?u.level>=2:true));
  const rect=btn.getBoundingClientRect();
  const pop=document.createElement('div');pop.className='pop';
  pop.style.position='fixed';pop.style.top='8px';pop.style.left='8px';
  pop.style.maxWidth=Math.max(100,window.innerWidth-16)+'px';
  pop.style.maxHeight=Math.max(100,Math.min(280,window.innerHeight-24))+'px';
  pop.innerHTML=elig.map(u=>`<span class="pop-item" data-speak="${u.id}">
    <span class="av" style="width:26px;height:26px;font-size:11px">${avatarHtml32(u)}</span>
    <span class="pop-name">${esc(u.name)}</span>
    <span class="tag-mini">${box.members.includes(u.id)?'成员':'未加入'}</span></span>`).join('')
    ||'<div class="pop-item" style="cursor:default">暂无可选成员</div>';
  document.body.appendChild(pop);
  const w=pop.offsetWidth,h=pop.offsetHeight;
  let x=Math.max(8,Math.min(rect.right-w,window.innerWidth-w-8));
  let y=rect.bottom+6;
  if(y+h>window.innerHeight-8)y=rect.top-h-6;
  y=Math.max(8,Math.min(y,window.innerHeight-h-8));
  pop.style.left=x+'px';pop.style.top=y+'px';
  pop.addEventListener('click',e=>{
    const it=e.target.closest('[data-speak]');
    if(it){closePop();groupSpeak(box,it.dataset.speak);}
  });
  bindPopDismiss();
}
/* ---------- 员工 / 管理员关系网络 ---------- */
function viewRelationshipNetwork(kind){
  if(DB.level()<2)return portalShell('network-factions',accessDenied());
  const key=kind==='keyPeople'?'keyPeople':'factions';
  const net=DB.data.networks&&DB.data.networks[key];
  if(!net)return portalShell(key==='keyPeople'?'network-keyPeople':'network-factions',`<div class="p-panel empty">关系网数据未初始化，请刷新页面。</div>`);
  const active=key==='keyPeople'?'network-keyPeople':'network-factions';
  if(!Array.isArray(net.nodes))net.nodes=[];if(!Array.isArray(net.edges))net.edges=[];
  const nodeById=id=>net.nodes.find(n=>n.id===id);
  const nodeList=net.nodes.map(n=>`<article class="net-node">
    <div class="net-node-kicker">${esc(n.kind||'未分类')}</div>
    <h3>${esc(n.name)}</h3><p>${esc(n.note||'暂无备注')}</p>
    <div class="net-node-actions"><button type="button" class="btn btn-sm btn-ghost" data-net-nodeedit="${esc(n.id)}">编辑</button><button type="button" class="btn btn-sm btn-ghost" data-net-nodedel="${esc(n.id)}">移除</button></div>
  </article>`).join('')||'<div class="empty">尚未建立节点。可先添加人物、组织或门派，再为它们建立关系。</div>';
  const graphNodes=net.nodes.map(n=>`<article class="network-graph-node" draggable="false" data-net-visual="${esc(n.id)}"><span>${esc(n.kind||'未分类')}</span><b>${esc(n.name)}</b></article>`).join('')||'<div class="network-graph-empty">关系图等待建立<br><small>添加节点，再创建连线</small></div>';
  const edgeList=net.edges.map(e=>{const a=nodeById(e.from),b=nodeById(e.to);if(!a||!b)return '';return `<article class="net-edge-row">
    <div class="net-endpoint">${esc(a.name)}</div><div class="net-edge-meta"><b>${esc(e.label||'关联')}</b>${e.note?`<small>${esc(e.note)}</small>`:''}</div><div class="net-wire ${e.dir==='both'?'is-both':'is-one'}"><span>${e.dir==='both'?'⟷':'→'}</span></div><div class="net-endpoint">${esc(b.name)}</div>
    <button type="button" class="net-edge-remove" data-net-edgedel="${esc(e.id)}" title="删除这条连线" aria-label="删除这条连线">×</button>
  </article>`;}).join('')||'<div class="empty">暂无连线，请在下方添加关系。</div>';
  const opts=net.nodes.map(n=>`<option value="${esc(n.id)}">${esc(n.name)}</option>`).join('');
  const description=key==='keyPeople'?'梳理重点人物之间的师承、协作、交锋与事件牵连。':'梳理组织、门派、分部与重要据点之间的隶属、协作和冲突关系。';
  const content=`<div class="p-crumb">内部情报系统 / <b>${esc(net.title)}</b></div>
    <div class="p-panel network-intro"><div class="network-eyebrow">NDT INTELLIGENCE MAP / INTERNAL</div><h2>${esc(net.title)}</h2><div class="ph-sub">${description}</div><div class="network-legend"><span><i class="net-dot one"></i>单向关系 →</span><span><i class="net-dot both"></i>双向关系 ⟷</span><span>节点 ${net.nodes.length} 个</span><span>连线 ${net.edges.length} 条</span></div></div>
    <div class="p-panel network-graph-panel"><div class="network-section-head"><div><h3>关系图谱</h3><p>节点可长按拖动；画布支持缩放与滚动，缩放不会改变人物关系。</p></div><span class="net-section-count">${net.edges.length} EDGES</span></div><div class="network-zoom-tools" role="group" aria-label="关系图缩放控制"><button type="button" data-net-zoom="out" aria-label="缩小关系图">−</button><button type="button" data-net-zoom="reset" aria-label="重置关系图缩放" class="zoom-reset">100%</button><button type="button" data-net-zoom="in" aria-label="放大关系图">＋</button><span>缩放</span></div><div class="network-graph-wrap" data-network-key="${key}"><svg class="network-graph-svg" aria-hidden="true"></svg><div class="network-graph-nodes">${graphNodes}</div></div></div>
    <div class="p-panel"><div class="network-section-head"><div><h3>关系节点</h3><p>点击编辑可维护名称、类型与情报备注。</p></div><span class="net-section-count">${net.nodes.length} NODES</span></div><div class="network-node-grid">${nodeList}</div>
    <div class="network-add-grid"><div><label class="fl" for="net-node-name">节点名称</label><input class="field" id="net-node-name" maxlength="70" placeholder="例如：风正豪 / 龙虎山天师府"></div><div><label class="fl" for="net-node-kind">身份 / 分类</label><input class="field" id="net-node-kind" maxlength="50" placeholder="人物、门派、组织、据点"></div><div class="wide"><label class="fl" for="net-node-note">简要备注</label><input class="field" id="net-node-note" maxlength="240" placeholder="简述背景或在关系网中的定位"></div><button type="button" class="btn btn-sm btn-orange" id="net-add-node">＋ 添加节点</button></div></div>
    <div class="p-panel"><div class="network-section-head"><div><h3>关系连线</h3><p>关系方向会以箭头明确标出；双向关系显示为双箭头。</p></div><span class="net-section-count">${net.edges.length} EDGES</span></div><div class="network-edge-list">${edgeList}</div>
    <div class="network-add-grid edge-add-grid"><div><label class="fl" for="net-from">关系起点</label><select class="field" id="net-from">${opts}</select></div><div><label class="fl" for="net-to">关系终点</label><select class="field" id="net-to">${opts}</select></div><div><label class="fl" for="net-label">关系说明</label><input class="field" id="net-label" maxlength="80" placeholder="师徒 / 协作 / 交锋"></div><div><label class="fl" for="net-dir">方向</label><select class="field" id="net-dir"><option value="one">单向 →</option><option value="both">双向 ⟷</option></select></div><div class="wide"><label class="fl" for="net-edge-note">补充备注（可选）</label><input class="field" id="net-edge-note" maxlength="180" placeholder="关系背景、对应事件或补充线索"></div><button type="button" class="btn btn-sm btn-orange" id="net-add-edge">＋ 建立连线</button></div>
    </div>`;
  return portalShell(active,content);
}
function drawNetworkGraph(){
  const wrap=document.querySelector('.network-graph-wrap');
  if(!wrap)return;
  const svg=wrap.querySelector('.network-graph-svg');
  const grid=wrap.querySelector('.network-graph-nodes');
  if(!svg||!grid)return;
  const w=Math.max(1,wrap.clientWidth),h=Math.max(160,wrap.clientHeight);
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('width',w);svg.setAttribute('height',h);
  const dataKey=wrap.dataset.networkKey;
  const net=DB.data.networks&&DB.data.networks[dataKey];
  if(!net){svg.innerHTML='';return;}
  const els=[...wrap.querySelectorAll('[data-net-visual]')];
  const byId=id=>els.find(el=>el.dataset.netVisual===id);
  const br=wrap.getBoundingClientRect();
  const paths=[];
  const relationColor=label=>{let h=0;for(const ch of String(label||'关联'))h=(h*31+ch.charCodeAt(0))|0;const palette=['#D66A3A','#2878B8','#8B5FC7','#16856D','#C04D78','#A47716','#3F70A8','#B34F35'];return palette[Math.abs(h)%palette.length];};
  for(const edge of (net.edges||[])){
    const a=byId(edge.from),b=byId(edge.to);if(!a||!b)continue;
    const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();
    const x1=ra.left-br.left+ra.width/2,y1=ra.top-br.top+ra.height/2;
    const x2=rb.left-br.left+rb.width/2,y2=rb.top-br.top+rb.height/2;
    const dx=x2-x1,dy=y2-y1;
    const bend=Math.max(28,Math.min(90,Math.abs(dx)*.18+Math.abs(dy)*.08));
    const c1x=x1+dx*.34,c1y=y1+dy*.34-bend;
    const c2x=x1+dx*.66,c2y=y1+dy*.66-bend;
    const both=edge.dir==='both',color=relationColor(edge.label);
    const len=Math.max(1,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len;const padA=Math.min(52,Math.max(28,Math.min(ra.width,ra.height)*.48)),padB=Math.min(52,Math.max(28,Math.min(rb.width,rb.height)*.48));const sx=x1+ux*padA,sy=y1+uy*padA,ex=x2-ux*padB,ey=y2-uy*padB;const d=`M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${(sx+dx*.34).toFixed(1)} ${(sy+dy*.34-bend).toFixed(1)}, ${(ex-dx*.34).toFixed(1)} ${(ey-dy*.34-bend).toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
    const marker=both?'net-arrow-both':'net-arrow-one';
    paths.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" marker-end="url(#${marker})" ${both?`marker-start="url(#net-arrow-both-start)"`:''}/>`);
    const mx=(x1+x2)/2,my=(y1+y2)/2-bend*.55;
    if(edge.label)paths.push(`<text x="${mx.toFixed(1)}" y="${my.toFixed(1)}" text-anchor="middle" fill="${color}" stroke="var(--pt-panel)" stroke-width="5" paint-order="stroke" font-size="11">${esc(edge.label.slice(0,26))}</text>`);
  }
  svg.innerHTML=`<defs>
    <marker id="net-arrow-one" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L7,3.5 L0,7 Z" fill="context-stroke"/></marker>
    <marker id="net-arrow-both" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L7,3.5 L0,7 Z" fill="context-stroke"/></marker>
    <marker id="net-arrow-both-start" markerWidth="8" markerHeight="8" refX="0" refY="3" orient="auto-start-reverse" markerUnits="strokeWidth"><path d="M0,0 L7,3.5 L0,7 Z" fill="context-stroke"/></marker>
  </defs>${paths.join('')}`;
}
window.addEventListener('resize',()=>{if(document.querySelector('.network-graph-wrap'))drawNetworkGraph();});

function activeNetwork(){
  const seg=parseHash().seg;
  const key=seg[1]==='keyPeople'?'keyPeople':'factions';
  if(!DB.data.networks)DB.data.networks={};
  return {key,net:DB.data.networks[key]};
}
function networkAddNode(){
  const {net}=activeNetwork();if(!net)return;
  const name=$('#net-node-name')?.value.trim(),kind=$('#net-node-kind')?.value.trim(),note=$('#net-node-note')?.value.trim();
  if(!name){toast('请填写节点名称','warn');return;}
  if(net.nodes.some(n=>n.name.toLocaleLowerCase()===name.toLocaleLowerCase())){toast('这个节点已存在','warn');return;}
  net.nodes.push({id:genId('net'),name,kind:kind||'未分类',note,root:false});DB.save();router();toast('已添加关系节点','ok');
}
function networkAddEdge(){
  const {net}=activeNetwork();if(!net)return;
  const from=$('#net-from')?.value,to=$('#net-to')?.value,label=$('#net-label')?.value.trim(),dir=$('#net-dir')?.value||'one',note=$('#net-edge-note')?.value.trim();
  if(!from||!to||from===to){toast('请选择两个不同的节点','warn');return;}
  if(!label){toast('请填写关系说明','warn');return;}
  if(net.edges.some(e=>e.from===from&&e.to===to&&e.label===label&&e.dir===dir)){toast('相同连线已存在','warn');return;}
  net.edges.push({id:genId('edge'),from,to,label,dir,note});DB.save();router();toast('关系连线已建立','ok');
}
function networkEditNode(id){
  const {net}=activeNetwork();const node=net&&net.nodes.find(n=>n.id===id);if(!node)return;
  const mask=openMask(`<h3>编辑关系节点</h3><div class="m-body"><label class="fl">名称</label><input class="field" id="net-edit-name" maxlength="70" value="${esc(node.name)}"><label class="fl" style="margin-top:10px">身份 / 分类</label><input class="field" id="net-edit-kind" maxlength="50" value="${esc(node.kind||'')}"><label class="fl" style="margin-top:10px">备注</label><textarea class="field" id="net-edit-note" maxlength="240" rows="3">${esc(node.note||'')}</textarea></div><div class="m-foot"><button class="btn btn-sm btn-ghost" id="net-edit-cancel">取消</button><button class="btn btn-sm btn-orange" id="net-edit-save">保存</button></div>`);
  mask.querySelector('#net-edit-cancel').addEventListener('click',()=>mask.remove());
  mask.querySelector('#net-edit-save').addEventListener('click',()=>{const name=mask.querySelector('#net-edit-name').value.trim();if(!name){toast('节点名称不能为空','warn');return;}if(net.nodes.some(n=>n.id!==id&&n.name.toLocaleLowerCase()===name.toLocaleLowerCase())){toast('已有同名节点','warn');return;}node.name=name;node.kind=mask.querySelector('#net-edit-kind').value.trim()||'未分类';node.note=mask.querySelector('#net-edit-note').value.trim();DB.save();mask.remove();router();toast('节点已更新','ok');});
}

/* ---------- 档案关系树：内联层级布局，不使用独立画布 ---------- */
function relTreeHtml(r){
  const rels=Array.isArray(r.rels)?r.rels:[];
  const palette=['#D66A3A','#2878B8','#8B5FC7','#16856D','#C04D78','#A47716','#3F70A8','#B34F35'];
  const relationColor=label=>{let h=0;for(const ch of String(label||'相关'))h=(h*31+ch.charCodeAt(0))|0;return palette[Math.abs(h)%palette.length];};
  const layoutOf=(x,i)=>x.layout||((/(师傅|师父|师尊|老师|师长|师承|师叔|师伯|师祖)/.test(x.rel||''))?'up':(/(徒弟|弟子|门生|学生|徒孙)/.test(x.rel||''))?'down':(i%2?'right':'left'));
  const nodeHtml=(x,i)=>{
    const target=DB.data.archives.find(a=>a.name===x.name&&a.id!==r.id);
    const name=target?`<button type="button" class="rt-person rt-open" data-relopen="${esc(target.id)}">${esc(x.name)}</button>`:`<div class="rt-person">${esc(x.name)}</div>`;
    const color=relationColor(x.rel);
    return `<article class="rt-node" style="--rt-color:${color}" data-rel-index="${i}">
      <div class="rt-relation">${esc(x.rel||'相关')} <span class="rt-direction" title="${x.dir==='both'?'双向关系':'单向关系'}">${x.dir==='both'?'↔':'→'}</span></div>
      ${name}${x.note?`<div class="rt-note">${esc(x.note)}</div>`:''}
      <div class="rt-actions"><button type="button" data-relmove="${i}" data-rel-dir="up" title="移到上方">↑ 上</button><button type="button" data-relmove="${i}" data-rel-dir="left" title="移到左侧">← 左</button><button type="button" data-relmove="${i}" data-rel-dir="right" title="移到右侧">右 →</button><button type="button" data-relmove="${i}" data-rel-dir="down" title="移到下方">↓ 下</button><button type="button" data-reledit="${i}">编辑</button><button type="button" class="rt-remove" data-reldel="${i}">断开</button></div>
    </article>`;
  };
  const groups={up:[],left:[],right:[],down:[]};
  rels.forEach((x,i)=>{const d=layoutOf(x,i);(groups[d]?groups[d]:groups.right).push(nodeHtml(x,i));});
  return `<section class="rel-tree-inline" data-rel-tree="${esc(r.id)}">
    <div class="rt-caption"><span>PERSONAL RELATIONSHIP TREE</span><b>档案关系树</b><p>以当前档案人物为中心，关系人物按上下左右分层排列；不支持拖拽，不另设画布。</p></div>
    ${groups.up.length?`<div class="rt-zone rt-up"><div class="rt-zone-label">师承 / 上位关系</div><div class="rt-list">${groups.up.join('')}</div></div>`:''}
    <div class="rt-middle">
      <div class="rt-side rt-left">${groups.left.length?`<div class="rt-zone-label">关联人物</div><div class="rt-list">${groups.left.join('')}</div>`:''}</div>
      <div class="rt-root"><span class="rt-root-mark">档案主体</span><strong>${esc(r.name)}</strong><small>关系中心</small></div>
      <div class="rt-side rt-right">${groups.right.length?`<div class="rt-zone-label">关联人物</div><div class="rt-list">${groups.right.join('')}</div>`:''}</div>
    </div>
    ${groups.down.length?`<div class="rt-zone rt-down"><div class="rt-zone-label">弟子 / 下位关系</div><div class="rt-list">${groups.down.join('')}</div></div>`:''}
    ${rels.length===0?'<div class="rt-empty">暂无关系人物。添加关系后，人物会自动进入这棵关系树。</div>':''}
    <div class="rel-add rt-add"><input class="field" id="rel-name" placeholder="对方姓名 / 代号"><input class="field" id="rel-rel" placeholder="关系（如：师父 / 同僚 / 对手）"><input class="field" id="rel-note" placeholder="备注（可选）"><select class="field" id="rel-dir" title="关系方向"><option value="one">单向 →</option><option value="both">双向 ↔</option></select><button class="btn btn-sm btn-orange" id="rel-add-btn">添加关系</button></div>
  </section>`;
}
function editArchiveRelation(r,index){
  const rel=Array.isArray(r.rels)?r.rels[index]:null;if(!rel)return;
  const mask=openMask(`<h3>编辑关系</h3><div class="m-body"><label class="fl">关联人物</label><input class="field" id="rel-edit-name" maxlength="80" value="${esc(rel.name||'')}"><label class="fl" style="margin-top:10px">关系说明</label><input class="field" id="rel-edit-type" maxlength="80" value="${esc(rel.rel||'')}"><label class="fl" style="margin-top:10px">备注</label><textarea class="field" id="rel-edit-note" rows="3" maxlength="300">${esc(rel.note||'')}</textarea><label class="fl" style="margin-top:10px">关系方向</label><select class="field" id="rel-edit-dir"><option value="one" ${rel.dir==='both'?'':'selected'}>单向 →</option><option value="both" ${rel.dir==='both'?'selected':''}>双向 ⟷</option></select></div><div class="m-foot"><button class="btn btn-sm btn-ghost" id="rel-edit-cancel">取消</button><button class="btn btn-sm btn-orange" id="rel-edit-save">保存关系</button></div>`);
  mask.querySelector('#rel-edit-cancel').onclick=()=>mask.remove();
  mask.querySelector('#rel-edit-save').onclick=()=>{
    const name=mask.querySelector('#rel-edit-name').value.trim(),type=mask.querySelector('#rel-edit-type').value.trim(),note=mask.querySelector('#rel-edit-note').value.trim(),dir=mask.querySelector('#rel-edit-dir').value;
    if(!name||!type){toast('请填写关联人物和关系说明','warn');return;}
    if(rel.linkedId){for(const a of DB.data.archives){if(Array.isArray(a.rels))a.rels=a.rels.filter(x=>x.id!==rel.linkedId);}}
    Object.assign(rel,{name,rel:type,note,dir});delete rel.linkedId;
    if(!rel.id)rel.id=genId('rel');
    const target=DB.data.archives.find(a=>a.name===name&&a.id!==r.id);
    if(dir==='both'&&target){if(!Array.isArray(target.rels))target.rels=[];const reverseId=genId('rel');rel.linkedId=reverseId;target.rels.push({id:reverseId,linkedId:rel.id,name:r.name,rel:type,note,dir:'both'});}
    DB.save();mask.remove();router();toast('关系已更新','ok');
  };
}
/* 添加关系：双向时在目标档案写入可追踪的反向关系 */
function addRelation(r){
  const name=$('#rel-name')?.value.trim(),rel=$('#rel-rel')?.value.trim(),note=$('#rel-note')?.value.trim(),dir=$('#rel-dir')?.value||'one';
  if(!name||!rel){toast('请填写对方姓名和关系','warn');return;}
  if(name===r.name){toast('不能把档案人物关联到自身','warn');return;}
  if(!Array.isArray(r.rels))r.rels=[];
  const target=DB.data.archives.find(a=>a.name===name&&a.id!==r.id);
  const relationId=genId('rel');
  const item={id:relationId,name,rel,note,dir};
  if(dir==='both'&&target){
    if(!Array.isArray(target.rels))target.rels=[];
    const reverseId=genId('rel');item.linkedId=reverseId;
    target.rels.push({id:reverseId,linkedId:relationId,name:r.name,rel,note,dir:'both'});
  }
  r.rels.push(item);DB.save();router();toast('关系已添加','ok');
}

/* ==================================================================
   路由
   ================================================================== */
function parseHash(){
  let h=location.hash.slice(1)||'/';
  let path=h,query={};
  const qi=h.indexOf('?');
  if(qi>=0){path=h.slice(0,qi);new URLSearchParams(h.slice(qi+1)).forEach((v,k)=>query[k]=v);}
  const seg=path.split('/').filter(Boolean);
  return{seg,query};
}

function viewWanted(){
  const items=DB.data.wanted||[];
  const html=`<div class="p-crumb">异人情报系统 / <b>在逃异人通缉令</b></div>
  <div class="p-panel wanted-intro"><div class="wanted-stamp">哪都通 · 内部情报</div><h2>在逃异人追缉公告</h2>
  <div class="wanted-grid">${items.map(w=>`<article class="wanted-card"><div class="wanted-top"><span>ND-TONG / WANTED</span><b>${esc(w.code||'ND-WANTED')}</b></div><div class="wanted-banner">在 逃 通 缉</div><div class="wanted-name">${esc(w.name)}</div><div class="wanted-reward">悬赏金额 <strong>${esc(w.reward)}</strong></div><div class="wanted-fields"><p><b>危险等级</b>${esc(w.danger)}</p><p><b>所属势力</b>${esc(w.faction)}</p><p><b>异术特征</b>${esc(w.skill)}</p><p><b>最后线索</b>${esc(w.lastSeen)}</p><p><b>当前状态</b>${esc(w.status||'在逃')}</p></div><div class="wanted-note">${esc(w.note)}</div><div class="wanted-actions"><button class="btn btn-sm btn-ghost" data-wanted-edit="${esc(w.id)}">编辑通缉令</button><button class="btn btn-sm btn-ghost wanted-delete" data-wanted-del="${esc(w.id)}">撤销通缉令</button></div></article>`).join('')}
  <button class="wanted-add" id="wanted-add">＋ 新增通缉令</button></div></div>`;
  return portalShell('wanted',html);
}
function editWanted(id){
  const isNew=id==='new';const w=isNew?{id:genId('w'),name:'',code:'ND-WANTED-',danger:'B级',reward:'¥ 100,000',faction:'',skill:'',lastSeen:'待确认',note:'',status:'在逃'}:(DB.data.wanted||[]).find(x=>x.id===id);
  if(!w)return;
  const fields=[['name','姓名 / 代号'],['code','通缉编号'],['danger','危险等级'],['reward','悬赏金额'],['faction','所属势力'],['skill','异术特征'],['lastSeen','最后线索'],['status','当前状态']];
  const mask=openMask(`<h3>编辑通缉令</h3><div class="m-body">${fields.map(([k,l])=>`<label class="fl">${l}</label><input class="field" data-wf="${k}" value="${esc(w[k]||'')}">`).join('')}<label class="fl">案情 / 注意事项</label><textarea class="field" data-wf="note" rows="4">${esc(w.note||'')}</textarea></div><div class="m-foot"><button class="btn btn-ghost btn-sm" id="wanted-cancel">取消</button><button class="btn btn-sm" id="wanted-save">保存通缉令</button></div>`);
  mask.querySelector('#wanted-cancel').onclick=()=>mask.remove();
  mask.querySelector('#wanted-save').onclick=()=>{fields.forEach(([k])=>w[k]=mask.querySelector(`[data-wf="${k}"]`).value.trim());w.note=mask.querySelector('[data-wf="note"]').value.trim();if(!w.name){toast('请填写姓名或代号','warn');return;}if(isNew)DB.data.wanted.unshift(w);DB.save();mask.remove();router();toast('通缉令已保存','ok');};
}

const routeViewPositions=window._routeViewPositions||(window._routeViewPositions={});
try{Object.assign(routeViewPositions,JSON.parse(sessionStorage.getItem('ndt-route-positions')||'{}'));}catch(e){}
function rememberCurrentView(hash){
  if(!hash)return;
  const chat=document.querySelector('.chat-scroll');
  routeViewPositions[hash]={y:window.scrollY||0,chatTop:chat?chat.scrollTop:null};
}
function persistViewPositions(){try{sessionStorage.setItem('ndt-route-positions',JSON.stringify(routeViewPositions));}catch(e){}}
window.addEventListener('scroll',()=>{const h=window._lastRouteHash;if(h){const old=routeViewPositions[h]||{};old.y=window.scrollY||0;routeViewPositions[h]=old;}},{passive:true});
document.addEventListener('scroll',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('chat-scroll')){const h=window._lastRouteHash;if(h){const old=routeViewPositions[h]||{y:window.scrollY||0};old.chatTop=e.target.scrollTop;routeViewPositions[h]=old;}}},true);
/* 移动端顶部横向菜单：记录其横向滚动位置，路由重建后恢复，避免每次点击都跳回起点。 */
document.addEventListener('scroll',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('sidebar')){window._sidebarScrollLeft=e.target.scrollLeft;window._sidebarScrollTop=e.target.scrollTop;try{updateNavMoreHint();}catch(e){}}},true);
/* 移动端：让横向菜单吸顶在顶栏下方（顶栏高度随主题/机型变化，故动态测量）。 */
function pinMobileNav(){
  const sd=document.querySelector('.sidebar'),top=document.querySelector('.portal-top');
  const wrap=document.querySelector('.nav-wrap');
  const portal=document.querySelector('.portal');
  if(!sd)return;
  if(window.matchMedia&&window.matchMedia('(max-width:680px)').matches&&top){
    if(wrap)wrap.style.top=top.offsetHeight+'px';
    // 记录顶栏+菜单的总高度，供聊天/工作台等“满屏+内部滚动”容器在手机端正确计算高度。
    if(portal)portal.style.setProperty('--mobile-chrome-h',(top.offsetHeight+(wrap?wrap.offsetHeight:sd.offsetHeight))+'px');
    updateNavMoreHint();
  }else{
    if(wrap)wrap.style.top='';
    if(portal)portal.style.removeProperty('--mobile-chrome-h');
  }
}
/* 手机端菜单：右侧还有内容时显示右缘渐隐提示，到末尾时隐藏。 */
function updateNavMoreHint(){
  const sd=document.querySelector('.sidebar'),wrap=document.querySelector('.nav-wrap');
  if(!sd||!wrap)return;
  const max=sd.scrollWidth-sd.clientWidth;
  if(max>4&&sd.scrollLeft<max-1)wrap.classList.add('nav-has-more');
  else wrap.classList.remove('nav-has-more');
}
/* 渲染后恢复菜单位置：移动端恢复横向位置，桌面端恢复纵向位置，切换时不再跳回顶部。 */
function restoreSidebarScroll(){
  const sd=document.querySelector('.sidebar');if(!sd)return;
  pinMobileNav();
  const isMobile=window.matchMedia&&window.matchMedia('(max-width:680px)').matches;
  if(isMobile){
    const saved=Number(window._sidebarScrollLeft)||0;
    if(saved>0){sd.scrollLeft=saved;return;}
    const on=sd.querySelector('.side-item.on');
    if(on&&typeof on.scrollIntoView==='function'){try{on.scrollIntoView({inline:'nearest',block:'nearest'});}catch(e){on.scrollIntoView(false);}}
  }else{
    /* 桌面端：左侧导航独立滚动，保持用户上次的纵向位置 */
    const saved=Number(window._sidebarScrollTop);
    if(!isNaN(saved))sd.scrollTop=saved;
  }
}
window.addEventListener('pagehide',persistViewPositions);
window.addEventListener('resize',()=>{try{pinMobileNav();}catch(e){}},{passive:true});

/* ==================================================================
   V16 升级：个人能力详情 / 论坛等级 / 方块小游戏
   ================================================================== */

/* 论坛等级默认配置（最高 20 级，名称与阈值均可自定义；min 为累计所需积分） */
const DEFAULT_FORUM_LEVELS=[
  {name:'初入江湖',min:0},{name:'炁感初开',min:10},{name:'见习异人',min:25},{name:'小有所成',min:50},
  {name:'渐入佳境',min:100},{name:'出类拔萃',min:180},{name:'锋芒初露',min:300},{name:'一方好手',min:480},
  {name:'功力渐深',min:720},{name:'异人名宿',min:1050},{name:'炉火纯青',min:1500},{name:'名动一方',min:2100},
  {name:'功参造化',min:2900},{name:'开宗立派',min:4000},{name:'震古烁今',min:5500},{name:'绝世高手',min:7500},
  {name:'一代宗师',min:10000},{name:'陆地神仙',min:13500},{name:'超凡入圣',min:18000},{name:'炁道至尊',min:24000}
];
/* 积分规则默认值（可在“等级配置”中调整） */
const DEFAULT_POINTS_RULE={post:5,reply:2,like:1,gamePerLine:3,gameCap:60};
/* 个人能力默认六维 */
const DEFAULT_ABILITY_RADAR={labels:['炁量','体质','速度','技巧','精神','感知'],values:[60,55,50,70,45,65]};
const DEFAULT_ABILITY_FIELDS=['名称','来源','等级','稳定性','补充','注意事项'];

/* ---------- 论坛等级 / 积分 ---------- */
function forumLevels(){
  if(!Array.isArray(DB.data.forumLevels)||DB.data.forumLevels.length<1)DB.data.forumLevels=DEFAULT_FORUM_LEVELS.map(x=>({...x}));
  return DB.data.forumLevels;
}
function pointsRule(){
  if(!DB.data.pointsRule||typeof DB.data.pointsRule!=='object')DB.data.pointsRule={...DEFAULT_POINTS_RULE};
  return DB.data.pointsRule;
}
function userPoints(u){return Math.max(0,Number(u&&u.points)||0);}
function forumLevelOf(u){
  const lv=forumLevels();const p=userPoints(u);let idx=0;
  for(let i=0;i<lv.length;i++){if(p>=Number(lv[i].min||0))idx=i;}
  return {level:idx+1,index:idx,name:lv[idx].name||('Lv'+(idx+1)),min:Number(lv[idx].min||0),
    next:lv[idx+1]?{name:lv[idx+1].name,min:Number(lv[idx+1].min||0)}:null};
}
function addPoints(u,n){
  if(!u)return 0;
  const before=forumLevelOf(u);
  u.points=Math.max(0,userPoints(u)+(Number(n)||0));
  const after=forumLevelOf(u);
  if(after.level>before.level)setTimeout(()=>toast(`恭喜升级！论坛等级达到 ${after.level} 级 · ${after.name}`,'ok'),350);
  return u.points;
}
/* 论坛等级徽章（与员工身份 lvl-badge 区分，class 用 grade-badge） */
function gradeTier(level){
  if(level>=20)return'tier-max';
  if(level>=16)return'tier-gold';
  if(level>=11)return'tier-violet';
  if(level>=6)return'tier-blue';
  return'tier-bronze';
}
function gradeBadge(u,opts={}){
  const g=forumLevelOf(u);
  return `<span class="grade-badge ${gradeTier(g.level)} ${opts.mini?'grade-mini':''}">${opts.mini?'':svgIco('star')}Lv${g.level} · ${esc(g.name)}</span>`;
}
function gradeProgress(u){
  const g=forumLevelOf(u);
  if(!g.next)return `<div class="grade-progress"><div class="gp-bar"><span style="width:100%"></span></div><div class="gp-text">已达最高等级 ${g.level} 级 · ${esc(g.name)}</div></div>`;
  const p=userPoints(u);
  const pct=Math.max(2,Math.min(100,Math.round((p-g.min)/(g.next.min-g.min)*100)));
  return `<div class="grade-progress"><div class="gp-bar"><span style="width:${pct}%"></span></div>
    <div class="gp-text">${p} / ${g.next.min} 积分 · 距 ${g.level+1} 级「${esc(g.next.name)}」还差 ${g.next.min-p} 分</div></div>`;
}

/* ---------- 个人能力 ---------- */
function abilityNoOf(u){
  let h=0;const s=String(u.id||u.name||'');
  for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;
  return 'NDT-'+String(h%1000000).padStart(6,'0');
}
function abilityOf(u){
  if(!u.ability||typeof u.ability!=='object')u.ability={};
  const a=u.ability;
  if(!a.no)a.no=abilityNoOf(u);
  if(!a.radar||typeof a.radar!=='object')a.radar={};
  if(!Array.isArray(a.radar.labels)||a.radar.labels.length!==6)a.radar.labels=DEFAULT_ABILITY_RADAR.labels.slice();
  if(!Array.isArray(a.radar.values)||a.radar.values.length!==6)a.radar.values=DEFAULT_ABILITY_RADAR.values.slice();
  if(!Array.isArray(a.fields)||a.fields.length<1)a.fields=DEFAULT_ABILITY_FIELDS.slice();
  if(!Array.isArray(a.rows))a.rows=[];
  return a;
}

/* 雷达图绘制（显示与分享共用；opts 可覆盖颜色/尺寸） */
function drawRadarChart(canvas,labels,values,opts={}){
  const dpr=Math.max(1,opts.dpr||window.devicePixelRatio||1);
  const W=opts.px||canvas.clientWidth||320;
  canvas.width=Math.round(W*dpr);canvas.height=Math.round(W*dpr);
  const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
  const cx=W/2,cy=W/2,radius=W*(opts.radiusRatio||.32);
  const n=labels.length,rings=5;
  const cText=opts.text||'var(--pt-text-soft)';
  const cGrid=opts.gridLine||'rgba(120,140,200,.22)';
  const cFill=opts.fill||'rgba(46,71,184,.2)';
  const cStroke=opts.stroke||'#2E47B8';
  const cPoint=opts.point||'#2E47B8';
  ctx.clearRect(0,0,W,W);
  const angAt=i=>-Math.PI/2+Math.PI*2*i/n;
  for(let g=1;g<=rings;g++){
    const r=radius*g/rings;ctx.beginPath();
    for(let i=0;i<n;i++){const a=angAt(i),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
    ctx.closePath();if(g===rings){ctx.fillStyle=opts.centerFill||'rgba(255,255,255,.02)';ctx.fill();}
    ctx.strokeStyle=cGrid;ctx.lineWidth=1;ctx.stroke();
  }
  for(let i=0;i<n;i++){const a=angAt(i);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*radius,cy+Math.sin(a)*radius);ctx.strokeStyle=cGrid;ctx.stroke();}
  const pts=[];
  for(let i=0;i<n;i++){const a=angAt(i);const v=Math.max(0,Math.min(100,Number(values[i])||0))/100;const r=radius*v;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}
  ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
  ctx.fillStyle=cFill;ctx.fill();ctx.strokeStyle=cStroke;ctx.lineWidth=2.2;ctx.stroke();
  pts.forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],3.4,0,Math.PI*2);ctx.fillStyle=cPoint;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.stroke();});
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(let i=0;i<n;i++){
    const a=angAt(i);const lr=radius+ (opts.labelPad||26);
    const x=cx+Math.cos(a)*lr,y=cy+Math.sin(a)*lr;
    ctx.fillStyle=cText;ctx.font='700 '+(opts.font||13)+'px "Microsoft YaHei",sans-serif';
    ctx.fillText(String(labels[i]),x,y-7);
    ctx.fillStyle=cPoint;ctx.font='700 '+(opts.font||12)+'px "Microsoft YaHei",sans-serif';
    ctx.fillText(String(Math.max(0,Math.min(100,Number(values[i])||0))),x,y+8);
  }
}

function viewAbility(){
  if(!DB.user)return viewGate();
  const u=DB.user;const a=abilityOf(u);const g=forumLevelOf(u);
  const av=`<div class="ability-avatar">${u.avatar&&u.avatar.startsWith('data')?`<img src="${u.avatar}" style="width:100%;height:100%;object-fit:cover">`:esc(avText(u.name))}</div>`;
  const cell=v=>esc(v==null?'':v);
  const tableRows=a.rows.map((r,ri)=>`<tr>${a.fields.map((f,fi)=>`<td>${cell(r&&r.v?r.v[fi]:'')}</td>`).join('')}</tr>`).join('');
  const preview=`<section class="ability-card">
    <div class="ability-head">
      ${av}
      <div class="ability-id"><h3>${esc(u.name)}</h3><p>编号 ${esc(a.no)}</p></div>
      ${gradeBadge(u)}
    </div>
    <div class="ability-radar-wrap"><canvas id="ability-radar"></canvas></div>
    <div class="ability-table-wrap">
      <table class="ability-table"><thead><tr>${a.fields.map(f=>`<th>${esc(f)}</th>`).join('')}</tr></thead>
      <tbody>${tableRows||`<tr><td colspan="${a.fields.length}" class="ability-empty">暂无能力条目，可在下方添加</td></tr>`}</tbody></table>
    </div>
    ${gradeProgress(u)}
  </section>`;
  /* 编辑区：雷达轴名 + 数值 */
  const radarEdit=`<div class="ability-radar-edit">${a.radar.labels.map((lb,i)=>`
    <div class="are-row">
      <input class="field are-label" data-radar-label="${i}" maxlength="8" value="${esc(lb)}" placeholder="属性名">
      <input type="range" min="0" max="100" value="${Math.max(0,Math.min(100,Number(a.radar.values[i])||0))}" data-radar-val="${i}" class="are-range">
      <span class="are-num" data-radar-num="${i}">${Math.max(0,Math.min(100,Number(a.radar.values[i])||0))}</span>
    </div>`).join('')}</div>`;
  /* 编辑区：表格字段名 */
  const fieldsEdit=`<div class="ability-fields-edit">${a.fields.map((f,i)=>`
    <div class="afe-row"><input class="field" data-field-name="${i}" maxlength="10" value="${esc(f)}" placeholder="字段名">
    <button type="button" class="btn btn-ghost btn-sm" data-field-del="${i}" title="删除该列">×</button></div>`).join('')}</div>
    <button type="button" class="btn btn-ghost btn-sm" id="ab-field-add">+ 新增一列</button>`;
  /* 编辑区：表格行 */
  const rowsEdit=`<div class="ability-rows-edit">${a.rows.map((r,ri)=>`
    <div class="ab-row" data-row="${ri}"><div class="ab-row-head"><b>条目 ${ri+1}</b>
      <button type="button" class="btn btn-ghost btn-sm" data-row-del="${ri}">删除</button></div>
    <div class="ab-row-grid">${a.fields.map((f,fi)=>`
      <div><label>${esc(f)}</label><input class="field" data-row-cell="${ri}-${fi}" maxlength="120" value="${cell(r&&r.v?r.v[fi]:'')}"></div>`).join('')}</div></div>`).join('')}</div>
    <button type="button" class="btn btn-ghost btn-sm" id="ab-row-add">+ 新增一条能力</button>`;
  const html=`<div class="p-crumb">个人 / <b>个人能力详情</b></div>
    <div class="p-panel">
      <h2>个人能力详情</h2>
      <div class="ph-sub">所有身份均可用 · 六维属性与能力档案可完全自定义，可生成分享图</div>
      <div class="ability-actions">
        <button type="button" class="btn" id="ab-share">${svgIco('image')} 生成分享图</button>
      </div>
      ${preview}
    </div>
    <div class="p-panel">
      <h2>编辑能力档案</h2>
      <div class="ph-sub">六维属性的名称与数值、表格字段名与内容均可自由编辑</div>
      <h3 class="ab-h">六维属性</h3>${radarEdit}
      <h3 class="ab-h">表格字段（列名可改）</h3>${fieldsEdit}
      <h3 class="ab-h">能力条目</h3>${rowsEdit}
      <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
        <button type="button" class="btn btn-orange" id="ab-save">保存能力档案</button>
        <button type="button" class="btn btn-ghost" id="ab-cancel">放弃本次修改</button>
      </div>
    </div>`;
  return portalShell('ability',html);
}

/* ---------- 分享图主题配色 ---------- */
const SHARE_THEMES={
  default:{bg1:'#16225C',bg2:'#0A1238',card:'rgba(255,255,255,.06)',cardBorder:'rgba(160,180,255,.18)',avatarBg:'#6D8CFF',text:'#F3F6FF',sub:'#A9B8E8',stroke:'#6D8CFF',fill:'rgba(109,140,255,.22)',point:'#9DBAFF',accent:'#E8874A',line:'rgba(150,170,230,.25)',glow:'rgba(109,140,255,1)'},
  day:{bg1:'#FFFFFF',bg2:'#E7ECF7',card:'#FFFFFF',cardBorder:'rgba(46,71,184,.16)',avatarBg:'#2E47B8',text:'#1B2450',sub:'#5A6795',stroke:'#2E47B8',fill:'rgba(46,71,184,.16)',point:'#2E47B8',accent:'#2E47B8',line:'#D6DEF0',glow:'rgba(46,71,184,1)'},
  classic:{bg1:'#3A2018',bg2:'#1E100C',card:'rgba(255,248,233,.07)',cardBorder:'rgba(232,176,106,.24)',avatarBg:'#D0484D',text:'#FFF8E9',sub:'#D3B98C',stroke:'#D0484D',fill:'rgba(208,72,77,.2)',point:'#E8B06A',accent:'#E8B06A',line:'rgba(220,190,140,.28)',glow:'rgba(208,72,77,1)'},
  cyber:{bg1:'#0B2230',bg2:'#05121A',card:'rgba(0,229,255,.06)',cardBorder:'rgba(0,229,255,.26)',avatarBg:'#00B8CC',text:'#EAFBFF',sub:'#7FB9C8',stroke:'#00E5FF',fill:'rgba(0,229,255,.16)',point:'#00E5FF',accent:'#3BE08F',line:'rgba(0,229,255,.25)',glow:'rgba(0,229,255,1)'},
  rose:{bg1:'#C98B7E',bg2:'#A05E52',card:'rgba(255,248,244,.14)',cardBorder:'rgba(255,240,232,.4)',avatarBg:'#A96559',text:'#FFF8F4',sub:'#FBE3D6',stroke:'#F0C9B8',fill:'rgba(255,248,244,.22)',point:'#FFF0E8',accent:'#FFF0E8',line:'rgba(255,240,232,.3)',glow:'rgba(240,201,184,1)'},
  aurora:{bg1:'#261D57',bg2:'#100B2C',card:'rgba(150,130,255,.09)',cardBorder:'rgba(150,130,255,.28)',avatarBg:'#3FC9B0',text:'#EFEBFF',sub:'#B7AEE8',stroke:'#5BE3C8',fill:'rgba(91,227,200,.18)',point:'#7CEBD8',accent:'#B07CFF',line:'rgba(150,130,255,.28)',glow:'rgba(91,227,200,1)'}
};
/* 分享图网页地址：部署后自动取当前域名；本地/文件预览时回退到下面可编辑的地址 */
const SITE_URL_FALLBACK='https://nadutong.netlify.app';
function siteUrl(){
  try{
    const o=location.origin;
    if(o&&/^https?:\/\//.test(o)&&!/localhost|127\.0\.0\.1/.test(o))return o;
  }catch(e){}
  return SITE_URL_FALLBACK;
}
/* 把 hex / rgb / rgba 颜色改成指定透明度 */
function glowColor(color,alpha){
  let m=String(color).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if(m)return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`;
  m=String(color).match(/#([0-9a-f]{6}|[0-9a-f]{3})/i);
  if(m){
    let h=m[1];
    if(h.length===3)h=h.split('').map(c=>c+c).join('');
    const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}
/* 估算文字在指定宽度下的换行行数 */
function countLines(ctx,text,maxW){
  let n=1,line='';
  for(const ch of String(text)){const test=line+ch;
    if(ctx.measureText(test).width>maxW&&line){n++;line=ch;}else line=test;}
  return n;
}
/* 玻璃拟态卡片（带柔和投影） */
function glassCard(ctx,x,y,w,h,T){
  ctx.save();
  ctx.shadowColor=glowColor(T.glow,.28);
  ctx.shadowBlur=26;ctx.shadowOffsetY=10;
  ctx.fillStyle=T.card;roundRect(ctx,x,y,w,h,22);ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle=T.cardBorder;ctx.lineWidth=1;roundRect(ctx,x,y,w,h,22);ctx.stroke();
  ctx.restore();
}
/* 区块小标题（左侧竖条 + 文字） */
function sectionTitle(ctx,x,y,text,T){
  ctx.save();
  ctx.fillStyle=T.accent;roundRect(ctx,x,y,5,22,3);ctx.fill();
  ctx.fillStyle=T.text;ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.font='800 20px "Microsoft YaHei",sans-serif';
  ctx.fillText(text,x+15,y+11);
  ctx.restore();
}
/* 太极图（淡色装饰） */
function drawTaiji(ctx,cx,cy,R,color,alpha){
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx,cy-R);
  ctx.arc(cx,cy-R/2,R/2,-Math.PI/2,Math.PI/2,false);
  ctx.arc(cx,cy+R/2,R/2,Math.PI/2,-Math.PI/2,false);
  ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy-R/2,R*.11,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy+R/2,R*.11,0,Math.PI*2);ctx.stroke();
  ctx.restore();
}
/* 沉浸感背景：渐变 + 径向光晕 + 点阵 + 太极 + 圆环 */
function drawShareBackground(ctx,W,H,T){
  const grad=ctx.createLinearGradient(0,0,W*0.4,H);
  grad.addColorStop(0,T.bg1);grad.addColorStop(1,T.bg2);
  ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
  /* 径向光晕 */
  const radial=(cx,cy,r,color,a)=>{
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
    g.addColorStop(0,glowColor(color,a));g.addColorStop(1,glowColor(color,0));
    ctx.fillStyle=g;ctx.fillRect(cx-r,cy-r,r*2,r*2);
  };
  radial(W*0.18,H*0.12,420,T.glow,.22);
  radial(W*0.9,H*0.7,460,T.glow,.18);
  radial(W*0.55,H*0.45,300,T.accent.startsWith('#')?T.stroke:T.glow,.1);
  /* 点阵 */
  ctx.fillStyle=glowColor(T.glow,.5);
  for(let x=26;x<W;x+=28)for(let y=26;y<H;y+=28){ctx.globalAlpha=.16;ctx.fillRect(x,y,1.4,1.4);}
  ctx.globalAlpha=1;
  /* 太极 + 同心圆环 */
  drawTaiji(ctx,W-120,150,120,T.line,.5);
  ctx.strokeStyle=T.line;ctx.lineWidth=1;
  for(const[cx0,cy0,r]of[[W+70,120,170],[W+70,120,220],[-50,H-150,170],[-50,H-150,225]]){
    ctx.beginPath();ctx.arc(cx0,cy0,r,0,Math.PI*2);ctx.stroke();}
}
function buildAbilityShare(u){
  return new Promise(resolve=>{
    const W=750,M=40;
    const measure=document.createElement('canvas').getContext('2d');
    const a=abilityOf(u);const g=forumLevelOf(u);
    const T=SHARE_THEMES[DB.data.theme]||SHARE_THEMES.default;
    const cardW=W-M*2;
    const showRows=a.rows.slice(0,5);
    /* 计算档案每条子卡的高度 */
    const restW=cardW-48-36;
    const rowHeights=showRows.map(r=>{
      const rest=a.fields.slice(1,3).map((f,fi)=>`${f}：${r.v?String(r.v[fi+1]||''):''}`).join('　');
      measure.font='14px "Microsoft YaHei",sans-serif';
      const lines=countLines(measure,rest,restW);
      return 14+24+Math.max(20,lines*20)+14+10;
    });
    const tableRowsH=rowHeights.reduce((s,x)=>s+x,0);
    const headH=132;
    const radarH=44+340+18;
    const tableH=44+(showRows.length?tableRowsH:38)+18;
    const gap=18;
    const H=M+headH+gap+radarH+gap+tableH+gap+96;
    const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d');
    drawShareBackground(ctx,W,H,T);
    let y=M;
    /* ===== 头部卡 ===== */
    glassCard(ctx,M,y,cardW,headH,T);
    const avS=92,avX=M+26,avY=y+(headH-avS)/2;
    ctx.save();ctx.beginPath();ctx.arc(avX+avS/2,avY+avS/2,avS/2,0,Math.PI*2);ctx.closePath();ctx.clip();
    if(window._shareAvatarImg){const i=window._shareAvatarImg;const s=Math.min(i.width,i.height);
      ctx.drawImage(i,(i.width-s)/2,(i.height-s)/2,s,s,avX,avY,avS,avS);}
    else{ctx.fillStyle=T.avatarBg;ctx.fillRect(avX,avY,avS,avS);ctx.fillStyle='#FFFFFF';
      ctx.font='900 38px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(avText(u.name),avX+avS/2,avY+avS/2+2);}
    ctx.restore();
    ctx.strokeStyle=T.accent;ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(avX+avS/2,avY+avS/2,avS/2+3,0,Math.PI*2);ctx.stroke();
    const nmX=avX+avS+22;
    ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillStyle=T.text;ctx.font='900 32px "Microsoft YaHei",sans-serif';
    ctx.fillText(u.name,nmX,avY+38);
    ctx.fillStyle=T.sub;ctx.font='15px "Microsoft YaHei",sans-serif';
    ctx.fillText('编号 '+a.no,nmX,avY+80);
    /* 等级徽章 */
    const badgeTxt='Lv'+g.level+' · '+g.name;
    ctx.font='700 18px "Microsoft YaHei",sans-serif';
    const bw=ctx.measureText(badgeTxt).width+36;
    const bx=W-M-26-bw,by=y+headH/2-20;
    ctx.fillStyle=T.avatarBg;roundRect(ctx,bx,by,bw,40,20);ctx.fill();
    ctx.fillStyle='#FFFFFF';ctx.textAlign='center';ctx.fillText(badgeTxt,bx+bw/2,by+21);
    y+=headH+gap;
    /* ===== 雷达卡 ===== */
    glassCard(ctx,M,y,cardW,radarH,T);
    sectionTitle(ctx,M+26,y+12,'六维属性',T);
    const rc=document.createElement('canvas');
    drawRadarChart(rc,a.radar.labels,a.radar.values,
      {dpr:1,px:340,radiusRatio:.34,text:T.text,gridLine:T.line,fill:T.fill,
       stroke:T.stroke,point:T.point,font:14,labelPad:28,centerFill:'rgba(255,255,255,.02)'});
    ctx.drawImage(rc,W/2-170,y+44);
    y+=radarH+gap;
    /* ===== 能力档案卡 ===== */
    glassCard(ctx,M,y,cardW,tableH,T);
    sectionTitle(ctx,M+26,y+12,'能力档案',T);
    let ry=y+44;
    if(!showRows.length){
      ctx.fillStyle=T.sub;ctx.textAlign='left';ctx.textBaseline='middle';
      ctx.font='14px "Microsoft YaHei",sans-serif';
      ctx.fillText('（暂未填写能力条目，可在下方编辑区添加）',M+26,ry+20);
    }
    showRows.forEach((r,i)=>{
      const rh=rowHeights[i];const sx=M+24,sw=cardW-48,subH=rh-10;
      ctx.fillStyle=glowColor(T.glow,.08);roundRect(ctx,sx,ry,sw,subH,14);ctx.fill();
      ctx.fillStyle=T.accent;roundRect(ctx,sx,ry+14,4,subH-28,2);ctx.fill();
      const name=r.v?String(r.v[0]||''):'';
      const rest=a.fields.slice(1,3).map((f,fi)=>`${f}：${r.v?String(r.v[fi+1]||''):''}`).join('　');
      ctx.fillStyle=T.text;ctx.textAlign='left';ctx.textBaseline='middle';
      ctx.font='700 17px "Microsoft YaHei",sans-serif';
      ctx.fillText(name||'未命名',sx+18,ry+26);
      ctx.fillStyle=T.sub;ctx.font='14px "Microsoft YaHei",sans-serif';
      wrapText(ctx,rest,sx+18,ry+48,sw-36,20,()=>{});
      ry+=rh;
    });
    y+=tableH+gap;
    /* ===== 页脚：品牌 + 网页地址 ===== */
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle=T.sub;ctx.font='14px "Microsoft YaHei",sans-serif';
    ctx.fillText('哪都通 · 异人论坛　异人能力档案',W/2,y+14);
    ctx.fillStyle=T.text;ctx.font='700 20px "Microsoft YaHei",sans-serif';
    ctx.fillText('网址 '+siteUrl(),W/2,y+48);
    resolve(canvas.toDataURL('image/jpeg',.92));
  });
}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function wrapText(ctx,text,x,y,maxW,lh,cb){
  let line='';let yy=y;
  for(const ch of String(text)){const test=line+ch;if(ctx.measureText(test).width>maxW&&line){ctx.fillText(line,x,yy);line=ch;yy+=lh;}else line=test;}
  if(line){ctx.fillText(line,x,yy);yy+=lh;}
  cb(yy);
}

/* ---------- 俄罗斯方块小游戏 ---------- */
const TETRIS_COLS=10,TETRIS_ROWS=20,TETRIS_BLOCK=28;
const TETRIS_PIECES=[
  {m:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],c:'#37D6E8'},
  {m:[[1,0,0],[1,1,1],[0,0,0]],c:'#4A6FE0'},
  {m:[[0,0,1],[1,1,1],[0,0,0]],c:'#E89A3C'},
  {m:[[1,1],[1,1]],c:'#E8D23C'},
  {m:[[0,1,1],[1,1,0],[0,0,0]],c:'#5BE07A'},
  {m:[[0,1,0],[1,1,1],[0,0,0]],c:'#A85BE0'},
  {m:[[1,1,0],[0,1,1],[0,0,0]],c:'#E0556A'}
];
class TetrisGame{
  constructor(){
    this.canvas=$('#tetris-canvas');this.nextCanvas=$('#tetris-next');
    this.ctx=this.canvas.getContext('2d');this.nctx=this.nextCanvas.getContext('2d');
    this.canvas.width=TETRIS_COLS*TETRIS_BLOCK;this.canvas.height=TETRIS_ROWS*TETRIS_BLOCK;
    this.nextCanvas.width=4*TETRIS_BLOCK;this.nextCanvas.height=3*TETRIS_BLOCK;
    this.reset();this.draw();this.drawNext();
  }
  reset(){
    this.board=Array.from({length:TETRIS_ROWS},()=>Array(TETRIS_COLS).fill(null));
    this.score=0;this.lines=0;this.gameLevel=1;this.over=false;this.paused=false;this.running=false;
    this.dropCounter=0;this.dropInterval=800;this.gamePoints=0;this.piece=null;
    this.next=this.randomPiece();this._last=0;
    this.updateStats();
  }
  randomPiece(){const p=TETRIS_PIECES[Math.floor(Math.random()*TETRIS_PIECES.length)];return{m:p.m.map(r=>r.slice()),c:p.c};}
  spawn(){
    this.piece=this.next;this.next=this.randomPiece();
    this.piece.x=Math.floor((TETRIS_COLS-this.piece.m[0].length)/2);this.piece.y=0;
    if(this.collides(this.piece))this.gameOver();
    this.drawNext();
  }
  collides(piece,dx=0,dy=0,m=null){
    const mm=m||piece.m;
    for(let y=0;y<mm.length;y++)for(let x=0;x<mm[y].length;x++){
      if(!mm[y][x])continue;
      const nx=piece.x+x+dx,ny=piece.y+y+dy;
      if(nx<0||nx>=TETRIS_COLS||ny>=TETRIS_ROWS)return true;
      if(ny>=0&&this.board[ny][nx])return true;
    }
    return false;
  }
  merge(){this.piece.m.forEach((row,y)=>row.forEach((v,x)=>{if(v){const ny=this.piece.y+y;if(ny>=0)this.board[ny][this.piece.x+x]=this.piece.c;}}));}
  rotate(){
    const m=this.piece.m,N=m.length;const rot=Array.from({length:N},()=>Array(N).fill(0));
    for(let y=0;y<N;y++)for(let x=0;x<N;x++)rot[x][N-1-y]=m[y][x];
    if(!this.collides(this.piece,0,0,rot))this.piece.m=rot;
    else for(const dx of[-1,1,-2,2]){if(!this.collides(this.piece,dx,0,rot)){this.piece.m=rot;this.piece.x+=dx;break;}}
  }
  move(dx){if(!this.collides(this.piece,dx,0))this.piece.x+=dx;}
  softDrop(){if(!this.collides(this.piece,0,1)){this.piece.y++;this.score+=1;}else this.lock();this.dropCounter=0;}
  hardDrop(){let d=0;while(!this.collides(this.piece,0,1)){this.piece.y++;d++;}this.score+=d*2;this.lock();}
  lock(){this.merge();this.clearLines();this.spawn();}
  clearLines(){
    let cleared=0;
    for(let y=TETRIS_ROWS-1;y>=0;y--){if(this.board[y].every(c=>c)){this.board.splice(y,1);this.board.unshift(Array(TETRIS_COLS).fill(null));cleared++;y++;}}
    if(cleared){
      this.lines+=cleared;this.score+=[0,100,300,500,800][cleared]*this.gameLevel;
      this.gameLevel=Math.floor(this.lines/10)+1;this.dropInterval=Math.max(120,800-(this.gameLevel-1)*70);
      this.awardPoints(cleared);
    }
    this.updateStats();
  }
  awardPoints(cleared){
    const rule=pointsRule();const want=cleared*Number(rule.gamePerLine||3);
    const remain=Math.max(0,Number(rule.gameCap||60)-this.gamePoints);
    const give=Math.min(want,remain);this.gamePoints+=want;
    if(give>0){addPoints(DB.user,give);DB.save();}
  }
  start(){
    if(this.over){this.reset();}
    if(!this.piece)this.spawn();
    this.running=true;this.paused=false;this._last=0;
    const btn=$('#tetris-start');if(btn)btn.textContent='重新开始';
  }
  togglePause(){
    if(!this.running||this.over)return;
    this.paused=!this.paused;
    toast(this.paused?'已暂停':'继续游戏');
  }
  gameOver(){this.over=true;this.running=false;
    setTimeout(()=>toast(`游戏结束 · 本局得分 ${this.score}，已结算论坛积分`,'ok'),200);}
  ghostY(){let d=0;while(!this.collides(this.piece,0,d+1))d++;return this.piece.y+d;}
  update(time){
    if(!this.running||this.paused||this.over){this.draw();return;}
    if(!this.piece)return;
    if(!this._last)this._last=time;
    const dt=time-this._last;this._last=time;this.dropCounter+=dt;
    if(this.dropCounter>this.dropInterval){
      if(!this.collides(this.piece,0,1))this.piece.y++;else this.lock();
      this.dropCounter=0;
    }
    this.draw();
  }
  cell(ctx,x,y,color,ghost){
    const px=x*TETRIS_BLOCK,py=y*TETRIS_BLOCK,b=TETRIS_BLOCK;
    if(ghost){
      ctx.strokeStyle=color;ctx.globalAlpha=.35;ctx.lineWidth=2;
      ctx.strokeRect(px+2,py+2,b-4,b-4);ctx.globalAlpha=1;return;
    }
    ctx.fillStyle=color;
    roundRect(ctx,px+1,py+1,b-2,b-2,4);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.28)';
    roundRect(ctx,px+3,py+3,b-6,(b-6)/2,3);ctx.fill();
  }
  draw(){
    const ctx=this.ctx;
    ctx.fillStyle='rgba(6,12,38,.92)';ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    ctx.strokeStyle='rgba(120,140,200,.08)';ctx.lineWidth=1;
    for(let x=1;x<TETRIS_COLS;x++){ctx.beginPath();ctx.moveTo(x*TETRIS_BLOCK,0);ctx.lineTo(x*TETRIS_BLOCK,this.canvas.height);ctx.stroke();}
    for(let y=1;y<TETRIS_ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*TETRIS_BLOCK);ctx.lineTo(this.canvas.width,y*TETRIS_BLOCK);ctx.stroke();}
    for(let y=0;y<TETRIS_ROWS;y++)for(let x=0;x<TETRIS_COLS;x++)if(this.board[y][x])this.cell(ctx,x,y,this.board[y][x]);
    if(this.piece){
      const gy=this.ghostY();
      this.piece.m.forEach((row,y)=>row.forEach((v,x)=>{if(v)this.cell(ctx,this.piece.x+x,gy+y,this.piece.c,true);}));
      this.piece.m.forEach((row,y)=>row.forEach((v,x)=>{if(v&&this.piece.y+y>=0)this.cell(ctx,this.piece.x+x,this.piece.y+y,this.piece.c);}));
    }
    if(this.over||this.paused||!this.running)this.drawOverlay();
  }
  drawOverlay(){
    const ctx=this.ctx;
    ctx.fillStyle='rgba(5,10,30,.72)';ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    ctx.textAlign='center';ctx.textBaseline='middle';
    const txt=this.over?'游戏结束':this.paused?'已暂停':'点击开始';
    ctx.fillStyle='#F3F6FF';ctx.font='900 26px "Microsoft YaHei",sans-serif';
    ctx.fillText(txt,this.canvas.width/2,this.canvas.height/2-14);
    ctx.fillStyle='#A9B8E8';ctx.font='14px "Microsoft YaHei",sans-serif';
    ctx.fillText(this.over?'本局得分 '+this.score+' · 已结算积分':this.paused?'按 P 或点击暂停继续':'按方向键操作，空格硬降',this.canvas.width/2,this.canvas.height/2+20);
  }
  drawNext(){
    const ctx=this.nctx;ctx.clearRect(0,0,this.nextCanvas.width,this.nextCanvas.height);
    const m=this.next.m;const b=20;
    const offX=(this.nextCanvas.width-m[0].length*b)/2,offY=(this.nextCanvas.height-m.length*b)/2;
    m.forEach((row,y)=>row.forEach((v,x)=>{if(v){ctx.fillStyle=this.next.c;roundRect(ctx,offX+x*b+1,offY+y*b+1,b-2,b-2,4);ctx.fill();}}));
  }
  updateStats(){
    const set=(id,v)=>{const el=$('#'+id);if(el)el.textContent=v;};
    set('tetris-score',this.score);set('tetris-lines',this.lines);set('tetris-gamelevel',this.gameLevel);
  }
}
let _tetrisInstance=null;
function initTetris(){
  _tetrisInstance=new TetrisGame();
  const loop=t=>{if(_tetrisInstance){_tetrisInstance.update(t);requestAnimationFrame(loop);}};
  requestAnimationFrame(loop);
}
function tetrisAction(act){
  const g=_tetrisInstance;if(!g)return;
  if(act==='start'){
    /* 已经在进行或已结束时，点击「重新开始」都开新局 */
    if(g.running||g.over||g.piece){g.reset();}
    g.start();return;
  }
  if(act==='pause'){g.togglePause();return;}
  if(!g.running||g.paused||g.over)return;
  if(act==='left')g.move(-1);
  else if(act==='right')g.move(1);
  else if(act==='rotate')g.rotate();
  else if(act==='down')g.softDrop();
  else if(act==='drop')g.hardDrop();
}
function viewTetris(){
  if(!DB.user)return viewGate();
  const html=`<div class="p-crumb">个人 / <b>方块小游戏</b></div>
    <div class="p-panel">
      <h2>方块小游戏</h2>
      <div class="ph-sub">消除方块即可获得论坛积分（每消 1 行得分，单局积分有上限，防止刷分）</div>
      <div class="tetris-wrap">
        <div class="tetris-side">
          <div class="tetris-topbar">
            <div class="tetris-stat"><span>得分</span><b id="tetris-score">0</b></div>
            <div class="tetris-stat"><span>消行</span><b id="tetris-lines">0</b></div>
            <div class="tetris-stat"><span>速度等级</span><b id="tetris-gamelevel">1</b></div>
            <div class="tetris-next-wrap"><span>下一个</span><canvas id="tetris-next"></canvas></div>
          </div>
          <div class="tetris-side-btns">
            <button class="btn btn-orange" id="tetris-start" data-tetris="start">开始游戏</button>
            <button class="btn btn-ghost" data-tetris="pause">暂停 / 继续</button>
          </div>
        </div>
        <div class="tetris-board-wrap"><canvas id="tetris-canvas"></canvas></div>
        <div class="tetris-gamepad">
          <div class="tc-dpad">
            <button class="tc-dp tc-up" data-tetris="rotate" aria-label="旋转" type="button">▲</button>
            <button class="tc-dp tc-left" data-tetris="left" aria-label="左移" type="button">◀</button>
            <span class="tc-dp tc-hub" aria-hidden="true"></span>
            <button class="tc-dp tc-right" data-tetris="right" aria-label="右移" type="button">▶</button>
            <button class="tc-dp tc-down" data-tetris="down" aria-label="软降" type="button">▼</button>
          </div>
          <div class="tc-ab">
            <button class="tc-round tc-b" data-tetris="drop" type="button">B<span>落底</span></button>
            <button class="tc-round tc-a" data-tetris="rotate" type="button">A<span>旋转</span></button>
          </div>
        </div>
      </div>
      <div class="tetris-help">操作：方向键 ← → 移动，↑ 旋转，↓ 软降，空格 硬降，P 暂停。手机端为掌机式手柄，左侧十字键、右侧 A/B 键。</div>
    </div>`;
  return portalShell('tetris',html);
}

function router(){
  const currentHash=location.hash||'#/'; 
  const previousHash=window._lastRouteHash;
  if(previousHash)rememberCurrentView(previousHash);
  persistViewPositions();
  const routeChanged=previousHash!==currentHash;
  window._lastRouteHash=currentHash;
  const{seg,query}=parseHash();
  const r=seg[0];
  if(routeChanged&&r==='post'&&seg[1]){
    const viewed=DB.data.posts.find(x=>x.id===seg[1]);
    if(viewed){viewed.views=Math.max(0,Number(viewed.views)||0)+1;DB.save();}
  }
  const needLogin=()=>{if(!DB.user){return viewGate();}return null;};
  let html='';
  switch(r){
    case undefined: html=viewHome();break;
    case 'track': html=viewTrack(seg[1]?decodeURIComponent(seg[1]):'');break;
    case 'service': html=viewService();break;
    case 'sites': html=viewSites();break;
    case 'news': html=viewNews();break;
    case 'about': html=viewAbout();break;
    case 'author': html=viewAuthorInfo();break;
    case 'login': html=viewLogin();break;
    case 'register': html=viewRegister();break;
    case 'gate': html=viewGate();break;
    case 'cloud':{
      const g=needLogin();html=g||viewCloud();break;}
    case 'forum':{
      const g=needLogin();html=g||viewForum(seg[1]?decodeURIComponent(seg[1]):'全部',query.sort||'latest');break;}
    case 'forum-notices':{const g=needLogin();html=g||viewForumNotices(query.filter||'all');break;}
    case 'room':{
      const g=needLogin();html=g||viewRoom(seg[1]?parseInt(seg[1],10):0);break;}
    case 'workgroup':{
      const g=needLogin();html=g||(DB.level()>=2?viewWorkgroup():portalShell('workgroup',accessDenied()));break;}
    case 'oa':{
      const g=needLogin();html=g||(DB.level()>=2?viewOA(query.tab||'mine'):portalShell('oa',accessDenied()));break;}
    case 'divination':{
      const g=needLogin();html=g||viewDivination();break;}
    case 'yijing':{
      const g=needLogin();html=g||viewYijing();break;}
    case 'post':{
      const g=needLogin();html=g||viewPost(seg[1]);break;}
    case 'ask':{
      const g=needLogin();html=g||viewAsk();break;}
    case 'wanted':{const g=needLogin();html=g||viewWanted();break;}
    case 'archives':{
      const g=needLogin();html=g||viewArchives(query.q||'',query.d||'');break;}
    case 'archive':{
      const g=needLogin();html=g||viewArchive(seg[1]);break;}
    case 'network':{
      const g=needLogin();html=g||(DB.level()>=2?viewRelationshipNetwork(seg[1]||'factions'):portalShell('network-factions',accessDenied()));break;}
    case 'events':{
      const g=needLogin();html=g||viewEvents();break;}
    case 'event':{
      const g=needLogin();html=g||viewEvent(seg[1]);break;}
    case 'library':{
      const g=needLogin();html=g||viewLibrary();break;}
    case 'codex':{
      const g=needLogin();html=g||viewCodex(query.q||'');break;}
    case 'dashboard':{
      const g=needLogin();html=g||viewDashboard();break;}
    case 'staff-card':{
      const g=needLogin();html=g||(DB.level()>=2?viewStaffCard():portalShell('staff-card',accessDenied()));break;}
    case 'space':{
      const g=needLogin();html=g||viewSpace(seg[1]||'me');break;}
    case 'decorate':{
      const g=needLogin();html=g||viewDecorate();break;}
    case 'messages':{
      const g=needLogin();
      // 移动端返回列表时会带这个一次性标记；桌面端仍自动恢复最近聊天。
      let forceList=false;
      try{forceList=sessionStorage.getItem('ndt-force-list')==='1';if(forceList)sessionStorage.removeItem('ndt-force-list');}catch(e){}
      let lastChat='';
      try{lastChat=localStorage.getItem('ndt-last-chat-uid')||sessionStorage.getItem('ndt-last-chat-uid')||'';}catch(e){try{lastChat=sessionStorage.getItem('ndt-last-chat-uid')||'';}catch(e2){}}
      const lastUser=lastChat&&DB.data.users.find(u=>u.id===lastChat);
      const lastHistory=lastChat&&DB.data.chats&&DB.data.chats[lastChat]&&Array.isArray(DB.data.chats[lastChat].messages)?DB.data.chats[lastChat].messages:[];
      // 有历史对话时恢复最近聊天；首次进入、记录无效或移动端返回时显示联系人列表。
      html=g||(!forceList&&lastUser&&lastHistory.length?viewChat(lastChat):viewMessages());break;}
    case 'chat':{
      const g=needLogin();html=g||viewChat(seg[1]);break;}
    case 'friends':{
      const g=needLogin();html=g||viewFriends();break;}
    case 'settings':{
      const g=needLogin();html=g||viewSettings();break;}
    case 'ability':{
      const g=needLogin();html=g||viewAbility();break;}
    case 'tetris':{
      const g=needLogin();html=g||viewTetris();break;}
    default: html=viewHome();
  }
  $('#app').innerHTML=html;
  afterRenderInit();
  restoreSidebarScroll();
  if(r==='network')setTimeout(drawNetworkGraph,30);
  // 档案关系树为普通文档流布局，无需画布重绘
  const savedView=routeViewPositions[currentHash];
  requestAnimationFrame(()=>{
    restoreSidebarScroll();
    if(savedView){
      window.scrollTo(0,Math.max(0,Number(savedView.y)||0));
      const sc=$('#ch-scroll');
      if(sc&&savedView.chatTop!==null&&savedView.chatTop!==undefined)sc.scrollTop=Math.max(0,Number(savedView.chatTop)||0);
      else if(sc&&routeChanged)sc.scrollTop=sc.scrollHeight;
    }else{
      window.scrollTo(0,0);
      const sc=$('#ch-scroll');if(sc)sc.scrollTop=sc.scrollHeight;
    }
    persistViewPositions();
  });
  // 全局内网主动消息：登录后进入任意内网页面均可触发，不依赖是否打开论坛或聊天窗口。
  // 消息直接写入对应会话数据；若用户正在浏览其他页面，仍会累积未读数并同步侧栏红点。
  const internalRoutes=new Set(['forum','room','workgroup','oa','divination','post','ask','wanted','archives','archive','network','events','event','library','codex','dashboard','staff-card','space','decorate','messages','chat','friends','settings','ability','tetris']);
  if(routeChanged&&DB.user&&internalRoutes.has(r))setTimeout(maybeLoginProactive,0);
}

/* ==================================================================
   事件绑定（全局委托，一次注册）
   ================================================================== */
function insertAt(field,text){
  const s=field.selectionStart,e=field.selectionEnd;
  field.value=field.value.slice(0,s)+text+field.value.slice(e);
  field.selectionStart=field.selectionEnd=s+text.length;field.focus();
}
function curPostId(){const{seg}=parseHash();return seg[1];}

// 关系图节点改用长按 + 指针拖动，不再使用浏览器原生 HTML 拖放。

document.addEventListener('click',e=>{
  const t=e.target;
  const wgPageBtn=t.closest('[data-wg-page]');
  if(wgPageBtn){const wg=workgroupOf();const pages=Math.max(1,Math.ceil(wg.messages.length/CHAT_PAGE_SIZE));let page=Number(CHAT_PAGE_STATE['workgroup:main']||0);page+=wgPageBtn.dataset.wgPage==='older'?1:-1;CHAT_PAGE_STATE['workgroup:main']=Math.max(0,Math.min(pages-1,page));router();return;}
  const roomPageBtn=t.closest('[data-room-page]');
  if(roomPageBtn){const key='room:'+roomPageBtn.dataset.roomId;const room=roomsOf().find(r=>r.id===roomPageBtn.dataset.roomId);const pages=Math.max(1,Math.ceil((room?.messages||[]).length/CHAT_PAGE_SIZE));let page=Number(CHAT_PAGE_STATE[key]||0);page+=roomPageBtn.dataset.roomPage==='older'?1:-1;CHAT_PAGE_STATE[key]=Math.max(0,Math.min(pages-1,page));router();return;}
  const pageBtn=t.closest('[data-chat-page]');
  if(pageBtn){const uid=pageBtn.dataset.chatUid;const ch=chatOf(uid);const pages=Math.max(1,Math.ceil(ch.messages.length/CHAT_PAGE_SIZE));let page=Number(CHAT_PAGE_STATE[uid]||0);page+=pageBtn.dataset.chatPage==='older'?1:-1;CHAT_PAGE_STATE[uid]=Math.max(0,Math.min(pages-1,page));router();return;}
  const clearChatBtn=t.closest('[data-clear-chat]');
  if(clearChatBtn){
    const uid=clearChatBtn.dataset.clearChat;
    const person=DB.data.users.find(u=>u.id===uid);
    const label=person?person.name:'该联系人';
    modal(`<h3>清除此私信窗口？</h3><div class="m-body">只会删除你与「${esc(label)}」之间的私信，不影响其他聊天窗口、联系人或其他应用数据。<br><br>是否继续？</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm btn-orange" data-m="yes">继续</button></div>`).then(v=>{
      if(v!=='yes')return;
      modal('<h3>请再次确认</h3><div class="m-body">确定永久清除此私信窗口的全部消息吗？此操作无法撤销。</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">保留消息</button><button class="btn btn-sm btn-danger-soft" data-m="yes">确定清除此窗口</button></div>').then(v2=>{
        if(v2!=='yes')return;
        const ch=DB.data.chats[uid];if(ch){ch.messages=[];ch.unread=0;}
        delete CHAT_PAGE_STATE[uid];DB.save();router();toast('该私信窗口已清空','ok');
      });
    });return;
  }
  const clearRoomBtn=t.closest('[data-clear-room]');
  if(clearRoomBtn){
    const roomId=clearRoomBtn.dataset.clearRoom;const room=roomsOf().find(r=>r.id===roomId);
    modal(`<h3>清除此聊天室？</h3><div class="m-body">只会删除聊天室「${esc(room?.name||'当前聊天室')}」的消息，其他聊天室、成员和其他应用数据都会保留。<br><br>是否继续？</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm btn-orange" data-m="yes">继续</button></div>`).then(v=>{
      if(v!=='yes')return;
      modal('<h3>请再次确认</h3><div class="m-body">确定永久清除此聊天室的全部消息吗？此操作无法撤销。</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">保留消息</button><button class="btn btn-sm btn-danger-soft" data-m="yes">确定清除此聊天室</button></div>').then(v2=>{
        if(v2!=='yes')return;
        const target=roomsOf().find(r=>r.id===roomId);if(target){target.messages=[];target.unread=0;}
        delete CHAT_PAGE_STATE['room:'+roomId];DB.save();router();toast('该聊天室已清空','ok');
      });
    });return;
  }
  const clearWgBtn=t.closest('#wg-clear-messages');
  if(clearWgBtn){
    modal('<h3>清除工作组消息？</h3><div class="m-body">只会清空工作组中的消息，工作组成员和其他聊天窗口都会保留。<br><br>是否继续？</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm btn-orange" data-m="yes">继续</button></div>').then(v=>{
      if(v!=='yes')return;
      modal('<h3>请再次确认</h3><div class="m-body">确定永久清空工作组的全部消息吗？此操作无法撤销。</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">保留消息</button><button class="btn btn-sm btn-danger-soft" data-m="yes">确定清空工作组</button></div>').then(v2=>{
        if(v2!=='yes')return;
        const wg=workgroupOf();wg.messages=[];wg.unread=0;delete CHAT_PAGE_STATE['workgroup:main'];DB.save();router();toast('工作组消息已清空','ok');
      });
    });return;
  }
  /* ===== 云端账号 ===== */
  const cloudTab=t.closest('#cloud-tab-login,#cloud-tab-register');
  if(cloudTab){
    $('#cloud-box').innerHTML=cloudFormsHtml(cloudTab.id==='cloud-tab-login'?'login':'register');
    return;
  }
  const cloudSub=t.closest('#cf-sub');
  if(cloudSub){
    const login=$('#cf-login').value.trim();
    const pass=$('#cf-pass').value;
    const registering=!!$('#cf-name');
    const msg=$('#cloud-msg');msg.className='cloud-msg';msg.textContent='';
    cloudSub.disabled=true;
    (async()=>{
      try{
        if(registering){
          const name=$('#cf-name').value.trim();
          if(!name){msg.className='cloud-msg err';msg.textContent='请填写昵称';cloudSub.disabled=false;return;}
          await Cloud.register(login,pass,name);toast('云端账号注册成功，已登录','ok');
        }else{
          await Cloud.login(login,pass);toast('已登录云端','ok');
        }
        router();
        if(window._pollCloudNotif)window._pollCloudNotif();
      }catch(err){
        msg.className='cloud-msg err';msg.textContent=err.message;cloudSub.disabled=false;
      }
    })();
    return;
  }
  const cloudLogout=t.closest('#cloud-logout');
  if(cloudLogout){Cloud.logout();Cloud.notif={unread:0,total:0,list:[]};syncUnreadBadges();router();toast('已退出云端账号','ok');return;}
  const cloudRefresh=t.closest('#cloud-refresh');
  if(cloudRefresh){
    cloudRefresh.disabled=true;
    (async()=>{
      try{await Cloud.refresh();router();toast('云端资料已刷新','ok');}
      catch(e){toast(e.message,'err');cloudRefresh.disabled=false;}
    })();
    return;
  }
  /* 成员管理：刷新列表 */
  const cmReload=t.closest('#cm-reload');
  if(cmReload){loadCloudMod();return;}
  /* 成员管理：禁言/拉黑 */
  const cmBtn=t.closest('[data-cm]');
  if(cmBtn){
    const [action,targetId]=cmBtn.dataset.cm.split(':');
    const label={mute:'禁言',unmute:'解除禁言',ban:'拉黑',unban:'解除拉黑'}[action];
    modal(`<h3>${label}用户</h3><div class="m-body">确认对该用户执行「${label}」操作吗？</div>
      <div class="m-foot"><button class="btn btn-sm btn-ghost" data-m="no">取消</button>
      <button class="btn btn-sm btn-orange" data-m="yes">确认</button></div>`).then(async v=>{
      if(v!=='yes')return;
      try{
        await Cloud.moderateUser(targetId,action);
        toast('已'+label,'ok');loadCloudMod();
      }catch(e){toast(e.message,'err');}
    });
    return;
  }
  /* 删除账号（管理员） */
  const cmDel=t.closest('[data-cmdel]');
  if(cmDel){
    const targetId=cmDel.dataset.cmdel;
    modal(`<h3>删除账号</h3><div class="m-body">
      <p style="color:#FF6B6B;font-weight:700">此操作不可恢复！</p>
      <p>将永久删除该账号，以及其名下的全部帖子、回复、点赞和消息；他人帖子下被该账号回复的内容会一并处理。</p>
      <p>确认删除该账号吗？</p></div>
      <div class="m-foot"><button class="btn btn-sm btn-ghost" data-m="no">取消</button>
      <button class="btn btn-sm btn-orange" data-m="yes">确认删除</button></div>`).then(async v=>{
      if(v!=='yes')return;
      try{
        await Cloud.deleteUser(targetId);
        toast('账号已删除','ok');loadCloudMod();
      }catch(e){toast(e.message,'err');}
    });
    return;
  }
  /* 弹层按钮 */
  const mBtn=t.closest('[data-m]');
  if(mBtn){const mask=t.closest('.modal-mask');if(mask)mask._close(mBtn.dataset.m);return;}
  /* 网点查询：七大区切换 */
  const stb=t.closest('[data-site-tab]');
  if(stb){
    $$('[data-site-tab]').forEach(x=>x.classList.toggle('on',x===stb));
    $$('[data-site-panel]').forEach(p=>{p.hidden=p.dataset.sitePanel!==stb.dataset.siteTab;});
    return;
  }
  /* 侧边导航 */
  const si=t.closest('[data-hash]');
  if(si&&si.dataset.hash){if(location.hash===si.dataset.hash){router();}else{location.hash=si.dataset.hash;}return;}
  /* 帖子打开 */
  const op=t.closest('[data-open]');
  if(op){location.hash='#/post/'+op.dataset.open;return;}
  /* 档案 */
  const ar=t.closest('[data-arc]');
  if(ar){location.hash='#/archive/'+ar.dataset.arc;return;}
  const ev=t.closest('[data-ev]');
  if(ev){location.hash='#/event/'+ev.dataset.ev;return;}
  const libEditTarget=t.closest('[data-libedit]');
  if(libEditTarget){e.stopPropagation();const l=DB.data.library.find(x=>x.id===libEditTarget.dataset.libedit);if(l)libForm(l);return;}
  const lib=t.closest('[data-lib]');
  if(lib){toast('资料已在下方完整展示');return;}
  /* 论坛板块 / 排序 */
  const fb=t.closest('[data-b]');
  if(fb){location.hash='#/forum/'+encodeURIComponent(fb.dataset.b);return;}
  const fs=t.closest('[data-sort]');
  if(fs){const{seg}=parseHash();const b=seg[1]||'全部';location.hash='#/forum/'+b+'?sort='+fs.dataset.sort;return;}
  /* 投票 */
  const pin=t.closest('[data-pin]');
  if(pin){
    if(Cloud.connected){
      pin.disabled=true;
      (async()=>{
        try{
          const r=await Cloud.pinPost(pin.dataset.pin);
          toast(r.pinned?'帖子已置顶':'已取消置顶','ok');router();
        }catch(e){pin.disabled=false;toast(e.message,'err');}
      })();
      return;
    }
    const p=DB.data.posts.find(x=>x.id===pin.dataset.pin);
    if(p){p.pinned=p.pinned?0:1;DB.save();router();toast(p.pinned?'帖子已置顶':'已取消置顶','ok');}
    return;
  }
   const wd=t.closest('[data-wanted-del]');if(wd){const id=wd.dataset.wantedDel;modal(`<h3>撤销通缉令</h3><div class="m-body">确认撤销这条通缉令？</div><div class="m-foot"><button class="btn btn-sm btn-ghost" data-m="no">返回</button><button class="btn btn-sm btn-orange" data-m="yes">确认撤销</button></div>`).then(v=>{if(v==='yes'){DB.data.wanted=(DB.data.wanted||[]).filter(w=>w.id!==id);DB.save();router();toast('通缉令已撤销','ok');}});return;}
  const we=t.closest('[data-wanted-edit]');if(we){editWanted(we.dataset.wantedEdit);return;}
   const pv=t.closest('[data-vote]');
  if(pv){
    e.preventDefault();e.stopPropagation();
    if(Cloud.connected){
      pv.disabled=true;
      Cloud.toggleLike('post',pv.dataset.vote).then(async liked=>{
        await Cloud.refresh().catch(()=>{});
        await cloudRerender();
        toast(liked?'已赞同':'已取消赞同','ok');
      }).catch(err=>{pv.disabled=false;toast(err.message,'err');});
      return;
    }
    const p=DB.data.posts.find(x=>x.id===pv.dataset.vote);if(p&&toggleVote(p.votes)){const liked=p.votes.includes(DB.user.id);if(liked){addForumLikeNotice(p,DB.user.id);addPoints(DB.user,Number(pointsRule().like)||0);}DB.save();syncUnreadBadges();syncVoteUI('post',p.id,p.votes);toast(liked?'已赞同':'已取消赞同','ok');}return;}
  const av=t.closest('[data-avote]');
  if(av){
    e.preventDefault();e.stopPropagation();
    if(Cloud.connected){
      av.disabled=true;
      Cloud.toggleLike('reply',av.dataset.avote).then(async liked=>{
        await Cloud.refresh().catch(()=>{});
        await cloudRerender();
        toast(liked?'已赞同回答':'已取消赞同','ok');
      }).catch(err=>{av.disabled=false;toast(err.message,'err');});
      return;
    }
    const a=DB.data.answers.find(x=>x.id===av.dataset.avote);if(a&&toggleVote(a.votes)){const liked=a.votes.includes(DB.user.id);if(liked)addPoints(DB.user,Number(pointsRule().like)||0);syncVoteUI('answer',a.id,a.votes);toast(liked?'已赞同回答':'已取消赞同','ok');}return;}
  /* 装修模板 */
  const tp=t.closest('[data-tpl]');
  if(tp){const u=DB.user;u.tpl=tp.dataset.tpl;DB.save();router();return;}
  const zc=t.closest('[data-zika-color]');if(zc){const c=$('#d-zika-custom');if(c&&/^#[0-9a-f]{6}$/i.test(zc.dataset.zikaColor))c.value=zc.dataset.zikaColor;DB.user.zikaBg=zc.dataset.zikaColor;DB.save();return;}
  /* 贴纸 */
  const stk=t.closest('[data-s]');
  if(stk){const box=stk.closest('.stk-picker');const ta=box&&box.previousElementSibling?box.previousElementSibling.querySelector('textarea'):null;
    const target=ta||$('#a-body')||$('#ans-body');if(target)insertAt(target,stk.dataset.s);return;}
  /* 删好友 */
  const rm=t.closest('[data-rm]');
  if(rm){const me=DB.user;me.friends=me.friends.filter(id=>id!==rm.dataset.rm);DB.save();router();toast('已删除好友');return;}

  /* ---------- 按 ID 的操作 ---------- */
  if(t.closest('#logo-go')){
    const {seg}=parseHash();
    if(seg[0]!==undefined){location.hash='#/';return;}
    const el=window;if(!el._logoT||Date.now()-el._logoT>1500)el._logoN=0;
    el._logoT=Date.now();el._logoN=(el._logoN||0)+1;
    if(el._logoN>=5){el._logoN=0;location.hash='#/gate';toast('检测到内部入口','warn');}
    else if(el._logoN>=3)toast(`再点 ${5-el._logoN} 次……`);
    return;
  }
  if(t.closest('#tb-go')){
    const c=$('#tb-code');if(!c.value.trim()){toast('请输入运单号','warn');return;}
    location.hash='#/track/'+encodeURIComponent(c.value.trim());return;
  }
  if(t.closest('#lg-out')){Auth.logout();location.hash='#/';return;}
  if(t.closest('#p-logout')){Auth.logout();location.hash='#/'; toast('已退出论坛');return;}
  if(t.closest('#p-home')){location.hash='#/forum';return;}
  const thSet=t.closest('[data-theme-set]');
  if(thSet){DB.data.theme=thSet.dataset.themeSet;const valid=TEMPLATES[DB.data.theme]||TEMPLATES.default;if(DB.user&&!valid.some(x=>x.id===DB.user.tpl))DB.user.tpl=valid[0].id;DB.save();router();return;}
  if(t.closest('#p-space')){location.hash='#/space/me';return;}
  if(t.closest('#f-ask')){location.hash='#/ask';return;}
  if(t.closest('#bd-manage')){boardManage();return;}
  if(t.closest('#g-reg')){location.hash='#/register';return;}
  if(t.closest('#g-go')){
    const r=Auth.login($('#g-acc').value.trim(),$('#g-pwd').value);
    if(!r.ok){toast(r.msg,'err');return;}
    toast('登录成功，正在进入异人论坛','ok');enterPortal('#/forum');return;
  }
  if(t.closest('#lg-go')){
    const r=Auth.login($('#lg-acc').value.trim(),$('#lg-pwd').value);
    if(!r.ok){toast(r.msg,'err');return;}
    toast('登录成功，正在进入异人论坛','ok');enterPortal('#/forum');return;
  }
  if(t.closest('#rg-go')){
    const r=Auth.register($('#rg-name').value.trim(),$('#rg-pwd').value);
    if(!r.ok){toast(r.msg,'err');return;}
    toast('注册成功，正在进入异人论坛','ok');enterPortal('#/forum');return;
  }
  if(t.closest('#s-sub')){
    if(!$('#s-name').value.trim()||!$('#s-addr').value.trim()){toast('请填写寄件人和取件地址','warn');return;}
    toast('下单成功，快递员将尽快上门取件','ok');
    $('#s-name').value='';$('#s-addr').value='';$('#s-to').value='';return;
  }
  if(t.closest('#forum-notify-enable')){requestForumNotificationPermission();return;}
  if(t.closest('#forum-auto-settings')){openForumAutoSettings();return;}
  if(t.closest('#a-stk')){$('#a-stk-box').classList.toggle('hide');return;}
  if(t.closest('#ans-stk')){$('#ans-stk-box').classList.toggle('hide');return;}
  if(t.closest('#a-sub')){
    const title=$('#a-title').value.trim();const body=$('#a-body').value.trim();
    if(!title){toast('请填写标题','warn');return;}
    if(!body){toast('请填写内容','warn');return;}
    if(Cloud.connected){
      const btn=t.closest('#a-sub');btn.disabled=true;
      const board=$('#a-board').value;
      Cloud.createPost(board,title,body).then(async p=>{
        await Cloud.refresh().catch(()=>{});
        toast('已发布到共享论坛','ok');location.hash='#/post/'+p.id;
      }).catch(err=>{btn.disabled=false;toast(err.message,'err');});
      return;
    }
    const u=DB.user;
    const goalLikes=Math.max(0,Math.min(1000000,Number($('#a-goal-likes')?.value)||0)),goalViews=Math.max(0,Math.min(1000000,Number($('#a-goal-views')?.value)||0)),goalHours=Math.max(.1,Math.min(8760,Number($('#a-goal-hours')?.value)||24));const p={id:genId('p'),board:$('#a-board').value,pinned:0,title,content:body,authorId:u.id,createdAt:nowStr(),votes:[],views:0,simulatedLikes:0,editedBy:[],heatGoal:goalLikes||goalViews?{likes:goalLikes,views:goalViews,createdAt:Date.now(),targetAt:Date.now()+goalHours*3600000}:null};
    DB.data.posts.push(p);
    addPoints(u,Number(pointsRule().post)||0);
    const autoAdded=runForumAutoReply(p,null,`${p.title}\n${p.content}`);
    DB.save();syncUnreadBadges();toast(autoAdded?'已发布，关键词自动回复已生成':'已发布','ok');location.hash='#/post/'+p.id;return;
  }
  /* 楼中楼：打开内联回复框（顶层或子回复都落到所属楼层） */
  const rreply=t.closest('[data-rreply]');
  if(rreply){
    const targetId=rreply.dataset.rreply;
    const rootEl=t.closest('.answer');
    const box=rootEl.querySelector('.inline-reply');
    box.dataset.rtarget=targetId;
    const ta=box.querySelector('.ir-body');
    ta.placeholder='回复 @'+rreply.dataset.rname+'：';
    ta.value='';
    box.classList.remove('hide');
    ta.focus();
    return;
  }
  const rcancel=t.closest('[data-rcancel]');
  if(rcancel){
    const box=rcancel.closest('.inline-reply');
    box.classList.add('hide');box.querySelector('.ir-body').value='';
    return;
  }
  const rsub=t.closest('[data-rsub]');
  if(rsub){
    const box=rsub.closest('.inline-reply');
    const parentId=box.dataset.rtarget||rsub.dataset.rsub;
    const content=box.querySelector('.ir-body').value.trim();
    if(!content){toast('回复内容不能为空','warn');return;}
    rsub.disabled=true;
    if(Cloud.connected){
      const {seg}=parseHash();
      Cloud.reply(seg[1],content,parentId).then(async()=>{
        await Cloud.refresh().catch(()=>{});
        toast('回复已提交','ok');await cloudRerender();
      }).catch(err=>{rsub.disabled=false;toast(err.message,'err');});
      return;
    }
    const post=DB.data.posts.find(x=>x.id===curPostId());
    if(!post){toast('帖子不存在或已被删除','warn');rsub.disabled=false;return;}
    const a={id:genId('a'),postId:post.id,parentId,authorId:DB.user.id,content,createdAt:nowStr(),votes:[],editedBy:[]};
    DB.data.answers.push(a);
    addPoints(DB.user,Number(pointsRule().reply)||0);
    DB.save();router();toast('回复已提交','ok');
    return;
  }
  if(t.closest('#ans-sub')){
    const body=$('#ans-body').value.trim();
    if(!body){toast('回答内容不能为空','warn');return;}
    if(Cloud.connected){
      const btn=t.closest('#ans-sub');btn.disabled=true;
      const {seg}=parseHash();
      Cloud.reply(seg[1],body).then(async()=>{
        await Cloud.refresh().catch(()=>{});
        toast('回答已提交到共享论坛','ok');
        await cloudRerender();
      }).catch(err=>{btn.disabled=false;toast(err.message,'err');});
      return;
    }
    const u=DB.user;
    const post=DB.data.posts.find(x=>x.id===curPostId());
    if(!post){toast('帖子不存在或已被删除','warn');return;}
    const a={id:genId('a'),postId:post.id,authorId:u.id,content:body,createdAt:nowStr(),votes:[],editedBy:[]};
    DB.data.answers.push(a);
    addPoints(u,Number(pointsRule().reply)||0);
    addForumNotice(post,a);
    const autoAdded=runForumAutoReply(post,a,body);
    DB.save();syncUnreadBadges();toast(autoAdded?'回答已提交，已触发关键词自动回复':'回答已提交','ok');router();return;
  }
  if(t.closest('#p-vote')){
    e.preventDefault();e.stopPropagation();const p=DB.data.posts.find(x=>x.id===curPostId());if(p&&toggleVote(p.votes)){const liked=p.votes.includes(DB.user.id);if(liked){addForumLikeNotice(p,DB.user.id);addPoints(DB.user,Number(pointsRule().like)||0);}DB.save();syncUnreadBadges();syncVoteUI('post',p.id,p.votes);toast(liked?'已赞同':'已取消赞同','ok');}return;}
  if(t.closest('#p-edit')){
    const p=DB.data.posts.find(x=>x.id===curPostId());
    modal(`<h3>编辑帖子</h3><div class="m-body">
      <label class="fl">发帖人姓名</label><input class="field" id="m-author" value="${esc(postAuthor(p))}">
      <div style="display:flex;gap:10px"><div style="flex:1"><label class="fl">浏览数</label><input class="field" id="m-views" type="number" value="${p.views||0}"></div>
      <div style="flex:1"><label class="fl">赞同数</label><input class="field" id="m-votes" type="number" value="${p.votes.length}"></div></div>
      <label class="fl">帖子正文</label>
      <textarea class="field" id="m-edit" style="min-height:180px">${esc(p.content)}</textarea></div>
      <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">保存修改</button></div>`)
      .then(v=>{if(v==='yes'){
        p.authorName=$('#m-author').value.trim();
        p.views=Math.max(0,parseInt($('#m-views').value)||0);
        setVoteCount(p.votes,$('#m-votes').value);
        p.content=$('#m-edit').value;recordEdit(p);DB.save();router();toast('已保存修改','ok');}});
    return;
  }
  if(t.closest('#p-del')){
    if(Cloud.connected){
      const postId=curPostId();
      modal(`<h3>删除帖子</h3><div class="m-body">将同时删除该帖下全部回答，确定吗？此操作无法恢复。</div>
        <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm btn-orange" data-m="yes">确定删除</button></div>`)
        .then(async v=>{if(v==='yes'){
          try{
            await Cloud.deletePost(postId);
            await Cloud.refresh().catch(()=>{});
            toast('帖子已删除','ok');location.hash='#/forum';
          }catch(err){toast(err.message,'err');}}});
      return;
    }
    const p=DB.data.posts.find(x=>x.id===curPostId());
    modal(`<h3>删除帖子</h3><div class="m-body">将同时删除该帖下全部回答，确定吗？</div>
      <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">确定删除</button></div>`)
      .then(v=>{if(v==='yes'){
        DB.data.posts=DB.data.posts.filter(x=>x.id!==p.id);
        DB.data.answers=DB.data.answers.filter(a=>a.postId!==p.id);
        DB.save();location.hash='#/forum';toast('帖子已删除','ok');}});
    return;
  }
  const adel=t.closest('[data-adel]');
  if(adel){
    if(Cloud.connected){
      modal(`<h3>删除回答</h3><div class="m-body">确定删除这条回答吗？此操作无法恢复。</div>
        <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm btn-orange" data-m="yes">确定删除</button></div>`)
        .then(async v=>{if(v==='yes'){
          try{
            await Cloud.deleteReply(adel.dataset.adel);
            await Cloud.refresh().catch(()=>{});
            await cloudRerender();toast('回答已删除','ok');
          }catch(err){toast(err.message,'err');}}});
      return;
    }
    const a=DB.data.answers.find(x=>x.id===adel.dataset.adel);
    modal(`<h3>删除回答</h3><div class="m-body">确定删除这条回答吗？</div>
      <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">确定删除</button></div>`)
      .then(v=>{if(v==='yes'){
        DB.data.answers=DB.data.answers.filter(x=>x.id!==a.id);
        DB.save();router();toast('回答已删除','ok');}});
    return;
  }
  const ae=t.closest('[data-aedit]');
  if(ae){
    const a=DB.data.answers.find(x=>x.id===ae.dataset.aedit);
    modal(`<h3>编辑回答</h3><div class="m-body">
      <label class="fl">回复人姓名</label><input class="field" id="m-author" value="${esc(ansAuthor(a))}">
      <label class="fl">赞同数</label><input class="field" id="m-votes" type="number" value="${a.votes.length}">
      <label class="fl">回答内容</label>
      <textarea class="field" id="m-edit" style="min-height:150px">${esc(a.content)}</textarea></div>
      <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">保存修改</button></div>`)
      .then(v=>{if(v==='yes'){
        a.authorName=$('#m-author').value.trim();
        setVoteCount(a.votes,$('#m-votes').value);
        a.content=$('#m-edit').value;recordEdit(a);DB.save();router();toast('已保存修改','ok');}});
    return;
  }
  if(t.closest('#ar-go')){
    const q=$('#ar-q').value.trim();const d=$('#ar-d').value;
    location.hash='#/archives?'+new URLSearchParams({q,d}).toString();return;
  }
  if(t.closest('#ar-apply')){toast('调阅申请已提交，等待管理员审批','warn');return;}

  /* 事件编辑 */
  if(t.closest('#ev-edit')){
    const{seg}=parseHash();const e=DB.data.events.find(x=>x.id===seg[1]);
    eventForm(e);return;
  }
  /* 资料编辑已在资料卡片点击拦截前处理 */
  /* 档案编辑 */
  if(t.closest('#arc-edit')){
    const{seg}=parseHash();const r=DB.data.archives.find(x=>x.id===seg[1]);
    archiveForm(r);return;
  }
  if(t.closest('#arc-new')){
    archiveForm({id:'',code:'',name:'',gender:'',faction:'',skill:'',danger:'B',status:'观察',sec:2,aliases:'',note:''});return;
  }
  if(t.closest('#ev-new')){
    eventForm({id:'',year:'',date:'',title:'',loc:'',sec:1,hot:0,content:''});return;
  }
  if(t.closest('#lib-new')){
    libForm({id:'',cat:'',title:'',sec:1,content:''});return;
  }
  if(t.closest('#codex-new')){codexForm();return;}
  const ce=t.closest('[data-codex-edit]');if(ce){const x=(DB.data.publicLibrary||[]).find(y=>y.id===ce.dataset.codexEdit);if(x)codexForm(x);return;}
  const cd=t.closest('[data-codex-del]');if(cd){const x=(DB.data.publicLibrary||[]).find(y=>y.id===cd.dataset.codexDel);if(x){confirmDlg('移除典藏条目','确定从异闻典藏中移除此条目？').then(ok=>{if(ok){DB.data.publicLibrary=DB.data.publicLibrary.filter(y=>y.id!==x.id);DB.save();router();toast('条目已移除');}});}return;}
  if(t.closest('[data-codex-save]')){const mask=t.closest('.modal-mask');if(mask)mask._close('yes');return;}
  if(t.closest('#codex-search')){e.preventDefault();location.hash='#/codex?q='+encodeURIComponent($('#codex-q').value.trim());return;}
  if(t.closest('#sp-add')){
    const{seg}=parseHash();const me=DB.user;
    if(me.friends.includes(seg[1])){toast('已经是好友了');return;}
    me.friends.push(seg[1]);DB.save();router();toast('好友申请已通过','ok');return;
  }
  if(t.closest('#sc-save')){
    const u=DB.user;
    if(!u||u.level<2){toast('仅员工和管理员可以编辑专属名片','warn');return;}
    u.staffCard={
      displayName:$('#sc-name').value.trim(),
      employeeNo:$('#sc-no').value.trim(),
      department:$('#sc-dept').value.trim(),
      position:$('#sc-position').value.trim(),
      rank:$('#sc-rank').value.trim(),
      joinDate:$('#sc-date').value.trim(),
      workStatus:$('#sc-status').value.trim(),
      contact:$('#sc-contact').value.trim(),
      specialty:$('#sc-specialty').value.trim(),
      profile:$('#sc-profile').value.trim(),
      motto:$('#sc-motto').value.trim()
    };
    DB.save();router();toast('专属名片已保存','ok');return;
  }
  if(t.closest('#sc-cancel')){router();toast('已放弃本次修改');return;}
  if(t.closest('#d-save')){
    const u=DB.user;
    const nm=$('#d-name').value.trim();
    if(!nm){toast('昵称不能为空','warn');return;}
    u.name=nm;u.bio=$('#d-bio').value.trim();u.notice=$('#d-notice').value.trim();u.coverImg=$('#d-cover-url')?.value.trim()||u.coverImg||'';u.zikaBg=$('#d-zika-custom')?.value||u.zikaBg||'';u.avatarBorder=$('#d-avatar-border')?.value||'none';u.nameColor=$('#d-name-color')?.value||'var(--pt-text)';
    const url=$('#d-av-url').value.trim();
    if(url&&url.startsWith('http'))u.avatar=url;
    DB.save();toast('装修已保存','ok');location.hash='#/space/me';return;
  }
  if(t.closest('#fr-add')){
    const id=$('#fr-sel').value;const me=DB.user;
    if(!me.friends.includes(id))me.friends.push(id);DB.save();router();toast('已添加好友','ok');return;
  }

  /* ---------- 帖子消息中心：只处理论坛帖子通知，不混入私聊/工作组 ---------- */
  /* ---------- 云端消息操作 ---------- */
  const cnRead=t.closest('[data-cn-read]');
  if(cnRead&&Cloud.connected){
    Cloud.readNotifications(cnRead.dataset.cnRead).then(async()=>{
      await Cloud.pollNotifications();syncUnreadBadges();router();
    }).catch(e=>toast(e.message,'err'));
    return;
  }
  if(t.closest('#fnc-read-all')&&Cloud.connected){
    Cloud.readNotifications().then(async()=>{
      await Cloud.pollNotifications();syncUnreadBadges();router();toast('已全部标为已读','ok');
    }).catch(e=>toast(e.message,'err'));
    return;
  }
  if(t.closest('#fnc-clear-read')&&Cloud.connected){
    Cloud.clearReadNotifications().then(async()=>{
      await Cloud.pollNotifications();syncUnreadBadges();router();toast('已清理已读消息','ok');
    }).catch(e=>toast(e.message,'err'));
    return;
  }
  const cnOpen=t.closest('[data-cn-open]');
  if(cnOpen&&Cloud.connected){
    /* 静默标记已读，随后由 <a> 默认跳转帖子 */
    Cloud.readNotifications(cnOpen.dataset.cnOpen).then(async()=>{
      await Cloud.pollNotifications();syncUnreadBadges();
    }).catch(()=>{});
    return;
  }
  const markOne=t.closest('[data-fnc-read]');
  if(markOne){const n=(DB.data.forumNotices||[]).find(x=>x.id===markOne.dataset.fncRead&&x.userId===DB.user.id);if(n)n.read=true;DB.save();syncUnreadBadges();router();return;}
  if(t.closest('#fnc-read-all')){(DB.data.forumNotices||[]).forEach(n=>{if(n.userId===DB.user.id)n.read=true;});DB.save();syncUnreadBadges();router();toast('帖子消息已全部标为已读','ok');return;}
  if(t.closest('#fnc-clear-read')){DB.data.forumNotices=(DB.data.forumNotices||[]).filter(n=>n.userId!==DB.user.id||!n.read);DB.save();syncUnreadBadges();router();toast('已清理已读的帖子消息','ok');return;}
  const fncOpen=t.closest('[data-fnc-open]');
  if(fncOpen){const n=(DB.data.forumNotices||[]).find(x=>x.id===fncOpen.dataset.fncOpen&&x.userId===DB.user.id);if(n&&!n.read){n.read=true;DB.save();syncUnreadBadges();}return;}
  const pinChat=t.closest('[data-chat-pin]');
  if(pinChat){const id=pinChat.dataset.chatPin;const ch=chatOf(id);ch.pinned=!ch.pinned;DB.save();router();toast(ch.pinned?'联系人已置顶':'已取消置顶','ok');return;}

  /* ---------- 私信 / 群聊 ---------- */
  const openChat=t.closest('[data-chat]');
  if(openChat){location.hash='#/chat/'+openChat.dataset.chat;return;}
  if(t.closest('#msg-open')){
    const id=$('#msg-new').value;if(!id){toast('请先选择一个用户','warn');return;}
    location.hash='#/chat/'+id;return;
  }
  /* 群聊：成员管理 */
  const curRoom=activeRoom();
  if(t.closest('#rm-members')){roomMembers(curRoom);return;}
  if(t.closest('#rm-cfg-open')){openRoomCfg();return;}
  /* 群聊：TA 发言下拉 */
  if(t.closest('#rm-speak')){speakPop(t.closest('#rm-speak'),curRoom);return;}
  /* 群聊：发送 */
  if(t.closest('#rm-send')){sendRoom(curRoom);return;}
  /* 群聊：点成员头像，TA 发言一条 */
  const roomAv=t.closest('[data-room-av]');
  if(roomAv){roomSpeak(curRoom,roomAv.dataset.roomAv);return;}
  /* 聊天室：切换 / 新建 / 改名 */
  const roomTab=t.closest('[data-room-tab]');
  if(roomTab){location.hash='#/room/'+roomTab.dataset.roomTab;return;}
  if(t.closest('#wanted-add')){editWanted('new');return;}
  if(t.closest('#room-add')){
    const rooms=roomsOf();
    if(rooms.length<3){rooms.push(makeRoom('聊天室'+(rooms.length+1)));DB.save();location.hash='#/room/'+(rooms.length-1);}
    return;
  }
  if(t.closest('#rm-rename')){
    const nm=prompt('聊天室名称',curRoom.name);
    if(nm&&nm.trim()){curRoom.name=nm.trim().slice(0,20);DB.save();router();}
    return;
  }
  /* 语音/文字切换（私聊/群聊） */
  if(t.closest('#rm-voice-toggle')){toggleVoice('rm');return;}
  if(t.closest('#ch-voice-toggle')){toggleVoice('ch');return;}
  /* 让私聊对方回复一条 */
  const themAv=t.closest('[data-them-av]');
  if(themAv||t.closest('#ch-avatar')||t.closest('#ch-add-them')){
    const{seg}=parseHash();themReply(seg[1]);return;
  }
  /* 问号提示 */
  if(t.closest('#ch-hint')||t.closest('#msg-hint')){chatHint();return;}
  /* 发送私聊消息 */
  if(t.closest('#ch-send')){
    const{seg}=parseHash();sendChat(seg[1]);return;
  }

  /* ---------- 字卡 / 模式配置 ---------- */
  const modeBtn=t.closest('[data-mode]');
  if(modeBtn){
    const cfg=modeBtn.closest('.card-cfg');
    const box=cfg.id==='rm-cfg'?activeRoom():(cfg.id==='wg-cfg'?workgroupOf():chatOf(parseHash().seg[1]));
    box.mode=modeBtn.dataset.mode;
    cfg.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('on',b===modeBtn));
    const cardWrap=cfg.querySelector('.card-only');
    if(cardWrap)cardWrap.style.display=box.mode==='card'?'inline-flex':'none';
    if(box.mode==='card'){
      const speed=cfg.querySelector('select');if(speed)box.speed=speed.value;
      const proactive=cfg.querySelector('[id$="-proactive"]');if(proactive)box.proactive=proactive.checked;
    }
    DB.save();
    // 抽屉内切换模式时保持面板打开（卡片设置区的显隐已在上面实时更新）。
    return;
  }
  if(t.closest('#rm-cards')){
    /* 群聊字卡：选成员管理 */
    const room=activeRoom();
    const ids=room.members.filter(id=>id!==DB.user.id);
    const list=ids.length?ids:DB.data.users.filter(u=>u.id!==DB.user.id).map(u=>u.id);
    if(!list.length){toast('先添加成员','warn');return;}
    const mask=openMask(`<h3>选择要管理字卡的成员</h3><div class="m-body">
      ${list.map(id=>{const u=userOfId(id);return `<div class="mem-row" data-pickcard="${id}" style="cursor:pointer">
        <span class="av" style="width:30px;height:30px;font-size:12px">${avatarHtml32(u)}</span>
        <span>${esc(u?u.name:'?')}</span></div>`;}).join('')}
      <div style="display:flex;margin-top:10px"><button class="btn btn-sm btn-ghost" id="pc-cancel" style="margin-left:auto">取消</button></div></div>`);
    mask.querySelector('#pc-cancel').addEventListener('click',()=>mask.remove());
    mask.addEventListener('click',e=>{const r=e.target.closest('[data-pickcard]');if(r){mask.remove();cardManager(r.dataset.pickcard);}});
    return;
  }
  if(t.closest('#ch-cards')){
    cardManager(parseHash().seg[1]);return;
  }
  /* 微信式输入：表情面板 / ＋ 面板开关 */
  const emojiToggle=t.closest('[data-emoji-toggle]');
  if(emojiToggle){toggleChatPanel(emojiToggle.dataset.emojiToggle,'emoji');return;}
  const plusToggle=t.closest('[data-plus-toggle]');
  if(plusToggle){toggleChatPanel(plusToggle.dataset.plusToggle,'plus');return;}
  /* 微信式输入：＋ 面板动作（红包/转账/表情/语音） */
  const plusAct=t.closest('[data-plus-act]');
  if(plusAct){
    const row=plusAct.closest('.chat-input-row');
    const prefix=row.dataset.prefix;
    const act=plusAct.dataset.plusAct;
    const target=chatTargetFromPrefix(prefix);
    closeChatPanels(prefix);
    if(act==='redpacket'){moneyDialog(target,'redpacket');return;}
    if(act==='transfer'){moneyDialog(target,'transfer');return;}
    if(act==='emoji'){toggleChatPanel(prefix,'emoji');return;}
    if(act==='voice'){toggleVoice(prefix);return;}
    return;
  }
  /* 表情面板：点表情插入文本框 */
  const emojiInsert=t.closest('[data-emoji-insert]');
  if(emojiInsert){
    const row=emojiInsert.closest('.chat-input-row');
    insertAt(row.querySelector('textarea'),emojiInsert.dataset.emojiInsert);
    syncChatSendState(row.dataset.prefix);
    return;
  }
  /* 表情面板：退格删除 */
  const emojiBack=t.closest('[data-emoji-backspace]');
  if(emojiBack){
    const row=emojiBack.closest('.chat-input-row');
    const ta=row.querySelector('textarea');
    const s=ta.selectionStart,e=ta.selectionEnd;
    if(s===e&&s>0){ta.value=ta.value.slice(0,s-1)+ta.value.slice(e);ta.selectionStart=ta.selectionEnd=s-1;}
    else if(s!==e){ta.value=ta.value.slice(0,s)+ta.value.slice(e);ta.selectionStart=ta.selectionEnd=s;}
    ta.focus();syncChatSendState(row.dataset.prefix);
    return;
  }
  const timeEdit=t.closest('[data-timeedit]');
  if(timeEdit){editMessageTime(JSON.parse(timeEdit.dataset.timeedit));return;}
  const moneyOpen=t.closest('[data-rpopen],[data-tfopen]');
  if(moneyOpen){
    const id=moneyOpen.dataset.rpopen||moneyOpen.dataset.tfopen;
    const all=[...roomsOf().flatMap(r=>r.messages),...Object.values(DB.data.chats).flatMap(c=>c.messages),...(DB.data.workgroup?.messages||[])];
    const m=all.find(x=>x.id===id);
    if(m)moneyDetailDialog(m,moneyOpen.dataset.rpopen?'redpacket':'transfer');
    return;
  }
  const yjm=t.closest('[data-yj-method]');
  if(yjm){DB.data.yijing={method:yjm.dataset.yjMethod,throws:[]};DB.save();router();return;}
  const classicSearch=t.closest('#yj-classic-search');
  if(classicSearch){const q=(document.getElementById('yj-classic-query')?.value||'').trim();const box=document.getElementById('yj-classic-results');if(box){const rows=yjClassicSearch(q).slice(0,24);box.innerHTML=rows.length?`<div class="yj-classic-hitlist">${rows.map(x=>`<button class="yj-index-item" data-yj-classic-pick="${esc(x.name)}"><small>${String(x.no).padStart(2,'0')}</small><span>${esc(x.name)}</span></button>`).join('')}</div><div id="yj-classic-detail">${q&&rows.length===1?yjClassicMarkup(rows[0].name):'<p class="yj-classic-status">选择卦名查看本地原文。</p>'}</div>`:'<p>没有找到匹配的卦名或已收录原文。</p>';}return;}
  const classicPick=t.closest('[data-yj-classic-pick]');
  if(classicPick){const detail=document.getElementById('yj-classic-detail');if(detail)detail.innerHTML=yjClassicMarkup(classicPick.dataset.yjClassicPick);return;}
  const classicInput=t.closest('#yj-classic-query');
  if(classicInput&&e.key==='Enter'){document.getElementById('yj-classic-search')?.click();return;}
  const yji=t.closest('[data-yj-index]');
  if(yji){const bits=YJ_GUA[Number(yji.dataset.yjIndex)];DB.data.yijing={...(DB.data.yijing||{}),hex:{no:Number(yji.dataset.yjIndex)+1,name:YJ_NAMES[Number(yji.dataset.yjIndex)],bits},changed:null,moving:[],method:DB.data.yijing?.method||'liuyao'};DB.save();router();return;}
  if(t.closest('#yj-reset')){DB.data.yijing={method:'liuyao',throws:[]};DB.save();router();return;}
  if(t.closest('#yj-throw')){
    const rec=DB.data.yijing||{method:'liuyao',throws:[]};let throws=Array.isArray(rec.throws)?rec.throws.slice():[];
    if(throws.length>=6)throws=[];
    const v=[6,7,8,9][Math.floor(Math.random()*4)];throws.push(v);
    const next={method:'liuyao',throws};
    if(throws.length===6){const bits=throws.map(x=>x===7||x===9?1:0),moving=throws.map((x,i)=>(x===6||x===9)?i:-1).filter(i=>i>=0),changedBits=bits.map((b,i)=>moving.includes(i)?1-b:b);next.hex=yjFind(bits);next.changed=yjFind(changedBits);next.moving=moving;}
    DB.data.yijing=next;DB.save();router();return;
  }
  if(t.closest('#yj-calc-meihua')){
    const a=Math.abs(parseInt($('#yj-a')?.value,10)||1),b=Math.abs(parseInt($('#yj-b')?.value,10)||1),c=Math.abs(parseInt($('#yj-c')?.value,10)||1);
    const tri=n=>YJ_TRIGRAMS[(n-1)%8].bits;
    const upper=tri(a),lower=tri(b),bits=[...lower,...upper],moving=[(c-1)%6],changedBits=bits.map((v,i)=>i===moving[0]?1-v:v);
    DB.data.yijing={method:'meihua',a,b,c,hex:yjFind(bits),changed:yjFind(changedBits),moving};DB.save();router();return;
  }
  /* 抽签 */
  if(t.closest('#div-draw')){
    const f=pick(FORTUNES);
    const result={g:f.g,poem:f.poem,mean:f.mean,color:(FORTUNE_GRADES.find(x=>x.g===f.g)||{}).c||'#E8874A'};
    DB.data.divination={date:todayStr(),result};DB.save();router();return;
  }
  /* OA */
  if(t.closest('#oa-task')){oaForm('task');return;}
  if(t.closest('#oa-leave')){oaForm('leave');return;}
  const oaTab=t.closest('[data-oatab]');
  if(oaTab){location.hash='#/oa?tab='+oaTab.dataset.oatab;return;}
  const oaAp=t.closest('[data-oaap]');
  if(oaAp){
    const[st,id]=oaAp.dataset.oaap.split(':');
    const x=DB.data.oa.find(y=>y.id===id);
    if(x){x.status=st;x.reviewedAt=Date.now();
      if(st==='rejected'){
        const note=prompt('驳回意见（可留空）','');if(note!==null)x.reviewNote=note;
      }else{x.reviewNote='同意';}
      DB.save();router();toast(st==='approved'?'已批准申请，申请人下次进入 OA 会看到提醒':'已驳回申请，申请人下次进入 OA 会看到提醒',st==='approved'?'ok':'warn');}
    return;
  }
  const oaDel=t.closest('[data-oadel]');
  if(oaDel){
    DB.data.oa=DB.data.oa.filter(y=>y.id!==oaDel.dataset.oadel);
    DB.save();router();toast('已删除');return;
  }
  /* 工作组 */
  if(t.closest('#wg-cards')){openWorkgroupCardManager();return;}
  if(t.closest('#wg-members')){groupMembers(workgroupOf(),'工作组');return;}
  if(t.closest('#wg-cfg-open')){openWgCfg();return;}
  if(t.closest('#wg-speak')){groupSpeakPop(t.closest('#wg-speak'),workgroupOf(),'workgroup');return;}
  const wgAv=t.closest('[data-wg-av]');
  if(wgAv){groupSpeak(workgroupOf(),wgAv.dataset.wgAv);return;}
  if(t.closest('#wg-send')){
    const ta=$('#wg-text');const text=ta&&ta.value.trim();
    if(!text){toast('请输入内容','warn');return;}
    if(!DB.user||DB.user.level<2){toast('工作组仅对员工和管理员开放','warn');return;}
    if(!workgroupOf().members.includes(DB.user.id))workgroupOf().members.push(DB.user.id);
    commitOutgoingMessage({kind:'workgroup'},{id:genId('m'),uid:DB.user.id,type:'text',text,at:nowStr()});
    return;
  }
  /* 员工关系网缩放：只改变显示比例，不修改节点坐标和关系数据 */
  const zoomBtn=t.closest('[data-net-zoom]');
  if(zoomBtn){const wrap=document.querySelector('.network-graph-wrap');if(wrap){const key=wrap.dataset.networkKey||'factions',cur=Math.max(.45,Math.min(1.6,Number((window._ndtNetworkZoom||{})[key])||1));const action=zoomBtn.dataset.netZoom;window._ndtNetworkZoom=window._ndtNetworkZoom||{};window._ndtNetworkZoom[key]=action==='reset'?1:Math.max(.45,Math.min(1.6,cur+(action==='in'?.1:-.1)));const before={left:wrap.scrollLeft,top:wrap.scrollTop};if(typeof window.drawNetworkGraph==='function')window.drawNetworkGraph();requestAnimationFrame(()=>{wrap.scrollLeft=before.left;wrap.scrollTop=before.top;});}return;}
  /* 员工关系网 */
  if(t.closest('#net-add-node')){networkAddNode();return;}
  if(t.closest('#net-add-edge')){networkAddEdge();return;}
  const netEdit=t.closest('[data-net-nodeedit]');if(netEdit){networkEditNode(netEdit.dataset.netNodeedit);return;}
  const netEdgeDel=t.closest('[data-net-edgedel]');
  if(netEdgeDel){const {net}=activeNetwork();if(net){net.edges=net.edges.filter(e=>e.id!==netEdgeDel.dataset.netEdgedel);DB.save();router();toast('连线已移除');}return;}
  const netNodeDel=t.closest('[data-net-nodedel]');
  if(netNodeDel){const {net}=activeNetwork();const node=net&&net.nodes.find(n=>n.id===netNodeDel.dataset.netNodedel);if(net&&node){net.nodes=net.nodes.filter(n=>n.id!==node.id);net.edges=net.edges.filter(e=>e.from!==node.id&&e.to!==node.id);DB.save();router();toast('节点与相关连线已移除');}return;}

  /* 关系树 */
  const relOpen=t.closest('[data-relopen]');
  if(relOpen){location.hash='#/archive/'+relOpen.dataset.relopen;return;}
  const relMove=t.closest('[data-relmove]');
  if(relMove){const r=DB.data.archives.find(x=>x.id===parseHash().seg[1]);const idx=Number(relMove.dataset.relmove),rel=r?.rels?.[idx];if(r&&rel){rel.layout=relMove.dataset.relDir;DB.save();router();toast('关系树排布已调整','ok');}return;}
  const relEdit=t.closest('[data-reledit]');
  if(relEdit){const r=DB.data.archives.find(x=>x.id===parseHash().seg[1]);if(r)editArchiveRelation(r,parseInt(relEdit.dataset.reledit,10));return;}
  const relDel=t.closest('[data-reldel]');
  if(relDel){
    const r=DB.data.archives.find(x=>x.id===parseHash().seg[1]);
    if(r&&Array.isArray(r.rels)){const idx=parseInt(relDel.dataset.reldel,10),item=r.rels[idx];if(item&&item.linkedId){for(const a of DB.data.archives){if(Array.isArray(a.rels))a.rels=a.rels.filter(x=>x.id!==item.linkedId);}}r.rels.splice(idx,1);DB.save();router();toast('关系已断开','ok');}
    return;
  }
  if(t.closest('#rel-add-btn')){
    const r=DB.data.archives.find(x=>x.id===parseHash().seg[1]);
    if(r)addRelation(r);
    return;
  }

  /* 取消引用 */
  if(t.closest('#quote-cancel')){window._quote=null;router();return;}
  /* 点气泡：编辑（长按已弹菜单时抑制） */
  const bubble=t.closest('[data-msgctx]');
  if(bubble){
    if(window._longPressed){window._longPressed=false;return;}
    editMsg(JSON.parse(bubble.dataset.msgctx));return;
  }
  if(t.closest('#set-act')){
    const r=Auth.activate($('#set-code').value);
    toast(r.msg,r.ok?'ok':'err');if(r.ok){$('#set-code').value='';router();}return;
  }
  if(t.closest('#set-export')){
    const blob=new Blob([JSON.stringify(DB.data,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='nadutong-data.json';a.click();
    URL.revokeObjectURL(a.href);toast('数据已导出','ok');return;
  }
  if(t.closest('#set-reset')){
    modal(`<h3>重置数据</h3><div class="m-body">将清空当前所有本地数据（帖子、账号、好友等）并恢复为初始内容，确定吗？</div>
      <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">确定重置</button></div>`)
      .then(v=>{if(v==='yes'){DB.reset();router();toast('数据已重置','ok');}});
    return;
  }

  /* ---------- V16 个人能力详情 ---------- */
  if(t.closest('#ab-save')){
    collectAbilityEdits();DB.save();toast('能力档案已保存','ok');router();return;
  }
  if(t.closest('#ab-cancel')){router();toast('已放弃本次修改');return;}
  if(t.closest('#ab-share')){
    collectAbilityEdits();DB.save();toast('正在生成分享图…');
    buildAbilityShare(DB.user).then(dataUrl=>{
      modal(`<h3>能力档案分享图</h3><div class="m-body" style="text-align:center">
        <img src="${dataUrl}" style="width:100%;max-width:330px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.25)"></div>
        <div class="m-foot"><a class="btn btn-orange" id="ab-share-dl" download="异人能力档案.jpg">保存图片</a>
        <button class="btn btn-ghost btn-sm" data-m="no">关闭</button></div>`);
      const dl=$('#ab-share-dl');if(dl)dl.href=dataUrl;
    });
    return;
  }
  const fieldAdd=t.closest('#ab-field-add');
  if(fieldAdd){collectAbilityEdits();const a=abilityOf(DB.user);a.fields.push('字段'+a.fields.length);a.rows.forEach(r=>r.v.push(''));DB.save();router();return;}
  const fieldDel=t.closest('[data-field-del]');
  if(fieldDel){const fi=+fieldDel.dataset.fieldDel;collectAbilityEdits();const a=abilityOf(DB.user);
    if(a.fields.length<=1){toast('至少保留一列','warn');return;}
    a.fields.splice(fi,1);a.rows.forEach(r=>r.v.splice(fi,1));DB.save();router();return;}
  const rowAdd=t.closest('#ab-row-add');
  if(rowAdd){collectAbilityEdits();const a=abilityOf(DB.user);a.rows.push({v:a.fields.map(()=>'')});DB.save();router();return;}
  const rowDel=t.closest('[data-row-del]');
  if(rowDel){const ri=+rowDel.dataset.rowDel;collectAbilityEdits();const a=abilityOf(DB.user);a.rows.splice(ri,1);DB.save();router();return;}

  /* ---------- V16 方块小游戏 ---------- */
  const tetrisBtn=t.closest('[data-tetris]');
  if(tetrisBtn){tetrisAction(tetrisBtn.dataset.tetris);return;}

  /* ---------- V16 论坛等级配置 ---------- */
  if(t.closest('#lv-cfg-save')){
    const rule=pointsRule();
    for(const k of ['post','reply','like','gamePerLine','gameCap']){
      const el=document.getElementById('prg-'+k);if(el)rule[k]=Math.max(0,Number(el.value)||0);
    }
    const levels=forumLevels();
    $$('[data-lcfg-name]').forEach(el=>{const i=+el.dataset.lcfgName;levels[i].name=el.value.trim()||('Lv'+(i+1));});
    $$('[data-lcfg-min]').forEach(el=>{const i=+el.dataset.lcfgMin;levels[i].min=Math.max(0,Number(el.value)||0);});
    /* 保证阈值非递减 */
    for(let i=1;i<levels.length;i++)levels[i].min=Math.max(Number(levels[i-1].min)||0,Number(levels[i].min)||0);
    DB.save();router();toast('论坛等级配置已保存','ok');return;
  }
  if(t.closest('#lv-cfg-reset')){
    DB.data.forumLevels=DEFAULT_FORUM_LEVELS.map(x=>({...x}));
    DB.data.pointsRule={...DEFAULT_POINTS_RULE};
    DB.save();router();toast('已恢复默认等级配置','ok');return;
  }
  /* 个人空间内：打开等级管理 */
  if(t.closest('#sp-lv-manage')){openSpaceLevelManage();return;}
  if(t.closest('#spv-save')){
    const rule=pointsRule();
    $$('[data-spv-rule]').forEach(el=>{rule[el.dataset.spvRule]=Math.max(0,Number(el.value)||0);});
    const levels=forumLevels();
    $$('[data-spv-name]').forEach(el=>{const i=+el.dataset.spvName;levels[i].name=el.value.trim()||('Lv'+(i+1));});
    $$('[data-spv-min]').forEach(el=>{const i=+el.dataset.spvMin;levels[i].min=Math.max(0,Number(el.value)||0);});
    for(let i=1;i<levels.length;i++)levels[i].min=Math.max(Number(levels[i-1].min)||0,Number(levels[i].min)||0);
    DB.save();
    const mask=t.closest('.modal-mask');if(mask)mask._close('save');
    router();toast('论坛等级配置已保存','ok');return;
  }
  if(t.closest('#spv-reset')){
    DB.data.forumLevels=DEFAULT_FORUM_LEVELS.map(x=>({...x}));
    DB.data.pointsRule={...DEFAULT_POINTS_RULE};
    const mask=t.closest('.modal-mask');if(mask)mask._close('reset');
    DB.save();router();toast('已恢复默认等级配置','ok');return;
  }
});

/* 收集能力编辑区当前内容到数据模型 */
function collectAbilityEdits(){
  const a=abilityOf(DB.user);
  $$('[data-radar-label]').forEach(el=>{const i=+el.dataset.radarLabel;a.radar.labels[i]=el.value.trim()||('属性'+(i+1));});
  $$('[data-radar-val]').forEach(el=>{const i=+el.dataset.radarVal;a.radar.values[i]=Math.max(0,Math.min(100,Number(el.value)||0));});
  a.fields=$$('[data-field-name]').map(el=>el.value.trim()||'字段');
  a.rows=$$('.ab-row').map(rowEl=>{
    const cells=[];
    $$('[data-row-cell]',rowEl).forEach(el=>{const c=+el.dataset.rowCell.split('-')[1];cells[c]=el.value;});
    while(cells.length<a.fields.length)cells.push('');
    return {v:cells};
  });
  return a;
}
/* 雷达编辑：滑动条实时更新数值显示与预览 */
document.addEventListener('input',e=>{
  const rv=e.target.closest('[data-radar-val]');
  if(rv){
    const i=+rv.dataset.radarVal;
    const num=document.querySelector(`[data-radar-num="${i}"]`);if(num)num.textContent=rv.value;
    const canvas=document.getElementById('ability-radar');
    if(canvas){const a=abilityOf(DB.user);a.radar.values[i]=Number(rv.value);
      clearTimeout(window._abRadarLive);window._abRadarLive=setTimeout(()=>{if(document.getElementById('ability-radar'))initAbilityRadar();},120);}
  }
});

/* 文件输入单独处理 */
document.addEventListener('change',e=>{
  const t=e.target;
  /* 拍照（camera）与相册共用同一套照片发送逻辑：临时归一化 id */
  if(t.id&&t.id.endsWith('-camera-file')){t.id=t.id.replace('-camera-file','-photo-file');setTimeout(()=>{t.id=t.id.replace('-photo-file','-camera-file');},0);}
  /* 模式配置：速度 / 主动 */
  if(t.id==='rm-speed'){activeRoom().speed=t.value;DB.save();return;}
  if(t.id==='ch-speed'){chatOf(parseHash().seg[1]).speed=t.value;DB.save();return;}
  const activityMap={'rm':()=>activeRoom(),'ch':()=>chatOf(parseHash().seg[1]),'wg':()=>workgroupOf()};
  for(const prefix of ['rm','ch','wg']){
    if(t.id===prefix+'-activity'){const b=activityMap[prefix]();b.proactiveActivity=t.value;if(t.value==='custom'&&!(Number(b.proactiveInterval)>0))b.proactiveInterval=120;DB.save();const sec=$('#'+prefix+'-activity-sec');if(sec){sec.style.display=t.value==='custom'?'inline-block':'none';sec.value=b.proactiveInterval||120;}return;}
    if(t.id===prefix+'-activity-sec'){const b=activityMap[prefix]();b.proactiveInterval=Math.max(30,Math.min(3600,Number(t.value)||120));t.value=b.proactiveInterval;DB.save();return;}
  }
  if(t.id==='rm-proactive'||t.id==='ch-proactive'||t.id==='wg-proactive'){
    const prefix=t.id.slice(0,2),b=activityMap[prefix];const box=b();box.proactive=t.checked;
    if(t.checked){box.mode='card';box.proactiveLastTickAt=Date.now()-15000;if('Notification' in window&&Notification.permission==='default')Notification.requestPermission();}
    DB.save();router();
    if(t.checked){const people=replyPeople(prefix==='ch'?{kind:'chat',key:parseHash().seg[1]}:prefix==='rm'?{kind:'room',roomId:activeRoom().id}:{kind:'workgroup'},box).filter(p=>p?.cards?.length);if(!people.length){toast('主动行为已开启，但对方还没有字卡；请先添加字卡。','warn');setTimeout(()=>{if(prefix==='ch')cardManager(parseHash().seg[1]);else if(prefix==='rm'){const r=activeRoom();const ids=r.members.filter(id=>id!==DB.user.id);if(ids[0])cardManager(ids[0]);}else toast('请在工作组成员资料中添加字卡。','warn');},0);}else toast('主动行为已开启，将按所选频率随机发消息。','ok');}
    return;
  }
  if(t.id==='rm-read-no-reply'){activeRoom().readNoReply=t.checked;DB.save();return;}
  if(t.id==='ch-read-no-reply'){chatOf(parseHash().seg[1]).readNoReply=t.checked;DB.save();return;}
  if(t.id==='wg-read-no-reply'){workgroupOf().readNoReply=t.checked;DB.save();return;}
  if(t.id==='wg-speed'){workgroupOf().speed=t.value;DB.save();return;}
  /* 工作组发照片 */
  if(t.id==='wg-photo-file'&&t.files[0]){
    const file=t.files[0],userId=DB.user?.id;t.value='';
    compressImage(file,720,data=>{
      if(!DB.user||DB.user.id!==userId){toast('账号状态已变化，照片未发送。','warn');return;}
      commitOutgoingMessage({kind:'workgroup'},{id:genId('m'),uid:DB.user.id,type:'photo',text:'',photo:data,at:nowStr()});
    },err=>toast('图片读取失败，请换一张图片重试。','err'));
    return;
  }
  if(t.id==='d-av-file'&&t.files[0]){
    compressAvatar(t.files[0],data=>{DB.user.avatar=data;DB.save();router();toast('头像已更新','ok');});return;
  }
  if(t.id==='d-cover-file'&&t.files[0]){const file=t.files[0];compressImage(file,960,data=>{DB.user.coverImg=data;DB.save();router();toast('封面图已更新','ok');},()=>toast('封面图处理失败，请换一张图片。','err'));return;}
  /* 私聊发照片：压缩后作为我方消息发出 */
  if(t.id==='ch-photo-file'&&t.files[0]){
    const{seg}=parseHash(),uid=seg[1],file=t.files[0],userId=DB.user?.id;t.value='';
    if(!uid||!DB.data.users.some(u=>u.id===uid)){toast('当前私聊对象不存在，照片未发送。','warn');return;}
    compressImage(file,720,data=>{
      if(!DB.user||DB.user.id!==userId||!DB.data.users.some(u=>u.id===uid)){toast('账号或聊天对象已变化，照片未发送。','warn');return;}
      const msg={id:genId('m'),side:'me',type:'text',text:'',photo:data,at:nowStr()};
      commitOutgoingMessage({kind:'chat',key:uid,side:'them'},msg);
    },err=>toast('图片读取失败，请换一张图片重试。','err'));
    return;
  }
  /* 群聊发照片 */
  if(t.id==='rm-photo-file'&&t.files[0]){
    const room=activeRoom(),roomId=room.id,file=t.files[0],userId=DB.user?.id;t.value='';
    compressImage(file,720,data=>{
      const targetRoom=roomsOf().find(r=>r.id===roomId);
      if(!DB.user||DB.user.id!==userId||!targetRoom){toast('账号或聊天室已变化，照片未发送。','warn');return;}
      const msg={id:genId('m'),uid:DB.user.id,type:'photo',text:'',photo:data,at:nowStr()};
      commitOutgoingMessage({kind:'room',roomId},msg);
    },err=>toast('图片读取失败，请换一张图片重试。','err'));
    return;
  }
  /* 论坛编辑器插入图片 */
  if((t.id==='a-img-file'||t.id==='ans-img-file')&&t.files[0]){
    const target=t.id==='a-img-file'?$('#a-body'):$('#ans-body');
    compressImage(t.files[0],720,data=>{
      insertAt(target,'[img]'+data+'[/img]');toast('图片已插入','ok');});
    t.value='';return;
  }
  if(t.id==='set-import'&&t.files[0]){
    const r=new FileReader();
    r.onload=ev=>{try{
      const obj=JSON.parse(ev.target.result);
      if(!obj.users||!obj.posts)throw new Error('bad');
      DB.data=obj;DB.migrate();DB.save();router();toast('数据导入成功','ok');
    }catch(err){toast('文件格式不正确','err');}};
    r.readAsText(t.files[0],'utf-8');return;
  }
});
/* 回车查询 / 回车发送 */
document.addEventListener('keydown',e=>{
  if(e.isComposing||e.keyCode===229)return;
  if(e.key==='Enter'&&e.target.id==='tb-code'){$('#tb-go').click();}
  if(e.key==='Enter'&&e.target.id==='ar-q'){$('#ar-go').click();}
  if(e.key==='Enter'&&e.target.id==='ch-text'&&!e.shiftKey){e.preventDefault();$('#ch-send').click();}
  if(e.key==='Enter'&&e.target.id==='rm-text'&&!e.shiftKey){e.preventDefault();$('#rm-send').click();}
  if(e.key==='Enter'&&e.target.id==='wg-text'&&!e.shiftKey){e.preventDefault();$('#wg-send').click();}
  /* 方块小游戏键盘控制（仅在游戏页且焦点不在输入框时生效） */
  if(document.getElementById('tetris-canvas')&&!/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)){
    const map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'rotate',ArrowDown:'down',' ':'drop'};
    if(map[e.key]){e.preventDefault();tetrisAction(map[e.key]);}
    if(e.key==='p'||e.key==='P'){tetrisAction('pause');}
  }
});

let _lastWindowScroll=window.scrollY||0;const _lastInnerScroll=new WeakMap();let _topbarScrollTick=false;
function measureMobileChrome(){
  if(window.innerWidth>680)return;
  const portal=document.querySelector('.portal');if(!portal)return;
  const top=portal.querySelector('.portal-top');
  const nav=portal.querySelector('.nav-wrap');
  if(!top)return;
  const th=top.offsetHeight,nh=nav?nav.offsetHeight:0;
  portal.style.setProperty('--topbar-h',th+'px');
  portal.style.setProperty('--nav-h',nh+'px');
  portal.style.setProperty('--chrome-measured',(th+nh)+'px');
}
function afterRenderInit(){
  document.querySelectorAll('.chat-input-row').forEach(row=>syncChatSendState(row.dataset.prefix));
  const portal=document.querySelector('.portal');
  if(portal)document.body.dataset.portalTheme=DB.data.theme||'default';
  else delete document.body.dataset.portalTheme;
  measureMobileChrome();
  if(document.getElementById('ability-radar'))initAbilityRadar();
  if(document.getElementById('tetris-canvas'))initTetris();
}
function initAbilityRadar(){
  const canvas=document.getElementById('ability-radar');if(!canvas)return;
  const a=abilityOf(DB.user);
  const cs=getComputedStyle(document.querySelector('.portal'));
  const v=n=>cs.getPropertyValue(n).trim();
  const accent=v('--pt-accent')||'#2E47B8';
  const text=v('--pt-text-soft')||'#3A456E';
  const hl=v('--pt-highlight')||accent;
  const hexToRgba=(hex,alpha)=>{
    let h=String(hex).replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');
    const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
    if([r,g,b].some(Number.isNaN))return `rgba(46,71,184,${alpha})`;
    return `rgba(${r},${g},${b},${alpha})`;};
  const redraw=()=>{
    const size=canvas.clientWidth||320;
    drawRadarChart(canvas,a.radar.labels,a.radar.values,{
      px:size,text,gridLine:hexToRgba(accent,.18),fill:hexToRgba(accent,.2),
      stroke:accent,point:hl,font:13,labelPad:28,centerFill:hexToRgba(accent,.04)});
  };
  redraw();
  let _rt;window.addEventListener('resize',()=>{clearTimeout(_rt);_rt=setTimeout(redraw,150);});
}
function _setTopbarHidden(hidden){
  const portal=document.querySelector('.portal');if(!portal)return;
  const top=portal.querySelector('.portal-top');if(!top)return;
  if(top.classList.contains('is-hidden')===hidden)return;
  top.classList.toggle('is-hidden',hidden);
  portal.classList.toggle('is-top-hidden',hidden);
}
function updateMobileTopbar(e){
  if(window.innerWidth>680){_setTopbarHidden(false);return;}
  if(!document.querySelector('.portal'))return;
  /* 弹层 / 模态 / 进入动效出现时，顶栏保持可见，保证导航与输入可达 */
  if(document.querySelector('.mask,.modal,.rec-overlay,#portal-entry')){_setTopbarHidden(false);return;}
  const src=e&&e.target;
  const inner=src&&src.closest&&src.closest('.chat-scroll,.post-list,.forum-list,.p-main');
  let st,last;
  if(inner&&inner!==document){
    st=inner.scrollTop;const prev=_lastInnerScroll.get(inner);last=prev===undefined?st:prev;
  }else{
    st=window.scrollY;last=_lastWindowScroll;
  }
  const delta=st-last;
  if(inner)_lastInnerScroll.set(inner,st);else _lastWindowScroll=st;
  if(st<56){_setTopbarHidden(false);return;}
  if(Math.abs(delta)>6){
    if(delta>0)_setTopbarHidden(true);
    else _setTopbarHidden(false);
  }
}
document.addEventListener('scroll',updateMobileTopbar,{passive:true,capture:true});
window.addEventListener('resize',()=>{measureMobileChrome();if(window.innerWidth>680)_setTopbarHidden(false);});
/* 输入时同步“发送”按钮显隐（微信式：有文字才出现发送） */
document.addEventListener('input',e=>{
  const ta=e.target.closest&&e.target.closest('.chat-input-row textarea');
  if(ta){const row=ta.closest('.chat-input-row');syncChatSendState(row.dataset.prefix);}
});
/* 点击输入行以外区域时，收起表情/＋面板 */
document.addEventListener('click',e=>{
  const row=e.target.closest('.chat-input-row');
  if(!row){document.querySelectorAll('.chat-input-row').forEach(r=>closeChatPanels(r.dataset.prefix));}
},true);
window.addEventListener('hashchange',router);/* 加载动效：首屏渲染完成后淡出，淡出后移除节点；另设安全超时，避免异常时一直遮挡。 */
function hidePreloader(){
  const pl=document.getElementById('page-preloader');
  if(!pl||pl.classList.contains('is-done'))return;
  pl.classList.add('is-done');
  setTimeout(()=>{pl.remove();},700);
}
setTimeout(hidePreloader,4000);
Store.open().then(async()=>{
  await DB.load();
  Cloud.init();
  // 云端通知轮询：定时 + 页面重新可见/聚焦时刷新红点
  const pollCloudNotif=()=>{ Cloud.pollNotifications().then(()=>syncUnreadBadges()).catch(()=>{}); };
  window._pollCloudNotif=pollCloudNotif;
  setInterval(pollCloudNotif,30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)pollCloudNotif();});
  window.addEventListener('focus',pollCloudNotif);
  setTimeout(pollCloudNotif,3000);
  // 若本地存有云端 token，尝试恢复会话（失败不阻塞，可能是离线）。
  Cloud.refresh().then(()=>pollCloudNotif()).catch(()=>{});
  // Service worker 仅在 HTTPS/localhost 等安全环境可用；file:// 本地直开不支持。
  if('serviceWorker' in navigator && window.isSecureContext){
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
    navigator.serviceWorker.addEventListener('message',event=>{
      if(event.data&&event.data.type==='NDT_NOTIFICATION_CLICK'&&event.data.url){location.hash=event.data.url;window.focus();}
    });
  }
  if(!location.hash)location.hash='#/';else router();
  // 等首屏内容真正绘制后再收起加载动效。
  requestAnimationFrame(()=>requestAnimationFrame(hidePreloader));
  window._appReady=true;
  if(!window._proactiveSchedulerStarted){
    window._proactiveSchedulerStarted=true;
    setInterval(runProactiveScheduler,15000);
    setInterval(simulateForumGrowth,45000);
    document.addEventListener('visibilitychange',()=>{simulateForumGrowth();});
    document.addEventListener('visibilitychange',()=>{runProactiveScheduler();syncDocumentTitle();});
    window.addEventListener('focus',()=>{runProactiveScheduler();syncDocumentTitle();});window.addEventListener('pageshow',()=>{runProactiveScheduler();syncDocumentTitle();});
    window.addEventListener('hashchange',()=>setTimeout(runProactiveScheduler,2000));
  }
}).catch(()=>{
  // 存储初始化失败时也要收起加载动效，避免整页一直被遮挡。
  try{if(!location.hash)location.hash='#/';else router();}catch(e){}
  hidePreloader();
});



/* 同源多标签页同步：另一个标签页产生新回帖时，刷新站内提示；不等同于跨设备推送。 */
window.addEventListener('storage',e=>{
  if(e.key!==DB_KEY||!e.newValue)return;
  try{
    const incoming=JSON.parse(e.newValue);
    const previous=DB.data||{};
    const oldAnswerIds=new Set((previous.answers||[]).map(a=>a.id));
    const meId=DB.user?.id;
    DB.data=incoming;
    const newAnswers=(incoming.answers||[]).filter(a=>!oldAnswerIds.has(a.id));
    const relevant=newAnswers.find(a=>{
      const p=(incoming.posts||[]).find(x=>x.id===a.postId);
      return p&&p.authorId===meId&&a.authorId!==meId;
    });
    if(relevant){
      const p=incoming.posts.find(x=>x.id===relevant.postId);
      if(document.hidden)showSiteNotification('你的帖子有新回帖',`${relevant.authorName||'论坛成员'}：${String(relevant.content||'').slice(0,100)}`,'#/post/'+p.id,'ndt-forum-'+p.id);
      else if(!(parseHash().seg[0]==='post'&&parseHash().seg[1]===p.id))toast(`你的帖子「${p.title}」有新回帖`,'ok');
    }
    syncUnreadBadges();
    if(!document.hidden)router();
  }catch(err){}
});

/* ===== 自由画布关系图：节点位置独立于关系，不允许把人物拖到连线中形成关系 ===== */
(function(){
 const W=1600,H=1050;
 const zoomByKey=window._ndtNetworkZoom||(window._ndtNetworkZoom={});
 const getZoom=()=>{const key=document.querySelector('.network-graph-wrap')?.dataset.networkKey||'factions';return Math.max(.45,Math.min(1.6,Number(zoomByKey[key])||1));};
 function applyZoom(){const wrap=document.querySelector('.network-graph-wrap');if(!wrap)return;const key=wrap.dataset.networkKey||'factions',z=Math.max(.45,Math.min(1.6,Number(zoomByKey[key])||1));zoomByKey[key]=z;const svg=wrap.querySelector('.network-graph-svg'),grid=wrap.querySelector('.network-graph-nodes');if(svg)svg.style.zoom=String(z);if(grid)grid.style.zoom=String(z);const label=document.querySelector('.network-zoom-tools .zoom-reset');if(label)label.textContent=Math.round(z*100)+'%';}
 const pos=(obj,i,total,centerY=260,el=null)=>{if(el&&Number.isFinite(parseFloat(el.dataset.cx))&&Number.isFinite(parseFloat(el.dataset.cy)))return {x:parseFloat(el.dataset.cx),y:parseFloat(el.dataset.cy)};if(Number.isFinite(obj.x)&&Number.isFinite(obj.y))return {x:obj.x,y:obj.y};const angle=(-Math.PI/2)+(Math.PI*2*i/Math.max(1,total));return {x:Math.max(24,Math.min(W-160,760+Math.cos(angle)*Math.min(520,180+total*20))),y:Math.max(90,Math.min(H-110,centerY+Math.sin(angle)*Math.min(330,130+total*15)))};};
 function color(label){let h=0;for(const ch of String(label||'关联'))h=(h*31+ch.charCodeAt(0))|0;const p=['#D66A3A','#2878B8','#8B5FC7','#16856D','#C04D78','#A47716','#3F70A8','#B34F35'];return p[Math.abs(h)%p.length];}
 function makeMarkers(){return `<defs><marker id="net-arrow-one" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill="context-stroke"/></marker><marker id="net-arrow-both" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill="context-stroke"/></marker><marker id="net-arrow-both-start" markerWidth="10" markerHeight="10" refX="2" refY="5" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill="context-stroke"/></marker></defs>`;}
 function drawStaff(){const wrap=document.querySelector('.network-graph-wrap');if(!wrap)return;activateCanvas(wrap,'staff');const svg=wrap.querySelector('.network-graph-svg'),grid=wrap.querySelector('.network-graph-nodes');if(!svg||!grid)return;const {net}=activeNetwork();if(!net)return;svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('width',W);svg.setAttribute('height',H);const els=[...grid.querySelectorAll('[data-net-visual]')];const paths=[];
  (net.nodes||[]).forEach((n,i)=>{const el=els.find(e=>e.dataset.netVisual===n.id);if(!el)return;const q=pos(n,i,net.nodes.length,260,el);el.style.left=q.x+'px';el.style.top=q.y+'px';el.dataset.cx=q.x;el.dataset.cy=q.y;});
  (net.edges||[]).forEach(e=>{const a=els.find(x=>x.dataset.netVisual===e.from),b=els.find(x=>x.dataset.netVisual===e.to);if(!a||!b)return;const ax=+a.dataset.cx+66,ay=+a.dataset.cy+34,bx=+b.dataset.cx+66,by=+b.dataset.cy+34,dx=bx-ax,dy=by-ay,len=Math.max(1,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len,sx=ax+ux*68,sy=ay+uy*34,ex=bx-ux*68,ey=by-uy*34;const curve=Math.max(28,Math.min(100,Math.abs(dx)*.12));const d=`M${sx},${sy} C${sx+dx*.32},${sy+dy*.32-curve} ${ex-dx*.32},${ey-dy*.32-curve} ${ex},${ey}`;const c=color(e.label),both=e.dir==='both';paths.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round" marker-end="url(#net-arrow-one)" ${both?'marker-start="url(#net-arrow-both-start)"':''}/>`);const mx=(ax+bx)/2,my=(ay+by)/2-curve*.5;if(e.label)paths.push(`<text x="${mx}" y="${my}" text-anchor="middle" fill="${c}" stroke="var(--pt-bg)" stroke-width="5" paint-order="stroke" font-size="12" font-weight="700">${esc(e.label.slice(0,24))}</text>`);});svg.innerHTML=makeMarkers()+paths.join('');applyZoom();
 }
 function drawArchive(){
  const wrap=document.querySelector('.rel-network-wrap');if(!wrap)return;
  const svg=wrap.querySelector('.rel-network-svg'),center=wrap.querySelector('[data-rel-center]'),grid=wrap.querySelector('.rel-network-nodes');
  if(!svg||!center||!grid)return;
  const r=DB.data.archives.find(x=>x.id===parseHash().seg[1]);if(!r)return;
  const nodes=[...grid.querySelectorAll('.rel-network-node')],rels=r.rels||[];
  /* 档案关系树是层级布局，不是自由画布：师长在上、本人居中、后辈在下，其他关系分列左右。 */
  const groups={up:[],down:[],left:[],right:[]};
  rels.forEach((rel,i)=>{
   const el=nodes.find(n=>+n.dataset.relIndex===i);if(!el)return;
   const label=String(rel.rel||'');
   let side=rel.layout;
   if(!['up','down','left','right'].includes(side)){
    if(/(师傅|师父|师尊|老师|师长|师承|师叔|师伯|师祖|长辈|前辈|师兄|师姐)/.test(label))side='up';
    else if(/(徒弟|弟子|门生|学生|徒孙|后辈|晚辈)/.test(label))side='down';
    else side=(groups.left.length<=groups.right.length?'left':'right');
    rel.layout=side;
   }
   groups[side].push({rel,el,i});
  });
  const W=Math.max(1600,Math.ceil(wrap.clientWidth/1600)*1600),H=1100,CX=W/2,CY=500,NW=128,NH=120;
  grid.style.width=W+'px';grid.style.height=H+'px';grid.style.minHeight=H+'px';
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('width',W);svg.setAttribute('height',H);
  center.style.left=CX+'px';center.style.top=CY+'px';center.style.transform='translate(-50%,-50%)';
  const place=(arr,side)=>arr.forEach((o,j)=>{
   const col=j%7,row=Math.floor(j/7),gapX=NW+28,gapY=NH+24;let x,y;
   if(side==='up'){x=CX-NW/2+(col-(Math.min(arr.length,7)-1)/2)*gapX;y=CY-245-(row*gapY);}
   else if(side==='down'){x=CX-NW/2+(col-(Math.min(arr.length,7)-1)/2)*gapX;y=CY+145+(row*gapY);}
   else if(side==='left'){x=CX-250-(row*gapX);y=CY-NH/2+(col-(Math.min(arr.length,7)-1)/2)*gapY;}
   else{x=CX+122+(row*gapX);y=CY-NH/2+(col-(Math.min(arr.length,7)-1)/2)*gapY;}
   x=Math.max(16,x);y=Math.max(16,y);o.el.style.left=x+'px';o.el.style.top=y+'px';o.el.dataset.cx=x;o.el.dataset.cy=y;
  });
  ['up','down','left','right'].forEach(side=>place(groups[side],side));
  const paths=[];
  nodes.forEach(el=>{const i=+el.dataset.relIndex,rel=rels[i];if(!rel)return;const x=+el.dataset.cx,y=+el.dataset.cy,bx=x+NW/2,by=y+Math.min(NH,el.offsetHeight)/2;let sx=CX,sy=CY,ex=bx,ey=by;const side=el.dataset.relLayout||rel.layout;
   if(side==='up'){sy=CY-34;ey=y+Math.min(NH,el.offsetHeight);}else if(side==='down'){sy=CY+34;ey=y;}else if(side==='left'){sx=CX-75;ex=x+NW;}else{sx=CX+75;ex=x;}
   const c=color(rel.rel),both=rel.dir==='both';let d;
   if(side==='up'||side==='down'){const mid=(sy+ey)/2;d=`M${sx},${sy} C${sx},${mid} ${ex},${mid} ${ex},${ey}`;}else{const mid=(sx+ex)/2;d=`M${sx},${sy} C${mid},${sy} ${mid},${ey} ${ex},${ey}`;}
   paths.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" marker-end="url(#archive-arrow-end)" ${both?'marker-start="url(#archive-arrow-start)"':''}/>`);
  });
  svg.innerHTML=`<defs><marker id="archive-arrow-end" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill="context-stroke"/></marker><marker id="archive-arrow-start" markerWidth="10" markerHeight="10" refX="2" refY="5" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill="context-stroke"/></marker></defs>`+paths.join('');
 }
 window.drawNetworkGraph=drawStaff;window.drawArchiveRelationGraph=drawArchive;
 function activateCanvas(wrap,type){if(!wrap||wrap.dataset.freeCanvasReady)return;wrap.dataset.freeCanvasReady='1';let drag=null;
  let pressTimer=null,pressOrigin=null,pendingPointer=null;
  wrap.addEventListener('pointerdown',e=>{const card=e.target.closest(type==='staff'?'[data-net-visual]':'.rel-network-node');if(!card||e.target.closest('button')||e.button>0)return;clearTimeout(pressTimer);pressOrigin={x:e.clientX,y:e.clientY,card};pendingPointer=e.pointerId;pressTimer=setTimeout(()=>{if(!pressOrigin||pendingPointer!==e.pointerId)return;const nodeId=type==='staff'?card.dataset.netVisual:Number(card.dataset.relIndex);drag={card,nodeId,startX:pressOrigin.x,startY:pressOrigin.y,left:parseFloat(card.style.left)||0,top:parseFloat(card.style.top)||0,moved:false,pointerId:e.pointerId};card.classList.add('dragging');wrap.classList.add('node-drag-active');try{wrap.setPointerCapture(e.pointerId)}catch(_){};},420);});
  wrap.addEventListener('pointermove',e=>{if(!drag){if(pressOrigin&&pendingPointer===e.pointerId&&(Math.abs(e.clientX-pressOrigin.x)>9||Math.abs(e.clientY-pressOrigin.y)>9)){clearTimeout(pressTimer);pressTimer=null;pressOrigin=null;pendingPointer=null;}return;}if(drag.pointerId!==e.pointerId)return;const scale=Math.max(.45,Math.min(1.6,Number(zoomByKey[wrap.dataset.networkKey]||1)));const dx=(e.clientX-drag.startX)/scale,dy=(e.clientY-drag.startY)/scale;if(Math.abs(dx)+Math.abs(dy)>2)drag.moved=true;drag.card.style.left=Math.max(0,drag.left+dx)+'px';drag.card.style.top=Math.max(0,drag.top+dy)+'px';drag.card.dataset.cx=parseFloat(drag.card.style.left);drag.card.dataset.cy=parseFloat(drag.card.style.top);/* Keep the live coordinates in the data model while redrawing, otherwise draw() snaps the node back to its saved position on every pointermove. */if(type==='staff'){const live=activeNetwork().net?.nodes.find(n=>n.id===drag.nodeId);if(live){live.x=drag.card.dataset.cx;live.y=drag.card.dataset.cy;}drawStaff();}else{const rr=DB.data.archives.find(x=>x.id===parseHash().seg[1]),live=rr?.rels?.[drag.nodeId];if(live){live.x=drag.card.dataset.cx;live.y=drag.card.dataset.cy;}drawArchive();}});
  const end=()=>{clearTimeout(pressTimer);pressTimer=null;pressOrigin=null;pendingPointer=null;if(!drag)return;const d=drag;drag=null;d.card.classList.remove('dragging');wrap.classList.remove('node-drag-active');if(!d.moved)return;const x=parseFloat(d.card.style.left)||0,y=parseFloat(d.card.style.top)||0;if(type==='staff'){const {net}=activeNetwork(),n=net?.nodes.find(n=>n.id===d.nodeId);if(n){n.x=x;n.y=y;DB.save();}}else{const r=DB.data.archives.find(x=>x.id===parseHash().seg[1]),rel=r?.rels?.[d.nodeId];if(rel){rel.x=x;rel.y=y;DB.save();}}};wrap.addEventListener('pointerup',end);wrap.addEventListener('pointercancel',end);
 }
 window.addEventListener('resize',()=>{drawStaff();drawArchive();});
})();

document.addEventListener('keydown',e=>{if(e.target?.id==='yj-classic-query'&&e.key==='Enter'){e.preventDefault();document.getElementById('yj-classic-search')?.click();}});

