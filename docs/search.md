# Search Component

<img src="../src/js/examples/images/demo/search.gif" />

### Setup

```javascript
var searchSubmitCallback = function(event) {
    var companyID = parseInt(event.target.getAttribute('data-id')),
        companyName = event.target.innerText;

    alert('You just clicked on ' + companyName + '. It\'s ID is ' + companyID);
};
```

### Usage

```javascript
<Search url={'/test/search'} onSelect={searchSubmitCallback} isFullDataResponse={true} minLength={1}/>
```

### Data

```javascript
var searchData = [
    {"id": 10, "name": "Beazer Homes USA, Inc."},
    {"id": 16, "name": "Huntington Bancshares Inc."},
    {"id": 35, "name": "ExxonMobil Corporation"},
    {"id": 61, "name": "Pitney Bowes Inc."},
    {"id": 23, "name": "Xerox Corp"}
];
```
