/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.calendar.DayHeaderTemplate = function(config){
    
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
