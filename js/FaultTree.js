// 坍塌控制器
const COLLAPSE_ICON = function COLLAPSE_ICON(x, y, r) {
    return [
        ['M', x - r, y - r],
        ['a', r, r, 0, 1, 0, r * 2, 0],
        ['a', r, r, 0, 1, 0, -r * 2, 0],
        ['M', x + 2 - r, y - r],
        ['L', x + r - 2, y - r],
    ];
};
// 放大控制器
const EXPAND_ICON = function EXPAND_ICON(x, y, r) {
    return [
        ['M', x - r, y - r],
        ['a', r, r, 0, 1, 0, r * 2, 0],
        ['a', r, r, 0, 1, 0, -r * 2, 0],
        ['M', x + 2 - r, y - r],
        ['L', x + r - 2, y - r],
        ['M', x, y - 2 * r + 2],
        ['L', x, y - 2],
    ];
};
// 虚拟JSON数据
const data = {
    id: 'Top',
    label: 'Top',
    value: '1',
    oper: 'or',
    children: [{
        id: 'c1',
        label: 'c1',
        value: '1',
        oper: 'or'
    },
    {
        id: 'c2',
        label: 'c2',
        value: '0',
        oper: 'or'
    }
    ]
};


// 注册G6节点   自定义节点  G6.registerNode(nodeName, options, extendedNodeName) 
G6.registerNode(
    'icon-node', {  //自定义节点名称，需保持唯一性
    options: {   //自定义节点时的配置项
        size: [10, 20],
        stroke: '#000',
        fill: '#000',
    },
    draw(cfg, group) {  //  绘制节点和边，包括节点和边上的文本
        const styles = this.getShapeStyle(cfg);
        const {
            labelCfg = {
                style: {
                    fill: '#bae637',
                    fontSize: 1,
                    // ... 其他文本样式的配置
                  },
            }
        } = cfg;

        const w = styles.width;
        const h = styles.height;

        //向分组中添加新的图形。addShape(type, cfgs)
        const keyShape = group.addShape('rect', {
            attrs: {  //图形样式，必须配置
                ...styles,
                x: -w / 2,
                y: -h / 2,
            },
        });
     

        // 如果不需要动态增加或删除元素，则不需要 add 这两个 marker  marker：标记
        // 新增节点的加号
        group.addShape('marker', {
            attrs: {
                x: 40 - w / 2,
                y: 52 - h / 2,
                r: 4,
                stroke: '#73d13d',
                cursor: 'pointer',
                symbol: EXPAND_ICON,//指定形状  这个是加号
            },
            name: 'add-item',//图形的标识，可以不唯一
        });

        group.addShape('marker', {
            attrs: {
                x: 40 - w / 3,
                y: 52 - h / 3,
                r: 6,
                stroke: '#000',
                cursor: 'pointer',
                symbol: COLLAPSE_ICON,  //新增的加号  中间的这个
            },
            name: 'operation',
        });

        // 删除节点的减号
        group.addShape('marker', {
            attrs: {
                x: 80 - w / 2,
                y: 52 - h / 2,
                r: 4,
                stroke: '#ff4d4f',
                cursor: 'pointer',
                symbol: COLLAPSE_ICON,//减号的图标
            },
            name: 'remove-item',
        });

        // 节点里面的文字内容
        if (cfg.label) {
            group.addShape('text', {
                attrs: {
                    ...labelCfg.style,
                    text: cfg.label,
                    x: 50 - w / 2,
                    y: 25 - h / 2,
                },
            });
        }
        // keyShape 是在节点/边/ Combo 的 draw() 方法或 drawShape() 方法中返回的图形对象。
        return keyShape;
    },
    update: undefined
},
    'rect',//矩形
);

// 注册树节点之间的连接线   通过 registerEdge(edgeName, options, extendedEdgeName) 方法注册自定义的边。
G6.registerEdge('flow-line', {
    draw(cfg, group) {  //绘制后的附加操作
        const startPoint = cfg.startPoint;
        const endPoint = cfg.endPoint;

        const {
            style
        } = cfg;
        const shape = group.addShape('path', {
            attrs: {
                stroke: style.stroke,
                endArrow: style.endArrow,
                path: [
                    ['M', startPoint.x, startPoint.y],
                    ['L', startPoint.x, (startPoint.y + endPoint.y) / 2],
                    ['L', endPoint.x, (startPoint.y + endPoint.y) / 2],
                    ['L', endPoint.x, endPoint.y],
                ],
            },
        });

        return shape;
    },
});

// 鼠标移入时边的样式
const defaultStateStyles = {
    hover: {
		stroke: '#1890ff',
		lineWidth: 2,
	},
};

// 节点的样式
const defaultNodeStyle = {
    fill: '#ffffff',
    stroke: '#40a9ff',
    radius: 5,
};

//边的样式
const defaultEdgeStyle = {
    stroke: '#91d5ff',
    endArrow: {
        path: 'M 0,0 L 12, 6 L 9,0 L 12, -6 Z',//描述交替绘制线段和间距（坐标空间单位）长度的数字
        fill: '#91d5ff',
        d: -20,
    },
};

const defaultLayout = {
    type: 'compactBox',
    // 树布局的方向   TB —— 根节点在上，往下布局
    direction: 'TB',
    // 节点 id 的回调函数
    getId: function getId(d) {
        return d.id;
    },
    // 获取 graph 当前的高度。
    getHeight: function getHeight() {
        return 16;
    },
    // 获取 graph 当前的高度。
    getWidth: function getWidth() {
        return 16;
    },
    //获取每个节点的垂直间隙
    getVGap: function getVGap() {
        return 40;
    },
    //获取每个节点的水平间隙
    getHGap: function getHGap() {
        return 70;
    },
};

// 标签样式
const defaultLabelCfg = {
    style: {
        fill: '#000', // 颜色
        fontSize: 8, // 字体大小
    },
};


// 获取宽高   通过 new 进行实例化 Graph 的初始化
const width = document.getElementById('container').scrollWidth;
const height = document.getElementById('container').scrollHeight || 680;
const graph = new G6.TreeGraph({
    container: 'container',//图的  DOM 容器，可以传入该 DOM 的 id 或者直接传入容器的 HTML 节点对象。
    width,//指定画布宽度，单位为 'px'。
    height,//指定画布高度
    linkCenter: true,//指定边是否连入节点的中心
    modes: {
        default: ['drag-canvas', 'zoom-canvas',
    ]//设置画布的模式
    },
    defaultNode: {//默认状态下节点的配置，比如 type, size, color。会被写入的 data 覆盖。
        type: 'icon-node',
        size: [120, 40],
        style: defaultNodeStyle,
        labelCfg: defaultLabelCfg,
    },
    defaultEdge: {//默认状态下边的配置
        type: 'flow-line',
        style: defaultEdgeStyle,
    },
    nodeStateStyles: defaultStateStyles,//G6 3.1 版本中实例化 Graph 时，新增了 nodeStateStyles 及  edgeStateStyles 两个配置项
    edgeStateStyles: defaultStateStyles,//边
    layout: defaultLayout,//布局配置项，使用 type 字段指定使用的布局方式，type 可取以下值：random, radial, mds, circular, fruchterman, force, dagre
});
// graph 是 Graph 的实例
graph.data(data);

// 根据提供的数据渲染视图。
graph.render();

// 更新布局后，自适应窗口
graph.fitView();

graph.on('node:mouseenter', (evt) => {
    const {
        item
    } = evt;
    graph.setItemState(item, 'hover', true);
});


// 交互事件的监听
graph.on('node:mouseleave', (evt) => {  //鼠标移出元素范围时触发，该事件不冒泡，即鼠标移到其后代元素时不会触发
    const {
        item
    } = evt;
    graph.setItemState(item, 'hover', false);
});

graph.node((node) => {
    const {
        labelCfg = {}, icon = {}, linkPoints = {}, style = {}
    } = node;
    return {
        ...node,
        label: node.id,
    }
});

//鼠标左键单击节点时触发
graph.on('node:click', (evt) => {
    const {
        item,
        target
    } = evt;
    const targetType = target.get('type');
    const name = target.get('name');

    // 增加元素
    if (targetType === 'marker') {
        const model = item.getModel();
        // 添加
        if (name === 'add-item') {
            if (!model.children) {
                model.children = [];
            }
            const ids = `new${Math.random()}`;
            id = ids.substring(0,8)
            model.children.push({
                id,
                label: id.substr(0, 5),
            });
            graph.updateChild(model, model.id);
        } else if (name === 'remove-item') {  //移除
            graph.removeChild(model.id);
        } else if (name === 'operation') {
            if (item._cfg.model.oper == 'and') {
                item._cfg.model.oper = 'or';
                graph.updateItem(item, 
                    {
                        // 修改 name 为 'operation' 的子图形的默认样式
                        style:{
                            'operation': {
                                stroke: '#ffffff',
                              },
                        }
                    }
                    , false);

            } else {
                item._cfg.model.oper = 'and';
                graph.updateItem(item, 
                    {
                        style:{
                            'operation': {
                                stroke: '#000',
                              },
                        }
                    }
                    , false);
            }
            // graph.updateItem(item, item._cfg, false);
            //改变样式
        }
    }
}); 
/**
* @传入值：当前用户点击节点的id
* 1. 获取当前节点下一层的子节点
* 2. 获取当前节点的逻辑运算符
* 3. 对每个节点的值进行逻辑运算
* 4. 更新当前节点的值
*/
// function test(currentNodeId) {

// 	//获取当前节点下一层的子节点
// 	var neig = graph.getNeighbors('Top', 'target');

// 	//获取当前节点的逻辑运算符
// 	var operation = graph.findById('Top')._cfg.model.oper;

// 	//结果值，需要根据这个值更新样式和更新数据（data） graph.updateItem（）
// 	var val = 1;

// 	//对每个节点的值进行逻辑运算
// 	neig.forEach((item, index) => {
// 		var currVal = item._cfg.model.value;
// 		if (operation === 'and') {
// 			val = val & currVal;
// 		} else {
// 			val = val | currVal;
// 		}
// 	});
// 	var ers = 111;
// }