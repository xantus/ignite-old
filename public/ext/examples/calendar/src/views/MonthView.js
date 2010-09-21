/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.calendar.MonthView = Ext.extend(Ext.calendar.CalendarView, {
	//public configs:
	daySelector: '.ext-cal-day',
	moreSelector : '.ext-cal-ev-more',
    weekLinkSelector : '.ext-cal-week-link',
	showTime: true,
	showTodayText: true,
    showHeader: false,
    showWeekLinks: false,
    showWeekNumbers: false,
	todayText: 'Today',
    weekCount: -1, // defaults to auto by month
    dayCount: 7,
    weekLinkOverClass: 'ext-week-link-over',
     
    //private properties -- do not override:
	moreElIdDelimiter: '-more-',
    weekLinkIdDelimiter: 'ext-cal-week-',

    initComponent : function(){
        Ext.calendar.MonthView.superclass.initComponent.call(this);
        this.addEvents({
            dayclick: true,
            dayover: true,
            dayout: true,
            weekclick: true
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
                showTime: this.showTime,
                showHeader: this.showHeader,
                showWeekLinks: this.showWeekLinks,
                showWeekNumbers: this.showWeekNumbers
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
    
    // private
    forceSize: function(){
        // Compensate for the week link gutter width if visible
        if(this.showWeekLinks && this.el && this.el.child){
            var hd = this.el.select('.ext-cal-hd-days-tbl'),
                bgTbl = this.el.select('.ext-cal-bg-tbl'),
                evTbl = this.el.select('.ext-cal-evt-tbl'),
                wkLinkW = this.el.child('.ext-cal-week-link').getWidth(),
                w = this.el.getWidth()-wkLinkW;
            
            hd.setWidth(w);
            bgTbl.setWidth(w);
            evTbl.setWidth(w);
        }
        Ext.calendar.MonthView.superclass.forceSize.call(this);
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
        if(el = e.getTarget(this.weekLinkSelector, 3)){
            var dt = el.id.split(this.weekLinkIdDelimiter)[1];
            this.fireEvent('weekclick', this, Date.parseDate(dt, 'Ymd'));
            return;
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
    },
    
    handleDayMouseEvent : function(e, t, type){
        var el = e.getTarget(this.weekLinkSelector, 3, true);
        if(el){
            el[type == 'over' ? 'addClass' : 'removeClass'](this.weekLinkOverClass);
            return;
        }
        Ext.calendar.MonthView.superclass.handleDayMouseEvent.apply(this, arguments);
    }
});

Ext.reg('monthview', Ext.calendar.MonthView);
