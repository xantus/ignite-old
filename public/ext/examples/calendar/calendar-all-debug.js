/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.ns('Ext.calendar');
    
(function(){
    Ext.apply(Ext.calendar, {
	    Date : {
	        diffDays : function(start, end){
	            day = 1000*60*60*24;
	            diff = end.clearTime(true).getTime() - start.clearTime(true).getTime();
	            return Math.ceil(diff/day);
	        },
            
            copyTime : function(fromDt, toDt){
                var dt = toDt.clone();
                dt.setHours(
                    fromDt.getHours(),
                    fromDt.getMinutes(),
                    fromDt.getSeconds(),
                    fromDt.getMilliseconds());
                
                return dt;
            },
            
            compare : function(dt1, dt2, precise){
                if(precise !== true){
                    dt1 = dt1.clone();
                    dt1.setMilliseconds(0);
                    dt2 = dt2.clone();
                    dt2.setMilliseconds(0);
                }
                return dt2.getTime() - dt1.getTime();
            },

	        // private helper fn
	        maxOrMin : function(max){
	            var dt = (max ? 0 : Number.MAX_VALUE), i = 0, args = arguments[1], ln = args.length;
	            for(; i < ln; i++){
	                dt = Math[max ? 'max' : 'min'](dt, args[i].getTime());
	            }
	            return new Date(dt);
	        },
	        
			max : function(){
	            return this.maxOrMin.apply(this, [true, arguments]);
	        },
	        
			min : function(){
	            return this.maxOrMin.apply(this, [false, arguments]);
	        }
	    }
    });
})();Ext.calendar.DayHeaderTemplate = function(config){
    
    Ext.apply(this, config);
    
    this.allDayTpl = new Ext.calendar.BoxLayoutTemplate(config);
    this.allDayTpl.compile();
    
    Ext.calendar.DayHeaderTemplate.superclass.constructor.call(this,
        '<div class="ext-cal-hd-ct">',
            '<table class="ext-cal-hd-days-tbl" cellspacing="0" cellpadding="0">',
                '<tbody>',
                    '<tr>',
                        '<td class="ext-cal-gutter"></td>',
                        '<td class="ext-cal-hd-days-td"><div class="ext-cal-hd-ad-inner">{allDayTpl}</div></td>',
                        '<td class="ext-cal-gutter-rt"></td>',
                    '</tr>',
                '</tobdy>',
            '</table>',
        '</div>'
    );
};

Ext.extend(Ext.calendar.DayHeaderTemplate, Ext.XTemplate, {
    applyTemplate : function(o){
        return Ext.calendar.DayHeaderTemplate.superclass.applyTemplate.call(this, {
            allDayTpl: this.allDayTpl.apply(o)
        });
    }
});

Ext.calendar.DayHeaderTemplate.prototype.apply = Ext.calendar.DayHeaderTemplate.prototype.applyTemplate;
Ext.calendar.DayBodyTemplate = function(config){
    
    Ext.apply(this, config);
    
    Ext.calendar.DayBodyTemplate.superclass.constructor.call(this,
        '<table class="ext-cal-bg-tbl" cellspacing="0" cellpadding="0">',
            '<tbody>',
                '<tr height="1">',
                    '<td class="ext-cal-gutter"></td>',
                    '<td colspan="{dayCount}">',
                        '<div class="ext-cal-bg-rows">',
                            '<div class="ext-cal-bg-rows-inner">',
                                '<tpl for="times">',
                                    '<div class="ext-cal-bg-row">',
                                        '<div class="ext-cal-bg-row-div ext-row-{[xindex]}"></div>',
                                    '</div>',
                                '</tpl>',
                            '</div>',
                        '</div>',
                    '</td>',
                '</tr>',
                '<tr>',
                    '<td class="ext-cal-day-times">',
                        '<tpl for="times">',
                            '<div class="ext-cal-bg-row">',
                                '<div class="ext-cal-day-time-inner">{.}</div>',
                            '</div>',
                        '</tpl>',
                    '</td>',
                    '<tpl for="days">',
                        '<td class="ext-cal-day-col">',
                            '<div class="ext-cal-day-col-inner">',
                                '<div id="{[this.id]}-day-col-{.:date("Ymd")}" class="ext-cal-day-col-gutter"></div>',
                            '</div>',
                        '</td>',
                    '</tpl>',
                '</tr>',
            '</tbody>',
        '</table>'
    );
};

Ext.extend(Ext.calendar.DayBodyTemplate, Ext.XTemplate, {
    applyTemplate : function(o){
        this.today = new Date().clearTime();
        this.dayCount = this.dayCount || 1;
        
        var i = 0, days = [],
            dt = o.viewStart.clone();
            
        for(; i<this.dayCount; i++){
            days[i] = dt.add(Date.DAY, i);
        }

        var times = [], dt = new Date().clearTime();
        for(i=0; i<24; i++){
            times.push(dt.format('ga'));
            dt = dt.add(Date.HOUR, 1);
        }
        
        return Ext.calendar.DayBodyTemplate.superclass.applyTemplate.call(this, {
            days: days,
            dayCount: days.length,
            times: times
        });
    }
});

Ext.calendar.DayBodyTemplate.prototype.apply = Ext.calendar.DayBodyTemplate.prototype.applyTemplate;
Ext.calendar.DayViewTemplate = function(config){
    
    Ext.apply(this, config);
    
    this.headerTpl = new Ext.calendar.DayHeaderTemplate(config);
    this.headerTpl.compile();
    
    this.bodyTpl = new Ext.calendar.DayBodyTemplate(config);
    this.bodyTpl.compile();
    
    Ext.calendar.DayViewTemplate.superclass.constructor.call(this,
        '<div class="ext-cal-inner-ct">',
            '{headerTpl}',
            '{bodyTpl}',
        '</div>'
    );
};

Ext.extend(Ext.calendar.DayViewTemplate, Ext.XTemplate, {
    applyTemplate : function(o){
        return Ext.calendar.DayViewTemplate.superclass.applyTemplate.call(this, {
            headerTpl: this.headerTpl.apply(o),
            bodyTpl: this.bodyTpl.apply(o)
        });
    }
});

Ext.calendar.DayViewTemplate.prototype.apply = Ext.calendar.DayViewTemplate.prototype.applyTemplate;
Ext.calendar.BoxLayoutTemplate = function(config){
    
    Ext.apply(this, config);
    
    Ext.calendar.BoxLayoutTemplate.superclass.constructor.call(this,
        '<tpl for="weeks">',
            '<div id="{[this.id]}-wk-{[xindex-1]}" class="ext-cal-wk-ct" style="top:{[this.getRowTop(xindex, xcount)]}%; height:{[this.getRowHeight(xcount)]}%;">',
                '<table class="ext-cal-bg-tbl" cellpadding="0" cellspacing="0">',
                    '<tbody>',
                        '<tr>',
                            '<tpl for=".">',
                                 '<td id="{[this.id]}-day-{date:date("Ymd")}" class="{cellCls}">&nbsp;</td>',
                            '</tpl>',
                        '</tr>',
                    '</tbody>',
                '</table>',
                '<table class="ext-cal-evt-tbl" cellpadding="0" cellspacing="0">',
                    '<tbody>',
                        '<tr>',
                            '<tpl for=".">',
                                '<td id="{[this.id]}-ev-day-{date:date("Ymd")}" class="{titleCls}"><div>{title}</div></td>',
                            '</tpl>',
                        '</tr>',
                    '</tbody>',
                '</table>',
            '</div>',
        '</tpl>', {
            getRowTop: function(i, ln){
                return ((i-1)*(100/ln));
            },
            getRowHeight: function(ln){
                return 100/ln;
            }
        }
    );
};

Ext.extend(Ext.calendar.BoxLayoutTemplate, Ext.XTemplate, {
    applyTemplate : function(o){
        
        Ext.apply(this, o);
        
        var w = 0, title = '', first = true, isToday = false, showMonth = false, prevMonth = false, nextMonth = false,
            weeks = [[]],
            today = new Date().clearTime(),
            dt = this.viewStart.clone(),
            thisMonth = this.startDate.getMonth();
        
        for(; w < this.weekCount || this.weekCount == -1; w++){
            if(dt > this.viewEnd){
                break;
            }
            weeks[w] = [];
            
            for(var d = 0; d < this.dayCount; d++){
                isToday = dt.getTime() === today.getTime();
                showMonth = first || (dt.getDate() == 1);
                prevMonth = (dt.getMonth() < thisMonth) && this.weekCount == -1;
                nextMonth = (dt.getMonth() > thisMonth) && this.weekCount == -1;
                
                if(showMonth){
                    if(isToday){
                        title = this.getTodayText();
                    }
                    else{
                        title = dt.format(this.dayCount == 1 ? 'l, F j, Y' : (first ? 'M j, Y' : 'M j'));
                    }
                }
                else{
                    title = isToday ? this.getTodayText() : dt.format(w == 0 ? 'D j' : 'j');
                }
                
                weeks[w].push({
                    title: title,
                    date: dt.clone(),
                    titleCls: 'ext-cal-dtitle ' + (isToday ? ' ext-cal-dtitle-today' : '') + 
                        (w==0 ? ' ext-cal-dtitle-first' : '') +
                        (prevMonth ? ' ext-cal-dtitle-prev' : '') + 
                        (nextMonth ? ' ext-cal-dtitle-next' : ''),
                    cellCls: 'ext-cal-day ' + (isToday ? ' ext-cal-day-today' : '') + 
                        (d==0 ? ' ext-cal-day-first' : '') +
                        (prevMonth ? ' ext-cal-day-prev' : '') +
                        (nextMonth ? ' ext-cal-day-next' : '')
                });
                dt = dt.add(Date.DAY, 1);
                first = false;
            }
        }
        
        return Ext.calendar.BoxLayoutTemplate.superclass.applyTemplate.call(this, {
            weeks: weeks
        });
    },
    
    getTodayText : function(){
        var dt = new Date().format('l, F j, Y'),
            text = this.dayCount == 1 ? dt + ' &mdash; ' + this.todayText: this.todayText;
        
        if(this.showTodayText !== false || this.dayCount == 1){
            if(this.showTime !== false){
                return text + ' <span id="'+this.id+'-clock" class="ext-cal-dtitle-time">' + 
                    new Date().format('g:i a') + '</span>';
            }
            return text;
        }
        return new Date().format('j');
    }
});

Ext.calendar.BoxLayoutTemplate.prototype.apply = Ext.calendar.BoxLayoutTemplate.prototype.applyTemplate;
Ext.calendar.MonthViewTemplate = function(config){
    
    Ext.apply(this, config);
    
    this.weekTpl = new Ext.calendar.BoxLayoutTemplate(config);
    this.weekTpl.compile();
    
    Ext.calendar.MonthViewTemplate.superclass.constructor.call(this,
	    '<div class="ext-cal-inner-ct">',
            '<div class="ext-cal-hd-ct" style="display:none;">',
		        '<table class="ext-cal-hd-days-tbl" cellpadding="0" cellspacing="0">',
		            '<tbody>',
                        '<tr>',
                            '<tpl for="days">',
		                        '<th class="ext-cal-hd-day" title="{.:date("l, F j, Y")}">{.:date("D")}</th>',
		                    '</tpl>',
                        '</tr>',
		            '</tbody>',
		        '</table>',
            '</div>',
	        '<div class="ext-cal-body-ct">{weeks}</div>',
        '</div>'
    );
};

Ext.extend(Ext.calendar.MonthViewTemplate, Ext.XTemplate, {
    applyTemplate : function(o){
        var days = [],
            weeks = this.weekTpl.apply(o),
            dt = o.viewStart;
        
        for(var i = 0; i < 7; i++){
            days.push(dt.add(Date.DAY, i));
        }
        return Ext.calendar.MonthViewTemplate.superclass.applyTemplate.call(this, {
            days: days,
            weeks: weeks
        });
    }
});

Ext.calendar.MonthViewTemplate.prototype.apply = Ext.calendar.MonthViewTemplate.prototype.applyTemplate;
/**
 * @class Ext.dd.ScrollManager
 * <p>Provides automatic scrolling of overflow regions in the page during drag operations.</p>
 * <p>The ScrollManager configs will be used as the defaults for any scroll container registered with it,
 * but you can also override most of the configs per scroll container by adding a 
 * <tt>ddScrollConfig</tt> object to the target element that contains these properties: {@link #hthresh},
 * {@link #vthresh}, {@link #increment} and {@link #frequency}.  Example usage:
 * <pre><code>
var el = Ext.get('scroll-ct');
el.ddScrollConfig = {
    vthresh: 50,
    hthresh: -1,
    frequency: 100,
    increment: 200
};
Ext.dd.ScrollManager.register(el);
</code></pre>
 * <b>Note: This class uses "Point Mode" and is untested in "Intersect Mode".</b>
 * @singleton
 */
Ext.dd.ScrollManager = function(){
    var ddm = Ext.dd.DragDropMgr;
    var els = {};
    var dragEl = null;
    var proc = {};
    
    var onStop = function(e){
        dragEl = null;
        clearProc();
    };
    
    var triggerRefresh = function(){
        if(ddm.dragCurrent){
             ddm.refreshCache(ddm.dragCurrent.groups);
        }
    };
    
    var doScroll = function(){
        if(ddm.dragCurrent){
            var dds = Ext.dd.ScrollManager;
            var inc = proc.el.ddScrollConfig ?
                      proc.el.ddScrollConfig.increment : dds.increment;
            if(!dds.animate){
                if(proc.el.scroll(proc.dir, inc)){
                    triggerRefresh();
                }
            }else{
                proc.el.scroll(proc.dir, inc, true, dds.animDuration, triggerRefresh);
            }
        }
    };
    
    var clearProc = function(){
        if(proc.id){
            clearInterval(proc.id);
        }
        proc.id = 0;
        proc.el = null;
        proc.dir = "";
    };
    
    var startProc = function(el, dir){
        clearProc();
        proc.el = el;
        proc.dir = dir;
        var freq = (el.ddScrollConfig && el.ddScrollConfig.frequency) ? 
                el.ddScrollConfig.frequency : Ext.dd.ScrollManager.frequency,
            group = el.ddScrollConfig ? el.ddScrollConfig.ddGroup : undefined;
        
        if(group === undefined || ddm.dragCurrent.ddGroup == group){
            proc.id = setInterval(doScroll, freq);
        }
    };
    
    var onFire = function(e, isDrop){
        if(isDrop || !ddm.dragCurrent){ return; }
        var dds = Ext.dd.ScrollManager;
        if(!dragEl || dragEl != ddm.dragCurrent){
            dragEl = ddm.dragCurrent;
            // refresh regions on drag start
            dds.refreshCache();
        }
        
        var xy = Ext.lib.Event.getXY(e);
        var pt = new Ext.lib.Point(xy[0], xy[1]);
        for(var id in els){
            var el = els[id], r = el._region;
            var c = el.ddScrollConfig ? el.ddScrollConfig : dds;
            if(r && r.contains(pt) && el.isScrollable()){
                if(r.bottom - pt.y <= c.vthresh){
                    if(proc.el != el){
                        startProc(el, "down");
                    }
                    return;
                }else if(r.right - pt.x <= c.hthresh){
                    if(proc.el != el){
                        startProc(el, "left");
                    }
                    return;
                }else if(pt.y - r.top <= c.vthresh){
                    if(proc.el != el){
                        startProc(el, "up");
                    }
                    return;
                }else if(pt.x - r.left <= c.hthresh){
                    if(proc.el != el){
                        startProc(el, "right");
                    }
                    return;
                }
            }
        }
        clearProc();
    };
    
    ddm.fireEvents = ddm.fireEvents.createSequence(onFire, ddm);
    ddm.stopDrag = ddm.stopDrag.createSequence(onStop, ddm);
    
    return {
        /**
         * Registers new overflow element(s) to auto scroll
         * @param {Mixed/Array} el The id of or the element to be scrolled or an array of either
         */
        register : function(el){
            if(Ext.isArray(el)){
                for(var i = 0, len = el.length; i < len; i++) {
                    this.register(el[i]);
                }
            }else{
                el = Ext.get(el);
                els[el.id] = el;
            }
        },
        
        /**
         * Unregisters overflow element(s) so they are no longer scrolled
         * @param {Mixed/Array} el The id of or the element to be removed or an array of either
         */
        unregister : function(el){
            if(Ext.isArray(el)){
                for(var i = 0, len = el.length; i < len; i++) {
                    this.unregister(el[i]);
                }
            }else{
                el = Ext.get(el);
                delete els[el.id];
            }
        },
        
        /**
         * The number of pixels from the top or bottom edge of a container the pointer needs to be to
         * trigger scrolling (defaults to 25)
         * @type Number
         */
        vthresh : 25,
        /**
         * The number of pixels from the right or left edge of a container the pointer needs to be to
         * trigger scrolling (defaults to 25)
         * @type Number
         */
        hthresh : 25,

        /**
         * The number of pixels to scroll in each scroll increment (defaults to 50)
         * @type Number
         */
        increment : 100,
        
        /**
         * The frequency of scrolls in milliseconds (defaults to 500)
         * @type Number
         */
        frequency : 500,
        
        /**
         * True to animate the scroll (defaults to true)
         * @type Boolean
         */
        animate: true,
        
        /**
         * The animation duration in seconds - 
         * MUST BE less than Ext.dd.ScrollManager.frequency! (defaults to .4)
         * @type Number
         */
        animDuration: .4,
        
        /**
         * Manually trigger a cache refresh.
         */
        refreshCache : function(){
            for(var id in els){
                if(typeof els[id] == 'object'){ // for people extending the object prototype
                    els[id]._region = els[id].getRegion();
                }
            }
        }
    };
}();/**
 * @class Ext.calendar.StatusProxy
 * A specialized drag proxy that supports a drop status icon, {@link Ext.Layer} styles and auto-repair. It also
 * contains a calendar-specific drag status message containing details about the dragged event's target drop date range.  
 * This is the default drag proxy used by all calendar views.
 * @constructor
 * @param {Object} config
 */
Ext.calendar.StatusProxy = function(config){
    Ext.apply(this, config);
    this.id = this.id || Ext.id();
    this.el = new Ext.Layer({
        dh: {
            id: this.id, cls: 'ext-dd-drag-proxy x-dd-drag-proxy '+this.dropNotAllowed, cn: [
                {cls: 'x-dd-drop-icon'},
                {cls: 'ext-dd-ghost-ct', cn:[
                    {cls: 'x-dd-drag-ghost'},
                    {cls: 'ext-dd-msg'}
                ]}
            ]
        }, 
        shadow: !config || config.shadow !== false
    });
    this.ghost = Ext.get(this.el.dom.childNodes[1].childNodes[0]);
    this.message = Ext.get(this.el.dom.childNodes[1].childNodes[1]);
    this.dropStatus = this.dropNotAllowed;
};

Ext.extend(Ext.calendar.StatusProxy, Ext.dd.StatusProxy, {
    /**
     * @cfg {String} moveEventCls
     * The CSS class to apply to the status element when an event is being dragged (defaults to 'ext-cal-dd-move').
     */
    moveEventCls : 'ext-cal-dd-move',
    /**
     * @cfg {String} addEventCls
     * The CSS class to apply to the status element when drop is not allowed (defaults to 'ext-cal-dd-add').
     */
    addEventCls : 'ext-cal-dd-add',

    // inherit docs
    update : function(html){
        if(typeof html == 'string'){
            this.ghost.update(html);
        }else{
            this.ghost.update('');
            html.style.margin = '0';
            this.ghost.dom.appendChild(html);
        }
        var el = this.ghost.dom.firstChild;
        if(el){
            Ext.fly(el).setStyle('float', 'none').setHeight('auto');
            Ext.getDom(el).id += '-ddproxy';
        }
    },
    
    /**
     * Update the calendar-specific drag status message without altering the ghost element.
     * @param {String} msg The new status message
     */
    updateMsg : function(msg){
        this.message.update(msg);
    }
});Ext.calendar.DragZone = Ext.extend(Ext.dd.DragZone, {
    ddGroup : 'CalendarDD',
    eventSelector : '.ext-cal-evt',
    
    constructor : function(el, config){
        if(!Ext.calendar._statusProxyInstance){
            Ext.calendar._statusProxyInstance = new Ext.calendar.StatusProxy();
        }
        this.proxy = Ext.calendar._statusProxyInstance;
        Ext.calendar.DragZone.superclass.constructor.call(this, el, config);
    },
    
    getDragData : function(e){
        // Check whether we are dragging on an event first
        var t = e.getTarget(this.eventSelector, 3);
        if(t){
            var rec = this.view.getEventRecordFromEl(t);
            return {
                type: 'eventdrag',
                ddel: t,
                eventStart: rec.data.StartDate,
                eventEnd: rec.data.EndDate,
                proxy: this.proxy
            };
        }
        
        // If not dragging an event then we are dragging on 
        // the calendar to add a new event
        t = this.view.getDayAt(e.getPageX(), e.getPageY());
        if(t.el){
            return {
                type: 'caldrag',
                start: t.date,
                proxy: this.proxy
            };
        }
        return null;
    },
    
    onInitDrag : function(x, y){
        if(this.dragData.ddel){
            var ghost = this.dragData.ddel.cloneNode(true),
                child = Ext.fly(ghost).child('dl');
            
            Ext.fly(ghost).setWidth('auto');
            
            if(child){
                // for IE/Opera
                child.setHeight('auto');
            }
            this.proxy.update(ghost);
            this.onStartDrag(x, y);
        }
        else if(this.dragData.start){
            this.onStartDrag(x, y);
        }
        this.view.onInitDrag();
        return true;
    },
    
    afterRepair : function(){
        if(Ext.enableFx && this.dragData.ddel){
            Ext.Element.fly(this.dragData.ddel).highlight(this.hlColor || 'c3daf9');
        }
        this.dragging = false;
    },
    
    getRepairXY : function(e){
        if(this.dragData.ddel){
            return Ext.Element.fly(this.dragData.ddel).getXY();
        }
    },
    
    afterInvalidDrop : function(e, id){
        Ext.select('.ext-dd-shim').hide();
    }
});


Ext.calendar.DropZone = Ext.extend(Ext.dd.DropZone, {
    ddGroup : 'CalendarDD',
    eventSelector : '.ext-cal-evt',
    
    // private
    shims : [],
    
    getTargetFromEvent : function(e){
        var y = e.getPageY(),
            d = this.view.getDayAt(e.getPageX(), y);
        
        if(d.el){
            return {
                overDate: d.date,
                el: d.el,
                top: y
            };
        }
        return null;
    },
    
    onNodeOver : function(n, dd, e, data){
        var D = Ext.calendar.Date,
            start = data.type == 'eventdrag' ? n.overDate : D.min(data.start, n.overDate),
            end = data.type == 'eventdrag' ? n.overDate.add(Date.DAY, D.diffDays(data.eventStart, data.eventEnd)) : 
                D.max(data.start, n.overDate);
        
        if(!this.dragStartDate || !this.dragEndDate || (D.diffDays(start, this.dragStartDate) != 0) || (D.diffDays(end, this.dragEndDate) != 0)){
            this.dragStartDate = start;
            this.dragEndDate = end.clearTime().add(Date.DAY, 1).add(Date.MILLI, -1);
            this.shim(start, end);
            
            var range = start.format('n/j');
            if(D.diffDays(start, end) > 0){
                range += '-'+end.format('n/j');
            }
            var msg = String.format(data.type == 'eventdrag' ? this.moveText : this.createText, range);
            data.proxy.updateMsg(msg);
        }
        return this.dropAllowed;
    },
    
    shim : function(start, end){
        this.currWeek = -1;
        var dt = start.clone(),
            i = 0, shim, box,
            cnt = Ext.calendar.Date.diffDays(dt, end)+1
        
        Ext.each(this.shims, function(shim){
            if(shim){
                shim.isActive = false;
            }
        });
        
        while(i++ < cnt){
            var dayEl = this.view.getDayEl(dt);
            
            // if the date is not in the current view ignore it (this
            // can happen when an event is dragged to the end of the
            // month so that it ends outside the view)
            if(dayEl){
                var wk = this.view.getWeekIndex(dt),
                    shim = this.shims[wk];
            
                if(!shim){
                    shim = this.createShim();
                    this.shims[wk] = shim;
                }
                if(wk != this.currWeek){
                    shim.boxInfo = dayEl.getBox();
                    this.currWeek = wk;
                }
                else{
                    box = dayEl.getBox();
                    shim.boxInfo.right = box.right;
                    shim.boxInfo.width = box.right - shim.boxInfo.x;
                }
                shim.isActive = true;
            }
            dt = dt.add(Date.DAY, 1);
        }
        
        Ext.each(this.shims, function(shim){
            if(shim){
                if(shim.isActive){
                    shim.show();
                    shim.setBox(shim.boxInfo);
                }
                else if(shim.isVisible()){
                    shim.hide();
                }
            }
        });
    },
    
    createShim : function(){
        if(!this.shimCt){
            this.shimCt = Ext.get('ext-dd-shim-ct');
            if(!this.shimCt){
                this.shimCt = document.createElement('div');
                this.shimCt.id = 'ext-dd-shim-ct';
                Ext.getBody().appendChild(this.shimCt);
            }
        }
        var el = document.createElement('div');
        el.className = 'ext-dd-shim';
        this.shimCt.appendChild(el);
        
        return new Ext.Layer({
            shadow:false, 
            useDisplay:true, 
            constrain:false
        }, el);
    },
    
    clearShims : function(){
        Ext.each(this.shims, function(shim){
            if(shim){
                shim.hide();
            }
        });
    },
    
    onContainerOver : function(dd, e, data){
        return this.dropAllowed;
    },
    
    onCalendarDragComplete : function(){
        delete this.dragStartDate;
        delete this.dragEndDate;
        this.clearShims();
    },
    
    onNodeDrop : function(n, dd, e, data){
        if(n && data){
            if(data.type == 'eventdrag'){
                var rec = this.view.getEventRecordFromEl(data.ddel),
                    dt = Ext.calendar.Date.copyTime(rec.data.StartDate, n.overDate);
                    
                this.view.onEventDrop(rec, dt);
                this.onCalendarDragComplete();
                return true;
            }
            if(data.type == 'caldrag'){
                this.view.onCalendarEndDrag(this.dragStartDate, this.dragEndDate, 
                    this.onCalendarDragComplete.createDelegate(this));
                //shims are NOT cleared here -- they stay visible until the handling
                //code calls the onCalendarDragComplete callback which hides them.
                return true;
            }
        }
        this.onCalendarDragComplete();
        return false;
    },
    
    onContainerDrop : function(dd, e, data){
        this.onCalendarDragComplete();
        return false;
    },
    
    destroy: function(){
        Ext.calendar.DropZone.superclass.destroy.call(this);
        Ext.destroy(this.shimCt);
    }
});


Ext.calendar.DayViewDragZone = Ext.extend(Ext.calendar.DragZone, {
    ddGroup : 'DayViewDD',
    resizeSelector : '.ext-evt-rsz',
    
    getDragData : function(e){
        var t = e.getTarget(this.resizeSelector, 2, true);
        if(t){
            var p = t.parent(this.eventSelector), 
                rec = this.view.getEventRecordFromEl(p);
            
            return {
                type: 'eventresize',
                ddel: p.dom,
                eventStart: rec.data.StartDate,
                eventEnd: rec.data.EndDate,
                proxy: this.proxy
            };
        }
        var t = e.getTarget(this.eventSelector, 3);
        if(t){
            var rec = this.view.getEventRecordFromEl(t);
            return {
                type: 'eventdrag',
                ddel: t,
                eventStart: rec.data.StartDate,
                eventEnd: rec.data.EndDate,
                proxy: this.proxy
            };
        }
        return null;
    }
});


Ext.calendar.DayViewDropZone = Ext.extend(Ext.calendar.DropZone, {
    ddGroup : 'DayViewDD',
    
    onNodeOver : function(n, dd, e, data){
        var dt, text = this.createText,
            evtEl = Ext.get(data.ddel),
            dayCol = evtEl.parent().parent(),
            box = evtEl.getBox();
        
        box.width = dayCol.getWidth();
        
        if(data.type == 'eventdrag'){
            if(this.dragOffset === undefined){
                this.dragOffset = n.top-box.y;
            }
            var day = this.view.getDayAt(e.getPageX(), e.getPageY()-this.dragOffset);
            dt = day.date.format('n/j g:ia');
            box.x = n.el.getLeft();
            box.y = n.top-this.dragOffset;
            this.shim(n.overDate, box);
            text = this.moveText;
        }
        if(data.type == 'eventresize'){
            if(!this.resizeDt){
                this.resizeDt = n.overDate;
            }
            box.x = dayCol.getLeft();
            box.height = Math.abs(e.xy[1] - box.y);
            box.y = Math.min(e.xy[1], box.y);
            this.shim(this.resizeDt, box);
            
            var curr = Ext.calendar.Date.copyTime(n.overDate, this.resizeDt),
                start = Ext.calendar.Date.min(data.eventStart, curr),
                end = Ext.calendar.Date.max(data.eventStart, curr);
                
            data.resizeDates = {
                StartDate: start,
                EndDate: end
            }
            dt = start.format('g:ia-') + end.format('g:ia');
            text = this.resizeText;
        }
        
        data.proxy.updateMsg(String.format(text, dt));
        return this.dropAllowed;
    },
    
    shim : function(dt, box){
        Ext.each(this.shims, function(shim){
            if(shim){
                shim.isActive = false;
                shim.hide();
            }
        });
        
        var shim = this.shims[0];
        if(!shim){
            shim = this.createShim();
            this.shims[0] = shim;
        }
        
        shim.isActive = true;
        shim.show();
        shim.setBox(box);
    },
    
    onNodeDrop : function(n, dd, e, data){
        if(n && data){
            var rec = this.view.getEventRecordFromEl(data.ddel);
            
            if(data.type == 'eventdrag'){
                var day = this.view.getDayAt(e.getPageX(), e.getPageY()-this.dragOffset);
                this.view.onEventDrop(rec, day.date);
                this.onCalendarDragComplete();
                delete this.dragOffset;
                return true;
            }
            if(data.type == 'eventresize'){
                this.view.onEventResize(rec, data.resizeDates);
                this.onCalendarDragComplete();
                delete this.resizeDt;
                return true;
            }
        }
        this.onCalendarDragComplete();
        return false;
    }
});
/**
 * @class Ext.calendar.EventRecord
 * <p>This is the {@link Ext.data.Record Record} specification for calendar event data used by the
 * {@link Ext.calendar.CalendarPanel CalendarPanel}'s underlying store. It can be overridden as 
 * necessary to customize the fields supported by events, although the existing column names should
 * not be altered. If your model fields are named differently you should update the <b>mapping</b>
 * configs accordingly.</p>
 * <p>The only required fields when creating a new event record instance are StartDate and
 * EndDate.  All other fields are either optional are will be defaulted if blank.</p>
 * <p>Here is a basic example for how to create a new record of this type:<pre><code>
rec = new Ext.calendar.EventRecord({
    StartDate: '2101-01-12 12:00:00',
    EndDate: '2101-01-12 13:30:00',
    Title: 'My cool event',
    Notes: 'Some notes'
});
</code></pre>
 */
Ext.calendar.EventRecord = Ext.data.Record.create([
    {name:'EventId', mapping: 'id', type: 'int'},
    {name:'CalendarId', mapping: 'cid', type: 'int'},
    {name:'Title', mapping: 'title', type: 'string'},
    {name:'StartDate', mapping: 'start', type: 'date', dateFormat: 'c'},
    {name:'EndDate', mapping: 'end', type: 'date', dateFormat: 'c'},
    {name:'Location', mapping: 'loc', type: 'string'},
    {name:'Notes', mapping: 'notes', type: 'string'},
    {name:'Url', mapping: 'url', type: 'string'},
    {name:'IsAllDay', mapping: 'ad', type: 'boolean'},
    {name:'Reminder', mapping: 'rem', type: 'string'},
    {name:'IsNew', mapping: 'n', type: 'boolean'}
]);Ext.calendar.MonthDayDetailView = Ext.extend(Ext.BoxComponent, {
    initComponent : function(){
        Ext.calendar.CalendarView.superclass.initComponent.call(this);
		
        this.addEvents({
            eventsrendered: true
		});
		
        if(!this.el){
            this.el = document.createElement('div');
        }
    },
	
    afterRender : function(){
        this.tpl = this.getTemplate();
		
        Ext.calendar.MonthDayDetailView.superclass.afterRender.call(this);
		
        this.el.on({
            'click': this.view.onClick,
			'mouseover': this.view.onMouseOver,
			'mouseout': this.view.onMouseOut,
            scope: this.view
        });
    },
	
    getTemplate : function(){
        if(!this.tpl){
	        this.tpl = new Ext.XTemplate(
                '<div class="ext-cal-mdv x-unselectable">',
	                '<table class="ext-cal-mvd-tbl" cellpadding="0" cellspacing="0">',
						'<tbody>',
							'<tpl for=".">',
		                        '<tr><td class="ext-cal-ev">{markup}</td></tr>',
							'</tpl>',
	                    '</tbody>',
	                '</table>',
                '</div>'
	        );
        }
        this.tpl.compile();
        return this.tpl;
    },
	
	update : function(dt){
		this.date = dt;
		this.refresh();
	},
	
    refresh : function(){
		if(!this.rendered){
			return;
		}
        var eventTpl = this.view.getEventTemplate(),
		
			templateData = [];
			
			evts = this.store.queryBy(function(rec){
				var thisDt = this.date.clearTime(true).getTime(),
					recStart = rec.data.StartDate.clearTime(true).getTime(),
	            	startsOnDate = (thisDt == recStart),
					spansDate = false;
				
				if(!startsOnDate){
					var recEnd = rec.data.EndDate.clearTime(true).getTime();
	            	spansDate = recStart < thisDt && recEnd >= thisDt;
				}
	            return startsOnDate || spansDate;
	        }, this);
		
		evts.each(function(evt){
            var item = evt.data;
			item._renderAsAllDay = item.IsAllDay || Ext.calendar.Date.diffDays(item.StartDate, item.EndDate) > 0;
            item.spanLeft = Ext.calendar.Date.diffDays(item.StartDate, this.date) > 0;
            item.spanRight = Ext.calendar.Date.diffDays(this.date, item.EndDate) > 0;
            item.spanCls = (item.spanLeft ? (item.spanRight ? 'ext-cal-ev-spanboth' : 
                'ext-cal-ev-spanleft') : (item.spanRight ? 'ext-cal-ev-spanright' : ''));

			templateData.push({markup: eventTpl.apply(this.getTemplateEventData(item))});
		}, this);
		
		this.tpl.overwrite(this.el, templateData);
		this.fireEvent('eventsrendered', this, this.date, evts.getCount());
    },
	
	getTemplateEventData : function(evt){
		var data = this.view.getTemplateEventData(evt);
		data._elId = 'dtl-'+data._elId;
		return data;
	}
});

Ext.reg('monthdaydetailview', Ext.calendar.MonthDayDetailView);
Ext.calendar.CalendarPicker = Ext.extend(Ext.form.ComboBox, {
    // default configs:
    fieldLabel: 'Calendar',
    valueField: 'CalendarId',
    displayField: 'Title',
    triggerAction: 'all',
    mode: 'local',
    forceSelection: true,
    width: 200,
    
    initComponent: function(){
        Ext.calendar.CalendarPicker.superclass.initComponent.call(this);
        this.tpl = this.tpl ||
              '<tpl for="."><div class="x-combo-list-item ext-color-{' + this.valueField +
              '}"><div class="ext-cal-picker-icon">&nbsp;</div>{' + this.displayField + '}</div></tpl>';
    },
    
    afterRender: function(){
        Ext.calendar.CalendarPicker.superclass.afterRender.call(this);
        
        this.wrap = this.el.up('.x-form-field-wrap');
        this.wrap.addClass('ext-calendar-picker');
        
        this.icon = Ext.DomHelper.append(this.wrap, {
            tag: 'div', cls: 'ext-cal-picker-icon ext-cal-picker-mainicon'
        });
    },

    setValue: function(value) {
        this.wrap.removeClass('ext-color-'+this.getValue());
        if(!value && this.store !== undefined){
            // always default to a valid calendar
            value = this.store.getAt(0).data.CalendarId;
        }
        Ext.calendar.CalendarPicker.superclass.setValue.call(this, value);
        this.wrap.addClass('ext-color-'+value);
    }
});

Ext.reg('calendarpicker', Ext.calendar.CalendarPicker);
Ext.calendar.WeekEventRenderer = function(){
    
    var getEventRow = function(id, week, index){
        var indexOffset = 1; //skip row with date #'s
        var evtRow, wkRow = Ext.get(id+'-wk-'+week);
        if(wkRow){
            var table = wkRow.child('.ext-cal-evt-tbl', true);
            evtRow = table.tBodies[0].childNodes[index+indexOffset];
            if(!evtRow){
                evtRow = Ext.DomHelper.append(table.tBodies[0], '<tr></tr>');
            }
        }
        return Ext.get(evtRow);
    };
    
    return {
        render: function(o){
            var w = 0, grid = o.eventGrid, 
                dt = o.viewStart.clone(),
                eventTpl = o.tpl,
                max = o.maxEventsPerDay != undefined ? o.maxEventsPerDay : 999,
                weekCount = o.weekCount < 1 ? 6 : o.weekCount,
                dayCount = o.weekCount == 1 ? o.dayCount : 7;
            
            for(; w < weekCount; w++){
                if(!grid[w] || grid[w].length == 0){
                    // no events or span cells for the entire week
                    if(weekCount == 1){
                        row = getEventRow(o.id, w, 0);
                        var cellCfg = {
                            tag: 'td',
                            cls: 'ext-cal-ev',
                            id: o.id+'-empty-0-day-'+dt.format('Ymd'),
                            html: '&nbsp;'
                        }
                        if(dayCount > 1){
                            cellCfg.colspan = dayCount;
                        }
                        Ext.DomHelper.append(row, cellCfg);
                    }
                    dt = dt.add(Date.DAY, 7);
                }else{
                    var row, d = 0, wk = grid[w];
                    var startOfWeek = dt.clone();
                    var endOfWeek = startOfWeek.add(Date.DAY, dayCount).add(Date.MILLI, -1);
                    
                    for(; d < dayCount; d++){
                        if(wk[d]){
                            var ev = emptyCells = skipped = 0, 
                                day = wk[d], ct = day.length, evt;
                            
                            for(; ev < ct; ev++){
                                if(!day[ev]){
                                    emptyCells++;
                                    continue;
                                }
                                if(emptyCells > 0 && ev-emptyCells < max){
                                    row = getEventRow(o.id, w, ev-emptyCells);
                                    var cellCfg = {
                                        tag: 'td',
                                        cls: 'ext-cal-ev',
                                        id: o.id+'-empty-'+ct+'-day-'+dt.format('Ymd')
                                    }
                                    if(emptyCells > 1 && max-ev > emptyCells){
                                        cellCfg.rowspan = Math.min(emptyCells, max-ev);
                                    }
                                    Ext.DomHelper.append(row, cellCfg);
                                    emptyCells = 0;
                                }
                                
                                if(ev >= max){
                                    skipped++;
                                    continue;
                                }
                                evt = day[ev];
                                
                                if(!evt.isSpan || evt.isSpanStart){ //skip non-starting span cells
                                    var item = evt.data || evt.event.data;
                                    item._weekIndex = w;
                                    item._renderAsAllDay = item.IsAllDay || evt.isSpanStart;
                                    item.spanLeft = item.StartDate.getTime() < startOfWeek.getTime();
                                    item.spanRight = item.EndDate.getTime() > endOfWeek.getTime();
                                    item.spanCls = (item.spanLeft ? (item.spanRight ? 'ext-cal-ev-spanboth' : 
                                        'ext-cal-ev-spanleft') : (item.spanRight ? 'ext-cal-ev-spanright' : ''));
                                            
                                    var row = getEventRow(o.id, w, ev),
                                        cellCfg = {
                                            tag: 'td',
                                            cls: 'ext-cal-ev',
                                            cn : eventTpl.apply(o.templateDataFn(item))
                                        },
                                        diff = Ext.calendar.Date.diffDays(dt, item.EndDate) + 1,
                                        cspan = Math.min(diff, dayCount-d);
                                        
                                    if(cspan > 1){
                                        cellCfg.colspan = cspan;
                                    }
                                    Ext.DomHelper.append(row, cellCfg);
                                }
                            }
                            if(ev > max){
                                row = getEventRow(o.id, w, max);
                                Ext.DomHelper.append(row, {
                                    tag: 'td',
                                    cls: 'ext-cal-ev-more',
                                    id: 'ext-cal-ev-more-'+dt.format('Ymd'),
                                    cn: {
                                        tag: 'a',
                                        html: '+'+skipped+' more...'
                                    }
                                });
                            }
                            if(ct < o.evtMaxCount[w]){
                                row = getEventRow(o.id, w, ct);
                                if(row){
                                    var cellCfg = {
                                        tag: 'td',
                                        cls: 'ext-cal-ev',
                                        id: o.id+'-empty-'+(ct+1)+'-day-'+dt.format('Ymd')
                                    };
                                    var rowspan = o.evtMaxCount[w] - ct;
                                    if(rowspan > 1){
                                        cellCfg.rowspan = rowspan;
                                    }
                                    Ext.DomHelper.append(row, cellCfg);
                                }
                            }
                        }else{
                            row = getEventRow(o.id, w, 0);
                            if(row){
                                var cellCfg = {
                                    tag: 'td',
                                    cls: 'ext-cal-ev',
                                    id: o.id+'-empty-day-'+dt.format('Ymd')
                                };
                                if(o.evtMaxCount[w] > 1){
                                    cellCfg.rowSpan = o.evtMaxCount[w];
                                }
                                Ext.DomHelper.append(row, cellCfg);
                            }
                        }
                        dt = dt.add(Date.DAY, 1);
                    }
                }
            }
        }
    };
}();

Ext.calendar.CalendarView = Ext.extend(Ext.BoxComponent, {
    
	//public configs:
    startDay : 0, // 0=Sunday
    spansHavePriority: false,
	trackMouseOver: true,
	enableFx: true,
	enableAddFx: true,
	enableUpdateFx: true,
	enableRemoveFx: true,
    enableDD: true,
	ddCreateEventText: 'Create event for {0}',
	ddMoveEventText: 'Move event to {0}',
	monitorResize: true,
    weekCount: 1,
    dayCount: 1,
    eventSelector : '.ext-cal-evt',
    eventOverClass: 'ext-evt-over',
    
    //private properties -- do not override:
	eventElIdDelimiter: '-evt-',
    dayElIdDelimiter: '-day-',
    startDate : null,
    viewStart : null,
    viewEnd : null,
    
    initComponent : function(){
        this.setStartDate(this.startDate || new Date());

        Ext.calendar.CalendarView.superclass.initComponent.call(this);
		
        this.addEvents({
            eventsrendered: true,
            eventclick: true,
            eventover: true,
            eventout: true,
            datechange: true,
			rangeselect: true,
			eventmove: true,
			eventdelete: true,
            initdrag: true
        });
    },

    afterRender : function(){
        Ext.calendar.CalendarView.superclass.afterRender.call(this);

        this.renderTemplate();
        
        if(this.store){
            this.setStore(this.store, true);
        }

        this.el.on({
            'mouseover': this.onMouseOver,
            'mouseout': this.onMouseOut,
            'click': this.onClick,
			'resize': this.onResize,
            scope: this
        });
		
		Ext.fly(this.el).unselectable();
        
        if(this.enableDD && this.initDD){
			this.initDD();
        }
        
        this.on('eventsrendered', this.forceSize);
        this.forceSize.defer(100, this);
    
    },
    
    // private
    forceSize: function(){
        if(this.el && this.el.child){
            var hd = this.el.child('.ext-cal-hd-ct'),
                bd = this.el.child('.ext-cal-body-ct');
                
            if(bd==null || hd==null) return;
                
            var headerHeight = hd.getHeight(),
                sz = this.el.parent().getSize();
                   
            bd.setHeight(sz.height-headerHeight);
        }
    },

    refresh : function(){
        this.prepareData();
        this.renderTemplate();
        this.renderItems();
    },
    
    getWeekCount : function(){
        var days = Ext.calendar.Date.diffDays(this.viewStart, this.viewEnd);
        return Math.ceil(days / this.dayCount);
    },
    
    prepareData : function(){
        var lastInMonth = this.startDate.getLastDateOfMonth(),
            w = 0, row = 0,
            dt = this.viewStart.clone(),
            weeks = this.weekCount < 1 ? 6 : this.weekCount;
        
        this.eventGrid = [[]];
        this.allDayGrid = [[]];
        this.evtMaxCount = [];
        
        var evtsInView = this.store.queryBy(function(rec){
            return this.isEventVisible(rec.data);
        }, this);
        
        for(; w < weeks; w++){
            this.evtMaxCount[w] = 0;
            if(this.weekCount == -1 && dt > lastInMonth){
                //current week is fully in next month so skip
                break;
            }
            this.eventGrid[w] = this.eventGrid[w] || [];
            this.allDayGrid[w] = this.allDayGrid[w] || [];
            
            for(d = 0; d < this.dayCount; d++){
                if(evtsInView.getCount() > 0){
                    var evts = evtsInView.filterBy(function(rec){
                        var startsOnDate = (dt.getTime() == rec.data.StartDate.clearTime(true).getTime());
                        var spansFromPrevView = (w == 0 && d == 0 && (dt > rec.data.StartDate));
                        return startsOnDate || spansFromPrevView;
                    }, this);
                    
                    this.sortEventRecordsForDay(evts);
                    this.prepareEventGrid(evts, w, d);
                }
                dt = dt.add(Date.DAY, 1);
            }
        }
        this.currentWeekCount = w;
    },
    
    prepareEventGrid : function(evts, w, d){
        var row = 0,
            dt = this.viewStart.clone(),
            max = this.maxEventsPerDay ? this.maxEventsPerDay : 999;
        
        evts.each(function(evt){
            var days = Ext.calendar.Date.diffDays(
                Ext.calendar.Date.max(this.viewStart, evt.data.StartDate),
                Ext.calendar.Date.min(this.viewEnd, evt.data.EndDate)) + 1;
            
            if(days > 1 || Ext.calendar.Date.diffDays(evt.data.StartDate, evt.data.EndDate) > 1){
                this.prepareEventGridSpans(evt, this.eventGrid, w, d, days);
                this.prepareEventGridSpans(evt, this.allDayGrid, w, d, days, true);
            }else{
                row = this.findEmptyRowIndex(w,d);
                this.eventGrid[w][d] = this.eventGrid[w][d] || [];
                this.eventGrid[w][d][row] = evt;
                
                if(evt.data.IsAllDay){
                    row = this.findEmptyRowIndex(w,d, true);
                    this.allDayGrid[w][d] = this.allDayGrid[w][d] || [];
                    this.allDayGrid[w][d][row] = evt;
                }
            }
            
            if(this.evtMaxCount[w] < this.eventGrid[w][d].length){
                this.evtMaxCount[w] = Math.min(max+1, this.eventGrid[w][d].length);
            }
            return true;
        }, this);
    },
    
    prepareEventGridSpans : function(evt, grid, w, d, days, allday){
        // this event spans multiple days/weeks, so we have to preprocess
        // the events and store special span events as placeholders so that
        // the render routine can build the necessary TD spans correctly.
        var w1 = w, d1 = d, 
            row = this.findEmptyRowIndex(w,d,allday),
            dt = this.viewStart.clone();
        
        var start = {
            event: evt,
            isSpan: true,
            isSpanStart: true,
            spanLeft: false,
            spanRight: (d == 6)
        };
        grid[w][d] = grid[w][d] || [];
        grid[w][d][row] = start;
        
        while(--days){
            dt = dt.add(Date.DAY, 1);
            if(dt > this.viewEnd){
                break;
            }
            if(++d1>6){
                // reset counters to the next week
                d1 = 0; w1++;
                row = this.findEmptyRowIndex(w1,0);
            }
            grid[w1] = grid[w1] || [];
            grid[w1][d1] = grid[w1][d1] || [];
            
            grid[w1][d1][row] = {
                event: evt,
                isSpan: true,
                isSpanStart: (d1 == 0),
                spanLeft: (w1 > w) && (d1 % 7 == 0),
                spanRight: (d1 == 6) && (days > 1)
            };
        }
    },
    
    findEmptyRowIndex : function(w, d, allday){
        var grid = allday ? this.allDayGrid : this.eventGrid,
            day = grid[w] ? grid[w][d] || [] : [],
            i = 0, ln = day.length;
            
        for(; i < ln; i++){
            if(day[i] == null){
                return i;
            }
        }
        return ln;
    },
    
    renderTemplate : function(){
        if(this.tpl){
            this.tpl.overwrite(this.el, this.getParams());
            this.lastRenderStart = this.viewStart.clone();
            this.lastRenderEnd = this.viewEnd.clone();
        }
    },
    
	disableStoreEvents : function(){
		this.monitorStoreEvents = false;
	},
	
	enableStoreEvents : function(refresh){
		this.monitorStoreEvents = true;
		if(refresh === true){
			this.refresh();
		}
	},
	
	onResize : function(){
		this.refresh();
	},
	
	onInitDrag : function(){
        this.fireEvent('initdrag', this);
    },
	
	onEventDrop : function(rec, dt){
        if(Ext.calendar.Date.compare(rec.data.StartDate, dt) === 0){
            // no changes
            return;
        }
        var diff = dt.getTime() - rec.data.StartDate.getTime();
        rec.set('StartDate', dt);
        rec.set('EndDate', rec.data.EndDate.add(Date.MILLI, diff));
		
		this.fireEvent('eventmove', this, rec);
	},

	onCalendarEndDrag : function(start, end, onComplete){
		this.fireEvent('rangeselect', this, {StartDate:start, EndDate:end}, onComplete);
	},
	
    onUpdate : function(ds, rec, operation){
		if(this.monitorStoreEvents === false) {
			return;
		}
        if(operation == Ext.data.Record.COMMIT){
            this.refresh();
			if(this.enableFx && this.enableUpdateFx){
				this.doUpdateFx(this.getEventEls(rec.data.EventId), {
                    scope: this
                });
			}
        }
    },

	doUpdateFx : function(els, o){
		this.highlightEvent(els, null, o);
	},
	
    onAdd : function(ds, records, index){
		if(this.monitorStoreEvents === false) {
			return;
		}
		var rec = records[0];
		this.tempEventId = rec.id;
		this.refresh();
		
		if(this.enableFx && this.enableAddFx){
			this.doAddFx(this.getEventEls(rec.data.EventId), {
                scope: this
            });
		};
    },
	
	doAddFx : function(els, o){
		els.fadeIn(Ext.apply(o, {duration:2}));
	},
	
    onRemove : function(ds, rec){
		if(this.monitorStoreEvents === false) {
			return;
		}
		if(this.enableFx && this.enableRemoveFx){
			this.doRemoveFx(this.getEventEls(rec.data.EventId), {
	            remove: true,
	            scope: this,
				callback: this.refresh
			});
		}
		else{
			this.getEventEls(rec.data.EventId).remove();
            this.refresh();
		}
    },
	
	doRemoveFx : function(els, o){
        els.fadeOut(o);
	},
	
	/**
	 * Visually highlights an event using {@link Ext.Fx#highlight} config options.
	 * If {@link #highlightEventActions} is false this method will have no effect.
	 * @param {Ext.CompositeElement} els The element(s) to highlight
	 * @param {Object} color (optional) The highlight color. Should be a 6 char hex 
	 * color without the leading # (defaults to yellow: 'ffff9c')
	 * @param {Object} o (optional) Object literal with any of the {@link Ext.Fx} config 
	 * options. See {@link Ext.Fx#highlight} for usage examples.
	 */
	highlightEvent : function(els, color, o) {
		if(this.enableFx){
			var c;
			!(Ext.isIE || Ext.isOpera) ? 
				els.highlight(color, o) :
				// Fun IE/Opera handling:
				els.each(function(el){
					el.highlight(color, Ext.applyIf({attr:'color'}, o));
					if(c = el.child('.ext-cal-evm')) {
						c.highlight(color, o);
					}
				}, this);
		}
	},
	
	/**
	 * Retrieve an Event object's id from its corresponding node in the DOM.
	 * @param {String/Element/HTMLElement} el An {@link Ext.Element}, DOM node or id
	 */
	getEventIdFromEl : function(el){
		el = Ext.get(el);
		var id = el.id.split(this.eventElIdDelimiter)[1];
        if(id.indexOf('-') > -1){
            //This id has the index of the week it is rendered in as the suffix.
            //This allows events that span across weeks to still have reproducibly-unique DOM ids.
            id = id.split('-')[0];
        }
        return id;
	},
	
	// private
	getEventId : function(eventId){
		if(eventId === undefined && this.tempEventId){
			eventId = this.tempEventId;
		}
		return eventId;
	},
	
	/**
	 * 
	 * @param {String} eventId
	 * @param {Boolean} forSelect
	 * @return {String} The selector class
	 */
	getEventSelectorCls : function(eventId, forSelect){
		var prefix = forSelect ? '.' : '';
		return prefix + this.id + this.eventElIdDelimiter + this.getEventId(eventId);
	},

	/**
	 * 
	 * @param {String} eventId
	 * @return {Ext.CompositeElement} The matching CompositeElement of nodes
	 * that comprise the rendered event.  Any event that spans across a view 
	 * boundary will contain more than one internal Element.
	 */
	getEventEls : function(eventId){
		var els = Ext.select(this.getEventSelectorCls(this.getEventId(eventId), true), false, this.el.id);
		return new Ext.CompositeElement(els);
	},
    
    isToday : function(){
        var today = new Date().clearTime().getTime();
        return this.viewStart.getTime() <= today && this.viewEnd.getTime() >= today;
    },

    onDataChanged : function(store){
        this.refresh();
    },

//    refreshItem : function(index){
//        this.onUpdate(this.store,
//                typeof index == 'number' ? this.store.getAt(index) : index);
//    },

    isEventVisible : function(evt){
        var start = this.viewStart.getTime(),
            end = this.viewEnd.getTime(),
            evStart = (evt.data ? evt.data.StartDate : evt.StartDate).getTime(),
            evEnd = (evt.data ? evt.data.EndDate : evt.EndDate).add(Date.SECOND, -1).getTime(),
            
            startsInRange = (evStart >= start && evStart <= end),
            endsInRange = (evEnd >= start && evEnd <= end),
            spansRange = (evStart < start && evEnd > end);
        
        return (startsInRange || endsInRange || spansRange);
    },
    
    isOverlapping : function(evt1, evt2){
        var ev1 = evt1.data ? evt1.data : evt1,
            ev2 = evt2.data ? evt2.data : evt2,
            start1 = ev1.StartDate.getTime(),
            end1 = ev1.EndDate.add(Date.SECOND, -1).getTime(),
            start2 = ev2.StartDate.getTime(),
            end2 = ev2.EndDate.add(Date.SECOND, -1).getTime();
            
            if(end1<start1){
                end1 = start1;
            }
            if(end2<start2){
                end2 = start2;
            }
            
            var ev1startsInEv2 = (start1 >= start2 && start1 <= end2),
            ev1EndsInEv2 = (end1 >= start2 && end1 <= end2),
            ev1SpansEv2 = (start1 < start2 && end1 > end2);
        
        return (ev1startsInEv2 || ev1EndsInEv2 || ev1SpansEv2);
    },
    
    getDayEl : function(dt){
        return Ext.get(this.getDayId(dt));
    },
    
    getDayId : function(dt){
        if(Ext.isDate(dt)){
            dt = dt.format('Ymd');
        }
        return this.id + this.dayElIdDelimiter + dt;
    },
    
    getStartDate : function(){
        return this.startDate;
    },

    setStartDate : function(start, refresh){
        this.startDate = start.clearTime();
        this.setViewBounds(start);
        this.store.load({
            params: {
                start: this.viewStart.format('m-d-Y'),
                end: this.viewEnd.format('m-d-Y')
            }
        });
        if(refresh === true){
            this.refresh();
        }
        this.fireEvent('datechange', this, this.startDate, this.viewStart, this.viewEnd);
    },
    
    // private
    setViewBounds : function(startDate){
        var start = startDate || this.startDate,
            offset = start.getDay() - this.startDay;
        
        switch(this.weekCount){
            case 0:
            case 1:
                this.viewStart = this.dayCount < 7 ? start : start.add(Date.DAY, -offset).clearTime(true);
                this.viewEnd = this.viewStart.add(Date.DAY, this.dayCount || 7).add(Date.SECOND, -1);
                return;
            
            case -1: // auto by month
                start = start.getFirstDateOfMonth();
                offset = start.getDay() - this.startDay;
                    
                this.viewStart = start.add(Date.DAY, -offset).clearTime(true);
                
                // start from current month start, not view start:
                var end = start.add(Date.MONTH, 1).add(Date.SECOND, -1);
                // fill out to the end of the week:
                this.viewEnd = end.add(Date.DAY, 6-end.getDay()); 
                return;
            
            default:
                this.viewStart = start.add(Date.DAY, -offset).clearTime(true);
                this.viewEnd = this.viewStart.add(Date.DAY, this.weekCount * 7).add(Date.SECOND, -1);
        }
    },
    
    getViewBounds : function(){
        return {
            start: this.viewStart,
            end: this.viewEnd
        }
    },
	
	/**
	 * Sort events for a single day for display in the calendar.  This sorts allday
	 * events first, then non-allday events are sorted either based on event start
	 * priority or span priority based on the value of {@link #spansHavePriority} 
	 * (defaults to event start priority).
	 * @param {MixedCollection} evts A {@link Ext.util.MixedCollection MixedCollection}  
	 * of {@link #Ext.calendar.EventRecord EventRecord} objects
	 */
	sortEventRecordsForDay: function(evts){
        if(evts.length < 2){
            return;
        }
		evts.sort('ASC', function(evtA, evtB){
			var a = evtA.data, b = evtB.data;
			
			// Always sort all day events before anything else
			if (a.IsAllDay) {
				return -1;
			}
			else if (b.IsAllDay) {
				return 1;
			}
			if (this.spansHavePriority) {
				// This logic always weights span events higher than non-span events 
				// (at the possible expense of start time order). This seems to 
				// be the approach used by Google calendar and can lead to a more
				// visually appealing layout in complex cases, but event order is
				// not guaranteed to be consistent.
				var diff = Ext.calendar.Date.diffDays;
				if (diff(a.StartDate, a.EndDate) > 0) {
					if (diff(b.StartDate, b.EndDate) > 0) {
						// Both events are multi-day
						if (a.StartDate.getTime() == b.StartDate.getTime()) {
							// If both events start at the same time, sort the one
							// that ends later (potentially longer span bar) first
							return b.EndDate.getTime() - a.EndDate.getTime();
						}
						return a.StartDate.getTime() - b.StartDate.getTime();
					}
					return -1;
				}
				else if (diff(b.StartDate, b.EndDate) > 0) {
					return 1;
				}
				return a.StartDate.getTime() - b.StartDate.getTime();
			}
			else {
				// Doing this allows span and non-span events to intermingle but
				// remain sorted sequentially by start time. This seems more proper
				// but can make for a less visually-compact layout when there are
				// many such events mixed together closely on the calendar.
				return a.StartDate.getTime() - b.StartDate.getTime();
			}
		}.createDelegate(this));
	},
    
    moveTo : function(dt, noRefresh){
        if(Ext.isDate(dt)){
            this.setStartDate(dt);
            if(noRefresh!==false){
                this.refresh();
            }
            return this.startDate;
        }
        return dt;
    },

    moveNext : function(noRefresh){
        return this.moveTo(this.viewEnd.add(Date.DAY, 1));
    },

    movePrev : function(noRefresh){
        var days = Ext.calendar.Date.diffDays(this.viewStart, this.viewEnd)+1;
        return this.moveDays(-days, noRefresh);
    },
    
    moveMonths : function(value, noRefresh){
        return this.moveTo(this.startDate.add(Date.MONTH, value), noRefresh);
    },
    
    moveWeeks : function(value, noRefresh){
        return this.moveTo(this.startDate.add(Date.DAY, value*7), noRefresh);
    },
    
    moveDays : function(value, noRefresh){
        return this.moveTo(this.startDate.add(Date.DAY, value), noRefresh);
    },
    
    moveToday : function(noRefresh){
        return this.moveTo(new Date(), noRefresh);
    },

    setStore : function(store, initial){
        if(!initial && this.store){
            this.store.un("datachanged", this.onDataChanged, this);
            this.store.un("add", this.onAdd, this);
            this.store.un("remove", this.onRemove, this);
            this.store.un("update", this.onUpdate, this);
            this.store.un("clear", this.refresh, this);
        }
        if(store){
            store.on("datachanged", this.onDataChanged, this);
            store.on("add", this.onAdd, this);
            store.on("remove", this.onRemove, this);
            store.on("update", this.onUpdate, this);
            store.on("clear", this.refresh, this);
        }
        this.store = store;
        if(store && store.getCount() > 0){
            this.refresh();
        }
    },
	
    getEventRecord : function(id){
        var idx = this.store.find('EventId', id);
        return this.store.getAt(idx);
    },
	
	getEventRecordFromEl : function(el){
		return this.getEventRecord(this.getEventIdFromEl(el));
	},
    
    getParams : function(){
        return {
            viewStart: this.viewStart,
            viewEnd: this.viewEnd,
            startDate: this.startDate,
            dayCount: this.dayCount,
            weekCount: this.weekCount,
            title: this.getTitle()
        };
    },
    
    getTitle : function(){
        return this.startDate.format('F Y');
    },
    
    /*
     * Shared click handling.  Each specific view also provides view-specific
     * click handling that calls this first.  This method returns true if it
     * can handle the click (and so the subclass should ignore it) else false.
     */
    onClick : function(e, t){
        var el = e.getTarget(this.eventSelector, 5);
        if(el){
            var id = this.getEventIdFromEl(el);
            this.fireEvent('eventclick', this, this.getEventRecord(id), el);
            return true;
        }
    },
    
    onMouseOver : function(e, t){
        if(this.trackMouseOver !== false && (this.dragZone == undefined || !this.dragZone.dragging)){
            if(!this.handleEventMouseEvent(e, t, 'over')){
                this.handleDayMouseEvent(e, t, 'over');
            }
        }
    },

    onMouseOut : function(e, t){
        if(this.trackMouseOver !== false && (this.dragZone == undefined || !this.dragZone.dragging)){
            if(!this.handleEventMouseEvent(e, t, 'out')){
                this.handleDayMouseEvent(e, t, 'out');
            }
        }
    },
    
    handleEventMouseEvent : function(e, t, type){
        var el;
        if(el = e.getTarget(this.eventSelector, 5, true)){
            var rel = Ext.get(e.getRelatedTarget());
            if(el == rel || el.contains(rel)){
                return true;
            }
            
            var evtId = this.getEventIdFromEl(el);
            
            if(this.eventOverClass != ''){
                var els = this.getEventEls(evtId);
                els[type == 'over' ? 'addClass' : 'removeClass'](this.eventOverClass);
            }
            this.fireEvent('event'+type, this, this.getEventRecord(evtId), el);
            return true;
        }
        return false;
    },
    
    getDateFromId : function(id, delim){
        var parts = id.split(delim);
        return parts[parts.length-1];
    },
    
    handleDayMouseEvent : function(e, t, type){
        if(t = e.getTarget('td', 3)){
            if(t.id && t.id.indexOf(this.dayElIdDelimiter) > -1){
                var dt = this.getDateFromId(t.id, this.dayElIdDelimiter),
                    rel = Ext.get(e.getRelatedTarget()),
                    relTD, relDate;
                
                if(rel){
                    relTD = rel.is('td') ? rel : rel.up('td', 3);
                    relDate = relTD && relTD.id ? this.getDateFromId(relTD.id, this.dayElIdDelimiter) : '';
                }
                if(!rel || dt != relDate){
                    var el = this.getDayEl(dt);
                    if(el && this.dayOverClass != ''){
                        el[type == 'over' ? 'addClass' : 'removeClass'](this.dayOverClass);
                    }
                    this.fireEvent('day'+type, this, Date.parseDate(dt, "Ymd"), el);
                }
            }
        }
    },
	
    renderItems : function(){
        throw 'This method must be implemented by a subclass';
    }
});Ext.calendar.MonthView = Ext.extend(Ext.calendar.CalendarView, {
	//public configs:
	daySelector: '.ext-cal-day',
	moreSelector : '.ext-cal-ev-more',
	showTime: true,
	showTodayText: true,
	todayText: 'Today',
    weekCount: -1, // defaults to auto by month
    dayCount: 7,
     
    //private properties -- do not override:
	moreElIdDelimiter: '-more-',

    initComponent : function(){
        Ext.calendar.MonthView.superclass.initComponent.call(this);
        this.addEvents({
            dayclick: true,
            dayover: true,
            dayout: true
        });
    },
	
	initDD : function(){
		var cfg = {
			view: this,
			createText: this.ddCreateEventText,
			moveText: this.ddMoveEventText,
            ddGroup : 'MonthViewDD'
		};
        
        this.dragZone = new Ext.calendar.DragZone(this.el, cfg);
        this.dropZone = new Ext.calendar.DropZone(this.el, cfg);
	},
    
    onDestroy : function(){
        Ext.destroy(this.ddSelector);
		Ext.destroy(this.dragZone);
		Ext.destroy(this.dropZone);
        Ext.calendar.MonthView.superclass.onDestroy.call(this);
    },

    afterRender : function(){
        if(!this.tpl){
            this.tpl = new Ext.calendar.MonthViewTemplate({
                id: this.id,
                showTodayText: this.showTodayText,
                todayText: this.todayText,
                showTime: this.showTime
            });
        }
        this.tpl.compile();
        this.addClass('ext-cal-monthview ext-cal-ct');
        
        Ext.calendar.MonthView.superclass.afterRender.call(this);
    },
	
	onResize : function(){
		if(this.monitorResize){
			this.maxEventsPerDay = this.getMaxEventsPerDay();
			this.refresh();
        }
	},
    
    //private
    initClock : function(){
        if(Ext.fly(this.id+'-clock') !== null){
            this.prevClockDay = new Date().getDay();
            if(this.clockTask){
                Ext.TaskMgr.stop(this.clockTask);
            }
            this.clockTask = Ext.TaskMgr.start({
                run: function(){ 
                    var el = Ext.fly(this.id+'-clock'),
                        t = new Date();
                        
                    if(t.getDay() == this.prevClockDay){
                        if(el){
                            el.update(t.format('g:i a'));
                        }
                    }
                    else{
                        this.prevClockDay = t.getDay();
                        this.moveTo(t);
                    }
                },
                scope: this,
                interval: 1000
            });
        }
    },

    getEventBodyMarkup : function(){
        if(!this.eventBodyMarkup){
            this.eventBodyMarkup = ['{Title}',
	            '<tpl if="_isReminder">',
	                '<i class="ext-cal-ic ext-cal-ic-rem">&nbsp;</i>',
	            '</tpl>',
	            '<tpl if="_isRecurring">',
	                '<i class="ext-cal-ic ext-cal-ic-rcr">&nbsp;</i>',
	            '</tpl>',
	            '<tpl if="spanLeft">',
	                '<i class="ext-cal-spl">&nbsp;</i>',
	            '</tpl>',
	            '<tpl if="spanRight">',
	                '<i class="ext-cal-spr">&nbsp;</i>',
	            '</tpl>'
	        ].join('');
        }
        return this.eventBodyMarkup;
    },
    
    getEventTemplate : function(){
        if(!this.eventTpl){
	        var tpl, body = this.getEventBodyMarkup();
            
	        tpl = !(Ext.isIE || Ext.isOpera) ? 
				new Ext.XTemplate(
		            '<div id="{_elId}" class="{_selectorCls} {_colorCls} {values.spanCls} ext-cal-evt ext-cal-evr">',
		                body,
		            '</div>'
		        ) 
				: new Ext.XTemplate(
		            '<tpl if="_renderAsAllDay">',
		                '<div id="{_elId}" class="{_selectorCls} {values.spanCls} {_colorCls} ext-cal-evt ext-cal-evo">',
		                    '<div class="ext-cal-evm">',
		                        '<div class="ext-cal-evi">',
		            '</tpl>',
		            '<tpl if="!_renderAsAllDay">',
		                '<div id="{_elId}" class="{_selectorCls} {_colorCls} ext-cal-evt ext-cal-evr">',
		            '</tpl>',
		            body,
		            '<tpl if="_renderAsAllDay">',
		                        '</div>',
		                    '</div>',
		            '</tpl>',
		                '</div>'
	        	);
            tpl.compile();
            this.eventTpl = tpl;
        }
        return this.eventTpl;
    },
    
    getTemplateEventData : function(evt){
		var selector = this.getEventSelectorCls(evt.EventId);
		
        return Ext.applyIf({
			_selectorCls: selector,
			_colorCls: 'ext-color-' + (evt.CalendarId ? evt.CalendarId : 'default') + (evt._renderAsAllDay ? '-ad' : ''),
            _elId: selector + '-' + evt._weekIndex,
            _isRecurring: evt.Recurrence && evt.Recurrence != '',
            _isReminder: evt.Reminder && evt.Reminder != '',
            Title: (evt.IsAllDay ? '' : evt.StartDate.format('g:ia ')) + (!evt.Title || evt.Title.length == 0 ? '(No title)' : evt.Title)
        }, evt);
    },

	refresh : function(){
		if(this.detailPanel){
			this.detailPanel.hide();
		}
		Ext.calendar.MonthView.superclass.refresh.call(this);
        
        if(this.showTime !== false){
            this.initClock();
        }
	},

    renderItems : function(){
        Ext.calendar.WeekEventRenderer.render({
            eventGrid: this.allDayOnly ? this.allDayGrid : this.eventGrid,
            viewStart: this.viewStart,
            tpl: this.getEventTemplate(),
            maxEventsPerDay: this.maxEventsPerDay,
            id: this.id,
            templateDataFn: this.getTemplateEventData.createDelegate(this),
            evtMaxCount: this.evtMaxCount,
            weekCount: this.weekCount,
            dayCount: this.dayCount
        });
        this.fireEvent('eventsrendered', this);
    },
	
	getDayEl : function(dt){
		return Ext.get(this.getDayId(dt));
	},
	
	getDayId : function(dt){
		if(Ext.isDate(dt)){
			dt = dt.format('Ymd');
		}
		return this.id + this.dayElIdDelimiter + dt;
	},
	
	getWeekIndex : function(dt){
		var el = this.getDayEl(dt).up('.ext-cal-wk-ct');
		return parseInt(el.id.split('-wk-')[1]);
	},
	
	getDaySize : function(contentOnly){
		var box = this.el.getBox(), 
			w = box.width / this.dayCount,
			h = box.height / this.getWeekCount();
		
		if(contentOnly){
			var hd = this.el.select('.ext-cal-dtitle').first().parent('tr');
			h = hd ? h-hd.getHeight(true) : h;
		}
		return {height: h, width: w};
	},
    
    getEventHeight : function(){
        if(!this.eventHeight){
            var evt = this.el.select('.ext-cal-evt').first();
            this.eventHeight = evt ? evt.parent('tr').getHeight() : 18;
        }
        return this.eventHeight;
    },
	
	getMaxEventsPerDay : function(){
		var dayHeight = this.getDaySize(true).height,
			h = this.getEventHeight(),
            max = Math.max(Math.floor((dayHeight-h) / h), 0);
		
		return max;
	},
	
	getDayAt : function(x, y){
		var box = this.el.getBox(), 
			daySize = this.getDaySize(),
			dayL = Math.floor(((x - box.x) / daySize.width)),
			dayT = Math.floor(((y - box.y) / daySize.height)),
			days = (dayT * 7) + dayL;
		
		var dt = this.viewStart.add(Date.DAY, days);
		return {
			date: dt,
			el: this.getDayEl(dt)
		}
	},
    
    moveNext : function(){
        return this.moveMonths(1);
    },

    movePrev : function(){
        return this.moveMonths(-1);
    },

	onInitDrag : function(){
        Ext.calendar.MonthView.superclass.onInitDrag.call(this);
		Ext.select(this.daySelector).removeClass(this.dayOverClass);
		if(this.detailPanel){
			this.detailPanel.hide();
		}
	},
	
	onMoreClick : function(dt){
		if(!this.detailPanel){
	        this.detailPanel = new Ext.Panel({
				id: this.id+'-details-panel',
				title: dt.format('F j'),
				layout: 'fit',
				floating: true,
				renderTo: Ext.getBody(),
				tools: [{
					id: 'close',
					handler: function(e, t, p){
						p.hide();
					}
				}],
				items: {
					xtype: 'monthdaydetailview',
					id: this.id+'-details-view',
					date: dt,
					view: this,
					store: this.store,
					listeners: {
						'eventsrendered': this.onDetailViewUpdated.createDelegate(this)
					}
				}
			});
		}
		else{
			this.detailPanel.setTitle(dt.format('F j'));
		}
		this.detailPanel.getComponent(this.id+'-details-view').update(dt);
	},
	
	onDetailViewUpdated : function(view, dt, numEvents){
		var p = this.detailPanel,
			frameH = p.getFrameHeight(),
            evtH = this.getEventHeight(),
			bodyH = frameH + (numEvents * evtH) + 3,
			dayEl = this.getDayEl(dt),
			box = dayEl.getBox();
		
		p.updateBox(box);
		p.setHeight(bodyH);
		p.setWidth(Math.max(box.width, 220));
		p.show();
		p.getPositionEl().alignTo(dayEl, 't-t?');
	},
    
    onHide : function(){
        Ext.calendar.MonthView.superclass.onHide.call(this);
        if(this.detailPanel){
            this.detailPanel.hide();
        }
    },
	
    onClick : function(e, t){
        if(this.detailPanel){
            this.detailPanel.hide();
        }
        if(Ext.calendar.MonthView.superclass.onClick.apply(this, arguments)){
            // The superclass handled the click already so exit
            return;
        }
		if(this.dropZone){
			this.dropZone.clearShims();
		}
		if(el = e.getTarget(this.moreSelector, 3)){
			var dt = el.id.split(this.moreElIdDelimiter)[1];
			this.onMoreClick(Date.parseDate(dt, 'Ymd'));
			return;
		}
        if(el = e.getTarget('td', 3)){
            if(el.id && el.id.indexOf(this.dayElIdDelimiter) > -1){
                var dt = el.id.split(this.dayElIdDelimiter)[1];
                this.fireEvent('dayclick', this, Date.parseDate(dt, 'Ymd'), false, Ext.get(this.getDayId(dt)));
                return;
            }
        }
    }
});

Ext.reg('monthview', Ext.calendar.MonthView);

Ext.calendar.DayHeaderView = Ext.extend(Ext.calendar.MonthView, {
    weekCount: 1,
    dayCount: 1,
    allDayOnly: true,
    monitorResize: false,
    
    afterRender : function(){
        if(!this.tpl){
            this.tpl = new Ext.calendar.DayHeaderTemplate({
                id: this.id,
                showTodayText: this.showTodayText,
                todayText: this.todayText,
                showTime: this.showTime
            });
        }
        this.tpl.compile();
        this.addClass('ext-cal-day-header');
        
        Ext.calendar.DayHeaderView.superclass.afterRender.call(this);
    },
    
    forceSize: Ext.emptyFn,
    
    refresh : function(){
        Ext.calendar.DayHeaderView.superclass.refresh.call(this);
        this.recalcHeaderBox();
    },
    
    recalcHeaderBox : function(){
        var tbl = this.el.child('.ext-cal-evt-tbl'),
            h = tbl.getHeight();
        
        this.el.setHeight(h+7);
        
        if(Ext.isIE && Ext.isStrict){
            this.el.child('.ext-cal-hd-ad-inner').setHeight(h+4);
        }
        if(Ext.isOpera){
            //TODO: figure out why Opera refuses to refresh height when
            //the new height is lower than the previous one
//            var ct = this.el.child('.ext-cal-hd-ct');
//            ct.repaint();
        }
    },
    
    moveNext : function(noRefresh){
        this.moveDays(this.dayCount, noRefresh);
    },

    movePrev : function(noRefresh){
        this.moveDays(-this.dayCount, noRefresh);
    }
});

Ext.reg('dayheaderview', Ext.calendar.DayHeaderView);
Ext.calendar.DayBodyView = Ext.extend(Ext.calendar.CalendarView, {
    
    ddResizeEventText: 'Update event to {0}',
     
    //private properties -- do not override:
    dayColumnElIdDelimiter: '-day-col-',
    
    initComponent : function(){
        Ext.calendar.DayBodyView.superclass.initComponent.call(this);
        
        this.addEvents({
            eventresize: true
        });
    },
    
    initDD : function(){
        var cfg = {
            createText: this.ddCreateEventText,
            moveText: this.ddMoveEventText,
            resizeText: this.ddResizeEventText
        };

        this.el.ddScrollConfig = {
            // scrolling is buggy in IE/Opera for some reason.  A larger vthresh
            // makes it at least functional if not perfect
            vthresh: Ext.isIE || Ext.isOpera ? 100 : 40,
            hthresh: -1,
            frequency: 50,
            increment: 100,
            ddGroup: 'DayViewDD'
        };
        this.bdDragZone = new Ext.calendar.DayViewDragZone(this.el, Ext.apply({
            view: this,
            containerScroll: true
        }, cfg));
        
        this.bdDropZone = new Ext.calendar.DayViewDropZone(this.el, Ext.apply({
            view: this
        }, cfg));
    },
    
    refresh : function(){
        var top = this.el.getScroll().top;
        this.prepareData();
        this.renderTemplate();
        this.renderItems();
        
        // skip this if the initial render scroll position has not yet been set.
        // necessary since IE/Opera must be deferred, so the first refresh will
        // override the initial position by default and always set it to 0.
        if(this.scrollReady){
            this.scrollTo(top);
        }
    },

    scrollTo : function(v, defer){
        defer = defer || (Ext.isIE || Ext.isOpera);
        if(defer){
            (function(){
                this.el.scrollTo('top', v);
                this.scrollReady = true;
            }).defer(10, this);
        }
        else{
            this.el.scrollTo('top', v);
            this.scrollReady = true;
        }
    },

    afterRender : function(){
        if(!this.tpl){
            this.tpl = new Ext.calendar.DayBodyTemplate({
                id: this.id,
                dayCount: this.dayCount,
                showTodayText: this.showTodayText,
                todayText: this.todayText,
                showTime: this.showTime
            });
        }
        this.tpl.compile();
        
        this.addClass('ext-cal-body-ct');
        
        Ext.calendar.DayBodyView.superclass.afterRender.call(this);
        
        // default scroll position to 7am:
        this.scrollTo(7*42);
    },
    
    forceSize: Ext.emptyFn,
    
    onEventResize : function(rec, data){
        var D = Ext.calendar.Date;
        if(D.compare(rec.data.StartDate, data.StartDate) === 0 &&
            D.compare(rec.data.EndDate, data.EndDate) === 0){
            // no changes
            return;
        } 
        rec.set('StartDate', data.StartDate);
        rec.set('EndDate', data.EndDate);
        
        this.fireEvent('eventresize', this, rec);
    },

    getEventBodyMarkup : function(){
        if(!this.eventBodyMarkup){
            this.eventBodyMarkup = ['{Title}',
                '<tpl if="_isReminder">',
                    '<i class="ext-cal-ic ext-cal-ic-rem">&nbsp;</i>',
                '</tpl>',
                '<tpl if="_isRecurring">',
                    '<i class="ext-cal-ic ext-cal-ic-rcr">&nbsp;</i>',
                '</tpl>',
//                '<tpl if="spanLeft">',
//                    '<i class="ext-cal-spl">&nbsp;</i>',
//                '</tpl>',
//                '<tpl if="spanRight">',
//                    '<i class="ext-cal-spr">&nbsp;</i>',
//                '</tpl>'
            ].join('');
        }
        return this.eventBodyMarkup;
    },
    
    getEventTemplate : function(){
        if(!this.eventTpl){
            this.eventTpl = !(Ext.isIE || Ext.isOpera) ? 
                new Ext.XTemplate(
                    '<div id="{_elId}" class="{_selectorCls} {_colorCls} ext-cal-evt ext-cal-evr" style="left: {_left}%; width: {_width}%; top: {_top}px; height: {_height}px;">',
                        '<div class="ext-evt-bd">', this.getEventBodyMarkup(), '</div>',
                        '<div class="ext-evt-rsz"><div class="ext-evt-rsz-h">&nbsp;</div></div>',
                    '</div>'
                )
                : new Ext.XTemplate(
                    '<div id="{_elId}" class="ext-cal-evt {_selectorCls} {_colorCls}-x" style="left: {_left}%; width: {_width}%; top: {_top}px;">',
                        '<div class="ext-cal-evb">&nbsp;</div>',
                        '<dl style="height: {_height}px;" class="ext-cal-evdm">',
                            '<dd class="ext-evt-bd">',
                                this.getEventBodyMarkup(),
                            '</dd>',
                            '<div class="ext-evt-rsz"><div class="ext-evt-rsz-h">&nbsp;</div></div>',
                        '</dl>',
                        '<div class="ext-cal-evb">&nbsp;</div>',
                    '</div>'
                );
            this.eventTpl.compile();
        }
        return this.eventTpl;
    },
    
    getEventAllDayTemplate : function(){
        if(!this.eventAllDayTpl){
            var tpl, body = this.getEventBodyMarkup();
            
            tpl = !(Ext.isIE || Ext.isOpera) ? 
                new Ext.XTemplate(
                    '<div id="{_elId}" class="{_selectorCls} {_colorCls} {values.spanCls} ext-cal-evt ext-cal-evr" style="left: {_left}%; width: {_width}%; top: {_top}px; height: {_height}px;">',
                        body,
                    '</div>'
                ) 
                : new Ext.XTemplate(
                    '<div id="{_elId}" class="ext-cal-evt" style="left: {_left}%; width: {_width}%; top: {_top}px; height: {_height}px;">',
                    '<div class="{_selectorCls} {values.spanCls} {_colorCls} ext-cal-evo">',
                        '<div class="ext-cal-evm">',
                            '<div class="ext-cal-evi">',
                                body,
                            '</div>',
                        '</div>',
                    '</div></div>'
                );
            tpl.compile();
            this.eventAllDayTpl = tpl;
        }
        return this.eventAllDayTpl;
    },
    
    /**
     * 
     * @param {} evt
     * @return {}
     */
    getTemplateEventData : function(evt){
        var selector = this.getEventSelectorCls(evt.EventId);
        var data = {};
        
        //if(evt._positioned){
            this.getTemplateEventBox(evt);
        //};
        
        data._selectorCls = selector;
        data._colorCls = 'ext-color-' + evt.CalendarId + (evt._renderAsAllDay ? '-ad' : '');
        data._elId = selector + (evt._weekIndex ? '-' + evt._weekIndex : '');
        data._isRecurring = evt.Recurrence && evt.Recurrence != '';
        data._isReminder = evt.Reminder && evt.Reminder != '';
        data.Title = (evt.IsAllDay ? '' : evt.StartDate.format('g:ia ')) + (!evt.Title || evt.Title.length == 0 ? '(No title)' : evt.Title);
        
        return Ext.applyIf(data, evt);
    },
    
    getTemplateEventBox : function(evt){
        var heightFactor = .7,
            start = evt.StartDate,
            end = evt.EndDate,
            startMins = start.getHours() * 60 + start.getMinutes(),
            endMins = end.getHours() * 60 + end.getMinutes(), 
            diffMins = endMins - startMins;
        
        evt._left = 0;
        evt._width = 100;
        evt._top = Math.round(startMins * heightFactor) + 1;
        evt._height = Math.max((diffMins * heightFactor) - 2, 15);
    },

    renderItems: function(){
        var day = 0, evts = [];
        for(; day < this.dayCount; day++){
            var ev = emptyCells = skipped = 0, 
                d = this.eventGrid[0][day],
                ct = d ? d.length : 0, 
                evt;
            
            for(; ev < ct; ev++){
                evt = d[ev];
                if(!evt){
                    continue;
                }
                var item = evt.data || evt.event.data;
                if(item._renderAsAllDay){
                    continue;
                }
                Ext.apply(item, {
                    cls: 'ext-cal-ev',
                    _positioned: true
                });
                evts.push({
                    data: this.getTemplateEventData(item),
                    date: this.viewStart.add(Date.DAY, day)
                });
            }
        }
        
        // overlapping event pre-processing loop
        var i = j = overlapCols = prevCol = 0, l = evts.length;
        for(; i<l; i++){
            var evt = evts[i].data, evt2 = null;
            prevCol = overlapCols;
            for(j=0; j<l; j++){
                if(i==j)continue;
                evt2 = evts[j].data;
                if(this.isOverlapping(evt, evt2)){
                    evt._overlap = evt._overlap == undefined ? 1 : evt._overlap+1;
                    if(i<j){
                        if(evt._overcol===undefined){
                            evt._overcol = 0;
                        }
                        evt2._overcol = evt._overcol+1;
                        overlapCols = Math.max(overlapCols, evt2._overcol);
                    }
                }
            }
        }
        
        // rendering loop
        for(i=0; i<l; i++){
            var evt = evts[i].data;
            if(evt._overlap !== undefined){
                var colWidth = 100 / (overlapCols+1),
                    evtWidth = 100 - (colWidth * evt._overlap);
                    
                evt._width = colWidth;
                evt._left = colWidth * evt._overcol;
            }
            var markup = this.getEventTemplate().apply(evt),
                target = this.id+'-day-col-'+evts[i].date.format('Ymd');
                
            Ext.DomHelper.append(target, markup);
        }
        
        this.fireEvent('eventsrendered', this);
    },
    
    getDayEl : function(dt){
        return Ext.get(this.getDayId(dt));
    },
    
    getDayId : function(dt){
        if(Ext.isDate(dt)){
            dt = dt.format('Ymd');
        }
        return this.id + this.dayColumnElIdDelimiter + dt;
    },
    
    getDaySize : function(){
        var box = this.el.child('.ext-cal-day-col-inner').getBox();
        return {height: box.height, width: box.width};
    },
    
    getDayAt : function(x, y){
        var sel = '.ext-cal-body-ct',
            xoffset = this.el.child('.ext-cal-day-times').getWidth(),
            box = this.el.getBox(),
            daySize = this.getDaySize(false),
            dayL = Math.floor(((x - box.x - xoffset) / daySize.width)),
            dayT = Math.floor(((y - box.y) / daySize.height)),
            days = (dayT * this.dayCount) + dayL,
            scroll = this.el.getScroll(),
            row = this.el.child('.ext-cal-bg-row'),
            rowH = row.getHeight() / 2, // 30 minute increment since a row is 60 minutes
            rowTop = y - box.y - rowH + scroll.top,
            mins = Math.ceil(rowTop / rowH) * 30,
            dt = this.viewStart.add(Date.DAY, days).add(Date.MINUTE, mins);
        
        return {
            date: dt,
            el: this.getDayEl(dt)
        }
    },

    onClick : function(e, t){
        if(Ext.calendar.DayBodyView.superclass.onClick.apply(this, arguments)){
            // The superclass handled the click already so exit
            return;
        }
        if(el = e.getTarget('td', 3)){
            if(el.id && el.id.indexOf(this.dayElIdDelimiter) > -1){
                var dt = this.getDateFromId(el.id, this.dayElIdDelimiter);
                this.fireEvent('dayclick', this, Date.parseDate(dt, 'Ymd'), true, Ext.get(this.getDayId(dt, true)));
                return;
            }
        }
        var day = this.getDayAt(e.xy[0], e.xy[1]);
        if(day && day.date){
            this.fireEvent('dayclick', this, day.date, false, null);
        }
    }
});

Ext.reg('daybodyview', Ext.calendar.DayBodyView);
Ext.calendar.DayView = Ext.extend(Ext.Container, {
    showTime: true,
    showTodayText: true,
    todayText: 'Today',
    dayCount: 1,
    
    ddCreateEventText: 'Create event for {0}',
    ddMoveEventText: 'Move event to {0}',
    
    // private
    initComponent : function(){
        // rendering more than 7 days per view is not supported
        this.dayCount = this.dayCount > 7 ? 7 : this.dayCount;
        
        var cfg = Ext.apply({}, this.initialConfig);
        cfg.showTime = this.showTime;
        cfg.showTodatText = this.showTodayText;
        cfg.todayText = this.todayText;
        cfg.dayCount = this.dayCount;
        cfg.wekkCount = 1; 
        
        var header = Ext.applyIf({
            xtype: 'dayheaderview',
            id: this.id+'-hd'
        }, cfg);
        
        var body = Ext.applyIf({
            xtype: 'daybodyview',
            id: this.id+'-bd'
        }, cfg);
        
        this.items = [header, body];
        this.addClass('ext-cal-dayview ext-cal-ct');
        
        Ext.calendar.DayView.superclass.initComponent.call(this);
    },
    
    afterRender : function(){
        Ext.calendar.DayView.superclass.afterRender.call(this);
        
        this.header = Ext.getCmp(this.id+'-hd');
        this.body = Ext.getCmp(this.id+'-bd');
        this.body.on('eventsrendered', this.forceSize, this);
    },
    
    refresh : function(){
        this.header.refresh();
        this.body.refresh();
    },
    
    // private
    forceSize: function(){
        // The defer call is mainly for good ol' IE, but it doesn't hurt in
        // general to make sure that the window resize is good and done first
        // so that we can properly calculate sizes.
        (function(){
            var ct = this.el.up('.x-panel-body'),
                hd = this.el.child('.ext-cal-day-header'),
                h = ct.getHeight() - hd.getHeight();
            
            this.el.child('.ext-cal-body-ct').setHeight(h);
        }).defer(10, this);
    },
    
    onResize : function(){
        this.forceSize();
    },
    
    getViewBounds : function(){
        return this.header.getViewBounds();
    },
    
    getStartDate : function(){
        return this.header.getStartDate();
    },

    setStartDate: function(dt){
        this.header.setStartDate(dt, true);
        this.body.setStartDate(dt, true);
    },

    renderItems: function(){
        this.header.renderItems();
        this.body.renderItems();
    },
    
    isToday : function(){
        return this.header.isToday();
    },
    
    moveTo : function(dt, noRefresh){
        this.header.moveTo(dt, noRefresh);
        this.body.moveTo(dt, noRefresh);
    },

    moveNext : function(noRefresh){
        this.header.moveNext(noRefresh);
        this.body.moveNext(noRefresh);
    },

    movePrev : function(noRefresh){
        this.header.movePrev(noRefresh);
        this.body.movePrev(noRefresh);
    },
    
    moveMonths : function(value, noRefresh){
        this.header.moveMonths(value, noRefresh);
        this.body.moveMonths(value, noRefresh);
    },

    moveDays : function(value, noRefresh){
        this.header.moveDays(value, noRefresh);
        this.body.moveDays(value, noRefresh);
    },
    
    moveToday : function(noRefresh){
        this.header.moveToday(noRefresh);
        this.body.moveToday(noRefresh);
    }
});

Ext.reg('dayview', Ext.calendar.DayView);
Ext.calendar.WeekView = Ext.extend(Ext.calendar.DayView, {
    dayCount: 7
});

Ext.reg('weekview', Ext.calendar.WeekView);Ext.calendar.DateRangeField = Ext.extend(Ext.form.Field, {
    toText: 'to',
    allDayText: 'All day',
    
    onRender: function(ct, position){
        if(!this.el){
            this.startDate = new Ext.form.DateField({
                id: this.id+'-start-date',
                format: 'n/j/Y',
                width:100,
                listeners: {
                    'change': {
                        fn: function(){
                            this.checkDates('date', 'start');
                        },
                        scope: this
                    }
                }
            });
            this.startTime = new Ext.form.TimeField({
                id: this.id+'-start-time',
                hidden: this.showTimes === false,
                labelWidth: 0,
                hideLabel:true,
                width:90,
                listeners: {
                    'select': {
                        fn: function(){
                            this.checkDates('time', 'start');
                        },
                        scope: this
                    }
                }
            });
            this.endTime = new Ext.form.TimeField({
                id: this.id+'-end-time',
                hidden: this.showTimes === false,
                labelWidth: 0,
                hideLabel:true,
                width:90,
                listeners: {
                    'select': {
                        fn: function(){
                            this.checkDates('time', 'end');
                        },
                        scope: this
                    }
                }
            })
            this.endDate = new Ext.form.DateField({
                id: this.id+'-end-date',
                format: 'n/j/Y',
                hideLabel:true,
                width:100,
                listeners: {
                    'change': {
                        fn: function(){
                            this.checkDates('date', 'end');
                        },
                        scope: this
                    }
                }
            });
            this.allDay = new Ext.form.Checkbox({
                id: this.id+'-allday',
                hidden: this.showTimes === false || this.showAllDay === false,
                boxLabel: this.allDayText,
                handler: function(chk, checked){
                    this.startTime.setVisible(!checked);
                    this.endTime.setVisible(!checked);
                },
                scope: this
            });
            this.toLabel = new Ext.form.Label({
                xtype: 'label',
                id: this.id+'-to-label',
                text: this.toText
            });
            
            this.fieldCt = new Ext.Container({
                autoEl: {id:this.id}, //make sure the container el has the field's id
                cls: 'ext-dt-range',
                renderTo: ct,
                layout:'table',
                layoutConfig: {
                    columns: 6
                },
                defaults: {
                    hideParent: true
                },
                items:[
                    this.startDate, 
                    this.startTime, 
                    this.toLabel,
                    this.endTime, 
                    this.endDate,
                    this.allDay
                ]
            });
            
            this.fieldCt.ownerCt = this;
            this.el = this.fieldCt.getEl();
            this.items = new Ext.util.MixedCollection();
            this.items.addAll([this.startDate, this.endDate, this.toLabel, this.startTime, this.endTime, this.allDay]);
        }
        Ext.calendar.DateRangeField.superclass.onRender.call(this, ct, position);
    },
    
    checkDates: function(type, startend){
        var startField = Ext.getCmp(this.id+'-start-'+type),
            endField = Ext.getCmp(this.id+'-end-'+type),
            startValue = this.getDT('start'),
            endValue = this.getDT('end');

        if(startValue > endValue){
            if(startend=='start'){
                endField.setValue(startValue);
            }else{
                startField.setValue(endValue);
                this.checkDates(type, 'start');
            }
        }
        if(type=='date'){
            this.checkDates('time', startend);
        }
    },
    
    getValue: function(){
        return [
            this.getDT('start'), 
            this.getDT('end'),
            this.allDay.getValue()
        ];
    },
    
    // private getValue helper
    getDT: function(startend){
        var time = this[startend+'Time'].getValue(),
            dt = this[startend+'Date'].getValue();
            
        if(Ext.isDate(dt)){
            dt = dt.format(this[startend+'Date'].format);
        }
        else{
            return null;
        };
        if(time != '' && this[startend+'Time'].isVisible()){
            return Date.parseDate(dt+' '+time, this[startend+'Date'].format+' '+this[startend+'Time'].format);
        }
        return Date.parseDate(dt, this[startend+'Date'].format);
        
    },
    
    setValue: function(v){
        if(Ext.isArray(v)){
            this.setDT(v[0], 'start');
            this.setDT(v[1], 'end');
            this.allDay.setValue(!!v[2]);
        }
        else if(Ext.isDate(v)){
            this.setDT(v, 'start');
            this.setDT(v, 'end');
            this.allDay.setValue(false);
        }
        else if(v.StartDate){ //object
            this.setDT(v.StartDate, 'start');
            if(!this.setDT(v.EndDate, 'end')){
                this.setDT(v.StartDate, 'end');
            }
            this.allDay.setValue(!!v.IsAllDay);
        }
    },
    
    // private setValue helper
    setDT: function(dt, startend){
        if(dt && Ext.isDate(dt)){
            this[startend+'Date'].setValue(dt);
            this[startend+'Time'].setValue(dt.format(this[startend+'Time'].format));
            return true;
        }
    },
    
    isDirty: function(){
        var dirty = false;
        if(this.rendered && !this.disabled) {
            this.items.each(function(item){
                if (item.isDirty()) {
                    dirty = true;
                    return false;
                }
            });
        }
        return dirty;
    },
    
    onDisable : function(){
        this.delegateFn('disable');
    },

    onEnable : function(){
        this.delegateFn('enable');
    },
    
    reset : function(){
        this.delegateFn('reset');
    },
    
    // private
    delegateFn : function(fn){
        this.items.each(function(item){
            if (item[fn]) {
                item[fn]();
            }
        });
    },
    
    beforeDestroy: function(){
        Ext.destroy(this.fieldCt);
        Ext.calendar.DateRangeField.superclass.beforeDestroy.call(this);
    },
    
    getRawValue : Ext.emptyFn,
    setRawValue : Ext.emptyFn
});

Ext.reg('daterangefield', Ext.calendar.DateRangeField);
Ext.calendar.ReminderField = Ext.extend(Ext.form.ComboBox, {
    width: 200,
    fieldLabel: 'Reminder',
    mode: 'local',
    triggerAction: 'all',
    forceSelection: true,
    displayField: 'desc',
    valueField: 'value',
    
    initComponent: function(){
        Ext.calendar.ReminderField.superclass.initComponent.call(this);
        
        this.store = this.store || new Ext.data.ArrayStore({
            fields: ['value', 'desc'],
            idIndex: 0,
            data: [
                ['', 'None'],
                ['0', 'At start time'],
                ['5', '5 minutes before start'],
                ['15', '15 minutes before start'],
                ['30', '30 minutes before start'],
                ['60', '1 hour before start'],
                ['90', '1.5 hours before start'],
                ['120', '2 hours before start'],
                ['180', '3 hours before start'],
                ['360', '6 hours before start'],
                ['720', '12 hours before start'],
                ['1440', '1 day before start'],
                ['2880', '2 days before start'],
                ['4320', '3 days before start'],
                ['5760', '4 days before start'],
                ['7200', '5 days before start'],
                ['10080', '1 week before start'],
                ['20160', '2 weeks before start']
            ]
        });
    },
    
    initValue : function(){
        if(this.value !== undefined){
            this.setValue(this.value);
        }
        else{
            this.setValue('');
        }
        this.originalValue = this.getValue();
    }
});

Ext.reg('reminderfield', Ext.calendar.ReminderField);
Ext.calendar.EventEditForm = Ext.extend(Ext.form.FormPanel, {
    labelWidth: 65,
    title: 'Event Form',
    titleTextAdd: 'Add Event',
    titleTextEdit: 'Edit Event',
    bodyStyle:'background:transparent;padding:20px 20px 10px;',
    border: false,
    buttonAlign: 'center',
    autoHeight: true,
    cls: 'ext-evt-edit-form',
    
    // private properties:
    newId: 10000,
    layout: 'column',
    
    initComponent: function(){
        
        this.addEvents({
            eventadd: true,
            eventupdate: true,
            eventdelete: true,
            eventcancel: true
        });
                
        this.titleField = new Ext.form.TextField({
            fieldLabel: 'Title',
            name: 'Title',
            anchor: '90%'
        });
        this.dateRangeField = new Ext.calendar.DateRangeField({
            fieldLabel: 'When',
            anchor: '90%'
        });
        this.reminderField = new Ext.calendar.ReminderField({
            name: 'Reminder'
        });
        this.notesField = new Ext.form.TextArea({
            fieldLabel: 'Notes',
            name: 'Notes',
            grow: true,
            growMax: 150,
            anchor: '100%'
        });
        this.locationField = new Ext.form.TextField({
            fieldLabel: 'Location',
            name: 'Location',
            anchor: '100%'
        });
        this.urlField = new Ext.form.TextField({
            fieldLabel: 'Web Link',
            name: 'Url',
            anchor: '100%'
        });
        
        var leftFields = [this.titleField, this.dateRangeField, this.reminderField], 
            rightFields = [this.notesField, this.locationField, this.urlField];
        
        if(this.calendarStore){
            this.calendarField = new Ext.calendar.CalendarPicker({
                store: this.calendarStore,
                name: 'CalendarId'
            });
            leftFields.splice(2, 0, this.calendarField);
        };
        
        this.items = [{
            id: 'left-col',
            columnWidth: .65,
            layout: 'form',
            border: false,
            items: leftFields
        },{
            id: 'right-col',
            columnWidth: .35,
            layout: 'form',
            border: false,
            items: rightFields
        }];
        
        this.fbar = [{
            text:'Save', scope: this, handler: this.onSave
        },{
            cls:'ext-del-btn', text:'Delete', scope:this, handler:this.onDelete
        },{
            text:'Cancel', scope: this, handler: this.onCancel
        }];
        
        Ext.calendar.EventEditForm.superclass.initComponent.call(this);
    },
    
    loadRecord: function(rec){
        this.form.loadRecord.apply(this.form, arguments);
        this.activeRecord = rec;
        this.dateRangeField.setValue(rec.data);
        if(this.calendarStore){
            this.form.setValues({'calendar': rec.data.CalendarId});
        }
        this.isAdd = !!rec.data.IsNew;
        if(this.isAdd){
            rec.markDirty();
            this.setTitle(this.titleTextAdd);
            Ext.select('.ext-del-btn').setDisplayed(false);
        }
        else {
            this.setTitle(this.titleTextEdit);
            Ext.select('.ext-del-btn').setDisplayed(true);
        }
        this.titleField.focus();
    },
    
    updateRecord: function(){
        var dates = this.dateRangeField.getValue();
            
        this.form.updateRecord(this.activeRecord);
        this.activeRecord.set('StartDate', dates[0]);
        this.activeRecord.set('EndDate', dates[1]);
        this.activeRecord.set('IsAllDay', dates[2]);
    },
    
    onCancel: function(){
        this.cleanup(true);
        this.fireEvent('eventcancel', this, this.activeRecord);
    },

    cleanup: function(hide){
        if(this.activeRecord && this.activeRecord.dirty){
            this.activeRecord.reject();
        }
        delete this.activeRecord;
        
        if(this.form.isDirty()){
            this.form.reset();
        }
    },
    
    onSave: function(){
        if(!this.form.isValid()){
            return;
        }
        this.updateRecord();
        
        if(!this.activeRecord.dirty){
            this.onCancel();
            return;
        }
        
        this.fireEvent(this.isAdd ? 'eventadd' : 'eventupdate', this, this.activeRecord);
    },

    onDelete: function(){
        this.fireEvent('eventdelete', this, this.activeRecord);
    }
});

Ext.reg('eventeditform', Ext.calendar.EventEditForm);
Ext.calendar.EventEditWindow = function(config){
	var formPanelCfg = {
		xtype: 'form',
        labelWidth: 65,
        frame: false,
        bodyStyle:'background:transparent;padding:5px 10px 10px;',
        bodyBorder:false,
        border:false,
        items:[{
            id: 'title',
            name: 'Title',
            fieldLabel: 'Title',
            xtype: 'textfield',
            anchor: '100%'
        },{
            xtype: 'daterangefield',
            id: 'date-range',
            anchor: '100%',
            fieldLabel: 'When'
		}]
    };
    
    if(config.calendarStore){
        this.calendarStore = config.calendarStore;
        delete config.calendarStore;
        
        formPanelCfg.items.push({
            xtype: 'calendarpicker',
            id: 'calendar',
            name: 'calendar',
            anchor: '100%',
            store: this.calendarStore
        });
    }

    Ext.calendar.EventEditWindow.superclass.constructor.call(this, Ext.apply({
        titleTextAdd: 'Add Event',
		titleTextEdit: 'Edit Event',
        width: 600,
        autocreate:true,
        border:true,
        closeAction:'hide',
        modal:false,
        resizable:false,
		
		savingMessage: 'Saving changes...',
		deletingMessage: 'Deleting event...',
		
        buttonAlign: 'left',
        fbar:[{
            xtype: 'tbtext', text: '<a href="#" id="tblink">Edit Details...</a>'
        },'->',{
            text:'Save', disabled:false, handler:this.onSave, scope:this
        },{
            id:'delete-btn', text:'Delete', disabled:false, handler:this.onDelete, scope:this, hideMode:'offsets'
        },{
            text:'Cancel', disabled:false, handler:this.onCancel, scope:this
        }],
        items: formPanelCfg
    }, config));
};

Ext.extend(Ext.calendar.EventEditWindow, Ext.Window, {

	newId: 10000,
	showAnimDuration: 0.15,
	
    initComponent: function(){
        Ext.calendar.EventEditWindow.superclass.initComponent.call(this);
		
		this.formPanel = this.items.items[0];
		
		this.addEvents({
            eventadd: true,
			eventupdate: true,
            eventdelete: true,
			eventcancel: true,
            editdetails: true
        });
    },

    afterRender: function(){
        Ext.calendar.EventEditWindow.superclass.afterRender.call(this);
		
		this.el.addClass('ext-cal-event-win');
        
        Ext.get('tblink').on('click', function(e){
            e.stopEvent();
            this.updateRecord();
            this.fireEvent('editdetails', this, this.activeRecord);
        }, this);
    },
	
	/**
     * Shows the window, rendering it first if necessary, or activates it and brings it to front if hidden.
	 * @param {Ext.data.Record/Object} o Either a {@link Ext.data.Record} if showing the form
	 * for an existing event in edit mode, or a plain object containing a StartDate property (and 
	 * optionally an EndDate property) for showing the form in add mode. 
     * @param {String/Element} animateTarget (optional) The target element or id from which the window should
     * animate while opening (defaults to null with no animation)
     * @return {Ext.Window} this
     */
    show: function(o, animateTarget){
		// Work around the CSS day cell height hack needed for initial render in IE8/strict:
		var anim = (Ext.isIE8 && Ext.isStrict) ? null : animateTarget;

		Ext.calendar.EventEditWindow.superclass.show.call(this, anim, function(){
            Ext.getCmp('title').focus(false, 100);
        });
        Ext.getCmp('delete-btn')[o.data && o.data.EventId ? 'show' : 'hide']();
        
        var rec, f = this.formPanel.form;

        if(o.data){
            rec = o;
			this.isAdd = !!rec.data.IsNew;
			if(this.isAdd){
				// Enable adding the default record that was passed in
				// if it's new even if the user makes no changes 
				rec.markDirty();
				this.setTitle(this.titleTextAdd);
			}
			else{
				this.setTitle(this.titleTextEdit);
			}
            
            f.loadRecord(rec);
        }
        else{
			this.isAdd = true;
            this.setTitle(this.titleTextAdd);

            var start = o.StartDate;
            var end = o.EndDate || start.add('h', 1);
            
            rec = new Ext.calendar.EventRecord({
				EventId: this.newId++,
                StartDate: start,
                EndDate: end,
                IsNew: true,
                IsAllDay: !!o.IsAllDay || !!(o.EndDate && start != o.EndDate),
                IsReminder: false
            });

            f.reset();
            f.loadRecord(rec);
        }
        
        if(this.calendarStore){
            Ext.getCmp('calendar').setValue(rec.data.CalendarId);
        }
        Ext.getCmp('date-range').setValue(rec.data);
        this.activeRecord = rec;
        
		return this;
    },

    roundTime: function(dt, incr){
        incr = incr || 15;
        var m = parseInt(dt.getMinutes());
        return dt.add('mi', incr - (m % incr));
    },

    onCancel: function(){
    	this.cleanup(true);
		this.fireEvent('eventcancel', this);
    },

    cleanup: function(hide){
        if(this.activeRecord && this.activeRecord.dirty){
            this.activeRecord.reject();
        }
        delete this.activeRecord;
		
        if(hide===true){
			// Work around the CSS day cell height hack needed for initial render in IE8/strict:
			//var anim = afterDelete || (Ext.isIE8 && Ext.isStrict) ? null : this.animateTarget;
            this.hide();
        }
    },
    
    updateRecord: function(){
        var f = this.formPanel.form,
            dates = Ext.getCmp('date-range').getValue();
            
        f.updateRecord(this.activeRecord);
        this.activeRecord.set('StartDate', dates[0]);
        this.activeRecord.set('EndDate', dates[1]);
        this.activeRecord.set('IsAllDay', dates[2]);
        this.activeRecord.set('CalendarId', this.formPanel.form.findField('calendar').getValue());
    },

    onSave: function(){
        if(!this.formPanel.form.isValid()){
            return;
        }
        this.updateRecord();
		
		if(!this.activeRecord.dirty){
			this.onCancel();
			return;
		}
		
		this.fireEvent(this.isAdd ? 'eventadd' : 'eventupdate', this, this.activeRecord);
    },

    onDelete: function(){
		this.fireEvent('eventdelete', this, this.activeRecord);
    }
});/**
 * @class Ext.calendar.CalendarPanel
 * @extends Ext.Panel
 * <p>This is the default container for Ext calendar views. It supports day, week and month views as well
 * as a built-in event edit form. The only requirement for displaying a calendar is passing in a valid
 * {@link #calendarStore} config containing records of type {@link Ext.calendar.EventRecord EventRecord}. In order
 * to make the calendar interactive (enable editing, drag/drop, etc.) you can handle any of the various
 * events fired by the underlying views and exposed through the CalendarPanel.</p>
 * {@link #layoutConfig} option if needed.</p>
 * @constructor
 * @param {Object} config The config object
 * @xtype calendarpanel
 */
Ext.calendar.CalendarPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Boolean} showDayView
     * True to include the day view (and toolbar button), false to hide them (defaults to true).
     */
    showDayView: true,
    /**
     * @cfg {Boolean} showWeekView
     * True to include the week view (and toolbar button), false to hide them (defaults to true).
     */
    showWeekView: true,
    /**
     * @cfg {Boolean} showMonthView
     * True to include the month view (and toolbar button), false to hide them (defaults to true).
     * If the day and week views are both hidden, the month view will show by default even if
     * this config is false.
     */
    showMonthView: true,
    /**
     * @cfg {Boolean} showNavBar
     * True to display the calendar navigation toolbar, false to hide it (defaults to true). Note that
     * if you hide the default navigation toolbar you'll have to provide an alternate means of navigating the calendar.
     */
    showNavBar: true,
    /**
     * @cfg {String} todayText
     * Alternate text to use for the 'Today' nav bar button.
     */
    todayText: 'Today',
    /**
     * @cfg {Boolean} showTodayText
     * True to show the value of {@link #todayText} instead of today's date in the calendar's current day box,
     * false to display the day number(defaults to true).
     */
    showTodayText: true,
    /**
     * @cfg {Boolean} showTime
     * True to display the current time next to the date in the calendar's current day box, false to not show it 
     * (defaults to true).
     */
    showTime: true,
    /**
     * @cfg {String} dayText
     * Alternate text to use for the 'Day' nav bar button.
     */
    dayText: 'Day',
    /**
     * @cfg {String} weekText
     * Alternate text to use for the 'Week' nav bar button.
     */
    weekText: 'Week',
    /**
     * @cfg {String} monthText
     * Alternate text to use for the 'Month' nav bar button.
     */
    monthText: 'Month',
    /**
     * @cfg {String} jumpToText
     * Alternate text to use for the 'Jump to:' date field label in the nav bar.
     */
    jumpToText: 'Jump to:',
    /**
     * @cfg {String} goText
     * Alternate text to use for the 'Go' nav bar button.
     */
    goText: 'Go',
    
    // private
    layoutConfig: {
        layoutOnCardChange: true,
        deferredRender: true
    },
    
    // private property
    startDate: new Date(),
    
    // private
    initComponent : function(){
        this.tbar = {
            cls: 'ext-cal-toolbar',
            border: true,
            buttonAlign: 'center',
            items: [{
                id: this.id+'-tb-prev', handler: this.onPrevClick, scope: this, iconCls: 'x-tbar-page-prev'
            }]
        };
        
        this.viewCount = 0;
        
        if(this.showDayView){
            this.tbar.items.push({
                id: this.id+'-tb-day', text: this.dayText, handler: this.onDayClick, scope: this, toggleGroup: 'tb-views'
            });
            this.viewCount++;
        }
        if(this.showWeekView){
            this.tbar.items.push({
                id: this.id+'-tb-week', text: this.weekText, handler: this.onWeekClick, scope: this, toggleGroup: 'tb-views'
            });
            this.viewCount++;
        }
        if(this.showMonthView || this.viewCount == 0){
            this.tbar.items.push({
                id: this.id+'-tb-month', text: this.monthText, handler: this.onMonthClick, scope: this, toggleGroup: 'tb-views'
            });
            this.viewCount++;
        }
        this.tbar.items.push({
            id: this.id+'-tb-next', handler: this.onNextClick, scope: this, iconCls: 'x-tbar-page-next'
        });
        this.tbar.items.push('->');
        
        var idx = this.viewCount-1;
        this.activeItem = this.activeItem === undefined ? idx : (this.activeItem > idx ? idx : this.activeItem);
        
        if(this.showNavBar === false){
            delete this.tbar;
            this.addClass('x-calendar-nonav');
        }
        
        Ext.calendar.CalendarPanel.superclass.initComponent.call(this);
        
        this.addEvents({
            eventadd: true,
            eventupdate: true,
            eventdelete: true,
            eventcancel: true,
            viewchange: true
        });
        
        this.layout = 'card'; // do not allow override
        
        if(this.showDayView){
            var day = Ext.apply({
                xtype: 'dayview',
                title: this.dayText,
                showToday: this.showToday,
                showTodayText: this.showTodayText,
                showTime: this.showTime
            }, this.dayViewCfg);
            
            day.id = this.id+'-day';
            day.store = day.store || this.eventStore;
            this.initEventRelay(day);
            this.add(day);
        }
        if(this.showWeekView){
            var wk = Ext.applyIf({
                xtype: 'weekview',
                title: this.weekText,
                showToday: this.showToday,
                showTodayText: this.showTodayText,
                showTime: this.showTime
            }, this.weekViewCfg);
            
            wk.id = this.id+'-week';
            wk.store = wk.store || this.eventStore;
            this.initEventRelay(wk);
            this.add(wk);
        }
        if(this.showMonthView || this.viewCount == 0){
            var month = Ext.applyIf({
                xtype: 'monthview',
                title: this.monthText,
                showToday: this.showToday,
                showTodayText: this.showTodayText,
                showTime: this.showTime
            }, this.monthViewCfg);
            
            month.id = this.id+'-month';
            month.store = month.store || this.eventStore;
            this.initEventRelay(month);
            this.add(month);
        }

        this.add(Ext.applyIf({
            xtype: 'eventeditform',
            id: this.id+'-edit',
            calendarStore: this.calendarStore,
            listeners: {
                'eventadd':    { scope: this, fn: this.onEventAdd },
                'eventupdate': { scope: this, fn: this.onEventUpdate },
                'eventdelete': { scope: this, fn: this.onEventDelete },
                'eventcancel': { scope: this, fn: this.onEventCancel }
            }
        }, this.editViewCfg));
    },
    
    // private
    initEventRelay: function(cfg){
        cfg.listeners = cfg.listeners || {};
        cfg.listeners.afterrender = {
            fn: function(c){
                // relay the view events so that app code only has to handle them in one place
                this.relayEvents(c, ['eventsrendered','eventclick','eventover','eventout','dayclick',
                    'eventmove','datechange','rangeselect','eventdelete','eventresize','initdrag']);
            },
            scope: this,
            single: true
        }
    },
    
    // private
    afterRender: function(){
        Ext.calendar.CalendarPanel.superclass.afterRender.call(this);
        this.fireViewChange();
    },
    
    // private
    onLayout: function(){
        Ext.calendar.CalendarPanel.superclass.onLayout.call(this);
        if(!this.navInitComplete){
            this.updateNavState();
            this.navInitComplete = true;
        }
    },
    
    // private
    onEventAdd: function(form, rec){
        rec.data.IsNew = false;
        this.eventStore.add(rec);
        this.hideEditForm();
        this.fireEvent('eventadd', this, rec);
    },
    
    // private
    onEventUpdate: function(form, rec){
        rec.commit();
        this.hideEditForm();
        this.fireEvent('eventupdate', this, rec);
    },
    
    // private
    onEventDelete: function(form, rec){
        this.eventStore.remove(rec);
        this.hideEditForm();
        this.fireEvent('eventdelete', this, rec);
    },
    
    // private
    onEventCancel: function(form, rec){
        this.hideEditForm();
        this.fireEvent('eventcancel', this, rec);
    },
    
    /**
     * Shows the built-in event edit form for the passed in event record.  This method automatically
     * hides the calendar views and navigation toolbar.  To return to the calendar, call {@link #hideEditForm}.
     * @param {Ext.calendar.EventRecord} record The event record to edit
     * @return {Ext.calendar.CalendarPanel} this
     */
    showEditForm: function(rec){
        this.preEditView = this.layout.activeItem.id;
        this.setActiveView(this.id+'-edit');
        this.layout.activeItem.loadRecord(rec);
        return this;
    },
    
    /**
     * Hides the built-in event edit form and returns to the previous calendar view. If the edit form is
     * not currently visible this method has no effect.
     * @return {Ext.calendar.CalendarPanel} this
     */
    hideEditForm: function(){
        if(this.preEditView){
            this.setActiveView(this.preEditView);
            delete this.preEditView;
        }
        return this;
    },
    
    // private
    setActiveView: function(id){
        var l = this.layout;
        l.setActiveItem(id);
        
        if(id == this.id+'-edit'){
            this.getTopToolbar().hide();
            this.doLayout();
        }
        else{
            l.activeItem.refresh();
            this.getTopToolbar().show();
            this.updateNavState();
        }
        this.activeView = l.activeItem;
        this.fireViewChange();
    },
    
    fireViewChange: function(){
        var info = null, 
            view = this.layout.activeItem;
            
        if(view.getViewBounds){
            vb = view.getViewBounds(),
            info = {
                activeDate: view.getStartDate(),
                viewStart: vb.start,
                viewEnd: vb.end
            }
        }
        this.fireEvent('viewchange', this, view, info);
    },
    
    // private
    updateNavState: function(){
        if(this.showNavBar !== false){
            var item = this.layout.activeItem,
                suffix = item.id.split(this.id+'-')[1];
            
            var btn = Ext.getCmp(this.id+'-tb-'+suffix);
            if(!btn.pressed){
                btn.toggle(true, true);
            }
        }
    },
    
    setStartDate: function(dt){
        this.layout.activeItem.setStartDate(dt, true);
        this.updateNavState();
        this.fireViewChange();
    },
    
    // private
    onPrevClick: function(){
        this.startDate = this.layout.activeItem.movePrev();
        this.updateNavState();
        this.fireViewChange();
    },
    
    // private
    onNextClick: function(){
        this.startDate = this.layout.activeItem.moveNext();
        this.updateNavState();
        this.fireViewChange();
    },
    
    // private
    onDayClick: function(){
        this.setActiveView(this.id+'-day');
    },
    
    // private
    onWeekClick: function(){
        this.setActiveView(this.id+'-week');
    },
    
    // private
    onMonthClick: function(){
        this.setActiveView(this.id+'-month');
    },
    
    /**
     * Return the view that is currently active, which will be a subclass of
     * {@link Ext.calendar.BaseCalendarView BaseCalendarView}.
     * @return {Ext.calendar.BaseCalendarView} The active view
     */
    getActiveView: function(){
        return this.layout.activeItem;
    }
});

Ext.reg('calendarpanel', Ext.calendar.CalendarPanel);