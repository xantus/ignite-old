/*!
 * Ext JS Library 3.2.1
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.onReady(function(){

    io.setPath('/client/');

    var socket = new io.Socket(null, { rememberTransport: false, port: window.location.port || 80 });

    socket.addEvent('connect', function() {
        Ext.fly('status').update(String.format('<span style="color:green">Socket: Connected ({0})</span>', socket.transport.name));
        if ( Ext.log )
            Ext.log('Connected using '+socket.transport.name);
    });

    socket.addEvent('disconnect', function() {
        Ext.fly('status').update('<span style="color:red">Socket: Disconnected</span>');
        if ( Ext.log )
            Ext.log('Disconnected');
        socket.connect();
    });

    // create the Data Store
    var store = new Ext.data.ChannelStore({
        channel: '/stocks',
        socket: socket,
        root: 'items',
        totalProperty: 'total',
        idProperty: 'name',
        sortInfo: { field: 'name', direction: 'ASC' },

        fields: [
            'name',
            {name: 'last', type: 'float'},
            {name: 'norm', type: 'float'},
            {name: 'time', mapping: 'utime', type: 'date', dateFormat: 'timestamp'},
            {name: 'change', type: 'float'},
            {name: 'bid_size', type: 'int'},
            {name: 'bid', type: 'float'},
            {name: 'ask', type: 'float'},
            {name: 'ask_size', type: 'int'}
        ]

    });

    socket.connect();

    function renderTime(value, p, r){
        return String.format('{0}', value.dateFormat('M j, Y, g:i:s a'));
    }

    var map = {};
    var grid = new Ext.grid.GridPanel({
        width:700,
        height:300,
        title:'ExtJS.com - Browse Forums',
        store: store,
        trackMouseOver:false,
        disableSelection:true,
        loadMask: true,

        columns:[{
            header: "Stock",
            dataIndex: 'name',
            renderer: function(v) {
                return 'Stock '+( parseInt( v ) - 1 );
            },
            width: 100,
            sortable: true
        },{
            header: "Last",
            dataIndex: 'last',
            width: 55,
            sortable: true
        },{
            header: "Norm",
            dataIndex: 'name',
            width: 65,
            sortable: true,
            renderer: function( value, p, r ) {
                if ( !map[value] )
                    map[value] = parseFloat( r.data.last );
                var norm = r.data.last / map[value] * 100;
                return new String(norm).substr(0, norm >= 100 ? 6 : 5 );
            }
        },{
            header: "Time",
            dataIndex: 'time',
            width: 140,
            renderer: renderTime,
            sortable: true
        },{
            header: "Change",
            dataIndex: 'change',
            width: 65,
            sortable: true,
            renderer: function(value) {
                return String.format('<span style="color:{0}">{1}%</span>', ( value < 1 ? 'red' : 'green' ), value);
            }
        }, {
            header: "Bid Size",
            dataIndex: 'bid_size',
            width: 70,
            align: 'right',
            sortable: true
        },{
            header: "Bid",
            dataIndex: 'bid',
            width: 65,
            align: 'right',
            sortable: true
        },{
            header: "Ask",
            dataIndex: 'ask',
            width: 65,
            align: 'right',
            sortable: true
        },{
            header: "Ask Size",
            dataIndex: 'ask_size',
            width: 70,
            align: 'right',
            sortable: true
        }]
    });

    // render it
    grid.render('live-grid');

    store.load();
});

Ext.data.SocketIOProxy = function(config){
    Ext.apply( this, config );
    var api = {};
    api[Ext.data.Api.actions.read] = true;
    Ext.data.SocketIOProxy.superclass.constructor.call(this, {
        api: api
    });
    this.socket.addEvent('connect', this.onConnect.createDelegate( this ) );
    this.socket.addEvent('disconnect', this.onDisconnect.createDelegate( this ) );
    this.socket.addEvent('message', this.onMessage.createDelegate( this ) );

    this.data = [];
};

Ext.extend(Ext.data.SocketIOProxy, Ext.data.DataProxy, {

    doRequest: function(action, rs, params, reader, callback, scope, arg) {
        // action == 'read' ?
        this.reader = reader;
        this.callback = callback;
        this.scope = scope;
        this.arg = arg;
        // I feel dirty
    },

    onConnect:function() {
        this.connected = true;
    },

    onDisconnect: function() {
        this.connected = false;
    },

    onMessage: function( data ) {
        var obj = ( typeof data == 'object' ) ? data : Ext.util.JSON.decode( data );
        if ( !obj.channel || obj.channel != '/stocks' )
            return;

        var result;
        try {
            result = this.reader.readRecords(obj);
        } catch(e) {
            this.fireEvent('exception', this, 'response', 'read', this.arg, null, e);
            this.callback.call(this.scope, null, this.arg, false);
            return;
        }
        this.callback.call(this.scope, result, this.arg, true);
    }

});

Ext.data.ChannelStore = Ext.extend(Ext.data.JsonStore, {

    constructor: function(config) {
        var sock = config.socket;
        delete config.socket;
        Ext.data.ChannelStore.superclass.constructor.call(this, Ext.apply(config, {
            proxy: new Ext.data.SocketIOProxy({
                socket: sock
            })
        }));
    },

    loadRecords: function(recs, opts) {
        opts.add = true;
        Ext.data.ChannelStore.superclass.loadRecords.call(this, recs, opts, true);
    }

});

Ext.reg('channelstore', Ext.data.ChannelStore);

