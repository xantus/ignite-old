/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.calendar.MonthDayDetailView = Ext.extend(Ext.BoxComponent, {
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
