-- maytoni.js --
/**
 * maytoni.js — Логика подбора для Maytoni UNITY
 * Зависит от utils.js: parseParams, groupItems, renderTable, saveToCart
 */
(function() {
  const params      = parseParams();
  const type        = params.get('type')        || 'one-phase';
  const color       = params.get('color')       || 'black';
  const mounting    = params.get('mounting')    || 'surface';
  const shape       = params.get('shape')       || 'straight';
  const lengthA     = parseFloat(params.get('lengthA')) || 0;
  const lengthB     = parseFloat(params.get('lengthB')) || 0;
  const lights      = params.getJSON('lights');

  // Встроенные данные Maytoni UNITY
  const DATA = {
    'one-phase': {
      black: {
        surface: {
          lengthOptions: [
            {min:0,max:100,items:['TRX001-111B']},
            {min:101,max:200,items:['TRX001-112B']},
            {min:201,max:300,items:['TRX001-113B']}
          ],
          connectors: {straight:['TRA001C-11B'], 'L-shape':['TRA001CL-11B'], 'T-shape':['TRA001CT-11B'], x:[]},
          components: {
            'TRX001-111B':{name:'Шинопровод накладной черный 1м',price:1500,image:'images/maytoni unity/TRX001-111B.png'},
            'TRX001-112B':{name:'Шинопровод накладной черный 2м',price:2500,image:'images/maytoni unity/TRX001-112B.png'},
            'TRX001-113B':{name:'Шинопровод накладной черный 3м',price:3490,image:'images/maytoni unity/TRX001-113B.png'},
            'TRA001C-11B':{name:'Коннектор прямой черный',price:100,image:'images/maytoni unity/TRA001C-11B.png'},
            'TRA001CL-11B':{name:'Коннектор угловой черный',price:150,image:'images/maytoni unity/TRA001CL-11B.png'},
            'TRA001CT-11B':{name:'Коннектор Т-образный черный',price:200,image:'images/maytoni unity/TRA001CT-11B.png'}
          }
        },
        recessed: {
          lengthOptions: [
            {min:0,max:100,items:['TRX004-111B']},
            {min:101,max:200,items:['TRX004-112B']}
          ],
          connectors: {straight:['TRA002C-11B'],'L-shape':['TRA002CL-11B'],'T-shape':['TRA002CT-11B'], x:[]},
          components: {
            'TRX004-111B':{name:'Шинопровод встраиваемый черный 1м',price:1600,image:'images/maytoni unity/TRX004-111B.png'},
            'TRX004-112B':{name:'Шинопровод встраиваемый черный 2м',price:2600,image:'images/maytoni unity/TRX004-112B.png'},
            'TRA002C-11B':{name:'Коннектор прямой для встраивания',price:110,image:'images/maytoni unity/TRA002C-11B.png'},
            'TRA002CL-11B':{name:'Коннектор угловой для встраивания',price:160,image:'images/maytoni unity/TRA002CL-11B.png'},
            'TRA002CT-11B':{name:'Коннектор Т-образный для встраивания',price:210,image:'images/maytoni unity/TRA002CT-11B.png'}
          }
        },
        'stretch-ceiling': {
          lengthOptions: [
            {min:0,max:100,items:['TRX003-111B']},
            {min:101,max:200,items:['TRX003-112B']},
            {min:201,max:300,items:['TRX003-113B']}
          ],
          connectors: {straight:['TRA003C-11B'],'L-shape':['TRA003CL-11B'],'T-shape':['TRA003CT-11B'], x:[]},
          components: {
            'TRA001MP-112S':{name:'Профиль для натяжного потолка TRA001MP-112S',price:5490,image:'images/maytoni unity/TRA001MP-112S.png'}
          },
          additionalComponents:['TRA001MP-112S']
        },
        hanging:{ // аналогичен surface
          lengthOptions:[{min:0,max:100,items:['TRX001-111B']},{min:101,max:200,items:['TRX001-112B']},{min:201,max:300,items:['TRX001-113B']}],
          connectors:{straight:['TRA001C-11B'],'L-shape':['TRA001CL-11B'],'T-shape':['TRA001CT-11B'], x:[]},
          components: {/* повтор surface компоненты */}
        }
      },
      white: {/* аналогично */}
    }
  };

  function getTracks(len, opts) {
    let pieces=[];
    opts.forEach(o=>{
      if(len>o.min&&len<=o.max) pieces.push({id:o.items[0],pieceLength:o.max});
    });
    if(pieces.length===0&&len>opts[opts.length-1].max) {
      const max=opts[opts.length-1];
      const cnt=Math.floor(len/max.max);
      for(let i=0;i<cnt;i++) pieces.push({id:max.items[0],pieceLength:max.max});
      const rem=len-cnt*max.max;
      if(rem>0) pieces.push(...getTracks(rem,opts));
    }
    return pieces;
  }

  function assembleItems(){
    const cfgKey=(mounting==='hanging'||mounting==='stretch-ceiling')?'surface':mounting;
    const cfg=DATA[type][color][cfgKey];
    let items=[],conns=[];
    if(shape==='straight') items=getTracks(lengthA,cfg.lengthOptions);
    else if(shape==='L-shape'){items=getTracks(lengthA,cfg.lengthOptions).concat(getTracks(lengthB,cfg.lengthOptions));conns.push({id:cfg.connectors['L-shape'][0]});}
    else if(shape==='T-shape'){items=getTracks(lengthA,cfg.lengthOptions).concat(getTracks(lengthB,cfg.lengthOptions));conns.push({id:cfg.connectors['T-shape'][0]});}
    else if(shape==='P-shape'){const a=getTracks(lengthA,cfg.lengthOptions),b=getTracks(lengthB,cfg.lengthOptions);items=a.concat(a,b);conns.push({id:cfg.connectors['L-shape'][0]},{id:cfg.connectors['L-shape'][0]});}
    else if(shape==='rectangle'){const a=getTracks(lengthA,cfg.lengthOptions),b=getTracks(lengthB,cfg.lengthOptions);items=a.concat(a,b,b);for(let i=0;i<4;i++)conns.push({id:cfg.connectors['L-shape'][0]});}
    else if(shape==='x'){const a=getTracks(lengthA,cfg.lengthOptions),b=getTracks(lengthB,cfg.lengthOptions);items=a.concat(b);const xId=(mounting==='recessed'?cfg.connectors['x'][0]:'')||cfg.connectors['x'][0]||cfg.connectors['x'][0];conns.push({id:xId});}
    if(mounting==='stretch-ceiling'&&cfg.additionalComponents)cfg.additionalComponents.forEach(id=>items.push({id}));
    lights.forEach(l=>{const m=lightingMappingMaytoni[l.type]&&lightingMappingMaytoni[l.type][color];if(m)for(let i=0;i<l.quantity;i++)items.push({id:m.id});});
    if(mounting==='recessed'){const total=lengthA+lengthB;const cnt=Math.ceil(total/100);for(let i=0;i<cnt;i++)items.push({id:'358090',pieceLength:100});}
    return items.concat(conns);
  }

  function showSelection(){
    const all=assembleItems();
    const cfgKey=(mounting==='hanging'||mounting==='stretch-ceiling')?'surface':mounting;
    const components=DATA[type][color][cfgKey].components;
    const grouped=groupItems(all,components,{},{});
    renderTable(grouped,'#resultsTable','#totalPrice');
    document.getElementById('addToCartFromMaytoni').onclick=()=>saveToCart(grouped);
  }

  document.addEventListener('DOMContentLoaded',showSelection);
})();
