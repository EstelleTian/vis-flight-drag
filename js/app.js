/**
 * Created by FQL on 2018/4/4.
 */


var app = function () {
    // 组件对象
    var timeline = null;
    // DOM element where the Timeline will be attached
    var container = $('#visualization')[0];
    /**
     * 模拟数据
     * */
    //  分组(跑道)
    var groupName = ['02L/20R','02R/20L'];
    // 分组格式化
    var groups = new vis.DataSet();
    for(var i = 0; i < groupName.length; i++){
        groups.add({id:i,content: groupName[i],title : '跑道'+groupName[i]});
    }

    var nowDate = $.getFullTime(new Date()).substring(0,8);

    // 航班数据
    var flight = [
        {
            id: 115502069,
            flightId: 'CCA4520',
            ctd: nowDate + '1040',
        },
        {
            id: 115502111,
            flightId: 'CES5282',
            ctd: nowDate + '1337',
        },{
            id: 115502113,
            flightId: 'CQH8985',
            ctd: nowDate + '0705',
        },{
            id: 115502114,
            flightId: 'CES5405',
            ctd: nowDate + '0920',
        },{
            id: 115502125,
            flightId: 'CSC8661',
            ctd: nowDate + '1321',
        },{
            id: 115530020,
            flightId: 'CSN6926',
            ctd: nowDate + '1349',
        },{
            id: 115516481,
            flightId: 'CSC8173',
            ctd: nowDate + '1420',
        },{
            id: 115524045,
            flightId: 'CSC8841',
            ctd: nowDate + '1148',
        },{
            id: 115515019,
            flightId: 'CHH7096',
            ctd: nowDate + '1523',
        }
    ];
    // 转换航班数据数据
    var data = [];
    flight.map(function (item,index) {
        var obj = {};
        obj.id = item.id;
        obj.flightId = item.flightId;
        obj.content = item.flightId + ' ' + item.ctd;
        obj.start = $.parseFullTime(item.ctd);
        obj.ctot = item.ctd;
        obj.group = Math.floor(Math.random() * groupName.length);
        obj.runway = obj.group;
        data.push(obj);
    });
    // 拖动选项对象集合
    var items = null;
    // 可拖动范围临界 (当前日期的0000~2359)
    var minRange =  $.getFullTime(new Date()).substring(0,8)+'0000';
    var maxRange =  $.getFullTime(new Date()).substring(0,8)+'2359';
    // 初始化时可视窗时间轴起止时间点(当前时间前后各一小时)
    var startPoint = $.parseFullTime($.getFullTime($.addDateTime(new Date(), -1*1000*60*15)));
    var endPoint = $.parseFullTime($.getFullTime($.addDateTime(new Date(), 1*1000*60*15)));

    //被移动标识
    var beMoved = false;


    // Configuration for the Timeline
    var options = {
        start  : startPoint ,
        end  : endPoint ,
        // start  :  new Date(),
        format: {
            minorLabels: {
                millisecond:'SSS',
                second:     's',
                minute:     'HHmm',
                hour:       'HHmm',
                weekday:    'ddd D',
                day:        'D',
                week:       'w',
                month:      'MMM',
                year:       'YYYY'
            },
            majorLabels: {
                millisecond:'HHmmdss',
                second:     'D MMMM HHmm',
                minute:     'ddd D MMMM',
                hour:       'ddd D MMMM',
                weekday:    'MMMM YYYY',
                day:        'MMMM YYYY',
                week:       'MMMM YYYY',
                month:      'YYYY',
                year:       ''
            }
        },
        height: 400,
        width: '100%',
        // type : 'point',
        dataAttributes : ['id'],
        selectable: false,
        editable: {
            add: false,         // add new items by double tapping
            updateTime: true,  // drag items horizontally
            updateGroup: true, // drag items from one group to another
            remove: false,       // delete an item by tapping the delete button top right
            overrideItems: false  // allow these options to override item.editable
        },
        min:$.parseFullTime( minRange),                // lower limit of visible range
        max: $.parseFullTime(maxRange),                // upper limit of visible range
        zoomMin: 1000 * 60 * 60 * 0.5,
        zoomMax: 1000 * 60 * 60 * 2,
        tooltip : {
            followMouse: true
        },
        showMajorLabels : false,
        itemsAlwaysDraggable : {
            item : true, // 如果为true，则时间轴中的所有项目无需选中即可拖动。 如果为false，则只有选定的项目可拖动。
            range : true
        },
        verticalScroll : true,
        onMoving : function (item, callback) {
            // 注销 popover
            destroyPopover();
            // 拖动选项当前start时间(实时更新)
            var start = $.getFullTime(item.start);
            // 可拖动范围临界校验
            if(start < minRange){
                start = minRange;
                item.start = $.parseFullTime(start);
            }else if(start > maxRange){
                start = maxRange;
                item.start = $.parseFullTime(start);
            }

            // 更新选项内容
            if(!beMoved){
                item.content = item.flightId + ' ' + $.getFullTime(item.start);
            }else {
                // todo
            }

            // 回调函数
            callback(item);
        },
        onMove : function (item, callback) {
            // 若被移动(位置及分组发生变更)
            if(item.ctot !== $.getFullTime(item.start) || item.runway !== item.group){
                // 设置移动项
                setMovedItem(item);
            }else { // 未被移动
                // 重置选项
                resetItem(item);
            }
            // 回调函数
            callback(item);
            // 注销 popover
            destroyPopover();
        },
        onUpdate :function (item, callback) {
            console.log('ddddddddddd');
        }

    };


    /**
     * 设置移动选项
     *
     * */
    var setMovedItem = function (item) {
        // 若已被移动
        if(beMoved){
            // 只显示协调窗口
            showCollaborate(item);
            return;
        }
        // 若未被移动,则禁用其他选项编辑
        // 选项集合数据
        var itemsDatas = timeline.itemsData._data;
        var arr = [];
        for(var i in itemsDatas){
            // 将当前选项以外的选项设置为不可编辑
            if(itemsDatas[i].id !== item.id){
                itemsDatas[i].editable = false;
            }else {
                // 更新当前选项内容
                showCollaborate(item);
                // 更新当前选项数据
                itemsDatas[i] = item;
                // 设置特殊class名称，作为被移动的标记
                itemsDatas[i].className = 'vis-moved';
            }
            // 组合成插件所需格式数据集合
            arr.push(itemsDatas[i]);
        }
        // 更新时间轴选项集合数据
        timeline.setItems(arr);
        beMoved = true;
    };



    /**
     *  重置选项
     *
     * */

    var resetItem = function (item) {
        // 若未被移动
        if (!beMoved) {
            return;
        } else {
            // 若已经被移动过,则启用其他选项编辑
            // 选项集合数据
            var itemsDatas = timeline.itemsData._data;
            var arr = [];
            for (var i in itemsDatas) {
                // 将当前选项以外的选项设置为可编辑
                if (itemsDatas[i].id !== item.id) {
                    itemsDatas[i].editable = true;
                } else {
                    // 重置数据
                    resetItemData(item);
                    // 更新当前选项数据
                    itemsDatas[i] = item;

                }
                // 组合成插件所需格式数据集合
                arr.push(itemsDatas[i]);
            }
            // 更新时间轴选项集合数据
            timeline.setItems(arr);
        }
        beMoved = false;
        
    }


    /**
     * 显示协调窗口
     * */

    var showCollaborate = function (item) {
        var data = {};
        data.flightId = item.flightId;
        data.ctot = item.ctot;
        data.start = $.getFullTime(item.start);
        data.runway = groupName[item.runway];
        data.group = groupName[item.group];
        var node = createcollaborateDom (data);
        item.content = node;
    };

    // 重置数据
    var resetItemData = function (item) {
        item.editable = true;
        // 移除特殊class名称
        item.className = '';
        // 重置为原始值
        item.start = $.parseFullTime(item.ctot);
        item.group = item.runway;
        item.content = item.flightId + ' ' + item.ctot;
    }

    // 更新数据
    var updateItemData = function (item) {
        item.editable = true;
        // 移除特殊class名称
        item.className = '';
        // 重置为原始值
        item.ctot = $.getFullTime(item.start);
        item.runway = item.group;
        item.content = item.flightId + ' ' + item.ctot;
    }


    var createcollaborateDom = function (data) {
        // 利用Handlebars模版生成对应HTML结构
        var myTemplate = Handlebars.compile($("#ctot-collaborate").html());
        return myTemplate(data);
    }


    // 移动窗口，使指定选项在窗口水平居中显示
    var moveToItem = function (item) {
        // 获取时间
        var start = $.parseFullTime(item.ctot);
        // 使给定时间的选项在屏幕上水平居中显示
        timeline.moveTo(start);
    }


    /**
     * 初始化组件
     *
     * */
    var initTimeLine = function () {
        // 拖动选项对象集合
        items = new vis.DataSet(data);
        // 初始化
        timeline = new vis.Timeline(container, items, options,groups);
    };



    /**
     * 绑定 popover
     * */
    var bindPopover = function (item) {
        // 获取拖动选项jQ对象
        var $selector = $('.vis-box[data-id='+ item.id +']');
        var opt = {
            'container': 'body',
            'show': true,
            'placement': 'right auto',

            'trigger': 'hover',
            'title': getTitle(item),
            'html' :  true,
            'content': getContent(item),
            'selector' : $selector
        };

        $selector.popover(opt);
        $selector.popover('show');
    };

    var getTitle = function (item) {
        var id =  item.id || '';
        var flightId = item.flightId || '';
        return 'ID:' + id + ' '+ flightId;
    };


    var getContent = function (item) {
        return '<p >跑道:'+ groupName[item.group]+'</p>'+ '<p >CTOT:'+ $.getFullTime(item.start) +'</p>'
    };
    /**
     * 注销 popover
     * */
    var destroyPopover = function () {
        //注销
        $('.vis-box').popover('destroy');
        $('.popover').remove();
    };

    var initEvent = function () {
        // 拖动选项鼠标移入事件
        timeline.off('itemover',showTip).on('itemover',showTip);
        // 时间轴窗口更改后注销popover
        timeline.on('rangechanged',destroyPopover);
        // 提交
        $(container).on('click','.modal-ok-btn',function (event) {
            event.stopPropagation();
            updateItem(event);
        });
        // 还原
        $(container).on('click','.modal-revert-btn',function (event) {
            event.stopPropagation();
            revertItem(event);
        })


    };

    /**
     * 还原
     *
     * */
    var revertItem = function (event,item) {

        var pro = timeline.getEventProperties(event);
        var id = pro.item;
        // 选项集合数据
        var itemsDatas = timeline.itemsData._data;
        var item = itemsDatas[id];
        var arr = [];
        for (var i in itemsDatas) {
            // 将当前选项以外的选项设置为可编辑
            if (itemsDatas[i].id !== item.id) {
                itemsDatas[i].editable = true;
            } else {
                resetItemData(item);
                // 更新当前选项数据
                itemsDatas[i] = item;

            }
            // 组合成插件所需格式数据集合
            arr.push(itemsDatas[i]);
        }
        // 更新时间轴选项集合数据
        timeline.setItems(arr);
        moveToItem(item);
        beMoved = false;
        // 注销
        destroyPopover()
    };

    /**
     * 更新
     *
     * */
    var updateItem = function (event) {
        var pro = timeline.getEventProperties(event);
        var id = pro.item;
        // 选项集合数据
        var itemsDatas = timeline.itemsData._data;
        var item = itemsDatas[id];
        var arr = [];
        for (var i in itemsDatas) {
            // 将当前选项以外的选项设置为可编辑
            if (itemsDatas[i].id !== item.id) {
                itemsDatas[i].editable = true;
            } else {
                updateItemData(item);
                // 更新当前选项数据
                itemsDatas[i] = item;
            }
            // 组合成插件所需格式数据集合
            arr.push(itemsDatas[i]);
        }
        // 更新时间轴选项集合数据
        timeline.setItems(arr);
        moveToItem(item);
        beMoved = false;
        // 注销
        destroyPopover()
    };


    /**
     * 显示tooltip
     *
     * */
    var showTip = function (properties) {
        var e = properties.event;
        e.stopPropagation();
        // 获取拖动选项
        var item = items.get(properties.item);
        // 绑定popover
        bindPopover(item);
    };

    return {
        init : function () {
            initTimeLine();
            initEvent();
        }
    }
}();
$(document).ready(function () {
    app.init();
})