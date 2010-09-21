/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.calendar.EventEditWindow = function(config){
	var formPanelCfg = {
		xtype: 'form',
        labelWidth: 65,
        frame: false,
        bodyStyle:'background:transparent;padding:5px 10px 10px;',
        bodyBorder:false,
        border:false,
        items:[{
            id: 'title',
            name: 'Title',
            fieldLabel: 'Title',
            xtype: 'textfield',
            anchor: '100%'
        },{
            xtype: 'daterangefield',
            id: 'date-range',
            anchor: '100%',
            fieldLabel: 'When'
		}]
    };
    
    if(config.calendarStore){
        this.calendarStore = config.calendarStore;
        delete config.calendarStore;
        
        formPanelCfg.items.push({
            xtype: 'calendarpicker',
            id: 'calendar',
            name: 'calendar',
            anchor: '100%',
            store: this.calendarStore
        });
    }

    Ext.calendar.EventEditWindow.superclass.constructor.call(this, Ext.apply({
        titleTextAdd: 'Add Event',
		titleTextEdit: 'Edit Event',
        width: 600,
        autocreate:true,
        border:true,
        closeAction:'hide',
        modal:false,
        resizable:false,
		
		savingMessage: 'Saving changes...',
		deletingMessage: 'Deleting event...',
		
        buttonAlign: 'left',
        fbar:[{
            xtype: 'tbtext', text: '<a href="#" id="tblink">Edit Details...</a>'
        },'->',{
            text:'Save', disabled:false, handler:this.onSave, scope:this
        },{
            id:'delete-btn', text:'Delete', disabled:false, handler:this.onDelete, scope:this, hideMode:'offsets'
        },{
            text:'Cancel', disabled:false, handler:this.onCancel, scope:this
        }],
        items: formPanelCfg
    }, config));
};

Ext.extend(Ext.calendar.EventEditWindow, Ext.Window, {

	newId: 10000,
	
    initComponent: function(){
        Ext.calendar.EventEditWindow.superclass.initComponent.call(this);
		
		this.formPanel = this.items.items[0];
		
		this.addEvents({
            eventadd: true,
			eventupdate: true,
            eventdelete: true,
			eventcancel: true,
            editdetails: true
        });
    },

    afterRender: function(){
        Ext.calendar.EventEditWindow.superclass.afterRender.call(this);
		
		this.el.addClass('ext-cal-event-win');
        
        Ext.get('tblink').on('click', function(e){
            e.stopEvent();
            this.updateRecord();
            this.fireEvent('editdetails', this, this.activeRecord);
        }, this);
    },
	
	/**
     * Shows the window, rendering it first if necessary, or activates it and brings it to front if hidden.
	 * @param {Ext.data.Record/Object} o Either a {@link Ext.data.Record} if showing the form
	 * for an existing event in edit mode, or a plain object containing a StartDate property (and 
	 * optionally an EndDate property) for showing the form in add mode. 
     * @param {String/Element} animateTarget (optional) The target element or id from which the window should
     * animate while opening (defaults to null with no animation)
     * @return {Ext.Window} this
     */
    show: function(o, animateTarget){
		// Work around the CSS day cell height hack needed for initial render in IE8/strict:
		var anim = (Ext.isIE8 && Ext.isStrict) ? null : animateTarget;

		Ext.calendar.EventEditWindow.superclass.show.call(this, anim, function(){
            Ext.getCmp('title').focus(false, 100);
        });
        Ext.getCmp('delete-btn')[o.data && o.data.EventId ? 'show' : 'hide']();
        
        var rec, f = this.formPanel.form;

        if(o.data){
            rec = o;
			this.isAdd = !!rec.data.IsNew;
			if(this.isAdd){
				// Enable adding the default record that was passed in
				// if it's new even if the user makes no changes 
				rec.markDirty();
				this.setTitle(this.titleTextAdd);
			}
			else{
				this.setTitle(this.titleTextEdit);
			}
            
            f.loadRecord(rec);
        }
        else{
			this.isAdd = true;
            this.setTitle(this.titleTextAdd);

            var start = o.StartDate;
            var end = o.EndDate || start.add('h', 1);
            
            rec = new Ext.calendar.EventRecord({
				EventId: this.newId++,
                StartDate: start,
                EndDate: end,
                IsNew: true,
                IsAllDay: !!o.IsAllDay || !!(o.EndDate && start.getDate() != o.EndDate.getDate()),
                IsReminder: false
            });

            f.reset();
            f.loadRecord(rec);
        }
        
        if(this.calendarStore){
            Ext.getCmp('calendar').setValue(rec.data.CalendarId);
        }
        Ext.getCmp('date-range').setValue(rec.data);
        this.activeRecord = rec;
        
		return this;
    },

    roundTime: function(dt, incr){
        incr = incr || 15;
        var m = parseInt(dt.getMinutes());
        return dt.add('mi', incr - (m % incr));
    },

    onCancel: function(){
    	this.cleanup(true);
		this.fireEvent('eventcancel', this);
    },

    cleanup: function(hide){
        if(this.activeRecord && this.activeRecord.dirty){
            this.activeRecord.reject();
        }
        delete this.activeRecord;
		
        if(hide===true){
			// Work around the CSS day cell height hack needed for initial render in IE8/strict:
			//var anim = afterDelete || (Ext.isIE8 && Ext.isStrict) ? null : this.animateTarget;
            this.hide();
        }
    },
    
    updateRecord: function(){
        var f = this.formPanel.form,
            dates = Ext.getCmp('date-range').getValue();
            
        f.updateRecord(this.activeRecord);
        this.activeRecord.set('StartDate', dates[0]);
        this.activeRecord.set('EndDate', dates[1]);
        this.activeRecord.set('IsAllDay', dates[2]);
        this.activeRecord.set('CalendarId', this.formPanel.form.findField('calendar').getValue());
    },

    onSave: function(){
        if(!this.formPanel.form.isValid()){
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