/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */

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
