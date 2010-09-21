/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.calendar.EventEditForm = Ext.extend(Ext.form.FormPanel, {
    labelWidth: 65,
    title: 'Event Form',
    titleTextAdd: 'Add Event',
    titleTextEdit: 'Edit Event',
    bodyStyle:'background:transparent;padding:20px 20px 10px;',
    border: false,
    buttonAlign: 'center',
    autoHeight: true,
    cls: 'ext-evt-edit-form',
    
    // private properties:
    newId: 10000,
    layout: 'column',
    
    initComponent: function(){
        
        this.addEvents({
            eventadd: true,
            eventupdate: true,
            eventdelete: true,
            eventcancel: true
        });
                
        this.titleField = new Ext.form.TextField({
            fieldLabel: 'Title',
            name: 'Title',
            anchor: '90%'
        });
        this.dateRangeField = new Ext.calendar.DateRangeField({
            fieldLabel: 'When',
            anchor: '90%'
        });
        this.reminderField = new Ext.calendar.ReminderField({
            name: 'Reminder'
        });
        this.notesField = new Ext.form.TextArea({
            fieldLabel: 'Notes',
            name: 'Notes',
            grow: true,
            growMax: 150,
            anchor: '100%'
        });
        this.locationField = new Ext.form.TextField({
            fieldLabel: 'Location',
            name: 'Location',
            anchor: '100%'
        });
        this.urlField = new Ext.form.TextField({
            fieldLabel: 'Web Link',
            name: 'Url',
            anchor: '100%'
        });
        
        var leftFields = [this.titleField, this.dateRangeField, this.reminderField], 
            rightFields = [this.notesField, this.locationField, this.urlField];
        
        if(this.calendarStore){
            this.calendarField = new Ext.calendar.CalendarPicker({
                store: this.calendarStore,
                name: 'CalendarId'
            });
            leftFields.splice(2, 0, this.calendarField);
        };
        
        this.items = [{
            id: 'left-col',
            columnWidth: .65,
            layout: 'form',
            border: false,
            items: leftFields
        },{
            id: 'right-col',
            columnWidth: .35,
            layout: 'form',
            border: false,
            items: rightFields
        }];
        
        this.fbar = [{
            text:'Save', scope: this, handler: this.onSave
        },{
            cls:'ext-del-btn', text:'Delete', scope:this, handler:this.onDelete
        },{
            text:'Cancel', scope: this, handler: this.onCancel
        }];
        
        Ext.calendar.EventEditForm.superclass.initComponent.call(this);
    },
    
    loadRecord: function(rec){
        this.form.loadRecord.apply(this.form, arguments);
        this.activeRecord = rec;
        this.dateRangeField.setValue(rec.data);
        if(this.calendarStore){
            this.form.setValues({'calendar': rec.data.CalendarId});
        }
        this.isAdd = !!rec.data.IsNew;
        if(this.isAdd){
            rec.markDirty();
            this.setTitle(this.titleTextAdd);
            Ext.select('.ext-del-btn').setDisplayed(false);
        }
        else {
            this.setTitle(this.titleTextEdit);
            Ext.select('.ext-del-btn').setDisplayed(true);
        }
        this.titleField.focus();
    },
    
    updateRecord: function(){
        var dates = this.dateRangeField.getValue();
            
        this.form.updateRecord(this.activeRecord);
        this.activeRecord.set('StartDate', dates[0]);
        this.activeRecord.set('EndDate', dates[1]);
        this.activeRecord.set('IsAllDay', dates[2]);
    },
    
    onCancel: function(){
        this.cleanup(true);
        this.fireEvent('eventcancel', this, this.activeRecord);
    },

    cleanup: function(hide){
        if(this.activeRecord && this.activeRecord.dirty){
            this.activeRecord.reject();
        }
        delete this.activeRecord;
        
        if(this.form.isDirty()){
            this.form.reset();
        }
    },
    
    onSave: function(){
        if(!this.form.isValid()){
            return;
        }
        this.updateRecord();
        
        if(!this.activeRecord.dirty){
            this.onCancel();
            return;
        }
        
        this.fireEvent(this.isAdd ? 'eventadd' : 'eventupdate', this, this.activeRecord);
    },

    onDelete: function(){
        this.fireEvent('eventdelete', this, this.activeRecord);
    }
});

Ext.reg('eventeditform', Ext.calendar.EventEditForm);
