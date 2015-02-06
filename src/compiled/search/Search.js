define(function(require) {
    'use strict';

    var _     = require('lodash');
    var React = require('react');
    var SearchActions = require('drc/search/SearchActions');
    var SearchStore = require('drc/search/SearchStore');
    var Utils = require('drc/utils/Utils');

    var Search = React.createClass({displayName: 'Search',
        focusedIndex: null,
        actionOverList: false,
        currentFilteredList: [],
        /**
         * Map of keycodes to handler functions when focused on a autocomplete item
         * @type {Object}
         */
        listKeyCodeHandlers: {
            38: 'focusPrev',        //Up arrow
            40: 'focusNext',        //Down arrow
            27: 'clearList',        //Esc
            13: 'selectItemOnEnter' //Enter
        },
        getInitialState: function(){
            return {
                placeholder: 'Loading...',
                disabled: true,
                itemList: [],
                shownList: [],
                inputValue: '',
                inputFocused: false
            };
        },

        /**
         * Subscribe to specific change event and fire off a data request to do initial
         * data population
         */
        componentDidMount: function(){
            SearchStore.on('change', this.onDataReceived);
            SearchStore.on('fail', this.onError);
            SearchActions.requestData(this.props.url);

            //Hook up page click event to close list when user clicks outside search component
            $(document).mouseup(_.bind(function(e){
                var container = $(".search-component");

                if(!container.is(e.target) && container.has(e.target).length === 0){
                    this.hideList();
                }
            }, this));
        },

        /**
         * Error handler for failed request. Updates failure message and sets
         * input to be disabled
         * @return {[type]} [description]
         */
        onError: function(){
            this.setState({placeholder: 'Unable to load list', disabled: true});
        },

        /**
         * Unsubscribe from events if this component is removed
         */
        componentWillUnmount: function() {
            SearchStore.removeListener('change', this.onDataReceived);
        },

        /**
         * Handle store change event.
         */
        onDataReceived: function() {
            var data = SearchStore.getData();
            var placeholder = 'Search';

            if(!data){
                this.onError();
                return;
            }

            if (this.props.placeholder && typeof this.props.placeholder === 'string') {
                placeholder = this.props.placeholder;
            }

            this.setState({itemList: data, disabled: false, placeholder: placeholder});
        },

        /**
         * Given a search term culls the item list to the list of closely matching item names. Search
         * will be case insensitive and ignore spaces.
         * @param  {String} searchTerm Term to search on
         * @return {Array}             List of matching items
         */
        getListOfMatchesForQuery: function(searchTerm){
            var matches = [];
            searchTerm = searchTerm.toLowerCase().split(" ").join("");
            _.forEach(this.state.itemList, function(item){
                var itemName = item.name.toLowerCase().split(" ").join(""),
                    containsLocation = itemName.indexOf(searchTerm);
                if(containsLocation > -1){
                    item.matchIndex = containsLocation;
                    matches.push(item);
                }
            });
            if(matches.length){
                matches.sort(this.sortMatchingEntries);
            }
            return matches;
        },

        /**
         * Sorts matching item results from search to better find the closest match.
         * @param  {String} a First match
         * @param  {String} b Second match
         * @return {Number}   Sort order, either -1, 0, or 1
         */
        sortMatchingEntries: function(a, b){
            //Put matches that are earliest in the string first
            if(a.matchIndex > b.matchIndex){
                return 1;
            }
            if(a.matchIndex < b.matchIndex){
                return -1;
            }
            //If match is at same location, put shorter strings first
            if(a.name.length > b.name.length){
                return 1;
            }
            if(a.name.length < b.name.length){
                return -1;
            }
            //Finally, sort alphabetically
            if(a.name > b.name){
                return 1;
            }
            if(a.name < b.name){
                return -1;
            }
            return 0;
        },

        /**
         * Change handler for input element. Causes item list to update
         * and display
         * @param  {Object} event Input change event
         */
        onChange: function(event){
            var searchTerm = event.target.value;
            this.setState({inputValue: searchTerm});
            if(searchTerm.length === 0){
                this.currentFilteredList = [];
                this.setState({shownList: []});
            }
            else{
                var listToShow = this.getListOfMatchesForQuery(searchTerm);
                this.currentFilteredList = listToShow;
                this.setState({shownList: listToShow});
            }
        },

        /**
         * Focus handler for input element.
         */
        onFocus: function(){
            this.focusedIndex = null;
            this.setState({shownList: this.currentFilteredList, inputFocused: true});
        },

        /**
         * Handles blur event on input element. Only hides list if the action isn't
         * occurring on the autocomplete list
         * @return {[type]} [description]
         */
        onBlur: function(){
            //If the users mouse is currently in the list, don't hide it
            if(this.actionOverList){
                return;
            }
            this.hideList();
        },

        /**
         * Handles keypress events when user is focused on search input element. Supports hitting the down
         * arrow to iterate over the result list and escape to close the list and reset input
         * @param  {Object} event Event object
         */
        onInputKeyPress: function(event){
            //We only care about key down (40) and escape (27)
            if(!event.keyCode || (event.keyCode !== 40 && event.keyCode !== 27)){
                return;
            }
            event.preventDefault();
            if(event.keyCode === 40){
                this.focusNext();
            }
            else{
                this.currentFilteredList = [];
                this.setState({shownList: [], inputValue: ''});
            }
        },

        /**
         * Handles keypress events when the user is focused on the autocomplete list. Supports moving up and
         * down between elements, hitting escape to clear the list, and hitting enter to select
         * @param  {Object} event Key event
         */
        onListKeyPress: function(event){
            var handler = this.listKeyCodeHandlers[event.keyCode];
            //Not an event we care about
            if(!handler || !this[handler]){
                return;
            }
            event.preventDefault();
            this[handler]();
        },

        /**
         * Focuses on the next item in the list
         */
        focusNext: function(){
            var index = this.focusedIndex;
            this.focusOnItemAtIndex(index === null ? 0 : ++index);
        },

        /**
         * Focuses on the previous item in the list. If at the top, changes
         * focus back to the input element
         */
        focusPrev: function(){
            var index = this.focusedIndex;
            if(index === null){
                return;
            }
            if(index === 0){
                this.refs.searchInput.getDOMNode().focus();
            }
            else{
                this.focusOnItemAtIndex(--index);
            }
        },

        /**
         * Calls focus() on the list item at the index specified
         * @param  {Number} index Index to focus
         */
        focusOnItemAtIndex: function(index){
            var list = this.refs.list.getDOMNode().childNodes;
            if(index > -1 && index < list.length){
                this.focusedIndex = index;
                this.actionOverList = true;
                list[index].focus();
            }
        },

        /**
         * Clears everything from the component (input text, autocomplete list)
         * @param  {Boolean} clearFocus Whether to not focus on input element
         */
        clearList: function(clearFocus){
            this.actionOverList = false;
            this.currentFilteredList = [];
            this.setState({inputValue: ''});
            this.hideList();
            if(!clearFocus){
                this.refs.searchInput.getDOMNode().focus();
            }
        },

        /**
         * Hides the autocomplete list but doesn't clear it's contents
         */
        hideList: function(){
            this.focusedIndex = null;
            this.setState({shownList: [], inputFocused: false});
        },

        /**
         * Selects the item and fires off the event to create a new tab. Also
         * clears all content in the search input
         */
        selectItemOnEnter: function(){
            var selectedItem = this.refs.list.getDOMNode().childNodes[this.focusedIndex];
            this.itemSelect({target: selectedItem});
        },

        /**
         * Handles a click or mouse enter event on autocomplete list item. Causes
         * searchSubmitCallback to be fired, hides autocomplete list, and clears out input
         * element value
         * @param  {Object} event Click/enter key event
         */
        itemSelect: function(event) {
            if (this.props.searchSubmitCallback && typeof this.props.searchSubmitCallback === 'function') {
                this.props.searchSubmitCallback(event);
            }

            this.clearList(true);
        },

        /**
         * Event when a user mouses over an element in the list
         * @param  {Object} event Mouse event
         */
        handleListMouseEnter: function(event){
            this.actionOverList = true;
            event.target.focus();
            _.forEach(this.refs.list.getDOMNode().childNodes, _.bind(function(child, index){
                if(child === event.target){
                    this.focusedIndex = index;
                }
            }, this));
        },

        /**
         * Event when a user mouses out of the autocomplete list
         * @param  {Object} event Mouse event
         */
        handleListMouseLeave: function(event){
            this.actionOverList = false;
        },

        /**
         * Returns list of autocomplete items to show in dropdown
         * @return {Array} List of nodes to display
         */
        getAutocompleteComponents: function(){
            var markup = [];
            _.forEach(this.state.shownList, _.bind(function(item){
                markup.push(
                    React.createElement("li", {key: item.id, 'data-id': item.id, tabIndex: "-1", onMouseEnter: this.handleListMouseEnter}, item.name)
                );
            }, this));
            return markup;
        },

        render: function() {
            var autoCompleteMarkup = this.getAutocompleteComponents(),
                searchIconClasses = React.addons.classSet({
                    fa: true,
                    'fa-search': true,
                    focused: this.state.inputFocused
                });

            return (
                React.createElement("div", {className: "search-component"}, 
                    React.createElement("div", {className: "input-group"}, 
                        React.createElement("i", {className: searchIconClasses}), 
                        React.createElement("input", {ref: "searchInput", 
                               value: this.state.inputValue, 
                               type: "text", 
                               autoComplete: "off", 
                               placeholder: this.state.placeholder, 
                               disabled: this.state.disabled, 
                               onChange: this.onChange, 
                               onFocus: this.onFocus, 
                               onBlur: this.onBlur, 
                               onKeyDown: this.onInputKeyPress}
                        ), 
                        React.createElement("ul", {ref: "list", 
                            className: "autocomplete-list", 
                            onClick: this.itemSelect, 
                            onMouseLeave: this.handleListMouseLeave, 
                            onKeyDown: this.onListKeyPress}, 

                            autoCompleteMarkup
                        )
                    )
                )
            );
        }
    });

    return Search;
});
