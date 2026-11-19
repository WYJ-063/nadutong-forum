var QRCode;(function(){function a(a2){this.mode=c.MODE_8BIT_BYTE,this.data=a2,this.parsedData=[];for(var b2=[],d2=0,e2=this.data.length;e2>d2;d2++){var f2=this.data.charCodeAt(d2);f2>65536?(b2[0]=240|(1835008&f2)>>>18,b2[1]=128|(258048&f2)>>>12,b2[2]=128|(4032&f2)>>>6,b2[3]=128|63&f2):f2>2048?(b2[0]=224|(61440&f2)>>>12,b2[1]=128|(4032&f2)>>>6,b2[2]=128|63&f2):f2>128?(b2[0]=192|(1984&f2)>>>6,b2[1]=128|63&f2):b2[0]=f2,this.parsedData=this.parsedData.concat(b2)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a2,b2){this.typeNumber=a2,this.errorCorrectLevel=b2,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a2,b2){if(a2.length==null)throw new Error(a2.length+"/"+b2);for(var c2=0;c2<a2.length&&a2[c2]==0;)c2++;this.num=new Array(a2.length-c2+b2);for(var d2=0;d2<a2.length-c2;d2++)this.num[d2]=a2[d2+c2]}function j(a2,b2){this.totalCount=a2,this.dataCount=b2}function k(){this.buffer=[],this.length=0}function m(){return typeof CanvasRenderingContext2D!="undefined"}function n(){var a2=!1,b2=navigator.userAgent;return/android/i.test(b2)&&(a2=!0,aMat=b2.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a2=parseFloat(aMat[1]))),a2}function r(a2,b2){for(var c2=1,e2=s(a2),f2=0,g2=l.length;g2>=f2;f2++){var h2=0;switch(b2){case d.L:h2=l[f2][0];break;case d.M:h2=l[f2][1];break;case d.Q:h2=l[f2][2];break;case d.H:h2=l[f2][3]}if(h2>=e2)break;c2++}if(c2>l.length)throw new Error("Too long data");return c2}function s(a2){var b2=encodeURI(a2).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b2.length+(b2.length!=a2?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a2){for(var b2=0,c2=this.parsedData.length;c2>b2;b2++)a2.put(this.parsedData[b2],8)}},b.prototype={addData:function(b2){var c2=new a(b2);this.dataList.push(c2),this.dataCache=null},isDark:function(a2,b2){if(0>a2||this.moduleCount<=a2||0>b2||this.moduleCount<=b2)throw new Error(a2+","+b2);return this.modules[a2][b2]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a2,c2){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d2=0;d2<this.moduleCount;d2++){this.modules[d2]=new Array(this.moduleCount);for(var e2=0;e2<this.moduleCount;e2++)this.modules[d2][e2]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a2,c2),this.typeNumber>=7&&this.setupTypeNumber(a2),this.dataCache==null&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c2)},setupPositionProbePattern:function(a2,b2){for(var c2=-1;7>=c2;c2++)if(!(-1>=a2+c2||this.moduleCount<=a2+c2))for(var d2=-1;7>=d2;d2++)-1>=b2+d2||this.moduleCount<=b2+d2||(this.modules[a2+c2][b2+d2]=c2>=0&&6>=c2&&(d2==0||d2==6)||d2>=0&&6>=d2&&(c2==0||c2==6)||c2>=2&&4>=c2&&d2>=2&&4>=d2)},getBestMaskPattern:function(){for(var a2=0,b2=0,c2=0;8>c2;c2++){this.makeImpl(!0,c2);var d2=f.getLostPoint(this);(c2==0||a2>d2)&&(a2=d2,b2=c2)}return b2},createMovieClip:function(a2,b2,c2){var d2=a2.createEmptyMovieClip(b2,c2),e2=1;this.make();for(var f2=0;f2<this.modules.length;f2++)for(var g2=f2*e2,h2=0;h2<this.modules[f2].length;h2++){var i2=h2*e2,j2=this.modules[f2][h2];j2&&(d2.beginFill(0,100),d2.moveTo(i2,g2),d2.lineTo(i2+e2,g2),d2.lineTo(i2+e2,g2+e2),d2.lineTo(i2,g2+e2),d2.endFill())}return d2},setupTimingPattern:function(){for(var a2=8;a2<this.moduleCount-8;a2++)this.modules[a2][6]==null&&(this.modules[a2][6]=a2%2==0);for(var b2=8;b2<this.moduleCount-8;b2++)this.modules[6][b2]==null&&(this.modules[6][b2]=b2%2==0)},setupPositionAdjustPattern:function(){for(var a2=f.getPatternPosition(this.typeNumber),b2=0;b2<a2.length;b2++)for(var c2=0;c2<a2.length;c2++){var d2=a2[b2],e2=a2[c2];if(this.modules[d2][e2]==null)for(var g2=-2;2>=g2;g2++)for(var h2=-2;2>=h2;h2++)this.modules[d2+g2][e2+h2]=g2==-2||g2==2||h2==-2||h2==2||g2==0&&h2==0}},setupTypeNumber:function(a2){for(var b2=f.getBCHTypeNumber(this.typeNumber),c2=0;18>c2;c2++){var d2=!a2&&(1&b2>>c2)==1;this.modules[Math.floor(c2/3)][c2%3+this.moduleCount-8-3]=d2}for(var c2=0;18>c2;c2++){var d2=!a2&&(1&b2>>c2)==1;this.modules[c2%3+this.moduleCount-8-3][Math.floor(c2/3)]=d2}},setupTypeInfo:function(a2,b2){for(var c2=this.errorCorrectLevel<<3|b2,d2=f.getBCHTypeInfo(c2),e2=0;15>e2;e2++){var g2=!a2&&(1&d2>>e2)==1;6>e2?this.modules[e2][8]=g2:8>e2?this.modules[e2+1][8]=g2:this.modules[this.moduleCount-15+e2][8]=g2}for(var e2=0;15>e2;e2++){var g2=!a2&&(1&d2>>e2)==1;8>e2?this.modules[8][this.moduleCount-e2-1]=g2:9>e2?this.modules[8][15-e2-1+1]=g2:this.modules[8][15-e2-1]=g2}this.modules[this.moduleCount-8][8]=!a2},mapData:function(a2,b2){for(var c2=-1,d2=this.moduleCount-1,e2=7,g2=0,h2=this.moduleCount-1;h2>0;h2-=2)for(h2==6&&h2--;;){for(var i2=0;2>i2;i2++)if(this.modules[d2][h2-i2]==null){var j2=!1;g2<a2.length&&(j2=(1&a2[g2]>>>e2)==1);var k2=f.getMask(b2,d2,h2-i2);k2&&(j2=!j2),this.modules[d2][h2-i2]=j2,e2--,e2==-1&&(g2++,e2=7)}if(d2+=c2,0>d2||this.moduleCount<=d2){d2-=c2,c2=-c2;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a2,c2,d2){for(var e2=j.getRSBlocks(a2,c2),g2=new k,h2=0;h2<d2.length;h2++){var i2=d2[h2];g2.put(i2.mode,4),g2.put(i2.getLength(),f.getLengthInBits(i2.mode,a2)),i2.write(g2)}for(var l2=0,h2=0;h2<e2.length;h2++)l2+=e2[h2].dataCount;if(g2.getLengthInBits()>8*l2)throw new Error("code length overflow. ("+g2.getLengthInBits()+">"+8*l2+")");for(g2.getLengthInBits()+4<=8*l2&&g2.put(0,4);g2.getLengthInBits()%8!=0;)g2.putBit(!1);for(;!(g2.getLengthInBits()>=8*l2||(g2.put(b.PAD0,8),g2.getLengthInBits()>=8*l2));)g2.put(b.PAD1,8);return b.createBytes(g2,e2)},b.createBytes=function(a2,b2){for(var c2=0,d2=0,e2=0,g2=new Array(b2.length),h2=new Array(b2.length),j2=0;j2<b2.length;j2++){var k2=b2[j2].dataCount,l2=b2[j2].totalCount-k2;d2=Math.max(d2,k2),e2=Math.max(e2,l2),g2[j2]=new Array(k2);for(var m2=0;m2<g2[j2].length;m2++)g2[j2][m2]=255&a2.buffer[m2+c2];c2+=k2;var n2=f.getErrorCorrectPolynomial(l2),o2=new i(g2[j2],n2.getLength()-1),p2=o2.mod(n2);h2[j2]=new Array(n2.getLength()-1);for(var m2=0;m2<h2[j2].length;m2++){var q2=m2+p2.getLength()-h2[j2].length;h2[j2][m2]=q2>=0?p2.get(q2):0}}for(var r2=0,m2=0;m2<b2.length;m2++)r2+=b2[m2].totalCount;for(var s2=new Array(r2),t=0,m2=0;d2>m2;m2++)for(var j2=0;j2<b2.length;j2++)m2<g2[j2].length&&(s2[t++]=g2[j2][m2]);for(var m2=0;e2>m2;m2++)for(var j2=0;j2<b2.length;j2++)m2<h2[j2].length&&(s2[t++]=h2[j2][m2]);return s2};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a2){for(var b2=a2<<10;f.getBCHDigit(b2)-f.getBCHDigit(f.G15)>=0;)b2^=f.G15<<f.getBCHDigit(b2)-f.getBCHDigit(f.G15);return(a2<<10|b2)^f.G15_MASK},getBCHTypeNumber:function(a2){for(var b2=a2<<12;f.getBCHDigit(b2)-f.getBCHDigit(f.G18)>=0;)b2^=f.G18<<f.getBCHDigit(b2)-f.getBCHDigit(f.G18);return a2<<12|b2},getBCHDigit:function(a2){for(var b2=0;a2!=0;)b2++,a2>>>=1;return b2},getPatternPosition:function(a2){return f.PATTERN_POSITION_TABLE[a2-1]},getMask:function(a2,b2,c2){switch(a2){case e.PATTERN000:return(b2+c2)%2==0;case e.PATTERN001:return b2%2==0;case e.PATTERN010:return c2%3==0;case e.PATTERN011:return(b2+c2)%3==0;case e.PATTERN100:return(Math.floor(b2/2)+Math.floor(c2/3))%2==0;case e.PATTERN101:return b2*c2%2+b2*c2%3==0;case e.PATTERN110:return(b2*c2%2+b2*c2%3)%2==0;case e.PATTERN111:return(b2*c2%3+(b2+c2)%2)%2==0;default:throw new Error("bad maskPattern:"+a2)}},getErrorCorrectPolynomial:function(a2){for(var b2=new i([1],0),c2=0;a2>c2;c2++)b2=b2.multiply(new i([1,g.gexp(c2)],0));return b2},getLengthInBits:function(a2,b2){if(b2>=1&&10>b2)switch(a2){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a2)}else if(27>b2)switch(a2){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a2)}else{if(!(41>b2))throw new Error("type:"+b2);switch(a2){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a2)}}},getLostPoint:function(a2){for(var b2=a2.getModuleCount(),c2=0,d2=0;b2>d2;d2++)for(var e2=0;b2>e2;e2++){for(var f2=0,g2=a2.isDark(d2,e2),h2=-1;1>=h2;h2++)if(!(0>d2+h2||d2+h2>=b2))for(var i2=-1;1>=i2;i2++)0>e2+i2||e2+i2>=b2||(h2!=0||i2!=0)&&g2==a2.isDark(d2+h2,e2+i2)&&f2++;f2>5&&(c2+=3+f2-5)}for(var d2=0;b2-1>d2;d2++)for(var e2=0;b2-1>e2;e2++){var j2=0;a2.isDark(d2,e2)&&j2++,a2.isDark(d2+1,e2)&&j2++,a2.isDark(d2,e2+1)&&j2++,a2.isDark(d2+1,e2+1)&&j2++,(j2==0||j2==4)&&(c2+=3)}for(var d2=0;b2>d2;d2++)for(var e2=0;b2-6>e2;e2++)a2.isDark(d2,e2)&&!a2.isDark(d2,e2+1)&&a2.isDark(d2,e2+2)&&a2.isDark(d2,e2+3)&&a2.isDark(d2,e2+4)&&!a2.isDark(d2,e2+5)&&a2.isDark(d2,e2+6)&&(c2+=40);for(var e2=0;b2>e2;e2++)for(var d2=0;b2-6>d2;d2++)a2.isDark(d2,e2)&&!a2.isDark(d2+1,e2)&&a2.isDark(d2+2,e2)&&a2.isDark(d2+3,e2)&&a2.isDark(d2+4,e2)&&!a2.isDark(d2+5,e2)&&a2.isDark(d2+6,e2)&&(c2+=40);for(var k2=0,e2=0;b2>e2;e2++)for(var d2=0;b2>d2;d2++)a2.isDark(d2,e2)&&k2++;var l2=Math.abs(100*k2/b2/b2-50)/5;return c2+=10*l2}},g={glog:function(a2){if(1>a2)throw new Error("glog("+a2+")");return g.LOG_TABLE[a2]},gexp:function(a2){for(;0>a2;)a2+=255;for(;a2>=256;)a2-=255;return g.EXP_TABLE[a2]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a2){return this.num[a2]},getLength:function(){return this.num.length},multiply:function(a2){for(var b2=new Array(this.getLength()+a2.getLength()-1),c2=0;c2<this.getLength();c2++)for(var d2=0;d2<a2.getLength();d2++)b2[c2+d2]^=g.gexp(g.glog(this.get(c2))+g.glog(a2.get(d2)));return new i(b2,0)},mod:function(a2){if(this.getLength()-a2.getLength()<0)return this;for(var b2=g.glog(this.get(0))-g.glog(a2.get(0)),c2=new Array(this.getLength()),d2=0;d2<this.getLength();d2++)c2[d2]=this.get(d2);for(var d2=0;d2<a2.getLength();d2++)c2[d2]^=g.gexp(g.glog(a2.get(d2))+b2);return new i(c2,0).mod(a2)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a2,b2){var c2=j.getRsBlockTable(a2,b2);if(c2==null)throw new Error("bad rs block @ typeNumber:"+a2+"/errorCorrectLevel:"+b2);for(var d2=c2.length/3,e2=[],f2=0;d2>f2;f2++)for(var g2=c2[3*f2+0],h2=c2[3*f2+1],i2=c2[3*f2+2],k2=0;g2>k2;k2++)e2.push(new j(h2,i2));return e2},j.getRsBlockTable=function(a2,b2){switch(b2){case d.L:return j.RS_BLOCK_TABLE[4*(a2-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a2-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a2-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a2-1)+3];default:return}},k.prototype={get:function(a2){var b2=Math.floor(a2/8);return(1&this.buffer[b2]>>>7-a2%8)==1},put:function(a2,b2){for(var c2=0;b2>c2;c2++)this.putBit((1&a2>>>b2-c2-1)==1)},getLengthInBits:function(){return this.length},putBit:function(a2){var b2=Math.floor(this.length/8);this.buffer.length<=b2&&this.buffer.push(0),a2&&(this.buffer[b2]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a2=function(a3,b2){this._el=a3,this._htOption=b2};return a2.prototype.draw=function(a3){function g2(a4,b3){var c3=document.createElementNS("http://www.w3.org/2000/svg",a4);for(var d3 in b3)b3.hasOwnProperty(d3)&&c3.setAttribute(d3,b3[d3]);return c3}var b2=this._htOption,c2=this._el,d2=a3.getModuleCount();Math.floor(b2.width/d2),Math.floor(b2.height/d2),this.clear();var h2=g2("svg",{viewBox:"0 0 "+String(d2)+" "+String(d2),width:"100%",height:"100%",fill:b2.colorLight});h2.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c2.appendChild(h2),h2.appendChild(g2("rect",{fill:b2.colorDark,width:"1",height:"1",id:"template"}));for(var i2=0;d2>i2;i2++)for(var j2=0;d2>j2;j2++)if(a3.isDark(i2,j2)){var k2=g2("use",{x:String(i2),y:String(j2)});k2.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h2.appendChild(k2)}},a2.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a2}(),p=document.documentElement.tagName.toLowerCase()==="svg",q=p?o:m()?function(){function a2(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d2(a3,b3){var c3=this;if(c3._fFail=b3,c3._fSuccess=a3,c3._bSupportDataURI===null){var d3=document.createElement("img"),e3=function(){c3._bSupportDataURI=!1,c3._fFail&&_fFail.call(c3)},f2=function(){c3._bSupportDataURI=!0,c3._fSuccess&&c3._fSuccess.call(c3)};return d3.onabort=e3,d3.onerror=e3,d3.onload=f2,d3.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c3._bSupportDataURI===!0&&c3._fSuccess?c3._fSuccess.call(c3):c3._bSupportDataURI===!1&&c3._fFail&&c3._fFail.call(c3)}if(this._android&&this._android<=2.1){var b2=1/window.devicePixelRatio,c2=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a3,d3,e3,f2,g2,h2,i2,j2){if("nodeName"in a3&&/img/i.test(a3.nodeName))for(var l2=arguments.length-1;l2>=1;l2--)arguments[l2]=arguments[l2]*b2;else typeof j2=="undefined"&&(arguments[1]*=b2,arguments[2]*=b2,arguments[3]*=b2,arguments[4]*=b2);c2.apply(this,arguments)}}var e2=function(a3,b3){this._bIsPainted=!1,this._android=n(),this._htOption=b3,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b3.width,this._elCanvas.height=b3.height,a3.appendChild(this._elCanvas),this._el=a3,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e2.prototype.draw=function(a3){var b3=this._elImage,c3=this._oContext,d3=this._htOption,e3=a3.getModuleCount(),f2=d3.width/e3,g2=d3.height/e3,h2=Math.round(f2),i2=Math.round(g2);b3.style.display="none",this.clear();for(var j2=0;e3>j2;j2++)for(var k2=0;e3>k2;k2++){var l2=a3.isDark(j2,k2),m2=k2*f2,n2=j2*g2;c3.strokeStyle=l2?d3.colorDark:d3.colorLight,c3.lineWidth=1,c3.fillStyle=l2?d3.colorDark:d3.colorLight,c3.fillRect(m2,n2,f2,g2),c3.strokeRect(Math.floor(m2)+.5,Math.floor(n2)+.5,h2,i2),c3.strokeRect(Math.ceil(m2)-.5,Math.ceil(n2)-.5,h2,i2)}this._bIsPainted=!0},e2.prototype.makeImage=function(){this._bIsPainted&&d2.call(this,a2)},e2.prototype.isPainted=function(){return this._bIsPainted},e2.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e2.prototype.round=function(a3){return a3&&Math.floor(1e3*a3)/1e3},e2}():function(){var a2=function(a3,b2){this._el=a3,this._htOption=b2};return a2.prototype.draw=function(a3){for(var b2=this._htOption,c2=this._el,d2=a3.getModuleCount(),e2=Math.floor(b2.width/d2),f2=Math.floor(b2.height/d2),g2=['<table style="border:0;border-collapse:collapse;">'],h2=0;d2>h2;h2++){g2.push("<tr>");for(var i2=0;d2>i2;i2++)g2.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e2+"px;height:"+f2+"px;background-color:"+(a3.isDark(h2,i2)?b2.colorDark:b2.colorLight)+';"></td>');g2.push("</tr>")}g2.push("</table>"),c2.innerHTML=g2.join("");var j2=c2.childNodes[0],k2=(b2.width-j2.offsetWidth)/2,l2=(b2.height-j2.offsetHeight)/2;k2>0&&l2>0&&(j2.style.margin=l2+"px "+k2+"px")},a2.prototype.clear=function(){this._el.innerHTML=""},a2}();QRCode=function(a2,b2){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},typeof b2=="string"&&(b2={text:b2}),b2)for(var c2 in b2)this._htOption[c2]=b2[c2];typeof a2=="string"&&(a2=document.getElementById(a2)),this._android=n(),this._el=a2,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a2){this._oQRCode=new b(r(a2,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a2),this._oQRCode.make(),this._el.title=a2,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){typeof this._oDrawing.makeImage=="function"&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d})(),function(){"use strict";if(window.__ndtNetResilience||(window.__ndtNetResilience=1,!window.fetch))return;var KEY="ndt-cloud-user-cache",RE=/\/auth\/me(\?|$)/,TIMEOUT=12e3;function readCache(){try{var raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):null}catch(e){return null}}function saveCache(user){if(!(!user||!user.id))try{localStorage.setItem(KEY,JSON.stringify(user))}catch(e){}}function offlineResponse(user){return new Response(JSON.stringify({user,offline:!0,degraded:!0}),{status:200,headers:{"Content-Type":"application/json"}})}var orig=window.fetch;window.fetch=function(input,init){var url="";try{url=typeof input=="string"?input:input&&input.url||""}catch(e){url=""}if(!RE.test(url))return orig.apply(this,arguments);var self=this,opts=init,ctrl=null,timer=null,canAbort=typeof AbortController=="function"&&opts&&typeof opts=="object"&&!opts.signal;if(canAbort)try{ctrl=new AbortController,opts=Object.assign({},opts,{signal:ctrl.signal})}catch(e){ctrl=null}ctrl&&(timer=setTimeout(function(){try{ctrl.abort()}catch(e){}},TIMEOUT));var req;try{req=orig.call(self,input,opts)}catch(e){req=Promise.reject(e)}return req.then(function(res){if(timer&&clearTimeout(timer),res&&res.status===401)return res;if(!res||res.status>=500){var cached=readCache();return cached?offlineResponse(cached):res}if(res.ok&&typeof res.clone=="function")try{res.clone().json().then(function(d){d&&d.user&&saveCache(d.user)}).catch(function(){})}catch(e){}return res},function(err){timer&&clearTimeout(timer);var cached=readCache();if(cached)return offlineResponse(cached);throw err})}}();const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)],esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]),genId=(p="id")=>p+"-"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);function nowStr(){const d=new Date,p=n=>String(n).padStart(2,"0");return`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`}let _audioCtx=null,_lastRecvSoundAt=0;function playTone(freq,duration,type,volume,delay){if(!(DB.data&&DB.data.settings&&DB.data.settings.soundOn===!1))try{_audioCtx||(_audioCtx=new(window.AudioContext||window.webkitAudioContext)),_audioCtx.state==="suspended"&&_audioCtx.resume();const t=_audioCtx.currentTime+(delay||0),osc=_audioCtx.createOscillator(),g=_audioCtx.createGain();osc.type=type||"sine",osc.frequency.value=freq,g.gain.setValueAtTime(volume||.12,t),g.gain.exponentialRampToValueAtTime(.001,t+duration),osc.connect(g),g.connect(_audioCtx.destination),osc.start(t),osc.stop(t+duration+.02)}catch(e){}}function playSendSound(){playTone(520,.08,"triangle",.1),playTone(760,.1,"triangle",.07,.05)}function playRecvSound(){const now=Date.now();now-_lastRecvSoundAt<1200||(_lastRecvSoundAt=now,playTone(880,.12,"sine",.1),playTone(1320,.16,"sine",.06,.08))}function relTime(t){if(!t)return"";const d=new Date(String(t).replace(" ","T"));if(Number.isNaN(d.getTime()))return String(t);const diff=(Date.now()-d.getTime())/1e3;return diff<60?"刚刚":diff<3600?Math.floor(diff/60)+"分钟前":diff<86400?Math.floor(diff/3600)+"小时前":diff<2592e3?Math.floor(diff/86400)+"天前":diff<31536e3?Math.floor(diff/2592e3)+"个月前":Math.floor(diff/31536e3)+"年前"}function toast(msg,type=""){const w=$("#toast"),el=document.createElement("div");el.className="toast "+(type?"t-"+type:""),el.textContent=msg,w.appendChild(el),setTimeout(()=>{el.style.opacity="0",el.style.transition=".3s",setTimeout(()=>el.remove(),300)},2400)}function modal(html){return new Promise(resolve=>{const mask=document.createElement("div");mask.className="modal-mask",mask.innerHTML=`<div class="modal">${html}</div>`,document.body.appendChild(mask),mask._close=v=>{mask.dataset.closing!=="1"&&(mask.dataset.closing="1",resolve(v),setTimeout(()=>mask.remove(),0))},mask.addEventListener("click",e=>{e.target===mask&&mask._close(null)})})}function confirmDlg(title,body){return modal(`<h3>${esc(title)}</h3><div class="m-body">${esc(body)}</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">确定</button></div>`).then(v=>v==="yes")}function avText(name){return(name||"?").slice(0,1).toUpperCase()}function avHtml(user,cls=""){return user&&user.avatar&&user.avatar.startsWith("http")?`<img class="${cls}" src="${esc(user.avatar)}" alt="">`:`<span class="${cls}">${esc(avText(user?user.name:"?"))}</span>`}const ICONS={users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',edit:'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',settings:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',help:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',more:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',back:'<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',moon:'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',message:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',ban:'<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',star:'<path fill="currentColor" stroke="none" d="M11.5 2.7a.55.55 0 0 1 .9 0l2.86 5.88 6.48.92a.55.55 0 0 1 .3.95l-4.7 4.55 1.12 6.46a.55.55 0 0 1-.8.58L12 18.9l-5.8 3.05a.55.55 0 0 1-.8-.58l1.12-6.46-4.7-4.55a.55.55 0 0 1 .3-.95l6.48-.92Z"/>',redpacket:'<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M4 7.5c4 3 12 3 16 0"/><circle cx="12" cy="13.5" r="1.3"/>',card:'<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',image:'<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',smile:'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',play:'<polygon fill="currentColor" stroke="none" points="6 3 20 12 6 21 6 3"/>',send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',members:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',megaphone:'<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',briefcase:'<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',backspace:'<path d="M20 5H8l-6 7 6 7h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/><line x1="18" x2="12" y1="9" y2="15"/><line x1="12" x2="18" y1="9" y2="15"/>'};function ic(name,size=20,extra=""){return`<svg class="ic" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${ICONS[name]||""}</svg>`}function levelBadge(level,levelName){return level?`<span class="lv-badge ${level>=18?"lv-top":level>=12?"lv-hi":""}" title="${esc(levelName||"")}">Lv${level}${levelName?`<span class="lv-bn">${esc(levelName)}</span>`:""}</span>`:""}function badgeHtml(badge){if(!badge||!badge.name)return"";const eff=badge.effect!=null?String(badge.effect):"0",icon=badge.icon?`<span>${esc(badge.icon)}</span>`:"";return`<span class="lv-badge bd-badge bd-eff-${esc(eff)}" title="${esc(badge.desc||badge.name)}">${icon} ${esc(badge.name)}</span>`}function avatarCircle(name,avatar,cls=""){return avatar&&(avatar.startsWith("data:")||avatar.startsWith("http"))?`<span class="mini-av has-img ${cls}"><img src="${esc(avatar)}" alt=""></span>`:`<span class="mini-av ${cls}">${esc(avText(name))}</span>`}function makeRoom(name){return{id:genId("room"),name,members:[],messages:[],mode:"create",speed:"natural",proactive:!0}}const DB_KEY="ndt_db_v1",Store={idb:null,_writeQueue:Promise.resolve(),open(){return new Promise(res=>{try{if(typeof indexedDB=="undefined"){this.idb=null,res();return}const r=indexedDB.open("ndt_store",1);r.onupgradeneeded=()=>{try{r.result.objectStoreNames.contains("kv")||r.result.createObjectStore("kv")}catch(e){}},r.onsuccess=()=>{this.idb=r.result,res()},r.onerror=()=>{this.idb=null,res()},r.onblocked=()=>{this.idb=null,res()}}catch(e){this.idb=null,res()}})},async set(k,v){let localOK=!1,idbOK=!1;try{localStorage.setItem(k,v),localOK=!0}catch(e){}if(this.idb){const write=()=>new Promise((resolve,reject)=>{let tx;try{tx=this.idb.transaction("kv","readwrite"),tx.objectStore("kv").put(v,k)}catch(e){reject(e);return}tx.oncomplete=()=>resolve(),tx.onerror=()=>reject(tx.error||new Error("IndexedDB 写入失败")),tx.onabort=()=>reject(tx.error||new Error("IndexedDB 写入中止"))}),pending=this._writeQueue.then(write);this._writeQueue=pending.catch(()=>{});try{await pending,idbOK=!0}catch(e){}}return localOK||idbOK},async get(k){if(this.idb)try{const value=await new Promise((resolve,reject)=>{const rq=this.idb.transaction("kv","readonly").objectStore("kv").get(k);rq.onsuccess=()=>resolve(rq.result),rq.onerror=()=>reject(rq.error)});if(value!=null)return value}catch(e){}try{return localStorage.getItem(k)}catch(e){return null}}},DB={data:null,async load(){const raw=await Store.get(DB_KEY);if(raw)try{this.data=JSON.parse(raw)}catch(e){try{await Store.set(DB_KEY+"_corrupt_backup_"+Date.now(),String(raw))}catch(_e){}this.data=null,toast("本地数据读取异常：已尝试备份损坏数据，并载入初始数据。请检查后尽快导出数据。","warn")}this.data||(this.data=seedDB()),this.migrate(),await this.persist()},migrate(){const d=this.data;(d.theme==="night"||d.theme==="terminal")&&(d.theme=d.theme==="night"?"default":"cyber"),d.proactiveSessionToken||(d.proactiveSessionToken=genId("login")),d.chats||(d.chats={}),Array.isArray(d.posts)||(d.posts=[]),Array.isArray(d.answers)||(d.answers=[]),Array.isArray(d.forumNotices)||(d.forumNotices=[]);const legacySeedIds=new Set(["p-1","p-2","p-3","p-4","p-5","p-6","p-7","p-8","p-9"]),legacySeedAuthors=new Set(["徐三","徐四","诸葛青","张楚岚","王也","冯宝宝","张灵玉","论坛管理员"]);if(d.posts.some(p=>legacySeedIds.has(p==null?void 0:p.id)&&legacySeedAuthors.has((p==null?void 0:p.authorName)||""))&&!d.posts.some(p=>(p==null?void 0:p.id)==="p-20")){const fresh=seedDB();d.posts=d.posts.filter(p=>!legacySeedIds.has(p==null?void 0:p.id)).concat(fresh.posts),d.answers=d.answers.filter(a=>!legacySeedIds.has(a==null?void 0:a.postId)),d.answers.push(...fresh.answers)}else{const oldGossipIds=new Set(Array.from({length:8},(_,i)=>`p-${21+i}`)),oldGossipAuthors=new Set(["吃瓜不嫌事大","龙虎山游客转异人","山门口卖茶的","匿名路过的道门弟子","武当山脚下的包子铺","术数爱好者小青","今天也没转正","算盘成精的散修"]),removedIds=new Set(d.posts.filter(p=>oldGossipIds.has(p==null?void 0:p.id)&&oldGossipAuthors.has((p==null?void 0:p.authorName)||"")).map(p=>p.id));removedIds.size&&(d.posts=d.posts.filter(p=>!removedIds.has(p==null?void 0:p.id)),d.answers=d.answers.filter(a=>!removedIds.has(a==null?void 0:a.postId)));const fresh=seedDB(),newSeedIds=new Set(["p-29","p-30"]),missingPosts=fresh.posts.filter(p=>newSeedIds.has(p.id)&&!d.posts.some(old=>(old==null?void 0:old.id)===p.id));if(missingPosts.length){d.posts.push(...missingPosts);const missingIds=new Set(missingPosts.map(p=>p.id));d.answers.push(...fresh.answers.filter(a=>missingIds.has(a.postId)&&!d.answers.some(old=>(old==null?void 0:old.id)===a.id)))}const seedPostIds=new Set(Array.from({length:20},(_,i)=>`p-${i+1}`)),hasAllSeedPosts=Array.from(seedPostIds).every(id=>d.posts.some(p=>(p==null?void 0:p.id)===id)),hasSeedAnswers=d.answers.some(a=>String((a==null?void 0:a.id)||"").startsWith("seed-a-p-"));hasAllSeedPosts&&!hasSeedAnswers&&d.answers.push(...fresh.answers.filter(a=>!newSeedIds.has(a.postId)))}if(Array.isArray(d.users)||(d.users=[]),Array.isArray(d.packages)||(d.packages=[]),Array.isArray(d.boards)||(d.boards=["公告","异人讨论","功法交流","天下见闻","求助","灌水"]),Array.isArray(d.archives)||(d.archives=[]),Array.isArray(d.events)||(d.events=[]),Array.isArray(d.library)||(d.library=[]),Array.isArray(d.publicLibrary)||(d.publicLibrary=[{id:"pub-1",cat:"势力与流派",title:"龙虎山天师府",summary:"正一道重要传承之一，异人界常以符箓、雷法等形象呈现。",content:`【条目概览】龙虎山天师府与正一传统关系密切。在《一人之下》的世界观中，天师府是重要门派，重视传承、戒律与个人修为。
【常见关键词】天师、符箓、雷法、罗天大醮。
【档案备注】本条收录门派源流、常见术法与异人界往来记录；人物经历、能力与事件可继续通过内部档案交叉查证。`,tags:"龙虎山,天师府,正一,门派"},{id:"pub-2",cat:"势力与流派",title:"武当山与内家修习",summary:"与道教文化、内丹思想及传统武术传承联系密切。",content:`【条目概览】武当山是中国著名道教圣地之一，也与传统武术文化紧密相关。不同历史时期的修习、宗派和武术传承各有脉络，不宜简单视为单一体系。
【异人界索引】武当传承重视清静修持与内家功法，异人门人修行路数各有差异，具体人物与术法以本库档案为准。`,tags:"武当,道教,武术,流派"},{id:"pub-3",cat:"势力与流派",title:"全性",summary:"异人界中的传统组织，成员来历复杂，行事风格各有差异。",content:`【条目概览】全性为异人界长期活动的组织，成员来历、立场与行事方式各不相同，宜结合人物经历与事件档案判断。
【检索提示】阅读相关人物档案时，可结合人物经历、师承、事件记录交叉理解，避免只凭单一标签判断人物。`,tags:"全性,异人组织,人物关系"},{id:"pub-4",cat:"人物志",title:"无根生",summary:"与甲申之乱及八奇技起源线索相关的重要人物。",content:`【人物概览】无根生是《一人之下》世界观中的关键人物，其经历与甲申之乱、三十六贼及八奇技的来历存在重要关联。
【阅读方向】建议结合甲申之乱、三十六贼、八奇技等条目阅读；涉及未揭晓内容时，以原作已公开信息为准。`,tags:"无根生,甲申之乱,八奇技,人物"},{id:"pub-5",cat:"文献与民俗",title:"道教典籍索引：道德经",summary:"道家思想经典，常被用于理解中国传统思想文化。",content:`【文献简介】《道德经》是中国古代重要思想典籍，围绕“道”“德”、治理、处世与自然观展开。它属于思想文献，不是异人术法操作手册。
【阅读关键词】道、自然、无为、柔弱。
【世界观关联】可作为角色背景、门派理念与台词创作的文化参考。`,tags:"道教文化,道德经,典籍,思想"},{id:"pub-6",cat:"文献与民俗",title:"佛教基础索引：因果、慈悲与戒律",summary:"用于了解佛教基本观念的入门索引。",content:`【条目简介】佛教内部传统丰富，因果、慈悲、戒律、缘起等概念在不同宗派和文献中的阐释各有侧重。
【阅读提示】不要将佛教、道教与民间信仰混为一谈；若用于角色设定，可注明具体传统、地域与时代背景。`,tags:"佛教,因果,慈悲,戒律"},{id:"pub-7",cat:"文献与民俗",title:"民间信仰与“出马仙”文化",summary:"东北部分地区民间信仰与地方叙事中的相关称谓。",content:`【条目简介】“出马仙”通常出现在东北地区部分民间信仰与民俗叙事中，涉及地方仪式、口述传统及对仙家等观念的理解。不同家庭、地区和讲述者之间差异很大。
【记录原则】将其作为民俗与民间信仰条目介绍，不把不同地域实践概括成统一教派，也不将传说内容当作经科学验证的事实。
【关联线索】可结合地方传闻、家族口述、仪式记录与人物背景互相印证；不同地区的讲述往往存在差异。`,tags:"出马仙,东北民俗,民间信仰,口述传统"},{id:"pub-8",cat:"文献与民俗",title:"异人界名词索引：炁、术、法器",summary:"异人界常用概念的交叉索引，涵盖修行、术法与法器。",content:`【炁】异人修行与运转术法所涉及的核心概念，具体理解因传承而异。
【术】异人施展能力的方式，常与师承、修习路径及个人悟性有关。
【法器】在故事中承载特殊功能的器物。
【归档说明】本词条汇总异人界常用称谓，细节可由各门派谱系与已结案事件进一步补充。`,tags:"炁,术法,法器,设定索引"}]),Array.isArray(d.publicLibrary)){const phraseMoves=[["【档案备注】本条兼顾现实文化背景与作品设定；作品中的具体人物、能力和事件以原作设定为准。","【档案备注】本条收录门派源流、常见术法与异人界往来记录；人物经历、能力与事件可继续通过内部档案交叉查证。"],["【异人界索引】作品中的武当门人和术法属于虚构设定，勿将其直接等同于现实宗教实践。","【异人界索引】武当传承重视清静修持与内家功法，异人门人修行路数各有差异，具体人物与术法以本库档案为准。"],["【条目概览】全性是《一人之下》中的虚构异人组织，成员立场、行事方式并不完全一致。","【条目概览】全性为异人界长期活动的组织，成员来历、立场与行事方式各不相同，宜结合人物经历与事件档案判断。"],["【创作参考】适合用于民俗调查笔记、地方传闻、人物背景与虚构世界观素材。","【关联线索】可结合地方传闻、家族口述、仪式记录与人物背景互相印证；不同地区的讲述往往存在差异。"],["【炁】作品中用于描述异人修行与能力体系的重要概念。","【炁】异人修行与运转术法所涉及的核心概念，具体理解因传承而异。"],["【术】角色施展能力的具体方式，作品中不同门派和人物有不同表达。","【术】异人施展能力的方式，常与师承、修习路径及个人悟性有关。"],["【说明】以上均为作品语境下的整理词条，不等同于现实科学术语或宗教实践的统一定义。","【归档说明】本词条汇总异人界常用称谓，细节可由各门派谱系与已结案事件进一步补充。"]];d.publicLibrary.forEach(entry=>{!entry||typeof entry!="object"||(phraseMoves.forEach(([from,to])=>{typeof entry.content=="string"&&entry.content.includes(from)&&(entry.content=entry.content.replace(from,to))}),entry.id==="pub-3"&&entry.summary==="作品中行事不拘常规、成员背景复杂的异人组织。"&&(entry.summary="异人界中的传统组织，成员来历复杂，行事风格各有差异。"),entry.id==="pub-8"&&entry.summary==="作品世界观常用概念的交叉索引。"&&(entry.summary="异人界常用概念的交叉索引，涵盖修行、术法与法器。"))})}Array.isArray(d.wanted)||(d.wanted=[{id:"w-1",name:"夏禾",code:"ND-WANTED-007",danger:"A级",reward:"¥ 500,000",faction:"全性·四张狂",skill:"刮骨刀：操控情欲",lastSeen:"华北地区",note:"疑似参与多起异人界冲突。请勿擅自接触，发现线索立即上报哪都通。",status:"在逃"},{id:"w-2",name:"吕良",code:"ND-WANTED-009",danger:"B级",reward:"¥ 300,000",faction:"原吕家成员",skill:"明魂术",lastSeen:"行踪不明",note:"掌握记忆相关异术，具有较高情报价值。",status:"在逃"},{id:"w-3",name:"马仙洪",code:"ND-WANTED-010",danger:"S级",reward:"¥ 2,000,000",faction:"碧游村",skill:"神机百炼",lastSeen:"疑似流动",note:"涉嫌制造危险法器与修身炉，严禁个人行动。",status:"在逃"}]),(!d.networks||typeof d.networks!="object")&&(d.networks={});const presetFactionIds=new Set(["fac-root","fac-north","fac-tianshi","fac-wudang","fac-quanxing","fac-tianxia","fac-biyou"]),presetFactionEdgeIds=new Set(["fac-e1","fac-e2","fac-e3","fac-e4","fac-e5"]),presetPeopleIds=new Set(["kp-root","kp-baobao","kp-ye","kp-qing","kp-lingyu","kp-zhang","kp-liujin"]),presetPeopleEdgeIds=new Set(["kp-e1","kp-e2","kp-e3","kp-e4","kp-e5","kp-e6"]);for(const[key,title,presetNodes,presetEdges]of[["factions","势力关系网",presetFactionIds,presetFactionEdgeIds],["keyPeople","重点异人关系网",presetPeopleIds,presetPeopleEdgeIds]]){const net=d.networks[key]&&typeof d.networks[key]=="object"?d.networks[key]:{};net.title=title,Array.isArray(net.nodes)||(net.nodes=[]),Array.isArray(net.edges)||(net.edges=[]),net.nodes=net.nodes.filter(n=>n&&n.id&&!presetNodes.has(n.id));const remainingIds=new Set(net.nodes.map(n=>n.id));net.edges=net.edges.filter(e=>e&&e.id&&!presetEdges.has(e.id)&&remainingIds.has(e.from)&&remainingIds.has(e.to)),net.rootId=null,net.nodes.forEach(n=>{n.root&&delete n.root}),d.networks[key]=net}for(Array.isArray(d.rooms)||(d.room&&Array.isArray(d.room.messages)?(d.room.name="聊天室1",d.room.mode=d.room.mode||"create",d.room.speed=d.room.speed||"natural",d.room.proactive=d.room.proactive!==!1,d.room.id=d.room.id||genId("room"),d.rooms=[d.room]):d.rooms=[makeRoom("聊天室1")]);d.rooms.length<1;)d.rooms.push(makeRoom("聊天室"+(d.rooms.length+1)));delete d.room,d.theme||(d.theme="default"),d.workgroup||(d.workgroup={members:[],messages:[]}),Array.isArray(d.workgroup.members)||(d.workgroup.members=[]),Array.isArray(d.workgroup.messages)||(d.workgroup.messages=[]);const clearReplyLock=box=>{!box||typeof box!="object"||(box.replyPending=!1,box.queuedReply=!1)};Object.values(d.chats).forEach(box=>{clearReplyLock(box),box.unread=Math.max(0,Number(box.unread)||0),box.readNoReply=!!box.readNoReply,Array.isArray(box.messages)||(box.messages=[])}),d.rooms.forEach(box=>{clearReplyLock(box),box.unread=Math.max(0,Number(box.unread)||0),box.readNoReply=!!box.readNoReply,Array.isArray(box.messages)||(box.messages=[])}),clearReplyLock(d.workgroup),d.workgroup.unread=Math.max(0,Number(d.workgroup.unread)||0),d.workgroup.readNoReply=!!d.workgroup.readNoReply,d.workgroup.mode=d.workgroup.mode||"card",d.workgroup.speed=d.workgroup.speed||"natural",d.workgroup.proactive=d.workgroup.proactive!==!1,Array.isArray(d.oa)||(d.oa=[]),d.divination||(d.divination={}),d.codes||(d.codes={emp:"NDT-EMP",mgr:"NDT-MGR",user:"NDT-USER"}),d.codes.user||(d.codes.user="NDT-USER"),d.users.forEach(u=>{Array.isArray(u.cards)||(u.cards=[]),Array.isArray(u.rels)||(u.rels=[])}),d.archives.forEach(r=>{Array.isArray(r.rels)||(r.rels=[])}),(!Array.isArray(d.forumLevels)||d.forumLevels.length<1)&&(d.forumLevels=DEFAULT_FORUM_LEVELS.map(x=>({...x}))),(!d.pointsRule||typeof d.pointsRule!="object")&&(d.pointsRule={...DEFAULT_POINTS_RULE}),d.users.forEach(u=>{Number.isFinite(Number(u.points))||(u.points=0),abilityOf(u)})},save(){return this.persist()},_persistScheduled:!1,_persistWaiters:[],persist(){return new Promise(resolve=>{this._persistWaiters.push(resolve),!this._persistScheduled&&(this._persistScheduled=!0,Promise.resolve().then(()=>this._flushPersist()))})},async _flushPersist(){this._persistScheduled=!1;const waiters=this._persistWaiters.splice(0);let ok=!1;try{const raw=JSON.stringify(this.data);ok=await Store.set(DB_KEY,raw),ok||this._reportPersistError("本地保存失败：浏览器存储不可用或空间不足。请先导出数据，避免关闭页面后丢失修改。")}catch(e){this._reportPersistError("本地数据无法序列化或保存失败。请先导出数据，避免关闭页面后丢失修改。"),ok=!1}waiters.forEach(resolve=>resolve(!!ok)),this._persistWaiters.length&&!this._persistScheduled&&(this._persistScheduled=!0,Promise.resolve().then(()=>this._flushPersist()))},_lastPersistErrorAt:0,_reportPersistError(message){const now=Date.now();now-this._lastPersistErrorAt>5e3&&(this._lastPersistErrorAt=now,toast(message,"err"))},reset(){return this.data=seedDB(),this.migrate(),this.persist()},get user(){return this.data.users.find(u=>u.id===this.data.session)||null},level(){const u=this.user;return u?u.level:0}},Cloud={base:"/api",token:null,user:null,init(){try{this.token=localStorage.getItem("ndt-cloud-token")||null}catch(e){this.token=null}},get connected(){return!!(this.token&&this.user)},async request(path,opts={}){const headers=Object.assign({"Content-Type":"application/json"},opts.headers||{});this.token&&(headers.Authorization="Bearer "+this.token);const url=this.base+path,method=(opts.method||"GET").toUpperCase(),TIMEOUT=2e4,send=async()=>{const ctrl=typeof AbortController=="function"?new AbortController:null,timer=ctrl?setTimeout(()=>{try{ctrl.abort()}catch(e){}},TIMEOUT):null,init=Object.assign({},opts,{headers});ctrl&&!init.signal&&(init.signal=ctrl.signal);let res;try{res=await fetch(url,init)}catch(e){const err=new Error(e&&e.name==="AbortError"?"网络超时，请稍后再试":"无法连接云端（可能离线，或后端未部署/未绑定）");throw err.network=!0,err}finally{timer&&clearTimeout(timer)}const data=await res.json().catch(()=>({}));if(!res.ok){const err=new Error(data&&data.error||"请求失败 ("+res.status+")");throw err.status=res.status,err.network=res.status>=500,err}return data};if(method!=="GET")return await send();try{return await send()}catch(e){if(!e||!e.network)throw e;return await new Promise(r=>setTimeout(r,700)),await send()}},setSession(d){this.token=d.token,this.user=d.user;try{localStorage.setItem("ndt-cloud-token",d.token)}catch(e){}},async register(login,password,name,invite){const payload={login,password,name};invite&&(payload.invite=String(invite).trim().toUpperCase());const d=await this.request("/auth/register",{method:"POST",body:JSON.stringify(payload)});return this.lastInviteBonus=Number(d.inviteBonus)||0,this.setSession(d),this.user},async login(login,password){return this.setSession(await this.request("/auth/login",{method:"POST",body:JSON.stringify({login,password})})),this.user},async refresh(){if(!this.token)return null;try{return this.user=(await this.request("/auth/me")).user,this.user}catch(e){return/未登录|登录/.test(e.message)&&this.clear(),null}},clear(){this.token=null,this.user=null;try{localStorage.removeItem("ndt-cloud-token")}catch(e){}},logout(){this.clear()},async changePassword(oldPassword,newPassword){return await this.request("/auth/password",{method:"POST",body:JSON.stringify({oldPassword,newPassword})})},async updateName(name){const d=await this.request("/users/"+encodeURIComponent(this.user.id)+"/profile",{method:"POST",body:JSON.stringify({name})});return d.user&&(this.user=d.user),d},async resetUserPassword(id,password){return await this.request("/users/"+encodeURIComponent(id),{method:"POST",body:JSON.stringify({action:"resetpass",password})})},async listPosts(board,sort,opts={}){const q=new URLSearchParams;return board&&q.set("board",board),q.set("sort",sort||"latest"),opts.offset&&q.set("offset",opts.offset),opts.limit&&q.set("limit",opts.limit),opts.essence&&q.set("essence","1"),opts.author&&q.set("author",opts.author),await this.request("/posts?"+q.toString())},async search(q){return await this.request("/search?q="+encodeURIComponent(q))},async checkinStatus(){return await this.request("/checkin")},async doCheckin(){return await this.request("/checkin",{method:"POST",body:"{}"})},async essencePost(id,essence){const payload={};return essence!==void 0&&(payload.essence=!!essence),await this.request("/posts/"+encodeURIComponent(id)+"/essence",{method:"POST",body:JSON.stringify(payload)})},async userProfile(id){return await this.request("/users/"+encodeURIComponent(id))},async exportData(){const res=await fetch(this.base+"/admin/export",{headers:this.token?{Authorization:"Bearer "+this.token}:{}});if(!res.ok){const d=await res.json().catch(()=>({}));throw new Error(d.error||"导出失败 ("+res.status+")")}const blob=await res.blob(),name=(res.headers.get("Content-Disposition")||"").match(/filename="?([^"]+)"?/);return{blob,filename:name?name[1]:"nadutong-backup.json"}},async getPost(id){return await this.request("/posts/"+encodeURIComponent(id))},async createPost(board,title,content,poll){const payload={board,title,content};return poll&&(payload.poll=poll),(await this.request("/posts",{method:"POST",body:JSON.stringify(payload)})).post},async editPost(id,title,content){return(await this.request("/posts/"+encodeURIComponent(id)+"/edit",{method:"POST",body:JSON.stringify({title,content})})).post},async postEdits(id){return await this.request("/posts/"+encodeURIComponent(id)+"/edits")},async reply(postId,content,parentId){const payload={content};return parentId&&(payload.parentId=parentId),(await this.request("/posts/"+encodeURIComponent(postId)+"/replies",{method:"POST",body:JSON.stringify(payload)})).reply},async toggleLike(type,id){return(await this.request("/like",{method:"POST",body:JSON.stringify({type,id})})).liked},async deletePost(id){return await this.request("/posts/"+encodeURIComponent(id),{method:"DELETE"})},async deleteReply(id){return await this.request("/replies/"+encodeURIComponent(id),{method:"DELETE"})},async pinPost(id,pinned){const payload={};return pinned!==void 0&&(payload.pinned=!!pinned),await this.request("/posts/"+encodeURIComponent(id)+"/pin",{method:"POST",body:JSON.stringify(payload)})},async moderateUser(id,action){return await this.request("/users/"+encodeURIComponent(id),{method:"POST",body:JSON.stringify({action})})},async listUsers(){return(await this.request("/users")).users},async deleteUser(id){return await this.request("/users/"+encodeURIComponent(id),{method:"DELETE"})},async setRole(id,role){return await this.request("/users/"+encodeURIComponent(id)+"/role",{method:"POST",body:JSON.stringify({role})})},async listBadges(){return(await this.request("/badges")).badges},async getMyBadges(){return(await this.request("/users/me/badges")).badges},async createBadge(payload){return(await this.request("/badges",{method:"POST",body:JSON.stringify(payload)})).badge},async updateBadge(badgeId,payload){return(await this.request("/badges/"+encodeURIComponent(badgeId),{method:"POST",body:JSON.stringify(payload)})).badge},async grantBadge(userId,badgeId){return await this.request("/badges/grant",{method:"POST",body:JSON.stringify({userId,badgeId})})},async equipBadge(badgeId){return await this.request("/users/"+encodeURIComponent(this.user.id)+"/equip",{method:"POST",body:JSON.stringify({badgeId})})},async saveProfile(fields){return(await this.request("/users/"+encodeURIComponent(this.user.id)+"/profile",{method:"POST",body:JSON.stringify(fields)})).profile},async listBoards(){return(await this.request("/boards")).boards},async createBoard(name){return await this.request("/boards",{method:"POST",body:JSON.stringify({name})})},async deleteBoard(name,mode){return await this.request("/boards/"+encodeURIComponent(name),{method:"DELETE",body:JSON.stringify({mode:mode||"move"})})},async votePoll(pollId,optionIds){return(await this.request("/polls/"+encodeURIComponent(pollId)+"/vote",{method:"POST",body:JSON.stringify({optionIds})})).poll},async updateAvatar(dataUrl){return(await this.request("/users/avatar",{method:"POST",body:JSON.stringify({avatar:dataUrl})})).user},notif:{unread:0,total:0,list:[]},async fetchNotifications(filter){const q=new URLSearchParams;filter&&q.set("filter",filter);const d=await this.request("/notifications?"+q.toString());return filter||(this.notif.unread=d.unread,this.notif.total=d.total,this.notif.list=d.notifications),d},async readNotifications(id){return await this.request("/notifications",{method:"POST",body:JSON.stringify({action:"read",id:id||null})})},async readNotificationsForPost(postId){return await this.request("/notifications",{method:"POST",body:JSON.stringify({action:"readPost",postId})})},async clearReadNotifications(){return await this.request("/notifications",{method:"POST",body:JSON.stringify({action:"clear"})})},async pollNotifications(){if(this.connected)try{const d=await this.request("/notifications");this.notif.unread=d.unread,this.notif.total=d.total,this.notif.list=d.notifications}catch(e){}},async pushKey(){return(await this.request("/push/key")).publicKey},async pushSubscribe(subscription){return await this.request("/push/subscribe",{method:"POST",body:JSON.stringify({subscription})})},async pushUnsubscribe(endpoint){return await this.request("/push/unsubscribe",{method:"POST",body:JSON.stringify({endpoint:endpoint||""})})}};function isMentionField(el){return!!(el&&el.tagName==="TEXTAREA"&&(el.id==="ans-body"||el.id==="a-body"||el.classList.contains("ir-body")))}const MentionPicker={el:null,field:null,items:[],index:0,open:!1,trigger:null,debounce:0,reqSeq:0,ensureEl(){if(this.el)return this.el;const el=document.createElement("div");return el.className="mention-picker hide",el.addEventListener("mousedown",e=>e.preventDefault()),el.addEventListener("click",e=>{const b=e.target.closest("[data-midx]");if(!b)return;const i=Number(b.dataset.midx);this.items[i]&&this.choose(this.items[i])}),document.body.appendChild(el),this.el=el,el},readTrigger(field){const pos=field.selectionStart,m=field.value.slice(0,pos).match(/(^|[\s，。、；：!?！？\n\r])@([A-Za-z0-9_\u4e00-\u9fa5]{0,20})$/);if(!m)return null;const query=m[2];return{query,startPos:pos-query.length-1,endPos:pos}},onInput(field){clearTimeout(this.debounce);const tr=this.readTrigger(field);if(!tr){this.hide();return}this.field=field,this.trigger=tr,this.debounce=setTimeout(()=>this.search(tr.query),120)},async search(query){if(!Cloud.connected){this.hide();return}const seq=++this.reqSeq;this.showLoading();try{const d=await Cloud.request("/users/mention?q="+encodeURIComponent(query));if(seq!==this.reqSeq)return;this.items=d.users||[],this.index=0,this.render()}catch(e){seq===this.reqSeq&&this.hide()}},showLoading(){const el=this.ensureEl();el.innerHTML='<div class="mp-loading">正在查找成员…</div>',el.classList.remove("hide"),this.open=!0,this.position()},render(){const el=this.ensureEl();this.items.length?el.innerHTML=this.items.map((u,i)=>`
        <div class="mp-item ${i===this.index?"on":""}" data-midx="${i}">
          <span class="mp-av">${u.avatar?`<img src="${esc(u.avatar)}" alt="">`:`<span>${esc(String(u.name).slice(0,1))}</span>`}</span>
          <span class="mp-name">${esc(u.name)}</span>
          <span class="mp-lv">${esc(u.levelName||"Lv"+u.level)}</span>
        </div>`).join(""):el.innerHTML='<div class="mp-empty">没有找到匹配的成员</div>',el.classList.remove("hide"),this.open=!0,this.position()},position(){const field=this.field;if(!field)return;const st=getComputedStyle(field),r=field.getBoundingClientRect(),mirror=document.createElement("div");["fontFamily","fontSize","fontWeight","fontStyle","letterSpacing","lineHeight","textTransform","wordSpacing","borderTopWidth","borderLeftWidth","borderRightWidth","borderBottomWidth","paddingTop","paddingLeft","paddingRight","paddingBottom","boxSizing"].forEach(p=>mirror.style[p]=st[p]),mirror.style.position="absolute",mirror.style.visibility="hidden",mirror.style.top="0",mirror.style.left="0",mirror.style.width=r.width+"px",mirror.style.whiteSpace="pre-wrap",mirror.style.wordBreak="break-word",document.body.appendChild(mirror),mirror.textContent=field.value.slice(0,field.selectionStart);const probe=document.createElement("span");probe.textContent="​",mirror.appendChild(probe);const caretX=r.left+probe.offsetLeft-field.scrollLeft,caretY=r.top+probe.offsetTop-field.scrollTop,caretH=probe.offsetHeight||parseInt(st.lineHeight,10)||20;mirror.remove();const el=this.ensureEl();el.style.visibility="hidden";const pw=el.offsetWidth,ph=el.offsetHeight,vw=document.documentElement.clientWidth,vh=document.documentElement.clientHeight;let x=caretX;x+pw>vw-8&&(x=Math.max(8,vw-pw-8));let y=caretY+caretH+4;y+ph>vh-8&&(y=Math.max(8,caretY-ph-4)),el.style.left=x+"px",el.style.top=y+"px",el.style.visibility=""},move(d){if(!this.items.length)return;this.index=(this.index+d+this.items.length)%this.items.length;const el=this.ensureEl();el.querySelectorAll(".mp-item").forEach((n,i)=>n.classList.toggle("on",i===this.index));const cur=el.querySelector(".mp-item.on");cur&&cur.scrollIntoView({block:"nearest"})},onKeydown(e){if(this.open)if(e.key==="ArrowDown")e.preventDefault(),this.move(1);else if(e.key==="ArrowUp")e.preventDefault(),this.move(-1);else if(e.key==="Enter"||e.key==="Tab"){e.preventDefault();const u=this.items[this.index];u&&this.choose(u)}else e.key==="Escape"&&(e.preventDefault(),this.hide())},choose(u){const field=this.field,tr=this.trigger;if(!field||!tr)return;let nm=String(u.name||"").replace(/[\[\]()@]/g,"").trim();nm||(nm=u.id);const mark="@["+nm+"]("+u.id+")",before=field.value.slice(0,tr.startPos),after=field.value.slice(tr.endPos);field.value=before+mark+" "+after;const c=before.length+mark.length+1;field.selectionStart=field.selectionEnd=c,field.focus(),this.hide()},hide(){this.open=!1,this.items=[],this.field=null,this.trigger=null,this.el&&this.el.classList.add("hide")}};document.addEventListener("input",e=>{isMentionField(e.target)&&MentionPicker.onInput(e.target)}),document.addEventListener("keydown",e=>{MentionPicker.open&&e.target===MentionPicker.field&&MentionPicker.onKeydown(e)}),document.addEventListener("blur",e=>{MentionPicker.open&&e.target===MentionPicker.field&&setTimeout(()=>MentionPicker.hide(),160)},!0);function cloudFormsHtml(mode){const isLogin=mode==="login";return`<div class="cloud-tabs">
      <button class="ct ${isLogin?"on":""}" id="cloud-tab-login">登录</button>
      <button class="ct ${isLogin?"":"on"}" id="cloud-tab-register">注册</button>
    </div>
    <div id="cloud-msg" class="cloud-msg"></div>
    <div class="cloud-form">
      <label class="fl">云端账号</label>
      <input class="field" id="cf-login" placeholder="3-20 位字母/数字/下划线" autocomplete="username">
      ${isLogin?"":`<label class="fl">昵称（论坛显示名）</label>
      <input class="field" id="cf-name" placeholder="例如 华北小异人" maxlength="16">
      <label class="fl">邀请码（可选）</label>
      <input class="field" id="cf-invite" placeholder="填写好友的邀请码，双方各得 100 积分" maxlength="16">`}
      <label class="fl">密码</label>
      <input class="field" id="cf-pass" type="password" placeholder="至少 6 位" autocomplete="${isLogin?"current-password":"new-password"}">
      <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-orange" id="cf-sub">${isLogin?"登录云端":"注册并登录"}</button>
      </div>
    </div>
    <p class="ph-sub" style="margin-top:16px">说明：云端账号由服务器保存，密码经 PBKDF2 加盐哈希，不会明文存储；与本地的离线账号相互独立。</p>`}function cloudAccountHtml(u){return`<div class="cloud-account">
    <div class="cloud-account-head">
      <div class="cloud-av-wrap">
        <div class="cloud-av" id="cloud-av-wrap">${u.avatar&&(u.avatar.startsWith("data")||u.avatar.startsWith("http"))?`<img src="${esc(u.avatar)}" style="width:100%;height:100%;object-fit:cover">`:esc(avText(u.name))}</div>
        <button type="button" class="cloud-av-btn" id="cloud-av-edit" title="更换头像">📷 更换头像</button>
        <input type="file" id="cloud-av-file" accept="image/*" class="hide">
      </div>
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
      <button class="btn btn-ghost btn-sm" data-editprofile>✏️ 编辑资料</button>
      <button class="btn btn-ghost btn-sm" id="cloud-logout">退出云端账号</button>
      <button class="btn btn-ghost btn-sm" id="cloud-refresh">刷新资料</button>
      ${u.role>=3?'<button class="btn btn-ghost btn-sm" id="cloud-export">导出数据备份</button>':""}
    </div>
    <div class="cloud-push-box" style="margin-top:14px;padding:14px 16px;border:1px solid var(--pt-line,#e5e8f0);border-radius:14px;background:var(--pt-soft,#f7f8fc)">
      <strong>账号设置</strong>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center">
        <input class="field" id="acct-name" maxlength="16" value="${esc(u.name)}" placeholder="昵称（最多 16 字）" style="max-width:180px">
        <button type="button" class="btn btn-sm btn-ghost" id="acct-name-save">保存昵称</button>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center">
        <input class="field" id="acct-old-pass" type="password" placeholder="当前密码" autocomplete="current-password" style="max-width:170px">
        <input class="field" id="acct-new-pass" type="password" placeholder="新密码（至少 6 位）" autocomplete="new-password" style="max-width:190px">
        <button type="button" class="btn btn-sm btn-orange" id="acct-pass">修改密码</button>
      </div>
      <p class="ph-sub" style="margin:8px 0 0">改昵称会同步更新你在论坛的历史帖子与回复署名；改密码不会让当前设备退出登录。</p>
    </div>
    <p class="ph-sub" style="margin-top:14px">云端共享：论坛帖子、回复、点赞与积分等级。<br>仍保留在本地：聊天/聊天室、抽签问卦、小游戏、界面主题与个人设置。</p>
    <div class="cloud-push-box" id="cloud-push-box" style="margin-top:14px;padding:14px 16px;border:1px solid var(--pt-line,#e5e8f0);border-radius:14px;background:var(--pt-soft,#f7f8fc)">
      <div style="display:flex;align-items:center;gap:12px;justify-content:space-between;flex-wrap:wrap">
        <div style="min-width:0">
          <strong>云端推送通知</strong>
          <p class="ph-sub" style="margin:4px 0 0">浏览器关闭、手机后台也能收到回复与点赞提醒；消息经 Web Push 加密投递</p>
        </div>
        <button type="button" class="btn btn-sm btn-orange" id="cloud-push-toggle" style="flex:none">检测中…</button>
      </div>
      <p class="ph-sub" id="cloud-push-status" style="margin:10px 0 0"></p>
    </div>
    <div class="cloud-push-box" style="margin-top:14px;padding:14px 16px;border:1px solid var(--pt-line,#e5e8f0);border-radius:14px;background:linear-gradient(135deg,#fff8e7,#fff)">
      <div style="display:flex;align-items:center;gap:12px;justify-content:space-between;flex-wrap:wrap">
        <div style="min-width:0">
          <strong>邀请好友</strong>
          <p class="ph-sub" style="margin:4px 0 0">把邀请码发给朋友，注册时填写，双方各得 100 积分</p>
        </div>
      </div>
      <div id="invite-box" style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="cl-spin"></span> 正在加载邀请码…
      </div>
    </div>
    ${u.role>=3?`<div class="cloud-mod" id="cloud-mod">
      <div class="cloud-mod-head"><strong>成员管理 <span class="ph-sub" id="cm-count" style="font-weight:400"></span></strong><span style="margin-left:auto;display:flex;gap:8px"><button class="btn btn-sm btn-ghost" data-bmanage>🎖 徽章管理</button><button class="btn btn-sm btn-ghost" id="cm-reload">刷新列表</button></span></div>
      <div class="cloud-mod-search"><input class="field" id="cm-search" placeholder="搜索成员昵称 / 账号 / 编号…"></div>
      <div class="cloud-mod-list"><div class="cloud-loading"><span class="cl-spin"></span>正在加载成员…</div></div>
    </div>`:""}
  </div>`}function cloudModListHtml(users){return users.length?users.map(u=>{const isMe=u.id===Cloud.user.id,tags=[];return u.role>=4?tags.push('<span class="tag" style="background:#7B5CF0;color:#fff">超级管理员</span>'):u.role>=3&&tags.push('<span class="tag tag-blue">管理员</span>'),u.muted&&tags.push('<span class="tag tag-amber">已禁言</span>'),u.banned&&tags.push('<span class="tag tag-red">已拉黑</span>'),`<div class="cm-row ${u.banned?"is-banned":u.muted?"is-muted":""}">
      ${avatarCircle(u.name,u.avatar)}
      <div class="cm-info">
        <div class="cm-name"><b>${esc(u.name)}</b>${levelBadge(u.level,u.levelName)}${badgeHtml(u.badge)}${tags.join("")}</div>
        <div class="ph-sub">${esc(u.login)} · ${u.points}积分</div>
      </div>
      ${isMe?'<span class="ph-sub cm-self">本人</span>':Cloud.user.role>=4||u.role<4?`<div class="cm-actions">
        ${Cloud.user.role>=4&&u.role<4?`<button class="btn btn-sm btn-ghost" data-cmrole="${u.role>=3?"1":"3"}:${u.id}" ${u.role>=3?"":'style="color:#E8A33D"'}>${u.role>=3?"取消管理员":"设为管理员"}</button>`:""}
        <button class="btn btn-sm btn-ghost" data-cmbadge="${u.id}" title="手动发放徽章/称号">🎖 发徽章</button>
        <button class="btn btn-sm btn-ghost" data-cm="${u.muted?"unmute":"mute"}:${u.id}">${u.muted?"解除禁言":"禁言"}</button>
        <button class="btn btn-sm btn-ghost" data-cm="${u.banned?"unban":"ban"}:${u.id}" ${u.banned?"":'style="color:#FF9DA0"'}>${u.banned?"解除拉黑":"拉黑"}</button>
        <button class="btn btn-sm btn-ghost" data-cmpass="${u.id}" style="color:#7B5CF0">🔑 重置密码</button>
        <button class="btn btn-sm btn-ghost" data-cmdel="${u.id}" style="color:#FF6B6B">删除账号</button>
      </div>`:""}
    </div>`}).join(""):'<div class="empty">暂无成员</div>'}let _cloudModUsers=[];function filterCloudModUsers(term){const q=String(term||"").trim().toLowerCase();return q?_cloudModUsers.filter(u=>String(u.name).toLowerCase().includes(q)||String(u.login).toLowerCase().includes(q)||String(u.id).toLowerCase().includes(q)):_cloudModUsers}function renderCloudModFiltered(){const box=document.querySelector(".cloud-mod-list");if(!box)return;const inp=document.querySelector("#cm-search"),list=filterCloudModUsers(inp?inp.value:"");box.innerHTML=list.length?cloudModListHtml(list):'<div class="empty">没有匹配的成员</div>';const cnt=document.querySelector("#cm-count");if(cnt){const total=_cloudModUsers.length,term=String(inp&&inp.value||"").trim();cnt.textContent=term&&list.length!==total?`（共 ${total} 人 · 筛选 ${list.length} 人）`:`（共 ${total} 人）`}}async function loadCloudMod(){const box=document.querySelector(".cloud-mod-list");if(box)try{_cloudModUsers=await Cloud.listUsers(),renderCloudModFiltered()}catch(e){box.innerHTML=`<div class="empty">加载失败：${esc(e.message)}</div>`}}document.addEventListener("input",e=>{e.target.id==="cm-search"&&renderCloudModFiltered()});function webPushSupported(){return"serviceWorker"in navigator&&"PushManager"in window&&!!window.isSecureContext}function isIosDevice(){const ua=navigator.userAgent||navigator.vendor||"";return!!(/iPad|iPhone|iPod/.test(ua)||/Macintosh/.test(ua)&&navigator.maxTouchPoints&&navigator.maxTouchPoints>1)}function isStandaloneMode(){return window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===!0}function base64UrlToBytes(s){for(s=String(s).replace(/-/g,"+").replace(/_/g,"/");s.length%4;)s+="=";const bin=atob(s),out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out}async function getPushSubscription(){return await(await navigator.serviceWorker.ready).pushManager.getSubscription()}async function renderCloudPushState(){if(!document.getElementById("cloud-push-box"))return;const btn=document.getElementById("cloud-push-toggle"),status=document.getElementById("cloud-push-status");if(!webPushSupported()){btn.disabled=!0,btn.textContent="不支持",btn.className="btn btn-sm btn-ghost",isIosDevice()&&!isStandaloneMode()?status.textContent="iPhone/iPad 需先添加到主屏幕：点 Safari 底部“分享”按钮，选“添加到主屏幕”，再从主屏幕图标打开本站，即可开启推送（需 iOS 16.4 或更高版本）。":status.textContent="当前浏览器或访问环境不支持云端推送（需 HTTPS 与较新的 Chrome/Edge/Firefox）；站内红点与轮询通知不受影响。";return}let sub=null;try{sub=await getPushSubscription()}catch(e){sub=null}sub?(btn.disabled=!1,btn.textContent="关闭推送",btn.className="btn btn-sm btn-ghost",status.textContent="已开启：本设备将收到回复与点赞的系统级通知。"):(btn.disabled=!1,btn.textContent="开启推送",btn.className="btn btn-sm btn-orange","Notification"in window&&Notification.permission==="denied"?status.textContent="浏览器通知权限已被禁止，需先在浏览器站点设置中允许通知，再点“开启推送”。":status.textContent="未开启：点击“开启推送”并在浏览器弹窗中允许即可。")}async function loadInviteBox(){const box=document.getElementById("invite-box");if(box)try{const d=await Cloud.request("/invite");if(!document.body.contains(box))return;const list=(d.invited||[]).slice(0,10).map(u=>'<div style="width:100%;font-size:13px;color:#888;padding:4px 0;border-top:1px dashed #eee">'+esc(u.name)+' <span class="ph-sub">'+esc(u.login)+"</span></div>").join("");box.innerHTML='<code style="font-size:22px;font-weight:700;letter-spacing:3px;color:#c8860a;background:#fff3d0;padding:8px 16px;border-radius:10px;border:1px solid #ffd97a">'+esc(d.code)+'</code><span class="ph-sub" style="margin-left:auto">已邀请 <b style="color:#c8860a;font-size:16px">'+d.count+"</b> 人</span>"+(list?'<div style="width:100%;margin-top:6px">'+list+"</div>":"")}catch(e){box.innerHTML='<span class="ph-sub">邀请码加载失败：'+esc(e.message)+"</span>"}}async function enableWebPush(){if(!Cloud.connected)throw new Error("请先登录云端账号");if(!webPushSupported())throw new Error("当前浏览器不支持云端推送");const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();if(!sub){const publicKey=await Cloud.pushKey();sub=await reg.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:base64UrlToBytes(publicKey)})}await Cloud.pushSubscribe(sub.toJSON())}async function disableWebPush(){if(!webPushSupported())return;let sub=null;try{sub=await getPushSubscription()}catch(e){sub=null}if(sub){const endpoint=sub.endpoint;try{await sub.unsubscribe()}catch(e){}try{await Cloud.pushUnsubscribe(endpoint)}catch(e){}}}function bindCloudPush(){if(!document.getElementById("cloud-push-box"))return;renderCloudPushState();const btn=document.getElementById("cloud-push-toggle");btn.addEventListener("click",async()=>{btn.disabled=!0;try{await getPushSubscription().catch(()=>null)?(await disableWebPush(),toast("云端推送已关闭","ok")):(await enableWebPush(),toast("云端推送已开启，关闭页面也能收到提醒","ok"))}catch(e){toast(e.message||"操作失败","err")}renderCloudPushState()})}function viewCloud(){const c=`<div class="p-crumb">论坛 / <b>云端账号</b></div>
  <div class="p-panel">
    <h2>云端账号</h2>
    <div class="ph-sub">登录云端后，论坛变为多人共享的真实论坛；未登录时仍可离线单机使用，原有功能不受影响。</div>
    <div id="cloud-box">${Cloud.connected?cloudAccountHtml(Cloud.user):cloudFormsHtml("login")}</div>
  </div>`,html=portalShell("cloud",c);return Cloud.connected&&setTimeout(bindCloudAvatar,0),Cloud.connected&&setTimeout(bindCloudPush,0),Cloud.connected&&setTimeout(loadInviteBox,0),Cloud.connected&&Cloud.user.role>=3&&setTimeout(loadCloudMod,0),html}function bindCloudAvatar(){const file=document.getElementById("cloud-av-file");file&&file.addEventListener("change",()=>{const f=file.files&&file.files[0];if(!f)return;const reader=new FileReader;reader.onload=()=>{const img=new Image;img.onload=()=>{const cv=document.createElement("canvas");cv.width=160,cv.height=160;const ctx=cv.getContext("2d"),m=Math.min(img.width,img.height),sx=(img.width-m)/2,sy=(img.height-m)/2;ctx.drawImage(img,sx,sy,m,m,0,0,160,160);const dataUrl=cv.toDataURL("image/jpeg",.85);if(dataUrl.length>180*1024){toast("图片过大，请换一张","err");return}Cloud.updateAvatar(dataUrl).then(async u=>{Cloud.user=u,await Cloud.refresh().catch(()=>{}),router(),toast("头像已更新","ok")}).catch(e=>toast(e.message,"err"))},img.src=reader.result},reader.readAsDataURL(f)})}async function cloudRerender(){const{seg,query}=parseHash();if(seg[0]==="post"&&seg[1]){const d=await Cloud.getPost(seg[1]),post={id:d.post.id,board:d.post.board,title:d.post.title,content:d.post.content,authorId:d.post.authorId,authorName:d.post.authorName,authorLevel:d.post.authorLevel||0,authorLevelName:d.post.authorLevelName||"",authorAvatar:d.post.authorAvatar||"",createdAt:d.post.createdAt,lastActivityAt:d.post.lastActivityAt||d.post.createdAt,pinned:d.post.pinned,views:d.post.views,votes:d.post.votes||[],simulatedLikes:0,editedAt:d.post.editedAt||null,editCount:Number(d.post.editCount)||0},replies=(d.replies||[]).map(r=>({id:r.id,postId:r.postId,parentId:r.parentId||null,authorId:r.authorId,authorName:r.authorName,authorLevel:r.authorLevel||0,authorLevelName:r.authorLevelName||"",authorAvatar:r.authorAvatar||"",authorBadge:r.authorBadge||null,content:r.content,createdAt:r.createdAt,votes:r.votes||[]}));$("#app").innerHTML=portalShell("forum",postDetailHtml(post,replies,Cloud.user.id,Cloud.user.role>=3,!0,d.poll||null))}else{const board=seg[0]==="forum"&&seg[1]?decodeURIComponent(seg[1]):"全部",sort=query.sort||"latest",data=await Cloud.listPosts(board,sort),posts=data&&data.posts||[],el=document.getElementById("cloud-forum-list");el&&(el.innerHTML=forumListHtml(sortForumPosts(posts,sort),Cloud.user.id))}}const STICKERS=["😀","😅","😱","🤔","🤫","😴","🥲","😤","🤝","👻","🔥","⚡","🧧","🗡️","☯️","🐒","🧠","📦","🚚","💨","🙏","👀","🧎","🌪️","💢","🕯️"],TEMPLATES={default:[{id:"blue",name:"深蓝公务",a:"#1A2C78",b:"#2E47B8"},{id:"ink",name:"墨蓝夜航",a:"#0E1B52",b:"#243B9B"},{id:"ember",name:"灰烬橙",a:"#3A2015",b:"#D06E35"},{id:"plain",name:"素白",a:"#F2F4FA",b:"#DDE3F0"}],day:[{id:"paper",name:"晨光纸白",a:"#FFFFFF",b:"#EDF2FA"},{id:"mist",name:"雾蓝",a:"#DCE6F7",b:"#A9C1EA"},{id:"blossom",name:"樱粉",a:"#FBE4EC",b:"#E7A8BF"},{id:"sage",name:"竹青",a:"#E4F0E6",b:"#A9CCB0"}],classic:[{id:"xuan",name:"宣纸",a:"#EDE8D8",b:"#C9C2AE"},{id:"zhu",name:"朱砂",a:"#8E2328",b:"#D0484D"},{id:"jade",name:"青玉",a:"#1F5E52",b:"#3E9C86"},{id:"mo",name:"墨竹",a:"#2A2A28",b:"#5C5A50"}],cyber:[{id:"neon",name:"霓虹紫",a:"#0B1E52",b:"#7C2BFF"},{id:"pulse",name:"脉冲青",a:"#071A2C",b:"#00E5FF"},{id:"acid",name:"酸性绿",a:"#0A1F0E",b:"#3BE08F"},{id:"magenta",name:"洋红警报",a:"#2A0018",b:"#FF2E88"}],rose:[{id:"rose-gold",name:"玫瑰金",a:"#C98B7E",b:"#EAC3B4"},{id:"cream",name:"奶油白",a:"#FDF6F1",b:"#F0DCD0"},{id:"blush",name:"胭脂粉",a:"#E7A7A0",b:"#F6D6D0"},{id:"champagne",name:"香槟金",a:"#D9B896",b:"#F2E0C4"}],aurora:[{id:"aurora-teal",name:"极光青",a:"#0E2A3A",b:"#37D6BE"},{id:"aurora-violet",name:"星河紫",a:"#1D1448",b:"#8B7CFF"},{id:"aurora-green",name:"极光绿",a:"#0C2A26",b:"#4BE3A4"},{id:"aurora-pink",name:"星云粉",a:"#2A1238",b:"#E07CF5"}],wechat:[{id:"wx-green",name:"微信绿",a:"#32965E",b:"#3CB371"},{id:"wx-bubble",name:"气泡绿",a:"#7BD88F",b:"#A8E0C0"},{id:"wx-paper",name:"灰白",a:"#D9D9D9",b:"#F7F7F7"},{id:"wx-link",name:"链接蓝",a:"#576B95",b:"#8A9BC4"}]},tplOf=id=>{var _a,_b;const t=Object.values(TEMPLATES).flat().find(x=>x.id===id)||((_b=TEMPLATES[((_a=DB.data)==null?void 0:_a.theme)||"default"])==null?void 0:_b[0])||TEMPLATES.default[0];return{...t,cover:`linear-gradient(120deg,${t.a},${t.b})`,main:t.b,zikaBg:t.a,zikaColor:"#FFFFFF"}};function seedDB(){const posts=[{id:"p-1",board:"公告",pinned:1,title:"【论坛守则】异人论坛使用须知（新手必读）",content:`一、本论坛仅供异人及相关人员内部交流，禁止向普通社会公开传播内部信息。
二、禁止泄露本人及他人真实身份、住址、行动路线与功法细节。
三、禁止煽动门派冲突、传播未经核实的危险情报或教唆违法行为。
四、遇到全性成员及其他高危目标，优先联系辖区负责人，不得擅自围堵、跟踪或交手。
五、涉及重大事件的帖子请标注时间、地点、信息来源与可信等级；未经证实的内容请勿当作事实传播。
六、管理员有权对涉密内容进行折叠、移板或删除，处理记录将留档。
七、请尊重不同门派与地区成员，理性讨论，禁止人身攻击。

——哪都通论坛管理组`,authorId:"",authorName:"论坛管理员",createdAt:"2026-10-01 09:00",votes:["v-1","v-2","v-3","v-4","v-5","v-6","v-7","v-8","v-9","v-10","v-11","v-12"],views:2486,editedBy:[]},{id:"p-2",board:"公告",pinned:0,title:"【事件通报】龙虎山罗天大醮期间异常情况汇总",content:"管理组整理公开流传的现场报告：赛事期间出现身份不明人员闯入、多个区域通讯中断，以及部分人员受伤等情况。各地转帖时请勿补充未经证实的姓名与行踪，后续以各区正式通报为准。",authorId:"",authorName:"论坛管理员",createdAt:"2026-10-24 08:30",votes:["v-1","v-2","v-3","v-4","v-5","v-6","v-7"],views:18640,editedBy:[]},{id:"p-3",board:"天下见闻",pinned:0,title:"【资料整理】碧游村事件时间线：目前能确认的几个节点",content:"根据各区已公开的简报，事件涉及修身炉、人员失联与跨区协同行动。此帖只列已确认时间节点，不推测参与者个人动机，也不转发现场人员的私人信息。欢迎补充可核验的公开资料。",authorId:"",authorName:"华东档案员·许闻",createdAt:"2026-10-23 20:15",votes:["v-1","v-2","v-3","v-4","v-5","v-6"],views:14230,editedBy:[]},{id:"p-4",board:"公告",pinned:0,title:"关于近期跨区任务报备与临时联络频道调整的通知",content:"自即日起，跨区协作任务须在出发前登记负责人、预计时段及紧急联络方式。临时频道只用于任务信息，不得转发到公共板块。遇到频道失联，请按各区既有应急流程处理。",authorId:"",authorName:"论坛管理员",createdAt:"2026-10-22 11:00",votes:["v-1","v-2","v-3"],views:6120,editedBy:[]},{id:"p-5",board:"天下见闻",pinned:0,title:"【讨论】全性近期活动范围是否有扩大迹象？仅汇总公开线索",content:"近来不同地区出现几起性质相似但尚未确认有关联的异常事件。先提醒：相似不代表同一组织所为。本帖欢迎按地区、日期和来源整理线索，请勿发布未经核实的个人照片或坐标。",authorId:"",authorName:"秦岭散人",createdAt:"2026-10-21 19:42",votes:["v-1","v-2","v-3","v-4","v-5"],views:11080,editedBy:[]},{id:"p-6",board:"异人讨论",pinned:0,title:"罗天大醮之后，各门派公开交流活动会不会减少？",content:"今年大赛后，几处原定的交流活动都传出延期消息。是例行安保调整，还是各派在重新评估公开活动的风险？欢迎讨论行业趋势，勿猜测具体个人的私下安排。",authorId:"",authorName:"青城外门弟子",createdAt:"2026-10-20 16:25",votes:["v-1","v-2","v-3","v-4"],views:9370,editedBy:[]},{id:"p-7",board:"功法交流",pinned:0,title:"资料帖：公开场合使用术法的风险与善后原则",content:"无论术法规模大小，公开场合都要优先考虑普通人的安全与后续影响。建议各派新人熟悉现场隔离、伤者协助、信息保密和事后报备流程。本文是经验归纳，不涉及任何具体功法的操作细节。",authorId:"",authorName:"南区善后组·老邱",createdAt:"2026-10-19 09:10",votes:["v-1","v-2","v-3"],views:4760,editedBy:[]},{id:"p-8",board:"公告",pinned:0,title:"论坛新增“事件核验”标签：发帖请标注消息来源",content:"为减少传言造成的误判，事件类帖子可使用“官方通报”“现场目击”“二手转述”“尚待核实”标签。管理员会优先整理有时间、地点和来源的内容；匿名爆料不等于已证实情报。",authorId:"",authorName:"论坛管理员",createdAt:"2026-10-18 12:00",votes:["v-1","v-2","v-3","v-4","v-5","v-6"],views:7540,editedBy:[]},{id:"p-9",board:"求助",pinned:0,title:"求问：任务途中发现疑似异常痕迹，如何规范留档？",content:"本区新人整理现场记录时遇到问题：照片、时间、目击描述应该分开记录吗？希望有经验的同道分享通用的留档规范。请不要在回复中公开真实任务地点或未结案细节。",authorId:"",authorName:"闽南新人·阿禾",createdAt:"2026-10-17 21:08",votes:["v-1","v-2"],views:2680,editedBy:[]},{id:"p-10",board:"天下见闻",pinned:0,title:"十佬会议相关传闻很多，哪些消息值得继续观察？",content:"这两天关于十佬会面的说法不少，但目前没有足够材料确认议题与结论。欢迎大家区分“确有其事”和“推测解读”，避免把茶馆传闻写成正式决议。",authorId:"",authorName:"洛阳听客",createdAt:"2026-10-16 18:34",votes:["v-1","v-2","v-3","v-4"],views:6890,editedBy:[]},{id:"p-11",board:"异人讨论",pinned:0,title:"异人界近年跨区协作增多，是好事还是隐患？",content:"大型事件越来越难靠单一区域处理，协作效率明显重要；但人员权限、情报边界与责任划分也更复杂。想听听不同地区的工作经验，尽量谈制度，不点名评价个人。",authorId:"",authorName:"西南联络员",createdAt:"2026-10-15 10:20",votes:["v-1","v-2","v-3"],views:5320,editedBy:[]},{id:"p-12",board:"功法交流",pinned:0,title:"新人入门资料索引更新：先看安全守则，再看基础概念",content:"管理组把公开可讨论的基础术语、门派分类和安全提醒做了索引。这里不提供危险术法的练习步骤，也不建议任何人脱离指导私自尝试。若发现过时条目，请附上可核验来源。",authorId:"",authorName:"论坛管理员",createdAt:"2026-10-14 14:05",votes:["v-1","v-2","v-3","v-4","v-5"],views:8240,editedBy:[]},{id:"p-13",board:"灌水",pinned:0,title:"说说各地营业部最离谱的“普通快递”备注",content:"轻松一下：不涉及真实客户信息的前提下，大家遇到过哪些让人摸不着头脑的备注？请注意打码，不要上传面单、电话、地址，也别把任务经历写成段子泄密。",authorId:"",authorName:"华北仓库小赵",createdAt:"2026-10-13 22:17",votes:["v-1"],views:1870,editedBy:[]},{id:"p-14",board:"天下见闻",pinned:0,title:"【复盘】大型异人事件后，普通社会的信息隔离怎么做更稳妥？",content:"事件结束不代表风险结束。现场目击者安置、损坏设施解释、网络传言澄清都需要配合。欢迎分享各区通用做法，但请勿透露真实处置方案与可被利用的流程漏洞。",authorId:"",authorName:"论坛管理员",createdAt:"2026-10-12 08:55",votes:["v-1","v-2","v-3","v-4","v-5","v-6","v-7"],views:12760,editedBy:[]},{id:"p-15",board:"求助",pinned:0,title:"有没有跨区任务结束后的心理恢复与休整建议？",content:"连续出勤后容易出现睡眠紊乱、注意力下降等状态。想收集一些不涉及个人隐私的休整经验：如何安排轮班、如何做交接、什么时候应该主动申请暂停任务。",authorId:"",authorName:"山西小医馆学徒",createdAt:"2026-10-11 17:45",votes:["v-1","v-2","v-3"],views:3910,editedBy:[]},{id:"p-16",board:"公告",pinned:0,title:"关于论坛旧帖归档与敏感信息清理的说明",content:"管理组将分批检查旧帖中的失效链接、个人信息与未核实传闻。涉及安全风险的内容可能被折叠或移入内部归档；正常讨论会保留。若认为误处理，可通过站内渠道提交复核。",authorId:"",authorName:"论坛管理员",createdAt:"2026-10-10 09:30",votes:["v-1","v-2"],views:3220,editedBy:[]},{id:"p-17",board:"异人讨论",pinned:0,title:"门派交流会取消或延期后，年轻弟子该如何补足经验？",content:"线下交流减少后，基础理论、礼仪、风险识别和案例复盘仍然可以继续。希望各位分享合法合规、不会暴露门派机密的学习方式，不要发布内部教材扫描件。",authorId:"",authorName:"武当外院弟子",createdAt:"2026-10-09 13:12",votes:["v-1","v-2","v-3"],views:4460,editedBy:[]},{id:"p-18",board:"天下见闻",pinned:0,title:"甲申之乱相关资料再被提起：请先区分史料与民间传说",content:"近期又有帖子把不同版本的甲申之乱传闻拼在一起。此类历史材料来源复杂，建议注明出处、形成时间与是否有交叉印证。不要将推测直接指向现存门派或具体人物。",authorId:"",authorName:"旧书摊掌柜",createdAt:"2026-10-08 20:40",votes:["v-1","v-2","v-3","v-4","v-5"],views:9760,editedBy:[]},{id:"p-19",board:"灌水",pinned:0,title:"异人界也有淡季吗？最近大家都在忙什么日常事务",content:"不聊机密任务，单纯问问各地最近的日常：培训、资料整理、器材维护还是轮休？感觉大事件之后论坛都安静了不少。",authorId:"",authorName:"成都值班小哥",createdAt:"2026-10-07 19:02",votes:[],views:960,editedBy:[]},{id:"p-20",board:"功法交流",pinned:0,title:"术法研究记录如何写，才能让后来者看得懂又不泄密？",content:"建议把观察现象、环境条件、个人推测和结论分开写；不记录无关身份信息，不公开危险步骤，对无法复现的内容明确标注不确定性。欢迎补充一份适用于公开交流的记录模板。",authorId:"",authorName:"研究记录爱好者",createdAt:"2026-10-06 15:26",votes:["v-1","v-2"],views:2140,editedBy:[]},{id:"p-29",board:"天下见闻",pinned:0,title:"【高楼热帖】最近几场异人交易会，怎么总有人拿来历不明的旧物当压轴？",content:"先说好，楼主只是跑过几次公开交易会的散修，不认识卖家，也没什么内幕。最近几场集市上，几件旧法器被吹得神乎其神，报价还一个比一个离谱。到底是行情变了，还是大家都爱给老物件编故事？欢迎聊公开见闻，别贴真实摊位位置和卖家身份。",authorId:"",authorName:"关中跑集散修",createdAt:"2026-10-26 09:18",votes:Array.from({length:132},(_,i)=>`seed-v-p29-${i}`),views:48620,editedBy:[]},{id:"p-30",board:"灌水",pinned:0,title:"【热议】各地山门最近都在收紧访客登记？是巧合还是新规风向？",content:"这周听几位外地同道提到，去别家山门拜访要提前报备的地方变多了。也可能只是各家自己的安排，未必是统一新规。有没有人遇到过类似情况？只聊公开的访客流程和出行体验，不猜具体门派的内部部署。",authorId:"",authorName:"江南访友客",createdAt:"2026-10-26 08:42",votes:Array.from({length:109},(_,i)=>`seed-v-p30-${i}`),views:39780,editedBy:[]}],answers=Object.entries({"p-1":[["巡山的青符","已读。尤其是第五条，最近转帖太快，最好把来源写清楚。"],["华东小周","新人报到，先把守则收藏了。"],["白云观外门弟子","补充一句：遇到不确定的情况先找辖区联络员，别急着在论坛里求证具体身份。"]],"p-2":[["龙虎山脚下的茶摊","当时山脚临时封了几条路，具体原因我不清楚，还是等正式通报吧。"],["川渝办事员","我们这边收到的提醒也是不要转发现场偷拍视频，避免给后续核查添麻烦。"],["符纸批发老陈","希望受伤的同道都平安，后续有确认消息再更新。"]],"p-3":[["档案室小许","时间线整理得挺清楚，建议把“已确认”和“待核实”分成两栏。"],["华南临时联络员","跨区协作部分可以补一条公开通报的发布时间，方便对照。"]],"p-4":[["北区跑腿阿梁","收到，已经提醒组里出发前检查联络方式。"],["青城山记事员","建议加个报备模板，省得新人每次漏填预计返程时间。"]],"p-5":[["湘西采风客","我看到的几起情况地点相隔很远，暂时看不出能串起来的证据。"],["不爱吃瓜","赞同谨慎一点，别看到相似手法就直接归到全性头上。"],["关中散人","如果有可核实的公开来源，最好只贴来源摘要，不要搬个人信息。"]],"p-6":[["太行山小道士","我们这边的交流会只是改成小规模了，没听说全面取消。"],["苏杭器材管理员","大型活动的安保成本确实高，短期内可能都会更谨慎。"]],"p-7":[["临时工预备役","现场先疏散普通人这点很重要，别只顾着处理异常。"],["老邱修器材","善后记录也要写清损坏物品和交接人，后面省很多麻烦。"]],"p-8":[["论坛常驻观察员","希望以后能显示来源标签，光靠标题真不好判断。"],["华中档案员","二手转述我建议默认标黄，等补充来源后再改状态。"]],"p-9":[["闽南小许","分开记录比较好：原始观察单独存，推测另开一栏，之后复盘不容易混。"],["山门值班生","照片记得保留原始时间信息，但上传论坛前先清掉可能暴露位置的元数据。"]],"p-10":[["洛阳酒馆听客","茶馆版本一天一个样，还是等会议后有正式口径再说吧。"],["津门旧闻","十佬之间的事外人很难知道全貌，别把推测当结论就行。"]],"p-11":[["西南联络员","协作效率是高了，但跨区权限最好在任务开始前说清楚。"],["小门派事务人","对小门派来说，统一流程也能少一些信息不对称。"]],"p-12":[["刚入门的木木","这个索引对新人挺友好，终于不用到处翻旧帖了。"],["资料控老唐","建议加个最后校订日期，旧资料最怕被当成现行规则。"]],"p-13":[["华北仓库小赵","见过备注写“易碎，轻拿轻放”，箱子里其实全是泡沫填充物。"],["西区夜班","我们这边有次写“请勿摇晃”，结果大家都以为里面是法器，最后是豆浆机。"],["匿名路过","提醒一下，照片再搞笑也记得把条码和面单信息裁掉。"]],"p-14":[["江南善后组","对外解释要统一口径，但别为了圆说法编造细节，后面更难收场。"],["现场记录员","我觉得人员安置和信息澄清应该并行，不要等舆情起来才处理。"]],"p-15":[["值班表管理员","我们会强制留出交接时间，连续出勤后不要直接接下一班。"],["山西小医馆学徒","休整不是偷懒，睡眠和补水都做好，状态不对就及时报备。"]],"p-16":[["老帖收藏家","只要不是涉及隐私或安全的内容，希望能保留有价值的历史讨论。"],["版务协助员","可以给被折叠的帖子留个原因说明，方便作者知道怎么修改。"]],"p-17":[["武当外院弟子","基础理论和案例复盘也很重要，实战不是唯一的学习方式。"],["岭南器械师","跨门派交流时先讲清楚哪些能公开，避免双方都尴尬。"]],"p-18":[["旧书摊掌柜","同一段传闻在不同抄本里差异很大，确实不能拼起来当成完整史实。"],["档案整理员","最好保留原始出处和转引链条，后人才能判断可信度。"],["关外访客","涉及具体门派的部分尤其谨慎，别因为一份孤证就下结论。"]],"p-19":[["成都值班小哥","最近忙着清点器材和补觉，论坛安静点也挺好。"],["新手符匠","我们在整理培训笔记，终于有时间把之前欠的基础课补完。"]],"p-20":[["研究记录爱好者","我会把观察、猜想、验证结果分开写，隔几天回看经常能发现自己想当然的地方。"],["东北资料员","模板里加一项“无法确认的条件”也不错，提醒读者别过度解读。"]],"p-29":[["旧物行的阿沅","有些东西年份确实久，但年份久不等于术法厉害。最近报价里故事比货多。"],["西北散修老韩","我只看过公开摊位，有人连来历都说不清就开天价，围观的人还真不少。"],["鉴器学徒小唐","建议先看材质、保存情况和能不能查到旧记录，别听一句“祖传”就上头。"],["路过的账房先生","高价成交的那几件未必是真热门，也可能只是传得响，实际买家没几个。"],["南城摆摊人","集市每年都有这种热闹，散场以后真正愿意复检的反而不多。"],["版务协助员","提醒一下，别发摊位定位或摊主身份，交易纠纷请走正式渠道。"]],"p-30":[["岭南访客","我上个月去拜访也要提前递帖子，感觉是那家最近接待的人多，不一定是统一新规。"],["山门值守小周","登记访客本来就不奇怪，尤其活动多的时候，提前打招呼能省不少麻烦。"],["青州行脚客","不同地方差别很大。有的只记姓名和来意，有的得由熟人引荐。"],["关外小道童","别把几家山门的做法直接说成新规吧，我这边目前没收到统一通知。"],["江边茶摊老板","最近拜访的人确实多，登记细一点也正常，未必有什么大事。"]]}).flatMap(([postId,items],pi)=>items.map((item,i)=>({id:`seed-a-${postId}-${i+1}`,postId,authorId:"",authorName:item[0],content:item[1],createdAt:`2026-10-${String(Math.max(1,26-Math.floor(pi/2))).padStart(2,"0")} ${String(9+i*3%12).padStart(2,"0")}:${String((pi*7+i*13)%60).padStart(2,"0")}`,votes:Array.from({length:(pi*3+i*2)%6},(_,n)=>`seed-v-${postId}-${i}-${n}`),editedBy:[]})));return{version:1,session:null,users:[],posts,answers,archives:[{id:"r-1",code:"ND-YR-001",name:"张楚岚",gender:"男",faction:"天师府传人 / 哪都通华北区编外",skill:"金光咒·阳五雷；疑似持有八奇技「炁体源流」",danger:"A",status:"在控（编外员工）",sec:2,aliases:"不摇碧莲、张处男",note:"张怀义之孙，甲申之乱关键线索人物。表面吊儿郎当，实际心思极深。罗天大醮冠军。其炁体源流来源与继承方式需持续跟进。"},{id:"r-2",code:"ND-YR-002",name:"冯宝宝",gender:"女",faction:"哪都通华北区临时工",skill:"无明确功法；本能格斗术，自愈能力极强，疑似不老不死",danger:"未知",status:"在控（临时工）",sec:3,aliases:"宝宝",note:"身世不明，被发现于四川，记忆缺失。身体机能与常人迥异，数十年容貌未变。与甲申之乱、无根生存在未知关联，为最高优先级观察对象。"},{id:"r-3",code:"ND-YR-003",name:"张灵玉",gender:"男",faction:"龙虎山天师府",skill:"阴五雷；后获「通天箓」",danger:"B",status:"观察",sec:2,aliases:"灵玉真人",note:"老天师弟子，因心结改练阴五雷。罗天大醮负于张楚岚。性格方正，与全性夏禾有旧，注意情感弱点。"},{id:"r-4",code:"ND-YR-004",name:"王也",gender:"男",faction:"武当山（已离山）",skill:"八奇技「风后奇门」",danger:"A",status:"观察",sec:2,aliases:"王道长",note:"清华毕业后入武当，意外习得风后奇门。可自定中宫、拨弄格局。多次表示不愿卷入纷争，但其能力使其无法置身事外。"},{id:"r-5",code:"ND-YR-005",name:"诸葛青",gender:"男",faction:"诸葛世家",skill:"武侯奇门；后悟三昧真火",danger:"B",status:"观察",sec:1,aliases:"",note:"诸葛世家传人，术字门天才。罗天大醮后一度执着于风后奇门，最终破除心障、三昧真火觉醒。现与王也交好。"},{id:"r-6",code:"ND-YR-006",name:"夏禾",gender:"女",faction:"全性「四张狂」",skill:"刮骨刀——操控情欲，可使人群失控相残",danger:"A",status:"在逃",sec:2,aliases:"",note:"全性四张狂之一，天生异质，非其本意。与张灵玉有旧。接触建议：女性员工或心性坚定者出面，禁止单人接触。"},{id:"r-7",code:"ND-YR-007",name:"张之维",gender:"男",faction:"龙虎山天师府 · 第六十五代天师",skill:"阳五雷，当世绝顶",danger:"S",status:"正道泰斗",sec:2,aliases:"老天师",note:"异人界公认战力天花板。罗天大醮主持者。为清理门户曾单人追杀全性，十佬亦难制衡。其立场即天师府立场。"},{id:"r-8",code:"ND-YR-008",name:"龚庆",gender:"男",faction:"全性代掌门",skill:"不明（疑似精神/记忆类）",danger:"A",status:"在逃",sec:3,aliases:"",note:"全性代掌门，潜伏龙虎山多年，策划田晋中遇害案以夺取甲申之乱记忆。年轻但城府极深，全性实际运转者。"},{id:"r-9",code:"ND-YR-009",name:"吕良",gender:"男",faction:"吕家",skill:"明魂术——抽取、篡改记忆与灵魂",danger:"B",status:"在逃",sec:3,aliases:"",note:"吕家嫡传，明魂术与八奇技「双全手」疑似同源。曾为张楚岚传递张怀义记忆。被家族除名后下落不明，危险等级可能上调。"},{id:"r-10",code:"ND-YR-010",name:"马仙洪",gender:"男",faction:"碧游村村长",skill:"八奇技「神机百炼」",danger:"S",status:"在逃",sec:3,aliases:"",note:"可炼制傀儡、法器乃至「修身炉」，能将普通人批量转化为异人。碧游村事件主谋。自称八奇技传人后裔，与哪都通有复杂渊源。"},{id:"r-11",code:"ND-YR-011",name:"陈朵",gender:"女",faction:"药仙会 / 碧游村十二上根器",skill:"蛊毒——体内养蛊，触之即死",danger:"A",status:"已故",sec:3,aliases:"",note:"自幼被药仙会炼为蛊身，后为哪都通华南区临时工，被马仙洪带走。碧游村事件后自愿赴死。华南区负责人廖忠因此殉职。"},{id:"r-12",code:"ND-YR-012",name:"肖自在",gender:"男",faction:"哪都通华东区临时工",skill:"少林功夫；杀人冲动倾向",danger:"A",status:"在控（临时工）",sec:3,aliases:"",note:"少林还俗，病态嗜杀，以公司任务为约束。战斗经验极强，对弱者有分寸。需定期心理评估，失控后果严重。"},{id:"r-13",code:"ND-YR-013",name:"王震球",gender:"男",faction:"哪都通西南区临时工",skill:"杂学多家手段（爱之马杀鸡等）",danger:"B",status:"在控（临时工）",sec:2,aliases:"",note:"性格跳脱，好奇心旺盛，手段杂而精。与张楚岚互称损友，行动中常不按常理出牌。"},{id:"r-14",code:"ND-YR-014",name:"黑管儿",gender:"男",faction:"哪都通大区临时工",skill:"横练硬功，近身搏杀",danger:"B",status:"在控（临时工）",sec:2,aliases:"",note:"看似粗犷实则心细，碧游村行动主力。"},{id:"r-15",code:"ND-YR-015",name:"廖忠",gender:"男",faction:"哪都通华南区负责人",skill:"综合格斗",danger:"B",status:"殉职",sec:3,aliases:"",note:"陈朵的监护人与负责人。在押送陈朵过程中为不伤害她而被蛊毒侵蚀，殉职。"},{id:"r-16",code:"ND-YR-016",name:"陆瑾",gender:"男",faction:"三一门",skill:"逆生三重；曾持「通天箓」",danger:"A",status:"十佬",sec:2,aliases:"",note:"三一门唯一传人，逆生三重可逆转生机。罗天大醮后将通天箓赠予张灵玉。性情刚烈，与全性有灭门之仇。"},{id:"r-17",code:"ND-YR-017",name:"风正豪",gender:"男",faction:"天下会会长",skill:"八奇技「拘灵遣将」",danger:"A",status:"观察",sec:2,aliases:"",note:"以企业家身份经营天下会，掌握拘灵遣将，可拘收灵体为己用。枭雄性格，能屈能伸，试图拉拢张楚岚。"},{id:"r-18",code:"ND-YR-018",name:"风沙燕",gender:"女",faction:"天下会",skill:"空间穿梭（短距瞬移）",danger:"B",status:"观察",sec:1,aliases:"",note:"风正豪之女，性格火辣，战力不俗。"},{id:"r-19",code:"ND-YR-019",name:"张怀义",gender:"男",faction:"天师府 / 三十六贼",skill:"八奇技「炁体源流」领悟者",danger:"S",status:"已故",sec:4,aliases:"",note:"张楚岚祖父，甲申之乱三十六贼之一。临终前将炁体源流与真相托付。其死亡牵出数十名异人界元老，是甲申之乱的活钥匙。"},{id:"r-20",code:"ND-YR-020",name:"无根生",gender:"男",faction:"全性掌门",skill:"神明灵——万法不侵，拆解一切炁构成的手段",danger:"S",status:"下落不明",sec:4,aliases:"",note:"三十六贼之首，全性百年唯一掌门。甲申之乱核心人物，八奇技的诞生与其密切相关。冯宝宝身世之谜的另一极。现存最危险的谜团。"}],events:[{id:"e-0",year:"1949以后",date:"1949以后",title:"哪都通成立，异人纳入公司化管理",loc:"全国",sec:1,hot:0,content:"异人活动被纳入统一管理体系，以快递公司为掩护，各大区设负责人与临时工编制，维持异人界与普通社会的隔离。"},{id:"e-1",year:"1944",date:"1944年秋",title:"甲申之乱：三十六贼结义，八奇技现世",loc:"陕西/四川一带",sec:4,hot:1,content:"三十六名各门派弟子结义，其中八人悟出八种逆天手段，史称「八奇技」。事后各派追杀，三十六贼星散，成为异人界最大悬案。"},{id:"e-2",year:"1949-1990",date:"时间不详",title:"冯宝宝出现于四川",loc:"四川",sec:3,hot:0,content:"一名不老不死的少女被徐家收养，容貌数十年不变。她没有记忆，却拥有超常的战斗本能。"},{id:"e-3",year:"近年",date:"罗天大醮期间",title:"罗天大醮于龙虎山召开，张楚岚夺冠",loc:"江西龙虎山",sec:2,hot:1,content:"天师府以选拔继承人为名召开罗天大醮，各派年轻异人云集。张楚岚最终以阳五雷击败张灵玉夺冠。"},{id:"e-4",year:"近年",date:"罗天大醮当夜",title:"全性大闹龙虎山，田晋中遇害",loc:"江西龙虎山",sec:3,hot:1,content:"全性趁醮会攻山，代掌门龚庆向田晋中逼问甲申之乱记忆后将其杀害。老天师震怒，随后下山清剿全性。"},{id:"e-5",year:"近年",date:"罗天大醮之后",title:"碧游村事件：修身炉与临时工联合行动",loc:"碧游村",sec:3,hot:1,content:"马仙洪以神机百炼建造修身炉，企图批量制造异人。各大区临时工联合行动，碧游村复灭，马仙洪在押解途中逃脱。"},{id:"e-6",year:"近年",date:"碧游村事件",title:"陈朵之死与廖忠殉职",loc:"碧游村",sec:3,hot:0,content:"蛊身少女陈朵在事件尽头选择了自己的结局；华南区负责人廖忠此前已为她殉职。"},{id:"e-7",year:"近年",date:"碧游村之后",title:"秦岭：二十四节通天谷探索",loc:"秦岭",sec:3,hot:0,content:"众人深入秦岭秘境，寻找无根生留下的线索与宝藏，三十六贼往事再掀波澜。"}],library:[{id:"l-1",cat:"八奇技",title:"炁体源流",sec:4,content:'领悟者：张怀义。被称为"术之尽头"，疑似能将炁与生命本源合一，元婴化形、生生不息。张楚岚身上的"老农"与其相关。具体原理至今成谜。'},{id:"l-2",cat:"八奇技",title:"通天箓",sec:2,content:"领悟者：郑子布。不用设坛、不用纸笔，念动即符箓成型，可瞬间释放大量符箓。陆瑾曾持有，后转交张灵玉。"},{id:"l-3",cat:"八奇技",title:"风后奇门",sec:3,content:"领悟者：周圣。奇门遁甲的极致，可自定中宫、拨乱时间空间，转盘之内我即规则。王也习得，代价是被天道反噬。"},{id:"l-4",cat:"八奇技",title:"神机百炼",sec:3,content:'领悟者：马仙洪一脉。可瞬间完成御物、炼化物，能造傀儡、法器乃至修身炉，是"造物"的极致。'},{id:"l-5",cat:"八奇技",title:"双全手",sec:4,content:"领悟者：端木瑛。操纵肉身与灵魂，可救人亦可杀人，明魂术被疑为其残缺分支。吕家因此背负巨大秘密。"},{id:"l-6",cat:"八奇技",title:"拘灵遣将",sec:2,content:'领悟者：风天养。可拘收灵体、令其为将，风家因此受灵界忌惮，家族承诺"不王天下"。'},{id:"l-7",cat:"八奇技",title:"六库仙贼",sec:3,content:"领悟者：阮丰。以六库偷天，可吞噬他人生机、延年益寿，近乎不死，但永受饥饿之苦。"},{id:"l-8",cat:"八奇技",title:"大罗洞观",sec:4,content:"领悟者：谷畸亭。八奇技中最神秘的一种，疑似与观想、时空错觉有关，现世记录极少。"},{id:"l-9",cat:"基础",title:"异人与炁",sec:1,content:"炁是生命本源的能量，能感知并操纵炁的人称为异人。异人为少数，多数隐于市井。炁的运用分化为各门功法：符箓、奇门、炼体、御物、蛊毒等。"},{id:"l-10",cat:"组织",title:"全性",sec:2,content:'千年邪教，门人多为不被正道接纳的异人，信奉"全性保真"，实为各派通缉对象。百年仅认无根生为掌门，现由龚庆代掌。'},{id:"l-11",cat:"组织",title:"哪都通与临时工制度",sec:1,content:'哪都通以快递为掩护管理异人事务。正式员工之外，各大区可雇佣"临时工"：多为戴罪或难以安置的异人，以任务换自由，行动灵活但风险极高。'},{id:"l-12",cat:"组织",title:"十佬",sec:1,content:"异人界十个最有话语权的人物与家族组成的议事机构，老天师、陆瑾、风正豪等位列其中，负责调解各派、裁决大事。"},{id:"l-13",cat:"历史",title:"甲申之乱与三十六贼",sec:4,content:"1944年，三十六名来自各派的弟子结义，其中八人悟出八奇技。各派为灭口与夺技展开追杀，三十六贼或死或隐。真相被各方刻意掩埋，至今仍是异人界最大的禁忌。"},{id:"l-14",cat:"仪式",title:"罗天大醮",sec:1,content:'道门最高规格的醮仪，天师府借此选拔天师继承人。年轻异人公开比斗，是异人界少有的"盛世"，也是各方势力的角力场。'}],packages:[{id:"pk-1",code:"NDT7770001234",from:"北京·海淀转运中心",to:"成都·武侯区科华北路",weight:"1.2kg",status:"已签收",timeline:[{t:"2026-10-14 09:12",title:"已揽收",desc:"北京海淀中关村营业部已揽收",state:"done"},{t:"2026-10-14 21:40",title:"到达转运中心",desc:"北京转运中心已发出",state:"done"},{t:"2026-10-15 14:05",title:"到达成都转运中心",desc:"下一站：武侯营业部",state:"done"},{t:"2026-10-16 08:30",title:"派送中",desc:"快递员 王师傅 正在派送",state:"done"},{t:"2026-10-16 11:02",title:"已签收",desc:"本人签收，感谢使用哪都通",state:"done"}]},{id:"pk-2",code:"NDT6660005678",from:"青岛·崂山营业部",to:"上海·浦东新区张江镇",weight:"3.6kg",status:"派送中",timeline:[{t:"2026-10-18 16:20",title:"已揽收",desc:"青岛崂山营业部已揽收",state:"done"},{t:"2026-10-19 02:00",title:"到达济南转运中心",desc:"",state:"done"},{t:"2026-10-19 23:50",title:"到达上海转运中心",desc:"下一站：张江营业部",state:"done"},{t:"2026-10-20 07:40",title:"派送中",desc:"快递员 李师傅 正在派送，电话 138****6688",state:"cur"},{t:"",title:"待签收",desc:"",state:""}]}],chats:{},rooms:[makeRoom("聊天室1")],theme:"default",workgroup:{members:[],messages:[]},oa:[],divination:{},codes:{emp:"NDT-EMP",mgr:"NDT-MGR",user:"NDT-USER"},boards:["公告","异人讨论","功法交流","天下见闻","求助","灌水"]}}const Auth={login(account,pwd){const u=DB.data.users.find(x=>x.code&&x.code.toUpperCase()===account.toUpperCase()||x.name===account);return u?u.password!==pwd?{ok:!1,msg:"密码错误"}:(DB.data.session=u.id,DB.data.proactiveSessionToken=genId("login"),resetProactiveWaitForLogin(),DB.save(),{ok:!0,user:u}):{ok:!1,msg:"账号不存在"}},register(name,pwd){if(!name||name.length<2)return{ok:!1,msg:"昵称至少 2 个字符"};if(DB.data.users.some(x=>x.name===name))return{ok:!1,msg:"昵称已被占用"};const u={id:genId("u"),code:"",name,password:pwd,level:1,avatar:"",bio:"这个人很懒，什么都没留下。",zika:"新成员",zikaColor:"",tpl:"blue",main:"",regAt:nowStr(),friends:[],notice:""};return DB.data.users.push(u),DB.data.session=u.id,DB.data.proactiveSessionToken=genId("login"),resetProactiveWaitForLogin(),DB.save(),{ok:!0,user:u}},logout(){DB.data.session=null,DB.data.proactiveSessionToken=null,DB.save()},activate(code){const c=(code||"").trim().toUpperCase(),u=DB.user;return u?c===DB.data.codes.mgr?(u.level=3,DB.save(),{ok:!0,msg:"已提升为管理员，全档案开放"}):c===DB.data.codes.emp?(u.level=2,DB.save(),{ok:!0,msg:"员工身份已激活，档案/事件/资料库已开放"}):c===DB.data.codes.user?(u.level=1,DB.save(),{ok:!0,msg:"已恢复为普通异人身份"}):{ok:!1,msg:"激活码无效"}:{ok:!1,msg:"请先登录"}},canViewSec(sec){return DB.level()>=(sec>=4?3:2)}};function toggleVote(arr){const u=DB.user;if(!u)return toast("请先登录后再操作","warn"),!1;const i=arr.indexOf(u.id);return i>=0?arr.splice(i,1):arr.push(u.id),DB.save(),!0}function syncVoteUI(kind,id,votes){var _a;const buttons=kind==="post"?$$("[data-vote]").filter(b=>b.dataset.vote===id):$$("[data-avote]").filter(b=>b.dataset.avote===id);kind==="post"&&$("#p-vote")&&curPostId()===id&&buttons.push($("#p-vote"));const selected=!!(DB.user&&votes.includes(DB.user.id));buttons.forEach(btn=>{var _a2,_b;btn.classList.toggle("on",selected),btn.dataset.voted=selected?"1":"0",btn.setAttribute("aria-pressed",selected?"true":"false"),btn.setAttribute("aria-label",selected?"取消赞同":"赞同帖子");const label=btn.querySelector(".vote-label");label&&(label.textContent=selected?"已赞同":"赞同");const count=(_a2=btn.closest(".q-vote"))==null?void 0:_a2.querySelector(".vote-count");count&&(count.textContent=String(votes.length+(kind==="post"&&Number((_b=DB.data.posts.find(p=>p.id===id))==null?void 0:_b.simulatedLikes)||0)))}),kind==="post"&&$(".q-vote-detail .vote-count")&&($(".q-vote-detail .vote-count").textContent=String(votes.length+(Number((_a=DB.data.posts.find(p=>p.id===id))==null?void 0:_a.simulatedLikes)||0))),kind==="post"&&$(".q-vote-detail .vote-caption")&&($(".q-vote-detail .vote-caption").textContent="人赞同")}function recordEdit(item){const u=DB.user;u&&(item.editedBy=item.editedBy||[],item.editedBy.push({name:u.name,at:nowStr()}))}function postAuthor(p){const u=DB.data.users.find(x=>x.id===p.authorId)||{name:"未知"};return p.authorName||u.name}function ansAuthor(a){const u=DB.data.users.find(x=>x.id===a.authorId)||{name:"未知"};return a.authorName||u.name}function setVoteCount(arr,n){n=Math.max(0,parseInt(n)||0);const me=DB.user,out=(me&&arr.includes(me.id)?[me.id]:[]).slice();for(let i=0;out.length<n;i++)out.push("syn-vote-"+i);arr.splice(0,arr.length,...out.slice(0,n))}function surfaceHeader(on){return`<div class="topbar"><div class="wrap"><span>客服热线：400-888-0000（7×24小时）</span>
    <div class="tb-r"><a href="#/sites">网点查询</a>${DB.user?`<a href="#/space/${DB.user.id}">${esc(DB.user.name)}</a><a id="lg-out" href="javascript:void(0)">退出</a>`:'<a href="#/login">登录</a><a href="#/register">注册</a>'}</div></div></div>
  <header class="header"><div class="wrap">
    <div class="logo" id="logo-go"><img src="assets/logo.png" alt="哪都通"><div class="logo-txt">哪都通快递<small>NADUTONG EXPRESS</small></div></div>
    <nav class="nav">
      <a href="#/" class="${on==="home"?"on":""}">首页</a>
      <a href="#/track" class="${on==="track"?"on":""}">查快递</a>
      <a href="#/sites" class="${on==="sites"?"on":""}">网点查询</a>
      <a href="#/service" class="${on==="service"?"on":""}">寄件服务</a>
      <a href="#/my-ship" class="${on==="my-ship"?"on":""}">我的寄件</a>
      <a href="#/news" class="${on==="news"?"on":""}">新闻公告</a>
      <a href="#/about" class="${on==="about"?"on":""}">关于我们</a>
    </nav>
  </div></header>`}function surfaceFooter(){return`<footer class="footer"><div class="wrap">
    <div class="fgrid">
      <div><div class="logo" style="margin-bottom:14px"><img src="assets/logo.png" alt="哪都通" style="height:40px"></div>
        <p>哪都通快递有限公司，成立以来始终专注于为客户提供高效、安全、可靠的快递物流服务。您的包裹，无处不达。</p></div>
      <div><h4>自助服务</h4><a href="#/track">快递查询</a><a href="#/service">在线寄件</a><a href="#/sites">网点查询</a><a href="#/service">运费查询</a></div>
      <div><h4>客户服务</h4><a href="#/about">服务条款</a><a href="#/about">隐私政策</a><a href="#/about">理赔说明</a><a href="#/about">联系我们</a></div>
      <div><h4>关于哪都通</h4><a href="#/about">公司简介</a><a href="#/news">新闻公告</a><a href="#/about">加入我们</a><a href="#/author">作者信息</a></div>
    </div>
    <div class="copy">哪都通快递有限公司 版权所有 | 京ICP备00000000号 | 本网站为同人非盈利娱乐作品，一切为虚拟娱乐切勿当真<br>
    <a href="#/gate" style="color:#46548C;font-size:11px">员工入口</a></div>
  </div></footer>`}function viewHome(){return surfaceHeader("home")+`<div class="hero"><div class="wrap">
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
      <div class="svc-card"><div class="svc-ico">${svgIco("box")}</div><h3>同城急送</h3><p>同城范围内专人专送，最快 1 小时上门取件、当日送达。</p></div>
      <div class="svc-card"><div class="svc-ico">${svgIco("truck")}</div><h3>标准快递</h3><p>全国 31 省高效中转，多数城市次日达，全程可追踪。</p></div>
      <div class="svc-card"><div class="svc-ico">${svgIco("plane")}</div><h3>航空快运</h3><p>长距离急件优先空运，重点城市 24 小时内送达。</p></div>
      <div class="svc-card"><div class="svc-ico">${svgIco("biz")}</div><h3>企业物流</h3><p>为电商与企业客户提供仓配一体、批量寄件的定制方案。</p></div>
    </div>
  </div></div>
  <div class="section" style="background:#fff"><div class="wrap">
    <h2>新闻公告</h2><div class="sub">了解哪都通的最新动态</div>
    <div class="grid g2">
      ${viewNewsList(4).map(n=>`<div class="news-item"><div class="nd"><b>${n.d}</b><span>${n.m}</span></div><div><h3>${esc(n.t)}</h3><p>${esc(n.p)}</p></div></div>`).join("")}
    </div>
    <div style="text-align:center;margin-top:26px"><a class="btn btn-ghost" href="#/news">查看全部公告</a></div>
  </div></div>
  <div class="band"><h2>寄快递，就找哪都通</h2><p>上门取件 · 在线下单 · 全程保价</p><a class="btn btn-orange" href="#/service">立即寄件</a></div>`+surfaceFooter()}function viewNewsList(n){const all=[{d:"18",m:"10月",t:"哪都通新增 12 个城市次日达线路",p:"华东、西南地区转运网络升级，更多城市实现次日达。"},{d:"10",m:"10月",t:"国庆假期快递服务安排公告",p:"假期期间正常揽收派送，部分偏远地区时效略有调整。"},{d:"26",m:"09月",t:"哪都通快递员安全驾驶培训圆满完成",p:"全国各网点开展安全驾驶与服务规范专项培训。"},{d:"15",m:"09月",t:"生鲜寄递专项通道上线",p:"冷链包装、优先中转，为生鲜包裹提供全程保障。"},{d:"01",m:"09月",t:"哪都通开展秋季客户服务月活动",p:"服务升级，保价理赔流程进一步简化。"},{d:"20",m:"08月",t:"智能分拣中心投入使用",p:"自动化分拣大幅提升中转效率与准确率。"}];return all.slice(0,n||all.length)}function viewNews(){return surfaceHeader("news")+`<div class="page-head"><div class="wrap"><h1>新闻公告</h1><p>哪都通最新动态与服务通知</p></div></div>
  <div class="section"><div class="wrap"><div class="card-box">
    ${viewNewsList().map(n=>`<div class="news-item"><div class="nd"><b>${n.d}</b><span>${n.m}</span></div><div><h3>${esc(n.t)}</h3><p>${esc(n.p)}</p></div></div>`).join("")}
  </div></div></div>`+surfaceFooter()}const REGIONS=[{id:"huabei",name:"华北区",hq:"北京 · 华北大区管理中心",outlets:[{city:"北京",addr:"海淀区中关村大街 27 号",tel:"010-8800****"},{city:"天津",addr:"和平区南营门街 12 号",tel:"022-2700****"},{city:"石家庄",addr:"长安区建设北大街 60 号",tel:"0311-8600****"},{city:"太原",addr:"迎泽区解放南路 18 号",tel:"0351-4000****"},{city:"呼和浩特",addr:"新城区新华大街 88 号",tel:"0471-6900****"}]},{id:"huadong",name:"华东区",hq:"上海 · 华东大区管理中心",outlets:[{city:"上海",addr:"浦东新区张江高科技园区博云路 2 号",tel:"021-5800****"},{city:"南京",addr:"鼓楼区中山北路 30 号",tel:"025-8300****"},{city:"杭州",addr:"西湖区文三路 259 号",tel:"0571-8800****"},{city:"合肥",addr:"庐阳区长江中路 150 号",tel:"0551-6200****"},{city:"福州",addr:"鼓楼区五四路 158 号",tel:"0591-8700****"},{city:"南昌",addr:"东湖区八一大道 368 号",tel:"0791-8600****"},{city:"济南",addr:"历下区泉城路 188 号",tel:"0531-8600****"}]},{id:"huanan",name:"华南区",hq:"广州 · 华南大区管理中心",outlets:[{city:"广州",addr:"天河区天河路 208 号",tel:"020-8700****"},{city:"深圳",addr:"福田区华强北路 1050 号",tel:"0755-8300****"},{city:"南宁",addr:"青秀区民族大道 136 号",tel:"0771-5500****"},{city:"海口",addr:"龙华区国贸路 45 号",tel:"0898-6600****"}]},{id:"huazhong",name:"华中区",hq:"武汉 · 华中大区管理中心",outlets:[{city:"郑州",addr:"金水区花园路 100 号",tel:"0371-6500****"},{city:"武汉",addr:"江汉区解放大道 690 号",tel:"027-8500****"},{city:"长沙",addr:"芙蓉区五一大道 589 号",tel:"0731-8400****"}]},{id:"xinan",name:"西南区",hq:"成都 · 西南大区管理中心",outlets:[{city:"重庆",addr:"渝中区解放碑民族路 128 号",tel:"023-6300****"},{city:"成都",addr:"武侯区科华北路 62 号",tel:"028-8500****"},{city:"贵阳",addr:"云岩区中华中路 120 号",tel:"0851-8500****"},{city:"昆明",addr:"五华区东风西路 99 号",tel:"0871-6300****"},{city:"拉萨",addr:"城关区北京中路 46 号",tel:"0891-6300****"}]},{id:"xibei",name:"西北区",hq:"西安 · 西北大区管理中心",outlets:[{city:"西安",addr:"雁塔区高新路 25 号",tel:"029-8800****"},{city:"兰州",addr:"城关区庆阳路 168 号",tel:"0931-8400****"},{city:"西宁",addr:"城西区五四大街 38 号",tel:"0971-6100****"},{city:"银川",addr:"兴庆区解放西街 126 号",tel:"0951-6000****"},{city:"乌鲁木齐",addr:"天山区光明路 118 号",tel:"0991-2800****"}]},{id:"dongbei",name:"东北区",hq:"沈阳 · 东北大区管理中心",outlets:[{city:"沈阳",addr:"沈河区青年大街 126 号",tel:"024-2200****"},{city:"长春",addr:"朝阳区人民大街 4500 号",tel:"0431-8800****"},{city:"哈尔滨",addr:"南岗区红军街 50 号",tel:"0451-5300****"}]}];function viewSites(){const tabs=REGIONS.map((r,i)=>`<button class="site-tab ${i===0?"on":""}" data-site-tab="${r.id}">${r.name}</button>`).join(""),panels=REGIONS.map((r,i)=>`<div class="site-panel" data-site-panel="${r.id}" ${i?"hidden":""}>
    <div class="region-hq"><span class="rhq-ic">◈</span>大区管理中心：${esc(r.hq)}</div>
    <div class="outlet-grid">${r.outlets.map(o=>`<div class="card-box outlet-card">
      <h4>${esc(o.city)}</h4>
      <div class="muted">地址：${esc(o.addr)}</div>
      <div class="muted">电话：${esc(o.tel)}</div>
      <div class="muted" style="margin-top:6px">营业时间：08:30 - 18:00</div>
    </div>`).join("")}</div>
  </div>`).join("");return surfaceHeader("sites")+`<div class="page-head"><div class="wrap"><h1>网点查询</h1><p>全国七大区网点一览，就近选择</p></div></div>
  <div class="section"><div class="wrap">
    <div class="site-tabs">${tabs}</div>
    ${panels}
  </div></div>`+surfaceFooter()}function packageStamp(date){const p=n=>String(n).padStart(2,"0");return`${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}`}function genPackage(code){const normalized=String(code||"").trim().toUpperCase();let h=0;for(let i=0;i<normalized.length;i++)h=Math.imul(h,31)+normalized.charCodeAt(i)>>>0;const cities=["北京","上海","广州","成都","武汉","西安","青岛","杭州","南京","重庆"],fromIndex=h%cities.length;let toIndex=(h>>>3)%cities.length;toIndex===fromIndex&&(toIndex=(toIndex+3)%cities.length);const from=cities[fromIndex],to=cities[toIndex],stage=h%4,base=new Date;base.setHours(9,0,0,0);const makeTime=(dayOffset,hour,minute)=>{const d=new Date(base);return d.setDate(d.getDate()+dayOffset),d.setHours(hour,minute,0,0),packageStamp(d)},all=[{t:makeTime(-2,10,12),title:"已揽收",desc:`${from}始发营业部已完成揽收，包裹等待发往分拨中心。`},{t:makeTime(-1,4,26),title:"运输中",desc:`包裹已到达${from}转运中心，正在进行分拣与装车。`},{t:makeTime(0,7,48),title:"到达目的地",desc:`包裹已抵达${to}分拨中心，准备转入末端网点。`},{t:makeTime(0,9,16),title:"派送中",desc:`${to}派送员已接收包裹，正在按路线派送。`},{t:makeTime(0,11,8),title:"已签收",desc:"包裹已完成签收，感谢使用哪都通。"}],visibleCount=[1,2,3,4,5][stage],timeline=all.slice(0,visibleCount).map((x,i)=>({...x,state:i===visibleCount-1?"cur":"done"})),states=["已揽收","运输中","派送中","已签收"];return stage===2&&(timeline[timeline.length-1].title="派送中",timeline[timeline.length-1].desc=`${to}派送员已接收包裹，正在按路线派送。`,timeline[timeline.length-1].t=makeTime(0,9,16)),stage===3&&(timeline[timeline.length-1].state="done",timeline.push({...all[4],state:"cur"})),{id:genId("pk"),code:normalized,from:`${from}转运中心`,to:`${to}派送网点`,weight:"待称重",status:states[stage],timeline}}function isValidPackageStamp(value){return/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(String(value||""))?Number.isFinite(new Date(String(value).replace(" ","T")).getTime()):!1}function findOrGen(code){const normalized=String(code||"").trim().toUpperCase();let pk=(DB.data.packages||[]).find(x=>String(x.code||"").trim().toUpperCase()===normalized);if(pk||(!/^NDT/i.test(normalized)||DB.data.packages.length<200?(pk=genPackage(normalized),Array.isArray(DB.data.packages)||(DB.data.packages=[]),DB.data.packages.push(pk),DB.save()):pk=genPackage(normalized)),Array.isArray(pk.timeline)||(pk.timeline=[]),pk.timeline.some(x=>x&&x.t&&!isValidPackageStamp(x.t))){const fixed=genPackage(normalized),keepId=pk.id;Object.assign(pk,fixed,{id:keepId||fixed.id,code:normalized}),DB.save()}else pk.timeline=pk.timeline.filter(x=>x&&x.title).map(x=>({...x,t:String(x.t||""),desc:String(x.desc||"物流节点已更新，详情请以最新状态为准。")}));return pk}function trackHtml(pk){return`<div class="card-box" style="margin-bottom:20px">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;align-items:center">
      <div><b style="font-size:17px">${esc(pk.code)}</b><span class="tag ${pk.status==="已签收"?"tag-green":"tag-orange"}" style="margin-left:10px">${esc(pk.status)}</span></div>
      <div class="muted" style="font-size:13px">${esc(pk.from)} → ${esc(pk.to)} | 重量 ${esc(pk.weight)}</div>
    </div></div>
    <div class="card-box"><div class="tl">
      ${pk.timeline.filter(x=>x&&x.title).map(x=>`<div class="tl-item ${esc(x.state||"")} ${x.state==="cur"?"current":""}"><div class="t">${esc(x.t||"时间待更新")}</div><h4>${esc(x.title)}</h4><p>${esc(x.desc||"物流节点已更新，详情请以最新状态为准。")}</p></div>`).join("")||'<div class="empty">暂无物流轨迹</div>'}
    </div></div>`}function viewTrack(code){return surfaceHeader("track")+`<div class="page-head"><div class="wrap"><h1>快递查询</h1><p>输入运单号，实时查询包裹动态</p></div></div>
  <div class="section"><div class="wrap">
    <div class="track-box" style="max-width:none;margin:0 0 28px"><input id="tb-code" placeholder="请输入运单号，如 NDT7770001234" value="${esc(code||"")}"><button class="btn btn-orange" id="tb-go">查询</button></div>
    <div id="track-result">${code?shipTrackFor(code):'<div class="card-box empty" style="color:var(--muted)"><div class="es">📦</div>请输入运单号开始查询<br><span style="font-size:12.5px">试试示例单号：NDT7770001234 或 NDT6660005678</span></div>'}</div>
  </div></div>`+surfaceFooter()}function viewService(){return surfaceHeader("service")+`<div class="page-head"><div class="wrap"><h1>寄件服务</h1><p>在线下单，快递员上门取件</p></div></div>
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
  </div></div></div>`+surfaceFooter()}function viewAbout(){return surfaceHeader("about")+`<div class="page-head"><div class="wrap"><h1>关于我们</h1><p>哪都通快递——您的包裹，无处不达</p></div></div>
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
  </div></div></div>`+surfaceFooter()}function viewAuthorInfo(){return surfaceHeader()+`<div class="page-head"><div class="wrap"><h1>作者信息</h1></div></div>
  <div class="section"><div class="wrap"><div class="card-box" style="max-width:680px;margin:0 auto;line-height:2.1">
    <p><strong>本网站作者：</strong>闻沄鉴</p>
    <p><strong>抖音：</strong>Wenyunjian63</p>
    <p><strong>红薯：</strong>95634279293</p>
    <p style="margin-top:14px">本网站为非营利同人产物</p>
    <p>如果你对乙代梦抱有恶意请不要使用本网站</p>
  </div></div></div>`+surfaceFooter()}function viewLogin(){return surfaceHeader()+`<div class="section"><div class="wrap"><div class="card-box" style="max-width:420px;margin:0 auto">
    <h3 style="text-align:center;font-size:20px;margin-bottom:4px">登录哪都通</h3>
    <p class="muted" style="text-align:center;font-size:13px;margin-bottom:16px">员工可用工号登录，普通用户用昵称登录</p>
    <label class="fl">账号 / 工号</label><input class="field" id="lg-acc" placeholder="昵称 或 NDT-0001">
    <label class="fl">密码</label><input class="field" id="lg-pwd" type="password" placeholder="请输入密码">
    <button class="btn btn-block" style="margin-top:20px" id="lg-go">登录</button>
    <p style="text-align:center;margin-top:16px;font-size:13.5px" class="muted">还没有账号？<a href="#/register">立即注册</a></p>
  </div></div></div>`+surfaceFooter()}function viewRegister(){return surfaceHeader()+`<div class="section"><div class="wrap"><div class="card-box" style="max-width:420px;margin:0 auto">
    <h3 style="text-align:center;font-size:20px;margin-bottom:4px">注册哪都通</h3>
    <p class="muted" style="text-align:center;font-size:13px;margin-bottom:16px">注册后可在异人论坛发帖交流</p>
    <label class="fl">昵称</label><input class="field" id="rg-name" placeholder="给自己起个昵称">
    <label class="fl">密码</label><input class="field" id="rg-pwd" type="password" placeholder="设置一个密码">
    <button class="btn btn-orange btn-block" style="margin-top:20px" id="rg-go">注册并登录</button>
    <p style="text-align:center;margin-top:16px;font-size:13.5px" class="muted">已有账号？<a href="#/login">直接登录</a></p>
  </div></div></div>`+surfaceFooter()}function svgIco(n){const p={box:"M3 7l9-4 9 4-9 4-9-4zm0 0v10l9 4 9-4V7M12 11v10",truck:"M3 6h11v9H3zM14 9h4l3 3v3h-7M7.5 18.5a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6zm10 0a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6z",plane:"M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z",biz:"M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01",search:"M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-4.3-4.3",pen:"M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z",user:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",users:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8",file:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h6",clock:"M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",book:"M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5zM4 19.5V22h16",home:"M3 12l9-9 9 9M5 10v10h14V10",gear:"M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 00-.1-1.3l2-1.6-2-3.4-2.4 1a7.4 7.4 0 00-2.2-1.3L14.3 2h-4.6l-.4 2.4A7.4 7.4 0 007 5.7l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 000 2.6l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 002.2 1.3l.4 2.4h4.6l.4-2.4a7.4 7.4 0 002.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3z",shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",cloud:"M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.7 1.6A4 4 0 0 0 6.5 19z",back:"M19 12H5M12 19l-7-7 7-7"};return`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${p[n]||p.file}"/></svg>`}function lvlName(l){return["","普通异人","哪都通员工","管理员"][l]||""}function unreadCount(section){const d=DB.data||{};if(section==="forum"){if(Cloud.connected)return Cloud.notif.unread||0;const u=DB.user;return u?(d.forumNotices||[]).filter(n=>n.userId===u.id&&!n.read&&n.kind!=="growth").reduce((s,n)=>s+Math.max(1,Number(n.count)||1),0):0}if(section==="messages")return Object.values(d.chats||{}).reduce((n,c)=>n+Math.max(0,Number(c&&c.unread)||0),0);if(section==="room")return(d.rooms||[]).reduce((n,r)=>n+Math.max(0,Number(r&&r.unread)||0),0);if(section==="workgroup")return Math.max(0,Number((d.workgroup||{}).unread)||0);if(section==="oa"){const u=DB.user;if(!u)return 0;if(Number(u.level)>=3)return(d.oa||[]).filter(x=>x.status==="pending").length;const seen=Number(u.oaSeenAt)||0;return(d.oa||[]).filter(x=>x.userId===u.id&&x.status!=="pending"&&Number(x.reviewedAt||0)>seen).length}return 0}function unreadBadge(count,cls="side-unread-badge"){const n=Math.max(0,Number(count)||0);return n?`<span class="${cls}" aria-label="${n} 条未读消息">${n>99?"99+":n}</span>`:""}function syncUnreadBadges(){const map={forum:0,"forum-notices":unreadCount("forum"),messages:unreadCount("messages"),room:unreadCount("room"),workgroup:unreadCount("workgroup"),oa:unreadCount("oa")};Object.entries(map).forEach(([id,count])=>{const item=$(`.side-item[data-section="${id}"]`);if(!item)return;let badge=item.querySelector(".side-unread-badge");count?(badge||(badge=document.createElement("span"),badge.className="side-unread-badge",item.appendChild(badge)),badge.textContent=count>99?"99+":String(count),badge.setAttribute("aria-label",count+" 条未读消息")):badge&&badge.remove()})}function portalShell(active,content){const u=DB.user,item=(hash,ico,name,minLvl,id)=>{const locked=minLvl&&u.level<minLvl,section=["forum","forum-notices","messages","room","workgroup","oa"].includes(id)?id:"",badge=section&&id!=="forum"?unreadBadge(unreadCount(section==="forum-notices"?"forum":section)):"";return`<div class="side-item ${active===id?"on":""}" data-section="${section}" data-hash="${locked?"":hash}">${svgIco(ico)}<span class="side-item-label">${name}</span>${badge}${locked?'<span class="lock">锁</span>':""}</div>`},th=DB.data.theme||"default",thCls={day:"theme-day",classic:"theme-classic",cyber:"theme-cyber",rose:"theme-rose",aurora:"theme-aurora",wechat:"theme-wechat",orange:"theme-orange"}[th]||"",themeBtn=(v,label)=>`<button data-theme-set="${v}" class="${th===v?"on":""}">${label}</button>`;return`<div class="portal ${thCls} portal--${active||"none"}">
    <div class="portal-top">
      <div class="p-logo" id="p-home"><span class="mk">${svgIco("shield")}</span>哪都通 · 异人论坛<small>YIREN FORUM</small></div>
      <div class="theme-switch" title="整体主题">
        ${themeBtn("default","默认")}${themeBtn("day","日间")}${themeBtn("classic","古风卷宗")}${themeBtn("cyber","赛博霓虹")}${themeBtn("rose","玫瑰金")}${themeBtn("aurora","极光星河")}${themeBtn("wechat","微信绿")}${themeBtn("orange","暖橙")}
      </div>
      <div class="user-chip" id="p-space">
        <div class="av">${avHtml(u,"av")}</div>
        <div class="un">${esc(u.name)}<small>${lvlName(u.level)}</small></div>
      </div>
      <button class="btn btn-sm btn-ghost" id="p-logout" style="margin-left:0">退出论坛</button>
    </div>
    <div class="portal-body">
      <div class="nav-wrap">
      <aside class="sidebar">
        <div class="sd-group">论坛</div>
        ${item("#/forum","home","论坛首页",0,"forum")}
        ${item("#/forum-notices","bell","帖子消息",0,"forum-notices")}
        ${item("#/wanted","shield","在逃异人",0,"wanted")}
        ${item("#/codex","book-open","异闻典藏",0,"codex")}
        ${item("#/ask","pen","发帖提问",0,"ask")}
        ${item("#/room","users","论坛聊天室",0,"room")}
        ${item("#/cloud","cloud","云端账号",0,"cloud")}
        <div class="sd-group">业务系统</div>
        ${item("#/archives","file","异人档案",2,"archives")}
        ${item("#/events","clock","事件档案",2,"events")}
        ${item("#/library","book","资料库",2,"library")}
        ${u.level>=2?item("#/network/factions","users","势力关系网",2,"network-factions"):""}
        ${u.level>=2?item("#/network/keyPeople","users","重点异人关系网",2,"network-keyPeople"):""}
        ${u.level>=2?item("#/staff-card","biz","专属名片",2,"staff-card"):""}
        ${u.level>=2?item("#/workgroup","users","工作组",2,"workgroup"):""}
        ${u.level>=2?item("#/oa","file","OA 办公",2,"oa"):""}
        ${u.level>=3?item("#/dashboard","gear","管理员工作台",3,"dashboard"):""}
        <div class="sd-group">个人</div>
        ${item("#/messages","users","私信",0,"messages")}
        ${item("#/friends","users","我的好友",0,"friends")}
        ${item("#/divination","clock","抽签问吉",0,"divination")}
        ${item("#/yijing","book","伏羲六十四卦",0,"yijing")}
        ${item("#/tarot","moon","塔罗占卜",0,"tarot")}
        ${item("#/huang","star","黄大仙灵签",0,"huang")}
        ${item("#/space/me","user","个人空间",0,"space")}
        ${item("#/ability","star","个人能力详情",0,"ability")}
        ${item("#/tetris","biz","方块小游戏",0,"tetris")}
        ${item("#/decorate","pen","空间装修",0,"decorate")}
        ${item("#/settings","gear","数据中心",0,"settings")}
      </aside>
      </div>
      <main class="p-main">${content}</main>
    </div></div>`}function staffCardOf(u){var _a,_b,_c,_d,_e,_f,_g,_h,_i,_j,_k,_l;const stored=u.staffCard&&typeof u.staffCard=="object"?u.staffCard:{},fallbackNo=u.code||(u.id?"NDT-"+String(u.id).replace(/[^a-z0-9]/gi,"").slice(-6).toUpperCase():"");return{displayName:(_b=(_a=stored.displayName)!=null?_a:u.name)!=null?_b:"",employeeNo:(_c=stored.employeeNo)!=null?_c:fallbackNo,department:(_d=stored.department)!=null?_d:"待分配部门",position:(_e=stored.position)!=null?_e:u.level>=3?"管理员":"正式员工",rank:(_f=stored.rank)!=null?_f:u.level>=3?"管理岗":"员工",joinDate:(_g=stored.joinDate)!=null?_g:u.regAt?u.regAt.slice(0,10):"",workStatus:(_h=stored.workStatus)!=null?_h:"在职",contact:(_i=stored.contact)!=null?_i:"",specialty:(_j=stored.specialty)!=null?_j:"",motto:(_k=stored.motto)!=null?_k:"恪尽职守，使命必达。",profile:(_l=stored.profile)!=null?_l:""}}function viewStaffCard(){const u=DB.user;if(!u||u.level<2)return portalShell("staff-card",accessDenied());const c=staffCardOf(u),show=(v,alt="未填写")=>esc(v||alt),html=`<div class="p-crumb">内部业务系统 / <b>专属名片</b></div>
    <div class="p-panel">
      <h2>我的专属名片</h2>
      <div class="ph-sub">员工与管理员专属 · 展示个人岗位档案，可随时修改并保存</div>
      <section class="staff-card-preview" aria-label="专属人员名片预览">
        <div class="staff-card-top">
          <div class="staff-emblem">${svgIco("shield")}</div>
          <div class="staff-card-brand">哪都通 · 内部人员名片<small>STAFF IDENTITY CARD / CONFIDENTIAL</small></div>
          <span class="lvl-badge ${u.level>=3?"lvl-3":"lvl-2"}">${esc(lvlName(u.level))}</span>
        </div>
        <div class="staff-card-hero">
          <div class="staff-card-avatar">${esc(avText(c.displayName||u.name))}</div>
          <div style="min-width:0">
            <span class="staff-card-eyebrow">OFFICIAL PROFILE</span>
            <h3>${show(c.displayName,u.name)}</h3>
            <p>${show(c.position,u.level>=3?"管理员":"正式员工")} · ${show(c.department,"待分配部门")}</p>
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
        <div class="staff-card-note"><strong>个人简介 / 职责说明</strong>${show(c.profile,"暂无简介，可在下方编辑。")}</div>
        <div class="staff-card-note"><strong>个人格言</strong>${show(c.motto,"暂无格言")}</div>
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
    </div>`;return portalShell("staff-card",html)}function enterPortal(targetHash){if(document.getElementById("portal-entry")){location.hash=targetHash;return}const steps=["建立加密安全通道","校验身份凭证","同步异人档案","接入异人论坛"],ov=document.createElement("div");ov.id="portal-entry",ov.className="portal-entry",ov.innerHTML=`
    <div class="pe-bg"></div>
    <div class="pe-box">
      <div class="pe-ring">
        <div class="pe-ring-rot"></div>
        <div class="pe-ring-rot pe-ring-rot2"></div>
        <div class="pe-shield">${svgIco("shield")}</div>
      </div>
      <div class="pe-title">哪都通 · 异人论坛</div>
      <div class="pe-step" id="pe-step">${steps[0]}<span class="pe-dots"></span></div>
      <div class="pe-bar"><div class="pe-bar-fill" id="pe-bar-fill"></div></div>
      <div class="pe-percent" id="pe-percent">0%</div>
    </div>`,document.body.appendChild(ov),document.body.style.overflow="hidden",requestAnimationFrame(()=>ov.classList.add("is-in"));let i=0;const stepTimer=setInterval(()=>{if(i++,i<steps.length){const s=$("#pe-step");s&&(s.innerHTML=steps[i]+'<span class="pe-dots"></span>')}},420);let p=0;const progTimer=setInterval(()=>{p=Math.min(100,p+Math.random()*13+7);const f=$("#pe-bar-fill");f&&(f.style.width=p+"%");const pc=$("#pe-percent");pc&&(pc.textContent=Math.floor(p)+"%"),p>=100&&(clearInterval(progTimer),clearInterval(stepTimer))},110);setTimeout(()=>{location.hash=targetHash,requestAnimationFrame(()=>requestAnimationFrame(()=>{ov.classList.add("is-leaving"),document.body.style.overflow="",setTimeout(()=>ov.remove(),620)}))},1720)}function viewGate(){return DB.user?viewForum():`<div class="staff-gate" style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:
    radial-gradient(900px 500px at 70% -10%,rgba(46,71,184,.35),transparent),#0C1740">
    <div style="width:100%;max-width:420px">
      <div class="p-panel" style="text-align:center">
        <div style="width:60px;height:60px;border-radius:14px;background:var(--blue-2);display:flex;align-items:center;justify-content:center;margin:0 auto 14px">${svgIco("shield")}</div>
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
    </div></div>`}const DEFAULT_FORUM_AUTO_REPLY_RULES=[{id:"rule-oa",enabled:!0,keys:["请假","加班","报销","oa","审批","申请","打卡"],reply:"这类事项建议先在 OA 办公中提交申请，填写清楚事由和时间，再留意审批结果。"},{id:"rule-group",enabled:!0,keys:["工作组","群聊","群消息","聊天室"],reply:"需要协作的话，可以到工作组或论坛聊天室联系相关成员；涉及内部信息时注意权限范围。"},{id:"rule-notify",enabled:!0,keys:["通知","提醒","手机","后台","推送","消息提示"],reply:"如果需要手机后台提醒，请先在论坛点击“开启回复提醒”并允许浏览器通知。网页保持本地运行时才能处理本地事件；跨设备推送还需要后台服务。"},{id:"rule-help",enabled:!0,keys:["求助","怎么办","请问","求建议","不懂"],reply:"建议补充一下发生的时间、具体情况和已经尝试过的办法，这样其他成员更容易给出有针对性的建议。"},{id:"rule-cultivation",enabled:!0,keys:["功法","修炼","术法","招式"],reply:"交流修习经验时，建议说明适用条件与风险，未经核实的传闻先标注来源，供大家交叉确认。"},{id:"rule-task",enabled:!0,keys:["任务","行动","报备","联络"],reply:"涉及任务协作时，最好写明负责人、时间范围和紧急联络方式；敏感细节请转到有权限的内部渠道。"}];function forumAutoConfig(){const d=DB.data;(!d.forumAutoReplyConfig||typeof d.forumAutoReplyConfig!="object")&&(d.forumAutoReplyConfig={enabled:!0,frequency:"always",rules:DEFAULT_FORUM_AUTO_REPLY_RULES.map(r=>({...r,keys:[...r.keys]}))});const c=d.forumAutoReplyConfig;return Array.isArray(c.rules)||(c.rules=DEFAULT_FORUM_AUTO_REPLY_RULES.map(r=>({...r,keys:[...r.keys]}))),["always","half","third","rare"].includes(c.frequency)||(c.frequency="always"),Number.isFinite(Number(c.delayMin))||(c.delayMin=3),Number.isFinite(Number(c.delayMax))||(c.delayMax=18),typeof c.enabled!="boolean"&&(c.enabled=!0),c}function forumKeywordRule(text){const s=String(text||"").toLowerCase();return forumAutoConfig().rules.find(rule=>rule.enabled!==!1&&(rule.keys||[]).some(k=>String(k).trim()&&s.includes(String(k).trim().toLowerCase())))||null}function forumKeywordReply(text){const r=forumKeywordRule(text);return r?String(r.reply||"").trim():""}function openForumAutoSettings(){const c=forumAutoConfig(),rowHtml=r=>`<div class="forum-rule-row" data-rule-row="${esc(r.id||genId("rule"))}" style="border:1px solid var(--pt-border);border-radius:10px;padding:10px;margin:10px 0;display:grid;gap:8px">
    <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" data-rule-enabled ${r.enabled===!1?"":"checked"}> 启用此规则</label>
    <label class="fl" style="margin:0">关键词（逗号/顿号/换行分隔）</label><input class="field" data-rule-keys value="${esc((r.keys||[]).join("，"))}" placeholder="例如：请假，报销，打卡">
    <label class="fl" style="margin:0">自动回复内容</label><textarea class="field" data-rule-reply rows="3" placeholder="匹配后回复的内容">${esc(r.reply||"")}</textarea>
    <label class="fl" style="margin:0">回复显示名称</label><input class="field" data-rule-author value="${esc(r.authorName||"论坛助手")}" placeholder="例如：论坛助手、值班管理员">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px">
      <div><label class="fl" style="margin:0">单条触发频率</label><select class="field" data-rule-frequency><option value="global" ${(r.frequency||"global")==="global"?"selected":""}>跟随全局</option><option value="always" ${r.frequency==="always"?"selected":""}>每次</option><option value="half" ${r.frequency==="half"?"selected":""}>约 50%</option><option value="third" ${r.frequency==="third"?"selected":""}>约 33%</option><option value="rare" ${r.frequency==="rare"?"selected":""}>约 20%</option></select></div>
      <div><label class="fl" style="margin:0">最短延迟（秒）</label><input class="field" type="number" min="0" max="86400" data-rule-min value="${r.delayMin!=null&&Number.isFinite(Number(r.delayMin))?Number(r.delayMin):""}" placeholder="跟随全局"></div>
      <div><label class="fl" style="margin:0">最长延迟（秒）</label><input class="field" type="number" min="0" max="86400" data-rule-max value="${r.delayMax!=null&&Number.isFinite(Number(r.delayMax))?Number(r.delayMax):""}" placeholder="跟随全局"></div>
    </div>
    <button class="btn btn-sm btn-danger-soft" type="button" data-rule-delete style="justify-self:end">删除规则</button>
  </div>`,mask=openMask(`<h3>论坛自动回复设置</h3><div class="m-body">
    <p class="ph-sub" style="margin-top:0">支持规则批量维护、JSON 导入导出、单条触发频率、延迟时间和自定义回复显示名。</p>
    <label style="display:flex;gap:8px;align-items:center;margin:10px 0"><input id="forum-auto-enabled" type="checkbox" ${c.enabled?"checked":""}> 开启关键词自动回复</label>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px">
      <div><label class="fl">全局触发频率</label><select id="forum-auto-frequency" class="field"><option value="always" ${c.frequency==="always"?"selected":""}>每次命中</option><option value="half" ${c.frequency==="half"?"selected":""}>约 50%</option><option value="third" ${c.frequency==="third"?"selected":""}>约 33%</option><option value="rare" ${c.frequency==="rare"?"selected":""}>约 20%</option></select></div>
      <div><label class="fl">全局最短延迟（秒）</label><input id="forum-auto-delay-min" class="field" type="number" min="0" max="86400" value="${Math.max(0,Number(c.delayMin)||0)}"></div>
      <div><label class="fl">全局最长延迟（秒）</label><input id="forum-auto-delay-max" class="field" type="number" min="0" max="86400" value="${Math.max(0,Number(c.delayMax)||0)}"></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0"><button class="btn btn-sm btn-ghost" type="button" id="forum-rule-add">＋ 添加规则</button><button class="btn btn-sm btn-ghost" type="button" id="forum-rule-bulk">批量添加</button><button class="btn btn-sm btn-ghost" type="button" id="forum-rule-export">导出规则 JSON</button><button class="btn btn-sm btn-ghost" type="button" id="forum-rule-import-btn">导入规则 JSON</button><input id="forum-rule-import-file" type="file" accept=".json,application/json" class="hide"></div>
    <div id="forum-rule-bulk-box" class="hide"><label class="fl">批量添加格式：每行一条，关键词 | 回复内容 | 回复人（可省略）</label><textarea class="field" id="forum-rule-bulk-text" rows="5" placeholder="请假,报销 | 请先提交 OA 申请。 | 事务助手&#10;工作组,群聊 | 请到对应工作组联系成员。 | 协作助手"></textarea><button class="btn btn-sm" type="button" id="forum-rule-bulk-apply" style="margin-top:8px">添加这些规则</button></div>
    <div id="forum-rule-list">${c.rules.map(rowHtml).join("")}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn btn-sm" type="button" id="forum-rule-save" style="margin-left:auto">保存设置</button></div>
    <div style="font-size:12px;color:var(--pt-muted);line-height:1.7;margin-top:10px">规则按列表顺序匹配，命中第一条后停止；不会对自动回复本身再次触发。延迟是网页运行中的计时，刷新或关闭页面可能中断等待中的回复。</div>
  </div>`),list=mask.querySelector("#forum-rule-list");list.addEventListener("click",e=>{const b=e.target.closest("[data-rule-delete]");b&&b.closest("[data-rule-row]").remove()}),mask.querySelector("#forum-rule-add").addEventListener("click",()=>{list.insertAdjacentHTML("beforeend",rowHtml({id:genId("rule"),enabled:!0,keys:[],reply:"",authorName:"论坛助手",frequency:"global"}))}),mask.querySelector("#forum-rule-bulk").addEventListener("click",()=>mask.querySelector("#forum-rule-bulk-box").classList.toggle("hide")),mask.querySelector("#forum-rule-bulk-apply").addEventListener("click",()=>{const raw=mask.querySelector("#forum-rule-bulk-text").value;let n=0;raw.split(/\r?\n/).forEach(line=>{if(!line.trim())return;const parts=line.split("|").map(x=>x.trim());parts.length<2||!parts[0]||!parts[1]||(list.insertAdjacentHTML("beforeend",rowHtml({id:genId("rule"),enabled:!0,keys:parts[0].split(/[，,、]/).map(x=>x.trim()).filter(Boolean),reply:parts[1],authorName:parts[2]||"论坛助手",frequency:"global"})),n++)}),toast(`已添加 ${n} 条规则，请保存生效`,"ok")}),mask.querySelector("#forum-rule-export").addEventListener("click",()=>{const data={version:1,exportedAt:new Date().toISOString(),config:{enabled:mask.querySelector("#forum-auto-enabled").checked,frequency:mask.querySelector("#forum-auto-frequency").value,delayMin:Number(mask.querySelector("#forum-auto-delay-min").value)||0,delayMax:Number(mask.querySelector("#forum-auto-delay-max").value)||0},rules:[...list.querySelectorAll("[data-rule-row]")].map(row=>({id:row.dataset.ruleRow,enabled:row.querySelector("[data-rule-enabled]").checked,keys:row.querySelector("[data-rule-keys]").value.split(/[，,、\n]/).map(x=>x.trim()).filter(Boolean),reply:row.querySelector("[data-rule-reply]").value.trim(),authorName:row.querySelector("[data-rule-author]").value.trim(),frequency:row.querySelector("[data-rule-frequency]").value,delayMin:row.querySelector("[data-rule-min]").value===""?null:Number(row.querySelector("[data-rule-min]").value),delayMax:row.querySelector("[data-rule-max]").value===""?null:Number(row.querySelector("[data-rule-max]").value)}))},blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url,a.download="论坛关键词自动回复规则.json",a.click(),setTimeout(()=>URL.revokeObjectURL(url),1e3)}),mask.querySelector("#forum-rule-import-btn").addEventListener("click",()=>mask.querySelector("#forum-rule-import-file").click()),mask.querySelector("#forum-rule-import-file").addEventListener("change",async e=>{var _a;const f=e.target.files&&e.target.files[0];if(f)try{const data=JSON.parse(await f.text()),rules=Array.isArray(data)?data:data.rules||((_a=data.config)==null?void 0:_a.rules);if(!Array.isArray(rules))throw new Error("找不到 rules 规则列表");list.innerHTML="",rules.forEach(r=>list.insertAdjacentHTML("beforeend",rowHtml({...r,id:r.id||genId("rule"),keys:Array.isArray(r.keys)?r.keys:String(r.keys||"").split(/[，,、\n]/).filter(Boolean)})));const cfg=data.config||data;cfg.frequency&&(mask.querySelector("#forum-auto-frequency").value=cfg.frequency),cfg.enabled!==void 0&&(mask.querySelector("#forum-auto-enabled").checked=!!cfg.enabled),cfg.delayMin!==void 0&&(mask.querySelector("#forum-auto-delay-min").value=cfg.delayMin),cfg.delayMax!==void 0&&(mask.querySelector("#forum-auto-delay-max").value=cfg.delayMax),toast(`已导入 ${rules.length} 条规则，请检查后保存`,"ok")}catch(err){toast("导入失败：请使用本功能导出的 JSON 格式","err")}}),mask.querySelector("#forum-rule-save").addEventListener("click",()=>{const rules=[...list.querySelectorAll("[data-rule-row]")].map(row=>({id:row.dataset.ruleRow||genId("rule"),enabled:row.querySelector("[data-rule-enabled]").checked,keys:row.querySelector("[data-rule-keys]").value.split(/[，,、\n]/).map(x=>x.trim()).filter(Boolean),reply:row.querySelector("[data-rule-reply]").value.trim(),authorName:row.querySelector("[data-rule-author]").value.trim()||"论坛助手",frequency:row.querySelector("[data-rule-frequency]").value,delayMin:row.querySelector("[data-rule-min]").value===""?null:Math.max(0,Number(row.querySelector("[data-rule-min]").value)||0),delayMax:row.querySelector("[data-rule-max]").value===""?null:Math.max(0,Number(row.querySelector("[data-rule-max]").value)||0)})).filter(r=>r.keys.length&&r.reply);c.enabled=mask.querySelector("#forum-auto-enabled").checked,c.frequency=mask.querySelector("#forum-auto-frequency").value,c.delayMin=Math.max(0,Number(mask.querySelector("#forum-auto-delay-min").value)||0),c.delayMax=Math.max(c.delayMin,Number(mask.querySelector("#forum-auto-delay-max").value)||0),c.rules=rules,DB.data.forumAutoReplyConfig=c,DB.save(),mask.remove(),toast(`自动回复设置已保存（${rules.length} 条有效规则）`,"ok")})}function requestForumNotificationPermission(){if(!("Notification"in window)){toast("当前浏览器不支持网页通知；仍可使用站内未读提示。","warn");return}if(Notification.permission==="granted"){toast("浏览器通知已开启","ok");return}if(Notification.permission==="denied"){toast("通知权限已被浏览器禁止，请到网站设置中手动允许通知。","warn");return}Notification.requestPermission().then(p=>toast(p==="granted"?"回复通知已开启":"你没有允许浏览器通知，站内未读提示仍会保留",p==="granted"?"ok":"warn")).catch(()=>toast("无法申请通知权限，请检查浏览器设置。","warn"))}async function showSiteNotification(title,body,url,tag){if(!("Notification"in window)||Notification.permission!=="granted")return!1;const options={body:String(body||"有新动态").slice(0,180),tag:tag||"ndt-forum",data:{url:url||"#/forum"},renotify:!0};try{if("serviceWorker"in navigator&&window.isSecureContext){const reg=await navigator.serviceWorker.getRegistration();if(reg&&reg.showNotification)return await reg.showNotification(title,options),!0}}catch(e){}try{if(!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)){const n=new Notification(title,options);return n.onclick=()=>{window.focus(),location.hash=options.data.url,n.close()},!0}}catch(e){}return!1}function addForumNotice(post,answer){var _a;const me=DB.user;if(!post||!answer||!post.authorId||post.authorId===answer.authorId||(DB.data.forumNotices=Array.isArray(DB.data.forumNotices)?DB.data.forumNotices:[],DB.data.forumNotices.some(n=>n.answerId===answer.id&&n.userId===post.authorId)))return;const excerpt=String(answer.content||"").replace(/\[img\][\s\S]*?\[\/img\]/g,"[图片]").slice(0,100),isReplyNotice=n=>n.kind==null||n.kind==="reply";let stack=DB.data.forumNotices.find(n=>n.userId===post.authorId&&String(n.postId)===String(post.id)&&!n.read&&isReplyNotice(n)),currentCount=1;if(stack)stack.count=Math.max(1,Number(stack.count)||1)+1,stack.at=nowStr(),stack.answerId=answer.id,stack.excerpt=excerpt,currentCount=stack.count;else{const notice={id:genId("fn"),userId:post.authorId,postId:post.id,answerId:answer.id,count:1,authorName:answer.authorName||((_a=DB.data.users.find(u=>u.id===answer.authorId))==null?void 0:_a.name)||"论坛成员",excerpt,at:nowStr(),read:!1};DB.data.forumNotices.push(notice)}if(me&&post.authorId===me.id){const title=currentCount>1?`您收到 ${currentCount} 条新回复`:"您收到一条新回复";document.hidden?showSiteNotification(title,excerpt,"#/post/"+post.id,"ndt-forum-"+post.id):parseHash().seg[0]==="post"&&parseHash().seg[1]===post.id||toast(title,"ok")}}function addForumLikeNotice(post,actorId){if(!post||!post.authorId||!actorId||String(post.authorId)===String(actorId))return;const recipientId=String(post.authorId);DB.data.forumNotices=Array.isArray(DB.data.forumNotices)?DB.data.forumNotices:[];let n=DB.data.forumNotices.find(x=>String(x.userId)===recipientId&&x.kind==="like"&&String(x.postId)===String(post.id)&&!x.read);n?(n.count=Math.max(1,Number(n.count)||1)+1,n.at=nowStr()):(n={id:genId("fn"),userId:recipientId,kind:"like",postId:post.id,authorName:"",excerpt:"",count:1,at:nowStr(),read:!1},DB.data.forumNotices.push(n)),DB.user&&String(DB.user.id)===recipientId&&(document.hidden?showSiteNotification(n.count>1?`您收到 ${n.count} 条新的点赞`:"您收到一条新的点赞",String(post.title||""),"#/post/"+post.id,"ndt-like-"+post.id):parseHash().seg[0]==="post"&&parseHash().seg[1]===post.id||toast(n.count>1?`您收到 ${n.count} 条新的点赞`:"您收到一条新的点赞","ok"))}function addSimulatedLikeNotice(post,increment){if(!post||!post.authorId||!(increment>0))return;const me=DB.user;if(me&&String(post.authorId)!==String(me.id))return;DB.data.forumNotices=Array.isArray(DB.data.forumNotices)?DB.data.forumNotices:[];const recipientId=String(post.authorId);let n=DB.data.forumNotices.find(x=>String(x.userId)===recipientId&&x.kind==="like"&&String(x.postId)===String(post.id)&&!x.read);n?(n.count=Math.max(1,Number(n.count)||1)+increment,n.at=nowStr()):(n={id:genId("fn"),userId:recipientId,kind:"like",postId:post.id,authorName:"",excerpt:"",count:increment,at:nowStr(),read:!1},DB.data.forumNotices.push(n))}function runForumAutoReply(post,source,sourceText){var _a;if(!post||!DB.data||!Array.isArray(DB.data.answers))return!1;const cfg=forumAutoConfig();if(!cfg.enabled)return!1;const text=`${post.title||""}
${sourceText||""}`,rule=forumKeywordRule(text);if(!rule||!String(rule.reply||"").trim())return!1;const sourceId=source&&source.id?String(source.id):"post:"+post.id;if(DB.data.answers.some(a=>a.autoReplyFor===sourceId)||(_a=DB.data.forumPendingAutoReplies)!=null&&_a.some(a=>a.sourceId===sourceId))return!1;const freq=rule.frequency&&rule.frequency!=="global"?rule.frequency:cfg.frequency,chance={always:1,half:.5,third:1/3,rare:.2}[freq]||1;if(Math.random()>chance)return!1;const min=rule.delayMin==null?Number(cfg.delayMin)||0:Math.max(0,Number(rule.delayMin)||0),max=rule.delayMax==null?Number(cfg.delayMax)||0:Math.max(min,Number(rule.delayMax)||0),delay=Math.round((min+Math.random()*(Math.max(min,max)-min))*1e3),pending={sourceId,postId:post.id,reply:String(rule.reply).trim(),authorName:String(rule.authorName||"论坛助手").trim()||"论坛助手",dueAt:Date.now()+delay};return DB.data.forumPendingAutoReplies=Array.isArray(DB.data.forumPendingAutoReplies)?DB.data.forumPendingAutoReplies:[],DB.data.forumPendingAutoReplies.push(pending),DB.save(),setTimeout(()=>{const queue=DB.data&&Array.isArray(DB.data.forumPendingAutoReplies)?DB.data.forumPendingAutoReplies:[],idx=queue.findIndex(x=>x.sourceId===sourceId);if(idx<0)return;const job=queue.splice(idx,1)[0],livePost=DB.data.posts.find(p=>p.id===job.postId);if(!livePost||DB.data.answers.some(a=>a.autoReplyFor===sourceId)){DB.save();return}const bot={id:genId("a"),postId:livePost.id,authorId:"forum-auto-reply",authorName:job.authorName,content:job.reply,createdAt:nowStr(),votes:[],editedBy:[],autoReplyFor:sourceId};DB.data.answers.push(bot),addForumNotice(livePost,bot),DB.save(),syncUnreadBadges(),document.hidden?showSiteNotification("论坛有新的自动回复",`${job.authorName}：${job.reply}`,"#/post/"+livePost.id,"ndt-auto-"+livePost.id):toast(`「${job.authorName}」已回复帖子`,"ok"),parseHash().seg[0]==="post"&&parseHash().seg[1]===livePost.id&&router()},delay),!0}function openWorkgroupCardManager(){const wg=workgroupOf(),me=DB.user,ids=[...new Set([me.id,...wg.members||[]])].filter(id=>{const u=userOfId(id);return u&&Number(u.level)>=2}),mask=openMask(`<h3>工作组字卡管理</h3><div class="m-body"><p class="ph-sub" style="margin-top:0">选择工作组成员，管理该成员的文字、图片和组合字卡。</p>
    ${ids.map(id=>{const u=userOfId(id);return`<button type="button" class="mem-row" data-wg-card-person="${esc(id)}" style="width:100%;text-align:left;cursor:pointer"><span class="av" style="width:30px;height:30px;font-size:12px">${avatarHtml32(u)}</span><span style="flex:1">${esc(u.name)}${id===me.id?"（我）":""}</span><span style="font-size:12px;color:var(--pt-muted)">${(u.cards||[]).length} 张字卡　›</span></button>`}).join("")||'<div class="empty">没有可管理的员工/管理员</div>'}
    <div style="display:flex;margin-top:12px"><button type="button" class="btn btn-sm btn-ghost" id="wg-card-cancel" style="margin-left:auto">关闭</button></div></div>`);mask.querySelector("#wg-card-cancel").addEventListener("click",()=>mask.remove()),mask.addEventListener("click",e=>{const b=e.target.closest("[data-wg-card-person]");if(!b)return;const id=b.dataset.wgCardPerson;mask.remove(),cardManager(id)})}function simulateForumGrowth(){if(!DB.user||!DB.data||!Array.isArray(DB.data.posts))return;const now=Date.now();if((DB.data.forumGrowthConfig||{enabled:!0}).enabled===!1)return;const own=DB.data.posts.filter(p=>p.authorId===DB.user.id&&!p.pinned);if(!own.length)return;let last=Number(DB.data.forumGrowthLastAt)||0;if(now-last<45e3)return;DB.data.forumGrowthLastAt=now;let changed=!1,hitGoal=!1;const likeHits=[];own.forEach(p=>{let likeInc=0;const g=p.heatGoal;if(!g||!g.targetAt)return;const start=Number(g.createdAt)||now,duration=Math.max(1,g.targetAt-start),progress=Math.min(1,Math.max(0,(now-start)/duration)),targetViews=Math.max(0,Number(g.views)||0),targetLikes=Math.max(0,Number(g.likes)||0),desiredViews=Math.round(targetViews*progress),currentViews=Number(p.views)||0;if(currentViews<targetViews){const gap=Math.max(0,desiredViews-currentViews),increment=now>=g.targetAt?targetViews-currentViews:Math.min(gap,Math.max(0,Math.floor(Math.random()*Math.max(1,Math.ceil(gap*.35)))+(gap>0?1:0)));increment>0&&(p.views=Math.min(targetViews,currentViews+increment),changed=!0)}const currentLikes=Number(p.simulatedLikes)||0,desiredLikes=Math.round(targetLikes*progress),likeGap=Math.max(0,desiredLikes-currentLikes);if(currentLikes<targetLikes&&likeGap>0&&(now>=g.targetAt||Math.random()<.7)){const increment=now>=g.targetAt?targetLikes-currentLikes:Math.min(likeGap,Math.random()<.35?2:1);increment>0&&(p.simulatedLikes=Math.min(targetLikes,currentLikes+increment),likeInc+=increment,changed=!0)}if(now>=g.targetAt){if((Number(p.views)||0)<targetViews&&(p.views=targetViews,changed=!0),(Number(p.simulatedLikes)||0)<targetLikes){const backfill=targetLikes-Number(p.simulatedLikes);p.simulatedLikes=targetLikes,likeInc+=backfill,changed=!0}g.completedAt||(g.completedAt=now,hitGoal=!0)}likeInc>0&&likeHits.push({post:p,inc:likeInc})});const noGoal=own.filter(p=>!p.heatGoal);if(noGoal.length){const count=Math.random()<.22?2:1;for(let i=0;i<count;i++){const p=noGoal[Math.floor(Math.random()*noGoal.length)];p.views=Math.max(0,Number(p.views)||0)+1+Math.floor(Math.random()*3),Math.random()<.22&&(p.simulatedLikes=Math.max(0,Number(p.simulatedLikes)||0)+1,likeHits.push({post:p,inc:1})),changed=!0}}changed&&(likeHits.forEach(h=>addSimulatedLikeNotice(h.post,h.inc)),DB.save(),likeHits.length&&syncUnreadBadges())}function markForumNoticesSeen(postId){const me=DB.user;if(!me||!Array.isArray(DB.data.forumNotices))return;let changed=!1;DB.data.forumNotices.forEach(n=>{n.userId===me.id&&!n.read&&(!postId||n.postId===postId)&&(n.read=!0,changed=!0)}),changed&&(DB.save(),syncUnreadBadges())}function cloudNoticesHtml(list,unread,total,filter){return`<section class="p-panel forum-notice-center">
    <div class="fnc-head"><div><div class="fnc-kicker">CLOUD ACTIVITY</div><h2>帖子消息中心</h2><p class="ph-sub">云端共享：这里收录你在论坛里收到的新回复和点赞，所有成员的互动实时同步。</p></div><div class="fnc-count"><strong>${unread}</strong><span>条未读</span></div></div>
    <div class="fnc-toolbar"><div class="fnc-filters">
      <a class="btn btn-sm ${filter==="all"?"":"btn-ghost"}" href="#/forum-notices">全部 ${total}</a>
      <a class="btn btn-sm ${filter==="unread"?"":"btn-ghost"}" href="#/forum-notices?filter=unread">未读 ${unread}</a>
      <a class="btn btn-sm ${filter==="read"?"":"btn-ghost"}" href="#/forum-notices?filter=read">已读</a>
    </div><div class="fnc-actions">
      <button class="btn btn-sm btn-ghost" id="fnc-read-all" ${unread?"":"disabled"}>全部标为已读</button>
      <button class="btn btn-sm btn-ghost" id="fnc-clear-read" ${total-unread?"":"disabled"}>清理已读</button>
    </div></div>
    <div class="fnc-list">${list.length?list.map(n=>{const like=n.type==="like",mention=n.type==="mention",badge=n.type==="badge",target=like&&n.targetType==="reply"?"评论":"帖子",titleTxt=badge?`${esc(n.actorName)} 为你发放了徽章`:like?`${esc(n.actorName)} 赞了你的${target}`:mention?`${esc(n.actorName)} 在帖子中提到了你`:`${esc(n.actorName)} 回复了你的帖子`,iconCls=like?"is-growth":mention||badge?"is-mention":"is-reply",iconSym=like?"♥":mention?"@":badge?"🎖":"✦";return`<article class="fnc-item ${n.read?"is-read":"is-unread"}" data-cn-item="${esc(n.id)}">
        <span class="fnc-icon ${iconCls}">${iconSym}</span>
        <div class="fnc-body">
          <div class="fnc-title-row"><strong>${titleTxt}</strong><time>${esc(n.createdAt||"")}</time></div>
          ${like?"":`<p>${esc(n.excerpt||"")}</p>`}
          <div class="fnc-post-title">${esc(n.postTitle||"原帖子可能已删除")}</div>
          <div class="fnc-item-actions">
            ${n.postId?`<a class="btn btn-sm btn-orange" href="#/post/${encodeURIComponent(n.postId)}${n.targetType==="reply"&&n.targetId?"?c="+encodeURIComponent(n.targetId):""}" data-cn-open="${esc(n.id)}">查看帖子</a>`:""}
            ${n.read?"":`<button class="btn btn-sm btn-ghost" data-cn-read="${esc(n.id)}">标为已读</button>`}
          </div>
        </div>${n.read?"":'<span class="fnc-dot" title="未读"></span>'}
      </article>`}).join(""):'<div class="empty fnc-empty"><div class="es">✦</div><strong>这里暂时很安静</strong><p>当你的帖子收到新回复或点赞时，会出现在这里。</p></div>'}</div>
  </section>`}function viewForumNotices(filter="all"){if(Cloud.connected){filter=filter||"all";const loading='<section class="p-panel"><div class="cloud-loading"><span class="cl-spin"></span>正在从云端加载消息…</div></section>';return setTimeout(()=>{Cloud.fetchNotifications(filter).then(d=>{$("#app").innerHTML=portalShell("forum-notices",cloudNoticesHtml(d.notifications,d.unread,d.total,filter))}).catch(e=>{$("#app").innerHTML=portalShell("forum-notices",`<div class="p-panel empty">消息加载失败：${esc(e.message)}<br><a class="btn btn-sm" href="#/cloud">前往云端账号</a></div>`)})},0),portalShell("forum-notices",loading)}const me=DB.user;if(!me)return viewGate();const noticeCount=n=>Math.max(1,Number(n.count)||1),all=(DB.data.forumNotices||[]).filter(n=>n.userId===me.id&&n.kind!=="growth").slice().sort((a,b)=>String(b.at||"").localeCompare(String(a.at||""))),list=all.filter(n=>filter==="unread"?!n.read:filter==="read"?!!n.read:!0),unread=all.filter(n=>!n.read).reduce((s,n)=>s+noticeCount(n),0),c=`<section class="p-panel forum-notice-center">
    <div class="fnc-head"><div><div class="fnc-kicker">FORUM ACTIVITY</div><h2>帖子消息中心</h2><p class="ph-sub">这里只收录你发出的帖子收到的新回复和点赞。私信、论坛聊天室和工作组消息不会出现在这里。</p></div><div class="fnc-count"><strong>${unread}</strong><span>条未读</span></div></div>
    <div class="fnc-toolbar"><div class="fnc-filters"><a class="btn btn-sm ${filter==="all"?"":"btn-ghost"}" href="#/forum-notices">全部 ${all.length}</a><a class="btn btn-sm ${filter==="unread"?"":"btn-ghost"}" href="#/forum-notices?filter=unread">未读 ${unread}</a><a class="btn btn-sm ${filter==="read"?"":"btn-ghost"}" href="#/forum-notices?filter=read">已读</a></div><div class="fnc-actions"><button class="btn btn-sm btn-ghost" id="fnc-read-all" ${unread?"":"disabled"}>全部标为已读</button><button class="btn btn-sm btn-ghost" id="fnc-clear-read" ${all.some(n=>n.read)?"":"disabled"}>清理已读</button></div></div>
    <div class="fnc-list">${list.length?list.map(n=>{const post=DB.data.posts.find(p=>p.id===n.postId),like=n.kind==="like",cnt=noticeCount(n);return`<article class="fnc-item ${n.read?"is-read":"is-unread"}" data-fnc-item="${esc(n.id)}"><span class="fnc-icon ${like?"is-growth":"is-reply"}">${like?"♥":"✦"}${cnt>1?`<em class="fnc-icon-num">${cnt}</em>`:""}</span><div class="fnc-body"><div class="fnc-title-row"><strong>${like?cnt>1?`您收到 ${cnt} 条新的点赞`:"您收到一条新的点赞":cnt>1?`您收到 ${cnt} 条新回复`:"您收到一条新回复"}</strong><time>${esc(n.at||"")}</time></div>${like?"":`<p>${esc(n.excerpt||"")}</p>`}<div class="fnc-post-title">${esc((post==null?void 0:post.title)||"原帖子可能已删除")}</div><div class="fnc-item-actions">${post?`<a class="btn btn-sm btn-orange" href="#/post/${encodeURIComponent(post.id)}" data-fnc-open="${esc(n.id)}">查看帖子</a>`:""}${n.read?"":`<button class="btn btn-sm btn-ghost" data-fnc-read="${esc(n.id)}">标为已读</button>`}</div></div>${n.read?"":'<span class="fnc-dot" title="未读"></span>'}</article>`}).join(""):'<div class="empty fnc-empty"><div class="es">✦</div><strong>这里暂时很安静</strong><p>当你的帖子收到新回复或点赞时，会出现在这里。</p></div>'}</div>
  </section>`;return portalShell("forum-notices",c)}let _cloudBoards=null;function currentBoards(){return Cloud.connected?(_cloudBoards||[]).map(b=>b.name):DB.data.boards.slice()}async function refreshCloudBoards(){return _cloudBoards=await Cloud.listBoards(),_cloudBoards}function localForumPosts(board){let list=DB.data.posts.slice();return board!=="全部"&&(list=list.filter(p=>p.board===board)),list.map(p=>{const ans=DB.data.answers.filter(a=>a.postId===p.id);let last=p.createdAt;return ans.forEach(a=>{a.createdAt>last&&(last=a.createdAt)}),{id:p.id,board:p.board,title:p.title,content:p.content,authorId:p.authorId,authorName:postAuthor(p),createdAt:p.createdAt,lastActivityAt:last,pinned:!!p.pinned,essence:!!p.essence,views:p.views,votes:p.votes||[],simulatedLikes:Number(p.simulatedLikes)||0,replyCount:ans.length}})}function authorWrap(id,inner){return(Cloud.connected?!!id:!!(id&&DB.data.users.some(u=>u.id===id)))?`<a class="up-link" href="#/u/${encodeURIComponent(id)}">${inner}</a>`:`<span class="up-link is-plain">${inner}</span>`}function forumListHtml(list,curId,showPin){return list.length?list.map(p=>{const likeCount=p.votes.length+(p.simulatedLikes||0),liked=p.votes.includes(curId);let aLv=p.authorLevel,aLn=p.authorLevelName,aAv=p.authorAvatar;if(!Cloud.connected){const au=DB.data.users.find(u=>u.id===p.authorId);if(au){const g=forumLevelOf(au);aLv=g.level,aLn=g.name,aAv=au.avatar||""}}return`<div class="q-item">
      <div class="q-vote q-vote-list"><button type="button" class="vt ${liked?"on":""}" data-vote="${p.id}" aria-label="赞同帖子" aria-pressed="${liked?"true":"false"}"><span class="vote-arrow">▲</span><span class="vote-label">赞同</span></button><b class="vote-count">${likeCount}</b></div>
      <div class="q-main">
        <h3 data-open="${p.id}">${p.pinned?'<span class="tag tag-red" style="margin-right:6px">置顶</span>':""}${p.essence?'<span class="tag tag-essence" style="margin-right:6px">精</span>':""}${esc(p.title)}</h3>
        <div class="q-ex">${esc(p.content)}</div>
        <div class="q-meta">
          ${authorWrap(p.authorId,avatarCircle(p.authorName,aAv)+"<span>"+esc(p.authorName)+"</span>")}${levelBadge(aLv,aLn)}${badgeHtml(p.authorBadge)}
          <span class="tag">${p.board}</span>
          <span class="qm" data-open="${p.id}">💬 ${p.replyCount} 个回答</span>
          <span>👁 ${p.views}</span>
          <span>${relTime(p.createdAt)}</span>
          ${showPin?`<button class="btn btn-sm btn-ghost" data-pin="${p.id}" style="margin-left:auto">${p.pinned?"取消置顶":"置顶"}</button>`:""}
        </div>
      </div></div>`}).join(""):'<div class="empty"><div class="es">🕳️</div>这个板块还没有帖子</div>'}function postHeat(p){return p.votes.length*3+(p.replyCount||0)*2+Math.floor((p.views||0)/10)}function sortForumPosts(list,sort){return list.sort((a,b)=>a.pinned!==b.pinned?a.pinned?-1:1:sort==="hot"?postHeat(b)-postHeat(a):new Date(b.lastActivityAt||b.createdAt)-new Date(a.lastActivityAt||a.createdAt)),list}function forumSearchBar(q){return`<form class="forum-search" id="forum-search-form">
    <span class="fs-ico">🔍</span>
    <input class="fs-input" id="forum-search-input" placeholder="搜索帖子标题或正文…" value="${esc(q||"")}">
    <button class="btn btn-sm btn-orange" type="submit">搜索</button>
  </form>`}const FORUM_PAGE=20;let _forumView={board:"全部",sort:"latest",posts:[],offset:0,hasMore:!1,total:0,loading:!1};function viewForum(board,sort){board=board||"全部",sort=sort||"latest";const cloudOn=Cloud.connected,curId=cloudOn?Cloud.user.id:DB.user.id,cloudBadge=cloudOn?'<span class="cloud-pill on">☁ 云端已连接 · 共享中</span>':'<a class="cloud-pill" href="#/cloud">☁ 云端账号（未连接）</a>',checkinBtn=cloudOn?'<button class="btn btn-sm btn-ghost" id="f-checkin">签到</button>':"",localTools=cloudOn?"":`<button class="btn btn-ghost btn-sm" id="forum-notify-enable">回复提醒</button>
      <button class="btn btn-ghost btn-sm" id="forum-auto-settings">自动回复</button>`,shell=listHtml=>`<div class="p-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <h2>异人论坛</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        ${cloudBadge}
        ${checkinBtn}
        ${localTools}
        <button class="btn btn-orange btn-sm" id="f-ask">+ 发帖提问</button>
      </div>
    </div>
    <div class="ph-sub">${cloudOn?"当前为云端共享论坛，所有成员看到的帖子实时同步":"有问题，上论坛；知道的事，说给同道听（当前为本地离线模式）"}</div>
    ${forumSearchBar()}
    <div class="forum-tabs" id="forum-board-tabs">
      ${["全部"].concat(currentBoards()).map(b=>`<button class="ft ${b===board?"on":""}" data-b="${b}">${b}</button>`).join("")}
    </div>
    <div class="forum-tabs" style="margin-top:-8px">
      <button class="ft ${sort==="latest"?"on":""}" data-sort="latest">最新</button>
      <button class="ft ${sort==="hot"?"on":""}" data-sort="hot">热门</button>
      <button class="ft" id="f-essence">精华</button>
      ${cloudOn?Cloud.user.role>=3?'<button class="ft" id="bd-manage" style="margin-left:auto">管理分类</button>':"":'<button class="ft" id="bd-manage" style="margin-left:auto">管理分类</button>'}
    </div>
    <div id="cloud-forum-list">${listHtml}</div>
  </div>`;if(cloudOn){_forumView={board,sort,posts:[],offset:0,hasMore:!1,total:0,loading:!1};const _skelCard='<div class="skel-card"><div class="skel-vote"></div><div class="skel-main"><div class="skel-line w70"></div><div class="skel-line w95"></div><div class="skel-line w40"></div><div class="skel-meta"><div class="skel-dot"></div><div class="skel-line w20"></div></div></div></div>',_skel='<div class="skel-list">'+_skelCard+_skelCard+_skelCard+_skelCard+'</div><div class="cloud-loading skel-hint"><span class="cl-spin"></span>正在从云端加载帖子…</div>',c=shell(_skel);return setTimeout(loadCloudForumFirst,0),portalShell("forum",c)}const showPin=DB.user.level>=3,posts=sortForumPosts(localForumPosts(board),sort);return portalShell("forum",shell(forumListHtml(posts,curId,showPin)))}function loadCloudForumFirst(){refreshCloudBoards().then(()=>{const tabs=document.getElementById("forum-board-tabs");return tabs&&(tabs.innerHTML=["全部"].concat(currentBoards()).map(b=>`<button class="ft ${b===_forumView.board?"on":""}" data-b="${b}">${b}</button>`).join("")),Cloud.listPosts(_forumView.board,_forumView.sort,{limit:FORUM_PAGE,offset:0})}).then(d=>{_forumView.posts=d.posts,_forumView.offset=d.posts.length,_forumView.hasMore=d.hasMore,_forumView.total=d.total,renderCloudForumList(),setTimeout(updateCheckinBtn,0)}).catch(e=>{const el=document.getElementById("cloud-forum-list");el&&(el.innerHTML=`<div class="empty"><div class="es">⚠️</div>云端加载失败：${esc(e.message)}<br><a class="btn btn-sm" href="#/cloud">前往云端账号</a></div>`)})}function renderCloudForumList(){const el=document.getElementById("cloud-forum-list");if(!el)return;const admin=Cloud.user.role>=3;let html=forumListHtml(_forumView.posts,Cloud.user.id,admin);_forumView.hasMore?html+=`<div class="forum-more"><button class="btn btn-sm" id="f-loadmore">加载更多（已显示 ${_forumView.posts.length}/${_forumView.total}）</button></div>`:html+=`<div class="forum-more-end">— 没有更多了 · 共 ${_forumView.total} 帖 —</div>`,el.innerHTML=html}function loadMoreCloud(){if(_forumView.loading||!_forumView.hasMore)return;_forumView.loading=!0;const btn=document.getElementById("f-loadmore");btn&&(btn.disabled=!0),Cloud.listPosts(_forumView.board,_forumView.sort,{limit:FORUM_PAGE,offset:_forumView.offset}).then(d=>{_forumView.posts=_forumView.posts.concat(d.posts),_forumView.offset=_forumView.posts.length,_forumView.hasMore=d.hasMore,_forumView.total=d.total,_forumView.loading=!1,renderCloudForumList()}).catch(e=>{_forumView.loading=!1,toast(e.message,"err")})}async function updateCheckinBtn(){const b=document.getElementById("f-checkin");if(b)try{const s=await Cloud.checkinStatus();s.checkedToday?(b.textContent="已签到·连"+s.streak,b.classList.add("is-done")):(b.textContent="签到",b.classList.remove("is-done"))}catch(e){}}function doCheckinFlow(){Cloud.doCheckin().then(r=>{checkinModal(r),setTimeout(updateCheckinBtn,0)}).catch(e=>toast(e.message,"err"))}function checkinModal(r){const body=`<div class="checkin-card">
    <div class="cc-emoji">${r.bonus?"🎁":"✅"}</div>
    <div class="cc-title">${r.bonus?"周签到达成":"签到成功"}</div>
    <div class="cc-streak">连续签到 <b>${r.streak}</b> 天</div>
    <div class="cc-grid">
      <div class="cc-cell"><span>累计签到</span><b>${r.totalDays} 天</b></div>
      <div class="cc-cell"><span>本次获得</span><b>+${r.gained} 积分</b></div>
    </div>
    ${r.bonus?`<div class="cc-bonus">连续满 7 天，额外 +${r.bonus} 积分</div>`:""}
    <div class="m-foot"><button class="btn btn-sm btn-orange" id="cc-ok">好的</button></div>
  </div>`,mask=openMask("<h3>每日签到</h3>"+body);mask.querySelector("#cc-ok").addEventListener("click",()=>mask.remove())}function viewEssence(){const cloudOn=Cloud.connected,shell=body=>`<div class="p-panel">
    <div class="p-crumb"><a href="#/forum">论坛</a> / <b>精华帖</b></div>
    <h2>精华帖</h2>
    <div class="ph-sub">管理员加精的优质内容汇总于此。</div>
    <div id="essence-list">${body}</div>
  </div>`;if(cloudOn){const c=shell('<div class="cloud-loading"><span class="cl-spin"></span>正在加载精华帖…</div>');return setTimeout(()=>{Cloud.listPosts(null,null,{essence:!0,limit:50}).then(d=>{const el=document.getElementById("essence-list");el&&(el.innerHTML=d.posts.length?forumListHtml(d.posts,Cloud.user.id,Cloud.user.role>=3):'<div class="empty">还没有精华帖</div>')}).catch(e=>{const el=document.getElementById("essence-list");el&&(el.innerHTML='<div class="empty">'+esc(e.message)+"</div>")})},0),portalShell("essence",c)}const posts=localForumPosts("全部").filter(p=>p.essence);return portalShell("essence",shell(forumListHtml(posts,DB.user.id,DB.user.level>=3)))}function viewSearch(q){const cloudOn=Cloud.connected,shell=body=>`<div class="p-panel">
    <div class="p-crumb"><a href="#/forum">论坛</a> / <b>搜索</b></div>
    <h2>搜索帖子</h2>
    ${forumSearchBar(q)}
    <div id="search-results">${body}</div>
  </div>`;if(!q)return portalShell("search",shell('<div class="empty">输入关键词，搜索帖子标题或正文</div>'));if(cloudOn){const c=shell('<div class="cloud-loading"><span class="cl-spin"></span>正在搜索…</div>');return setTimeout(()=>{Cloud.search(q).then(d=>{const el=document.getElementById("search-results");el&&(el.innerHTML=`<p class="ph-sub">找到 ${d.posts.length} 条与「${esc(q)}」相关的帖子</p>`+(d.posts.length?forumListHtml(d.posts,Cloud.user.id,Cloud.user.role>=3):""))}).catch(e=>{const el=document.getElementById("search-results");el&&(el.innerHTML='<div class="empty">'+esc(e.message)+"</div>")})},0),portalShell("search",c)}const term=q.toLowerCase(),posts=localForumPosts("全部").filter(p=>(p.title+" "+p.content).toLowerCase().includes(term));return portalShell("search",shell(`<p class="ph-sub">找到 ${posts.length} 条与「${esc(q)}」相关的帖子</p>`+(posts.length?forumListHtml(posts,DB.user.id,DB.user.level>=3):"")))}function viewUserProfile(id){if(Cloud.connected){const loading='<div class="p-panel"><div class="cloud-loading"><span class="cl-spin"></span>正在加载异人主页…</div></div>';return setTimeout(()=>{Cloud.userProfile(id).then(d=>{$("#app").innerHTML=portalShell("u",userProfileHtml(d))}).catch(e=>{$("#app").innerHTML=portalShell("u",`<div class="p-panel"><div class="empty">${esc(e.message)}<br><a class="btn btn-sm" href="#/forum">返回论坛</a></div></div>`)})},0),portalShell("u",loading)}const u=DB.data.users.find(x=>x.id===id);return u?portalShell("u",localUserProfileHtml(u)):portalShell("u",'<div class="p-panel"><div class="empty">用户不存在</div></div>')}function userProfileHtml(d){const u=d.user,isMe=Cloud.connected&&u.id===Cloud.user.id,head=`<div class="up-hero">
    <div class="up-av">${avatarCircle(u.name,u.avatar,"up-av-circle")}</div>
    <div class="up-id">
      <div class="up-name">${esc(u.name)}${levelBadge(u.level,u.levelName)}${badgeHtml(u.badge)}</div>
      <p class="ph-sub">编号 ${esc(u.id)}</p>
    </div>
  </div>`,pf=u.profile||{},pfRows=[];pf.faction&&pfRows.push(`<span class="up-pi">⚔ 流派 <b>${esc(pf.faction)}</b></span>`),pf.gender&&pfRows.push(`<span class="up-pi">🚻 ${esc(pf.gender)}</span>`),pf.city&&pfRows.push(`<span class="up-pi">📍 ${esc(pf.city)}</span>`),pf.birthday&&pfRows.push(`<span class="up-pi">🎂 ${esc(pf.birthday)}</span>`);const profile=`<div class="up-section"><h3>异人档案 ${isMe?'<button class="btn btn-sm btn-ghost" data-editprofile style="margin-left:auto">✏️ 编辑</button>':""}</h3>
    ${pfRows.length?`<div class="up-profile">${pfRows.join("")}</div>`:""}
    ${pf.bio?`<p class="up-bio">${esc(pf.bio)}</p>`:""}
    ${!pfRows.length&&!pf.bio?`<p class="ph-sub" style="margin:0">${isMe?"还没有填写异人档案，点右上角「编辑」完善（流派/签名/城市等）":"这位异人还没有填写档案"}</p>`:""}
  </div>`,badges=u.badges||[],badgeWall=`<div class="up-section"><h3>徽章 ${isMe&&badges.length?'<span class="ph-sub" style="font-weight:400;margin-left:6px">点击可切换佩戴</span>':""}</h3>
    ${badges.length?`<div class="up-badges">${badges.map(b=>`
      <button type="button" class="up-badge bd-eff-${esc(b.effect!=null?String(b.effect):"0")} ${b.equipped?"on":""}" data-beq="${b.id}" title="${esc(b.desc||b.name)}" ${isMe?"":"disabled"}>
        ${b.icon?`<span class="ub-icon">${esc(b.icon)}</span>`:""}<span class="ub-name">${esc(b.name)}</span>
        ${b.equipped?'<span class="ub-wear">佩戴中</span>':""}
      </button>`).join("")}</div>`:`<div class="empty">${isMe?"还没有徽章——活动期内（11月3日-5日）发帖或回复可自动获得「我来也」专属徽章":"TA 还没有徽章"}</div>`}
  </div>`,stats=`<div class="up-stats">
    <div class="up-stat"><b>${u.postCount}</b><span>帖子</span></div>
    <div class="up-stat"><b>${u.replyCount}</b><span>回复</span></div>
    <div class="up-stat"><b>${u.essenceCount}</b><span>精华</span></div>
    <div class="up-stat"><b>${u.likedCount}</b><span>被赞</span></div>
    <div class="up-stat"><b>${u.checkin.streak}</b><span>连续签到</span></div>
  </div>`,posts=`<div class="up-section"><h3>TA 的帖子</h3>
    ${d.posts.length?forumListHtml(d.posts,Cloud.user.id,Cloud.user.role>=3):'<div class="empty">还没有发布帖子</div>'}</div>`,replies=`<div class="up-section"><h3>TA 的回复</h3>
    ${d.replies.length?replyProfileListHtml(d.replies):'<div class="empty">还没有回复</div>'}</div>`;return`<div class="p-crumb"><a href="#/forum">论坛</a> / <b>异人主页</b></div>
    <div class="p-panel">${head}${profile}${badgeWall}${stats}${posts}${replies}</div>`}async function openProfileEditModal(){const p=Cloud.user&&Cloud.user.profile||{};let myBadges=[];try{myBadges=await Cloud.getMyBadges()}catch(e){}const peItems=()=>myBadges.length?`<button type="button" class="pe-none ${myBadges.every(b=>!b.equipped)?"on":""}" data-peq="">不佩戴</button>`+myBadges.map(b=>{const eff=b.effect!=null?String(b.effect):"0";return`<button type="button" class="up-badge bd-eff-${esc(eff)} ${b.equipped?"on":""}" data-peq="${esc(b.id)}" title="${esc(b.desc||b.name)}">
          ${b.icon?`<span class="ub-icon">${esc(b.icon)}</span>`:""}
          <span class="ub-name">${esc(b.name)}</span>
          ${b.equipped?'<span class="ub-wear">佩戴中</span>':""}
        </button>`}).join(""):'<div class="empty" style="padding:10px">还没有徽章——活动期发帖或回复可自动获得</div>',mask=openMask(`
    <h3>编辑异人档案</h3>
    <div class="m-body">
      <label class="fl">流派</label>
      <input class="field" id="pf-faction" value="${esc(p.faction||"")}" placeholder="如：哪都通 / 全性 / 武当 / 天师府 / 唐门…">
      <label class="fl" style="margin-top:10px">性别</label>
      <select class="field" id="pf-gender">
        <option value="">保密</option>
        <option value="男" ${p.gender==="男"?"selected":""}>男</option>
        <option value="女" ${p.gender==="女"?"selected":""}>女</option>
      </select>
      <label class="fl" style="margin-top:10px">城市</label>
      <input class="field" id="pf-city" value="${esc(p.city||"")}" placeholder="可选">
      <label class="fl" style="margin-top:10px">生日</label>
      <input class="field" id="pf-birthday" value="${esc(p.birthday||"")}" placeholder="如 1998-08-08（可选）">
      <label class="fl" style="margin-top:10px">签名</label>
      <textarea class="field" id="pf-bio" style="min-height:80px" placeholder="介绍一下自己…">${esc(p.bio||"")}</textarea>
      <label class="fl" style="margin-top:10px">佩戴徽章（同时仅可佩戴一个）</label>
      <div class="pe-list" id="pe-wrap">${peItems()}</div>
      <div class="m-actions">
        <button class="btn btn-orange" id="pf-save">保存</button>
        <button class="btn btn-ghost" id="pf-cancel">取消</button>
      </div>
    </div>`),bindPe=()=>{mask.querySelectorAll("[data-peq]").forEach(el=>{el.onclick=async()=>{const bid=el.dataset.peq||null;try{await Cloud.equipBadge(bid),await Cloud.refresh().catch(()=>{});try{myBadges=await Cloud.getMyBadges()}catch(e){}mask.querySelector("#pe-wrap").innerHTML=peItems(),bindPe(),toast(bid?"已佩戴徽章":"已卸下徽章","ok")}catch(e){toast(e.message,"err")}}})};bindPe(),mask.querySelector("#pf-cancel").onclick=()=>mask.remove(),mask.querySelector("#pf-save").onclick=async()=>{const btn=mask.querySelector("#pf-save");btn.disabled=!0;try{const profile=await Cloud.saveProfile({faction:mask.querySelector("#pf-faction").value.trim(),gender:mask.querySelector("#pf-gender").value,city:mask.querySelector("#pf-city").value.trim(),birthday:mask.querySelector("#pf-birthday").value.trim(),bio:mask.querySelector("#pf-bio").value.trim()});Cloud.user&&(Cloud.user.profile=profile),toast("档案已保存","ok"),mask.remove(),router()}catch(e){btn.disabled=!1,toast(e.message,"err")}}}function badgeCelebration(badge){if(!badge)return;const eff=badge.effect!=null?String(badge.effect):"0",icon=badge.icon?`<span class="bc-bi">${esc(badge.icon)}</span>`:"",mask=document.createElement("div");mask.className="bc-mask",mask.innerHTML=`
    <div class="bc-card">
      <div class="bc-tag">恭喜获得新徽章</div>
      <div class="bc-badge bd-eff-${esc(eff)}">${icon}<span>${esc(badge.name)}</span></div>
      <p class="bc-name">${esc(badge.name)}</p>
      <p class="bc-desc">${esc(badge.desc||"已收入你的徽章墙，可在个人主页佩戴展示")}</p>
      <button class="btn btn-orange" id="bc-ok" style="width:100%">太棒了</button>
    </div>`,document.body.appendChild(mask);const colors=["#FF5E7D","#FFB03B","#4FE08A","#3BB6FF","#9B5CF0","#F6E85B"];for(let i=0;i<16;i++){const c=document.createElement("span");c.className="bc-confetti",c.style.left=Math.random()*100+"%",c.style.background=colors[i%colors.length],c.style.animationDuration=1.6+Math.random()*1.4+"s",c.style.animationDelay=Math.random()*.5+"s",mask.appendChild(c)}const close=()=>mask.remove();mask.querySelector("#bc-ok").onclick=close,mask.addEventListener("click",e=>{e.target===mask&&close()})}let _knownBadgeIds=null;async function initBadgeBaseline(){if(!Cloud.connected){_knownBadgeIds=null;return}try{const badges=await Cloud.getMyBadges();_knownBadgeIds=new Set(badges.map(b=>b.id))}catch(e){}}async function checkNewBadges(){if(Cloud.connected)try{const badges=await Cloud.getMyBadges(),cur=new Set(badges.map(b=>b.id));if(_knownBadgeIds===null){_knownBadgeIds=cur;return}const fresh=badges.filter(b=>!_knownBadgeIds.has(b.id));fresh.length&&fresh.forEach((b,i)=>setTimeout(()=>badgeCelebration(b),i*450)),_knownBadgeIds=cur}catch(e){}}const BADGE_EFFECT_OPTIONS=[{v:"0",label:"金辉"},{v:"1",label:"紫电"},{v:"2",label:"烈焰"},{v:"3",label:"青碧"},{v:"4",label:"彩虹"},{v:"5",label:"银辉"},{v:"6",label:"墨曜（深色星砂）"},{v:"7",label:"烟粉（呼吸光晕）"},{v:"8",label:"竹青（斜纹流动）"},{v:"9",label:"青柠（极速扫光）"},{v:"10",label:"靛蓝（中心脉动）"},{v:"11",label:"品红（横向流动）"},{v:"12",label:"酒红（纵向滑动）"},{v:"13",label:"藕荷（柔光扩散）"},{v:"14",label:"双色（分割推移）"},{v:"15",label:"黑金（金线慢扫）"}];async function openBadgeManageModal(){let editingId=null;const mask=openMask(`
    <h3>徽章管理</h3>
    <div class="m-body">
      <div id="b-form-box" style="padding:12px;border:1px solid var(--pt-border,#e5e8f0);border-radius:10px">
        <div id="b-form-title" style="font-weight:700;margin-bottom:8px">➕ 新建徽章</div>
        <label class="fl">徽章名称</label>
        <input class="field" id="b-name" placeholder="必填，20字内">
        <label class="fl" style="margin-top:8px">图标（emoji，可留空＝纯文字徽章）</label>
        <input class="field" id="b-icon" placeholder="留空则只显示文字">
        <label class="fl" style="margin-top:8px">炫彩效果</label>
        <div class="bd-eff-pick" id="b-eff-pick">
          ${BADGE_EFFECT_OPTIONS.map((o,i)=>`<button type="button" class="bd-eff-opt p${o.v} ${i===0?"sel":""}" data-eff="${o.v}" title="${o.label}"></button>`).join("")}
        </div>
        <label class="fl" style="margin-top:8px">说明</label>
        <input class="field" id="b-desc" placeholder="可选，介绍这个徽章">
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="btn btn-sm btn-orange" id="b-save">创建</button>
          <button class="btn btn-sm btn-ghost" id="b-form-cancel">取消</button>
        </div>
      </div>
      <div id="b-list" style="margin-top:12px"><div class="cloud-loading"><span class="cl-spin"></span>正在加载徽章目录…</div></div>
    </div>`);let selectedEffect="0";mask.querySelectorAll("#b-eff-pick .bd-eff-opt").forEach(btn=>{btn.onclick=()=>{selectedEffect=btn.dataset.eff,mask.querySelectorAll("#b-eff-pick .bd-eff-opt").forEach(b=>b.classList.remove("sel")),btn.classList.add("sel")}});const resetForm=()=>{editingId=null,mask.querySelector("#b-form-title").textContent="➕ 新建徽章",mask.querySelector("#b-save").textContent="创建",mask.querySelector("#b-name").value="",mask.querySelector("#b-icon").value="",mask.querySelector("#b-desc").value="",mask.querySelectorAll("#b-eff-pick .bd-eff-opt").forEach((b,i)=>b.classList.toggle("sel",i===0))},fillEditForm=b=>{editingId=b.id,selectedEffect=b.effect||"0",mask.querySelector("#b-form-title").textContent="✏️ 编辑徽章："+b.name,mask.querySelector("#b-save").textContent="保存修改",mask.querySelector("#b-name").value=b.name,mask.querySelector("#b-icon").value=b.icon||"",mask.querySelector("#b-desc").value=b.desc||"",mask.querySelectorAll("#b-eff-pick .bd-eff-opt").forEach(el=>el.classList.toggle("sel",el.dataset.eff===selectedEffect))},render=async()=>{try{const badges=await Cloud.listBadges(),box=mask.querySelector("#b-list");if(!badges.length){box.innerHTML='<div class="empty">还没有徽章</div>';return}box.innerHTML=`<div class="bd-manage-list">${badges.map(b=>`
        <div class="bd-manage-row bd-eff-${esc(b.effect||"0")}">
          ${b.icon?`<span class="bd-mi">${esc(b.icon)}</span>`:""}
          <span class="bd-mn">${esc(b.name)}</span>
          <span class="bd-mk">${b.kind==="activity"?"活动":"手动"}</span>
          <button class="btn btn-sm btn-ghost" data-bedit="${b.id}">编辑</button>
        </div>`).join("")}</div>`,box.querySelectorAll("[data-bedit]").forEach(btn=>{btn.onclick=()=>{const b=badges.find(x=>x.id===btn.dataset.bedit);b&&fillEditForm(b)}})}catch(e){const box=mask.querySelector("#b-list");box&&(box.innerHTML='<div class="empty">'+esc(e.message)+"</div>")}};mask.querySelector("#b-form-cancel").onclick=()=>{editingId?resetForm():mask.remove()},mask.querySelector("#b-save").onclick=async()=>{const name=mask.querySelector("#b-name").value.trim();if(!name){toast("请填写徽章名称","warn");return}const btn=mask.querySelector("#b-save");btn.disabled=!0;const payload={name,icon:mask.querySelector("#b-icon").value.trim(),desc:mask.querySelector("#b-desc").value.trim(),effect:selectedEffect};try{editingId?(await Cloud.updateBadge(editingId,payload),toast("徽章已更新","ok")):(await Cloud.createBadge(payload),toast("徽章已创建","ok")),resetForm(),btn.disabled=!1,await render()}catch(e){btn.disabled=!1,toast(e.message,"err")}},render()}async function openGrantBadgeModal(userId,userName){const mask=openMask(`
    <h3>发放徽章</h3>
    <div class="m-body">
      <p class="ph-sub" style="margin:0 0 10px">发放给 <b>${esc(userName)}</b>，点击徽章即可发放（已拥有会提示）</p>
      <div id="g-b-list"><div class="cloud-loading"><span class="cl-spin"></span>正在加载徽章目录…</div></div>
    </div>`);try{const badges=await Cloud.listBadges(),box=mask.querySelector("#g-b-list");if(!badges.length){box.innerHTML='<div class="empty">还没有可发放的徽章</div>';return}box.innerHTML=`<div class="bd-grant-grid">${badges.map(b=>`
      <button type="button" class="bd-grant bd-eff-${esc(b.effect||"0")}" data-bgrant="${b.id}" data-bname="${esc(b.name)}" title="${esc(b.desc||"")}">
        ${b.icon?`<span class="bd-gi">${esc(b.icon)}</span>`:""}<span class="bd-gn">${esc(b.name)}</span>
      </button>`).join("")}</div>`,box.querySelectorAll("[data-bgrant]").forEach(btn=>{btn.onclick=async()=>{btn.disabled=!0;try{const r=await Cloud.grantBadge(userId,btn.dataset.bgrant);toast(r.granted?`已发放「${btn.dataset.bname}」`:"该用户已拥有此徽章","ok"),mask.remove()}catch(e){btn.disabled=!1,toast(e.message,"err")}}})}catch(e){const box=mask.querySelector("#g-b-list");box&&(box.innerHTML='<div class="empty">'+esc(e.message)+"</div>")}}function replyProfileListHtml(replies){return replies.map(r=>`<div class="up-reply">
    <div class="up-reply-top">回复于 <a href="#/post/${encodeURIComponent(r.postId)}">${esc(r.postTitle||"原帖")}</a> · ${relTime(r.createdAt)}</div>
    <div class="up-reply-body">${renderBody(r.content)}</div>
  </div>`).join("")}function localUserProfileHtml(u){const g=forumLevelOf(u),posts=localForumPosts("全部").filter(p=>p.authorId===u.id),replies=(DB.data.answers||[]).filter(a=>a.authorId===u.id),titleMap={};DB.data.posts.forEach(p=>titleMap[p.id]=p.title);const head=`<div class="up-hero">
    <div class="up-av">${avatarCircle(u.name,u.avatar||"","up-av-circle")}</div>
    <div class="up-id">
      <div class="up-name">${esc(u.name)}${levelBadge(g.level,g.name)}</div>
      <p class="ph-sub">编号 ${esc(u.id)}</p>
    </div>
  </div>`,likedCount=replies.reduce((s,r)=>s+(r.votes?r.votes.length:0),0)+posts.reduce((s,p)=>s+(p.votes?p.votes.length:0),0),stats=`<div class="up-stats">
    <div class="up-stat"><b>${posts.length}</b><span>帖子</span></div>
    <div class="up-stat"><b>${replies.length}</b><span>回复</span></div>
    <div class="up-stat"><b>${posts.filter(p=>p.essence).length}</b><span>精华</span></div>
    <div class="up-stat"><b>${likedCount}</b><span>被赞</span></div>
  </div>`,repHtml=replies.map(r=>`<div class="up-reply">
    <div class="up-reply-top">回复于 <a href="#/post/${encodeURIComponent(r.postId)}">${esc(titleMap[r.postId]||"原帖")}</a> · ${relTime(r.createdAt)}</div>
    <div class="up-reply-body">${renderBody(r.content)}</div>
  </div>`).join("");return`<div class="p-crumb"><a href="#/forum">论坛</a> / <b>异人主页</b></div>
    <div class="p-panel">${head}${stats}
    <div class="up-section"><h3>TA 的帖子</h3>${posts.length?forumListHtml(posts,DB.user.id,DB.user.level>=3):'<div class="empty">还没有发布帖子</div>'}</div>
    <div class="up-section"><h3>TA 的回复</h3>${repHtml||'<div class="empty">还没有回复</div>'}</div>
    </div>`}function viewAsk(){const cloudOn=Cloud.connected,canPostAnnounce=cloudOn&&Cloud.user.role>=3,askBoards=currentBoards().filter(b=>canPostAnnounce||b!=="公告"),heatGoal=cloudOn?"":`<details style="margin-top:14px;border:1px solid var(--pt-border);border-radius:10px;padding:12px"><summary style="cursor:pointer;font-weight:700">设置帖子热度目标</summary><p class="ph-sub">可选。热度会在指定时长内随机、缓慢增长。</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px"><div><label class="fl">目标点赞数</label><input class="field" id="a-goal-likes" type="number" min="0" max="1000000" value="0"></div><div><label class="fl">目标浏览量</label><input class="field" id="a-goal-views" type="number" min="0" max="1000000" value="0"></div><div><label class="fl">达成时间（小时）</label><input class="field" id="a-goal-hours" type="number" min="0.1" max="8760" step="0.1" value="24"></div></div>
    </details>`,c=`<div class="p-panel">
    <h2>发帖提问</h2><div class="ph-sub">发帖前请先阅读论坛守则，不泄露真实身份信息</div>
    <label class="fl">所属板块</label>
    <select class="field" id="a-board">${askBoards.map(b=>`<option>${b}</option>`).join("")}</select>
    <label class="fl">标题</label>
    <input class="field" id="a-title" placeholder="一句话说清你想问什么">
    <label class="fl">内容（可使用表情包）</label>
    <textarea class="field" id="a-body" style="min-height:160px" placeholder="补充背景、细节和你想知道的答案……"></textarea>
    ${heatGoal}
    ${cloudOn?`<div class="vote-builder" id="vote-builder">
      <div class="vb-head"><span class="vb-toggle" id="vb-toggle">📊 添加投票</span></div>
      <div class="vb-body hide" id="vb-body">
        <label class="fl">投票标题（可留空则使用帖子标题）</label>
        <input class="field" id="vb-q" placeholder="比如：你最看好哪个门派？">
        <label class="fl">选项（至少 2 个）</label>
        <div id="vb-opts">
          <input class="field vb-opt" placeholder="选项 1">
          <input class="field vb-opt" placeholder="选项 2">
        </div>
        <button type="button" class="btn btn-sm btn-ghost" id="vb-add">+ 添加选项</button>
        <label class="fl" style="margin-top:10px"><input type="checkbox" id="vb-multi"> 允许多选</label>
      </div>
    </div>`:""}
    <div class="editor-bar"><button class="eb" id="a-stk">插入表情包</button><label class="eb" style="margin:0">插入图片<input type="file" id="a-img-file" accept="image/*" class="hide"></label></div>
    <div class="stk-picker hide" id="a-stk-box">${STICKERS.map(s=>`<button data-s="${s}">${s}</button>`).join("")}</div>
    <div style="margin-top:20px;display:flex;gap:10px"><button class="btn btn-orange" id="a-sub">发布</button><a class="btn btn-ghost btn-sm" href="#/forum">取消</a></div>
  </div>`,html=portalShell("ask",c);return cloudOn&&setTimeout(bindVoteBuilder,0),html}function bindVoteBuilder(){const toggle=document.getElementById("vb-toggle"),body=document.getElementById("vb-body");toggle&&(toggle.addEventListener("click",()=>{body.classList.toggle("hide"),toggle.textContent=body.classList.contains("hide")?"📊 添加投票":"📊 收起投票"}),document.getElementById("vb-add").addEventListener("click",()=>{const opts=document.getElementById("vb-opts");if(opts.children.length>=8)return toast("最多 8 个选项","warn");const inp=document.createElement("input");inp.className="field vb-opt",inp.placeholder="选项 "+(opts.children.length+1),opts.appendChild(inp)}))}function readVoteBuilder(){const body=document.getElementById("vb-body");if(!body||body.classList.contains("hide"))return null;const opts=Array.from(document.querySelectorAll(".vb-opt")).map(i=>i.value.trim()).filter(Boolean);if(opts.length<2)return null;const q=document.getElementById("vb-q").value.trim(),multi=document.getElementById("vb-multi").checked;return{question:q,options:opts,multi:!!multi}}function localReplies(postId){return DB.data.answers.filter(a=>a.postId===postId).map(a=>({id:a.id,postId:a.postId,parentId:a.parentId||null,authorId:a.authorId,authorName:ansAuthor(a),content:a.content,createdAt:a.createdAt,votes:a.votes||[]}))}function buildReplyTree(replies){const map=new Map;replies.forEach(r=>map.set(r.id,{...r,children:[]}));const roots=[];map.forEach(r=>{if(r.parentId&&map.has(r.parentId)){const p=map.get(r.parentId);p.children.push(r),r.parentName=p.authorName}else roots.push(r)});const byTime=arr=>{arr.sort((a,b)=>a.createdAt<b.createdAt?-1:1),arr.forEach(c=>byTime(c.children))};return roots.sort((a,b)=>b.votes.length-a.votes.length),roots.forEach(r=>byTime(r.children)),roots}function subReplyHtml(node,depth,curId,isAdmin,cloudOn){const liked=node.votes.includes(curId),canDelReply=cloudOn&&node.authorId===curId||isAdmin,indent=Math.min(depth,2),prefix=node.parentId?`<span class="sr-to">回复 @${esc(node.parentName||"")}：</span>`:"";let rLv=node.authorLevel,rLn=node.authorLevelName,rAv=node.authorAvatar;if(!cloudOn){const au=DB.data.users.find(u=>u.id===node.authorId);if(au){const g=forumLevelOf(au);rLv=g.level,rLn=g.name,rAv=au.avatar||""}}return`<div class="sub-reply depth-${indent}" data-reply-id="${node.id}">
    <div class="sr-line">
      ${authorWrap(node.authorId,avatarCircle(node.authorName,rAv,"sm")+'<span class="sr-name">'+esc(node.authorName)+"</span>")}${levelBadge(rLv,rLn)}${badgeHtml(node.authorBadge)}
      <span class="sr-time">${relTime(node.createdAt)}</span>
      <button type="button" class="sr-vote ${liked?"on":""}" data-avote="${node.id}" aria-label="赞同">▲ ${node.votes.length}</button>
      <button type="button" class="sr-reply" data-rreply="${node.id}" data-rname="${esc(node.authorName)}">回复</button>
      ${canDelReply?`<button type="button" class="sr-del" data-adel="${node.id}">删除</button>`:""}
    </div>
    <div class="sr-body">${prefix}${renderBody(node.content)}</div>
    ${node.children.length?`<div class="sub-reply-children">${node.children.map(c=>subReplyHtml(c,depth+1,curId,isAdmin,cloudOn)).join("")}</div>`:""}
  </div>`}function pollHtml(poll){if(!poll)return"";const q=poll.question||"投票",total=poll.totalVoters||0,voted=poll.myVotes.length>0,head=`<div class="poll-head"><span class="poll-ico">📊</span><b>${esc(q)}</b>
    <span class="poll-total">${total} 人参与</span></div>`;let body;return voted?body=`<div class="poll-opts results">${poll.options.map(o=>{const pct=total?Math.round(o.votes/total*100):0,mine=poll.myVotes.includes(o.id);return`<div class="poll-opt ${mine?"mine":""}">
        <span class="poll-bar" style="width:${pct}%"></span>
        <span class="poll-label">${esc(o.text)}${mine?" ✓":""}</span>
        <span class="poll-pct">${pct}%</span>
      </div>`}).join("")}</div>
      <div class="poll-foot">${poll.multi?"多选":"单选"} · 你已投票</div>`:poll.multi?body=`<div class="poll-opts voting">${poll.options.map(o=>`
      <label class="poll-check"><input type="checkbox" class="poll-multi-opt" value="${o.id}"> ${esc(o.text)}</label>`).join("")}</div>
      <div class="poll-foot"><button class="btn btn-sm btn-orange" id="poll-submit">提交投票</button></div>`:body=`<div class="poll-opts voting">${poll.options.map(o=>`
      <button class="poll-pick" data-pollpick="${o.id}">${esc(o.text)}</button>`).join("")}</div>
      <div class="poll-foot">单选 · 点击选项投票</div>`,`<div class="poll-box" data-pollid="${poll.id}">${head}${body}</div>`}function postDetailHtml(post,replies,curId,isAdmin,cloudOn,poll){const postLiked=post.votes.includes(curId),postCount=post.votes.length+(post.simulatedLikes||0),canDelPost=cloudOn&&post.authorId===curId||isAdmin,canEditPost=cloudOn&&post.authorId===curId,editCount=Number(post.editCount)||0;let pLv=post.authorLevel,pLn=post.authorLevelName,pAv=post.authorAvatar;if(!cloudOn){const au=DB.data.users.find(u=>u.id===post.authorId);if(au){const g=forumLevelOf(au);pLv=g.level,pLn=g.name,pAv=au.avatar||""}}const bread=`<div class="p-crumb"><a href="#/forum">论坛</a> / <b>${esc(post.board)}</b></div>`,panel1=`<div class="p-panel">
    <h2 style="font-size:23px;line-height:1.4">${(post.pinned?'<span class="tag tag-red" style="margin-right:6px">置顶</span>':"")+(post.essence?'<span class="tag tag-essence" style="margin-right:6px">精华</span>':"")}${esc(post.title)}</h2>
    <div class="q-meta" style="margin:12px 0 4px">
      ${authorWrap(post.authorId,avatarCircle(post.authorName,pAv)+"<span>"+esc(post.authorName)+"</span>")}${levelBadge(pLv,pLn)}${badgeHtml(post.authorBadge)}
      <span>${relTime(post.createdAt)}</span><span>👁 ${post.views||0}</span>
      ${cloudOn?`${isAdmin?`<button type="button" class="btn btn-sm btn-ghost" data-pin="${post.id}">${post.pinned?"取消置顶":"置顶"}</button>
        <button type="button" class="btn btn-sm btn-ghost" data-essence="${post.id}">${post.essence?"取消加精":"加精"}</button>`:""}
        ${canEditPost?`<button type="button" class="btn btn-sm btn-ghost" data-pedit="${post.id}"${canDelPost?"":' style="margin-left:auto"'}>✎ 编辑</button>`:""}
        ${canDelPost?'<button type="button" class="btn btn-sm btn-ghost" id="p-del" style="margin-left:auto;color:#FF9DA0">🗑 删除帖子</button>':""}`:`<button class="btn btn-sm btn-ghost" data-pin="${post.id}" style="margin-left:auto">${post.pinned?"取消置顶":"置顶"}</button>
      ${isAdmin?`<button type="button" class="btn btn-sm btn-ghost" data-essence="${post.id}">${post.essence?"取消加精":"加精"}</button>`:""}
      <span class="qm" id="p-edit">✎ 编辑帖子</span>
      ${isAdmin?'<span class="qm" id="p-del" style="color:#FF9DA0">🗑 删除帖子</span>':""}`}
      <button type="button" class="btn btn-sm btn-ghost" data-share="${post.id}"
        data-share-title="${esc(post.title||"")}" data-share-board="${esc(post.board||"")}"
        data-share-author="${esc(post.authorName||"")}"
        style="${cloudOn&&!canDelPost&&!canEditPost?"margin-left:auto":""}">↗ 分享</button>
    </div>
    <div style="color:var(--pt-text);font-size:15px;line-height:1.95;white-space:pre-wrap;margin-top:14px;word-break:break-word">${renderBody(post.content)}</div>
    ${cloudOn&&editCount?`<div class="post-edited-flag" title="最后编辑时间：${esc(post.editedAt||"")}">✎ 已编辑 · 共 ${editCount} 次 · ${relTime(post.editedAt)}</div>`:""}
    ${cloudOn?pollHtml(poll):""}
    <div class="q-vote q-vote-detail">
      <button type="button" class="vt ${postLiked?"on":""}" data-vote="${post.id}" aria-label="赞同帖子" aria-pressed="${postLiked?"true":"false"}"><span class="vote-arrow">▲</span><span class="vote-label">赞同</span></button>
      <b class="vote-count">${postCount}</b><span class="vote-caption">人赞同</span>
    </div>
  </div>`,tree=buildReplyTree(replies),rootHtml=a=>{const liked=a.votes.includes(curId),canDelReply=cloudOn&&a.authorId===curId||isAdmin;let aLv=a.authorLevel,aLn=a.authorLevelName,aAv=a.authorAvatar;if(!cloudOn){const au=DB.data.users.find(u=>u.id===a.authorId);if(au){const g=forumLevelOf(au);aLv=g.level,aLn=g.name,aAv=au.avatar||""}}return`<div class="answer" data-reply-id="${a.id}">
      <div class="q-vote q-vote-answer"><button type="button" class="vt ${liked?"on":""}" data-avote="${a.id}" aria-label="赞同回答" aria-pressed="${liked?"true":"false"}"><span class="vote-arrow">▲</span></button><b class="vote-count">${a.votes.length}</b></div>
      <div class="q-main">
        <div class="q-meta">${authorWrap(a.authorId,avatarCircle(a.authorName,aAv)+"<span>"+esc(a.authorName)+"</span>")}${levelBadge(aLv,aLn)}${badgeHtml(a.authorBadge)}<span>${relTime(a.createdAt)}</span>
          ${cloudOn?canDelReply?`<span class="qm" data-adel="${a.id}" style="color:#FF9DA0">🗑 删除</span>`:"":`<span class="qm" data-aedit="${a.id}">✎ 编辑</span>
          ${isAdmin?`<span class="qm" data-adel="${a.id}" style="color:#FF9DA0">🗑 删除</span>`:""}`}
        </div>
        <div class="a-body" style="margin-top:8px">${renderBody(a.content)}</div>
        <div class="reply-actions"><button type="button" class="rp-btn" data-rreply="${a.id}" data-rname="${esc(a.authorName)}">💬 回复</button></div>
        ${a.children.length?`<div class="sub-replies">
          <div class="sub-replies-head">全部 ${a.children.length} 条回复</div>
          ${a.children.map(c=>subReplyHtml(c,1,curId,isAdmin,cloudOn)).join("")}
        </div>`:""}
        <div class="inline-reply hide" id="ir-${a.id}">
          <textarea class="field ir-body" placeholder="回复 @${esc(a.authorName)}：" style="min-height:70px"></textarea>
          <div class="ir-foot"><button class="btn btn-sm btn-ghost ir-cancel" data-rcancel="${a.id}">取消</button>
          <button class="btn btn-sm btn-orange ir-send" data-rsub="${a.id}">发送</button></div>
        </div>
      </div></div>`},panel2=`<div class="p-panel">
    <h2>${replies.length} 个回答</h2>
    ${tree.map(rootHtml).join("")||'<div class="empty">还没有回答，来写第一个回答吧</div>'}
    <div style="margin-top:20px">
      <label class="fl">写下你的回答</label>
      <textarea class="field" id="ans-body" style="min-height:130px" placeholder="分享你的见解……"></textarea>
      <div class="editor-bar"><button class="eb" id="ans-stk">插入表情包</button><button class="btn btn-orange btn-sm" id="ans-sub" style="margin-left:auto">提交回答</button></div>
      <div class="stk-picker hide" id="ans-stk-box">${STICKERS.map(s=>`<button data-s="${s}">${s}</button>`).join("")}</div>
    </div>
  </div>`;return bread+panel1+panel2}function highlightComment(commentId){if(!commentId)return;let el=null;try{el=document.querySelector('[data-reply-id="'+CSS.escape(commentId)+'"]')}catch(e){el=document.querySelector('[data-reply-id="'+commentId+'"]')}if(el){el.classList.add("reply-highlight");try{el.scrollIntoView({behavior:"smooth",block:"center"})}catch(e){el.scrollIntoView()}setTimeout(()=>el.classList.remove("reply-highlight"),3200)}}function viewPost(id){markForumNoticesSeen(id);const cloudOn=Cloud.connected,curId=cloudOn?Cloud.user.id:DB.user.id,isAdmin=cloudOn?Cloud.user.role>=3:DB.user.level>=3;if(cloudOn){const loading='<div class="p-panel"><div class="cloud-loading"><span class="cl-spin"></span>正在从云端加载帖子…</div></div>';return setTimeout(()=>{Cloud.getPost(id).then(d=>{const post2={id:d.post.id,board:d.post.board,title:d.post.title,content:d.post.content,authorId:d.post.authorId,authorName:d.post.authorName,authorLevel:d.post.authorLevel||0,authorLevelName:d.post.authorLevelName||"",authorAvatar:d.post.authorAvatar||"",createdAt:d.post.createdAt,lastActivityAt:d.post.lastActivityAt||d.post.createdAt,pinned:d.post.pinned,essence:!!d.post.essence,views:d.post.views,votes:d.post.votes||[],simulatedLikes:0,editedAt:d.post.editedAt||null,editCount:Number(d.post.editCount)||0},replies2=(d.replies||[]).map(r=>({id:r.id,postId:r.postId,parentId:r.parentId||null,authorId:r.authorId,authorName:r.authorName,authorLevel:r.authorLevel||0,authorLevelName:r.authorLevelName||"",authorAvatar:r.authorAvatar||"",authorBadge:r.authorBadge||null,content:r.content,createdAt:r.createdAt,votes:r.votes||[]}));$("#app").innerHTML=portalShell("forum",postDetailHtml(post2,replies2,curId,isAdmin,!0,d.poll||null)),highlightComment(parseHash().query.c||null),Cloud.readNotificationsForPost(id).then(async()=>{await Cloud.pollNotifications(),syncUnreadBadges()}).catch(()=>{})}).catch(e=>{$("#app").innerHTML=portalShell("forum",`<div class="p-panel empty">帖子加载失败：${esc(e.message)}<br><a class="btn btn-sm" href="#/forum">返回论坛</a></div>`)})},0),portalShell("forum",loading)}const p=DB.data.posts.find(x=>x.id===id);if(!p)return portalShell("forum",'<div class="p-panel empty">帖子不存在或已被删除</div>');const post={id:p.id,board:p.board,title:p.title,content:p.content,authorId:p.authorId,authorName:postAuthor(p),createdAt:p.createdAt,pinned:!!p.pinned,essence:!!p.essence,views:p.views,votes:p.votes||[],simulatedLikes:Number(p.simulatedLikes)||0},replies=localReplies(id).sort((a,b)=>b.votes.length-a.votes.length),cid=parseHash().query.c||null;return cid&&setTimeout(()=>highlightComment(cid),0),portalShell("forum",postDetailHtml(post,replies,curId,isAdmin,!1))}function postShareUrl(postId){return location.origin+location.pathname+"#/post/"+postId}async function copyText(text){try{if(navigator.clipboard&&window.isSecureContext)return await navigator.clipboard.writeText(text),!0}catch(e){}try{const ta=document.createElement("textarea");ta.value=text,ta.setAttribute("readonly",""),ta.style.position="fixed",ta.style.top="-1000px",ta.style.left="0",document.body.appendChild(ta),ta.focus(),ta.select(),ta.setSelectionRange(0,ta.value.length);const ok=document.execCommand("copy");return ta.remove(),ok}catch(e){return!1}}function openShareModal(post){const url=postShareUrl(post.id),canNative=typeof navigator.share=="function",mask=openMask(`
    <h3>转发分享</h3>
    <div class="m-body">
      <div class="share-card">
        <span class="sc-board">${esc(post.board||"论坛")}</span>
        <b class="sc-title">${esc(post.title)}</b>
        <span class="sc-author">${esc(post.authorName||"论坛成员")}</span>
      </div>
      <label class="fl">帖子链接</label>
      <input class="field" id="sh-link" readonly value="${esc(url)}">
      <div class="share-grid">
        <button type="button" class="share-act" id="sh-copy"><span class="sa-ico">🔗</span>复制链接</button>
        ${canNative?'<button type="button" class="share-act" id="sh-native"><span class="sa-ico">📤</span>系统分享</button>':""}
        <button type="button" class="share-act" id="sh-weibo"><span class="sa-ico">🌐</span>分享到微博</button>
        <button type="button" class="share-act" id="sh-qr"><span class="sa-ico">🔳</span>二维码</button>
      </div>
      <p class="ph-sub" style="margin-top:10px">微信/QQ 暂不支持网页直接唤起，点“复制链接”后到聊天框粘贴即可。</p>
      <div class="share-qr-box hide" id="sh-qr-box">
        <div class="sqr" id="sh-qr-canvas"></div>
        <p class="ph-sub">扫码即可在手机打开这个帖子</p>
      </div>
    </div>
    <div class="m-foot"><button type="button" class="btn btn-sm btn-ghost" id="sh-close">关闭</button></div>`),q=s=>mask.querySelector(s);q("#sh-close").onclick=()=>mask.remove(),q("#sh-link").onclick=e=>e.target.select(),q("#sh-copy").onclick=async()=>{const ok=await copyText(url);toast(ok?"链接已复制，去粘贴给好友吧":"复制失败，请手动选择链接复制",ok?"ok":"err")},canNative&&(q("#sh-native").onclick=async()=>{try{await navigator.share({title:post.title,text:post.title,url})}catch(e){}}),q("#sh-weibo").onclick=()=>{const u="https://service.weibo.com/share/share.php?url="+encodeURIComponent(url)+"&title="+encodeURIComponent(post.title);window.open(u,"_blank","noopener")};let qrMade=!1;q("#sh-qr").onclick=()=>{if(q("#sh-qr-box").classList.toggle("hide"),!qrMade){if(typeof QRCode=="undefined"){toast("二维码组件未加载","err");return}new QRCode(q("#sh-qr-canvas"),{text:url,width:168,height:168,colorDark:"#1F2433",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M}),qrMade=!0}}}function openPostEditModal(post){const mask=openMask(`
    <h3>编辑帖子</h3>
    <div class="m-body">
      <p class="ph-sub" style="margin:0 0 10px">仅你本人可编辑；每次保存都会在“编辑记录”中保留修改前的版本。</p>
      <label class="fl">标题</label>
      <input class="field" id="pe-title" value="${esc(post.title)}">
      <label class="fl" style="margin-top:10px">正文</label>
      <textarea class="field" id="pe-content" style="min-height:200px">${esc(post.content)}</textarea>
    </div>
    <div class="m-foot">
      <button type="button" class="btn btn-sm btn-ghost" id="pe-cancel">取消</button>
      <button type="button" class="btn btn-sm btn-orange" id="pe-save">保存修改</button>
    </div>`),q=s=>mask.querySelector(s);let saving=!1;q("#pe-cancel").onclick=()=>mask.remove(),setTimeout(()=>q("#pe-title").focus(),0),q("#pe-save").onclick=async()=>{if(saving)return;const title=q("#pe-title").value.trim(),content=q("#pe-content").value;if(!title){toast("标题不能为空","err");return}if(!content.trim()){toast("正文不能为空","err");return}saving=!0;try{await Cloud.editPost(post.id,title,content),mask.remove(),toast("已保存修改，编辑记录已更新","ok"),await cloudRerender()}catch(e){saving=!1,toast(e.message,"err")}}}async function openPostHistoryModal(post){const mask=openMask(`
    <h3>编辑记录</h3>
    <div class="m-body">
      <div class="cloud-loading" id="peh-loading"><span class="cl-spin"></span>正在加载编辑历史…</div>
      <div class="edit-history" id="peh-list"></div>
    </div>
    <div class="m-foot"><button type="button" class="btn btn-sm btn-ghost" id="peh-close">关闭</button></div>`);mask.querySelector("#peh-close").onclick=()=>mask.remove();let d;try{d=await Cloud.postEdits(post.id)}catch(e){mask.remove(),toast(e.message,"err");return}const list=mask.querySelector("#peh-list");mask.querySelector("#peh-loading").classList.add("hide");const versions=(d.versions||[]).slice().sort((a,b)=>b.version-a.version);list.innerHTML=versions.map(v=>`
    <div class="edit-version ${v.current?"is-current":""}" data-version="${v.version}">
      <div class="ev-head">
        <span class="ev-version">版本 ${v.version}${v.current?'<em class="ev-current-tag">当前</em>':""}</span>
        <span class="ev-meta">${v.editorName?esc(v.editorName)+" · ":""}${esc(v.at)}</span>
        <button type="button" class="ev-toggle" data-evtoggle="${v.version}">${v.current?"收起":"展开"}</button>
      </div>
      <div class="ev-content ${v.current?"":"hide"}" id="evc-${v.version}">
        <b class="ev-title">${esc(v.title)}</b>
        <div class="ev-body-text">${renderBody(v.content)}</div>
      </div>
    </div>`).join("")||'<div class="empty">暂无编辑记录</div>',list.querySelectorAll("[data-evtoggle]").forEach(btn=>{btn.onclick=()=>{const box=list.querySelector("#evc-"+btn.dataset.evtoggle);box.classList.toggle("hide"),btn.textContent=box.classList.contains("hide")?"展开":"收起"}})}function renderBody(t){const imgs=[];let s=esc(t).replace(/\[img\](data:image\/[^\[]+)\[\/img\]/g,(m,u)=>(imgs.push(u),`\0${imgs.length-1}\0`));return s=s.replace(/(\p{Extended_Pictographic}[\uFE0f\uFE0e]?(\u200d\p{Extended_Pictographic}[\uFE0f\uFE0e]?)*)/gu,m=>`<span class="sticker" style="font-size:26px;width:auto;height:auto">${m}</span>`),s=s.replace(/\u0000(\d+)\u0000/g,(m,i)=>`<img class="inline-img" src="${imgs[i]}">`),s=s.replace(/@\[([^\[\]]{1,40})\]\(([A-Za-z0-9][A-Za-z0-9\-]{0,63})\)/g,(m,name,id)=>`<a class="mention-link" href="#/space/${id}">@${name}</a>`),s}function accessDenied(){return`<div class="p-panel empty"><div class="es">🔒</div>该模块为哪都通员工业务系统<br>
  <span style="font-size:13px">普通异人可在论坛交流；若你是员工，请在「数据中心」输入员工激活码</span>
  <div style="margin-top:18px"><a class="btn btn-sm" href="#/settings">前往数据中心</a></div></div>`}function dangerTag(d){return`<span class="tag ${{S:"tag-red",A:"tag-orange",B:"tag",C:"tag-green",D:"tag-gray"}[d]||"tag-gray"}">危险 ${esc(d)}</span>`}function secName(s){return{1:"内部公开",2:"内部",3:"机密",4:"绝密"}[s]}function secTag(s){return`<span class="sec-badge sec-${s}">${secName(s)}</span>`}function viewArchives(q,da){if(DB.level()<2)return portalShell("archives",accessDenied());q=q||"",da=da||"";let list=DB.data.archives.slice();if(q){const k=q.toLowerCase();list=list.filter(r=>[r.name,r.faction,r.skill,r.aliases,r.code].join(" ").toLowerCase().includes(k))}da&&(list=list.filter(r=>r.danger===da)),list.sort((a,b)=>{var _a,_b;return((_a={S:0,A:1,B:2,C:3,D:4}[a.danger])!=null?_a:9)-((_b={S:0,A:1,B:2,C:3,D:4}[b.danger])!=null?_b:9)});const c=`<div class="p-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <h2>异人档案库</h2>
      <button class="btn btn-sm btn-orange" id="arc-new">＋ 新增档案</button>
    </div>
    <div class="ph-sub">登记在册的异人信息，按权限与机密等级分级开放，可新增、可修改</div>
    <div class="search-row">
      <input class="field" id="ar-q" placeholder="搜索姓名 / 门派 / 功法 / 编号" value="${esc(q)}">
      <select class="field" id="ar-d"><option value="">全部危险等级</option>${["S","A","B","C","D"].map(x=>`<option value="${x}" ${x===da?"selected":""}>${x} 级</option>`).join("")}</select>
      <button class="btn btn-sm" id="ar-go">搜索</button>
    </div>
    <div class="arc-grid">
      ${list.map(r=>Auth.canViewSec(r.sec)?`<div class="arc-card" data-arc="${r.id}">
          <div class="av">${esc(avText(r.name))}</div>
          <div style="min-width:0;flex:1">
            <h3>${esc(r.name)} ${secTag(r.sec)}</h3>
            <div class="ac-meta">${esc(r.code)} · ${esc(r.faction)}</div>
            <div style="margin-top:6px">${dangerTag(r.danger)} <span class="tag tag-gray">${esc(r.status)}</span></div>
          </div></div>`:`<div class="arc-card" data-arc="${r.id}">
          <div class="av">🔒</div>
          <div style="min-width:0;flex:1">
            <h3>****</h3>
            <div class="ac-meta">**** · ****</div>
          </div></div>`).join("")||'<div class="empty">没有匹配的档案</div>'}
    </div>
  </div>`;return portalShell("archives",c)}function viewArchive(id){if(DB.level()<2)return portalShell("archives",accessDenied());const r=DB.data.archives.find(x=>x.id===id);if(!r)return portalShell("archives",'<div class="p-panel empty">档案不存在</div>');const locked=!Auth.canViewSec(r.sec),c=`<div class="p-crumb"><a href="#/archives" >异人档案库</a> / <b>${locked?"****":esc(r.name)}</b></div>
  <div class="p-panel dossier">
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <div class="av" style="width:72px;height:72px;font-size:28px;background:var(--blue-2);border-radius:50%;display:flex;align-items:center;justify-content:center">${locked?"🔒":esc(avText(r.name))}</div>
      <div><h2 style="font-size:24px">${locked?"****":esc(r.name)} ${secTag(r.sec)}</h2>
      <div class="ph-sub" style="margin:4px 0 0">${locked?"****":esc(r.code)+" · "+esc(r.aliases||"无曾用名")}</div></div>
      <div style="margin-left:auto">${locked?"":dangerTag(r.danger)}</div>
    </div>
    ${locked?`<div class="empty" style="padding:30px"><div class="es">⛔</div>该档案为${secName(r.sec)}级别，需相应权限调阅<br>
      <span class="muted" style="font-size:12.5px">（姓名、编号等信息已隐藏，有权限后自动显示）</span></div>`:`<div style="margin-top:18px;text-align:right"><span class="qm" id="arc-edit">✎ 编辑档案</span></div>
      <div class="d-row"><div class="dk">性别</div><div class="dv">${esc(r.gender)}</div></div>
      <div class="d-row"><div class="dk">派系 / 所属</div><div class="dv">${esc(r.faction)}</div></div>
      <div class="d-row"><div class="dk">功法 / 手段</div><div class="dv">${esc(r.skill)}</div></div>
      <div class="d-row"><div class="dk">当前状态</div><div class="dv">${esc(r.status)}</div></div>
      <div class="d-note">${esc(r.note)}</div>
    </div>`}
  </div>
  ${locked?"":`<div class="p-panel" style="margin-top:14px">
    <h3 style="font-size:16px">关系树</h3>
    <div class="ph-sub">标注该人物的关系网络，可自由增删</div>
    ${relTreeHtml(r)}
  </div>`}
  </div>`;return portalShell("archives",c)}function viewEvents(){if(DB.level()<2)return portalShell("events",accessDenied());const c=`<div class="p-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <h2>事件档案</h2>
      <button class="btn btn-sm btn-orange" id="ev-new">＋ 新增事件</button>
    </div>
    <div class="ph-sub">异人相关重大事件记录，按时间排列，可新增、可修改</div>
    <div class="ev-tl" style="margin-top:20px">
      ${DB.data.events.map(e=>Auth.canViewSec(e.sec)?`<div class="ev-item ${e.hot?"hot":""}" data-ev="${e.id}">
          <div class="ey">${esc(e.date)} ${secTag(e.sec)}</div>
          <h3>${esc(e.title)}</h3>
          <p>${esc(e.content.slice(0,60))}……</p>
        </div>`:`<div class="ev-item" data-ev="${e.id}">
          <div class="ey">**** ${secTag(e.sec)}</div>
          <h3>****</h3>
          <p>****</p>
        </div>`).join("")}
    </div>
  </div>`;return portalShell("events",c)}function viewEvent(id){if(DB.level()<2)return portalShell("events",accessDenied());const e=DB.data.events.find(x=>x.id===id);if(!e)return portalShell("events",'<div class="p-panel empty">事件不存在</div>');const locked=!Auth.canViewSec(e.sec),c=`<div class="p-crumb"><a href="#/events" >事件档案</a> / <b>${locked?"****":esc(e.title)}</b></div>
  <div class="p-panel">
    <div class="ey" style="font-family:var(--mono);color:var(--orange);font-size:13px">${locked?"****":esc(e.date)+" · "+esc(e.loc)} ${secTag(e.sec)}</div>
    <h2 style="margin:10px 0 16px;font-size:22px">${locked?"****":esc(e.title)}
      ${locked?"":'<span class="qm" id="ev-edit" style="font-size:13px;margin-left:12px">✎ 编辑事件</span>'}</h2>
    ${locked?`<div class="empty"><div class="es">⛔</div>该事件为${secName(e.sec)}级别，需相应权限<br>
      <span class="muted" style="font-size:12.5px">（标题、时间、地点等信息已隐藏，有权限后自动显示）</span></div>`:`<p style="color:#D6DEFA;line-height:2;white-space:pre-wrap;font-size:15px">${esc(e.content)}</p>`}
  </div>`;return portalShell("events",c)}function viewLibrary(){if(DB.level()<2)return portalShell("library",accessDenied());const c=`<div class="p-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <h2>资料库</h2>
      <button class="btn btn-sm btn-orange" id="lib-new">＋ 新增资料</button>
    </div>
    <div class="ph-sub">功法、组织与历史资料检索，可新增、可修改</div>
    ${[...new Set(DB.data.library.map(l=>l.cat))].map(cat=>{const items=DB.data.library.filter(l=>l.cat===cat);return`<h3 style="font-size:15px;margin:18px 0 10px">${esc(cat)}</h3>
        ${items.map(l=>Auth.canViewSec(l.sec)?`<div class="lib-item" data-lib="${l.id}">
            <h3>${esc(l.title)} ${secTag(l.sec)}
              <span class="qm" data-libedit="${l.id}" style="font-size:12px;margin-left:10px">✎ 编辑</span></h3>
            <p style="margin-top:6px">${esc(l.content)}</p>
          </div>`:`<div class="lib-item">
            <h3>**** ${secTag(l.sec)}</h3>
            <p style="margin-top:6px">****</p>
          </div>`).join("")}`}).join("")}
  </div>`;return portalShell("library",c)}function viewCodex(q=""){const rows=DB.data.publicLibrary||[],query=String(q||"").trim().toLowerCase(),filtered=rows.filter(x=>!query||[x.cat,x.title,x.summary,x.content,x.tags].join(" ").toLowerCase().includes(query)),cats=[...new Set(filtered.map(x=>x.cat))],c=`<div class="p-panel codex-panel">
    <div class="codex-head"><div><div class="ey">ARCHIVE OF THE UNUSUAL</div><h2>异闻典藏</h2><p class="ph-sub">门派谱系、人物轶闻与文献民俗索引</p></div><button class="btn btn-sm btn-orange" id="codex-new">＋ 收录条目</button></div>
    <form class="codex-search" id="codex-search"><input class="field" id="codex-q" value="${esc(q)}" placeholder="搜索门派、人物、典籍或关键词"><button class="btn btn-sm" type="submit">检索</button></form>
    <div class="codex-cats">${cats.map(cat=>`<span class="codex-cat">${esc(cat)}</span>`).join("")}</div>
    ${cats.map(cat=>`<section class="codex-section"><h3>${esc(cat)}</h3><div class="codex-grid">${filtered.filter(x=>x.cat===cat).map(x=>`<article class="codex-card"><div class="codex-card-kicker">NDT / REFERENCE</div><h4>${esc(x.title)}</h4><p class="codex-summary">${esc(x.summary||"")}</p><details><summary>展开典藏条目</summary><div class="codex-content">${esc(x.content||"")}</div><div class="codex-tags">${esc(x.tags||"")}</div></details><div class="codex-actions"><button class="btn btn-sm btn-ghost" data-codex-edit="${esc(x.id)}">编辑条目</button><button class="btn btn-sm btn-ghost" data-codex-del="${esc(x.id)}">移除</button></div></article>`).join("")}</div></section>`).join("")||'<div class="empty">未找到相关条目，试试其他关键词。</div>'}
    <p class="codex-foot">典藏索引 · 可由站内成员共同补充</p>
  </div>`;return portalShell("codex",c)}function codexForm(item={id:"",cat:"势力与流派",title:"",summary:"",content:"",tags:""}){const isNew=!item.id;modal(`<h3>${isNew?"收录典藏条目":"修订典藏条目"}</h3><div class="m-body"><label class="fl">分类</label><input class="field" id="cd-cat" value="${esc(item.cat)}" placeholder="势力与流派 / 人物志 / 文献与民俗"><label class="fl">条目名称</label><input class="field" id="cd-title" value="${esc(item.title)}"><label class="fl">摘要</label><input class="field" id="cd-summary" value="${esc(item.summary)}"><label class="fl">正文</label><textarea class="field" id="cd-content" style="min-height:190px">${esc(item.content)}</textarea><label class="fl">检索标签</label><input class="field" id="cd-tags" value="${esc(item.tags)}" placeholder="用逗号分隔"></div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-codex-save="yes">保存条目</button></div>`).then(v=>{if(v!=="yes")return;const val={id:item.id||genId("pub"),cat:$("#cd-cat").value.trim()||"未分类",title:$("#cd-title").value.trim(),summary:$("#cd-summary").value.trim(),content:$("#cd-content").value.trim(),tags:$("#cd-tags").value.trim()};if(!val.title){toast("请填写条目名称","warn");return}if(Array.isArray(DB.data.publicLibrary)||(DB.data.publicLibrary=[]),isNew)DB.data.publicLibrary.unshift(val);else{const i=DB.data.publicLibrary.findIndex(x=>x.id===item.id);i>=0&&(DB.data.publicLibrary[i]=val)}DB.save(),router(),toast(isNew?"已收录条目":"条目已修订","ok")})}function viewDashboard(){if(DB.level()<3)return portalShell("dashboard",accessDenied());const u=DB.data.users,c=`<div class="p-panel">
    <h2>管理员工作台</h2><div class="ph-sub">区域数据总览（本机数据）</div>
    <div class="stat-strip">
      <div class="ss"><b>${DB.data.archives.length}</b><span>在册异人</span></div>
      <div class="ss"><b>${DB.data.events.length}</b><span>归档事件</span></div>
      <div class="ss"><b>${DB.data.posts.length}</b><span>论坛帖子</span></div>
      <div class="ss"><b>${u.length}</b><span>本地用户</span></div>
    </div>
    <h3 style="font-size:15px;margin:16px 0 8px">绝密条目（仅主管可见）</h3>
    ${DB.data.archives.filter(r=>r.sec>=4).map(r=>`<div class="lib-item" data-arc="${r.id}"><h3>${esc(r.name)}</h3><div class="lm">${esc(r.code)} · ${esc(r.faction)}</div></div>`).join("")}
    ${DB.data.library.filter(l=>l.sec>=4).map(l=>`<div class="lib-item" data-lib="${l.id}"><h3>${esc(l.title)}</h3><div class="lm">${esc(l.cat)}</div></div>`).join("")}
  </div>`;return portalShell("dashboard",c)}function viewSpace(id){if(!DB.user)return viewGate();const t=id==="me"?DB.user:DB.data.users.find(u=>u.id===id);if(!t)return portalShell("space",'<div class="p-panel empty">用户不存在</div>');const tpl=tplOf(t.tpl),isMe=t.id===DB.user.id,isFriend=DB.user.friends.includes(t.id),myPosts=DB.data.posts.filter(p=>p.authorId===t.id),friends=DB.data.users.filter(u=>t.friends.includes(u.id)),c=`<div class="p-panel" style="padding:0;overflow:hidden">
      <div class="space-cover" style="${t.coverImg?`background-image:url('${t.coverImg}');background-size:cover;background-position:center`:`background:${tpl.cover}`};--tpl-a:${tpl.a||"#1A2C78"};--tpl-b:${tpl.b||"#2E47B8"}"></div>
      <div class="space-head">
        <div class="av" style="border-width:${t.avatarBorder==="thick"?"6px":t.avatarBorder==="thin"?"2px":"0"};border-color:var(--pt-panel)">${t.avatar&&t.avatar.startsWith("data")?`<img src="${esc(t.avatar)}" style="width:100%;height:100%;object-fit:cover">`:esc(avText(t.name))}</div>
        <div class="sh-info">
          <h2 style="color:${t.nameColor||"var(--pt-text)"}">${esc(t.name)}</h2>
          <div class="sh-badges">${gradeBadge(t,{mini:!0})}</div>
          <div class="sh-sub">${esc(t.bio||"")}</div>
        </div>
        <div class="space-actions">
          ${isMe?'<a class="btn btn-sm btn-orange" href="#/decorate">装修空间</a>':`<button class="btn btn-sm ${isFriend?"btn-ghost":""}" id="sp-add">${isFriend?"已加好友":"+ 加好友"}</button>`}
        </div>
      </div>
      <div style="padding:20px 26px 26px">
        <div class="space-level-card">
          <div class="slc-head">${gradeBadge(t)}<span class="slc-points">${userPoints(t)} 积分</span></div>
          ${gradeProgress(t)}
          ${isMe?`<button class="btn btn-sm btn-ghost space-level-manage" id="sp-lv-manage">${svgIco("gear")}<span>管理等级与积分</span></button>`:""}
        </div>
        <h3 style="font-size:15px;margin:18px 0 10px">个人动态</h3>
        <div class="portal-notice-text" style="--user-zika-bg:${t.zikaBg||"var(--pt-panel-2)"};background:var(--user-zika-bg);padding:10px;border-radius:8px">${esc(t.notice||"（还没有发布动态）")}</div>
        <h3 style="font-size:15px;margin:20px 0 10px">TA 的帖子（${myPosts.length}）</h3>
        ${myPosts.map(p=>`<div class="lib-item" data-open="${p.id}"><h3 style="font-size:14px">${esc(p.title)}</h3><div class="lm">${relTime(p.createdAt)} · ${p.votes.length} 赞同</div></div>`).join("")||'<div class="empty" style="padding:20px">暂无帖子</div>'}
        <h3 style="font-size:15px;margin:20px 0 10px">好友（${friends.length}）</h3>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${friends.map(f=>`<a href="#/space/${f.id}" class="friend-card" style="margin:0;padding:10px 14px"><span class="av" style="width:36px;height:36px;font-size:14px">${esc(avText(f.name))}</span><span><b>${esc(f.name)}</b></span></a>`).join("")||'<span class="ph-sub">还没有好友</span>'}
        </div>
      </div>
    </div>`;return portalShell("space",c)}function openSpaceLevelManage(){const rule=pointsRule(),levels=forumLevels(),html=`
    <h3 style="margin:0 0 4px">论坛等级与积分</h3>
    <div class="ph-sub" style="font-size:12.5px">自定义积分规则与各等级名称、升级所需积分（最高 20 级）</div>
    <div class="slv-rule-grid">
      ${[["post","发帖"],["reply","回帖"],["like","点赞"],["gamePerLine","游戏每消一行"],["gameCap","游戏单局上限"]].map(([k,label])=>`<div class="sr-cell"><span>${label}</span>
        <input type="number" min="0" class="field" data-spv-rule="${k}" value="${Number(rule[k])||0}"></div>`).join("")}
    </div>
    <div class="slv-edit-list">
      ${levels.map((lv,i)=>`
        <div class="slv-edit-row"><span class="slv-no">${i+1} 级</span>
          <input class="field" data-spv-name="${i}" maxlength="10" value="${esc(lv.name)}" placeholder="等级名">
          <input type="number" min="0" class="field" data-spv-min="${i}" value="${Number(lv.min)||0}"></div>`).join("")}
    </div>
    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-orange" id="spv-save">保存</button>
      <button class="btn btn-ghost btn-sm" id="spv-reset">恢复默认</button>
    </div>`;return modal(html)}function viewDecorate(){if(!DB.user)return viewGate();const u=DB.user,c=`<div class="p-panel">
    <h2>空间装修</h2><div class="ph-sub">选择模板、自定义字卡与头像，打造你自己的空间</div>
    <h3 style="font-size:14px;margin:18px 0 10px">昵称（可随时修改，本地保存）</h3>
    <input class="field" id="d-name" value="${esc(u.name)}" placeholder="你的昵称">
    <h3 style="font-size:14px;margin:22px 0 10px">空间模板</h3>
    <div class="tpl-grid">
      ${(TEMPLATES[DB.data.theme||"default"]||TEMPLATES.default).map(t=>`<div class="tpl-card ${u.tpl===t.id?"on":""}" data-tpl="${t.id}">
        <div class="tc-cover" style="--tpl-a:${t.a};--tpl-b:${t.b};background:linear-gradient(120deg,var(--tpl-a),var(--tpl-b))"></div><div class="tc-name">${t.name}</div></div>`).join("")}
    </div>
    <h3 style="font-size:14px;margin:22px 0 10px">封面图</h3>
    <input class="field" id="d-cover-url" placeholder="封面图片 URL（可选）" value="${esc(u.coverImg&&u.coverImg.startsWith("http")?u.coverImg:"")}">
    <label class="btn btn-ghost btn-sm" style="margin-top:8px">上传封面图片（自动压缩）<input type="file" id="d-cover-file" accept="image/*" class="hide"></label>
    <h3 style="font-size:14px;margin:22px 0 10px">字卡底色</h3>
    <div class="color-row">${["var(--pt-panel-2)","#FFFFFF","#EDE8D8","#FBE4EC","#0B1E52","#00E5FF","#FF2E88"].map(c2=>`<button type="button" data-zika-color="${c2}" title="${c2}" style="background:${c2};border-color:var(--pt-border)"></button>`).join("")}</div>
    <label class="fl">自定义字卡底色</label><input type="color" id="d-zika-custom" value="${/^#[0-9a-f]{6}$/i.test(u.zikaBg||"")?u.zikaBg:"#F2F4FA"}">
    <h3 style="font-size:14px;margin:22px 0 10px">头像边框</h3><select class="field" id="d-avatar-border"><option value="none" ${!u.avatarBorder||u.avatarBorder==="none"?"selected":""}>无</option><option value="thin" ${u.avatarBorder==="thin"?"selected":""}>细边框</option><option value="thick" ${u.avatarBorder==="thick"?"selected":""}>粗边框</option></select>
    <h3 style="font-size:14px;margin:22px 0 10px">昵称颜色</h3><select class="field" id="d-name-color"><option value="var(--pt-text)">跟随主题</option><option value="var(--pt-accent)" ${u.nameColor==="var(--pt-accent)"?"selected":""}>主题强调色</option><option value="var(--pt-highlight)" ${u.nameColor==="var(--pt-highlight)"?"selected":""}>主题重点色</option><option value="#FFFFFF" ${u.nameColor==="#FFFFFF"?"selected":""}>白色</option><option value="#111827" ${u.nameColor==="#111827"?"selected":""}>深色</option></select>
    <h3 style="font-size:14px;margin:22px 0 10px">头像</h3>
    <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
      <div class="av" style="width:64px;height:64px;background:var(--blue-2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;overflow:hidden">${u.avatar&&u.avatar.startsWith("data")?`<img src="${esc(u.avatar)}" style="width:100%;height:100%;object-fit:cover">`:esc(avText(u.name))}</div>
      <input class="field" id="d-av-url" style="flex:1;min-width:200px" placeholder="头像图片 URL（可选）" value="${u.avatar&&u.avatar.startsWith("http")?esc(u.avatar):""}">
      <label class="btn btn-ghost btn-sm" style="margin:0">上传本地图片<input type="file" id="d-av-file" accept="image/*" class="hide"></label>
    </div>
    <h3 style="font-size:14px;margin:22px 0 10px">个人简介</h3>
    <textarea class="field" id="d-bio" style="min-height:70px">${esc(u.bio||"")}</textarea>
    <h3 style="font-size:14px;margin:22px 0 10px">个人动态</h3>
    <textarea class="field" id="d-notice" style="min-height:70px" placeholder="写点什么吧……">${esc(u.notice||"")}</textarea>
    <div style="margin-top:22px;display:flex;gap:10px"><button class="btn btn-orange" id="d-save">保存装修</button><a class="btn btn-ghost btn-sm" href="#/space/me">预览空间</a></div>
  </div>`;return portalShell("decorate",c)}function compressAvatar(file,cb){const r=new FileReader;r.onload=e=>{const img=new Image;img.onload=()=>{const c=document.createElement("canvas");c.width=128,c.height=128;const ctx=c.getContext("2d"),r0=Math.min(img.width,img.height);ctx.drawImage(img,(img.width-r0)/2,(img.height-r0)/2,r0,r0,0,0,128,128),cb(c.toDataURL("image/jpeg",.85))},img.src=e.target.result},r.readAsDataURL(file)}function compressImage(file,maxW,cb,onError){try{const r=new FileReader;r.onerror=()=>{onError&&onError(r.error||new Error("文件读取失败"))},r.onload=e=>{const img=new Image;img.onerror=()=>{onError&&onError(new Error("图片解码失败"))},img.onload=()=>{try{let w=img.width,h=img.height;w>maxW&&(h=Math.round(h*maxW/w),w=maxW);const c=document.createElement("canvas");c.width=w,c.height=h;const ctx=c.getContext("2d");if(!ctx)throw new Error("无法创建图片画布");ctx.drawImage(img,0,0,w,h),cb(c.toDataURL("image/jpeg",.72))}catch(err){onError?onError(err):toast("图片处理失败，请换一张图片重试。","err")}},img.src=e.target.result},r.readAsDataURL(file)}catch(err){onError?onError(err):toast("图片处理失败，请换一张图片重试。","err")}}function chatHint(){modal(`<h3>私信使用说明</h3><div class="m-body" style="line-height:2">
    1. 在下方输入框打字，回车发送（Shift+回车换行）；<br>
    2. 点对方头像（或“+ TA 回复一条”），对方就回复一条“请输入内容”，点几次回复几条；<br>
    3. 点击任意气泡可修改文字，照片可改配文；<br>
    4. 点图片按钮可发送照片，帖子和回答里也能插入图片；<br>
    5. 所有内容仅保存在本机，可在数据中心导出。</div>
    <div class="m-foot"><button class="btn btn-sm" data-m="ok">我知道了</button></div>`)}function archiveForm(r){const isNew=!r.id;modal(`<h3>${isNew?"新增档案":"编辑档案"}</h3><div class="m-body">
    <div style="display:flex;gap:10px">
      <div style="flex:1"><label class="fl">姓名</label><input class="field" id="m-name" value="${esc(r.name||"")}"></div>
      <div style="flex:1"><label class="fl">编号</label><input class="field" id="m-code" value="${esc(r.code||"")}"></div>
      <div style="flex:1"><label class="fl">性别</label><input class="field" id="m-gender" value="${esc(r.gender||"")}"></div>
    </div>
    <label class="fl">派系 / 所属</label><input class="field" id="m-faction" value="${esc(r.faction||"")}">
    <label class="fl">功法 / 手段</label><input class="field" id="m-skill" value="${esc(r.skill||"")}">
    <div style="display:flex;gap:10px">
      <div style="flex:1"><label class="fl">危险等级</label>
        <select class="field" id="m-danger">${["S","A","B","C","D","未知"].map(x=>`<option ${x===r.danger?"selected":""}>${x}</option>`).join("")}</select></div>
      <div style="flex:1"><label class="fl">状态</label><input class="field" id="m-status" value="${esc(r.status||"")}"></div>
      <div style="flex:1"><label class="fl">机密等级</label>
        <select class="field" id="m-sec">${[1,2,3,4].map(x=>`<option value="${x}" ${x===(r.sec||2)?"selected":""}>${secName(x)}</option>`).join("")}</select></div>
    </div>
    <label class="fl">别名</label><input class="field" id="m-aliases" value="${esc(r.aliases||"")}">
    <label class="fl">备注</label><textarea class="field" id="m-note" style="min-height:120px">${esc(r.note||"")}</textarea></div>
    <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">保存</button></div>`).then(v=>{v==="yes"&&(r.name=$("#m-name").value.trim(),r.code=$("#m-code").value.trim(),r.gender=$("#m-gender").value.trim(),r.faction=$("#m-faction").value.trim(),r.skill=$("#m-skill").value.trim(),r.danger=$("#m-danger").value,r.status=$("#m-status").value.trim(),r.sec=parseInt($("#m-sec").value),r.aliases=$("#m-aliases").value.trim(),r.note=$("#m-note").value,isNew&&(r.id=genId("r"),DB.data.archives.push(r)),DB.save(),router(),toast(isNew?"档案已新增":"档案已保存","ok"))})}function eventForm(e){const isNew=!e.id;modal(`<h3>${isNew?"新增事件":"编辑事件"}</h3><div class="m-body">
    <div style="display:flex;gap:10px">
      <div style="flex:1"><label class="fl">发生时间</label><input class="field" id="m-date" value="${esc(e.date||"")}" placeholder="如 2026年春"></div>
      <div style="flex:1"><label class="fl">地点</label><input class="field" id="m-loc" value="${esc(e.loc||"")}"></div>
      <div style="flex:1"><label class="fl">机密等级</label>
        <select class="field" id="m-sec">${[1,2,3,4].map(x=>`<option value="${x}" ${x===(e.sec||1)?"selected":""}>${secName(x)}</option>`).join("")}</select></div>
    </div>
    <label class="fl">标题</label><input class="field" id="m-title" value="${esc(e.title||"")}">
    <label class="fl">内容</label><textarea class="field" id="m-body" style="min-height:150px">${esc(e.content||"")}</textarea></div>
    <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">保存</button></div>`).then(v=>{v==="yes"&&(e.date=$("#m-date").value.trim(),e.loc=$("#m-loc").value.trim(),e.title=$("#m-title").value.trim(),e.content=$("#m-body").value,e.sec=parseInt($("#m-sec").value),isNew&&(e.id=genId("e"),DB.data.events.push(e)),DB.save(),router(),toast(isNew?"事件已新增":"事件已保存","ok"))})}function libForm(l){const isNew=!l.id;modal(`<h3>${isNew?"新增资料":"编辑资料"}</h3><div class="m-body">
    <div style="display:flex;gap:10px">
      <div style="flex:1"><label class="fl">分类</label><input class="field" id="m-cat" value="${esc(l.cat||"")}" placeholder="如 八奇技、组织、基础"></div>
      <div style="flex:1"><label class="fl">机密等级</label>
        <select class="field" id="m-sec">${[1,2,3,4].map(x=>`<option value="${x}" ${x===(l.sec||1)?"selected":""}>${secName(x)}</option>`).join("")}</select></div>
    </div>
    <label class="fl">标题</label><input class="field" id="m-title" value="${esc(l.title||"")}">
    <label class="fl">内容</label><textarea class="field" id="m-body" style="min-height:170px">${esc(l.content||"")}</textarea></div>
    <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">保存</button></div>`).then(v=>{v==="yes"&&(l.cat=$("#m-cat").value.trim(),l.title=$("#m-title").value.trim(),l.content=$("#m-body").value,l.sec=parseInt($("#m-sec").value),isNew&&(l.id=genId("l"),DB.data.library.push(l)),DB.save(),router(),toast(isNew?"资料已新增":"资料已保存","ok"))})}function cloudBoardManage(){const mask=openMask(`<h3>管理论坛分类</h3><div class="m-body">
    <div id="cb-list"><div class="cloud-loading"><span class="cl-spin"></span>加载中…</div></div>
    <label class="fl">新增分类</label>
    <div style="display:flex;gap:8px"><input class="field" id="cb-add" placeholder="输入新分类名称" maxlength="12">
    <button class="btn btn-sm btn-orange" id="cb-add-go">添加</button></div>
    <p class="muted" style="font-size:12px;margin-top:10px">删除分类时，其下帖子默认移动到「灌水」；系统公告板块不能删除。</p></div>
    <div class="m-foot"><button class="btn btn-sm" id="cb-done">完成</button></div>`),render=async()=>{const box=mask.querySelector("#cb-list");try{const boards=await Cloud.listBoards();box.innerHTML=boards.map(b=>`<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <b style="flex:1">${esc(b.name)}</b>
        <span class="muted" style="font-size:12px;white-space:nowrap">${b.postCount}帖</span>
        ${b.name==="公告"?"":`<button class="btn btn-sm btn-ghost cb-del" data-name="${esc(b.name)}">删除</button>`}
      </div>`).join(""),box.querySelectorAll(".cb-del").forEach(btn=>{btn.addEventListener("click",()=>{const name=btn.dataset.name;modal(`<h3>删除分类「${name}」</h3><div class="m-body">
            <p>该分类下的帖子如何处理？</p></div>
            <div class="m-foot"><button class="btn btn-sm btn-ghost" data-m="cancel">取消</button>
            <button class="btn btn-sm btn-ghost" data-m="delete">连同帖子删除</button>
            <button class="btn btn-sm btn-orange" data-m="move">移动到灌水</button></div>`).then(async v=>{if(v!=="cancel")try{await Cloud.deleteBoard(name,v),toast("分类已删除","ok"),render()}catch(e){toast(e.message,"err")}})})})}catch(e){box.innerHTML='<div class="empty">加载失败：'+esc(e.message)+"</div>"}};render(),mask.querySelector("#cb-add-go").addEventListener("click",async()=>{const v=mask.querySelector("#cb-add").value.trim();if(!v)return toast("请输入分类名称","warn");try{await Cloud.createBoard(v),toast("分类已添加","ok"),mask.querySelector("#cb-add").value="",render()}catch(e){toast(e.message,"err")}}),mask.querySelector("#cb-done").addEventListener("click",()=>{mask.remove(),router()})}function boardManage(){if(Cloud.connected){cloudBoardManage();return}const mask=openMask(`<h3>管理论坛分类</h3><div class="m-body">
    <div id="bd-list"></div>
    <label class="fl">新增分类</label>
    <div style="display:flex;gap:8px"><input class="field" id="bd-add" placeholder="输入新分类名称" maxlength="10">
    <button class="btn btn-sm btn-orange" id="bd-add-go">添加</button></div>
    <p class="muted" style="font-size:12px;margin-top:10px">改名会同步到该分类下所有帖子；分类下有帖子时不能删除。</p></div>
    <div class="m-foot"><button class="btn btn-sm" id="bd-done">完成</button></div>`),render=()=>{const box=mask.querySelector("#bd-list");box.innerHTML=DB.data.boards.map((b,i)=>{const n=DB.data.posts.filter(p=>p.board===b).length;return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <input class="field bd-name" data-i="${i}" value="${esc(b)}">
        <span class="muted" style="font-size:12px;white-space:nowrap">${n}帖</span>
        <button class="btn btn-sm btn-ghost bd-del" data-i="${i}" ${n?'disabled title="分类下还有帖子，不能删除"':""}>删除</button>
      </div>`}).join(""),box.querySelectorAll(".bd-del").forEach(btn=>{btn.addEventListener("click",()=>{if(btn.disabled)return;const i=parseInt(btn.dataset.i);DB.data.boards.splice(i,1),DB.save(),render()})})};render(),mask.querySelector("#bd-add-go").addEventListener("click",()=>{const v=mask.querySelector("#bd-add").value.trim();if(!v)return toast("请输入分类名称","warn");if(DB.data.boards.includes(v))return toast("分类已存在","warn");DB.data.boards.push(v),DB.save(),mask.querySelector("#bd-add").value="",render()}),mask.querySelector("#bd-done").addEventListener("click",()=>{mask.querySelectorAll(".bd-name").forEach(inp=>{const i=parseInt(inp.dataset.i),old=DB.data.boards[i],nv=inp.value.trim();old&&nv&&nv!==old&&(DB.data.boards[i]=nv,DB.data.posts.forEach(p=>{p.board===old&&(p.board=nv)}))}),DB.save(),mask.remove(),router(),toast("分类已更新","ok")})}function viewFriends(){if(!DB.user)return viewGate();const me=DB.user,friends=DB.data.users.filter(u=>me.friends.includes(u.id)),others=DB.data.users.filter(u=>u.id!==me.id&&!me.friends.includes(u.id)),c=`<div class="p-panel">
    <h2>我的好友</h2><div class="ph-sub">本机注册的用户都可以加为好友并访问其空间</div>
    ${friends.map(f=>`<div class="friend-card">
      <span class="av">${f.avatar&&f.avatar.startsWith("data")?`<img src="${esc(f.avatar)}" style="width:100%;height:100%;object-fit:cover">`:esc(avText(f.name))}</span>
      <div><h4>${esc(f.name)}</h4><p>${esc(f.bio||"").slice(0,30)}</p></div>
      <div class="fc-actions"><a class="btn btn-sm btn-ghost" href="#/space/${f.id}">访问空间</a><button class="btn btn-sm" data-rm="${f.id}">删除</button></div>
    </div>`).join("")||'<div class="empty">还没有好友，从下面添加吧</div>'}
    <h3 style="font-size:15px;margin:22px 0 10px">添加好友</h3>
    ${others.length?`<div class="search-row"><select class="field" id="fr-sel" style="flex:1">
      ${others.map(f=>`<option value="${f.id}">${esc(f.name)}（${esc(f.bio||"").slice(0,16)}）</option>`).join("")}
    </select><button class="btn btn-sm btn-orange" id="fr-add">+ 添加</button></div>`:'<div class="ph-sub">没有可添加的用户了</div>'}
  </div>`;return portalShell("friends",c)}function viewSettings(){if(!DB.user)return viewGate();const size=Math.round(new Blob([localStorage.getItem(DB_KEY)||""]).size/1024),c=`<div class="p-panel">
    <h2>数据中心</h2><div class="ph-sub">纯本地独立数据：所有内容仅保存在你当前浏览器中</div>
    <h3 style="font-size:15px;margin:16px 0 8px">身份 / 权限</h3>
    <div style="font-size:14px;margin-bottom:10px">当前身份：<span class="lvl-badge lvl-${DB.user.level}">${lvlName(DB.user.level)}</span></div>
    <div class="search-row"><input class="field" id="set-code" style="flex:1" placeholder="输入身份激活码">
      <button class="btn btn-sm" id="set-act">激活</button></div>
    <p class="ph-sub" style="font-size:12.5px;margin-top:6px">员工 NDT-EMP · 管理员 NDT-MGR · 恢复普通异人 NDT-USER</p>
    <h3 style="font-size:15px;margin:22px 0 8px">声音</h3>
    <label class="wx-cfg-check" style="font-size:14px;display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="set-sound" ${DB.data.settings&&DB.data.settings.soundOn===!1?"":"checked"}> 收发消息音效（Web Audio 合成，无外部文件）</label>
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
      ${[["post","发帖",1],["reply","回帖",1],["like","点赞",1],["gamePerLine","游戏每消一行",1],["gameCap","游戏单局上限",1]].map(([k,label])=>`
        <div class="prg-row"><span>${label}</span><input type="number" min="0" id="prg-${k}" class="field" value="${Number(pointsRule()[k])||0}"></div>`).join("")}
    </div>
    <h3 style="font-size:14px;margin:20px 0 8px">等级名称与升级积分（累计）</h3>
    <div class="level-cfg-list">
      ${forumLevels().map((lv,i)=>`
        <div class="lcfg-row"><span class="lcfg-no">${i+1} 级</span>
          <input class="field lcfg-name" data-lcfg-name="${i}" maxlength="10" value="${esc(lv.name)}" placeholder="等级名">
          <input type="number" min="0" class="field lcfg-min" data-lcfg-min="${i}" value="${Number(lv.min)||0}"></div>`).join("")}
    </div>
    <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-orange" id="lv-cfg-save">保存等级配置</button>
      <button class="btn btn-ghost btn-sm" id="lv-cfg-reset">恢复默认等级</button>
    </div>
  </div>`;return portalShell("settings",c)}function roomsOf(){return Array.isArray(DB.data.rooms)||(DB.data.rooms=[makeRoom("聊天室1")]),DB.data.rooms}function roomById(id){const rooms=roomsOf();return rooms.find(r=>r.id===id)||rooms[0]}function roomOf(){return roomsOf()[0]}function avatarHtml32(u){return u&&u.avatar&&(u.avatar.startsWith("data")||u.avatar.startsWith("http"))?`<img src="${esc(u.avatar)}" style="width:100%;height:100%;object-fit:cover">`:esc(avText(u?u.name:"?"))}function ctxData(kind,key,id){return JSON.stringify({kind,key,id}).replace(/"/g,"&quot;")}function voiceBars(len){let h="";const n=Math.min(16,Math.max(6,Math.round(len*1.2)));for(let i=0;i<n;i++){const hh=5+Math.round(14*Math.abs(Math.sin(i*1.7)));h+=`<i style="height:${hh}px"></i>`}return h}function voiceInner(m){return`<span class="voice-wrap">
    <span class="voice-play">${ic("play",14)}</span>
    <span class="voice-bars">${voiceBars(m.len||1)}</span>
    <span class="voice-len">${m.len||1}″</span></span>
    ${m.text?`<span class="voice-txt">${esc(m.text)}</span>`:""}`}function quoteInner(q){return q?`<span class="quote-box"><b>${esc(q.name)}：</b>${esc((q.text||"").slice(0,40))}</span>`:""}function bubbleContent(m){if(m.type==="redpacket"||m.type==="transfer")return moneyBubbleHtml(m);const q=m.quote?quoteInner(m.quote):"",ph=m.photo?`<img class="msg-photo" src="${esc(m.photo)}" alt="照片">`:"",body=m.type==="voice"?voiceInner(m):m.text?`<span>${esc(m.text)}</span>`:"";return q+ph+body}function formatChatTimestamp(at){const raw=String(at||"").trim(),d=new Date(raw.replace(" ","T"));if(!raw)return"时间未记录";if(Number.isNaN(d.getTime()))return raw;const pad=n=>String(n).padStart(2,"0"),today=new Date,hhmm=`${pad(d.getHours())}:${pad(d.getMinutes())}`;return d.getFullYear()===today.getFullYear()&&d.getMonth()===today.getMonth()&&d.getDate()===today.getDate()?hhmm:`${pad(d.getMonth()+1)}月${pad(d.getDate())}日 ${hhmm}`}function chatTimestampHtml(m,kind,key,previous){const current=new Date(String(m.at||"").replace(" ","T")).getTime(),prev=previous?new Date(String(previous.at||"").replace(" ","T")).getTime():NaN;return!previous||!Number.isFinite(current)||!Number.isFinite(prev)||current-prev>=5*60*1e3||new Date(current).toDateString()!==new Date(prev).toDateString()?`<div class="chat-time-row"><button class="chat-time-node" type="button" data-timeedit="${ctxData(kind,key,m.id)}" title="修改这条时间节点">${esc(formatChatTimestamp(m.at))}</button></div>`:""}function messageIsMoney(m){return m.type==="redpacket"||m.type==="transfer"}function moneyNoticeHtml(m,kind,key){var _a,_b;const mine=kind==="chat"?m.side==="me":m.uid===DB.user.id,recipientName=kind==="chat"?((_a=userOfId(key))==null?void 0:_a.name)||"对方":((_b=userOfId(m.receivedBy))==null?void 0:_b.name)||"群成员";if(m.type==="redpacket"&&m.opened)return`<div class="chat-system-row"><span class="money-notice">${mine?esc(recipientName)+"领取了红包":"你领取了红包"} · ¥${fmtMoney(m.amount)}</span></div>`;if(m.type==="transfer"){if(m.returned)return`<div class="chat-system-row"><span class="money-notice">${mine?esc(recipientName)+"已退还转账":"你已退还转账"} · ¥${fmtMoney(m.amount)}</span></div>`;if(m.received)return`<div class="chat-system-row"><span class="money-notice">${mine?esc(recipientName)+"已收款":"你已收款"} · ¥${fmtMoney(m.amount)}</span></div>`}return""}function quoteBarHtml(){const q=window._quote;return q?`<div class="quote-bar">引用 <b>${esc(q.name)}</b>：${esc((q.text||"").slice(0,30))}<span class="qx" id="quote-cancel">×</span></div>`:""}function locateMsg(data){if(data.kind==="room"){const room=roomsOf().find(r=>r.id===data.key),arr=room&&Array.isArray(room.messages)?room.messages:[];return{arr,m:arr.find(x=>x.id===data.id)||null}}if(data.kind==="workgroup"){const wg=workgroupOf();return{arr:wg.messages,m:wg.messages.find(x=>x.id===data.id)}}const ch=DB.data.chats[data.key];return{arr:ch?ch.messages:[],m:ch?ch.messages.find(x=>x.id===data.id):null}}function editMessageTime(data){const{m}=locateMsg(data);if(!m)return;const localValue=String(m.at||nowStr()).replace(" ","T").slice(0,16),mask=openMask(`<h3>修改时间节点</h3><div class="m-body">
    <p class="ph-sub" style="margin-top:0">调整后，聊天记录会按新的时间显示。</p>
    <label class="fl">日期与时间</label>
    <input class="field" id="edit-msg-time" type="datetime-local" value="${esc(localValue)}" required>
    <div class="m-foot" style="padding-left:0;padding-right:0;padding-bottom:0">
      <button type="button" class="btn btn-sm btn-ghost" id="edit-time-cancel" style="margin-left:auto">取消</button>
      <button type="button" class="btn btn-sm" id="edit-time-save">保存时间</button>
    </div>
  </div>`);mask.querySelector("#edit-time-cancel").addEventListener("click",()=>mask.remove()),mask.querySelector("#edit-time-save").addEventListener("click",()=>{const value=mask.querySelector("#edit-msg-time").value;if(!value){toast("请选择日期和时间","warn");return}m.at=value.replace("T"," "),DB.save(),mask.remove(),router()})}function targetIsOpen(target){const{seg}=parseHash();return target.kind==="chat"?seg[0]==="chat"&&seg[1]===target.key:target.kind==="room"?seg[0]==="room"&&activeRoom().id===target.roomId:target.kind==="workgroup"?seg[0]==="workgroup":!1}function conversationBox(kind,key){return kind==="chat"?chatOf(key):kind==="room"?roomById(key):kind==="workgroup"?workgroupOf():null}function chatTargetFromPrefix(prefix){if(prefix==="ch"){const{seg}=parseHash();return{kind:"chat",key:seg[1],side:"them"}}return prefix==="rm"?{kind:"room",roomId:activeRoom()&&activeRoom().id}:{kind:"workgroup"}}function chatInputRow(prefix,opts={}){const withVoice=opts.voice!==!1,taId=prefix+"-text",sendId=prefix+"-send",photoId=prefix+"-photo-file",camId=prefix+"-camera-file",recBtn=prefix==="ch"?"chat:"+(opts.uid||""):prefix==="rm"?"room":"workgroup",emojiGrid=STICKERS.map(s=>`<button type="button" data-emoji-insert="${s}">${s}</button>`).join("");return`<div class="chat-input-row" data-prefix="${prefix}">
    <div class="chat-input-panels">
      <div class="emoji-panel hide" id="${prefix}-emoji-panel">
        <div class="ep-grid">${emojiGrid}</div>
        <button type="button" class="ep-back" data-emoji-backspace title="删除">${ic("backspace",18)}</button>
      </div>
      <div class="plus-panel hide" id="${prefix}-plus-panel">
        <button type="button" class="plus-item" data-plus-act="redpacket"><span class="pi-ic">${ic("redpacket",23)}</span><small>红包</small></button>
        <button type="button" class="plus-item" data-plus-act="transfer"><span class="pi-ic">${ic("card",23)}</span><small>转账</small></button>
        <label class="plus-item"><span class="pi-ic">${ic("image",23)}</span><small>图片</small><input type="file" id="${photoId}" accept="image/*" class="hide"></label>
        <button type="button" class="plus-item" data-plus-act="emoji"><span class="pi-ic">${ic("smile",23)}</span><small>表情</small></button>
        ${withVoice?`<button type="button" class="plus-item" data-plus-act="voice"><span class="pi-ic">${ic("mic",23)}</span><small>语音</small></button>`:'<span class="plus-item is-placeholder"></span>'}
        <label class="plus-item"><span class="pi-ic">${ic("camera",23)}</span><small>拍照</small><input type="file" id="${camId}" accept="image/*" capture="environment" class="hide"></label>
      </div>
    </div>
    <div class="chat-input-line">
      ${withVoice?`<button class="ci-ib" id="${prefix}-voice-toggle" type="button" title="语音输入" aria-label="语音输入">
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="18" x2="12" y2="22"/></svg>
      </button>`:""}
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
  </div>`}function closeChatPanels(prefix){const row=prefix?document.querySelector(`.chat-input-row[data-prefix="${prefix}"]`):document.querySelector(".chat-input-row");row&&(row.querySelectorAll(".emoji-panel,.plus-panel").forEach(p=>p.classList.add("hide")),row.classList.remove("plus-open","emoji-open"))}function toggleChatPanel(prefix,which){const row=document.querySelector(`.chat-input-row[data-prefix="${prefix}"]`);if(!row)return;const panel=row.querySelector("."+which+"-panel");if(!panel)return;const willOpen=panel.classList.contains("hide");closeChatPanels(prefix),willOpen&&(panel.classList.remove("hide"),row.classList.add(which==="plus"?"plus-open":"emoji-open"))}function syncChatSendState(prefix){const row=document.querySelector(`.chat-input-row[data-prefix="${prefix}"]`);if(!row)return;const ta=row.querySelector("textarea"),has=ta&&ta.value.trim().length>0;row.classList.toggle("has-text",!!has)}function markConversationSeen(kind,key){const box=conversationBox(kind,key);box&&(Number(box.unread)||0)!==0&&(box.unread=0,DB.save())}const SITE_BASE_TITLE="哪都通快递 — 您的包裹，无处不达";let _titleTimer=null,_titleAlt=!1;function syncDocumentTitle(){const n=unreadCount("messages")+unreadCount("room")+unreadCount("workgroup");if(_titleTimer&&(clearInterval(_titleTimer),_titleTimer=null),!document.hidden&&n===0){document.title=SITE_BASE_TITLE;return}if(!document.hidden){document.title=n?"("+n+") "+SITE_BASE_TITLE:SITE_BASE_TITLE;return}_titleAlt=!1,document.title=n?"【"+n+"条新消息】"+SITE_BASE_TITLE:SITE_BASE_TITLE,_titleTimer=setInterval(()=>{_titleAlt=!_titleAlt,document.title=_titleAlt?SITE_BASE_TITLE:n?"【"+n+"条新消息】":SITE_BASE_TITLE},1400)}document.addEventListener("visibilitychange",()=>{document.hidden||syncDocumentTitle()});function markIncomingMessage(target,m){var _a;const box=targetBox(target);if(targetIsOpen(target)?box.unread=0:box.unread=Math.max(0,Number(box.unread)||0)+1,playRecvSound(),DB.save(),document.hidden&&"Notification"in window&&Notification.permission==="granted"){const title=target.kind==="chat"?((_a=userOfId(target.key))==null?void 0:_a.name)||"新私信":"新的群组消息",preview=String((m==null?void 0:m.text)||((m==null?void 0:m.type)==="redpacket"?"发来一个红包":(m==null?void 0:m.type)==="transfer"?"发来一笔转账":"收到新消息")).slice(0,100),dest=target.kind==="chat"?"#/chat/"+target.key:target.kind==="room"?"#/room":"#/workgroup";showSiteNotification(title,preview,dest,"ndt-"+target.kind+"-"+(target.key||target.roomId||"wg"))}syncDocumentTitle(),setTimeout(()=>{var _a2;syncUnreadBadges();const{seg}=parseHash();if(seg[0]==="messages"){const item=$(`.chat-list-item[data-chat="${target.kind==="chat"?target.key:""}"]`);if(item&&target.kind==="chat"){const right=item.querySelector(".chat-contact-right");right&&(right.innerHTML=unreadBadge((_a2=targetBox(target))==null?void 0:_a2.unread,"chat-unread-badge"))}}},0)}function messageReceiptHtml(){return""}function viewRoom(idx){const me=DB.user,rooms=roomsOf();let i=Math.max(0,Math.min(rooms.length-1,idx||0));const room=rooms[i];markConversationSeen("room",room.id);const userOf=id=>DB.data.users.find(u=>u.id===id)||{id,name:"未知",avatar:""},isCard=room.mode==="card",roomPageKey="room:"+room.id,roomTotalPages=Math.max(1,Math.ceil(room.messages.length/CHAT_PAGE_SIZE)),roomPage=Math.max(0,Math.min(roomTotalPages-1,Number(CHAT_PAGE_STATE[roomPageKey]||0)));CHAT_PAGE_STATE[roomPageKey]=roomPage;const roomEnd=room.messages.length-roomPage*CHAT_PAGE_SIZE,roomStart=Math.max(0,roomEnd-CHAT_PAGE_SIZE),roomPageMessages=room.messages.slice(roomStart,roomEnd),c=`<div class="room-tabs-bar">${rooms.map((r,k)=>`<button class="room-tab ${k===i?"on":""}" data-room-tab="${k}">${esc(r.name)}${unreadBadge(r.unread,"room-unread-badge")}</button>`).join("")+(rooms.length<3?'<button class="room-tab add" id="room-add" title="新建聊天室">＋ 新建</button>':"")}</div>
  <div class="p-panel chat-window">
    <div class="chat-head">
      <span class="av" style="background:var(--orange)">${ic("users",20)}</span>
      <div><h3>${esc(room.name)}</h3><div class="ch-hint">${room.members.length} 位成员 · 群内消息均可修改</div></div>
      <div class="ch-actions">
        <span class="pop-wrap"><button class="btn btn-sm btn-orange" id="rm-speak">${ic("megaphone",15)} TA 发言</button></span>
        <button class="btn btn-sm btn-icon" id="chat-search-toggle" data-kind="room" data-target="${esc(room.id)}" title="查找聊天记录" aria-label="查找聊天记录">${ic("search",16)}</button>
        <button class="btn btn-sm btn-icon" id="rm-members" title="成员管理" aria-label="成员管理">${ic("members",17)}</button>
        <button class="btn btn-sm btn-icon" id="rm-rename" title="改名" aria-label="改名">${ic("edit",17)}</button>
        <button class="btn btn-sm btn-icon btn-danger-ic" data-clear-room="${esc(room.id)}" title="只清除此聊天室的消息" aria-label="清除此窗口">${ic("trash",17)}</button>
        <button class="btn btn-sm btn-icon" id="rm-cfg-open" title="聊天室设置" aria-label="聊天室设置">${ic("settings",17)}</button>
      </div>
    </div>
    <div class="chat-scroll" id="ch-scroll">
      ${roomPageMessages.map((m,mi)=>{const u=userOf(m.uid),mine=m.uid===me.id,timeNode=chatTimestampHtml(m,"room",room.id,room.messages[mi-1]);if(m.recalled)return`${timeNode}<div class="msg recalled"><span class="recall-txt">${esc(u.name)} 撤回了一条消息</span></div>`;const avAttr=mine?"":`data-room-av="${m.uid}" title="点 TA 头像，TA 发言一条"`,money=messageIsMoney(m),content=money?`<span class="msg-attachment" data-msgctx="${ctxData("room",room.id,m.id)}">${bubbleContent(m)}</span>`:`<span class="bubble ${m.photo?"has-photo":""}" data-msgctx="${ctxData("room",room.id,m.id)}">${bubbleContent(m)}</span>`;return`${timeNode}<div class="msg ${mine?"me":"them"} ${money?"money-msg":""}">
          <span class="m-av" ${avAttr}>${avatarHtml32(u)}</span>
          <span class="msg-content-stack">
            ${mine?"":`<span class="m-name">${esc(u.name)}</span>`}
            ${content}
            ${messageReceiptHtml(m,mine)}
          </span>
        </div>${money?moneyNoticeHtml(m,"room",room.id):""}`}).join("")||'<div class="empty">聊天室还没有消息。点“TA 发言”让成员说话，或在下方打字。</div>'}
    </div>
    ${roomTotalPages>1?`<div class="chat-pagination">
      <button class="btn btn-sm btn-ghost" data-room-page="older" data-room-id="${esc(room.id)}" ${roomPage>=roomTotalPages-1?"disabled":""}>更早消息</button>
      <span>第 ${roomPage+1}/${roomTotalPages} 页 · 共 ${room.messages.length} 条</span>
      <button class="btn btn-sm btn-ghost" data-room-page="newer" data-room-id="${esc(room.id)}" ${roomPage<=0?"disabled":""}>更新消息</button>
    </div>`:""}
    ${quoteBarHtml()}
    ${chatInputRow("rm",{voice:!0})}
  </div>`;return window._roomId=room.id,setTimeout(()=>maybeProactive({kind:"room",roomId:room.id}),0),portalShell("room",c)}function chatOf(uid){return DB.data.chats[uid]||(DB.data.chats[uid]={messages:[]}),DB.data.chats[uid]}function wxEntries(){return Object.keys(DB.data.chats||{}).map(k=>{const u=DB.data.users.find(x=>x.id===k),ch=DB.data.chats[k],history=Array.isArray(ch==null?void 0:ch.messages)?ch.messages:[];return{u,ch,history,last:history.length?history[history.length-1]:null}}).filter(x=>x.u&&x.history.length>0&&(!DB.user||String(x.u.id)!==String(DB.user.id))).sort((a,b)=>{var _a,_b;return+!!b.ch.pinned-+!!a.ch.pinned||String(((_a=b.last)==null?void 0:_a.at)||"").localeCompare(String(((_b=a.last)==null?void 0:_b.at)||""))})}function wxListTime(at){const d=new Date(String(at||"").replace(" ","T"));if(Number.isNaN(d.getTime()))return"";const pad=n=>String(n).padStart(2,"0"),sameDay=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(),today=new Date,yest=new Date;if(yest.setDate(yest.getDate()-1),sameDay(d,today))return pad(d.getHours())+":"+pad(d.getMinutes());if(sameDay(d,yest))return"昨天";const todayMid=new Date(today);todayMid.setHours(0,0,0,0);const dMid=new Date(d);dMid.setHours(0,0,0,0);const diffDays=Math.round((todayMid-dMid)/864e5);return diffDays>=0&&diffDays<7?["周日","周一","周二","周三","周四","周五","周六"][d.getDay()]:d.getFullYear()===today.getFullYear()?d.getMonth()+1+"/"+d.getDate():d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate()}function wxPreview(last){return last?last.type==="redpacket"?"[红包]":last.type==="transfer"?"[转账]":last.type==="voice"?"[语音]":last.type==="photo"?"[图片]":last.text||"":""}function wxAsideHtml(activeUid){const me=DB.user,entries=wxEntries();return`<div class="wx-aside">
    <div class="wx-aside-head">
      <h2>私信</h2>
      <span class="wx-spacer">
        <button class="wx-icon-btn" id="wx-new-toggle" type="button" title="发起新聊天" aria-label="发起新聊天">${ic("plus",17)}</button>
        <button class="wx-icon-btn" id="msg-hint" type="button" title="使用说明" aria-label="使用说明">${ic("help",16)}</button>
      </span>
    </div>
    <div class="wx-search"><input id="wx-search" type="search" placeholder="搜索联系人" autocomplete="off"></div>
    <div class="wx-new-row" id="wx-new-row" style="display:none">
      <select id="msg-new" aria-label="选择用户发起聊天">
        <option value="">— 选择用户 —</option>
        ${DB.data.users.filter(u=>u.id!==me.id).map(u=>`<option value="${u.id}">${esc(u.name)}（${lvlName(u.level)}）</option>`).join("")}
      </select>
      <button class="btn btn-sm btn-orange" id="msg-open" type="button">打开</button>
    </div>
    <div class="wx-list">
      ${entries.length?entries.map(({u,ch,last})=>`<div class="wx-item ${u.id===activeUid?"is-active":""} ${ch.pinned?"is-pinned":""}" data-chat="${u.id}" data-name="${esc(u.name)}">
        <span class="wx-av">${avatarHtml32(u)}${unreadBadge(ch.unread,"chat-unread-badge")}</span>
        <span class="wx-copy"><h4>${esc(u.name)}</h4><p>${esc(wxPreview(last))}</p></span>
        <span class="wx-meta"><time>${esc(wxListTime(last.at))}</time><button class="wx-pin-btn ${ch.pinned?"is-on":""}" type="button" data-chat-pin="${u.id}" title="${ch.pinned?"取消置顶":"置顶联系人"}" aria-label="${ch.pinned?"取消置顶":"置顶联系人"}">${ic("star",14)}</button></span>
      </div>`).join(""):'<div class="empty"><div class="es is-ic">'+ic("message",34)+"</div>还没有聊天记录<br>点右上角 ＋ 发起一个吧</div>"}
    </div>
  </div>`}function wxEmptyHtml(icon,txt){return`<div class="wx-main"><div class="wx-empty"><div class="wx-empty-ic">${ic(icon,40)}</div><p>${esc(txt)}</p></div></div>`}function viewMessages(){const c=`<div class="wx-im wx-on-list">
    ${wxAsideHtml("")}
    ${wxEmptyHtml("message","选择一个会话开始聊天")}
  </div>`;return portalShell("messages",c)}const CHAT_PAGE_SIZE=50,CHAT_PAGE_STATE=window.__ndtChatPages||(window.__ndtChatPages={});function viewChat(uid){const me=DB.user;if(me&&String(uid)===String(me.id)){DB.data&&DB.data.chats&&DB.data.chats[me.id]&&(delete DB.data.chats[me.id],DB.save());try{localStorage.removeItem("ndt-last-chat-uid"),sessionStorage.removeItem("ndt-last-chat-uid")}catch(e){}toast("不能给自己发私信","warn");const c2=`<div class="wx-im wx-on-list">${wxAsideHtml("")}${wxEmptyHtml("ban","不能给自己发私信")}</div>`;return portalShell("messages",c2)}try{uid&&(localStorage.setItem("ndt-last-chat-uid",String(uid)),sessionStorage.setItem("ndt-last-chat-uid",String(uid)))}catch(e){try{sessionStorage.setItem("ndt-last-chat-uid",String(uid))}catch(e2){}}const fu=DB.data.users.find(u=>u.id===uid);if(!fu){const c2=`<div class="wx-im wx-on-list">${wxAsideHtml("")}${wxEmptyHtml("alert","用户不存在")}</div>`;return portalShell("messages",c2)}const ch=chatOf(uid);markConversationSeen("chat",uid);const totalPages=Math.max(1,Math.ceil(ch.messages.length/CHAT_PAGE_SIZE)),page=Math.max(0,Math.min(totalPages-1,Number(CHAT_PAGE_STATE[uid]||0)));CHAT_PAGE_STATE[uid]=page;const end=ch.messages.length-page*CHAT_PAGE_SIZE,start=Math.max(0,end-CHAT_PAGE_SIZE),pageMessages=ch.messages.slice(start,end),c=`<div class="wx-im wx-on-chat">
    ${wxAsideHtml(uid)}
    <div class="wx-main">
      <div class="wx-head">
        <a class="wx-back" id="wx-back" href="javascript:void(0)" aria-label="返回会话列表">${ic("back",18)}</a>
        <h3>${esc(fu.name)}</h3>
        <span style="margin-left:auto;display:flex;gap:2px">
          <button class="wx-more" id="chat-search-toggle" data-kind="chat" data-target="${esc(uid)}" type="button" title="查找聊天记录" aria-label="查找聊天记录">${ic("search",17)}</button>
          <button class="wx-more" id="wx-more" type="button" title="聊天设置" aria-label="聊天设置">${ic("more",18)}</button>
        </span>
      </div>
      <div class="wx-scroll" id="ch-scroll">
        ${pageMessages.map((m,mi)=>{const mine=m.side==="me",timeNode=chatTimestampHtml(m,"chat",uid,ch.messages[mi-1]);if(m.recalled)return`${timeNode}<div class="msg recalled"><span class="recall-txt">${mine?"你":esc(fu.name)}撤回了一条消息</span></div>`;const av=mine?`<span class="m-av">${avatarHtml32(me)}</span>`:`<span class="m-av" data-them-av="1" title="点 TA 头像，TA 回复一条">${avatarHtml32(fu)}</span>`,money=messageIsMoney(m),content=money?`<span class="msg-attachment" data-msgctx="${ctxData("chat",uid,m.id)}">${bubbleContent(m)}</span>`:`<span class="bubble ${m.photo?"has-photo":""}" data-msgctx="${ctxData("chat",uid,m.id)}">${bubbleContent(m)}</span>`;return`${timeNode}<div class="msg ${mine?"me":"them"} ${money?"money-msg":""}">
            ${av}<span class="msg-content-stack">${content}${messageReceiptHtml(m,mine)}</span>
          </div>${money?moneyNoticeHtml(m,"chat",uid):""}`}).join("")||'<div class="empty">还没有消息。先发一条，再点右上角“···”让 TA 回复吧。</div>'}
      </div>
      ${totalPages>1?`<div class="wx-page-bar">
        <button class="btn btn-sm btn-ghost" type="button" data-chat-page="older" data-chat-uid="${esc(uid)}" ${page>=totalPages-1?"disabled":""}>${ic("back",14)} 更早</button>
        <span>第 ${page+1}/${totalPages} 页 · 共 ${ch.messages.length} 条</span>
        <button class="btn btn-sm btn-ghost" type="button" data-chat-page="newer" data-chat-uid="${esc(uid)}" ${page<=0?"disabled":""}>最新 <span style="display:inline-flex;transform:scaleX(-1)">${ic("back",14)}</span></button>
      </div>`:""}
      <div class="wx-input-wrap">
        ${quoteBarHtml()}
        ${chatInputRow("ch",{voice:!0,uid})}
      </div>
    </div>
  </div>`;return setTimeout(()=>maybeProactive({kind:"chat",key:uid,side:"them"}),0),portalShell("messages",c)}function closeWxCfg(){const o=document.getElementById("wx-cfg-overlay");o&&o.remove();const p=document.getElementById("ch-cfg");p&&p.remove()}function closeChatSearch(){const o=document.getElementById("chat-search-overlay");o&&o.remove()}function chatSearchSource(kind,target){var _a,_b,_c;if(kind==="chat"){const ch=chatOf(target),u=DB.data.users.find(x=>x.id===target);return{messages:ch.messages||[],pageKey:String(target),selfName:((_a=DB.user)==null?void 0:_a.name)||"我",otherName:(u==null?void 0:u.name)||"对方"}}if(kind==="room"){const rooms=roomsOf(),room=rooms.find(r=>String(r.id)===String(target))||rooms[0];return{messages:room.messages||[],pageKey:"room:"+room.id,selfName:((_b=DB.user)==null?void 0:_b.name)||"我",otherName:room.name||"聊天室"}}return kind==="workgroup"?{messages:workgroupOf().messages||[],pageKey:"wg",selfName:((_c=DB.user)==null?void 0:_c.name)||"我",otherName:"工作组"}:{messages:[],pageKey:"",selfName:"我",otherName:""}}function openChatSearch(kind,target){closeChatSearch();const src=chatSearchSource(kind,target),host=document.querySelector(".chat-window")||document.querySelector(".wx-main");if(!host)return;getComputedStyle(host).position==="static"&&(host.style.position="relative");const bar=document.createElement("div");bar.id="chat-search-overlay",bar.innerHTML=`<div class="cs-bar">
      <input id="cs-input" type="search" placeholder="查找聊天记录..." autocomplete="off">
      <button class="btn btn-sm btn-ghost" id="cs-close" type="button">关闭</button>
    </div>
    <div id="cs-results" class="cs-results"></div>`,host.appendChild(bar);const input=bar.querySelector("#cs-input"),results=bar.querySelector("#cs-results");input.focus();const getName=uid=>{var _a;return((_a=DB.data.users.find(u=>u.id===uid))==null?void 0:_a.name)||"?"},render=()=>{const q=input.value.trim().toLowerCase();if(!q){results.innerHTML='<div class="cs-empty">输入关键词搜索当前会话全部消息</div>';return}const hits=src.messages.filter(m=>!m.recalled&&m.text&&String(m.text).toLowerCase().includes(q)).slice(-80).reverse();if(!hits.length){results.innerHTML='<div class="cs-empty">没有匹配的消息</div>';return}results.innerHTML=`<div class="cs-head">找到 ${hits.length} 条</div>`+hits.map(m=>{const sender=m.uid?getName(m.uid):m.side==="me"?src.selfName:src.otherName;return`<div class="cs-hit" data-msgid="${esc(m.id)}">
        <div class="cs-from">${esc(sender)}<time>${esc(relTime(m.at))}</time></div>
        <div class="cs-text">${esc(String(m.text).slice(0,140))}</div>
      </div>`}).join("")};render(),input.addEventListener("input",render),bar.querySelector("#cs-close").addEventListener("click",closeChatSearch),results.addEventListener("click",e=>{const hit=e.target.closest(".cs-hit");if(!hit)return;const mid=hit.dataset.msgid,idx=src.messages.findIndex(m=>m.id===mid);if(idx>=0){const fromEnd=src.messages.length-1-idx;CHAT_PAGE_STATE[src.pageKey]=Math.floor(fromEnd/CHAT_PAGE_SIZE)}closeChatSearch(),renderBody(),setTimeout(()=>{const el=document.querySelector(`[data-msgctx*="${mid}"]`);el&&(el.scrollIntoView({block:"center",behavior:"smooth"}),el.classList.add("cs-flash"),setTimeout(()=>el.classList.remove("cs-flash"),1800))},80)})}function openWxCfg(uid){closeWxCfg();const ch=chatOf(uid),overlay=document.createElement("div");overlay.className="wx-cfg-overlay",overlay.id="wx-cfg-overlay";const panel=document.createElement("div");panel.className="wx-cfg-panel card-cfg",panel.id="ch-cfg",panel.innerHTML=`
    <div class="wx-cfg-head"><h3>聊天设置</h3><button class="wx-cfg-close" id="wx-cfg-close" type="button" aria-label="关闭">×</button></div>
    <div class="wx-cfg-body">
      <div class="wx-cfg-section">
        <span class="wx-cfg-label">回复模式</span>
        <span class="mode-switch">
          <button type="button" data-mode="create" class="${ch.mode==="card"?"":"on"}">创作模式</button>
          <button type="button" data-mode="card" class="${ch.mode==="card"?"on":""}">字卡模式</button>
        </span>
      </div>
      <div class="wx-cfg-section card-only" style="display:${ch.mode==="card"?"inline-flex":"none"}">
        <span class="wx-cfg-label">字卡设置</span>
        <div class="wx-cfg-row"><select id="ch-speed" title="回复速度">
          <option value="instant" ${ch.speed==="instant"?"selected":""}>秒回（8秒内）</option>
          <option value="natural" ${ch.speed==="natural"?"selected":""}>自然（60秒内）</option>
          <option value="deep" ${ch.speed==="deep"?"selected":""}>深思（3分钟内）</option>
        </select></div>
        <label class="wx-cfg-check"><input type="checkbox" id="ch-proactive" ${ch.proactive===!1?"":"checked"}> 主动行为</label>
        <div class="wx-cfg-row"><select id="ch-activity" title="主动消息频率">
          <option value="active" ${ch.proactiveActivity==="active"?"selected":""}>活跃（约1分钟一条）</option>
          <option value="normal" ${(ch.proactiveActivity||"normal")==="normal"?"selected":""}>正常（约3分钟一条）</option>
          <option value="quiet" ${ch.proactiveActivity==="quiet"?"selected":""}>安静（约10分钟一条）</option>
          <option value="custom" ${ch.proactiveActivity==="custom"?"selected":""}>自定义</option>
        </select>
        <input id="ch-activity-sec" type="number" min="30" max="3600" step="10" value="${ch.proactiveInterval||120}" title="平均秒数" style="display:${ch.proactiveActivity==="custom"?"inline-block":"none"}"></div>
        <label class="wx-cfg-check"><input type="checkbox" id="ch-read-no-reply" ${ch.readNoReply?"checked":""}> 已读不回</label>
      </div>
      <div class="wx-cfg-actions">
        <button class="btn btn-sm" id="ch-cards" type="button">字卡管理</button>
        <button class="btn btn-sm btn-ghost" id="ch-add-them" type="button">${ic("plus",14)} TA 回复一条</button>
        <button class="btn btn-sm btn-danger-soft" type="button" data-clear-chat="${esc(uid)}">${ic("trash",14)} 清除此窗口</button>
        <button class="btn btn-sm btn-ghost" id="ch-hint" type="button">使用说明</button>
      </div>
    </div>`,document.body.appendChild(overlay),(document.querySelector(".portal")||document.body).appendChild(panel),overlay.addEventListener("click",closeWxCfg),panel.querySelector("#wx-cfg-close").addEventListener("click",closeWxCfg)}function closeConvDrawer(){const o=document.getElementById("conv-drawer-overlay");o&&o.remove();const p=document.querySelector(".wx-cfg-panel[data-conv-drawer]");p&&p.remove()}function openConvDrawer({cfgId,title,bodyHtml}){closeConvDrawer();const overlay=document.createElement("div");overlay.className="wx-cfg-overlay",overlay.id="conv-drawer-overlay";const panel=document.createElement("div");return panel.className="wx-cfg-panel card-cfg",panel.id=cfgId,panel.setAttribute("data-conv-drawer","1"),panel.innerHTML=`
    <div class="wx-cfg-head"><h3>${title}</h3><button class="wx-cfg-close" type="button" aria-label="关闭">×</button></div>
    <div class="wx-cfg-body">${bodyHtml}</div>`,document.body.appendChild(overlay),(document.querySelector(".portal")||document.body).appendChild(panel),overlay.addEventListener("click",closeConvDrawer),panel.querySelector(".wx-cfg-close").addEventListener("click",closeConvDrawer),panel}function convModeSwitchHtml(box){const isCard=box.mode==="card";return`<span class="mode-switch">
    <button type="button" data-mode="create" class="${isCard?"":"on"}">创作模式</button>
    <button type="button" data-mode="card" class="${isCard?"on":""}">字卡模式</button>
  </span>`}function convCardSettingsHtml(prefix,box){const isCard=box.mode==="card",speedId=prefix+"-speed",proactiveId=prefix+"-proactive",activityId=prefix+"-activity",activitySecId=prefix+"-activity-sec",readNoReplyId=prefix+"-read-no-reply";return`<div class="wx-cfg-section card-only" style="display:${isCard?"inline-flex":"none"}">
    <span class="wx-cfg-label">字卡设置</span>
    <div class="wx-cfg-row"><select id="${speedId}" title="回复速度">
      <option value="instant" ${box.speed==="instant"?"selected":""}>秒回（8秒内）</option>
      <option value="natural" ${box.speed==="natural"?"selected":""}>自然（60秒内）</option>
      <option value="deep" ${box.speed==="deep"?"selected":""}>深思（3分钟内）</option>
    </select></div>
    <label class="wx-cfg-check"><input type="checkbox" id="${proactiveId}" ${box.proactive===!1?"":"checked"}> 主动行为</label>
    <div class="wx-cfg-row"><select id="${activityId}" title="主动消息频率">
      <option value="active" ${box.proactiveActivity==="active"?"selected":""}>活跃（约1分钟一条）</option>
      <option value="normal" ${(box.proactiveActivity||"normal")==="normal"?"selected":""}>正常（约3分钟一条）</option>
      <option value="quiet" ${box.proactiveActivity==="quiet"?"selected":""}>安静（约10分钟一条）</option>
      <option value="custom" ${box.proactiveActivity==="custom"?"selected":""}>自定义</option>
    </select>
    <input id="${activitySecId}" type="number" min="30" max="3600" step="10" value="${box.proactiveInterval||120}" title="平均秒数" style="display:${box.proactiveActivity==="custom"?"inline-block":"none"}"></div>
    <label class="wx-cfg-check"><input type="checkbox" id="${readNoReplyId}" ${box.readNoReply?"checked":""}> 已读不回</label>
  </div>`}function openRoomCfg(){const room=activeRoom(),body=`
    <div class="wx-cfg-section">
      <span class="wx-cfg-label">回复模式</span>
      ${convModeSwitchHtml(room)}
    </div>
    ${convCardSettingsHtml("rm",room)}
    <div class="wx-cfg-actions">
      <button class="btn btn-sm" id="rm-cards" type="button">字卡管理</button>
    </div>`;openConvDrawer({cfgId:"rm-cfg",title:"聊天室设置",bodyHtml:body})}function openWgCfg(){const wg=workgroupOf(),body=`
    <div class="wx-cfg-section">
      <span class="wx-cfg-label">回复模式</span>
      ${convModeSwitchHtml(wg)}
    </div>
    ${convCardSettingsHtml("wg",wg)}
    <div class="wx-cfg-actions">
      <button class="btn btn-sm" id="wg-cards" type="button">字卡管理</button>
    </div>`;openConvDrawer({cfgId:"wg-cfg",title:"工作组设置",bodyHtml:body})}document.addEventListener("click",e=>{const t=e.target;if(t.closest("#wx-new-toggle")){const r=document.getElementById("wx-new-row");r&&(r.style.display=r.style.display==="none"?"flex":"none");return}if(t.closest("#wx-more")){const seg=parseHash().seg;seg[1]&&openWxCfg(seg[1]);return}if(t.closest("#wx-back")){try{sessionStorage.setItem("ndt-force-list","1")}catch(e2){}location.hash="#/messages";return}}),document.addEventListener("click",e=>{const t=e.target;t.closest("#ch-cfg")&&(t.closest("#ch-cards")||t.closest("#ch-add-them")||t.closest("[data-clear-chat]")||t.closest("#ch-hint"))&&closeWxCfg()},!0),document.addEventListener("input",e=>{if(e.target.id!=="wx-search")return;const q=e.target.value.trim().toLowerCase();document.querySelectorAll(".wx-list .wx-item").forEach(it=>{const name=(it.dataset.name||"").toLowerCase();it.style.display=!q||name.indexOf(q)>=0?"":"none"})}),document.addEventListener("click",e=>{const btn=e.target.closest("#chat-search-toggle");btn&&openChatSearch(btn.dataset.kind,btn.dataset.target)}),window.addEventListener("hashchange",closeChatSearch),window.addEventListener("hashchange",closeWxCfg);function scrollRoom(){setTimeout(()=>{const sc=$("#ch-scroll");sc&&sc.scrollHeight-sc.scrollTop-sc.clientHeight<140&&(sc.scrollTop=sc.scrollHeight)},30)}function activeRoom(){const{seg}=parseHash();if(seg[0]==="room"){const rooms=roomsOf(),idx=seg[1]?parseInt(seg[1],10):0;return rooms[Math.max(0,Math.min(rooms.length-1,idx))]}return roomsOf()[0]}function roomSpeak(room,uid){room||(room=activeRoom()),room.members.includes(uid)||room.members.push(uid);const m={id:genId("m"),uid,type:"text",text:"请输入内容",at:nowStr()};markIncomingMessage({kind:"room",roomId:room.id},m),room.messages.push(m),CHAT_PAGE_STATE["room:"+room.id]=0,DB.save(),router(),scrollRoom()}function themReply(uid){if(DB.user&&String(uid)===String(DB.user.id)){toast("不能给自己发私信","warn");return}const ch=chatOf(uid),m={id:genId("m"),side:"them",type:"text",text:"请输入内容",at:nowStr()};markIncomingMessage({kind:"chat",key:uid},m),ch.messages.push(m),CHAT_PAGE_STATE[uid]=0,DB.save(),router(),scrollRoom()}function toggleVoice(p){const tm=$("#"+p+"-text-mode"),hm=$("#"+p+"-hold-mode");tm.classList.contains("hide")?(tm.classList.remove("hide"),hm.classList.add("hide")):(tm.classList.add("hide"),hm.classList.remove("hide"))}function commitOutgoingMessage(target,msg,options={}){if(!DB.user)return toast("当前账号状态已变化，消息未发送。","warn"),!1;const box=targetBox(target);return!box||!Array.isArray(box.messages)?(toast("目标会话不存在，消息未发送。","warn"),!1):(window._quote&&!msg.quote&&(msg.quote=window._quote,window._quote=null),box.messages.push(msg),target.kind==="chat"?CHAT_PAGE_STATE[target.key]=0:target.kind==="room"?CHAT_PAGE_STATE["room:"+target.roomId]=0:target.kind==="workgroup"&&(CHAT_PAGE_STATE["workgroup:main"]=0),box.proactiveWaiting=!0,playSendSound(),DB.save(),refreshIfActive(target),targetIsOpen(target)&&scrollRoom(),options.autoReply!==!1&&autoReply(target),!0)}function sendRoom(room){const ta=$("#rm-text"),text=ta.value.trim();if(!text){toast("请输入消息内容","warn");return}if(room||(room=activeRoom()),!room||!roomsOf().some(r=>r.id===room.id)){toast("当前聊天室不存在，消息未发送。","warn");return}commitOutgoingMessage({kind:"room",roomId:room.id},{id:genId("m"),uid:DB.user.id,type:"text",text,at:nowStr()}),ta.value=""}function sendChat(uid){const ta=$("#ch-text"),text=ta.value.trim();if(!text){toast("请输入消息内容","warn");return}if(DB.user&&String(uid)===String(DB.user.id)){toast("不能给自己发私信","warn");return}if(!uid||!DB.data.users.some(u=>u.id===uid)){toast("当前私聊对象不存在，消息未发送。","warn");return}commitOutgoingMessage({kind:"chat",key:uid,side:"them"},{id:genId("m"),side:"me",type:"text",text,at:nowStr()}),ta.value=""}function msgSenderName(kind,key,m){if(kind==="room"||kind==="workgroup"){const u=DB.data.users.find(x=>x.id===m.uid);return u?u.name:"?"}return m.side==="me"?DB.user.name:(DB.data.users.find(x=>x.id===key)||{name:"?"}).name}function editMsg(data){const{arr,m}=locateMsg(data);if(!m)return;const isVoice=m.type==="voice",name=msgSenderName(data.kind,data.key,m);modal(`<h3>编辑消息 · ${esc(name)}</h3><div class="m-body">
    ${m.photo?`<img src="${esc(m.photo)}" style="max-width:100%;border-radius:8px;margin-bottom:10px"><label style="display:flex;gap:6px;align-items:center;font-size:13px;color:var(--muted);margin-bottom:10px"><input type="checkbox" id="m-rm-photo"> 删除这张照片</label>`:""}
    ${isVoice?`<label style="font-size:13px;color:var(--muted)">语音时长（秒）</label>
      <input class="field" id="m-len" type="number" min="1" value="${m.len||1}" style="margin-bottom:10px">
      <label style="font-size:13px;color:var(--muted)">语音转文字内容</label>
      <textarea class="field" id="m-msg" style="min-height:80px" placeholder="语音内容">${esc(m.text||"")}</textarea>`:`<textarea class="field" id="m-msg" style="min-height:90px" placeholder="消息内容（可留空）">${esc(m.text||"")}</textarea>`}
  </div>
  <div class="m-foot">
    <button class="btn btn-sm btn-ghost" data-m="del" style="color:#FF9DA0;margin-right:auto">彻底删除</button>
    <button class="btn btn-sm btn-ghost" data-m="no">取消</button>
    <button class="btn btn-sm" data-m="yes">保存</button>
  </div>`).then(v=>{if(v==="del"){const idx=arr.findIndex(x=>x.id===m.id);idx>=0&&arr.splice(idx,1),DB.save(),router(),toast("消息已删除");return}if(v==="yes"){if(isVoice&&(m.len=Math.max(1,parseInt($("#m-len").value,10)||1)),m.text=$("#m-msg").value,m.photo&&$("#m-rm-photo")&&$("#m-rm-photo").checked&&(m.photo=""),!isVoice&&!m.text&&!m.photo){const i=arr.findIndex(x=>x.id===m.id);i>=0&&arr.splice(i,1)}DB.save(),router(),toast("消息已修改","ok")}})}function showMsgMenu(xy,data){closeMsgMenu();const{arr,m}=locateMsg(data);if(!m)return;const menu=document.createElement("div");menu.className="msg-menu",menu.id="msg-menu",menu.innerHTML=`<button data-act="quote">引用</button>
    <button data-act="copy">复制</button>
    <button data-act="time">修改时间</button>
    <button data-act="recall">撤回</button>
    <button data-act="del" class="danger">删除</button>`,document.body.appendChild(menu),window._menuGuard=1;const w=menu.offsetWidth,h=menu.offsetHeight;let x=xy.x,y=xy.y;x+w>innerWidth-8&&(x=innerWidth-w-8),y+h>innerHeight-8&&(y=innerHeight-h-8),menu.style.left=x+"px",menu.style.top=y+"px",menu.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{const act=b.dataset.act;if(closeMsgMenu(),act==="quote"){const name=msgSenderName(data.kind,data.key,m),txt=m.type==="voice"?"[语音] "+(m.text||""):m.text;window._quote={name,text:txt},router(),toast("已引用，回复时将带上")}else if(act==="copy"){const txt=m.type==="voice"?"[语音] "+(m.text||""):m.text||"",done=()=>toast("已复制","ok");navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(txt).then(done).catch(()=>{fallbackCopy(txt),done()}):(fallbackCopy(txt),done())}else if(act==="time")editMessageTime(data);else if(act==="recall")m.recalled=!0,DB.save(),router();else if(act==="del"){const i=arr.findIndex(x2=>x2.id===m.id);i>=0&&arr.splice(i,1),DB.save(),router(),toast("消息已删除")}})),setTimeout(()=>document.addEventListener("click",closeMsgMenuOnce),0),navigator.vibrate&&navigator.vibrate(25)}function closeMsgMenu(){const m=$("#msg-menu");m&&m.remove()}function fallbackCopy(text){const ta=document.createElement("textarea");ta.value=text,ta.style.position="fixed",ta.style.opacity="0",document.body.appendChild(ta),ta.select();try{document.execCommand("copy")}catch(e){}ta.remove()}function closeMsgMenuOnce(e){if(!e.target.closest("#msg-menu")){if(window._menuGuard>0){window._menuGuard--;return}closeMsgMenu(),document.removeEventListener("click",closeMsgMenuOnce)}}let pressTimer=null,pressXY=null,pressData=null;function pressStart(e){const el=e.target.closest("[data-msgctx]");if(!el)return;const pt=e.touches&&e.touches[0]?e.touches[0]:e;pressXY={x:pt.clientX,y:pt.clientY},pressData=JSON.parse(el.dataset.msgctx),window._longPressed=!1,pressTimer=setTimeout(()=>{pressTimer=null,window._longPressed=!0,showMsgMenu(pressXY,pressData)},460)}function pressEnd(){pressTimer&&(clearTimeout(pressTimer),pressTimer=null)}document.addEventListener("touchstart",pressStart,{passive:!0}),document.addEventListener("touchend",pressEnd),document.addEventListener("touchmove",pressEnd,{passive:!0}),document.addEventListener("mousedown",pressStart),document.addEventListener("mouseup",pressEnd),document.addEventListener("mousemove",pressEnd);function roomMembers(room){room||(room=activeRoom());const me=DB.user,others=DB.data.users.filter(u=>u.id!==me.id);others.sort((a,b)=>{const fa=(me.friends||[]).includes(a.id)?0:1,fb=(me.friends||[]).includes(b.id)?0:1;return fa-fb}),modal(`<h3>聊天室成员</h3><div class="m-body">
    <div class="ph-sub">勾选要加入聊天室的用户（好友优先）；取消勾选即移出。</div>
    <label class="mem-row" style="border-bottom:1px solid #2A3A7E;margin-bottom:4px">
      <input type="checkbox" checked disabled>
      <span class="av" style="width:30px;height:30px;font-size:12px">${avatarHtml32(me)}</span>
      <span>${esc(me.name)}（我）</span></label>
    ${others.map(u=>`<label class="mem-row">
      <input type="checkbox" class="mem-ck" value="${u.id}" ${room.members.includes(u.id)?"checked":""}>
      <span class="av" style="width:30px;height:30px;font-size:12px">${avatarHtml32(u)}</span>
      <span>${esc(u.name)} <span style="font-size:12px">（${lvlName(u.level)}）</span></span>
      ${(me.friends||[]).includes(u.id)?'<span class="tag-mini" style="margin-left:auto;color:var(--orange)">好友</span>':""}
    </label>`).join("")||'<div class="empty">暂无其他用户，先去注册账号吧。</div>'}
  </div>
  <div class="m-foot"><button class="btn btn-sm btn-ghost" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">保存</button></div>`).then(v=>{if(v==="yes"){const sel=[...document.querySelectorAll(".mem-ck")].filter(c=>c.checked).map(c=>c.value);room.members=[me.id,...sel],DB.save(),router(),toast("成员已更新","ok")}})}function speakPop(btn,room){closePop(),room||(room=activeRoom());const me=DB.user,others=DB.data.users.filter(u=>u.id!==me.id);others.sort((a,b)=>{const fa=room.members.includes(a.id)?0:1,fb=room.members.includes(b.id)?0:1;return fa-fb});const rect=btn.getBoundingClientRect(),pop=document.createElement("div");pop.className="pop",pop.style.position="fixed",pop.style.top="8px",pop.style.left="8px",pop.style.maxWidth=Math.max(100,window.innerWidth-16)+"px",pop.style.maxHeight=Math.max(100,Math.min(280,window.innerHeight-24))+"px",pop.innerHTML=others.map(u=>`<span class="pop-item" data-speak="${u.id}">
    <span class="av" style="width:26px;height:26px;font-size:11px">${avatarHtml32(u)}</span>
    <span class="pop-name">${esc(u.name)}</span>
    <span class="tag-mini">${room.members.includes(u.id)?"成员":"未加入"}</span></span>`).join("")||'<div class="pop-item" style="cursor:default">暂无其他用户</div>',document.body.appendChild(pop);const w=pop.offsetWidth,h=pop.offsetHeight;let x=rect.right-w;x=Math.max(8,Math.min(x,window.innerWidth-w-8));let y=rect.bottom+6;y+h>window.innerHeight-8&&(y=rect.top-h-6),y=Math.max(8,Math.min(y,window.innerHeight-h-8)),pop.style.left=x+"px",pop.style.top=y+"px",pop.addEventListener("click",e=>{const it=e.target.closest("[data-speak]");it&&(closePop(),roomSpeak(room,it.dataset.speak))}),bindPopDismiss()}function closePop(){document.querySelectorAll(".pop").forEach(p=>p.remove())}function bindPopDismiss(){setTimeout(()=>document.addEventListener("click",closePopOnce),0)}function closePopOnce(e){e.target.closest(".pop")||e.target.closest("#rm-speak")||(closePop(),document.removeEventListener("click",closePopOnce))}let recState=null,recTimer=null,recTouchY=0;function startRec(btn){var _a,_b;const recTarget=btn.dataset.recbtn;recState={target:recTarget,roomId:recTarget==="room"?(_a=activeRoom())==null?void 0:_a.id:null,userId:(_b=DB.user)==null?void 0:_b.id,start:Date.now(),cancel:!1};const ov=document.createElement("div");ov.className="rec-overlay",ov.id="rec-overlay",ov.innerHTML=`<div class="rec-box">
    <div class="rec-mic">${ic("mic",34)}</div>
    <div class="rec-timer" id="rec-timer">0:00</div>
    <div class="rec-tip" id="rec-tip">松开发送，上滑取消</div></div>`,document.body.appendChild(ov),recTimer=setInterval(()=>{const s=Math.floor((Date.now()-recState.start)/1e3),el=$("#rec-timer");el&&(el.textContent=Math.floor(s/60)+":"+String(s%60).padStart(2,"0"))},200)}function endRec(send){if(!recState)return;const len=Math.max(1,Math.round((Date.now()-recState.start)/1e3)),target=recState.target,roomId=recState.roomId,userId=recState.userId;clearInterval(recTimer),recTimer=null;const ov=$("#rec-overlay");if(ov&&ov.remove(),recState=null,!send)return;const pr=modal(`<h3>语音转文字</h3><div class="m-body">
    <div class="ph-sub">语音时长 ${len}″。请补录此条语音的文字内容，便于聊天记录留档。</div>
    <textarea class="field" id="voice-text" style="min-height:100px" placeholder="请输入语音内容，Ctrl+Enter 发送"></textarea>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
      ${["嗯。","在的。","稍等。","好，我知道了。"].map(q=>`<button class="btn btn-sm btn-ghost" data-quick="${q}">${q}</button>`).join("")}
    </div></div>
    <div class="m-foot"><button class="btn btn-sm btn-ghost" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">发送语音</button></div>`);setTimeout(()=>{const ta=$("#voice-text");ta&&ta.focus()},60),document.querySelectorAll("[data-quick]").forEach(b=>b.addEventListener("click",()=>{const ta=$("#voice-text");insertAt(ta,b.dataset.quick)})),pr.then(v=>{var _a;if(v==="yes"){if(!DB.user||DB.user.id!==userId){toast("账号状态已变化，语音未发送。","warn");return}const text=(((_a=$("#voice-text"))==null?void 0:_a.value)||"").trim();if(!text){toast("请填写语音转文字内容","warn");return}if(target==="room"){const room=roomsOf().find(r=>r.id===roomId);if(!room){toast("原聊天室已不存在，语音未发送。","warn");return}const msg={id:genId("m"),uid:DB.user.id,type:"voice",len,text,at:nowStr()};window._quote&&(msg.quote=window._quote,window._quote=null),commitOutgoingMessage({kind:"room",roomId:room.id},msg)}else{const uid=target.split(":")[1],ch=chatOf(uid),msg={id:genId("m"),side:"me",type:"voice",len,text,at:nowStr()};window._quote&&(msg.quote=window._quote,window._quote=null),commitOutgoingMessage({kind:"chat",key:uid,side:"them"},msg)}}})}document.addEventListener("mousedown",e=>{const b=e.target.closest("[data-recbtn]");b&&startRec(b)}),document.addEventListener("mouseup",()=>{recState&&endRec(!0)}),document.addEventListener("touchstart",e=>{const b=e.target.closest("[data-recbtn]");b&&(recTouchY=e.touches[0].clientY,startRec(b))},{passive:!0}),document.addEventListener("touchmove",e=>{if(recState&&e.touches[0]){const dy=recTouchY-e.touches[0].clientY;recState.cancel=dy>60;const tip=$("#rec-tip");tip&&(tip.textContent=dy>60?"松开手指，取消发送":"松开发送，上滑取消")}},{passive:!0}),document.addEventListener("touchend",()=>{recState&&endRec(!recState.cancel)});const pick=arr=>arr[Math.floor(Math.random()*arr.length)];function userOfId(id){return DB.data.users.find(u=>u.id===id)}function workgroupOf(){(!DB.data.workgroup||typeof DB.data.workgroup!="object")&&(DB.data.workgroup={members:[],messages:[]});const wg=DB.data.workgroup;return Array.isArray(wg.members)||(wg.members=[]),Array.isArray(wg.messages)||(wg.messages=[]),wg.mode||(wg.mode="create"),wg.speed||(wg.speed="natural"),typeof wg.proactive!="boolean"&&(wg.proactive=!0),wg.proactiveActivity||(wg.proactiveActivity="normal"),Number.isFinite(Number(wg.proactiveInterval))||(wg.proactiveInterval=120),Number.isFinite(Number(wg.unread))||(wg.unread=0),wg}function speedDelay(sp){return sp==="instant"?1e3+Math.random()*7e3:sp==="deep"?3e4+Math.random()*15e4:5e3+Math.random()*55e3}function modeCfg(box){return box.mode||(box.mode="create"),box.speed||(box.speed="natural"),box}function openMask(html){const mask=document.createElement("div");return mask.className="modal-mask",mask.innerHTML=`<div class="modal">${html}</div>`,document.body.appendChild(mask),mask.addEventListener("click",e=>{e.target===mask&&mask.remove()}),mask}const CARD_LIMIT=999;function cardManager(personId){const u=userOfId(personId);if(!u){toast("用户不存在","err");return}Array.isArray(u.cards)||(u.cards=[]);const norm=t=>(t||"").trim(),dupText=t=>u.cards.some(c=>!c.photo&&norm(c.text)===t),listHtml=()=>u.cards.map((c,i)=>`<div class="card-item" data-card-index="${i}">
      ${c.photo?`<img src="${esc(c.photo)}" alt="图片字卡预览">`:c.text&&[...c.text].length<=2?`<span class="ci-emoji">${esc(c.text)}</span>`:""}
      <div class="ci-body"><p>${c.photo?`<span class="ci-type">图片</span> ${esc(c.text||"图片字卡")}`:esc(c.text||"（空白字卡）")}</p>
        <div class="ci-meta">${c.photo?"图片卡":`文字卡 · ${[...c.text||""].length} 字`}${c.combo&&c.combo.length?` · 组合 ${c.combo.length} 条`:""}</div>
        ${c.combo&&c.combo.length?`<div class="ci-combo">${esc(c.combo.map(x=>x.text||"[图]").join(" / ").slice(0,72))}</div>`:""}
      </div>
      ${c.photo?"":`<button class="ci-edit" data-cedit="${i}" type="button">编辑</button>`}
      <button data-cdel="${i}" type="button">删除</button></div>`).join("")||'<div class="empty">还没有字卡，在下方添加</div>',mask=openMask(`<h3>字卡工作台 · ${esc(u.name)} <span class="card-count" style="font-size:12px;color:var(--pt-muted);font-weight:400">（${u.cards.length}/${CARD_LIMIT}）</span></h3><div class="m-body">
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
  </div>`),list=mask.querySelector("#card-list"),applyCardSearch=()=>{const q=(mask.querySelector("#card-search").value||"").trim().toLocaleLowerCase();list.querySelectorAll(".card-item").forEach(row=>{row.hidden=!!q&&!row.textContent.toLocaleLowerCase().includes(q)})},refresh=()=>{list.innerHTML=listHtml();const cap=mask.querySelector(".card-count");cap&&(cap.textContent=`（${u.cards.length}/${CARD_LIMIT}）`),applyCardSearch()};mask.querySelector("#card-search").addEventListener("input",applyCardSearch);const roomLeft=()=>CARD_LIMIT-u.cards.length;mask.querySelector("#card-img").addEventListener("change",e=>{const f=e.target.files[0];if(f){if(roomLeft()<=0){toast("该用户字卡已达 999 上限","warn"),e.target.value="";return}compressImage(f,480,d=>{u.cards.push({id:genId("c"),text:"",photo:d,combo:[]}),DB.save(),refresh(),toast("图片字卡已添加","ok"),mask.querySelector("#card-img-name").textContent="",e.target.value=""}),mask.querySelector("#card-img-name").textContent="已选图片，处理中…"}}),list.addEventListener("click",e=>{const edit=e.target.closest("[data-cedit]");if(edit){const index2=parseInt(edit.dataset.cedit,10),card=u.cards[index2];if(!card)return;const editMask=openMask(`<h3>编辑文字字卡</h3><div class="m-body"><label class="fl">字卡内容</label><textarea class="field" id="card-edit-text" maxlength="2000" rows="4" placeholder="输入文字或表情">${esc(card.text||"")}</textarea><label class="fl" style="margin-top:12px">连续组合（可选，每行一条）</label><textarea class="field" id="card-edit-combo" rows="4" placeholder="一行一条">${esc((card.combo||[]).map(x=>x.text||"").join(`
`))}</textarea><div class="card-edit-foot">修改后会保留当前字卡顺序。</div></div><div class="m-foot"><button class="btn btn-sm btn-ghost" id="card-edit-cancel" type="button">取消</button><button class="btn btn-sm" id="card-edit-save" type="button">保存修改</button></div>`);editMask.querySelector("#card-edit-cancel").addEventListener("click",()=>editMask.remove()),editMask.querySelector("#card-edit-save").addEventListener("click",()=>{const text=editMask.querySelector("#card-edit-text").value.trim();if(!text){toast("字卡内容不能为空","warn");return}const combo=editMask.querySelector("#card-edit-combo").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(text2=>({text:text2}));card.text=text,card.combo=combo,DB.save(),editMask.remove(),refresh(),toast("字卡已更新","ok")});return}const b=e.target.closest("[data-cdel]");if(!b)return;const index=parseInt(b.dataset.cdel,10);!Number.isFinite(index)||!u.cards[index]||(u.cards.splice(index,1),DB.save(),refresh(),toast("字卡已删除"))}),mask.querySelector("#card-add").addEventListener("click",()=>{const text=norm(mask.querySelector("#card-one").value);if(!text){toast("请填写字卡内容","warn");return}if(roomLeft()<=0){toast("该用户字卡已达 999 上限","warn");return}if(dupText(text)){toast("重复字卡，已跳过","warn");return}const combo=mask.querySelector("#card-combo").value.split(`
`).map(norm).filter(Boolean).map(x=>({text:x}));u.cards.push({id:genId("c"),text,combo}),DB.save(),refresh(),toast("文字字卡已添加","ok"),mask.querySelector("#card-one").value="",mask.querySelector("#card-combo").value=""}),mask.querySelector("#card-batch-add").addEventListener("click",()=>{const lines=mask.querySelector("#card-batch").value.split(`
`).map(norm).filter(Boolean);let add=0,skip=0;lines.forEach(t=>{roomLeft()<=0||(dupText(t)?skip++:(u.cards.push({id:genId("c"),text:t,combo:[]}),add++))}),DB.save(),refresh(),mask.querySelector("#card-batch").value="",toast(`添加 ${add} 张，跳过重复 ${skip} 张`,"ok")}),mask.querySelector("#card-import").addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader;rd.onload=()=>{let add=0,skip=0;const addCard=c=>{if(!(roomLeft()<=0))if(c.photo)u.cards.push({id:genId("c"),text:c.text||"",photo:c.photo,combo:Array.isArray(c.combo)?c.combo:[]}),add++;else{const t=norm(c.text);if(!t)return;dupText(t)?skip++:(u.cards.push({id:genId("c"),text:t,combo:Array.isArray(c.combo)?c.combo:[]}),add++)}},txt=rd.result;if(f.name.toLowerCase().endsWith(".json"))try{let data=JSON.parse(txt);data&&!Array.isArray(data)&&Array.isArray(data.cards)&&(data=data.cards),Array.isArray(data)?data.forEach(addCard):toast("JSON 格式无法识别","warn")}catch(err){toast("JSON 解析失败","err")}else txt.split(/\r?\n/).map(norm).filter(Boolean).forEach(t=>{roomLeft()<=0||(dupText(t)?skip++:(u.cards.push({id:genId("c"),text:t,combo:[]}),add++))});DB.save(),refresh(),toast(`导入 ${add} 张，跳过重复 ${skip} 张`,"ok"),e.target.value=""},rd.readAsText(f)}),mask.querySelector("#card-export-txt").addEventListener("click",()=>{const blob=new Blob([u.cards.filter(c=>!c.photo).map(c=>c.text).filter(Boolean).join(`
`)],{type:"text/plain"}),a=document.createElement("a");a.href=URL.createObjectURL(blob),a.download="zika-"+u.name+".txt",a.click(),URL.revokeObjectURL(a.href),toast("文字卡已导出","ok")}),mask.querySelector("#card-export-json").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(u.cards)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob),a.download="zika-"+u.name+".json",a.click(),URL.revokeObjectURL(a.href),toast("全部字卡已导出","ok")}),mask.querySelector("#card-close").addEventListener("click",()=>mask.remove())}function targetBox(target){return target.kind==="chat"?chatOf(target.key):target.kind==="room"?roomById(target.roomId):workgroupOf()}function targetArr(target){return targetBox(target).messages}const _typingTargets=new Set;function typingKey(target){return target?target.kind==="chat"?"chat:"+target.key:target.kind==="room"?"room:"+target.roomId:"wg:main":""}function setTyping(target,on){if(!target)return;const k=typingKey(target),had=_typingTargets.has(k);on?_typingTargets.add(k):_typingTargets.delete(k),had!==on&&refreshIfActive(target)}function typingBubbleHtml(target,other){return`<div class="msg them">${target&&target.kind==="chat"?`<span class="m-av">${avatarHtml32(other||{name:"对方"})}</span>`:'<span class="m-av typing-av"></span>'}<span class="msg-content-stack"><span class="bubble typing-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span></span></div>`}function emitCard(target,part){const arr=targetArr(target),m={id:genId("m"),at:nowStr()};target.kind==="chat"?m.side=target.side:m.uid=part.uid||target.uid,part.photo?(m.type="photo",m.photo=part.photo,m.text=part.text||""):(m.type="text",m.text=part.text||""),(target.kind==="chat"?m.side!=="me":m.uid!==DB.user.id)&&markIncomingMessage(target,m),arr.push(m),DB.save(),refreshIfActive(target)}function emitCardWithCombo(target,card){const t2={...target,uid:card.uid||target.uid};emitCard(t2,card),(card.combo||[]).forEach((c,i)=>setTimeout(()=>emitCard({...t2,uid:c.uid||card.uid||target.uid},c),600*(i+1)))}function weightedReplyCount(){const r=Math.random();return r<.46?1:r<.76?2:r<.91?3:r<.98?4:5}function emitCardBurst(target,people,onDone){var _a;const eligible=(Array.isArray(people)?people:[people]).filter(p=>p&&Array.isArray(p.cards)&&p.cards.length);if(!eligible.length)return onDone&&onDone(),0;const count=weightedReplyCount(),queue=[],generation=_replyGeneration,sessionUser=(_a=DB.user)==null?void 0:_a.id;for(let i=0;i<count;i++){const person=pick(eligible),card=pick(person.cards),parts=[card,...Array.isArray(card.combo)?card.combo:[]].filter(part2=>part2&&(part2.text||part2.photo)),part=parts.length?pick(parts):card;queue.push({person,part})}return queue.forEach((entry,i)=>setTimeout(()=>{if(generation!==_replyGeneration||!DB.user||DB.user.id!==sessionUser)return;const t2=target.kind==="chat"?{...target,side:target.side||"them"}:{...target,uid:entry.person.id};emitCard(t2,entry.part),i===queue.length-1&&onDone&&onDone()},420*i)),queue.length?420*(queue.length-1):0}function renderConversationMessages(target){const kind=target.kind;let key="",box=null,arr=[];if(kind==="chat")key=target.key,box=chatOf(key),arr=Array.isArray(box.messages)?box.messages:[];else if(kind==="room")key=target.roomId,box=roomsOf().find(r=>r.id===key),arr=box&&Array.isArray(box.messages)?box.messages:[];else if(kind==="workgroup")box=workgroupOf(),arr=Array.isArray(box.messages)?box.messages:[];else return"";if(!arr.length)return kind==="chat"?'<div class="empty">还没有消息。先发一条，再点 TA 的头像让 TA 回复吧。</div>':kind==="room"?'<div class="empty">聊天室还没有消息。点“TA 发言”让成员说话，或在下方打字。</div>':'<div class="empty">工作组还没有消息。</div>';const me=DB.user,other=kind==="chat"?DB.data.users.find(u=>u.id===key):null;let out=arr.map((m,mi)=>{const timeNode=chatTimestampHtml(m,kind,key,arr[mi-1]);if(kind==="chat"){const mine2=m.side==="me";if(m.recalled)return`${timeNode}<div class="msg recalled"><span class="recall-txt">${mine2?"你":esc((other||{name:"对方"}).name)}撤回了一条消息</span></div>`;const av=mine2?`<span class="m-av">${avatarHtml32(me)}</span>`:`<span class="m-av" data-them-av="1" title="点 TA 头像，TA 回复一条">${avatarHtml32(other||{name:"对方"})}</span>`,money2=messageIsMoney(m),content2=money2?`<span class="msg-attachment" data-msgctx="${ctxData("chat",key,m.id)}">${bubbleContent(m)}</span>`:`<span class="bubble ${m.photo?"has-photo":""}" data-msgctx="${ctxData("chat",key,m.id)}">${bubbleContent(m)}</span>`;return`${timeNode}<div class="msg ${mine2?"me":"them"} ${money2?"money-msg":""}">${av}<span class="msg-content-stack">${content2}${messageReceiptHtml(m,mine2)}</span></div>${money2?moneyNoticeHtml(m,"chat",key):""}`}const u=DB.data.users.find(x=>x.id===m.uid)||{name:"未知",avatar:""},mine=m.uid===me.id;if(m.recalled)return`${timeNode}<div class="msg recalled"><span class="recall-txt">${esc(u.name)} 撤回了一条消息</span></div>`;const ctxKind=kind==="room"?"room":"workgroup",avAttr=mine?"":kind==="room"?`data-room-av="${m.uid}" title="点 TA 头像，TA 发言一条"`:`data-wg-av="${m.uid}"`,money=messageIsMoney(m),content=money?`<span class="msg-attachment" data-msgctx="${ctxData(ctxKind,key,m.id)}">${bubbleContent(m)}</span>`:`<span class="bubble ${m.photo?"has-photo":""}" data-msgctx="${ctxData(ctxKind,key,m.id)}">${bubbleContent(m)}</span>`;return`${timeNode}<div class="msg ${mine?"me":"them"} ${money?"money-msg":""}"><span class="m-av" ${avAttr}>${avatarHtml32(u)}</span><span class="msg-content-stack">${mine?"":`<span class="m-name">${esc(u.name)}</span>`}${content}${messageReceiptHtml(m,mine)}</span></div>${money?moneyNoticeHtml(m,ctxKind,key):""}`}).join("");return _typingTargets.has(typingKey(target))&&(out+=typingBubbleHtml(target,other)),out}function refreshConversationDom(target){const sc=$("#ch-scroll");if(!sc)return!1;const wasNearBottom=sc.scrollHeight-sc.scrollTop-sc.clientHeight<90,oldTop=sc.scrollTop;sc.innerHTML=renderConversationMessages(target),wasNearBottom?sc.scrollTop=sc.scrollHeight:sc.scrollTop=oldTop;const hash=location.hash||"#/",old=routeViewPositions[hash]||{y:window.scrollY||0};return old.chatTop=sc.scrollTop,routeViewPositions[hash]=old,persistViewPositions(),!0}function refreshIfActive(target){const{seg}=parseHash();if(target.kind==="chat"&&seg[0]==="chat"&&seg[1]===target.key){refreshConversationDom(target)||(router(),scrollRoom()),syncUnreadBadges();return}if(target.kind==="chat"&&seg[0]==="messages"){router();return}if(target.kind==="room"&&seg[0]==="room"){const targetRoom=roomsOf().find(r=>r.id===target.roomId),currentRoom=activeRoom();targetRoom&&currentRoom&&targetRoom.id===currentRoom.id?refreshConversationDom(target)||(router(),scrollRoom()):syncUnreadBadges();return}if(target.kind==="workgroup"&&seg[0]==="workgroup"){refreshConversationDom(target)||(router(),scrollRoom()),syncUnreadBadges();return}syncUnreadBadges()}function replyPeople(target,box){return target.kind==="chat"?[userOfId(target.key)].filter(Boolean):(box.members||[]).filter(id=>id!==DB.user.id).map(userOfId).filter(Boolean)}let _replyGeneration=0;function finishAutoReply(target,box,generation=_replyGeneration){generation!==_replyGeneration||!DB.user||targetBox(target)!==box||(setTyping(target,!1),box.replyPending=!1,box.queuedReply?(box.queuedReply=!1,box.proactiveWaiting=!1,box.replyPending=!0,DB.save(),setTimeout(()=>{generation!==_replyGeneration||!DB.user||targetBox(target)!==box||(box.replyPending=!1,autoReply(target))},180)):(box.proactiveWaiting=!1,box.proactiveNextAt=0,box.proactiveLastTickAt=Date.now(),DB.save()))}function autoReply(target){const box=targetBox(target),cfg=modeCfg(box);if(!DB.user||cfg.mode!=="card")return;if(box.replyPending){box.queuedReply=!0,box.proactiveWaiting=!1,DB.save();return}const generation=_replyGeneration,sessionUser=DB.user.id;box.replyPending=!0,box.proactiveWaiting=!1,DB.save(),setTyping(target,!0),setTimeout(()=>{if(generation!==_replyGeneration||!DB.user||DB.user.id!==sessionUser||targetBox(target)!==box||modeCfg(box).mode!=="card"){targetBox(target)===box&&(box.replyPending=!1,box.queuedReply=!1,DB.save()),setTyping(target,!1);return}const people=replyPeople(target,box);if(box.readNoReply&&Math.random()<.2){setTyping(target,!1),finishAutoReply(target,box,generation),refreshIfActive(target);return}if(people.length&&Math.random()<.22){const sender=pick(people),t2=target.kind==="chat"?{...target,side:"them"}:{...target,uid:sender.id};emitMoney(t2,Math.random()<.5?"redpacket":"transfer",randMoney(),Math.random()<.5?"收下，别客气。":"一点心意。"),setTyping(target,!1),finishAutoReply(target,box,generation);return}const withCards=people.filter(p=>Array.isArray(p.cards)&&p.cards.length);if(!withCards.length){setTyping(target,!1),finishAutoReply(target,box,generation);return}emitCardBurst(target.kind==="chat"?{...target,side:"them"}:target,withCards,()=>finishAutoReply(target,box,generation))},speedDelay(cfg.speed))}function resetProactiveWaitForLogin(){_replyGeneration++;const reset=box=>{!box||typeof box!="object"||box.proactive!==!1&&(box.proactiveWaiting=!1,box.replyPending=!1,box.queuedReply=!1,box.proactiveLastTickAt=Date.now())};Object.values(DB.data.chats||{}).forEach(reset),(DB.data.rooms||[]).forEach(reset),reset(DB.data.workgroup),DB.save()}function maybeProactive(target){const box=targetBox(target);box&&!box.proactiveLastTickAt&&(box.proactiveLastTickAt=Date.now()),box&&DB.save()}function proactiveTargets(){const targets=[];Object.entries(DB.data.chats||{}).forEach(([key,box])=>{box&&box.proactive!==!1&&targets.push({kind:"chat",key,side:"them"})}),(DB.data.rooms||[]).forEach(room=>{room&&room.proactive!==!1&&targets.push({kind:"room",roomId:room.id})});const wg=workgroupOf();return DB.user&&DB.user.level>=2&&wg&&wg.proactive!==!1&&targets.push({kind:"workgroup"}),targets}function isInternalPage(){if(!DB.user)return!1;const{seg}=parseHash();return["forum","room","workgroup","oa","divination","post","ask","wanted","archives","archive","network","events","event","library","codex","dashboard","staff-card","space","decorate","messages","chat","friends","settings","u","search","essence"].includes(seg[0])}function proactiveMessageTime(m){if(!m||!m.at)return 0;const n=new Date(String(m.at).replace(" ","T")).getTime();return Number.isFinite(n)?n:0}function proactiveLastWasIncoming(target,last){var _a;return last?target.kind==="chat"?last.side!=="me":last.uid!==((_a=DB.user)==null?void 0:_a.id):!1}function activityProbability(box,gap){const activity=box.proactiveActivity||"normal",base={active:.2,normal:.08,quiet:.025,custom:.08}[activity]||.08;return activity==="custom"&&Number(box.proactiveInterval)>0?1-Math.exp(-15e3/(Math.max(30,Math.min(3600,Number(box.proactiveInterval)))*1e3)):gap>10*60*1e3?Math.min(.6,base*2.5):gap>3*60*1e3?Math.min(.4,base*1.6):base}function sendProactiveRound(target,box,people){if(!DB.user||!box||box.proactive===!1||box.mode!=="card"||box.replyPending||(people=people||replyPeople(target,box).filter(p=>Array.isArray(p.cards)&&p.cards.length),!people.length))return;const generation=_replyGeneration;box.replyPending=!0,DB.save(),setTyping(target,!0);const sender=pick(people),t2=target.kind==="chat"?{...target,side:"them"}:{...target,uid:sender.id};Math.random()<.08?(emitMoney(t2,Math.random()<.5?"redpacket":"transfer",randMoney(),"一点心意。"),finishAutoReply(target,box,generation)):emitCardBurst(target.kind==="chat"?{...target,side:"them"}:target,people,()=>finishAutoReply(target,box,generation))}function runProactiveScheduler(){if(!DB.user||!isInternalPage())return;const isHidden=document.visibilityState==="hidden",now=Date.now();for(const target of proactiveTargets()){const box=targetBox(target);if(!box||box.proactive===!1||box.mode!=="card"||box.replyPending)continue;const people=replyPeople(target,box).filter(p2=>Array.isArray(p2==null?void 0:p2.cards)&&p2.cards.length);if(!people.length)continue;const last=Number(box.proactiveLastTickAt)||now,gap=now-last,tickMs=15e3;if(gap<tickMs)continue;const missed=Math.min(40,Math.floor(gap/tickMs));box.proactiveLastTickAt=now;const p=activityProbability(box,gap,missed);let fired=!1;for(let i=0;i<missed;i++)if(Math.random()<p){fired=!0;break}if(fired&&!(DB.data.proactiveGlobalNextAt&&now<DB.data.proactiveGlobalNextAt)){DB.data.proactiveGlobalNextAt=now+2e4+Math.random()*4e4,sendProactiveRound(target,box,people);break}}DB.save()}function maybeLoginProactive(){!DB.user||!isInternalPage()||(proactiveTargets().forEach(target=>{const box=targetBox(target);box&&box.proactiveNextAt==null&&(box.proactiveNextAt=Date.now()+45e3+Math.random()*12e4)}),DB.save())}function randMoney(){const r=Math.random();return r<.88?Math.floor(Math.random()*49501)+500:r<.96?Math.floor(Math.random()*400)+100:Math.floor(Math.random()*15e4)+50001}const fmtMoney=n=>n.toLocaleString("zh-CN");function moneyDialog(target,type){const mask=openMask(`<h3>${type==="redpacket"?"发红包":"转账"}</h3><div class="m-body">
    <label class="fl">金额（元）</label>
    <input class="field" id="m-amount" type="number" min="0.01" value="${type==="redpacket"?"88":"1000"}">
    <label class="fl" style="margin-top:10px">${type==="redpacket"?"祝福语":"备注"}</label>
    <input class="field" id="m-note" value="${type==="redpacket"?"恭喜发财，大吉大利":""}">
    
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-sm btn-ghost" id="m-cancel" style="margin-left:auto">取消</button>
      <button class="btn btn-sm" id="m-ok">发送</button></div>
  </div>`);mask.querySelector("#m-cancel").addEventListener("click",()=>mask.remove()),mask.querySelector("#m-ok").addEventListener("click",()=>{const amt=Math.floor(parseFloat(mask.querySelector("#m-amount").value)*100)/100;if(!(amt>0)||amt>1e8){toast("请输入 0~1 亿之间的金额","warn");return}const note=mask.querySelector("#m-note").value.trim(),t2=target.kind==="chat"?{...target,side:"me"}:{...target,uid:DB.user.id};emitMoney(t2,type,amt,note),mask.remove()})}function emitMoney(target,type,amount,note){const arr=targetArr(target),m={id:genId("m"),at:nowStr(),type,amount,note,opened:!1};target.kind==="chat"?m.side=target.side:m.uid=target.uid;const sentByMe=target.kind==="chat"?m.side==="me":m.uid===DB.user.id;sentByMe||markIncomingMessage(target,m),arr.push(m),DB.save(),refreshIfActive(target),sentByMe&&scheduleCounterpartyMoneyAction(target,m)}function scheduleCounterpartyMoneyAction(target,message){const box=targetBox(target),potential=replyPeople(target,box),recipient=potential.length?pick(potential):target.kind==="chat"?userOfId(target.key):null;recipient&&(message.receivedBy=recipient.id),setTimeout(()=>{const current=(box.messages||[]).find(m=>m.id===message.id);if(!(!current||current.returned||current.opened||current.received)){if(current.type==="redpacket")Math.random()<.92?(current.opened=!0,current.openedAt=nowStr()):setTimeout(()=>{const late=(box.messages||[]).find(m=>m.id===message.id);!late||late.opened||(late.opened=!0,late.openedAt=nowStr(),DB.save(),refreshIfActive(target))},3500+Math.random()*3500);else if(current.type==="transfer"){const r=Math.random();r<.86?(current.received=!0,current.receivedAt=nowStr(),current.returned=!1):r<.96?(current.returned=!0,current.returnedAt=nowStr(),current.received=!1):setTimeout(()=>{const late=(box.messages||[]).find(m=>m.id===message.id);!late||late.received||late.returned||(late.received=!0,late.receivedAt=nowStr(),late.returned=!1,DB.save(),refreshIfActive(target))},3500+Math.random()*3500)}DB.save(),refreshIfActive(target)}},1800+Math.random()*4200)}function moneyBubbleHtml(m){if(m.type==="redpacket")return`<span class="money-bubble">
      <button type="button" class="redpack-bub ${m.opened?"is-opened":""}" data-rpopen="${esc(m.id)}" aria-label="打开红包">
        <span class="rp-ic">${m.opened?"✓":"福"}</span>
        <span class="rp-txt"><b>${esc(m.note||"恭喜发财，大吉大利")}</b><small>${m.opened?"已领取":"哪都通红包"}</small></span>
        <span class="rp-chevron">${m.opened?"已开":"›"}</span>
      </button>
    </span>`;const received=!!m.received&&!m.returned,returned=!!m.returned;return`<span class="money-bubble">
    <button type="button" class="transfer-bub ${received?"is-received":""} ${returned?"is-returned":""}" data-tfopen="${esc(m.id)}" aria-label="查看转账">
      <span class="tf-ic">${returned?"↩":received?"✓":"¥"}</span>
      <span class="tf-txt"><b>¥${fmtMoney(m.amount)}</b><small>${returned?"已退还":received?"已收款":esc(m.note||"转账")}</small></span>
      <span class="tf-chevron">${returned?"已退":received?"已收":"›"}</span>
    </button>
  </span>`}function moneyDetailDialog(m,kind){const isRed=kind==="redpacket",fromMe=Object.prototype.hasOwnProperty.call(m,"side")?m.side==="me":m.uid===DB.user.id,mask=document.createElement("div");mask.className="money-detail-mask";const already=isRed?!!m.opened:!!m.received||!!m.returned,returned=!isRed&&!!m.returned,title=isRed?already?"红包已领取":"恭喜发财，大吉大利":returned?"转账已退还":already?"转账已收款":fromMe?"转账已发出":"收到一笔转账",status=returned?"该笔转账已退回":already?isRed?"红包已收下":"已确认收款":isRed?fromMe?"等待对方领取":"恭喜发财，好运常在":fromMe?"等待对方收款":"待收款",actionHtml=!already&&!fromMe?`<button type="button" class="money-detail-action" id="money-confirm">${isRed?"开":"确认收款"}</button>`:!isRed&&!returned&&already&&!fromMe?'<button type="button" class="money-detail-action" id="money-return" style="margin-top:12px;padding:10px 24px;background:#F3F4F6;color:#4B5563">退还转账</button>':already?'<div class="money-detail-done">✓ 已完成</div>':`<div class="money-detail-done">${fromMe?"等待对方处理":"处理中"}</div>`;mask.innerHTML=`<div class="money-detail ${isRed?"money-detail-red":"money-detail-transfer"}">
    <button type="button" class="money-detail-close" aria-label="关闭">×</button>
    <div class="money-detail-brand">${isRed?"哪都通红包":"哪都通转账"}</div>
    <div class="money-detail-icon">${isRed?already?"✓":"福":returned?"↩":already?"✓":"¥"}</div>
    <div class="money-detail-title">${title}</div>
    <div class="money-detail-note">${esc(m.note||(isRed?"哪都通专属红包":"转账"))}</div>
    <div class="money-detail-amount">¥${fmtMoney(m.amount)}</div>
    <div class="money-detail-status">${status}</div>
    ${actionHtml}
    <div class="money-detail-foot">哪都通 · 内部通讯</div>
  </div>`,document.body.appendChild(mask);const close=()=>mask.remove();mask.querySelector(".money-detail-close").addEventListener("click",close),mask.addEventListener("click",e=>{e.target===mask&&close()});const confirm=mask.querySelector("#money-confirm");confirm&&confirm.addEventListener("click",()=>{isRed?(m.opened=!0,m.openedAt=nowStr()):(m.received=!0,m.receivedAt=nowStr(),m.returned=!1),DB.save(),close(),router()});const returnBtn=mask.querySelector("#money-return");returnBtn&&returnBtn.addEventListener("click",()=>{m.returned=!0,m.returnedAt=nowStr(),m.received=!1,DB.save(),close(),router()})}const FORTUNE_GRADES=[{g:"大吉",c:"#E8533B"},{g:"中吉",c:"#E8874A"},{g:"小吉",c:"#D8B15E"},{g:"平",c:"#8EA0DC"},{g:"小凶",c:"#7A86B8"},{g:"凶",c:"#9AA6D6"}],FORTUNES=[{g:"大吉",poem:`云开见月正当空，行路何须问远踪。
一点灵光随炁转，万般如意自从容。`,mean:"诸事顺遂，谋望可成。今日宜主动出击、宜会友、宜立誓；炁运昌隆，所行皆有回响。"},{g:"中吉",poem:`东风轻叩小窗纱，渐有佳音到水涯。
守得云开终见日，慢些火候也开花。`,mean:"运势向好，需稍待时日。今日宜稳扎稳打，旧事将有转机，贵人在侧。"},{g:"小吉",poem:`山涧细流归大海，林间新笋破青苔。
虽无惊浪拍天起，一步一安也快哉。`,mean:"小有所得，平安是福。今日宜独处、宜练功、宜整理旧事，不宜冒进。"},{g:"平",poem:`行到水穷云起处，坐看云卷又云舒。
无喜无悲心自定，平平淡淡是真如。`,mean:"运势平稳，无大起落。今日守成为上，勿争口舌，静心自处即安。"},{g:"小凶",poem:`风急林深鸟不鸣，歧路多端莫轻行。
且把锋芒收一半，待时再作化龙声。`,mean:"小有阻滞，宜守不宜攻。今日少言少动，避开争执与险地，过午自解。"},{g:"凶",poem:`黑云压顶雨将来，急水行舟易失桅。
谨守本心毋妄动，炁沉丹田待春回。`,mean:"运势欠佳，凡事谨慎。今日不签约、不独行、不涉险；心存正念，自可化煞。"},{g:"大吉",poem:`紫气东来照远山，故人携喜叩门环。
心中所愿终有应，一路清风送我还。`,mean:"适合推进搁置已久的计划，也适合主动联络重要的人。机遇已近，记得把握分寸。"},{g:"中吉",poem:`细雨初收石径新，半窗花影半窗春。
莫嫌眼下行程缓，前路自有识途人。`,mean:"事情正在逐渐明朗。适合收集信息、请教前辈，先打好基础再行动。"},{g:"小吉",poem:`一枝新绿出墙来，几缕清风入砚台。
寻常日子藏惊喜，回首方知福自来。`,mean:"今日容易在小事中收获好心情。留意身边人的善意，不必事事追求结果。"},{g:"平",poem:`长街灯火各成行，檐下微风过旧墙。
不求一步登云去，且将心事慢慢量。`,mean:"适合整理思绪、按计划完成日常事务。暂时没有答案的事，可以再观察一阵。"},{g:"小凶",poem:`雾锁前山路未明，莫因心急乱行程。
暂收快马听风向，云散自然见月生。`,mean:"容易因信息不全而判断失误。重要决定先缓一缓，确认细节后再行动。"},{g:"大吉",poem:`千峰过后见平川，旧约重提喜讯传。
若问此行何处好，心安之地即桃源。`,mean:"适合和解、合作、重启旧计划。与人沟通时坦诚一些，容易得到积极回应。"},{g:"中吉",poem:`青竹经霜色未凋，云边雁字渐迢迢。
此时不妨多蓄力，待到春深自过桥。`,mean:"当前更适合积累而不是急于证明自己。持续投入会带来回报，别被短期起伏影响。"},{g:"小吉",poem:`窗前一盏小灯明，案上新茶香气清。
偶得闲时宜自省，心宽万事便轻盈。`,mean:"适合休息、学习和整理生活。把注意力放回自己，状态会慢慢回升。"},{g:"平",poem:`潮来潮去不留痕，花落花开自有因。
今日但求无挂碍，寻常也可度良辰。`,mean:"保持平常心即可。不要因为别人进度更快就打乱自己的节奏。"},{g:"小凶",poem:`急雨敲窗夜未央，言多容易惹心伤。
且把锋芒藏袖底，明朝再议短和长。`,mean:"今天要留意语气和沟通方式，尤其避免在情绪上头时争论或承诺。"},{g:"中吉",poem:`远客来时带信笺，旧疑今日可开篇。
若能耐住三分性，柳暗花明在眼前。`,mean:"有机会获得新消息或解决旧疑问。把问题说清楚，别急着下结论。"},{g:"大吉",poem:`云帆高挂趁东风，千里关山一望通。
胸有丘壑行有度，此番所向不虚空。`,mean:"适合开始有准备的新行动。把目标拆成几步，稳稳推进，成功机会更高。"},{g:"小吉",poem:`庭前小草已抽芽，檐角新晴落晚霞。
莫问收成何日到，认真耕种自开花。`,mean:"付出正在积累，暂时看不见成果也不必灰心。把眼前能做好的事做好。"},{g:"平",poem:`山色湖光两不争，行人自有去来程。
若将得失都放下，一身清气伴长明。`,mean:"适合平稳推进手头任务。少比较、少内耗，按自己的节奏做事即可。"},{g:"小凶",poem:`孤灯照壁影参差，未辨真章莫妄疑。
留得三分回旋地，免教小事变成痴。`,mean:"不要只凭片面消息猜测他人想法。先核实事实，重要事情保留余地。"},{g:"中吉",poem:`石上清泉绕竹流，旧时烦恼渐回头。
一番细理千丝绪，自有轻舟过渡头。`,mean:"适合处理积压事务，逐项解决比一次解决所有问题更有效。"},{g:"大吉",poem:`星河入梦照归途，久候佳音今日呼。
但把初心牢牢记，乘风自可上云衢。`,mean:"努力可能得到认可，也适合表达真实想法。机会来临时大胆一点，但仍要做好准备。"},{g:"小吉",poem:`陌上花开燕子回，闲云舒卷映春台。
有人轻轻添暖意，莫将真心锁起来。`,mean:"人际关系有转暖的迹象。主动表达感谢或关心，会让关系更自然。"},{g:"平",poem:`一页书翻一盏茶，日升日落是生涯。
不妨暂把纷繁放，听雨听风听落花。`,mean:"今日宜减少不必要的消耗，给自己留出休息空间，先照顾好状态。"},{g:"小凶",poem:`岔路横生莫逞强，暗潮未退水犹凉。
先寻旧地图重看，稳住船头再启航。`,mean:"计划可能临时变化。准备备用方案，遇到阻碍时先稳住局面。"},{g:"中吉",poem:`故纸翻开见旧章，迷云散处有微光。
若能回看初来路，便知下一步何方。`,mean:"复盘过去的经验会带来帮助。适合修正方法、补齐短板，而不是全盘推倒重来。"},{g:"大吉",poem:`春雷一响百花醒，长夜将阑晓色清。
心定自能担大任，乘时万里踏新程。`,mean:"适合承担责任、提出方案或迈出关键一步。相信准备过的自己，也要记得听取建议。"},{g:"小吉",poem:`清风有意过庭除，喜事无声入草庐。
一言一笑皆珍贵，寻常相伴胜珍珠。`,mean:"值得珍惜日常里的小确幸。和熟悉的人好好相处，简单的陪伴就是好运。"},{g:"平",poem:`不争高下不争先，且把平常日子安。
心头若有清明在，何惧浮云遮远山。`,mean:"不必急着与人争胜。按规则办事、保持清醒，今天就能平稳度过。"},{g:"小凶",poem:`风过松林声渐急，临门一步更须思。
莫因一时求速决，回头细看少疏失。`,mean:"越接近完成越要检查细节。签字、提交、转账等操作务必再核对一次。"},{g:"中吉",poem:`新枝渐长旧痕消，远处钟声过小桥。
不必时时催结果，水到渠成自有招。`,mean:"进展可能比预期慢，但方向并没有错。继续保持稳定投入，给事情一些时间。"},{g:"大吉",poem:`明珠久藏匣中光，今日开匣照四方。
胸中自有千般策，落笔成章事事昌。`,mean:"适合展示能力、提交作品或争取机会。把成果清楚地表达出来，别低估自己的价值。"},{g:"小吉",poem:`一轮明月过东墙，半卷闲书半榻凉。
烦恼随风轻轻散，醒来仍是好时光。`,mean:"适合放松和恢复精力。先让自己休息好，很多困扰会变得没那么难处理。"},{g:"凶",poem:`夜路迢迢雨未停，前方虚实尚难明。
收灯暂避风波急，待得天清再启程。`,mean:"遇事以安全和稳妥为先。暂缓冒险、冲动消费或仓促承诺，等信息更充分再决定。"}];FORTUNES.push({g:"大吉",poem:`长风送我过千山，云外晴光入眼宽。
此去不须频问路，心中有定自平安。`,mean:"适合推进重要事项，先明确目标，再按步骤行动。遇到帮助时记得回应善意。"},{g:"中吉",poem:`庭前新雨洗尘沙，竹影摇风映碧纱。
旧事不妨从此理，清明自会到人家。`,mean:"适合整理积压问题、补齐资料。循序处理比急着求结果更有效。"},{g:"小吉",poem:`一声鸟语破晨烟，几缕清风到案前。
寻常细处藏佳意，放慢脚步即安然。`,mean:"小事容易带来好心情。把注意力放在当下，别忽略身边值得珍惜的人。"},{g:"平",poem:`潮平岸阔舟徐行，日暖云轻水自明。
今日无须争早晚，守常亦是好心情。`,mean:"适合照常推进计划。没有必要为了追赶别人而临时改变节奏。"},{g:"小凶",poem:`纸上新痕墨未干，匆忙落笔易生难。
停灯再把前文看，一处周全胜百般。`,mean:"注意合同、消息和数字细节。重要内容先复核，避免因疏忽返工。"},{g:"中吉",poem:`隔岸钟声入晚晴，旧时疑处渐分明。
若将心事从容说，自有知音听此声。`,mean:"适合沟通、澄清误会、寻求建议。表达具体需求，比让别人猜测更容易得到回应。"},{g:"大吉",poem:`春到山河草木新，千门灯火照归人。
但将善意常存念，所遇多添一段春。`,mean:"适合合作、拜访和开启新计划。保持坦诚，好的机会更容易持续。"},{g:"小吉",poem:`书页翻开见旧知，窗前花影落清池。
今日若能多学一寸，明朝便少一分迟。`,mean:"学习和复盘会有收获。适合读资料、练技能或把经验整理成可复用的方法。"},{g:"凶",poem:`山口风高雾未开，前途未辨莫轻猜。
暂收脚步观来势，天色清时再剪裁。`,mean:"信息不足时不要仓促决策。优先保障安全，重要选择等情况更清楚再定。"},{g:"中吉",poem:`小径回环不算遥，青松深处有溪桥。
莫嫌眼下行程缓，稳步终能过石礁。`,mean:"进展虽慢但仍可推进。把大任务拆小，持续完成眼前一步。"},{g:"平",poem:`一盏清茶半卷书，窗边日影渐移除。
不将琐事都牵挂，留点闲心看自如。`,mean:"适合恢复精力、安排日常。适度休息不是拖延，而是为了更稳定地继续。"},{g:"小凶",poem:`人声纷杂各言真，未见全篇莫信闻。
多问一层求实据，免教误会累情分。`,mean:"谨慎对待传闻和二手消息。先确认来源，避免未经核实就转发或指责。"},{g:"大吉",poem:`积雪初消见远峰，长年勤勉渐成踪。
今朝若把良机握，前路清和万事从。`,mean:"适合展示准备已久的成果、争取机会。主动一点，同时把后续安排准备充分。"},{g:"小吉",poem:`檐下微光照旧琴，风来一曲洗尘心。
不求万事皆如意，能有片时自在深。`,mean:"适合放松、创作和与亲近的人相处。给自己留一点不被任务占满的时间。"},{g:"中吉",poem:`旧结抽丝渐可分，耐心细理见真文。
不因一时无头绪，便把前功付水云。`,mean:"遇到复杂问题时，列出已知与未知再逐项处理。不要因为暂时卡住就否定之前的努力。"},{g:"平",poem:`花开花谢有时节，云聚云开自有涯。
今日只须行稳步，心宽处处是生涯。`,mean:"维持稳定就好。对暂时无法控制的事情，减少反复消耗，把精力放回可行动的部分。"},{g:"小凶",poem:`急水滩头石未平，孤舟切莫逆风行。
先将绳缆牢牢系，待得波缓再启程。`,mean:"避免冲动消费、仓促承诺或情绪化争执。先稳住局面，再决定下一步。"},{g:"小吉",poem:`晨光穿叶落书台，久困心情渐次开。
身边小事勤料理，清风自会入门来。`,mean:"适合整理环境、完成小任务。把周围收拾清爽，思路也会更容易理顺。"},{g:"中吉",poem:`远山含翠水含烟，旧友新知话有缘。
若肯先将诚意递，往来渐暖不须言。`,mean:"适合建立联系、修复关系或开展合作。真诚表达比刻意表现更有力量。"},{g:"大吉",poem:`星火微明可燎原，寸功累积不徒然。
今日再添一分力，回看已在高峰前。`,mean:"适合持续推进长期目标。小幅但稳定的进展，往往比一时冲刺更可靠。"},{g:"平",poem:`晴窗静坐听风过，案上闲花自在开。
不问浮名争几许，先将手边事情裁。`,mean:"适合完成手边事务，不必同时开启太多新项目。清晰的优先级能减少疲惫。"},{g:"小凶",poem:`夜色深时路更长，心头有火语偏伤。
且把争端留明日，睡醒再论短和长。`,mean:"避免在疲惫或情绪激动时作重大决定。必要时暂停对话，等双方冷静后再谈。"},{g:"小吉",poem:`檐雨初停石径香，云边一线透晴光。
不须急问何时好，先把今朝过稳当。`,mean:"眼前的阻滞有机会逐步缓解。先做好可控的事情，不必反复追问结果何时出现。"},{g:"中吉",poem:`案头旧稿又添新，反复推敲见本真。
今日适宜修一字，来时方不负初心。`,mean:"适合修改、打磨和完善已有成果。细节上的耐心，会让最终结果更扎实。"});function todayStr(){const d=new Date;return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}const YJ_TRIGRAMS=[{name:"乾",symbol:"☰",bits:[1,1,1]},{name:"兑",symbol:"☱",bits:[1,1,0]},{name:"离",symbol:"☲",bits:[1,0,1]},{name:"震",symbol:"☳",bits:[1,0,0]},{name:"巽",symbol:"☴",bits:[0,1,1]},{name:"坎",symbol:"☵",bits:[0,1,0]},{name:"艮",symbol:"☶",bits:[0,0,1]},{name:"坤",symbol:"☷",bits:[0,0,0]}],YJ_NAMES=["乾","坤","屯","蒙","需","讼","师","比","小畜","履","泰","否","同人","大有","谦","豫","随","蛊","临","观","噬嗑","贲","剥","复","无妄","大畜","颐","大过","坎","离","咸","恒","遁","大壮","晋","明夷","家人","睽","蹇","解","损","益","夬","姤","萃","升","困","井","革","鼎","震","艮","渐","归妹","丰","旅","巽","兑","涣","节","中孚","小过","既济","未济"],YJ_CLASSIC_DB={乾:{source:"维基文库《周易/乾》",url:"https://zh.wikisource.org/wiki/周易/乾",layers:[{title:"经文·卦辞",text:"乾：元亨。利贞。"},{title:"经文·爻辞",text:`初九：潜龙勿用。
九二：见龙在田，利见大人。
九三：君子终日乾乾，夕惕若；厉，无咎。
九四：或跃在渊，无咎。
九五：飞龙在天，利见大人。
上九：亢龙，有悔。
用九：见群龙无首，吉。`},{title:"彖传",text:"大哉乾元，万物资始，乃统天。云行雨施，品物流形，大明终始，六位时成。时乘六龙以御天，乾道变化，各正性命，保合大和（一作太和），乃利贞。首出庶物，万国咸宁。"},{title:"象传",text:`天行健，君子以自强不息。
潜龙勿用，阳在下也。
见龙在田，德施普也。
终日乾乾，反复道也。
或跃在渊，进无咎也。
飞龙在天，大人造也。
亢龙有悔，盈不可久也。
用九，天德不可为首也。`},{title:"文言（节录：乾卦相关）",text:"元者，善之长也。亨者，嘉之会也。利者，义之和也。贞者，事之干也。君子体仁足以长人，嘉会足以合礼，利物足以和义，贞固足以干事。君子行此四德者，故曰：「乾，元、亨、利、贞。」"}]},坤:{source:"维基文库《周易/坤》",url:"https://zh.wikisource.org/wiki/周易/坤",layers:[{title:"经文·卦辞",text:"坤：元亨。利牝马之贞。君子有攸往，先迷后得主，利。西南得朋，东北丧朋。安贞吉。"},{title:"经文·爻辞",text:`初六：履霜，坚冰至。
六二：直方大，不习无不利。
六三：含章可贞。或从王事，无成有终。
六四：括囊，无咎无誉。
六五：黄裳，元吉。
上六：龙战于野，其血玄黄。
用六：利永贞。`},{title:"彖传",text:"至哉坤元，万物资生，乃顺承天。坤厚载物，德合无疆。含弘光大，品物咸亨。牝马地类，行地无疆，柔顺利贞。君子攸行，先迷失道，后顺得常。西南得朋，乃与类行；东北丧朋，乃终有庆。安贞之吉，应地无疆。"},{title:"象传",text:`地势坤，君子以厚德载物。
履霜坚冰，阴始凝也。驯致其道，至坚冰也。
六二之动，直以方也。不习无不利，地道光也。
含章可贞，以时发也。或从王事，知光大也。
括囊无咎，慎不害也。
黄裳元吉，文在中也。
龙战于野，其道穷也。
用六永贞，以大终也。`}]},比:{source:"常先·易古籍书库《周易·比》",url:"https://changxianyi.com/guji/zhouyi/ws-20260914/gua-08/",layers:[{title:"经文·卦辞及爻辞",text:`比：吉。原筮元永贞，无咎。不宁方来，后夫凶。
初六：有孚，比之，无咎。有孚盈缶，终来有它，吉。
六二：比之自内，贞吉。
六三：比之匪人。
六四：外比之，贞吉。
九五：显比。王用三驱，失前禽，邑人不诫，吉。
上六：比之无首，凶。`},{title:"彖传",text:"比，吉也。比，辅也，下顺从也。原筮，元永贞，无咎，以刚中也。不宁方来，上下应也。后夫凶，其道穷也。"},{title:"象传",text:`地上有水，比；先王以建万国，亲诸侯。
比之初六，有它吉也。
比之自内，不自失也。
比之匪人，不亦伤乎！
外比于贤，以从上也。
显比之吉，位正中也。舍逆取顺，失前禽也。邑人不诫，上使中也。
比之无首，无所终也。`}]},履:{source:"常先·易古籍书库《周易·履》",url:"https://changxianyi.com/guji/zhouyi/ws-20260914/gua-10/",layers:[{title:"经文·卦辞及爻辞",text:`履虎尾，不咥人，亨。
初九：素履，往无咎。
九二：履道坦坦，幽人贞吉。
六三：眇能视，跛能履，履虎尾，咥人，凶。武人为于大君。
九四：履虎尾，愬愬终吉。
九五：夬履，贞厉。
上九：视履考祥，其旋元吉。`},{title:"彖传",text:"履，柔履刚也。说而应乎乾，是以履虎尾，不咥人，亨。刚中正，履帝位而不疚，光明也。"},{title:"象传",text:`上天下泽，履；君子以辨上下，定民志。
素履之往，独行愿也。
幽人贞吉，中不自乱也。
眇能视，不足以有明也。跛能履，不足以与行也。咥人之凶，位不当也。武人为于大君，志刚也。
愬愬终吉，志行也。
夬履贞厉，位正当也。
元吉在上，大有庆也。`}]},豫:{source:"常先·易古籍书库《周易·豫》",url:"https://changxianyi.com/guji/zhouyi/ws-20260914/gua-16/",layers:[{title:"经文·卦辞及爻辞",text:`豫：利建侯行师。
初六：鸣豫，凶。
六二：介于石，不终日，贞吉。
六三：盱豫，悔。迟有悔。
九四：由豫，大有得。勿疑。朋盍簪。
六五：贞疾，恒不死。
上六：冥豫，成有渝，无咎。`},{title:"彖传",text:"豫，刚应而志行，顺以动，豫。豫，顺以动，故天地如之，而况建侯行师乎？天地以顺动，故日月不过，而四时不忒；圣人以顺动，则刑罚清而民服。豫之时义大矣哉！"},{title:"象传",text:`雷出地奋，豫。先王以作乐崇德，殷荐之上帝，以配祖考。
初六鸣豫，志穷凶也。
不终日，贞吉；以中正也。
盱豫有悔，位不当也。
由豫，大有得；志大行也。
六五贞疾，乘刚也。恒不死，中未亡也。
冥豫在上，何可长也。`}]},节:{source:"常先·易古籍书库《周易·节》",url:"https://changxianyi.com/guji/zhouyi/ws-20260914/gua-60/",layers:[{title:"经文·卦辞及爻辞",text:`节：亨。苦节不可贞。
初九：不出户庭，无咎。
九二：不出门庭，凶。
六三：不节若，则嗟若，无咎。
六四：安节，亨。
九五：甘节，吉；往有尚。
上六：苦节，贞凶，悔亡。`},{title:"彖传",text:"节，亨，刚柔分，而刚得中。苦节不可贞，其道穷也。说以行险，当位以节，中正以通。天地节而四时成。节以制度，不伤财，不害民。"},{title:"象传",text:`泽上有水，节；君子以制数度，议德行。
不出户庭，知通塞也。
不出门庭，失时极也。
不节之嗟，又谁咎也。
安节之亨，承上道也。
甘节之吉，居位中也。
苦节贞凶，其道穷也。`}]},屯:{source:"维基文库《周易/屯》",url:"https://zh.wikisource.org/wiki/周易/屯",layers:[{title:"经文·卦辞及爻辞",text:`屯：元亨，利贞。勿用有攸往，利建侯。
初九：磐桓；利居贞，利建侯。
六二：屯如，邅如，乘马班如。匪寇婚媾。女子贞不字，十年乃字。
六三：即鹿无虞，惟入于林中，君子几，不如舍，往吝。
六四：乘马班如，求婚媾，往吉，无不利。
九五：屯其膏，小贞吉，大贞凶。
上六：乘马班如，泣血漣如。`},{title:"彖传",text:"屯，刚柔始交而难生。动乎险中，大亨贞。雷雨之动满盈，天造草昧，宜建侯而不宁。"},{title:"象传",text:`云雷，屯；君子以经綸。
虽磐桓，志行正也。以贵下贱，大得民也。
六二之难，乘刚也。十年乃字，反常也。
即鹿无虞，以从禽也。君子舍之，往吝穷也。
求而往，明也。
屯其膏，施未光也。
泣血漣如，何可长也。`}]},蒙:{source:"维基文库《周易/蒙》",url:"https://zh.wikisource.org/wiki/周易/蒙",layers:[{title:"经文·卦辞及爻辞",text:`蒙：亨。匪我求童蒙，童蒙求我。初筮告，再三瀆，瀆则不告。利贞。
初六：发蒙，利用刑人，用说桎梏；以往吝。
九二：包蒙，吉。納妇，吉；子克家。
六三：勿用取女，见金夫，不有躬，无攸利。
六四：困蒙，吝。
六五：童蒙，吉。
上九：击蒙，不利为寇，利禦寇。`},{title:"彖传",text:"蒙，山下有险，险而止，蒙。蒙亨，以亨行，时中也。匪我求童蒙，童蒙求我，志应也。初筮告，以刚中也。再三瀆，瀆则不告，瀆蒙也。蒙以養正，圣功也。"},{title:"象传",text:`山下出泉，蒙；君子以果行育德。
利用刑人，以正法也。
子克家，刚柔接也。
勿用取女，行不顺也。
困蒙之吝，独远实也。
童蒙之吉，顺以巽也。
利用禦寇，上下顺也。`}]},需:{source:"维基文库《周易/需》",url:"https://zh.wikisource.org/wiki/周易/需",layers:[{title:"经文·卦辞及爻辞",text:`需：有孚，光亨，贞吉。利涉大川。
初九：需于郊，利用恒，无咎。
九二：需于沙，小有言，终吉。
九三：需于泥，致寇至。
六四：需于血，出自穴。
九五：需于酒食，贞吉。
上六：入于穴，有不速之客三人来，敬之终吉。`},{title:"彖传",text:"需，须也，险在前也。刚健而不陷，其义不困穷矣。需有孚，光亨，贞吉，位乎天位，以正中也。利涉大川，往有功也。"},{title:"象传",text:`云上于天，需；君子以飲食宴乐。
需于郊，不犯难行也。利用恒，无咎，未失常也。
需于沙，衍在中也。虽小有言，以终吉也。
需于泥，灾在外也。自我致寇，敬慎不败也。
需于血，顺以听也。
酒食贞吉，以中正也。
不速之客来，敬之终吉。虽不当位，未大失也。`}]},讼:{source:"维基文库《周易/讼》",url:"https://zh.wikisource.org/wiki/周易/讼",layers:[{title:"经文·卦辞及爻辞",text:`訟：有孚，窒惕，中吉，终凶。利见大人，不利涉大川。
初六：不永所事，小有言，终吉。
九二：不克訟，归而逋，其邑人三百户，无眚。
六三：食旧德，贞厉，终吉；或从王事，无成。
九四：不克訟，复即命，渝，安贞吉。
九五：訟，元吉。
上九：或锡之鞶带，终朝三褫之。`},{title:"彖传",text:"訟，上刚下险，险而健，訟。訟有孚窒惕，中吉，刚来而得中也。终凶，訟不可成也。利见大人，尚中正也。不利涉大川，入于渊也。"},{title:"象传",text:`天与水违行，訟；君子以作事谋始。
不永所事，訟不可长也。虽小有言，其辯明也。
不克訟，归逋竄也。自下訟上，患至掇也。
食旧德，从上吉也。
复即命，渝安贞，不失也。
訟元吉，以中正也。
以訟受服，亦不足敬也。`}]},师:{source:"维基文库《周易/师》",url:"https://zh.wikisource.org/wiki/周易/师",layers:[{title:"经文·卦辞及爻辞",text:`师：贞，丈人吉，无咎。
初六：师出以律，否臧凶。
九二：在师中吉，无咎，王三锡命。
六三：师或輿尸，凶。
六四：师左次，无咎。
六五：田有禽，利執言，无咎。长子帥师，弟子輿尸，贞凶。
上六：大君有命，开国承家，小人勿用。`},{title:"彖传",text:"师，众也，贞正也，能以众正，可以王矣。刚中而应，行险而顺，以此毒天下而民从之，吉又何咎矣。"},{title:"象传",text:`地中有水，师；君子以容民畜众。
师出以律，失律凶也。
在师中吉，承天寵也。王三锡命，懷万邦也。
师或輿尸，大无功也。
左次无咎，未失常也。
长子帥师，以中行也。弟子輿尸，使不当也。
大君有命，以正功也。小人勿用，必乱邦也。`}]},小畜:{source:"常先·易古籍书库《周易·小畜》",url:"https://changxianyi.com/guji/zhouyi/ws-20260914/gua-09/",layers:[{title:"经文·卦辞及爻辞",text:`小畜：亨。密云不雨，自我西郊。
初九：复自道，何其咎，吉。
九二：牽复，吉。
九三：輿说輻，夫妻反目。
六四：有孚，血去惕出，无咎。
九五：有孚攣如，富以其邻。
上九：既雨既处，尚德载。妇贞厉，月几望，君子征凶。`},{title:"彖传",text:"小畜，柔得位而上下应之，曰小畜。健而巽，刚中而志行，乃亨。密云不雨，尚往也。自我西郊，施未行也。"},{title:"象传",text:`风行天上，小畜；君子以懿文德。
复自道，其义吉也。
牽复在中，亦不自失也。
夫妻反目，不能正室也。
有孚惕出，上合志也。
有孚攣如，不独富也。
既雨既处，德积载也。君子征凶，有所疑也。`}]},泰:{source:"维基文库《周易/泰》",url:"https://zh.wikisource.org/wiki/周易/泰",layers:[{title:"经文·卦辞及爻辞",text:`泰：小往大来，吉亨。
初九：拔茅茹，以其彙，征吉。
九二：包荒，用馮河，不遐遺。朋亡，得尚于中行。
九三：无平不陂，无往不复。艱贞无咎。勿恤其孚，于食有福。
六四：翩翩，不富以其邻，不戒以孚。
六五：帝乙归妹，以祉元吉。
上六：城复于隍，勿用师。自邑告命，贞吝。`},{title:"彖传",text:"泰，小往大来，吉亨。则是天地交而万物通也，上下交而其志同也。内阳而外阴，内健而外顺，内君子而外小人，君子道长，小人道消也。"},{title:"象传",text:`天地交，泰；后以财成天地之道，輔相天地之宜，以左右民。
拔茅征吉，志在外也。
包荒，得尚于中行，以光大也。
无往不复，天地际也。
翩翩不富，皆失实也。不戒以孚，中心愿也。
以祉元吉，中以行愿也。
城复于隍，其命乱也。`}]},否:{source:"维基文库《周易/否》",url:"https://zh.wikisource.org/wiki/周易/否",layers:[{title:"经文·卦辞及爻辞",text:`否：否之匪人，不利君子贞，大往小来。
初六：拔茅茹，以其彙，贞吉亨。
六二：包承，小人吉，大人否亨。
六三：包羞。
九四：有命无咎，疇离祉。
九五：休否，大人吉。其亡其亡，繫于苞桑。
上九：傾否，先否后喜。`},{title:"彖传",text:"否之匪人，不利君子贞，大往小来。则是天地不交而万物不通也，上下不交而天下无邦也。内阴而外阳，内柔而外刚，内小人而外君子。小人道长，君子道消也。"},{title:"象传",text:`天地不交，否；君子以俭德辟难，不可榮以禄。
拔茅贞吉，志在君也。
大人否亨，不乱群也。
包羞，位不当也。
有命无咎，志行也。
大人之吉，位正当也。
否终则傾，何可长也。`}]},同人:{source:"维基文库《周易/同人》",url:"https://zh.wikisource.org/wiki/周易/同人",layers:[{title:"经文·卦辞及爻辞",text:`同人：同人于野，亨。利涉大川，利君子贞。
初九：同人于门，无咎。
六二：同人于宗，吝。
九三：伏戎于莽，升其高陵，三岁不兴。
九四：乘其墉，弗克攻，吉。
九五：同人，先号咷而后笑。大师克相遇。
上九：同人于郊，无悔。`},{title:"彖传",text:"同人，柔得位得中而应乎乾，曰同人。同人曰，同人于野，亨，利涉大川，乾行也。文明以健，中正而应，君子正也。唯君子为能通天下之志。"},{title:"象传",text:`天与火，同人；君子以类族辨物。
出门同人，又谁咎也。
同人于宗，吝道也。
伏戎于莽，敵刚也。三岁不兴，安行也。
乘其墉，义弗克也。其吉，则困而反则也。
同人之先，以中直也。大师相遇，言相克也。
同人于郊，志未得也。`}]},大有:{source:"维基文库《周易/大有》",url:"https://zh.wikisource.org/wiki/周易/大有",layers:[{title:"经文·卦辞及爻辞",text:`大有：元亨。
初九：无交害，匪咎，艱则无咎。
九二：大车以载，有攸往，无咎。
九三：公用亨于天子，小人弗克。
九四：匪其彭，无咎。
六五：厥孚交如，威如，吉。
上九：自天祐之，吉无不利。`},{title:"彖传",text:"大有，柔得尊位，大中而上下应之，曰大有。其德刚健而文明，应乎天而时行，是以元亨。"},{title:"象传",text:`火在天上，大有；君子以遏恶揚善，顺天休命。
大有初九，无交害也。
大车以载，积中不败也。
公用亨于天子，小人害也。
匪其彭，无咎；明辨晳也。
厥孚交如，信以发志也。威如之吉，易而无備也。
大有上吉，自天祐也。`}]},谦:{source:"维基文库《周易/谦》",url:"https://zh.wikisource.org/wiki/周易/谦",layers:[{title:"经文·卦辞及爻辞",text:`谦：亨，君子有终。
初六：谦谦君子，用涉大川，吉。
六二：鸣谦，贞吉。
九三：劳谦，君子有终，吉。
六四：无不利，撝谦。
六五：不富以其邻，利用侵伐，无不利。
上六：鸣谦，利用行师，征邑国。`},{title:"彖传",text:"谦，亨。天道下濟而光明，地道卑而上行。天道亏盈而益谦，地道变盈而流谦，鬼神害盈而福谦，人道恶盈而好谦。谦尊而光，卑而不可踰，君子之终也。"},{title:"象传",text:`地中有山，谦；君子以裒多益寡，称物平施。
谦谦君子，卑以自牧也。
鸣谦贞吉，中心得也。
劳谦君子，万民服也。
无不利，撝谦；不违则也。
利用侵伐，征不服也。
鸣谦，志未得也。可用行师，征邑国也。`}]},随:{source:"维基文库《周易/随》",url:"https://zh.wikisource.org/wiki/周易/随",layers:[{title:"经文·卦辞及爻辞",text:`隨：元亨利贞，无咎。
初九：官有渝，贞吉。出门交有功。
六二：係小子，失丈夫。
六三：係丈夫，失小子。隨有求得，利居贞。
九四：隨有獲，贞凶。有孚在道，以明，何咎。
九五：孚于嘉，吉。
上六：拘係之，乃从維之。王用亨于西山。`},{title:"彖传",text:"隨，刚来而下柔，动而说，隨。大亨贞，无咎，而天下隨时。隨时之义大矣哉！"},{title:"象传",text:`澤中有雷，隨；君子以向晦入宴息。
官有渝，从正吉也。出门交有功，不失也。
係小子，弗兼与也。
係丈夫，志舍下也。
隨有獲，其义凶也。有孚在道，明功也。
孚于嘉吉，位正中也。
拘係之，上穷也。`}]},颐:{source:"常先·易古籍书库《周易·颐》",url:"https://changxianyi.com/guji/zhouyi/ws-20260914/gua-27/",layers:[{title:"经文·卦辞及爻辞",text:`颐：贞吉。观頤，自求口实。
初九：舍尔靈龟，观我朵頤，凶。
六二：顛頤，拂经，于丘頤，征凶。
六三：拂頤，贞凶，十年勿用，无攸利。
六四：顛頤吉，虎视眈眈，其欲逐逐，无咎。
六五：拂经，居贞吉，不可涉大川。
上九：由頤，厉吉，利涉大川。`},{title:"彖传",text:"頤贞吉，養正则吉也。观頤，观其所養也；自求口实，观其自養也。天地養万物，圣人養贤，以及万民；頤之时义大矣哉！"},{title:"象传",text:`山下有雷，頤；君子以慎言语，节飲食。
观我朵頤，亦不足贵也。
六二征凶，行失类也。
十年勿用，道大悖也。
顛頤之吉，上施光也。
居贞之吉，顺以从上也。
由頤厉吉，大有庆也。`}]},未济:{source:"常先·易古籍书库《周易·未济》",url:"https://changxianyi.com/guji/zhouyi/ws-20260914/gua-64/",layers:[{title:"经文·卦辞及爻辞",text:`未濟：亨。小狐汔濟，濡其尾，无攸利。
初六：濡其尾，吝。
九二：曳其轮，贞吉。
六三：未濟，征凶，利涉大川。
九四：贞吉，悔亡，震用伐鬼方，三年有赏于大国。
六五：贞吉，无悔，君子之光，有孚，吉。
上九：有孚于飲酒，无咎，濡其首，有孚失是。`},{title:"彖传",text:"未濟，亨；柔得中也。小狐汔濟，未出中也。濡其尾，无攸利；不续终也。虽不当位，刚柔应也。"},{title:"象传",text:`火在水上，未濟；君子以慎辨物居方。
濡其尾，亦不知极也。
九二贞吉，中以行正也。
未濟征凶，位不当也。
贞吉悔亡，志行也。
君子之光，其暉吉也。
飲酒濡首，亦不知节也。`}]},蛊:{source:"维基文库《周易/蠱》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E8%A0%B1",layers:[{title:"经文·卦辞及爻辞",text:`蠱：元亨。利涉大川。先甲三日，后甲三日。
初六：干父之蠱，有子考，无咎，厉终吉。
九二：干母之蠱，不可贞。
九三：干父之蠱，小有悔，无大咎。
六四：裕父之蠱，往见吝。
六五：干父之蠱，用誉。
上九：不事王侯，高尚其事。`},{title:"彖传",text:"蠱，刚上而柔下，巽而止，蠱。蠱，元亨，而天下治也。利涉大川，往有事也。先甲三日，后甲三日，终则有始，天行也。"},{title:"象传",text:`山下有风，蠱；君子以振民育德。
干父之蠱，意承考也。
干母之蠱，得中道也。
干父之蠱，终无咎也。
裕父之蠱，往未得也。
干父用誉，承以德也。
不事王侯，志可则也。`}]},临:{source:"维基文库《周易/臨》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E8%87%A8",layers:[{title:"经文·卦辞及爻辞",text:`臨：元亨。利贞。至于八月有凶。
初九：咸臨，贞吉。
九二：咸臨，吉无不利。
六三：甘臨，无攸利。既忧之，无咎。
六四：至臨，无咎。
六五：知臨，大君之宜，吉。
上六：敦臨，吉无咎。`},{title:"彖传",text:"臨，刚浸而长。说而顺，刚中而应，大亨以正，天之道也。至于八月有凶，消不久也。"},{title:"象传",text:`澤上有地，臨；君子以教思无穷，容保民无疆。
咸臨贞吉，志行正也。
咸臨，吉无不利；未顺命也。
甘臨，位不当也。既忧之，咎不长也。
至臨无咎，位当也。
大君之宜，行中之谓也。
敦臨之吉，志在内也。`}]},观:{source:"维基文库《周易/观》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E8%A7%80",layers:[{title:"经文·卦辞及爻辞",text:`观：盥而不薦，有孚顒若。
初六：童观，小人无咎，君子吝。
六二：窺观，利女贞。
六三：观我生，进退。
六四：观国之光，利用宾于王。
九五：观我生，君子无咎。
上九：观其生，君子无咎。`},{title:"彖传",text:"大观在上，顺而巽，中正以观天下。观，盥而不薦，有孚顒若，下观而化也。观天之神道，而四时不忒，圣人以神道设教，而天下服矣。"},{title:"象传",text:`风行地上，观；先王以省方，观民设教。
初六童观，小人道也。
窺观女贞，亦可丑也。
观我生，进退；未失道也。
观国之光，尚宾也。
观我生，观民也。
观其生，志未平也。`}]},噬嗑:{source:"维基文库《周易/噬嗑》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%99%AC%E5%97%91",layers:[{title:"经文·卦辞及爻辞",text:`噬嗑：亨。利用獄。
初九：屨校灭趾，无咎。
六二：噬膚灭鼻，无咎。
六三：噬昔一作「臘」肉，遇毒；小吝，无咎。
九四：噬乾胏，得金矢，利艱贞，吉。
六五：噬乾肉，得黄金，贞厉，无咎。
上九：何校灭耳，凶。`},{title:"彖传",text:"頤中有物，曰噬嗑，噬嗑而亨。刚柔分，动而明，雷电合而章。柔得中而上行，虽不当位，利用獄也。"},{title:"象传",text:`雷电噬嗑；先王以明罚敕法。
屨校灭趾，不行也。
噬膚灭鼻，乘刚也。
遇毒，位不当也。
利艱贞吉，未光也。
贞厉无咎，得当也。
何校灭耳，聪不明也。`}]},贲:{source:"维基文库《周易/賁》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E8%B3%81",layers:[{title:"经文·卦辞及爻辞",text:`賁：亨。小利有攸往。
初九：賁其趾，舍车而徒。
六二：賁其须。
九三：賁如濡如，永贞吉。
六四：賁如皤如，白马翰如，匪寇婚媾。
六五：賁于丘园，束帛戔戔，吝，终吉。
上九：白賁，无咎。`},{title:"彖传",text:"賁，亨；柔来而文刚，故亨。分刚上而文柔，故小利有攸往。刚柔交错，天文也；文明以止，人文也。观乎天文，以察时变；观乎人文，以化成天下。"},{title:"象传",text:`山下有火，賁；君子以明庶政，无敢折獄。
舍车而徒，义弗乘也。
賁其须，与上兴也。
永贞之吉，终莫之陵也。
六四，当位疑也。匪寇婚媾，终无尤也。
六五之吉，有喜也。
白賁无咎，上得志也。`}]},剥:{source:"维基文库《周易/剝》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%89%9D",layers:[{title:"经文·卦辞及爻辞",text:`剝：不利。有攸往。
初六：剝牀以足，蔑贞凶。
六二：剝牀以辨，蔑贞凶。
六三：剝之，无咎。
六四：剝牀以膚，凶。
六五：貫鱼，以宫人寵，无不利。
上九：碩果不食，君子德车一作「得輿」，小人剝廬。`},{title:"彖传",text:"剝，剝也，柔变刚也。不利有攸往，小人长也。顺而止之，观象也。君子尚消息盈虚，天行也。"},{title:"象传",text:`山附地上，剝；上以厚下，安宅。
剝牀以足，以灭下也。
剝牀以辨，未有与也。
剝之无咎，失上下也。
剝牀以膚，切近灾也。
以宫人寵，终无尤也。
君子得輿，民所载也。小人剝廬，终不可用也。`}]},复:{source:"维基文库《周易/复》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%BE%A9",layers:[{title:"经文·卦辞及爻辞",text:`复：亨。出入无疾，朋来无咎。反复其道，七日来复，利有攸往。
初九：不远复，无只悔，元吉。
六二：休复，吉。
六三：頻复，厉无咎。
六四：中行独复。
六五：敦复，无悔。
上六：迷复，凶，有灾眚。用行师，终有大败，以其国君，凶；至于十年，不克征。`},{title:"彖传",text:"复亨；刚反，动而以顺行，是以出入无疾，朋来无咎。反复其道，七日来复，天行也。利有攸往，刚长也。复其见天地之心乎？"},{title:"象传",text:`雷在地中，复；先王以至日闭关，商旅不行，后不省方。
不远之复，以修身也。
休复之吉，以下仁也。
頻复之厉，义无咎也。
中行独复，以从道也。
敦复无悔，中以自考也。
迷复之凶，反君道也。`}]},无妄:{source:"维基文库《周易/无妄》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E6%97%A0%E5%A6%84",layers:[{title:"经文·卦辞及爻辞",text:`无妄：元亨。利贞。其匪正有眚，不利有攸往。
初九：无妄，往吉。
六二：不耕穫，不菑畬，则利有攸往。
六三：无妄之灾，或繫之牛，行人之得，邑人之灾。
九四：可贞，无咎。
九五：无妄之疾，勿药有喜。
上九：无妄，行有眚，无攸利。`},{title:"彖传",text:"无妄，刚自外来，而为主于内。动而健，刚中而应，大亨以正，天之命也。其匪正有眚，不利有攸往。无妄之往，何之矣？ 天命不佑，行矣哉？"},{title:"象传",text:`天下雷行，物与无妄；先王以茂对时，育万物。
无妄之往，得志也。
不耕穫，未富也。
行人得牛，邑人灾也。
可贞无咎，固有之也。
无妄之药，不可試也。
无妄之行，穷之灾也。`}]},大畜:{source:"维基文库《周易/大畜》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%A4%A7%E7%95%9C",layers:[{title:"经文·卦辞及爻辞",text:`大畜：利贞，不家食吉，利涉大川。
初九：有厉利已。
九二：輿说輹一作「腹」。
九三：良马逐，利艱贞，吉。日閑輿卫，利有攸往。
六四：童牛之告一作「牿」，元吉。
六五：豶豕之牙，吉。
上九：何天之衢，亨。`},{title:"彖传",text:"大畜，刚健笃实輝光，日新其德，刚上而尚贤。能止健，大正也。不家食吉，養贤也。利涉大川，应乎天也。"},{title:"象传",text:`天在山中，大畜；君子以多识前言往行，以畜其德。
有厉利已，不犯灾也。
輿说輹，中无尤也。
利有攸往，上合志也。
六四元吉，有喜也。
六五之吉，有庆也。
何天之衢，道大行也。`}]},大过:{source:"维基文库《周易/大过》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%A4%A7%E9%81%8E",layers:[{title:"经文·卦辞及爻辞",text:`大过：棟橈，利有攸往，亨。
初六：藉用白茅，无咎。
九二：枯楊生稊，老夫得其女妻，无不利。
九三：棟橈，凶。
九四：棟隆，吉。有它吝。
九五：枯楊生華，老妇得其士夫，无咎无誉。
上六：过涉灭頂，凶，无咎。`},{title:"彖传",text:"大过，大者过也。棟橈，本末弱也。刚过而中，巽而说行，利有攸往，乃亨。大过之时大矣哉！"},{title:"象传",text:`澤灭木，大过。君子以独立不懼，遯世无悶。
藉用白茅，柔在下也。
老夫女妻，过以相与也。
棟橈之凶，不可以有輔也。
棟隆之吉，不橈乎下也。
枯楊生華，何可久也。老妇士夫，亦可丑也。
过涉之凶，不可咎也。`}]},坎:{source:"维基文库《周易/坎》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%9D%8E",layers:[{title:"经文·卦辞及爻辞",text:`习坎：有孚，維心亨。行有尚。
初六：习坎，入于坎窞，凶。
九二：坎有险，求小得。
六三：来之坎坎，险且枕，入于坎窞，勿用。
六四：尊酒簋，貳用缶。内约自牖一作「樽酒簋貳，用缶，納约自牖」，终无咎。
九五：坎不盈，禔一作「祗」既平，无咎。
上六：係用徽纆，寘于叢棘，三岁不得，凶。`},{title:"彖传",text:"习坎，重险也。水流而不盈，行险而不失其信。維心亨，乃以刚中也。行有尚，往有功也。天险不可升也，地险山川丘陵也，王公设险以守其国，坎之时用大矣哉！"},{title:"象传",text:`水洊至，习坎；君子以常德行，习教事。
习坎入坎，失道凶也。
求小得，未出中也。
来之坎坎，终无功也。
樽酒簋貳，刚柔济也。
坎不盈，中未大也。
上六失道，凶三岁也。`}]},离:{source:"维基文库《周易/离》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E9%9B%A2",layers:[{title:"经文·卦辞及爻辞",text:`离：利贞。亨。畜牝牛，吉。
初九：履错然，敬之无咎。
六二：黄离，元吉。
九三：日昃之离，不鼓缶而歌，则大耋之差一作「嗟」，凶。
九四：突如其来如，焚如，死如，棄如。
六五：出涕沱若，戚嗟若，吉。
上九：王用出征，有嘉折首，獲匪其丑，无咎。`},{title:"彖传",text:"离，麗也；日月麗乎天，百谷草木麗乎土，重明以麗乎正，乃化成天下。柔麗乎中正，故亨；是以畜牝牛吉也。"},{title:"象传",text:`明两作离，大人以繼明照于四方。
履错之敬，以辟咎也。
黄离元吉，得中道也。
日昃之离，何可久也。
突如其来如，无所容也。
六五之吉，离王公也。
王用出征，以正邦也。`}]},咸:{source:"维基文库《周易/咸》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%92%B8",layers:[{title:"经文·卦辞及爻辞",text:`咸：亨。利贞。取女吉。
初六：咸其拇一作「母」。
六二：咸其腓，凶，居吉。
九三：咸其股，執其隨，往吝。
九四：贞吉悔亡，憧憧往来，朋从尔思。
九五：咸其脢，无悔。
上六：咸其輔，頰，舌。`},{title:"彖传",text:"咸，感也。柔上而刚下，二气感应以相与，止而说，男下女，是以亨利贞，取女吉也。天地感而万物化生，圣人感人心而天下和平；观其所感，而天地万物之情可见矣！"},{title:"象传",text:`山上有澤，咸；君子以虚受人。
咸其拇，志在外也。
虽凶，居吉，顺不害也。
咸其股，亦不处也。志在隨人，所執下也。
贞吉悔亡，未感害也。憧憧往来，未光大也。
咸其脢，志末也。
咸其輔，頰，舌，滕口说也。`}]},恒:{source:"维基文库《周易/恒》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E6%81%92",layers:[{title:"经文·卦辞及爻辞",text:`恒：亨，无咎。利贞，利有攸往。
初六：浚恒，贞凶，无攸利。
九二：悔亡。
九三：不恒其德，或承之羞，贞吝。
九四：田无禽。
六五：恒其德，贞，妇人吉，夫子凶。
上六：震一作「振」恒，凶。`},{title:"彖传",text:"恒，久也。刚上而柔下，雷风相与，巽而动，刚柔皆应，恒。恒亨无咎，利贞；久于其道也，天地之道，恒久而不已也。利有攸往，终则有始也。日月得天，而能久照，四时变化，而能久成，圣人久于其道，而天下化成；观其所恒，而天地万物之情可见矣！"},{title:"象传",text:`雷风，恒；君子以立不易方。
浚恒之凶，始求深也。
九二悔亡，能久中也。
不恒其德，无所容也。
久非其位，安得禽也。
妇人贞吉，从一而终也。夫子制义，从妇凶也。
振恒在上，大无功也。`}]},遁:{source:"维基文库《周易/遯》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E9%81%AF",layers:[{title:"经文·卦辞及爻辞",text:`遯：亨。小利贞。
初六：遯尾，厉，勿用有攸往。
六二：執之用黄牛之革，莫之胜说。
九三：係遯，有疾厉，畜臣妾吉。
九四：好遯君子吉，小人否。
九五：嘉遯，贞吉。
上九：肥遯，无不利。`},{title:"彖传",text:"遯亨，遯而亨也。刚当位而应，与时行也。小利贞，浸而长也。遯之时义大矣哉！"},{title:"象传",text:`天下有山，遯；君子以远小人，不恶而嚴。
遯尾之厉，不往何灾也。
執用黄牛，固志也。
係遯之厉，有疾憊也。畜臣妾吉，不可大事也。
君子好遯，小人否也。
嘉遯贞吉，以正志也。
肥遯，无不利；无所疑也。`}]},大壮:{source:"维基文库《周易/大壯》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%A4%A7%E5%A3%AF",layers:[{title:"经文·卦辞及爻辞",text:`大壯：利贞。
初九：壯于趾，征凶，有孚。
九二：贞吉。
九三：小人用壯，君子用罔，贞厉。羝羊觸藩，羸其角。
九四：贞吉悔亡，藩决不羸，壯于大轝一作「輿」之腹一作「輹」。
六五：丧羊于易，无悔。
上六：羝羊觸藩，不能退，不能遂，无攸利，艱则吉。`},{title:"彖传",text:"大壯，大者壯也。刚以动，故壯。大壯利贞；大者正也。正大而天地之情可见矣！"},{title:"象传",text:`雷在天上，大壯；君子以非礼弗履。
壯于趾，其孚穷也。
九二贞吉，以中也。
小人用壯，君子罔也。
藩决不羸，尚往也。
丧羊于易，位不当也。
不能退，不能遂，不詳也。艱则吉，咎不长也。`}]},晋:{source:"维基文库《周易/晉》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E6%99%89",layers:[{title:"经文·卦辞及爻辞",text:`晉：康侯用锡马蕃庶，晝日三接。
初六：晉如，摧如，贞吉。罔孚，裕无咎。
六二：晉如，愁如，贞吉。受茲介福，于其王母。
六三：众允，悔亡。
九四：晉如鼫一作「碩」鼠，贞厉。
六五：悔亡，矢一作「失」得勿恤，往吉无不利。
上九：晉其角，維用伐邑，厉吉无咎，贞吝。`},{title:"彖传",text:"晉，进也。明出地上，顺而麗乎大明，柔进而上行。是以康侯用锡马蕃庶，晝日三接也。"},{title:"象传",text:`明出地上，晉；君子以自昭明德。
晉如，摧如；独行正也。裕无咎；未受命也。
受茲介福，以中正也。
众允之志，上行也。
鼫鼠贞厉，位不当也。
失得勿恤，往有庆也。
維用伐邑，道未光也。`}]},明夷:{source:"维基文库《周易/明夷》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E6%98%8E%E5%A4%B7",layers:[{title:"经文·卦辞及爻辞",text:`明夷：利艱贞。
初九：明夷于飞，垂其翼。君子于行，三日不食，有攸往，主人有言。
六二：明夷，夷于左股，用拯马壯，吉。
九三：明夷于南狩，得其大首，不可疾贞。
六四：入于左腹，獲明夷之心，于出门庭。
六五：箕子之明夷，利贞。
上六：不明晦，初登于天，后入于地。`},{title:"彖传",text:"明入地中，明夷。内文明而外柔顺，以蒙大难，文王以之。利艱贞，晦其明也，内难而能正其志，箕子以之。"},{title:"象传",text:`明入地中，明夷；君子以蒞众，用晦而明。
君子于行，义不食也。
六二之吉，顺以则也。
南狩之志，乃大得也。
入于左腹，獲心意也。
箕子之贞，明不可息也。
初登于天，照四国也。后入于地，失则也。`}]},家人:{source:"维基文库《周易/家人》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%AE%B6%E4%BA%BA",layers:[{title:"经文·卦辞及爻辞",text:`家人：利女贞。
初九：閑有家，悔亡。
六二：无攸遂，在中饋，贞吉。
九三：家人嗃嗃，悔厉吉；妇子嘻嘻，终吝。
六四：富家，大吉。
九五：王假有家，勿恤。吉。
上九：有孚威如，终吉。`},{title:"彖传",text:"家人，女正位乎内，男正位乎外，男女正，天地之大义也。家人有嚴君焉，父母之谓也。父父，子子，兄兄，弟弟，夫夫，妇妇，而家道正；正家而天下定矣。"},{title:"象传",text:`风自火出，家人；君子以言有物，而行有恒。
閑有家，志未变也。
六二之吉，顺以巽也。
家人嗃嗃，未失也；妇子嘻嘻，失家节也。
富家大吉，顺在位也。
王假有家，交相爱也。
威如之吉，反身之谓也。`}]},睽:{source:"维基文库《周易/睽》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E7%9D%BD",layers:[{title:"经文·卦辞及爻辞",text:`睽：小事吉。
初九：悔亡，丧马勿逐，自复；见恶人无咎。
九二：遇主于巷，无咎。
六三：见輿曳，其牛𧤊一作「掣」，其人天且劓，无初有终。
九四：睽孤，遇元夫，交孚，厉无咎。
六五：悔亡，厥宗噬膚，往何咎。
上九：睽孤， 见豕负涂，载鬼一车， 先张之弧，后说之弧，匪寇婚媾，往遇雨则吉。`},{title:"彖传",text:"睽，火动而上，澤动而下；二女同居，其志不同行；说而麗乎明，柔进而上行，得中而应乎刚；是以小事吉。天地睽，而其事同也；男女睽，而其志通也；万物睽，而其事类也；睽之时用大矣哉！"},{title:"象传",text:`上火下澤，睽；君子以同而異。
见恶人，以辟咎也。
遇主于巷，未失道也。
见輿曳，位不当也。无初有终，遇刚也。
交孚无咎，志行也。
厥宗噬膚，往有庆也。
遇雨之吉，群疑亡也。`}]},蹇:{source:"维基文库《周易/蹇》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E8%B9%87",layers:[{title:"经文·卦辞及爻辞",text:`蹇：利西南，不利东北；利见大人，贞吉。
初六：往蹇，来誉。
六二：王臣蹇蹇，匪躬之故。
九三：往蹇来反。
六四：往蹇来連。
九五：大蹇朋来。
上六：往蹇来碩，吉；利见大人。`},{title:"彖传",text:"蹇，难也，险在前也。见险而能止，知矣哉！蹇利西南，往得中也；不利东北，其道穷也。利见大人，往有功也。当位贞吉，以正邦也。蹇之时用大矣哉！"},{title:"象传",text:`山上有水，蹇；君子以反身修德。
往蹇来誉，宜待也。
王臣蹇蹇，终无尤也。
往蹇来反，内喜之也。
往蹇来連，当位实也。
大蹇朋来，以中节也。
往蹇来碩，志在内也。利见大人，以从贵也。`}]},解:{source:"维基文库《周易/解》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E8%A7%A3",layers:[{title:"经文·卦辞及爻辞",text:`解：利西南，无所往，其来复吉。有攸往，夙吉。
初六：无咎。
九二：田獲三狐，得黄矢，贞吉。
六三：负且乘，致寇至，贞吝。
九四：解而拇，朋至斯孚。
六五：君子惟一作「維」有解，吉；有孚于小人。
上六：公用射隼，于高墉一作「庸」之上，獲之，无不利。`},{title:"彖传",text:"解，险以动，动而免乎险，解。解利西南，往得众也。其来复吉，乃得中也。有攸往夙吉，往有功也。天地解，而雷雨作，雷雨作，而百果草木皆甲坼，解之时义大矣哉！"},{title:"象传",text:`雷雨作，解；君子以赦过宥罪。
刚柔之际，义无咎也。
九二贞吉，得中道也。
负且乘，亦可丑也，自我致戎，又谁咎也。
解而拇，未当位也。
君子有解，小人退也。
公用射隼，以解悖也。`}]},损:{source:"维基文库《周易/损》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E6%90%8D",layers:[{title:"经文·卦辞及爻辞",text:`损：有孚，元吉。无咎，可贞，利有攸往。曷之用？二簋可用享。
初九：祀一作「已」事遄往，无咎，酌损之。
九二：利贞，征凶，弗损益之。
六三：三人行，则损一人；一人行，则得其友。
六四：损其疾，使遄有喜，无咎。
六五：或益之，十朋之龟弗克违，元吉。
上九：弗损益之，无咎，贞吉，利有攸往，得臣无家。`},{title:"彖传",text:"损，损下益上，其道上行。损而有孚，元吉，无咎，可贞，利有攸往。曷之用？二簋可用享；二簋应有时。损刚益柔有时，损益盈虚，与时偕行。"},{title:"象传",text:`山下有澤，损；君子以惩忿窒欲。
已事遄往，尚合志也。
九二利贞，中以为志也。
一人行，三则疑也。
损其疾，亦可喜也。
六五元吉，自上佑也。
弗损益之，大得志也。`}]},益:{source:"维基文库《周易/益》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E7%9B%8A",layers:[{title:"经文·卦辞及爻辞",text:`益：利有攸往。利涉大川。
初九：利用为大作，元吉，无咎。
六二：或益之，十朋之龟弗克违，永贞吉。王用享于帝，吉。
六三：益之用凶事，无咎。有孚中行，告公用圭。
六四：中行，告公从。利用为依遷国一作「邦」。
九五：有孚惠心，勿问元吉。有孚惠我德。
上九：莫益之，或击之，立心勿恒，凶。`},{title:"彖传",text:"益，损上益下，民说无疆，自上下下，其道大光。利有攸往，中正有庆。利涉大川，木道乃行。益动而巽，日进无疆。天施地生，其益无方。凡益之道，与时偕行。"},{title:"象传",text:`风雷，益；君子以见善则遷，有过则改。
元吉无咎，下不厚事也。
或益之，自外来也。
益用凶事，固有之也。
告公从，以益志也。
有孚惠心，勿问之矣。惠我德，大得志也。
莫益之，偏辞也。或击之，自外来也。`}]},夬:{source:"维基文库《周易/夬》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%A4%AC",layers:[{title:"经文·卦辞及爻辞",text:`夬：揚于王庭，孚号，有厉，告自邑，不利即戎，利有攸往。
初九：壯于前趾，往不胜为咎。
九二：惕号，莫夜有戎，勿恤。
九三：壯于頄，有凶。君子夬夬，独行遇雨，若濡有愠，无咎。
九四：臀无膚，其行次且。牽羊悔亡，聞言不信。
九五：莧陸夬夬，中行无咎。
上六：无号，终有凶。`},{title:"彖传",text:"夬，决也，刚决柔也。健而说，决而和，揚于王庭，柔乘五刚也。孚号有厉，其危乃光也。告自邑，不利即戎，所尚乃穷也。利有攸往，刚长乃终也。"},{title:"象传",text:`澤上于天，夬；君子以施禄及下，居德则忌。
不胜而往，咎也。
莫夜有戎，得中道也。
君子夬夬，终无咎也。
其行次且，位不当也。聞言不信，聪不明也。
中行无咎，中未光也。
无号之凶，终不可长也。`}]},姤:{source:"维基文库《周易/姤》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%A7%A4",layers:[{title:"经文·卦辞及爻辞",text:`姤：女壯，勿用取女。
初六：系于金柅，贞吉，有攸往，见凶，羸豕，孚，蹢躅一作「𨅙𨄃」。
九二：包有鱼，无咎，不利宾。
九三：臀无膚，其行次且，厉，无大咎。
九四：包无鱼，起凶。
九五：以杞包一作「苞」瓜，含章，有隕自天。
上九：姤其角，吝，无咎。`},{title:"彖传",text:"姤，遇也，柔遇刚也。勿用取女，不可与长也。天地相遇，品物咸章也。刚遇中正，天下大行也。姤之时义大矣哉！"},{title:"象传",text:`天下有风，姤；后以施命誥四方。
系于金柅，柔道牽也。
包有鱼，义不及宾也。
其行次且，行未牽也。
无鱼之凶，远民也。
九五含章，中正也。有隕自天，志不舍命也。
姤其角，上穷吝也。`}]},萃:{source:"维基文库《周易/萃》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E8%90%83",layers:[{title:"经文·卦辞及爻辞",text:`萃：王假有廟，利见大人，亨。利贞。用大牲吉，利有攸往。
初六：有孚不终，乃乱乃萃，若号一握为笑，勿恤，往无咎。
六二：引吉，无咎，孚乃利用禴。
六三：萃如，嗟如，无攸利，往无咎，小吝。
九四：大吉，无咎。
九五：萃有位，无咎。匪孚，元永贞，悔亡。
上六：齎资一作「咨」涕洟，无咎。`},{title:"彖传",text:"萃，聚也；顺以说，刚中而应，故聚也。王假有廟，致孝享也。利见大人亨，聚以正也。用大牲吉，利有攸往，顺天命也。观其所聚，而天地万物之情可见矣。"},{title:"象传",text:`澤上于地，萃；君子以除戎器，戒不虞。
乃乱乃萃，其志乱也。
引吉无咎，中未变也。
往无咎，上巽也。
大吉无咎，位不当也。
萃有位，志未光也。
齎咨涕洟，未安上也。`}]},升:{source:"维基文库《周易/升》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%8D%87",layers:[{title:"经文·卦辞及爻辞",text:`升：元亨，用见大人，勿恤，南征吉。
初六：允升，大吉。
九二：孚乃利用禴，无咎。
九三：升虚邑。
六四：王用享一作「亨」于岐山，吉无咎。
六五：贞吉，升阶。
上六：冥升，利于不息之贞。`},{title:"彖传",text:"柔以时升，巽而顺，刚中而应，是以大亨。用见大人，勿恤；有庆也。南征吉，志行也。"},{title:"象传",text:`地中生木，升；君子以顺德，积小以高大。
允升大吉，上合志也。
九二之孚，有喜也。
升虚邑，无所疑也。
王用亨于岐山，顺事也。
贞吉升阶，大得志也。
冥升在上，消不富也。`}]},困:{source:"维基文库《周易/困》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%9B%B0",layers:[{title:"经文·卦辞及爻辞",text:`困：亨，贞大人吉，无咎，有言不信。
初六：臀困于株木，入于幽谷，三岁不覿。
九二：困于酒食，朱紱方来，利用亨祀，征凶，无咎。
六三：困于石，据于蒺蔾一作「藜」，入于其宫，不见其妻，凶。
九四：来荼荼一作「徐徐」，困于金轝一作「车」，吝，有终。
九五：劓刖，困于赤紱，乃徐有说，利用祭祀。
上六：困于葛藟，于臲卼，曰动悔。有悔，征吉。`},{title:"彖传",text:"困，刚掩也。险以说，困而不失其所，亨；其唯君子乎？ 贞大人吉，以刚中也。有言不信，尚口乃穷也。"},{title:"象传",text:`澤无水，困；君子以致命遂志。
入于幽谷，幽不明也。
困于酒食，中有庆也。
据于蒺藜，乘刚也。入于其宫，不见其妻，不祥也。
来徐徐，志在下也。虽不当位，有与也。
劓刖，志未得也。乃徐有说，以中直也。利用祭祀，受福也。
困于葛藟，未当也。动悔，有悔，吉行也。`}]},井:{source:"维基文库《周易/井》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E4%BA%95",layers:[{title:"经文·卦辞及爻辞",text:`井：改邑不改井，无丧无得，往来井井。汔至亦未繘井。羸其瓶，凶。
初六：井泥不食，旧井无禽。
九二：井谷射鲋，瓮敝漏。
九三：井渫不食，为我心惻，可用汲，王明，並受其福。
六四：井甃，无咎。
九五：井冽，寒泉食。
上六：井收勿幕，有孚元吉。`},{title:"彖传",text:"巽乎水而上水，井；井養而不穷也。改邑不改井，乃以刚中也。汔至亦未繘井，未有功也。羸其瓶，是以凶也。"},{title:"象传",text:`木上有水，井；君子以劳民勸相。
井泥不食，下也。旧井无禽，时舍也。
井谷射鲋，无与也。
井渫不食，行惻也。求王明，受福也。
井甃无咎，修井也。
寒泉之食，中正也。
元吉在上，大成也。`}]},革:{source:"维基文库《周易/革》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E9%9D%A9",layers:[{title:"经文·卦辞及爻辞",text:`革：已日乃孚，元亨。利贞。悔亡。
初九：鞏用黄牛之革。
六二：已日乃革之，征吉，无咎。
九三：征凶，贞厉，革言三就，有孚。
九四：悔亡，有孚改命，吉。
九五：大人虎变，未占有孚。
上六：君子豹变，小人革面，征凶，居贞吉。`},{title:"彖传",text:"革，水火相息，二女同居，其志不相得，曰革。已日乃孚；革而信也。文明以说，大亨以正，革而当，其悔乃亡。天地革而四时成，汤武革命，顺乎天而应乎人，革之时义大矣哉！"},{title:"象传",text:`澤中有火，革；君子以治历明时。
鞏用黄牛，不可以有为也。
已日革之，行有嘉也。
革言三就，又何之矣。
改命之吉，信志也。
大人虎变，其文炳也。
君子豹变，其文蔚也。小人革面，顺以从君也。`}]},鼎:{source:"维基文库《周易/鼎》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E9%BC%8E",layers:[{title:"经文·卦辞及爻辞",text:`鼎：元吉，亨。
初六：鼎顛趾，利出否，得妾以其子，无咎。
九二：鼎有实，我仇有疾，不我能即，吉。
九三：鼎耳革，其行塞，雉膏不食，方雨亏悔，终吉。
九四：鼎折足，复公餗，其刑一作「形」渥，凶。
六五：鼎黄耳金鉉，利贞。
上九：鼎玉鉉，大吉，无不利。`},{title:"彖传",text:"鼎，象也。以木巽火，亨飪也。圣人亨以享上帝，而大亨以養圣贤。巽而耳目聪明，柔进而上行，得中而应乎刚，是以元亨。"},{title:"象传",text:`木上有火，鼎；君子以正位凝命。
鼎顛趾，未悖也。利出否，以从贵也。
鼎有实，慎所之也。我仇有疾，终无尤也。
鼎耳革，失其义也。
复公餗，信如何也。
鼎黄耳，中以为实也。
玉鉉在上，刚柔节也。`}]},震:{source:"维基文库《周易/震》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E9%9C%87",layers:[{title:"经文·卦辞及爻辞",text:`震：亨。震来虩虩，笑言啞啞。震驚百里，不丧匕鬯。
初九：震来虩虩，后笑言啞啞，吉。
六二：震来厉，億丧貝，躋于九陵，勿逐，七日得。
六三：震蘇蘇，震行无眚。
九四：震遂泥。
六五：震往来厉，億无丧，有事。
上六：震索索，视矍矍，征凶。震不于其躬，于其邻，无咎。婚媾有言。`},{title:"彖传",text:"震，亨。震来虩虩，恐致福也。笑言啞啞，后有则也。震驚百里，驚远而懼邇也。出可以守宗廟社稷，以为祭主也。"},{title:"象传",text:`洊雷，震；君子以恐懼修省。
震来虩虩，恐致福也。笑言啞啞，后有则也。
震来厉，乘刚也。
震蘇蘇，位不当也。
震遂泥，未光也。
震往来厉，危行也。其事在中，大无丧也。
震索索，中未得也。虽凶无咎，畏邻戒也。`}]},艮:{source:"维基文库《周易/艮》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E8%89%AE",layers:[{title:"经文·卦辞及爻辞",text:`艮：艮其背，不獲其身，行其庭，不见其人，无咎。
初六：艮其趾，无咎，利永贞。
六二：艮其腓，不拯其隨，其心不快。
九三：艮其限，裂一作「列」其夤，厉閽一作「薰」心。
六四：艮其身，无咎。
六五：艮其輔，言有孚一作「序」，悔亡。
上九：敦艮，吉。`},{title:"彖传",text:"艮，止也。时止则止，时行则行，动静不失其时，其道光明。艮其止，止其所也。上下敵应，不相与也。是以不獲其身，行其庭不见其人，无咎也。"},{title:"象传",text:`兼山，艮；君子以思不出其位。
艮其趾，未失正也。
不拯其隨，未退听也。
艮其限，危薰心也。
艮其身，止諸躬也。
艮其輔，以中正也。
敦艮之吉，以厚终也。`}]},渐:{source:"维基文库《周易/漸》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E6%BC%B8",layers:[{title:"经文·卦辞及爻辞",text:`漸：女归吉，利贞。
初六：鸿漸于干，小子厉，有言，无咎。
六二：鸿漸于磐，飲食衎衎，吉。
九三：鸿漸于陸，夫征不复，妇孕不育，凶；利禦寇。
六四：鸿漸于木，或得其桷，无咎。
九五：鸿漸于陵，妇三岁不孕，终莫之胜，吉。
上九：鸿漸于陸，其羽可用为儀，吉。`},{title:"彖传",text:"漸之进也，女归吉也。进得位，往有功也。进以正，可以正邦也。其位刚，得中也。止而巽，动不穷也。"},{title:"象传",text:`山上有木，漸；君子以居贤德，善俗。
小子之厉，义无咎也。
飲食衎衎，不素飽也。
夫征不复，离群丑也。妇孕不育，失其道也。利用禦寇，顺相保也。
或得其桷，顺以巽也。
终莫之胜，吉；得所愿也。
其羽可用为儀，吉；不可乱也。`}]},归妹:{source:"维基文库《周易/归妹》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E6%AD%B8%E5%A6%B9",layers:[{title:"经文·卦辞及爻辞",text:`归妹：征凶，无攸利。
初九：归妹以娣，跛能履，征吉。
九二：眇能一作「而」视，利幽人之贞。
六三：归妹以须，反归以娣。
九四：归妹愆期，遲归有时。
六五：帝乙归妹，其君之袂，不如其娣之袂良，月几望，吉。
上六：女承筐无实，士刲羊无血，无攸利。`},{title:"彖传",text:"归妹，天地之大义也。天地不交，而万物不兴，归妹人之终始也。说以动，所归妹也。征凶，位不当也。无攸利，柔乘刚也。"},{title:"象传",text:`澤上有雷，归妹；君子以永终知敝。
归妹以娣，以恒也。跛能履吉，相承也。
利幽人之贞，未变常也。
归妹以须，未当也。
愆期之志，有待而行也。
帝乙归妹，不如其娣之袂良也。其位在中，以贵行也。
上六无实，承虚筐也。`}]},丰:{source:"维基文库《周易/丰》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E8%B1%90",layers:[{title:"经文·卦辞及爻辞",text:`丰：亨。王假之，勿忧，宜日中。
初九：遇其配主，虽旬无咎，往有尚。
六二：丰其蔀，日中见斗，往得疑疾，有孚发若，吉。
九三：丰其沛，日中见沬，折其右肱，无咎。
九四：丰其蔀，日中见斗，遇其夷主，吉。
六五：来章，有庆誉，吉。
上六：丰其屋，蔀其家，窺其户，闃其无人，三岁不觌，凶。`},{title:"彖传",text:"丰，大也。明以动，故丰。王假之，尚大也。勿忧宜日中，宜照天下也。日中则昃，月盈则食，天地盈虚，与时消息，而況于人乎？況于鬼神乎？"},{title:"象传",text:`雷电皆至，丰；君子以折獄致刑。
虽旬无咎，过旬灾也。
有孚发若，信以发志也。
丰其沛，不可大事也。折其右肱，终不可用也。
丰其蔀，位不当也。日中见斗，幽不明也。遇其夷主，吉；行也。
六五之吉，有庆也。
丰其屋，天际翔也。窺其户，闃其无人，自藏也。`}]},旅:{source:"维基文库《周易/旅》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E6%97%85",layers:[{title:"经文·卦辞及爻辞",text:`旅：小亨，旅贞吉。
初六：旅瑣瑣，斯其所取灾。
六二：旅即次，懷其资，得僮一作「童」仆贞。
九三：旅焚其次，丧其僮一作「童」仆，贞厉。
九四：旅于处，得其资斧，我心不快。
六五：射雉一矢亡，终以誉命。
上九：鸟焚其巢，旅人先笑后号咷。丧牛于易，凶。`},{title:"彖传",text:"旅，小亨，柔得中乎外，而顺乎刚，止而麗乎明，是以小亨，旅贞吉也。旅之时义大矣哉！"},{title:"象传",text:`山上有火，旅；君子以明慎用刑，而不留獄。
旅瑣瑣，志穷灾也。
得童仆贞，终无尤也。
旅焚其次，亦以傷矣。以旅与下，其义丧也。
旅于处，未得位也。得其资斧，心未快也。
终以誉命，上逮也。
以旅在上，其义焚也。丧牛于易，终莫之聞也。`}]},巽:{source:"维基文库《周易/巽》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%B7%BD",layers:[{title:"经文·卦辞及爻辞",text:`巽：小亨。利有攸往。利见大人。
初六：进退，利武人之贞。
九二：巽在牀下，用史巫纷若，吉无咎。
九三：頻巽，吝。
六四：悔亡，田獲三品。
九五：贞吉悔亡，无不利。无初有终，先庚三日，后庚三日，吉。
上九：巽在牀下，丧其资斧，贞凶。`},{title:"彖传",text:"重巽以申命，刚巽乎中正而志行。柔皆顺乎刚，是以小亨，利有攸往，利见大人。"},{title:"象传",text:`隨风，巽；君子以申命行事。
进退，志疑也。利武人之贞，志治也。
纷若之吉，得中也。
頻巽之吝，志穷也。
田獲三品，有功也。
九五之吉，位正中也。
巽在牀下，上穷也。丧其资斧，正乎凶也。`}]},兑:{source:"维基文库《周易/兑》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%85%8C",layers:[{title:"经文·卦辞及爻辞",text:`兑：亨。利贞。
初九：和兑，吉。
九二：孚兑，吉，悔亡。
六三：来兑，凶。
九四：商兑，未宁，介疾有喜。
九五：孚于剝，有厉。
上六：引兑。`},{title:"彖传",text:"兑，说也。刚中而柔外，说以利贞，是以顺乎天，而应乎人。说以先民，民忘其劳；说以犯难，民忘其死；说之大，民勸矣哉！"},{title:"象传",text:`麗澤，兑；君子以朋友讲习。
和兑之吉，行未疑也。
孚兑之吉，信志也。
来兑之凶，位不当也。
九四之喜，有庆也。
孚于剝，位正当也。
上六引兑，未光也。`}]},涣:{source:"维基文库《周易/渙》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E6%B8%99",layers:[{title:"经文·卦辞及爻辞",text:`渙：亨，王假有廟，利涉大川，利贞。
初六：用拯马壯，吉，悔亡。
九二：渙奔其机，悔亡。
六三：渙其躬，无悔。
六四：渙其群，元吉。渙有丘，匪夷所思。
九五：渙汗其大号，渙王居，无咎。
上九：渙其血，去逖出，无咎。`},{title:"彖传",text:"渙，亨。刚来而不穷，柔得位乎外而上同。王假有廟，王乃在中也。利涉大川，乘木有功也。"},{title:"象传",text:`风行水上，渙；先王以享于帝立廟。
初六之吉，顺也。
渙奔其机，得愿也。
渙其躬，志在外也。
渙其群，元吉；光大也。
王居无咎，正位也。
渙其血，远害也。`}]},中孚:{source:"维基文库《周易/中孚》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E4%B8%AD%E5%AD%9A",layers:[{title:"经文·卦辞及爻辞",text:`中孚：豚鱼吉，利涉大川，利贞。
初九：虞吉，有它一作「他」不燕。
九二：鸣鹤在阴，其子和之，我有好爵，吾与尔靡之。
六三：得敵，或鼓或罷，或泣或歌。
六四：月既一作「几、几」望，马匹亡，无咎。
九五：有孚攣如，无咎。
上九：翰音登于天，贞凶。`},{title:"彖传",text:"中孚，柔在内而刚得中。说而巽，孚，乃化邦也。豚鱼吉，信及豚鱼也。利涉大川，乘木舟虚也。中孚以利贞，乃应乎天也。"},{title:"象传",text:`澤上有风，中孚；君子以議獄缓死。
初九虞吉，志未变也。
其子和之，中心愿也。
可鼓或罷，位不当也。
马匹亡，絕类上也。
有孚攣如，位正当也。
翰音登于天，何可长也。`}]},小过:{source:"维基文库《周易/小过》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E5%B0%8F%E9%81%8E",layers:[{title:"经文·卦辞及爻辞",text:`小过：亨。利贞。可小事，不可大事。飞鸟遺之音，不宜上宜下，大吉。
初六：飞鸟以凶。
六二：过其祖，遇其妣；不及其君，遇其臣；无咎。
九三：弗过防之，从或戕之，凶。
九四：无咎，弗过遇之。往厉必戒，勿用永贞。
六五：密云不雨，自我西郊，公弋取彼在穴。
上六：弗遇过之，飞鸟离之，凶，是谓灾眚。`},{title:"彖传",text:"小过，小者过而亨也。过以利贞，与时行也。柔得中，是以小事吉也。刚失位而不中，是以不可大事也。有飞鸟之象焉，有飞鸟遺之音，不宜上宜下，大吉；上逆而下顺也。"},{title:"象传",text:`山上有雷，小过；君子以行过乎恭，丧过乎哀，用过乎俭。
飞鸟以凶，不可如何也。
不及其君，臣不可过也。
从或戕之，凶如何也。
弗过遇之，位不当也。往厉必戒，终不可长也。
密云不雨，已上也。
弗遇过之，已亢也。`}]},既济:{source:"维基文库《周易/既濟》",url:"https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93/%E6%97%A2%E6%BF%9F",layers:[{title:"经文·卦辞及爻辞",text:`既濟：亨小。利贞。初吉终乱。
初九：曳其轮，濡其尾，无咎。
六二：妇丧其茀，勿逐，七日得。
九三：高宗伐鬼方，三年克之，小人勿用。
六四：繻有衣袽，终日戒。
九五：东邻殺牛，不如西邻之禴祭，实受其福。
上六：濡其首，厉。`},{title:"彖传",text:"既濟，亨，小者亨也。利贞，刚柔正而位当也。初吉，柔得中也。终止则乱，其道穷也。"},{title:"象传",text:`水在火上，既濟；君子以思患而豫防之。
曳其轮，义无咎也。
七日得，以中道也。
三年克之，憊也。
终日戒，有所疑也。
东邻殺牛，不如西邻之时也；实受其福，吉大来也。
濡其首厉，何可久也。`}]}},YJ_F2S={"「":"“","」":"”",並:"并",乾:"干",乱:"乱",来:"来",係:"系",備:"备",傷:"伤",傾:"倾",仆:"仆",儀:"仪",億:"亿",俭:"俭",兑:"兑",内:"内",两:"两",则:"则",刚:"刚",剝:"剥",动:"动",胜:"胜",劳:"劳",势:"势",勸:"劝",厉:"厉",叢:"丛",问:"问",啞:"哑",丧:"丧",向:"向",嚴:"严",国:"国",园:"园",執:"执",坚:"坚",壯:"壮",妇:"妇",宫:"宫",实:"实",宁:"宁",寵:"宠",对:"对",屨:"屦",帥:"帅",师:"师",带:"带",干:"干",几:"几",廟:"庙",廬:"庐",张:"张",强:"强",彙:"汇",后:"后",从:"从",复:"复",恒:"恒",悶:"闷",恶:"恶",惻:"恻",爱:"爱",愠:"愠",庆:"庆",忧:"忧",憊:"惫",应:"应",惩:"惩",懷:"怀",懼:"惧",戔:"戋",战:"战",户:"户",揚:"扬",损:"损",撝:"㧑",击:"击",据:"据",攣:"挛",败:"败",敵:"敌",于:"于",时:"时",晉:"晋",晝:"昼",暉:"晖",会:"会",东:"东",棄:"弃",棟:"栋",楊:"杨",极:"极",榮:"荣",乐:"乐",橈:"桡",岁:"岁",历:"历",归:"归",殺:"杀",气:"气",决:"决",況:"况",渊:"渊",渙:"涣",汤:"汤",灭:"灭",满:"满",漣:"涟",漸:"渐",潜:"潜",澤:"泽",濟:"济",瀆:"渎",灾:"灾",为:"为",尔:"尔",牀:"床",牽:"牵",獄:"狱",独:"独",獲:"获",瑣:"琐",異:"异",当:"当",疇:"畴",发:"发",众:"众",碩:"硕",禄:"禄",禦:"御",礼:"礼",称:"称",谷:"谷",积:"积",穫:"获",穷:"穷",窺:"窥",竄:"窜",节:"节",笃:"笃",约:"约",納:"纳",纷:"纷",紱:"绂",终:"终",絕:"绝",统:"统",经:"经",維:"维",綸:"纶",缓:"缓",繫:"系",繻:"𦈡",繼:"继",纆:"𬙊",续:"续",罚:"罚",罷:"罢",群:"群",义:"义",习:"习",圣:"圣",聞:"闻",聪:"聪",听:"听",膚:"肤",臘:"腊",臨:"临",与:"与",兴:"兴",旧:"旧",艱:"艰",茲:"兹",莧:"苋",華:"华",万:"万",蒞:"莅",薦:"荐",药:"药",蘇:"苏",处:"处",虚:"虚",号:"号",亏:"亏",蠱:"蛊",卫:"卫",见:"见",视:"视",覿:"觌",观:"观",觸:"触",訟:"讼",设:"设",試:"试",詳:"详",语:"语",誥:"诰",说:"说",谁:"谁",諸:"诸",谋:"谋",谓:"谓",谦:"谦",讲:"讲",识:"识",議:"议",誉:"誉",变:"变",丰:"丰",豶:"豮",貝:"贝",贞:"贞",负:"负",财:"财",貫:"贯",貳:"贰",贵:"贵",賁:"贲",资:"资",宾:"宾",赏:"赏",贤:"贤",贱:"贱",踰:"逾",躋:"跻",跃:"跃",车:"车",载:"载",輔:"辅",輝:"辉",轮:"轮",輻:"辐",輿:"舆",辞:"辞",辯:"辩",連:"连",进:"进",过:"过",违:"违",远:"远",遯:"遁",遲:"迟",遷:"迁",遺:"遗",邇:"迩",邻:"邻",丑:"丑",鉉:"铉",锡:"锡",错:"错",长:"长",门:"门",闭:"闭",开:"开",閑:"闲",閽:"阍",闃:"阒",关:"关",阴:"阴",陸:"陆",阳:"阳",阶:"阶",隕:"陨",际:"际",隨:"随",险:"险",虽:"虽",离:"离",难:"难",云:"云",电:"电",靈:"灵",静:"静",鞏:"巩",頂:"顶",顺:"顺",须:"须",頤:"颐",頰:"颊",頻:"频",顒:"颙",愿:"愿",顛:"颠",类:"类",风:"风",飞:"飞",飪:"饪",飲:"饮",飽:"饱",養:"养",餗:"𫗧",饋:"馈",马:"马",馮:"冯",驯:"驯",驚:"惊",体:"体",鱼:"鱼",鲋:"鲋",鸟:"鸟",鸣:"鸣",鸿:"鸿",鹤:"鹤",麗:"丽",黄:"黄",齎:"赍",龙:"龙",龟:"龟"};function yjNorm(s){let o="";for(const ch of String(s))o+=YJ_F2S[ch]||ch;return o.toLowerCase()}function yjClassicSearch(q){return q=yjNorm((q||"").trim()),YJ_NAMES.map((name,i)=>({name,no:i+1,entry:YJ_CLASSIC_DB[name]})).filter(x=>{var _a;return!q||yjNorm(x.name).includes(q)||String(x.no)===q||((_a=(x.entry||{}).layers)==null?void 0:_a.some(l=>yjNorm(l.text).includes(q)))})}function yjClassicMarkup(name){const entry=YJ_CLASSIC_DB[name];return entry?`<div class="yj-classic-entry"><div class="yj-classic-source">底本：<a href="${entry.url}" target="_blank" rel="noopener">${esc(entry.source)}</a></div>${entry.layers.map(l=>`<section class="yj-classic-layer"><h4>${esc(l.title)}</h4><pre>${esc(l.text)}</pre></section>`).join("")}</div>`:""}const YJ_PAIR_BY_NAME={乾:["乾","乾"],夬:["兑","乾"],大有:["离","乾"],大壮:["震","乾"],小畜:["巽","乾"],需:["坎","乾"],大畜:["艮","乾"],泰:["坤","乾"],履:["乾","兑"],兑:["兑","兑"],睽:["离","兑"],归妹:["震","兑"],中孚:["巽","兑"],节:["坎","兑"],损:["艮","兑"],临:["坤","兑"],同人:["乾","离"],革:["兑","离"],离:["离","离"],丰:["震","离"],家人:["巽","离"],既济:["坎","离"],贲:["艮","离"],明夷:["坤","离"],无妄:["乾","震"],随:["兑","震"],噬嗑:["离","震"],震:["震","震"],益:["巽","震"],屯:["坎","震"],颐:["艮","震"],复:["坤","震"],姤:["乾","巽"],大过:["兑","巽"],鼎:["离","巽"],恒:["震","巽"],巽:["巽","巽"],井:["坎","巽"],蛊:["艮","巽"],升:["坤","巽"],讼:["乾","坎"],困:["兑","坎"],未济:["离","坎"],解:["震","坎"],涣:["巽","坎"],坎:["坎","坎"],蒙:["艮","坎"],师:["坤","坎"],遁:["乾","艮"],咸:["兑","艮"],旅:["离","艮"],小过:["震","艮"],渐:["巽","艮"],蹇:["坎","艮"],艮:["艮","艮"],谦:["坤","艮"],否:["乾","坤"],萃:["兑","坤"],晋:["离","坤"],豫:["震","坤"],观:["巽","坤"],比:["坎","坤"],剥:["艮","坤"],坤:["坤","坤"]},YJ_TRIGRAM_BY_NAME=Object.fromEntries(YJ_TRIGRAMS.map(t=>[t.name,t])),YJ_GUA=YJ_NAMES.map(name=>{const pair=YJ_PAIR_BY_NAME[name];if(!pair)throw new Error("缺少卦象映射："+name);return[...YJ_TRIGRAM_BY_NAME[pair[1]].bits,...YJ_TRIGRAM_BY_NAME[pair[0]].bits]});function yjFind(bits){let i=YJ_GUA.findIndex(a=>a.join("")===bits.join(""));return i<0?null:{no:i+1,name:YJ_NAMES[i],bits:YJ_GUA[i]}}function yjBuildMeihua(a,b){const tri=n=>{let r=n%8;return r===0&&(r=8),YJ_TRIGRAMS[r-1].bits},bits=[...tri(b),...tri(a)];let mr=(a+b)%6;mr===0&&(mr=6);const moving=[mr-1],changedBits=bits.map((v,i)=>i===moving[0]?1-v:v),huBits=[bits[1],bits[2],bits[3],bits[2],bits[3],bits[4]];return{method:"meihua",a,b,hex:yjFind(bits),changed:yjFind(changedBits),hugua:yjFind(huBits),moving}}function yjPushHistory(rec){if(!rec.hex)return;delete rec.browseOnly;const h=DB.data.yijingHistory||(DB.data.yijingHistory=[]);h.unshift({time:new Date().toLocaleString("zh-CN",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}),hex:rec.hex,changed:rec.changed,hugua:rec.hugua,moving:rec.moving,method:rec.method,question:rec.question||""}),h.length>10&&(h.length=10)}function yjLineMarkup(bits,moving=[]){return bits.map((v,i)=>`<div class="yj-line-row"><span>${["初","二","三","四","五","上"][i]}爻</span><b class="${v?"yang":"yin"} ${moving.includes(i)?"moving":""}">${v?"━━━━━━":"━━　━━"}</b><small>${moving.includes(i)?"动爻":""}</small></div>`).reverse().join("")}function viewDivination(){const today=todayStr(),rec=DB.data.divination||{},done=rec.date===today,f=done?rec.result:null,c=`<div class="p-panel">
    <div class="div-wrap">
      <h2>抽签问吉</h2>
      <div class="ph-sub">心诚则灵，每日一签，问一日之运</div>
      <div class="div-stage" style="margin-top:18px">
        ${f?`<div class="div-jian">— 今日签 —</div>
          <div class="div-grade" style="color:${f.color}">${f.g}</div>
          <div class="div-poem">${esc(f.poem)}</div>
          <div class="div-mean">${esc(f.mean)}</div>`:`<div class="div-sticks">${(()=>{let h="";for(let i=0;i<9;i++)h+=`<i style="height:${90+Math.round(40*Math.abs(Math.sin(i*1.3)))}px"></i>`;return h})()}</div>
            <div style="color:#C6CFEE;font-size:14px">静心凝神，默念所问之事</div>
            <button class="btn btn-orange" id="div-draw" style="margin-top:16px">摇签</button>`}
      </div>
      ${done?'<div class="ph-sub" style="margin-top:12px">今日已问过，明日再来</div>':""}
    </div>
  </div>`;return portalShell("divination",c)}function yjOppositeBits(bits){return bits.map(b=>1-b)}function yjReverseBits(bits){return[...bits].reverse()}function yjMovingLine(hexName,movingIdx){const entry=YJ_CLASSIC_DB[hexName];if(!entry)return null;const yaoLayer=entry.layers.find(l=>l.title.includes("爻辞"));if(!yaoLayer)return null;const lines=yaoLayer.text.split(`
`),pos=["初","二","三","四","五","上"][movingIdx];return(lines.find(l=>l.trim().startsWith(pos))||"").trim()||null}function yjXiangFirst(hexName){const entry=YJ_CLASSIC_DB[hexName];if(!entry)return null;const xiang=entry.layers.find(l=>l.title.includes("象传"));return xiang&&(xiang.text.split(`
`)[0]||"").trim()||null}function yjLineBlock(bits,moving=[]){return bits.map((v,i)=>`<div class="yj-line-row"><span>${["初","二","三","四","五","上"][i]}爻</span><div class="yj-yang ${v?"":"yj-yin"} ${moving.includes(i)?"moving":""}"><i></i></div><small>${moving.includes(i)?"○动":""}</small></div>`).reverse().join("")}function viewYijing(){const rec=DB.data.yijing||{},hist=(DB.data.yijingHistory||[]).slice(0,10),classicEntry=rec.hex?YJ_CLASSIC_DB[rec.hex.name]:null,guaci=classicEntry&&classicEntry.layers?classicEntry.layers[0]:null,cuogua=rec.hex?yjFind(yjOppositeBits(rec.hex.bits)):null,zonggua=rec.hex?yjFind(yjReverseBits(rec.hex.bits)):null,movingLines=(rec.hex&&rec.moving||[]).map(i=>yjMovingLine(rec.hex.name,i)).filter(Boolean),xiangFirst=rec.hex?yjXiangFirst(rec.hex.name):null,c=`<div class="p-panel yj-module"><div class="yj-head"><div class="yj-kicker">周易 · 原典工具</div><h2>伏羲六十四卦</h2><p>六爻法 · 梅花易数</p><p class="yj-note">卦名与卦序采用通行《周易》文王卦序；卦象组合参考《周易》六十四卦速查表。原文保持繁体字形，并按经文、传文分层呈现。</p></div>
 <div class="yj-tabs"><button class="btn ${rec.method!=="meihua"?"btn-orange":"btn-ghost"}" data-yj-method="liuyao">六爻法（三钱起卦）</button><button class="btn ${rec.method==="meihua"?"btn-orange":"btn-ghost"}" data-yj-method="meihua">梅花易数（数字起卦）</button></div>
 <div class="yj-card" style="padding:10px 14px"><label style="font-size:13px;color:var(--pt-muted)">所问何事（可留空）</label><input id="yj-question" type="text" maxlength="40" placeholder="如：这周面试能成吗" value="${esc(rec.question||"")}" style="width:100%;margin-top:6px;background:var(--pt-input);border:1px solid var(--pt-border);border-radius:8px;padding:8px 12px;color:var(--pt-text);outline:none;font-size:14px"></div>
 ${rec.method==="meihua"?`<section class="yj-card"><h3>梅花易数 · 报数起卦</h3><p>报两个正整数：上卦＝数字 A ÷ 8 取余（余 0 作 8，即坤），下卦＝数字 B ÷ 8 取余（余 0 作 8）；动爻＝(A＋B) ÷ 6 取余（余 0 为第六爻）。先天八卦数约定：“乾1、兑2、离3、震4、巽5、坎6、艮7、坤8”。</p><div class="yj-inputs"><label>数字 A（上卦）<input id="yj-a" type="number" min="1" value="${esc(rec.a||1)}"></label><label>数字 B（下卦）<input id="yj-b" type="number" min="1" value="${esc(rec.b||2)}"></label></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-orange" id="yj-calc-meihua">起卦</button><button class="btn btn-ghost" id="yj-time-calc">用现在时间起卦</button></div></section>`:`<section class="yj-card"><h3>六爻法 · 三枚铜钱，六次投掷</h3><p>依次生成初爻至上爻。数字标记：6老阴（动）、7少阳、8少阴、9老阳（动）。每次投掷结果可重摇，六爻齐全后显示本卦与变卦。</p><div id="yj-throws">${(rec.throws||[]).map((v,i)=>`<span class="yj-throw yj-coin-${v}">${["初","二","三","四","五","上"][i]}爻：${v}</span>`).join(" ")}</div><div class="yj-actions"><button class="btn btn-ghost" id="yj-reset">重新起卦</button><button class="btn btn-orange" id="yj-throw">${(rec.throws||[]).length>=6?"重新起卦":"投掷一爻"}</button></div></section>`}
 ${rec.hex?`<section class="yj-card">${rec.question?`<p style="margin:0 0 10px;font-size:13px;color:var(--pt-accent)">所问：${esc(rec.question)}</p>`:""}<div class="yj-result"><div><small>本卦</small><h3>第${rec.hex.no}卦 · ${esc(rec.hex.name)}</h3>${yjLineBlock(rec.hex.bits,rec.moving||[])}</div>${rec.changed?`<div><small>变卦</small><h3>第${rec.changed.no}卦 · ${esc(rec.changed.name)}</h3>${yjLineBlock(rec.changed.bits)}</div>`:""}${rec.hugua?`<div><small>互卦</small><h3>第${rec.hugua.no}卦 · ${esc(rec.hugua.name)}</h3>${yjLineBlock(rec.hugua.bits)}</div>`:""}${cuogua?`<div><small>错卦</small><h3>第${cuogua.no}卦 · ${esc(cuogua.name)}</h3>${yjLineBlock(cuogua.bits)}</div>`:""}${zonggua?`<div><small>综卦</small><h3>第${zonggua.no}卦 · ${esc(zonggua.name)}</h3>${yjLineBlock(zonggua.bits)}</div>`:""}</div>${guaci?`<div class="yj-guaci"><h4>卦辞 · ${esc(rec.hex.name)}</h4><pre>${esc(guaci.text)}</pre></div>`:""}${xiangFirst?`<div class="yj-xiang"><b>象曰：</b>${esc(xiangFirst)}</div>`:""}${movingLines.length?`<div class="yj-moving-lines"><h4>动爻爻辞</h4>${movingLines.map(l=>`<div class="yj-yao-line">${esc(l)}</div>`).join("")}</div>`:""}<p class="yj-note">卦象按六爻自下而上计算。六爻排盘结果不等同于纳甲六亲、世应、月建日辰等完整六爻断法。</p><p class="yj-source">更多原文：<a href="https://zh.wikisource.org/wiki/周易/${encodeURIComponent(rec.hex.name)}" target="_blank" rel="noopener">维基文库《周易/${esc(rec.hex.name)}》</a></p></section>`:""}
 ${hist.length?`<section class="yj-card"><h3>最近起卦记录</h3><div class="yj-hist">${hist.map((h,i)=>`<button class="yj-hist-item" data-yj-hist="${i}"><small>${esc(h.time||"")}</small><b>${esc(h.hex?"第"+h.hex.no+"卦 "+h.hex.name:"")}</b><span>${esc(h.question||"")}</span></button>`).join("")}</div></section>`:""}
 <section class="yj-card yj-library"><h3>经典原文库 · 离线查询</h3><p>可按卦名、卦序或原文关键词检索，原文采用繁体字形。</p><div class="yj-library-search"><input id="yj-classic-query" type="search" placeholder="搜索卦名、卦序或原文关键词（如：潜龙、元亨、11）" autocomplete="off"><button class="btn btn-orange" id="yj-classic-search">查询</button></div><div id="yj-classic-results" class="yj-classic-results">${yjClassicMarkup("乾")}</div></section>
 <section class="yj-card"><h3>六十四卦索引</h3><p>按通行文王卦序列出卦名。点选卦名可查看其卦象结构；本索引不将现代释义冒充经文。</p><div class="yj-index">${YJ_NAMES.map((n,i)=>`<button class="yj-index-item" data-yj-index="${i}"><small>${String(i+1).padStart(2,"0")}</small><span>${esc(n)}</span></button>`).join("")}</div></section>
 </div>`;return portalShell("yijing",c)}const TAROT_MAJOR=[{n:"愚者",ukw:"新开始/冒险/自由",umean:"全新旅程的起点，保持好奇心，大胆迈出第一步。",rkw:"鲁莽/逃避/拖延",rmean:"冲动行事或害怕未知，需要停下来想清楚。"},{n:"魔术师",ukw:"创造力/行动力/资源",umean:"你拥有实现目标所需的一切，善用手头资源。",rkw:"操纵/才华浪费/犹豫",rmean:"才能未被利用，或有用错方向之嫌。"},{n:"女祭司",ukw:"直觉/潜意识/静默",umean:"倾听内心声音，答案已在你心中。",rkw:"压抑直觉/秘密/浮躁",rmean:"忽略了直觉，或被表面信息迷惑。"},{n:"女皇",ukw:"丰饶/母性/感官享受",umean:"滋养与收获的时期，享受生活之美。",rkw:"过度依赖/停滞/自我忽视",rmean:"在关系或物质上过于执着，或忽略了自我关怀。"},{n:"皇帝",ukw:"权威/结构/稳定",umean:"建立秩序与规则，稳固你的根基。",rkw:"专制/僵化/控制欲",rmean:"过于强硬或固执，需要灵活一些。"},{n:"教皇",ukw:"传统/信仰/导师",umean:"遵循既有规则，或向有经验者学习。",rkw:"束缚/伪传统/质疑",rmean:"在质疑成规，或遇到了不合适的导师。"},{n:"恋人",ukw:"爱/选择/和谐",umean:"面临重要选择，跟随真心。",rkw:"失衡/错误选择/关系破裂",rmean:"关系中存在矛盾，或选择时不够诚实。"},{n:"战车",ukw:"意志/胜利/前进",umean:"掌控方向，克服障碍，胜利在望。",rkw:"失控/方向迷失/内耗",rmean:"同时朝多个方向用力，需要集中精力。"},{n:"力量",ukw:"勇气/耐心/内在力量",umean:"以柔克刚，用耐心而非蛮力解决问题。",rkw:"自我怀疑/软弱/冲动",rmean:"对自己缺乏信心，或情绪失控。"},{n:"隐士",ukw:"内省/独处/寻求真理",umean:"需要独处思考，点亮自己的灯。",rkw:"孤立/逃避/不愿求助",rmean:"过度与世隔绝，或拒绝他人帮助。"},{n:"命运之轮",ukw:"转折/循环/机遇",umean:"运势正在转变，顺势而为。",rkw:"厄运/抗拒变化/失控",rmean:"正经历低谷或抗拒必然的改变。"},{n:"正义",ukw:"公正/真相/因果",umean:"事出有因，做出公正的判断。",rkw:"不公/逃避责任/偏见",rmean:"需要承担责任，或存在不公之事。"},{n:"倒吊人",ukw:"牺牲/换角度/等待",umean:"换个角度看问题，暂时的停顿有意义。",rkw:"无谓牺牲/停滞/执念",rmean:"牺牲没有回报，或卡在原地太久。"},{n:"死神",ukw:"结束/转变/重生",umean:"旧阶段结束，新篇章即将开始。",rkw:"抗拒结束/停滞/放不下",rmean:"紧抓过去不放，阻碍了新生。"},{n:"节制",ukw:"平衡/节制/调和",umean:"找到中庸之道，耐心调和各方。",rkw:"失衡/极端/不耐",rmean:"生活或情绪走向极端，需要找回平衡。"},{n:"恶魔",ukw:"欲望/束缚/物质迷恋",umean:"认清什么在束缚你，欲望是把双刃剑。",rkw:"解脱/觉醒/挣脱",rmean:"开始意识到束缚并寻求自由。"},{n:"塔",ukw:"突变/崩塌/启示",umean:"旧有结构突然瓦解，虽然痛苦但带来真相。",rkw:"避免灾难/内隐动摇/侥幸",rmean:"隐患尚未爆发，但需要警惕。"},{n:"星星",ukw:"希望/疗愈/信心",umean:"黑暗过后是希望，治愈正在发生。",rkw:"失望/信心动摇/空虚",rmean:"对未来失去信心，或期望过高。"},{n:"月亮",ukw:"幻象/不安/潜意识",umean:"事情不清晰，跟随直觉但保持警惕。",rkw:"迷雾散去/揭露/释放恐惧",rmean:"误解澄清，或恐惧逐渐消散。"},{n:"太阳",ukw:"快乐/成功/活力",umean:"光明、成功与喜悦，大胆展现自己。",rkw:"暂时低落/过度乐观/延迟",rmean:"成功会来但稍晚，或需要调整预期。"},{n:"审判",ukw:"觉醒/复盘/召唤",umean:"回顾过去，做出重要的觉醒决定。",rkw:"自我批判/逃避召唤/悔恨",rmean:"难以原谅自己，或在逃避内心的呼唤。"},{n:"世界",ukw:"完成/圆满/整合",umean:"一个周期圆满完成，准备迎接新旅程。",rkw:"未完成/延迟/半途而废",rmean:"还差最后一步，不要在终点前放弃。"}],TAROT_SUITS=[{key:"wands",name:"权杖",element:"火",kw:"行动/热情/创造"},{key:"cups",name:"圣杯",element:"水",kw:"情感/关系/直觉"},{key:"swords",name:"宝剑",element:"风",kw:"思想/冲突/真相"},{key:"pentacles",name:"星币",element:"土",kw:"物质/工作/安全"}],TAROT_RANKS=["Ace","二","三","四","五","六","七","八","九","十","侍从","骑士","王后","国王"],TAROT_RANK_U={Ace:"新开始/机遇",二:"选择/平衡",三:"初步进展/合作",四:"稳定/休息",五:"冲突/失落",六:"和谐/胜利",七:"策略/幻想",八:"快速/移动",九:"接近成功/顾虑",十:"完成/负担",侍从:"消息/学习/好奇",骑士:"行动/追求/冒险",王后:"成熟/感受/包容",国王:"掌控/领导/权威"},TAROT_RANK_R={Ace:"延迟/错失",二:"犹豫/失衡",三:"计划不周/分歧",四:"停滞/吝啬",五:"和解/走出低谷",六:"恶运/怀旧",七:"自欺/策略失误",八:"拖延/被困",九:"焦虑/孤立",十:"结束/解脱",侍从:"幼稚/抔消息",骑士:"鲁莽/迟到",王后:"情绪不稳/占有欲",国王:"专制/冷酷"};function buildMinor(){const out=[];return TAROT_SUITS.forEach(s=>{TAROT_RANKS.forEach((r,i)=>{out.push({name:`${s.name}${r}`,suit:s.name,rank:r,ukw:`${s.kw.split("/")[0]}·${TAROT_RANK_U[r].split("/")[0]}`,umean:`${s.element}元素主题：${s.kw}。牌义偏向${TAROT_RANK_U[r]}。`,rkw:`${TAROT_RANK_R[r].split("/")[0]}`,rmean:`逆位提示${TAROT_RANK_R[r]}，需要警惕${s.name}能量的失衡。`})})}),out}const TAROT_DECK=[...TAROT_MAJOR.map((m,i)=>({name:`大阿卡纳·${m.n}`,suit:"大阿卡纳",rank:i+1,...m})),...buildMinor()],TAROT_SPREADS={single:{label:"单张·今日提示",n:1,positions:["今日指引"]},three:{label:"三张·时间之流",n:3,positions:["过去","现在","未来"]},choice:{label:"二选一·决策",n:3,positions:["现状","选择 A","选择 B"]},mind:{label:"四牌·身心灵",n:4,positions:["身体","情感","思想","整体"]}};function tarotShuffle(deck){const d=deck.slice();for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d.map(c=>({...c,reversed:Math.random()<.5}))}function viewTarot(){const rec=DB.data.tarot||{},picks=rec.picks||[],spread=rec.spread||"single",c=`<div class="p-panel tarot-module"><div class="yj-head"><div class="yj-kicker">TAROT</div><h2>塔罗占卜</h2><p class="yj-note">心诚则灵，默念所问之事，牌会给出提示。解读仅供参考，不做人生决策依据。</p></div>
  <section class="yj-card"><h3>开始占卜</h3>
    <label class="fl">所问之事（可留空）</label>
    <input id="tarot-q" type="text" maxlength="60" placeholder="如：这段关系该继续吗" value="${esc(rec.question||"")}" style="width:100%;margin:6px 0 12px;background:var(--pt-input);border:1px solid var(--pt-border);border-radius:8px;padding:9px 12px;color:var(--pt-text);outline:none;font-size:14px">
    <label class="fl">选择牌阵</label>
    <div class="tarot-spreads">${Object.entries(TAROT_SPREADS).map(([k,v])=>`<label class="tarot-spread ${spread===k?"on":""}" data-spread="${k}"><input type="radio" name="tarot-spread" value="${k}" ${spread===k?"checked":""} style="display:none"><b>${v.label}</b><small>${v.n}张</small></label>`).join("")}</div>
    <div style="margin-top:14px;display:flex;gap:8px"><button class="btn btn-orange" id="tarot-draw">开始抽牌</button>${picks.length?'<button class="btn btn-ghost" id="tarot-reset">重新抽牌</button>':""}</div>
  </section>
  ${picks.length?`<section class="yj-card"><h3>${rec.question?`「${esc(rec.question)}」`:""} 牌阵结果</h3>
    <div class="tarot-board n-${picks.length}">${picks.map((p,i)=>`<div class="tarot-card ${p.reversed?"rev":""}" style="--d:${i*.18}s"><div class="tc-inner"><div class="tc-face tc-front"><small>${esc(TAROT_SPREADS[spread].positions[i])}</small><h4>${esc(p.name)}</h4><span class="tc-dir">${p.reversed?"逆位":"正位"}</span><p class="tc-kw">${p.reversed?esc(p.rkw):esc(p.ukw)}</p><p class="tc-mean">${p.reversed?esc(p.rmean):esc(p.umean)}</p></div></div></div>`).join("")}</div>
    <div class="tarot-summary"><h4>整体提示</h4><p>${tarotSummary(spread,picks)}</p></div>
  </section>`:""}
  </div>`;return portalShell("tarot",c)}function tarotSummary(spread,picks){if(spread==="single"){const p=picks[0];return`${p.name}${p.reversed?"（逆位）":""}——${p.reversed?p.rkw:p.ukw}。${p.reversed?p.rmean:p.umean}`}if(spread==="three"){const[a,b,c]=picks;return`过去：${a.name}${a.reversed?"逆":""}，${a.reversed?a.rkw:a.ukw}；现在：${b.name}${b.reversed?"逆":""}，${b.reversed?b.rkw:b.ukw}；未来走向${c.name}${c.reversed?"逆":""}，${c.reversed?c.rkw:c.ukw}。综合来看，先接纳过去，专注当下，未来自会明朗。`}if(spread==="choice"){const[a,b,c]=picks;return`现状是${a.name}${a.reversed?"逆":""}（${a.reversed?a.rkw:a.ukw}）。选择A倾向${b.name}${b.reversed?"逆":""}（${b.reversed?b.rkw:b.ukw}）；选择B倾向${c.name}${c.reversed?"逆":""}（${c.reversed?c.rkw:c.ukw}）。哪一边更贴近你内心的真实感受，就选哪边。`}if(spread==="mind"){const[a,b,c,d]=picks;return`身体状态：${a.name}${a.reversed?"逆":""}；情感：${b.name}${b.reversed?"逆":""}；思想：${c.name}${c.reversed?"逆":""}；整体提示：${d.name}${d.reversed?"逆":""}（${d.reversed?d.rkw:d.ukw}）。`}return""}const HUANG_DAXIAN_SIGNS=[{id:1,level:"上上",title:"姜公封相",poem:"灵签求得第一枝，龙虎风云际会时。一旦凌霄扬自乐，任君来往赴瑶池。",story:"",readings:{事业:"功名可成，所谋之事大多亨通。",姻缘:"婚姻顺遂，有望成就。",财运:"求财丰盛。",健康:"疾病有望痊愈。",出行:"出行往来顺遂，所到之处皆合心意。",家宅:"家宅兴旺。",学业:"",流年:""}},{id:2,level:"上吉",title:"王道真误入桃源",poem:"枯木逢春尽发新，花香叶茂蝶来频。桃源竞斗千红紫，一叶渔舟误入津。",story:"",readings:{事业:"所谋之事有望获得福禄。",姻缘:"姻缘有缘分，有望成就。",财运:"求财可望。",健康:"疾病有望痊愈。",出行:"外出有机会意外遇见贵人。",家宅:"家宅安吉。",学业:"",流年:""}},{id:3,level:"中平",title:"鲁班伐木",poem:"牛山之木皆常美，独惜斧工尽伐他。大器大材无足用，矩规不准怎为槎。",story:"",readings:{事业:"名利须依理求取，不宜贪求。",姻缘:"婚姻不宜妄求。",财运:"求财应循正理，不可贪心。",健康:"求医须谨慎。",出行:"注意小人及口舌是非。",家宅:"宜修德积善。",学业:"",流年:""}},{id:4,level:"中吉",title:"燕子教飞",poem:"调雏紫燕在檐前，对语呢喃近午天。或往或来低复起，有时剪破绿杨烟。",story:"",readings:{事业:"谋事需要把握时机，不能盲目行动。",姻缘:"婚姻可求，进展渐渐明朗。",财运:"财运平稳，收益微薄。",健康:"身体方面宜多加谨慎。",出行:"外出需防小人及口舌是非。",家宅:"家宅平安。",学业:"",流年:""}},{id:5,level:"中吉",title:"陶渊明栽花",poem:"东园昨夜狂风急，万紫千红亦尽倾。幸有惜花人起早，培回根本复栽生。",story:"",readings:{事业:"名利暂时难成，需要等待时机，谋事宜谨慎。",姻缘:"婚姻进展迟疑，不宜操之过急。",财运:"财利微薄。",健康:"身体有恙须谨慎选择医生。",出行:"出行可能受阻，宜谨慎安排。",家宅:"家宅运势暂时不佳。",学业:"",流年:""}},{id:6,level:"上吉",title:"苏东坡游滕王阁",poem:"一片孤帆万里回，管弦呕哑且停杯。如云胜友谈风月，畅叙幽情极乐哉。",story:"",readings:{事业:"事业有成，所谋之事多能顺利。",姻缘:"婚姻有望成就。",财运:"财运丰盈，求财有利。",健康:"疾病有望痊愈。",出行:"出行顺遂，往来皆称心。",家宅:"家宅兴旺。",学业:"",流年:""}},{id:7,level:"中平",title:"丁山射雁",poem:"秋来征雁向南归，红叶纷纷满院飞。砧捣城头声切耳，江枫如火在渔矶。",story:"",readings:{事业:"",姻缘:"",财运:"",健康:"",出行:"",家宅:"",学业:"",流年:""}},{id:8,level:"下下",title:"鹊巢鸠居",poem:"鸣鸠争夺鹊巢居，宾主参差意不舒。满岭乔松萝蔦附，且猜诗语是何如。",story:"以鸠占鹊巢比喻原有居处被他人夺取，又以藤萝缠绕松树比喻受人牵制、依附他人的处境。",readings:{事业:"所谋之事不易成功，容易受到他人牵制。",姻缘:"婚姻不和谐，感情容易出现矛盾。",财运:"求财不宜冒进，更不可妄为。",健康:"自身容易受到疾病及口舌困扰。",出行:"出行容易遇阻，难以顺利完成。",家宅:"家宅运势不佳。",学业:"",流年:""}},{id:9,level:"上吉",title:"陶渊明赏菊",poem:"瑶琴一曲奏新腔，明月清风枕簟凉。咸集嘉宾同赏菊，或歌或舞或飞觞。",story:"陶渊明为晋代文人，不愿为五斗米折腰，辞官归隐，种菊赏菊，以田园生活寄托情怀。",readings:{事业:"不宜强求，顺其自然更为合适。",姻缘:"已有伴侣者感情和睦，未婚者有望遇到良缘。",财运:"不必刻意求财，财利自有来路。",健康:"春季可能有小恙，但有望很快恢复。",出行:"",家宅:"家庭和睦，生活安乐。",学业:"",流年:"大吉，尤其立秋之后较为有利。"}},{id:10,level:"中平",title:"苏秦不第",poem:"一轮月镜挂空中，偶被浮云障叠重。玉匣何时光气吐，谁人借我一狂风。",story:"",readings:{事业:"目前可能受到阻碍，宜等待机会，不可贸然行动。",姻缘:"感情容易出现不合，宜谨慎处理。",财运:"求财需要等待时机。",健康:"生病应谨慎选择医生。",出行:"外出应多加小心。",家宅:"家宅运势暂时不佳。",学业:"读书需要更加用功，暂不宜急于求成。",流年:""}},{id:11,level:"上吉",title:"汉文帝赏柳",poem:"杨柳垂堤锁绿烟，日长三起又三眠。往来紫燕纷飞舞，袅娜迎风倩我怜。",story:"",readings:{事业:"所谋之事多有吉利，名望有望提升。",姻缘:"婚姻良好，有望顺利成就。",财运:"求财可得。",健康:"疾病有望康复。",出行:"出行需防小人。",家宅:"家宅昌盛。",学业:"",流年:""}},{id:12,level:"下下",title:"蜃楼海市",poem:"蜃楼海市幻无边，万丈擎空接上天。或被狂风忽吹散，有时仍聚结青烟。",story:"",readings:{事业:"",姻缘:"",财运:"",健康:"",出行:"",家宅:"",学业:"",流年:""}},{id:13,level:"中平",title:"孟浩然寻梅",poem:"岭南初放一枝梅，片片晶莹入酒杯。却遇骑驴人早至，儿童背负占春魁。",story:"岭南梅花早开，有人将梅花入酒，恰逢骑驴之人先至，儿童背负梅花争得春日之先机。寓意机会稍纵即逝，遇事需留心先机。",readings:{事业:"缺少贵人相助时，事情不易成功；与人合作还需提防他人抢占先机。",姻缘:"需防第三者介入，感情不宜草率决定。",财运:"求财较难，且可能需要与人分利。",健康:"可能出现小病或慢性病，需注意身体状况。",出行:"出行有机会得到善意帮助。",家宅:"家宅平常，整体没有明显大碍。",学业:"",流年:"冬季及初春运势相对较佳。"}},{id:14,level:"中平",title:"陶渊明醉酒",poem:"为爱幽闲多种竹，买春赏雨在茅屋。醉时卧倒杏花边，怕听莺儿惊梦熟。",story:"",readings:{事业:"名利不宜贪求，应保持平常心。",姻缘:"婚姻方面较少如意之处。",财运:"财利微薄。",健康:"疾病有望逐渐好转。",出行:"出行需防小人口舌。",家宅:"家宅平常，宜修德积善。",学业:"",流年:""}},{id:15,level:"上吉",title:"唐明皇游月殿",poem:"仙槎一叶泛中流，月殿蟾宫任尔游。盈耳霓裳声暂歇，酒诗吟饮几时休。",story:"唐明皇传说曾乘仙舟游历月宫，听闻仙乐，学得霓裳羽衣曲而归。签中以月宫畅游、仙乐不绝，象征人生顺遂、荣华安乐，同时提醒不可过度沉迷享乐。",readings:{事业:"事业发展顺利，有望名成利就。",姻缘:"适合订婚或结婚，感情有成。",财运:"正财、偏财均有收获机会。",健康:"身体安康，疾病有望痊愈。",出行:"出行往来顺遂，容易称心如意。",家宅:"家道兴旺，家庭平安。",学业:"学习进展顺利，有望取得提升。",流年:""}},{id:16,level:"中吉",title:"牧童归家",poem:"天边鸦背夕阳回，陇外儿童跨犊来。羌笛频吹声切耳，短长腔调乐何哉。",story:"诗中描绘夕阳西下时，牧童骑牛归家，一路吹奏羌笛的田园景象，表现安宁、自在和知足。",readings:{事业:"少年时期努力耕耘，事业有望在后期取得成就。",姻缘:"姻缘将至，适合把握机会。",财运:"财运偏向晚成，宜踏实努力。",健康:"疾病最终有望痊愈。",出行:"出行归来有喜。",家宅:"家宅平安。",学业:"种瓜得瓜，学习需要付出努力。",流年:""}},{id:17,level:"中吉",title:"月下追贤",poem:"秋水蒹葭白露盈，盈庭月色浸阶清。清风吹动马铃响，响接晨钟不断声。",story:"",readings:{事业:"",姻缘:"",财运:"",健康:"",出行:"",家宅:"",学业:"",流年:""}},{id:18,level:"下下",title:"杜鹃",poem:"杜鹃啼血泪悲声，声怨霜寒梦乍惊。惊动异乡为异客，客心更触故园情。",story:"",readings:{事业:"谋望总体不利，做事需要谨慎。",姻缘:"婚姻不利，容易出现不和。",财运:"求财困难。",健康:"身体方面宜谨慎，遇病应及时处理。",出行:"出行往来多有忧虑，不宜贸然行动。",家宅:"家宅运势不佳。",学业:"",流年:""}},{id:19,level:"中吉",title:"伏羲画八卦",poem:"乾卦三连号太阳，潜龙勿用第一章。其中爻象能参透，百福骈臻大吉昌。",story:"传说伏羲观察天地自然之象，创制八卦，并以此教化人民。签诗引用乾卦“潜龙勿用”，提示刚强之中也需要懂得收敛和等待时机。",readings:{事业:"初期可能不太顺利，需要保持耐心。",姻缘:"与伴侣相处应注意言行，避免积累矛盾。",财运:"财运属于先苦后甜，需要耐心经营。",健康:"身体方面宜谨慎，有病需及时处理。",出行:"出行不宜急躁，注意控制情绪。",家宅:"家宅平常，宜积善修德。",学业:"",流年:"四季各有不同的小运，应根据形势决定进退。"}},{id:20,level:"中平",title:"天上仙花",poem:"天上仙花难问种，人间尘事几多更。前程已注公私簿，罚赏分明浊与清。",story:"诗中以天上仙花难以寻问其种、人间尘事变化繁多作比喻，并借公私簿记录善恶、赏罚分明，劝人守正修善。",readings:{事业:"名利得失不宜强求，应安分守己，踏实行事。",姻缘:"婚姻尚未确定，需要时间观察。",财运:"财利不可强求，应顺其自然。",健康:"患病应谨慎选择医生。",出行:"行善守正者可考虑出行。",家宅:"家宅平常，宜修身省察。",学业:"",流年:""}},{id:21,level:"中吉",title:"吴稳之会宴",poem:"天外红霞如抹锦，槛边桃杏斗新妆。盈眸烂熳谁居首，美酒频斟且酌量。",story:"",readings:{事业:"名利有望，但谋事不可急躁。",姻缘:"婚事宜从容，不宜急于定约。",财运:"",健康:"疾病渐有好转。",出行:"谨慎安排则有利。",家宅:"家宅有渐兴之象，宜修善。",学业:"",流年:""}},{id:22,level:"下下",title:"他乡作客",poem:"秋水伊人各一方，天南地北恨偏长。相思诗问凭谁寄，不尽凄凉几断肠。",story:"诗意写离居两地、音书难寄的相思愁苦。",readings:{事业:"谋望不利，宜等待时机，不宜急进。",姻缘:"婚姻不宜仓促求成。",财运:"",健康:"有病应谨慎求医，身心难安。",出行:"此时出行不利，宜慎重。",家宅:"家宅运势受阻，宜修善。",学业:"",流年:""}},{id:23,level:"中平",title:"梦中得宝",poem:"邯郸一梦幻无边，数载身荣是熟眠。换却锦衣归故里，睡醒还记在心田。",story:"",readings:{事业:"名利如虚花，谋望容易落空。",姻缘:"婚姻难成，不宜强求。",财运:"",健康:"疾病未能迅速痊愈，宜留意身体。",出行:"所得可能复失，出行宜谨慎。",家宅:"家宅平安，但整体运势平常。",学业:"",流年:""}},{id:24,level:"下下",title:"刘基归隐",poem:"诗酒琴棋可解愁，座中无客乐难休。或弹或唱谁知美，吟饮虽多亦是忧。",story:"",readings:{事业:"谋望恐惹忧愁，不宜贪求。",姻缘:"婚姻不宜强求。",财运:"求财求贵忌贪谋，宜谨慎。",健康:"疾病未愈，宜谨慎调养。",出行:"出行容易招忧，暂不宜贸然前往。",家宅:"家宅宜修德积善。",学业:"",流年:""}},{id:25,level:"上吉",title:"五岳泰山",poem:"群山扰扰朝中岳，有似为臣列鹄班。拱立两行齐整肃，自居此地岂无欢。",story:"以群山朝拱中岳比作臣子整齐列班，借此说明居于有利位置、得到众人响应的景象。",readings:{事业:"所求名利有望，谋事可获好结果。",姻缘:"婚事可以订立。",财运:"名利所求有应，财利可望。",健康:"遇到合适医生，疾病有望好转。",出行:"出行各处有贵人相助。",家宅:"家道兴盛。",学业:"",流年:""}},{id:26,level:"中平",title:"水月镜花",poem:"花影迟迟侵砌上，遥知月镜挂长空。忽闻鹤泪声凄切，早买归舟返里中。",story:"以花影、月色及鹤声为景，借闻不吉之声而及时买舟归乡，劝人知机避凶、及早回头。",readings:{事业:"谋事应观察时势，遇到不利迹象宜及早收手。",姻缘:"",财运:"",健康:"有病宜及早调养，并及早处理问题。",出行:"出行终究不甚适宜，宜审慎。",家宅:"家宅问题也应及早留意，见凶宜避。",学业:"",流年:""}},{id:27,level:"中平",title:"蚁子知时",poem:"天晴粉蝶翻衣晒，又看庭前蚁阵排。队伍整齐趋或退，时开时合思何佳。",story:"以蝴蝶晴天晒翼、蚂蚁将雨排阵为喻，说明万物各顺其时，行事应懂得进退。",readings:{事业:"谋事须观察时机，懂得进退。",姻缘:"婚事尚可，有机会相合。",财运:"财利微薄。",健康:"疾病可医治。",出行:"出行没有明显阻碍。",家宅:"家宅平常。",学业:"",流年:""}},{id:28,level:"中平",title:"白司马被贬",poem:"船泊浔阳月夜天，琵琶一曲动人怜。相思两地凭谁寄，白雪催人上鬓巅。",story:"白司马指白居易任江州司马时，夜闻琵琶之事；签诗借两地相思、白发催人的景象表达失意与愁苦。",readings:{事业:"功名难成，所谋之事不易实现。",姻缘:"婚姻不利，难有美满结果。",财运:"求财困难。",健康:"疾病痊愈较迟。",出行:"出行归来恐怕不尽如意。",家宅:"家宅艰辛，宜谨慎处理家中事务。",学业:"",流年:""}},{id:29,level:"中吉",title:"王羲之赏菊",poem:"鲈鱼作脍菊花黄，美酒盈樽近晚凉。泛棹正当潮上候，这般佳景乐无央。",story:"描绘鲈鱼、菊花、美酒与潮水俱备的秋日游乐景象，未明确提供对应人物的历史故事出处。",readings:{事业:"名望可期，谋事顺利。",姻缘:"婚姻相合。",财运:"求财有利。",健康:"疾病无大碍。",出行:"一路顺利。",家宅:"家宅平安。",学业:"",流年:""}},{id:30,level:"下下",title:"贵妃受劫",poem:"倾国倾城媚百生，六宫粉黛尽无名。马嵬山下魂飞去，至今明皇长恨情。",story:"唐玄宗宠爱杨贵妃，安史之乱时军队行至马嵬坡发生兵变，杨贵妃被迫自尽；唐玄宗此后长怀遗恨。",readings:{事业:"谋望不利，事情多有阻碍。",姻缘:"婚姻难成。",财运:"求财困难。",健康:"疾病未安，需谨慎处理。",出行:"出行不吉，不宜贸然前往。",家宅:"家宅有受劫之象，宜谨慎并修善。",学业:"",流年:""}},{id:31,level:"下下",title:"渔翁遇风失东西",poem:"狂风骤雨打船篷，溪畔桃花尽落红。惊醒渔翁春梦熟，持篙撑去失西东。",story:"签诗描写渔翁在春梦中被狂风骤雨惊醒，撑船时又失去方向；此比喻突遇惊险、仓促失措。",readings:{事业:"谋望多阻，切勿贸然行动。",姻缘:"婚姻不宜，难以成就。",财运:"财物有耗散之象。",健康:"疾病未安，身体需多加留意。",出行:"出行不宜。",家宅:"家宅运势不吉。",学业:"",流年:""}},{id:32,level:"中平",title:"苏武牧羊",poem:"十九年前海上辛，节旄雕败逐沙尘。餐毛嚼雪谁怜我，惟有羊儿作伴群。",story:"汉使苏武出使匈奴后被扣留，持节牧羊多年，历尽艰辛仍不改其志，后来得以归汉。",readings:{事业:"谋事艰难，名望不易达成。",姻缘:"",财运:"求财困难。",健康:"身体状况不易迅速好转，宜谨慎调养。",出行:"出行不利，行人归期较迟。",家宅:"家宅运势受阻。",学业:"",流年:""}},{id:33,level:"中平",title:"曹操走难",poem:"曹操虽有深谋计，智慧难瞒诸葛侯。试看东风都可借，更能流马木成牛。",story:"签题与解曰以曹操、诸葛亮为背景，提到诸葛亮借东风及制造木牛流马，说明奸谋终难得逞。",readings:{事业:"谋望难成，不宜使用欺诈或害人的手段。",姻缘:"婚姻不合，难称心意。",财运:"财利难有。",健康:"身体略有不安，宜谨慎照料。",出行:"出行恐有不利。",家宅:"家宅平常。",学业:"",流年:""}},{id:34,level:"中吉",title:"虞舜耕田",poem:"大舜虽耕在历山，心常孝顺两嚣顽。田中之象同家象，善恶分明即此间。",story:"",readings:{事业:"谋望有望，但应以善行、正道为先。",姻缘:"婚姻有缘，宜以诚相待。",财运:"求财可望，但应行善积德。",健康:"疾病痊愈较慢，宜谨慎调养。",出行:"可以出行，但仍应考虑周全。",家宅:"家宅平常，积善则昌。",学业:"",流年:""}},{id:35,level:"中吉",title:"唐僧取经",poem:"天将降任此其人，筋骨先劳苦彼身。莫谓景佳来可易，贫穷富贵有前因。",story:"诗句化用《孟子·告子下》“天将降大任于是人也”的意思，强调承担重任前往往先经历劳苦；签题另以唐僧取经作比。",readings:{事业:"名利不易求成，谋事须审慎选择并耐心努力。",姻缘:"婚姻有缘。",财运:"",健康:"疾病逐渐好转。",出行:"行人情况难以预测，出行进退须谨慎。",家宅:"家宅宜积德修善。",学业:"",流年:""}},{id:36,level:"中吉",title:"陶渊明归家",poem:"此事真如到岸船，何忧风水不相全。举头便见前村落，屋角阳斜爨已烟。",story:"",readings:{事业:"名利有望，谋事有机缘。",姻缘:"婚姻可成。",财运:"财利渐有收获。",健康:"疾病渐渐痊愈。",出行:"往来皆可喜，行人有归期。",家宅:"家宅有福。",学业:"",流年:""}},{id:37,level:"上吉",title:"王羲之钓鱼",poem:"月夜秋江下钓鳌，鱼形恰似四腮鲈。家藏旧酿堪盈斗，与友飞觞尽倒壶。",story:"描绘月夜钓得四腮鲈鱼，取出家藏旧酒与朋友畅饮的欢乐场景。",readings:{事业:"谋望顺利，百事亨通。",姻缘:"婚姻相合。",财运:"财利丰盈。",健康:"疾病有望痊愈。",出行:"出行到处合宜。",家宅:"家宅兴旺。",学业:"",流年:""}},{id:38,level:"中吉",title:"陶渊明辞官归隐",poem:"归去来兮仕官闲，室堪容膝亦为安。南窗寄傲谈诗酒，倚杖徘徊饱看山。",story:"陶渊明辞官归隐，居室虽小仍感安适；凭窗谈诗饮酒、扶杖看山，表现不贪名利、知足自在的生活态度。",readings:{事业:"名望难成，谋事须审时度势。",姻缘:"婚姻不合，不宜勉强。",财运:"财运渐有进展。",健康:"疾病可医治。",出行:"行人将至，出行仍须知所趋避。",家宅:"家宅平安，宜修善。",学业:"",流年:""}},{id:39,level:"中平",title:"夷齐让国",poem:"夷齐不忍食周粟，兄弟心甘采蕨餐。让国名应垂万古，可怜饿倒首阳山。",story:"伯夷、叔齐兄弟让国，隐居首阳山采蕨薇为食，不肯食周粟，最终饿死；其气节与悲苦并存。",readings:{事业:"谋望不易称心，宜忍耐并谨慎行事。",姻缘:"婚姻不宜强求。",财运:"求财困难。",健康:"疾病风险较高，宜及时求医。",出行:"出行恐有阻隔，不宜贸然前往。",家宅:"家宅平常。",学业:"",流年:""}},{id:40,level:"下下",title:"伯牙碎琴",poem:"人世知音能有几，碎琴都为子期亡。坟前洒尽千行泪，隔别阴阳各一方。",story:"伯牙善弹琴，钟子期善听；钟子期去世后，伯牙认为世间再无知音，遂在其墓前摔碎琴，不再弹奏。",readings:{事业:"谋望不利，暂不宜贸然向前。",姻缘:"婚姻无缘，难以成就。",财运:"求财不利。",健康:"疾病容易拖延，需谨慎处理。",出行:"出行没有明显好处，不宜前往。",家宅:"家宅不安，宜修德积善。",学业:"",流年:""}},{id:41,level:"中吉",title:"张骞遇仙姬",poem:"浮槎月夜到天河，曾见仙姬织锦梭。石得支机人罕识，那知此宝出云窝。",story:"张骞传说乘槎夜至天河，见仙女织锦并取得支机石而归；签文借此比喻自身有才宝，却未必为世人识得，终有机会遇到赏识者。",readings:{事业:"谋望之事应努力争取。",姻缘:"婚姻可合，姻缘将近。",财运:"求财合时。",健康:"有病宜祈祷。",出行:"出行无妨。",家宅:"家宅无碍，宜积善。",学业:"",流年:""}},{id:42,level:"中吉",title:"王允遇貂婵",poem:"月明散步到花栏，无策焉能剿灭奸。幸有貂婵思定国，英雄难过美人关。",story:"东汉末年，王允为铲除董卓而苦无良策，貂婵参与连环计，使董卓与吕布反目，最终促成董卓败亡。",readings:{事业:"谋望可吉，宜正直行事并防小人。",姻缘:"婚姻可合。",财运:"求财可得。",健康:"疾病有望痊愈。",出行:"出行宜防小人。",家宅:"家宅平安。",学业:"",流年:""}},{id:43,level:"下下",title:"韩文公谏君",poem:"只因直谏怒天颜，昼夜难离在马鞍。主仆奔忙神亦倦，更加雪重拥蓝关。",story:"韩愈因直言劝谏触怒皇帝，被贬赴潮州；途中行至蓝关又遇大雪阻路，描绘艰难困顿之境。",readings:{事业:"谋望多凶，不宜贸然推进。",姻缘:"婚姻不宜。",财运:"财运不遂。",健康:"疾病较难痊愈，应谨慎处理。",出行:"出行阻滞，事势艰难。",家宅:"家宅运势受阻。",学业:"",流年:""}},{id:44,level:"中吉",title:"唐天宝评花",poem:"满园春色斗新妆，意似争姘夺国香。到底是谁居丽首，牡丹艳冠百花场。",story:"唐玄宗天宝年间，牡丹为人所赏，以艳冠群芳、被评为百花之首的景象，寓意出众与得势。",readings:{事业:"有脱颖而出、趁势发展的机会。",姻缘:"感情运较佳，适合考虑婚事。",财运:"求财较以往顺利，但宜积蓄。",健康:"偶有小病，应及时就医。",出行:"",家宅:"家中喜事较多。",学业:"",流年:"立春后运势渐入佳境。"}},{id:45,level:"中平",title:"王质遇仙",poem:"采樵不意到云天，闲看敲棋二老仙。柯烂也思归故里，山中七日世千年。",story:"樵夫王质入山砍柴，偶遇仙人对弈，观棋片刻后发现斧柄已朽；回到人间时，世上已历经千年。",readings:{事业:"计划若不付诸行动，便难有成果。",姻缘:"感情运较好，宜珍惜相处时光。",财运:"财物须靠自身努力取得，不宜寄望侥幸。",健康:"宜多作户外活动。",出行:"",家宅:"家庭生活平稳，夫妻感情平淡而真挚。",学业:"",流年:"平稳中有机会，宜把握时机。"}},{id:46,level:"下下",title:"左慈戏曹",poem:"黄柑数盒献曹公，剖看原来肉尽空。怒动奸雄挥铁斧，奔忙身入万羊中。",story:"签文讲述有人献给曹操数盒柑橘，剖开后却发现柑内空无果肉，曹操震怒挥斧，献柑者逃入羊群中避祸；以此喻假局欺人、惹祸归身。",readings:{事业:"谋望之事不可行，名望难成。",姻缘:"婚姻未合。",财运:"财运不生。",健康:"疾病有险。",出行:"出行大为不利。",家宅:"家宅不宁。",学业:"",流年:""}},{id:47,level:"中平",title:"鲁肃索荆州",poem:"遥遥千里来西蜀，欲问荆州那日还。刘备不言声泪下，自思无策转吴间。",story:"三国时刘备向孙权借荆州，后来东吴派鲁肃索还；刘备以哭泣应对，仍无妥善解决办法。签意涉及借而不还及进退为难。",readings:{事业:"事业常有阻滞，不宜贸然自行开业。",姻缘:"感情容易因小事争端而进退两难。",财运:"钱财往来须谨慎，账目和文件宜亲自核对。",健康:"皮肤、肠胃等小病可能反复。",出行:"",家宅:"家宅平安，但须防财物损失。",学业:"",流年:"有小灾劫，登山涉水及财物往来须谨慎。"}},{id:48,level:"中平",title:"卓文君卖酒",poem:"绣阁听琴自起思，改妆夤夜最欢时。可怜沽酒临邛市，才子佳人两下厨。",story:"卓文君夜听司马相如弹琴而与之私奔；二人婚后家贫，在临邛开酒肆，夫妻共同经营。",readings:{事业:"做事宜亲力亲为，可考虑与可信任的伴侣合作。",姻缘:"感情运较佳，有良缘可把握。",财运:"没有偏财，收入须靠自身劳动。",健康:"大致无碍，但宜保持良好生活习惯。",出行:"",家宅:"夫妻同心，家庭关系可渐趋和睦。",学业:"",流年:"先苦后甜，冬季有贵人助力。"}},{id:49,level:"中吉",title:"司马相如题桥",poem:"十年窗下苦功成，有志难舒愿不轻。试看题桥十三字，生平心誓确钟情。",story:"司马相如未成名时在桥上题下志向，立誓若不能乘高车驷马便不再经过此桥；后来得汉武帝赏识，终有所成。",readings:{事业:"有白手创业、凭自身努力发展的机会。",姻缘:"感情美满，可主动表达结婚意愿。",财运:"年中正财较旺，也有偏财机会。",健康:"心情愉快，小病有望逐渐好转。",出行:"",家宅:"家庭境况渐有改善，夫妻感情趋于深厚。",学业:"",流年:"运势逐步向好，入秋后更佳。"}},{id:50,level:"中吉",title:"伍员出关",poem:"记得当年伍子胥，潜奔难渡幸逢渔。欲将宝剑相持赠，大义交朋却不辞。",story:"伍子胥遭楚王追杀，逃至江边时获渔父救助渡江；他欲赠宝剑答谢，渔父却辞而不受。",readings:{事业:"遇到困难时有贵人相助，但仍须坚定行事。",姻缘:"有机会遇到合意对象，宜尊重对方诚意。",财运:"财有来路，但切忌贪婪。",健康:"注意休息，秋冬宜多保养。",出行:"不宜贪图谋取，谨慎后再行。",家宅:"家人安康，宜孝顺父母、避免争吵。",学业:"读书须用功，方能有所成。",流年:"表面似有动荡，但其中仍有机会。"}},{id:51,level:"中平",title:"成王剪桐封弟",poem:"剪桐虽是作儿嬉，封弟成圭语不移。何以伪为成实事，言因无戏故如斯。",story:"周成王与弟弟戏言封侯，周公以“君无戏言”劝谏；后来成王兑现承诺，将唐地封给弟弟唐叔，故事强调言而有信。",readings:{事业:"做事须守时守信，谋定后再行动。",姻缘:"情侣容易争吵，宜坦诚沟通。",财运:"并非求财特别有利之年，宜为将来储备。",健康:"宜留意四肢损伤。",出行:"",家宅:"宜孝敬长辈、爱护晚辈。",学业:"",流年:"平平常常，但仍有小机会。"}},{id:52,level:"中平",title:"天地人三才",poem:"上清下浊成天地，清浊相凝便作人。尔欲签求明白事，且将三等细明分。",story:"签文以清气上浮成天、浊气下凝成地、清浊相合而成人作比喻，强调清浊善恶有别，行事应端正清洁。",readings:{事业:"谋望须谨慎行事。",姻缘:"婚事不宜贸然决定。",财运:"财利不丰。",健康:"疾病可医治。",出行:"行善者适宜出行，行事不正则不宜。",家宅:"积善可使家宅兴旺。",学业:"",流年:""}},{id:53,level:"中吉",title:"孟尝君",poem:"珠履三千客孟尝，谁人识得有膺扬。其中弹铗归来者，便是英雄志莫当。",story:"战国齐国孟尝君门下食客众多，冯谖曾弹剑而歌表达待遇不足；孟尝君后来礼遇他，显出识才与用才之意。",readings:{事业:"谋望之事尚需仔细商量，名利可望但宜修善。",姻缘:"婚姻可望良好。",财运:"",健康:"有病宜祈祷。",出行:"出行宜有得力之人扶助。",家宅:"家宅无碍。",学业:"",流年:""}},{id:54,level:"中平",title:"庄周梦蝶蜨",poem:"庄子酣眠成蜨梦，翩翻飞入百花丛。天香采得归来后，犹在高床暖枕中。",story:"庄周梦见自己化为蝴蝶，在花丛间飞舞；醒来后仍卧于床上，由此引出梦境与现实的思辨。",readings:{事业:"不宜期望过高，现实发展可能与预想有差距。",姻缘:"婚事暂缓较妥。",财运:"虽有小财，但不易积蓄。",健康:"身心较为开朗。",出行:"出行宜稳妥谨慎。",家宅:"家中气氛欢乐，家人平安。",学业:"勤奋有益，嬉戏无益。",流年:"平稳，无特别变化。"}},{id:55,level:"中平",title:"吴隐之除官归隐",poem:"浦号沉香遗旧恨，渡江犹忆古人心。可怜当日辞官去，虽有馨留不易寻。",story:"东晋吴隐之为官清廉，拒绝接受沉香馈赠；返程遇风浪时将沉香投入水中，以表明不取不义之财的操守。",readings:{事业:"谋望之事应仔细考虑。",姻缘:"婚事暂不宜议定。",财运:"有利可得，但贪心反受其害。",健康:"疾病可医治。",出行:"行善者可以出行。",家宅:"修善可得福。",学业:"",流年:""}},{id:56,level:"中吉",title:"桃木剑化龙",poem:"安知此剑不成龙，见水都应出袖中。他日飞腾千万里，上空妖矫有云从。",story:"签文描绘袖中之剑遇水化龙、日后飞腾万里的奇异景象；此象征吉兆，但指出“他日”意味着尚待时机。",readings:{事业:"谋望吉，名望可期。",姻缘:"婚姻可谋。",财运:"求财可望。",健康:"疾病有望痊愈。",出行:"出行可望顺意。",家宅:"家宅吉。",学业:"",流年:"年末更有喜色（问天时，尾季更可喜）。"}},{id:57,level:"中吉",title:"卖花得美",poem:"小楼春雨声初歇，彳亍街头屐不停。忽听卖花人入巷，一枝买得慢行行。",story:"春雨刚停，行人穿木屐在街上行走，听见卖花人入巷便买下一枝花；因路面湿滑而慢慢前行，寓意凡事从容谨慎。",readings:{事业:"谋望之事需要仔细。",姻缘:"婚姻可求，进展渐渐到来。",财运:"求财少量亦可满足。",健康:"疾病及孕事均宜谨慎。",出行:"出行凡事仔细则吉。",家宅:"家宅平安，将有喜事。",学业:"",流年:""}},{id:58,level:"下下",title:"秦穆公大败",poem:"秦师大败在殽山，三帅皆擒尽放还。蹇叔谏言因不听，倒戈舍甲返秦间。",story:"秦穆公不听蹇叔劝谏，出兵攻郑，在殽山遭晋军大败，三名主帅被俘后获释归秦；典故以不纳忠告、轻率出兵导致惨败为戒。",readings:{事业:"谋望之事不可行。",姻缘:"婚姻不利。",财运:"财运不利。",健康:"疾病有险。",出行:"出行风险较大。",家宅:"家宅未宁。",学业:"",流年:""}},{id:59,level:"下下",title:"吴王宠西施",poem:"浣溪纱女美无双，媚至吴王国破亡。最恼东施效颦笑，山鸡岂可胜鸾凰。",story:"越王勾践将西施献给吴王夫差，吴王沉迷美色而误国；东施模仿西施反而弄巧成拙，签文以此劝人安分守己，不宜盲目模仿他人。",readings:{事业:"谋望多不吉。",姻缘:"婚姻难有喜色。",财运:"求财困难。",健康:"疾病宜谨慎处理。",出行:"出行容易招来烦恼。",家宅:"家宅平常。",学业:"",流年:""}},{id:60,level:"中平",title:"李白醉和番书",poem:"和番醉笔似云烟，日在长安酒店眠。倘遇唐皇颁令召，重呼不上木兰船。",story:"传说李白醉卧长安酒肆，唐玄宗召其入宫处理和番文书；李白醒后挥笔成文，使番使不敢再来相扰。",readings:{事业:"事业暂未见明显起色。",姻缘:"适合考虑婚事。",财运:"财运微薄，不宜苛求。",健康:"小病无妨。",出行:"出行勿贪谋。",家宅:"家人平安。",学业:"多下苦功，成绩才有进步。",流年:"没有明显大机会，表面出现的机会未必可靠。"}},{id:61,level:"下下",title:"十二金牌召岳飞",poem:"十二金牌速召回，奸雄设计几时灰；可怜一旦功劳散，老少扶车不断哀。",story:"传说岳飞抗金时，秦桧以十二道金牌召其回朝，令其未能继续完成北伐，后遭奸臣构陷。此为",readings:{事业:"谋望之事不宜贸然进行。",姻缘:"婚姻不利。",财运:"容易破耗，不宜妄求。",健康:"病孕皆有辛苦，身体状况需谨慎。",出行:"未宜出行，并须防小人口舌。",家宅:"宅运不安，宜积善修德。",学业:"",流年:""}},{id:62,level:"中平",title:"美玉藏金",poem:"美玉于斯韞匱藏，休求善價費商量；沽之亦可隨相待，此物何须自看常。",story:"",readings:{事业:"谋望应等待合适时机，不宜急进。",姻缘:"婚姻不宜贸然议定。",财运:"求财须依正理，不可急求。",健康:"病愈较迟，宜耐心调养。",出行:"等待时机再出行。",家宅:"家宅吉，但仍宜修身行善。",学业:"",流年:""}},{id:63,level:"中吉",title:"颜回守道",poem:"陋巷箪瓢不足愁，旁人见此甚为忧；不知乐道忘贫之，亚圣芳名万古留。",story:"颜回生活清贫，居于陋巷，仅以一箪食、一瓢饮为食，却仍安于道义、乐于修身，因此受到后世尊崇。",readings:{事业:"谋望宜谨慎，不宜贪求名利。",姻缘:"婚姻可合。",财运:"不宜妄求名利；蚕畜之利可得。",健康:"疾病可医。",出行:"途中或有辛苦，最终苦中有甘。",家宅:"家宅吉。",学业:"",流年:""}},{id:64,level:"中吉",title:"孟之反奔",poem:"奔殿须知上古人，入门策马不夸能；败师谁肯甘从后，托谓鸣骢畏苦辛。",story:"鲁国与齐国交战失利，孟之反殿后撤退，入城后却不夸耀自己的功劳，谦称只是马跑不快；孔子曾称赞他的谦逊。",readings:{事业:"谋望应等待时机，不宜争强。",姻缘:"婚姻不宜。",财运:"名利难求，畜蚕须谨慎经营。",健康:"疾病宜谨慎求医祈福。",出行:"出行恐有不利，宜审慎。",家宅:"修善可使家宅趋美。",学业:"",流年:""}},{id:65,level:"下下",title:"陈后主失位",poem:"隋灭陈时战伐纷，都因妖媚闭明君；陈奔西赴无藏息，井里胭脂隐玉人。",story:"陈后主沉迷声色，隋军攻陈时仓皇逃亡，最终与妃嫔藏入胭脂井而被俘，陈朝随之复亡。",readings:{事业:"谋望不利，宜谨慎，避免冒进。",姻缘:"",财运:"有损耗，须防破财。",健康:"病情有险，须谨慎对待。",出行:"多有阻碍，不宜贸然出行。",家宅:"",学业:"",流年:""}},{id:66,level:"上吉",title:"王羲之会群贤",poem:"兰亭雅会众群贤，曲水流觞舍管弦；天朗气清风惠畅，茂林修竹乐怡然。",story:"王羲之曾于会稽山兰亭与众贤雅集，曲水流觞、饮酒赋诗；《兰亭序》记述的正是这一场景。",readings:{事业:"谋望吉利，诸事兴旺。",姻缘:"婚姻可定。",财运:"财运丰盈。",健康:"疾病有望痊愈。",出行:"往来皆吉利。",家宅:"家宅安宁。",学业:"",流年:""}},{id:67,level:"中平",title:"霸王自缢",poem:"人虽勇力不能当，莫恃英雄独冠场；可挟泰山超北海，身心犹贵重存亡。",story:"",readings:{事业:"谋望须仔细斟酌，不宜逞强。",姻缘:"婚姻不合。",财运:"财难得，不宜妄求。",健康:"有病宜谨慎求医祈祷。",出行:"出行凡事不可自恃，宜谨慎。",家宅:"家宅平常。",学业:"",流年:""}},{id:68,level:"中吉",title:"姜太公遇文王",poem:"久抱凌云志未舒，荷竿渭水钓游鱼；文王千里求贤士，灭纣兴周任意如。",story:"姜太公怀才未遇时隐居渭水垂钓，后来周文王前来求贤并任用他，最终辅佐周室兴起。",readings:{事业:"谋望适宜，等待贵人和时机。",姻缘:"婚姻可合。",财运:"求财可得。",健康:"疾病可医。",出行:"出行顺利。",家宅:"家宅平安。",学业:"",流年:""}},{id:69,level:"中吉",title:"韩文公祭鳄鱼",poem:"忠义存心官十载，年丰民乐惠难忘；鳄鱼毒害都能息，祷告长江北海王。",story:"韩愈任潮州刺史时，传说当地鳄鱼为害，韩愈作《祭鳄鱼文》祷告以止其害；注本借此说明忠义行事、为民造福。",readings:{事业:"谋望无大妨碍，可稳妥推进。",姻缘:"",财运:"求财大吉昌。",健康:"病孕之事宜谨慎祈禳。",出行:"忠直者可出行；行人渐有归期。",家宅:"家宅平稳，宜积善。",学业:"",流年:""}},{id:70,level:"中平",title:"塞翁失马",poem:"可比当年一塞翁，虽然失马半途中；不知祸福真何事，到底方明事始终。",story:"塞翁失马后，邻人以为是祸，他却认为未必；马后来归来又带马，儿子骑马跌伤，反而因此免于征役。故事用来说明祸福转化难以预料。",readings:{事业:"谋望不甚适宜，宜稳扎稳打。",姻缘:"暂不宜议定婚姻。",财运:"财利微薄。",健康:"疾病宜谨慎处理。",出行:"行人未至；行善者出行无妨。",家宅:"家宅安否暂难确定。",学业:"",流年:""}},{id:71,level:"中平",title:"庄周活鲋鱼",poem:"涸辙之中鲋困之，穷通自可卜当时；若能引得西江水，他日成龙也未知。",story:"鲋鱼困在干涸车辙中，向路人求水；庄周以此作比喻，说明身陷困境者亟需及时援助，否则难有转机。",readings:{事业:"谋望之事应等待时机。",姻缘:"婚姻暂不宜议。",财运:"财运难得。",健康:"有病应及时求医。",出行:"等待时机再出行。",家宅:"宅运受阻，宜积善修德。",学业:"",流年:""}},{id:72,level:"中平",title:"守株待兔",poem:"兔兒久待意何如，堪叹愚人独守株；算是无能令我笑，不须守旧自拘拘。",story:"有人守着树桩等待兔子再次撞来，久候无果仍不改变做法；故事用来劝人不要拘泥旧法、错失转机。",readings:{事业:"谋望之事暂不宜做，需考虑改变方法。",姻缘:"婚姻不宜。",财运:"财难得，蚕畜之利微薄。",健康:"疾病宜考虑另求诊治。",出行:"出行未必有利。",家宅:"家宅平常，宜修善。",学业:"",流年:""}},{id:73,level:"上上",title:"伦文叙高中",poem:"夹道花香衬马蹄，蓝袍改换锦衣归；满街红粉皆争羡，翘首芳名雁塔题。",story:"以进士、翰林题名及蓝袍换锦衣归乡的景象，说明功成名就、衣锦还乡；未据确认更具体的个人故事。",readings:{事业:"谋望大吉，有望取得显著成果。",姻缘:"",财运:"财大利。",健康:"疾病即愈。",出行:"出行事事合意。",家宅:"家宅兴旺，有贵气。",学业:"",流年:""}},{id:74,level:"下下",title:"朱买臣分妻",poem:"回忆当年运蹇时，夫妻反目两分离；名题雁塔归来候，复水马头时否悲。",story:"朱买臣家贫时妻子离去；后来朱买臣显达，妻子欲复合，但如复水难收，已无法挽回。",readings:{事业:"谋望不利，宜调整计划。",姻缘:"婚姻不利。",财运:"不宜求财，财利不佳。",健康:"病愈较迟，宜谨慎调养。",出行:"出行难获助力，不宜冒进。",家宅:"宅运受阻。",学业:"",流年:""}},{id:75,level:"下下",title:"伦文叙戏妻",poem:"婚姻岂可厌家贫，文叙夫妻两拆分；一旦首登龙虎榜，戏妻楼坠自身亡。",story:"传说，伦文叙家贫时妻子离去；他高中后戏谑旧妻，妻子因羞愤而坠楼身亡。",readings:{事业:"谋望之事不可贸然进行。",姻缘:"婚姻不宜成就。",财运:"财难得。",健康:"病难痊愈，宜及时就医。",出行:"出行不利。",家宅:"家宅不宁。",学业:"",流年:""}},{id:76,level:"中平",title:"孔夫子守道",poem:"人能乐道自修身，疏水曲肱岂厌贫；不义而富且贵者，我心都是作浮云。",story:"孔子即使生活清贫，饮水、枕着弯曲的手臂休息，仍能安于道义；不合道义取得的富贵，在他看来如浮云一般。",readings:{事业:"谋望多有商量与周折，不宜急进。",姻缘:"婚姻不宜勉强讲究。",财运:"名利勿贪，财利微薄。",健康:"",出行:"出行平淡，难有特别收获。",家宅:"家宅平常。",学业:"",流年:""}},{id:77,level:"中平",title:"公冶长受辱",poem:"鸟语能通公冶长，南山有个虎驮羊；其身虽在于缧绁，到底非关自己殃。",story:"传说公冶长通晓鸟语，听鸟说南山有虎拖羊，前往后被失主误以为偷羊而入狱；后来鸟传来消息使其得以证明清白、脱离牢狱。不同注本对获释过程的叙述略有差别。",readings:{事业:"谋望不甚适宜，宜守本分。",姻缘:"婚姻不合。",财运:"求财困难，不宜妄为。",健康:"疾病可医。",出行:"出行凶多吉少，行人归期较迟。",家宅:"宅运受阻，是非较多。",学业:"",流年:""}},{id:78,level:"上吉",title:"曾点言志",poem:"瑟希铿尔尚留声，春暮时刚春服成；冠五六人童六七，舞雩归咏畅幽情。",story:"曾点与孔子谈志向，描绘暮春时穿上春服，与几位成年朋友及少年到舞雩一带游赏，唱咏归来，表现自在闲适的心境。",readings:{事业:"谋望吉利，可按计划推进。",姻缘:"婚姻可求。",财运:"财利可得。",健康:"疾病无忧。",出行:"出行事事合意。",家宅:"家宅安乐。",学业:"",流年:""}},{id:79,level:"中平",title:"苏秦封相",poem:"富贵有如春梦熟，世人何苦力争求；任他秉笏当朝立，到死惟留土一抔。",story:"",readings:{事业:"谋望应等待时机，不宜强求。",姻缘:"暂不宜议婚。",财运:"不宜贪求名利，蚕畜之利微薄。",健康:"病孕之事宜谨慎祈佑。",出行:"出行劳苦而收益少。",家宅:"家宅平常，宜修德。",学业:"",流年:""}},{id:80,level:"中吉",title:"乐广释疑",poem:"飞觞对舞几时赊，弓影横杯误作蛇；猜透诗中元妙诀，泰来否极事无差。",story:"此签取“杯弓蛇影”故事：客人误把酒杯中映出的弓影当成蛇，心生疑惧；乐广解释后，客人释疑。故事借此提醒人不要因误会而自扰。",readings:{事业:"谋望合时，可按计划谨慎进行。",姻缘:"婚姻可合，但仍宜谨慎。",财运:"财可得，蚕畜之利微薄。",健康:"疾病可医。",出行:"出行最终无大妨碍。",家宅:"家宅平安，逐渐安稳。",学业:"",流年:""}},{id:81,level:"中吉",title:"子路射雌",poem:"山梁雌雉得其时，上下飞鸣自乐之。色举须知翔后集，作声三嗅过山欹。",story:"",readings:{事业:"谋望之事要审时知机。",姻缘:"",财运:"财可得。",健康:"孕与病均须仔细留意。",出行:"行人可归；出行事势可能有变化。",家宅:"家宅无大碍。",学业:"",流年:""}},{id:82,level:"中平",title:"孔子在卫",poem:"圣人击磬在于卫，谁料过门有荷篑。嗟叹有心挽道穷，可怜日月今将逝。",story:"孔子在卫国击磬，一位挑着草筐经过门口的人听见磬声，感叹击磬者有救世之心，却已年老；故事见于《论语·宪问》相关章句，亦作此解释。",readings:{事业:"谋望之事勿妄为。",姻缘:"婚姻不宜。",财运:"求财需等待时机。",健康:"病愈较迟。",出行:"行人尚未归；出行须防小人口舌。",家宅:"家宅平常。",学业:"",流年:""}},{id:83,level:"中平",title:"人心不足",poem:"凡尘身历几时闲，世事浑如叠叠山。既富尚忧无贵子，不知花放又花残。",story:"以赤松子劝人归隐为典故，借富贵之后仍有忧虑、花开花落的意象劝人知足；",readings:{事业:"谋望宜避免纷扰，不宜贪求名利。",姻缘:"婚姻暂不宜谋议。",财运:"",健康:"疾病可疗。",出行:"行人未至。",家宅:"家宅平安。",学业:"",流年:"一切平淡，勿担心，亦勿贪心。"}},{id:84,level:"中吉",title:"韩信投军",poem:"满腹奇才志未冲，铁鸡难举意无容。张良指示身投汉，项羽乌江命自穷。",story:"韩信怀才不遇时未获重用，后来经张良指引投奔汉王刘邦，辅佐汉军击败项羽；亦以此说明先难后易、终得贵人扶助。",readings:{事业:"谋望须审慎筹划，最终有望得到贵人扶助。",姻缘:"",财运:"财可得。",健康:"疾病可医。",出行:"行人渐至。",家宅:"家宅平安。",学业:"",流年:""}},{id:85,level:"上吉",title:"刘向高中",poem:"太乙燃藜照读书，十年窗下苦功舒。扬眉吐气袍穿锦，驷马高车拥道随。",story:"典故讲太乙神以藜杖照亮读书之处，象征长期苦读终获功名；以十年苦功后一朝显达说明此签。",readings:{事业:"谋望之事适合实行，名望可成。",姻缘:"婚姻可定。",财运:"财亦可得。",健康:"疾病可安。",出行:"行人归来，往来得意。",家宅:"家宅吉。",学业:"",流年:""}},{id:86,level:"中吉",title:"侃母迎宾",poem:"截发迎宾否也贫，贫中贤妇更何人。古今只有陶侃母，所以名留万代闻。",story:"陶侃家贫时有客来访，其母剪下自己的头发出售，换钱备酒待客；后世以此称颂陶母贤德。",readings:{事业:"谋望之事宜预先周详筹划。",姻缘:"婚姻可合。",财运:"财可求。",健康:"疾病可医。",出行:"行人归来，出行合时。",家宅:"家宅美。",学业:"",流年:"苦尽而甘来。"}},{id:87,level:"中平",title:"两雄相遇",poem:"会谈华座逞英雄，究竟谁人秉大公。一云日下荀鸣鹤，一说云间陆士龙。",story:"签诗提到荀氏、陆氏两位人物在席间各陈其说，众说纷纭，难辨谁能秉公判断；以此说明是非口舌、不可轻信传言。",readings:{事业:"谋望不甚适宜。",姻缘:"婚姻应另作考虑。",财运:"财难求。",健康:"疾病可医。",出行:"出行恐惹是非，行人未至。",家宅:"家宅须防是非。",学业:"",流年:""}},{id:88,level:"中吉",title:"木兰从军",poem:"替父从军胆气雄，须眉巾帼几人同。以身报国忠而孝，笑煞当时众巨公。",story:"花木兰代父从军，以女子之身上阵报国，兼尽忠孝；亦以此为典，勉人勇往向前、为善不辞劳苦。",readings:{事业:"谋望之事可以实行。",姻缘:"婚姻合宜。",财运:"财可求。",健康:"疾病可医。",出行:"行人归来，出行无妨。",家宅:"家宅平安。",学业:"",流年:""}},{id:89,level:"下下",title:"吴季子挂剑",poem:"他邦远历佩鱼肠，谁料徐君意欲将。既返愿为相赠答，且悬树下表情长。",story:"吴季札出使经过徐国，徐君喜爱其佩剑；季札当时未赠，待返回时徐君已逝，便将剑挂在墓旁树上，以表守信与长情。亦记载此事。",readings:{事业:"谋望之事不宜做。",姻缘:"婚姻暂莫议。",财运:"强求财利反而更困窘。",健康:"疾病有凶险。",出行:"行人不归，出行不宜求财。",家宅:"家宅平常，各尽本分。",学业:"",流年:""}},{id:90,level:"中平",title:"红拂女私奔",poem:"细整残妆夜欲奔，座中李靖更何人。那知虬髯情钟处，拔剑三回未敢陈。",story:"红拂女与李靖相知，准备夜间离开杨府；虬髯客出现后，李靖一度误会并欲拔剑，红拂女从中阻止。后世称三人为“风尘三侠”。",readings:{事业:"谋望之事不可为，功名须待时。",姻缘:"婚姻不宜。",财运:"财难得。",健康:"疾病可医，但孕事有惊险之虑。",出行:"行人归迟，出行财利勿相争。",家宅:"家宅平常。",学业:"",流年:"平淡中常有小喜，但大运未至。"}},{id:91,level:"上上",title:"蔡中兴高中",poem:"蟾官月殿桂飘香，玉箧团圆万里光。六水三山归镜里，无瑕一片挂穹苍。",story:"",readings:{事业:"谋望吉利。",姻缘:"婚姻相合。",财运:"求财可得，蚕畜可获大利。",健康:"疾病即愈。",出行:"行人即回，出行各处皆顺利。",家宅:"家宅平常。",学业:"",流年:"百事宜，整体顺遂。"}},{id:92,level:"中吉",title:"孔夫子周游列国",poem:"至圣周游列国行，在齐得听奏韶声。三月不知嘉肉味，善哉大道可功成。",story:"孔子周游列国时在齐国听到韶乐，专心学习，三个月沉浸其中而不知肉味；以专心致志终有所成为意。",readings:{事业:"谋望之事专心去做可望成功。",姻缘:"婚姻可合。",财运:"财可求。",健康:"疾病可医。",出行:"行人可至，出行有利。",家宅:"家宅安宁。",学业:"专心学习可望有成（据“专心去做则必功成”概括；非独立学业断语）。",流年:""}},{id:93,level:"下下",title:"郑王失位",poem:"郑卫之音不忍听，淫风败俗国将倾。令人深入迷津路，所奏全非古乐声。",story:"签诗借“郑卫之音”指不合礼乐的声乐风气，将其解释为败抔风俗、令人迷失，劝人谨慎并远离声色财利。",readings:{事业:"谋望之事不可为。",姻缘:"婚姻不宜。",财运:"财难求。",健康:"疾病痊愈较迟。",出行:"行人受阻，出行不利。",家宅:"宅运受阻，宜积善。",学业:"",流年:""}},{id:94,level:"中平",title:"两虎相争",poem:"一窟难藏两虎儿，乘风别岭各栖之。名山自守为巢穴，可免伤残后悔迟。",story:"以一山不能藏两虎为喻，劝双方知时退避、各守其位，避免争斗造成伤害；并非另有明确历史人物故事。",readings:{事业:"谋望之事须反复商量，不宜勉强。",姻缘:"婚姻不祥。",财运:"财难得。",健康:"疾病及孕事恐有损伤，须谨慎。",出行:"行人受阻，未能归乡；出行宜避开不利情势。",家宅:"家宅有碍，宜积善。",学业:"",流年:""}},{id:95,level:"中平",title:"女娲氏",poem:"功勤一篑可成山，由少而多莫惮烦。作事畏辛今汝画，补天炼石亦无难。",story:"传说远古时天穹出现破损，女娲炼五色石补天；签文借此勉励人持续勤奋、由少积多，终能完成艰难之事。",readings:{事业:"谋望应自强不息，勤恳做事。",姻缘:"婚姻不良，不宜急定。",财运:"求财平常。",健康:"疾病可医。",出行:"行人未至。",家宅:"家宅平常，积善可昌。",学业:"",流年:"可能有较大变动，勤力做事可平稳过度。"}},{id:96,level:"中平",title:"文姬思汉",poem:"姜笛频吹韵更悲，异乡作客触归期。南来孤雁如怜我，烦寄家书转达知。",story:"蔡文姬流落异乡，思念故国与家人；诗中借羌笛、孤雁和家书表现客居思归之情。重在客居难归的处境。",readings:{事业:"谋望之事不可为。",姻缘:"婚姻不宜。",财运:"财利未至。",健康:"疾病痊愈较迟。",出行:"行人未归，出行恐辛苦受阻。",家宅:"宅运受阻。",学业:"",流年:"凡事皆有阻滞。"}},{id:97,level:"中平",title:"康顺钓鱼",poem:"凭栏晚眺倚南楼，满目风光景色幽。一叶小舟频下饵，渔翁钓得有鱼无。",story:"以渔翁不断垂钓却未必有所收获为喻，说明勤苦未必有成，事情吉凶尚未可定。",readings:{事业:"谋望应谨慎。",姻缘:"婚姻宜另作选择。",财运:"财难得。",健康:"疾病痊愈较迟。",出行:"行人未至，出行辛苦恐无利。",家宅:"家宅平稳，修善可昌。",学业:"",流年:"勤苦未必有功，吉凶尚未可定。"}},{id:98,level:"中平",title:"掘地寻金",poem:"入山种玉嫌田狭，掘地寻金厌客多。富贵贫穷天注定，世人何苦力奔波。",story:"以田地狭小难以种玉、人多分薄难以掘金为喻，劝人修善听命，不要为富贵过度奔波。",readings:{事业:"谋望无大碍，但不宜强求；劳而无功之事不必前往。",姻缘:"婚姻不宜。",财运:"财难得。",健康:"疾病可医。",出行:"行人归迟，辛苦出行反而不美。",家宅:"家宅平稳。",学业:"",流年:"得失由天意，宜修善、不强求。"}},{id:99,level:"中平",title:"韩文公遇雪",poem:"雪拥桥头马不前，风狂渔父莫开船。水流花谢人谁惜，早立坚心志勿偏。",story:"以大雪阻马、狂风阻船为喻，提醒时机不利时不要勉强行动，及早立定正心，防止招惹是非。",readings:{事业:"谋望须等待时机，凡事谨慎。",姻缘:"婚姻不宜。",财运:"财难得。",健康:"患病应谨慎求医。",出行:"行人受阻，未能如期归来；出行易惹风波。",家宅:"家宅平常，宜结善缘。",学业:"",流年:"运势暂有阻隔，宜守正等待。"}},{id:100,level:"中吉",title:"百花开放",poem:"百花竞放贺阳春，万物从今尽转新。末数莫言穷运至，不知否极泰来频。",story:"以百花迎春、万物更新比喻运势由穷转通，提醒人在困顿时仍可改过向善、重新开始。",readings:{事业:"谋望可喜，运势有望逐渐转顺。",姻缘:"婚姻良好。",财运:"财运逐渐到来。",健康:"疾病渐愈。",出行:"行人渐归，出行可望转顺。",家宅:"家宅运转，行善则昌。",学业:"",流年:"否极泰来，困境有望逐步改善。"}}];function validateHuangSigns(){const total=HUANG_DAXIAN_SIGNS.length,count={};HUANG_DAXIAN_SIGNS.forEach(s=>count[s.level]=(count[s.level]||0)+1);const ids=HUANG_DAXIAN_SIGNS.map(s=>s.id),dup=ids.filter((id,i)=>ids.indexOf(i)!==i),empty=HUANG_DAXIAN_SIGNS.filter(s=>!s.poem||s.poem.length<10||s.poem.includes("待录入"));console.log("黄大仙签自检:",{total,expected:100,count,expectedDist:HUANG_LEVEL_DIST,duplicateIds:dup,emptyOrPending:empty.length})}function viewHuang(){const rec=DB.data.huang||{},pick2=rec.pick||null,hist=(DB.data.huangHistory||[]).slice(0,10),c=`<div class="p-panel tarot-module"><div class="yj-head"><div class="yj-kicker">黄大仙灵签</div><h2>黄大仙灵签</h2><p class="yj-note">心诚则灵，默念所问之事，在心中默想三遍后求签。共 100 签。</p></div>
  <section class="yj-card"><h3>求签</h3>
    <label class="fl">所问之事（可留空）</label>
    <input id="huang-q" type="text" maxlength="60" placeholder="如：近期事业运势" value="${esc(rec.question||"")}" style="width:100%;margin:6px 0 12px;background:var(--pt-input);border:1px solid var(--pt-border);border-radius:8px;padding:9px 12px;color:var(--pt-text);outline:none;font-size:14px">
    <div style="display:flex;gap:8px"><button class="btn btn-orange" id="huang-draw">求签</button>${pick2?'<button class="btn btn-ghost" id="huang-redraw">重新求签</button>':""}</div>
  </section>
  ${pick2?`<section class="yj-card huang-result"><div class="huang-num">第 ${pick2.id} 签</div><div class="huang-level lv-${pick2.level}">${pick2.level}</div><h3>${esc(pick2.title)}</h3><div class="huang-poem">${esc(pick2.poem)}</div><p class="huang-story"><b>典故：</b>${esc(pick2.story)}</p>
    <div class="huang-readings">${Object.entries(pick2.readings).map(([k,v])=>{const q=rec.question||"";return`<details ${k==="事业"&&/工作|事业|求职|创业/i.test(q)||k==="姻缘"&&/感情|姻缘|恋爱|婚姻/i.test(q)||k==="财运"&&/钱|财运|投资/i.test(q)?"open":""}><summary>${k}</summary><p>${esc(v)}</p></details>`}).join("")}</div>
  </section>`:""}
  ${hist.length?`<section class="yj-card"><h3>最近求签记录</h3><div class="yj-hist">${hist.map((h,i)=>`<div class="yj-hist-item" style="cursor:default"><small>${esc(h.time)}</small><b>第 ${h.id} 签 · ${h.level}</b><span>${esc(h.question||"")}</span></div>`).join("")}</div></section>`:""}
  </div>`;return portalShell("huang",c)}function huangDraw(){var _a;const q=(((_a=$("#huang-q"))==null?void 0:_a.value)||"").trim(),shuffled=HUANG_DAXIAN_SIGNS.slice();for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}const pick2=shuffled[0],hist=DB.data.huangHistory||(DB.data.huangHistory=[]);hist.unshift({id:pick2.id,level:pick2.level,question:q,time:new Date().toLocaleString("zh-CN",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})}),hist.length>10&&(hist.length=10),DB.data.huang={question:q,pick:pick2,drawnAt:Date.now()},DB.save()}function oaForm(type){const val=id=>{const el=document.getElementById(id);return el?el.value.trim():""},mask=openMask(`<h3>${type==="task"?"填报任务表":"请假申请"}</h3><div class="m-body">
    ${type==="task"?`
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
      <label class="fl" style="margin-top:10px">预期成果</label><textarea class="field" id="oa-result" style="min-height:50px" placeholder="预期产出 / 交付物"></textarea>`:`<label class="fl">请假类型</label>
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
  </div>`);mask.querySelector("#oa-cancel").addEventListener("click",()=>mask.remove()),mask.querySelector("#oa-ok").addEventListener("click",()=>{const me=DB.user;let item;if(type==="task"){const title=val("oa-title");if(!title){toast("请填写任务名称","warn");return}const detail={ttype:val("oa-ttype"),prio:val("oa-prio"),s:val("oa-start"),e:val("oa-end"),loc:val("oa-loc"),goal:val("oa-goal"),plan:val("oa-plan"),res:val("oa-res"),risk:val("oa-risk"),result:val("oa-result")};item={id:genId("oa"),type:"task",userId:me.id,userName:me.name,title,detail,content:detail.goal,status:"pending",createdAt:nowStr(),reviewNote:""}}else{const lt=val("oa-ltype"),s=val("oa-start"),e=val("oa-end"),content=val("oa-content");if(!s||!e){toast("请选择起止日期","warn");return}item={id:genId("oa"),type:"leave",userId:me.id,userName:me.name,title:lt+" "+s+"~"+e,content,s,e,status:"pending",createdAt:nowStr(),reviewNote:""}}DB.data.oa.push(item),DB.save(),mask.remove(),router(),toast("申请已提交：审批人可在 OA 待办中看到提醒","ok")})}function oaDetailHtml(d){const row=(k,v)=>v?`<p><span style="color:var(--pt-muted)">${k}：</span>${esc(v)}</p>`:"",dt=v=>v?String(v).replace("T"," "):"";return`<div class="oa-detail">
    ${row("类型",d.ttype)}${row("优先级",d.prio)}
    ${row("开始",dt(d.s))}${row("截止",dt(d.e))}${row("地点",d.loc)}
    ${row("目标",d.goal)}${row("执行计划",d.plan)}
    ${row("资源/支援",d.res)}${row("风险评估",d.risk)}${row("预期成果",d.result)}
  </div>`}function viewOA(tab){const me=DB.user,isMgr=me.level>=3;isMgr||(me.oaSeenAt=Date.now(),DB.save());const t=tab||"mine",items=DB.data.oa.filter(x=>t==="all"?!0:x.userId===me.id),stName={pending:"待审批",approved:"已批准",rejected:"已驳回"},c=`<div class="p-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <h2>OA 办公</h2>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm" id="oa-task">填报任务</button>
        <button class="btn btn-sm btn-ghost" id="oa-leave">请假申请</button>
      </div>
    </div>
    <div class="oa-tabs" style="margin-top:16px">
      <button class="${t==="mine"?"on":""}" data-oatab="mine">我的申请</button>
      ${isMgr?'<button class="'+(t==="all"?"on":"")+'" data-oatab="all">全部审批</button>':""}
    </div>
    ${items.length?items.map(x=>`<div class="oa-item">
      <div class="oa-top">
        <h4>${x.type==="task"?"[任务] ":"[请假] "}${esc(x.title)}</h4>
        <span class="oa-st ${x.status}">${stName[x.status]}</span>
      </div>
      ${x.type==="task"&&x.detail?oaDetailHtml(x.detail):`<p>${esc(x.content)}</p>`}
      ${x.reviewNote?`<p style="color:#E8C87A">审批意见：${esc(x.reviewNote)}</p>`:""}
      <div class="oa-meta">${esc(x.userName)} · 提交于 ${esc(x.createdAt)}</div>
      ${isMgr&&x.status==="pending"?`<div class="oa-actions">
        <button class="btn btn-sm" data-oaap="approved:${x.id}">批准</button>
        <button class="btn btn-sm btn-ghost" data-oaap="rejected:${x.id}">驳回</button>
        <button class="btn btn-sm btn-ghost" data-oadel="${x.id}" style="margin-left:auto;color:#FF9DA0">删除</button>
      </div>`:isMgr?`<div class="oa-actions"><button class="btn btn-sm btn-ghost" data-oadel="${x.id}" style="margin-left:auto;color:#FF9DA0">删除</button></div>`:""}
    </div>`).join(""):'<div class="empty">暂无记录</div>'}
  </div>`;return portalShell("oa",c)}function viewWorkgroup(){const me=DB.user,wg=workgroupOf();if(!me||Number(me.level)<2)return portalShell("workgroup",accessDenied());wg.members.includes(me.id)||(wg.members.unshift(me.id),DB.save()),markConversationSeen("workgroup","");const isCard=wg.mode==="card",pageKey="workgroup:main",totalPages=Math.max(1,Math.ceil(wg.messages.length/CHAT_PAGE_SIZE)),page=Math.max(0,Math.min(totalPages-1,Number(CHAT_PAGE_STATE[pageKey]||0)));CHAT_PAGE_STATE[pageKey]=page;const end=wg.messages.length-page*CHAT_PAGE_SIZE,startAt=Math.max(0,end-CHAT_PAGE_SIZE),pageMessages=wg.messages.slice(startAt,end),getUser=id=>DB.data.users.find(u=>u.id===id)||{id,name:"已离职成员",avatar:""},c=`<div class="p-panel chat-window workgroup-window">
    <div class="chat-head">
      <span class="av" style="background:var(--blue-2)">${ic("briefcase",20)}</span>
      <div class="wg-title"><h3>工作组</h3><div class="ch-hint">员工与管理员内部群 · ${wg.members.length} 位成员</div></div>
      <div class="ch-actions">
        <button class="btn btn-sm btn-orange" id="wg-speak" type="button">${ic("megaphone",15)} TA 发言</button>
        <button class="btn btn-sm btn-icon" id="chat-search-toggle" data-kind="workgroup" data-target="" title="查找聊天记录" aria-label="查找聊天记录">${ic("search",16)}</button>
        <button class="btn btn-sm btn-icon" id="wg-members" type="button" title="成员管理" aria-label="成员管理">${ic("members",17)}</button>
        <button class="btn btn-sm btn-icon btn-danger-ic" id="wg-clear-messages" type="button" title="只清除工作组消息" aria-label="清除此窗口">${ic("trash",17)}</button>
        <button class="btn btn-sm btn-icon" id="wg-cfg-open" type="button" title="工作组设置" aria-label="工作组设置">${ic("settings",17)}</button>
      </div>
    </div>
    <div class="chat-scroll" id="ch-scroll">
      ${pageMessages.map((m,mi)=>{const u=getUser(m.uid),mine=m.uid===me.id,globalIndex=startAt+mi,timeNode=chatTimestampHtml(m,"workgroup","",wg.messages[globalIndex-1]);if(m.recalled)return`${timeNode}<div class="msg recalled"><span class="recall-txt">${esc(u.name)} 撤回了一条消息</span></div>`;const money=messageIsMoney(m),content=money?`<span class="msg-attachment" data-msgctx="${ctxData("workgroup","",m.id)}">${bubbleContent(m)}</span>`:`<span class="bubble ${m.photo?"has-photo":""}" data-msgctx="${ctxData("workgroup","",m.id)}">${bubbleContent(m)}</span>`;return`${timeNode}<div class="msg ${mine?"me":"them"} ${money?"money-msg":""}">
          <span class="m-av" ${mine?"":`data-wg-av="${esc(m.uid)}" title="点成员头像让 TA 发言"`}>${avatarHtml32(u)}</span>
          <span class="msg-content-stack">${mine?"":`<span class="m-name">${esc(u.name)}</span>`}${content}${messageReceiptHtml(m,mine)}</span>
        </div>${money?moneyNoticeHtml(m,"workgroup",""):""}`}).join("")||'<div class="empty"><div class="es is-ic">'+ic("message",34)+"</div>工作组还没有消息。发一条消息，大家就可以在这里交流。</div>"}
    </div>
    ${totalPages>1?`<div class="chat-pagination">
      <button class="btn btn-sm btn-ghost" type="button" data-wg-page="older" ${page>=totalPages-1?"disabled":""}>更早消息</button>
      <span>第 ${page+1}/${totalPages} 页 · 共 ${wg.messages.length} 条</span>
      <button class="btn btn-sm btn-ghost" type="button" data-wg-page="newer" ${page<=0?"disabled":""}>更新消息</button>
    </div>`:""}
    ${quoteBarHtml()}
    ${chatInputRow("wg",{voice:!1})}
  </div>`;return setTimeout(()=>maybeProactive({kind:"workgroup"}),0),portalShell("workgroup",c)}function groupMembers(box,groupName){const me=DB.user,elig=DB.data.users.filter(u=>u.level>=2&&u.id!==me.id),mask=openMask(`<h3>${esc(groupName)}成员</h3><div class="m-body">
    <label class="mem-row" style="border-bottom:1px solid #2A3A7E;margin-bottom:4px">
      <input type="checkbox" checked disabled>
      <span class="av" style="width:30px;height:30px;font-size:12px">${avatarHtml32(me)}</span>
      <span>${esc(me.name)}（我）</span></label>
    ${elig.map(u=>`<label class="mem-row">
      <input type="checkbox" class="mem-ck" value="${u.id}" ${box.members.includes(u.id)?"checked":""}>
      <span class="av" style="width:30px;height:30px;font-size:12px">${avatarHtml32(u)}</span>
      <span>${esc(u.name)} <span style="font-size:12px">（${lvlName(u.level)}）</span></span>
    </label>`).join("")||'<div class="empty">暂无其他员工/管理员</div>'}
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-sm btn-ghost" id="g-cancel" style="margin-left:auto">取消</button><button class="btn btn-sm" id="g-ok">保存</button></div>
  </div>`);mask.querySelector("#g-cancel").addEventListener("click",()=>mask.remove()),mask.querySelector("#g-ok").addEventListener("click",()=>{const sel=[...mask.querySelectorAll(".mem-ck")].filter(c=>c.checked).map(c=>c.value);box.members=[me.id,...sel],DB.save(),mask.remove(),router(),toast("成员已更新","ok")})}function groupSpeak(box,uid){box.members.includes(uid)||box.members.push(uid);const m={id:genId("m"),uid,type:"text",text:"请输入内容",at:nowStr()};markIncomingMessage({kind:"workgroup"},m),box.messages.push(m),DB.save(),router(),scrollRoom()}function groupSpeakPop(btn,box,kind){closePop();const me=DB.user,elig=DB.data.users.filter(u=>u.id!==me.id&&(kind==="workgroup"?u.level>=2:!0)),rect=btn.getBoundingClientRect(),pop=document.createElement("div");pop.className="pop",pop.style.position="fixed",pop.style.top="8px",pop.style.left="8px",pop.style.maxWidth=Math.max(100,window.innerWidth-16)+"px",pop.style.maxHeight=Math.max(100,Math.min(280,window.innerHeight-24))+"px",pop.innerHTML=elig.map(u=>`<span class="pop-item" data-speak="${u.id}">
    <span class="av" style="width:26px;height:26px;font-size:11px">${avatarHtml32(u)}</span>
    <span class="pop-name">${esc(u.name)}</span>
    <span class="tag-mini">${box.members.includes(u.id)?"成员":"未加入"}</span></span>`).join("")||'<div class="pop-item" style="cursor:default">暂无可选成员</div>',document.body.appendChild(pop);const w=pop.offsetWidth,h=pop.offsetHeight;let x=Math.max(8,Math.min(rect.right-w,window.innerWidth-w-8)),y=rect.bottom+6;y+h>window.innerHeight-8&&(y=rect.top-h-6),y=Math.max(8,Math.min(y,window.innerHeight-h-8)),pop.style.left=x+"px",pop.style.top=y+"px",pop.addEventListener("click",e=>{const it=e.target.closest("[data-speak]");it&&(closePop(),groupSpeak(box,it.dataset.speak))}),bindPopDismiss()}function viewRelationshipNetwork(kind){if(DB.level()<2)return portalShell("network-factions",accessDenied());const key=kind==="keyPeople"?"keyPeople":"factions",net=DB.data.networks&&DB.data.networks[key];if(!net)return portalShell(key==="keyPeople"?"network-keyPeople":"network-factions",'<div class="p-panel empty">关系网数据未初始化，请刷新页面。</div>');const active=key==="keyPeople"?"network-keyPeople":"network-factions";Array.isArray(net.nodes)||(net.nodes=[]),Array.isArray(net.edges)||(net.edges=[]);const nodeById=id=>net.nodes.find(n=>n.id===id),nodeList=net.nodes.map(n=>`<article class="net-node">
    <div class="net-node-kicker">${esc(n.kind||"未分类")}</div>
    <h3>${esc(n.name)}</h3><p>${esc(n.note||"暂无备注")}</p>
    <div class="net-node-actions"><button type="button" class="btn btn-sm btn-ghost" data-net-nodeedit="${esc(n.id)}">编辑</button><button type="button" class="btn btn-sm btn-ghost" data-net-nodedel="${esc(n.id)}">移除</button></div>
  </article>`).join("")||'<div class="empty">尚未建立节点。可先添加人物、组织或门派，再为它们建立关系。</div>',graphNodes=net.nodes.map(n=>`<article class="network-graph-node" draggable="false" data-net-visual="${esc(n.id)}"><span>${esc(n.kind||"未分类")}</span><b>${esc(n.name)}</b></article>`).join("")||'<div class="network-graph-empty">关系图等待建立<br><small>添加节点，再创建连线</small></div>',edgeList=net.edges.map(e=>{const a=nodeById(e.from),b=nodeById(e.to);return!a||!b?"":`<article class="net-edge-row">
    <div class="net-endpoint">${esc(a.name)}</div><div class="net-edge-meta"><b>${esc(e.label||"关联")}</b>${e.note?`<small>${esc(e.note)}</small>`:""}</div><div class="net-wire ${e.dir==="both"?"is-both":"is-one"}"><span>${e.dir==="both"?"⟷":"→"}</span></div><div class="net-endpoint">${esc(b.name)}</div>
    <button type="button" class="net-edge-remove" data-net-edgedel="${esc(e.id)}" title="删除这条连线" aria-label="删除这条连线">×</button>
  </article>`}).join("")||'<div class="empty">暂无连线，请在下方添加关系。</div>',opts=net.nodes.map(n=>`<option value="${esc(n.id)}">${esc(n.name)}</option>`).join(""),description=key==="keyPeople"?"梳理重点人物之间的师承、协作、交锋与事件牵连。":"梳理组织、门派、分部与重要据点之间的隶属、协作和冲突关系。",content=`<div class="p-crumb">内部情报系统 / <b>${esc(net.title)}</b></div>
    <div class="p-panel network-intro"><div class="network-eyebrow">NDT INTELLIGENCE MAP / INTERNAL</div><h2>${esc(net.title)}</h2><div class="ph-sub">${description}</div><div class="network-legend"><span><i class="net-dot one"></i>单向关系 →</span><span><i class="net-dot both"></i>双向关系 ⟷</span><span>节点 ${net.nodes.length} 个</span><span>连线 ${net.edges.length} 条</span></div></div>
    <div class="p-panel network-graph-panel"><div class="network-section-head"><div><h3>关系图谱</h3><p>节点可长按拖动；画布支持缩放与滚动，缩放不会改变人物关系。</p></div><span class="net-section-count">${net.edges.length} EDGES</span></div><div class="network-zoom-tools" role="group" aria-label="关系图缩放控制"><button type="button" data-net-zoom="out" aria-label="缩小关系图">−</button><button type="button" data-net-zoom="reset" aria-label="重置关系图缩放" class="zoom-reset">100%</button><button type="button" data-net-zoom="in" aria-label="放大关系图">＋</button><span>缩放</span></div><div class="network-graph-wrap" data-network-key="${key}"><svg class="network-graph-svg" aria-hidden="true"></svg><div class="network-graph-nodes">${graphNodes}</div></div></div>
    <div class="p-panel"><div class="network-section-head"><div><h3>关系节点</h3><p>点击编辑可维护名称、类型与情报备注。</p></div><span class="net-section-count">${net.nodes.length} NODES</span></div><div class="network-node-grid">${nodeList}</div>
    <div class="network-add-grid"><div><label class="fl" for="net-node-name">节点名称</label><input class="field" id="net-node-name" maxlength="70" placeholder="例如：风正豪 / 龙虎山天师府"></div><div><label class="fl" for="net-node-kind">身份 / 分类</label><input class="field" id="net-node-kind" maxlength="50" placeholder="人物、门派、组织、据点"></div><div class="wide"><label class="fl" for="net-node-note">简要备注</label><input class="field" id="net-node-note" maxlength="240" placeholder="简述背景或在关系网中的定位"></div><button type="button" class="btn btn-sm btn-orange" id="net-add-node">＋ 添加节点</button></div></div>
    <div class="p-panel"><div class="network-section-head"><div><h3>关系连线</h3><p>关系方向会以箭头明确标出；双向关系显示为双箭头。</p></div><span class="net-section-count">${net.edges.length} EDGES</span></div><div class="network-edge-list">${edgeList}</div>
    <div class="network-add-grid edge-add-grid"><div><label class="fl" for="net-from">关系起点</label><select class="field" id="net-from">${opts}</select></div><div><label class="fl" for="net-to">关系终点</label><select class="field" id="net-to">${opts}</select></div><div><label class="fl" for="net-label">关系说明</label><input class="field" id="net-label" maxlength="80" placeholder="师徒 / 协作 / 交锋"></div><div><label class="fl" for="net-dir">方向</label><select class="field" id="net-dir"><option value="one">单向 →</option><option value="both">双向 ⟷</option></select></div><div class="wide"><label class="fl" for="net-edge-note">补充备注（可选）</label><input class="field" id="net-edge-note" maxlength="180" placeholder="关系背景、对应事件或补充线索"></div><button type="button" class="btn btn-sm btn-orange" id="net-add-edge">＋ 建立连线</button></div>
    </div>`;return portalShell(active,content)}function drawNetworkGraph(){const wrap=document.querySelector(".network-graph-wrap");if(!wrap)return;const svg=wrap.querySelector(".network-graph-svg"),grid=wrap.querySelector(".network-graph-nodes");if(!svg||!grid)return;const w=Math.max(1,wrap.clientWidth),h=Math.max(160,wrap.clientHeight);svg.setAttribute("viewBox",`0 0 ${w} ${h}`),svg.setAttribute("width",w),svg.setAttribute("height",h);const dataKey=wrap.dataset.networkKey,net=DB.data.networks&&DB.data.networks[dataKey];if(!net){svg.innerHTML="";return}const els=[...wrap.querySelectorAll("[data-net-visual]")],byId=id=>els.find(el=>el.dataset.netVisual===id),br=wrap.getBoundingClientRect(),paths=[],relationColor=label=>{let h2=0;for(const ch of String(label||"关联"))h2=h2*31+ch.charCodeAt(0)|0;const palette=["#D66A3A","#2878B8","#8B5FC7","#16856D","#C04D78","#A47716","#3F70A8","#B34F35"];return palette[Math.abs(h2)%palette.length]};for(const edge of net.edges||[]){const a=byId(edge.from),b=byId(edge.to);if(!a||!b)continue;const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect(),x1=ra.left-br.left+ra.width/2,y1=ra.top-br.top+ra.height/2,x2=rb.left-br.left+rb.width/2,y2=rb.top-br.top+rb.height/2,dx=x2-x1,dy=y2-y1,bend=Math.max(28,Math.min(90,Math.abs(dx)*.18+Math.abs(dy)*.08)),c1x=x1+dx*.34,c1y=y1+dy*.34-bend,c2x=x1+dx*.66,c2y=y1+dy*.66-bend,both=edge.dir==="both",color=relationColor(edge.label),len=Math.max(1,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len,padA=Math.min(52,Math.max(28,Math.min(ra.width,ra.height)*.48)),padB=Math.min(52,Math.max(28,Math.min(rb.width,rb.height)*.48)),sx=x1+ux*padA,sy=y1+uy*padA,ex=x2-ux*padB,ey=y2-uy*padB,d=`M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${(sx+dx*.34).toFixed(1)} ${(sy+dy*.34-bend).toFixed(1)}, ${(ex-dx*.34).toFixed(1)} ${(ey-dy*.34-bend).toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`,marker=both?"net-arrow-both":"net-arrow-one";paths.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" marker-end="url(#${marker})" ${both?'marker-start="url(#net-arrow-both-start)"':""}/>`);const mx=(x1+x2)/2,my=(y1+y2)/2-bend*.55;edge.label&&paths.push(`<text x="${mx.toFixed(1)}" y="${my.toFixed(1)}" text-anchor="middle" fill="${color}" stroke="var(--pt-panel)" stroke-width="5" paint-order="stroke" font-size="11">${esc(edge.label.slice(0,26))}</text>`)}svg.innerHTML=`<defs>
    <marker id="net-arrow-one" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L7,3.5 L0,7 Z" fill="context-stroke"/></marker>
    <marker id="net-arrow-both" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L7,3.5 L0,7 Z" fill="context-stroke"/></marker>
    <marker id="net-arrow-both-start" markerWidth="8" markerHeight="8" refX="0" refY="3" orient="auto-start-reverse" markerUnits="strokeWidth"><path d="M0,0 L7,3.5 L0,7 Z" fill="context-stroke"/></marker>
  </defs>${paths.join("")}`}window.addEventListener("resize",()=>{document.querySelector(".network-graph-wrap")&&drawNetworkGraph()});function activeNetwork(){const key=parseHash().seg[1]==="keyPeople"?"keyPeople":"factions";return DB.data.networks||(DB.data.networks={}),{key,net:DB.data.networks[key]}}function networkAddNode(){var _a,_b,_c;const{net}=activeNetwork();if(!net)return;const name=(_a=$("#net-node-name"))==null?void 0:_a.value.trim(),kind=(_b=$("#net-node-kind"))==null?void 0:_b.value.trim(),note=(_c=$("#net-node-note"))==null?void 0:_c.value.trim();if(!name){toast("请填写节点名称","warn");return}if(net.nodes.some(n=>n.name.toLocaleLowerCase()===name.toLocaleLowerCase())){toast("这个节点已存在","warn");return}net.nodes.push({id:genId("net"),name,kind:kind||"未分类",note,root:!1}),DB.save(),router(),toast("已添加关系节点","ok")}function networkAddEdge(){var _a,_b,_c,_d,_e;const{net}=activeNetwork();if(!net)return;const from=(_a=$("#net-from"))==null?void 0:_a.value,to=(_b=$("#net-to"))==null?void 0:_b.value,label=(_c=$("#net-label"))==null?void 0:_c.value.trim(),dir=((_d=$("#net-dir"))==null?void 0:_d.value)||"one",note=(_e=$("#net-edge-note"))==null?void 0:_e.value.trim();if(!from||!to||from===to){toast("请选择两个不同的节点","warn");return}if(!label){toast("请填写关系说明","warn");return}if(net.edges.some(e=>e.from===from&&e.to===to&&e.label===label&&e.dir===dir)){toast("相同连线已存在","warn");return}net.edges.push({id:genId("edge"),from,to,label,dir,note}),DB.save(),router(),toast("关系连线已建立","ok")}function networkEditNode(id){const{net}=activeNetwork(),node=net&&net.nodes.find(n=>n.id===id);if(!node)return;const mask=openMask(`<h3>编辑关系节点</h3><div class="m-body"><label class="fl">名称</label><input class="field" id="net-edit-name" maxlength="70" value="${esc(node.name)}"><label class="fl" style="margin-top:10px">身份 / 分类</label><input class="field" id="net-edit-kind" maxlength="50" value="${esc(node.kind||"")}"><label class="fl" style="margin-top:10px">备注</label><textarea class="field" id="net-edit-note" maxlength="240" rows="3">${esc(node.note||"")}</textarea></div><div class="m-foot"><button class="btn btn-sm btn-ghost" id="net-edit-cancel">取消</button><button class="btn btn-sm btn-orange" id="net-edit-save">保存</button></div>`);mask.querySelector("#net-edit-cancel").addEventListener("click",()=>mask.remove()),mask.querySelector("#net-edit-save").addEventListener("click",()=>{const name=mask.querySelector("#net-edit-name").value.trim();if(!name){toast("节点名称不能为空","warn");return}if(net.nodes.some(n=>n.id!==id&&n.name.toLocaleLowerCase()===name.toLocaleLowerCase())){toast("已有同名节点","warn");return}node.name=name,node.kind=mask.querySelector("#net-edit-kind").value.trim()||"未分类",node.note=mask.querySelector("#net-edit-note").value.trim(),DB.save(),mask.remove(),router(),toast("节点已更新","ok")})}function relTreeHtml(r){const rels=Array.isArray(r.rels)?r.rels:[],palette=["#D66A3A","#2878B8","#8B5FC7","#16856D","#C04D78","#A47716","#3F70A8","#B34F35"],relationColor=label=>{let h=0;for(const ch of String(label||"相关"))h=h*31+ch.charCodeAt(0)|0;return palette[Math.abs(h)%palette.length]},layoutOf=(x,i)=>x.layout||(/(师傅|师父|师尊|老师|师长|师承|师叔|师伯|师祖)/.test(x.rel||"")?"up":/(徒弟|弟子|门生|学生|徒孙)/.test(x.rel||"")?"down":i%2?"right":"left"),nodeHtml=(x,i)=>{const target=DB.data.archives.find(a=>a.name===x.name&&a.id!==r.id),name=target?`<button type="button" class="rt-person rt-open" data-relopen="${esc(target.id)}">${esc(x.name)}</button>`:`<div class="rt-person">${esc(x.name)}</div>`;return`<article class="rt-node" style="--rt-color:${relationColor(x.rel)}" data-rel-index="${i}">
      <div class="rt-relation">${esc(x.rel||"相关")} <span class="rt-direction" title="${x.dir==="both"?"双向关系":"单向关系"}">${x.dir==="both"?"↔":"→"}</span></div>
      ${name}${x.note?`<div class="rt-note">${esc(x.note)}</div>`:""}
      <div class="rt-actions"><button type="button" data-relmove="${i}" data-rel-dir="up" title="移到上方">↑ 上</button><button type="button" data-relmove="${i}" data-rel-dir="left" title="移到左侧">← 左</button><button type="button" data-relmove="${i}" data-rel-dir="right" title="移到右侧">右 →</button><button type="button" data-relmove="${i}" data-rel-dir="down" title="移到下方">↓ 下</button><button type="button" data-reledit="${i}">编辑</button><button type="button" class="rt-remove" data-reldel="${i}">断开</button></div>
    </article>`},groups={up:[],left:[],right:[],down:[]};return rels.forEach((x,i)=>{const d=layoutOf(x,i);(groups[d]?groups[d]:groups.right).push(nodeHtml(x,i))}),`<section class="rel-tree-inline" data-rel-tree="${esc(r.id)}">
    <div class="rt-caption"><span>PERSONAL RELATIONSHIP TREE</span><b>档案关系树</b><p>以当前档案人物为中心，关系人物按上下左右分层排列；不支持拖拽，不另设画布。</p></div>
    ${groups.up.length?`<div class="rt-zone rt-up"><div class="rt-zone-label">师承 / 上位关系</div><div class="rt-list">${groups.up.join("")}</div></div>`:""}
    <div class="rt-middle">
      <div class="rt-side rt-left">${groups.left.length?`<div class="rt-zone-label">关联人物</div><div class="rt-list">${groups.left.join("")}</div>`:""}</div>
      <div class="rt-root"><span class="rt-root-mark">档案主体</span><strong>${esc(r.name)}</strong><small>关系中心</small></div>
      <div class="rt-side rt-right">${groups.right.length?`<div class="rt-zone-label">关联人物</div><div class="rt-list">${groups.right.join("")}</div>`:""}</div>
    </div>
    ${groups.down.length?`<div class="rt-zone rt-down"><div class="rt-zone-label">弟子 / 下位关系</div><div class="rt-list">${groups.down.join("")}</div></div>`:""}
    ${rels.length===0?'<div class="rt-empty">暂无关系人物。添加关系后，人物会自动进入这棵关系树。</div>':""}
    <div class="rel-add rt-add"><input class="field" id="rel-name" placeholder="对方姓名 / 代号"><input class="field" id="rel-rel" placeholder="关系（如：师父 / 同僚 / 对手）"><input class="field" id="rel-note" placeholder="备注（可选）"><select class="field" id="rel-dir" title="关系方向"><option value="one">单向 →</option><option value="both">双向 ↔</option></select><button class="btn btn-sm btn-orange" id="rel-add-btn">添加关系</button></div>
  </section>`}function editArchiveRelation(r,index){const rel=Array.isArray(r.rels)?r.rels[index]:null;if(!rel)return;const mask=openMask(`<h3>编辑关系</h3><div class="m-body"><label class="fl">关联人物</label><input class="field" id="rel-edit-name" maxlength="80" value="${esc(rel.name||"")}"><label class="fl" style="margin-top:10px">关系说明</label><input class="field" id="rel-edit-type" maxlength="80" value="${esc(rel.rel||"")}"><label class="fl" style="margin-top:10px">备注</label><textarea class="field" id="rel-edit-note" rows="3" maxlength="300">${esc(rel.note||"")}</textarea><label class="fl" style="margin-top:10px">关系方向</label><select class="field" id="rel-edit-dir"><option value="one" ${rel.dir==="both"?"":"selected"}>单向 →</option><option value="both" ${rel.dir==="both"?"selected":""}>双向 ⟷</option></select></div><div class="m-foot"><button class="btn btn-sm btn-ghost" id="rel-edit-cancel">取消</button><button class="btn btn-sm btn-orange" id="rel-edit-save">保存关系</button></div>`);mask.querySelector("#rel-edit-cancel").onclick=()=>mask.remove(),mask.querySelector("#rel-edit-save").onclick=()=>{const name=mask.querySelector("#rel-edit-name").value.trim(),type=mask.querySelector("#rel-edit-type").value.trim(),note=mask.querySelector("#rel-edit-note").value.trim(),dir=mask.querySelector("#rel-edit-dir").value;if(!name||!type){toast("请填写关联人物和关系说明","warn");return}if(rel.linkedId)for(const a of DB.data.archives)Array.isArray(a.rels)&&(a.rels=a.rels.filter(x=>x.id!==rel.linkedId));Object.assign(rel,{name,rel:type,note,dir}),delete rel.linkedId,rel.id||(rel.id=genId("rel"));const target=DB.data.archives.find(a=>a.name===name&&a.id!==r.id);if(dir==="both"&&target){Array.isArray(target.rels)||(target.rels=[]);const reverseId=genId("rel");rel.linkedId=reverseId,target.rels.push({id:reverseId,linkedId:rel.id,name:r.name,rel:type,note,dir:"both"})}DB.save(),mask.remove(),router(),toast("关系已更新","ok")}}function addRelation(r){var _a,_b,_c,_d;const name=(_a=$("#rel-name"))==null?void 0:_a.value.trim(),rel=(_b=$("#rel-rel"))==null?void 0:_b.value.trim(),note=(_c=$("#rel-note"))==null?void 0:_c.value.trim(),dir=((_d=$("#rel-dir"))==null?void 0:_d.value)||"one";if(!name||!rel){toast("请填写对方姓名和关系","warn");return}if(name===r.name){toast("不能把档案人物关联到自身","warn");return}Array.isArray(r.rels)||(r.rels=[]);const target=DB.data.archives.find(a=>a.name===name&&a.id!==r.id),relationId=genId("rel"),item={id:relationId,name,rel,note,dir};if(dir==="both"&&target){Array.isArray(target.rels)||(target.rels=[]);const reverseId=genId("rel");item.linkedId=reverseId,target.rels.push({id:reverseId,linkedId:relationId,name:r.name,rel,note,dir:"both"})}r.rels.push(item),DB.save(),router(),toast("关系已添加","ok")}function parseHash(){let h=location.hash.slice(1)||"/",path=h,query={};const qi=h.indexOf("?");return qi>=0&&(path=h.slice(0,qi),new URLSearchParams(h.slice(qi+1)).forEach((v,k)=>query[k]=v)),{seg:path.split("/").filter(Boolean),query}}function viewWanted(){const html=`<div class="p-crumb">异人情报系统 / <b>在逃异人通缉令</b></div>
  <div class="p-panel wanted-intro"><div class="wanted-stamp">哪都通 · 内部情报</div><h2>在逃异人追缉公告</h2>
  <div class="wanted-grid">${(DB.data.wanted||[]).map(w=>`<article class="wanted-card"><div class="wanted-top"><span>ND-TONG / WANTED</span><b>${esc(w.code||"ND-WANTED")}</b></div><div class="wanted-banner">在 逃 通 缉</div><div class="wanted-name">${esc(w.name)}</div><div class="wanted-reward">悬赏金额 <strong>${esc(w.reward)}</strong></div><div class="wanted-fields"><p><b>危险等级</b>${esc(w.danger)}</p><p><b>所属势力</b>${esc(w.faction)}</p><p><b>异术特征</b>${esc(w.skill)}</p><p><b>最后线索</b>${esc(w.lastSeen)}</p><p><b>当前状态</b>${esc(w.status||"在逃")}</p></div><div class="wanted-note">${esc(w.note)}</div><div class="wanted-actions"><button class="btn btn-sm btn-ghost" data-wanted-edit="${esc(w.id)}">编辑通缉令</button><button class="btn btn-sm btn-ghost wanted-delete" data-wanted-del="${esc(w.id)}">撤销通缉令</button></div></article>`).join("")}
  <button class="wanted-add" id="wanted-add">＋ 新增通缉令</button></div></div>`;return portalShell("wanted",html)}function editWanted(id){const isNew=id==="new",w=isNew?{id:genId("w"),name:"",code:"ND-WANTED-",danger:"B级",reward:"¥ 100,000",faction:"",skill:"",lastSeen:"待确认",note:"",status:"在逃"}:(DB.data.wanted||[]).find(x=>x.id===id);if(!w)return;const fields=[["name","姓名 / 代号"],["code","通缉编号"],["danger","危险等级"],["reward","悬赏金额"],["faction","所属势力"],["skill","异术特征"],["lastSeen","最后线索"],["status","当前状态"]],mask=openMask(`<h3>编辑通缉令</h3><div class="m-body">${fields.map(([k,l])=>`<label class="fl">${l}</label><input class="field" data-wf="${k}" value="${esc(w[k]||"")}">`).join("")}<label class="fl">案情 / 注意事项</label><textarea class="field" data-wf="note" rows="4">${esc(w.note||"")}</textarea></div><div class="m-foot"><button class="btn btn-ghost btn-sm" id="wanted-cancel">取消</button><button class="btn btn-sm" id="wanted-save">保存通缉令</button></div>`);mask.querySelector("#wanted-cancel").onclick=()=>mask.remove(),mask.querySelector("#wanted-save").onclick=()=>{if(fields.forEach(([k])=>w[k]=mask.querySelector(`[data-wf="${k}"]`).value.trim()),w.note=mask.querySelector('[data-wf="note"]').value.trim(),!w.name){toast("请填写姓名或代号","warn");return}isNew&&DB.data.wanted.unshift(w),DB.save(),mask.remove(),router(),toast("通缉令已保存","ok")}}const routeViewPositions=window._routeViewPositions||(window._routeViewPositions={});try{Object.assign(routeViewPositions,JSON.parse(sessionStorage.getItem("ndt-route-positions")||"{}"))}catch(e){}function rememberCurrentView(hash){if(!hash)return;const chat=document.querySelector(".chat-scroll");routeViewPositions[hash]={y:window.scrollY||0,chatTop:chat?chat.scrollTop:null}}function persistViewPositions(){try{sessionStorage.setItem("ndt-route-positions",JSON.stringify(routeViewPositions))}catch(e){}}window.addEventListener("scroll",()=>{const h=window._lastRouteHash;if(h){const old=routeViewPositions[h]||{};old.y=window.scrollY||0,routeViewPositions[h]=old}},{passive:!0}),document.addEventListener("scroll",e=>{if(e.target&&e.target.classList&&e.target.classList.contains("chat-scroll")){const h=window._lastRouteHash;if(h){const old=routeViewPositions[h]||{y:window.scrollY||0};old.chatTop=e.target.scrollTop,routeViewPositions[h]=old}}},!0),document.addEventListener("scroll",e=>{if(e.target&&e.target.classList&&e.target.classList.contains("sidebar")){window._sidebarScrollLeft=e.target.scrollLeft,window._sidebarScrollTop=e.target.scrollTop;try{updateNavMoreHint()}catch(e2){}}},!0);function pinMobileNav(){const sd=document.querySelector(".sidebar"),top=document.querySelector(".portal-top"),wrap=document.querySelector(".nav-wrap"),portal=document.querySelector(".portal");sd&&(window.matchMedia&&window.matchMedia("(max-width:680px)").matches&&top?(wrap&&(wrap.style.top=top.offsetHeight+"px"),portal&&portal.style.setProperty("--mobile-chrome-h",top.offsetHeight+(wrap?wrap.offsetHeight:sd.offsetHeight)+"px"),updateNavMoreHint()):(wrap&&(wrap.style.top=""),portal&&portal.style.removeProperty("--mobile-chrome-h")))}function updateNavMoreHint(){const sd=document.querySelector(".sidebar"),wrap=document.querySelector(".nav-wrap");if(!sd||!wrap)return;const max=sd.scrollWidth-sd.clientWidth;max>4&&sd.scrollLeft<max-1?wrap.classList.add("nav-has-more"):wrap.classList.remove("nav-has-more")}function restoreSidebarScroll(){const sd=document.querySelector(".sidebar");if(!sd)return;if(pinMobileNav(),window.matchMedia&&window.matchMedia("(max-width:680px)").matches){const saved=Number(window._sidebarScrollLeft)||0;if(saved>0){sd.scrollLeft=saved;return}const on=sd.querySelector(".side-item.on");if(on&&typeof on.scrollIntoView=="function")try{on.scrollIntoView({inline:"nearest",block:"nearest"})}catch(e){on.scrollIntoView(!1)}}else{const saved=Number(window._sidebarScrollTop);isNaN(saved)||(sd.scrollTop=saved)}}window.addEventListener("pagehide",persistViewPositions),window.addEventListener("resize",()=>{try{pinMobileNav()}catch(e){}},{passive:!0});const DEFAULT_FORUM_LEVELS=[{name:"初入江湖",min:0},{name:"炁感初开",min:10},{name:"见习异人",min:25},{name:"小有所成",min:50},{name:"渐入佳境",min:100},{name:"出类拔萃",min:180},{name:"锋芒初露",min:300},{name:"一方好手",min:480},{name:"功力渐深",min:720},{name:"异人名宿",min:1050},{name:"炉火纯青",min:1500},{name:"名动一方",min:2100},{name:"功参造化",min:2900},{name:"开宗立派",min:4e3},{name:"震古烁今",min:5500},{name:"绝世高手",min:7500},{name:"一代宗师",min:1e4},{name:"陆地神仙",min:13500},{name:"超凡入圣",min:18e3},{name:"炁道至尊",min:24e3}],DEFAULT_POINTS_RULE={post:5,reply:2,like:1,gamePerLine:3,gameCap:60},DEFAULT_ABILITY_RADAR={labels:["炁量","体质","速度","技巧","精神","感知"],values:[60,55,50,70,45,65]},DEFAULT_ABILITY_FIELDS=["名称","来源","等级","稳定性","补充","注意事项"];function forumLevels(){return(!Array.isArray(DB.data.forumLevels)||DB.data.forumLevels.length<1)&&(DB.data.forumLevels=DEFAULT_FORUM_LEVELS.map(x=>({...x}))),DB.data.forumLevels}function pointsRule(){return(!DB.data.pointsRule||typeof DB.data.pointsRule!="object")&&(DB.data.pointsRule={...DEFAULT_POINTS_RULE}),DB.data.pointsRule}function userPoints(u){return Math.max(0,Number(u&&u.points)||0)}function forumLevelOf(u){const lv=forumLevels(),p=userPoints(u);let idx=0;for(let i=0;i<lv.length;i++)p>=Number(lv[i].min||0)&&(idx=i);return{level:idx+1,index:idx,name:lv[idx].name||"Lv"+(idx+1),min:Number(lv[idx].min||0),next:lv[idx+1]?{name:lv[idx+1].name,min:Number(lv[idx+1].min||0)}:null}}function addPoints(u,n){if(!u)return 0;const before=forumLevelOf(u);u.points=Math.max(0,userPoints(u)+(Number(n)||0));const after=forumLevelOf(u);return after.level>before.level&&setTimeout(()=>toast(`恭喜升级！论坛等级达到 ${after.level} 级 · ${after.name}`,"ok"),350),u.points}function gradeTier(level){return level>=20?"tier-max":level>=16?"tier-gold":level>=11?"tier-violet":level>=6?"tier-blue":"tier-bronze"}function gradeBadge(u,opts={}){const g=forumLevelOf(u);return`<span class="grade-badge ${gradeTier(g.level)} ${opts.mini?"grade-mini":""}">${opts.mini?"":svgIco("star")}Lv${g.level} · ${esc(g.name)}</span>`}function gradeProgress(u){const g=forumLevelOf(u);if(!g.next)return`<div class="grade-progress"><div class="gp-bar"><span style="width:100%"></span></div><div class="gp-text">已达最高等级 ${g.level} 级 · ${esc(g.name)}</div></div>`;const p=userPoints(u);return`<div class="grade-progress"><div class="gp-bar"><span style="width:${Math.max(2,Math.min(100,Math.round((p-g.min)/(g.next.min-g.min)*100)))}%"></span></div>
    <div class="gp-text">${p} / ${g.next.min} 积分 · 距 ${g.level+1} 级「${esc(g.next.name)}」还差 ${g.next.min-p} 分</div></div>`}function abilityNoOf(u){let h=0;const s=String(u.id||u.name||"");for(let i=0;i<s.length;i++)h=h*31+s.charCodeAt(i)>>>0;return"NDT-"+String(h%1e6).padStart(6,"0")}function abilityOf(u){(!u.ability||typeof u.ability!="object")&&(u.ability={});const a=u.ability;return a.no||(a.no=abilityNoOf(u)),(!a.radar||typeof a.radar!="object")&&(a.radar={}),(!Array.isArray(a.radar.labels)||a.radar.labels.length!==6)&&(a.radar.labels=DEFAULT_ABILITY_RADAR.labels.slice()),(!Array.isArray(a.radar.values)||a.radar.values.length!==6)&&(a.radar.values=DEFAULT_ABILITY_RADAR.values.slice()),(!Array.isArray(a.fields)||a.fields.length<1)&&(a.fields=DEFAULT_ABILITY_FIELDS.slice()),Array.isArray(a.rows)||(a.rows=[]),a}function drawRadarChart(canvas,labels,values,opts={}){const dpr=Math.max(1,opts.dpr||window.devicePixelRatio||1),W=opts.px||canvas.clientWidth||320;canvas.width=Math.round(W*dpr),canvas.height=Math.round(W*dpr);const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);const cx=W/2,cy=W/2,radius=W*(opts.radiusRatio||.32),n=labels.length,rings=5,cText=opts.text||"var(--pt-text-soft)",cGrid=opts.gridLine||"rgba(120,140,200,.22)",cFill=opts.fill||"rgba(46,71,184,.2)",cStroke=opts.stroke||"#2E47B8",cPoint=opts.point||"#2E47B8";ctx.clearRect(0,0,W,W);const angAt=i=>-Math.PI/2+Math.PI*2*i/n;for(let g=1;g<=rings;g++){const r=radius*g/rings;ctx.beginPath();for(let i=0;i<n;i++){const a=angAt(i),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath(),g===rings&&(ctx.fillStyle=opts.centerFill||"rgba(255,255,255,.02)",ctx.fill()),ctx.strokeStyle=cGrid,ctx.lineWidth=1,ctx.stroke()}for(let i=0;i<n;i++){const a=angAt(i);ctx.beginPath(),ctx.moveTo(cx,cy),ctx.lineTo(cx+Math.cos(a)*radius,cy+Math.sin(a)*radius),ctx.strokeStyle=cGrid,ctx.stroke()}const pts=[];for(let i=0;i<n;i++){const a=angAt(i),v=Math.max(0,Math.min(100,Number(values[i])||0))/100,r=radius*v;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}ctx.beginPath(),pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])),ctx.closePath(),ctx.fillStyle=cFill,ctx.fill(),ctx.strokeStyle=cStroke,ctx.lineWidth=2.2,ctx.stroke(),pts.forEach(p=>{ctx.beginPath(),ctx.arc(p[0],p[1],3.4,0,Math.PI*2),ctx.fillStyle=cPoint,ctx.fill(),ctx.strokeStyle="#fff",ctx.lineWidth=1.2,ctx.stroke()}),ctx.textAlign="center",ctx.textBaseline="middle";for(let i=0;i<n;i++){const a=angAt(i),lr=radius+(opts.labelPad||26),x=cx+Math.cos(a)*lr,y=cy+Math.sin(a)*lr;ctx.fillStyle=cText,ctx.font="700 "+(opts.font||13)+'px "Microsoft YaHei",sans-serif',ctx.fillText(String(labels[i]),x,y-7),ctx.fillStyle=cPoint,ctx.font="700 "+(opts.font||12)+'px "Microsoft YaHei",sans-serif',ctx.fillText(String(Math.max(0,Math.min(100,Number(values[i])||0))),x,y+8)}}function viewAbility(){if(!DB.user)return viewGate();const u=DB.user,a=abilityOf(u),g=forumLevelOf(u),av=`<div class="ability-avatar">${u.avatar&&u.avatar.startsWith("data")?`<img src="${esc(u.avatar)}" style="width:100%;height:100%;object-fit:cover">`:esc(avText(u.name))}</div>`,cell=v=>esc(v==null?"":v),tableRows=a.rows.map((r,ri)=>`<tr>${a.fields.map((f,fi)=>`<td>${cell(r&&r.v?r.v[fi]:"")}</td>`).join("")}</tr>`).join(""),preview=`<section class="ability-card">
    <div class="ability-head">
      ${av}
      <div class="ability-id"><h3>${esc(u.name)}</h3><p>编号 ${esc(a.no)}</p></div>
      ${gradeBadge(u)}
    </div>
    <div class="ability-radar-wrap"><canvas id="ability-radar"></canvas></div>
    <div class="ability-table-wrap">
      <table class="ability-table"><thead><tr>${a.fields.map(f=>`<th>${esc(f)}</th>`).join("")}</tr></thead>
      <tbody>${tableRows||`<tr><td colspan="${a.fields.length}" class="ability-empty">暂无能力条目，可在下方添加</td></tr>`}</tbody></table>
    </div>
    ${gradeProgress(u)}
  </section>`,radarEdit=`<div class="ability-radar-edit">${a.radar.labels.map((lb,i)=>`
    <div class="are-row">
      <input class="field are-label" data-radar-label="${i}" maxlength="8" value="${esc(lb)}" placeholder="属性名">
      <input type="range" min="0" max="100" value="${Math.max(0,Math.min(100,Number(a.radar.values[i])||0))}" data-radar-val="${i}" class="are-range">
      <span class="are-num" data-radar-num="${i}">${Math.max(0,Math.min(100,Number(a.radar.values[i])||0))}</span>
    </div>`).join("")}</div>`,fieldsEdit=`<div class="ability-fields-edit">${a.fields.map((f,i)=>`
    <div class="afe-row"><input class="field" data-field-name="${i}" maxlength="10" value="${esc(f)}" placeholder="字段名">
    <button type="button" class="btn btn-ghost btn-sm" data-field-del="${i}" title="删除该列">×</button></div>`).join("")}</div>
    <button type="button" class="btn btn-ghost btn-sm" id="ab-field-add">+ 新增一列</button>`,rowsEdit=`<div class="ability-rows-edit">${a.rows.map((r,ri)=>`
    <div class="ab-row" data-row="${ri}"><div class="ab-row-head"><b>条目 ${ri+1}</b>
      <button type="button" class="btn btn-ghost btn-sm" data-row-del="${ri}">删除</button></div>
    <div class="ab-row-grid">${a.fields.map((f,fi)=>`
      <div><label>${esc(f)}</label><input class="field" data-row-cell="${ri}-${fi}" maxlength="120" value="${cell(r&&r.v?r.v[fi]:"")}"></div>`).join("")}</div></div>`).join("")}</div>
    <button type="button" class="btn btn-ghost btn-sm" id="ab-row-add">+ 新增一条能力</button>`,html=`<div class="p-crumb">个人 / <b>个人能力详情</b></div>
    <div class="p-panel">
      <h2>个人能力详情</h2>
      <div class="ph-sub">所有身份均可用 · 六维属性与能力档案可完全自定义，可生成分享图</div>
      <div class="ability-actions">
        <button type="button" class="btn" id="ab-share">${svgIco("image")} 生成分享图</button>
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
    </div>`;return portalShell("ability",html)}const SHARE_THEMES={default:{bg1:"#16225C",bg2:"#0A1238",card:"rgba(255,255,255,.06)",cardBorder:"rgba(160,180,255,.18)",avatarBg:"#6D8CFF",text:"#F3F6FF",sub:"#A9B8E8",stroke:"#6D8CFF",fill:"rgba(109,140,255,.22)",point:"#9DBAFF",accent:"#E8874A",line:"rgba(150,170,230,.25)",glow:"rgba(109,140,255,1)"},day:{bg1:"#FFFFFF",bg2:"#E7ECF7",card:"#FFFFFF",cardBorder:"rgba(46,71,184,.16)",avatarBg:"#2E47B8",text:"#1B2450",sub:"#5A6795",stroke:"#2E47B8",fill:"rgba(46,71,184,.16)",point:"#2E47B8",accent:"#2E47B8",line:"#D6DEF0",glow:"rgba(46,71,184,1)"},classic:{bg1:"#3A2018",bg2:"#1E100C",card:"rgba(255,248,233,.07)",cardBorder:"rgba(232,176,106,.24)",avatarBg:"#D0484D",text:"#FFF8E9",sub:"#D3B98C",stroke:"#D0484D",fill:"rgba(208,72,77,.2)",point:"#E8B06A",accent:"#E8B06A",line:"rgba(220,190,140,.28)",glow:"rgba(208,72,77,1)"},cyber:{bg1:"#0B2230",bg2:"#05121A",card:"rgba(0,229,255,.06)",cardBorder:"rgba(0,229,255,.26)",avatarBg:"#00B8CC",text:"#EAFBFF",sub:"#7FB9C8",stroke:"#00E5FF",fill:"rgba(0,229,255,.16)",point:"#00E5FF",accent:"#3BE08F",line:"rgba(0,229,255,.25)",glow:"rgba(0,229,255,1)"},rose:{bg1:"#C98B7E",bg2:"#A05E52",card:"rgba(255,248,244,.14)",cardBorder:"rgba(255,240,232,.4)",avatarBg:"#A96559",text:"#FFF8F4",sub:"#FBE3D6",stroke:"#F0C9B8",fill:"rgba(255,248,244,.22)",point:"#FFF0E8",accent:"#FFF0E8",line:"rgba(255,240,232,.3)",glow:"rgba(240,201,184,1)"},aurora:{bg1:"#261D57",bg2:"#100B2C",card:"rgba(150,130,255,.09)",cardBorder:"rgba(150,130,255,.28)",avatarBg:"#3FC9B0",text:"#EFEBFF",sub:"#B7AEE8",stroke:"#5BE3C8",fill:"rgba(91,227,200,.18)",point:"#7CEBD8",accent:"#B07CFF",line:"rgba(150,130,255,.28)",glow:"rgba(91,227,200,1)"},wechat:{bg1:"#F7F7F7",bg2:"#E5E5E5",card:"#FFFFFF",cardBorder:"rgba(0,0,0,.08)",avatarBg:"#3CB371",text:"#1A1A1A",sub:"#888888",stroke:"#3CB371",fill:"rgba(60,179,113,.16)",point:"#3CB371",accent:"#3CB371",line:"#E0E0E0",glow:"rgba(60,179,113,1)"}},SITE_URL_FALLBACK="https://nadutong.netlify.app";function siteUrl(){try{const o=location.origin;if(o&&/^https?:\/\//.test(o)&&!/localhost|127\.0\.0\.1/.test(o))return o}catch(e){}return SITE_URL_FALLBACK}function glowColor(color,alpha){let m=String(color).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);if(m)return`rgba(${m[1]},${m[2]},${m[3]},${alpha})`;if(m=String(color).match(/#([0-9a-f]{6}|[0-9a-f]{3})/i),m){let h=m[1];h.length===3&&(h=h.split("").map(c=>c+c).join(""));const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return`rgba(${r},${g},${b},${alpha})`}return color}function countLines(ctx,text,maxW){let n=1,line="";for(const ch of String(text)){const test=line+ch;ctx.measureText(test).width>maxW&&line?(n++,line=ch):line=test}return n}function glassCard(ctx,x,y,w,h,T){ctx.save(),ctx.shadowColor=glowColor(T.glow,.28),ctx.shadowBlur=26,ctx.shadowOffsetY=10,ctx.fillStyle=T.card,roundRect(ctx,x,y,w,h,22),ctx.fill(),ctx.restore(),ctx.save(),ctx.strokeStyle=T.cardBorder,ctx.lineWidth=1,roundRect(ctx,x,y,w,h,22),ctx.stroke(),ctx.restore()}function sectionTitle(ctx,x,y,text,T){ctx.save(),ctx.fillStyle=T.accent,roundRect(ctx,x,y,5,22,3),ctx.fill(),ctx.fillStyle=T.text,ctx.textAlign="left",ctx.textBaseline="middle",ctx.font='800 20px "Microsoft YaHei",sans-serif',ctx.fillText(text,x+15,y+11),ctx.restore()}function drawTaiji(ctx,cx,cy,R,color,alpha){ctx.save(),ctx.globalAlpha=alpha,ctx.strokeStyle=color,ctx.lineWidth=2,ctx.beginPath(),ctx.arc(cx,cy,R,0,Math.PI*2),ctx.stroke(),ctx.beginPath(),ctx.moveTo(cx,cy-R),ctx.arc(cx,cy-R/2,R/2,-Math.PI/2,Math.PI/2,!1),ctx.arc(cx,cy+R/2,R/2,Math.PI/2,-Math.PI/2,!1),ctx.stroke(),ctx.beginPath(),ctx.arc(cx,cy-R/2,R*.11,0,Math.PI*2),ctx.stroke(),ctx.beginPath(),ctx.arc(cx,cy+R/2,R*.11,0,Math.PI*2),ctx.stroke(),ctx.restore()}function drawShareBackground(ctx,W,H,T){const grad=ctx.createLinearGradient(0,0,W*.4,H);grad.addColorStop(0,T.bg1),grad.addColorStop(1,T.bg2),ctx.fillStyle=grad,ctx.fillRect(0,0,W,H);const radial=(cx,cy,r,color,a)=>{const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,glowColor(color,a)),g.addColorStop(1,glowColor(color,0)),ctx.fillStyle=g,ctx.fillRect(cx-r,cy-r,r*2,r*2)};radial(W*.18,H*.12,420,T.glow,.22),radial(W*.9,H*.7,460,T.glow,.18),radial(W*.55,H*.45,300,T.accent.startsWith("#")?T.stroke:T.glow,.1),ctx.fillStyle=glowColor(T.glow,.5);for(let x=26;x<W;x+=28)for(let y=26;y<H;y+=28)ctx.globalAlpha=.16,ctx.fillRect(x,y,1.4,1.4);ctx.globalAlpha=1,drawTaiji(ctx,W-120,150,120,T.line,.5),ctx.strokeStyle=T.line,ctx.lineWidth=1;for(const[cx0,cy0,r]of[[W+70,120,170],[W+70,120,220],[-50,H-150,170],[-50,H-150,225]])ctx.beginPath(),ctx.arc(cx0,cy0,r,0,Math.PI*2),ctx.stroke()}function buildAbilityShare(u){return new Promise(resolve=>{const measure=document.createElement("canvas").getContext("2d"),a=abilityOf(u),g=forumLevelOf(u),T=SHARE_THEMES[DB.data.theme]||SHARE_THEMES.default,cardW=750-40*2,showRows=a.rows.slice(0,5),restW=cardW-48-36,rowHeights=showRows.map(r=>{const rest=a.fields.slice(1,3).map((f,fi)=>`${f}：${r.v?String(r.v[fi+1]||""):""}`).join("　");measure.font='14px "Microsoft YaHei",sans-serif';const lines=countLines(measure,rest,restW);return 38+Math.max(20,lines*20)+14+10}),tableRowsH=rowHeights.reduce((s,x)=>s+x,0),headH=132,radarH=402,tableH=44+(showRows.length?tableRowsH:38)+18,gap=18,H=40+headH+gap+radarH+gap+tableH+gap+96,canvas=document.createElement("canvas");canvas.width=750,canvas.height=H;const ctx=canvas.getContext("2d");drawShareBackground(ctx,750,H,T);let y=40;glassCard(ctx,40,y,cardW,headH,T);const avS=92,avX=66,avY=y+(headH-avS)/2;if(ctx.save(),ctx.beginPath(),ctx.arc(avX+avS/2,avY+avS/2,avS/2,0,Math.PI*2),ctx.closePath(),ctx.clip(),window._shareAvatarImg){const i=window._shareAvatarImg,s=Math.min(i.width,i.height);ctx.drawImage(i,(i.width-s)/2,(i.height-s)/2,s,s,avX,avY,avS,avS)}else ctx.fillStyle=T.avatarBg,ctx.fillRect(avX,avY,avS,avS),ctx.fillStyle="#FFFFFF",ctx.font="900 38px sans-serif",ctx.textAlign="center",ctx.textBaseline="middle",ctx.fillText(avText(u.name),avX+avS/2,avY+avS/2+2);ctx.restore(),ctx.strokeStyle=T.accent,ctx.lineWidth=3,ctx.beginPath(),ctx.arc(avX+avS/2,avY+avS/2,avS/2+3,0,Math.PI*2),ctx.stroke();const nmX=avX+avS+22;ctx.textAlign="left",ctx.textBaseline="middle",ctx.fillStyle=T.text,ctx.font='900 32px "Microsoft YaHei",sans-serif',ctx.fillText(u.name,nmX,avY+38),ctx.fillStyle=T.sub,ctx.font='15px "Microsoft YaHei",sans-serif',ctx.fillText("编号 "+a.no,nmX,avY+80);const badgeTxt="Lv"+g.level+" · "+g.name;ctx.font='700 18px "Microsoft YaHei",sans-serif';const bw=ctx.measureText(badgeTxt).width+36,bx=684-bw,by=y+headH/2-20;ctx.fillStyle=T.avatarBg,roundRect(ctx,bx,by,bw,40,20),ctx.fill(),ctx.fillStyle="#FFFFFF",ctx.textAlign="center",ctx.fillText(badgeTxt,bx+bw/2,by+21),y+=headH+gap,glassCard(ctx,40,y,cardW,radarH,T),sectionTitle(ctx,66,y+12,"六维属性",T);const rc=document.createElement("canvas");drawRadarChart(rc,a.radar.labels,a.radar.values,{dpr:1,px:340,radiusRatio:.34,text:T.text,gridLine:T.line,fill:T.fill,stroke:T.stroke,point:T.point,font:14,labelPad:28,centerFill:"rgba(255,255,255,.02)"}),ctx.drawImage(rc,750/2-170,y+44),y+=radarH+gap,glassCard(ctx,40,y,cardW,tableH,T),sectionTitle(ctx,66,y+12,"能力档案",T);let ry=y+44;showRows.length||(ctx.fillStyle=T.sub,ctx.textAlign="left",ctx.textBaseline="middle",ctx.font='14px "Microsoft YaHei",sans-serif',ctx.fillText("（暂未填写能力条目，可在下方编辑区添加）",66,ry+20)),showRows.forEach((r,i)=>{const rh=rowHeights[i],sx=64,sw=cardW-48,subH=rh-10;ctx.fillStyle=glowColor(T.glow,.08),roundRect(ctx,sx,ry,sw,subH,14),ctx.fill(),ctx.fillStyle=T.accent,roundRect(ctx,sx,ry+14,4,subH-28,2),ctx.fill();const name=r.v?String(r.v[0]||""):"",rest=a.fields.slice(1,3).map((f,fi)=>`${f}：${r.v?String(r.v[fi+1]||""):""}`).join("　");ctx.fillStyle=T.text,ctx.textAlign="left",ctx.textBaseline="middle",ctx.font='700 17px "Microsoft YaHei",sans-serif',ctx.fillText(name||"未命名",sx+18,ry+26),ctx.fillStyle=T.sub,ctx.font='14px "Microsoft YaHei",sans-serif',wrapText(ctx,rest,sx+18,ry+48,sw-36,20,()=>{}),ry+=rh}),y+=tableH+gap,ctx.textAlign="center",ctx.textBaseline="middle",ctx.fillStyle=T.sub,ctx.font='14px "Microsoft YaHei",sans-serif',ctx.fillText("哪都通 · 异人论坛　异人能力档案",750/2,y+14),ctx.fillStyle=T.text,ctx.font='700 20px "Microsoft YaHei",sans-serif',ctx.fillText("网址 "+siteUrl(),750/2,y+48),resolve(canvas.toDataURL("image/jpeg",.92))})}function roundRect(ctx,x,y,w,h,r){ctx.beginPath(),ctx.moveTo(x+r,y),ctx.arcTo(x+w,y,x+w,y+h,r),ctx.arcTo(x+w,y+h,x,y+h,r),ctx.arcTo(x,y+h,x,y,r),ctx.arcTo(x,y,x+w,y,r),ctx.closePath()}function wrapText(ctx,text,x,y,maxW,lh,cb){let line="",yy=y;for(const ch of String(text)){const test=line+ch;ctx.measureText(test).width>maxW&&line?(ctx.fillText(line,x,yy),line=ch,yy+=lh):line=test}line&&(ctx.fillText(line,x,yy),yy+=lh),cb(yy)}const TETRIS_COLS=10,TETRIS_ROWS=20,TETRIS_BLOCK=28,TETRIS_PIECES=[{m:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],c:"#37D6E8"},{m:[[1,0,0],[1,1,1],[0,0,0]],c:"#4A6FE0"},{m:[[0,0,1],[1,1,1],[0,0,0]],c:"#E89A3C"},{m:[[1,1],[1,1]],c:"#E8D23C"},{m:[[0,1,1],[1,1,0],[0,0,0]],c:"#5BE07A"},{m:[[0,1,0],[1,1,1],[0,0,0]],c:"#A85BE0"},{m:[[1,1,0],[0,1,1],[0,0,0]],c:"#E0556A"}];class TetrisGame{constructor(){this.canvas=$("#tetris-canvas"),this.nextCanvas=$("#tetris-next"),this.ctx=this.canvas.getContext("2d"),this.nctx=this.nextCanvas.getContext("2d"),this.canvas.width=TETRIS_COLS*TETRIS_BLOCK,this.canvas.height=TETRIS_ROWS*TETRIS_BLOCK,this.nextCanvas.width=4*TETRIS_BLOCK,this.nextCanvas.height=3*TETRIS_BLOCK,this.reset(),this.draw(),this.drawNext()}reset(){this.board=Array.from({length:TETRIS_ROWS},()=>Array(TETRIS_COLS).fill(null)),this.score=0,this.lines=0,this.gameLevel=1,this.over=!1,this.paused=!1,this.running=!1,this.dropCounter=0,this.dropInterval=800,this.gamePoints=0,this.piece=null,this.next=this.randomPiece(),this._last=0,this.updateStats()}randomPiece(){const p=TETRIS_PIECES[Math.floor(Math.random()*TETRIS_PIECES.length)];return{m:p.m.map(r=>r.slice()),c:p.c}}spawn(){this.piece=this.next,this.next=this.randomPiece(),this.piece.x=Math.floor((TETRIS_COLS-this.piece.m[0].length)/2),this.piece.y=0,this.collides(this.piece)&&this.gameOver(),this.drawNext()}collides(piece,dx=0,dy=0,m=null){const mm=m||piece.m;for(let y=0;y<mm.length;y++)for(let x=0;x<mm[y].length;x++){if(!mm[y][x])continue;const nx=piece.x+x+dx,ny=piece.y+y+dy;if(nx<0||nx>=TETRIS_COLS||ny>=TETRIS_ROWS||ny>=0&&this.board[ny][nx])return!0}return!1}merge(){this.piece.m.forEach((row,y)=>row.forEach((v,x)=>{if(v){const ny=this.piece.y+y;ny>=0&&(this.board[ny][this.piece.x+x]=this.piece.c)}}))}rotate(){const m=this.piece.m,N=m.length,rot=Array.from({length:N},()=>Array(N).fill(0));for(let y=0;y<N;y++)for(let x=0;x<N;x++)rot[x][N-1-y]=m[y][x];if(!this.collides(this.piece,0,0,rot))this.piece.m=rot;else for(const dx of[-1,1,-2,2])if(!this.collides(this.piece,dx,0,rot)){this.piece.m=rot,this.piece.x+=dx;break}}move(dx){this.collides(this.piece,dx,0)||(this.piece.x+=dx)}softDrop(){this.collides(this.piece,0,1)?this.lock():(this.piece.y++,this.score+=1),this.dropCounter=0}hardDrop(){let d=0;for(;!this.collides(this.piece,0,1);)this.piece.y++,d++;this.score+=d*2,this.lock()}lock(){this.merge(),this.clearLines(),this.spawn()}clearLines(){let cleared=0;for(let y=TETRIS_ROWS-1;y>=0;y--)this.board[y].every(c=>c)&&(this.board.splice(y,1),this.board.unshift(Array(TETRIS_COLS).fill(null)),cleared++,y++);cleared&&(this.lines+=cleared,this.score+=[0,100,300,500,800][cleared]*this.gameLevel,this.gameLevel=Math.floor(this.lines/10)+1,this.dropInterval=Math.max(120,800-(this.gameLevel-1)*70),this.awardPoints(cleared)),this.updateStats()}awardPoints(cleared){const rule=pointsRule(),want=cleared*Number(rule.gamePerLine||3),remain=Math.max(0,Number(rule.gameCap||60)-this.gamePoints),give=Math.min(want,remain);this.gamePoints+=want,give>0&&(addPoints(DB.user,give),DB.save())}start(){this.over&&this.reset(),this.piece||this.spawn(),this.running=!0,this.paused=!1,this._last=0;const btn=$("#tetris-start");btn&&(btn.textContent="重新开始")}togglePause(){!this.running||this.over||(this.paused=!this.paused,toast(this.paused?"已暂停":"继续游戏"))}gameOver(){this.over=!0,this.running=!1,setTimeout(()=>toast(`游戏结束 · 本局得分 ${this.score}，已结算论坛积分`,"ok"),200)}ghostY(){let d=0;for(;!this.collides(this.piece,0,d+1);)d++;return this.piece.y+d}update(time){if(!this.running||this.paused||this.over){this.draw();return}if(!this.piece)return;this._last||(this._last=time);const dt=time-this._last;this._last=time,this.dropCounter+=dt,this.dropCounter>this.dropInterval&&(this.collides(this.piece,0,1)?this.lock():this.piece.y++,this.dropCounter=0),this.draw()}cell(ctx,x,y,color,ghost){const px=x*TETRIS_BLOCK,py=y*TETRIS_BLOCK,b=TETRIS_BLOCK;if(ghost){ctx.strokeStyle=color,ctx.globalAlpha=.35,ctx.lineWidth=2,ctx.strokeRect(px+2,py+2,b-4,b-4),ctx.globalAlpha=1;return}ctx.fillStyle=color,roundRect(ctx,px+1,py+1,b-2,b-2,4),ctx.fill(),ctx.fillStyle="rgba(255,255,255,.28)",roundRect(ctx,px+3,py+3,b-6,(b-6)/2,3),ctx.fill()}draw(){const ctx=this.ctx;ctx.fillStyle="rgba(6,12,38,.92)",ctx.fillRect(0,0,this.canvas.width,this.canvas.height),ctx.strokeStyle="rgba(120,140,200,.08)",ctx.lineWidth=1;for(let x=1;x<TETRIS_COLS;x++)ctx.beginPath(),ctx.moveTo(x*TETRIS_BLOCK,0),ctx.lineTo(x*TETRIS_BLOCK,this.canvas.height),ctx.stroke();for(let y=1;y<TETRIS_ROWS;y++)ctx.beginPath(),ctx.moveTo(0,y*TETRIS_BLOCK),ctx.lineTo(this.canvas.width,y*TETRIS_BLOCK),ctx.stroke();for(let y=0;y<TETRIS_ROWS;y++)for(let x=0;x<TETRIS_COLS;x++)this.board[y][x]&&this.cell(ctx,x,y,this.board[y][x]);if(this.piece){const gy=this.ghostY();this.piece.m.forEach((row,y)=>row.forEach((v,x)=>{v&&this.cell(ctx,this.piece.x+x,gy+y,this.piece.c,!0)})),this.piece.m.forEach((row,y)=>row.forEach((v,x)=>{v&&this.piece.y+y>=0&&this.cell(ctx,this.piece.x+x,this.piece.y+y,this.piece.c)}))}(this.over||this.paused||!this.running)&&this.drawOverlay()}drawOverlay(){const ctx=this.ctx;ctx.fillStyle="rgba(5,10,30,.72)",ctx.fillRect(0,0,this.canvas.width,this.canvas.height),ctx.textAlign="center",ctx.textBaseline="middle";const txt=this.over?"游戏结束":this.paused?"已暂停":"点击开始";ctx.fillStyle="#F3F6FF",ctx.font='900 26px "Microsoft YaHei",sans-serif',ctx.fillText(txt,this.canvas.width/2,this.canvas.height/2-14),ctx.fillStyle="#A9B8E8",ctx.font='14px "Microsoft YaHei",sans-serif',ctx.fillText(this.over?"本局得分 "+this.score+" · 已结算积分":this.paused?"按 P 或点击暂停继续":"按方向键操作，空格硬降",this.canvas.width/2,this.canvas.height/2+20)}drawNext(){const ctx=this.nctx;ctx.clearRect(0,0,this.nextCanvas.width,this.nextCanvas.height);const m=this.next.m,b=20,offX=(this.nextCanvas.width-m[0].length*b)/2,offY=(this.nextCanvas.height-m.length*b)/2;m.forEach((row,y)=>row.forEach((v,x)=>{v&&(ctx.fillStyle=this.next.c,roundRect(ctx,offX+x*b+1,offY+y*b+1,b-2,b-2,4),ctx.fill())}))}updateStats(){const set=(id,v)=>{const el=$("#"+id);el&&(el.textContent=v)};set("tetris-score",this.score),set("tetris-lines",this.lines),set("tetris-gamelevel",this.gameLevel)}}let _tetrisInstance=null;function initTetris(){_tetrisInstance=new TetrisGame;const loop=t=>{_tetrisInstance&&(_tetrisInstance.update(t),requestAnimationFrame(loop))};requestAnimationFrame(loop)}function tetrisAction(act){const g=_tetrisInstance;if(g){if(act==="start"){(g.running||g.over||g.piece)&&g.reset(),g.start();return}if(act==="pause"){g.togglePause();return}!g.running||g.paused||g.over||(act==="left"?g.move(-1):act==="right"?g.move(1):act==="rotate"?g.rotate():act==="down"?g.softDrop():act==="drop"&&g.hardDrop())}}function viewTetris(){return DB.user?portalShell("tetris",`<div class="p-crumb">个人 / <b>方块小游戏</b></div>
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
    </div>`):viewGate()}function router(){if(!DB.data)return;const currentHash=location.hash||"#/",previousHash=window._lastRouteHash;previousHash&&rememberCurrentView(previousHash),persistViewPositions();const routeChanged=previousHash!==currentHash;window._lastRouteHash=currentHash;const{seg,query}=parseHash(),r=seg[0];if(routeChanged&&r==="post"&&seg[1]){const viewed=DB.data.posts.find(x=>x.id===seg[1]);viewed&&(viewed.views=Math.max(0,Number(viewed.views)||0)+1,DB.save())}const needLogin=()=>DB.user?null:viewGate();let html="";switch(r){case void 0:html=viewHome();break;case"track":html=viewTrack(seg[1]?decodeURIComponent(seg[1]):"");break;case"service":html=viewService();break;case"my-ship":html=viewMyShipments(query.f||"all");break;case"ship-ok":html=viewShipOk(seg[1]?decodeURIComponent(seg[1]):"");break;case"sites":html=viewSites();break;case"news":html=viewNews();break;case"about":html=viewAbout();break;case"author":html=viewAuthorInfo();break;case"login":html=viewLogin();break;case"register":html=viewRegister();break;case"gate":html=viewGate();break;case"cloud":{html=needLogin()||viewCloud();break}case"forum":{html=needLogin()||viewForum(seg[1]?decodeURIComponent(seg[1]):"全部",query.sort||"latest");break}case"forum-notices":{html=needLogin()||viewForumNotices(query.filter||"all");break}case"search":{html=needLogin()||viewSearch(query.q||"");break}case"essence":{html=needLogin()||viewEssence();break}case"u":{html=needLogin()||viewUserProfile(seg[1]?decodeURIComponent(seg[1]):"");break}case"room":{html=needLogin()||viewRoom(seg[1]?parseInt(seg[1],10):0);break}case"workgroup":{html=needLogin()||(DB.level()>=2?viewWorkgroup():portalShell("workgroup",accessDenied()));break}case"oa":{html=needLogin()||(DB.level()>=2?viewOA(query.tab||"mine"):portalShell("oa",accessDenied()));break}case"divination":{html=needLogin()||viewDivination();break}case"yijing":{html=needLogin()||viewYijing();break}case"tarot":{html=needLogin()||viewTarot();break}case"huang":{html=needLogin()||viewHuang();break}case"post":{html=needLogin()||viewPost(seg[1]);break}case"ask":{html=needLogin()||viewAsk();break}case"wanted":{html=needLogin()||viewWanted();break}case"archives":{html=needLogin()||viewArchives(query.q||"",query.d||"");break}case"archive":{html=needLogin()||viewArchive(seg[1]);break}case"network":{html=needLogin()||(DB.level()>=2?viewRelationshipNetwork(seg[1]||"factions"):portalShell("network-factions",accessDenied()));break}case"events":{html=needLogin()||viewEvents();break}case"event":{html=needLogin()||viewEvent(seg[1]);break}case"library":{html=needLogin()||viewLibrary();break}case"codex":{html=needLogin()||viewCodex(query.q||"");break}case"dashboard":{html=needLogin()||viewDashboard();break}case"staff-card":{html=needLogin()||(DB.level()>=2?viewStaffCard():portalShell("staff-card",accessDenied()));break}case"space":{html=needLogin()||viewSpace(seg[1]||"me");break}case"decorate":{html=needLogin()||viewDecorate();break}case"messages":{const g=needLogin();let forceList=!1;try{forceList=sessionStorage.getItem("ndt-force-list")==="1",forceList&&sessionStorage.removeItem("ndt-force-list")}catch(e){}let lastChat="";try{lastChat=localStorage.getItem("ndt-last-chat-uid")||sessionStorage.getItem("ndt-last-chat-uid")||""}catch(e){try{lastChat=sessionStorage.getItem("ndt-last-chat-uid")||""}catch(e2){}}const lastUser=lastChat&&DB.data.users.find(u=>u.id===lastChat),lastHistory=lastChat&&DB.data.chats&&DB.data.chats[lastChat]&&Array.isArray(DB.data.chats[lastChat].messages)?DB.data.chats[lastChat].messages:[];html=g||(!forceList&&lastUser&&lastHistory.length?viewChat(lastChat):viewMessages());break}case"chat":{html=needLogin()||viewChat(seg[1]);break}case"friends":{html=needLogin()||viewFriends();break}case"settings":{html=needLogin()||viewSettings();break}case"ability":{html=needLogin()||viewAbility();break}case"tetris":{html=needLogin()||viewTetris();break}default:html=viewHome()}$("#app").innerHTML=html,afterRenderInit(),restoreSidebarScroll(),r==="network"&&setTimeout(drawNetworkGraph,30);const savedView=routeViewPositions[currentHash];requestAnimationFrame(()=>{if(restoreSidebarScroll(),savedView){window.scrollTo(0,Math.max(0,Number(savedView.y)||0));const sc=$("#ch-scroll");sc&&savedView.chatTop!==null&&savedView.chatTop!==void 0?sc.scrollTop=Math.max(0,Number(savedView.chatTop)||0):sc&&routeChanged&&(sc.scrollTop=sc.scrollHeight)}else{window.scrollTo(0,0);const sc=$("#ch-scroll");sc&&(sc.scrollTop=sc.scrollHeight)}persistViewPositions()});const internalRoutes=new Set(["forum","room","workgroup","oa","divination","yijing","tarot","huang","post","ask","wanted","archives","archive","network","events","event","library","codex","dashboard","staff-card","space","decorate","messages","chat","friends","settings","ability","tetris","u","search","essence"]);routeChanged&&DB.user&&internalRoutes.has(r)&&setTimeout(maybeLoginProactive,0)}function insertAt(field,text){const s=field.selectionStart,e=field.selectionEnd;field.value=field.value.slice(0,s)+text+field.value.slice(e),field.selectionStart=field.selectionEnd=s+text.length,field.focus()}function curPostId(){const{seg}=parseHash();return seg[1]}document.addEventListener("click",e=>{var _a,_b,_c,_d,_e,_f,_g,_h,_i,_j,_k,_l,_m,_n,_o,_p,_q,_r;const t=e.target,wgPageBtn=t.closest("[data-wg-page]");if(wgPageBtn){const wg=workgroupOf(),pages=Math.max(1,Math.ceil(wg.messages.length/CHAT_PAGE_SIZE));let page=Number(CHAT_PAGE_STATE["workgroup:main"]||0);page+=wgPageBtn.dataset.wgPage==="older"?1:-1,CHAT_PAGE_STATE["workgroup:main"]=Math.max(0,Math.min(pages-1,page)),router();return}const roomPageBtn=t.closest("[data-room-page]");if(roomPageBtn){const key="room:"+roomPageBtn.dataset.roomId,room=roomsOf().find(r=>r.id===roomPageBtn.dataset.roomId),pages=Math.max(1,Math.ceil(((room==null?void 0:room.messages)||[]).length/CHAT_PAGE_SIZE));let page=Number(CHAT_PAGE_STATE[key]||0);page+=roomPageBtn.dataset.roomPage==="older"?1:-1,CHAT_PAGE_STATE[key]=Math.max(0,Math.min(pages-1,page)),router();return}const pageBtn=t.closest("[data-chat-page]");if(pageBtn){const uid=pageBtn.dataset.chatUid,ch=chatOf(uid),pages=Math.max(1,Math.ceil(ch.messages.length/CHAT_PAGE_SIZE));let page=Number(CHAT_PAGE_STATE[uid]||0);page+=pageBtn.dataset.chatPage==="older"?1:-1,CHAT_PAGE_STATE[uid]=Math.max(0,Math.min(pages-1,page)),router();return}const clearChatBtn=t.closest("[data-clear-chat]");if(clearChatBtn){const uid=clearChatBtn.dataset.clearChat,person=DB.data.users.find(u=>u.id===uid),label=person?person.name:"该联系人";modal(`<h3>清除此私信窗口？</h3><div class="m-body">只会删除你与「${esc(label)}」之间的私信，不影响其他聊天窗口、联系人或其他应用数据。<br><br>是否继续？</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm btn-orange" data-m="yes">继续</button></div>`).then(v=>{v==="yes"&&modal('<h3>请再次确认</h3><div class="m-body">确定永久清除此私信窗口的全部消息吗？此操作无法撤销。</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">保留消息</button><button class="btn btn-sm btn-danger-soft" data-m="yes">确定清除此窗口</button></div>').then(v2=>{if(v2!=="yes")return;const ch=DB.data.chats[uid];ch&&(ch.messages=[],ch.unread=0),delete CHAT_PAGE_STATE[uid],DB.save(),router(),toast("该私信窗口已清空","ok")})});return}const clearRoomBtn=t.closest("[data-clear-room]");if(clearRoomBtn){const roomId=clearRoomBtn.dataset.clearRoom,room=roomsOf().find(r=>r.id===roomId);modal(`<h3>清除此聊天室？</h3><div class="m-body">只会删除聊天室「${esc((room==null?void 0:room.name)||"当前聊天室")}」的消息，其他聊天室、成员和其他应用数据都会保留。<br><br>是否继续？</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm btn-orange" data-m="yes">继续</button></div>`).then(v=>{v==="yes"&&modal('<h3>请再次确认</h3><div class="m-body">确定永久清除此聊天室的全部消息吗？此操作无法撤销。</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">保留消息</button><button class="btn btn-sm btn-danger-soft" data-m="yes">确定清除此聊天室</button></div>').then(v2=>{if(v2!=="yes")return;const target=roomsOf().find(r=>r.id===roomId);target&&(target.messages=[],target.unread=0),delete CHAT_PAGE_STATE["room:"+roomId],DB.save(),router(),toast("该聊天室已清空","ok")})});return}if(t.closest("#wg-clear-messages")){modal('<h3>清除工作组消息？</h3><div class="m-body">只会清空工作组中的消息，工作组成员和其他聊天窗口都会保留。<br><br>是否继续？</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm btn-orange" data-m="yes">继续</button></div>').then(v=>{v==="yes"&&modal('<h3>请再次确认</h3><div class="m-body">确定永久清空工作组的全部消息吗？此操作无法撤销。</div><div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">保留消息</button><button class="btn btn-sm btn-danger-soft" data-m="yes">确定清空工作组</button></div>').then(v2=>{if(v2!=="yes")return;const wg=workgroupOf();wg.messages=[],wg.unread=0,delete CHAT_PAGE_STATE["workgroup:main"],DB.save(),router(),toast("工作组消息已清空","ok")})});return}const cloudTab=t.closest("#cloud-tab-login,#cloud-tab-register");if(cloudTab){$("#cloud-box").innerHTML=cloudFormsHtml(cloudTab.id==="cloud-tab-login"?"login":"register");return}const cloudSub=t.closest("#cf-sub");if(cloudSub){const login=$("#cf-login").value.trim(),pass=$("#cf-pass").value,registering=!!$("#cf-name"),msg=$("#cloud-msg");msg.className="cloud-msg",msg.textContent="",cloudSub.disabled=!0,(async()=>{try{if(registering){const name=$("#cf-name").value.trim();if(!name){msg.className="cloud-msg err",msg.textContent="请填写昵称",cloudSub.disabled=!1;return}const inviteEl=$("#cf-invite"),invite=inviteEl?inviteEl.value.trim():"";await Cloud.register(login,pass,name,invite),toast(Cloud.lastInviteBonus?"云端账号注册成功，邀请奖励已到账":invite?"云端账号注册成功（邀请码无效，未发放奖励）":"云端账号注册成功，已登录","ok")}else await Cloud.login(login,pass),toast("已登录云端","ok");router(),initBadgeBaseline(),window._pollCloudNotif&&window._pollCloudNotif()}catch(err){msg.className="cloud-msg err",msg.textContent=err.message,cloudSub.disabled=!1}})();return}if(t.closest("#cloud-av-edit")){const file=document.getElementById("cloud-av-file");file&&file.click();return}if(t.closest("#cloud-logout")){(async()=>{try{await disableWebPush()}catch(e2){}Cloud.logout(),Cloud.notif={unread:0,total:0,list:[]},syncUnreadBadges(),router(),toast("已退出云端账号，云端推送已关闭","ok")})();return}const cloudRefresh=t.closest("#cloud-refresh");if(cloudRefresh){cloudRefresh.disabled=!0,(async()=>{try{await Cloud.refresh(),router(),toast("云端资料已刷新","ok")}catch(e2){toast(e2.message,"err"),cloudRefresh.disabled=!1}})();return}const acctName=t.closest("#acct-name-save");if(acctName){const name=(($("#acct-name")||{}).value||"").trim();if(!name){toast("昵称不能为空","err");return}if([...name].length>16){toast("昵称最多 16 个字","err");return}acctName.disabled=!0,(async()=>{try{await Cloud.updateName(name),router(),toast("昵称已更新，历史帖子署名同步完成","ok")}catch(e2){toast(e2.message,"err"),acctName.disabled=!1}})();return}const acctPass=t.closest("#acct-pass");if(acctPass){const oldPass=($("#acct-old-pass")||{}).value||"",newPass=($("#acct-new-pass")||{}).value||"";if(!oldPass||!newPass){toast("请填写当前密码和新密码","err");return}if(newPass.length<6){toast("新密码至少 6 位","err");return}acctPass.disabled=!0,(async()=>{try{await Cloud.changePassword(oldPass,newPass);const a=$("#acct-old-pass"),b2=$("#acct-new-pass");a&&(a.value=""),b2&&(b2.value=""),toast("密码已修改，下次登录请使用新密码","ok")}catch(e2){toast(e2.message,"err")}acctPass.disabled=!1})();return}if(t.closest("#cm-reload")){loadCloudMod();return}const cmBtn=t.closest("[data-cm]");if(cmBtn){const[action,targetId]=cmBtn.dataset.cm.split(":"),label={mute:"禁言",unmute:"解除禁言",ban:"拉黑",unban:"解除拉黑"}[action];modal(`<h3>${label}用户</h3><div class="m-body">确认对该用户执行「${label}」操作吗？</div>
      <div class="m-foot"><button class="btn btn-sm btn-ghost" data-m="no">取消</button>
      <button class="btn btn-sm btn-orange" data-m="yes">确认</button></div>`).then(async v=>{if(v==="yes")try{await Cloud.moderateUser(targetId,action),toast("已"+label,"ok"),loadCloudMod()}catch(e2){toast(e2.message,"err")}});return}const cmPass=t.closest("[data-cmpass]");if(cmPass){const uid=cmPass.dataset.cmpass,u=(_cloudModUsers||[]).find(x=>x.id===uid)||{name:"该用户"},mask=openMask(`<h3>重置密码</h3>
      <div class="m-body">
        <p class="ph-sub" style="margin:0 0 12px">为「${esc(u.name)}」设置新密码（至少 6 位）。对方下次登录需改用新密码，其帖子、积分与徽章不受影响。</p>
        <input class="field" id="cmpass-new" type="password" placeholder="新密码（至少 6 位）" autocomplete="new-password">
        <p class="ph-sub" id="cmpass-msg" style="margin:8px 0 0"></p>
      </div>
      <div class="m-foot"><button class="btn btn-sm btn-ghost" id="cmpass-cancel">取消</button><button class="btn btn-sm btn-orange" id="cmpass-ok">确认重置</button></div>`);mask.querySelector("#cmpass-cancel").onclick=()=>mask.remove(),mask.querySelector("#cmpass-ok").onclick=async()=>{const inp=mask.querySelector("#cmpass-new"),msg=mask.querySelector("#cmpass-msg"),okBtn=mask.querySelector("#cmpass-ok"),pass=inp?inp.value:"";if(pass.length<6){msg&&(msg.textContent="新密码至少 6 位");return}okBtn.disabled=!0;try{await Cloud.resetUserPassword(uid,pass),mask.remove(),toast("已重置该用户密码","ok")}catch(e2){msg&&(msg.textContent=e2.message),okBtn.disabled=!1}};return}const cmRole=t.closest("[data-cmrole]");if(cmRole){const[role,targetId]=cmRole.dataset.cmrole.split(":"),label=role==="3"?"设为管理员":"取消管理员";modal(`<h3>${label}</h3><div class="m-body">确认对该用户执行「${label}」操作吗？</div>
      <div class="m-foot"><button class="btn btn-sm btn-ghost" data-m="no">取消</button>
      <button class="btn btn-sm btn-orange" data-m="yes">确认</button></div>`).then(async v=>{if(v==="yes")try{await Cloud.setRole(targetId,Number(role)),toast("已"+label,"ok"),loadCloudMod()}catch(e2){toast(e2.message,"err")}});return}const cmDel=t.closest("[data-cmdel]");if(cmDel){const targetId=cmDel.dataset.cmdel;modal(`<h3>删除账号</h3><div class="m-body">
      <p style="color:#FF6B6B;font-weight:700">此操作不可恢复！</p>
      <p>将永久删除该账号，以及其名下的全部帖子、回复、点赞和消息；他人帖子下被该账号回复的内容会一并处理。</p>
      <p>确认删除该账号吗？</p></div>
      <div class="m-foot"><button class="btn btn-sm btn-ghost" data-m="no">取消</button>
      <button class="btn btn-sm btn-orange" data-m="yes">确认删除</button></div>`).then(async v=>{if(v==="yes")try{await Cloud.deleteUser(targetId),toast("账号已删除","ok"),loadCloudMod()}catch(e2){toast(e2.message,"err")}});return}if(t.closest("[data-bmanage]")){openBadgeManageModal();return}const cmBadge=t.closest("[data-cmbadge]");if(cmBadge){const targetId=cmBadge.dataset.cmbadge,row=cmBadge.closest(".cm-row"),targetName=row?row.querySelector(".cm-name b").textContent:"";openGrantBadgeModal(targetId,targetName||"该用户");return}if(t.closest("[data-editprofile]")){openProfileEditModal();return}const beqBtn=t.closest("[data-beq]");if(beqBtn){const bid=beqBtn.dataset.beq,cur=Cloud.user.badge,target=cur&&cur.id===bid?null:bid;Cloud.equipBadge(target).then(async()=>{await Cloud.refresh().catch(()=>{}),toast(target?"已佩戴徽章":"已卸下徽章","ok"),router()}).catch(e2=>toast(e2.message,"err"));return}const mBtn=t.closest("[data-m]");if(mBtn){const mask=t.closest(".modal-mask");mask&&mask._close(mBtn.dataset.m);return}const stb=t.closest("[data-site-tab]");if(stb){$$("[data-site-tab]").forEach(x=>x.classList.toggle("on",x===stb)),$$("[data-site-panel]").forEach(p=>{p.hidden=p.dataset.sitePanel!==stb.dataset.siteTab});return}const si=t.closest("[data-hash]");if(si&&si.dataset.hash){location.hash===si.dataset.hash?router():location.hash=si.dataset.hash;return}const op=t.closest("[data-open]");if(op){location.hash="#/post/"+op.dataset.open;return}const ar=t.closest("[data-arc]");if(ar){location.hash="#/archive/"+ar.dataset.arc;return}const ev=t.closest("[data-ev]");if(ev){location.hash="#/event/"+ev.dataset.ev;return}const libEditTarget=t.closest("[data-libedit]");if(libEditTarget){e.stopPropagation();const l=DB.data.library.find(x=>x.id===libEditTarget.dataset.libedit);l&&libForm(l);return}if(t.closest("[data-lib]")){toast("资料已在下方完整展示");return}const fb=t.closest("[data-b]");if(fb){location.hash="#/forum/"+encodeURIComponent(fb.dataset.b);return}const fs=t.closest("[data-sort]");if(fs){const{seg}=parseHash(),b=seg[1]||"全部";location.hash="#/forum/"+b+"?sort="+fs.dataset.sort;return}const pin=t.closest("[data-pin]");if(pin){if(Cloud.connected){pin.disabled=!0,(async()=>{try{const r=await Cloud.pinPost(pin.dataset.pin);toast(r.pinned?"帖子已置顶":"已取消置顶","ok"),router()}catch(e2){pin.disabled=!1,toast(e2.message,"err")}})();return}const p=DB.data.posts.find(x=>x.id===pin.dataset.pin);p&&(p.pinned=p.pinned?0:1,DB.save(),router(),toast(p.pinned?"帖子已置顶":"已取消置顶","ok"));return}const es=t.closest("[data-essence]");if(es){if(Cloud.connected){es.disabled=!0,(async()=>{try{const r=await Cloud.essencePost(es.dataset.essence);toast(r.essence?"帖子已加精":"已取消加精","ok"),router()}catch(err){es.disabled=!1,toast(err.message,"err")}})();return}const lp=DB.data.posts.find(x=>x.id===es.dataset.essence);lp&&(lp.essence=lp.essence?0:1,DB.save(),router(),toast(lp.essence?"帖子已加精":"已取消加精","ok"));return}if(t.closest("#f-checkin")){doCheckinFlow();return}if(t.closest("#f-essence")){location.hash="#/essence";return}if(t.closest("#f-loadmore")){loadMoreCloud();return}if(t.closest("#cloud-export")){const btn=t.closest("#cloud-export");btn.disabled=!0,Cloud.exportData().then(({blob,filename})=>{const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url,a.download=filename,document.body.appendChild(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(url),4e3),btn.disabled=!1,toast("备份已开始下载","ok")}).catch(err=>{btn.disabled=!1,toast(err.message,"err")});return}const wd=t.closest("[data-wanted-del]");if(wd){const id=wd.dataset.wantedDel;modal('<h3>撤销通缉令</h3><div class="m-body">确认撤销这条通缉令？</div><div class="m-foot"><button class="btn btn-sm btn-ghost" data-m="no">返回</button><button class="btn btn-sm btn-orange" data-m="yes">确认撤销</button></div>').then(v=>{v==="yes"&&(DB.data.wanted=(DB.data.wanted||[]).filter(w=>w.id!==id),DB.save(),router(),toast("通缉令已撤销","ok"))});return}const we=t.closest("[data-wanted-edit]");if(we){editWanted(we.dataset.wantedEdit);return}const pp=t.closest("[data-pollpick]");if(pp){e.preventDefault();const pollId=pp.closest(".poll-box").dataset.pollid;pp.disabled=!0,Cloud.votePoll(pollId,[pp.dataset.pollpick]).then(async()=>{await Cloud.refresh().catch(()=>{}),await cloudRerender(),toast("投票成功","ok")}).catch(err=>{pp.disabled=!1,toast(err.message,"err")});return}if(t.closest("#poll-submit")){const box=t.closest(".poll-box"),pollId=box.dataset.pollid,ids=Array.from(box.querySelectorAll(".poll-multi-opt:checked")).map(c=>c.value);if(!ids.length){toast("请至少选择一个选项","warn");return}const btn=t.closest("#poll-submit");btn.disabled=!0,Cloud.votePoll(pollId,ids).then(async()=>{await Cloud.refresh().catch(()=>{}),await cloudRerender(),toast("投票成功","ok")}).catch(err=>{btn.disabled=!1,toast(err.message,"err")});return}const pv=t.closest("[data-vote]");if(pv){if(e.preventDefault(),e.stopPropagation(),Cloud.connected){pv.disabled=!0,Cloud.toggleLike("post",pv.dataset.vote).then(async liked=>{await Cloud.refresh().catch(()=>{}),await cloudRerender(),toast(liked?"已赞同":"已取消赞同","ok")}).catch(err=>{pv.disabled=!1,toast(err.message,"err")});return}const p=DB.data.posts.find(x=>x.id===pv.dataset.vote);if(p&&toggleVote(p.votes)){const liked=p.votes.includes(DB.user.id);liked?(addForumLikeNotice(p,DB.user.id),addPoints(DB.user,Number(pointsRule().like)||0)):addPoints(DB.user,-(Number(pointsRule().like)||0)),DB.save(),syncUnreadBadges(),syncVoteUI("post",p.id,p.votes),toast(liked?"已赞同":"已取消赞同","ok")}return}const av=t.closest("[data-avote]");if(av){if(e.preventDefault(),e.stopPropagation(),Cloud.connected){av.disabled=!0,Cloud.toggleLike("reply",av.dataset.avote).then(async liked=>{await Cloud.refresh().catch(()=>{}),await cloudRerender(),toast(liked?"已赞同回答":"已取消赞同","ok")}).catch(err=>{av.disabled=!1,toast(err.message,"err")});return}const a=DB.data.answers.find(x=>x.id===av.dataset.avote);if(a&&toggleVote(a.votes)){const liked=a.votes.includes(DB.user.id);liked&&addPoints(DB.user,Number(pointsRule().like)||0),syncVoteUI("answer",a.id,a.votes),toast(liked?"已赞同回答":"已取消赞同","ok")}return}const tp=t.closest("[data-tpl]");if(tp){const u=DB.user;u.tpl=tp.dataset.tpl,DB.save(),router();return}const zc=t.closest("[data-zika-color]");if(zc){const c=$("#d-zika-custom");c&&/^#[0-9a-f]{6}$/i.test(zc.dataset.zikaColor)&&(c.value=zc.dataset.zikaColor),DB.user.zikaBg=zc.dataset.zikaColor,DB.save();return}const stk=t.closest("[data-s]");if(stk){const box=stk.closest(".stk-picker"),target=(box&&box.previousElementSibling?box.previousElementSibling.querySelector("textarea"):null)||$("#a-body")||$("#ans-body");target&&insertAt(target,stk.dataset.s);return}const rm=t.closest("[data-rm]");if(rm){const me=DB.user;me.friends=me.friends.filter(id=>id!==rm.dataset.rm),DB.save(),router(),toast("已删除好友");return}if(t.closest("#logo-go")){const{seg}=parseHash();if(seg[0]!==void 0){location.hash="#/";return}const el=window;(!el._logoT||Date.now()-el._logoT>1500)&&(el._logoN=0),el._logoT=Date.now(),el._logoN=(el._logoN||0)+1,el._logoN>=5?(el._logoN=0,location.hash="#/gate",toast("检测到内部入口","warn")):el._logoN>=3&&toast(`再点 ${5-el._logoN} 次……`);return}if(t.closest("#tb-go")){const c=$("#tb-code");if(!c.value.trim()){toast("请输入运单号","warn");return}location.hash="#/track/"+encodeURIComponent(c.value.trim());return}if(t.closest("#lg-out")){Auth.logout(),location.hash="#/";return}if(t.closest("#p-logout")){Auth.logout(),location.hash="#/",toast("已退出论坛");return}if(t.closest("#p-home")){location.hash="#/forum";return}const thSet=t.closest("[data-theme-set]");if(thSet){DB.data.theme=thSet.dataset.themeSet;const valid=TEMPLATES[DB.data.theme]||TEMPLATES.default;DB.user&&!valid.some(x=>x.id===DB.user.tpl)&&(DB.user.tpl=valid[0].id),DB.save(),router();return}if(t.closest("#p-space")){location.hash="#/space/me";return}if(t.closest("#f-ask")){location.hash="#/ask";return}if(t.closest("#bd-manage")){boardManage();return}if(t.closest("#g-reg")){location.hash="#/register";return}if(t.closest("#g-go")){const r=Auth.login($("#g-acc").value.trim(),$("#g-pwd").value);if(!r.ok){toast(r.msg,"err");return}toast("登录成功，正在进入异人论坛","ok"),enterPortal("#/forum");return}if(t.closest("#lg-go")){const r=Auth.login($("#lg-acc").value.trim(),$("#lg-pwd").value);if(!r.ok){toast(r.msg,"err");return}toast("登录成功，正在进入异人论坛","ok"),enterPortal("#/forum");return}if(t.closest("#rg-go")){const r=Auth.register($("#rg-name").value.trim(),$("#rg-pwd").value);if(!r.ok){toast(r.msg,"err");return}toast("注册成功，正在进入异人论坛","ok"),enterPortal("#/forum");return}if(t.closest("#s-sub")){return}if(t.closest("#forum-notify-enable")){requestForumNotificationPermission();return}if(t.closest("#forum-auto-settings")){openForumAutoSettings();return}if(t.closest("#a-stk")){$("#a-stk-box").classList.toggle("hide");return}if(t.closest("#ans-stk")){$("#ans-stk-box").classList.toggle("hide");return}if(t.closest("#a-sub")){const title=$("#a-title").value.trim(),body=$("#a-body").value.trim();if(!title){toast("请填写标题","warn");return}if(!body){toast("请填写内容","warn");return}if(Cloud.connected){const btn=t.closest("#a-sub");btn.disabled=!0;const board=$("#a-board").value,poll=readVoteBuilder();Cloud.createPost(board,title,body,poll).then(async p2=>{await Cloud.refresh().catch(()=>{}),await checkNewBadges(),toast("已发布到共享论坛","ok"),location.hash="#/post/"+p2.id}).catch(err=>{btn.disabled=!1,toast(err.message,"err")});return}const u=DB.user,goalLikes=Math.max(0,Math.min(1e6,Number((_a=$("#a-goal-likes"))==null?void 0:_a.value)||0)),goalViews=Math.max(0,Math.min(1e6,Number((_b=$("#a-goal-views"))==null?void 0:_b.value)||0)),goalHours=Math.max(.1,Math.min(8760,Number((_c=$("#a-goal-hours"))==null?void 0:_c.value)||24)),p={id:genId("p"),board:$("#a-board").value,pinned:0,title,content:body,authorId:u.id,createdAt:nowStr(),votes:[],views:0,simulatedLikes:0,editedBy:[],heatGoal:goalLikes||goalViews?{likes:goalLikes,views:goalViews,createdAt:Date.now(),targetAt:Date.now()+goalHours*36e5}:null};DB.data.posts.push(p),addPoints(u,Number(pointsRule().post)||0);const autoAdded=runForumAutoReply(p,null,`${p.title}
${p.content}`);DB.save(),syncUnreadBadges(),toast(autoAdded?"已发布，关键词自动回复已生成":"已发布","ok"),location.hash="#/post/"+p.id;return}const peditBtn=t.closest("[data-pedit]");if(peditBtn){const postId=peditBtn.dataset.pedit||curPostId();Cloud.getPost(postId).then(d=>openPostEditModal(d.post)).catch(e2=>toast(e2.message,"err"));return}const peditsBtn=t.closest("[data-pedits]");if(peditsBtn){openPostHistoryModal({id:peditsBtn.dataset.pedits||curPostId()});return}const shareBtn=t.closest("[data-share]");if(shareBtn){openShareModal({id:shareBtn.dataset.share,title:shareBtn.dataset.shareTitle||"",board:shareBtn.dataset.shareBoard||"",authorName:shareBtn.dataset.shareAuthor||""});return}const rreply=t.closest("[data-rreply]");if(rreply){const targetId=rreply.dataset.rreply,box=t.closest(".answer").querySelector(".inline-reply");box.dataset.rtarget=targetId;const ta=box.querySelector(".ir-body");ta.placeholder="回复 @"+rreply.dataset.rname+"：",ta.value="",box.classList.remove("hide"),ta.focus();return}const rcancel=t.closest("[data-rcancel]");if(rcancel){const box=rcancel.closest(".inline-reply");box.classList.add("hide"),box.querySelector(".ir-body").value="";return}const rsub=t.closest("[data-rsub]");if(rsub){const box=rsub.closest(".inline-reply"),parentId=box.dataset.rtarget||rsub.dataset.rsub,content=box.querySelector(".ir-body").value.trim();if(!content){toast("回复内容不能为空","warn");return}if(rsub.disabled=!0,Cloud.connected){const{seg}=parseHash();Cloud.reply(seg[1],content,parentId).then(async()=>{await Cloud.refresh().catch(()=>{}),await checkNewBadges(),toast("回复已提交","ok"),await cloudRerender()}).catch(err=>{rsub.disabled=!1,toast(err.message,"err")});return}const post=DB.data.posts.find(x=>x.id===curPostId());if(!post){toast("帖子不存在或已被删除","warn"),rsub.disabled=!1;return}const a={id:genId("a"),postId:post.id,parentId,authorId:DB.user.id,content,createdAt:nowStr(),votes:[],editedBy:[]};DB.data.answers.push(a),addPoints(DB.user,Number(pointsRule().reply)||0),DB.save(),router(),toast("回复已提交","ok");return}if(t.closest("#ans-sub")){const body=$("#ans-body").value.trim();if(!body){toast("回答内容不能为空","warn");return}if(Cloud.connected){const btn=t.closest("#ans-sub");btn.disabled=!0;const{seg}=parseHash();Cloud.reply(seg[1],body).then(async()=>{await Cloud.refresh().catch(()=>{}),await checkNewBadges(),toast("回答已提交到共享论坛","ok"),await cloudRerender()}).catch(err=>{btn.disabled=!1,toast(err.message,"err")});return}const u=DB.user,post=DB.data.posts.find(x=>x.id===curPostId());if(!post){toast("帖子不存在或已被删除","warn");return}const a={id:genId("a"),postId:post.id,authorId:u.id,content:body,createdAt:nowStr(),votes:[],editedBy:[]};DB.data.answers.push(a),addPoints(u,Number(pointsRule().reply)||0),addForumNotice(post,a);const autoAdded=runForumAutoReply(post,a,body);DB.save(),syncUnreadBadges(),toast(autoAdded?"回答已提交，已触发关键词自动回复":"回答已提交","ok"),router();return}if(t.closest("#p-vote")){e.preventDefault(),e.stopPropagation();const p=DB.data.posts.find(x=>x.id===curPostId());if(p&&toggleVote(p.votes)){const liked=p.votes.includes(DB.user.id);liked?(addForumLikeNotice(p,DB.user.id),addPoints(DB.user,Number(pointsRule().like)||0)):addPoints(DB.user,-(Number(pointsRule().like)||0)),DB.save(),syncUnreadBadges(),syncVoteUI("post",p.id,p.votes),toast(liked?"已赞同":"已取消赞同","ok")}return}if(t.closest("#p-edit")){const p=DB.data.posts.find(x=>x.id===curPostId());modal(`<h3>编辑帖子</h3><div class="m-body">
      <label class="fl">发帖人姓名</label><input class="field" id="m-author" value="${esc(postAuthor(p))}">
      <div style="display:flex;gap:10px"><div style="flex:1"><label class="fl">浏览数</label><input class="field" id="m-views" type="number" value="${p.views||0}"></div>
      <div style="flex:1"><label class="fl">赞同数</label><input class="field" id="m-votes" type="number" value="${p.votes.length}"></div></div>
      <label class="fl">帖子正文</label>
      <textarea class="field" id="m-edit" style="min-height:180px">${esc(p.content)}</textarea></div>
      <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">保存修改</button></div>`).then(v=>{v==="yes"&&(p.authorName=$("#m-author").value.trim(),p.views=Math.max(0,parseInt($("#m-views").value)||0),setVoteCount(p.votes,$("#m-votes").value),p.content=$("#m-edit").value,recordEdit(p),DB.save(),router(),toast("已保存修改","ok"))});return}if(t.closest("#p-del")){if(Cloud.connected){const postId=curPostId();modal(`<h3>删除帖子</h3><div class="m-body">将同时删除该帖下全部回答，确定吗？此操作无法恢复。</div>
        <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm btn-orange" data-m="yes">确定删除</button></div>`).then(async v=>{if(v==="yes")try{await Cloud.deletePost(postId),await Cloud.refresh().catch(()=>{}),toast("帖子已删除","ok"),location.hash="#/forum"}catch(err){toast(err.message,"err")}});return}const p=DB.data.posts.find(x=>x.id===curPostId());modal(`<h3>删除帖子</h3><div class="m-body">将同时删除该帖下全部回答，确定吗？</div>
      <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">确定删除</button></div>`).then(v=>{v==="yes"&&(DB.data.posts=DB.data.posts.filter(x=>x.id!==p.id),DB.data.answers=DB.data.answers.filter(a=>a.postId!==p.id),DB.save(),location.hash="#/forum",toast("帖子已删除","ok"))});return}const adel=t.closest("[data-adel]");if(adel){if(Cloud.connected){modal(`<h3>删除回答</h3><div class="m-body">确定删除这条回答吗？此操作无法恢复。</div>
        <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm btn-orange" data-m="yes">确定删除</button></div>`).then(async v=>{if(v==="yes")try{await Cloud.deleteReply(adel.dataset.adel),await Cloud.refresh().catch(()=>{}),await cloudRerender(),toast("回答已删除","ok")}catch(err){toast(err.message,"err")}});return}const a=DB.data.answers.find(x=>x.id===adel.dataset.adel);modal(`<h3>删除回答</h3><div class="m-body">确定删除这条回答吗？</div>
      <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">确定删除</button></div>`).then(v=>{v==="yes"&&(DB.data.answers=DB.data.answers.filter(x=>x.id!==a.id),DB.save(),router(),toast("回答已删除","ok"))});return}const ae=t.closest("[data-aedit]");if(ae){const a=DB.data.answers.find(x=>x.id===ae.dataset.aedit);modal(`<h3>编辑回答</h3><div class="m-body">
      <label class="fl">回复人姓名</label><input class="field" id="m-author" value="${esc(ansAuthor(a))}">
      <label class="fl">赞同数</label><input class="field" id="m-votes" type="number" value="${a.votes.length}">
      <label class="fl">回答内容</label>
      <textarea class="field" id="m-edit" style="min-height:150px">${esc(a.content)}</textarea></div>
      <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">保存修改</button></div>`).then(v=>{v==="yes"&&(a.authorName=$("#m-author").value.trim(),setVoteCount(a.votes,$("#m-votes").value),a.content=$("#m-edit").value,recordEdit(a),DB.save(),router(),toast("已保存修改","ok"))});return}if(t.closest("#ar-go")){const q=$("#ar-q").value.trim(),d=$("#ar-d").value;location.hash="#/archives?"+new URLSearchParams({q,d}).toString();return}if(t.closest("#ar-apply")){toast("调阅申请已提交，等待管理员审批","warn");return}if(t.closest("#ev-edit")){const{seg}=parseHash(),e2=DB.data.events.find(x=>x.id===seg[1]);eventForm(e2);return}if(t.closest("#arc-edit")){const{seg}=parseHash(),r=DB.data.archives.find(x=>x.id===seg[1]);archiveForm(r);return}if(t.closest("#arc-new")){archiveForm({id:"",code:"",name:"",gender:"",faction:"",skill:"",danger:"B",status:"观察",sec:2,aliases:"",note:""});return}if(t.closest("#ev-new")){eventForm({id:"",year:"",date:"",title:"",loc:"",sec:1,hot:0,content:""});return}if(t.closest("#lib-new")){libForm({id:"",cat:"",title:"",sec:1,content:""});return}if(t.closest("#codex-new")){codexForm();return}const ce=t.closest("[data-codex-edit]");if(ce){const x=(DB.data.publicLibrary||[]).find(y=>y.id===ce.dataset.codexEdit);x&&codexForm(x);return}const cd=t.closest("[data-codex-del]");if(cd){const x=(DB.data.publicLibrary||[]).find(y=>y.id===cd.dataset.codexDel);x&&confirmDlg("移除典藏条目","确定从异闻典藏中移除此条目？").then(ok=>{ok&&(DB.data.publicLibrary=DB.data.publicLibrary.filter(y=>y.id!==x.id),DB.save(),router(),toast("条目已移除"))});return}if(t.closest("[data-codex-save]")){const mask=t.closest(".modal-mask");mask&&mask._close("yes");return}if(t.closest("#codex-search")){e.preventDefault(),location.hash="#/codex?q="+encodeURIComponent($("#codex-q").value.trim());return}if(t.closest("#sp-add")){const{seg}=parseHash(),me=DB.user;if(me.friends.includes(seg[1])){toast("已经是好友了");return}me.friends.push(seg[1]),DB.save(),router(),toast("好友申请已通过","ok");return}if(t.closest("#sc-save")){const u=DB.user;if(!u||u.level<2){toast("仅员工和管理员可以编辑专属名片","warn");return}u.staffCard={displayName:$("#sc-name").value.trim(),employeeNo:$("#sc-no").value.trim(),department:$("#sc-dept").value.trim(),position:$("#sc-position").value.trim(),rank:$("#sc-rank").value.trim(),joinDate:$("#sc-date").value.trim(),workStatus:$("#sc-status").value.trim(),contact:$("#sc-contact").value.trim(),specialty:$("#sc-specialty").value.trim(),profile:$("#sc-profile").value.trim(),motto:$("#sc-motto").value.trim()},DB.save(),router(),toast("专属名片已保存","ok");return}if(t.closest("#sc-cancel")){router(),toast("已放弃本次修改");return}if(t.closest("#d-save")){const u=DB.user,nm=$("#d-name").value.trim();if(!nm){toast("昵称不能为空","warn");return}u.name=nm,u.bio=$("#d-bio").value.trim(),u.notice=$("#d-notice").value.trim(),u.coverImg=((_d=$("#d-cover-url"))==null?void 0:_d.value.trim())||u.coverImg||"",u.zikaBg=((_e=$("#d-zika-custom"))==null?void 0:_e.value)||u.zikaBg||"",u.avatarBorder=((_f=$("#d-avatar-border"))==null?void 0:_f.value)||"none",u.nameColor=((_g=$("#d-name-color"))==null?void 0:_g.value)||"var(--pt-text)";const url=$("#d-av-url").value.trim();url&&url.startsWith("http")&&(u.avatar=url),DB.save(),toast("装修已保存","ok"),location.hash="#/space/me";return}if(t.closest("#fr-add")){const id=$("#fr-sel").value,me=DB.user;me.friends.includes(id)||me.friends.push(id),DB.save(),router(),toast("已添加好友","ok");return}const cnRead=t.closest("[data-cn-read]");if(cnRead&&Cloud.connected){Cloud.readNotifications(cnRead.dataset.cnRead).then(async()=>{await Cloud.pollNotifications(),syncUnreadBadges(),router()}).catch(e2=>toast(e2.message,"err"));return}if(t.closest("#fnc-read-all")&&Cloud.connected){Cloud.readNotifications().then(async()=>{await Cloud.pollNotifications(),syncUnreadBadges(),router(),toast("已全部标为已读","ok")}).catch(e2=>toast(e2.message,"err"));return}if(t.closest("#fnc-clear-read")&&Cloud.connected){Cloud.clearReadNotifications().then(async()=>{await Cloud.pollNotifications(),syncUnreadBadges(),router(),toast("已清理已读消息","ok")}).catch(e2=>toast(e2.message,"err"));return}const cnOpen=t.closest("[data-cn-open]");if(cnOpen&&Cloud.connected){Cloud.readNotifications(cnOpen.dataset.cnOpen).then(async()=>{await Cloud.pollNotifications(),syncUnreadBadges()}).catch(()=>{});return}const markOne=t.closest("[data-fnc-read]");if(markOne){const n=(DB.data.forumNotices||[]).find(x=>x.id===markOne.dataset.fncRead&&x.userId===DB.user.id);n&&(n.read=!0),DB.save(),syncUnreadBadges(),router();return}if(t.closest("#fnc-read-all")){(DB.data.forumNotices||[]).forEach(n=>{n.userId===DB.user.id&&(n.read=!0)}),DB.save(),syncUnreadBadges(),router(),toast("帖子消息已全部标为已读","ok");return}if(t.closest("#fnc-clear-read")){DB.data.forumNotices=(DB.data.forumNotices||[]).filter(n=>n.userId!==DB.user.id||!n.read),DB.save(),syncUnreadBadges(),router(),toast("已清理已读的帖子消息","ok");return}const fncOpen=t.closest("[data-fnc-open]");if(fncOpen){const n=(DB.data.forumNotices||[]).find(x=>x.id===fncOpen.dataset.fncOpen&&x.userId===DB.user.id);n&&!n.read&&(n.read=!0,DB.save(),syncUnreadBadges());return}const pinChat=t.closest("[data-chat-pin]");if(pinChat){const id=pinChat.dataset.chatPin,ch=chatOf(id);ch.pinned=!ch.pinned,DB.save(),router(),toast(ch.pinned?"联系人已置顶":"已取消置顶","ok");return}const openChat=t.closest("[data-chat]");if(openChat){location.hash="#/chat/"+openChat.dataset.chat;return}if(t.closest("#msg-open")){const id=$("#msg-new").value;if(!id){toast("请先选择一个用户","warn");return}location.hash="#/chat/"+id;return}const curRoom=activeRoom();if(t.closest("#rm-members")){roomMembers(curRoom);return}if(t.closest("#rm-cfg-open")){openRoomCfg();return}if(t.closest("#rm-speak")){speakPop(t.closest("#rm-speak"),curRoom);return}if(t.closest("#rm-send")){sendRoom(curRoom);return}const roomAv=t.closest("[data-room-av]");if(roomAv){roomSpeak(curRoom,roomAv.dataset.roomAv);return}const roomTab=t.closest("[data-room-tab]");if(roomTab){location.hash="#/room/"+roomTab.dataset.roomTab;return}if(t.closest("#wanted-add")){editWanted("new");return}if(t.closest("#room-add")){const rooms=roomsOf();rooms.length<3&&(rooms.push(makeRoom("聊天室"+(rooms.length+1))),DB.save(),location.hash="#/room/"+(rooms.length-1));return}if(t.closest("#rm-rename")){const nm=prompt("聊天室名称",curRoom.name);nm&&nm.trim()&&(curRoom.name=nm.trim().slice(0,20),DB.save(),router());return}if(t.closest("#rm-voice-toggle")){toggleVoice("rm");return}if(t.closest("#ch-voice-toggle")){toggleVoice("ch");return}if(t.closest("[data-them-av]")||t.closest("#ch-avatar")||t.closest("#ch-add-them")){const{seg}=parseHash();themReply(seg[1]);return}if(t.closest("#ch-hint")||t.closest("#msg-hint")){chatHint();return}if(t.closest("#ch-send")){const{seg}=parseHash();sendChat(seg[1]);return}const modeBtn=t.closest("[data-mode]");if(modeBtn){const cfg=modeBtn.closest(".card-cfg"),box=cfg.id==="rm-cfg"?activeRoom():cfg.id==="wg-cfg"?workgroupOf():chatOf(parseHash().seg[1]);box.mode=modeBtn.dataset.mode,cfg.querySelectorAll("[data-mode]").forEach(b=>b.classList.toggle("on",b===modeBtn));const cardWrap=cfg.querySelector(".card-only");if(cardWrap&&(cardWrap.style.display=box.mode==="card"?"inline-flex":"none"),box.mode==="card"){const speed=cfg.querySelector("select");speed&&(box.speed=speed.value);const proactive=cfg.querySelector('[id$="-proactive"]');proactive&&(box.proactive=proactive.checked)}DB.save();return}if(t.closest("#rm-cards")){const ids=activeRoom().members.filter(id=>id!==DB.user.id),list=ids.length?ids:DB.data.users.filter(u=>u.id!==DB.user.id).map(u=>u.id);if(!list.length){toast("先添加成员","warn");return}const mask=openMask(`<h3>选择要管理字卡的成员</h3><div class="m-body">
      ${list.map(id=>{const u=userOfId(id);return`<div class="mem-row" data-pickcard="${id}" style="cursor:pointer">
        <span class="av" style="width:30px;height:30px;font-size:12px">${avatarHtml32(u)}</span>
        <span>${esc(u?u.name:"?")}</span></div>`}).join("")}
      <div style="display:flex;margin-top:10px"><button class="btn btn-sm btn-ghost" id="pc-cancel" style="margin-left:auto">取消</button></div></div>`);mask.querySelector("#pc-cancel").addEventListener("click",()=>mask.remove()),mask.addEventListener("click",e2=>{const r=e2.target.closest("[data-pickcard]");r&&(mask.remove(),cardManager(r.dataset.pickcard))});return}if(t.closest("#ch-cards")){cardManager(parseHash().seg[1]);return}const emojiToggle=t.closest("[data-emoji-toggle]");if(emojiToggle){toggleChatPanel(emojiToggle.dataset.emojiToggle,"emoji");return}const plusToggle=t.closest("[data-plus-toggle]");if(plusToggle){toggleChatPanel(plusToggle.dataset.plusToggle,"plus");return}const plusAct=t.closest("[data-plus-act]");if(plusAct){const prefix=plusAct.closest(".chat-input-row").dataset.prefix,act=plusAct.dataset.plusAct,target=chatTargetFromPrefix(prefix);if(closeChatPanels(prefix),act==="redpacket"){moneyDialog(target,"redpacket");return}if(act==="transfer"){moneyDialog(target,"transfer");return}if(act==="emoji"){toggleChatPanel(prefix,"emoji");return}if(act==="voice"){toggleVoice(prefix);return}return}const emojiInsert=t.closest("[data-emoji-insert]");if(emojiInsert){const row=emojiInsert.closest(".chat-input-row");insertAt(row.querySelector("textarea"),emojiInsert.dataset.emojiInsert),syncChatSendState(row.dataset.prefix);return}const emojiBack=t.closest("[data-emoji-backspace]");if(emojiBack){const row=emojiBack.closest(".chat-input-row"),ta=row.querySelector("textarea"),s=ta.selectionStart,e2=ta.selectionEnd;s===e2&&s>0?(ta.value=ta.value.slice(0,s-1)+ta.value.slice(e2),ta.selectionStart=ta.selectionEnd=s-1):s!==e2&&(ta.value=ta.value.slice(0,s)+ta.value.slice(e2),ta.selectionStart=ta.selectionEnd=s),ta.focus(),syncChatSendState(row.dataset.prefix);return}const timeEdit=t.closest("[data-timeedit]");if(timeEdit){editMessageTime(JSON.parse(timeEdit.dataset.timeedit));return}const moneyOpen=t.closest("[data-rpopen],[data-tfopen]");if(moneyOpen){const id=moneyOpen.dataset.rpopen||moneyOpen.dataset.tfopen,m=[...roomsOf().flatMap(r=>r.messages),...Object.values(DB.data.chats).flatMap(c=>c.messages),...((_h=DB.data.workgroup)==null?void 0:_h.messages)||[]].find(x=>x.id===id);m&&moneyDetailDialog(m,moneyOpen.dataset.rpopen?"redpacket":"transfer");return}const yjm=t.closest("[data-yj-method]");if(yjm){DB.data.yijing={method:yjm.dataset.yjMethod,throws:[]},DB.save(),router();return}if(t.closest("#yj-classic-search")){const q=(((_i=document.getElementById("yj-classic-query"))==null?void 0:_i.value)||"").trim(),box=document.getElementById("yj-classic-results");if(box){const rows=yjClassicSearch(q).slice(0,24);box.innerHTML=rows.length?`<div class="yj-classic-hitlist">${rows.map(x=>`<button class="yj-index-item" data-yj-classic-pick="${esc(x.name)}"><small>${String(x.no).padStart(2,"0")}</small><span>${esc(x.name)}</span></button>`).join("")}</div><div id="yj-classic-detail">${yjClassicMarkup(rows[0].name)}</div>`:"<p>没有找到匹配的卦名或已收录原文。</p>"}return}const classicPick=t.closest("[data-yj-classic-pick]");if(classicPick){const detail=document.getElementById("yj-classic-detail");detail&&(detail.innerHTML=yjClassicMarkup(classicPick.dataset.yjClassicPick));return}if(t.closest("#yj-classic-query")&&e.key==="Enter"){(_j=document.getElementById("yj-classic-search"))==null||_j.click();return}const yji=t.closest("[data-yj-index]");if(yji){const idx=Number(yji.dataset.yjIndex),nm=YJ_NAMES[idx],box=document.getElementById("yj-classic-results");box&&(box.innerHTML=`<div class="yj-classic-hitlist"><button class="yj-index-item" data-yj-classic-pick="${esc(nm)}"><small>${String(idx+1).padStart(2,"0")}</small><span>${esc(nm)}</span></button></div><div id="yj-classic-detail">${yjClassicMarkup(nm)}</div>`);const iq=document.getElementById("yj-classic-query");iq&&(iq.value=nm);const sec=box==null?void 0:box.closest(".yj-library");sec&&sec.scrollIntoView({behavior:"smooth",block:"start"});return}if(t.closest("#yj-reset")){DB.data.yijing={method:"liuyao",throws:[]},DB.save(),router();return}if(t.closest("#yj-throw")){const question=(((_k=$("#yj-question"))==null?void 0:_k.value)||"").trim(),rec=DB.data.yijing||{method:"liuyao",throws:[]};let throws=Array.isArray(rec.throws)?rec.throws.slice():[];throws.length>=6&&(throws=[]);let v=0;for(let k=0;k<3;k++)v+=Math.random()<.5?3:2;throws.push(v);const next={method:"liuyao",throws,question};if(throws.length===6){const bits=throws.map(x=>x===7||x===9?1:0),moving=throws.map((x,i)=>x===6||x===9?i:-1).filter(i=>i>=0),changedBits=bits.map((b,i)=>moving.includes(i)?1-b:b);next.hex=yjFind(bits),next.changed=yjFind(changedBits),next.moving=moving,yjPushHistory(next)}DB.data.yijing=next,DB.save(),router();return}if(t.closest("#yj-calc-meihua")){const question=(((_l=$("#yj-question"))==null?void 0:_l.value)||"").trim(),a=Math.max(1,Math.abs(parseInt((_m=$("#yj-a"))==null?void 0:_m.value,10)||1)),b=Math.max(1,Math.abs(parseInt((_n=$("#yj-b"))==null?void 0:_n.value,10)||1)),r=yjBuildMeihua(a,b);r.question=question,yjPushHistory(r),DB.data.yijing=r,DB.save(),router();return}if(t.closest("#yj-time-calc")){const question=(((_o=$("#yj-question"))==null?void 0:_o.value)||"").trim(),now=new Date,a=now.getFullYear()%8+(now.getMonth()+1)+now.getDate(),b=a+now.getHours()+now.getMinutes(),r=yjBuildMeihua(a,b);r.question=question,yjPushHistory(r),DB.data.yijing=r,DB.save(),router(),toast("已按当前时间起卦","ok");return}const histBtn=t.closest("[data-yj-hist]");if(histBtn){const h=(DB.data.yijingHistory||[])[Number(histBtn.dataset.yjHist)];h&&(DB.data.yijing={...h},DB.save(),router());return}if(t.closest("#tarot-draw")||t.closest("#tarot-reset")){const spread=((_p=document.querySelector('input[name="tarot-spread"]:checked'))==null?void 0:_p.value)||"single",question=(((_q=$("#tarot-q"))==null?void 0:_q.value)||"").trim(),n=TAROT_SPREADS[spread].n,deck=tarotShuffle(TAROT_DECK).slice(0,n);DB.data.tarot={spread,question,picks:deck,drawnAt:Date.now()},DB.save(),router();return}const spreadPick=t.closest("[data-spread]");if(spreadPick){document.querySelectorAll(".tarot-spread").forEach(el=>el.classList.remove("on")),spreadPick.classList.add("on");const radio=spreadPick.querySelector("input[type=radio]");radio&&(radio.checked=!0);return}if(t.closest("#huang-draw")||t.closest("#huang-redraw")){const btn=t.closest("#huang-draw")||t.closest("#huang-redraw");btn.disabled=!0,btn.textContent="求签中...";const overlay=document.createElement("div");overlay.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;color:#FFD700;font-size:48px;font-weight:bold",document.body.appendChild(overlay);let ticks=0;const timer=setInterval(()=>{overlay.textContent="第 "+(Math.floor(Math.random()*100)+1)+" 签",ticks++,ticks>=18&&(clearInterval(timer),overlay.remove(),huangDraw(),router())},55);return}if(t.closest("#div-draw")){const f=pick(FORTUNES),result={g:f.g,poem:f.poem,mean:f.mean,color:(FORTUNE_GRADES.find(x=>x.g===f.g)||{}).c||"#E8874A"};DB.data.divination={date:todayStr(),result},DB.save(),router();return}if(t.closest("#oa-task")){oaForm("task");return}if(t.closest("#oa-leave")){oaForm("leave");return}const oaTab=t.closest("[data-oatab]");if(oaTab){location.hash="#/oa?tab="+oaTab.dataset.oatab;return}const oaAp=t.closest("[data-oaap]");if(oaAp){const[st,id]=oaAp.dataset.oaap.split(":"),x=DB.data.oa.find(y=>y.id===id);if(x){if(x.status=st,x.reviewedAt=Date.now(),st==="rejected"){const note=prompt("驳回意见（可留空）","");note!==null&&(x.reviewNote=note)}else x.reviewNote="同意";DB.save(),router(),toast(st==="approved"?"已批准申请，申请人下次进入 OA 会看到提醒":"已驳回申请，申请人下次进入 OA 会看到提醒",st==="approved"?"ok":"warn")}return}const oaDel=t.closest("[data-oadel]");if(oaDel){DB.data.oa=DB.data.oa.filter(y=>y.id!==oaDel.dataset.oadel),DB.save(),router(),toast("已删除");return}if(t.closest("#wg-cards")){openWorkgroupCardManager();return}if(t.closest("#wg-members")){groupMembers(workgroupOf(),"工作组");return}if(t.closest("#wg-cfg-open")){openWgCfg();return}if(t.closest("#wg-speak")){groupSpeakPop(t.closest("#wg-speak"),workgroupOf(),"workgroup");return}const wgAv=t.closest("[data-wg-av]");if(wgAv){groupSpeak(workgroupOf(),wgAv.dataset.wgAv);return}if(t.closest("#wg-send")){const ta=$("#wg-text"),text=ta&&ta.value.trim();if(!text){toast("请输入内容","warn");return}if(!DB.user||DB.user.level<2){toast("工作组仅对员工和管理员开放","warn");return}workgroupOf().members.includes(DB.user.id)||workgroupOf().members.push(DB.user.id),commitOutgoingMessage({kind:"workgroup"},{id:genId("m"),uid:DB.user.id,type:"text",text,at:nowStr()}),ta.value="";return}const zoomBtn=t.closest("[data-net-zoom]");if(zoomBtn){const wrap=document.querySelector(".network-graph-wrap");if(wrap){const key=wrap.dataset.networkKey||"factions",cur=Math.max(.45,Math.min(1.6,Number((window._ndtNetworkZoom||{})[key])||1)),action=zoomBtn.dataset.netZoom;window._ndtNetworkZoom=window._ndtNetworkZoom||{},window._ndtNetworkZoom[key]=action==="reset"?1:Math.max(.45,Math.min(1.6,cur+(action==="in"?.1:-.1)));const before={left:wrap.scrollLeft,top:wrap.scrollTop};typeof window.drawNetworkGraph=="function"&&window.drawNetworkGraph(),requestAnimationFrame(()=>{wrap.scrollLeft=before.left,wrap.scrollTop=before.top})}return}if(t.closest("#net-add-node")){networkAddNode();return}if(t.closest("#net-add-edge")){networkAddEdge();return}const netEdit=t.closest("[data-net-nodeedit]");if(netEdit){networkEditNode(netEdit.dataset.netNodeedit);return}const netEdgeDel=t.closest("[data-net-edgedel]");if(netEdgeDel){const{net}=activeNetwork();net&&(net.edges=net.edges.filter(e2=>e2.id!==netEdgeDel.dataset.netEdgedel),DB.save(),router(),toast("连线已移除"));return}const netNodeDel=t.closest("[data-net-nodedel]");if(netNodeDel){const{net}=activeNetwork(),node=net&&net.nodes.find(n=>n.id===netNodeDel.dataset.netNodedel);net&&node&&(net.nodes=net.nodes.filter(n=>n.id!==node.id),net.edges=net.edges.filter(e2=>e2.from!==node.id&&e2.to!==node.id),DB.save(),router(),toast("节点与相关连线已移除"));return}const relOpen=t.closest("[data-relopen]");if(relOpen){location.hash="#/archive/"+relOpen.dataset.relopen;return}const relMove=t.closest("[data-relmove]");if(relMove){const r=DB.data.archives.find(x=>x.id===parseHash().seg[1]),idx=Number(relMove.dataset.relmove),rel=(_r=r==null?void 0:r.rels)==null?void 0:_r[idx];r&&rel&&(rel.layout=relMove.dataset.relDir,DB.save(),router(),toast("关系树排布已调整","ok"));return}const relEdit=t.closest("[data-reledit]");if(relEdit){const r=DB.data.archives.find(x=>x.id===parseHash().seg[1]);r&&editArchiveRelation(r,parseInt(relEdit.dataset.reledit,10));return}const relDel=t.closest("[data-reldel]");if(relDel){const r=DB.data.archives.find(x=>x.id===parseHash().seg[1]);if(r&&Array.isArray(r.rels)){const idx=parseInt(relDel.dataset.reldel,10),item=r.rels[idx];if(item&&item.linkedId)for(const a of DB.data.archives)Array.isArray(a.rels)&&(a.rels=a.rels.filter(x=>x.id!==item.linkedId));r.rels.splice(idx,1),DB.save(),router(),toast("关系已断开","ok")}return}if(t.closest("#rel-add-btn")){const r=DB.data.archives.find(x=>x.id===parseHash().seg[1]);r&&addRelation(r);return}if(t.closest("#quote-cancel")){window._quote=null,router();return}const bubble=t.closest("[data-msgctx]");if(bubble){if(window._longPressed){window._longPressed=!1;return}editMsg(JSON.parse(bubble.dataset.msgctx));return}if(t.closest("#set-act")){const r=Auth.activate($("#set-code").value);toast(r.msg,r.ok?"ok":"err"),r.ok&&($("#set-code").value="",router());return}if(t.closest("#set-export")){const blob=new Blob([JSON.stringify(DB.data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob),a.download="nadutong-data.json",a.click(),URL.revokeObjectURL(a.href),toast("数据已导出","ok");return}if(t.closest("#set-reset")){modal(`<h3>重置数据</h3><div class="m-body">将清空当前所有本地数据（帖子、账号、好友等）并恢复为初始内容，确定吗？</div>
      <div class="m-foot"><button class="btn btn-ghost btn-sm" data-m="no">取消</button><button class="btn btn-sm" data-m="yes">确定重置</button></div>`).then(v=>{v==="yes"&&(DB.reset(),router(),toast("数据已重置","ok"))});return}if(t.closest("#ab-save")){collectAbilityEdits(),DB.save(),toast("能力档案已保存","ok"),router();return}if(t.closest("#ab-cancel")){router(),toast("已放弃本次修改");return}if(t.closest("#ab-share")){collectAbilityEdits(),DB.save(),toast("正在生成分享图…"),buildAbilityShare(DB.user).then(dataUrl=>{modal(`<h3>能力档案分享图</h3><div class="m-body" style="text-align:center">
        <img src="${dataUrl}" style="width:100%;max-width:330px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.25)"></div>
        <div class="m-foot"><a class="btn btn-orange" id="ab-share-dl" download="异人能力档案.jpg">保存图片</a>
        <button class="btn btn-ghost btn-sm" data-m="no">关闭</button></div>`);const dl=$("#ab-share-dl");dl&&(dl.href=dataUrl)});return}if(t.closest("#ab-field-add")){collectAbilityEdits();const a=abilityOf(DB.user);a.fields.push("字段"+a.fields.length),a.rows.forEach(r=>r.v.push("")),DB.save(),router();return}const fieldDel=t.closest("[data-field-del]");if(fieldDel){const fi=+fieldDel.dataset.fieldDel;collectAbilityEdits();const a=abilityOf(DB.user);if(a.fields.length<=1){toast("至少保留一列","warn");return}a.fields.splice(fi,1),a.rows.forEach(r=>r.v.splice(fi,1)),DB.save(),router();return}if(t.closest("#ab-row-add")){collectAbilityEdits();const a=abilityOf(DB.user);a.rows.push({v:a.fields.map(()=>"")}),DB.save(),router();return}const rowDel=t.closest("[data-row-del]");if(rowDel){const ri=+rowDel.dataset.rowDel;collectAbilityEdits(),abilityOf(DB.user).rows.splice(ri,1),DB.save(),router();return}const tetrisBtn=t.closest("[data-tetris]");if(tetrisBtn){tetrisAction(tetrisBtn.dataset.tetris);return}if(t.closest("#lv-cfg-save")){const rule=pointsRule();for(const k of["post","reply","like","gamePerLine","gameCap"]){const el=document.getElementById("prg-"+k);el&&(rule[k]=Math.max(0,Number(el.value)||0))}const levels=forumLevels();$$("[data-lcfg-name]").forEach(el=>{const i=+el.dataset.lcfgName;levels[i].name=el.value.trim()||"Lv"+(i+1)}),$$("[data-lcfg-min]").forEach(el=>{const i=+el.dataset.lcfgMin;levels[i].min=Math.max(0,Number(el.value)||0)});for(let i=1;i<levels.length;i++)levels[i].min=Math.max(Number(levels[i-1].min)||0,Number(levels[i].min)||0);DB.save(),router(),toast("论坛等级配置已保存","ok");return}if(t.closest("#lv-cfg-reset")){DB.data.forumLevels=DEFAULT_FORUM_LEVELS.map(x=>({...x})),DB.data.pointsRule={...DEFAULT_POINTS_RULE},DB.save(),router(),toast("已恢复默认等级配置","ok");return}if(t.closest("#sp-lv-manage")){openSpaceLevelManage();return}if(t.closest("#spv-save")){const rule=pointsRule();$$("[data-spv-rule]").forEach(el=>{rule[el.dataset.spvRule]=Math.max(0,Number(el.value)||0)});const levels=forumLevels();$$("[data-spv-name]").forEach(el=>{const i=+el.dataset.spvName;levels[i].name=el.value.trim()||"Lv"+(i+1)}),$$("[data-spv-min]").forEach(el=>{const i=+el.dataset.spvMin;levels[i].min=Math.max(0,Number(el.value)||0)});for(let i=1;i<levels.length;i++)levels[i].min=Math.max(Number(levels[i-1].min)||0,Number(levels[i].min)||0);DB.save();const mask=t.closest(".modal-mask");mask&&mask._close("save"),router(),toast("论坛等级配置已保存","ok");return}if(t.closest("#spv-reset")){DB.data.forumLevels=DEFAULT_FORUM_LEVELS.map(x=>({...x})),DB.data.pointsRule={...DEFAULT_POINTS_RULE};const mask=t.closest(".modal-mask");mask&&mask._close("reset"),DB.save(),router(),toast("已恢复默认等级配置","ok");return}});function collectAbilityEdits(){const a=abilityOf(DB.user);return $$("[data-radar-label]").forEach(el=>{const i=+el.dataset.radarLabel;a.radar.labels[i]=el.value.trim()||"属性"+(i+1)}),$$("[data-radar-val]").forEach(el=>{const i=+el.dataset.radarVal;a.radar.values[i]=Math.max(0,Math.min(100,Number(el.value)||0))}),a.fields=$$("[data-field-name]").map(el=>el.value.trim()||"字段"),a.rows=$$(".ab-row").map(rowEl=>{const cells=[];for($$("[data-row-cell]",rowEl).forEach(el=>{const c=+el.dataset.rowCell.split("-")[1];cells[c]=el.value});cells.length<a.fields.length;)cells.push("");return{v:cells}}),a}document.addEventListener("input",e=>{const rv=e.target.closest("[data-radar-val]");if(rv){const i=+rv.dataset.radarVal,num=document.querySelector(`[data-radar-num="${i}"]`);if(num&&(num.textContent=rv.value),document.getElementById("ability-radar")){const a=abilityOf(DB.user);a.radar.values[i]=Number(rv.value),clearTimeout(window._abRadarLive),window._abRadarLive=setTimeout(()=>{document.getElementById("ability-radar")&&initAbilityRadar()},120)}}}),document.addEventListener("change",e=>{var _a,_b,_c;const t=e.target;if(t.id&&t.id.endsWith("-camera-file")&&(t.id=t.id.replace("-camera-file","-photo-file"),setTimeout(()=>{t.id=t.id.replace("-photo-file","-camera-file")},0)),t.id==="rm-speed"){activeRoom().speed=t.value,DB.save();return}if(t.id==="ch-speed"){chatOf(parseHash().seg[1]).speed=t.value,DB.save();return}const activityMap={rm:()=>activeRoom(),ch:()=>chatOf(parseHash().seg[1]),wg:()=>workgroupOf()};for(const prefix of["rm","ch","wg"]){if(t.id===prefix+"-activity"){const b=activityMap[prefix]();b.proactiveActivity=t.value,t.value==="custom"&&!(Number(b.proactiveInterval)>0)&&(b.proactiveInterval=120),DB.save();const sec=$("#"+prefix+"-activity-sec");sec&&(sec.style.display=t.value==="custom"?"inline-block":"none",sec.value=b.proactiveInterval||120);return}if(t.id===prefix+"-activity-sec"){const b=activityMap[prefix]();b.proactiveInterval=Math.max(30,Math.min(3600,Number(t.value)||120)),t.value=b.proactiveInterval,DB.save();return}}if(t.id==="rm-proactive"||t.id==="ch-proactive"||t.id==="wg-proactive"){const prefix=t.id.slice(0,2),b=activityMap[prefix],box=b();box.proactive=t.checked,t.checked&&(box.mode="card",box.proactiveLastTickAt=Date.now()-15e3,"Notification"in window&&Notification.permission==="default"&&Notification.requestPermission()),DB.save(),router(),t.checked&&(replyPeople(prefix==="ch"?{kind:"chat",key:parseHash().seg[1]}:prefix==="rm"?{kind:"room",roomId:activeRoom().id}:{kind:"workgroup"},box).filter(p=>{var _a2;return(_a2=p==null?void 0:p.cards)==null?void 0:_a2.length}).length?toast("主动行为已开启，将按所选频率随机发消息。","ok"):(toast("主动行为已开启，但对方还没有字卡；请先添加字卡。","warn"),setTimeout(()=>{if(prefix==="ch")cardManager(parseHash().seg[1]);else if(prefix==="rm"){const ids=activeRoom().members.filter(id=>id!==DB.user.id);ids[0]&&cardManager(ids[0])}else toast("请在工作组成员资料中添加字卡。","warn")},0)));return}if(t.id==="rm-read-no-reply"){activeRoom().readNoReply=t.checked,DB.save();return}if(t.id==="ch-read-no-reply"){chatOf(parseHash().seg[1]).readNoReply=t.checked,DB.save();return}if(t.id==="wg-read-no-reply"){workgroupOf().readNoReply=t.checked,DB.save();return}if(t.id==="set-sound"){DB.data.settings=DB.data.settings||{},DB.data.settings.soundOn=t.checked,DB.save(),t.checked&&playSendSound();return}if(t.id==="wg-speed"){workgroupOf().speed=t.value,DB.save();return}if(t.id==="wg-photo-file"&&t.files[0]){const file=t.files[0],userId=(_a=DB.user)==null?void 0:_a.id;t.value="",compressImage(file,720,data=>{if(!DB.user||DB.user.id!==userId){toast("账号状态已变化，照片未发送。","warn");return}commitOutgoingMessage({kind:"workgroup"},{id:genId("m"),uid:DB.user.id,type:"photo",text:"",photo:data,at:nowStr()})},err=>toast("图片读取失败，请换一张图片重试。","err"));return}if(t.id==="d-av-file"&&t.files[0]){compressAvatar(t.files[0],data=>{DB.user.avatar=data,DB.save(),router(),toast("头像已更新","ok")});return}if(t.id==="d-cover-file"&&t.files[0]){const file=t.files[0];compressImage(file,960,data=>{DB.user.coverImg=data,DB.save(),router(),toast("封面图已更新","ok")},()=>toast("封面图处理失败，请换一张图片。","err"));return}if(t.id==="ch-photo-file"&&t.files[0]){const{seg}=parseHash(),uid=seg[1],file=t.files[0],userId=(_b=DB.user)==null?void 0:_b.id;if(t.value="",!uid||!DB.data.users.some(u=>u.id===uid)){toast("当前私聊对象不存在，照片未发送。","warn");return}compressImage(file,720,data=>{if(!DB.user||DB.user.id!==userId||!DB.data.users.some(u=>u.id===uid)){toast("账号或聊天对象已变化，照片未发送。","warn");return}const msg={id:genId("m"),side:"me",type:"text",text:"",photo:data,at:nowStr()};commitOutgoingMessage({kind:"chat",key:uid,side:"them"},msg)},err=>toast("图片读取失败，请换一张图片重试。","err"));return}if(t.id==="rm-photo-file"&&t.files[0]){const room=activeRoom(),roomId=room.id,file=t.files[0],userId=(_c=DB.user)==null?void 0:_c.id;t.value="",compressImage(file,720,data=>{const targetRoom=roomsOf().find(r=>r.id===roomId);if(!DB.user||DB.user.id!==userId||!targetRoom){toast("账号或聊天室已变化，照片未发送。","warn");return}const msg={id:genId("m"),uid:DB.user.id,type:"photo",text:"",photo:data,at:nowStr()};commitOutgoingMessage({kind:"room",roomId},msg)},err=>toast("图片读取失败，请换一张图片重试。","err"));return}if((t.id==="a-img-file"||t.id==="ans-img-file")&&t.files[0]){const target=t.id==="a-img-file"?$("#a-body"):$("#ans-body");compressImage(t.files[0],720,data=>{insertAt(target,"[img]"+data+"[/img]"),toast("图片已插入","ok")}),t.value="";return}if(t.id==="set-import"&&t.files[0]){const r=new FileReader;r.onload=ev=>{try{const obj=JSON.parse(ev.target.result);if(!obj.users||!obj.posts)throw new Error("bad");DB.data=obj,DB.migrate(),DB.save(),router(),toast("数据导入成功","ok")}catch(err){toast("文件格式不正确","err")}},r.readAsText(t.files[0],"utf-8");return}}),document.addEventListener("keydown",e=>{if(!(e.isComposing||e.keyCode===229)&&(e.key==="Enter"&&e.target.id==="tb-code"&&$("#tb-go").click(),e.key==="Enter"&&e.target.id==="ar-q"&&$("#ar-go").click(),e.key==="Enter"&&e.target.id==="ch-text"&&!e.shiftKey&&(e.preventDefault(),$("#ch-send").click()),e.key==="Enter"&&e.target.id==="rm-text"&&!e.shiftKey&&(e.preventDefault(),$("#rm-send").click()),e.key==="Enter"&&e.target.id==="wg-text"&&!e.shiftKey&&(e.preventDefault(),$("#wg-send").click()),document.getElementById("tetris-canvas")&&!/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))){const map={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"rotate",ArrowDown:"down"," ":"drop"};map[e.key]&&(e.preventDefault(),tetrisAction(map[e.key])),(e.key==="p"||e.key==="P")&&tetrisAction("pause")}});let _lastWindowScroll=window.scrollY||0;const _lastInnerScroll=new WeakMap;let _topbarScrollTick=!1;function measureMobileChrome(){if(window.innerWidth>680)return;const portal=document.querySelector(".portal");if(!portal)return;const top=portal.querySelector(".portal-top"),nav=portal.querySelector(".nav-wrap");if(!top)return;const th=top.offsetHeight,nh=nav?nav.offsetHeight:0;portal.style.setProperty("--topbar-h",th+"px"),portal.style.setProperty("--nav-h",nh+"px"),portal.style.setProperty("--chrome-measured",th+nh+"px")}function afterRenderInit(){document.querySelectorAll(".chat-input-row").forEach(row=>syncChatSendState(row.dataset.prefix)),document.querySelector(".portal")?document.body.dataset.portalTheme=DB.data.theme||"default":delete document.body.dataset.portalTheme,measureMobileChrome(),document.getElementById("ability-radar")&&initAbilityRadar(),document.getElementById("tetris-canvas")&&initTetris()}function initAbilityRadar(){const canvas=document.getElementById("ability-radar");if(!canvas)return;const a=abilityOf(DB.user),cs=getComputedStyle(document.querySelector(".portal")),v=n=>cs.getPropertyValue(n).trim(),accent=v("--pt-accent")||"#2E47B8",text=v("--pt-text-soft")||"#3A456E",hl=v("--pt-highlight")||accent,hexToRgba=(hex,alpha)=>{let h=String(hex).replace("#","");h.length===3&&(h=h.split("").map(c=>c+c).join(""));const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return[r,g,b].some(Number.isNaN)?`rgba(46,71,184,${alpha})`:`rgba(${r},${g},${b},${alpha})`},redraw=()=>{const size=canvas.clientWidth||320;drawRadarChart(canvas,a.radar.labels,a.radar.values,{px:size,text,gridLine:hexToRgba(accent,.18),fill:hexToRgba(accent,.2),stroke:accent,point:hl,font:13,labelPad:28,centerFill:hexToRgba(accent,.04)})};redraw();let _rt;window.addEventListener("resize",()=>{clearTimeout(_rt),_rt=setTimeout(redraw,150)})}function _setTopbarHidden(hidden){const portal=document.querySelector(".portal");if(!portal)return;const top=portal.querySelector(".portal-top");top&&top.classList.contains("is-hidden")!==hidden&&(top.classList.toggle("is-hidden",hidden),portal.classList.toggle("is-top-hidden",hidden))}function updateMobileTopbar(e){if(window.innerWidth>680){_setTopbarHidden(!1);return}if(!document.querySelector(".portal"))return;if(document.querySelector(".mask,.modal,.rec-overlay,#portal-entry")){_setTopbarHidden(!1);return}const src=e&&e.target,inner=src&&src.closest&&src.closest(".chat-scroll,.post-list,.forum-list,.p-main");let st,last;if(inner&&inner!==document){st=inner.scrollTop;const prev=_lastInnerScroll.get(inner);last=prev===void 0?st:prev}else st=window.scrollY,last=_lastWindowScroll;const delta=st-last;if(inner?_lastInnerScroll.set(inner,st):_lastWindowScroll=st,st<56){_setTopbarHidden(!1);return}Math.abs(delta)>6&&(delta>0?_setTopbarHidden(!0):_setTopbarHidden(!1))}document.addEventListener("scroll",updateMobileTopbar,{passive:!0,capture:!0}),window.addEventListener("resize",()=>{measureMobileChrome(),window.innerWidth>680&&_setTopbarHidden(!1)}),document.addEventListener("input",e=>{const ta=e.target.closest&&e.target.closest(".chat-input-row textarea");if(ta){const row=ta.closest(".chat-input-row");syncChatSendState(row.dataset.prefix)}}),document.addEventListener("click",e=>{e.target.closest(".chat-input-row")||document.querySelectorAll(".chat-input-row").forEach(r=>closeChatPanels(r.dataset.prefix))},!0),window.addEventListener("hashchange",router);function hidePreloader(){const pl=document.getElementById("page-preloader");!pl||pl.classList.contains("is-done")||(pl.classList.add("is-done"),setTimeout(()=>{pl.remove()},700))}setTimeout(hidePreloader,4e3),document.addEventListener("submit",e=>{const f=e.target.closest&&e.target.closest("#forum-search-form");if(!f)return;e.preventDefault();const term=((f.querySelector("#forum-search-input")||{}).value||"").trim();location.hash=term?"#/search?q="+encodeURIComponent(term):"#/search"}),Store.open().then(async()=>{await DB.load(),Cloud.init();const pollCloudNotif=()=>{document.hidden||Cloud.pollNotifications().then(()=>syncUnreadBadges()).catch(()=>{})};window._pollCloudNotif=pollCloudNotif,setInterval(pollCloudNotif,3e4),document.addEventListener("visibilitychange",()=>{document.hidden||pollCloudNotif()}),window.addEventListener("focus",pollCloudNotif),setTimeout(pollCloudNotif,3e3),Cloud.refresh().then(()=>{pollCloudNotif(),Cloud.connected&&(initBadgeBaseline(),/^#\/(cloud|forum|forum-notices|essence|search|u\/|post\/)/.test(location.hash)&&router()),Cloud.connected&&webPushSupported()&&(async()=>{try{const sub=await getPushSubscription();sub&&await Cloud.pushSubscribe(sub.toJSON())}catch(e){}})()}).catch(()=>{}),"serviceWorker"in navigator&&window.isSecureContext&&(navigator.serviceWorker.register("./sw.js").catch(()=>{}),navigator.serviceWorker.addEventListener("message",event=>{event.data&&event.data.type==="NDT_NOTIFICATION_CLICK"&&event.data.url&&(location.hash=event.data.url,window.focus()),event.data&&event.data.type==="NDT_PUSH_RECEIVED"&&pollCloudNotif()})),location.hash?router():location.hash="#/",requestAnimationFrame(()=>requestAnimationFrame(hidePreloader)),window._appReady=!0,window._proactiveSchedulerStarted||(window._proactiveSchedulerStarted=!0,setInterval(runProactiveScheduler,15e3),setInterval(simulateForumGrowth,45e3),document.addEventListener("visibilitychange",()=>{simulateForumGrowth()}),document.addEventListener("visibilitychange",()=>{runProactiveScheduler(),syncDocumentTitle()}),window.addEventListener("focus",()=>{runProactiveScheduler(),syncDocumentTitle()}),window.addEventListener("pageshow",()=>{runProactiveScheduler(),syncDocumentTitle()}),window.addEventListener("hashchange",()=>setTimeout(runProactiveScheduler,2e3)))}).catch(()=>{try{location.hash?router():location.hash="#/"}catch(e){}hidePreloader()}),window.addEventListener("storage",e=>{var _a;if(!(e.key!==DB_KEY||!e.newValue))try{const incoming=JSON.parse(e.newValue),previous=DB.data||{},oldAnswerIds=new Set((previous.answers||[]).map(a=>a.id)),meId=(_a=DB.user)==null?void 0:_a.id;DB.data=incoming;const relevant=(incoming.answers||[]).filter(a=>!oldAnswerIds.has(a.id)).find(a=>{const p=(incoming.posts||[]).find(x=>x.id===a.postId);return p&&p.authorId===meId&&a.authorId!==meId});if(relevant){const p=incoming.posts.find(x=>x.id===relevant.postId);document.hidden?showSiteNotification("你的帖子有新回帖",`${relevant.authorName||"论坛成员"}：${String(relevant.content||"").slice(0,100)}`,"#/post/"+p.id,"ndt-forum-"+p.id):parseHash().seg[0]==="post"&&parseHash().seg[1]===p.id||toast(`你的帖子「${p.title}」有新回帖`,"ok")}syncUnreadBadges(),document.hidden||router()}catch(err){}}),function(){const zoomByKey=window._ndtNetworkZoom||(window._ndtNetworkZoom={}),getZoom=()=>{var _a;const key=((_a=document.querySelector(".network-graph-wrap"))==null?void 0:_a.dataset.networkKey)||"factions";return Math.max(.45,Math.min(1.6,Number(zoomByKey[key])||1))};function applyZoom(){const wrap=document.querySelector(".network-graph-wrap");if(!wrap)return;const key=wrap.dataset.networkKey||"factions",z=Math.max(.45,Math.min(1.6,Number(zoomByKey[key])||1));zoomByKey[key]=z;const svg=wrap.querySelector(".network-graph-svg"),grid=wrap.querySelector(".network-graph-nodes");svg&&(svg.style.zoom=String(z)),grid&&(grid.style.zoom=String(z));const label=document.querySelector(".network-zoom-tools .zoom-reset");label&&(label.textContent=Math.round(z*100)+"%")}const pos=(obj,i,total,centerY=260,el=null)=>{if(el&&Number.isFinite(parseFloat(el.dataset.cx))&&Number.isFinite(parseFloat(el.dataset.cy)))return{x:parseFloat(el.dataset.cx),y:parseFloat(el.dataset.cy)};if(Number.isFinite(obj.x)&&Number.isFinite(obj.y))return{x:obj.x,y:obj.y};const angle=-Math.PI/2+Math.PI*2*i/Math.max(1,total);return{x:Math.max(24,Math.min(1440,760+Math.cos(angle)*Math.min(520,180+total*20))),y:Math.max(90,Math.min(940,centerY+Math.sin(angle)*Math.min(330,130+total*15)))}};function color(label){let h=0;for(const ch of String(label||"关联"))h=h*31+ch.charCodeAt(0)|0;const p=["#D66A3A","#2878B8","#8B5FC7","#16856D","#C04D78","#A47716","#3F70A8","#B34F35"];return p[Math.abs(h)%p.length]}function makeMarkers(){return'<defs><marker id="net-arrow-one" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill="context-stroke"/></marker><marker id="net-arrow-both" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill="context-stroke"/></marker><marker id="net-arrow-both-start" markerWidth="10" markerHeight="10" refX="2" refY="5" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill="context-stroke"/></marker></defs>'}function drawStaff(){const wrap=document.querySelector(".network-graph-wrap");if(!wrap)return;activateCanvas(wrap,"staff");const svg=wrap.querySelector(".network-graph-svg"),grid=wrap.querySelector(".network-graph-nodes");if(!svg||!grid)return;const{net}=activeNetwork();if(!net)return;svg.setAttribute("viewBox","0 0 1600 1050"),svg.setAttribute("width",1600),svg.setAttribute("height",1050);const els=[...grid.querySelectorAll("[data-net-visual]")],paths=[];(net.nodes||[]).forEach((n,i)=>{const el=els.find(e=>e.dataset.netVisual===n.id);if(!el)return;const q=pos(n,i,net.nodes.length,260,el);el.style.left=q.x+"px",el.style.top=q.y+"px",el.dataset.cx=q.x,el.dataset.cy=q.y}),(net.edges||[]).forEach(e=>{const a=els.find(x=>x.dataset.netVisual===e.from),b=els.find(x=>x.dataset.netVisual===e.to);if(!a||!b)return;const ax=+a.dataset.cx+66,ay=+a.dataset.cy+34,bx=+b.dataset.cx+66,by=+b.dataset.cy+34,dx=bx-ax,dy=by-ay,len=Math.max(1,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len,sx=ax+ux*68,sy=ay+uy*34,ex=bx-ux*68,ey=by-uy*34,curve=Math.max(28,Math.min(100,Math.abs(dx)*.12)),d=`M${sx},${sy} C${sx+dx*.32},${sy+dy*.32-curve} ${ex-dx*.32},${ey-dy*.32-curve} ${ex},${ey}`,c=color(e.label),both=e.dir==="both";paths.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round" marker-end="url(#net-arrow-one)" ${both?'marker-start="url(#net-arrow-both-start)"':""}/>`);const mx=(ax+bx)/2,my=(ay+by)/2-curve*.5;e.label&&paths.push(`<text x="${mx}" y="${my}" text-anchor="middle" fill="${c}" stroke="var(--pt-bg)" stroke-width="5" paint-order="stroke" font-size="12" font-weight="700">${esc(e.label.slice(0,24))}</text>`)}),svg.innerHTML=makeMarkers()+paths.join(""),applyZoom()}function drawArchive(){const wrap=document.querySelector(".rel-network-wrap");if(!wrap)return;const svg=wrap.querySelector(".rel-network-svg"),center=wrap.querySelector("[data-rel-center]"),grid=wrap.querySelector(".rel-network-nodes");if(!svg||!center||!grid)return;const r=DB.data.archives.find(x=>x.id===parseHash().seg[1]);if(!r)return;const nodes=[...grid.querySelectorAll(".rel-network-node")],rels=r.rels||[],groups={up:[],down:[],left:[],right:[]};rels.forEach((rel,i)=>{const el=nodes.find(n=>+n.dataset.relIndex===i);if(!el)return;const label=String(rel.rel||"");let side=rel.layout;["up","down","left","right"].includes(side)||(/(师傅|师父|师尊|老师|师长|师承|师叔|师伯|师祖|长辈|前辈|师兄|师姐)/.test(label)?side="up":/(徒弟|弟子|门生|学生|徒孙|后辈|晚辈)/.test(label)?side="down":side=groups.left.length<=groups.right.length?"left":"right",rel.layout=side),groups[side].push({rel,el,i})});const W2=Math.max(1600,Math.ceil(wrap.clientWidth/1600)*1600),H2=1100,CX=W2/2,CY=500,NW=128,NH=120;grid.style.width=W2+"px",grid.style.height=H2+"px",grid.style.minHeight=H2+"px",svg.setAttribute("viewBox",`0 0 ${W2} ${H2}`),svg.setAttribute("width",W2),svg.setAttribute("height",H2),center.style.left=CX+"px",center.style.top=CY+"px",center.style.transform="translate(-50%,-50%)";const place=(arr,side)=>arr.forEach((o,j)=>{const col=j%7,row=Math.floor(j/7),gapX=NW+28,gapY=NH+24;let x,y;side==="up"?(x=CX-NW/2+(col-(Math.min(arr.length,7)-1)/2)*gapX,y=CY-245-row*gapY):side==="down"?(x=CX-NW/2+(col-(Math.min(arr.length,7)-1)/2)*gapX,y=CY+145+row*gapY):side==="left"?(x=CX-250-row*gapX,y=CY-NH/2+(col-(Math.min(arr.length,7)-1)/2)*gapY):(x=CX+122+row*gapX,y=CY-NH/2+(col-(Math.min(arr.length,7)-1)/2)*gapY),x=Math.max(16,x),y=Math.max(16,y),o.el.style.left=x+"px",o.el.style.top=y+"px",o.el.dataset.cx=x,o.el.dataset.cy=y});["up","down","left","right"].forEach(side=>place(groups[side],side));const paths=[];nodes.forEach(el=>{const i=+el.dataset.relIndex,rel=rels[i];if(!rel)return;const x=+el.dataset.cx,y=+el.dataset.cy,bx=x+NW/2,by=y+Math.min(NH,el.offsetHeight)/2;let sx=CX,sy=CY,ex=bx,ey=by;const side=el.dataset.relLayout||rel.layout;side==="up"?(sy=CY-34,ey=y+Math.min(NH,el.offsetHeight)):side==="down"?(sy=CY+34,ey=y):side==="left"?(sx=CX-75,ex=x+NW):(sx=CX+75,ex=x);const c=color(rel.rel),both=rel.dir==="both";let d;if(side==="up"||side==="down"){const mid=(sy+ey)/2;d=`M${sx},${sy} C${sx},${mid} ${ex},${mid} ${ex},${ey}`}else{const mid=(sx+ex)/2;d=`M${sx},${sy} C${mid},${sy} ${mid},${ey} ${ex},${ey}`}paths.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" marker-end="url(#archive-arrow-end)" ${both?'marker-start="url(#archive-arrow-start)"':""}/>`)}),svg.innerHTML='<defs><marker id="archive-arrow-end" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill="context-stroke"/></marker><marker id="archive-arrow-start" markerWidth="10" markerHeight="10" refX="2" refY="5" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill="context-stroke"/></marker></defs>'+paths.join("")}window.drawNetworkGraph=drawStaff,window.drawArchiveRelationGraph=drawArchive;function activateCanvas(wrap,type){if(!wrap||wrap.dataset.freeCanvasReady)return;wrap.dataset.freeCanvasReady="1";let drag=null,pressTimer2=null,pressOrigin=null,pendingPointer=null;wrap.addEventListener("pointerdown",e=>{const card=e.target.closest(type==="staff"?"[data-net-visual]":".rel-network-node");!card||e.target.closest("button")||e.button>0||(clearTimeout(pressTimer2),pressOrigin={x:e.clientX,y:e.clientY,card},pendingPointer=e.pointerId,pressTimer2=setTimeout(()=>{if(!pressOrigin||pendingPointer!==e.pointerId)return;const nodeId=type==="staff"?card.dataset.netVisual:Number(card.dataset.relIndex);drag={card,nodeId,startX:pressOrigin.x,startY:pressOrigin.y,left:parseFloat(card.style.left)||0,top:parseFloat(card.style.top)||0,moved:!1,pointerId:e.pointerId},card.classList.add("dragging"),wrap.classList.add("node-drag-active");try{wrap.setPointerCapture(e.pointerId)}catch(_){}},420))}),wrap.addEventListener("pointermove",e=>{var _a,_b;if(!drag){pressOrigin&&pendingPointer===e.pointerId&&(Math.abs(e.clientX-pressOrigin.x)>9||Math.abs(e.clientY-pressOrigin.y)>9)&&(clearTimeout(pressTimer2),pressTimer2=null,pressOrigin=null,pendingPointer=null);return}if(drag.pointerId!==e.pointerId)return;const scale=Math.max(.45,Math.min(1.6,Number(zoomByKey[wrap.dataset.networkKey]||1))),dx=(e.clientX-drag.startX)/scale,dy=(e.clientY-drag.startY)/scale;if(Math.abs(dx)+Math.abs(dy)>2&&(drag.moved=!0),drag.card.style.left=Math.max(0,drag.left+dx)+"px",drag.card.style.top=Math.max(0,drag.top+dy)+"px",drag.card.dataset.cx=parseFloat(drag.card.style.left),drag.card.dataset.cy=parseFloat(drag.card.style.top),type==="staff"){const live=(_a=activeNetwork().net)==null?void 0:_a.nodes.find(n=>n.id===drag.nodeId);live&&(live.x=drag.card.dataset.cx,live.y=drag.card.dataset.cy),drawStaff()}else{const rr=DB.data.archives.find(x=>x.id===parseHash().seg[1]),live=(_b=rr==null?void 0:rr.rels)==null?void 0:_b[drag.nodeId];live&&(live.x=drag.card.dataset.cx,live.y=drag.card.dataset.cy),drawArchive()}});const end=()=>{var _a;if(clearTimeout(pressTimer2),pressTimer2=null,pressOrigin=null,pendingPointer=null,!drag)return;const d=drag;if(drag=null,d.card.classList.remove("dragging"),wrap.classList.remove("node-drag-active"),!d.moved)return;const x=parseFloat(d.card.style.left)||0,y=parseFloat(d.card.style.top)||0;if(type==="staff"){const{net}=activeNetwork(),n=net==null?void 0:net.nodes.find(n2=>n2.id===d.nodeId);n&&(n.x=x,n.y=y,DB.save())}else{const r=DB.data.archives.find(x2=>x2.id===parseHash().seg[1]),rel=(_a=r==null?void 0:r.rels)==null?void 0:_a[d.nodeId];rel&&(rel.x=x,rel.y=y,DB.save())}};wrap.addEventListener("pointerup",end),wrap.addEventListener("pointercancel",end)}window.addEventListener("resize",()=>{drawStaff(),drawArchive()})}(),document.addEventListener("keydown",e=>{var _a,_b;((_a=e.target)==null?void 0:_a.id)==="yj-classic-query"&&e.key==="Enter"&&(e.preventDefault(),(_b=document.getElementById("yj-classic-search"))==null||_b.click())}),function(){var watching=!1;function init(){var box=document.getElementById("invite-box");if(!box){if(!watching&&document.body){watching=!0;var mo=new MutationObserver(function(){document.getElementById("invite-box")&&(mo.disconnect(),watching=!1,init())});mo.observe(document.body,{childList:!0,subtree:!0})}return}var observer=new MutationObserver(function(){var existingBtn=document.getElementById("invite-share-btn");if(!existingBtn){var codeEl=box.querySelector("code");if(codeEl){var btn=document.createElement("button");btn.type="button",btn.id="invite-share-btn",btn.className="btn btn-sm btn-orange",btn.style.borderRadius="20px",btn.textContent="🎴 生成分享卡片",box.insertBefore(btn,box.children[1]||null),btn.onclick=function(){var code=codeEl.textContent.trim(),count=box.querySelector("b")?box.querySelector("b").textContent:"0";showShareModal(code,count)}}}});observer.observe(box,{childList:!0,subtree:!0})}function showShareModal(code,count){var themes=null,themeKey="default";try{themes=typeof SHARE_THEMES!="undefined"?SHARE_THEMES:null}catch(e){themes=null}try{themeKey=typeof DB!="undefined"&&DB.data&&DB.data.theme||"default"}catch(e){themeKey="default"}var T=themes&&(themes[themeKey]||themes.default)||null;T||(T={bg1:"#16225C",bg2:"#0A1238",card:"rgba(255,255,255,.06)",cardBorder:"rgba(160,180,255,.18)",avatarBg:"#6D8CFF",text:"#F3F6FF",sub:"#A9B8E8",accent:"#E8874A"});var W=750,M=40,cardW=W-M*2,headH=120,codeH=180,footH=80,gap=20,H=M+headH+gap+codeH+gap+footH+M,canvas=document.createElement("canvas");canvas.width=W,canvas.height=H;var ctx=canvas.getContext("2d"),grad=ctx.createLinearGradient(0,0,W*.4,H);grad.addColorStop(0,T.bg1),grad.addColorStop(1,T.bg2),ctx.fillStyle=grad,ctx.fillRect(0,0,W,H);var y=M;roundRect2(ctx,M,y,cardW,headH,22),ctx.fillStyle=T.card,ctx.fill(),ctx.strokeStyle=T.cardBorder,ctx.lineWidth=1,ctx.stroke(),ctx.textAlign="left",ctx.textBaseline="middle",ctx.fillStyle=T.text,ctx.font='900 30px "Microsoft YaHei",sans-serif',ctx.fillText("🎯 好友邀请",M+26,y+40),ctx.fillStyle=T.sub,ctx.font='15px "Microsoft YaHei",sans-serif',ctx.fillText("注册时填写邀请码，双方各得 100 积分",M+26,y+78);var cntTxt="已邀请 "+count+" 人";ctx.font='700 18px "Microsoft YaHei",sans-serif';var bw=ctx.measureText(cntTxt).width+32;roundRect2(ctx,W-M-26-bw,y+headH/2-20,bw,40,20),ctx.fillStyle=T.avatarBg,ctx.fill(),ctx.fillStyle="#fff",ctx.textAlign="center",ctx.fillText(cntTxt,W-M-26-bw/2,y+headH/2+1),y+=headH+gap,roundRect2(ctx,M,y,cardW,codeH,22),ctx.fillStyle=T.card,ctx.fill(),ctx.strokeStyle=T.cardBorder,ctx.stroke(),ctx.fillStyle=T.accent,roundRect2(ctx,M+26,y+12,5,22,3),ctx.fill(),ctx.fillStyle=T.text,ctx.textAlign="left",ctx.font='800 20px "Microsoft YaHei",sans-serif',ctx.fillText("我的专属邀请码",M+41,y+23),ctx.textAlign="center",ctx.fillStyle=T.accent,ctx.font='900 52px "Microsoft YaHei",monospace',ctx.fillText(code,W/2,y+110),ctx.fillStyle=T.sub,ctx.font='14px "Microsoft YaHei",sans-serif',ctx.fillText("复制以上邀请码，注册时填入即可",W/2,y+155),y+=codeH+gap,ctx.textAlign="center",ctx.fillStyle=T.sub,ctx.font='14px "Microsoft YaHei",sans-serif',ctx.fillText("哪都通 · 异人论坛",W/2,y+20),ctx.fillStyle=T.text,ctx.font='700 18px "Microsoft YaHei",sans-serif',ctx.fillText(location.origin,W/2,y+52);var dataUrl=canvas.toDataURL("image/jpeg",.92),mask=document.createElement("div");mask.className="modal-mask",mask.innerHTML='<div class="modal"><h3>邀请分享卡片</h3><div class="m-body" style="text-align:center"><img src="'+dataUrl+`" style="max-width:100%;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.2)"></div><div class="m-foot"><a class="btn btn-orange" id="invite-card-dl" download="邀请卡片.jpg">保存图片</a><button class="btn btn-ghost btn-sm" onclick="this.closest('.modal-mask').remove()">关闭</button></div></div>`,document.body.appendChild(mask),mask.addEventListener("click",function(e){e.target===mask&&mask.remove()});var dl=document.getElementById("invite-card-dl");dl&&(dl.href=dataUrl)}function roundRect2(ctx,x,y,w,h,r){ctx.beginPath(),ctx.moveTo(x+r,y),ctx.arcTo(x+w,y,x+w,y+h,r),ctx.arcTo(x+w,y+h,x,y+h,r),ctx.arcTo(x,y+h,x,y,r),ctx.arcTo(x,y,x+w,y,r),ctx.closePath()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init()}(),function(){"use strict";if(window.__uiPolishLoaded)return;window.__uiPolishLoaded=!0;var reduce=!1;try{reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}var last=new Map,ANIM="data-num-anim";function toNum(txt){var s=String(txt==null?"":txt).replace(/[^\d-]/g,"");if(!s||s==="-")return null;var n=parseInt(s,10);return isNaN(n)?null:n}function keyOf(el){if(el.classList.contains("vote-count")){var box=el.parentElement,holder=box?box.querySelector("[data-vote]")||box.querySelector("[data-avote]"):null,id=holder?holder.getAttribute("data-vote")||holder.getAttribute("data-avote"):null;return id?"vote:"+id:null}if(el.closest(".cs")){var lab=el.closest(".cs").querySelector("span");return lab&&lab.textContent.indexOf("积分")>=0?"pts:account":null}return el.classList.contains("slc-points")?"pts:space":null}function pop(el){el.classList.remove("num-pop"),el.offsetWidth,el.classList.add("num-pop"),setTimeout(function(){el.classList.remove("num-pop")},460)}function tween(el,from,to){if(reduce||from===to){el.textContent=String(to);return}var span=Math.abs(to-from),dur=Math.max(320,Math.min(900,240+span*45));el.setAttribute(ANIM,"1");var t0=0;function frame(t){t0||(t0=t);var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=String(Math.round(from+(to-from)*e)),k<1?requestAnimationFrame(frame):(el.textContent=String(to),el.removeAttribute(ANIM),pop(el))}requestAnimationFrame(frame)}function scan(scope){for(var nodes=scope.querySelectorAll(".vote-count, .cs b, .slc-points"),i=0;i<nodes.length;i++){var el=nodes[i];if(!el.hasAttribute(ANIM)&&!el.children.length){var key=keyOf(el);if(key){var val=toNum(el.textContent);if(val!==null){if(!last.has(key)){last.set(key,val);continue}var prev=last.get(key);prev!==val&&(last.set(key,val),tween(el,prev,val))}}}}}var app=null,pending=!1;function schedule(){pending||(pending=!0,requestAnimationFrame(function(){pending=!1,app=app&&app.isConnected?app:document.getElementById("app"),app&&scan(app)}))}function start(){var boot=document.getElementById("app");boot&&scan(boot);var ob=new MutationObserver(schedule);ob.observe(document.body,{childList:!0,subtree:!0,characterData:!0})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start()}(),function(){if(window.__divinationPolishLoaded)return;window.__divinationPolishLoaded=!0;var MOVING={6:!0,9:!0},VAL_TEXT={6:"老阴·动",7:"少阳",8:"少阴",9:"老阳·动"},POS_NAME=["初爻","二爻","三爻","四爻","五爻","上爻"];function isYang(v){return v===7||v===9}function buildYjSlots(){var box=document.getElementById("yj-throws");if(box){for(var chips=box.querySelectorAll(".yj-throw"),vals=[],i=0;i<chips.length;i++){var m=(chips[i].textContent||"").match(/[：:]\s*(\d)/);m&&vals.push(parseInt(m[1],10))}var host=box.parentNode.querySelector(".dj-slots");host||(host=document.createElement("div"),host.className="dj-slots",host.setAttribute("aria-label","六爻爻位"),box.parentNode.insertBefore(host,box));var sig=vals.join(",");if(host.dataset.sig!==sig){host.dataset.sig=sig;for(var html="",k=0;k<6;k++){var v=vals[k],filled=typeof v=="number",cls="dj-slot";filled&&(cls+=" on",MOVING[v]&&(cls+=" moving"),k===vals.length-1&&(cls+=" dj-new"));var yang=filled?isYang(v):!0,bars=filled?yang?"<i></i>":"<i></i><i></i>":'<i class="dj-bar-empty"></i>',glyphCls=filled&&!yang?"dj-glyph dj-yin":"dj-glyph";html+='<div class="'+cls+'"><span class="dj-idx">'+POS_NAME[k]+'</span><span class="'+glyphCls+'">'+bars+'</span><span class="dj-val">'+(filled?VAL_TEXT[v]:"待投")+"</span></div>"}host.innerHTML=html,(vals.length||chips.length===0)&&box.classList.add("dj-src-off")}}}function buildTarot(){var board=document.querySelector(".tarot-board");if(board){var cards=board.querySelectorAll(".tarot-card");if(cards.length){for(var i=0;i<cards.length;i++){var inner=cards[i].querySelector(".tc-inner");if(inner&&!inner.querySelector(".tc-back")){var back=document.createElement("div");back.className="tc-back",back.setAttribute("aria-hidden","true"),inner.appendChild(back)}}for(var parts=[],j=0;j<cards.length;j++){var h4=cards[j].querySelector(".tc-face h4");parts.push((h4?h4.textContent:"")+(cards[j].classList.contains("rev")?"|r":"|u"))}var sig=parts.join(",");try{sig&&sig!==sessionStorage.getItem("dj-tarot-sig")&&(sessionStorage.setItem("dj-tarot-sig",sig),board.classList.add("dj-flip"))}catch(e){board.classList.add("dj-flip")}}}}function huangRitual(){var res=document.querySelector(".huang-result");if(!(!res||res.dataset.djDone==="1")){var numEl=res.querySelector(".huang-num"),poemEl=res.querySelector(".huang-poem"),sig=(numEl?numEl.textContent:"")+"|"+(poemEl?(poemEl.textContent||"").slice(0,12):"");res.dataset.djDone="1";var seen="";try{seen=sessionStorage.getItem("dj-huang-sig")||""}catch(e){}if(sig!==seen){try{sessionStorage.setItem("dj-huang-sig",sig)}catch(e){}var veil=document.createElement("div");veil.className="dj-veil",veil.setAttribute("aria-hidden","true"),veil.innerHTML='<div class="dj-tube"><span class="dj-sticks"><i></i><i></i><i></i><i></i><i></i></span><span class="dj-body"></span><b class="dj-one"></b></div>',res.appendChild(veil),setTimeout(function(){veil&&veil.parentNode&&veil.parentNode.removeChild(veil)},1350)}}}var scheduled=!1;function run(){scheduled=!1;try{buildYjSlots()}catch(e){}try{buildTarot()}catch(e){}try{huangRitual()}catch(e){}}function schedule(){scheduled||(scheduled=!0,window.requestAnimationFrame?requestAnimationFrame(run):setTimeout(run,16))}function boot(){var app=document.getElementById("app")||document.body;app&&(new MutationObserver(schedule).observe(app,{childList:!0,subtree:!0}),schedule())}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot):boot()}(),function(){"use strict";if(!window.matchMedia)return;var MQ=window.matchMedia("(max-width: 680px)");function isMobile(){return MQ.matches}var lockY=0,locked=!1;function lockScroll(){if(!(locked||!isMobile())){lockY=window.scrollY||window.pageYOffset||0;var b=document.body;b.style.position="fixed",b.style.top=-lockY+"px",b.style.left="0",b.style.right="0",b.style.width="100%",locked=!0}}function unlockScroll(){if(locked){var b=document.body;b.style.position="",b.style.top="",b.style.left="",b.style.right="",b.style.width="",window.scrollTo(0,lockY),locked=!1}}function watchMask(){var hasMask=!!document.querySelector(".modal-mask");hasMask?lockScroll():unlockScroll()}try{var mo=new MutationObserver(function(){mo._t||(mo._t=setTimeout(function(){mo._t=0,watchMask()},60))});mo.observe(document.body,{childList:!0,subtree:!0})}catch(e){}var lastTap=0;document.addEventListener("click",function(e){if(isMobile()){var top=e.target&&e.target.closest?e.target.closest(".portal-top, .topbar"):null;if(top&&!e.target.closest(".p-logo, .user-chip, a, button, input, .side-item")){var now=Date.now();if(now-lastTap<340){lastTap=0;try{window.scrollTo({top:0,behavior:"smooth"})}catch(err){window.scrollTo(0,0)}}else lastTap=now}}},!0);var vv=window.visualViewport;function ensureVisible(el){if(!(!el||!vv)){var r=el.getBoundingClientRect(),visibleBottom=vv.height+vv.offsetTop-12;if(!(r.bottom<=visibleBottom&&r.top>=vv.offsetTop))try{el.scrollIntoView({block:"center",behavior:"smooth"})}catch(e){el.scrollIntoView()}}}document.addEventListener("focusin",function(e){if(isMobile()){var t=e.target;!t||!t.tagName||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)&&setTimeout(function(){ensureVisible(t)},280)}});function centerActiveNav(){if(isMobile()){var nav=document.querySelector(".nav");if(nav){var on=nav.querySelector("a.on");if(on)try{on.scrollIntoView({inline:"center",block:"nearest",behavior:"smooth"})}catch(e){}}}}function updateFade(nav){if(nav){var max=nav.scrollWidth-nav.clientWidth;if(max<=4){nav.removeAttribute("data-mpf");return}var x=nav.scrollLeft,flags=[];x>=3&&flags.push("l"),x<=max-3&&flags.push("r"),flags.length?nav.setAttribute("data-mpf",flags.join(" ")):nav.removeAttribute("data-mpf")}}function refreshAllFades(){for(var list=document.querySelectorAll(".nav"),i=0;i<list.length;i++)updateFade(list[i])}function bindNavFade(){for(var list=document.querySelectorAll(".nav"),i=0;i<list.length;i++){var nav=list[i];nav.__mpBound||(nav.__mpBound=!0,nav.addEventListener("scroll",function(e){updateFade(e.currentTarget)},{passive:!0}))}refreshAllFades()}window.addEventListener("hashchange",function(){setTimeout(centerActiveNav,260)}),window.addEventListener("resize",refreshAllFades),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",function(){setTimeout(function(){centerActiveNav(),bindNavFade()},400)}):setTimeout(function(){centerActiveNav(),bindNavFade()},400);try{var navMo=new MutationObserver(function(){navMo._t||(navMo._t=setTimeout(function(){navMo._t=0,bindNavFade()},60))});navMo.observe(document.body,{childList:!0,subtree:!0})}catch(e){}}(),function(){"use strict";var MOBILE=window.matchMedia?window.matchMedia("(max-width: 680px)"):null;function isMobile(){return!!(MOBILE&&MOBILE.matches)}var viewer=null,viewerImg=null,bodyOvPrev=null,opened=!1;function buildViewer(){if(viewer)return viewer;viewer=document.createElement("div"),viewer.id="ndp-viewer",viewer.style.display="none";var img=document.createElement("img");img.className="ndp-img",img.alt="";var hint=document.createElement("div");hint.className="ndp-hint",hint.textContent=isMobile()?"双击放大 · 下滑关闭 · 点空白处关闭":"点击放 / 再点还原 · 点空白处关闭",viewer.appendChild(img),viewer.appendChild(hint),document.body.appendChild(viewer),viewerImg=img,viewer.addEventListener("click",function(e){e.target===viewerImg?viewerImg.classList.toggle("zoomed"):closeViewer()});var sy=0,dy=0,tracking=!1;return viewer.addEventListener("touchstart",function(e){!e.touches||e.touches.length!==1||(sy=e.touches[0].clientY,dy=0,tracking=!0)},{passive:!0}),viewer.addEventListener("touchmove",function(e){!tracking||!e.touches||e.touches.length!==1||(dy=e.touches[0].clientY-sy,dy>0&&(viewerImg.style.transform="translateY("+Math.min(dy,160)+"px) scale(.98)"))},{passive:!0}),viewer.addEventListener("touchend",function(){if(tracking){if(tracking=!1,dy>90){closeViewer();return}viewerImg.style.transform=""}}),viewer}function openViewer(src){src&&(buildViewer(),viewerImg.classList.remove("zoomed"),viewerImg.style.transform="",viewerImg.src=src,bodyOvPrev=document.body.style.overflow,document.body.style.overflow="hidden",viewer.style.display="flex",requestAnimationFrame(function(){viewer.classList.add("on")}),opened=!0)}function closeViewer(){!viewer||!opened||(opened=!1,viewer.classList.remove("on"),viewerImg.classList.remove("zoomed"),viewerImg.style.transform="",setTimeout(function(){opened||(viewer.style.display="none"),document.body.style.overflow=bodyOvPrev||"",viewerImg.src=""},180))}document.addEventListener("click",function(e){var t=e.target;!t||!t.tagName||t.tagName!=="IMG"||!t.classList.contains("inline-img")&&!t.classList.contains("msg-photo")||e.target.closest("#ndp-viewer")||(e.preventDefault(),e.stopPropagation(),openViewer(t.currentSrc||t.src))},!0),document.addEventListener("keydown",function(e){e.key==="Escape"&&opened&&(e.preventDefault(),closeViewer())});var topBtn=null,topShown=!1;function ensureTopBtn(){return topBtn||(topBtn=document.createElement("button"),topBtn.id="ndp-top",topBtn.type="button",topBtn.setAttribute("aria-label","回到顶部"),topBtn.innerHTML="↑",topBtn.addEventListener("click",function(){try{window.scrollTo({top:0,behavior:"smooth"})}catch(e){window.scrollTo(0,0)}}),document.body.appendChild(topBtn),topBtn)}function syncTopBtn(){if(!isMobile()){topBtn&&topBtn.classList.remove("on"),topShown=!1;return}var y=window.scrollY||window.pageYOffset||0,should=y>520;if(should!==topShown){topShown=should;var btn=ensureTopBtn();btn.classList.toggle("on",should),btn.classList.toggle("lift",!!document.querySelector(".wx-input-wrap, .chat-input-row"))}}var topTick=!1;window.addEventListener("scroll",function(){topTick||(topTick=!0,setTimeout(function(){topTick=!1,syncTopBtn()},120))},{passive:!0}),window.addEventListener("resize",syncTopBtn);function fitModals(){if(isMobile())for(var list=document.querySelectorAll(".modal:not(.ndp-full)"),i=0;i<list.length;i++){var m=list[i];m.scrollHeight>window.innerHeight*.78&&m.classList.add("ndp-full")}}try{var mo=new MutationObserver(function(){mo._t||(mo._t=setTimeout(function(){mo._t=0,fitModals()},80))});mo.observe(document.body,{childList:!0,subtree:!0})}catch(e){}document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!opened){var t=e.target;if(!(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"))){var masks=document.querySelectorAll(".modal-mask");if(masks.length){var last=masks[masks.length-1];e.preventDefault(),typeof last._close=="function"?last._close(null):last.click()}}}});function boot(){syncTopBtn(),fitModals()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot):boot()}(),function(){"use strict";var FAV_KEY="ndt_favs_v1",DRAFT_PREFIX="ndt_draft_v1:",MERGE_KEY="ndt_merge_kind_v1",DRAFT_KEEP_MS=6048e5;function storeGet(k){try{return window.localStorage.getItem(k)}catch(e){return null}}function storeSet(k,v){try{window.localStorage.setItem(k,v)}catch(e){}}function storeDel(k){try{window.localStorage.removeItem(k)}catch(e){}}function readJSON(k,fb){var raw=storeGet(k);if(!raw)return fb;try{return JSON.parse(raw)}catch(e){return fb}}function writeJSON(k,v){try{storeSet(k,JSON.stringify(v))}catch(e){}}var toastTimer=null;function toast2(msg){var el=document.getElementById("ndf-toast");el||(el=document.createElement("div"),el.id="ndf-toast",el.className="ndf-toast",document.body.appendChild(el)),el.textContent=msg,el.classList.add("show"),clearTimeout(toastTimer),toastTimer=setTimeout(function(){el.classList.remove("show")},2200)}function pad(n){return(n<10?"0":"")+n}function stamp(d){return d=d||new Date,d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+" "+pad(d.getHours())+":"+pad(d.getMinutes())}function favList(){var arr=readJSON(FAV_KEY,[]);return Array.isArray(arr)?arr:[]}function favSave(arr){writeJSON(FAV_KEY,arr),favCountRefresh()}function favHas(id){return favList().some(function(f){return f.id===id})}function favAdd(item){var arr=favList();return arr.some(function(f){return f.id===item.id})?!1:(arr.unshift(item),favSave(arr),!0)}function favRemove(id){var arr=favList().filter(function(f){return f.id!==id});favSave(arr)}function postCtx(){var share=document.querySelector(".q-meta [data-share]");if(!share)return null;var id=share.getAttribute("data-share");return id?{id,title:share.getAttribute("data-share-title")||"（无标题）",board:share.getAttribute("data-share-board")||"",author:share.getAttribute("data-share-author")||""}:null}function syncFavBtn(btn){if(btn){var ctx=postCtx(),on=!!(ctx&&favHas(ctx.id));btn.classList.toggle("on",on),btn.textContent=on?"★ 已收藏":"☆ 收藏",btn.setAttribute("aria-pressed",on?"true":"false"),btn.title=on?"点击取消收藏":"收藏到「我的收藏」，稍后再看"}}function injectFavBtn(){var share=document.querySelector(".q-meta [data-share]");if(share){var row=share.parentNode,btn=row.querySelector("[data-ndf-fav]");btn||(btn=document.createElement("button"),btn.type="button",btn.className="btn btn-sm btn-ghost ndf-fav",btn.setAttribute("data-ndf-fav","1"),btn.addEventListener("click",function(ev){ev.preventDefault(),ev.stopPropagation();var ctx=postCtx();ctx&&(favHas(ctx.id)?(favRemove(ctx.id),toast2("已取消收藏")):(favAdd({id:ctx.id,title:ctx.title,board:ctx.board,author:ctx.author,ts:Date.now()}),toast2("已加入我的收藏")),syncFavBtn(btn))}),row.insertBefore(btn,share)),syncFavBtn(btn)}}function favCountRefresh(){for(var n=favList().length,badges=document.querySelectorAll(".ndf-fav-entry .ndf-fav-count"),i=0;i<badges.length;i++)badges[i].textContent=n>99?"99+":String(n),badges[i].style.display=n?"":"none"}function injectSideEntry(force){var side=document.querySelector(".sidebar");if(side){if(side.querySelector("[data-ndf-fav-entry]")){favCountRefresh();return}var anchor=side.querySelector('.side-item[data-section="forum-notices"]');if(!anchor){if(!force)return;anchor=side.querySelector(".side-item")}var entry=document.createElement("div");entry.className="side-item ndf-fav-entry",entry.setAttribute("data-ndf-fav-entry","1"),entry.setAttribute("role","button"),entry.setAttribute("tabindex","0"),entry.innerHTML='<span class="ndf-ico">★</span><span class="side-item-label">我的收藏</span><span class="side-unread-badge ndf-fav-count"></span>',entry.addEventListener("click",function(ev){ev.preventDefault(),ev.stopPropagation(),openFavPanel()}),entry.addEventListener("keydown",function(ev){(ev.key==="Enter"||ev.key===" ")&&(ev.preventDefault(),openFavPanel())}),anchor&&anchor.parentNode?anchor.parentNode.insertBefore(entry,anchor.nextSibling):side.appendChild(entry),favCountRefresh()}}var favMask=null;function closeFavPanel(){if(favMask){var mask=favMask;favMask=null,mask.style.opacity="0",document.body.style.overflow=mask.__prevOv||"",setTimeout(function(){mask.parentNode&&mask.parentNode.removeChild(mask)},200)}}function favRowHtml(f){var meta=[];return f.board&&meta.push(f.board),f.author&&meta.push(f.author),meta.push(f.ts?relTimeText(f.ts):""),'<div class="ndf-fav-item" data-ndf-fav-id="'+escAttr(f.id)+'"><div class="ndf-fav-main"><a class="ndf-fav-title" href="#/post/'+encodeURIComponent(f.id)+'">'+escText(f.title)+'</a><span class="ndf-fav-meta">'+escText(meta.join(" · "))+'</span></div><button type="button" class="ndf-fav-del" data-ndf-fav-del="1">移除</button></div>'}function relTimeText(ts){var d=Date.now()-ts;if(d<60*1e3)return"刚刚";if(d<3600*1e3)return Math.floor(d/6e4)+" 分钟前";if(d<24*3600*1e3)return Math.floor(d/36e5)+" 小时前";if(d<30*24*3600*1e3)return Math.floor(d/864e5)+" 天前";var dt=new Date(ts);return dt.getFullYear()+"/"+pad(dt.getMonth()+1)+"/"+pad(dt.getDate())}function escText(s){return String(s==null?"":s).replace(/[&<>]/g,function(c){return c==="&"?"&amp;":c==="<"?"&lt;":"&gt;"})}function escAttr(s){return escText(s).replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function renderFavList(box){var arr=favList();if(!arr.length){box.innerHTML='<div class="ndf-fav-empty"><span class="big">☆</span>还没有收藏的帖子。<br>在帖子右上角的操作行里点「☆ 收藏」，之后就能在这里找到它。</div>';return}box.innerHTML=arr.map(favRowHtml).join("")}function openFavPanel(){if(!favMask){var mask=document.createElement("div");mask.className="modal-mask",mask.innerHTML='<div class="modal ndf-panel"><div class="ndf-panel-head"><strong>我的收藏</strong><span id="ndf-fav-sub"></span><button type="button" class="btn btn-sm btn-ghost" id="ndf-fav-close" style="margin-left:auto">关闭</button></div><p class="ph-sub" style="margin:6px 0 0;font-size:13px;color:var(--pt-muted,#66719B)">只存在这台设备的浏览器里，清缓存会丢。</p><div class="ndf-fav-list" id="ndf-fav-list"></div></div>';var body=mask.querySelector("#ndf-fav-list");renderFavList(body);var arr=favList();mask.querySelector("#ndf-fav-sub").textContent=arr.length?"共 "+arr.length+" 篇":"",mask.addEventListener("click",function(ev){if(ev.target===mask){closeFavPanel();return}var del=ev.target.closest&&ev.target.closest("[data-ndf-fav-del]");if(del){var row=del.closest(".ndf-fav-item"),id=row&&row.getAttribute("data-ndf-fav-id");if(id){favRemove(id),renderFavList(body);var n=favList().length;mask.querySelector("#ndf-fav-sub").textContent=n?"共 "+n+" 篇":"",toast2("已移除")}return}ev.target.closest&&ev.target.closest("#ndf-fav-close")&&closeFavPanel()}),mask.addEventListener("click",function(ev){var a=ev.target.closest&&ev.target.closest("a.ndf-fav-title");a&&closeFavPanel()}),mask.__prevOv=document.body.style.overflow,document.body.style.overflow="hidden",mask.style.opacity="0",mask.style.transition="opacity .18s ease",mask._close=closeFavPanel,document.body.appendChild(mask),favMask=mask,requestAnimationFrame(function(){mask.style.opacity="1"})}}function draftKeyFor(el){if(!el||!el.id&&!el.className)return"";var id=el.id;if(id==="a-title")return DRAFT_PREFIX+"ask:title";if(id==="a-body")return DRAFT_PREFIX+"ask:body";if(id==="ans-body"){var pid=postIdFromHash();return pid?DRAFT_PREFIX+"post:"+pid+":answer":""}if(el.classList&&el.classList.contains("ir-body")){var box=el.closest(".inline-reply"),bid=box&&box.id?box.id.replace(/^ir-/,""):"";return bid?DRAFT_PREFIX+"reply:"+bid:""}return""}function postIdFromHash(){var h=location.hash||"",m=h.match(/^#\/post\/([^?&/]+)/);return m?decodeURIComponent(m[1]):""}function saveDraft(el){var key=draftKeyFor(el);if(key){var val=el.value||"";if(!val.trim()){storeDel(key);var hintOld=el.parentNode&&el.parentNode.querySelector(".ndf-draft-hint");hintOld&&hintOld.parentNode.removeChild(hintOld);return}writeJSON(key,{v:val,ts:Date.now()}),showDraftHint(el,!0)}}var draftTimers=new WeakMap;function onDraftInput(el){var key=draftKeyFor(el);if(key){var hint=showDraftHint(el,!1);hint&&hint.classList.add("is-saving"),clearTimeout(draftTimers.get(el)),draftTimers.set(el,setTimeout(function(){saveDraft(el)},700))}}function showDraftHint(el,saved){var host=el.parentNode;if(!host)return null;var hint=host.querySelector(".ndf-draft-hint");hint||(hint=document.createElement("div"),hint.className="ndf-draft-hint",hint.innerHTML='<span class="dot"></span><span class="txt"></span><button type="button" class="ndf-draft-clear" data-ndf-draft-clear="1">清空草稿</button>',hint.querySelector("[data-ndf-draft-clear]").addEventListener("click",function(ev){ev.preventDefault();var key=draftKeyFor(el);key&&storeDel(key),el.value="";var h=hint.parentNode&&hint.parentNode.querySelector(".ndf-draft-hint");h&&h.parentNode.removeChild(h),toast2("草稿已清空")}),el.nextSibling?host.insertBefore(hint,el.nextSibling):host.appendChild(hint)),hint.classList.remove("is-saving");var txt=hint.querySelector(".txt");return txt.textContent=saved?"草稿已自动保存 · "+stamp():"正在保存草稿…",hint}function restoreDrafts(){for(var fields=document.querySelectorAll("#a-title, #a-body, #ans-body, .ir-body"),i=0;i<fields.length;i++){var el=fields[i];if(!(el.value&&el.value.trim())&&!(el.parentNode&&el.parentNode.querySelector(".ndf-draft-hint"))){var key=draftKeyFor(el);if(key){var rec=readJSON(key,null);if(!(!rec||typeof rec.v!="string"||!rec.v.trim())){if(rec.ts&&Date.now()-rec.ts>DRAFT_KEEP_MS){storeDel(key);continue}el.value=rec.v;var hint=showDraftHint(el,!1);if(hint){hint.classList.remove("is-saving");var txt=hint.querySelector(".txt");txt.textContent="已恢复上次未提交的草稿 · "+(rec.ts?new Date(rec.ts).toLocaleString("zh-CN"):"")}}}}}}function clearDraftsFor(scope){var keys=[];try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);k&&k.indexOf(DRAFT_PREFIX+scope)===0&&keys.push(k)}}catch(e){return}keys.forEach(storeDel);for(var hints=document.querySelectorAll(".ndf-draft-hint"),j=0;j<hints.length;j++){var h=hints[j];h.parentNode&&h.parentNode.removeChild(h)}}function answersOfPanel(){for(var panels=document.querySelectorAll(".p-panel"),i=0;i<panels.length;i++){var list=panels[i].querySelectorAll(".answer");if(list.length)return panels[i]}return null}function markFloors(panel){if(!(!panel||panel.getAttribute("data-ndf-floors")==="1")){for(var answers=panel.querySelectorAll(".answer"),i=0;i<answers.length;i++){var meta=answers[i].querySelector(".q-meta");if(!(!meta||meta.querySelector(".ndf-floor"))){var chip=document.createElement("span");chip.className="ndf-floor",chip.textContent=i+1+" 楼",meta.appendChild(chip)}}panel.setAttribute("data-ndf-floors","1")}}function injectFloorNav(){var panel=answersOfPanel();if(!panel||panel.querySelector("[data-ndf-jump]"))return;markFloors(panel);var total=panel.querySelectorAll(".answer").length,h2=panel.querySelector("h2"),wrap=document.createElement("div");wrap.className="ndf-jump",wrap.setAttribute("data-ndf-jump","1"),wrap.innerHTML='<span>楼层直达</span><input type="number" min="1" max="'+total+'" inputmode="numeric" placeholder="楼层" aria-label="输入楼层号"><button type="button" data-ndf-go="1">跳转</button><span class="ndf-jump-total">共 '+total+" 层</span>";var input=wrap.querySelector("input");function go(){var n=parseInt(input.value,10);if(!n||n<1||n>total){toast2("请输入 1 到 "+total+" 之间的楼层号");return}var target=panel.querySelectorAll(".answer")[n-1];if(target){target.classList.remove("ndf-hl"),target.offsetWidth,target.classList.add("ndf-hl");try{target.scrollIntoView({behavior:"smooth",block:"center"})}catch(e){target.scrollIntoView()}setTimeout(function(){var r=target.getBoundingClientRect();if(r.top<48||r.bottom>(window.innerHeight||0)-32)try{target.scrollIntoView({block:"center"})}catch(e2){target.scrollIntoView()}},420),setTimeout(function(){target.classList.remove("ndf-hl")},2600)}}wrap.querySelector("[data-ndf-go]").addEventListener("click",go),input.addEventListener("keydown",function(ev){ev.key==="Enter"&&(ev.preventDefault(),go())}),h2&&h2.parentNode?h2.parentNode.insertBefore(wrap,h2.nextSibling):panel.firstChild?panel.insertBefore(wrap,panel.firstChild):panel.appendChild(wrap),markFloors(panel)}function mergePref(){var v=storeGet(MERGE_KEY);return v===null?!0:v==="1"}function actorOf(item){var strong=item.querySelector(".fnc-title-row strong");if(!strong)return"";var t=(strong.textContent||"").trim();return t=t.replace(/\s*赞了.*$/,"").replace(/\s*等\s*\d+\s*人$/,""),t}function ensureMergeSwitch(actions){if(!(!actions||actions.querySelector("[data-ndf-merge-switch]"))){var btn=document.createElement("button");btn.type="button",btn.className="btn btn-sm btn-ghost fnc-merge-switch",btn.setAttribute("data-ndf-merge-switch","1"),btn.innerHTML="<i></i>合并同类",btn.classList.toggle("on",mergePref()),btn.addEventListener("click",function(ev){ev.preventDefault(),storeSet(MERGE_KEY,mergePref()?"0":"1"),btn.classList.toggle("on",mergePref()),applyMerge()}),actions.insertBefore(btn,actions.firstChild)}}function unmerge(list){for(var hidden=list.querySelectorAll("[data-ndf-hidden-by-merge]"),i=0;i<hidden.length;i++)hidden[i].style.display="",hidden[i].removeAttribute("data-ndf-hidden-by-merge");for(var heads=list.querySelectorAll(".fnc-title-row strong[data-ndf-orig]"),j=0;j<heads.length;j++){heads[j].innerHTML=heads[j].getAttribute("data-ndf-orig"),heads[j].removeAttribute("data-ndf-orig");var badge=heads[j].parentNode&&heads[j].parentNode.querySelector(".fnc-merged");badge&&badge.parentNode&&badge.parentNode.removeChild(badge)}for(var extra=list.querySelectorAll("[data-ndf-read-all]"),k=0;k<extra.length;k++)extra[k].parentNode&&extra[k].parentNode.removeChild(extra[k])}function applyMerge(){var list=document.querySelector(".fnc-list");if(list){var items=list.querySelectorAll("[data-cn-item]");if(items.length){if(!mergePref()){unmerge(list);return}unmerge(list);for(var groups=[],index={},i=0;i<items.length;i++){var it=items[i],icon=it.querySelector(".fnc-icon"),isLike=icon&&icon.classList.contains("is-growth");if(isLike){var post=it.querySelector(".fnc-post-title"),open=it.querySelector("[data-cn-open]"),key=open&&open.getAttribute("href")||(post?post.textContent.trim():"");key&&(index[key]||(index[key]=[],groups.push(index[key])),index[key].push(it))}}groups.forEach(function(g){if(!(g.length<2)){var first=g[0],strong=first.querySelector(".fnc-title-row strong");if(strong){var names=[];g.forEach(function(it2){var n=actorOf(it2);n&&names.indexOf(n)<0&&names.push(n)});var head=names.length?names.slice(0,2).join("、")+(names.length>2?" 等 "+names.length+" 人":""):"共 "+g.length+" 人";strong.setAttribute("data-ndf-orig",strong.innerHTML),strong.innerHTML='<span class="fnc-actor-names">'+escText(head)+"</span>赞了你的帖子";var badge=document.createElement("span");badge.className="fnc-merged",badge.textContent="已合并 "+g.length+" 条",strong.parentNode&&strong.parentNode.insertBefore(badge,strong.nextSibling);for(var hasUnread=!1,k=1;k<g.length;k++)g[k].style.display="none",g[k].setAttribute("data-ndf-hidden-by-merge","1"),g[k].classList.contains("is-unread")&&(hasUnread=!0);if(first.classList.contains("is-unread")&&(hasUnread=!0),!!hasUnread){var actions=first.querySelector(".fnc-item-actions");if(actions){var all=document.createElement("button");all.type="button",all.className="btn btn-sm btn-ghost",all.setAttribute("data-ndf-read-all","1"),all.textContent="全部标为已读",all.addEventListener("click",function(ev){ev.preventDefault(),g.forEach(function(it2){var btn=it2.querySelector("[data-cn-read]");btn&&btn.click()}),toast2("这 "+g.length+" 条已标为已读")}),actions.appendChild(all)}}}}})}}}function pad2(n){return n<10?"0"+n:""+n}function relTime2(iso){var d=new Date(iso);if(!d||isNaN(d.getTime()))return"";var now=new Date,diff=Math.floor((now.getTime()-d.getTime())/1e3);return diff<0&&(diff=0),diff<60?"刚刚":diff<3600?Math.floor(diff/60)+" 分钟前":diff<86400?Math.floor(diff/3600)+" 小时前":diff<172800?"昨天 "+pad2(d.getHours())+":"+pad2(d.getMinutes()):diff<604800?Math.floor(diff/86400)+" 天前":d.getFullYear()===now.getFullYear()?pad2(d.getMonth()+1)+"-"+pad2(d.getDate()):d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate())}function formatTimes(){var list=document.querySelector(".fnc-list");if(list)for(var items=list.querySelectorAll(".fnc-item"),i=0;i<items.length;i++){var t=items[i].querySelector(".fnc-title-row time");if(t){var raw=(t.textContent||"").trim();if(!(!raw||t.getAttribute("data-ndf-raw")===raw)){var rel=relTime2(raw);rel&&(t.setAttribute("data-ndf-raw",raw),t.textContent=rel,t.setAttribute("title",raw))}}}}var busy=!1;function warn(e){window.console&&console.warn&&console.warn("[pro-tools]",e)}function mergePass(){var actions=document.querySelector(".fnc-actions");!actions||!document.querySelector("[data-cn-item]")||(ensureMergeSwitch(actions),applyMerge())}function run(){if(!busy){busy=!0;try{injectSideEntry(!0)}catch(e){warn(e)}try{injectFavBtn()}catch(e){warn(e)}try{injectFloorNav()}catch(e){warn(e)}try{restoreDrafts()}catch(e){warn(e)}try{mergePass()}catch(e){warn(e)}try{formatTimes()}catch(e){warn(e)}busy=!1}}document.addEventListener("input",function(ev){var t=ev.target;!t||!t.tagName||(t.tagName==="TEXTAREA"||t.tagName==="INPUT"&&t.id==="a-title")&&(t.id||t.classList&&t.classList.contains("ir-body"))&&onDraftInput(t)},!0),document.addEventListener("click",function(ev){var t=ev.target;if(!(!t||!t.closest)){if(t.closest("#a-sub")){clearDraftsFor("ask:");return}if(t.closest("#ans-sub")){var pid=postIdFromHash();pid&&clearDraftsFor("post:"+pid+":answer");return}var send=t.closest(".ir-send");if(send){var box=send.closest(".inline-reply"),bid=box&&box.id?box.id.replace(/^ir-/,""):"";bid&&clearDraftsFor("reply:"+bid)}}},!0),window.addEventListener("hashchange",function(){repinSide(),schedule(90)});var timer=null;function schedule(ms){timer||(timer=setTimeout(function(){timer=null,run()},ms||90))}function repinSide(){try{document.querySelector(".ndf-fav-entry")||injectSideEntry(),requestAnimationFrame(function(){try{document.querySelector(".ndf-fav-entry")||injectSideEntry(!0)}catch(e){}})}catch(e){}}var lastSig="";function sweep(){var actions=document.querySelector(".fnc-actions"),list=document.querySelector(".fnc-list");if(!(!actions||!list)){var items=list.querySelectorAll("[data-cn-item]");if(items.length){try{ensureMergeSwitch(actions)}catch(e){warn(e)}try{formatTimes()}catch(e){warn(e)}for(var sig=items.length+":",i=0;i<items.length;i++)sig+=(items[i].getAttribute("data-cn-item")||"")+",";if(sig+=":"+list.querySelectorAll(".is-unread").length,sig!==lastSig){lastSig=sig;try{mergePass()}catch(e){warn(e)}}}}}function boot(){run();var app=document.getElementById("app");app&&window.MutationObserver&&new MutationObserver(function(){repinSide(),!busy&&schedule(90)}).observe(app,{childList:!0,subtree:!0}),setTimeout(run,600),setInterval(sweep,500)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot):boot()}(),function(){"use strict";var RULE="本帖违反云端论坛守则已被禁止观看，请遵守云端论坛守则",TIP_CLS="ndt-restricted-tip",BTN_ATTR="data-ndt-hidden",state={},fetching=!1;function $2(s,r){return(r||document).querySelector(s)}function postIdFromHash(){var m=(location.hash||"").match(/#\/post\/([^/?#]+)/);return m?decodeURIComponent(m[1]):null}function say(msg,kind){if(typeof toast=="function")try{toast(msg,kind==="err"?"err":"ok");return}catch(e){}console.log("[restrict] "+msg)}function isAdmin(){try{return!!(Cloud&&Cloud.connected&&Cloud.user&&Number(Cloud.user.role)>=3)}catch(e){return!1}}function wrapFetch(){if(!fetching){var orig=window.fetch;typeof orig=="function"&&(fetching=!0,window.fetch=function(input,init){var p=orig.apply(this,arguments);try{var url=typeof input=="string"?input:input&&input.url||"",method=(init&&init.method||input&&input.method||"GET").toUpperCase(),m=url.match(/\/api\/posts\/([^/?#]+)(?:\?|$)/);if(m&&method==="GET"){var pid=decodeURIComponent(m[1]);p.then(function(res){!res||typeof res.clone!="function"||res.clone().json().then(function(d){state[pid]={status:res.status,hidden:!!(d&&d.post&&d.post.hidden),authorId:d&&d.post&&d.post.authorId||null,ruleText:d&&d.error||""},tick()}).catch(function(){})}).catch(function(){})}}catch(e){}return p})}}function ensureButton(pid){var btn=document.querySelector("["+BTN_ATTR+"]");if(btn){btn.dataset.ndtFor=pid,btn.disabled||paintBtn(btn,pid);return}var anchor=$2("[data-essence]")||$2(".q-meta [data-share]");if(!(!anchor||!anchor.parentNode)){var clone=anchor.cloneNode(!1);clone.className=anchor.className.indexOf("is-on")>=0?anchor.className.replace(/\bis-on\b/g,"").trim():anchor.className,clone.type="button",clone.removeAttribute("data-essence"),clone.removeAttribute("data-share"),clone.setAttribute(BTN_ATTR,"1"),clone.dataset.ndtFor=pid,clone.onclick=function(){toggle(clone,pid)},anchor.parentNode.insertBefore(clone,anchor.nextSibling),paintBtn(clone,pid)}}function paintBtn(btn,pid){var s=state[pid]||{};btn.textContent=s.hidden?"解除限制":"限制观看",btn.title=s.hidden?"解除后所有人都能正常浏览":"限制后只有作者和管理员能看到内容",btn.disabled=!1}function toggle(btn,pid){var next=!(state[pid]&&state[pid].hidden);btn.disabled=!0,Cloud.request("/posts/"+encodeURIComponent(pid)+"/hidden",{method:"POST",body:JSON.stringify({hidden:next})}).then(function(r){state[pid]=state[pid]||{},state[pid].hidden=!!r.hidden,state[pid].status=200,paintBtn(btn,pid),say(r.hidden?"已限制观看：其他人点开只会看到守则提示":"已解除限制，所有人都能正常浏览"),tick()}).catch(function(e){btn.disabled=!1,say(e&&e.message||"操作失败，请稍后重试","err")})}function ensureTip(pid,s){if(!(!s||!s.hidden||s.status!==200)&&!document.querySelector("."+TIP_CLS)){var host=$2("#app .p-panel");if(!(!host||!host.parentNode)){var box=document.createElement("div");box.className=TIP_CLS,box.style.cssText="margin:0 0 12px;padding:10px 14px;border-radius:10px;border:1px solid rgba(230,126,34,.45);background:rgba(230,126,34,.10);color:#b9772a;font-size:13px;line-height:1.6;",box.innerHTML='<b style="margin-right:6px">已被限制观看</b>本帖仅作者本人和管理员可见，其他成员点开只会看到守则提示。',host.parentNode.insertBefore(box,host)}}}function polish403(pid,s){if(!(!s||s.status!==403)){var panel=$2("#app .p-panel.empty");!panel||panel.dataset.ndtPolished==="1"||panel.textContent.indexOf("帖子加载失败")<0||(panel.dataset.ndtPolished="1",panel.innerHTML='<div style="padding:26px 18px;text-align:center"><div style="font-size:30px;line-height:1;margin-bottom:14px">⛔</div><div style="font-size:15px;line-height:1.9;color:#8a4b3c">'+RULE+'</div><div style="margin-top:16px"><a class="btn btn-sm" href="#/forum">返回论坛</a></div></div>')}}function tick(){var pid=postIdFromHash();if(pid){var s=state[pid];s&&polish403(pid,s),isAdmin()&&ensureButton(pid),s&&ensureTip(pid,s)}}function boot(){setTimeout(tick,300),setInterval(tick,800),window.addEventListener("hashchange",function(){setTimeout(tick,120)})}wrapFetch(),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot):boot()}(),function(){"use strict";var VID_KEY="ndt-visit-id",CARD_ID="ndt-visit-card";function uid(){try{if(window.crypto&&typeof crypto.randomUUID=="function")return crypto.randomUUID().replace(/-/g,"")}catch(e){}for(var s="",i=0;i<4;i++)s+=Math.random().toString(36).slice(2,10);return s.slice(0,32)}function visitorId(){var v=null;try{v=localStorage.getItem(VID_KEY)}catch(e){}if(!v||!/^[A-Za-z0-9_-]{8,64}$/.test(v)){v=uid();try{localStorage.setItem(VID_KEY,v)}catch(e){}}return v}function ping(){try{fetch("/api/stats/visit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({vid:visitorId()}),keepalive:!0}).catch(function(){})}catch(e){}}function isAdmin(){try{return!!(Cloud&&Cloud.connected&&Cloud.user&&Number(Cloud.user.role)>=3)}catch(e){return!1}}function esc2(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function tile(label,value,unit){return'<div style="background:#fff;border:1px solid var(--pt-line,#e5e8f0);border-radius:10px;padding:10px 12px"><div style="color:#7f8a9d;font-size:12px">'+esc2(label)+'</div><div style="margin-top:3px"><b style="font-size:19px;color:#1a2233">'+esc2(value)+'</b><span style="color:#8b95a7;margin-left:3px;font-size:12px">'+esc2(unit)+"</span></div></div>"}function render(box,d){d=d||{};for(var today=d.today||{},yest=d.yesterday||{},tot=d.total||{},l7=d.last7||[],daily=d.daily||[],max=1,i=0;i<l7.length;i++)Number(l7[i].pv)>max&&(max=Number(l7[i].pv));var bars=l7.map(function(x){var w=Math.max(3,Math.round((Number(x.pv)||0)/max*100));return'<div style="display:flex;align-items:center;gap:8px;margin:5px 0;font-size:12px"><span style="width:52px;color:#7f8a9d">'+esc2(String(x.day).slice(5))+'</span><span style="flex:1 1 auto;height:7px;background:#e9edf5;border-radius:4px;overflow:hidden"><span style="display:block;height:7px;width:'+w+'%;background:linear-gradient(90deg,#3b82f6,#f97316)"></span></span><span style="flex:0 0 92px;text-align:right;color:#6a7185">'+esc2(x.uv)+" 人 / "+esc2(x.pv)+" 次</span></div>"}).join(""),table=daily.length?'<div style="color:#7f8a9d;margin:12px 0 4px;font-size:12px">最近 30 天</div><div style="max-height:200px;overflow:auto;border-top:1px solid var(--pt-line,#e5e8f0)">'+daily.map(function(x){return'<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0f2f7;font-size:12px"><span style="color:#6a7185">'+esc2(x.day)+'</span><span style="color:#1a2233">访客 <b>'+esc2(x.uv)+"</b> · 浏览 <b>"+esc2(x.pv)+"</b></span></div>"}).join("")+"</div>":'<div style="margin-top:10px;color:#9aa3b5;font-size:12px">还没有数据，等有过访问之后这里就会出现。</div>';box.style.color="inherit",box.innerHTML='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px">'+tile("今日访客",today.uv||0,"人")+tile("今日浏览",today.pv||0,"次")+tile("昨日访客",yest.uv||0,"人")+tile("昨日浏览",yest.pv||0,"次")+'</div><div style="color:#7f8a9d;margin-bottom:2px;font-size:12px">近 7 天</div>'+bars+'<div style="margin-top:10px;padding-top:9px;border-top:1px solid var(--pt-line,#e5e8f0);color:#6a7185;font-size:12px">累计访客 <b style="color:#1a2233">'+esc2(tot.uv||0)+'</b> 人 · 累计浏览 <b style="color:#1a2233">'+esc2(tot.pv||0)+"</b> 次</div>"+table+'<div style="margin-top:8px;color:#9aa3b5;font-size:11.5px">从功能上线当天开始累计；访客按本机随机标识去重，不记录 IP、不记录看过的内容。</div>'}function load(box){if(box){if(typeof Cloud=="undefined"||!Cloud||typeof Cloud.request!="function"){box.textContent="云端未连接，暂时读不到数据。";return}Cloud.request("/stats/visit").then(function(d){render(box,d)}).catch(function(e){box.textContent="读取失败："+(e&&e.message||"未知错误")})}}function onCloudPage(){return/^#\/cloud(?:[?/]|$)/.test(location.hash||"")}function findHost(){for(var panels=document.querySelectorAll(".p-panel"),i=0;i<panels.length;i++)if(panels[i].querySelector("#acct-name-save")||panels[i].querySelector("#cloud-export"))return panels[i];return null}function ensureCard(){if(onCloudPage()&&isAdmin()&&!document.getElementById(CARD_ID)){var host=findHost();if(host){var card=document.createElement("div");card.id=CARD_ID,card.style.cssText="margin-top:14px;padding:14px 16px;border:1px solid var(--pt-line,#e5e8f0);border-radius:14px;background:var(--pt-soft,#f7f8fc)",card.innerHTML='<strong>📊 访问统计</strong><div data-body style="color:#7f8a9d;margin-top:8px;font-size:12.5px">正在读取…</div>',host.appendChild(card),load(card.querySelector("[data-body]"))}}}var timer=0;function tick(){timer||(timer=setTimeout(function(){timer=0;try{ensureCard()}catch(e){}},80))}function boot(){ping(),tick(),window.addEventListener("hashchange",function(){setTimeout(tick,150)});try{new MutationObserver(tick).observe(document.body,{childList:!0,subtree:!0})}catch(e){}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot):boot()}(),function(){"use strict";if(!window.matchMedia)return;var MQ=window.matchMedia("(max-width: 680px)");function isMobile(){return MQ.matches}function fade(el){if(el){var max=el.scrollWidth-el.clientWidth;if(max<=4){el.removeAttribute("data-pf");return}var x=el.scrollLeft,flags=[];x>=3&&flags.push("l"),x<=max-3&&flags.push("r"),flags.length?el.setAttribute("data-pf",flags.join(" ")):el.removeAttribute("data-pf")}}function centerActive(el){if(el){var on=el.querySelector(".ft.on");if(on){var left=on.offsetLeft,right=left+on.offsetWidth,viewL=el.scrollLeft,viewR=viewL+el.clientWidth;if(!(left>=viewL+8&&right<=viewR-8))try{on.scrollIntoView({inline:"center",block:"nearest",behavior:"smooth"})}catch(e){el.scrollLeft=Math.max(0,left-20)}}}}function bindTabs(){if(isMobile())for(var tabs=document.querySelectorAll(".forum-tabs"),i=0;i<tabs.length;i++){var t=tabs[i];t.__pfBound||(t.__pfBound=!0,t.addEventListener("scroll",function(e){fade(e.currentTarget)},{passive:!0})),fade(t),centerActive(t)}}var sideLeft=0;document.addEventListener("scroll",function(e){var t=e.target;t&&t.classList&&t.classList.contains("sidebar")&&(sideLeft=t.scrollLeft)},!0);function restoreSide(){if(!(!isMobile()||sideLeft<=0)){var side=document.querySelector(".sidebar");side&&Math.abs(side.scrollLeft-sideLeft)>4&&(side.scrollLeft=sideLeft)}}var timer=null;function refresh(){bindTabs(),restoreSide()}function schedule(){clearTimeout(timer),timer=setTimeout(refresh,60)}window.addEventListener("resize",refresh),window.addEventListener("hashchange",function(){setTimeout(refresh,240)}),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",function(){setTimeout(refresh,300)}):setTimeout(refresh,300);try{var app=document.getElementById("app");if(app&&window.MutationObserver){var mo=new MutationObserver(function(){mo._t||(mo._t=setTimeout(function(){mo._t=0,schedule()},40))});mo.observe(app,{childList:!0,subtree:!0})}}catch(e){}}(),function(){"use strict";function toArray(v){return Array.isArray(v)?v:v?Array.isArray(v.posts)?v.posts:Array.isArray(v.items)?v.items:Array.isArray(v.list)?v.list:Array.isArray(v.data)?v.data:typeof v.length=="number"?Array.prototype.slice.call(v):[]:[]}var patched=!1;function patchSort(){if(patched)return!0;var orig=null;try{orig=window.sortForumPosts}catch(e){}return typeof orig!="function"?!1:(window.sortForumPosts=function(list,sort){return orig(toArray(list),sort)},patched=!0,!0)}function patchListHtml(){var orig=null;try{orig=window.forumListHtml}catch(e){}if(typeof orig=="function"&&!orig.__safeWrapped){var wrapped=function(list,uid){return orig(toArray(list),uid)};wrapped.__safeWrapped=!0;try{window.forumListHtml=wrapped}catch(e){}}}function run(){patchSort(),patchListHtml()}run(),document.addEventListener("DOMContentLoaded",run),setTimeout(run,300),setTimeout(run,1200)}(),function(){"use strict";var MQ="(max-width: 900px)",wrap=null,bar=null,btn=null,sheet=null,sheetBody=null,timer=0;function isMobile(){try{return window.matchMedia(MQ).matches}catch(e){return!1}}function host(){return document.body}function cleanSidebar(){var b=document.querySelector(".sidebar");if(b){b.classList.contains("sb-open")&&b.classList.remove("sb-open");for(var heads=b.querySelectorAll(".sb-sheet-head"),i=heads.length-1;i>=0;i--)heads[i].parentElement&&heads[i].parentElement.removeChild(heads[i])}var w=document.querySelector(".nav-wrap");if(w)for(var more=w.querySelectorAll(".sb-more"),j=more.length-1;j>=0;j--)more[j].parentElement&&more[j].parentElement.removeChild(more[j])}function purgeAll(){for(var olds=document.querySelectorAll(".sb-sheet"),i=olds.length-1;i>=0;i--)olds[i].parentElement&&olds[i].parentElement.removeChild(olds[i]);sheet=null,sheetBody=null}function ensureSheet(){if(!(sheet&&sheet.parentElement)){sheet=document.createElement("div"),sheet.className="sb-sheet";var head=document.createElement("div");head.className="sb-sheet-head";var title=document.createElement("span");title.textContent="全部功能",head.appendChild(title);var close=document.createElement("button");close.type="button",close.className="sb-sheet-close",close.textContent="关闭",close.addEventListener("click",function(e){e.preventDefault(),e.stopPropagation(),hide()}),head.appendChild(close),sheetBody=document.createElement("div"),sheetBody.className="sb-sheet-body",sheet.appendChild(head),sheet.appendChild(sheetBody),host().appendChild(sheet)}}function ensureMask(){for(var old=document.querySelectorAll(".sb-mask"),i=0;i<old.length;i++)old[i].parentElement&&old[i].parentElement.removeChild(old[i]);var mask=document.createElement("div");return mask.className="sb-mask",mask.addEventListener("click",hide),host().appendChild(mask),mask}function dropMask(){for(var masks=document.querySelectorAll(".sb-mask"),i=masks.length-1;i>=0;i--)masks[i].parentElement&&masks[i].parentElement.removeChild(masks[i])}function build(){if(ensureSheet(),!(!bar||!sheetBody)){sheetBody.innerHTML="";var groups=[],cur=null;Array.prototype.forEach.call(bar.children,function(el){if(el.classList){if(el.classList.contains("sd-group")){cur={title:(el.textContent||"").trim(),items:[]},groups.push(cur);return}el.classList.contains("side-item")&&(cur||(cur={title:"",items:[]},groups.push(cur)),cur.items.push(el))}}),groups.forEach(function(g){if(g.title){var gt=document.createElement("div");gt.className="sb-sheet-g",gt.textContent=g.title,sheetBody.appendChild(gt)}g.items.forEach(function(src){var it=document.createElement("button");it.type="button",it.className="sb-sheet-i"+(src.classList.contains("on")?" on":"");var icon=src.querySelector("svg");icon&&it.appendChild(icon.cloneNode(!0));var label=src.querySelector(".side-item-label"),sp=document.createElement("span");sp.textContent=(label?label.textContent||"":src.textContent||"").trim(),it.appendChild(sp),it.addEventListener("click",function(e){e.preventDefault(),e.stopPropagation(),hide(),setTimeout(function(){try{src.click()}catch(err){}},60)}),sheetBody.appendChild(it)})})}}function hide(){sheet&&sheet.classList.remove("on"),btn&&btn.classList.remove("is-open"),dropMask(),document.body.style.overflow=""}function show(){build(),sheet&&(dropMask(),ensureMask(),sheet.classList.add("on"),btn&&btn.classList.add("is-open"),sheetBody&&(sheetBody.scrollTop=0),document.body.style.overflow="hidden")}function makeToggle(){btn=document.createElement("button"),btn.type="button",btn.className="sb-toggle",btn.setAttribute("aria-label","展开全部功能");var caret=document.createElement("span");return caret.className="sb-toggle-caret",caret.textContent="▾",btn.appendChild(caret),btn.addEventListener("click",function(e){e.preventDefault(),e.stopPropagation(),sheet&&sheet.classList.contains("on")?hide():show()}),btn}function boot(){if(cleanSidebar(),wrap=document.querySelector(".nav-wrap"),bar=document.querySelector(".sidebar"),!(!wrap||!bar)){if(!isMobile()){var t=wrap.querySelector(".sb-toggle");t&&t.parentElement&&t.parentElement.removeChild(t),btn=null,hide();return}var exist=wrap.querySelector(".sb-toggle");exist?btn=exist:(btn=makeToggle(),wrap.appendChild(btn)),sheet&&!sheet.parentElement&&(sheet=null,sheetBody=null),(!sheet||!sheet.classList.contains("on"))&&(dropMask(),document.body.style.overflow="")}}function tick(){timer||(timer=setTimeout(function(){timer=0;try{boot()}catch(e){}},80))}window.addEventListener("resize",function(){isMobile()||hide(),tick()}),window.addEventListener("hashchange",function(){setTimeout(tick,120)});function start(){cleanSidebar(),purgeAll();try{dropMask(),document.body&&(document.body.style.overflow="")}catch(e){}boot();try{var target=document.getElementById("app")||document.body;new MutationObserver(tick).observe(target,{childList:!0,subtree:!0})}catch(e){}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start()}(),function(){"use strict";var P={inbox:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 13h5l2 3h4l2-3h5"/>',msg:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 17v4l5-4"/>',users:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><circle cx="17.5" cy="9.5" r="2.3"/><path d="M16.5 15.2c3 .3 5 1.8 5 4.8"/>',doc:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',star:'<path d="M12 4l2.4 5 5.6.8-4 4 1 5.6-5-2.7-5 2.7 1-5.6-4-4 5.6-.8z"/>',lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',alert:'<path d="M12 4l9 16H3z"/><path d="M12 9v4.5"/><circle cx="12" cy="16.6" r=".9"/>',search:'<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',clock:'<circle cx="12" cy="12" r="8"/><path d="M12 7.5v5l3.4 2"/>',book:'<path d="M4 5h7v15H4z"/><path d="M13 5h7v15h-7z"/><path d="M11 8v12"/>'},RULES=[[/失败|错误|出错|加载|无法|异常|⚠/,"alert"],[/权限|级别|锁定|调阅|不公开|⛔/,"lock"],[/消息|聊天|回复|私信|发言|对话|讯息/,"msg"],[/成员|好友|员工|管理|异人|用户|人物/,"users"],[/徽章|成就|称号|收藏|精华/,"star"],[/搜索|关键词|匹配|查找|未找到/,"search"],[/档案|典藏|资料|记录|条目|节点|关系|帖|字卡/,"doc"],[/时间|轨迹|事件|历史|节点/,"clock"],[/卷宗|书|课程/,"book"]];function pick2(text){for(var i=0;i<RULES.length;i++)if(RULES[i][0].test(text))return RULES[i][1];return"inbox"}function svg(kind){return'<svg class="vp-ic" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(P[kind]||P.inbox)+"</svg>"}function fix(el){if(!el.dataset.vp){el.dataset.vp="1";var es=el.querySelector(".es"),text=(el.textContent||"").replace(/\s+/g,""),kind=pick2(text);if(es){if(es.querySelector("svg")){es.classList.add("is-ic");return}es.className="es is-ic",es.innerHTML=svg(kind);return}var d=document.createElement("div");d.className="es is-ic",d.innerHTML=svg(kind),el.insertBefore(d,el.firstChild)}}function sweep(root){for(var list=(root||document).querySelectorAll(".empty"),i=0;i<list.length;i++)fix(list[i])}var timer=0,mo=new MutationObserver(function(){timer||(timer=setTimeout(function(){timer=0,sweep(document)},100))});function boot(){sweep(document),mo.observe(document.documentElement,{childList:!0,subtree:!0})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot):boot()}(),function(){"use strict";function esc2(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}var CITY=[["北京",["朝阳区","海淀区"]],["上海",["徐汇区","浦东新区"]],["广州",["天河区","海珠区"]],["深圳",["南山区","福田区"]],["成都",["武侯区","锦江区"]],["杭州",["西湖区","滨江区"]],["南京",["鼓楼区","江宁区"]],["武汉",["洪山区","江汉区"]],["西安",["雁塔区","碑林区"]],["重庆",["渝北区","江北区"]],["青岛",["市南区","崂山区"]],["天津",["南开区","河西区"]],["苏州",["姑苏区","吴中区"]],["长沙",["岳麓区","芙蓉区"]],["郑州",["金水区","二七区"]],["厦门",["思明区","湖里区"]],["昆明",["五华区","官渡区"]],["沈阳",["沈河区","铁西区"]],["合肥",["蜀山区","庐阳区"]],["济南",["历下区","市中区"]]],NAMES=["张伟","李强","王磊","刘洋","陈晨","赵磊","周涛","吴迪","孙鹏","郑凯","冯波","韩旭"],GOODS=["日用百货","服装鞋帽","文件资料","数码配件","食品干货","图书文具","家居用品","运动装备"],SIGNS=["本人签收","家人代收","前台代收","门卫代收"],TITLES={o:"已下单",c:"已揽收",x1:"运输中",a1:"到达中转",x2:"运输中",a2:"到达目的地",d:"派送中",s:"已签收"};function hashOf(s){for(var h=0,i=0;i<s.length;i++)h=Math.imul(h,31)+s.charCodeAt(i)>>>0;return h}function p2(n){return n<10?"0"+n:String(n)}function stamp(d){return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())+" "+p2(d.getHours())+":"+p2(d.getMinutes())}function hhmm(d){return p2(d.getHours())+":"+p2(d.getMinutes())}function mmdd(d){return p2(d.getMonth()+1)+"-"+p2(d.getDate())+" "+p2(d.getHours())+":"+p2(d.getMinutes())}function stampValid(v){return/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(String(v||""))?isFinite(new Date(String(v).replace(" ","T")).getTime()):!1}function toMs(x){return x instanceof Date?x.getTime():Number(x)||0}function addHours(x,n){return new Date(toMs(x)+n*36e5)}function addMin(x,n){return new Date(toMs(x)+n*6e4)}function planOf(quick){return quick?[{k:"o",g:24},{k:"c",g:42},{k:"d",g:32},{k:"s",g:20}]:[{k:"o",g:42},{k:"c",g:165},{k:"x1",g:300},{k:"a1",g:155},{k:"x2",g:320},{k:"a2",g:115},{k:"d",g:70},{k:"s",g:55}]}var REGION={北京:"华北",天津:"华北",济南:"华北",青岛:"华北",上海:"华东",杭州:"华东",南京:"华东",苏州:"华东",合肥:"华东",厦门:"华东",广州:"华南",深圳:"华南",武汉:"华中",长沙:"华中",郑州:"华中",成都:"西南",重庆:"西南",昆明:"西南",西安:"西北",沈阳:"东北"};function statusAt(quick,idx){return quick?["待揽收","已揽收","派送中","已签收"][idx]||"派送中":["待揽收","已揽收","运输中","已到达中转","运输中","已到达分拨","派送中","已签收"][idx]||"派送中"}function freshAt(quick,idx,h){var base=quick?[16,48,26,40]:[20,95,125,66,115,60,30,48];return(base[idx]||30)+(h>>>24)%18}function nodeText(pk,k,d,state){var desc,who=pk._recv,tel=pk._tel;return k==="o"?desc="您的快件订单已提交，"+pk.from+" 已接单，揽件员 "+who+" 预计 "+hhmm(addHours(d,3))+" 前上门揽收，请保持电话畅通。":k==="c"?desc=pk.from+" 已揽收您的快件，实计重量 "+pk.weight+"，共 "+pk.count+" 件，正在发往"+pk.fromCity+"转运中心。":k==="x1"?desc="快件已由"+pk.fromCity+"转运中心装车发出，下一站"+pk.mid+"，预计 "+hhmm(addHours(d,5))+" 到达。":k==="a1"?desc="快件已到达"+pk.mid+"，正在分拣，预计 "+hhmm(addHours(d,4))+" 前转出。":k==="x2"?desc="快件已由"+pk.mid+"发出，发往"+pk.toCity+"分拨中心。":k==="a2"?desc="快件已到达"+pk.toCity+"分拨中心，正在安排转入末端网点。":k==="d"?desc="快件已到达"+pk.to+"，派件员 "+who+"（"+tel+"）正在为您派送，请保持电话畅通。":desc="快件已签收，签收人："+pk._sign+"。感谢使用哪都通快递，期待再次为您服务。",{t:stamp(d),title:TITLES[k],desc,state}}function buildTimeline(pk,idx,t0){var plan=planOf(!!pk.quick),h=hashOf(pk.code),k=1+(h>>>29)%6/24,offs=[],acc=freshAt(!!pk.quick,idx,h),i;for(i=idx;i>=0;i--)offs[i]=acc,acc+=plan[i].g*k;var out=[];for(i=idx;i>=0;i--)out.push(nodeText(pk,plan[i].k,addMin(t0,-offs[i]),i===idx?"cur":"done"));return out}function stageOf(h,quick){var r=(h>>>19)%100;return quick?r<12?0:r<34?1:r<78?2:3:r<5?0:r<15?1:r<32?2:r<44?3:r<55?4:r<66?5:r<84?6:7}function genPackage2(code){var normalized=String(code||"").trim().toUpperCase();normalized||(normalized="NDT"+(1e9+Math.floor(Math.random()*8e9)));var h=hashOf(normalized),t0=Date.now(),quick=h%27===0,ai=h%CITY.length,bi=(h>>>5)%CITY.length;bi===ai&&(bi=(bi+9)%CITY.length);var from=CITY[ai],to=quick?from:CITY[bi],fromArea=from[1][0],toArea=quick?from[1][1]:to[1][0],fromName=from[0]+fromArea+"营业部",toName=to[0]+toArea+"营业部",regA=REGION[from[0]]||"华东",regB=REGION[to[0]]||"华东",midCity=quick?"":(regA===regB?regA:regB)+"中转场",svc=quick?"同城急送":(h>>>3)%5===0?"次日达":"标准快递",weight=Math.round((.5+(h>>>8)%42/10)*10)/10,count=1+(h>>>12)%3,goods=GOODS[(h>>>16)%GOODS.length],fee=(12+weight*3.2+(count-1)*2).toFixed(2),recv=NAMES[(h>>>22)%NAMES.length],tel="138****"+(1e3+(h>>>26)%9e3),eta;quick?eta=addHours(t0,4):svc==="次日达"?(eta=addHours(t0,24),eta.setHours(18,0,0,0)):(eta=addHours(t0,48),eta.setHours(18,0,0,0));var idx=stageOf(h,quick),pk={id:typeof genId=="function"?genId("pk"):"pk"+h,code:normalized,v:2,_t0:t0,_stage:idx,_recv:recv,_tel:tel,_sign:SIGNS[(h>>>14)%SIGNS.length],quick,from:fromName,to:toName,fromCity:from[0],toCity:to[0],mid:midCity,weight:weight.toFixed(1)+" kg",count,goods,service:svc,fee,eta:stamp(eta),status:statusAt(quick,idx),timeline:[]};return pk.timeline=buildTimeline(pk,idx,t0),pk}function advance(pk){var t0=pk._t0||Date.now(),max=pk.quick?3:7,bump=Math.floor((Date.now()-t0)/36e5/10),idx=Math.min(max,(pk._stage||0)+bump);return idx!==pk._stage&&(pk._stage=idx,pk.status=statusAt(!!pk.quick,idx),pk.timeline=buildTimeline(pk,idx,t0),typeof DB!="undefined"&&DB.save&&DB.save()),pk}function findOrGen2(code){var normalized=String(code||"").trim().toUpperCase();if(typeof DB=="undefined"||!DB.data)return genPackage2(normalized);Array.isArray(DB.data.packages)||(DB.data.packages=[]);var list=DB.data.packages,i,at=-1;for(i=0;i<list.length;i++)if(String(list[i]&&list[i].code||"").trim().toUpperCase()===normalized){at=i;break}if(at>=0){var old=list[at],ok=old&&old.v===2&&Array.isArray(old.timeline)&&old.timeline.length&&old.timeline.every(function(x){return x&&x.title&&stampValid(x.t)});if(ok)return advance(old);var fresh=genPackage2(normalized);return fresh.id=old&&old.id||fresh.id,list[at]=fresh,DB.save(),fresh}var pk=genPackage2(normalized);return list.push(pk),list.length>200&&list.splice(0,list.length-200),DB.save(),pk}function tagClass(status){return status==="已签收"?"tag tag-green":status==="派送中"?"tag tag-orange":"tag"}function trackHtml2(pk){if(!pk)return"";var rows=(pk.timeline||[]).filter(function(x){return x&&x.title}).map(function(x){return'<div class="tl-item '+esc2(x.state||"")+(x.state==="cur"?" current":"")+'"><div class="t">'+esc2(x.t||"")+"</div><h4>"+esc2(x.title)+"</h4><p>"+esc2(x.desc||"")+"</p></div>"}).join("")||'<div class="empty">暂无物流轨迹</div>';function dayOf(s){var d=new Date(String(s||"").replace(" ","T"));return isNaN(d.getTime())?"":mmdd(d)}var etaText;if(pk.status==="已签收"){var signed=pk.timeline[0]&&pk.timeline[0].t||"";etaText=dayOf(signed)?"已于 "+esc2(dayOf(signed))+" 送达":"已送达"}else{var etaDay=dayOf(pk.eta);etaText=etaDay?"预计 <b>"+esc2(etaDay)+" 前</b> 送达":"预计送达时间待更新"}return'<div class="trk-hero"><div class="trk-top"><div class="trk-status'+(pk.status==="已签收"?"":" on")+'">'+esc2(pk.status)+'</div><div class="trk-eta">'+etaText+'</div></div><div class="trk-meta"><span class="trk-code">'+esc2(pk.code)+'</span><span class="trk-dot"></span><span>'+esc2(pk.service)+'</span><span class="trk-dot"></span><span>'+esc2(pk.weight)+" · "+esc2(pk.count)+' 件</span></div><div class="trk-route"><span class="trk-city"><b>'+esc2(pk.fromCity)+"</b><i>"+esc2(pk.from.replace(pk.fromCity,""))+'</i></span><span class="trk-line"></span><span class="trk-city r"><b>'+esc2(pk.toCity)+"</b><i>"+esc2(pk.to.replace(pk.toCity,""))+'</i></span></div></div><div class="trk-card"><div class="trk-head"><span class="trk-title">物流轨迹</span><span class="trk-sublabel">共 '+esc2((pk.timeline||[]).length)+' 条</span></div><div class="tl">'+rows+'</div></div><div class="trk-card"><div class="trk-head"><span class="trk-title">面单信息</span><span class="trk-sublabel">'+esc2(pk.code)+'</span></div><div class="trk-fields"><div><span>物品</span><b>'+esc2(pk.goods)+"</b></div><div><span>件数 / 重量</span><b>"+esc2(pk.count)+" 件 · "+esc2(pk.weight)+"</b></div><div><span>服务产品</span><b>"+esc2(pk.service)+"</b></div><div><span>运费</span><b>￥"+esc2(pk.fee)+"</b></div><div><span>揽件员</span><b>"+esc2(pk._recv)+" · "+esc2(pk._tel)+"</b></div><div><span>预计送达</span><b>"+esc2(dayOf(pk.eta)?dayOf(pk.eta)+" 前":"待更新")+"</b></div></div></div>"}function viewTrack2(code){var body;return code?body=trackHtml2(findOrGen2(code)):body='<div class="trk-card trk-empty"><div class="trk-empty-ico">📦</div><p>请输入运单号开始查询</p><div class="trk-samples"><a class="trk-sample" href="#/track/NDT7770001234">NDT7770001234</a><a class="trk-sample" href="#/track/NDT6660005678">NDT6660005678</a><a class="trk-sample" href="#/track/NDT8890004321">NDT8890004321</a></div><p class="trk-tip">以上为示例单号，直接点击即可查看轨迹</p></div>',surfaceHeader("track")+'<div class="page-head"><div class="wrap"><h1>快递查询</h1><p>输入运单号，实时查询包裹动态</p></div></div><div class="section"><div class="wrap"><div class="track-box" style="max-width:none;margin:0 0 24px"><input id="tb-code" placeholder="请输入运单号，如 NDT7770001234" value="'+esc2(code||"")+'"><button class="btn btn-orange" id="tb-go">查询</button></div><div id="track-result">'+body+"</div></div></div>"+surfaceFooter()}window.genPackage=genPackage2,window.findOrGen=findOrGen2,window.trackHtml=trackHtml2,window.viewTrack=viewTrack2;try{location.hash.indexOf("#/track")===0&&typeof router=="function"&&router()}catch(e){}}(),function(){"use strict";var KEY="nadutong.topbar.hide",MAXW=900,forced=/[?&]tvh=1\b/.test(location.search)?!0:/[?&]tvh=0\b/.test(location.search)?!1:null,persist=forced===null,ICON_UP='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V7M6 13l6-6 6 6"/></svg>',ICON_DOWN='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v12M6 11l6 6 6-6"/></svg>';function mobile(){return window.innerWidth<=MAXW}function stored(){try{return localStorage.getItem(KEY)==="1"}catch(e){return!1}}function save(v){try{v?localStorage.setItem(KEY,"1"):localStorage.removeItem(KEY)}catch(e){}}var on=forced===null?stored():forced,tgl=document.createElement("button");tgl.type="button",tgl.className="tvh-btn",tgl.id="tvh-toggle";var peeker=document.createElement("button");peeker.type="button",peeker.id="tvh-peek",peeker.setAttribute("aria-label","展开顶部栏"),peeker.innerHTML='<span class="tvh-arrow"></span>',document.body.appendChild(peeker);function paint(){tgl.innerHTML=on?ICON_DOWN:ICON_UP,tgl.classList.toggle("tv-on",on),tgl.setAttribute("aria-label",on?"展开顶部栏":"收起顶部栏")}function topBar(){var p=document.querySelector(".portal");return p?p.querySelector(".portal-top"):null}function hasPortal(){return!!topBar()}function measure(){var t=topBar();t&&t.offsetHeight&&document.documentElement.style.setProperty("--tvh-top",t.offsetHeight+"px")}function enforce(){if(!(!on||!mobile()||!hasPortal())&&!document.body.classList.contains("tvh-peek")){var t=topBar();t&&!t.classList.contains("is-hidden")&&t.classList.add("is-hidden")}}function release(){var t=topBar();t&&t.classList.remove("is-hidden")}function applyMode(){var live=!!on&&mobile()&&hasPortal();document.body.classList.toggle("tvh-on",live),live||document.body.classList.remove("tvh-peek"),paint(),live?enforce():release(),measure()}function setOn(v){on=!!v,persist&&save(on),applyMode()}function setPeek(v){var open=!!v&&hasPortal();document.body.classList.toggle("tvh-peek",open),open?release():enforce(),measure()}tgl.addEventListener("click",function(e){e.preventDefault(),e.stopPropagation(),mobile()&&setOn(!on)}),peeker.addEventListener("click",function(e){e.preventDefault(),e.stopPropagation(),setPeek(!document.body.classList.contains("tvh-peek"))});function repin(){var top=topBar();if(top){if(!top.contains(tgl)){var lo=top.querySelector("#p-logout");lo&&lo.parentNode===top?top.insertBefore(tgl,lo):top.appendChild(tgl)}paint()}}var queued=!1;function refresh(){queued||(queued=!0,setTimeout(function(){queued=!1,repin(),applyMode(),enforce()},0))}new MutationObserver(function(list){for(var i=0;i<list.length;i++)if(list[i].type==="childList"){refresh();return}on&&mobile()&&refresh()}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class"]}),window.addEventListener("resize",applyMode),window.addEventListener("orientationchange",function(){setTimeout(applyMode,260)});var lastY=window.scrollY||0;document.addEventListener("scroll",function(){var y=window.scrollY||0;document.body.classList.contains("tvh-peek")&&y-lastY>8&&setPeek(!1),lastY=y},{passive:!0}),document.addEventListener("click",function(e){if(document.body.classList.contains("tvh-peek")){var t=topBar();t&&e.target&&t.contains(e.target)||setPeek(!1)}},!0),repin(),applyMode()}(),function(){"use strict";var SURFACE={"":1,home:1,track:1,service:1,sites:1,news:1,about:1,author:1,login:1,register:1,gate:1},STEPS=["建立加密安全通道","校验身份凭证","同步异人档案","接入异人论坛"],HOLD=1900,busy=!1;function firstSeg(hash){var raw=String(hash||"").replace(/^#/,""),segs=raw.split("?")[0].split("/").filter(Boolean);return segs[0]||""}function isSurface(hash){return SURFACE[firstSeg(hash)]===1}function isPortal(){return!!document.querySelector(".portal")}var SHIELD='<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"/><path d="M9.2 12l2 2 3.6-4"/></svg>';function injectStyle(){if(!document.getElementById("ie-style")){var st=document.createElement("style");st.id="ie-style",st.textContent="#iv-entry{opacity:1 !important;visibility:visible !important;transition:opacity .55s ease !important;}#iv-entry.is-leaving{opacity:0 !important;visibility:visible !important;}#iv-entry .pe-box{opacity:0;transform:translateY(7px);transition:opacity .5s ease .09s,transform .5s ease .09s;}#iv-entry.is-in .pe-box{opacity:1;transform:none;}@media (prefers-reduced-motion: reduce){#iv-entry .pe-box{transition:none;}}",document.head.appendChild(st)}}function build(){if(busy||document.getElementById("portal-entry")||document.getElementById("iv-entry"))return null;busy=!0;var ov=document.createElement("div");return ov.id="iv-entry",ov.className="portal-entry",ov.innerHTML='<div class="pe-bg"></div><div class="pe-box"><div class="pe-ring"><div class="pe-ring-rot"></div><div class="pe-ring-rot pe-ring-rot2"></div><div class="pe-shield">'+SHIELD+'</div></div><div class="pe-title">哪都通 · 异人论坛</div><div class="pe-step">'+STEPS[0]+'<span class="pe-dots"></span></div><div class="pe-bar"><div class="pe-bar-fill"></div></div><div class="pe-percent">0%</div></div>',document.body.appendChild(ov),setTimeout(function(){ov.classList.add("is-in")},80),ov}function animate(ov){var stepEl=ov.querySelector(".pe-step"),fill=ov.querySelector(".pe-bar-fill"),pct=ov.querySelector(".pe-percent"),i=0,p=0,stepTimer=setInterval(function(){i++,i<STEPS.length&&(stepEl.innerHTML=STEPS[i]+'<span class="pe-dots"></span>')},420),progTimer=setInterval(function(){p=Math.min(100,p+Math.random()*13+7),fill.style.width=p+"%",pct.textContent=Math.floor(p)+"%",p>=100&&(clearInterval(progTimer),clearInterval(stepTimer))},110);setTimeout(function(){ov.classList.add("is-leaving"),setTimeout(function(){ov.parentNode&&ov.parentNode.removeChild(ov),busy=!1},640)},HOLD)}function play(){injectStyle();var ov=build();if(!ov){busy=!1;return}animate(ov)}var played=isPortal()||!isSurface(location.hash),hadPortal=isPortal(),pending=0,checkTimer=0;function schedule(){checkTimer||(checkTimer=setTimeout(function(){checkTimer=0,check()},120))}function check(){if(!played){if(document.getElementById("portal-entry")){played=!0;return}var now=isPortal();now!==hadPortal&&(hadPortal=now,now&&(played=!0,!(document.getElementById("pl-veil")||document.getElementById("iv-entry"))&&play()))}}new MutationObserver(check).observe(document.body,{childList:!0,subtree:!0}),window.addEventListener("hashchange",function(){played||schedule()})}(),function(){"use strict";var GROUPS=[{name:"论坛大厅",items:["论坛首页","发帖提问","云端账号","帖子消息","我的收藏","论坛聊天室"]},{name:"情报档案",items:["在逃异人","异闻典藏"]},{name:"业务系统",items:["异人档案","事件档案","资料库","势力关系网","重点异人关系网","专属名片","工作组","OA 办公","管理员工作台"]},{name:"签卜命理",items:["抽签问吉","四柱八字","塔罗占卜","伏羲六十四卦","黄大仙灵签"]},{name:"个人中心",items:["我的好友","私信","个人空间","个人能力详情","空间装修"]},{name:"拓展功能",items:["方块小游戏","数据中心"]}],EXTRA_NAME="其他",lastTop=0,lastLeft=0;function noteScroll(sd){sd&&(lastTop=sd.scrollTop,lastLeft=sd.scrollLeft)}function sideEl(){return document.querySelector(".nav-wrap .sidebar")||document.querySelector(".sidebar")}function labelOf(el){var l=el.querySelector(".side-item-label");return l?String(l.textContent||"").trim():""}function currentSig(sd){var out=[];return[].forEach.call(sd.children,function(el){if(el.classList&&el.classList.contains("sd-group"))out.push("G:"+String(el.textContent||"").trim());else if(el.classList&&el.classList.contains("side-item")){var k=labelOf(el);k&&out.push("I:"+k)}}),out}function apply(){var sd=sideEl();if(sd){var items=[].slice.call(sd.querySelectorAll(".side-item"));if(items.length){var map={};items.forEach(function(el){var k=labelOf(el);k&&!map[k]&&(map[k]=el)});var listed={};GROUPS.forEach(function(g){g.items.forEach(function(n){listed[n]=1})});var extras=items.filter(function(el){var k=labelOf(el);return k&&!listed[k]}),want=[];GROUPS.forEach(function(g){var members=g.items.map(function(n){return map[n]}).filter(Boolean);members.length&&(want.push("G:"+g.name),members.forEach(function(el){want.push("I:"+labelOf(el))}))}),extras.length&&(want.push("G:"+EXTRA_NAME),extras.forEach(function(el){want.push("I:"+labelOf(el))}));var horizontal=sd.scrollWidth>sd.clientWidth+2,oldTop=lastTop,oldLeft=lastLeft;if(currentSig(sd).join("")===want.join("")){keepScroll(sd,horizontal,oldTop,oldLeft),noteScroll(sd);return}for(;sd.firstChild;)sd.removeChild(sd.firstChild);if(GROUPS.forEach(function(g){var members=g.items.map(function(n){return map[n]}).filter(Boolean);if(members.length){var h=document.createElement("div");h.className="sd-group",h.textContent=g.name,sd.appendChild(h),members.forEach(function(el){sd.appendChild(el)})}}),extras.length){var eh=document.createElement("div");eh.className="sd-group",eh.textContent=EXTRA_NAME,sd.appendChild(eh),extras.forEach(function(el){sd.appendChild(el)})}keepScroll(sd,horizontal,oldTop,oldLeft),noteScroll(sd)}}}function keepScroll(sd,horizontal,oldTop,oldLeft){if(horizontal){var on=sd.querySelector(".side-item.on");on?sd.scrollLeft=Math.max(0,on.offsetLeft-(sd.clientWidth-on.offsetWidth)/2):sd.scrollLeft=oldLeft;try{sd.dispatchEvent(new Event("scroll",{bubbles:!0}))}catch(e){}}else sd.scrollTop=oldTop}var queued=!1;function refresh(){queued||(queued=!0,setTimeout(function(){queued=!1,apply()},0))}var innerObserver=null;function watch(sd){innerObserver&&innerObserver.disconnect(),sd&&(innerObserver=new MutationObserver(refresh),innerObserver.observe(sd,{childList:!0}),sd.__soScroll||(sd.__soScroll=1,sd.addEventListener("scroll",function(){noteScroll(sd)},{passive:!0})))}var lastSide=null,mo=new MutationObserver(function(){var sd=sideEl();sd&&sd!==lastSide&&(lastSide=sd,apply(),watch(sd),refresh())});mo.observe(document.body,{childList:!0,subtree:!0}),window.addEventListener("hashchange",function(){refresh()});function boot(){var sd=sideEl();sd&&(lastSide=sd,apply(),watch(sd))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot):boot()}(),function(root){"use strict";var LUNAR_INFO=[19416,19168,42352,21717,53856,55632,91476,22176,39632,21970,19168,42422,42192,53840,119381,46400,54944,44450,38320,84343,18800,42160,46261,27216,27968,109396,11104,38256,21234,18800,25958,54432,59984,92821,23248,11104,100067,37600,116951,51536,54432,120998,46416,22176,107956,9680,37584,53938,43344,46423,27808,46416,86869,19872,42416,83315,21168,43432,59728,27296,44710,43856,19296,43748,42352,21088,62051,55632,23383,22176,38608,19925,19152,42192,54484,53840,54616,46400,46752,103846,38320,18864,43380,42160,45690,27216,27968,44870,43872,38256,19189,18800,25776,29859,59984,27480,23232,43872,38613,37600,51552,55636,54432,55888,30034,22176,43959,9680,37584,51893,43344,46240,47780,44368,21977,19360,42416,86390,21168,43312,31060,27296,44368,23378,19296,42726,42208,53856,60005,54576,23200,30371,38608,19195,19152,42192,118966,53840,54560,56645,46496,22224,21938,18864,42359,42160,43600,111189,27936,44448,84835,37744,18936,18800,25776,92326,59984,27424,108228,43744,37600,53987,51552,54615,54432,55888,23893,22176,42704,21972,21200,43448,43344,46240,46758,44368,21920,43940,42416,21168,45683,26928,29495,27296,44368,84821,19296,42352,21732,53600,59752,54560,55968,92838,22224,19168,43476,41680,53584,62034,54560],MONTH_CN=["正","二","三","四","五","六","七","八","九","十","冬","腊"],DAY_CN=["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];function info(y){return LUNAR_INFO[y-1900]||0}function leapMonth(y){return info(y)&15}function leapDays(y){var lm=leapMonth(y);return lm?info(y)&65536?30:29:0}function monthDays(y,m){return info(y)&65536>>m?30:29}function yearDays(y){for(var sum=348,i=32768;i>8;i>>=1)info(y)&i&&(sum+=1);return sum+leapDays(y)}function lunarToSolar(ly,lm,ld,isLeap){if(ly<1900||ly>2100||lm<1||lm>12||ld<1||ld>30)return null;var leap=leapMonth(ly);if(isLeap&&leap!==lm||!isLeap&&ld>monthDays(ly,lm)||isLeap&&ld>leapDays(ly))return null;for(var offset=0,i=1900;i<ly;i++)offset+=yearDays(i);for(var m=1;m<lm;m++)offset+=monthDays(ly,m),leap===m&&(offset+=leapDays(ly));isLeap&&(offset+=monthDays(ly,lm)),offset+=ld-1;var base=Date.UTC(1900,0,31),d=new Date(base+offset*864e5);return{y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate()}}function solarToLunar(y,m,d){if(y<1900||y>2100||y===1900&&m===1&&d<31)return null;var offset=Math.floor((Date.UTC(y,m-1,d)-Date.UTC(1900,0,31))/864e5);if(offset<0)return null;for(var ly=1900,temp;ly<2100&&(temp=yearDays(ly),!(offset<temp));)offset-=temp,ly++;var leap=leapMonth(ly),isLeap=!1,lm=1;for(lm=1;lm<=12&&(leap>0&&lm===leap+1&&!isLeap?(lm--,isLeap=!0,temp=leapDays(ly)):temp=monthDays(ly,lm),isLeap&&lm===leap+1&&(isLeap=!1),!(offset<temp));lm++)offset-=temp;offset===0&&leap>0&&lm===leap+1&&(isLeap?isLeap=!1:(isLeap=!0,lm--)),offset<0&&(offset+=temp,lm--);var ld=offset+1,text=MONTH_CN[lm-1]+"月"+(isLeap?"（闰）":"")+DAY_CN[ld-1];return{y:ly,m:lm,d:ld,isLeap,monthName:(isLeap?"闰":"")+MONTH_CN[lm-1]+"月",dayName:DAY_CN[ld-1],text:ly+"年"+text}}function leapMonthOf(y){return leapMonth(y)}root.BaziLunar={lunarToSolar,solarToLunar,leapMonthOf,monthDays,yearDays,MONTH_CN,DAY_CN}}(typeof window!="undefined"?window:globalThis),function(root){"use strict";var GAN=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"],ZHI=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"],GAN_YINYANG=[1,0,1,0,1,0,1,0,1,0],GAN_WX=["木","木","火","火","土","土","金","金","水","水"],ZHI_WX=["水","土","木","木","土","火","火","土","金","金","土","水"],ZHI_CANG=[["癸"],["己","癸","辛"],["甲","丙","戊"],["乙"],["戊","乙","癸"],["丙","庚","戊"],["丁","己"],["己","丁","乙"],["庚","壬","戊"],["辛"],["戊","辛","丁"],["壬","甲"]],SHENGXIAO=["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];function toJD(y,m,d,hh,mm){hh=hh||0,mm=mm||0,m<=2&&(y-=1,m+=12);var A=Math.floor(y/100),B=2-A+Math.floor(A/4),day=Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5;return day+=(hh+mm/60)/24,day}function sunLongitude(jd){var T=(jd-2451545)/36525,L0=280.46646+36000.76983*T+3032e-7*T*T,M=357.52911+35999.05029*T-1537e-7*T*T,e=.016708634-42037e-9*T-1267e-10*T*T,rad=Math.PI/180,C=(1.914602-.004817*T-14e-6*T*T)*Math.sin(M*rad)+(.019993-101e-6*T)*Math.sin(2*M*rad)+289e-6*Math.sin(3*M*rad),theta=L0+C,omega=125.04-1934.136*T,app=theta-.00569-.00478*Math.sin(omega*rad);return app=(app%360+360)%360,app}function equationOfTime(jd){var T=(jd-2451545)/36525,L0=280.46646+36000.76983*T,M=357.52911+35999.05029*T,e=.016708634-42037e-9*T,rad=Math.PI/180,eps=23.439291-.0130042*T,y=Math.tan(eps/2*rad);y=y*y;var Etime=y*Math.sin(2*L0*rad)-2*e*Math.sin(M*rad)+4*e*y*Math.sin(M*rad)*Math.cos(2*L0*rad)-.5*y*y*Math.sin(4*L0*rad)-1.25*e*e*Math.sin(2*M*rad);return Etime*4}function solarTermJD(year,target){var jd0=toJD(year,1,1,0,0),jd=jd0,lon=sunLongitude(jd0),diff=((target-lon)%360+360)%360;jd+=diff/.9856;for(var i=0;i<8;i++){var l=sunLongitude(jd),d=((target-l)%360+360)%360;if(d>180&&(d-=360),Math.abs(d)<4e-4)break;jd+=d/.9856}return jd}var JIE_QING=[{name:"小寒",lon:285},{name:"立春",lon:315},{name:"惊蛰",lon:345},{name:"清明",lon:15},{name:"立夏",lon:45},{name:"芒种",lon:75},{name:"小暑",lon:105},{name:"立秋",lon:135},{name:"白露",lon:165},{name:"寒露",lon:195},{name:"立冬",lon:225},{name:"大雪",lon:255}];function jieOfYear(year){for(var out=[],i=0;i<JIE_QING.length;i++){var lon=JIE_QING[i].lon,jd;lon>=285,jd=solarTermJD(year,lon),out.push({name:JIE_QING[i].name,lon,jd})}return out.sort(function(a,b){return a.jd-b.jd}),out}function jdToDate(jd){var z=Math.floor(jd+.5),f=jd+.5-z,t=z;if(t>=2299161){var alpha=Math.floor((t-186721625e-2)/36524.25);t+=1+alpha-Math.floor(alpha/4)}var b=t+1524,c=Math.floor((b-122.1)/365.25),d=Math.floor(365.25*c),e=Math.floor((b-d)/30.6001),day=b-d-Math.floor(30.6001*e)+f,month=e<14?e-1:e-13,year=month>2?c-4716:c-4715,dInt=Math.floor(day),frac=(day-dInt)*24,hh=Math.floor(frac),mm=Math.floor((frac-hh)*60);return{y:year,m:month,d:dInt,hh,mi:mm}}function gzName(g,z){return GAN[(g%10+10)%10]+ZHI[(z%12+12)%12]}function dayGanZhi(y,m,d,offsetDays){var jd=Math.floor(toJD(y,m,d,0,0)+.5)+(offsetDays||0),ANCHOR_JD=2451545,ANCHOR_IDX=54,diff=jd-ANCHOR_JD,idx=((ANCHOR_IDX+diff)%60+60)%60;return{g:idx%10,z:idx%12,idx}}function yearGanZhi(bjJD){var dt=jdToDate(bjJD),y=dt.y,lichun=solarTermJD(y,315);bjJD<lichun&&(y-=1);var idx=((y-4)%60+60)%60;return{g:idx%10,z:idx%12,idx,year:y}}function monthGanZhi(bjJD){for(var dt=jdToDate(bjJD),y=dt.y,list=jieOfYear(y),prev=null,next=null,i=0;i<list.length;i++)list[i].jd<=bjJD&&(prev=list[i]),list[i].jd>bjJD&&!next&&(next=list[i]);if(!prev){var pl=jieOfYear(y-1);prev=pl[pl.length-1];var cur=jieOfYear(y);next=cur[0]}if(!next){var nl=jieOfYear(y+1);next=nl[0]}var lon=prev?prev.lon:315,monthZhi=(((lon-315)/30+2)%12+12)%12,yGz=yearGanZhi(bjJD),startGan=yGz.g%5*2+2,g=((startGan+(monthZhi-2+12)%12)%10+10)%10;return{g,z:monthZhi,jie:prev?prev.name:"",jieJD:prev?prev.jd:0,nextJD:next?next.jd:0}}function hourGanZhi(dayGan,hourZhi){var startGan=dayGan%5*2,g=((startGan+hourZhi)%10+10)%10;return{g,z:hourZhi}}function hourZhiOf(hh,mi){var t=hh*60+mi;return t>=23*60||t<60?0:Math.floor((t-60)/120)+1}var CITY_LON={北京:116.41,上海:121.47,天津:117.2,重庆:106.55,广州:113.26,深圳:114.06,杭州:120.16,南京:118.8,苏州:120.62,无锡:120.31,宁波:121.55,温州:120.7,合肥:117.27,福州:119.3,厦门:118.09,南昌:115.89,济南:117,青岛:120.38,烟台:121.39,郑州:113.65,武汉:114.3,长沙:113,成都:104.07,贵阳:106.63,昆明:102.83,南宁:108.32,海口:110.35,西安:108.94,兰州:103.83,西宁:101.78,银川:106.28,乌鲁木齐:87.62,拉萨:91.13,呼和浩特:111.67,太原:112.55,石家庄:114.51,沈阳:123.43,长春:125.32,哈尔滨:126.53,大连:121.62,香港:114.17,澳门:113.54,台北:121.56};function trueSolarTime(y,m,d,hh,mi,lon){for(var jd=toJD(y,m,d,hh,mi)-.3333333333333333,eot=equationOfTime(jd),delta=(lon-120)*4+eot,total=hh*60+mi+delta,dayShift=0;total<0;)total+=1440,dayShift-=1;for(;total>=1440;)total-=1440,dayShift+=1;return{hh:Math.floor(total/60),mi:Math.round(total%60),deltaMin:Math.round(delta),dayShift}}function wxRelation(dayWx,otherWx){var order=["木","火","土","金","水"],d=order.indexOf(dayWx),o=order.indexOf(otherWx);if(d<0||o<0)return"";var rel=((o-d)%5+5)%5;return["同我","我生","我克","克我","生我"][rel]}function tenGod(dayGan,otherGan){var rel=wxRelation(GAN_WX[dayGan],GAN_WX[otherGan]),same=GAN_YINYANG[dayGan]===GAN_YINYANG[otherGan];switch(rel){case"同我":return same?"比肩":"劫财";case"我生":return same?"食神":"伤官";case"我克":return same?"偏财":"正财";case"克我":return same?"七杀":"正官";case"生我":return same?"偏印":"正印";default:return""}}function tenGodsOfZhi(dayGan,zhi){for(var arr=[],cang=ZHI_CANG[zhi]||[],i=0;i<cang.length;i++){var gi=GAN.indexOf(cang[i]);gi>=0&&arr.push({gan:cang[i],god:tenGod(dayGan,gi)})}return arr}var TIANYI=["丑未","子申","亥酉","亥酉","丑未","子申","寅午","寅午","卯巳","卯巳"],WENCHANG=[4,5,6,7,8,9,10,11,0,1],YANGREN=[3,4,5,0,1,2,9,10,11,6],LUSHEN=[2,3,5,6,8,9,11,0,2,3],TAOHUA_BY_ZHI=[9,6,3,0,9,6,3,0,9,6,3,0],YIMA_BY_ZHI=[2,8,5,11,2,8,5,11,2,8,5,11],HUAGAI_BY_ZHI=[4,1,10,7,4,1,10,7,4,1,10,7],JIANGXING_BY_ZHI=[0,9,6,3,0,9,6,3,0,9,6,3],TIANDE=["丁","申","壬","辛","亥","甲","癸","寅","丙","乙","巳","庚"],YUEDE_GROUP=[2,9,5,11],YUEDE_GAN=["丙","壬","甲","庚"],TAIJI=[["子","午"],["子","午"],["卯","酉"],["卯","酉"],["辰","戌","丑","未"],["辰","戌","丑","未"],["寅","亥"],["寅","亥"],["巳","申"],["巳","申"]],GUCHEN=[2,2,2,5,5,5,8,8,8,11,11,11],GUASU=[10,10,10,1,1,1,4,4,4,7,7,7],HONGLUAN=[3,2,1,0,11,10,9,8,7,6,5,4],JINYU=[4,5,7,8,7,8,10,11,1,2],JIESHA=[5,2,11,8,5,2,11,8,5,2,11,8],WANGSHEN=[11,8,5,2,11,8,5,2,11,8,5,2],SHENSHA_DB={天乙贵人:{tip:"一生人缘佳，遇事有人解救危难，化险为夷。",gujue:"“甲戊庚牛羊, 乙己鼠猴乡, 丙丁猪鸡位, 壬癸兔蛇藏, 六辛逢虎马, 此是贵人方。”",chafa:`以日/年干查四地支

      人命有天乙贵人，遇事有人帮，临难有人解，是化险为夷最有力的贵人之星。
  天乙贵人：人缘、社交缘、异性缘、长辈缘。一生少病，人缘佳，易有社会地位，很适合从事公关性质的工作。
  
  　　经书有云：『天乙者，乃天上之神，与太乙并列，其神最尊贵，所到之处，危难隐然而避。』由此可知天乙贵人之神通广大，遇吉神则有喜上加喜之庆。逢而为喜，富加且贵，是吉祥之神。凡人命遇之，昌荣有望，达人逢之，功名早显。
  
  　　天乙贵人入命：心性聪明，出入近贵。大运流年见天乙贵人：有生官发财之机，最少亦有吉祥庆事加临。天乙贵人坐旺地：身体健康吉祥富贵，福禄加倍。天乙贵人逢合为忌：多见劳苦，劳苦功高。天乙贵人逢刑冲：多劳累，遇事则贵人去。女命天乙贵人入命、日主自坐二德者：可嫁贵夫。
  
  　　天乙贵人是八字里面最重要、最吉祥的一颗贵人星，八字带天乙贵人吉星的人，无形之中会散发一种贵气，给人亲切好相处的感觉。还可以转危为安，有很多人发生了意外的危难，受到的伤害却很小，经常都是因为八字里面带有天乙贵人这颗贵人吉星。
  
      如为喜用，不冲克刑害，多受器重提携与拥护。如毛爷爷出生的丁酉日。`},太极贵人:{tip:"聪明好学，喜神秘事物（与华盖并用，又临戌亥，在易学方面多有成就。）",gujue:`甲乙生人子午中，丙丁鸡兔定亨通，
      戊己两干临四季，庚辛寅亥禄丰隆，
      壬癸巳申偏喜美，值此应当福气钟，
      更须贵格来相扶，候封万户到三公。`,chafa:`以日/年干查四地支

      太极者，太初至极之谓。造物之所始，既生不灭，是谓太极。
  　　命中带有太极贵人的八字，可以事职平顺亨通、福禄兼得，事情能够化险为夷，一生多得贵人相助，晚年可以幸福安逸，太极贵人可以说是一颗非常珍贵的吉星。
  
      五行有始有终，造化始终相保，谓之太极。甲乙木生于子，终于午。丙日、丁月出于卯，落于酉，戊己土藏于辰戌丑未四维之库，庚辛金生于寅（垦卦），成于亥（乾卦），壬癸水生于申（坤卦），纳于巳（巽卦），人命逢之，主聪明好学，有钻劲，喜文史哲宗教等科目，为人正直，做事有始有终。如得生旺及有贵格吉星相扶助，主气宇轩昂, 福寿双全, 富贵人间。`},文昌贵人:{tip:"聪明有才华，文笔能力强，利读书考学著书。",gujue:`甲乙巳午报君知, 丙戊申宫丁己鸡。庚猪辛鼠壬逢虎, 癸人见卯入云梯。
甲日巳。乙日午。丙日申。丁日酉。戊日申。己日酉。庚日亥。辛日子。壬日寅。癸日卯。`,chafa:`以日、年干查四地支
文昌多取食神之临官为贵, 为食神建禄之称。文昌入命,主聪明过人,又主化险为夷。气质雅秀,举止温文,男命逢着内涵,女命逢着仪容得体；具有上进心，不与粗俗之辈乱交朋友。

文昌逢合为喜：富加且贵。文昌逢合为忌：多见忙碌，劳苦功高。文昌坐旺地：身体健康，幸福如意，利考试，贵气十足。文昌逢刑冲：劳累辛苦。

文昌入命：心性聪明，出入近贵，气质文雅，好学新知，一生可以近贵利官。`},国印贵人:{tip:"正直忠信，若生旺得其他吉神辅助，可得掌印之权。",gujue:"甲见戌, 乙见亥, 丙见丑, 丁见寅,戊见丑, 己见寅, 庚见辰, 辛见巳，壬见未, 癸见申。",chafa:`以年、日干查四支
四柱带国印者，主人诚实可靠，严守清规，照章行事，办事公道，为人和悦，礼义仁慈，气质轩昂。如国印逢生旺，有其它吉星相助，不逢冲破克害，不仅可以有掌印之能，可亦为官掌实权。

亦主一生工作，生活环境多动，若流年岁运逢之即主工作变动或家庭搬迁。`},金舆:{tip:`财帛之星和配偶相关联，会受到配偶之资助，技术之相助。
与车有缘，拥有私车，交通事故等。`,gujue:"甲龙乙蛇丙戊羊, 丁己猴歌庚犬方,辛猪壬牛癸逢虎, 凡人遇此福气昌。",chafa:`以日、年干查四地支
日坐金舆：能得异性之助；命带金舆：得祖荫。又称金舆禄神，此星入命能得扶助，一生能得富贵。
女人逢之，幸福安吉、骨肉安泰。
男人逢之，得贤妻，享妻钱财，荣富显贵。

古代皇族，多带此星。金舆是贵人乘坐的车子。乃禄命之旌旗，三才之节钺。主人性柔、貌美，举止温顺。`},禄神:{tip:"日主得根有利，身体健康，充满信心。",gujue:`甲禄寅。乙禄卯。丙禄巳。丁禄午。戊禄巳。
      己禄午。庚禄申。辛禄酉。壬禄亥。癸禄子。`,chafa:`以日干查四地支

      身旺见禄，喜见财官。身弱喜禄而逢死绝遭刑冲，又逢吉祥救应，家运可能不太顺利，容易影响到置产、家人之间的关系；同时在求财方面也较为困难。
  
      见年神篇“元禄神”。主身体健康，充满信心，记忆力强，勤劳致富，一生少闲，性刚，容易得罪人。武富、武贵，技术研究方面独具慧眼。
  
      在年月为“建禄”，四柱天干要见财官，“建禄生是月，财官喜透天”也。透财，富。透官，贵。
  
      在时为“归禄”，不喜官星，“日禄归时没官星，号曰青云得路。”主少年发达。“建禄”主长辈之荫，主少年时代幸福。若逢卫破，家运可能不太顺利。身（日主）若太旺，不屑于祖辈留有的家产，不愿坐享现成之福，会自己在外乡创事业。若逢偏印，即破禄而无禄。
  在日为“专禄”（甲寅、乙卯、庚申、辛酉四日），主会享受，爱过阔绰的生活。要有羊刃来保护（因禄柔、刃刚），若被合去则无禄。被冲不利丈夫或者妻子的健康和运势。
  
      “归禄”喜羊刃、身旺、财星。不但不会追求物质享受，反而勤奋努力。逢合变无禄，逢冲，不利子女的健康和运势。“归禄”见食神、财星，多主名利双收。
  
      八字如果有禄有财：丰盈一生。八字如果有禄无财：祖先庇荫。八字若无禄有财：白手起家。大运流年与禄神冲克：可能有意外危险，难聚财，健康上也要注意。
  　　
      女命禄神与桃花同柱：为异性多付出。禄刃同柱：不利钱财与姻缘。
  
  　　禄神在空亡之地：称为『财库落空』，一生做事只怕是有劳无功，虚名虚利。禄神逢冲：叫做破禄，就是一般常听所谓『破财』。大运流年逢之，不可轻言忽视，小心意外事故。
  
  　　八字有禄神入命，予人有财有富之感，一生重视钱财，有金钱观念。精神力超强，脚踏实地，多见努力。企划技术能力强，个性稍见内向，较不善交际，能得人望。`},羊刃:{tip:"武职之星，主观性、好胜心、倔强、刚烈、勇猛、担当、急躁。",gujue:`甲日卯。乙日寅。丙日午。丁日巳。戊日午。
己日巳。庚日酉。辛日申。壬日子。癸日亥。`,chafa:`以日干查四地支
羊刃+血刃+驿马同柱：人身意外、多惊多险、交通意外事故。
时刃者, 岁运并临, 可能会有意外危难。
年刃者，祖上家运可能不太顺利，影响到置产、钱财储蓄、家人之间的关系。
比如：癸卯 甲子 甲辰 癸酉此一八字出身农家。又如：乙酉 戊寅 庚申 戊寅此男命，年刃栽根，不仅少年丧父，且平生与妻不和。

一般格局中，透出杀神皆要制合，惟刃格大忌制化之。
羊刃常见于警察、军人。
羊刃是一种很强硬的气力，但它不一定是凶恶的，必须看八字中的整体组合。

假如一个人的八字很弱，羊刃可以起到很大的匡助作用，比如你贫穷困难时，羊刃就是一个强有力的兄弟，能帮助和支持你；假如八字比较旺，再来羊刃的话就危险了，缺乏适当制约的话，他会与你争夺，劫财。

羊刃是五行过旺之气，通常被认为是凶星。刃，即刀，故亦常与手术、杀伤有关。情绪容易激动，易树敌，生涯充满惊涛骇浪。从事机械、技术之研究，成功的人很多。虽然常碰到困难，但若成功时，所缔造的都是丰功伟业。

羊刃一忌重犯，二忌羊刃逢三合六合于岁运。三忌羊刃跟太岁冲战。羊刃一忌重犯叠遇，犯之必凶所谓“劫财羊刃，切忌时逢，岁运许临，祸患立至”是也。比如原局有子午卯酉四刃，岁运又逢则谓犯重刃，会主求财较为困难，与父亲缘薄，不常往来。夫妻感情多波折。其中尤以午午、酉酉相见大凶，以午酉重叠有相刑之象。

二忌羊刃逢三合六合于岁运。太岁乃凶神羊刃乃凶煞，羊刃三合六合太岁，则小心意外事故。比如甲刃在卯忌亥未戌流岁合之，若命中原犯三合六合，岁运再逢大忌；若原局无此病端则刃合岁灾稍轻。

三忌羊刃跟太岁冲战。经云：“羊刃冲合岁君，勃然祸至”是也。羊刃不可冲犯，犯之大怒凶性发；命中原刃最忌跟太岁冲战，比如甲刃在卯忌见酉年相战，可能会有意外的危难。

羊刃制凶要官杀制化去其暴气方可温顺驯服。甲刃在卯。要庚辛申制合，忌酉冲之；丙刃在午，要见壬癸亥制合，忌子冲之；戊刃在午，要见甲乙寅卯制合，忌子冲亡；庚刃在酉，要丙丁巳午制亡，忌卯冲之；壬刃在子，要戊已戌丑未制之，忌午冲之。刃杀两凶互相制伏，日主从中渔利方善驾驭也。刃杀相见也要力量相等匹配，方为大贵之造。刃重杀柔要补杀，杀重刃轻要补刃，或用食制杀印化杀来助刃平定杀气。

羊刃颇忌伤食之星护卫，则杀官制化之功难于作用；若羊刃与伤食互倚成党，对命主可能会有不利的事情。
`},飞刃:{tip:"人身意外、争端、是非之星，出现在月时两柱最严重。（除非有贵人星化解，最忌刑冲）。",gujue:"甲羊刃在卯，如果地支见酉，即为飞刃;乙刃在寅,寅申相冲,即为飞刃;丙戊羊刃在午，地支见子，即为飞刃;丁己羊刃在巳,地支见亥，即为飞刃;庚羊刃在酉,地支见卯，即为飞刃;辛羊刃在申, 地支见寅，即为飞刃;壬羊刃在子,地支见午，即为飞刃;癸羊刃在亥，地支见巳，即为飞刃。",chafa:`以日干查四地支
羊刃的六冲
如果原局羊刃，再遇其他支或流年有飞刃，身体健康上容易出问题。`},流霞:{tip:"男忌酒色，女子在临盆分娩的时候需要注意。",gujue:`甲日酉。乙日戌。丙日未。丁日申。戊日巳。
己日午。庚日辰。辛日卯。壬日亥。癸日寅。`,chafa:`以日干查四地支

流霞逢冲：易犯人身意外。男命：酒色。女命：分娩方面的意外。
　　古人称血煞。轻者可能会有皮肉之伤，健康方面的问题，重者可能会有人身意外。
命犯血煞，最怕八字凶神带重，大运流年又走在凶煞冲克之地，可能会因为一些事情而受伤或出现人身意外，如果八字有吉神转化，是可以化险为夷的。岁运走在流霞、血支、血刃的流年，不论轻重，或多或少可能会受伤。如果是在不利的流年岁月期间，外出、开车多加小心谨慎，防止意外发生的严重性增加。  
`},红艳煞:{tip:"有魅力，多情，婚姻不顺。",gujue:`甲日午。乙日午。丙日寅。丁日未。戊日辰。
己日辰。庚日戌。辛日酉。壬日子。癸日申。`,chafa:`以日干查四地支

红艳煞是桃花的一种。命见红艳煞不见得有多漂亮，但风流多情，好美色，人命犯之，多数有外遇桃花，男女感情方面他把控的不太好，容易有纠纷。女命见之，难免私情，一谈恋爱可能就会陷入同居生活，如果地支有日干的禄，又带驿马，为生理欲望较强之人。

女命，红艳与正官或正印同柱：乃良妇也。女命，红艳与七杀同柱：易见外遇，不利姻缘。女命，红艳逢冲：须防身体健康的问题。女命，红艳逢合：桃花不断。女命，红艳坐凶煞：多见桃花灾。

红艳入命大都多情善交际、好花钱、一生可能会有酒色之灾。`},驿马:{tip:`升迁，调动，走动，迁移，奔波，换工作，出国等。
      贵人驿马多升擢，常人驿马多奔波。`,gujue:"申子辰马在寅，寅午戌马在申，巳酉丑马在亥，亥卯未马在巳。",chafa:`以年、日支查余三支

      代表这个人一生走动多、远行、会出远门。一生驿马运重，即使是在一个地方，也经常会忙个不停，这些都是驿马的作用。
  
      驿马坐旺地：利禄亨通。驿马为喜用：心高气爽，动则有喜。四柱财官有力，真好马也。驿马为喜用，自坐财官地：岁运逢财官星，主升迁。驿马为忌且逢冲：是非波动。吉神坐马：有乔迁之喜或顺动之利。凶神坐马：奔走四方，忙于生计。驿马与财星同柱：为喜则财源广进；为忌则奔走四方。驿马与财官、贵人同柱：才是真马。驿马与正官同柱：为喜者风儒雅士，为忌者性格开放。驿马坐七杀，带羊刃或劫煞：小心突发事故。驿马逢冲，带羊刃、元辰、空亡：注意人身意外。驿马见合：有牵制之虑。驿马坐死墓绝、羊刃、劫煞：做事有始无终，飘泊无定。驿马自坐绝地：凶，尤岁运再逢冲。驿马自坐死、绝方：做事少成。桃花坐马：为情爱受难。驿马坐劫煞或羊刃：劳碌奔波，心性多冲动；尤岁运再逢。劫煞坐马：容易有意外危险。马星生财者：有名扬之机。男命，驿马自坐财星：娶他乡富女。女命，驿马与天乙贵人同柱：不利姻缘。女命，驿马坐独官：夫为有用人，儿孙亦同。女命，驿马自同：嫁远乡。
  
  　　驿马逢冲：心猿意马，奔波，忙碌，乃天涯之客。流年驿马逢冲：此年多奔波，有迁异职动之机，并多见出国或远行。驿马冲动，若带羊刃、血支等神煞，应该小心行事。
  　　命带驿马的人比较闲不下来，经常总是把自己弄得很忙，所以古人说『驿马入命，心不安闲』即是此谓。`},将星:{tip:"权力之星，易掌握权势，有老板或主管之命，具有领导力、威慑力。",gujue:`子日子。丑日酉。寅日午。卯日卯。辰日子。巳日酉。
午日午。未日卯。申日子。酉日酉。戌日午。亥日卯。`,chafa:`以年、日支查余支

将星入命：能文能武，一生有权柄威信，具有组织领导能力，会见掌权之机。将星为真格：须正官、七杀有力，或印星有力。将星入命，岁运为财官：大权在握，利禄亨通。将星与亡神同现：才智过人，深具谋略，会是栋梁之才。将星无破：财、官运亨通。将星三合为忌神：奔波多劳。将星逢冲克，权利事职有变动。
　　将星跟权力地位有关，命带将星的人，给人不可侵犯的感觉，很自然的散发出一种无形、难以言喻的权威感，让人望而生敬。很多做官的人或工商高层主管八字里面大都带有将星，所以也称为将权，八字带有将星，称做将权入命。`},华盖:{tip:`文章、艺术、聪明、孤独，宗教、佛道，浪迹江湖。
艺术之星，多有文学，音乐，设计方面的天赋，但性情较孤独，具有敏感性质。`,gujue:"寅午戌见戌,亥卯未见未,申子辰见辰, 巳酉丑见丑。",chafa:`以年、日支查余支

      华盖是一颗吉祥之星，有揽护君主威严的职权，所以华盖是权力的象征，也是工作职事变化的代表性，亦是艺术之星。
      华盖临生旺地为喜用，此人才华横溢；
      华盖临（日干）墓地，在日支和时柱为忌，不利子女的健康或运势；若有气，可能为僧道；
      华盖+七杀、桃花，可能成为艺人、巫师；
      华盖+桃花+贵人，会为艺人明星。
      
          华盖是八字忌神，虽然聪明好学，但个性比较有孤僻现象，常见血气方刚，不靠六亲。如果是八字喜神，一生可以自立更生，见解超群，才华有过人之处；可谓气宇不凡，是一个有条件、有能力成就事业的人。
      
      　　双华盖入命：命中多贵人。华盖为八字吉神：一生利官近贵，技艺出众。岁运华盖逢刑冲：事职有动；若岁运不利，小心意外危难。华盖坐空亡、或逢刑冲：工作起伏变动较多。华盖带将星，福气深厚。华盖在空亡、死、绝之地，可修身养性，修习佛理，净化自身。女命，华盖坐日支：形同寡宿。
      
      　　一般都称华盖为孤独之星，如上所言确实如此。有很多方外出家人、在家修道人，甚至九流技术艺业的人，八字里面都带有华盖。`},劫煞:{tip:"入喜用支而处生旺则才智过人，可创业绩。反之家运可能不太顺利，难聚财，严重会惹上法律纠纷，事与愿违。",gujue:"寅午戌见亥，申子辰见巳，巳酉丑见寅，亥卯未见申。",chafa:`以年、日支查余三支
三合局第三个字的下一位
劫煞主意外危难、健康、刑法上面的问题。为喜具有竞争心，肯求上进，做事有魄力，敢担当。劫煞与贵星同柱：谋事有成。劫煞与天乙贵人、或喜用神同柱：有才能和智谋。劫煞与羊刃同柱：小心意外危险。`},亡神:{tip:"临喜用，则善于谋略，胸有城府；临死绝则遇事浮躁，气量较小，脾气阴晴不定，经常任性而为。",gujue:"寅午戌见巳, 亥卯未见寅, 巳酉丑见申, 申子辰见亥。",chafa:`以年、日支查余三支
三合局中神的前一位  
亡神若为命局中所喜用的地支，并与吉神同柱，则会沉稳干练，谋略深算，严谨有威，好胜心强。如果恰为命局所忌的地支，又与其它凶煞同柱，则性情中存在着虚伪掩饰的成分，家业容易不顺，影响置业和储蓄；夫妻感情一般，多波折；子女的健康或运势也容易出现问题；自己也经常得罪人，严重的话会有法律纠纷出现。

亡神入命：城府多深，做事疑虑。
亡神与天乙贵人同现：老谋深算。
亡神为喜：面有威仪、足智多谋、处事严谨、断事如神，是一个真人不露相的人。
最怕亡神是命中凶忌之神：其人心性难定、事难如愿、脾气粗俗。

亡神入命为八字凶神的人，做起起事来总感觉无精打采，不利家运，一生难免争纷，严重者可能会惹上法律纠纷，容易涉足酒色场所。不管男命还是女命，夫妻间都容易争吵，子女也会有不省心的情况发生。古人论命特别强调了亡神入命的危害，其实不是没有道理。`},天罗地网:{tip:"注意健康问题、容易惹上法律纠纷。",gujue:"凡纳音火命，见戌亥日为天罗；水土命，见辰巳日为地网，金木二命无之。",chafa:`查法一（现代）：以年日支查余三支
      戌亥为天罗，辰巳为地网；
      戌见亥, 亥见戌为天罗；
      辰见巳, 巳见辰为地网；
      男忌天罗, 女忌地网。
      
      查法二（古代）：以年纳音查日支
      火命人逢戌亥日为天罗, 水土命逢辰巳日为地网. 男忌天罗, 女忌地网.
      
      
      此处采用查法一（现代）
      
      
      天罗地网, 容易惹上法律纠纷, 大运流年遇之,于人不利，若天月二德解救则无忧。
      
      大多命带罗网的人，在人生旅途上所接受的考验、打击较重大，须奋斗挣扎才能出人头地，若命格不高，意志不足就被命运之神俘虏，庸庸碌碌过其一生；有的则甘心落后，误入歧途。
      
      天罗地网逢三刑六害之神，再见魁罡、身强杀重、官杀混杂，伤官见官、财星在偏印皆主会触犯刑律，验率颇高。`},桃花:{tip:`1、代表魅力、社交缘、风流（女人比较忌，桃花喜空亡）
2、代表鉴赏能力、装饰能力`,gujue:"申子辰在酉, 寅午戌在卯, 巳酉丑在午, 亥卯未在子。",chafa:`以年、日支查余三支
咸池是取日入之义, 指万物暗昧之时"日出扶桑, 入于咸池", 故五行沐浴之地曰咸池，又名桃花。 主要影响一个人的情感,魅力和恋爱, 婚姻生活,附带还有隐秘,阴暗,酒水之类的影响。命带桃花,其人性巧,有同情心,爱风流,多才艺,能艺术,如果八字出现桃花而且处于生旺之地则主其人姿容俊美,如果是男人,则慷慨好交游,喜美色;如果是女人则风情万种, 漂亮诱人。桃花并主聪明,异性缘佳。桃花忌见水,见之则生理欲望比较强。如申子辰人逢癸酉或亥子丑水。时支桃花,时干不宜再见伤官,因为伤官本身已伤害官星(夫星),如再坐桃花, 将导致多夫,及婚姻不美满的情形。

桃花在年月：称为『内桃花』，夫妻恩爱。桃花在日时：称为『外桃花』，夫妻多纷争；尤岁运再逢。时上桃花：桃花强，感情丰富。桃花入命，干见杀星：为人多情、欲望强。桃花与禄神同柱：有异性缘。桃花与羊刃同柱：感情风波，是非多灾。桃花与空亡同柱：人缘有欠缺之忧，一生为情多苦。桃花与元辰同现或桃花逢刑冲：可能会因为钱财女人方面遇到问题。不易犯桃花者：桃花坐空亡；命不带桃花。男命，桃花合禄：一生多有女贵人，多见帮助。男命，桃花与禄神同柱：能得桃花之助力。女命，流年大运见桃花刑冲：不利姻缘。

桃花喜与正官、正印同柱：表示自己有自制能力，不致于滥。喜与食神同柱：表示将欲求转为文学、艺术的才华。忌与七杀同柱：表示容易为欲望犯罪，女性则被迫，坠入风尘。与伤官同柱（欲望强）：表示喜新厌旧、容易自恃才貌、追求时髦，对于感情不太在乎。与劫财同柱：敢爱敢恨、横刀夺爱、争风吃醋。与偏印同柱：生理欲望较强，同性。与比肩同柱：孤芳自赏、独身主义。 

另外，《三命通会刑冲带合》中认为，“干合支刑”也是喜爱喝酒的典型标志。比如甲子见己卯，丙子见辛卯，庚申见乙巳，干合支刑，上合下刑，多犯酒色。

看有无外遇，则看命局中有无劫夺妻或夫之象。`},灾煞:{tip:"又名白虎煞，主人身意外。有天月吉神相助，多主武权之威。",gujue:"申子辰见午, 亥卯未见酉, 寅午戌见子, 巳酉丑见卯。",chafa:`以年支查余三支
灾煞也叫“白虎煞”，其性勇猛，冲破将星，谓之灾煞。
此煞主人身意外，根据所处五行支，在水火，防焚溺，金木，杖刃；土，坠落瘟疫。若与七杀同柱来克身，可能有危难。也主刑律官司。若灾煞是正官、正印的生旺之支，多是武权。`},孤辰:{tip:`『男怕孤、女怕寡』

性格孤僻沉默不语、清心寡欲、依恋安逸。

男命逢孤辰,平生感情多波折。女命逢寡宿，姻缘不利。孤寡与驿马并，流浪他乡，与华盖并于日时,恋情较晚，或为僧尼。与空亡并，小的时候能依靠的人较少，一生不太平稳，四处奔走。`,gujue:`亥子丑人, 见寅为孤, 见戌为寡；
寅卯辰人, 见巳为孤, 见丑为寡；
巳午未人, 见申为孤, 见辰为寡；
申酉戌人, 见亥为孤, 见未为寡。`,chafa:`以年支查余三支
孤辰入命：生性多孤独，孤枕独眠。古人常说『男怕孤、女怕寡』，八字里面孤辰、寡宿同现：常见事与愿违。男命：为人孤独。女命：为人独立。

男命怕孤辰落在财星之地，或日主的死绝之方。女命怕寡宿落在夫星之地，或日主的死绝之方。这现像造成缘份难偕久之憾，难免刑克，内心容易伤感，尤其是孤寡入命又见空亡的八字，一生比较孤单。八字忌孤辰、寡宿同时入命。

　　如果命带孤辰或寡宿，八字又有华盖出现，则是一个非常聪明的孤独之人，往往具有特殊才华，很多艺术家、哲学家、五术家，或是修道者、牧师，多是这种命格。

　　孤辰、寡宿也叫做隔角煞，又叫绝情煞。在年月柱，与六亲缘份淡薄，独立自成之命。在日柱，夫妻男女缘份淡薄。在时柱，与子孙缘分淡薄。

　　命带孤辰、寡宿的人，不具交际能力与手腕，兄弟朋友情谊也显得有始无终，这就是孤寡入命终须寂的道理。所以八字有孤寡的人，其实无须汲汲追求社交或过份接近喧嚣人潮，养性独处反而显得安然自得。古来五术界得以流芳者，大都八字有孤寡、华盖空亡等神煞入命，惟能处静耐寂之人才得以花长时间研究探讨精深命理。

凡人命犯孤寡，主形孤肉露,面无和气。生旺稍可,死绝尤甚。孤寡如有贵神相扶, 不至为害, 甚至"孤辰寡宿带官印,定做丛林领袖"。

孤辰寡宿是印星与财星的墓、绝之位，与丧门、吊客并见，不利父母的健康和运势，做事阻碍较多，伶仃、单寒。入贵格，主入赘。

阳命大运流年忌孤辰，阴命忌寡宿。`},寡宿:{tip:`异性缘浅薄，婚缘浅薄延后，夫缘浅薄，独身主义。

男命逢孤辰，平姻缘迟来，恋情较晚。女命逢寡宿姻缘来的较晚。孤寡与驿马并，流浪他乡，与华盖并于日时，孤苦伶仃，或为僧尼。与空亡并，自幼无倚，一生可能不太平顺，容易四处奔走。`,gujue:`亥子丑人,见寅为孤,见戌为寡；
寅卯辰人,见巳为孤,见丑为寡；
巳午未人,见申为孤,见辰为寡；
申酉戌人,见亥为孤，见未为寡。`,chafa:`以年支查余三支

寡宿入命：孤枕独眠，生性多孤独。孤辰、寡宿同现：凡事多见无所谓，乃四大皆空。男命：为人孤僻。女命：为人多孤独，老年比较孤单。
  孤辰入命：生性多孤独，孤枕独眠。古人常说『男怕孤、女怕寡』，八字里面孤辰、寡宿同现：常见事与愿违。男命：为人孤独。女命：为人独立。

男命怕孤辰落在财星之地，或日主的死绝之方。女命怕寡宿落在夫星之地，或日主的死绝之方。这现像造成缘份难偕久之憾，难免刑克，内心容易伤感，尤其是孤寡入命又见空亡的八字，一生比较孤单。八字忌孤辰、寡宿同时入命。

　　如果命带孤辰或寡宿，八字又有华盖出现，则是一个非常聪明的孤独之人，往往具有特殊才华，很多艺术家、哲学家、五术家，或是修道者、牧师，多是这种命格。

　　孤辰、寡宿也叫做隔角煞，又叫绝情煞。在年月柱，与六亲缘份淡薄，独立自成之命。在日柱，夫妻男女缘份淡薄。在时柱，与子孙缘份淡薄。

　　命带孤辰、寡宿的人，比较不具交际能力与手腕，兄弟朋友情谊也显得有始无终，这就是孤寡入命终须寂的道理。所以八字有孤寡的人，其实无须汲汲追求社交或过份接近喧嚣人潮，养性独处反而显得安然自得。古来五术界得以流芳者，大都八字有孤寡、华盖空亡等神煞入命，惟能处静耐寂之人才得以花长时间研究探讨精深命理。

凡人命犯孤寡, 主形孤肉露, 面无和气。生旺稍可, 死绝尤甚.孤寡如有贵神相扶, 不至为害, 甚至"孤辰寡宿带官印, 定做丛林领袖"。

孤辰寡宿是印星与财星的墓、绝之位，与丧门、吊客并见，不利父母的健康和运势，做事阻碍较多，伶仃、单寒。入贵格，主入赘。

阳命大运流年忌孤辰，阴命忌寡宿。`},勾绞煞:{tip:`婚姻不顺
易遭人身意外，也主容易惹上法律纠纷，难聚财。`,gujue:`阳男阴女，命前三辰为勾，命后三辰为绞。
阴男阳女，命前三辰为绞，命后三辰为勾。
如甲子年生男，以命前三辰卯为勾，命后三辰酉为绞。

子见卯。丑见辰。寅见巳。卯见午。辰见未。巳见申。
午见酉。未见戌。申见亥。酉见子。戌见丑。亥见寅。`,chafa:`以年支查余三支
（桃花的六冲地支）

古人也称破煞，常听人说某人犯破格命，就是犯了勾绞煞的意思。命带勾绞的命，一生之中可能人际关系不太好，不善于与人相处，经常会有无礼相向的事情发生。勾绞犯命，感情方面也多有波折，争吵等现象是常有的事。不只是八字本身带勾绞煞会如此，流年岁运碰到也一样会犯。

勾绞之义为“牵连、羁绊”，不能发挥、受阻碍。一名“爪牙杀”，亦即地支相距90度之刑。

古歌云：“爪牙杀去命三辰，大忌金神羊刃临；夹杀克身无福救，常遭蛇虎伤其身。”    命带勾绞，并带金神、白虎者，可能会有意外危难，被坏人、蛇、虎、牛、马、狗等兽所伤。勾绞入命者，大多心思敏捷，主掌刑法之任，或为将帅，掌生杀大权，若克身，主人身意外。行岁运逢之，主与人不懂得圆融，所以经常的得罪人，严重会惹上法律纠纷。勾绞只带一个灾轻，带两个灾重。命中无七杀者灾轻，有七杀者灾重。`},天喜:{tip:"喜事，结婚爱情喜事。",gujue:`天喜年支: 子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥。
三地支见: 酉 申 未 午 巳 辰 卯 寅 丑 子 亥 戌。`,chafa:`以年支查余地支

如子年生人见卯为红鸾，见酉为天喜。
“桃花红鸾天喜合，岁运逢之定结亲”。
红鸾天喜星，主喜庆之事，岁运逢之，若与桃花同见，年日柱与岁运多合者，适合结婚年纪，多有爱情结婚喜事。`},红鸾:{tip:"喜事，结婚爱情喜事。",gujue:`红鸾年支: 子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥。
三地支见: 卯 寅 丑 子 亥 戌 酉 申 未 午 巳 辰。`,chafa:`以年支查余地支

如子年生人见卯为红鸾，见酉为天喜。
“桃花红鸾天喜合，岁运逢之定结亲”。
红鸾天喜星，主喜庆之事，岁运逢之，若与桃花同见，年日柱与岁运多合者，若是结婚合适年纪，多有爱情结婚喜事。`},元辰:{tip:`耗损、人际不算太好，不懂得圆融。
又名大耗，面凶声浊，不分良善，贪杯贪色，生理欲望较强。`,gujue:`阳男阴女★子年未。丑年申。寅年酉。卯年戌。辰年亥。巳年子。
　　　　　午年丑。未年寅。申年卯。酉年辰。戌年巳。亥年午。
阴男阳女★子年巳。丑年午。寅年未。卯年申。辰年酉。巳年戌。
　　　　　午年亥。未年子。申年丑。酉年寅。戌年卯。亥年辰。`,chafa:`以年支查余三支

又名“毛头星”、“大耗”。元辰是相背而不合之意，若岁、运逢之，如物当风，摇动颠倒，不得安宁，没有内忧，则有外患。若大运逢之于已发之后，将交未交之际，小心意外事故。人命逢之，形貌有陷（头骨凸露、低鼻、大口、眼凶、脑凸、臀高、手脚僵硬、声音沉浊）。若值生旺则外表大方，容易是非不分、个性不易捉摸。死绝则求财困难、不太注意言辞、做事阻碍较大，容易自甘平庸。元辰在日，不利丈夫/妻子的健康或运势。
元辰与官符并见，会无缘无故受到挫折。

元辰与劫杀并见，男人做事不能注意小节，动招危辱，求财较为困难。女人声音可能比较中性，生理欲望较强，不遵礼法，生子性拗不爱听父母的话。

元辰虽然是凶星，但逢六合则反吉。例如己丑年生阴男，元辰在午，有未合之。《洞元经》云：“元辰遇合而大亨。”八字中原有七杀，岁运再遇七杀，亦与元辰同观。`},披麻:{tip:`年逢此星，多主丧事、伤病、难聚财。
避免观丧，探病。`,gujue:" ",chafa:`以年支查余三支

年支 ：子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥
丧门 ：寅 卯 辰 巳 午 未 申 酉 戌 亥 子 丑 
吊客： 戌 亥 子 丑 寅 卯 辰 巳 午 未 申 酉
披麻： 酉 戌 亥 子 丑 寅 卯 辰 巳 午 未 申 

年支前两位为丧门，比如巳年生人，前两位未就是丧门，后两位卯就是吊客，后三位寅就是批麻。
披麻、吊客、丧门皆为凶星。如大运、流年遇之，多主人身意外，伤病等事出现。不容易聚财、也要多加注意健康问题，主要作用于流年。`},吊客:{tip:`年逢此星，多主丧事、伤病、难聚财。
避免观丧，探病。`,gujue:" ",chafa:`以年支查余三支

年支 ：子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥
丧门 ：寅 卯 辰 巳 午 未 申 酉 戌 亥 子 丑 
吊客： 戌 亥 子 丑 寅 卯 辰 巳 午 未 申 酉
披麻： 酉 戌 亥 子 丑 寅 卯 辰 巳 午 未 申 

年支前两位为丧门，比如巳年生人，前两位未就是丧门，后两位卯就是吊客，后三位寅就是批麻。
披麻、吊客、丧门皆为凶星。如大运、流年遇之，多主人身意外，伤病等事出现。不容易聚财、也要多加注意健康问题，主要作用于流年。`},丧门:{tip:`年逢此星，多主丧事、伤病、难聚财。
避免观丧，探病。`,gujue:" ",chafa:`以年支查余三支

年支 ：子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥
丧门 ：寅 卯 辰 巳 午 未 申 酉 戌 亥 子 丑 
吊客： 戌 亥 子 丑 寅 卯 辰 巳 午 未 申 酉
披麻： 酉 戌 亥 子 丑 寅 卯 辰 巳 午 未 申 

年支前两位为丧门，比如巳年生人，前两位未就是丧门，后两位卯就是吊客，后三位寅就是批麻。
披麻、吊客、丧门皆为凶星。如大运、流年遇之，多主人身意外，伤病等事出现，也不容易聚财。`},天德贵人:{tip:"性格好，主化险为夷，不犯刑律，不遇危难。",gujue:`寅月丁。卯月申。辰月壬。巳辛月。午月亥。未月甲。
      申月癸。酉月寅。戌月丙。亥月乙。子月巳。丑月庚。`,chafa:`以月支查四柱干支

      天月德助，处世无殃。能把遇到凶险转化为吉祥、顺利，随处保护。
      天地德秀之气，其特点是化解危难。命带天德贵人者有福德，其人心地善良，身体健康，人缘好，在生平之中较不会遇到意外等，纵使逢之也能适时得以化解。
  
      天月二德,乃日月会合照临,有何阴昧敢容其间？子平赋说:" 印绶得同天德,官刑不至, 至老无灾。"凡八字中有天月二德,其人恺悌慈祥,待人至诚仁厚。煞带天月德,明敏果决而仁厚,食伤带天月德,聪明秀慧而仁厚。书云: 素食慈心,印绶逢于天德,良以秉性慈祥故也。二德以天德为重,月德次之,临财官印绶,加一倍福力,日干尤吉。
  
      天德和月德，都是贵人吉星的名称。与其它贵人星有一个最大的不同处，就是天月德比较趋向于一个人个性方面的表现，也就是说天月德谈的是性格。一般来说，八字有天月德入命的人，不但具有贵气的特质，行为处事坦白而无私，也有慈悲心或者同情心。人言积善之家必有余庆，所以天月德也具有遇事化险为夷的功能。`},月德贵人:{tip:"性格好，主化险为夷，不犯刑律，不遇危难。",gujue:"寅午戌月生者见丙, 申子辰月生者见壬,亥卯未月生者见甲, 巳酉丑月生者见庚。",chafa:`以月支查四柱干支

      月德贵人同天乙贵人一样，是一颗很好的吉星，命主在命局中逢上带有月德贵人，一生处世无忧，化险为夷，平生很少生病，不犯官刑。但需要注意的是，月德是勤勉敏慧之徳星，虽然命主身带此吉星，也需本身勤勉自助，才能在紧要关头获得帮助。
  
      天月二德,乃日月会合照临,有何阴昧敢容其间？子平赋说:" 印绶得同天德,官刑不至, 至老无灾。"凡八字中有天月二德,其人恺悌慈祥,待人至诚仁厚。煞带天月德,明敏果决而仁厚,食伤带天月德,聪明秀慧而仁厚。书云: 素食慈心,印绶逢于天德,良以秉性慈祥故也。二德以天德为重,月德次之,临财官印绶,加一倍福力,日干尤吉。
  
      天德和月德，都是贵人吉星的名称。与其它贵人星有一个最大的不同处，就是天月德比较趋向于一个人个性方面的表现，也就是说天月德谈的是性格。一般来说，八字有天月德入命的人，不但具有贵气的特质，行为处事坦白而无私，也有慈悲心或者同情心。人言积善之家必有余庆，所以天月德也具有遇事化险为夷的功能。`},天德合:{tip:"性格好，主化险为夷，不犯刑律，不遇危难。（天德的一半效果）",gujue:`寅月壬。卯月巳。辰月丁。巳月丙。午月寅。未月己。
申月戊。酉月亥。戌月辛。亥月庚。子月申。丑月乙。`,chafa:`天德与天干五合或地支六合者即为天德合，如正月见丁为天德，壬与丁合，壬即为天德合，类推。
如没有天德贵人，有天德合也起到天德贵人的作用。`},月德合:{tip:"性格好，主化险为夷，不犯刑律，不遇危难。（月德的一半效果）。",gujue:"寅午戌见辛，申子辰见丁，巳酉丑见乙，亥卯未见己。",chafa:`月德合就是与月德相合的天干，如丙火与辛金合，我们就说寅午戌月德合辛，即寅午戌月的辛干。
月德合凡遇预测之事一般都会达到比较和谐的程度。`},天医:{tip:"与医学有缘，少病，处死绝之地，则主人体弱，身体健康容易出问题。",gujue:"正月生见丑, 二月生见寅, 三月生见卯, 四月生见辰,五月生见巳, 六月生见午, 七月生见未, 八月生见申,九月生见酉, 十月生见戌, 十一月生见亥, 十二月生见子。",chafa:`以月支查其他三支

天医是掌管疾病之事的星神。四柱逢天医,如不旺,又无贵人吉神相扶,不利于身体健康，容易身弱无力。若生旺又有贵人相生助,不仅身体健壮,而且特别适合从事医学、心理学、哲学等。学习力、理解力、观察力、模仿力、好奇心、研究心、直觉观等能力皆强。

宗教、医药、哲学、人文等学说之星。`},血刃:{tip:"注意身体健康、意外的事故。",gujue:`寅月丑。卯月未。辰月寅。巳月申。午月卯。未月酉。
申月辰。酉月戌。戌月巳。亥月亥。子月午。丑月子。`,chafa:`以月支查四柱干支
 `},金神:{tip:`个性刚毅，聪明多才，然人缘较差。
（弱命喜运行火乡，便为贵命。逢水旺则做事无成，与子女缘薄，做事劳苦）。`,gujue:"乙丑，己巳，癸酉。",chafa:`查日柱或时柱

<<相心赋>>云: "金神贵格, 火地奇哉,有刚断明敏之才,无刻薄欺瞒之意。"柱中有火, 不行火乡难发, 原局火无力, 逢火运显贵。"金神入火乡, 富贵天下响", "金神遇火威震边疆".
金见水则沉,故金神不喜水乡,不利西北：金神喜见财,行财运则发：财运虽美,火乡更妙。

金神之义是取"巳酉丑"金属而名，又为"杀"（破碎）之位。子午卯酉"的"在巳，辰戌丑未"的"在丑，寅申巳亥"的"在酉。"的杀"是破球之星、加上金的刚性，成为"具有较强破坏力"的星宿，人命带之性多威猛强烈，胆大、好胜、常使人敬而远之。刚金要得火炼，因此有"金神入火乡，发如猛虎"之说。也就是金神命格的人，其命中或岁运逢着丙、丁、巳、午时，能有大发展。`},十恶大败:{tip:"不善理财，家运不太顺利。",gujue:"甲辰，乙巳，壬申，丙申，丁亥，庚辰，戊戌，癸亥，辛巳，己丑，日柱见着是。",chafa:`查日柱

      十败日所生之人由于生不带禄，多数不太会持家，花钱容易大手大脚，仓库金银化为尘。犹如无源之水、无本之木，没有资本很难成事。
      
      在世袭的古代，表示不能承袭宜、父的官职、产业，在古代这情形多发生于犯罪被搜查并没收家产，所以名为“十恶大败”。十恶，是不赦重罪。大败，表示精光、消减 。在现代可能会表示把父辈辛苦创建留下来的产业，自己给吃喝玩乐掉。
      
      生于十恶大败日的人，在庭生时，家运不顺，可能影响到置产、钱财储蓄。或已走过，当然不能得其福荫。`},十灵日:{tip:"洞悉宗教之星，直觉敏锐，善于察言观色、领悟力、领会力，善解人意等心性皆强。",gujue:`“男带十灵好文章，女带十灵好衣裳。”
甲辰、乙亥、丙辰、丁酉、戊午、庚戌、庚寅、辛亥、壬寅、癸未。`,chafa:`查日柱

十灵者，聪颖性灵，古人招收学习五术（医、卜、星、相、山）的徒弟，会看是否十灵日出生的，一般来说十灵日出生的人对五术方面的知识比较有天赋。好诗书文章、时尚杂论等，男子性灵，女子气质佳长相灵秀，逢此日柱出生的人主灵慧聪明。

《星平会海》云：“五行绝处，即是胎元，生日逢之，名曰‘受气’，八字从了不入格富贵，亦是有余。”通书刊载的十灵日只有癸未日。此日生者容易出名。 `},阴差阳错:{tip:`女不太利于婆婆和妯娌姐妹间的亲情。男不太利于和妻子家的关系，不容易得到外家之助。
如月日时两重或三重犯此煞，多主二婚之事，常为婚姻烦恼，应注意感情培养。`,gujue:`丙子日。丙午日。丁丑日。丁未日。戊寅日。戊申日。
辛卯日。辛酉日。壬辰日。壬戌日。癸巳日。癸亥日。`,chafa:`查日柱

行事阴阳颠倒，多有事成反败之虞。好变不好，诸事多见在阴错阳差下，或完成、或结束。

阴差阳错，是太过与不及、男女不和的意思。古说谓“女子逢之，公姑寡合，妯娌不足，夫家冷退。男子逢之，主退外家，亦与妻家是非寡合。其杀，不论男女，月日时两重或三重，犯之重，只日犯之尤重，主不得外家力，纵有妻财，亦成虚花，久后可能会与妻家有矛盾”。 

一般带阴差阳错者可能有同母异父或同父异母的兄弟姐妹，在丧期中成婚、谈亲事时发生不愉快之事，妻子与父母相处的不太融洽，和妻舅感情疏远。做事阻碍较大，容易错失良机。`},九丑日:{tip:"感情多纷争。",gujue:"丁酉日。戊子日。戊午日。己卯日。己酉日。辛卯日。辛酉日。壬子日。壬午日。",chafa:`查日柱
此煞名“丑”，不是指容貌不好看，相反的，此日生者大多容貌美丽，或很有吸引人的魅力。其所以名“丑”，是指名声方面的风评，因感情的事容易出问题，严重的可能会惹上法律纠纷，名声受损。
`},魁罡日:{tip:`聪明机巧，临事果断，有威杀之。
忌刑冲，刑冲多有人身意外；忌身弱，身弱逢之则钱财不丰，容易遇刑律。`,gujue:"戊戌日。庚辰日。庚戌日。壬辰日。",chafa:`查日柱
魁罡坐命：心性刚强霸气，聪明果断，攻击性，不服输，临事果断。带双魁罡：秉权，好杀，具领导才能。必须身旺，才能任其霸气；身弱，则容易遭意外事故，凡事不要强出头。

辰为天罡, 戌为河魁, 乃阴阳绝灭之地,故名。辰是水库属天罡,戌是火库属地魁,辰戌相见为天冲地击。魁罡格在日柱方能入格,其他三格不算,且不能冲破。魁罡格需日主健旺,也即以财官为喜用,因为魁罡格,具有攻击性且格局雄壮,日主衰弱需印生,与魁罡性格相反, 即不成为魁罡格了。古歌云:"魁罡四日为先,叠叠相逢掌大权,庚戌庚辰怕显官,戊戌壬辰畏财运。主人性格多聪慧,好杀之心断不偏,倘有刑冲兼破害,一贫彻骨受笞鞭。"

身值天罡地魁,财运不佳,强则较显贵,魁罡聚会,发福非常。主为人性格聪明,文章振发,临事果断,秉权好杀。魁罡性严有操持。运行身旺发福百端,一见财官,祸患立至,或带刑杀尤甚。倘日位独处,刑冲克制重临,人际关系可能不太好,刑责不已,求财困难。运临财旺官旺处,主防意外事故,若月令见财官印绶,日主一位,即以财官印食取用,虽难聚财,财官印食得位即无大害。

庚戌, 庚辰二日无官星, 若魁罡重叠有情,主富贵于名,但见财官则不成局,岁运再见财旺之乡,小心意外危险。

柱带魁罡者,虽有领导才能,声宏气壮,且好权术,好胜心强，但婚姻较为不顺。

古人说魁罡入命的八字不要吃牛肉，并且适合修道养性以断其霸气伤人之性。

“为人性格聪明，文章振发，临事果断，秉权好杀。”在现代，“魁罡”有新的诠释：带魁罡的人，人生可能充满惊涛骇浪，命运起伏大，分化较明显，容易碰到不好的事情。若是女性，大多是美人胚子，但是在恋爱和婚姻方面感情较差。法官、教授、艺术家、裁缝、理发业人士，有很多是魁罡日出的。

好坏参半，婚缘不佳财运不济，因在丑和戌把天乙贵人吃掉。具有独立自主精神、精明干练、模仿、组织力皆强，性情属于累积性暴发。`},六秀日:{tip:"聪明秀气。",gujue:"丙午 丁未 戊子 戊午 己丑 己未。",chafa:`查日柱
命带六秀聪明多才多艺，相貌俊秀，人缘佳。`},八专日:{tip:"身体好，生理欲望较强，多情。",gujue:"甲寅日。乙卯日。丁未日。戊戌日。己未日。庚申日。辛酉日。癸丑日。",chafa:`查日柱

此日柱，大抵天干坐禄或冠带，通常是身体比较好的人，生理欲望强，容易因酒、色而招来困扰、失败。

八专坐命：感情多有争端，六亲冷淡，夫妻感情多波折。男命：为忌神，多生理欲望较强，感情多波折。女命：为忌神，不择亲疏多交。

　　八专入命的人，大都比较多情，很容易在平常的相处之中即让自己不知不觉而陷入感情漩涡，很多畸情的发生不见得命带桃花，八专入命的男女也经常会有情事生忧的困扰。古人论命把八专视为桃花的一种，因为命带八专的人容易发生地下恋情。`},孤鸾煞:{tip:"不利婚姻，或外遇。",gujue:`甲寅日。乙巳日。丙午日。丁巳日。
戊午日。戊申日。辛亥日。壬子日。`,chafa:`查日柱
又名“呻吟煞”。夫妻多纷争。

男命：婚姻中不太懂的相处，和妻子不和睦，可能会出现外遇事件。
女命：夫妻感情多一般，正缘来的晚，多为晚婚，注意健康问题。

女命带孤鸾与子女缘分薄，若四柱中见官杀则不适用此条。孤鸾日生的女子不利姻缘，夫妻感情多波折，两人需要面对的问题较多。房事不太和谐，注意外遇风波。`},学堂:{tip:`模仿力、创作力、想象力、理解力。
学业出类拔萃，文章声名远播。`,gujue:`纳音之长生
      金命见巳，辛巳为正；木命见亥，己亥为正；水命见申，甲申为正；土命见申，戊申为正；火命见寅，丙寅为正。`,chafa:`查法一：以年纳音查月日时支（禄命法）
      年柱纳音为金命见其他三支有“巳”为学堂，见“辛巳”为正学堂（海中金、剑锋金、沙中金都为纳音金命）；
      年柱纳音为木命见其他三支有“亥”为学堂，见“己亥”为正学堂；
      年柱纳音为水命见其他三支有“申”为学堂，见“甲申”为正学堂；
      年柱纳音为土命见其他三支有“申”为学堂，见“戊申”为正学堂；
      年柱纳音为火命见其他三支有“寅”为学堂，见“丙寅”为正学堂。
      正学堂更能体现学堂的特性
      
      查法二：以日干查四柱（子平法）
      甲见己亥, 乙见壬午, 丙见丙寅, 丁见丁酉, 戊见戊寅, 己见己酉, 庚见辛巳, 辛见甲子, 壬见甲申, 癸见乙卯，以年日干, 查四柱干支。
      
      本软件默认采用第一种禄命法查法
      
      学堂为纳音之长生，命中带之，主人聪明，可得考职功名，文才出众，功名显达。
      
      学堂者, 如人读书在学堂. 故称文星, 主学业功名之事, 凡此星入命, 主登科及第, 学业大展宏图.
      
      学堂又称官贵学堂，八字带学堂的命格，大都饱读诗书，记忆力很好，行为举止无形间给人一种高贵气质的感觉，很多高学历甚至达官显贵之人，八字都有学堂贵星的加临。八字如果见到文昌又有学堂，可以说是一个贵气十足的命格；只要见到其中一位，都很擅长读书，一生当中也都能够化险为夷。`},三奇贵人:{tip:"胸怀坦荡，博学多才。（与天乙并用，则建功立业，功勋卓著。居空亡，则为隐士高人。）",gujue:"天上三奇甲戊庚，地下三奇乙丙丁，人中三奇壬癸辛。",chafa:`三天干相连（要不相隔而紧连）

凡命遇三奇，主人精神异常，襟怀卓越，好奇尚大，博学多能。
学艺专精、精力旺盛、脑力灵敏，易成专业技能人才、如工程师、信息家、计算机软件设计、属技能专精之人。

三奇在什么条件下才能真正为奇? 无非是:
（一）顺布而排. 即，年乙月丙日丁,或月乙日丙时丁。 
（二）三奇必须得时得地, 不得死绝。
（三）三奇必有吉星贵人, 如天乙, 天月德贵人扶助。
（四）带元辰, 桃花, 天罗地网为无用。三奇具有特殊奇材的作用。

带天乙贵人者, 勋业超群。带天月二德者,不犯意外事故。带三合入局者,国家柱石。带官符劫煞者, 器识宏远。带空生旺者,脱尘离俗,不因有钱有势而惑乱，不因武力或权势而胁迫屈服。

三奇必须命局配合得体, 并有其它贵人吉星扶持才有荣华福寿,如果只有三奇无贵地, 命局组合不好, 势必钱财不丰，容易受欺负。即使命局较清粹,若三奇不落贵地而落空亡, 较为孤独, 即是蓬莱三岛客,万里走江山了。`},天罗:{tip:"注意健康问题、容易惹上法律纠纷。",gujue:"凡纳音火命，见戌亥日为天罗；水土命，见辰巳日为地网，金木二命无之。",chafa:`以年纳音查日支

      火命人逢戌亥为天罗, 水土命逢辰巳为地网. 男忌天罗, 女忌地网.
      
      年命纳音为火，即年柱为戊子、己丑、丙寅、丁卯、甲辰、乙巳、戊午、己未、丙申、丁酉、甲戌、乙亥的八字，日支中又出现戌或亥时为天罗。年命纳音为水、土，即年柱为丙子、丁丑、甲寅、乙卯、壬辰、癸巳、丙午、丁未、甲申、乙酉、壬戌、癸亥；庚子、辛丑、戊寅、己卯、丙辰、丁巳、庚午、辛未、戊申、己酉、丙戌、丁亥的八字，日支中又出现辰或巳时为地网。
      
      天罗地网, 容易惹上法律纠纷, 大运流年遇之,于人不利，若天月二德解救则无忧。
      
      大多命带罗网的人，在人生旅途上所接受的考验、打击较重大，须奋斗挣扎才能出人头地，若命格不高，意志不足就被命运之神俘虏，庸庸碌碌过其一生；有的则甘心落后，误入歧途。
      
      天罗地网逢三刑六害之神，再见魁罡、身强杀重、官杀混杂，伤官见官、财星在偏印皆主会触犯刑律，验率颇高。`},地网:{tip:"注意健康问题、容易惹上法律纠纷。",gujue:"凡纳音火命，见戌亥日为天罗；水土命，见辰巳日为地网，金木二命无之。",chafa:`以年纳音查日支

      火命人逢戌亥为天罗, 水土命逢辰巳为地网. 男忌天罗, 女忌地网.
      
      年命纳音为火，即年柱为戊子、己丑、丙寅、丁卯、甲辰、乙巳、戊午、己未、丙申、丁酉、甲戌、乙亥的八字，日支中又出现戌或亥时为天罗。年命纳音为水、土，即年柱为丙子、丁丑、甲寅、乙卯、壬辰、癸巳、丙午、丁未、甲申、乙酉、壬戌、癸亥；庚子、辛丑、戊寅、己卯、丙辰、丁巳、庚午、辛未、戊申、己酉、丙戌、丁亥的八字，日支中又出现辰或巳时为地网。
      
      天罗地网, 容易惹上法律纠纷, 大运流年遇之,于人不利，若天月二德解救则无忧。
      
      大多命带罗网的人，在人生旅途上所接受的考验、打击较重大，须奋斗挣扎才能出人头地，若命格不高，意志不足就被命运之神俘虏，庸庸碌碌过其一生；有的则甘心落后，误入歧途。
      
      天罗地网逢三刑六害之神，再见魁罡、身强杀重、官杀混杂，伤官见官、财星在偏印皆主会触犯刑律，验率颇高。`},天转日:{tip:"做事不太平顺。",gujue:`“春兔夏马天地转，秋鸡冬鼠便为殃;行人在路须忧死，造恶未成先架丧。”
寅卯辰月见乙卯日，巳午未月见丙午日，申酉戌月见辛酉日，亥子丑月见壬子日。`,chafa:`以月支查日柱
天转有四日，分别是春季的乙卯日，夏季的丙午日，秋季的辛酉日，冬季的壬子日。
地转也有四日，分别是春季的辛卯日，夏季的戊午日，秋季的癸酉日，冬季的丙子日。

正所谓“盛极而衰，否极泰来”，事物发展到某种程度就会发生转变。天转地转日为五行能量旺的日子，正处于盛极而衰的状态，会因为能量过盛而带来危险。比如官位高而显赫，几乎与君主平等，如不急流勇退，可能有意外事故；家财万贯，富裕满盈，还执着于钱财，可能会被政府、坏人盯上，家庭容易遭遇不幸。

生于天转地转日的人，如果格局组合不好，没有它柱干支和纳音克制，很容易出现健康问题，少年体弱等情况。成人以后，一生中也往往是祸福相依，经历磨难。需要命主常怀敬畏，多行好事，方能平安顺遂。此外，天转地转日接受上司派遣出行、经商做买卖、建筑、嫁娶等，容易有意外事情发生。`},地转日:{tip:"做事不太平顺。",gujue:`“春兔夏马天地转，秋鸡冬鼠便为殃;行人在路须忧死，造恶未成先架丧。”
寅卯辰月见辛卯日，巳午未月见戊午日，申酉戌月癸酉日，亥子丑月见丙子日。`,chafa:`以月支查日柱
天转有四日，分别是春季的乙卯日，夏季的丙午日，秋季的辛酉日，冬季的壬子日。
地转也有四日，分别是春季的辛卯日，夏季的戊午日，秋季的癸酉日，冬季的丙子日。

正所谓“盛极而衰，否极泰来”，事物发展到某种程度就会发生转变。天转地转日为五行能量旺的日子，正处于盛极而衰的状态，会因为能量过盛而带来危险。比如官位高而显赫，几乎与君主平等，如不急流勇退，可能有意外事故；家财万贯，富裕满盈，还执着于钱财，可能会被政府、坏人盯上，家庭容易遭遇不幸。

生于天转地转日的人，如果格局组合不好，没有它柱干支和纳音克制，很容易出现健康问题，少年体弱等情况。成人以后，一生中也往往是祸福相依，经历磨难。需要命主常怀敬畏，多行好事，方能平安顺遂。此外，天转地转日接受上司派遣出行、经商做买卖、建筑、嫁娶等，容易有意外事情发生。`},词馆:{tip:"学业出类拔萃，文章声名远播。",gujue:`纳音之临官
    金命见申，壬申为正；木命见寅，庚寅为正；水命见亥，癸亥为正；土命见亥，丁亥为正；火命见巳，乙巳为正。`,chafa:`查法一：以年纳音查月日时支（禄命法）
      年柱纳音为金命见其他三支有“申”为词馆，见“壬申”为正词馆（海中金、剑锋金、沙中金都为纳音金命）
      年柱纳音为木命见其他三支有“寅”为词馆，见“庚寅”为正词馆；
      年柱纳音为水命见其他三支有“亥”为词馆，见“癸亥”为正词馆；
      年柱纳音为土命见其他三支有“亥”为词馆，见“丁亥”为正词馆；
      年柱纳音为火命见其他三支有“巳”为词馆，见“乙巳”为正词馆。
      正词馆更能体现学堂的特性
      
      查法二：
      甲干见庚寅，乙干见辛卯；丙干见乙巳，丁干见戊午；戊干见丁巳，己干见庚午；庚干见壬申，辛干见癸酉；壬干见癸亥，癸干见壬戌。
      
      本软件默认采用第一种禄命法查法
      
       
          词馆者, 如今管翰林为词馆(实为今之教育部门), 取其学业精专, 文章出类。
      
          学堂词馆, 主人秀气生发, 聪明智巧, 文章冠世, 一生富贵. 宜生旺不宜克害冲破, 宜天乙贵人吉星相扶为好, 否则, 才难展, 志难伸.
      
          凡学堂词馆，切不要犯空亡及冲破，支干纳音不要见克，方为得用。
      
          《祝胜经》云：“甲辰丙寅，学堂不真；或止富荫，官职卑贫；读书修学，空有虚名。”此言学堂怕落空也。
      
          《三车》云：“学堂无气，惟利师儒。”此言学堂要乘旺也。
      
          《理愚歌》云：“文星聚处人中瑞，声华独冠英雄辈；降生不遇真学堂，才学岂能为拔萃。”此言学堂怕冲破受克也。况人命入格，合造化，又不在学堂词馆而得。`},童子煞:{tip:"时运不济。",gujue:`春秋寅子贵，冬夏卯未辰；
金木马卯合，水火鸡犬多；
土命逢辰巳，童子定不错。`,chafa:`1、命造生在春季或秋季的（以月令算），日支或时支见寅或子的。
2、命造生在冬季或夏季的（以月令算），日支或时支见卯、未或辰的。
3、年柱纳音为金或木的，日支或时支见午或卯的。
4、年柱纳音为水或火的，日支或时支见酉或戌的。
5、年柱纳音为土命的，日支或时支见辰或巳的。
犯童子煞的人一般时运不好事业受阻，容易遇到人格有问题的人，遭到嫉妒和排斥，自己有时已经很努力了，但是结果没有意义。前途一片光明有时自己找不到出路，就像被困在陷阱的动物渴望寻找到出路一样。尤其是婚姻感情方面不顺利，晚婚居多。`},天赦日:{tip:"化险为夷之神，可解危难，处世无忧，对犯有法律纠纷的人尤为有利。",gujue:"春戊寅, 夏甲午, 秋戊申, 冬甲子。",chafa:`寅卯辰月生戊寅日, 巳午未月生甲午日, 申酉戌月生戊申日, 亥子丑月生甲子日。
天赦是化险为夷之星，能解人危难。尤其对犯法之人，有宽大处理之可能。纵有过错也可得到宽恕或赦免。`},四废日:{tip:"败多成少。",gujue:"春庚申辛酉，夏壬子癸亥，秋甲寅乙卯，冬丙午丁巳。",chafa:`以日柱见之即是

四废日是在春夏秋冬四个季节中，干支与季节旺气，呈一百八十度的相反的结构。季节为王（朝廷），四废日就像被朝廷刻黜的官吏。以“刻”为“不用”之意引申，四刻日生者，是比较没有个性、事业上面作为不大的人，或者是怀才不遇的人，平凡过其一生。

命局中带“四废”神煞的人，一生之中做事可能会有始无终，需要多注意健康问题。`},天厨贵人:{tip:`有口福
厨艺一流、女命旺夫，但忌刑冲克破空亡`,gujue:` 甲丙爱行双妃游，乙丁狮子己金牛，
 戊坐阴阳庚鱼双，二千石禄坐皇州，
 癸用天蝎壬人马，辛到宝瓶禄自由，
 此是天厨注天禄，令人福禄两优游。`,chafa:`以年干、日干查余四支

      甲干见巳，乙干见午        
      丙干见巳，丁干见午
      戊干见申，己干见酉
      庚干见亥，辛干见子
      壬干见寅，癸干见卯
      
        天厨又名「食神禄」，比如甲天干的食神丙，丙的禄在巳。先贤陆位亦说:「天厨，宜食禀」，食禀是藏食粮的仓库。
      
        天厨乃食神建禄之宫，食神是人命福星，食神既能得禄，其福必厚，故谓之天厨。
       
        天厨入命的人，如不逢刑冲克破空亡，一生不愁吃穿，食禄不虞匮乏，可以享降天之禄、得天赐之福，古人谓之“衣食无忧，福禄满堂”。八字带有天厨贵人的命，一生大都能够平安吉顺，遇事可以化险为夷、福禄优游。女命逢天厨贵人，有口福，爱美食，爱做饭，且烹饪技术一流，饭菜之香胜于他人，能迅速拉高一家人的幸福指数，因此有旺夫一说。`},福星贵人:{tip:"主平安福气，丰衣足食。",gujue:"凡甲、丙两干见寅或子，乙、癸两干见卯或丑，戊干见申，己干见未，丁干见亥，庚干见午，辛干见巳，壬干见辰是也。",chafa:`以年/日干查地支
 
      出自明代《甲丙相邀入虎乡歌》，甲丙相邀入虎乡，更游鼠穴最高强，戊猴己未丁宜亥，乙癸逢牛卯禄昌，庚赶马头辛到巳，壬骑龙背喜非常，此为有福文昌贵，遇者应知受宠光。
       
      人命若带福星。主一生禄禄不缺，格局配合得当，自然多福多寿，金玉满堂。平常人得之，亦主三餐温饱，无忧无虑。此星多主平安福气而不主富贵。
       
      命中带有福星贵人，不但能够遇事不为凶，甚至可以遇难呈祥，化险为夷，一辈子享受悠闲的福气。如果再加上岁运和流年的配合，那自然是一个福禄兴昌、光宗耀祖的命。倘若得不到岁运流年扶持的话，也可以平安的享受快乐的生活，所以说福星贵人是一个很高贵的星。`},德秀贵人:{tip:"主内涵充实，才华出众，遇难呈祥。",gujue:`寅午戌月, 丙丁为德, 戊癸为秀.申子辰月, 壬癸戊己为德, 丙辛甲己为秀。
巳酉丑月, 庚辛为德, 乙庚为秀.亥卯未月, 甲乙为德, 丁壬为秀。`,chafa:`以月令查天干
 
      夫德者，本月生旺之德；秀者，合天地中和之气、五行变化而成者也。又曰；德者，阴阳解凶之神；秀者，天地清秀之气，四时当旺之神。故寅午戌月，丙丁为德，戊癸为秀。申子辰月，壬癸戊己为德，丙辛甲己为秀。巳酉丑月，庚辛为德，乙庚为秀。亥卯未月，甲乙为德，丁壬为秀。凡人命中得此德秀，无破冲克压者，赋性聪明，温厚和气。若遇学堂，更带财官，主贵。冲克减力。
       
      德秀贵人是八字里的一种神煞，古人对德秀贵人的解释是：“德者，本月生旺之德，秀者，合天地中和之气、五行变化而成者也。又曰：德者，阴阳解凶之神；秀者，天地淸秀之气，四时当旺之神”。此种说法表示德秀贵人不仅仅是贵人，还包含了一股文学的淸秀之意。
       
      德秀贵人的女命：
      为人仁慈、敏慧、慈善、温顺、修养高，一生有贵人相助，无险无虑，较为神佛帮助。“德”，就是利物救人、改过迁善。性格温和有相夫教子之美，主人仪容娟秀，对工作和家庭都是和和美美。
       
      德秀贵人的男命：
      德者，性格秉性；秀者，天地清秀之气，四时当旺之神。德秀贵人乃阴阳解厄之神，天在正气所在，故有自救解灾之能。男命带德秀贵人，且无冲破克压者，其人聪明晓事，温厚和气，文业通达，遇事常有贵人相助，总能化险为夷。带财官，主贵。此外，男命德秀贵人多带正气，所以命主很可能多在公、检、法或事业单位工作。`},拱禄:{tip:"主勤奋向上，充满正能量的福气。",gujue:"拱禄有五日五时:癸亥日癸丑时, 癸丑日癸亥时, 拱子禄；丁巳日丁未时, 己未日己巳时, 拱午禄；戊辰日戊午时, 拱巳禄。",chafa:`以日柱配合时柱
《三命通会》云:"凡拱格, 需日时同干,贵与月令通气。运行身旺及贵禄旺地方大好,印绶伤官食神财运大吉。忌行冲破害或羊刃七杀伤了日时,拱不住贵气,大忌填实空亡。譬如器皿, 虚则能容物,实则无用。所以只宜虚拱。完则能盛,破则无用,所以怕见空亡,岁运同。"
 
《古诗》云:"日时双拱禄中庭,金匮藏珠格清,至贵至高君子命,必须月令看支提,提纲有用提纲重,月令无神用此奇,所拱之位怕填实,又怕伤官在月支。羊刃重重来破格,如无此破贵无疑。"
 
拱是夹、向的意思；禄是干禄、拱禄，指八字柱中无禄位，日柱和时柱相配合虚拱出禄位。命带拱禄的人，做事特别勤奋好学努力，勤奋向上，且不怕困难挫折，越挫越勇，终形成花好月圆的结果，充满了正能量，很有福分的人。
 
凡拱格,需日时同干,贵与月令通气. 运行身旺及贵禄旺地方大好,印绶伤官食神财运大吉。忌行冲破害或羊刃七杀伤了日时,拱不住贵气,大忌填实空亡。譬如器皿,虚则能容物,实则无用，所以只宜虚拱。完则能盛,破则无用,所以怕见空亡,岁运同。`},正学堂:{tip:`模仿力、创作力、想象力、理解力。
    学业出类拔萃，文章声名远播。`,gujue:`纳音之长生
      金命见巳，辛巳为正；木命见亥，己亥为正；水命见申，甲申为正；土命见申，戊申为正；火命见寅，丙寅为正。`,chafa:`查法一：以年纳音查月日时支（禄命法）
      年柱纳音为金命见其他三支有“巳”为学堂，见“辛巳”为正学堂（海中金、剑锋金、沙中金都为纳音金命）；
      年柱纳音为木命见其他三支有“亥”为学堂，见“己亥”为正学堂；
      年柱纳音为水命见其他三支有“申”为学堂，见“甲申”为正学堂；
      年柱纳音为土命见其他三支有“申”为学堂，见“戊申”为正学堂；
      年柱纳音为火命见其他三支有“寅”为学堂，见“丙寅”为正学堂。
      正学堂更能体现学堂的特性
      
      查法二：以日干查四柱（子平法）
      甲见己亥, 乙见壬午, 丙见丙寅, 丁见丁酉, 戊见戊寅, 己见己酉, 庚见辛巳, 辛见甲子, 壬见甲申, 癸见乙卯，以年日干, 查四柱干支。
      
      本软件默认采用第一种禄命法查法
      
          学堂为纳音之长生，命中带之，主人聪明，可得考职功名，文才出众，功名显达。
      
          学堂者, 如人读书在学堂. 故称文星, 主学业功名之事, 凡此星入命, 主登科及第, 学业大展宏图.
      
          学堂又称官贵学堂，八字带学堂的命格，大都饱读诗书，记忆力很好，行为举止无形间给人一种高贵气质的感觉，很多高学历甚至达官显贵之人，八字都有学堂贵星的加临。八字如果见到文昌又有学堂，可以说是一个贵气十足的命格；只要见到其中一位，都很擅长读书，一生当中也都能够化险为夷。`},正词馆:{tip:"学业出类拔萃，文章声名远播。",gujue:`纳音之临官
      金命见申，壬申为正；木命见寅，庚寅为正；水命见亥，癸亥为正；土命见亥，丁亥为正；火命见巳，乙巳为正。`,chafa:`查法一：以年纳音查月日时支（禄命法）
      年柱纳音为金命见其他三支有“申”为词馆，见“壬申”为正词馆（海中金、剑锋金、沙中金都为纳音金命）
      年柱纳音为木命见其他三支有“寅”为词馆，见“庚寅”为正词馆；
      年柱纳音为水命见其他三支有“亥”为词馆，见“癸亥”为正词馆；
      年柱纳音为土命见其他三支有“亥”为词馆，见“丁亥”为正词馆；
      年柱纳音为火命见其他三支有“巳”为词馆，见“乙巳”为正词馆。
      正词馆更能体现学堂的特性
      
      查法二：
      甲干见庚寅，乙干见辛卯；丙干见乙巳，丁干见戊午；戊干见丁巳，己干见庚午；庚干见壬申，辛干见癸酉；壬干见癸亥，癸干见壬戌。
      
      本软件默认采用第一种禄命法查法
      
      
          词馆者, 如今管翰林为词馆(实为今之教育部门), 取其学业精专, 文章出类。
      
          学堂词馆, 主人秀气生发, 聪明智巧, 文章冠世, 一生富贵. 宜生旺不宜克害冲破, 宜天乙贵人吉星相扶为好, 否则, 才难展, 志难伸.
      凡学堂词馆，切不要犯空亡及冲破，支干纳音不要见克，方为得用。
      
          《祝胜经》云：“甲辰丙寅，学堂不真；或止富荫，官职卑贫；读书修学，空有虚名。”此言学堂怕落空也。
      
          《三车》云：“学堂无气，惟利师儒。”此言学堂要乘旺也。
      
          《理愚歌》云：“文星聚处人中瑞，声华独冠英雄辈；降生不遇真学堂，才学岂能为拔萃。”此言学堂怕冲破受克也。况人命入格，合造化，又不在学堂词馆而得。`},空亡:{tip:"空亡入吉神，吉事减半；空亡入凶神，坏事威力减少。",gujue:`甲子旬在戌亥。甲戌旬在申酉。甲申旬在午未。
甲午旬在辰巳。甲辰旬在寅卯。甲寅旬在子丑。`,chafa:`以日、年柱，见余三地支

空亡又名“天中”，凡命中所忌之凶星落入空亡则吉，命中所喜之吉星落入空亡则顿失其力，空亡本身并不主吉凶灾祥之事。空亡见三会，三合，六合不作空亡论。吉神空而喜见合，凶星空而忌见合。                   

空亡入命为八字忌神：判断多误，事易差错，人多迷糊，乏主见。多有无心之过错或是意外，一生常见四处奔走。可以说『空亡』是八字里面比劫畏惧见到的神煞。带双空亡：修行出家之人，或见在家居士，多为吃斋人。最怕时柱落空，有孤寡：姻缘迟来，恋情较晚，乃性拗之人。

空亡在年支上, 一是家运可能不太顺利，二是与母亲缘薄。空亡在月支上, 多主无兄弟姐妹, 或兄弟姐妹无靠。时值空亡多拗性,更遇华盖主少子。胎元支落空亡，昏蒙飘零。命中有空亡与咸池, 沐浴多者是艺人。若空亡与贵人,华盖一齐出现,则此人有大智慧,性情恬淡,品德清高,具有追求真理与智慧的超凡入圣之士,每易为世人钦仰与皈依。

伤官与空亡同柱：做事经常遭受阻碍。食神与空亡同柱：注意自身健康。正财与空亡同柱：做事辛苦，财钱不聚。偏财与空亡同柱：横财机会少。正官与空亡同柱：不利公职，威信不足。七杀与空亡同柱：权力难保。空亡与正印同柱：潜心修道之人，一生终见黄袍加身。比肩与空亡同柱：兄弟、朋友相交无情义可言。劫财与空亡同柱：财钱难储，有来去之患。财神、禄神落入空亡之地：一生四处奔波，求财较为困难。女命，食神与空亡同柱：子息少。女命，空亡与正官或七杀同柱：感情多波折。八字喜神入空亡，失其功能。八字忌神入空亡，藏其凶讯。空亡逢合化吉，初凶终吉。空亡逢合化忌，可能对命主不利。空亡逢冲，则空亡去。空亡在喜用之地，则喜神受制。空亡在忌神之地，则助其凶猛。

　　古人说，空亡入命只怕万事成空、心难如愿，有很多人饱读诗书、胸怀大志，却徒劳英雄无用武之地，或则感觉好事不临，却是杂琐不如意事始终不离身，一样的机会、一样的努力以赴，结果反而事与愿违，劳苦心力，空亡入命制喜助凶罢了。是否如此，或吉凶福祸如何，依八字而论定。`}},SHENSHA_RULES=[{n:"天乙贵人",m:"1,3",t:"7,8,9,10,11,12",d:{甲:["丑","未"],乙:["子","申"],丙:["亥","酉"],丁:["亥","酉"],戊:["丑","未"],己:["子","申"],庚:["丑","未"],辛:["午","寅"],壬:["巳","卯"],癸:["巳","卯"]}},{n:"太极贵人",m:"1,3",t:"7,8,9,10,11,12",d:{甲:["子","午"],乙:["子","午"],丙:["卯","酉"],丁:["卯","酉"],戊:["辰","丑","戌","未"],己:["辰","丑","戌","未"],庚:["寅","亥"],辛:["寅","亥"],壬:["巳","申"],癸:["巳","申"]}},{n:"文昌贵人",m:"1,3",t:"7,8,9,10,11,12",d:{甲:["巳"],乙:["午"],丙:["申"],丁:["酉"],戊:["申"],己:["酉"],庚:["亥"],辛:["子"],壬:["寅"],癸:["卯"]}},{n:"国印贵人",m:"1,3",t:"7,8,9,10,11,12",d:{甲:["戌"],乙:["亥"],丙:["丑"],丁:["寅"],戊:["丑"],己:["寅"],庚:["辰"],辛:["巳"],壬:["未"],癸:["申"]}},{n:"金舆",m:"1,3",t:"7,8,9,10,11,12",d:{甲:["辰"],乙:["巳"],丙:["未"],丁:["申"],戊:["未"],己:["申"],庚:["戌"],辛:["亥"],壬:["丑"],癸:["寅"]}},{n:"禄神",m:"3",t:"7,8,9,10,11,12",d:{甲:["寅"],乙:["卯"],丙:["巳"],丁:["午"],戊:["巳"],己:["午"],庚:["申"],辛:["酉"],壬:["亥"],癸:["子"]}},{n:"羊刃",m:"3",t:"7,8,9,10,11,12",d:{甲:["卯"],乙:["寅"],丙:["午"],丁:["巳"],戊:["午"],己:["巳"],庚:["酉"],辛:["申"],壬:["子"],癸:["亥"]}},{n:"飞刃",m:"3",t:"7,8,9,10,11,12",d:{甲:["酉"],乙:["申"],丙:["子"],丁:["亥"],戊:["子"],己:["亥"],庚:["卯"],辛:["寅"],壬:["午"],癸:["巳"]}},{n:"流霞",m:"3",t:"7,8,9,10,11,12",d:{甲:["酉"],乙:["戌"],丙:["未"],丁:["申"],戊:["巳"],己:["午"],庚:["辰"],辛:["卯"],壬:["亥"],癸:["寅"]}},{n:"红艳煞",m:"3",t:"7,8,9,10,11,12",d:{甲:["午"],乙:["午"],丙:["寅"],丁:["未"],戊:["辰"],己:["辰"],庚:["戌"],辛:["酉"],壬:["子"],癸:["申"]}},{n:"驿马",m:"7",t:"8,9,10,11,12",d:{子:["寅"],丑:["亥"],寅:["申"],卯:["巳"],辰:["寅"],巳:["亥"],午:["申"],未:["巳"],申:["寅"],酉:["亥"],戌:["申"],亥:["巳"]}},{n:"驿马",m:"9",t:"7,8,10,11,12",d:{子:["寅"],丑:["亥"],寅:["申"],卯:["巳"],辰:["寅"],巳:["亥"],午:["申"],未:["巳"],申:["寅"],酉:["亥"],戌:["申"],亥:["巳"]}},{n:"将星",m:"7",t:"8,9,10,11,12",d:{子:["子"],丑:["酉"],寅:["午"],卯:["卯"],辰:["子"],巳:["酉"],午:["午"],未:["卯"],申:["子"],酉:["酉"],戌:["午"],亥:["卯"]}},{n:"将星",m:"9",t:"7,8,10,11,12",d:{子:["子"],丑:["酉"],寅:["午"],卯:["卯"],辰:["子"],巳:["酉"],午:["午"],未:["卯"],申:["子"],酉:["酉"],戌:["午"],亥:["卯"]}},{n:"华盖",m:"7",t:"8,9,10,11,12",d:{子:["辰"],丑:["丑"],寅:["戌"],卯:["未"],辰:["辰"],巳:["丑"],午:["戌"],未:["未"],申:["辰"],酉:["丑"],戌:["戌"],亥:["未"]}},{n:"华盖",m:"9",t:"7,8,10,11,12",d:{子:["辰"],丑:["丑"],寅:["戌"],卯:["未"],辰:["辰"],巳:["丑"],午:["戌"],未:["未"],申:["辰"],酉:["丑"],戌:["戌"],亥:["未"]}},{n:"劫煞",m:"7",t:"8,9,10,11,12",d:{子:["巳"],丑:["寅"],寅:["亥"],卯:["申"],辰:["巳"],巳:["寅"],午:["亥"],未:["申"],申:["巳"],酉:["寅"],戌:["亥"],亥:["申"]}},{n:"劫煞",m:"9",t:"7,8,10,11,12",d:{子:["巳"],丑:["寅"],寅:["亥"],卯:["申"],辰:["巳"],巳:["寅"],午:["亥"],未:["申"],申:["巳"],酉:["寅"],戌:["亥"],亥:["申"]}},{n:"亡神",m:"7",t:"8,9,10,11,12",d:{子:["亥"],丑:["申"],寅:["巳"],卯:["寅"],辰:["亥"],巳:["申"],午:["巳"],未:["寅"],申:["亥"],酉:["申"],戌:["巳"],亥:["寅"]}},{n:"亡神",m:"9",t:"7,8,10,11,12",d:{子:["亥"],丑:["申"],寅:["巳"],卯:["寅"],辰:["亥"],巳:["申"],午:["巳"],未:["寅"],申:["亥"],酉:["申"],戌:["巳"],亥:["寅"]}},{n:"天罗地网",m:"7",t:"8,9,10,11,12",d:{辰:["巳"],巳:["辰"],戌:["亥"],亥:["戌"]}},{n:"天罗地网",m:"9",t:"7,8,10,11,12",d:{辰:["巳"],巳:["辰"],戌:["亥"],亥:["戌"]}},{n:"桃花",m:"7",t:"8,9,10,11,12",d:{子:["酉"],丑:["午"],寅:["卯"],卯:["子"],辰:["酉"],巳:["午"],午:["卯"],未:["子"],申:["酉"],酉:["午"],戌:["卯"],亥:["子"]}},{n:"桃花",m:"9",t:"7,8,10,11,12",d:{子:["酉"],丑:["午"],寅:["卯"],卯:["子"],辰:["酉"],巳:["午"],午:["卯"],未:["子"],申:["酉"],酉:["午"],戌:["卯"],亥:["子"]}},{n:"灾煞",m:"7",t:"8,9,10,11,12",d:{子:["午"],丑:["卯"],寅:["子"],卯:["酉"],辰:["午"],巳:["卯"],午:["子"],未:["酉"],申:["午"],酉:["卯"],戌:["子"],亥:["酉"]}},{n:"孤辰",m:"7",t:"8,9,10,11,12",d:{子:["寅"],丑:["寅"],寅:["巳"],卯:["巳"],辰:["巳"],巳:["申"],午:["申"],未:["申"],申:["亥"],酉:["亥"],戌:["亥"],亥:["寅"]}},{n:"寡宿",m:"7",t:"8,9,10,11,12",d:{子:["戌"],丑:["戌"],寅:["丑"],卯:["丑"],辰:["丑"],巳:["辰"],午:["辰"],未:["辰"],申:["未"],酉:["未"],戌:["未"],亥:["戌"]}},{n:"勾绞煞",m:"7",t:"8,9,10,11,12",d:{子:["卯"],丑:["辰"],寅:["巳"],卯:["午"],辰:["未"],巳:["申"],午:["酉"],未:["戌"],申:["亥"],酉:["子"],戌:["丑"],亥:["寅"]}},{n:"天喜",m:"7",t:"8,9,10,11,12",d:{子:["酉"],丑:["申"],寅:["未"],卯:["午"],辰:["巳"],巳:["辰"],午:["卯"],未:["寅"],申:["丑"],酉:["子"],戌:["亥"],亥:["戌"]}},{n:"红鸾",m:"7",t:"8,9,10,11,12",d:{子:["卯"],丑:["寅"],寅:["丑"],卯:["子"],辰:["亥"],巳:["戌"],午:["酉"],未:["申"],申:["未"],酉:["午"],戌:["巳"],亥:["辰"]}},{n:"元辰",m:"7",t:"8,9,10,11,12",d:{子:["未","巳"],丑:["申","午"],寅:["酉","未"],卯:["戌","申"],辰:["亥","酉"],巳:["子","戌"],午:["丑","亥"],未:["寅","子"],申:["卯","丑"],酉:["辰","寅"],戌:["巳","卯"],亥:["午","辰"]}},{n:"披麻",m:"7",t:"8,9,10,11,12",d:{子:["酉"],丑:["戌"],寅:["亥"],卯:["子"],辰:["丑"],巳:["寅"],午:["卯"],未:["辰"],申:["巳"],酉:["午"],戌:["未"],亥:["申"]}},{n:"吊客",m:"7",t:"8,9,10,11,12",d:{子:["戌"],丑:["亥"],寅:["子"],卯:["丑"],辰:["寅"],巳:["卯"],午:["辰"],未:["巳"],申:["午"],酉:["未"],戌:["申"],亥:["酉"]}},{n:"丧门",m:"7",t:"8,9,10,11,12",d:{子:["寅"],丑:["卯"],寅:["辰"],卯:["巳"],辰:["午"],巳:["未"],午:["申"],未:["酉"],申:["戌"],酉:["亥"],戌:["子"],亥:["丑"]}},{n:"天德贵人",m:"8",t:"1,2,3,4,5,7,8,9,10,11",d:{丑:["庚"],寅:["丁"],辰:["壬"],巳:["辛"],未:["甲"],申:["癸"],戌:["丙"],亥:["乙"],子:["巳"],卯:["申"],午:["亥"],酉:["寅"]}},{n:"月德贵人",m:"8",t:"1,2,3,4,5,6,7,8,9,10,11,12",d:{子:["壬"],丑:["庚"],寅:["丙"],卯:["甲"],辰:["壬"],巳:["庚"],午:["丙"],未:["甲"],申:["壬"],酉:["庚"],戌:["丙"],亥:["甲"]}},{n:"天德合",m:"8",t:"1,2,3,4,5,7,8,9,10,11",d:{丑:["乙"],寅:["壬"],辰:["丁"],巳:["丙"],未:["己"],申:["戊"],戌:["辛"],亥:["庚"],子:["申"],卯:["巳"],午:["寅"],酉:["亥"]}},{n:"月德合",m:"8",t:"1,2,3,4,5",d:{子:["丁"],丑:["乙"],寅:["辛"],卯:["己"],辰:["丁"],巳:["乙"],午:["辛"],未:["己"],申:["丁"],酉:["乙"],戌:["辛"],亥:["己"]}},{n:"天医",m:"8",t:"7,8,9,10,11,12",d:{子:["亥"],丑:["子"],寅:["丑"],卯:["寅"],辰:["卯"],巳:["辰"],午:["巳"],未:["午"],申:["未"],酉:["申"],戌:["酉"],亥:["戌"]}},{n:"血刃",m:"8",t:"7,8,9,10,11,12",d:{子:["午"],丑:["子"],寅:["丑"],卯:["未"],辰:["寅"],巳:["申"],午:["卯"],未:["酉"],申:["辰"],酉:["戌"],戌:["巳"],亥:["亥"]}},{n:"金神",m:"25,26",t:"0",d:{乙丑:[],癸酉:[],己巳:[]}},{n:"十恶大败",m:"25",t:"0",d:{壬申:[],庚辰:[],辛巳:[],丁亥:[],己丑:[],丙申:[],戊戌:[],甲辰:[],乙巳:[],癸亥:[]}},{n:"十灵日",m:"25",t:"0",d:{乙亥:[],癸未:[],庚寅:[],丁酉:[],壬寅:[],甲辰:[],庚戌:[],辛亥:[],丙辰:[],戊午:[]}},{n:"阴差阳错",m:"25",t:"0",d:{丙子:[],丁丑:[],戊寅:[],辛卯:[],壬辰:[],丙午:[],丁未:[],戊申:[],辛酉:[],壬戌:[],癸亥:[],癸巳:[]}},{n:"九丑日",m:"25",t:"0",d:{己卯:[],壬午:[],戊子:[],辛卯:[],丁酉:[],己酉:[],壬子:[],戊午:[],辛酉:[]}},{n:"魁罡日",m:"25",t:"0",d:{庚辰:[],壬辰:[],戊戌:[],庚戌:[]}},{n:"六秀日",m:"25",t:"0",d:{戊子:[],己丑:[],丙午:[],丁未:[],戊午:[],己未:[]}},{n:"八专日",m:"25",t:"0",d:{戊戌:[],丁未:[],癸丑:[],甲寅:[],乙卯:[],己未:[],庚申:[],辛酉:[]}},{n:"孤鸾煞",m:"25",t:"0",d:{丁巳:[],乙巳:[],丙午:[],戊申:[],辛亥:[],壬子:[],甲寅:[],戊午:[]}},{n:"学堂",m:"17",t:"8,9,10,11,12",d:{金:["巳"],木:["亥"],水:["申"],土:["申"],火:["寅"]}},{n:"三奇贵人",m:"18",t:"0",d:{甲戊庚:[],乙丙丁:[],壬癸辛:[]}},{n:"天罗",m:"17",t:"9,11,12",d:{火:["戌、亥"]}},{n:"地网",m:"17",t:"9,11,12",d:{水:["辰、巳"],土:["辰、巳"]}},{n:"天转日",m:"8",t:"15",d:{寅:["乙卯"],卯:["乙卯"],辰:["乙卯"],巳:["丙午"],午:["丙午"],未:["丙午"],申:["辛酉"],酉:["辛酉"],戌:["辛酉"],亥:["壬子"],子:["壬子"],丑:["壬子"]}},{n:"地转日",m:"8",t:"15",d:{寅:["辛卯"],卯:["辛卯"],辰:["辛卯"],巳:["戊午"],午:["戊午"],未:["戊午"],申:["癸酉"],酉:["癸酉"],戌:["癸酉"],亥:["丙子"],子:["丙子"],丑:["丙子"]}},{n:"词馆",m:"17",t:"8,9,10,11,12",d:{金:["申"],木:["寅"],水:["亥"],土:["亥"],火:["巳"]}},{n:"拱禄",m:"16",t:"0",d:{癸亥:"癸丑",癸丑:"癸亥",丁巳:"丁未",己未:"己巳",戊辰:"戊午"}},{n:"童子煞",m:"8",t:"9,10",d:{子:["卯未辰"],丑:["卯未辰"],寅:["寅子"],卯:["寅子"],辰:["寅子"],巳:["卯未辰"],午:["卯未辰"],未:["卯未辰"],申:["寅子"],酉:["寅子"],戌:["寅子"],亥:["卯未辰"]}},{n:"童子煞",m:"17",t:"9,10",d:{金:["午、卯"],木:["午、卯"],水:["酉、戌"],火:["酉、戌"],土:["辰、巳"]}},{n:"天赦日",m:"8",t:"15",d:{寅:["戊寅"],卯:["戊寅"],辰:["戊寅"],巳:["甲午"],午:["甲午"],未:["甲午"],申:["戊申"],酉:["戊申"],戌:["戊申"],亥:["甲子"],子:["甲子"],丑:["甲子"]}},{n:"四废日",m:"8",t:"15",d:{寅:["庚申","辛酉"],卯:["庚申","辛酉"],辰:["庚申","辛酉"],巳:["壬子","癸亥"],午:["壬子","癸亥"],未:["壬子","癸亥"],申:["甲寅","乙卯"],酉:["甲寅","乙卯"],戌:["甲寅","乙卯"],亥:["丙午","丁巳"],子:["丙午","丁巳"],丑:["丙午","丁巳"]}},{n:"天厨贵人",m:"1,3",t:"7,8,9,10,11,12",d:{甲:["巳"],乙:["午"],丙:["巳"],丁:["午"],戊:["申"],己:["酉"],庚:["亥"],辛:["子"],壬:["寅"],癸:["卯"]}},{n:"福星贵人",m:"1,3",t:"7,8,9,10,11,12",d:{甲:["寅子"],丙:["寅子"],乙:["卯丑"],癸:["卯丑"],戊:["申"],己:["未"],丁:["亥"],庚:["午"],辛:["巳"],壬:["辰"]}},{n:"德秀贵人",m:"8",t:"1,2,3,4,5,6",d:{寅:["丙丁戊癸"],午:["丙丁戊癸"],戌:["丙丁戊癸"],申:["壬癸戊己丙辛甲"],子:["壬癸戊己丙辛甲"],辰:["壬癸戊己丙辛甲"],巳:["乙庚辛"],酉:["乙庚辛"],丑:["乙庚辛"],亥:["甲乙丁壬"],卯:["甲乙丁壬"],未:["甲乙丁壬"]}},{n:"拱禄",m:"16",t:"15",d:{癸丑:["癸亥"],癸亥:["癸丑"],丁未:["丁巳"],己巳:["己未"],戊午:["戊辰"]}},{n:"正学堂",m:"17",t:"14,15,16,19",d:{金:["辛巳"],木:["己亥"],水:["甲申"],土:["戊申"],火:["丙寅"]}},{n:"正词馆",m:"17",t:"14,15,16,19",d:{金:["壬申"],木:["庚寅"],水:["癸亥"],土:["丁亥"],火:["乙巳"]}},{n:"空亡",m:"kong",t:"",d:{}}],SHENSHA_INFO={};Object.keys(SHENSHA_DB).forEach(function(k){var d=SHENSHA_DB[k],gj=(d.gujue||"").trim();gj.length<6&&(gj=(d.chafa||"").split(`
`)[0].trim()||gj),SHENSHA_INFO[k]={how:gj,desc:(d.tip?d.tip+`

`:"")+d.chafa,tip:d.tip,chafa:d.chafa}});var SHENSHA_DESC={};Object.keys(SHENSHA_INFO).forEach(function(k){SHENSHA_DESC[k]=SHENSHA_INFO[k].desc});function zhiOfName(name){return ZHI.indexOf(name)}function findShenSha(pillars,gender,colList,labels){for(var out=[],hourG=pillars.hour.gan||"\0",hourZ=pillars.hour.zhi||"\0",exG=[],exZ=[],cls=colList||[],ci0=0;ci0<3;ci0++){var cc=cls[ci0];exG.push(cc&&cc.gz?cc.gz.gan:"\0"),exZ.push(cc&&cc.gz?cc.gz.zhi:"\0")}var G=[pillars.year.gan,pillars.month.gan,pillars.day.gan,hourG].concat(exG),Z=[pillars.year.zhi,pillars.month.zhi,pillars.day.zhi,hourZ].concat(exZ),PN=["年","月","日","时"].concat(labels||["身宫","命宫","胎元"]),COL=[7,8,9,10,11,12,13];function exceptCode(anchor){return COL.filter(function(c){return c!==anchor})}var dayName=pillars.day.gan+pillars.day.zhi,hourName=pillars.hour.gan&&pillars.hour.zhi?pillars.hour.gan+pillars.hour.zhi:"\0",nyEl="",ny=nayinOf(GAN.indexOf(pillars.year.gan),zhiOfName(pillars.year.zhi));ny&&ny.wx&&(nyEl=ny.wx);function add(name,zhiChar,pil){var info=SHENSHA_INFO[name]||{};out.push({name,zhi:zhiChar,pillar:pil,desc:info.desc||"",how:info.how||"",tip:info.tip||"",chafa:info.chafa||""})}function splitVal(v){for(var s=String(v==null?"":v).replace(/[、，,\s|/]/g,""),arr=[],i=0;i<s.length;i++){var c=s.charAt(i);(GAN.indexOf(c)>=0||ZHI.indexOf(c)>=0)&&arr.push(c)}return arr}function hitChar(name,chars,isGan,cols2){for(var i=0;i<G.length;i++)if(!(cols2&&cols2.indexOf(COL[i])<0)){var v=isGan?G[i]:Z[i];chars.indexOf(v)>=0&&add(name,v,PN[i])}}for(var ri=0;ri<SHENSHA_RULES.length;ri++){var r=SHENSHA_RULES[ri];if(r.m!=="kong"&&r.n!=="元辰")for(var codes=r.m.split(","),ci=0;ci<codes.length;ci++){var code=codes[ci],key=null;if(code==="1")key=G[0];else if(code==="3")key=G[2];else if(code==="7")key=Z[0];else if(code==="9")key=Z[2];else if(code==="8")key=Z[1];else if(code==="17")key=nyEl;else if(code==="25"){r.d[dayName]&&add(r.n,pillars.day.zhi,"日");continue}else if(code==="26"){r.d[hourName]&&add(r.n,pillars.hour.zhi,"时");continue}else if(code==="16"){var pv=r.d[dayName];pv&&splitVal(pv).join("")===hourName&&add(r.n,pillars.day.zhi+pillars.hour.zhi,"日");continue}else if(code==="18"){for(var ks=Object.keys(r.d||{}),ki=0;ki<ks.length;ki++)for(var cs=splitVal(ks[ki]),st=0;st+cs.length<=4;st++){for(var okAll=!0,kc=0;kc<cs.length;kc++)if(G[st+kc]!==cs[kc]){okAll=!1;break}okAll&&add(r.n,cs.join(""),PN[st]+"起三柱")}continue}else continue;if(key){var vs=r.d[key];if(vs)for(var vi=0;vi<vs.length;vi++){var cl=splitVal(vs[vi]);if(cl.length){if(cl.length===2&&GAN.indexOf(cl[0])>=0&&ZHI.indexOf(cl[1])>=0){var gz2=cl.join("");if(r.n==="正学堂"||r.n==="正词馆")for(var pi=1;pi<G.length;pi++)gz2===G[pi]+Z[pi]&&add(r.n,Z[pi],PN[pi]);else gz2===dayName&&add(r.n,pillars.day.zhi,"日");continue}for(var allGan=!0,q=0;q<cl.length;q++)GAN.indexOf(cl[q])<0&&(allGan=!1);if(allGan){hitChar(r.n,cl,!0,null);continue}var cols=null;code==="7"?cols=exceptCode(7):code==="9"?cols=exceptCode(9):code==="8"?cols=exceptCode(8):code==="17"&&(cols=[9]),(r.n==="学堂"||r.n==="词馆")&&(cols=exceptCode(7)),r.n==="童子煞"&&(cols=[9,10]),r.n==="血刃"&&(cols=null),hitChar(r.n,cl,!1,cols)}}}}}var yzIdx=zhiOfName(pillars.year.zhi);if(yzIdx>=0)for(var isYangZhi=yzIdx%2===0,isMale=gender==="男",target=isYangZhi===isMale?(yzIdx+7)%12:(yzIdx+5)%12,yj=0;yj<Z.length;yj++)Z[yj]===ZHI[target]&&add("元辰",ZHI[target],PN[yj]);for(var dk=xunKongOf(GAN.indexOf(pillars.day.gan),zhiOfName(pillars.day.zhi)),yk=xunKongOf(GAN.indexOf(pillars.year.gan),zhiOfName(pillars.year.zhi)),kongs=[dk.text,yk.text],kk=0;kk<kongs.length;kk++)for(var kj=0;kj<Z.length;kj++)kongs[kk].indexOf(Z[kj])>=0&&add("空亡",Z[kj],PN[kj]);for(var seen={},uniq=[],u=0;u<out.length;u++){var ukey=out[u].name+"|"+out[u].pillar+"|"+out[u].zhi;seen[ukey]||(seen[ukey]=1,uniq.push(out[u]))}for(var zhengByPillar={},zz=0;zz<uniq.length;zz++)(uniq[zz].name==="正学堂"||uniq[zz].name==="正词馆")&&(zhengByPillar[uniq[zz].pillar]=uniq[zz].name);return Object.keys(zhengByPillar).length&&(uniq=uniq.filter(function(s){var zh=zhengByPillar[s.pillar];return!(zh==="正学堂"&&s.name==="学堂"||zh==="正词馆"&&s.name==="词馆")})),uniq.sort(function(a,b){var d=b.name.length-a.name.length;if(d)return d;var ak=a.name==="空亡"?1:0,bk=b.name==="空亡"?1:0;return bk-ak}),uniq}var NAYIN30=[["海中金","金"],["炉中火","火"],["大林木","木"],["路旁土","土"],["剑锋金","金"],["山头火","火"],["涧下水","水"],["城头土","土"],["白蜡金","金"],["杨柳木","木"],["泉中水","水"],["屋上土","土"],["霹雳火","火"],["松柏木","木"],["长流水","水"],["沙中金","金"],["山下火","火"],["平地木","木"],["壁上土","土"],["金箔金","金"],["覆灯火","火"],["天河水","水"],["大驿土","土"],["钗钏金","金"],["桑柘木","木"],["大溪水","水"],["沙中土","土"],["天上火","火"],["石榴木","木"],["大海水","水"]];function gzIndexOf(g,z){for(var i=0;i<60;i++)if(i%10===g&&i%12===z)return i;return-1}function nayinOf(g,z){var i=gzIndexOf(g,z);return i<0?null:{name:NAYIN30[Math.floor(i/2)][0],wx:NAYIN30[Math.floor(i/2)][1]}}function ganOfZhiInYear(yearG,zhiIdx){var yinGan=[2,4,6,8,0,2,4,6,8,0][yearG];return(yinGan+(zhiIdx-2+12)%12)%10}function taiYuanOf(monthG,monthZ){var g=(monthG+1)%10,z=(monthZ+3)%12;return{gan:GAN[g],zhi:ZHI[z],gz:GAN[g]+ZHI[z],nayin:nayinOf(g,z)}}function mingGongOf(yearG,monthZ,hourZ){var z=((17-monthZ-hourZ)%12+12)%12,g=ganOfZhiInYear(yearG,z);return{gan:GAN[g],zhi:ZHI[z],gz:GAN[g]+ZHI[z],nayin:nayinOf(g,z)}}function shenGongOf(yearG,monthZ,hourZ){var z=((monthZ+hourZ+1)%12+12)%12,g=ganOfZhiInYear(yearG,z);return{gan:GAN[g],zhi:ZHI[z],gz:GAN[g]+ZHI[z],nayin:nayinOf(g,z)}}function xunKongOf(dayG,dayZ){var start=(dayZ-dayG+10)%12,a=ZHI[start],b=ZHI[(start+1)%12];return{zhi:[a,b],text:a+b}}var CS_NAME=["长生","沐浴","冠带","临官","帝旺","衰","病","死","墓","绝","胎","养"],CS_START=[11,6,2,9,2,9,5,0,8,3];function changShengOf(ganIdx,zhiIdx){if(ganIdx<0||zhiIdx<0)return"";var start=CS_START[ganIdx],i=GAN_YINYANG[ganIdx]?(zhiIdx-start+12)%12:(start-zhiIdx+12)%12;return CS_NAME[i]}var WX_SHENG={木:"火",火:"土",土:"金",金:"水",水:"木"},WX_KE={木:"土",土:"水",水:"火",火:"金",金:"木"};function wangShuaiOf(dayWx,monthWx,dayGan,monthZhi){var who=(dayGan?"日主"+dayGan+dayWx:"日主"+dayWx)+(monthZhi?"生于"+monthZhi+"月":"");return dayWx===monthWx?{state:"旺",note:"得令（旺）。"+who+"，与月令同气，得令而旺，最为得力。"}:WX_SHENG[monthWx]===dayWx?{state:"相",note:"得令（相）。"+who+"，"+monthWx+"当令生扶日主，日主受生而相，气机畅旺。"}:WX_SHENG[dayWx]===monthWx?{state:"休",note:"失令（休）。"+who+"，"+monthWx+"当令，日主之气泄于月令，力量渐退。"}:WX_KE[dayWx]===monthWx?{state:"囚",note:"失令（囚）。"+who+"，"+monthWx+"旺"+dayWx+"弱，处于休囚之地，耗力较大。"}:WX_KE[monthWx]===dayWx?{state:"死",note:"失令（死）。"+who+"，"+monthWx+"旺"+dayWx+"绝，月令克伐日主，最不得力。"}:{state:"平",note:""}}function wxPowerOf(pillars){for(var acc={木:0,火:0,土:0,金:0,水:0},arr=[pillars.year,pillars.month,pillars.day,pillars.hour],i=0;i<4;i++){var p=arr[i];if(!(!p||!p.gan)){acc[GAN_WX[GAN.indexOf(p.gan)]]+=1;for(var cz=ZHI_CANG[zhiOfName(p.zhi)]||[],w=[1,.6,.3],j=0;j<cz.length;j++)acc[GAN_WX[GAN.indexOf(cz[j])]]+=w[j]||.2}}var total=0;["木","火","土","金","水"].forEach(function(k){total+=acc[k]});var out=[];return["木","火","土","金","水"].forEach(function(k){out.push({wx:k,score:Math.round(acc[k]*10)/10,pct:total?Math.round(acc[k]/total*100):0})}),{list:out,total:Math.round(total*10)/10}}function strengthOf(dayGanIdx,pillars){for(var dayWx=GAN_WX[dayGanIdx],ally=0,all=0,arr=[pillars.year,pillars.month,pillars.day,pillars.hour],i=0;i<4;i++){var p=arr[i];if(!(!p||!p.gan)){var gi=GAN.indexOf(p.gan),gwx=GAN_WX[gi],val=1;all+=val,(gwx===dayWx||WX_SHENG[gwx]===dayWx)&&(ally+=val);for(var cz=ZHI_CANG[zhiOfName(p.zhi)]||[],w=[1,.6,.3],j=0;j<cz.length;j++){var zwx=GAN_WX[GAN.indexOf(cz[j])],zv=w[j]||.2;all+=zv,(zwx===dayWx||WX_SHENG[zwx]===dayWx)&&(ally+=zv)}}}var ratio=all?ally/all:0,mwx=ZHI_WX[zhiOfName(pillars.month.zhi)],deLing=dayWx===mwx||WX_SHENG[mwx]===dayWx,hi=deLing?.5:.6,lo=deLing?.38:.52,level=ratio>=hi?"偏强":ratio<=lo?"偏弱":"中和";return{ratio:Math.round(ratio*100),level}}function gejuOf(dayGanIdx,monthZhi){var cz=ZHI_CANG[monthZhi]||[];if(!cz.length)return{name:"—",god:"—",note:""};var benQi=cz[0],god=tenGod(dayGanIdx,GAN.indexOf(benQi)),names={正官:"正官格",七杀:"七杀格",正财:"正财格",偏财:"偏财格",食神:"食神格",伤官:"伤官格",正印:"正印格",偏印:"偏印格"},name=names[god]||"";return god==="比肩"&&(name="建禄格"),god==="劫财"&&(name="月刃格"),{name:name||god+"格",god,benQi,note:"月令本气为"+benQi+"，对日主为"+god+"。"}}function daYun(opts){var yearG=opts.year.g,fwd=GAN_YINYANG[yearG]===1==(opts.gender==="男"),bjJD=opts.jd,mInfo=opts.month,jieJD=mInfo.jieJD,daysRaw;fwd?daysRaw=Math.abs(mInfo.nextJD-bjJD):daysRaw=Math.abs(bjJD-jieJD);var startAgeRaw=daysRaw/3,out=[],g=typeof opts.month.gan=="string"?GAN.indexOf(opts.month.gan):opts.month.g,z=typeof opts.month.zhi=="string"?zhiOfName(opts.month.zhi):opts.month.z;(g==null||g<0)&&(g=0),(z==null||z<0)&&(z=0);for(var i=1;i<=10;i++){g=((g+(fwd?1:-1))%10+10)%10,z=((z+(fwd?1:-1))%12+12)%12;var startY=Math.floor(startAgeRaw)+(i-1)*10;out.push({index:i,gan:GAN[g],zhi:ZHI[z],name:GAN[g]+ZHI[z],startAge:startY,startYear:opts.birthYear+startY,tenGod:tenGod(opts.dayGanIdx,g)})}return{forward:fwd,startAge:startAgeRaw,list:out}}function liuNian(year,dayGanIdx){var idx=((year-4)%60+60)%60,g=idx%10,z=idx%12;return{year,name:GAN[g]+ZHI[z],gan:GAN[g],zhi:ZHI[z],tenGod:tenGod(dayGanIdx,g),shengxiao:SHENGXIAO[z]}}function liuYue(year,dayGanIdx){for(var yg=((year-4)%10+10)%10,startGan=yg%5*2+2,out=[],i=0;i<12;i++){var zhi=(2+i)%12,g=((startGan+i)%10+10)%10;out.push({month:i+1,gan:GAN[g],zhi:ZHI[zhi],name:GAN[g]+ZHI[zhi],tenGod:tenGod(dayGanIdx,g)})}return out}var JIANCHU=["建","除","满","平","定","执","破","危","成","收","开","闭"],JIANCHU_DESC={建:"宜出行、赴任、求职。忌动土、开仓。",除:"宜除旧布新、扫舍、疗病、解除。",满:"宜祭祀、开市、纳财。忌服药、赴任。",平:"宜平治道涂、修整、用药。忌嫁娶、开市。",定:"宜定盟、签约、安床、宴请。",执:"宜执事、捕捉、问刑。忌开市、出行。",破:"宜破屋坏垣、拆改。忌嫁娶、开业、远行。",危:"宜安居、静养。忌登高、出行、诉讼。",成:"宜成事、开市、嫁娶、入学。",收:"宜收纳、进财、纳畜。忌出行、安葬。",开:"宜开市、出行、嫁娶、求医。",闭:"宜闭藏、安葬、修坟。忌开市、出行。"},JIANCHU_TONE={建:"凶",除:"吉",满:"凶",平:"凶",定:"吉",执:"吉",破:"凶",危:"吉",成:"吉",收:"凶",开:"吉",闭:"凶"};function jianchuOf(monthZhi,dayZhi){var d=((dayZhi-monthZhi)%12+12)%12,name=JIANCHU[d];return{name,desc:JIANCHU_DESC[name]||"",tone:JIANCHU_TONE[name]||"平"}}function zeRiList(year,month,dayGanIdx){for(var days=[],dim=new Date(year,month,0).getDate(),lunarMonthZhi=null,d=1;d<=dim;d++){var jd=toJD(year,month,d,12,0)-.3333333333333333,mInfo=monthGanZhi(jd),dz=dayGanZhi(year,month,d),jc=jianchuOf(mInfo.z,dz.z);days.push({day:d,zhi:ZHI[mInfo.z],dayGZ:GAN[dz.g]+ZHI[dz.z],name:jc.name,desc:jc.desc,tone:jc.tone,tenGod:tenGod(dayGanIdx,dz.g)})}return days}function paipan(input){var y=input.year,m=input.month,d=input.day,hh=input.hour||0,mi=input.minute||0,hourUnknown=!!input.hourUnknown,tst=null;if(!hourUnknown&&input.useTrueSolar&&input.lon&&(tst=trueSolarTime(y,m,d,hh,mi,input.lon),hh=tst.hh,mi=tst.mi,tst.dayShift)){var shifted=new Date(y,m-1,d+tst.dayShift);y=shifted.getFullYear(),m=shifted.getMonth()+1,d=shifted.getDate()}var dayOffset=0,jd=toJD(y,m,d,hourUnknown?0:hh,hourUnknown?0:mi)-8/24,dayInfo=dayGanZhi(y,m,d,dayOffset),yearInfo=yearGanZhi(jd),monthInfo=monthGanZhi(jd),hz=hourUnknown?-1:hourZhiOf(hh,mi),hourBaseGan=dayInfo.g;!hourUnknown&&hh>=23&&(hourBaseGan=(dayInfo.g+1)%10);var hourInfo=hourUnknown?null:hourGanZhi(hourBaseGan,hz),pillars={year:{gan:GAN[yearInfo.g],zhi:ZHI[yearInfo.z],god:""},month:{gan:GAN[monthInfo.g],zhi:ZHI[monthInfo.z],god:""},day:{gan:GAN[dayInfo.g],zhi:ZHI[dayInfo.z],god:"日主"},hour:hourUnknown?{gan:"",zhi:"",god:"",unknown:!0}:{gan:GAN[hourInfo.g],zhi:ZHI[hourInfo.z],god:""}};pillars.month.god=tenGod(dayInfo.g,monthInfo.g),pillars.year.god=tenGod(dayInfo.g,yearInfo.g),hourUnknown||(pillars.hour.god=tenGod(dayInfo.g,hourInfo.g));var dayGanIdx=dayInfo.g,gongCols=[hourUnknown?null:{key:"shen",label:"身宫",gz:shenGongOf(yearInfo.g,monthInfo.z,hz)},hourUnknown?null:{key:"ming",label:"命宫",gz:mingGongOf(yearInfo.g,monthInfo.z,hz)},{key:"tai",label:"胎元",gz:taiYuanOf(monthInfo.g,monthInfo.z)}];function buildGongCol(c){if(!c||!c.gz)return null;var gi=GAN.indexOf(c.gz.gan),zi=zhiOfName(c.gz.zhi);return{key:c.key,label:c.label,gan:c.gz.gan,zhi:c.gz.zhi,gz:c.gz.gz,god:tenGod(dayGanIdx,gi),cang:tenGodsOfZhi(dayGanIdx,zi),xy:changShengOf(dayGanIdx,zi),zz:changShengOf(gi,zi),xk:xunKongOf(gi,zi).text,ny:c.gz.nayin||nayinOf(gi,zi)}}for(var gongColumns=[buildGongCol(gongCols[0]),buildGongCol(gongCols[1]),buildGongCol(gongCols[2])],shensha=findShenSha(pillars,input.gender||"男",gongCols),dayun=daYun({year:yearInfo,month:monthInfo,dayGanIdx,gender:input.gender||"男",jd,birthYear:y}),nowYear=new Date().getFullYear(),liunian=[],i=-2;i<=9;i++)liunian.push(liuNian(nowYear+i,dayGanIdx));var extra={nayin:{year:nayinOf(yearInfo.g,yearInfo.z),month:nayinOf(monthInfo.g,monthInfo.z),day:nayinOf(dayInfo.g,dayInfo.z),hour:hourUnknown?null:nayinOf(hourInfo.g,hourInfo.z)},taiYuan:taiYuanOf(monthInfo.g,monthInfo.z),mingGong:hourUnknown?{name:"—",note:"时辰未知，命宫不排"}:mingGongOf(yearInfo.g,monthInfo.z,hz),shenGong:hourUnknown?{name:"—",note:"时辰未知，身宫不排"}:shenGongOf(yearInfo.g,monthInfo.z,hz),xunKong:xunKongOf(dayInfo.g,dayInfo.z),xunKongAll:{year:xunKongOf(yearInfo.g,yearInfo.z).text,month:xunKongOf(monthInfo.g,monthInfo.z).text,day:xunKongOf(dayInfo.g,dayInfo.z).text,hour:hourUnknown?"":xunKongOf(hourInfo.g,hourInfo.z).text},ziZuo:{year:changShengOf(yearInfo.g,yearInfo.z),month:changShengOf(monthInfo.g,monthInfo.z),day:changShengOf(dayInfo.g,dayInfo.z),hour:hourUnknown?"":changShengOf(hourInfo.g,hourInfo.z)},xingYun:{year:changShengOf(dayGanIdx,yearInfo.z),month:changShengOf(dayGanIdx,monthInfo.z),day:changShengOf(dayGanIdx,dayInfo.z),hour:hourUnknown?"":changShengOf(dayGanIdx,hourInfo.z)},wangShuai:wangShuaiOf(GAN_WX[dayGanIdx],ZHI_WX[monthInfo.z],GAN[dayGanIdx],ZHI[monthInfo.z]),strength:strengthOf(dayGanIdx,pillars),geju:gejuOf(dayGanIdx,monthInfo.z),wxPower:wxPowerOf(pillars),columns:gongColumns};return{input,trueSolar:tst,jd,pillars,dayMaster:{gan:GAN[dayGanIdx],wx:GAN_WX[dayGanIdx],yinyang:GAN_YINYANG[dayGanIdx]?"阳":"阴"},cangGan:{year:tenGodsOfZhi(dayGanIdx,zhiOfName(pillars.year.zhi)),month:tenGodsOfZhi(dayGanIdx,zhiOfName(pillars.month.zhi)),day:tenGodsOfZhi(dayGanIdx,zhiOfName(pillars.day.zhi)),hour:hourUnknown?[]:tenGodsOfZhi(dayGanIdx,zhiOfName(pillars.hour.zhi))},hourUnknown,shensha,dayun,liunian,extra,jieqi:monthInfo,shengxiao:SHENGXIAO[yearInfo.z],yearGZ:GAN[yearInfo.g]+ZHI[yearInfo.z]}}root.BaziCore={paipan,GAN,ZHI,GAN_WX,ZHI_WX,ZHI_CANG,CITY_LON,tenGod,tenGodsOfZhi,findShenSha,SHENSHA_DESC,SHENSHA_INFO,SHENGXIAO,nayinOf,taiYuanOf,mingGongOf,shenGongOf,xunKongOf,wangShuaiOf,strengthOf,gejuOf,changShengOf,CS_NAME,wxPowerOf,WX_SHENG,WX_KE,toJD,sunLongitude,solarTermJD,trueSolarTime,dayGanZhi,yearGanZhi,monthGanZhi,liuYue,jianchuOf,zeRiList,JIANCHU,JIANCHU_DESC,JIANCHU_TONE}}(typeof window!="undefined"?window:globalThis),function(){"use strict";if(window.__ndtBaziLoaded)return;window.__ndtBaziLoaded=!0;var HASH="#/bazi",ITEM_KEY="data-ndt-bazi",STYLE_ID="ndt-bazi-style",TMS_KEY="ndt-bazi-tms",TH_CLS={day:"theme-day",classic:"theme-classic",cyber:"theme-cyber",rose:"theme-rose",aurora:"theme-aurora",wechat:"theme-wechat",orange:"theme-orange"};function esc2(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}function $2(sel,root){return(root||document).querySelector(sel)}function $$2(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}function isBaziPage(){return location.hash.indexOf(HASH)===0}function ensureStyle(){if(!document.getElementById(STYLE_ID)){var css='#ndt-bazi{--bazi-gold:#B98B3E;--bazi-ink:#2A2E45;--bazi-paper:#FBF7EF;}#ndt-bazi .bz-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}#ndt-bazi .bz-head h2{margin:0;font-size:22px;letter-spacing:2px}#ndt-bazi .bz-sub{color:#8A90A8;font-size:13px}#ndt-bazi .bz-form{margin-top:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}#ndt-bazi .bz-field{display:flex;flex-direction:column;gap:5px}#ndt-bazi .bz-field label{font-size:12px;color:#7A8098;letter-spacing:1px}#ndt-bazi .bz-field input,#ndt-bazi .bz-field select{padding:9px 10px;border:1px solid #E3E7F0;border-radius:8px;background:#fff;font-size:14px;color:#2A2E45;outline:none}#ndt-bazi .bz-field input:focus,#ndt-bazi .bz-field select:focus{border-color:#B98B3E}#ndt-bazi .bz-actions{margin-top:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}#ndt-bazi .bz-btn{padding:10px 22px;border:none;border-radius:9px;background:#B98B3E;color:#fff;font-size:15px;letter-spacing:2px;cursor:pointer}#ndt-bazi .bz-btn:active{transform:translateY(1px)}#ndt-bazi .bz-btn.ghost{background:transparent;color:#B98B3E;border:1px solid #D9C49A}#ndt-bazi .bz-tip{font-size:12px;color:#9096AB;line-height:1.7}#ndt-bazi .bz-out{margin-top:20px}#ndt-bazi .bz-card{background:#fff;border:1px solid #EAE6DC;border-radius:14px;padding:16px;margin-bottom:14px}#ndt-bazi .bz-card h3{margin:0 0 12px;font-size:15px;letter-spacing:2px;color:#2A2E45;display:flex;align-items:center;gap:8px}#ndt-bazi .bz-card h3::before{content:"";width:3px;height:14px;background:#B98B3E;border-radius:2px}#ndt-bazi .bz-col{min-width:0;overflow:hidden}#ndt-bazi .bz-col .cang{word-break:break-word}#ndt-bazi .bz-pillars{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center}#ndt-bazi .bz-col{background:var(--bazi-paper);border-radius:10px;padding:10px 4px}#ndt-bazi .bz-col .lab{font-size:11px;color:#8A90A8;letter-spacing:2px}#ndt-bazi .bz-col .gz{font-size:26px;font-weight:600;color:#2A2E45;line-height:1.5;letter-spacing:4px}#ndt-bazi .bz-col .god{font-size:11px;color:#B98B3E;margin-top:2px}#ndt-bazi .bz-col .cang{font-size:11px;color:#6E7590;margin-top:4px;line-height:1.5}#ndt-bazi .bz-col .ny{font-size:10px;color:#A8AEC0;margin-top:3px;letter-spacing:1px}#ndt-bazi .bz-rows{margin-top:8px}#ndt-bazi .bz-row{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px dashed #EDE9E0;flex-wrap:wrap}#ndt-bazi .bz-row:last-child{border-bottom:none}#ndt-bazi .bz-rk{flex:0 0 72px;font-size:13px;color:#7A8098;letter-spacing:1px}#ndt-bazi .bz-row input[type=text],#ndt-bazi .bz-row input[type=number],#ndt-bazi .bz-row select{padding:8px 10px;border:1px solid #E3E7F0;border-radius:8px;background:#fff;font-size:14px;color:#2A2E45;outline:none;font-family:inherit}#ndt-bazi .bz-row input:focus,#ndt-bazi .bz-row select:focus{border-color:#B98B3E}#ndt-bazi .bz-row .w-y{width:70px}#ndt-bazi .bz-radios,#ndt-bazi .bz-checks{display:flex;align-items:center;gap:18px;flex-wrap:wrap}#ndt-bazi .bz-radios label,#ndt-bazi .bz-checks label{display:inline-flex;align-items:center;gap:6px;font-size:14px;color:#3A3F58;cursor:pointer}#ndt-bazi .bz-tabs{margin-left:auto;display:inline-flex;border:1px solid #E3E7F0;border-radius:999px;padding:3px;background:#fff}#ndt-bazi .bz-tabs span{padding:6px 20px;border-radius:999px;font-size:13px;color:#7A8098;cursor:pointer;transition:background .18s,color .18s;letter-spacing:1px}#ndt-bazi .bz-tabs span.on{background:#B98B3E;color:#fff}#ndt-bazi .bz-date{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:13px;color:#7A8098;flex:1 1 auto;min-width:0}#ndt-bazi .bz-select{display:flex;align-items:center;gap:8px;flex:1 1 auto;min-width:0;flex-wrap:wrap}#ndt-bazi .bz-select select{flex:1 1 0;min-width:104px}#ndt-bazi .bz-select .is-off{opacity:.5;cursor:not-allowed}#ndt-bazi .bz-unkcity{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#7A8098;white-space:nowrap;flex:0 0 auto;cursor:pointer}#ndt-bazi .bz-go2{display:block;width:100%;margin-top:18px;padding:15px;border:none;border-radius:12px;background:#1E2030 !important;color:#F3E7CB !important;font-size:17px;letter-spacing:6px;cursor:pointer;font-family:inherit}#ndt-bazi .bz-go2:active{transform:translateY(1px)}#ndt-bazi .bz-tbl{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px}#ndt-bazi .bz-tbl th,#ndt-bazi .bz-tbl td{padding:10px 6px;border-bottom:1px solid #EEF1F6;text-align:center;vertical-align:middle;word-break:break-word}#ndt-bazi .bz-tbl thead th{font-size:12px;color:#8A90A8;font-weight:400;letter-spacing:3px;background:#F8F6F1}#ndt-bazi .bz-tbl thead th.first{width:60px;letter-spacing:1px}#ndt-bazi .bz-tbl tbody th{width:60px;font-size:12px;color:#8A90A8;font-weight:400;letter-spacing:1px;text-align:right;padding-right:10px;background:#FCFBF7}#ndt-bazi .bz-tbl .gr{font-size:26px;font-weight:600;letter-spacing:2px;line-height:1.3}#ndt-bazi .bz-tbl .cg{font-size:12px;color:#6E7590;line-height:1.7}#ndt-bazi .bz-tbl .ln{display:block;line-height:1.78;white-space:nowrap}#ndt-bazi .bz-tbl .ssc{font-size:12.5px;color:#8A6A2F;line-height:2.1;letter-spacing:.2px}#ndt-bazi .bz-tbl tr[data-r="ss"] td{padding-top:15px;padding-bottom:15px}#ndt-bazi .bz-tbl-hint{display:none}#ndt-bazi .bz-tbl .unk{color:#C4C9D6;letter-spacing:4px;font-size:20px}#ndt-bazi .w-mu{color:#2E7D53}#ndt-bazi .w-huo{color:#B34430}#ndt-bazi .w-tu{color:#8A5A2B}#ndt-bazi .w-jin{color:#967A1F}#ndt-bazi .w-shui{color:#2F6699}#ndt-bazi .bz-tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;min-width:0;max-width:100%}#ndt-bazi{min-width:0;max-width:100%}#ndt-bazi .bz-card{min-width:0;max-width:100%}#ndt-bazi .bz-rows,#ndt-bazi .bz-row,#ndt-bazi .bz-tbl{min-width:0}#ndt-bazi .bz-row input,#ndt-bazi .bz-row select{min-width:0;max-width:100%;box-sizing:border-box}#ndt-bazi .bz-date select{max-width:46%}#ndt-bazi .bz-banner{background:#232019;color:#F0E4C8;border-radius:12px;padding:13px 16px;margin-bottom:14px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}#ndt-bazi .bz-banner .bn b{font-size:17px;letter-spacing:2px}#ndt-bazi .bz-banner .bd{font-size:12px;line-height:1.9;color:#CFC3A7}#ndt-bazi .bz-banner .bd b{color:#F0E4C8;font-weight:600}#ndt-bazi .bz-banner .zt{font-size:11px;color:#A99C7E;letter-spacing:2px}#ndt-bazi .bz-savebar{display:flex;justify-content:flex-end;margin-bottom:10px}#ndt-bazi .bz-meta{margin-top:12px;font-size:12px;color:#7A8098;line-height:1.9}#ndt-bazi .bz-meta b{color:#2A2E45}#ndt-bazi .bz-ss{display:flex;flex-wrap:wrap;gap:8px}#ndt-bazi .bz-ss-tag{border:1px solid #E7DCC4;background:#FBF7EF;color:#8A6A2E;border-radius:8px;padding:6px 10px;font-size:13px;cursor:pointer;transition:background .15s}#ndt-bazi .bz-ss-tag:hover{background:#F5EDDD}#ndt-bazi .bz-ss-tag .p{font-size:11px;opacity:.7;margin-left:4px}#ndt-bazi .ss-hit{cursor:pointer}#ndt-bazi .ss-hit:hover{color:#B98B3E;text-decoration:underline}#ndt-bazi .bz-modal{position:fixed;inset:0;z-index:12000;display:none}#ndt-bazi .bz-modal.on{display:block}#ndt-bazi .bz-modal-mask{position:absolute;inset:0;background:rgba(12,16,28,.5)}#ndt-bazi .bz-modal-card{position:relative;margin:14vh auto 0;max-width:600px;max-height:70vh;overflow:auto;background:#FBF7EF;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.3);padding:16px 20px 18px}#ndt-bazi .bz-modal-hd{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;border-bottom:1px solid #EAE6DC;padding-bottom:8px;margin-bottom:10px}#ndt-bazi .bz-modal-hd b{font-size:16px;color:#8A6A2E}#ndt-bazi .bz-modal-hd .pos{font-size:12px;color:#9AA0B4}#ndt-bazi .bz-modal-x{margin-left:auto;border:0;background:none;font-size:20px;line-height:1;cursor:pointer;color:#9AA0B4;padding:0 2px}#ndt-bazi .bz-modal-body{font-size:13px;line-height:1.85;color:#5A6178}#ndt-bazi .bz-modal-body .how{font-size:12px;color:#8A7A5E;background:#F3EADA;border-radius:6px;padding:6px 8px;margin:0 0 8px;line-height:1.7;word-break:break-word}#ndt-bazi .bz-modal-body .how em{font-style:normal;color:#B98B3E;font-weight:600;margin-right:6px}#ndt-bazi .bz-modal-body .mean{word-break:break-word}#ndt-bazi .bz-modal-body .src{font-size:11px;color:#9AA0B4;margin-top:10px;padding-top:6px;border-top:1px dashed #EDE8DC}#ndt-bazi .bz-ss-why{margin-top:10px;display:none;font-size:13px;line-height:1.8;color:#5A6178;background:#FBF7EF;border-left:3px solid #B98B3E;border-radius:0 8px 8px 0;padding:10px 12px}#ndt-bazi .bz-ss-why.on{display:block}#ndt-bazi .bz-ss-why .how{font-size:12px;color:#8A7A5E;background:#F3EADA;border-radius:6px;padding:6px 8px;margin:6px 0 8px;line-height:1.7;word-break:break-word}#ndt-bazi .bz-ss-why .how em{font-style:normal;color:#B98B3E;font-weight:600;margin-right:6px}#ndt-bazi .bz-ss-why .mean{word-break:break-word}#ndt-bazi .bz-ss-why .hd{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px}#ndt-bazi .bz-ss-why .hd b{font-size:14px;color:#8A6A2E}#ndt-bazi .bz-ss-why .hd .pos{font-size:11px;color:#9AA0B4}#ndt-bazi .bz-ss-why .src{font-size:11px;color:#9AA0B4;margin-top:8px;padding-top:6px;border-top:1px dashed #EDE8DC}#ndt-bazi .bz-ss-count{font-size:11px;color:#9AA0B4;margin-left:8px}#ndt-bazi .bz-dt-row{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;padding:9px 0;border-bottom:1px dashed #EDE8DC}#ndt-bazi .bz-dt-row:last-child{border-bottom:0}#ndt-bazi .bz-dt-row .k{flex:0 0 68px;font-size:12px;color:#8A90A8;letter-spacing:1px}#ndt-bazi .bz-dt-row .v{font-size:14px;color:#2A2E45;min-width:0;word-break:break-word}#ndt-bazi .bz-dt-row .n{font-size:11px;color:#9AA0B4;min-width:0;word-break:break-word}#ndt-bazi .bz-dt-sec{margin:14px 0 8px;font-size:12px;color:#8A90A8;letter-spacing:1px}#ndt-bazi .bz-wx-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}#ndt-bazi .bz-wx-row .w{flex:0 0 20px;font-size:13px;color:#2A2E45;font-weight:600}#ndt-bazi .bz-wx-row .bar{flex:1 1 auto;min-width:0;height:8px;background:#F0EBE1;border-radius:4px;overflow:hidden}#ndt-bazi .bz-wx-row .bar i{display:block;height:100%;background:linear-gradient(90deg,#C9A268,#B98B3E);border-radius:4px}#ndt-bazi .bz-wx-row .num{flex:0 0 auto;font-size:11px;color:#8A90A8}#ndt-bazi .bz-dy{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px}#ndt-bazi .bz-dy-cell{flex:0 0 auto;min-width:76px;text-align:center;background:var(--bazi-paper);border-radius:10px;padding:8px 6px;border:1px solid transparent}#ndt-bazi .bz-dy-cell.now{border-color:#B98B3E;background:#F8F0DE}#ndt-bazi .bz-dy-cell .a{font-size:11px;color:#8A90A8}#ndt-bazi .bz-dy-cell .g{font-size:20px;font-weight:600;letter-spacing:3px;color:#2A2E45;line-height:1.6}#ndt-bazi .bz-dy-cell .t{font-size:11px;color:#B98B3E}#ndt-bazi .bz-ln{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:8px}#ndt-bazi .bz-ln-cell{text-align:center;background:#fff;border:1px solid #ECE8DE;border-radius:8px;padding:7px 4px}#ndt-bazi .bz-ln-cell.now{border-color:#B98B3E;background:#F8F0DE}#ndt-bazi .bz-ln-cell .y{font-size:11px;color:#8A90A8}#ndt-bazi .bz-ln-cell .g{font-size:16px;font-weight:600;letter-spacing:2px;color:#2A2E45}#ndt-bazi .bz-ln-cell .t{font-size:10px;color:#B98B3E}#ndt-bazi .bz-empty{color:#8A90A8;font-size:14px;text-align:center;padding:30px 0}#ndt-bazi .bz-hh-score{font-size:34px;font-weight:600;line-height:1.2}#ndt-bazi .bz-hh-score small{font-size:13px;color:#8A90A8;margin-left:6px;font-weight:400}#ndt-bazi .bz-hh-row{display:grid;grid-template-columns:92px 48px 1fr;gap:8px;align-items:start;padding:9px 0;border-top:1px dashed #EFEBE1}#ndt-bazi .bz-hh-k{font-size:13px;color:#2A2E45;font-weight:600}#ndt-bazi .bz-hh-v{font-size:14px;font-weight:600;text-align:right}#ndt-bazi .bz-hh-w{font-size:12px;color:#6E7590;line-height:1.75}#ndt-bazi .bz-ly{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}#ndt-bazi .bz-ly-cell{background:var(--bazi-paper);border-radius:8px;text-align:center;padding:7px 2px}#ndt-bazi .bz-ly-cell .m{font-size:10px;color:#8A90A8}#ndt-bazi .bz-ly-cell .g{font-size:16px;font-weight:600;letter-spacing:2px;color:#2A2E45;line-height:1.5}#ndt-bazi .bz-ly-cell .t{font-size:10px;color:#B98B3E}#ndt-bazi .bz-zr{max-height:340px;overflow-y:auto;-webkit-overflow-scrolling:touch}#ndt-bazi .bz-zr-row{display:grid;grid-template-columns:30px 52px 44px 1fr;gap:8px;align-items:center;padding:7px 0;border-bottom:1px dashed #EFEBE1}#ndt-bazi .bz-zr-row .d{font-size:13px;color:#2A2E45;font-weight:600}#ndt-bazi .bz-zr-row .gz{font-size:13px;color:#5A6178;letter-spacing:1px}#ndt-bazi .bz-zr-row .jc{font-size:13px;font-weight:600;text-align:center}#ndt-bazi .bz-zr-row .jc.good{color:#3E8E5A}#ndt-bazi .bz-zr-row .jc.bad{color:#C0504D}#ndt-bazi .bz-zr-row .jc.flat{color:#8A90A8}#ndt-bazi .bz-zr-row .w{font-size:12px;color:#6E7590;line-height:1.6;min-width:0;word-break:break-word}#ndt-bazi .bz-zr-row{min-width:0}#ndt-bazi .bz-hh-row{min-width:0}#ndt-bazi .bz-hh-w{min-width:0;word-break:break-word}#ndt-bazi{overflow-x:hidden}#ndt-bazi .bz-savebar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}#ndt-bazi .bz-case-list{display:flex;flex-direction:column;gap:6px}#ndt-bazi .bz-case-row{display:grid;grid-template-columns:1fr 1.4fr 1fr 44px 30px;gap:6px;align-items:center;padding:8px 10px;background:#FBF7EF;border-radius:9px;min-width:0}#ndt-bazi .bz-case-row .n{font-size:13px;color:#2A2E45;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#ndt-bazi .bz-case-row .n .g{font-size:10px;color:#B98B3E;margin-left:4px}#ndt-bazi .bz-case-row .f{font-size:12px;color:#5A6178;letter-spacing:1px;min-width:0}#ndt-bazi .bz-case-row .d{font-size:11px;color:#8A90A8;min-width:0}#ndt-bazi .bz-case-row .d .t{margin-left:4px;color:#B0B6C8}#ndt-bazi .bz-case-open,#ndt-bazi .bz-case-del{padding:5px 8px;border:1px solid #D9C49A;background:#fff;border-radius:7px;font-size:12px;color:#B98B3E;cursor:pointer}#ndt-bazi .bz-case-del{border-color:#E8CCCC;color:#B06A6A}@media(max-width:900px){  #ndt-bazi .bz-case-row{grid-template-columns:1fr 1fr 44px 30px}  #ndt-bazi .bz-case-row .f{grid-column:1/-1;font-size:11px}  #ndt-bazi .bz-case-row .d{display:none}}@media(max-width:900px){  #ndt-bazi .bz-col .gz{font-size:22px;letter-spacing:2px}  #ndt-bazi .bz-pillars{gap:5px}}@media(max-width:560px){  #ndt-bazi{padding:0}  #ndt-bazi .bz-card{padding:12px;border-radius:12px}  #ndt-bazi .bz-row{gap:8px;padding:10px 0}  #ndt-bazi .bz-rk{flex:0 0 56px;font-size:12px}  #ndt-bazi .bz-row input[type=text],#ndt-bazi .bz-row input[type=number],  #ndt-bazi .bz-row select{padding:7px 7px;font-size:13px}  #ndt-bazi .bz-row .w-y{width:62px}  #ndt-bazi .bz-select select{flex:1 1 0;min-width:0}  #ndt-bazi .bz-tabs{margin-left:0}  #ndt-bazi .bz-tbl-wrap{overflow:visible;width:100%}  #ndt-bazi .bz-tbl{display:table;width:100%;min-width:100%;max-width:100%;table-layout:fixed;border-collapse:collapse}  #ndt-bazi .bz-tbl>thead{display:table-header-group;width:100%}  #ndt-bazi .bz-tbl>tbody{display:table-row-group}  #ndt-bazi .bz-tbl tr{display:table-row}  #ndt-bazi .bz-tbl th,#ndt-bazi .bz-tbl td{display:table-cell}  #ndt-bazi .bz-tbl thead th.first,#ndt-bazi .bz-tbl tbody th{width:28px}  #ndt-bazi .bz-tbl th,#ndt-bazi .bz-tbl td{padding:6px 2px}  #ndt-bazi .bz-tbl td{font-size:10.5px}  #ndt-bazi .bz-tbl tbody th,#ndt-bazi .bz-tbl thead th{font-size:10.5px;letter-spacing:0}  #ndt-bazi .bz-tbl tbody th{padding-right:2px}  #ndt-bazi .bz-tbl .gr{font-size:16px;letter-spacing:0;line-height:1.25}  #ndt-bazi .bz-tbl .cg,#ndt-bazi .bz-tbl .ssc{font-size:9.5px;letter-spacing:0}  #ndt-bazi .bz-tbl .ln{line-height:1.5}  #ndt-bazi .bz-tbl .ssc{line-height:1.6}  #ndt-bazi .bz-tbl .unk{font-size:13px;letter-spacing:1px}  #ndt-bazi .bz-tbl tr[data-r="ss"] td{padding-top:9px;padding-bottom:9px}  #ndt-bazi .bz-tbl.cols-8 th,#ndt-bazi .bz-tbl.cols-8 td{padding-left:0;padding-right:0}  #ndt-bazi .bz-tbl.cols-8 tbody th{width:26px}  #ndt-bazi .bz-tbl.cols-8 td{font-size:10px}  #ndt-bazi .bz-tbl.cols-8 .ssc,#ndt-bazi .bz-tbl.cols-8 .cg{font-size:9.5px}  #ndt-bazi .bz-tbl.cols-8 .gr{font-size:15px}  #ndt-bazi .bz-tbl-hint{display:none}  #ndt-bazi .bz-dy{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:8px;overflow:visible;padding-bottom:0}  #ndt-bazi .bz-dy-cell{min-width:0}  #ndt-bazi .bz-modal-card{margin:8vh 10px 0;max-width:none;padding:14px 15px 16px}  #ndt-bazi .bz-banner{padding:11px 12px;gap:9px}  #ndt-bazi .bz-banner .bn b{font-size:15px;letter-spacing:1px}  #ndt-bazi .bz-banner .bd{font-size:11.5px;line-height:1.8}  #ndt-bazi .bz-banner .zt{font-size:10px}  #ndt-bazi .bz-tms{margin-left:auto}  #ndt-bazi .bz-go2{padding:13px;font-size:15px;letter-spacing:3px}  #ndt-bazi .bz-meta{font-size:11px}}#ndt-bazi{--bz-ink:var(--pt-text,#2A2E45);--bz-ink2:var(--pt-text-soft,#4E5674);--bz-mut:var(--pt-muted,#8A90A8);--bz-line:var(--pt-border,#E3E7F0);--bz-line2:var(--pt-border-soft,#EEF1F6);--bz-bg:var(--pt-panel,#fff);--bz-bg2:var(--pt-panel-2,#F8F9FD);--bz-input:var(--pt-input,#fff);--bz-acc:var(--pt-accent,#B98B3E);--bz-hi:var(--pt-highlight,#B98B3E);color:var(--bz-ink)}#ndt-bazi .bz-head h2,#ndt-bazi .bz-card h3{color:var(--bz-ink)}#ndt-bazi .bz-sub,#ndt-bazi .bz-tip,#ndt-bazi .bz-meta,#ndt-bazi .bz-empty,#ndt-bazi .bz-ss-count{color:var(--bz-mut)}#ndt-bazi .bz-meta b{color:var(--bz-ink)}#ndt-bazi .bz-card{background:var(--bz-bg);border-color:var(--bz-line)}#ndt-bazi .bz-card h3::before{background:var(--bz-acc)}#ndt-bazi .bz-field label,#ndt-bazi .bz-rk{color:var(--bz-mut)}#ndt-bazi .bz-field input,#ndt-bazi .bz-field select,#ndt-bazi .bz-row input[type=text],#ndt-bazi .bz-row input[type=number],#ndt-bazi .bz-row select{background:var(--bz-input);border-color:var(--bz-line);color:var(--bz-ink)}#ndt-bazi .bz-field input:focus,#ndt-bazi .bz-field select:focus,#ndt-bazi .bz-row input:focus,#ndt-bazi .bz-row select:focus{border-color:var(--bz-acc)}#ndt-bazi .bz-radios label,#ndt-bazi .bz-checks label{color:var(--bz-ink2)}#ndt-bazi .bz-row{border-bottom-color:var(--bz-line2)}#ndt-bazi .bz-tabs{background:var(--bz-bg2);border-color:var(--bz-line)}#ndt-bazi .bz-tabs span{color:var(--bz-mut)}#ndt-bazi .bz-tabs span.on{background:var(--bz-acc);color:#fff}#ndt-bazi .bz-date{color:var(--bz-mut)}#ndt-bazi .bz-unkcity{color:var(--bz-mut)}#ndt-bazi .bz-btn{background:var(--bz-acc);color:#fff}#ndt-bazi .bz-btn.ghost{color:var(--bz-acc);border-color:var(--bz-line)}#ndt-bazi .bz-tbl th,#ndt-bazi .bz-tbl td{border-bottom-color:var(--bz-line2);color:var(--bz-ink)}#ndt-bazi .bz-tbl thead th{background:var(--bz-bg2);color:var(--bz-mut)}#ndt-bazi .bz-tbl tbody th{background:var(--bz-bg2);color:var(--bz-mut)}#ndt-bazi .bz-tbl .cg{color:var(--bz-ink2)}#ndt-bazi .bz-tbl .ssc{color:var(--bz-hi)}#ndt-bazi .bz-tbl .unk{color:var(--bz-mut)}#ndt-bazi .bz-ss-tag{border-color:var(--bz-line);background:var(--bz-bg2);color:var(--bz-ink2)}#ndt-bazi .bz-ss-tag:hover{background:var(--bz-input)}#ndt-bazi .ss-hit:hover{color:var(--bz-hi)}#ndt-bazi .bz-modal-mask{background:rgba(6,8,16,.62)}#ndt-bazi .bz-modal-card{background:var(--bz-bg);color:var(--bz-ink2);border:1px solid var(--bz-line)}#ndt-bazi .bz-modal-hd{border-bottom-color:var(--bz-line2)}#ndt-bazi .bz-modal-hd b{color:var(--bz-hi)}#ndt-bazi .bz-modal-hd .pos,#ndt-bazi .bz-modal-x{color:var(--bz-mut)}#ndt-bazi .bz-modal-body{color:var(--bz-ink2)}#ndt-bazi .bz-modal-body .how{background:var(--bz-input);color:var(--bz-mut)}#ndt-bazi .bz-modal-body .src{border-top-color:var(--bz-line2);color:var(--bz-mut)}#ndt-bazi .bz-ss-why{background:var(--bz-bg2);border-left-color:var(--bz-acc);color:var(--bz-ink2)}#ndt-bazi .bz-ss-why .how{background:var(--bz-input);color:var(--bz-mut)}#ndt-bazi .bz-ss-why .hd b{color:var(--bz-hi)}#ndt-bazi .bz-ss-why .src{border-top-color:var(--bz-line2);color:var(--bz-mut)}#ndt-bazi .bz-dt-row{border-bottom-color:var(--bz-line2)}#ndt-bazi .bz-dt-row .k,#ndt-bazi .bz-dt-row .n,#ndt-bazi .bz-dt-sec{color:var(--bz-mut)}#ndt-bazi .bz-dt-why{margin:8px 0 0;padding:9px 11px;border-radius:8px;background:var(--bz-input);font-size:12px;line-height:1.95;color:var(--bz-mut)}#ndt-bazi .bz-dt-row .v{color:var(--bz-ink)}#ndt-bazi .bz-wx-row .w,#ndt-bazi .bz-hh-k{color:var(--bz-ink)}#ndt-bazi .bz-wx-row .bar{background:var(--bz-bg2)}#ndt-bazi .bz-wx-row .bar i{background:linear-gradient(90deg,var(--bz-hi),var(--bz-acc))}#ndt-bazi .bz-wx-row .num,#ndt-bazi .bz-hh-w{color:var(--bz-mut)}#ndt-bazi .bz-dy-cell,#ndt-bazi .bz-ly-cell{background:var(--bz-bg2)}#ndt-bazi .bz-dy-cell .g,#ndt-bazi .bz-ly-cell .g{color:var(--bz-ink)}#ndt-bazi .bz-dy-cell .a,#ndt-bazi .bz-ly-cell .m{color:var(--bz-mut)}#ndt-bazi .bz-dy-cell.now,#ndt-bazi .bz-ln-cell.now{border-color:var(--bz-acc);background:var(--bz-input)}#ndt-bazi .bz-ln-cell{background:var(--bz-bg2);border-color:var(--bz-line)}#ndt-bazi .bz-ln-cell .g{color:var(--bz-ink)}#ndt-bazi .bz-ln-cell .y{color:var(--bz-mut)}#ndt-bazi .bz-hh-row{border-top-color:var(--bz-line2)}#ndt-bazi .bz-zr-row{border-bottom-color:var(--bz-line2)}#ndt-bazi .bz-zr-row .d,#ndt-bazi .bz-zr-row .gz{color:var(--bz-ink)}#ndt-bazi .bz-zr-row .w{color:var(--bz-ink2)}#ndt-bazi .bz-case-row{background:var(--bz-bg2)}#ndt-bazi .bz-case-row .n{color:var(--bz-ink)}#ndt-bazi .bz-case-row .f{color:var(--bz-ink2)}#ndt-bazi .bz-case-row .d{color:var(--bz-mut)}#ndt-bazi .bz-case-open{background:var(--bz-input);border-color:var(--bz-line);color:var(--bz-acc)}#ndt-bazi .bz-case-del{background:var(--bz-input);border-color:var(--bz-line);color:#C0544D}#ndt-bazi .w-mu{color:#2FA36B}#ndt-bazi .w-huo{color:#DD4B39}#ndt-bazi .w-tu{color:#8E5A2C}#ndt-bazi .w-jin{color:#E0B33C}#ndt-bazi .w-shui{color:#3E86D8}#ndt-bazi .bz-banner{display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:linear-gradient(100deg,#1B1B18,#2C2519 58%,#1F1C16);color:#F4E9CE;border-radius:14px;padding:13px 16px;margin-bottom:14px}#ndt-bazi .bz-banner .logo{flex:0 0 auto;width:46px;height:46px;border-radius:50%;background:rgba(240,228,200,.10);border:1px solid rgba(240,228,200,.35);color:#E8CE93;display:flex;align-items:center;justify-content:center}#ndt-bazi .bz-banner .logo svg{width:26px;height:26px}#ndt-bazi .bz-banner .bn{flex:1 1 240px;min-width:0}#ndt-bazi .bz-banner .bn b{font-size:18px;letter-spacing:2px}#ndt-bazi .bz-banner .bd{font-size:12px;line-height:1.95;color:#CFC3A7;margin-top:3px}#ndt-bazi .bz-banner .bd b{color:#F4E9CE;font-weight:600}#ndt-bazi .bz-banner .bd .zt{color:#A99C7E;margin-left:2px}#ndt-bazi .bz-tms{display:inline-flex;align-items:center;gap:9px;font-size:12px;color:#CFC3A7;cursor:pointer;user-select:none;flex:0 0 auto}#ndt-bazi .bz-tms input{position:absolute;opacity:0;width:0;height:0}#ndt-bazi .bz-tms .sw{width:38px;height:21px;border-radius:11px;background:rgba(255,255,255,.18);position:relative;transition:background .18s}#ndt-bazi .bz-tms .sw i{position:absolute;top:2px;left:2px;width:17px;height:17px;border-radius:50%;background:#F4E9CE;transition:left .18s}#ndt-bazi .bz-tms input:checked + .sw{background:#C9A227}#ndt-bazi .bz-tms input:checked + .sw i{left:19px}#ndt-bazi .bz-tbl thead th.gong{color:var(--bz-hi)}@media(max-width:560px){  #ndt-bazi .bz-banner{padding:11px 12px;gap:9px}  #ndt-bazi .bz-banner .logo{width:38px;height:38px}  #ndt-bazi .bz-banner .logo svg{width:22px;height:22px}  #ndt-bazi .bz-banner .bn b{font-size:16px}  #ndt-bazi .bz-tbl thead th.gong,#ndt-bazi .bz-tbl thead th.zhu{font-size:11px;letter-spacing:0}}',st=document.createElement("style");st.id=STYLE_ID,st.textContent=css,document.head.appendChild(st)}}var BAZI_ICON='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="4.6" x2="4" y2="17.4"/><line x1="9.4" y1="4.6" x2="9.4" y2="17.4"/><line x1="14.6" y1="4.6" x2="14.6" y2="17.4"/><line x1="20" y1="4.6" x2="20" y2="17.4"/><line x1="2.2" y1="20.4" x2="21.8" y2="20.4"/></svg>';function ensureSideItem(){var bar=$2(".sidebar");if(bar){var item=$2("["+ITEM_KEY+"]",bar);item||(item=document.createElement("div"),item.className="side-item",item.setAttribute("data-section","bazi"),item.setAttribute("data-hash",HASH),item.setAttribute(ITEM_KEY,"1"),item.innerHTML=BAZI_ICON+'<span class="side-item-label">四柱八字</span>');var ref=$2('.side-item[data-section="divination"]',bar);if(ref&&ref.parentNode===bar){(item.parentNode!==bar||item.previousElementSibling!==ref)&&bar.insertBefore(item,ref.nextSibling);return}item.parentNode!==bar&&bar.appendChild(item)}}var MEM_KEY="ndt-bazi-last";function loadLast(){try{var raw=localStorage.getItem(MEM_KEY);return raw?JSON.parse(raw):null}catch(e){return null}}var formCal="solar";function formHtml(){var last=loadLast()||{},now=new Date,y=last.year||now.getFullYear()-25;formCal=last.cal==="lunar"?"lunar":"solar";var mm=last.month||6,dd=last.day||15,optMon="",optDay="",i,j;for(i=1;i<=12;i++)optMon+='<option value="'+i+'"'+(mm===i?" selected":"")+">"+i+"</option>";for(j=1;j<=31;j++)optDay+='<option value="'+j+'"'+(dd===j?" selected":"")+">"+j+"</option>";var HOUR_OPT=[["unknown","未知时辰"],["00:00","子时 00:00"],["02:00","丑时 02:00"],["04:00","寅时 04:00"],["06:00","卯时 06:00"],["08:00","辰时 08:00"],["10:00","巳时 10:00"],["12:00","午时 12:00"],["14:00","未时 14:00"],["16:00","申时 16:00"],["18:00","酉时 18:00"],["20:00","戌时 20:00"],["22:00","亥时 22:00"],["23:00","晚子时 23:00"]],curT=last.time||"12:00",optHour=HOUR_OPT.map(function(h){return'<option value="'+h[0]+'"'+(curT===h[0]?" selected":"")+">"+h[1]+"</option>"}).join(""),isMale=last.gender!=="女";return'<div class="bz-card">  <div class="bz-head"><h2>四柱八字</h2><span class="bz-sub">子平法 · 年柱以立春为界 · 月柱以十二节为界</span></div>  <div class="bz-rows">    <div class="bz-row"><span class="bz-rk">命主姓名</span>      <input id="bz-name" type="text" maxlength="12" placeholder="可不填" value="'+esc2(last.name||"")+'" style="flex:1 1 0;min-width:0">      <span class="bz-rk" style="flex:0 0 auto">分组</span>      <input id="bz-group" type="text" maxlength="12" placeholder="如：家人、朋友" value="'+esc2(last.group||"")+'" style="width:120px">    </div>    <div class="bz-row"><span class="bz-rk">性别</span>      <div class="bz-radios">        <label><input type="radio" name="bz-gender" value="男"'+(isMale?" checked":"")+'>男</label>        <label><input type="radio" name="bz-gender" value="女"'+(isMale?"":" checked")+'>女</label>      </div>      <div class="bz-tabs" id="bz-cal-tabs">        <span data-v="solar"'+(formCal==="solar"?' class="on"':"")+'>公历</span>        <span data-v="lunar"'+(formCal==="lunar"?' class="on"':"")+'>农历</span>      </div>    </div>    <div class="bz-row"><span class="bz-rk">出生时间</span>      <div class="bz-date">        <input id="bz-y" class="w-y" type="number" min="1900" max="2100" value="'+y+'">年        <select id="bz-m">'+optMon+'</select>月        <select id="bz-d">'+optDay+'</select>日        <select id="bz-h">'+optHour+'</select>        <label id="bz-leap-wrap" style="display:'+(formCal==="lunar"?"inline-flex":"none")+'">          <input id="bz-leap" type="checkbox">闰月</label>      </div>    </div>    <div class="bz-row"><span class="bz-rk">出生地址</span>      <div class="bz-select">        <select id="bz-prov" aria-label="省"></select>        <select id="bz-city" aria-label="市"></select>        <select id="bz-dist" aria-label="区县"></select>        <label class="bz-unkcity"><input type="checkbox" id="bz-unk-city"'+(last.unkCity?" checked":"")+'>未知地</label>      </div>    </div>    <div class="bz-row"><span class="bz-rk">选项</span>      <div class="bz-checks">        <label><input id="bz-tst" type="checkbox"'+(last.useTST===!1?"":" checked")+'>真太阳时</label>      </div>    </div>  </div>  <div class="bz-tip" id="bz-tst-note" style="margin-top:10px"></div>  <button class="bz-go2" id="bz-go">开始排盘</button></div><div class="bz-card"><h3>案例存档</h3><div id="bz-cases"></div></div><div class="bz-out" id="bz-out"><div class="bz-empty">填好出生信息后点「开始排盘」</div></div>'}function regionData(){return window.BAZI_REGION||[]}var REGION_SRC="assets/js/bazi-region.js?v=100",regionLoading=!1,regionWaiters=[];function loadRegion(cb){if(window.BAZI_REGION){typeof cb=="function"&&cb();return}if(typeof cb=="function"&&regionWaiters.push(cb),!regionLoading){regionLoading=!0;var s=document.createElement("script");s.src=REGION_SRC,s.async=!0,s.onload=s.onerror=function(){regionLoading=!1;var list=regionWaiters.splice(0);list.forEach(function(fn){try{fn()}catch(e){}})},(document.head||document.documentElement).appendChild(s)}}var ADDR_IDS=["bz-prov","bz-city","bz-dist"],HH_ADDR_IDS=["bz-hh-prov","bz-hh-city","bz-hh-dist"];function addrFillCity(keepName,ids){var id=ids||ADDR_IDS,R=regionData(),ps=$2("#"+id[0]),cs=$2("#"+id[1]);if(!(!ps||!cs)){var p=R[Number(ps.value)]||R[0];cs.innerHTML=(p?p.c:[]).map(function(c,i){var sel=keepName&&c.n===keepName?" selected":"";return'<option value="'+i+'"'+sel+">"+esc2(c.n)+"</option>"}).join(""),addrFillDist(null,id)}}function addrFillDist(keepName,ids){var id=ids||ADDR_IDS,R=regionData(),ps=$2("#"+id[0]),cs=$2("#"+id[1]),ds=$2("#"+id[2]);if(!(!ps||!cs||!ds)){var p=R[Number(ps.value)]||R[0],c=p&&p.c[Number(cs.value||0)]||null;ds.innerHTML=(c?c.d:[]).map(function(d,i){var sel=keepName&&d[1]===keepName?" selected":"";return'<option value="'+i+'"'+sel+">"+esc2(d[1])+"</option>"}).join("")}}function addrNow(ids){var id=ids||ADDR_IDS,R=regionData(),ps=$2("#"+id[0]),cs=$2("#"+id[1]),ds=$2("#"+id[2]),p=R[Number(ps&&ps.value)]||R[0]||null,c=p&&p.c[Number(cs&&cs.value)]||null,d=c&&c.d[Number(ds&&ds.value)]||null,town=ids?"":(($2("#bz-town")||{}).value||"").replace(/^\s+|\s+$/g,"");return{p,c,d,town,lon:d?Number(d[2]):null,text:[p&&p.n,c&&c.n,d&&d[1],town].filter(Boolean).join(" ")}}function addrApply(name,ids){var id=ids||ADDR_IDS,R=regionData(),ps=$2("#"+id[0]),cs=$2("#"+id[1]),ds=$2("#"+id[2]);if(!ps||!cs||!ds||!R.length)return!1;var parts=String(name||"").split(/[\s,，]+/).filter(Boolean);if(parts.length>=2){var pi=-1,ci=-1,di=-1,i,j,k;for(i=0;i<R.length;i++)if(R[i].n===parts[0]){pi=i;break}if(pi>=0){for(j=0;j<R[pi].c.length;j++)if(R[pi].c[j].n===parts[1]){ci=j;break}if(ci>=0&&parts[2]){for(k=0;k<R[pi].c[ci].d.length;k++)if(R[pi].c[ci].d[k][1]===parts[2]){di=k;break}}}if(pi>=0&&ci>=0)return ps.value=String(pi),addrFillCity(R[pi].c[ci].n,id),cs.value=String(ci),addrFillDist(di>=0?R[pi].c[ci].d[di][1]:null,id),di>=0&&(ds.value=String(di)),!0}var one=parts[0]||"";if(!one)return!1;var pIdx=-1,cIdx=-1,dIdx=-1,i2,j2,k2;for(i2=0;i2<R.length&&pIdx<0;i2++)R[i2].n.indexOf(one)===0&&(pIdx=i2);if(pIdx<0)for(i2=0;i2<R.length&&pIdx<0;i2++)for(j2=0;j2<R[i2].c.length&&pIdx<0;j2++)R[i2].c[j2].n.indexOf(one)===0&&(pIdx=i2,cIdx=j2);if(pIdx<0)for(i2=0;i2<R.length&&pIdx<0;i2++)for(j2=0;j2<R[i2].c.length&&pIdx<0;j2++)for(k2=0;k2<R[i2].c[j2].d.length&&pIdx<0;k2++)R[i2].c[j2].d[k2][1].indexOf(one)===0&&(pIdx=i2,cIdx=j2,dIdx=k2);return pIdx<0?!1:(ps.value=String(pIdx),addrFillCity(cIdx>=0?R[pIdx].c[cIdx].n:null,id),cIdx>=0&&(cs.value=String(cIdx),addrFillDist(dIdx>=0?R[pIdx].c[cIdx].d[dIdx][1]:null,id),dIdx>=0&&(ds.value=String(dIdx))),!0)}function addrLock(lock){var ids=["bz-prov","bz-city","bz-dist","bz-town"];ids.forEach(function(id){var el=$2("#"+id);el&&(el.disabled=!!lock,el.classList[lock?"add":"remove"]("is-off"))})}function addrInit(){var R=regionData(),ps=$2("#bz-prov");if(ps){if(!R.length){ps.innerHTML='<option value="0">出生地加载中…</option>';var csX=$2("#bz-city"),dsX=$2("#bz-dist");csX&&(csX.innerHTML='<option value="0">—</option>'),dsX&&(dsX.innerHTML='<option value="0">—</option>');var noteX=$2("#bz-tst-note");noteX&&(noteX.textContent="正在加载出生地数据，稍等即可选择。"),loadRegion(function(){window.BAZI_REGION&&isBaziPage()&&(addrInit(),syncFormNote())});return}ps.innerHTML=R.map(function(p,i){return'<option value="'+i+'">'+esc2(p.n)+"</option>"}).join("");var last=loadLast()||{},a=last.addr;if(a&&a.p!==void 0){ps.value=String(a.p),addrFillCity(a.cn||null);var cs=$2("#bz-city");cs&&a.c!==void 0&&(cs.value=String(a.c),addrFillDist(a.dn||null));var ds=$2("#bz-dist");ds&&a.d!==void 0&&(ds.value=String(a.d))}else last.city&&last.city!=="unknown"&&last.city!=="未知地"?addrApply(last.city):addrApply("北京市");var townEl=$2("#bz-town");townEl&&(townEl.value=last.town||"");var unkEl=$2("#bz-unk-city");unkEl&&(last.unkCity&&(unkEl.checked=!0),addrLock(unkEl.checked))}}function bindForm(){$$2("#bz-cal-tabs span").forEach(function(s){s.addEventListener("click",function(){$$2("#bz-cal-tabs span").forEach(function(x){x.classList.remove("on")}),s.classList.add("on"),formCal=s.getAttribute("data-v");var lp=$2("#bz-leap-wrap");lp&&(lp.style.display=formCal==="lunar"?"inline-flex":"none"),syncFormNote()})});var ps=$2("#bz-prov"),cs=$2("#bz-city"),ds=$2("#bz-dist"),unkEl=$2("#bz-unk-city");ps&&ps.addEventListener("change",function(){addrFillCity(null),syncFormNote()}),cs&&cs.addEventListener("change",function(){addrFillDist(null),syncFormNote()}),ds&&ds.addEventListener("change",syncFormNote),unkEl&&unkEl.addEventListener("change",function(){addrLock(unkEl.checked),syncFormNote()});var hEl=$2("#bz-h");hEl&&hEl.addEventListener("change",syncFormNote);var townEl=$2("#bz-town");townEl&&townEl.addEventListener("input",syncFormNote),unkEl&&addrLock(unkEl.checked);var tst=$2("#bz-tst");tst&&tst.addEventListener("change",syncFormNote),syncFormNote()}function syncFormNote(){var unkCity=!!($2("#bz-unk-city")&&$2("#bz-unk-city").checked),t=($2("#bz-h")||{}).value||"",tst=$2("#bz-tst"),unkHour=t==="unknown";tst&&(unkCity||unkHour)?(tst.disabled=!0,tst.checked=!1):tst&&(tst.disabled=!1);var a=addrNow(),parts=[];unkCity?parts.push("出生地未填，经度按东经 120° 计，不做真太阳时校正"):a.lon!==null&&!isNaN(a.lon)&&(parts.push("出生地 "+(a.text||"—")+"，经度 东经 "+a.lon.toFixed(2)+"°"),parts.push(tst&&tst.checked?"已按经度与均时差校正":"未勾选真太阳时，按北京时间排")),unkHour&&parts.push("时辰未知，只排年、月、日三柱");var box=$2("#bz-tst-note");box&&(box.textContent=parts.join("　｜　"))}var PILLAR_LABEL={year:"年柱",month:"月柱",day:"日柱",hour:"时柱"},PILLAR_SHORT={year:"年",month:"月",day:"日",hour:"时"},WX_CLASS={木:"w-mu",火:"w-huo",土:"w-tu",金:"w-jin",水:"w-shui"};function gzSpan(ch,isGan){if(!ch)return"";var wx=isGan?BaziCore.GAN_WX[BaziCore.GAN.indexOf(ch)]:BaziCore.ZHI_WX[BaziCore.ZHI.indexOf(ch)];return'<span class="'+(WX_CLASS[wx]||"")+'">'+esc2(ch)+"</span>"}function tmsOn(){try{return localStorage.getItem(TMS_KEY)==="on"}catch(e){return!1}}function setTms(on){try{localStorage.setItem(TMS_KEY,on?"on":"off")}catch(e){}}function pillarTable(r,opts){opts=opts||{};var e=r.extra||{},ny=e.nayin||{},cgA=r.cangGan||{},xkA=e.xunKongAll||{},xyA=e.xingYun||{},zzA=e.ziZuo||{},unknown=!!r.hourUnknown,gender=r.input&&r.input.gender||"男",ssList=r.shensha||[],gong=e.columns||[];function ssOf(list,pillarName){return list.filter(function(s){return s.pillar===pillarName}).map(function(s){return'<span class="ln ss-hit" data-ss="'+esc2(s.name)+'" data-pos="'+esc2(pillarName)+'">'+esc2(s.name)+"</span>"}).join("")}function cangHtml(list){return!list||!list.length?"—":list.map(function(x){var wx=BaziCore.GAN_WX[BaziCore.GAN.indexOf(x.gan)];return'<span class="ln '+(WX_CLASS[wx]||"")+'">'+esc2(x.gan)+"</span>"}).join("")}function fuHtml(list){return!list||!list.length?"—":list.map(function(x){return'<span class="ln">'+esc2(x.god)+"</span>"}).join("")}var mode=opts.mode==="gong"?"gong":"yun",dayGanIdx=BaziCore.GAN.indexOf(r.dayMaster.gan),nowY=new Date().getFullYear(),lnCur=null,dyCur=null;(r.liunian||[]).forEach(function(x){x.year===nowY&&(lnCur=x)});for(var dyList=r.dayun&&r.dayun.list||[],di=0;di<dyList.length;di++)nowY>=dyList[di].startYear&&(dyCur=dyList[di]);var yunSs=[];if(mode==="yun"&&(lnCur||dyCur)){var extraCols=[];lnCur&&extraCols.push({gz:{gan:lnCur.gan,zhi:lnCur.zhi}}),dyCur&&extraCols.push({gz:{gan:dyCur.gan,zhi:dyCur.zhi}});try{yunSs=BaziCore.findShenSha(r.pillars,gender,extraCols,["流年","大运",""])}catch(err){yunSs=[]}}function yunCol(label,g,z){var gi=BaziCore.GAN.indexOf(g),zi=BaziCore.ZHI.indexOf(z),cang=BaziCore.tenGodsOfZhi(dayGanIdx,zi);return{label,yun:!0,god:esc2(BaziCore.tenGod(dayGanIdx,gi)),gan:gzSpan(g,!0),zhi:gzSpan(z,!1),cang:cangHtml(cang),fu:fuHtml(cang),xy:esc2(BaziCore.changShengOf(dayGanIdx,zi)),zz:esc2(BaziCore.changShengOf(gi,zi)),xk:esc2(BaziCore.xunKongOf(gi,zi).text),ny:esc2(BaziCore.nayinOf(gi,zi).name),ss:ssOf(yunSs,label)}}var cols=[];mode==="yun"?(lnCur&&cols.push(yunCol("流年",lnCur.gan,lnCur.zhi)),dyCur&&cols.push(yunCol("大运",dyCur.gan,dyCur.zhi))):["身宫","命宫","胎元"].forEach(function(lab,i){var c=gong[i];if(!c){cols.push({label:lab,gong:!0,god:"—",gan:"—",zhi:"—",cang:"—",fu:"—",xy:"—",zz:"—",xk:"—",ny:"—",ss:"—"});return}cols.push({label:lab,gong:!0,god:esc2(c.god||""),gan:gzSpan(c.gan,!0),zhi:gzSpan(c.zhi,!1),cang:cangHtml(c.cang),fu:fuHtml(c.cang),xy:esc2(c.xy||""),zz:esc2(c.zz||""),xk:esc2(c.xk||""),ny:esc2(c.ny&&c.ny.name||""),ss:ssOf(ssList,lab)})}),["year","month","day","hour"].forEach(function(k){var p=r.pillars[k]||{};if(k==="hour"&&unknown){cols.push({label:PILLAR_LABEL[k],god:"未知",gan:'<span class="unk">未知</span>',zhi:'<span class="unk">未知</span>',cang:"—",fu:"—",xy:"—",zz:"—",xk:"—",ny:"—",ss:"—"});return}cols.push({label:PILLAR_LABEL[k],god:esc2(k==="day"?gender==="女"?"元女":"元男":p.god||""),gan:gzSpan(p.gan,!0),zhi:gzSpan(p.zhi,!1),cang:cangHtml(cgA[k]),fu:fuHtml(cgA[k]),xy:esc2(xyA[k]||""),zz:esc2(zzA[k]||""),xk:esc2(xkA[k]||""),ny:esc2(ny[k]?ny[k].name:""),ss:ssOf(ssList,PILLAR_SHORT[k])})});var TROWS=[["主星","god",""],["天干","gan","gr"],["地支","zhi","gr"],["藏干","cang","cg"],["副星","fu","cg"],["星运","xy",""],["自坐","zz",""],["空亡","xk",""],["纳音","ny",""],["神煞","ss","ssc"]],head='<thead><tr><th class="first">日期</th>'+cols.map(function(c){return'<th class="'+(c.gong?"gong":"zhu")+'">'+esc2(c.label)+"</th>"}).join("")+"</tr></thead>",body=TROWS.map(function(rw){return'<tr data-r="'+rw[1]+'"><th>'+rw[0]+"</th>"+cols.map(function(c){return'<td class="'+(rw[2]||"")+'">'+c[rw[1]]+"</td>"}).join("")+"</tr>"}).join("");return'<div class="bz-tbl-wrap"><table class="bz-tbl'+(cols.length>=8?" cols-8":"")+'" data-mode="'+mode+'" style="--bz-cols:'+cols.length+'">'+head+"<tbody>"+body+'</tbody></table></div><div class="bz-tbl-hint">左右滑动查看各柱 · 共 '+cols.length+" 列</div>"}function srcText(s){for(var raw=String(s==null?"":s).replace(/\r/g,""),lines=raw.split(`
`).map(function(x){return x.replace(/^[\s\u3000]+/,"").replace(/[\s\u3000]+$/,"")}),kept=[],i=0;i<lines.length;i++)lines[i]===""&&kept.length&&kept[kept.length-1]===""||kept.push(lines[i]);for(;kept.length&&kept[kept.length-1]==="";)kept.pop();return esc2(kept.join(`
`)).replace(/\n/g,"<br>")}function ssTipHtml(r){return r.shensha.length?'<div class="bz-tip" style="margin-top:6px">神煞名点一下看古诀查法与原文释义，本盘共命中 '+r.shensha.length+" 条。释义与查法照抄问真八字官网（pcbz.iwzwh.com）神煞条目原文。</div>":""}function ssModalHtml(){return'<div class="bz-modal" id="bz-ss-modal" aria-hidden="true">  <div class="bz-modal-mask" data-ss-close="1"></div>  <div class="bz-modal-card" role="dialog" aria-modal="true" aria-labelledby="bz-ss-name">    <div class="bz-modal-hd"><b id="bz-ss-name">神煞</b><span class="pos" id="bz-ss-pos"></span>      <button class="bz-modal-x" data-ss-close="1" aria-label="关闭">×</button></div>    <div class="bz-modal-body" id="bz-ss-body"></div>  </div></div>'}function openSs(name,pos){var info=(BaziCore.SHENSHA_INFO||{})[name]||{},m=document.getElementById("bz-ss-modal");if(m){var nm=document.getElementById("bz-ss-name"),ps=document.getElementById("bz-ss-pos"),bd=document.getElementById("bz-ss-body");if(nm&&(nm.textContent=name||"神煞"),ps){var posTxt=pos||"";(posTxt==="年"||posTxt==="月"||posTxt==="日"||posTxt==="时")&&(posTxt+="柱"),ps.textContent=posTxt}var h="";info.how&&(h+='<div class="how"><em>古诀查法</em>'+srcText(info.how)+"</div>"),h+='<div class="mean">'+(info.desc?srcText(info.desc):"<span>该神煞暂无释义。</span>")+"</div>",h+='<div class="src">出处：问真八字官网（pcbz.iwzwh.com）神煞条目原文</div>',bd&&(bd.innerHTML=h),m.classList.add("on"),m.setAttribute("aria-hidden","false")}}function closeSs(){var m=document.getElementById("bz-ss-modal");m&&(m.classList.remove("on"),m.setAttribute("aria-hidden","true"))}function detailHtml(r){var e=r.extra;if(!e)return"";function row(label,val,note){return'<div class="bz-dt-row"><span class="k">'+esc2(label)+'</span><span class="v">'+val+"</span>"+(note?'<span class="n">'+esc2(note)+"</span>":"")+"</div>"}var ny=e.nayin,nyText=[ny.year,ny.month,ny.day,ny.hour].map(function(x){return x?esc2(x.name):"—"}).join(" · "),bars=e.wxPower.list.map(function(x){return'<div class="bz-wx-row"><span class="w">'+esc2(x.wx)+'</span><span class="bar"><i style="width:'+Math.max(4,x.pct)+'%"></i></span><span class="num">'+x.score+"／"+x.pct+"%</span></div>"}).join(""),s=e.strength,ssTone=s.level==="偏强"?"#9A6B2F":s.level==="偏弱"?"#5A6B8C":"#4C7A5B";return"<h3>详尽盘</h3>"+row("四柱纳音",nyText,"")+row("胎元","<b>"+esc2(e.taiYuan.gz)+"</b>"+(e.taiYuan.nayin?"（"+esc2(e.taiYuan.nayin.name)+"）":""),"月干进一位、月支进三位")+row("命宫",e.mingGong.gz?"<b>"+esc2(e.mingGong.gz)+"</b>"+(e.mingGong.nayin?"（"+esc2(e.mingGong.nayin.name)+"）":""):"—",e.mingGong.gz?"依月支与时支推":e.mingGong.note||"")+row("身宫",e.shenGong.gz?"<b>"+esc2(e.shenGong.gz)+"</b>"+(e.shenGong.nayin?"（"+esc2(e.shenGong.nayin.name)+"）":""):"—",e.shenGong.gz?"依月支与时支推":e.shenGong.note||"")+row("旬空","<b>"+esc2(e.xunKong.text)+"</b>","日柱所在旬所缺二支")+row("月令旺衰","<b>"+esc2(e.wangShuai.state)+"</b>",e.wangShuai.note)+row("格局","<b>"+esc2(e.geju.name)+"</b>",e.geju.note)+'<div class="bz-dt-sec">五行力量</div><div class="bz-wx">'+bars+'</div><div class="bz-dt-row"><span class="k">日主强弱</span><span class="v" style="color:'+ssTone+'"><b>'+esc2(s.level)+'</b></span><span class="n">同党占 '+s.ratio+'%（比劫＋印为同党）</span></div><div class="bz-dt-why">综合判定：'+esc2(strengthWhy(r))+"</div>"}function strengthWhy(r){var e=r.extra||{},ws=e.wangShuai||{},s=e.strength||{},dayGan=r.pillars.day.gan,monthZhi=r.pillars.month.zhi,dwx=BaziCore.GAN_WX[BaziCore.GAN.indexOf(dayGan)],mwx=BaziCore.ZHI_WX[BaziCore.ZHI.indexOf(monthZhi)],deLing=ws.state==="旺"||ws.state==="相",lv=String(s.level||""),head="日主"+dayGan+"（"+dwx+"）生于"+monthZhi+"月，"+mwx+"当令、日主"+(deLing?"得令":"失令");deLing||(head+="（月令"+mwx+"旺"+dwx+"弱）");var tail;return lv==="中和"?tail="同党（比劫＋印）占 "+s.ratio+"%，与月令的耗泄大致相当，故判中和。":deLing?tail="同党（比劫＋印）占 "+s.ratio+"%，又得月令生扶，故判"+lv+"。":lv.indexOf("强")>=0?tail="同党（比劫＋印）占 "+s.ratio+"%，已过六成、比劫与印成势，虽失月令仍判"+lv+"。":tail="同党（比劫＋印）占 "+s.ratio+"%，但月令权重最大，同党之力抵不过月令，故判"+lv+"。",head+"；"+tail}function dayunHtml(r){var sa=r.dayun.startAge,sy=Math.floor(sa),sm=Math.round((sa-sy)*12);sm>=12&&(sy+=1,sm-=12);var zhou=Math.round(sa),xu=zhou+1,d0=new Date(r.input.year,r.input.month-1,r.input.day),d1=new Date(d0.getFullYear(),d0.getMonth()+sm,d0.getDate());d1.setFullYear(d1.getFullYear()+sy);var jiaoDate=d1.getFullYear()+"年"+(d1.getMonth()+1)+"月"+d1.getDate()+"日",nowXu=new Date().getFullYear()-r.input.year+1,cells=r.dayun.list.map(function(d){var xuStart=d.startAge+1,isNow=nowXu>=xuStart&&nowXu<xuStart+10;return'<div class="bz-dy-cell'+(isNow?" now":"")+'"><div class="a">'+(d.startAge+1)+'岁（虚）</div><div class="g">'+esc2(d.name)+'</div><div class="t">'+esc2(d.tenGod)+"</div></div>"}).join(""),dir=r.dayun.forward?"顺排":"逆排";return'<div class="bz-tip" style="margin-bottom:10px">'+dir+" · 出生后 "+sy+"年"+sm+"个月 起运（约 "+zhou+" 周岁，"+xu+" 虚岁起运）· 首运交于 "+jiaoDate+'<br>大运年龄按虚岁标（虚岁＝周岁＋１），与问真八字一致。</div><div class="bz-dy">'+cells+"</div>"}function liunianHtml(r){var nowY=new Date().getFullYear(),cells=r.liunian.filter(function(l){return l.year>=nowY}).slice(0,10).map(function(l){return'<div class="bz-ln-cell'+(l.year===nowY?" now":"")+'"><div class="y">'+l.year+'</div><div class="g">'+esc2(l.name)+'</div><div class="t">'+esc2(l.tenGod)+"</div></div>"}).join("");return'<div class="bz-ln">'+cells+"</div>"}function resultHtml(r){var tst=r.trueSolar,unk=!!r.hourUnknown,tstLine="";tst&&(tstLine="真太阳时 <b>"+pad(tst.hh)+":"+pad(tst.mi)+"</b>（较北京时间 "+(tst.deltaMin>=0?"+":"")+tst.deltaMin+" 分钟"+(tst.dayShift?"，跨至"+(tst.dayShift>0?"次日":"前一日"):"")+"）");var birth=r.input.year+"年"+r.input.month+"月"+r.input.day+"日 "+(unk?"未知时辰":pad(r.input.hour)+":"+pad(r.input.minute)),lunarLine="";if(window.BaziLunar){var lu=BaziLunar.solarToLunar(r.input.year,r.input.month,r.input.day);lu&&(lunarLine=esc2(lu.text))}var nm=(($2("#bz-name")||{}).value||"").trim()||"未命名",zao=r.input.gender==="女"?"坤造":"乾造";return'<div class="bz-card">  <div class="bz-savebar">    <button class="bz-btn" id="bz-save">存入案例</button>  </div>  <div class="bz-banner">    <span class="logo">'+BAZI_ICON+'</span>    <div class="bn"><b>'+esc2(nm)+'</b>      <div class="bd">        <div>'+(lunarLine?"阴历 <b>"+lunarLine+"</b>":"阴历 <b>—</b>")+'          <span class="zt">（'+zao+(unk?" · 时辰未知":"")+"）</span></div>        <div>阳历 <b>"+esc2(birth)+"</b>"+(tst?'<span class="zt">（已按真太阳时换算）</span>':"")+"</div>        <div>出生地 <b>"+esc2(r.input.city||"未知地")+"</b>"+(r.input.cityUnknown?'<span class="zt">（按东经 120° 计）</span>':'<span class="zt">（东经 '+(Number(r.input.lon)||120).toFixed(2)+"°）</span>")+'</div>      </div>    </div>    <label class="bz-tms" title="打开后左列排身宫 / 命宫 / 胎元；关闭则排流年 / 大运">      <input type="checkbox" id="bz-tms"'+(tmsOn()?" checked":"")+'>      <span class="sw"><i></i></span><span>胎命身</span>    </label>  </div><div id="bz-tbl-host">'+pillarTable(r,{mode:tmsOn()?"gong":"yun"})+'</div>  <div class="bz-meta">    生肖 <b>'+esc2(r.shengxiao)+"</b>　日主 <b>"+esc2(r.dayMaster.gan+"（"+r.dayMaster.wx+"·"+r.dayMaster.yinyang+"）")+"</b>"+(tstLine?"<br>"+tstLine:"")+(r.jieqi.jie?"<br>生于 <b>"+esc2(r.jieqi.jie)+"</b> 之后，月令为 <b>"+esc2(r.pillars.month.zhi)+"</b>":"")+(unk?"<br>时辰未知，时柱与涉及时支的神煞不排；命宫、身宫须以时支推，此处不给。":"")+ssTipHtml(r)+'  </div></div><div class="bz-card">'+detailHtml(r)+'</div><div class="bz-card"><h3>大运</h3>'+dayunHtml(r)+'</div><div class="bz-card"><h3>近年流年</h3>'+liunianHtml(r)+'</div><div class="bz-card"><h3>合婚测算</h3>  <div class="bz-tip" style="margin-bottom:10px">填对方的出生信息，比对两人盘面。</div>  <div class="bz-form">    <div class="bz-field"><label>对方性别</label><select id="bz-hh-gender">      <option value="女">女</option><option value="男">男</option></select></div>    <div class="bz-field"><label>出生年</label><input id="bz-hh-y" type="number" min="1900" max="2100" value="'+(new Date().getFullYear()-25)+'"></div>    <div class="bz-field"><label>月</label><input id="bz-hh-m" type="number" min="1" max="12" value="6"></div>    <div class="bz-field"><label>日</label><input id="bz-hh-d" type="number" min="1" max="31" value="15"></div>    <div class="bz-field"><label>时辰（北京时间）</label><input id="bz-hh-h" type="time" value="12:00"></div>    <div class="bz-field" style="grid-column:1 / -1"><label>对方出生地</label>      <div class="bz-select" style="flex:1 1 auto">        <select id="bz-hh-prov" aria-label="省"></select>        <select id="bz-hh-city" aria-label="市"></select>        <select id="bz-hh-dist" aria-label="区县"></select>      </div></div>  </div>  <div class="bz-actions"><button class="bz-btn ghost" id="bz-hh-go">测 合 婚</button></div>  <div id="bz-hh-out"></div></div><div class="bz-card"><h3>流月 · '+new Date().getFullYear()+" 年</h3>"+liuyueHtml(r)+'</div><div class="bz-card"><h3>择日 · 建除十二神</h3>'+zeriHtml(r)+"</div>"+ssModalHtml()}function pad(n){return(n<10?"0":"")+n}var CASE_KEY="ndt-bazi-cases";function listCases(){try{var raw=localStorage.getItem(CASE_KEY);if(!raw)return[];var arr=JSON.parse(raw);return Array.isArray(arr)?arr:[]}catch(e){return[]}}function writeCases(arr){try{localStorage.setItem(CASE_KEY,JSON.stringify(arr.slice(0,60)))}catch(e){}}function saveCase(r){var name=(($2("#bz-name")||{}).value||"").trim(),group=(($2("#bz-group")||{}).value||"").trim(),id=String(Date.now()),arr=listCases();arr=arr.filter(function(c){return!(c.name===name&&c.input&&c.input.year===r.input.year&&c.input.month===r.input.month&&c.input.day===r.input.day&&c.input.hour===r.input.hour&&c.input.minute===r.input.minute&&!!c.input.hourUnknown==!!r.input.hourUnknown)}),arr.unshift({id,name:name||"未命名",group,savedAt:Date.now(),input:r.input,four:[r.pillars.year,r.pillars.month,r.pillars.day,r.pillars.hour].map(function(p){return p.gan+p.zhi||"未知"}).join(" "),dayMaster:r.dayMaster.gan+"（"+r.dayMaster.wx+"）"}),writeCases(arr),renderCases();var btn=$2("#bz-save");btn&&(btn.textContent="已存入案例",btn.disabled=!0)}function renderCases(){var box=$2("#bz-cases");if(box){var arr=listCases();if(!arr.length){box.innerHTML='<div class="bz-tip">还没有存档的案例。排完盘后点「存入案例」就会记在这里，下次点一下就能重新打开。</div>';return}var rows=arr.map(function(c){var t=new Date(c.savedAt||Date.now()),when=t.getMonth()+1+"/"+t.getDate();return'<div class="bz-case-row" data-id="'+esc2(c.id)+'"><div class="n">'+esc2(c.name)+(c.group?'<span class="g">'+esc2(c.group)+"</span>":"")+'</div><div class="f">'+esc2(c.four)+'</div><div class="d">'+esc2(c.dayMaster)+'<span class="t">'+when+'</span></div><button class="bz-case-open" data-id="'+esc2(c.id)+'">打开</button><button class="bz-case-del" data-id="'+esc2(c.id)+'">删</button></div>'}).join("");box.innerHTML='<div class="bz-tip" style="margin-bottom:8px">共 '+arr.length+' 个案例</div><div class="bz-case-list">'+rows+"</div>",$$2(".bz-case-open",box).forEach(function(b){b.addEventListener("click",function(){openCase(b.getAttribute("data-id"))})}),$$2(".bz-case-del",box).forEach(function(b){b.addEventListener("click",function(){var id=b.getAttribute("data-id");writeCases(listCases().filter(function(c){return c.id!==id})),renderCases()})})}}function openCase(id){var c=listCases().filter(function(x){return x.id===id})[0];if(!(!c||!c.input)){formCal="solar",$$2("#bz-cal-tabs span").forEach(function(x){x.classList.toggle("on",x.getAttribute("data-v")==="solar")}),$2("#bz-leap-wrap")&&($2("#bz-leap-wrap").style.display="none"),$2("#bz-leap")&&($2("#bz-leap").checked=!1),$2("#bz-name")&&($2("#bz-name").value=c.name==="未命名"?"":c.name),$2("#bz-group")&&($2("#bz-group").value=c.group||""),$2("#bz-y").value=c.input.year,$2("#bz-m").value=String(c.input.month),$2("#bz-d").value=String(c.input.day);var sel=$2("#bz-h");if(sel){for(var hv=c.input.hourUnknown?"unknown":pad(c.input.hour)+":"+pad(c.input.minute),found=!1,i=0;i<sel.options.length;i++)if(sel.options[i].value===hv){found=!0;break}sel.value=found?hv:"12:00"}$$2('#ndt-bazi input[name="bz-gender"]').forEach(function(el){el.checked=el.value===(c.input.gender||"男")}),$2("#bz-city")&&(c.input.cityUnknown?($2("#bz-unk-city")&&($2("#bz-unk-city").checked=!0),addrLock(!0)):($2("#bz-unk-city")&&($2("#bz-unk-city").checked=!1),addrLock(!1),addrApply(c.input.city||"北京市"),c.input.town&&$2("#bz-town")&&($2("#bz-town").value=c.input.town))),$2("#bz-tst")&&($2("#bz-tst").checked=c.input.useTrueSolar!==!1&&!c.input.hourUnknown&&!c.input.cityUnknown),syncFormNote(),doPaipan(),window.scrollTo({top:0,behavior:"smooth"})}}function liuyueHtml(r){var nowY=new Date().getFullYear(),ganIdx=BaziCore.GAN.indexOf(r.pillars.day.gan),list=BaziCore.liuYue(nowY,ganIdx),cells=list.map(function(x){return'<div class="bz-ly-cell"><div class="m">'+x.month+'月</div><div class="g">'+esc2(x.name)+'</div><div class="t">'+esc2(x.tenGod)+"</div></div>"}).join("");return'<div class="bz-ly">'+cells+'</div><div class="bz-tip" style="margin-top:8px">'+nowY+" 年十二月建（寅月为正月），干支对日主取十神。</div>"}function zeriHtml(r){var now=new Date,y=now.getFullYear(),m=now.getMonth()+1,ganIdx=BaziCore.GAN.indexOf(r.pillars.day.gan),days=BaziCore.zeRiList(y,m,ganIdx),good=days.filter(function(d){return d.tone==="吉"}).length,rows=days.map(function(d){var cls=d.tone==="吉"?"good":d.tone==="凶"?"bad":"flat";return'<div class="bz-zr-row"><div class="d">'+d.day+'</div><div class="gz">'+esc2(d.dayGZ)+'</div><div class="jc '+cls+'">'+esc2(d.name)+'</div><div class="w">'+esc2(d.desc)+"</div></div>"}).join("");return'<div class="bz-tip" style="margin-bottom:8px">'+y+" 年 "+m+" 月　本月吉日 "+good+" / "+days.length+' 天（依建除十二神）<br>吉凶取通书口诀「建满平收黑，除危定执黄，成开皆可用，闭破不相当」</div><div class="bz-zr">'+rows+"</div>"}function wxCount(r){var c={木:0,火:0,土:0,金:0,水:0};return["year","month","day","hour"].forEach(function(k){var g=BaziCore.GAN.indexOf(r.pillars[k].gan),z=BaziCore.ZHI.indexOf(r.pillars[k].zhi);g>=0&&c[BaziCore.GAN_WX[g]]!==void 0&&c[BaziCore.GAN_WX[g]]++,z>=0&&c[BaziCore.ZHI_WX[z]]!==void 0&&c[BaziCore.ZHI_WX[z]]++}),c}function hehun(a,b){var items=[],base=55;function add(name,delta,why,tone){items.push({name,delta,why,tone:tone||(delta>=0?"good":"bad")}),base+=delta}var ag=BaziCore.GAN.indexOf(a.pillars.day.gan),bg=BaziCore.GAN.indexOf(b.pillars.day.gan),az=BaziCore.ZHI.indexOf(a.pillars.day.zhi),bz=BaziCore.ZHI.indexOf(b.pillars.day.zhi);Math.abs(ag-bg)===5?add("日干相合",14,"两人日主天干五合（"+a.pillars.day.gan+"·"+b.pillars.day.gan+"）。"):ag===bg?add("日干同气",4,"两人日主同为"+a.pillars.day.gan+"，比肩同气。"):add("日干无合",0,"日主天干不在五合之内（"+a.pillars.day.gan+"·"+b.pillars.day.gan+"）。"),(az+bz)%12===1?add("日支六合",16,"两人日支六合（"+a.pillars.day.zhi+"·"+b.pillars.day.zhi+"）。六合主和合。"):az===bz?add("日支同宫",0,"两人日支相同（"+a.pillars.day.zhi+"），同宫之象，非合非冲。"):az%4===bz%4?add("日支三合",11,"两人日支同属三合局（"+a.pillars.day.zhi+"·"+b.pillars.day.zhi+"）。"):(az-bz)%12===6||(bz-az)%12===6?add("日支相冲",-15,"两人日支相冲（"+a.pillars.day.zhi+"·"+b.pillars.day.zhi+"）。六冲主对立。"):(az+bz)%12===7?add("日支相害",-7,"两人日支相害（"+a.pillars.day.zhi+"·"+b.pillars.day.zhi+"）。"):add("日支无合",0,"两人日支既不合也不冲（"+a.pillars.day.zhi+"·"+b.pillars.day.zhi+"）。");var ay=BaziCore.ZHI.indexOf(a.pillars.year.zhi),by=BaziCore.ZHI.indexOf(b.pillars.year.zhi);ay===by?add("生肖相同",0,"两人年支相同（"+a.pillars.year.zhi+"）。"):(ay+by)%12===1?add("生肖六合",8,"两人年支六合（"+a.pillars.year.zhi+"·"+b.pillars.year.zhi+"）。"):ay%4===by%4?add("生肖三合",6,"两人年支同属三合（"+a.pillars.year.zhi+"·"+b.pillars.year.zhi+"）。"):(ay-by)%12===6||(by-ay)%12===6?add("生肖相冲",-8,"两人年支相冲（"+a.pillars.year.zhi+"·"+b.pillars.year.zhi+"），即六冲。"):add("生肖无涉",0,"两人年支无合无冲（"+a.pillars.year.zhi+"·"+b.pillars.year.zhi+"）。");var ca=wxCount(a),cb=wxCount(b),missA=[],missB=[],strongA=[],strongB=[];["木","火","土","金","水"].forEach(function(w){ca[w]===0&&missA.push(w),cb[w]===0&&missB.push(w),ca[w]>=3&&strongA.push(w),cb[w]>=3&&strongB.push(w)});var fill=0;if(missA.forEach(function(w){cb[w]>=2&&fill++}),missB.forEach(function(w){ca[w]>=2&&fill++}),fill>=2)add("五行互补",15,"双方所缺（"+(missA.concat(missB).join("、")||"—")+"）得对方补足。");else if(fill===1)add("五行稍补",7,"一方所缺得对方补足。");else{var overlap=[];["木","火","土","金","水"].forEach(function(w){ca[w]===0&&cb[w]===0&&overlap.push(w)}),overlap.length?add("同缺五行",-6,"两人同缺"+overlap.join("、")+"。"):add("五行无明显互补",0,"两人五行分布无互补，也无同类偏枯。")}var male=a.input.gender==="男"?a:b,female=a.input.gender==="男"?b:a,mIdx=BaziCore.GAN.indexOf(male.pillars.day.gan),fIdx=BaziCore.GAN.indexOf(female.pillars.day.gan),fZhiMain=BaziCore.ZHI_CANG[BaziCore.ZHI.indexOf(female.pillars.day.zhi)][0],mZhiMain=BaziCore.ZHI_CANG[BaziCore.ZHI.indexOf(male.pillars.day.zhi)][0],mSeesF=BaziCore.tenGod(mIdx,BaziCore.GAN.indexOf(fZhiMain)),fSeesM=BaziCore.tenGod(fIdx,BaziCore.GAN.indexOf(mZhiMain)),caiOk=/财/.test(mSeesF),guanOk=/官|杀/.test(fSeesM);caiOk&&guanOk?add("十神相配",12,"男看女为「"+mSeesF+"」，女看男为「"+fSeesM+"」，即财官相配。"):caiOk||guanOk?add("十神半配",6,"男看女「"+mSeesF+"」，女看男「"+fSeesM+"」，一方相合，一方平常。"):add("十神无配",0,"男看女「"+mSeesF+"」，女看男「"+fSeesM+"」，无财官之应。");var score=Math.max(0,Math.min(100,Math.round(base)));return{score,items}}function hehunHtml(a,b,res){var tone=res.score>=75?"很好":res.score>=60?"不错":res.score>=45?"一般":"需谨慎",color=res.score>=75?"#3E8E5A":res.score>=60?"#5A7DB8":res.score>=45?"#B98B3E":"#C0504D",rows=res.items.map(function(it){return'<div class="bz-hh-row"><div class="bz-hh-k">'+esc2(it.name)+'</div><div class="bz-hh-v" style="color:'+(it.delta>=0?"#3E8E5A":"#C0504D")+'">'+(it.delta>0?"+":"")+it.delta+'</div><div class="bz-hh-w">'+esc2(it.why)+"</div></div>"}).join("");return'<div class="bz-card">  <h3>合婚结果</h3>  <div class="bz-hh-score"><span style="color:'+color+'">'+res.score+"</span>    <small>分 · "+tone+'</small></div>  <div class="bz-tip" style="margin:6px 0 12px">'+esc2(a.input.gender+" "+a.pillars.day.gan+a.pillars.day.zhi+"日")+" × "+esc2(b.input.gender+" "+b.pillars.day.gan+b.pillars.day.zhi+"日")+"</div>"+rows+'  <div class="bz-tip" style="margin-top:10px;line-height:1.9">判定四目取自子平合婚常法：日干五合、日支六合三合六冲六害、年支生肖合冲、男看财女看官（《三命通会》《渊海子平》论合婚诸条）。上面的分数是按这四目逐条加减的汇总，不是古籍里的原话，看单项比看总分更实在。</div></div>'}var LAST_RESULT=null;function doPaipan(){var y=parseInt(($2("#bz-y")||{}).value,10),m=parseInt(($2("#bz-m")||{}).value,10),d=parseInt(($2("#bz-d")||{}).value,10),timeStr=($2("#bz-h")||{}).value||"12:00",hourUnknown=timeStr==="unknown",parts=hourUnknown?["0","0"]:timeStr.split(":"),hh=parseInt(parts[0],10)||0,mi=parseInt(parts[1],10)||0,gEl=document.querySelector('#ndt-bazi input[name="bz-gender"]:checked'),gender=gEl?gEl.value:"男",cityUnknown=!!($2("#bz-unk-city")&&$2("#bz-unk-city").checked),addr=addrNow(),city=cityUnknown?"未知地":addr.text||"未知地",addrLon=addr.lon,useTST=!!($2("#bz-tst")&&$2("#bz-tst").checked)&&!hourUnknown&&!cityUnknown,lon=cityUnknown||addrLon===null||isNaN(addrLon)?120:addrLon;if(!y||y<1900||y>2100||!m||m<1||m>12||!d||d<1||d>31){$2("#bz-out").innerHTML='<div class="bz-card"><div class="bz-tip" style="color:#C0504D">年月日填写有误，请检查。</div></div>';return}var probe=new Date(y,m-1,d);if(probe.getFullYear()!==y||probe.getMonth()!==m-1||probe.getDate()!==d){$2("#bz-out").innerHTML='<div class="bz-card"><div class="bz-tip" style="color:#C0504D">'+y+" 年 "+m+" 月没有 "+d+" 日，请检查。</div></div>";return}var input={year:y,month:m,day:d,hour:hh,minute:mi,gender,useTrueSolar:useTST,lon,city,town:addr.town,hourUnknown,cityUnknown},cal=formCal,leap=!!($2("#bz-leap")&&$2("#bz-leap").checked),solarDate=null;if(cal==="lunar"){if(leap&&!(window.BaziLunar&&BaziLunar.leapMonthOf(y)===m)){$2("#bz-out").innerHTML='<div class="bz-card"><div class="bz-tip" style="color:#C0504D">'+y+" 年没有闰 "+m+" 月，请改选「非闰月」。</div></div>";return}if(solarDate=window.BaziLunar?BaziLunar.lunarToSolar(y,m,d,leap):null,!solarDate){$2("#bz-out").innerHTML='<div class="bz-card"><div class="bz-tip" style="color:#C0504D">这个农历日期在 1900-2100 之外或不存在，请检查。</div></div>';return}input.year=solarDate.y,input.month=solarDate.m,input.day=solarDate.d,input.calendarInput={cal:"lunar",y,m,d,leap}}var r;try{r=BaziCore.paipan(input)}catch(e){$2("#bz-out").innerHTML='<div class="bz-card"><div class="bz-tip" style="color:#C0504D">排盘出错：'+esc2(e.message)+"</div></div>";return}$2("#bz-out").innerHTML=resultHtml(r),LAST_RESULT=r;var tmsBox=$2("#bz-tms");tmsBox&&tmsBox.addEventListener("change",function(){setTms(tmsBox.checked);var host=$2("#bz-tbl-host");host&&(host.innerHTML=pillarTable(LAST_RESULT,{mode:tmsBox.checked?"gong":"yun"}))});var outBox=$2("#bz-out");outBox&&!outBox.getAttribute("data-ss-bound")&&(outBox.setAttribute("data-ss-bound","1"),outBox.addEventListener("click",function(ev){var t=ev.target;if(!(!t||!t.closest)){var hit=t.closest(".ss-hit");if(hit){openSs(hit.getAttribute("data-ss"),hit.getAttribute("data-pos"));return}t.closest("[data-ss-close]")&&closeSs()}}),document.addEventListener("keydown",function(ev){(ev.key==="Escape"||ev.keyCode===27)&&closeSs()}));var hhGo=$2("#bz-hh-go");hhGo&&hhGo.addEventListener("click",function(){doHehun(r)}),hhAddrInit();var saveBtn=$2("#bz-save");saveBtn&&(saveBtn.disabled=!1,saveBtn.textContent="存入案例",saveBtn.addEventListener("click",function(){saveCase(r)}));try{localStorage.setItem(MEM_KEY,JSON.stringify({year:y,month:m,day:d,gender,time:timeStr,city,town:addr.town,addr:function(){var ps=$2("#bz-prov"),cs=$2("#bz-city"),ds=$2("#bz-dist");return ps?{p:Number(ps.value),c:Number(cs&&cs.value),d:Number(ds&&ds.value),cn:addr.c?addr.c.n:"",dn:addr.d?addr.d[1]:""}:null}(),unkCity:cityUnknown,useTST,cal}))}catch(e){}}function hhAddrInit(){var R=regionData(),ps=$2("#bz-hh-prov"),cs=$2("#bz-hh-city"),ds=$2("#bz-hh-dist");!ps||!cs||!ds||!R.length||(ps.innerHTML=R.map(function(p,i){return'<option value="'+i+'">'+esc2(p.n)+"</option>"}).join(""),addrApply("北京市",HH_ADDR_IDS),ps.addEventListener("change",function(){addrFillCity(null,HH_ADDR_IDS)}),cs.addEventListener("change",function(){addrFillDist(null,HH_ADDR_IDS)}))}function doHehun(a){var out=$2("#bz-hh-out");if(out){var y=parseInt(($2("#bz-hh-y")||{}).value,10),m=parseInt(($2("#bz-hh-m")||{}).value,10),d=parseInt(($2("#bz-hh-d")||{}).value,10),timeStr=($2("#bz-hh-h")||{}).value||"12:00",parts=timeStr.split(":"),hh=parseInt(parts[0],10)||0,mi=parseInt(parts[1],10)||0,gender=($2("#bz-hh-gender")||{}).value||"女",hhAddr=addrNow(HH_ADDR_IDS),city=hhAddr.text||"未知地";if(!y||y<1900||y>2100||!m||m<1||m>12||!d||d<1||d>31){out.innerHTML='<div class="bz-tip" style="color:#C0504D;margin-top:10px">对方年月日填写有误。</div>';return}var probe=new Date(y,m-1,d);if(probe.getFullYear()!==y||probe.getMonth()!==m-1||probe.getDate()!==d){out.innerHTML='<div class="bz-tip" style="color:#C0504D;margin-top:10px">'+y+" 年 "+m+" 月没有 "+d+" 日。</div>";return}var b;try{b=BaziCore.paipan({year:y,month:m,day:d,hour:hh,minute:mi,gender,useTrueSolar:!0,lon:hhAddr.lon===null?120:hhAddr.lon,city})}catch(e){out.innerHTML='<div class="bz-tip" style="color:#C0504D;margin-top:10px">排盘出错：'+esc2(e.message)+"</div>";return}var res=hehun(a,b);out.innerHTML='<div style="margin-top:14px">'+hehunHtml(a,b,res)+"</div>"}}function applyTheme(v){if(v){try{if(typeof DB!="undefined"&&DB&&DB.data){DB.data.theme=v;try{if(typeof TEMPLATES!="undefined"&&DB.user){var valid=TEMPLATES[v]||TEMPLATES.default;valid&&!valid.some(function(x){return x.id===DB.user.tpl})&&(DB.user.tpl=valid[0].id)}}catch(e2){}DB.save()}}catch(e){}var p=document.querySelector(".portal");p&&(Object.keys(TH_CLS).forEach(function(k){p.classList.remove(TH_CLS[k])}),TH_CLS[v]&&p.classList.add(TH_CLS[v])),$$2("[data-theme-set]").forEach(function(b){b.classList.toggle("on",b.getAttribute("data-theme-set")===v)}),cachePortal()}}function syncThemeClass(){var v="default";try{typeof DB!="undefined"&&DB&&DB.data&&DB.data.theme&&(v=DB.data.theme)}catch(e){}var p=document.querySelector(".portal");p&&(Object.keys(TH_CLS).forEach(function(k){p.classList.remove(TH_CLS[k])}),TH_CLS[v]&&p.classList.add(TH_CLS[v]))}var PORTAL_SNAPSHOT=null,shellBooting=!1;function bootstrapShell(){shellBooting||(shellBooting=!0,location.hash="#/forum",setTimeout(function(){location.hash=HASH,setTimeout(function(){shellBooting=!1,tick()},30)},80))}function cachePortal(){var p=$2("#app .portal");if(p&&$2(".p-main",p))try{PORTAL_SNAPSHOT=p.outerHTML}catch(e){}}function routeToBazi(){if(isBaziPage()){if(!$2("#app .p-main")){var app=$2("#app");if(app&&PORTAL_SNAPSHOT){app.innerHTML=PORTAL_SNAPSHOT;var restored=$2("#app .p-main");restored&&restored.removeAttribute("data-ndt-bazi-rendered"),syncThemeClass()}if(!$2("#app .p-main")){bootstrapShell();return}}paint()}}window.BaziAddrSelect=function(name){var unk=$2("#bz-unk-city");return String(name)==="unknown"?(unk&&(unk.checked=!0),addrLock(!0),syncFormNote(),addrNow().text||"未知地"):(unk&&(unk.checked=!1),addrLock(!1),addrApply(String(name||""))||addrApply("北京市"),syncFormNote(),addrNow().text)};function paint(){if(isBaziPage()){var main=$2("#app .p-main");if(main&&main.getAttribute("data-ndt-bazi-rendered")!=="1"){ensureStyle(),main.innerHTML='<div id="ndt-bazi">'+formHtml()+"</div>",main.setAttribute("data-ndt-bazi-rendered","1"),addrInit();var btn=$2("#bz-go");btn&&btn.addEventListener("click",doPaipan),bindForm(),renderCases(),$$2("#app .side-item").forEach(function(x){x.classList.remove("on")}),$$2('#app .side-item[data-section="bazi"]').forEach(function(x){x.classList.add("on")})}}}function tick(){if(ensureStyle(),ensureSideItem(),!isBaziPage()){cachePortal();return}routeToBazi()}function watch(){var app=document.getElementById("app");if(!app){setTimeout(watch,300);return}var pending=!1,obs=new MutationObserver(function(){pending||(pending=!0,setTimeout(function(){pending=!1,tick()},40))});obs.observe(app,{childList:!0,subtree:!0}),tick()}document.addEventListener("click",function(e){var t=e.target,thBtn=t&&t.closest?t.closest("[data-theme-set]"):null;if(thBtn&&isBaziPage()){e.preventDefault(),e.stopPropagation(),applyTheme(thBtn.getAttribute("data-theme-set"));return}var si=t&&t.closest?t.closest("["+ITEM_KEY+"]"):null;si&&(e.preventDefault(),e.stopPropagation(),location.hash!==HASH?location.hash=HASH:tick())},!0),window.addEventListener("hashchange",function(){tick()});function prefetchRegion(){if(!(window.BAZI_REGION||regionLoading)){try{var c=navigator.connection||{};if(c.saveData||/(^|-)(2g|slow-2g)$/i.test(String(c.effectiveType||"")))return}catch(e){}loadRegion(null)}}if("requestIdleCallback"in window)try{window.requestIdleCallback(prefetchRegion,{timeout:4e3})}catch(e){setTimeout(prefetchRegion,2500)}else setTimeout(prefetchRegion,2500);window.addEventListener("load",function(){tick()}),document.readyState==="complete"||document.readyState==="interactive"?setTimeout(watch,0):document.addEventListener("DOMContentLoaded",watch)}(),function(){"use strict";if(window.__ndtLoginHud||!window.fetch)return;window.__ndtLoginHud=1;var BLUE="#1B3FA0",RED="#C0392B",GREY="#3A4256",Z="2147483000",RE=/\/auth\/(login|register|password)/,NAME={login:"登录",register:"注册",password:"修改密码"},FONT='-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif',track=null,bar=null,tip=null,hideTimer=null,rafId=0;function ensure(){if(!(track&&track.parentNode)){var host=document.body||document.documentElement;track=document.createElement("div"),track.style.cssText="position:fixed;left:0;top:0;right:0;height:3px;z-index:"+Z+";background:#E9EDF5;display:none;pointer-events:none;",bar=document.createElement("div"),bar.style.cssText="position:absolute;top:0;left:0;height:100%;width:34%;background:"+BLUE+";border-radius:0 999px 999px 0;will-change:transform;",track.appendChild(bar),host.appendChild(track),tip=document.createElement("div"),tip.style.cssText="position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(6px);z-index:"+Z+";max-width:82vw;padding:10px 18px;border-radius:999px;font:500 13px/1.5 "+FONT+";color:#fff;text-align:center;box-shadow:0 8px 24px rgba(20,30,60,.18);opacity:0;display:none;transition:opacity .18s ease,transform .18s ease;pointer-events:none;",host.appendChild(tip)}}function animate(){if(!track||track.style.display==="none")return;rafId&&cancelAnimationFrame(rafId);var w=track.clientWidth||window.innerWidth||360,seg=Math.max(48,w*.34),span=w+seg,t0=performance.now();function step(now){if(!track||track.style.display==="none"){rafId=0;return}var p=(now-t0)/1200%1;bar.style.transform="translateX("+(-seg+span*p)+"px)",rafId=requestAnimationFrame(step)}rafId=requestAnimationFrame(step)}function start(){ensure(),hideTimer&&(clearTimeout(hideTimer),hideTimer=null),tip&&(tip.style.display="none",tip.style.opacity="0"),track.style.display="block",bar.style.transform="translateX(-"+Math.max(48,(track.clientWidth||360)*.34)+"px)",animate()}function finish(ok,msg,verb){ensure(),track.style.display="none";var text=msg||(ok?verb+"成功":verb+"没成功 · 请重试");tip.textContent=text,tip.style.background=ok?BLUE:/^网络/.test(text)?GREY:RED,tip.style.display="block",tip.style.opacity="0",tip.style.transform="translateX(-50%) translateY(8px)",tip.offsetHeight,tip.style.opacity="1",tip.style.transform="translateX(-50%) translateY(0)",hideTimer&&clearTimeout(hideTimer),hideTimer=setTimeout(function(){tip&&(tip.style.opacity="0",tip.style.transform="translateX(-50%) translateY(6px)",hideTimer=setTimeout(function(){tip&&(tip.style.display="none")},220))},ok?1600:3200)}var TIMEOUT=15e3,RETRY_MAX=2,RETRY_GAP=1200;function soft(msg){try{ensure(),hideTimer&&(clearTimeout(hideTimer),hideTimer=null),tip.textContent=msg,tip.style.background=GREY,tip.style.display="block",tip.style.opacity="1",tip.style.transform="translateX(-50%) translateY(0)"}catch(e){}}function permanent(err){var msg=String(err&&err.message||"");return/账号或密码错误|已被拉黑|已被禁言|不能为空|最多|请输入/.test(msg)}var orig=window.fetch;window.fetch=function(input,init){var url="";try{url=typeof input=="string"?input:input&&input.url||""}catch(e){url=""}var m=RE.exec(url);if(!m)return orig.apply(this,arguments);var op=m[1]||"login",verb=NAME[op]||"登录",self=this;try{start()}catch(e){}function tick(n){n>0&&soft("网络不太稳 · 正在重试 "+n+"/"+RETRY_MAX);var opts=init,ctrl=null,timer=null,canAbort=typeof AbortController=="function"&&opts&&typeof opts=="object"&&!opts.signal;if(canAbort)try{ctrl=new AbortController,opts=Object.assign({},opts,{signal:ctrl.signal})}catch(e){ctrl=null}ctrl&&(timer=setTimeout(function(){try{ctrl.abort()}catch(e){}},TIMEOUT));var req;try{req=orig.call(self,input,opts)}catch(e){req=Promise.reject(e)}return req.then(function(res){return timer&&clearTimeout(timer),res},function(err){if(timer&&clearTimeout(timer),n<RETRY_MAX&&!permanent(err))return new Promise(function(resolve){setTimeout(resolve,RETRY_GAP*(n+1))}).then(function(){return tick(n+1)});throw err})}return tick(0).then(function(res){if(res&&res.ok){try{finish(!0,"",verb)}catch(e){}return res}var fallback="网络不太稳 · "+verb+"没成功";try{res.clone().json().then(function(d){try{finish(!1,d&&d.error||fallback,verb)}catch(e){}}).catch(function(){try{finish(!1,fallback,verb)}catch(e){}})}catch(e2){try{finish(!1,fallback,verb)}catch(e3){}}return res},function(err){try{finish(!1,"网络没接上 · 已试 "+(RETRY_MAX+1)+" 次，换个时间再试试",verb)}catch(e){}throw err})}}(),function(){"use strict";if(window.__ndtNavScrollFix)return;window.__ndtNavScrollFix=1;var STYLE_ID="ndt-nav-scroll-fix";function ensureStyle(){if(!document.getElementById(STYLE_ID)){var s=document.createElement("style");s.id=STYLE_ID,s.textContent="@media (max-width:900px){.nav-wrap{pointer-events:auto !important;}.sidebar{overflow-x:auto !important;overflow-y:hidden !important;touch-action:pan-x pan-y !important;-webkit-overflow-scrolling:touch !important;}.sb-toggle{pointer-events:auto !important;}}",(document.head||document.documentElement).appendChild(s)}}function panelOpen(){var sheet=document.querySelector(".sb-sheet");return sheet?sheet.classList.contains("on"):!1}function clean(){if(ensureStyle(),!panelOpen()){for(var masks=document.querySelectorAll(".sb-mask"),i=masks.length-1;i>=0;i--)masks[i].parentElement&&masks[i].parentElement.removeChild(masks[i]);document.body&&document.body.style.overflow==="hidden"&&(document.body.style.overflow=""),restoreScroll()}}var SAVED_LEFT=0,lastBar=null;function currentBar(){return document.querySelector(".sidebar")}function saveScroll(){var b=currentBar();b&&(SAVED_LEFT=b.scrollLeft||0)}function restoreScroll(){var b=currentBar();if(b&&b!==lastBar&&(lastBar=b,SAVED_LEFT>0)){try{b.scrollLeft=SAVED_LEFT}catch(e){}requestAnimationFrame(function(){try{b.isConnected&&(b.scrollLeft=SAVED_LEFT)}catch(e){}})}}var timer=0;function tick(){timer||(timer=setTimeout(function(){timer=0;try{clean()}catch(e){}},60))}function start(){ensureStyle(),clean();try{document.addEventListener("scroll",saveScroll,{passive:!0,capture:!0})}catch(e){}try{new MutationObserver(tick).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style"]})}catch(e){}setInterval(function(){try{clean()}catch(e){}},1e3)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start()}();



/* 线上 bundle 里 escAttr 是闭包内的，全局只有 esc()；这里自备属性转义，避免依赖内部作用域 */
function shipEscAttr(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ============================================================
   寄件模块 v101
   ------------------------------------------------------------
   这一块解决的是原来"点了提交只弹一句话"的问题：
   表单 → 运费 → 运单号 → 确认页 → 我的寄件 → 物流按时间推进，一条闭环。
   数据只存本机 localStorage，不涉及任何后端，零成本。
   ============================================================ */

var SHIP_KEY = "ndt_ship_v1";
var SHIP_FILTER = "all";
var SHIP_PROVS = ["北京市","上海市","天津市","重庆市","河北省","山西省","辽宁省","吉林省","黑龙江省","江苏省","浙江省","安徽省","福建省","江西省","山东省","河南省","湖北省","湖南省","广东省","海南省","四川省","贵州省","云南省","陕西省","甘肃省","青海省","广西壮族自治区","内蒙古自治区","西藏自治区","宁夏回族自治区","新疆维吾尔自治区","香港特别行政区","澳门特别行政区","台湾省"];
var SHIP_CITIES = ["浦东新区","朝阳区","海淀区","天河区","雁塔区","武侯区","昆山市","义乌市","东莞市","佛山市","青岛市","济南市","烟台市","潍坊市","临沂市","北京市","上海市","广州市","深圳市","杭州市","南京市","苏州市","成都市","重庆市","武汉市","西安市","天津市","长沙市","郑州市","沈阳市","大连市","哈尔滨市","长春市","石家庄市","太原市","南昌市","福州市","厦门市","合肥市","昆明市","贵阳市","南宁市","海口市","兰州市","西宁市","银川市","乌鲁木齐市","呼和浩特市","拉萨市"];
var SHIP_RATE = {
  "同城急送": { first: 12, extra: 1.5, eta: "当日达" },
  "标准快递": { first: 10, extra: 1.2, eta: "1–3 日" },
  "航空快运": { first: 23, extra: 2.0, eta: "次日达" }
};
var SHIP_STAGE = [
  { key: "等待揽收", cls: "wait", mins: 0 },
  { key: "已揽收", cls: "wait", mins: 30 },
  { key: "运输中", cls: "move", mins: 180 },
  { key: "派送中", cls: "move", mins: 720 },
  { key: "已签收", cls: "done", mins: 1800 }
];

function shipAll() {
  try {
    var a = JSON.parse(localStorage.getItem(SHIP_KEY) || "[]");
    return Array.isArray(a) ? a : [];
  } catch (e) { return []; }
}
function shipSave(a) {
  try { localStorage.setItem(SHIP_KEY, JSON.stringify(a.slice(0, 80))); } catch (e) {}
}
function shipFind(code) {
  var c = String(code || "").trim().toUpperCase();
  var list = shipAll();
  for (var i = 0; i < list.length; i++) if (String(list[i].code).toUpperCase() === c) return list[i];
  return null;
}
function shipMoney(n) {
  var v = Math.round((Number(n) || 0) * 100) / 100;
  return v.toFixed(2);
}
/** 运单号：NDT + 4 位网点码 + 8 位流水，共 12 位数字，按 4-4-4 展示 */
function shipNewCode() {
  var d = new Date();
  var net = String(Math.floor(Math.random() * 9000) + 1000);
  var seq = String(Math.floor(Math.random() * 1e8));
  while (seq.length < 8) seq = "0" + seq;
  return "NDT" + net + seq;
}
function shipShowCode(code) {
  var s = String(code || "").toUpperCase().replace(/^NDT/, "");
  var out = [];
  for (var i = 0; i < s.length; i += 4) out.push(s.slice(i, i + 4));
  return "NDT " + out.join(" ");
}
/** 运费：首重 1kg + 续重按 kg 阶梯 + 保价 0.5%（最低 1 元） */
function shipFee(o) {
  var rate = SHIP_RATE[o && o.service] || SHIP_RATE["标准快递"];
  var w = Math.max(0, Number(o && o.weight) || 0);
  var over = Math.max(0, w - 1);
  var extra = over > 0 ? Math.round((Math.ceil(over * 10) / 10) * rate.extra * 100) / 100 : 0;
  var value = Math.max(0, Number(o && o.insureValue) || 0);
  var insure = value > 0 ? Math.max(1, Math.round(value * 0.005 * 100) / 100) : 0;
  return { first: rate.first, extra: extra, over: Math.max(0, Math.round((Math.ceil(over * 10) / 10) * 100) / 100), insure: insure, total: Math.round((rate.first + extra + insure) * 100) / 100, rate: rate };
}
/** 按时间推断阶段：0 等待揽收 / 1 已揽收 / 2 运输中 / 3 派送中 / 4 已签收 */
function shipStageOf(rec) {
  var mins = (Date.now() - (Number(rec.at) || Date.now())) / 60000;
  var st = 0;
  for (var i = 0; i < SHIP_STAGE.length; i++) if (mins >= SHIP_STAGE[i].mins) st = i;
  return st;
}
function shipStamp(ms) {
  var d = new Date(ms);
  var p = function (n) { return (n < 10 ? "0" : "") + n; };
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
}
function shipShortStamp(ms) {
  var d = new Date(ms), now = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
  var hm = p(d.getHours()) + ":" + p(d.getMinutes());
  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) return "今天 " + hm;
  return (d.getMonth() + 1) + "月" + d.getDate() + "日 " + hm;
}
function shipRoute(rec) {
  return (rec.fromCity || "") + " → " + (rec.toCity || "");
}
/** 生成轨迹节点，时间从下单时刻往后推，未到的时间点不出现 */
function shipTimeline(rec) {
  var at = Number(rec.at) || Date.now();
  var stage = shipStageOf(rec);
  var node = [
    { off: 0, title: "已下单", desc: "订单已提交，等待快递员联系上门取件。" },
    { off: 30, title: "已揽收", desc: (rec.fromCity || "始发") + "营业部已完成揽收，包裹正在打包。" },
    { off: 180, title: "运输中", desc: "包裹已到达" + (rec.fromCity || "始发") + "转运中心，正在进行分拣。" },
    { off: 720, title: "到达目的地", desc: "包裹已抵达" + (rec.toCity || "目的地") + "分拨中心，准备转入末端网点。" },
    { off: 1080, title: "派送中", desc: (rec.toCity || "目的地") + "派送员已接收包裹，正在派送。" },
    { off: 1800, title: "已签收", desc: "包裹已签收，感谢使用哪都通。" }
  ];
  // 阶段与节点对齐：stage 3 对应"派送中"，stage 4 对应"已签收"
  var visible = [1, 3, 4, 5, 6][stage] || 1;
  var out = [];
  for (var i = 0; i < visible; i++) {
    out.push({
      t: shipStamp(at + node[i].off * 60000),
      title: node[i].title,
      desc: node[i].desc,
      state: i === visible - 1 ? "cur" : "done"
    });
  }
  return out;
}
/** 把本机订单转成查快递页要的结构 */
function shipAsPackage(rec) {
  var stage = shipStageOf(rec), st = SHIP_STAGE[stage];
  return {
    id: "ship_" + rec.code,
    code: String(rec.code).toUpperCase(),
    from: (rec.fromCity || "始发") + "转运中心",
    to: (rec.toCity || "目的地") + "派送网点",
    weight: (rec.weight || 0) + "kg",
    status: st.key,
    timeline: shipTimeline(rec)
  };
}
/** 查快递页入口：本机订单走实时轨迹，其它单号走原来的生成逻辑 */
function shipTrackFor(code) {
  var rec = shipFind(code);
  if (rec) return trackHtml(shipAsPackage(rec));
  return trackHtml(findOrGen(code));
}

/* ------------------------------ 寄件表单页 ------------------------------ */
function shipSvcCards(cur) {
  var out = "";
  for (var k in SHIP_RATE) {
    var r = SHIP_RATE[k];
    out += '<div class="ship-svc' + (k === cur ? " on" : "") + '" data-svc="' + shipEscAttr(k) + '">' +
      '<div class="nm">' + esc(k) + '</div><div class="pr">¥' + r.first + ' 起</div><div class="tm">' + r.eta + '</div></div>';
  }
  return out;
}
function shipProvOpts(cur) {
  var out = "";
  for (var i = 0; i < SHIP_PROVS.length; i++) {
    out += '<option' + (SHIP_PROVS[i] === cur ? " selected" : "") + '>' + esc(SHIP_PROVS[i]) + '</option>';
  }
  return out;
}
/* 城市用可输入框（带建议列表）：下拉只有几十个主要城市，
   真实地址常是区县（浦东新区、雁塔区……），固定下拉会选不到，导致城市为空。 */
function shipCityList() {
  var out = '<datalist id="ship-city-list">';
  for (var i = 0; i < SHIP_CITIES.length; i++) out += '<option value="' + shipEscAttr(SHIP_CITIES[i]) + '"></option>';
  return out + "</datalist>";
}
function shipCityInput(id, cur) {
  return '<input class="field" id="' + id + '" list="ship-city-list" placeholder="城市 / 区" autocomplete="off" value="' + shipEscAttr(cur || "") + '">';
}
function shipPrefill() {
  try {
    var t = sessionStorage.getItem("ndt_ship_prefill");
    sessionStorage.removeItem("ndt_ship_prefill");
    return t ? JSON.parse(t) : null;
  } catch (e) { return null; }
}

function viewShipForm() {
  var pre = shipPrefill() || {};
  var cur = pre.service || "标准快递";
  var fee = shipFee({ service: cur, weight: pre.weight || 0, insureValue: 0 });
  return surfaceHeader("service") +
    '<div class="page-head"><div class="wrap"><h1>寄件服务</h1><p>在线下单，快递员上门取件</p></div></div>' +
    '<div class="section"><div class="wrap"><div class="grid g2">' +
      '<div class="card-box" id="ship-form">' + shipCityList() +
        '<h3 style="margin-bottom:4px">填写寄件信息</h3>' +
        '<p class="muted" style="font-size:13px;margin-bottom:4px">下单后快递员会电话联系您确认取件时间</p>' +

        '<label class="fl">寄件人</label>' +
        '<div class="ship-row"><input class="field" id="s-name" placeholder="姓名" value="' + shipEscAttr(pre.sName || "") + '">' +
        '<input class="field" id="s-tel" type="tel" placeholder="手机号" inputmode="numeric" autocomplete="tel" value="' + shipEscAttr(pre.sTel || "") + '"></div>' +

        '<label class="fl">取件地址</label>' +
        '<div class="ship-row3"><select class="field" id="s-prov">' + shipProvOpts(pre.fromProv) + '</select>' +
        shipCityInput("s-city", pre.fromCity) + '</div>' +
        '<div class="ship-row"><input class="field" id="s-addr" placeholder="街道、门牌号" value="' + shipEscAttr(pre.fromAddr || "") + '"></div>' +

        '<label class="fl">收件人</label>' +
        '<div class="ship-row"><input class="field" id="r-name" placeholder="姓名" value="' + shipEscAttr(pre.rName || "") + '">' +
        '<input class="field" id="r-tel" type="tel" placeholder="手机号" inputmode="numeric" autocomplete="tel" value="' + shipEscAttr(pre.rTel || "") + '"></div>' +
        '<div class="ship-row3"><select class="field" id="r-prov">' + shipProvOpts(pre.toProv) + '</select>' +
        shipCityInput("r-city", pre.toCity) + '</div>' +
        '<div class="ship-row"><input class="field" id="r-addr" placeholder="街道、门牌号" value="' + shipEscAttr(pre.toAddr || "") + '"></div>' +

        '<label class="fl">物品信息</label>' +
        '<div class="ship-row"><input class="field" id="s-goods" placeholder="物品名称" value="' + shipEscAttr(pre.goods || "") + '">' +
        '<select class="field" id="s-type"><option>普通物品</option><option>文件</option><option>生鲜</option><option>易碎品</option><option>数码产品</option></select></div>' +
        '<div class="ship-row"><input class="field" id="s-count" placeholder="件数" inputmode="numeric" value="' + shipEscAttr(pre.count || "1") + '">' +
        '<input class="field" id="s-weight" placeholder="重量 kg" inputmode="decimal" value="' + shipEscAttr(pre.weight || "") + '"></div>' +

        '<label class="fl">服务产品</label>' +
        '<div class="ship-svcs" id="ship-svcs">' + shipSvcCards(cur) + '</div>' +

        '<label class="fl">备注（选填）</label>' +
        '<input class="field" id="s-note" placeholder="如：到了打电话，放门口即可" value="' + shipEscAttr(pre.note || "") + '">' +

        '<label class="ship-ins"><input type="checkbox" id="s-insure"> 声明保价，价值 <input class="field ship-ins-input" id="s-insure-val" placeholder="¥ 0" inputmode="decimal" disabled></label>' +
      '</div>' +

      '<div>' +
        '<div class="card-box" style="margin-bottom:18px">' +
          '<h3>费用明细</h3>' +
          '<div class="ship-fee" id="ship-fee">' + shipFeeRows(fee, cur) + '</div>' +
          '<p class="muted" style="font-size:11.5px;line-height:1.7;margin-top:8px">实际费用以快递员揽收时称重为准，多退少补。</p>' +
          '<button class="btn btn-orange btn-block js-ship-sub ship-card-sub" style="margin-top:14px">确认下单</button>' +
        '</div>' +
        '<div class="card-box"><h3>运费参考</h3>' +
          '<table class="ship-rate"><tr><th>服务类型</th><th>时效</th><th>首重价</th></tr>' +
          '<tr><td>同城急送</td><td>当日达</td><td>12 元起</td></tr>' +
          '<tr><td>标准快递</td><td>1-3 日</td><td>10 元起</td></tr>' +
          '<tr><td>航空快运</td><td>次日达</td><td>23 元起</td></tr></table></div>' +
      '</div>' +
    '</div></div></div>' +
    '<div class="ship-dock"><div><div class="lab">应付金额</div><div class="amt"><small>¥</small><b id="ship-dock-amt">' + shipMoney(fee.total) + '</b></div></div>' +
    '<button class="btn btn-orange js-ship-sub">确认下单</button></div>' +
    surfaceFooter();
}
function shipFeeRows(fee, svc) {
  return '<div class="ship-fr"><span>' + esc(svc) + ' · 首重 1kg</span><b>¥ ' + shipMoney(fee.first) + '</b></div>' +
    (fee.over > 0 ? '<div class="ship-fr"><span>续重 ' + shipMoney(fee.over) + 'kg × ¥' + (SHIP_RATE[svc] ? SHIP_RATE[svc].extra : 1.2) + '</span><b>¥ ' + shipMoney(fee.extra) + '</b></div>' : '<div class="ship-fr"><span>首重内（≤1kg 不计续重）</span><b>¥ 0.00</b></div>') +
    '<div class="ship-fr"><span>保价费</span><b>¥ ' + shipMoney(fee.insure) + '</b></div>' +
    '<div class="ship-total"><span>预计费用</span><b><small>¥</small>' + shipMoney(fee.total) + '</b></div>';
}
/** 表单变化时重算金额（不重绘页面，避免输入框失焦） */
function shipRecalc() {
  var box = $("#ship-fee"), dock = $("#ship-dock-amt");
  if (!box) return;
  var svc = "标准快递", on = $(".ship-svc.on");
  if (on) svc = on.getAttribute("data-svc");
  var w = $("#s-weight") ? $("#s-weight").value : 0;
  var ins = $("#s-insure") && $("#s-insure").checked && $("#s-insure-val") ? $("#s-insure-val").value : 0;
  var fee = shipFee({ service: svc, weight: w, insureValue: ins });
  box.innerHTML = shipFeeRows(fee, svc);
  if (dock) dock.innerHTML = shipMoney(fee.total);
  return fee;
}

/* ------------------------------ 下单 ------------------------------ */
function shipSubmit() {
  if (window.__shipBusy) return;          // 防连点：重复点击不再叠提示、不会再下一单
  window.__shipBusy = 1;
  setTimeout(function () { window.__shipBusy = 0; }, 1400);
  var v = function (id) { var el = $("#" + id); return el ? String(el.value || "").trim() : ""; };
  var sName = v("s-name"), sTel = v("s-tel").replace(/\s|-/g, ""),
      rName = v("r-name"), rTel = v("r-tel").replace(/\s|-/g, ""),
      sAddr = v("s-addr"), rAddr = v("r-addr"),
      goods = v("s-goods"), count = parseInt(v("s-count") || "0", 10),
      weight = Number(v("s-weight"));
  var svcEl = $(".ship-svc.on");
  var svc = svcEl ? svcEl.getAttribute("data-svc") : "标准快递";

  if (!sName) return shipToastThrottled("请填写寄件人姓名", "warn");
  var sTelErr = shipTelError(sTel); if (sTelErr) return shipToastThrottled("寄件人手机号" + sTelErr, "warn");
  if (!sAddr) return shipToastThrottled("请填写取件详细地址", "warn");
  if (!rName) return shipToastThrottled("请填写收件人姓名", "warn");
  var rTelErr = shipTelError(rTel); if (rTelErr) return shipToastThrottled("收件人手机号" + rTelErr, "warn");
  if (!rAddr) return shipToastThrottled("请填写收件详细地址", "warn");
  if (!goods) return shipToastThrottled("请填写物品名称", "warn");
  if (!count || count < 1) return shipToastThrottled("件数至少 1 件", "warn");
  if (!weight || weight <= 0) return shipToastThrottled("请填写重量，按 kg 计", "warn");
  if (weight > 50) return shipToastThrottled("超过 50kg 请走企业物流", "warn");

  var insureOn = $("#s-insure") && $("#s-insure").checked;
  var insureValue = insureOn ? Math.max(0, Number(v("s-insure-val")) || 0) : 0;
  var fee = shipFee({ service: svc, weight: weight, insureValue: insureValue });

  var rec = {
    code: shipNewCode(),
    at: Date.now(),
    service: svc,
    sName: sName, sTel: sTel,
    fromProv: v("s-prov"), fromCity: v("s-city"), fromAddr: sAddr,
    rName: rName, rTel: rTel,
    toProv: v("r-prov"), toCity: v("r-city"), toAddr: rAddr,
    goods: goods, type: v("s-type"), count: count, weight: weight,
    insureValue: insureValue, fee: fee.total, note: v("s-note")
  };
  var list = shipAll();
  list.unshift(rec);
  shipSave(list);
  try { sessionStorage.setItem("ndt_ship_prefill", JSON.stringify(rec)); } catch (e) {}
  location.hash = "#/ship-ok/" + encodeURIComponent(rec.code);
}

/* ------------------------------ 下单成功页 ------------------------------ */
function viewShipOk(code) {
  var rec = shipFind(code);
  if (!rec) return viewMyShipments("all");
  var box = [['寄件人', rec.sName + ' · ' + rec.sTel], ['收件人', rec.rName + ' · ' + rec.rTel],
             ['路线', rec.fromProv + rec.fromCity + ' → ' + rec.toProv + rec.toCity],
             ['物品', rec.goods + ' · ' + rec.count + ' 件 · ' + rec.weight + 'kg'],
             ['服务', rec.service + ' · ' + ((SHIP_RATE[rec.service] || {}).eta || '')],
             ['应付', '¥ ' + shipMoney(rec.fee)]];
  var rows = "";
  for (var i = 0; i < box.length; i++) {
    rows += '<div class="ship-kv"><span>' + esc(box[i][0]) + '</span><b' + (box[i][0] === '应付' ? ' style="color:#E8874A"' : '') + '>' + esc(box[i][1]) + '</b></div>';
  }
  return surfaceHeader("service") +
    '<div class="section" style="padding-top:26px"><div class="wrap" style="max-width:760px">' +
      '<div class="ship-ok">' +
        '<div class="ico">✓</div>' +
        '<h2>下单成功，等待快递员上门</h2>' +
        '<p>运单已生成，可在「查快递」随时查看物流</p>' +
      '</div>' +
      '<div class="card-box" style="margin-bottom:18px">' +
        '<div class="ship-ticket"><div class="k">运单号</div><div class="no">' + esc(shipShowCode(rec.code)) + '</div>' +
        '<div class="cp" id="ship-copy" data-code="' + shipEscAttr(rec.code) + '">复制</div></div>' +
        '<div style="margin-top:12px">' + rows + '</div>' +
        '<div class="ship-acts">' +
          '<a class="btn btn-orange" href="#/track/' + encodeURIComponent(rec.code) + '">查看物流</a>' +
          '<button class="btn btn-ghost js-ship-again">再寄一件</button>' +
        '</div>' +
        '<p class="muted" style="font-size:12px;text-align:center;margin-top:10px">快递员揽收后才会出现第一条轨迹</p>' +
      '</div>' +
      '<div class="card-box"><h3 style="margin-bottom:8px">接下来会发生什么</h3>' +
        '<div class="ship-kv" style="justify-content:flex-start;gap:12px"><span style="flex:0 0 16px">1</span><b style="font-weight:500;text-align:left;flex:1">快递员电话联系你，上门取件并称重</b></div>' +
        '<div class="ship-kv" style="justify-content:flex-start;gap:12px"><span style="flex:0 0 16px">2</span><b style="font-weight:500;text-align:left;flex:1">称重后如需补差价，取件时当面确认</b></div>' +
        '<div class="ship-kv" style="justify-content:flex-start;gap:12px"><span style="flex:0 0 16px">3</span><b style="font-weight:500;text-align:left;flex:1">揽收后可在「我的寄件」查看进度</b></div>' +
      '</div>' +
    '</div></div>' + surfaceFooter();
}

/* ------------------------------ 我的寄件 ------------------------------ */
function viewMyShipments(filter) {
  SHIP_FILTER = filter || "all";
  var all = shipAll();
  var f = SHIP_FILTER;
  var list = all.filter(function (r) {
    var st = shipStageOf(r);
    if (f === "wait") return st <= 1;
    if (f === "move") return st === 2 || st === 3;
    if (f === "done") return st === 4;
    return true;
  });
  var cnt = { all: all.length, wait: 0, move: 0, done: 0 };
  for (var i = 0; i < all.length; i++) {
    var s = shipStageOf(all[i]);
    if (s <= 1) cnt.wait++; else if (s <= 3) cnt.move++; else cnt.done++;
  }
  var tabs = [["all", "全部"], ["wait", "待揽收"], ["move", "运输中"], ["done", "已签收"]].map(function (t) {
    return '<a href="javascript:void(0)" data-ship-tab="' + t[0] + '" class="' + (f === t[0] ? "on" : "") + '">' + t[1] + ' ' + cnt[t[0]] + '</a>';
  }).join("");

  var body;
  if (!list.length) {
    body = '<div class="ship-empty"><div class="es">📦</div>' + (all.length ? "这个状态下还没有寄件" : "还没有寄件记录<br><span>在「寄件服务」下一单，这里就能看到进度</span>") + '</div>';
  } else {
    body = list.map(function (r) {
      var st = SHIP_STAGE[shipStageOf(r)];
      var act = st.key === "已签收"
        ? '<a href="javascript:void(0)" class="ship-go js-ship-again">再寄一件 ›</a>'
        : '<a href="#/track/' + encodeURIComponent(r.code) + '" class="ship-go">查看物流 ›</a>';
      return '<div class="ship-ord">' +
        '<div class="ship-top"><span class="ship-no">' + esc(shipShowCode(r.code)) + '</span>' +
        '<span class="ship-tag ' + st.cls + '">' + esc(st.key) + '</span></div>' +
        '<div class="ship-rt">' + esc(r.fromCity) + ' <i>→</i> ' + esc(r.toCity) + '</div>' +
        '<div class="ship-meta">' + esc(r.goods) + ' · ' + esc(r.weight) + 'kg · ' + esc(r.service) + ' · ' + esc(shipShortStamp(r.at)) + ' 下单</div>' +
        '<div class="ship-foot"><span class="ship-fee">¥ ' + shipMoney(r.fee) + '</span>' + act + '</div>' +
      '</div>';
    }).join("");
  }

  return surfaceHeader("my-ship") +
    '<div class="page-head"><div class="wrap"><h1>我的寄件</h1><p>这台设备上下过的单，可随时查看物流</p></div></div>' +
    '<div class="section"><div class="wrap" style="max-width:860px">' +
      '<div class="card-box" style="padding-top:6px">' +
        '<div class="ship-tabs">' + tabs + '</div>' + body +
      '</div>' +
      '<div class="card-box" style="margin-top:18px"><h3 style="margin-bottom:6px">寄件小贴士</h3>' +
        '<p class="muted" style="font-size:13px;line-height:1.9">单号可在「查快递」查询。记录只保存在本机，卸载 App 或清除数据后清空，重要单号请自行保存。' +
        (all.length ? ' <a href="javascript:void(0)" id="ship-clear" style="color:#8892AA;text-decoration:underline">清空记录</a>' : '') + '</p>' +
      '</div>' +
    '</div></div>' + surfaceFooter();
}

/* ------------------------------ 交互绑定（事件委托，适配重新渲染） ------------------------------ */
document.addEventListener("input", function (e) {
  var t = e.target;
  if (!t || !t.closest) return;
  if (t.closest("#ship-form") || t.id === "s-insure-val") shipRecalc();
});
document.addEventListener("change", function (e) {
  var t = e.target;
  if (!t || !t.closest) return;
  if (t.id === "s-insure") {
    var vi = $("#s-insure-val");
    if (vi) { vi.disabled = !t.checked; if (!t.checked) vi.value = ""; }
    if (t.checked && vi) vi.focus();
    shipRecalc();
    return;
  }
  if (t.closest("#ship-form") || t.id === "s-insure-val") shipRecalc();
});
document.addEventListener("click", function (e) {
  var t = e.target;
  if (!t || !t.closest) return;

  var svc = t.closest(".ship-svc");
  if (svc) {
    var box = svc.parentNode;
    if (box) {
      var kids = box.children;
      for (var i = 0; i < kids.length; i++) kids[i].classList.remove("on");
    }
    svc.classList.add("on");
    shipRecalc();
    return;
  }

  if (t.closest(".js-ship-sub")) { shipSubmit(); return; }

  if (t.closest(".js-ship-again")) {
    location.hash = "#/service";
    return;
  }

  if (t.closest("#ship-copy")) {
    var el = t.closest("#ship-copy");
    var code = el.getAttribute("data-code") || "";
    var done = function () { shipToastThrottled("运单号已复制", "ok"); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done, function () { shipCopyFallback(code, done); });
      } else shipCopyFallback(code, done);
    } catch (err) { shipCopyFallback(code, done); }
    return;
  }

  var tab = t.closest("[data-ship-tab]");
  if (tab) {
    var f = tab.getAttribute("data-ship-tab");
    if (typeof router === "function") {
      SHIP_FILTER = f;
      location.hash = "#/my-ship";
      router();
    }
    return;
  }

  if (t.closest("#ship-clear")) {
    if (confirm("清空本机的寄件记录？单号清空后就查不到了。")) {
      shipSave([]);
      if (typeof router === "function") router();
      toast("已清空", "ok");
    }
    return;
  }
});
function shipCopyFallback(text, done) {
  try {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    done && done();
  } catch (e) { toast("复制失败，请手动长按选择", "warn"); }
}


/* ------------------------------ 查快递页接管 ------------------------------ */
/* 站点里 track-realism 那段最后执行了 window.viewTrack=viewTrack2，
   它直接用 findOrGen2 造单，所以本机寄件单在查快递页查不到自己的轨迹。
   这里在模块末尾再覆盖一次：本机单走自己的轨迹，别的单号原样交给站点逻辑。 */
function shipAsTrack(rec) {
  var stage = shipStageOf(rec), st = SHIP_STAGE[stage];
  var at = Number(rec.at) || Date.now();
  var etaMs = at + 1080 * 60000;
  return {
    code: String(rec.code || "").toUpperCase(),
    status: st.key,
    service: rec.service || "标准快递",
    goods: rec.goods || "日用品",
    fee: shipMoney(rec.fee || 0),
    _recv: "待分配",
    _tel: "揽收后显示",
    weight: (rec.weight || 0) + " kg",
    count: rec.count || 1,
    fromCity: rec.fromCity || "始发",
    toCity: rec.toCity || "目的地",
    from: (rec.fromCity || "始发") + "转运中心",
    to: (rec.toCity || "目的地") + "派送网点",
    eta: shipStamp(etaMs),
    timeline: shipTimeline(rec).reverse()
  };
}

(function () {
  if (typeof window === "undefined") return;
  var orig = window.viewTrack;
  window.viewTrack = function (code) {
    var rec = shipFind(code);
    if (!rec) return typeof orig === "function" ? orig(code) : "";
    var pk = shipAsTrack(rec);
    var body = (typeof window.trackHtml === "function") ? window.trackHtml(pk) : "";
    return surfaceHeader("track") +
      '<div class="page-head"><div class="wrap"><h1>快递查询</h1><p>输入运单号，实时查询包裹动态</p></div></div>' +
      '<div class="section"><div class="wrap">' +
      '<div class="track-box" style="max-width:none;margin:0 0 24px">' +
      '<input id="tb-code" placeholder="请输入运单号，如 NDT7770001234" value="' + shipEscAttr(code || "") + '">' +
      '<button class="btn btn-orange" id="tb-go">查询</button></div>' +
      '<div id="track-result">' + body + '</div>' +
      '</div></div>' + surfaceFooter();
  };
})();

/* 站点原来的「查询」按钮会自己拿 findOrGen2 造单，capture 阶段先拦下来，改走自己的路由 */
document.addEventListener("click", function (e) {
  var t = e.target;
  if (!t || !t.closest) return;
  if (!t.closest("#tb-go")) return;
  e.preventDefault();
  e.stopPropagation();
  var inp = document.getElementById("tb-code");
  var v = ((inp && inp.value) || "").replace(/\s/g, "").toUpperCase();
  if (!v) { toast("请输入运单号", "warn"); return; }
  location.hash = "#/track/" + encodeURIComponent(v);
  if (typeof router === "function") router();
}, true);


/* ------------------------------ 输入规整 ------------------------------ */
/* 手机号不用 maxlength 硬截断：部分输入法/粘贴会把全角数字、空格算进去，
   出现"第 11 位打不进去、校验又说要 11 位"的死循环。
   改成输入即规整：全角转半角 → 只留数字 → 最多 11 位。 */
function shipNormTel(v) {
  var s = String(v == null ? "" : v);
  s = s.replace(/[\uFF10-\uFF19]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); });
  s = s.replace(/\D/g, "");
  return s.slice(0, 11);
}

document.addEventListener("input", function (e) {
  var t = e.target;
  if (!t || !t.id) return;
  if (t.id === "s-tel" || t.id === "r-tel") {
    var nv = shipNormTel(t.value);
    if (nv !== t.value) {
      t.value = nv;
      try { t.setSelectionRange(nv.length, nv.length); } catch (err) {}
    }
    return;
  }
  if (t.id === "s-count") {
    var c = String(t.value || "").replace(/\D/g, "").slice(0, 3);
    if (c !== t.value) t.value = c;
    return;
  }
  if (t.id === "s-weight") {
    var w = String(t.value || "").replace(/[^\d.]/g, "").replace(/\./g, "#").replace(/#/g, ".").slice(0, 6);
    if (w !== t.value) t.value = w;
  }
});


/* ------------------------------ 手机号提示 ------------------------------ */
/* 只卡两件事：11 位、以 1 开头。
   以前要求第二位是 3-9（正则 1[3-9]\d{9}），拿 12345678999 这种测试号
   明明 11 位却永远下不了单，提示还只说"要 11 位"，看着像冤案。 */
function shipTelError(v) {
  var d = shipNormTel(v);
  if (!d) return "填一下号码";
  if (d.length < 11) return "还差 " + (11 - d.length) + " 位（当前 " + d.length + " 位）";
  if (d.charAt(0) !== "1") return "要以 1 开头";
  return "";
}

/* 同一句提示 1.6 秒内只弹一次：连点确认下单不会再刷一屏一样的 toast */
var __shipLastToastMsg = "", __shipLastToastAt = 0;
function shipToastThrottled(msg, type) {
  var now = Date.now();
  if (msg === __shipLastToastMsg && now - __shipLastToastAt < 1600) return;
  __shipLastToastMsg = msg;
  __shipLastToastAt = now;
  try { if (typeof toast === "function") toast(msg, type || "warn"); } catch (e) {}
}



viewService = function(){ return viewShipForm(); };

/* ===== 首页 App 下载入口（仅手机端）· v104 =====
   规则：App 内(UA 含 NDTApp)不显示；桌面端不显示（只做手机）；iOS 点击只提示不下载；
   链接与版本号读 version.json，体积用 HEAD 的 content-length，链接带 ?v= 绕缓存。 */
(function(){
  try{
    var UA=navigator.userAgent||"";
    if(/NDTApp/i.test(UA))return;
    var isAndroid=/Android/i.test(UA);
    var isIOS=/iPhone|iPad|iPod/i.test(UA)&&!window.MSStream;
    if(!isAndroid&&!isIOS)return;

    var VER="1.0.4",KB="340 KB";
    var APKPATH="/yirenneiwang.apk";
    var href=APKPATH+"?v="+VER;

    function toastMsg(msg){
      var w=document.getElementById("toast");
      if(!w){return}
      var el=document.createElement("div");
      el.className="toast";
      el.textContent=msg;
      w.appendChild(el);
      setTimeout(function(){el.style.opacity="0";el.style.transition=".3s";setTimeout(function(){el.remove()},300)},2400);
    }

    var ICON='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 21h16"/></svg>';

    function html(){
      return '<div class="appdl-nd" id="appdl-nd">'+
        '<div class="appdl-nd-tile"><img src="assets/logo.png" alt="哪都通"></div>'+
        '<div class="appdl-nd-main">'+
          '<div class="appdl-nd-head"><span class="appdl-nd-t">哪都通快递 App</span><span class="appdl-nd-pill">安卓</span></div>'+
          '<div class="appdl-nd-sub" id="appdl-nd-sub">查件更快 · '+KB+' · v'+VER+'</div>'+
        '</div>'+
        '<a class="appdl-nd-go" id="appdl-nd-go" href="'+href+'">'+ICON+'<span>立即下载</span></a>'+
      '</div>';
    }

    function isHome(){
      var h=location.hash.replace(/^#/,"");
      return h===""||h==="/";
    }
    function ensure(){
      if(document.getElementById("appdl-nd"))return;
      if(!isHome())return;
      if(window.innerWidth>680)return;
      var hero=document.querySelector(".hero");
      if(!hero)return;
      var box=document.createElement("div");
      box.innerHTML=html();
      hero.insertAdjacentElement("afterend",box.firstElementChild);
    }
    function tick(){if(!document.getElementById("appdl-nd"))ensure()}

    document.addEventListener("click",function(e){
      var a=e.target&&e.target.closest?e.target.closest("#appdl-nd-go"):null;
      if(!a)return;
      if(isIOS){e.preventDefault();toastMsg("iOS 版暂未提供，请用安卓手机下载")}
    },true);

    function refresh(){
      var a=document.getElementById("appdl-nd-go");
      var s=document.getElementById("appdl-nd-sub");
      if(a)a.setAttribute("href",href);
      if(s)s.textContent="查件更快 · "+KB+" · v"+VER;
    }

    function loadMeta(){
      try{
        fetch("version.json?t="+Date.now(),{cache:"no-store"}).then(function(r){return r.ok?r.json():null}).then(function(j){
          if(!j)return;
          if(j.versionName)VER=j.versionName;
          if(j.url){
            var u=String(j.url).replace(/^https?:\/\/[^/]+/,"");
            if(u&&u.charAt(0)==="/")APKPATH=u.replace(/\?.*$/,"");
          }
          href=APKPATH+"?v="+VER;
          refresh();
          fetch(href,{method:"HEAD",cache:"no-store"}).then(function(r){
            if(!r||!r.ok)return;
            var cl=r.headers.get("content-length"),n=Number(cl);
            if(!cl||!isFinite(n)||n<=0)return;
            var k=n/1024;KB=(k>=1000?(Math.round(k/1024*10)/10+" MB"):(Math.round(k)+" KB"));refresh()
          }).catch(function(){});
        }).catch(function(){});
      }catch(e){}
    }

    function boot(){
      ensure();
      setTimeout(tick,800);
      setTimeout(tick,2000);
      loadMeta();
    }

    window.addEventListener("hashchange",function(){setTimeout(tick,350);setTimeout(tick,1200)});
    window.addEventListener("resize",function(){tick()});
    setInterval(tick,1500);

    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
  }catch(e){}
})();

/* =====================================================================
   寄件 / 物流仿真增强 v105（覆盖层）
   ---------------------------------------------------------------------
   叠加在 v104 的寄件模块之上，只重定义函数，不改原有 DOM 结构：
     1) 运单号：NDT + 网点码(4) + 下单日期MMDD(4) + 流水(3) + Luhn 校验位(1)
     2) 运费：续重按 1kg 进位（不足 1kg 按 1kg）、包装费、偏远附加、保价上限 500
     3) 时效：同城 / 同省 / 跨省 / 偏远 / 航空 各走各自班次，夜间不发派送
     4) 异常：派送失败次日重派（约 6%）、航空安检退回（约 1.5%）
     5) 去重：每单一个种子，网点/人名/车牌/航班/签收方式/分钟抖动全部不同且固定
   ===================================================================== */
(function () {
  "use strict";

  /* ---------------- 基础工具 ---------------- */
  function n2(n) { return n < 10 ? "0" + n : String(n); }
  function stampOf(d) { return d.getFullYear() + "-" + n2(d.getMonth() + 1) + "-" + n2(d.getDate()) + " " + n2(d.getHours()) + ":" + n2(d.getMinutes()); }
  function hhmmOf(d) { return n2(d.getHours()) + ":" + n2(d.getMinutes()); }
  function addMin(d, m) { return new Date(d.getTime() + m * 60000); }
  function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }
  function atHm(d, h, m) { var x = new Date(d.getTime()); x.setHours(h, m || 0, 0, 0); return x; }
  function laterThan(base, t, gapMin) { var g = addMin(base, gapMin); return t > g ? t : g; }
  function hashP(s) { for (var h = 0, i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0; return h; }
  function rngFrom(seed) {
    var t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(rnd, arr) { return arr[Math.floor(rnd() * arr.length) % arr.length]; }
  function shortCity(c) { return String(c || "").replace(/市$|区$|县$/g, ""); }
  function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

  /* ---------------- 静态数据 ---------------- */
  var NET4 = {
    "北京市": "0100", "上海市": "0210", "天津市": "0220", "重庆市": "0230",
    "广州市": "0200", "深圳市": "0755", "杭州市": "0571", "南京市": "0250",
    "苏州市": "0512", "成都市": "0280", "武汉市": "0270", "西安市": "0290",
    "青岛市": "0532", "济南市": "0531", "长沙市": "0731", "郑州市": "0371",
    "厦门市": "0592", "福州市": "0591", "昆明市": "0871", "沈阳市": "0240",
    "合肥市": "0551", "哈尔滨市": "0451", "长春市": "0431", "石家庄市": "0311",
    "太原市": "0351", "南昌市": "0791", "南宁市": "0888", "海口市": "0898",
    "兰州市": "0931", "西宁市": "0971", "银川市": "0951", "乌鲁木齐市": "0991",
    "呼和浩特市": "0471", "拉萨市": "0891", "烟台市": "0535", "潍坊市": "0536",
    "临沂市": "0539", "东莞市": "0769", "佛山市": "0757", "昆山市": "0512",
    "义乌市": "0579", "浦东新区": "0210", "朝阳区": "0100", "海淀区": "0100",
    "天河区": "0200", "雁塔区": "0290", "武侯区": "0280"
  };
  var AREAS = {
    "北京": ["朝阳", "海淀", "丰台", "通州"], "上海": ["徐汇", "浦东", "静安", "闵行"],
    "广州": ["天河", "海珠", "番禺"], "深圳": ["南山", "福田", "龙岗"],
    "成都": ["武侯", "锦江", "金牛"], "杭州": ["西湖", "滨江", "余杭"],
    "南京": ["鼓楼", "江宁", "秦淮"], "武汉": ["洪山", "江汉", "武昌"],
    "西安": ["雁塔", "碑林", "未央"], "重庆": ["渝北", "江北", "九龙坡"],
    "青岛": ["市南", "崂山", "李沧"], "天津": ["南开", "河西", "和平"],
    "苏州": ["姑苏", "吴中"], "长沙": ["岳麓", "芙蓉"], "郑州": ["金水", "二七"],
    "厦门": ["思明", "湖里"], "昆明": ["五华", "官渡"], "沈阳": ["沈河", "铁西"],
    "合肥": ["蜀山", "庐阳"], "济南": ["历下", "市中", "槐荫"],
    "福州": ["鼓楼", "台江"], "哈尔滨": ["南岗", "道里"], "长春": ["朝阳", "绿园"],
    "石家庄": ["桥西", "长安"], "太原": ["小店", "迎泽"], "南昌": ["青山湖", "红谷滩"],
    "南宁": ["青秀", "西乡塘"], "海口": ["龙华", "美兰"], "兰州": ["城关", "七里河"],
    "西宁": ["城东", "城中"], "银川": ["兴庆", "金凤"], "乌鲁木齐": ["天山", "沙依巴克"],
    "呼和浩特": ["新城", "回民"], "拉萨": ["城关", "堆龙德庆"], "烟台": ["芝罘", "福山"],
    "潍坊": ["奎文", "潍城"], "临沂": ["兰山", "河东"], "东莞": ["南城", "厚街"],
    "佛山": ["禅城", "南海"], "昆山": ["玉山", "花桥"], "义乌": ["稠城", "北苑"]
  };
  var SUFFIX = ["一部", "二部", "三部", "四部"];
  var PROV_REGION = {
    "北京市": "华北", "天津市": "华北", "河北省": "华北", "山西省": "华北", "内蒙古自治区": "华北",
    "辽宁省": "东北", "吉林省": "东北", "黑龙江省": "东北",
    "上海市": "华东", "江苏省": "华东", "浙江省": "华东", "安徽省": "华东", "福建省": "华东", "江西省": "华东", "山东省": "华东",
    "河南省": "华中", "湖北省": "华中", "湖南省": "华中",
    "广东省": "华南", "广西壮族自治区": "华南", "海南省": "华南",
    "重庆市": "西南", "四川省": "西南", "贵州省": "西南", "云南省": "西南", "西藏自治区": "西南",
    "陕西省": "西北", "甘肃省": "西北", "青海省": "西北", "宁夏回族自治区": "西北", "新疆维吾尔自治区": "西北",
    "香港特别行政区": "华南", "澳门特别行政区": "华南", "台湾省": "华东"
  };
  var PROV_HUB = {
    "北京市": "北京", "天津市": "天津", "河北省": "石家庄", "山西省": "太原", "内蒙古自治区": "呼和浩特",
    "辽宁省": "沈阳", "吉林省": "长春", "黑龙江省": "哈尔滨",
    "上海市": "上海", "江苏省": "南京", "浙江省": "杭州", "安徽省": "合肥", "福建省": "福州", "江西省": "南昌", "山东省": "济南",
    "河南省": "郑州", "湖北省": "武汉", "湖南省": "长沙",
    "广东省": "广州", "广西壮族自治区": "南宁", "海南省": "海口",
    "重庆市": "重庆", "四川省": "成都", "贵州省": "贵阳", "云南省": "昆明", "西藏自治区": "拉萨",
    "陕西省": "西安", "甘肃省": "兰州", "青海省": "西宁", "宁夏回族自治区": "银川", "新疆维吾尔自治区": "乌鲁木齐",
    "香港特别行政区": "香港", "澳门特别行政区": "澳门", "台湾省": "台北"
  };
  var REGION_MID = { "华北": "北京", "东北": "沈阳", "华东": "上海", "华中": "武汉", "华南": "广州", "西南": "成都", "西北": "西安" };
  var FAR = { "新疆维吾尔自治区": 1, "西藏自治区": 1, "海南省": 1, "青海省": 1, "内蒙古自治区": 1 };
  var REMOTE = {
    "新疆维吾尔自治区": { fee: 12, name: "新疆" }, "西藏自治区": { fee: 15, name: "西藏" },
    "青海省": { fee: 8, name: "青海" }, "内蒙古自治区": { fee: 6, name: "内蒙古" },
    "宁夏回族自治区": { fee: 5, name: "宁夏" }, "甘肃省": { fee: 5, name: "甘肃" },
    "海南省": { fee: 4, name: "海南" }, "云南省": { fee: 3, name: "云南" }, "贵州省": { fee: 3, name: "贵州" }
  };
  function remoteOf(prov) { return REMOTE[String(prov || "")] || { fee: 0, name: "" }; }
  var PACK = { none: { name: "自备包装", fee: 0 }, box: { name: "纸箱包装", fee: 6 }, wood: { name: "木架包装", fee: 15 } };
  var RATE105 = {
    "同城急送": { first: 12, extra: 1.8, eta: "当日达" },
    "标准快递": { first: 10, extra: 2.6, eta: "1–3 日" },
    "航空快运": { first: 23, extra: 4.2, eta: "次日达" }
  };
  var NAME_POOL = ["张伟", "王强", "李娜", "刘洋", "陈晨", "赵磊", "周涛", "吴迪", "孙鹏", "郑凯",
    "冯波", "韩旭", "杨帆", "许诺", "郭亮", "马超", "高翔", "林峰", "罗宇", "梁宇",
    "宋佳", "唐磊", "何鑫", "曾辉", "邓超", "曹阳", "彭飞", "潘磊", "袁野", "于洋",
    "董明", "苏杭", "叶楠", "吕强", "姚远", "卢凯", "蒋涛", "蔡亮", "余乐", "杜鹏"];
  var PLATE_LETTER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  var PLATE_CHAR = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  var PROV_ABBR = {
    "北京市": "京", "天津市": "津", "河北省": "冀", "山西省": "晋", "内蒙古自治区": "蒙",
    "辽宁省": "辽", "吉林省": "吉", "黑龙江省": "黑", "上海市": "沪", "江苏省": "苏",
    "浙江省": "浙", "安徽省": "皖", "福建省": "闽", "江西省": "赣", "山东省": "鲁",
    "河南省": "豫", "湖北省": "鄂", "湖南省": "湘", "广东省": "粤", "广西壮族自治区": "桂",
    "海南省": "琼", "重庆市": "渝", "四川省": "川", "贵州省": "贵", "云南省": "云",
    "西藏自治区": "藏", "陕西省": "陕", "甘肃省": "甘", "青海省": "青", "宁夏回族自治区": "宁",
    "新疆维吾尔自治区": "新", "香港特别行政区": "港", "澳门特别行政区": "澳", "台湾省": "台"
  };
  var AIRLINE = ["SC", "MU", "CA", "CZ", "3U", "HU", "MF", "ZH"];
  var SIGN_MODES = ["本人签收", "家人代收", "门卫代收", "前台代收", "丰巢智能柜", "菜鸟驿站"];

  /* ---------------- 单号 ---------------- */
  function luhnSum(digits) {
    var sum = 0;
    for (var i = digits.length - 1, pos = 0; i >= 0; i--, pos++) {
      var d = Number(digits.charAt(i));
      if (pos % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
    }
    return sum;
  }
  function checkDigitOf(d11) {
    var sum = 0;
    for (var i = d11.length - 1, pos = 1; i >= 0; i--, pos++) {
      var d = Number(d11.charAt(i));
      if (pos % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
    }
    return (10 - (sum % 10)) % 10;
  }
  function shipCodeValid(code) {
    var d = String(code || "").toUpperCase().replace(/^NDT/, "").replace(/\s/g, "");
    return /^\d{12}$/.test(d) ? (luhnSum(d) % 10) === 0 : false;
  }
  window.shipCodeValid = shipCodeValid;

  var GEN_CODES = {};
  var __shipNewCode = function (prov, city) {
    var list = [];
    try { list = shipAll(); } catch (e) { list = []; }
    var used = {};
    for (var i = 0; i < list.length; i++) used[String(list[i].code || "").toUpperCase()] = 1;
    for (var g in GEN_CODES) if (GEN_CODES.hasOwnProperty(g)) used[g] = 1;
    var net = NET4[city] || NET4[prov];
    if (!net) net = String(1000 + hashP(String(prov || "") + "|" + String(city || "")) % 8999);
    var now = new Date();
    var mmdd = n2(now.getMonth() + 1) + n2(now.getDate());
    for (var k = 0; k < 40; k++) {
      var seq = String(Math.floor(Math.random() * 1000));
      while (seq.length < 3) seq = "0" + seq;
      var d11 = net + mmdd + seq;
      var code = "NDT" + d11 + String(checkDigitOf(d11));
      if (!used[code]) { GEN_CODES[code] = 1; return code; }
    }
    return null;
  };

  /* ---------------- 运费 ---------------- */
  var __shipFee = function (o) {
    o = o || {};
    var rate = RATE105[o.service] || RATE105["标准快递"];
    var w = Math.max(0, Number(o.weight) || 0);
    var overKg = w > 1 ? Math.ceil(w - 1) : 0;
    var extra = round2(overKg * rate.extra);
    var pack = PACK[o.pack] || PACK.none;
    var remote = remoteOf(o.toProv);
    var value = Math.max(0, Number(o.insureValue) || 0);
    var insure = value > 0 ? Math.min(500, Math.max(1, round2(value * 0.005))) : 0;
    return {
      first: rate.first, overKg: overKg, extra: extra,
      pack: pack.fee, packName: pack.name,
      remote: remote.fee, remoteName: remote.name,
      insure: insure, rate: rate,
      total: round2(rate.first + extra + pack.fee + remote.fee + insure)
    };
  };

  var __shipFeeRows = function (fee, svc) {
    var out = '<div class="ship-fr"><span>' + shipEscAttr(svc) + ' · 首重 1kg</span><b>¥ ' + shipMoney(fee.first) + '</b></div>';
    out += fee.overKg > 0
      ? '<div class="ship-fr"><span>续重 ' + fee.overKg + 'kg（不足 1kg 按 1kg）× ¥' + (RATE105[svc] ? RATE105[svc].extra : 2.6) + '</span><b>¥ ' + shipMoney(fee.extra) + '</b></div>'
      : '<div class="ship-fr"><span>首重内（≤1kg 不计续重）</span><b>¥ 0.00</b></div>';
    if (fee.pack > 0) out += '<div class="ship-fr"><span>' + shipEscAttr(fee.packName) + '</span><b>¥ ' + shipMoney(fee.pack) + '</b></div>';
    if (fee.remote > 0) out += '<div class="ship-fr"><span>偏远地区附加（' + shipEscAttr(fee.remoteName) + '）</span><b>¥ ' + shipMoney(fee.remote) + '</b></div>';
    out += '<div class="ship-fr"><span>保价费（0.5%，最低 1 元，上限 500 元）</span><b>¥ ' + shipMoney(fee.insure) + '</b></div>';
    out += '<div class="ship-total"><span>预计费用</span><b><small>¥</small>' + shipMoney(fee.total) + '</b></div>';
    return out;
  };

  var __shipRecalc = function () {
    var box = $("#ship-fee"), dock = $("#ship-dock-amt");
    if (!box) return;
    var svc = "标准快递", on = $(".ship-svc.on");
    if (on) svc = on.getAttribute("data-svc");
    var w = $("#s-weight") ? $("#s-weight").value : 0;
    var ins = ($("#s-insure") && $("#s-insure").checked && $("#s-insure-val")) ? $("#s-insure-val").value : 0;
    var pack = $("#s-pack") ? $("#s-pack").value : "none";
    var toProv = $("#r-prov") ? $("#r-prov").value : "";
    var fee = __shipFee({ service: svc, weight: w, insureValue: ins, pack: pack, toProv: toProv });
    box.innerHTML = __shipFeeRows(fee, svc);
    if (dock) dock.innerHTML = shipMoney(fee.total);
    return fee;
  };

  /* ---------------- 每单种子 / 固定事实 ---------------- */
  function seedOf(rec) {
    if (rec && rec.seed) return (Number(rec.seed) >>> 0);
    return (hashP(String((rec && rec.code) || "")) ^ hashP(String(Number((rec && rec.at) || 0)))) >>> 0;
  }
  function depotOf(prov, city, rnd) {
    var sc = shortCity(city) || shortCity(prov) || "中转";
    var areas = AREAS[sc];
    var area = areas ? pick(rnd, areas) : "中心";
    return sc + area + pick(rnd, SUFFIX);
  }
  function telOf(rnd) {
    var pre = ["138", "139", "136", "137", "150", "151", "158", "159", "186", "187", "188", "189", "135", "133"][Math.floor(rnd() * 14) % 14];
    var mid = String(1000 + Math.floor(rnd() * 9000));
    return { mask: pre + "****" + mid, full: pre + mid + String(100 + Math.floor(rnd() * 900)) };
  }
  function plateOf(prov, rnd) {
    var abbr = PROV_ABBR[prov] || "鲁";
    var letter = PLATE_LETTER.charAt(Math.floor(rnd() * PLATE_LETTER.length));
    var body = "";
    for (var i = 0; i < 5; i++) body += PLATE_CHAR.charAt(Math.floor(rnd() * PLATE_CHAR.length));
    return abbr + letter + "·" + body;
  }
  function flightOf(rnd) { return pick(rnd, AIRLINE) + String(1000 + Math.floor(rnd() * 8000)); }
  function signModeOf(rec) { return pick(rngFrom(seedOf(rec) ^ 0x5bf03635), SIGN_MODES); }

  /* 同一单固定不变的：网点、人员、车牌、航班 */
  function factsOf(rec) {
    var rnd = rngFrom(seedOf(rec));
    var f = {};
    f.depotS = depotOf(rec.fromProv, rec.fromCity, rnd);
    f.depotT = depotOf(rec.toProv, rec.toCity, rnd);
    f.picker = pick(rnd, NAME_POOL);
    f.deliverer = pick(rnd, NAME_POOL);
    if (f.deliverer === f.picker) f.deliverer = NAME_POOL[(NAME_POOL.indexOf(f.picker) + 7) % NAME_POOL.length];
    f.telP = telOf(rnd); f.telD = telOf(rnd); f.telR = telOf(rnd);
    f.plate1 = plateOf(rec.fromProv, rnd);
    f.plate2 = plateOf(rec.toProv, rnd);
    f.flight = flightOf(rnd);
    return f;
  }

  /* ---------------- 时效模型 ---------------- */
  function planTimes(rec, rnd) {
    var at = new Date(Number(rec.at) || Date.now());
    var svc = rec.service || "标准快递";
    var sameCity = String(rec.fromCity || "") === String(rec.toCity || "");
    var sameProv = String(rec.fromProv || "") === String(rec.toProv || "");
    var rFrom = PROV_REGION[rec.fromProv] || "华东";
    var rTo = PROV_REGION[rec.toProv] || "华东";
    var far = !!(FAR[rec.toProv] || FAR[rec.fromProv]);
    var tier = sameCity ? 0 : sameProv ? 1 : (rFrom === rTo ? 2 : (far ? 4 : 3));
    var T = {}, h = at.getHours();

    var pick;
    if (svc === "航空快运" && h >= 17 && h < 21) {
      pick = addMin(at, 25 + Math.floor(rnd() * 35));
    } else if (h >= 22 || h < 7) pick = atHm(addDays(at, 1), 8, 20 + Math.floor(rnd() * 35));
    else {
      pick = addMin(at, sameCity ? 25 + Math.floor(rnd() * 20) : 45 + Math.floor(rnd() * 75));
      if (h >= 11 && h < 14) pick = addMin(pick, 50);
      if (svc === "航空快运" && h >= 20) pick = atHm(addDays(at, 1), 8, 10 + Math.floor(rnd() * 25));
    }
    T.pick = pick;

    if (tier === 0) {
      T.netOut = laterThan(pick, addMin(pick, 35 + Math.floor(rnd() * 15)), 30);
      T.destNet = laterThan(T.netOut, addMin(T.netOut, 95 + Math.floor(rnd() * 45)), 80);
      T.dispatch = laterThan(T.destNet, addMin(T.destNet, 20 + Math.floor(rnd() * 20)), 15);
      T.sign = laterThan(T.dispatch, addMin(T.dispatch, 45 + Math.floor(rnd() * 90)), 40);
      T.eta = T.sign;
      return { tier: tier, svc: svc, at: at, T: T, region: rTo, far: far };
    }

    function nextShift(base) {
      var cands = [[18, 0], [21, 0], [1, 20]], best = null;
      for (var i = 0; i < cands.length; i++) {
        var t = atHm(base, cands[i][0], cands[i][1]);
        if (t <= addMin(base, 40)) t = addDays(t, 1);
        if (!best || t < best) best = t;
      }
      return best;
    }
    function nextWindow(base, h, m, span) {
      var mm = m + Math.floor(rnd() * span);
      var t = atHm(base, h, mm);
      if (t <= base) t = atHm(addDays(base, 1), h, mm);
      return t;
    }
    var shift1 = nextShift(pick);
    T.netOut = shift1;
    T.hubFromIn = addMin(shift1, 15 + Math.floor(rnd() * 25));

    if (tier === 1) {
      T.hubToIn = laterThan(T.hubFromIn, nextWindow(T.hubFromIn, 3, 40, 70), 120);
      T.destNet = laterThan(T.hubToIn, nextWindow(T.hubToIn, 6, 30, 40), 80);
      T.dispatch = laterThan(T.destNet, nextWindow(T.destNet, 8, 20, 30), 50);
      T.sign = laterThan(T.dispatch, addMin(T.dispatch, 90 + Math.floor(rnd() * 380)), 80);
    } else {
      T.midIn = laterThan(T.hubFromIn, addMin(T.hubFromIn, 320 + Math.floor(rnd() * 190)), 0);
      T.midOut = laterThan(T.midIn, nextWindow(T.midIn, 9, 0, 60), 95);
      T.hubToIn = laterThan(T.midOut, addMin(T.midOut, 830 + Math.floor(rnd() * 250)), 0);
      if (tier >= 4) T.hubToIn = addDays(T.hubToIn, 1);
      T.destNet = laterThan(T.hubToIn, nextWindow(T.hubToIn, 6, 30, 40), 85);
      T.dispatch = laterThan(T.destNet, nextWindow(T.destNet, 8, 20, 30), 50);
      T.sign = laterThan(T.dispatch, addMin(T.dispatch, 100 + Math.floor(rnd() * 400)), 90);
    }

    if (svc === "航空快运") {
      T.netOut = laterThan(pick, atHm(pick, 20, 40 + Math.floor(rnd() * 30)), 45);
      T.airport = laterThan(T.netOut, addMin(T.netOut, 55 + Math.floor(rnd() * 30)), 40);
      T.flight = laterThan(T.airport, atHm(T.airport, 23, 20 + Math.floor(rnd() * 60)), 60);
      T.airportTo = addMin(T.flight, 150 + Math.floor(rnd() * 40));
      T.destIn = addMin(T.airportTo, 35 + Math.floor(rnd() * 25));
      T.destNet = laterThan(T.destIn, atHm(T.airportTo, 6, 30 + Math.floor(rnd() * 30)), 40);
      T.dispatch = laterThan(T.destNet, atHm(T.destNet, 8, 40 + Math.floor(rnd() * 25)), 60);
      T.sign = laterThan(T.dispatch, addMin(T.dispatch, 90 + Math.floor(rnd() * 240)), 70);
    }
    T.eta = T.sign;
    return { tier: tier, svc: svc, at: at, T: T, region: rTo, far: far };
  }

  /* ---------------- 轨迹生成 ---------------- */
  function buildNodes(rec) {
    var seed = seedOf(rec);
    var f = factsOf(rec);
    var p = planTimes(rec, rngFrom(seed ^ 0xA5A5A5A5));
    var tr = rngFrom(seed ^ 0x2545F491);
    var T = p.T;
    var fromProv = rec.fromProv || "山东省", toProv = rec.toProv || "山东省";
    var w = Number(rec.weight) || 0, count = Number(rec.count) || 1;
    var hubFrom = PROV_HUB[fromProv] || shortCity(rec.fromCity) || "始发";
    var hubTo = PROV_HUB[toProv] || shortCity(rec.toCity) || "目的";
    if (hubFrom === hubTo) hubFrom = shortCity(rec.fromCity) || hubFrom;
    var mid = REGION_MID[p.region] || "郑州";
    if (mid === hubFrom || mid === hubTo) mid = "郑州";
    var signMode = signModeOf(rec);
    var signPerson = signMode === "本人签收" ? (rec.rName || "收件人") : pick(tr, NAME_POOL);

    var rejectAir = (p.svc === "航空快运") && (tr() < 0.015);
    var deliverFail = !rejectAir && (tr() < 0.06);
    var opId = String(1000 + Math.floor(tr() * 9000));
    var opId2 = String(1000 + Math.floor(tr() * 9000));
    var batch = "B" + String(100 + Math.floor(tr() * 900));

    var nodes = [];
    function push(kind, t, title, desc) { nodes.push({ kind: kind, t: t, title: title, desc: desc }); }

    push("order", p.at, "已下单", pick(tr, [
      "【" + f.depotS + "】订单已受理，快递员 " + f.picker + " 将在 " + hhmmOf(addMin(p.at, 120)) + " 前上门取件。",
      "【" + f.depotS + "】您的寄件订单已提交，已派单给快递员 " + f.picker + "（" + f.telP.mask + "），请保持电话畅通。",
      "【" + f.depotS + "】寄件订单已生成，快递员 " + f.picker + " 将在 2 小时内联系您取件。"
    ]));

    push("pick", T.pick, "已揽收", pick(tr, [
      "【" + f.depotS + "】快递员 " + f.picker + "（" + f.telP.mask + "）已揽收，计费重量 " + w + "kg，共 " + count + " 件。",
      "【" + f.depotS + "】已揽收您的快件，实称 " + w + "kg，外包装完好，面单已贴。",
      "【" + f.depotS + "】" + f.picker + " 已取件并称重 " + w + "kg，收件人信息已核对。"
    ]));

    if (p.svc === "航空快运") {
      push("transit", T.netOut, "运输中", pick(tr, [
        "【" + f.depotS + "】航空件已由专车发往 " + (rec.fromCity || "始发") + "机场货站，车牌 " + f.plate1 + "。",
        "【" + f.depotS + "】快件已完成称重复核，转交机场专线，车牌 " + f.plate1 + "。"
      ]));
      if (rejectAir) {
        push("reject", T.airport, "安检退回", pick(tr, [
          "【" + (rec.fromCity || "始发") + "机场货站】安检未通过（内含锂电池/液体），快件已办理退回，将原路退回寄件人。",
          "【" + (rec.fromCity || "始发") + "机场货站】安检退回：物品不符合空运要求，已转陆运退回 " + f.depotS + "。"
        ]));
        return nodes;
      }
      push("transit", T.airport, "运输中", "【" + (rec.fromCity || "始发") + "机场货站】安检通过，已称重打板，等待航班 " + f.flight + "（" + hhmmOf(T.flight) + " 起飞）。");
      push("transit", T.flight, "运输中", "【航班 " + f.flight + "】已装机起飞，" + (rec.fromCity || "始发") + " → " + (rec.toCity || "目的") + "，预计 " + hhmmOf(T.airportTo) + " 落地。");
      push("transit", T.airportTo, "运输中", "【" + (rec.toCity || "目的") + "机场货站】航班 " + f.flight + " 已落地，卸机扫描完成，操作员 " + opId + "。");
      push("transit", T.destIn, "运输中", "【" + (rec.toCity || "目的") + "机场货站】快件已提货出库，正在运往 " + f.depotT + "，预计 " + hhmmOf(addMin(T.destIn, 70)) + " 到达。");
      push("transit", T.destNet, "运输中", pick(tr, [
        "【" + f.depotT + "】快件已到达派送网点，正在分拣入柜，预计 " + hhmmOf(addMin(T.destNet, 45)) + " 前派送。",
        "【" + f.depotT + "】到件扫描完成（工号 " + opId2 + "），已分配派件员 " + f.deliverer + "。"
      ]));
    } else if (p.tier === 0) {
      push("transit", T.netOut, "运输中", pick(tr, [
        "【" + f.depotS + "】同城件已分拣出仓，由 " + f.picker + " 直送 " + f.depotT + "。",
        "【" + f.depotS + "】同城急送已交接，" + f.picker + " 正在前往 " + (rec.toCity || "目的地") + "。"
      ]));
      push("transit", T.destNet, "运输中",
        "【" + f.depotT + "】快件已到达派送网点，正在分拣入柜（批次 " + batch + "），预计 " + hhmmOf(addMin(T.destNet, 30)) + " 前派送。");
    } else {
      push("transit", T.netOut, "运输中", pick(tr, [
        "【" + f.depotS + "】快件已装车，发往 " + hubFrom + "转运中心，车牌 " + f.plate1 + "。",
        "【" + f.depotS + "】网点集包完成，本班次已发往 " + hubFrom + "转运中心，车牌 " + f.plate1 + "。"
      ]));
      push("transit", T.hubFromIn, "运输中", pick(tr, [
        "【" + hubFrom + "转运中心】快件已到达，正在分拣（批次 " + batch + "），预计 " + hhmmOf(addMin(T.hubFromIn, 90)) + " 完成。",
        "【" + hubFrom + "转运中心】卸车扫描完成，操作员 " + opId + "，快件进入自动分拣线。",
        "【" + hubFrom + "转运中心】已扫描入库，批次 " + batch + " 分拣位 " + (1 + Math.floor(tr() * 24)) + " 号。"
      ]));
      if (p.tier >= 3) {
        push("transit", T.midIn, "运输中", "【" + mid + "转运中心】快件已到达区域中转，正在按流向分拣，批次 " + batch + "。");
        push("transit", T.midOut, "运输中", pick(tr, [
          "【" + mid + "转运中心】快件已装车，发往 " + hubTo + "转运中心，车牌 " + f.plate2 + "。",
          "【" + mid + "转运中心】已发往 " + hubTo + "转运中心，操作员 " + opId2 + "，预计 " + hhmmOf(addMin(T.midOut, 300)) + " 到达。"
        ]));
      }
      push("transit", T.hubToIn, "运输中", pick(tr, [
        "【" + hubTo + "转运中心】快件已到达，正在分拣（批次 " + batch + "），即将发往末端网点 " + f.depotT + "。",
        "【" + hubTo + "转运中心】卸车扫描完成，操作员 " + opId2 + "，即将分往下游网点。"
      ]));
      push("transit", T.destNet, "运输中", pick(tr, [
        "【" + f.depotT + "】快件已到达派送网点，正在分拣入柜，预计 " + hhmmOf(addMin(T.destNet, 60)) + " 前派送。",
        "【" + f.depotT + "】到件扫描完成（工号 " + opId + "），已分配派件员 " + f.deliverer + "。",
        "【" + f.depotT + "】到件入库，货架位 " + (1 + Math.floor(tr() * 30)) + " 号，即将安排派送。"
      ]));
    }

    push("dispatch", T.dispatch, "派送中", pick(tr, [
      "【" + f.depotT + "】快递员 " + f.deliverer + "（" + f.telD.mask + "）正在为您派送，请保持电话畅通。",
      "【" + f.depotT + "】您的快件已出仓，派件员 " + f.deliverer + " 预计 " + hhmmOf(addMin(T.dispatch, 60)) + " 送达。"
    ]));

    if (deliverFail) {
      var failAt = addMin(T.dispatch, 45 + Math.floor(tr() * 60));
      push("fail", failAt, "派送异常", pick(tr, [
        "【" + f.depotT + "】派送失败：收件人电话未接通（" + f.telR.mask + "），快件已带回网点，次日再次派送。",
        "【" + f.depotT + "】联系不上收件人，快件暂存网点，已短信通知，将于次日重新派送。"
      ]));
      var retryAt = atHm(addDays(failAt, 1), 8, 40 + Math.floor(tr() * 20));
      push("dispatch", retryAt, "派送中",
        "【" + f.depotT + "】快件重新出仓，快递员 " + f.deliverer + "（" + f.telD.mask + "）再次派送。");
      push("sign", addMin(retryAt, 90 + Math.floor(tr() * 300)), "已签收",
        "【" + f.depotT + "】快件已签收，签收方式：" + signMode + "，签收人：" + signPerson + "。感谢使用哪都通快递。");
      return nodes;
    }

    push("sign", T.sign, "已签收", pick(tr, [
      "【" + f.depotT + "】快件已由 " + signMode + " 签收，签收人：" + signPerson + "。感谢使用哪都通快递，期待再次为您服务。",
      "【" + f.depotT + "】已签收，签收方式：" + signMode + "，如需签收回单请在 24 小时内联系网点。"
    ]));
    return nodes;
  }

  var NCACHE = {};
  function nodesOf(rec) {
    var key = String(rec.code || "") + "|" + String(rec.seed || "") + "|" + String(rec.at || "");
    if (!NCACHE[key]) { try { NCACHE[key] = buildNodes(rec); } catch (e) { NCACHE[key] = []; } }
    return NCACHE[key];
  }
  function nodesNow(rec) {
    var now = Date.now(), out = [], all = nodesOf(rec);
    for (var i = 0; i < all.length; i++) {
      var tt = all[i].t instanceof Date ? all[i].t.getTime() : new Date(all[i].t).getTime();
      if (tt <= now) out.push(all[i]);
    }
    return out;
  }
  var STATE_OF_KIND = {
    order: { key: "待揽收", cls: "wait", tab: "wait" },
    pick: { key: "已揽收", cls: "wait", tab: "wait" },
    transit: { key: "运输中", cls: "move", tab: "move" },
    dispatch: { key: "派送中", cls: "move", tab: "move" },
    fail: { key: "派送异常", cls: "bad", tab: "bad" },
    reject: { key: "已退回", cls: "bad", tab: "bad" },
    sign: { key: "已签收", cls: "done", tab: "done" }
  };
  function shipStateInfo(rec) {
    var vis = nodesNow(rec);
    var last = vis.length ? vis[vis.length - 1].kind : "order";
    return STATE_OF_KIND[last] || STATE_OF_KIND.order;
  }
  window.shipStateInfo = shipStateInfo;

  /* ---------------- 覆盖原函数 ---------------- */
  shipNewCode = window.shipNewCode = __shipNewCode;
  shipFee = window.shipFee = __shipFee;
  shipFeeRows = window.shipFeeRows = __shipFeeRows;
  shipRecalc = window.shipRecalc = __shipRecalc;

  shipStageOf = window.shipStageOf = function (rec) {
    var info = shipStateInfo(rec);
    if (info.key === "待揽收") return 0;
    if (info.key === "已揽收") return 1;
    if (info.key === "运输中") return 2;
    if (info.key === "已签收") return 4;
    return 3;
  };

  var __origViewForm = viewShipForm;
  viewShipForm = window.viewShipForm = function () {
    var html = __origViewForm.apply(this, arguments);
    if (String(html).indexOf('id="s-pack"') < 0) {
      var block = '<label class="fl">包装服务</label>' +
        '<select class="field" id="s-pack">' +
        '<option value="none">自备包装（不收费）</option>' +
        '<option value="box">纸箱包装 +¥6</option>' +
        '<option value="wood">木架包装 +¥15</option>' +
        '</select>' +
        '<p class="muted" style="font-size:11.5px;line-height:1.7;margin:6px 0 2px">易碎品建议纸箱；超 5kg 或贵重物品建议木架。偏远地区（新疆、西藏等）运费另计。</p>';
      html = String(html).replace('<label class="fl">备注（选填）</label>', block + '<label class="fl">备注（选填）</label>');
    }
    return html;
  };

  var __origSubmit = shipSubmit;
  shipSubmit = window.shipSubmit = function () {
    if (window.__shipBusy) return;
    window.__shipBusy = 1;
    setTimeout(function () { window.__shipBusy = 0; }, 1400);
    var v = function (id) { var el = $("#" + id); return el ? String(el.value || "").trim() : ""; };
    var sName = v("s-name"), sTel = v("s-tel").replace(/\s|-/g, ""),
      rName = v("r-name"), rTel = v("r-tel").replace(/\s|-/g, ""),
      sAddr = v("s-addr"), rAddr = v("r-addr"),
      goods = v("s-goods"), count = parseInt(v("s-count") || "0", 10),
      weight = Number(v("s-weight"));
    var svcEl = $(".ship-svc.on");
    var svc = svcEl ? svcEl.getAttribute("data-svc") : "标准快递";

    if (!sName) return shipToastThrottled("请填写寄件人姓名", "warn");
    var sErr = shipTelError(sTel); if (sErr) return shipToastThrottled("寄件人手机号" + sErr, "warn");
    if (!sAddr) return shipToastThrottled("请填写取件详细地址", "warn");
    if (!rName) return shipToastThrottled("请填写收件人姓名", "warn");
    var rErr = shipTelError(rTel); if (rErr) return shipToastThrottled("收件人手机号" + rErr, "warn");
    if (!rAddr) return shipToastThrottled("请填写收件详细地址", "warn");
    if (!goods) return shipToastThrottled("请填写物品名称", "warn");
    if (!count || count < 1) return shipToastThrottled("件数至少 1 件", "warn");
    if (!weight || weight <= 0) return shipToastThrottled("请填写重量，按 kg 计", "warn");
    if (weight > 50) return shipToastThrottled("超过 50kg 请走企业物流", "warn");

    var insureOn = $("#s-insure") && $("#s-insure").checked;
    var insureValue = insureOn ? Math.max(0, Number(v("s-insure-val")) || 0) : 0;
    var pack = $("#s-pack") ? $("#s-pack").value : "none";
    if (!PACK[pack]) pack = "none";
    var toProv = v("r-prov"), fromProv = v("s-prov");
    var fee = __shipFee({ service: svc, weight: weight, insureValue: insureValue, pack: pack, toProv: toProv });

    var code = __shipNewCode(fromProv, v("s-city"));
    if (!code) return shipToastThrottled("单号生成失败，请重试", "warn");
    var rec = {
      code: code, at: Date.now(),
      seed: (hashP(code + "|" + String(Math.random()).slice(2)) ^ 0x9e3779b9) >>> 0,
      service: svc,
      sName: sName, sTel: sTel,
      fromProv: fromProv, fromCity: v("s-city"), fromAddr: sAddr,
      rName: rName, rTel: rTel,
      toProv: toProv, toCity: v("r-city"), toAddr: rAddr,
      goods: goods, type: v("s-type"), count: count, weight: weight,
      pack: pack, packName: PACK[pack].name, remoteName: fee.remoteName, remoteFee: fee.remote,
      insureValue: insureValue, fee: fee.total, note: v("s-note")
    };
    var list = shipAll();
    list.unshift(rec);
    shipSave(list);
    try { sessionStorage.setItem("ndt_ship_prefill", JSON.stringify(rec)); } catch (e) { }
    location.hash = "#/ship-ok/" + encodeURIComponent(rec.code);
  };

  shipAsTrack = window.shipAsTrack = function (rec) {
    var info = shipStateInfo(rec);
    var all = nodesOf(rec);
    var f = factsOf(rec);
    var visible = nodesNow(rec).slice().reverse();
    var etaNode = null;
    for (var j = all.length - 1; j >= 0; j--) if (all[j].kind === "sign") { etaNode = all[j]; break; }
    return {
      code: String(rec.code || "").toUpperCase(),
      status: info.key,
      service: rec.service || "标准快递",
      goods: rec.goods || "日用品",
      fee: shipMoney(rec.fee || 0),
      weight: (rec.weight || 0) + " kg",
      count: rec.count || 1,
      fromCity: rec.fromCity || "始发", toCity: rec.toCity || "目的地",
      from: f.depotS, to: f.depotT,
      eta: stampOf(etaNode ? etaNode.t : addMin(new Date(Number(rec.at) || Date.now()), 2880 * 60000)),
      timeline: visible.map(function (n, idx) {
        return { t: stampOf(n.t), title: n.title, desc: n.desc, state: idx === 0 ? "cur" : "done" };
      }),
      __shipPk: true,
      _recv: f.picker, _tel: f.telP.mask,
      deposit: { receiver: f.deliverer, rtel: f.telD.mask, depot: f.depotT, sign: info.key === "已签收" ? signModeOf(rec) : "" }
    };
  };

  var __origTrackHtml = window.trackHtml;
  window.trackHtml = function (pk) {
    if (!pk || !pk.__shipPk || typeof __origTrackHtml !== "function") {
      return typeof __origTrackHtml === "function" ? __origTrackHtml.apply(this, arguments) : "";
    }
    var status = pk.status || "运输中";
    var isSigned = status === "已签收";
    var isBad = status === "派送异常" || status === "已退回";
    var etaText;
    if (isSigned) {
      var st = (pk.timeline[0] && pk.timeline[0].t) || "";
      etaText = st ? "已于 " + st.slice(5) + " 送达" : "已送达";
    } else if (isBad) {
      etaText = status === "已退回" ? "已退回寄件人" : "派送异常 · 次日重新派送";
    } else {
      etaText = pk.eta ? "预计 <b>" + pk.eta.slice(5) + " 前</b> 送达" : "预计送达时间待更新";
    }
    var rows = (pk.timeline || []).map(function (x) {
      return '<div class="tl-item ' + (x.state || "") + (x.state === "cur" ? " current" : "") + '">' +
        '<div class="t">' + esc(x.t || "") + '</div><h4>' + esc(x.title) + '</h4><p>' + esc(x.desc || "") + '</p></div>';
    }).join("") || '<div class="empty">暂无物流轨迹</div>';
    var dep = pk.deposit || {};
    return '<div class="trk-hero"><div class="trk-top">' +
      '<div class="trk-status' + (isSigned ? "" : " on") + '">' + esc(status) + '</div>' +
      '<div class="trk-eta">' + etaText + '</div></div>' +
      '<div class="trk-meta"><span class="trk-code">' + esc(pk.code) + '</span><span class="trk-dot"></span><span>' + esc(pk.service) + '</span><span class="trk-dot"></span><span>' + esc(pk.weight) + " · " + esc(pk.count) + ' 件</span></div>' +
      '<div class="trk-route"><span class="trk-city"><b>' + esc(pk.fromCity) + '</b><i>' + esc(pk.from) + '</i></span><span class="trk-line"></span>' +
      '<span class="trk-city r"><b>' + esc(pk.toCity) + '</b><i>' + esc(pk.to) + '</i></span></div></div>' +
      '<div class="trk-card"><div class="trk-head"><span class="trk-title">物流轨迹</span><span class="trk-sublabel">共 ' + esc((pk.timeline || []).length) + ' 条</span></div><div class="tl">' + rows + '</div></div>' +
      '<div class="trk-card"><div class="trk-head"><span class="trk-title">面单信息</span><span class="trk-sublabel">' + esc(pk.code) + '</span></div><div class="trk-fields">' +
      '<div><span>物品</span><b>' + esc(pk.goods) + '</b></div>' +
      '<div><span>件数 / 重量</span><b>' + esc(pk.count) + " 件 · " + esc(pk.weight) + '</b></div>' +
      '<div><span>服务产品</span><b>' + esc(pk.service) + '</b></div>' +
      '<div><span>运费</span><b>￥' + esc(pk.fee) + '</b></div>' +
      '<div><span>揽件员</span><b>' + esc(pk._recv) + " · " + esc(pk._tel) + '</b></div>' +
      '<div><span>派件员</span><b>' + esc(dep.receiver || "待分配") + " · " + esc(dep.rtel || "待分配") + '</b></div>' +
      '<div><span>派件网点</span><b>' + esc(dep.depot || "待分配") + '</b></div>' +
      '<div><span>签收方式</span><b>' + esc(dep.sign || "待签收") + '</b></div>' +
      '</div></div>';
  };

  window.viewMyShipments = viewMyShipments = function (filter) {
    SHIP_FILTER = filter || "all";
    var all = shipAll(), f = SHIP_FILTER;
    var cnt = { all: all.length, wait: 0, move: 0, done: 0, bad: 0 };
    var infos = [];
    for (var i = 0; i < all.length; i++) {
      var info = shipStateInfo(all[i]);
      infos.push(info);
      cnt[info.tab] = (cnt[info.tab] || 0) + 1;
    }
    var list = [];
    for (var k = 0; k < all.length; k++) if (f === "all" || infos[k].tab === f) list.push({ rec: all[k], info: infos[k] });
    var tabs = [["all", "全部"], ["wait", "待揽收"], ["move", "运输中"], ["done", "已签收"], ["bad", "异常"]].map(function (t) {
      return '<a href="javascript:void(0)" data-ship-tab="' + t[0] + '" class="' + (f === t[0] ? "on" : "") + '">' + t[1] + ' ' + (cnt[t[0]] || 0) + '</a>';
    }).join("");

    var body;
    if (!list.length) {
      body = '<div class="ship-empty"><div class="es">📦</div>' + (all.length ? "这个状态下还没有寄件" : "还没有寄件记录<br><span>在「寄件服务」下一单，这里就能看到进度</span>") + '</div>';
    } else {
      body = list.map(function (it) {
        var r = it.rec, info = it.info;
        var act = info.tab === "done"
          ? '<a href="javascript:void(0)" class="ship-go js-ship-again">再寄一件 ›</a>'
          : '<a href="#/track/' + encodeURIComponent(r.code) + '" class="ship-go">查看物流 ›</a>';
        return '<div class="ship-ord">' +
          '<div class="ship-top"><span class="ship-no">' + esc(shipShowCode(r.code)) + '</span>' +
          '<span class="ship-tag ' + info.cls + '">' + esc(info.key) + '</span></div>' +
          '<div class="ship-rt">' + esc(r.fromCity) + ' <i>→</i> ' + esc(r.toCity) + '</div>' +
          '<div class="ship-meta">' + esc(r.goods) + ' · ' + esc(r.weight) + 'kg · ' + esc(r.service) + ' · ' + esc(shipShortStamp(r.at)) + ' 下单</div>' +
          '<div class="ship-foot"><span class="ship-fee">¥ ' + shipMoney(r.fee) + '</span>' + act + '</div></div>';
      }).join("");
    }

    return surfaceHeader("my-ship") +
      '<div class="page-head"><div class="wrap"><h1>我的寄件</h1><p>这台设备上下过的单，可随时查看物流</p></div></div>' +
      '<div class="section"><div class="wrap" style="max-width:860px">' +
      '<div class="card-box" style="padding-top:6px"><div class="ship-tabs">' + tabs + '</div>' + body + '</div>' +
      '<div class="card-box" style="margin-top:18px"><h3 style="margin-bottom:6px">寄件小贴士</h3>' +
      '<p class="muted" style="font-size:13px;line-height:1.9">单号可在「查快递」查询。记录只保存在本机，卸载 App 或清除数据后清空，重要单号请自行保存。' +
      (all.length ? ' <a href="javascript:void(0)" id="ship-clear" style="color:#8892AA;text-decoration:underline">清空记录</a>' : '') + '</p></div>' +
      '</div></div>' + surfaceFooter();
  };

  /* ---------------- 任意 NDT 单号都能查（v107） ----------------
     不再强校验位数与校验位：只要 NDT 开头，后面几位随便编都能出一份仿真轨迹；
     伪单的种子来自单号本身，所以同一个号每次打开内容一致。 */
  function pseudoRecOf(code) {
    var C = String(code || "").toUpperCase().replace(/\s/g, "");
    var h = hashP(C);
    var PROVS = [["山东省", "青岛市"], ["山东省", "济南市"], ["山东省", "烟台市"], ["广东省", "广州市"], ["广东省", "深圳市"],
      ["浙江省", "杭州市"], ["江苏省", "南京市"], ["四川省", "成都市"], ["湖北省", "武汉市"], ["陕西省", "西安市"],
      ["北京市", "北京市"], ["上海市", "上海市"], ["湖南省", "长沙市"], ["福建省", "厦门市"], ["河南省", "郑州市"], ["辽宁省", "沈阳市"]];
    var a = PROVS[h % PROVS.length];
    var b = PROVS[(h >>> 5) % PROVS.length];
    if (b[1] === a[1]) b = PROVS[(PROVS.indexOf(b) + 3) % PROVS.length];
    var svcs = ["标准快递", "标准快递", "标准快递", "航空快运", "同城急送"];
    var svc = b[1] === a[1] ? "同城急送" : svcs[(h >>> 9) % svcs.length];
    var w = [1, 1.5, 2, 3, 4.2, 5][(h >>> 13) % 6];
    var n = 1 + ((h >>> 17) % 3);
    var goods = ["文件资料", "服装鞋帽", "数码配件", "同人手办", "家用百货", "书籍文具"][(h >>> 11) % 6];
    var day = new Date(); day.setHours(0, 0, 0, 0);
    var backDays = (h >>> 21) % 3;
    var hh = 7 + ((h >>> 3) % 14);
    var at = day.getTime() - backDays * 86400000 + hh * 3600000 + ((h >>> 7) % 60) * 60000;
    var rec = {
      code: C, at: at, seed: (hashP(C + "|pseudo") ^ 0x9e3779b9) >>> 0,
      fromProv: a[0], fromCity: a[1], toProv: b[0], toCity: b[1],
      service: svc, weight: w, count: n, goods: goods,
      sName: NAME_POOL[(h >>> 19) % NAME_POOL.length], rName: NAME_POOL[(h >>> 23) % NAME_POOL.length],
      pack: "none", packFee: 0, remoteFee: 0
    };
    try { rec.fee = __shipFee({ service: svc, weight: w, insureValue: 0, pack: "none", toProv: b[0] }).total; } catch (e) { rec.fee = 15; }
    return rec;
  }

  var __prevViewTrack = window.viewTrack;
  window.viewTrack = function (code) {
    var raw = String(code == null ? "" : code).trim();
    var C = raw.replace(/\s/g, "").toUpperCase();
    var rec = null, unknown = false;
    if (C) {
      try { rec = shipFind(C); } catch (e) { rec = null; }
      if (!rec) {
        if (/^NDT/.test(C)) rec = pseudoRecOf(C);
        else unknown = true;
      }
    }
    var body;
    if (rec) body = (typeof window.trackHtml === "function") ? window.trackHtml(shipAsTrack(rec)) : "";
    else if (unknown) body = '<div class="trk-card trk-empty"><div class="trk-empty-ico">📦</div><p>运单号以「NDT」开头，后面几位随便填都可以查询。<br>例如 NDT053111180898 或 NDT123456</p></div>';
    else body = '<div class="trk-card trk-empty"><div class="trk-empty-ico">📦</div><p>输入运单号即可查询包裹动态，NDT 开头的单号都能查。</p></div>';
    return surfaceHeader("track") +
      '<div class="page-head"><div class="wrap"><h1>快递查询</h1><p>输入运单号，实时查询包裹动态</p></div></div>' +
      '<div class="section"><div class="wrap">' +
      '<div class="track-box" style="max-width:none;margin:0 0 24px">' +
      '<input id="tb-code" placeholder="请输入运单号，如 NDT7770001234" value="' + shipEscAttr(raw) + '">' +
      '<button class="btn btn-orange" id="tb-go">查询</button></div>' +
      '<div id="track-result">' + body + '</div>' +
      '</div></div>' + surfaceFooter();
  };

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (!t.closest("#tb-go")) return;
    var inp = document.getElementById("tb-code");
    var v = ((inp && inp.value) || "").replace(/\s/g, "").toUpperCase();
    if (v && !/^NDT/.test(v)) {
      setTimeout(function () { shipToastThrottled("运单号以 NDT 开头，后面几位随意", "warn"); }, 0);
    }
  }, true);

  document.addEventListener("change", function (e) {
    if (!e.target || !e.target.id) return;
    if (e.target.id === "s-pack" || e.target.id === "r-prov" || e.target.id === "s-prov") {
      try { __shipRecalc(); } catch (err) { }
    }
  });
})();

/* === v111 sketchpad overlay === */
/* ============================================================
   v108 · 在逃异人「手绘通缉画像」入口
   —— 追加在 app.bundle.js 末尾，不新增任何请求（画板页按需加载）
   功能：卡片上的本地画像位 + 「画通缉像」按钮 → 全屏画板 iframe
        画完可「设为卡片画像」，画像只存本机 localStorage
   ============================================================ */
(function () {
  if (window.__NDT_PAD108) return;
  window.__NDT_PAD108 = true;

  var STORE_KEY = 'ndt-wanted-art-v1';
  var metaById = {};
  var mask = null, frame = null, pending = null, curCard = null;

  /* ---------- 样式 ---------- */
  var CSS = [
    '.ndt-pad-mask{position:fixed;inset:0;z-index:2147483000;background:rgba(12,16,28,.56);',
    '-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:0}',
    '.ndt-pad-frame{width:100%;height:100%;border:0;background:#fff;display:block;',
    'box-shadow:0 24px 64px rgba(10,16,36,.36)}',
    '@media (min-width:900px){.ndt-pad-mask{padding:2.2vh 2vw}.ndt-pad-frame{max-width:1180px;max-height:96vh;border-radius:14px}}',
    'html.ndt-pad-lock,body.ndt-pad-lock{overflow:hidden!important}',
    /* —— 带画像的卡片：桌面两栏海报 —— */
    '.ndt-poster{display:grid;grid-template-columns:162px 1fr;gap:22px;align-items:start;margin-top:6px}',
    '.ndt-poster .ndt-photo{position:relative;background:#FFFEF9;padding:9px 9px 25px;border-radius:2px;',
    'box-shadow:0 10px 22px rgba(70,50,20,.2);transform:rotate(-1.6deg);cursor:zoom-in}',
    '.ndt-poster .ndt-photo img{display:block;width:144px;height:174px;object-fit:cover;background:#fff;',
    'box-shadow:inset 0 0 0 1px rgba(120,96,60,.14)}',
    '.ndt-poster .ndt-code{position:absolute;right:10px;bottom:6px;font-size:9.5px;color:#8A7C60;letter-spacing:.02em}',
    '.ndt-info{min-width:0}',
    '.ndt-info .wanted-banner{text-align:left;font-size:19px;letter-spacing:7px;margin:0 0 8px;line-height:1}',
    '.ndt-info .wanted-name{text-align:left;font-size:29px;font-weight:900;letter-spacing:2px;line-height:1.1}',
    '.ndt-info .wanted-reward{text-align:left;display:flex;align-items:baseline;gap:8px;',
    'font-size:11.5px;color:#8D95A6;margin:9px 0 12px}',
    '.ndt-info .wanted-reward strong{display:inline;font-size:26px;font-weight:800;',
    'color:#8C2D22;font-variant-numeric:tabular-nums;letter-spacing:.5px}',
    '.ndt-info .wanted-fields{border-top:1px solid #EDEFF4;padding-top:12px;gap:9px 16px}',
    '.ndt-info .wanted-fields p{font-size:11.5px;line-height:1.5}',
    /* 手机：左图右文，字段压成短行 */
    '@media (max-width:680px){',
    '.ndt-poster{grid-template-columns:100px 1fr;gap:13px;margin-top:0}',
    '.ndt-poster .ndt-photo{padding:6px 6px 19px}',
    '.ndt-poster .ndt-photo img{width:88px;height:106px}',
    '.ndt-poster .ndt-code{font-size:7px;right:6px;bottom:4px;letter-spacing:0}',
    '.ndt-info .wanted-name{font-size:23px;letter-spacing:1.5px}',
    '.ndt-info .wanted-reward{display:block;margin:5px 0 9px;font-size:10.5px}',
    '.ndt-info .wanted-reward strong{display:block;font-size:20px;margin-top:1px}',
    '.ndt-has-art .wanted-banner{text-align:center;font-size:17px;letter-spacing:5px;margin:12px 0 8px}',
    '.ndt-kvs{margin:2px 0 0}',
    '.ndt-kvs p{display:flex;gap:6px;font-size:11px;line-height:1.55;margin:0 0 5px!important}',
    '.ndt-kvs p b{display:inline!important;color:#9AA0AE!important;font-weight:500!important;',
    'font-size:10.5px!important;flex:none;margin:0!important;padding-top:1px}',
    '.ndt-rest{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;margin-top:11px}',
    '.ndt-rest p{font-size:11px;margin:0}',
    '.ndt-rest p b{display:block;font-size:9.5px;color:#9AA0AE;font-weight:500;margin-bottom:1px}',
    '.ndt-pad-open{width:100%;display:block;text-align:center}}',
    /* —— 看大图 —— */
    '.ndt-view-mask{position:fixed;inset:0;z-index:2147483002;background:rgba(10,14,24,.86);',
    'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px}',
    '.ndt-view-box{max-width:88vw;max-height:70vh;background:#fff;padding:10px;border-radius:3px;',
    'box-shadow:0 18px 48px rgba(0,0,0,.45)}',
    '.ndt-view-box img{display:block;max-width:88vw;max-height:70vh;object-fit:contain}',
    '.ndt-view-ops{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}',
    '.ndt-view-btn{border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;',
    'font-size:13px;padding:9px 20px;border-radius:22px;cursor:pointer;-webkit-backdrop-filter:blur(6px);',
    'backdrop-filter:blur(6px)}',
    '.ndt-view-btn.primary{background:#fff;color:#1F2433;border-color:#fff}',
    '.ndt-pad-open{flex:none;white-space:nowrap;max-width:100%}',
    '.ndt-pad-toast{position:fixed;left:50%;bottom:44px;transform:translateX(-50%);z-index:2147483001;',
    'background:rgba(24,30,46,.94);color:#fff;font-size:12.5px;padding:9px 16px;border-radius:9px;',
    'opacity:0;transition:.2s;pointer-events:none;max-width:80vw;text-align:center}',
    '.ndt-pad-toast.on{opacity:1}'
  ].join('');

  function addStyle() {
    if (document.getElementById('ndt-pad-style')) return;
    var s = document.createElement('style');
    s.id = 'ndt-pad-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------- 本地存储 ---------- */
  function readStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      var obj = raw ? JSON.parse(raw) : {};
      return obj && typeof obj === 'object' ? obj : {};
    } catch (e) { return {}; }
  }
  function writeStore(obj) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch (e) {}
  }
  function getArt(id) { return readStore()[id] || ''; }
  function setArt(id, data) {
    var obj = readStore();
    if (data) obj[id] = data; else delete obj[id];
    writeStore(obj);
  }

  /* ---------- 轻提示 ---------- */
  var toastEl = null, toastTimer = 0;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'ndt-pad-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 1800);
  }

  /* ---------- 从卡片读通缉令资料 ---------- */
  function readMeta(card) {
    var txt = function (sel) {
      var el = card.querySelector(sel);
      return el ? (el.textContent || '').trim() : '';
    };
    var meta = {
      name: txt('.wanted-name'),
      code: txt('.wanted-top b'),
      reward: txt('.wanted-reward strong'),
      note: txt('.wanted-note') || txt('.p-tip')
    };
    var map = { '危险等级': 'danger', '所属势力': 'faction', '异术特征': 'skill', '最后线索': 'lastSeen', '当前状态': 'status' };
    var ps = card.querySelectorAll('.wanted-fields p');
    for (var i = 0; i < ps.length; i++) {
      var label = ps[i].querySelector('b');
      if (!label) continue;
      var key = map[(label.textContent || '').trim()];
      if (!key) continue;
      meta[key] = (ps[i].textContent || '').replace(label.textContent || '', '').trim();
    }
    if (meta.code) meta.code = meta.code.replace(/^NO\.?\s*/i, '');
    return meta;
  }

  /* ---------- 画板开关（v112：站内内置模块，无 iframe） ---------- */
  var padLoading = false;
  function ensurePad(cb) {
    if (window.NDTPad) { cb(); return; }
    if (padLoading) { setTimeout(function () { ensurePad(cb); }, 150); return; }
    padLoading = true;
    var sc = document.createElement('script');
    sc.src = './assets/js/pad.js?v=113';
    sc.onload = function () { padLoading = false; cb(); };
    sc.onerror = function () { padLoading = false; toast('画板加载失败，检查网络后重试'); };
    document.head.appendChild(sc);
  }

  function openPad(card) {
    addStyle();
    var id = card.getAttribute('data-ndt-id');
    var meta = readMeta(card);
    ensurePad(function () {
      document.documentElement.classList.add('ndt-pad-lock');
      document.body.classList.add('ndt-pad-lock');
      NDTPad.open({
        id: id,
        meta: meta,
        onStick: function (wid, data) { setArt(wid, data); paintCard(wid); },
        onClose: function () {
          document.documentElement.classList.remove('ndt-pad-lock');
          document.body.classList.remove('ndt-pad-lock');
        }
      });
    });
  }

  function closePad() {
    if (window.NDTPad && NDTPad.isOpen()) NDTPad.close();
    document.documentElement.classList.remove('ndt-pad-lock');
    document.body.classList.remove('ndt-pad-lock');
  }

  /* ---------- 点相纸看大图 ---------- */
  function openViewer(src, code) {
    var mask = document.createElement('div');
    mask.className = 'ndt-view-mask';
    mask.innerHTML = '<div class="ndt-view-box"><img alt="通缉照" src="' + src + '"></div>' +
      '<div class="ndt-view-ops">' +
      '<button type="button" class="ndt-view-btn primary" data-act="save">保存图片</button>' +
      '<button type="button" class="ndt-view-btn" data-act="share">分享</button>' +
      '<button type="button" class="ndt-view-btn" data-act="close">关闭</button>' +
      '</div>';
    document.body.appendChild(mask);

    function close() {
      if (mask.parentNode) mask.parentNode.removeChild(mask);
    }
    mask.addEventListener('click', function (e) {
      var act = e.target && e.target.getAttribute ? e.target.getAttribute('data-act') : '';
      if (act === 'close') { close(); return; }
      if (e.target === mask) { close(); return; }
      if (act === 'save') {
        var a = document.createElement('a');
        a.href = src;
        a.download = '哪都通-通缉照-' + (code || 'ND-WANTED') + '.jpg';
        document.body.appendChild(a); a.click(); a.remove();
        toast('通缉照已保存');
        return;
      }
      if (act === 'share') {
        fetch(src).then(function (r) { return r.blob(); }).then(function (blob) {
          var file = new File([blob], '哪都通-通缉照-' + (code || 'ND-WANTED') + '.jpg', { type: 'image/jpeg' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: '哪都通 · 通缉照' }).catch(function () {});
          } else {
            var a = document.createElement('a');
            a.href = src; a.download = file.name;
            document.body.appendChild(a); a.click(); a.remove();
            toast('当前环境不支持直接分享，已保存图片');
          }
        }).catch(function () {});
      }
    });
  }

  document.addEventListener('click', function (e) {
    var img = e.target && e.target.closest ? e.target.closest('.ndt-photo img') : null;
    if (!img) return;
    var card = img.closest('.wanted-card');
    var id = card ? card.getAttribute('data-ndt-id') : '';
    var art = id ? getArt(id) : img.src;
    e.preventDefault();
    openViewer(art || img.src, card ? (card.querySelector('.wanted-top b') || {}).textContent : '');
  });

  /* ---------- 卡片：按钮进操作栏；有画像才重排成「左图右文」 ---------- */
  function cardCode(card, id) {
    var el = card.querySelector('.wanted-top b');
    return el ? (el.textContent || '').trim() : id;
  }

  function isNarrow() {
    return !!(window.matchMedia && window.matchMedia('(max-width:680px)').matches);
  }

  /* 把卡片拆回原始结构 */
  function restoreCard(card) {
    var poster = card.querySelector('.ndt-poster');
    if (!poster) return;
    var info = poster.querySelector('.ndt-info');
    var note = card.querySelector('.wanted-note');
    ['banner', 'name', 'reward'].forEach(function (k) {
      var el = info.querySelector('.wanted-' + k);
      if (el) card.insertBefore(el, note);
    });
    var kvs = info.querySelector('.ndt-kvs');
    var fields = info.querySelector('.wanted-fields');
    var rest = card.querySelector('.ndt-rest');
    if (kvs) {                                   // 手机：字段被拆成两段
      while (kvs.firstChild) fields.appendChild(kvs.firstChild);
      fields.className = 'wanted-fields';
      fields.style.cssText = '';
      card.insertBefore(fields, note);
    } else if (fields) {
      card.insertBefore(fields, note);
    }
    if (rest && rest.parentNode) {
      while (rest.firstChild) fields.appendChild(rest.firstChild);
      rest.parentNode.removeChild(rest);
    }
    if (fields) card.insertBefore(fields, note);
    if (poster.parentNode) poster.parentNode.removeChild(poster);
    card.classList.remove('ndt-has-art');
  }

  function applyCard(card, id) {
    var art = getArt(id);
    var narrow = isNarrow();

    // 先还原，再按当前宽度重排（保证 resize / 重画都正确）
    restoreCard(card);

    if (art) {
      var note = card.querySelector('.wanted-note');
      var banner = card.querySelector('.wanted-banner');
      var name = card.querySelector('.wanted-name');
      var reward = card.querySelector('.wanted-reward');
      var fields = card.querySelector('.wanted-fields');

      var poster = document.createElement('div');
      poster.className = 'ndt-poster';
      poster.innerHTML = '<div class="ndt-photo"><img alt="本地通缉画像" src="' + art + '">' +
        '<span class="ndt-code"></span></div><div class="ndt-info"></div>';
      poster.querySelector('.ndt-code').textContent = cardCode(card, id);
      var info = poster.querySelector('.ndt-info');

      // 手机保留居中的「在 逃 通 缉」标题在上方，桌面则并进右栏
      if (!narrow && banner) info.appendChild(banner);
      if (name) info.appendChild(name);
      if (reward) info.appendChild(reward);

      if (fields) {
        if (narrow) {
          var kvs = document.createElement('div');
          kvs.className = 'ndt-kvs';
          while (fields.firstChild && kvs.children.length < 3) kvs.appendChild(fields.firstChild);
          info.appendChild(kvs);
          var rest = document.createElement('div');
          rest.className = 'ndt-rest';
          while (fields.firstChild) rest.appendChild(fields.firstChild);
          card.insertBefore(rest, note);
          fields.className = 'wanted-fields ndt-fields-hold';
          fields.style.display = 'none';
          card.insertBefore(fields, note);
          card.insertBefore(poster, rest);
        } else {
          info.appendChild(fields);
          card.insertBefore(poster, note);
        }
      } else {
        card.insertBefore(poster, note);
      }
      card.classList.add('ndt-has-art');
    }

    var actions = card.querySelector('.wanted-actions');
    if (actions) {
      var btn = actions.querySelector('.ndt-pad-open');
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-sm btn-ghost ndt-pad-open';
        actions.appendChild(btn);
      }
      btn.textContent = art ? '重画通缉像' : '画通缉像';
    }
  }

  function paintCard(id) {
    var cards = document.querySelectorAll('.wanted-card');
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].getAttribute('data-ndt-id') !== id) continue;
      applyCard(cards[i], id);
    }
  }

  function decorate(card) {
    if (card.getAttribute('data-ndt-done') === '1') return;
    var editBtn = card.querySelector('[data-wanted-edit]');
    if (!editBtn) return;
    var id = editBtn.getAttribute('data-wanted-edit');
    if (!id) return;
    card.setAttribute('data-ndt-done', '1');
    card.setAttribute('data-ndt-id', id);
    applyCard(card, id);
  }

  /* 视口宽度变化时按新宽度重排一次 */
  var rzTimer = 0, lastNarrow = isNarrow();
  window.addEventListener('resize', function () {
    clearTimeout(rzTimer);
    rzTimer = setTimeout(function () {
      if (isNarrow() === lastNarrow) return;
      lastNarrow = isNarrow();
      var cards = document.querySelectorAll('.wanted-card[data-ndt-id]');
      for (var i = 0; i < cards.length; i++) {
        try { applyCard(cards[i], cards[i].getAttribute('data-ndt-id')); } catch (e) {}
      }
    }, 220);
  });

  function scan(root) {
    var cards = (root || document).querySelectorAll('.wanted-card');
    for (var i = 0; i < cards.length; i++) {
      try { decorate(cards[i]); } catch (e) {}
    }
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('.ndt-pad-open') : null;
    if (!btn) return;
    var card = btn.closest('.wanted-card');
    if (!card) return;
    e.preventDefault();
    openPad(card);
  });

  /* 路由切换后卡片是新 DOM，用 MutationObserver 补入口 */
  function boot() {
    addStyle();
    scan(document);
    if (!window.MutationObserver) return;
    var mo = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (!r.addedNodes || !r.addedNodes.length) continue;
        for (var j = 0; j < r.addedNodes.length; j++) {
          var n = r.addedNodes[j];
          if (n.nodeType !== 1) continue;
          if (n.classList && n.classList.contains('wanted-card')) {
            try { decorate(n); } catch (e) {}
          } else if (n.querySelector && n.querySelector('.wanted-card')) {
            scan(n);
          }
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

