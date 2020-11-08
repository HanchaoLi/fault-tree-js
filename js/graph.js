const data = {
    nodes: [{
      id: '顶事件',
      x: 100,
      y: 200
   },{
      id: '中间事件',
      x: 300,
      y: 200
   },{
      id: '底事件',
      x: 300,
      y: 300
   }],
    edges: [{
      id: 'edge1',
      target: '节点2',
      source: '节点1'
   }]
  };
  let addedCount = 0;
  G6.registerBehavior('click-add-edge', {
    getEvents() {
      return {
        'node:click': 'onClick',
        mousemove: 'onMousemove',
        'edge:click': 'onEdgeClick' // 点击空白处，取消边
      };
    },
    onClick(ev) {
    if($('#text').css('display') == 'block') return;
      const node = ev.item;
      const graph = this.graph;
      const point = {
        x: ev.x,
        y: ev.y
      };
      const model = node.getModel();
      if (this.addingEdge && this.edge) {
        graph.updateItem(this.edge, {
          target: model.id
        });
        // graph.setItemState(this.edge, 'selected', true);
        this.edge = null;
        this.addingEdge = false;
      } else {
        this.edge = graph.addItem('edge', {
          source: model.id,
          target: point
        });
        this.addingEdge = true;
      }
    },
    onMousemove(ev) {
      const point = {
        x: ev.x,
        y: ev.y
      };
      if (this.addingEdge && this.edge) {
        this.graph.updateItem(this.edge, {
          target: point
        });
      }
    },
    onEdgeClick(ev) {
      const currentEdge = ev.item;
      // 拖拽过程中，点击会点击到新增的边上
      if (this.addingEdge && this.edge == currentEdge) {
        graph.removeItem(this.edge);
        this.edge = null;
        this.addingEdge = false;
      }
    }
  });
  
  // Register a custom behavior to add node
  G6.registerBehavior('click-add-node', {
    getEvents() {
      return {
        'canvas:contextmenu': 'onContextmenu'
      };
    },
    onContextmenu(e){
      let thit = this;
      let evt = e;
      e.preventDefault();//阻止默认事件
      let x = evt.canvasX;
      let y = evt.canvasY;
      //打开菜单
      $('#add_node a').off('click');
      $('#add_node').css({'left':x,'top':y}).show().find('a').click(function(){
        //添加节点
        if($('#text').css('display') == 'block') return;
        const graph = thit.graph;
        const node = thit.graph.addItem('node', {
          x: evt.canvasX,
          y: evt.canvasY,
          id: `node-${addedCount}`, // 生成唯一的 id
        });
        addedCount++;
        $('#add_node').hide();
      });
    },
    // onClick(ev) {
    //   if($('#text').css('display') == 'block') return;
    //   const graph = this.graph;
    //   const node = this.graph.addItem('node', {
    //     x: ev.canvasX,
    //     y: ev.canvasY,
    //     id: `node-${addedCount}`, // 生成唯一的 id
    //   });
    //   addedCount++;
    // }
  });
  const container = document.getElementById('mountNode');
  const width = container.clientWidth;
  const height = container.clientHeight;
  const graph = new G6.Graph({
    container: container,
    width: width,
    height: height,
    modes: {
      //default: ['drag-node', 'click-select'],
      default:['drag-node', 'click-select','click-add-node','click-add-edge'],
    },
    "layout": {
        "type": "compactBox",
        "direction": "LR",
        "getId": (d) => {
          return "";
        },
        "getWidth": (d) => {
          return 18;
        },
        "getHeight": (d) => {
          return 18;
        },
        "getHGap": (d) => {
          return 18;
        },
        "getVGap": (d) => {
          return 18;
        }
      },
      "animate":true,
      "defaultNode": {
        "type": "ellipse",
        "size": [//节点大小
          100,
          40
        ],
        "style": {
          "cursor": "default"
        },
        "labelCfg": {//字体样式
          "position": "center",
          "style": {
            "textAlign": "center",
            "fontStyle": "normal",
            "fill": "#ffffff",
            "fontSize": 15
          }
        }
      },
    "defaultEdge": {
        "type": "cubic-horizontal",
        "style": {
          "cursor": "default",
          "lineWidth": 2,
          "lineAppendWidth": 5
        },
        "labelCfg": {
          "position": "middle",
          "style": {
            "textAlign": "center",
            "textBaseline": "middle",
            "fontStyle": "normal"
          }
        }
      },
    // The node styles in different states
    nodeStateStyles: {
      // The node styles in selected state, corresponds to the built-in click-select behavior
      selected: {
        stroke: '#666',
        lineWidth: 2,
        fill: 'steelblue'
      }
    }
  });
  //节点右击事件
  graph.on('node:contextmenu', function(e) {
    console.log(e)
    let evt = e;
    e.preventDefault();//阻止默认事件
    let x = evt.canvasX;
    let y = evt.canvasY;
    //打开菜单
    $('#contextmenu').css({'left':x,'top':y}).show();
    //配置菜单功能
    $('#contextmenu a').click(function(){
      let text = $(this).attr('operation');
      switch(text){
        case 'remove'://删除节点
          console.log(evt.item)
          const model = evt.item.getModel();
          graph.removeItem(model.id);
          console.log(graph)
          break;
        case 'addParent'://父节点
          break;
        case 'addChild'://子节点
          break;
      }
      $('#contextmenu').hide();
    })
    //关闭菜单
    $(container).click(function(){
      $('#contextmenu').hide();
    })
  });
  //节点双击事件
  graph.on('node:dblclick', function(e) {
    console.log(this)
    const node = e.item;
    let thit = this;
    let evt = e;
    let model = {
        label: 'node2',//设置节点内容
    }
    //显示文本框
    $('#text').css({'left':e.canvasX,'top':evt.canvasY}).val(evt.item._cfg.model.label).show().focus();
    console.log(evt.item,data)
    //文本框失去焦点
    $('#text').blur(function(){
      thit.updateItem(node,{
        id:$('#text').val()
      })
      $(this).hide();
    })
  });
  graph.node((node) => {
    const {
      labelCfg = {}, icon = {}, linkPoints = {}, style = {}
    } = node;
    return {
      ...node,
      label: node.id,
    }
  })
  
  //边集
  graph.edge((edge) => {
    const {
      loopCfg = {}, style = {},
    } = edge;
    return {
      ...edge,
    }
  })
  graph.data(data);
  graph.render();
  function getData(){
      console.log(graph.cfg.itemMap);
      let jsonList = graph.cfg.itemMap;
      let dataNew = {
          nodes:[],
          edges:[]
      }
      for(i in jsonList){
          let item = jsonList[i];
        if(item.defaultCfg.type == 'edge'){
            let obj = {
                id: item.defaultCfg.id,
                target: item.defaultCfg.model.source,
                source: item.defaultCfg.model.target
            }
            dataNew.edges.push(obj)
        }else{
            let obj = {
                id: item.defaultCfg.id,
                x: item.defaultCfg.model.x,
                y: item.defaultCfg.model.y
            }
            dataNew.nodes.push(obj)
        }
      }
      console.log(dataNew)
  }

  const bindClickListener = () => {
    const domNodes = document.getElementsByClassName('dom-node');
    for (let i = 0; i < domNodes.length; i++) {
      const dom = domNodes[i];
      // open the following lines pls!
      dom.addEventListener('click', (e) => {
         listener(dom);
       });
    }
  };
  
  bindClickListener();
  
  // after update the item, all the DOMs will be re-rendered
  // so the listeners should be rebinded to the new DOMs
  graph.on('afterupdateitem', (e) => {
    console.log(e)
    bindClickListener();
  });