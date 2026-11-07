/* 徽章特效注入 - 独立文件，完全不碰app.js和后端 */
(function(){
  var MARK_GLOW='[GLOW1]';
  var MARK_FLOW='[FLOW2]';

  // 动态加两个特效选项到选择器
  function injectOptions(){
    var pick=document.getElementById('b-eff-pick');
    if(!pick)return;
    if(pick.querySelector('[data-eff="glow1"]'))return;

    var opt1=document.createElement('button');
    opt1.type='button';
    opt1.className='bd-eff-opt';
    opt1.dataset.eff='glow1';
    opt1.title='曜金·旋转金环';
    opt1.style.cssText='background:linear-gradient(135deg,#1A1A1A,#D4AF37);';
    opt1.addEventListener('click',function(){
      pick.querySelectorAll('.bd-eff-opt').forEach(function(b){b.classList.remove('sel')});
      opt1.classList.add('sel');
    });
    pick.appendChild(opt1);

    var opt2=document.createElement('button');
    opt2.type='button';
    opt2.className='bd-eff-opt';
    opt2.dataset.eff='flow2';
    opt2.title='冰蓝·流光';
    opt2.style.cssText='background:linear-gradient(135deg,#0D47A1,#4FC3F7);';
    opt2.addEventListener('click',function(){
      pick.querySelectorAll('.bd-eff-opt').forEach(function(b){b.classList.remove('sel')});
      opt2.classList.add('sel');
    });
    pick.appendChild(opt2);
  }

  // 监听徽章提交：把选的特效标记加到desc里
  function watchSubmit(){
    var saveBtn=document.getElementById('b-save');
    if(!saveBtn||saveBtn.dataset.watched)return;
    saveBtn.dataset.watched='1';
    saveBtn.addEventListener('click',function(){
      var selected=document.querySelector('#b-eff-pick .bd-eff-opt.sel');
      if(!selected)return;
      var eff=selected.dataset.eff;
      if(eff!=='glow1'&&eff!=='flow2')return;
      var descInput=document.getElementById('b-desc');
      if(!descInput)return;
      var val=descInput.value||'';
      val=val.replace(/\[GLOW1\]/g,'').replace(/\[FLOW2\]/g,'');
      var mark=eff==='glow1'?MARK_GLOW:MARK_FLOW;
      descInput.value=mark+val;
    });
  }

  // 监听徽章渲染：从desc提取标记，应用特效类，隐藏标记
  function applyEffects(){
    document.querySelectorAll('.up-badge').forEach(function(badge){
      var desc=badge.querySelector('.ub-desc');
      if(!desc)return;
      var text=desc.textContent;
      if(text.indexOf(MARK_GLOW)===0){
        badge.classList.add('bd-eff-glow1');
        desc.textContent=text.slice(MARK_GLOW.length);
      }else if(text.indexOf(MARK_FLOW)===0){
        badge.classList.add('bd-eff-flow2');
        desc.textContent=text.slice(MARK_FLOW.length);
      }
    });
    document.querySelectorAll('.bd-badge,.bd-grant').forEach(function(badge){
      var desc=badge.querySelector('.bd-gn')||badge.querySelector('.bd-desc');
      if(!desc)return;
      var text=desc.textContent;
      if(text.indexOf(MARK_GLOW)===0){
        badge.classList.add('bd-eff-glow1');
        desc.textContent=text.slice(MARK_GLOW.length);
      }else if(text.indexOf(MARK_FLOW)===0){
        badge.classList.add('bd-eff-flow2');
        desc.textContent=text.slice(MARK_FLOW.length);
      }
    });
  }

  var observer=new MutationObserver(function(){
    injectOptions();
    watchSubmit();
    applyEffects();
  });
  observer.observe(document.body,{childList:true,subtree:true});
  injectOptions();
  watchSubmit();
  applyEffects();
})();
