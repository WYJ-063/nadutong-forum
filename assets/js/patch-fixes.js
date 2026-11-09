/* ============================================================
   小修小补：给 app.js 里几个容易撞上的地方加一层容错
   ------------------------------------------------------------
   单独一个文件、在 app.js 之后加载，用包裹的方式打补丁 ——
   不动 app.js 本体，这样以后升级整包也不会和原文件打架。

   1) sortForumPosts / list.sort 报 "list.sort is not a function"
      Cloud.listPosts() 返回的是 {posts,total,hasMore}，不是数组；
      cloudRerender() 却把它当数组直接丢给 sortForumPosts()。
      点赞、发帖、删帖之后只要走云端刷新就会撞上，页面弹一条红提示。
      这里把入参先归一成数组，再交给原函数。
   ============================================================ */
(function () {
  'use strict';

  /* 把各种可能的形状都摊平成数组 */
  function toArray(v) {
    if (Array.isArray(v)) return v;
    if (!v) return [];
    if (Array.isArray(v.posts)) return v.posts;
    if (Array.isArray(v.items)) return v.items;
    if (Array.isArray(v.list)) return v.list;
    if (Array.isArray(v.data)) return v.data;
    if (typeof v.length === 'number') return Array.prototype.slice.call(v);
    return [];
  }

  var patched = false;

  function patchSort() {
    if (patched) return true;
    var orig = null;
    try { orig = window.sortForumPosts; } catch (e) { }
    if (typeof orig !== 'function') return false;
    window.sortForumPosts = function (list, sort) {
      return orig(toArray(list), sort);
    };
    patched = true;
    return true;
  }

  /* 同上：论坛列表的渲染也防一手，万一别处还是塞了对象进来 */
  function patchListHtml() {
    var orig = null;
    try { orig = window.forumListHtml; } catch (e) { }
    if (typeof orig !== 'function') return;
    if (orig.__safeWrapped) return;
    var wrapped = function (list, uid) {
      return orig(toArray(list), uid);
    };
    wrapped.__safeWrapped = true;
    try { window.forumListHtml = wrapped; } catch (e) { }
  }

  function run() {
    patchSort();
    patchListHtml();
  }

  run();
  /* app.js 可能比这个文件晚一点就绪，补几次 */
  document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 300);
  setTimeout(run, 1200);
})();
