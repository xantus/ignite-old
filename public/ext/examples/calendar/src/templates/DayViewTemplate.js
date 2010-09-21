/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
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
