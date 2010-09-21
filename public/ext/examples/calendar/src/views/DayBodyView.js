/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
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
        this.dragZone = new Ext.calendar.DayViewDragZone(this.el, Ext.apply({
            view: this,
            containerScroll: true
        }, cfg));
        
        this.dropZone = new Ext.calendar.DayViewDropZone(this.el, Ext.apply({
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
            viewBox = this.el.getBox(),
            daySize = this.getDaySize(false),
            relX = x - viewBox.x - xoffset,
            dayIndex = Math.floor(relX / daySize.width), // clicked col index
            scroll = this.el.getScroll(),
            row = this.el.child('.ext-cal-bg-row'), // first avail row, just to calc size
            rowH = row.getHeight() / 2, // 30 minute increment since a row is 60 minutes
            relY = y - viewBox.y - rowH + scroll.top,
            rowIndex = Math.max(0, Math.ceil(relY / rowH)),
            mins = rowIndex * 30,
            dt = this.viewStart.add(Date.DAY, dayIndex).add(Date.MINUTE, mins),
            el = this.getDayEl(dt),
            timeX = x;
        
        if(el){
            timeX = el.getLeft();
        }
        
        return {
            date: dt,
            el: el,
            // this is the box for the specific time block in the day that was clicked on:
            timeBox: {
                x: timeX,
                y: (rowIndex * 21) + viewBox.y - scroll.top,
                width: daySize.width,
                height: rowH
            } 
        }
    },

    onClick : function(e, t){
        if(this.dragPending || Ext.calendar.DayBodyView.superclass.onClick.apply(this, arguments)){
            // The superclass handled the click already so exit
            return;
        }
        if(e.getTarget('.ext-cal-day-times', 3) !== null){
            // ignore clicks on the times-of-day gutter
            return;
        }
        var el = e.getTarget('td', 3);
        if(el){
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
