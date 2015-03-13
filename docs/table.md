# Table Component

<img src="../src/js/examples/images/demo/table.gif" />

### Usage

```
componentId
    type: string
    required: true
    description: Used by the TableStore to keep track of Table state
    
key
    type: string
    required: true
    description: Used by React when there are more than one table displayed consecutively by a component
    
definition
    type: object
    required: true
    definition: This defines the look, feel, and display of the table
    
    url
        type: string
        required: true
        description: The endpoint for requesting data
    
    dataFormatter
        type: function
        required: false
        description: Will be called first whenever data is received from the server for custom post processing of data
    
    filters
        type: object
        required: false
        description: Sent as data with requests to the server
            
    pagination
        type: object
        required: false
        description: Enables Table pagination
        
        cursor
            type: number
            required: true
            description: The starting index of the table pagination (usually this is initially set to 0)
            
        size
            type: number
            required: true
            description: The number of elements to show within a paginated view of the table
            
    sortColIndex
        type: number
        required: false
        description: The default column to sort which requires sortDirection to be depicted in at least one object in definition.cols
        
    rowClick
        type: object
        required: false
        description: Enables row clicks on a Table
        
        callback
            type: function
            required: true
            description: A custom function to be called when a row is clicked
        
    noResultsText
        type: string
        required: false
        default: "No results found."
        description: The text that will be displayed when there are no items in the table
        
    quickFilterPlaceholder
        type: string
        required: false
        default: "Filter"
        description: The placeholder text to display in the filter input field
        
    iconClasses
        type: object
        required: false
        default: {
            deselectAll: 'fa fa-minus-square-o',
            pageLeft: 'fa fa-chevron-left',
            pageRight: 'fa fa-chevron-right',
            rowsCollapsed: 'fa fa-chevron-right',
            rowsExpanded: 'fa fa-chevron-down',
            selectAll: 'fa fa fa-square-o',
            selectOn: 'fa fa-check-square-o',
            selectOff: 'fa fa-square-o',
            sortAsc: 'fa fa-sort-asc',
            sortDesc: 'fa fa-sort-desc',
            statusOn: 'fa fa-circle',
            statusOff: 'fa fa-circle-o'
        }
        description: Used to override default icons
        
    loadingIconClasses
        type: array|string
        required: false
        default: 'icon ion-loading-c'
        description: Used to override the loading icon
        
    cols
        type: array
        required: true
        description: An array of column definitions
        
        dataType
            type: string
            required: true
            description: one of ['string', 'number', 'percent', 'time', 'status', 'select']
            
        dataProperty
            type: string
            required: true
            description: The property to use as the value from the data that came from the server
        
        headerLabel
            type: string
            required: false
            description: The label displayed in the header of the column
        
        onlineLimit
            type: number
            required: false
            description: Used with dataType of status to depict the time frame for the online indicator to display
        
        quickFilter
            type: boolean
            required: false
            description: Depicts if the column is filterable (defaults to False)
        
        sortDirection
            type: string
            required: false
            description: one of ['ascending', 'descending'] for the default sorting direction of a column
        
        timeFormat
            type: string
            required: false
            description: see [Momentjs](http://momentjs.com/docs/#/displaying/) used for dataTypes of time and status to display timestamps
        
        width
            type: string
            required: false
            description: css width for the column
```

#### Example Usage

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

```javascript
<Table definition={tableDefinition}
                   componentId='tableId'
                   key='tableId'
                   loadingIconClasses={['icon', 'ion-loading-c']}
                   quickFilterPlaceholder='Quick Filter' />
```

#### Example Data

```javascript
var testTableData = [
    {"name": "Lory Borkholder", "messages": 4, "usage": 0, "lastLogin": 1423168675800, "lastMessage": 1423168675800},
    {"name": "Ethyl Rolan", "messages": 44, "usage": 5, "lastLogin": 1423165124993, "lastMessage": 1423165124993},
    {"name": "Remona Molloy", "messages": 3, "usage": 75, "lastLogin": 1422672380477, "lastMessage": 1422672380477},
    {"name": "Trista Stricker", "messages": 13, "usage": 3, "lastLogin": 1423023947375, "lastMessage": 1423023947375}
];
```
