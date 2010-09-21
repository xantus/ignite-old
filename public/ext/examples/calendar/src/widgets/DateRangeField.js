/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.calendar.DateRangeField = Ext.extend(Ext.form.Field, {
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
