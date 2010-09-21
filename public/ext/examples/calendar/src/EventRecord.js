/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/**
 * @class Ext.calendar.EventRecord
 * <p>This is the {@link Ext.data.Record Record} specification for calendar event data used by the
 * {@link Ext.calendar.CalendarPanel CalendarPanel}'s underlying store. It can be overridden as 
 * necessary to customize the fields supported by events, although the existing column names should
 * not be altered. If your model fields are named differently you should update the <b>mapping</b>
 * configs accordingly.</p>
 * <p>The only required fields when creating a new event record instance are StartDate and
 * EndDate.  All other fields are either optional are will be defaulted if blank.</p>
 * <p>Here is a basic example for how to create a new record of this type:<pre><code>
rec = new Ext.calendar.EventRecord({
    StartDate: '2101-01-12 12:00:00',
    EndDate: '2101-01-12 13:30:00',
    Title: 'My cool event',
    Notes: 'Some notes'
});
</code></pre>
 */
Ext.calendar.EventRecord = Ext.data.Record.create([
    {name:'EventId', mapping: 'id', type: 'int'},
    {name:'CalendarId', mapping: 'cid', type: 'int'},
    {name:'Title', mapping: 'title', type: 'string'},
    {name:'StartDate', mapping: 'start', type: 'date', dateFormat: 'c'},
    {name:'EndDate', mapping: 'end', type: 'date', dateFormat: 'c'},
    {name:'Location', mapping: 'loc', type: 'string'},
    {name:'Notes', mapping: 'notes', type: 'string'},
    {name:'Url', mapping: 'url', type: 'string'},
    {name:'IsAllDay', mapping: 'ad', type: 'boolean'},
    {name:'Reminder', mapping: 'rem', type: 'string'},
    {name:'IsNew', mapping: 'n', type: 'boolean'}
]);