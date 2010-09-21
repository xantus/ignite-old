/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
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
