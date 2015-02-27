# Table Component

<img src="../src/js/examples/images/demo/table.gif" />

### Setup
```javascript
var tableDefinition = {
        url: '/test/table',
        cols: [
            {
                dataType: 'select',
                dataProperty: 'name',
                width: '35px'
            },
            {
                headerLabel: 'NAME',
                dataProperty: 'name',
                sortDirection: 'ascending',
                dataType: 'string',
                width: '20%',
                quickFilter: true
            },
            {
                headerLabel: 'MESSAGES',
                dataProperty: 'messages',
                sortDirection: 'descending',
                dataType: 'number',
                width: '15%',
                quickFilter: true
            },
            {
                headerLabel: 'USAGE',
                dataProperty: 'usage',
                sortDirection: 'descending',
                dataType: 'percent',
                width: '10%',
                quickFilter: true
            },
            {
                headerLabel: 'LAST LOGIN',
                dataProperty: 'lastLogin',
                sortDirection: 'descending',
                dataType: 'time',
                timeFormat: 'MMM Do, h A',
                width: '25%',
                quickFilter: true
            },
            {
                headerLabel: 'LAST MESSAGE',
                dataProperty: 'lastMessage',
                sortDirection: 'descending',
                dataType: 'status',
                onlineLimit: 4,
                timeFormat: 'MMM Do, h:mm A',
                width: '24%',
                quickFilter: true
            }
        ],
        sortColIndex: 1,
        pagination: {
            cursor: 0,
            size: 12
        },
        rowClick: {
            callback: function(event, props, state) {
                var idx = event.currentTarget.rowIndex;
                alert(
                    'You just clicked on ' + state.data[idx][state.rowClick.labelKey || 'name'] + '.' +
                    'We just executed the user defined rowClick.callback:\n\n' +
                    'callback: function(event, props, state) {\n' +
                    '    var idx = event.currentTarget.rowIndex;\n' +
                    '    alert(\'You just clicked on +\'\n    state.data[idx][state.rowClick.labelKey \n    || \'name\'] + \'.\');\n' +
                    '}'
                );
            }
        }
    };
```

### Usage

```javascript
<Table definition={tableDefinition}
                   componentId='tableId'
                   key='tableId'
                   loadingIconClasses={['icon', 'ion-loading-c']}
                   quickFilterPlaceholder='Quick Filter' />
```

### Data

```javascript
var testTableData = [
    {"name": "Lory Borkholder", "messages": 4, "usage": 0, "lastLogin": 1423168675800, "lastMessage": 1423168675800},
    {"name": "Ethyl Rolan", "messages": 44, "usage": 5, "lastLogin": 1423165124993, "lastMessage": 1423165124993},
    {"name": "Remona Molloy", "messages": 3, "usage": 75, "lastLogin": 1422672380477, "lastMessage": 1422672380477},
    {"name": "Trista Stricker", "messages": 13, "usage": 3, "lastLogin": 1423023947375, "lastMessage": 1423023947375}
];
```
