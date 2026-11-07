/* 邀请分享卡片 - 独立文件，不修改app.js */
(function(){
  function init(){
    var box=document.getElementById('invite-box');
    if(!box){ setTimeout(init,500); return; }

    // 监听invite-box内容变化
    var observer=new MutationObserver(function(){
      var existingBtn=document.getElementById('invite-share-btn');
      if(existingBtn)return;
      var codeEl=box.querySelector('code');
      if(!codeEl)return;

      // 动态加按钮
      var btn=document.createElement('button');
      btn.type='button';
      btn.id='invite-share-btn';
      btn.className='btn btn-sm btn-orange';
      btn.style.borderRadius='20px';
      btn.textContent='🎴 生成分享卡片';
      box.insertBefore(btn, box.children[1]||null);

      btn.onclick=function(){
        var code=codeEl.textContent.trim();
        var count=box.querySelector('b')?box.querySelector('b').textContent:'0';
        showShareModal(code,count);
      };
    });
    observer.observe(box,{childList:true,subtree:true});
  }

  function showShareModal(code,count){
    var T=window.SHARE_THEMES?SHARE_THEMES[(window.DB&&DB.data&&DB.data.theme)||'default']:null;
    if(!T)T={bg1:'#16225C',bg2:'#0A1238',card:'rgba(255,255,255,.06)',cardBorder:'rgba(160,180,255,.18)',avatarBg:'#6D8CFF',text:'#F3F6FF',sub:'#A9B8E8',accent:'#E8874A'};

    var W=750,M=40,cardW=W-M*2;
    var headH=120,codeH=180,footH=80,gap=20;
    var H=M+headH+gap+codeH+gap+footH+M;

    var canvas=document.createElement('canvas');
    canvas.width=W;canvas.height=H;
    var ctx=canvas.getContext('2d');

    // 背景
    var grad=ctx.createLinearGradient(0,0,W*0.4,H);
    grad.addColorStop(0,T.bg1);grad.addColorStop(1,T.bg2);
    ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);

    var y=M;
    // 头部卡片
    roundRect(ctx,M,y,cardW,headH,22);
    ctx.fillStyle=T.card;ctx.fill();
    ctx.strokeStyle=T.cardBorder;ctx.lineWidth=1;ctx.stroke();

    ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillStyle=T.text;ctx.font='900 30px "Microsoft YaHei",sans-serif';
    ctx.fillText('🎯 好友邀请',M+26,y+40);
    ctx.fillStyle=T.sub;ctx.font='15px "Microsoft YaHei",sans-serif';
    ctx.fillText('注册时填写邀请码，双方各得 100 积分',M+26,y+78);

    var cntTxt='已邀请 '+count+' 人';
    ctx.font='700 18px "Microsoft YaHei",sans-serif';
    var bw=ctx.measureText(cntTxt).width+32;
    roundRect(ctx,W-M-26-bw,y+headH/2-20,bw,40,20);
    ctx.fillStyle=T.avatarBg;ctx.fill();
    ctx.fillStyle='#fff';ctx.textAlign='center';
    ctx.fillText(cntTxt,W-M-26-bw/2,y+headH/2+1);

    y+=headH+gap;
    // 邀请码大卡
    roundRect(ctx,M,y,cardW,codeH,22);
    ctx.fillStyle=T.card;ctx.fill();
    ctx.strokeStyle=T.cardBorder;ctx.stroke();

    ctx.fillStyle=T.accent;
    roundRect(ctx,M+26,y+12,5,22,3);ctx.fill();
    ctx.fillStyle=T.text;ctx.textAlign='left';
    ctx.font='800 20px "Microsoft YaHei",sans-serif';
    ctx.fillText('我的专属邀请码',M+41,y+23);

    ctx.textAlign='center';
    ctx.fillStyle=T.accent;ctx.font='900 52px "Microsoft YaHei",monospace';
    ctx.fillText(code,W/2,y+110);
    ctx.fillStyle=T.sub;ctx.font='14px "Microsoft YaHei",sans-serif';
    ctx.fillText('复制以上邀请码，注册时填入即可',W/2,y+155);

    y+=codeH+gap;
    // 页脚
    ctx.textAlign='center';
    ctx.fillStyle=T.sub;ctx.font='14px "Microsoft YaHei",sans-serif';
    ctx.fillText('哪都通 · 异人论坛',W/2,y+20);
    ctx.fillStyle=T.text;ctx.font='700 18px "Microsoft YaHei",sans-serif';
    ctx.fillText(location.origin,W/2,y+52);

    var dataUrl=canvas.toDataURL('image/jpeg',.92);

    // 弹窗
    var mask=document.createElement('div');
    mask.className='modal-mask';
    mask.innerHTML='<div class="modal"><h3>邀请分享卡片</h3><div class="m-body" style="text-align:center">'+
      '<img src="'+dataUrl+'" style="max-width:100%;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.2)">'+
      '</div><div class="m-foot"><a class="btn btn-orange" id="invite-card-dl" download="邀请卡片.jpg">保存图片</a>'+
      '<button class="btn btn-ghost btn-sm" onclick="this.closest(\'.modal-mask\').remove()">关闭</button></div></div>';
    document.body.appendChild(mask);
    mask.addEventListener('click',function(e){if(e.target===mask)mask.remove()});
    var dl=document.getElementById('invite-card-dl');
    if(dl)dl.href=dataUrl;
  }

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();
