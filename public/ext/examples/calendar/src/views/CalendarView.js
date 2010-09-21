/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */

Ext.calendar.CalendarView = Ext.extend(Ext.BoxComponent, {
    
	//public configs:
    startDay : 0, // 0=Sunday
    spansHavePriority: false,
	trackMouseOver: true,
	enableFx: true,
	enableAddFx: true,
	enableUpdateFx: false,
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
        // set this flag for other event handlers that might conflict while we're waiting
        this.dragPending = true;
        // have to wait for the user to save or cancel before finalizing the dd interation
		this.fireEvent('rangeselect', this, {StartDate:start, EndDate:end}, this.onCalendarEndDragComplete.createDelegate(this, [onComplete]));
	},
    
    onCalendarEndDragComplete : function(onComplete){
        // callback for the drop zone to clean up
        onComplete();
        // clear flag for other events to resume normally
        this.dragPending = false;
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
});