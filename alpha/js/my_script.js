//helper
//settings = extend({}, def, config);
function extend(){
    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
}

var userSettings = {}

//for testing only
defaultUserSettings = {
    logo: true,
    greetings: true,
    search: "google", // "google", "yandex", "yahoo"
    apps: true,
    bookmarks: true,
    mostVisited: true,
    recentlyClosed: true,
    music: true
}

var UserSettingsModel = function(){

  this.searchText = ko.observable();

  this.init = function(){
    //built in defaults
    this.searchOptions = ["google", "yandex", "yahoo"];
    this.logo = ko.observable(true);
    this.greetings = ko.observable(true);
    this.search = ko.observable("google");
    this.apps = ko.observable(true);
    this.bookmarks = ko.observable(true);
    this.mostVisited = ko.observable(true);
    this.recentlyClosed = ko.observable(true);
    this.music = ko.observable(true);

    //subscribe to model changes
    this.logo.subscribe(saveUserSettings);
    this.greetings.subscribe(saveUserSettings);
    this.search.subscribe(saveUserSettings);
    this.apps.subscribe(saveUserSettings);
    this.bookmarks.subscribe(saveUserSettings);
    this.mostVisited.subscribe(saveUserSettings);
    this.recentlyClosed.subscribe(saveUserSettings);
    this.music.subscribe(saveUserSettings);
  }

  //for testing only, REMOVEME
  this.log = function(){
    console.log(ko.toJSON(this.search, null, 2));
  }

  //search handle
  this.doSearch = function(){

    console.log("doSearch handler", this.searchText());
    var text = this.searchText().trim();
    // console.log("doSearch handler", this.searchText());

    if(!text)
      return;

    var searchUrl = "";
    switch(this.search()){
      case "google":
        searchUrl = "https://google.com/search?q="
        break;
      case "yandex":
        searchUrl = "https://yandex.ru/search/?text="
        break;
      case "yahoo":
      searchUrl = "https://search.yahoo.com/search?p="
        break;
    }
    searchUrl = searchUrl + text.replace(/\s+/gi, "+")
    console.log("doSearch: search url", searchUrl);
    chrome.tabs.update({ active: true, url: searchUrl });
  }


  this.populate = function(data){
    console.log("populate", data);
    this.logo(data.logo)
    this.greetings(data.greetings)
    this.search(data.search)
    this.apps(data.apps)
    this.bookmarks(data.bookmarks)
    this.mostVisited(data.mostVisited)
    this.recentlyClosed(data.recentlyClosed)
    this.music(data.music)
  }

  this.init();
}


//model change handler
function saveUserSettings(){
  // console.log(ko.toJSON(ko.toJS(userSettings), null, 2));
  chrome.storage.local.set({'userSettings': ko.toJS(userSettings)}, function() {
    // var error = chrome.runtime.lastError;
    // console.log("chrome.runtime.lastError",error)
    // if(!error){
    //   chrome.storage.local.get('userSettings', function(items) {
    //     console.log("get from storage", items.userSettings);
    //   });
    // }
  });
}

//populate from local storage
function loadUserSettings(){
  chrome.storage.local.get('userSettings', function(items) {
    // console.log("get from storage", items);
    userSettings.populate(extend({}, defaultUserSettings, items.userSettings));
  });
}

//start
var userSettings = new UserSettingsModel();
ko.applyBindings(userSettings);
loadUserSettings();
