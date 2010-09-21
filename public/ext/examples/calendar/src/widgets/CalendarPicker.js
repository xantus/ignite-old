/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
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
