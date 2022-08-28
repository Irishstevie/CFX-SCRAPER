const { exit } = require('process');
const http = require('request');
const fs = require('fs');
var _Arg1 = process.argv[2]; // Argument 1
var _Arg2 = process.argv[3]; // Argument 2
var _Arg3 = process.argv[4]; // Argument Type of Execution

var _ServerCache = [] // Cache the servers from the FiveM-API
var _RequestServerInformation = [] // Cache the servers from the FiveM-API we already searched
var _AnonServers = []  // Servers that are private [Not in server list] - This wont display player names/identifiers [Only Server Name and Info]
var _TotalServersCached = 0 // Total servers cached
var _TotalServersFinished = 0 // Total servers finished
var _TotalFailedRequestes = 0 // Total failed requests 
var _TotalOfflineServers = 0 // Total offline servers
var _TotalRecoveredServers = 0 // Total servers recovered that we couln't reach due to ratelimit issues
var _TotalPlayersFound = 0 // Total players found
var _TotalFoundByArgument = 0 // Total servers found by argument


function isLinuxServer(string) { if (string.indexOf('win32') > -1) {    return "Windows";}else{    return "Linux";}}
function log(string) { console.log(string);}
function _exit() {process.exit();}
function _saveArray() { fs.writeFileSync(`_TempData.json`, JSON.stringify(_RequestServerInformation, null, 4));setTimeout(_saveArray, 1000 * 2);}_saveArray()
function _delay(ms) { return new Promise(resolve => setTimeout(resolve, ms));}



function SearchByServerName(_CurrentIP, _CurrentID, body) {
    var _AnonServer = false
    var _FailedServerID = ''
    var _FailedServerIP = ''
    var _serverJSONData = JSON.parse(body);
    var _getPlayers = _serverJSONData.Data.players;
    var _totalClients = _serverJSONData.Data.clients;
    var _gameType = _serverJSONData.Data.gamename;
    var _country = _serverJSONData.Data.locale;
    var _serverHostName = _serverJSONData.Data.hostname;
    var _hostType = isLinuxServer(_serverJSONData.Data.server);
    var _serverVersion = _serverJSONData.Data.server
    var _serverResources = _serverJSONData.Data.resources;
    var _maxClients = _serverJSONData.Data.vars.maxClients;
    var _projectName = _serverJSONData.Data.vars.sv_projectName;
    var _projectDescription = _serverJSONData.Data.vars.sv_projectDesc;
    var _oneSync = _serverJSONData.Data.vars.onesync_enabled;
    var _enforceBuild = _serverJSONData.Data.vars.sv_enforceGameBuild;
    var _scriptHook = _serverJSONData.Data.vars.sv_scriptHookAllowed;
    var _purityLevel = _serverJSONData.Data.sv_pureLevel;
    var _serverDiscord = _serverJSONData.Data.vars.Discord;
    var _ownerForum = _serverJSONData.Data.ownerProfile;
    var _ownerForumName = _serverJSONData.Data.ownerName;
    var _ownerForumID = _serverJSONData.Data.ownerID;
    var _serverSupportStatus = _serverJSONData.Data.support_status;
    var _serverTags = _serverJSONData.Data.vars.tags;
    var _AnonServer = _serverJSONData.Data.private;
    var PlayerList = []
    if (_projectName != undefined) {
        if (_projectName.toLowerCase().includes(_Arg1.toLowerCase())) {
            _TotalFoundByArgument++
            for (let i = 0; i < _getPlayers.length; i++) {
                _TotalPlayersFound++
                if (_getPlayers[i].identifiers != '') {
                    var IdentitiyInformation = []
                    for (let x = 0; x < _getPlayers[i].identifiers.length; x++) {
                        if (_getPlayers[i].identifiers[x].includes('steam:')) {
                            _temp = {"type": "Steam", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('license:')) {
                            _temp = {"type": "License", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('xbl:')) {
                            _temp = {"type": "Xbl", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('live:')) {
                            _temp = {"type": "Live", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('fivem:')) {
                            _temp = {"type": "FiveM", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('discord:')) {
                            _temp = {"type": "Discord", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                    }
                    PlayerList.push({"name": _getPlayers[i].name,"identity": IdentitiyInformation,"ping": _getPlayers[i].ping,"id": _getPlayers[i].id})
                }else{
                    _FailedServerID = _CurrentID
                    _FailedServerIP = _CurrentIP
                    _AnonServer = true 
                }
            }
            _RequestServerInformation.push({"Server Unique ID": _CurrentID,"Server IPv4": _CurrentIP,"Server Host Name": _serverHostName,"Server Project Name": _projectName,"Server Project Description": _projectDescription,"Server Tags": _serverTags,"Server Discord": _serverDiscord,"Server Owner Forum": _ownerForum,"Server Owner Forum Name": _ownerForumName,"Server Owner Forum ID": _ownerForumID,"Server Support Status": _serverSupportStatus,"Server Purity Level": _purityLevel,"Server Enforce Build": _enforceBuild,"Server Script Hook": _scriptHook,"Server OneSync": _oneSync,"Server Max Clients": _maxClients,"Server Total Clients": _totalClients,"Private Server": _AnonServer,"Server Game Type": _gameType,"Server Country": _country,"Server Host Type": _hostType,"Server Version": _serverVersion,"Server Resources": _serverResources,"Server Players": PlayerList})
            if (_AnonServer == true) {
                _AnonServer = false
                _AnonServers.push(_CurrentID)
            }
        }
    }
}
function SearchByResourceName(_CurrentIP, _CurrentID, body) {
    var _AnonServer = false
    var _FoundVariable = false
    var _FailedServerID = ''
    var _FailedServerIP = ''
    var _serverJSONData = JSON.parse(body);
    var _getPlayers = _serverJSONData.Data.players;
    var _totalClients = _serverJSONData.Data.clients;
    var _gameType = _serverJSONData.Data.gamename;
    var _country = _serverJSONData.Data.locale;
    var _serverHostName = _serverJSONData.Data.hostname;
    var _hostType = isLinuxServer(_serverJSONData.Data.server);
    var _serverVersion = _serverJSONData.Data.server
    var _serverResources = _serverJSONData.Data.resources;
    var _maxClients = _serverJSONData.Data.vars.maxClients;
    var _projectName = _serverJSONData.Data.vars.sv_projectName;
    var _projectDescription = _serverJSONData.Data.vars.sv_projectDesc;
    var _oneSync = _serverJSONData.Data.vars.onesync_enabled;
    var _enforceBuild = _serverJSONData.Data.vars.sv_enforceGameBuild;
    var _scriptHook = _serverJSONData.Data.vars.sv_scriptHookAllowed;
    var _purityLevel = _serverJSONData.Data.sv_pureLevel;
    var _serverDiscord = _serverJSONData.Data.vars.Discord;
    var _ownerForum = _serverJSONData.Data.ownerProfile;
    var _ownerForumName = _serverJSONData.Data.ownerName;
    var _ownerForumID = _serverJSONData.Data.ownerID;
    var _serverSupportStatus = _serverJSONData.Data.support_status;
    var _serverTags = _serverJSONData.Data.vars.tags;
    var _AnonServer = _serverJSONData.Data.private;
    var PlayerList = []
    if (_projectName != undefined) {
        for (x in _serverResources) {
            if (_serverResources[x].toLowerCase().includes(_Arg1.toLowerCase())) {
                _FoundVariable = true
            } 
        }
        if (_FoundVariable == true) {
            _TotalFoundByArgument++
            for (let i = 0; i < _getPlayers.length; i++) {
                _TotalPlayersFound++
                if (_getPlayers[i].identifiers != '') {
                    var IdentitiyInformation = []
                    for (let x = 0; x < _getPlayers[i].identifiers.length; x++) {
                        if (_getPlayers[i].identifiers[x].includes('steam:')) {
                            _temp = {"type": "Steam", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('license:')) {
                            _temp = {"type": "License", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('xbl:')) {
                            _temp = {"type": "Xbl", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('live:')) {
                            _temp = {"type": "Live", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('fivem:')) {
                            _temp = {"type": "FiveM", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('discord:')) {
                            _temp = {"type": "Discord", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                    }
                    PlayerList.push({"name": _getPlayers[i].name,"identity": IdentitiyInformation,"ping": _getPlayers[i].ping,"id": _getPlayers[i].id,})
                }else{
                    _FailedServerID = _CurrentID
                    _FailedServerIP = _CurrentIP
                    _AnonServer = true 
                }
            }
            _RequestServerInformation.push({"Server Unique ID": _CurrentID,"Server IPv4": _CurrentIP,"Server Host Name": _serverHostName,"Server Project Name": _projectName,"Server Project Description": _projectDescription,"Server Tags": _serverTags,"Server Discord": _serverDiscord,"Server Owner Forum": _ownerForum,"Server Owner Forum Name": _ownerForumName,"Server Owner Forum ID": _ownerForumID,"Server Support Status": _serverSupportStatus,"Server Purity Level": _purityLevel,"Server Enforce Build": _enforceBuild,"Server Script Hook": _scriptHook,"Server OneSync": _oneSync,"Server Max Clients": _maxClients,"Server Total Clients": _totalClients,"Private Server": _AnonServer,"Server Game Type": _gameType,"Server Country": _country,"Server Host Type": _hostType,"Server Version": _serverVersion,"Server Resources": _serverResources,"Server Players": PlayerList,})
            if (_AnonServer == true) {
                _AnonServer = false
                _AnonServers.push(_CurrentID)
            }
        }
    }
}
function SearchByPlayerCount(_CurrentIP, _CurrentID, body) {
    var _AnonServer = false
    var _FailedServerID = ''
    var _FailedServerIP = '' 
    var _serverJSONData = JSON.parse(body);
    var _getPlayers = _serverJSONData.Data.players;
    var _totalClients = _serverJSONData.Data.clients;
    var _gameType = _serverJSONData.Data.gamename;
    var _country = _serverJSONData.Data.locale;
    var _serverHostName = _serverJSONData.Data.hostname;
    var _hostType = isLinuxServer(_serverJSONData.Data.server);
    var _serverVersion = _serverJSONData.Data.server
    var _serverResources = _serverJSONData.Data.resources;
    var _maxClients = _serverJSONData.Data.vars.maxClients;
    var _projectName = _serverJSONData.Data.vars.sv_projectName;
    var _projectDescription = _serverJSONData.Data.vars.sv_projectDesc;
    var _oneSync = _serverJSONData.Data.vars.onesync_enabled;
    var _enforceBuild = _serverJSONData.Data.vars.sv_enforceGameBuild;
    var _scriptHook = _serverJSONData.Data.vars.sv_scriptHookAllowed;
    var _purityLevel = _serverJSONData.Data.sv_pureLevel;
    var _serverDiscord = _serverJSONData.Data.vars.Discord;
    var _ownerForum = _serverJSONData.Data.ownerProfile;
    var _ownerForumName = _serverJSONData.Data.ownerName;
    var _ownerForumID = _serverJSONData.Data.ownerID;
    var _serverSupportStatus = _serverJSONData.Data.support_status;
    var _serverTags = _serverJSONData.Data.vars.tags;
    var _AnonServer = _serverJSONData.Data.private;
    var PlayerList = []
    if (_projectName != undefined) {
        if (_totalClients >= _Arg1 && _totalClients <= _Arg2) {
            _TotalFoundByArgument++
            for (let i = 0; i < _getPlayers.length; i++) {
                _TotalPlayersFound++
                if (_getPlayers[i].identifiers != '') {
                    var IdentitiyInformation = []
                    for (let x = 0; x < _getPlayers[i].identifiers.length; x++) {
                        if (_getPlayers[i].identifiers[x].includes('steam:')) {
                            _temp = {"type": "Steam", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('license:')) {
                            _temp = {"type": "License", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('xbl:')) {
                            _temp = {"type": "Xbl", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('live:')) {
                            _temp = {"type": "Live", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('fivem:')) {
                            _temp = {"type": "FiveM", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('discord:')) {
                            _temp = {"type": "Discord", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                    }
                    PlayerList.push({"name": _getPlayers[i].name,"identity": IdentitiyInformation,"ping": _getPlayers[i].ping,"id": _getPlayers[i].id,})
                }else{
                    _FailedServerID = _CurrentID
                    _FailedServerIP = _CurrentIP
                    _AnonServer = true 
                }
            }
            _RequestServerInformation.push({"Server Unique ID": _CurrentID,"Server IPv4": _CurrentIP,"Server Host Name": _serverHostName,"Server Project Name": _projectName,"Server Project Description": _projectDescription,"Server Tags": _serverTags,"Server Discord": _serverDiscord,"Server Owner Forum": _ownerForum,"Server Owner Forum Name": _ownerForumName,"Server Owner Forum ID": _ownerForumID,"Server Support Status": _serverSupportStatus,"Server Purity Level": _purityLevel,"Server Enforce Build": _enforceBuild,"Server Script Hook": _scriptHook,"Server OneSync": _oneSync,"Server Max Clients": _maxClients,"Server Total Clients": _totalClients,"Private Server": _AnonServer,"Server Game Type": _gameType,"Server Country": _country,"Server Host Type": _hostType,"Server Version": _serverVersion,"Server Resources": _serverResources,"Server Players": PlayerList,})
            if (_AnonServer == true) {
                _AnonServer = false
                _AnonServers.push(_CurrentID)
            }
        }
    }
}
function SearchByOneSync(_CurrentIP, _CurrentID, body) {
    var _AnonServer = false
    var _FailedServerID = ''
    var _FailedServerIP = ''
    var _serverJSONData = JSON.parse(body);
    var _getPlayers = _serverJSONData.Data.players;
    var _totalClients = _serverJSONData.Data.clients;
    var _gameType = _serverJSONData.Data.gamename;
    var _country = _serverJSONData.Data.locale;
    var _serverHostName = _serverJSONData.Data.hostname;
    var _hostType = isLinuxServer(_serverJSONData.Data.server);
    var _serverVersion = _serverJSONData.Data.server
    var _serverResources = _serverJSONData.Data.resources;
    var _maxClients = _serverJSONData.Data.vars.maxClients;
    var _projectName = _serverJSONData.Data.vars.sv_projectName;
    var _projectDescription = _serverJSONData.Data.vars.sv_projectDesc;
    var _oneSync = _serverJSONData.Data.vars.onesync_enabled;
    var _enforceBuild = _serverJSONData.Data.vars.sv_enforceGameBuild;
    var _scriptHook = _serverJSONData.Data.vars.sv_scriptHookAllowed;
    var _purityLevel = _serverJSONData.Data.sv_pureLevel;
    var _serverDiscord = _serverJSONData.Data.vars.Discord;
    var _ownerForum = _serverJSONData.Data.ownerProfile;
    var _ownerForumName = _serverJSONData.Data.ownerName;
    var _ownerForumID = _serverJSONData.Data.ownerID;
    var _serverSupportStatus = _serverJSONData.Data.support_status;
    var _serverTags = _serverJSONData.Data.vars.tags;
    var _AnonServer = _serverJSONData.Data.private;
    var PlayerList = []
    if (_projectName != undefined) {
        if (_oneSync.toLowerCase() == _Arg1.toLowerCase()) {
            _TotalFoundByArgument++
            for (let i = 0; i < _getPlayers.length; i++) {
                _TotalPlayersFound++
                if (_getPlayers[i].identifiers != '') {
                    var IdentitiyInformation = []
                    for (let x = 0; x < _getPlayers[i].identifiers.length; x++) {
                        if (_getPlayers[i].identifiers[x].includes('steam:')) {
                            _temp = {"type": "Steam", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('license:')) {
                            _temp = {"type": "License", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('xbl:')) {
                            _temp = {"type": "Xbl", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('live:')) {
                            _temp = {"type": "Live", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('fivem:')) {
                            _temp = {"type": "FiveM", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('discord:')) {
                            _temp = {"type": "Discord", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                    }
                    PlayerList.push({"name": _getPlayers[i].name,"identity": IdentitiyInformation,"ping": _getPlayers[i].ping,"id": _getPlayers[i].id,})
                }else{
                    _FailedServerID = _CurrentID
                    _FailedServerIP = _CurrentIP
                    _AnonServer = true 
                }
            }
            _RequestServerInformation.push({"Server Unique ID": _CurrentID,"Server IPv4": _CurrentIP,"Server Host Name": _serverHostName,"Server Project Name": _projectName,"Server Project Description": _projectDescription,"Server Tags": _serverTags,"Server Discord": _serverDiscord,"Server Owner Forum": _ownerForum,"Server Owner Forum Name": _ownerForumName,"Server Owner Forum ID": _ownerForumID,"Server Support Status": _serverSupportStatus,"Server Purity Level": _purityLevel,"Server Enforce Build": _enforceBuild,"Server Script Hook": _scriptHook,"Server OneSync": _oneSync,"Server Max Clients": _maxClients,"Server Total Clients": _totalClients,"Private Server": _AnonServer,"Server Game Type": _gameType,"Server Country": _country,"Server Host Type": _hostType,"Server Version": _serverVersion,"Server Resources": _serverResources,"Server Players": PlayerList,})
            if (_AnonServer == true) {
                _AnonServer = false
                _AnonServers.push(_CurrentID)
            }
        }
    }
}
function SearchByScripthook(_CurrentIP, _CurrentID, body) {
    var _AnonServer = false
    var _FailedServerID = ''
    var _FailedServerIP = ''
    var _serverJSONData = JSON.parse(body);
    var _getPlayers = _serverJSONData.Data.players;
    var _totalClients = _serverJSONData.Data.clients;
    var _gameType = _serverJSONData.Data.gamename;
    var _country = _serverJSONData.Data.locale;
    var _serverHostName = _serverJSONData.Data.hostname;
    var _hostType = isLinuxServer(_serverJSONData.Data.server);
    var _serverVersion = _serverJSONData.Data.server
    var _serverResources = _serverJSONData.Data.resources;
    var _maxClients = _serverJSONData.Data.vars.maxClients;
    var _projectName = _serverJSONData.Data.vars.sv_projectName;
    var _projectDescription = _serverJSONData.Data.vars.sv_projectDesc;
    var _oneSync = _serverJSONData.Data.vars.onesync_enabled;
    var _enforceBuild = _serverJSONData.Data.vars.sv_enforceGameBuild;
    var _scriptHook = _serverJSONData.Data.vars.sv_scriptHookAllowed;
    var _purityLevel = _serverJSONData.Data.sv_pureLevel;
    var _serverDiscord = _serverJSONData.Data.vars.Discord;
    var _ownerForum = _serverJSONData.Data.ownerProfile;
    var _ownerForumName = _serverJSONData.Data.ownerName;
    var _ownerForumID = _serverJSONData.Data.ownerID;
    var _serverSupportStatus = _serverJSONData.Data.support_status;
    var _serverTags = _serverJSONData.Data.vars.tags;
    var _AnonServer = _serverJSONData.Data.private;
    var PlayerList = []
    if (_projectName != undefined) {
        if (_scriptHook.toLowerCase() == _Arg1.toLowerCase()) {
            _TotalFoundByArgument++
            for (let i = 0; i < _getPlayers.length; i++) {
                _TotalPlayersFound++
                if (_getPlayers[i].identifiers != '') {
                    var IdentitiyInformation = []
                    for (let x = 0; x < _getPlayers[i].identifiers.length; x++) {
                        if (_getPlayers[i].identifiers[x].includes('steam:')) {
                            _temp = {"type": "Steam", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('license:')) {
                            _temp = {"type": "License", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('xbl:')) {
                            _temp = {"type": "Xbl", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('live:')) {
                            _temp = {"type": "Live", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('fivem:')) {
                            _temp = {"type": "FiveM", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('discord:')) {
                            _temp = {"type": "Discord", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                    }
                    PlayerList.push({"name": _getPlayers[i].name,"identity": IdentitiyInformation,"ping": _getPlayers[i].ping,"id": _getPlayers[i].id,})
                }else{
                    _FailedServerID = _CurrentID
                    _FailedServerIP = _CurrentIP
                    _AnonServer = true 
                }
            }
            _RequestServerInformation.push({"Server Unique ID": _CurrentID,"Server IPv4": _CurrentIP,"Server Host Name": _serverHostName,"Server Project Name": _projectName,"Server Project Description": _projectDescription,"Server Tags": _serverTags,"Server Discord": _serverDiscord,"Server Owner Forum": _ownerForum,"Server Owner Forum Name": _ownerForumName,"Server Owner Forum ID": _ownerForumID,"Server Support Status": _serverSupportStatus,"Server Purity Level": _purityLevel,"Server Enforce Build": _enforceBuild,"Server Script Hook": _scriptHook,"Server OneSync": _oneSync,"Server Max Clients": _maxClients,"Server Total Clients": _totalClients,"Private Server": _AnonServer,"Server Game Type": _gameType,"Server Country": _country,"Server Host Type": _hostType,"Server Version": _serverVersion,"Server Resources": _serverResources,"Server Players": PlayerList,})
            if (_AnonServer == true) {
                _AnonServer = false
                _AnonServers.push(_CurrentID)
            }
        }
    }
}
function SearchByBuildVersion(_CurrentIP, _CurrentID, body) {
    var _AnonServer = false
    var _FailedServerID = ''
    var _FailedServerIP = ''
    var _serverJSONData = JSON.parse(body);
    var _getPlayers = _serverJSONData.Data.players;
    var _totalClients = _serverJSONData.Data.clients;
    var _gameType = _serverJSONData.Data.gamename;
    var _country = _serverJSONData.Data.locale;
    var _serverHostName = _serverJSONData.Data.hostname;
    var _hostType = isLinuxServer(_serverJSONData.Data.server);
    var _serverVersion = _serverJSONData.Data.server
    var _serverResources = _serverJSONData.Data.resources;
    var _maxClients = _serverJSONData.Data.vars.maxClients;
    var _projectName = _serverJSONData.Data.vars.sv_projectName;
    var _projectDescription = _serverJSONData.Data.vars.sv_projectDesc;
    var _oneSync = _serverJSONData.Data.vars.onesync_enabled;
    var _enforceBuild = _serverJSONData.Data.vars.sv_enforceGameBuild;
    var _scriptHook = _serverJSONData.Data.vars.sv_scriptHookAllowed;
    var _purityLevel = _serverJSONData.Data.sv_pureLevel;
    var _serverDiscord = _serverJSONData.Data.vars.Discord;
    var _ownerForum = _serverJSONData.Data.ownerProfile;
    var _ownerForumName = _serverJSONData.Data.ownerName;
    var _ownerForumID = _serverJSONData.Data.ownerID;
    var _serverSupportStatus = _serverJSONData.Data.support_status;
    var _serverTags = _serverJSONData.Data.vars.tags;
    var _AnonServer = _serverJSONData.Data.private;
    var PlayerList = []
    if (_projectName != undefined) {
        if (_enforceBuild.toLowerCase() == _Arg1.toLowerCase()) {
            _TotalFoundByArgument++
            for (let i = 0; i < _getPlayers.length; i++) {
                _TotalPlayersFound++
                if (_getPlayers[i].identifiers != '') {
                    var IdentitiyInformation = []
                    for (let x = 0; x < _getPlayers[i].identifiers.length; x++) {
                        if (_getPlayers[i].identifiers[x].includes('steam:')) {
                            _temp = {"type": "Steam", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('license:')) {
                            _temp = {"type": "License", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('xbl:')) {
                            _temp = {"type": "Xbl", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('live:')) {
                            _temp = {"type": "Live", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('fivem:')) {
                            _temp = {"type": "FiveM", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('discord:')) {
                            _temp = {"type": "Discord", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                    }
                    PlayerList.push({"name": _getPlayers[i].name,"identity": IdentitiyInformation,"ping": _getPlayers[i].ping,"id": _getPlayers[i].id,})
                }else{
                    _FailedServerID = _CurrentID
                    _FailedServerIP = _CurrentIP
                    _AnonServer = true 
                }
            }
            _RequestServerInformation.push({"Server Unique ID": _CurrentID,"Server IPv4": _CurrentIP,"Server Host Name": _serverHostName,"Server Project Name": _projectName,"Server Project Description": _projectDescription,"Server Tags": _serverTags,"Server Discord": _serverDiscord,"Server Owner Forum": _ownerForum,"Server Owner Forum Name": _ownerForumName,"Server Owner Forum ID": _ownerForumID,"Server Support Status": _serverSupportStatus,"Server Purity Level": _purityLevel,"Server Enforce Build": _enforceBuild,"Server Script Hook": _scriptHook,"Server OneSync": _oneSync,"Server Max Clients": _maxClients,"Server Total Clients": _totalClients,"Private Server": _AnonServer,"Server Game Type": _gameType,"Server Country": _country,"Server Host Type": _hostType,"Server Version": _serverVersion,"Server Resources": _serverResources,"Server Players": PlayerList,})
            if (_AnonServer == true) {
                _AnonServer = false
                _AnonServers.push(_CurrentID)
            }
        }
    }
}
function SearchByHostType(_CurrentIP, _CurrentID, body) {
    var _AnonServer = false 
    var _FailedServerID = ''
    var _FailedServerIP = ''
    var _serverJSONData = JSON.parse(body);
    var _getPlayers = _serverJSONData.Data.players;
    var _totalClients = _serverJSONData.Data.clients;
    var _gameType = _serverJSONData.Data.gamename;
    var _country = _serverJSONData.Data.locale;
    var _serverHostName = _serverJSONData.Data.hostname;
    var _hostType = isLinuxServer(_serverJSONData.Data.server);
    var _serverVersion = _serverJSONData.Data.server
    var _serverResources = _serverJSONData.Data.resources;
    var _maxClients = _serverJSONData.Data.vars.maxClients;
    var _projectName = _serverJSONData.Data.vars.sv_projectName;
    var _projectDescription = _serverJSONData.Data.vars.sv_projectDesc;
    var _oneSync = _serverJSONData.Data.vars.onesync_enabled;
    var _enforceBuild = _serverJSONData.Data.vars.sv_enforceGameBuild;
    var _scriptHook = _serverJSONData.Data.vars.sv_scriptHookAllowed;
    var _purityLevel = _serverJSONData.Data.sv_pureLevel;
    var _serverDiscord = _serverJSONData.Data.vars.Discord;
    var _ownerForum = _serverJSONData.Data.ownerProfile;
    var _ownerForumName = _serverJSONData.Data.ownerName;
    var _ownerForumID = _serverJSONData.Data.ownerID;
    var _serverSupportStatus = _serverJSONData.Data.support_status;
    var _serverTags = _serverJSONData.Data.vars.tags;
    var _AnonServer = _serverJSONData.Data.private;
    var PlayerList = []
    if (_projectName != undefined) {
        if (_hostType.toLowerCase() == _Arg1.toLowerCase()) {
            _TotalFoundByArgument++
            for (let i = 0; i < _getPlayers.length; i++) {
                _TotalPlayersFound++
                if (_getPlayers[i].identifiers != '') {
                    var IdentitiyInformation = []
                    for (let x = 0; x < _getPlayers[i].identifiers.length; x++) {
                        if (_getPlayers[i].identifiers[x].includes('steam:')) {
                            _temp = {"type": "Steam", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('license:')) {
                            _temp = {"type": "License", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('xbl:')) {
                            _temp = {"type": "Xbl", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('live:')) {
                            _temp = {"type": "Live", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('fivem:')) {
                            _temp = {"type": "FiveM", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('discord:')) {
                            _temp = {"type": "Discord", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                    }
                    PlayerList.push({"name": _getPlayers[i].name,"identity": IdentitiyInformation,"ping": _getPlayers[i].ping,"id": _getPlayers[i].id,})
                }else{
                    _FailedServerID = _CurrentID
                    _FailedServerIP = _CurrentIP
                    _AnonServer = true 
                }
            }
            _RequestServerInformation.push({"Server Unique ID": _CurrentID,"Server IPv4": _CurrentIP,"Server Host Name": _serverHostName,"Server Project Name": _projectName,"Server Project Description": _projectDescription,"Server Tags": _serverTags,"Server Discord": _serverDiscord,"Server Owner Forum": _ownerForum,"Server Owner Forum Name": _ownerForumName,"Server Owner Forum ID": _ownerForumID,"Server Support Status": _serverSupportStatus,"Server Purity Level": _purityLevel,"Server Enforce Build": _enforceBuild,"Server Script Hook": _scriptHook,"Server OneSync": _oneSync,"Server Max Clients": _maxClients,"Server Total Clients": _totalClients,"Private Server": _AnonServer,"Server Game Type": _gameType,"Server Country": _country,"Server Host Type": _hostType,"Server Version": _serverVersion,"Server Resources": _serverResources,"Server Players": PlayerList,})
            if (_AnonServer == true) {
                _AnonServer = false
                _AnonServers.push(_CurrentID)
            }
        }
    }
}
function SearchBySupportType(_CurrentIP, _CurrentID, body) {
    var _AnonServer = false 
    var _FailedServerID = ''
    var _FailedServerIP = ''
    var _serverJSONData = JSON.parse(body);
    var _getPlayers = _serverJSONData.Data.players;
    var _totalClients = _serverJSONData.Data.clients;
    var _gameType = _serverJSONData.Data.gamename;
    var _country = _serverJSONData.Data.locale;
    var _serverHostName = _serverJSONData.Data.hostname;
    var _hostType = isLinuxServer(_serverJSONData.Data.server);
    var _serverVersion = _serverJSONData.Data.server
    var _serverResources = _serverJSONData.Data.resources;
    var _maxClients = _serverJSONData.Data.vars.maxClients;
    var _projectName = _serverJSONData.Data.vars.sv_projectName;
    var _projectDescription = _serverJSONData.Data.vars.sv_projectDesc;
    var _oneSync = _serverJSONData.Data.vars.onesync_enabled;
    var _enforceBuild = _serverJSONData.Data.vars.sv_enforceGameBuild;
    var _scriptHook = _serverJSONData.Data.vars.sv_scriptHookAllowed;
    var _purityLevel = _serverJSONData.Data.sv_pureLevel;
    var _serverDiscord = _serverJSONData.Data.vars.Discord;
    var _ownerForum = _serverJSONData.Data.ownerProfile;
    var _ownerForumName = _serverJSONData.Data.ownerName;
    var _ownerForumID = _serverJSONData.Data.ownerID;
    var _serverSupportStatus = _serverJSONData.Data.support_status;
    var _serverTags = _serverJSONData.Data.vars.tags;
    var _AnonServer = _serverJSONData.Data.private;
    var PlayerList = []
    if (_projectName != undefined && _serverSupportStatus != undefined) {
        if (_serverSupportStatus.toLowerCase() == _Arg1.toLowerCase()) {
            _TotalFoundByArgument++
            for (let i = 0; i < _getPlayers.length; i++) {
                _TotalPlayersFound++
                if (_getPlayers[i].identifiers != '') {
                    var IdentitiyInformation = []
                    for (let x = 0; x < _getPlayers[i].identifiers.length; x++) {
                        if (_getPlayers[i].identifiers[x].includes('steam:')) {
                            _temp = {"type": "Steam", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('license:')) {
                            _temp = {"type": "License", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('xbl:')) {
                            _temp = {"type": "Xbl", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('live:')) {
                            _temp = {"type": "Live", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('fivem:')) {
                            _temp = {"type": "FiveM", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                        if (_getPlayers[i].identifiers[x].includes('discord:')) {
                            _temp = {"type": "Discord", "id": _getPlayers[i].identifiers[x]}
                            IdentitiyInformation.push(_temp)
                        }
                    }
                    PlayerList.push({"name": _getPlayers[i].name,"identity": IdentitiyInformation,"ping": _getPlayers[i].ping,"id": _getPlayers[i].id,})
                }else{
                    _FailedServerID = _CurrentID
                    _FailedServerIP = _CurrentIP
                    _AnonServer = true 
                }
            }
            _RequestServerInformation.push({"Server Unique ID": _CurrentID,"Server IPv4": _CurrentIP,"Server Host Name": _serverHostName,"Server Project Name": _projectName,"Server Project Description": _projectDescription,"Server Tags": _serverTags,"Server Discord": _serverDiscord,"Server Owner Forum": _ownerForum,"Server Owner Forum Name": _ownerForumName,"Server Owner Forum ID": _ownerForumID,"Server Support Status": _serverSupportStatus,"Server Purity Level": _purityLevel,"Server Enforce Build": _enforceBuild,"Server Script Hook": _scriptHook,"Server OneSync": _oneSync,"Server Max Clients": _maxClients,"Server Total Clients": _totalClients,"Private Server": _AnonServer,"Server Game Type": _gameType,"Server Country": _country,"Server Host Type": _hostType,"Server Version": _serverVersion,"Server Resources": _serverResources,"Server Players": PlayerList,})
            if (_AnonServer == true) {
                _AnonServer = false
                _AnonServers.push(_CurrentID)
            }
        }
    }
}
function PlayerNameSearch(_CurrentIP, _CurrentID, body) {
    var _AnonServer = false
    var _FoundVariable = false
    var _FailedServerID = ''
    var _FailedServerIP = ''
    var _serverJSONData = JSON.parse(body);
    var _getPlayers = _serverJSONData.Data.players;
    var _totalClients = _serverJSONData.Data.clients;
    var _gameType = _serverJSONData.Data.gamename;
    var _country = _serverJSONData.Data.locale;
    var _serverHostName = _serverJSONData.Data.hostname;
    var _hostType = isLinuxServer(_serverJSONData.Data.server);
    var _serverVersion = _serverJSONData.Data.server
    var _serverResources = _serverJSONData.Data.resources;
    var _maxClients = _serverJSONData.Data.vars.maxClients;
    var _projectName = _serverJSONData.Data.vars.sv_projectName;
    var _projectDescription = _serverJSONData.Data.vars.sv_projectDesc;
    var _oneSync = _serverJSONData.Data.vars.onesync_enabled;
    var _enforceBuild = _serverJSONData.Data.vars.sv_enforceGameBuild;
    var _scriptHook = _serverJSONData.Data.vars.sv_scriptHookAllowed;
    var _purityLevel = _serverJSONData.Data.sv_pureLevel;
    var _serverDiscord = _serverJSONData.Data.vars.Discord;
    var _ownerForum = _serverJSONData.Data.ownerProfile;
    var _ownerForumName = _serverJSONData.Data.ownerName;
    var _ownerForumID = _serverJSONData.Data.ownerID;
    var _serverSupportStatus = _serverJSONData.Data.support_status;
    var _serverTags = _serverJSONData.Data.vars.tags;
    var _AnonServer = _serverJSONData.Data.private;
    var _PlayerNameFound = [];
    var PlayerList = []
    if (_projectName != undefined) {
        if (_AnonServer == false) {
            for (let i = 0; i < _getPlayers.length; i++) {
                if (_getPlayers[i].name.toLowerCase().includes(_Arg1.toLowerCase())) {
                    _FoundVariable = true;
                    log(`Player was seen on ${_CurrentIP} - ${_CurrentID}`)
                    _PlayerNameFound.push({name: _getPlayers[i].name,id: _getPlayers[i].id, identifiers: _getPlayers[i].identifiers})
                }
            }
        }
        if (_FoundVariable == true) {
            _TotalFoundByArgument++
            for (let i = 0; i < _getPlayers.length; i++) {
                _TotalPlayersFound++
                if (_getPlayers[i].identifiers != '') {
                    // Good Server
                }else{
                    _FailedServerID = _CurrentID
                    _FailedServerIP = _CurrentIP
                    _AnonServer = true 
                }
            }
            _RequestServerInformation.push({"Server Unique ID": _CurrentID,"Server IPv4": _CurrentIP,"Server Host Name": _serverHostName,"Server Project Name": _projectName,"Server Project Description": _projectDescription,"Server Tags": _serverTags,"Server Discord": _serverDiscord,"Server Owner Forum": _ownerForum,"Server Owner Forum Name": _ownerForumName,"Server Owner Forum ID": _ownerForumID,"Server Support Status": _serverSupportStatus,"Server Purity Level": _purityLevel,"Server Enforce Build": _enforceBuild,"Server Script Hook": _scriptHook,"Server OneSync": _oneSync,"Server Max Clients": _maxClients,"Server Total Clients": _totalClients,"Private Server": _AnonServer,"Server Game Type": _gameType,"Server Country": _country,"Server Host Type": _hostType,"Server Version": _serverVersion,"Server Players Found": _PlayerNameFound,})
            if (_AnonServer == true) {
                _AnonServer = false
                _AnonServers.push(_CurrentID)
            }
        }
    }
}
function PlayerIdentifierSearch(_CurrentIP, _CurrentID, body) {
    var _AnonServer = false
    var _FoundVariable = false
    var _FailedServerID = ''
    var _FailedServerIP = ''
    var _serverJSONData = JSON.parse(body);
    var _getPlayers = _serverJSONData.Data.players;
    var _totalClients = _serverJSONData.Data.clients;
    var _gameType = _serverJSONData.Data.gamename;
    var _country = _serverJSONData.Data.locale;
    var _serverHostName = _serverJSONData.Data.hostname;
    var _hostType = isLinuxServer(_serverJSONData.Data.server);
    var _serverVersion = _serverJSONData.Data.server
    var _serverResources = _serverJSONData.Data.resources;
    var _maxClients = _serverJSONData.Data.vars.maxClients;
    var _projectName = _serverJSONData.Data.vars.sv_projectName;
    var _projectDescription = _serverJSONData.Data.vars.sv_projectDesc;
    var _oneSync = _serverJSONData.Data.vars.onesync_enabled;
    var _enforceBuild = _serverJSONData.Data.vars.sv_enforceGameBuild;
    var _scriptHook = _serverJSONData.Data.vars.sv_scriptHookAllowed;
    var _purityLevel = _serverJSONData.Data.sv_pureLevel;
    var _serverDiscord = _serverJSONData.Data.vars.Discord;
    var _ownerForum = _serverJSONData.Data.ownerProfile;
    var _ownerForumName = _serverJSONData.Data.ownerName;
    var _ownerForumID = _serverJSONData.Data.ownerID;
    var _serverSupportStatus = _serverJSONData.Data.support_status;
    var _serverTags = _serverJSONData.Data.vars.tags;
    var _AnonServer = _serverJSONData.Data.private;
    var _PlayerNameFound = [];
    var PlayerList = []
    if (_projectName != undefined) {
        if (_AnonServer == false) {
            for (let i = 0; i < _getPlayers.length; i++) {
                for (let x = 0; x < _getPlayers[i].identifiers.length; x++) {
                    if (_getPlayers[i].identifiers[x].includes(_Arg1.toLowerCase())) {
                        _PlayerNameFound.push({name: _getPlayers[i].name,id: _getPlayers[i].id, identifiers: _getPlayers[i].identifiers})
                        _FoundVariable = true
                    }
                }
            }
        }
        if (_FoundVariable == true) {
            _TotalFoundByArgument++
            for (let i = 0; i < _getPlayers.length; i++) {
                _TotalPlayersFound++
                if (_getPlayers[i].identifiers != '') {
                    // Good Server
                }else{
                    _FailedServerID = _CurrentID
                    _FailedServerIP = _CurrentIP
                    _AnonServer = true 
                }
            }
            _RequestServerInformation.push({"Server Unique ID": _CurrentID,"Server IPv4": _CurrentIP,"Server Host Name": _serverHostName,"Server Project Name": _projectName,"Server Project Description": _projectDescription,"Server Tags": _serverTags,"Server Discord": _serverDiscord,"Server Owner Forum": _ownerForum,"Server Owner Forum Name": _ownerForumName,"Server Owner Forum ID": _ownerForumID,"Server Support Status": _serverSupportStatus,"Server Purity Level": _purityLevel,"Server Enforce Build": _enforceBuild,"Server Script Hook": _scriptHook,"Server OneSync": _oneSync,"Server Max Clients": _maxClients,"Server Total Clients": _totalClients,"Private Server": _AnonServer,"Server Game Type": _gameType,"Server Country": _country,"Server Host Type": _hostType,"Server Version": _serverVersion,"Server Players Found": _PlayerNameFound[0]})
            if (_AnonServer == true) {
                _AnonServer = false
                _AnonServers.push(_CurrentID)
            }
            fs.writeFileSync(`_TempData.json`, JSON.stringify(_RequestServerInformation, null, 4)) 
            setTimeout(function() {
            log(`Player was seen on ${_CurrentIP} - ${_CurrentID}`)
            _exit()
            }, 1000)
        }
    }
}
function ScrapeAllInformation(_CurrentIP, _CurrentID, body) {
    var _AnonServer = false
    var _FailedServerID = ''
    var _FailedServerIP = ''
    var _serverJSONData = JSON.parse(body);
    var _getPlayers = _serverJSONData.Data.players;
    var _totalClients = _serverJSONData.Data.clients;
    var _gameType = _serverJSONData.Data.gamename;
    var _country = _serverJSONData.Data.locale;
    var _serverHostName = _serverJSONData.Data.hostname;
    var _hostType = isLinuxServer(_serverJSONData.Data.server);
    var _serverVersion = _serverJSONData.Data.server
    var _serverResources = _serverJSONData.Data.resources;
    var _maxClients = _serverJSONData.Data.vars.maxClients;
    var _projectName = _serverJSONData.Data.vars.sv_projectName;
    var _projectDescription = _serverJSONData.Data.vars.sv_projectDesc;
    var _oneSync = _serverJSONData.Data.vars.onesync_enabled;
    var _enforceBuild = _serverJSONData.Data.vars.sv_enforceGameBuild;
    var _scriptHook = _serverJSONData.Data.vars.sv_scriptHookAllowed;
    var _purityLevel = _serverJSONData.Data.sv_pureLevel;
    var _serverDiscord = _serverJSONData.Data.vars.Discord;
    var _ownerForum = _serverJSONData.Data.ownerProfile;
    var _ownerForumName = _serverJSONData.Data.ownerName;
    var _ownerForumID = _serverJSONData.Data.ownerID;
    var _serverSupportStatus = _serverJSONData.Data.support_status;
    var _serverTags = _serverJSONData.Data.vars.tags;
    var _AnonServer = _serverJSONData.Data.private;
    var PlayerList = []
    for (let i = 0; i < _getPlayers.length; i++) {
        _TotalPlayersFound++
        if (_getPlayers[i].identifiers != '') {
            var IdentitiyInformation = []
            for (let x = 0; x < _getPlayers[i].identifiers.length; x++) {
                if (_getPlayers[i].identifiers[x].includes('steam:')) {
                    _temp = {"type": "Steam", "id": _getPlayers[i].identifiers[x]}
                    IdentitiyInformation.push(_temp)
                }
                if (_getPlayers[i].identifiers[x].includes('license:')) {
                    _temp = {"type": "License", "id": _getPlayers[i].identifiers[x]}
                    IdentitiyInformation.push(_temp)
                }
                if (_getPlayers[i].identifiers[x].includes('xbl:')) {
                    _temp = {"type": "Xbl", "id": _getPlayers[i].identifiers[x]}
                    IdentitiyInformation.push(_temp)
                }
                if (_getPlayers[i].identifiers[x].includes('live:')) {
                    _temp = {"type": "Live", "id": _getPlayers[i].identifiers[x]}
                    IdentitiyInformation.push(_temp)
                }
                if (_getPlayers[i].identifiers[x].includes('fivem:')) {
                    _temp = {"type": "FiveM", "id": _getPlayers[i].identifiers[x]}
                    IdentitiyInformation.push(_temp)
                }
                if (_getPlayers[i].identifiers[x].includes('discord:')) {
                    _temp = {"type": "Discord", "id": _getPlayers[i].identifiers[x]}
                    IdentitiyInformation.push(_temp)
                }
            }
            PlayerList.push({"name": _getPlayers[i].name,"identity": IdentitiyInformation,"ping": _getPlayers[i].ping,"id": _getPlayers[i].id,})
        }else{
            _FailedServerID = _CurrentID
            _FailedServerIP = _CurrentIP
            _AnonServer = true 
        }
    }
    _RequestServerInformation.push({"Server Unique ID": _CurrentID,"Server IPv4": _CurrentIP,"Server Host Name": _serverHostName,"Server Project Name": _projectName,"Server Project Description": _projectDescription,"Server Tags": _serverTags,"Server Discord": _serverDiscord,"Server Owner Forum": _ownerForum,"Server Owner Forum Name": _ownerForumName,"Server Owner Forum ID": _ownerForumID,"Server Support Status": _serverSupportStatus,"Server Purity Level": _purityLevel,"Server Enforce Build": _enforceBuild,"Server Script Hook": _scriptHook,"Server OneSync": _oneSync,"Server Max Clients": _maxClients,"Server Total Clients": _totalClients,"Private Server": _AnonServer,"Server Game Type": _gameType,"Server Country": _country,"Server Host Type": _hostType,"Server Version": _serverVersion,"Server Resources": _serverResources,"Server Players": PlayerList,})
    if (_AnonServer == true) {
        _AnonServer = false
        _AnonServers.push(_CurrentID)
    }
}


function _getServers() {  // This is pretty big so relax and eat a cookie or some shit. [Estimated Time per 1000 Servers: ~1.5 minutes] (So basically 20 ish minutes if you have good internet)
    var headers = {	'Content-Type': 'application/json',	'Accept-Encoding': 'gzip',    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'};
    var options = {url: 'https://servers-frontend.fivem.net/api/servers/streamRedir/',method: 'GET',headers: headers,gzip: true};
    log("Sent GET Request")
    http(options, function(error, response, body) {
        if (!error && response.statusCode == 200) { 
            const RegularExpression = /\x0A\x06(?! *locale)(?<id>[a-z0-9]{6})\x12([^]*?)?(?<ip>(?:\d{1,3}\.){3}\d{1,3}:\d{1,5})/gim 
            for (const match of body.matchAll(RegularExpression)) {
                _ServerCache.push({id: match.groups.id,ip: match.groups.ip,})
                _TotalServersCached++   
            }
            log(`Retrieved ${_TotalServersCached} Servers`)
            _Execute()
        }else{
            log(`Failed to connect to FiveM API - Host Down?`);
            _exit()
        }
    });
}


async function CommitAction(_CurrentIP, _CurrentID, body) {
    var getArumentChoice = _Arg3
    if (getArumentChoice == '-Sn') { // Search by Server Name
        SearchByServerName(_CurrentIP, _CurrentID, body)
    }else if (getArumentChoice == '-Sd') { // Search by Server ID
        SearchByServerID(_CurrentIP, _CurrentID, body)
    }else if (getArumentChoice == '-Rn') { // Search by ResourceName
        SearchByResourceName(_CurrentIP, _CurrentID, body)
    }else if (getArumentChoice == '-Pc') { // Search by Player Count
        SearchByPlayerCount(_CurrentIP, _CurrentID, body)
    }else if (getArumentChoice == '-O') { // Search by OneSync Boolean
        SearchByOneSync(_CurrentIP, _CurrentID, body)
    }else if (getArumentChoice == '-S') { // Search by Scripthook Boolean
        SearchByScripthook(_CurrentIP, _CurrentID, body)
    }else if (getArumentChoice == '-B') { // Search by Build Version
        SearchByBuildVersion(_CurrentIP, _CurrentID, body)
    }else if (getArumentChoice == '-H') { // Search by Host Type
        SearchByHostType(_CurrentIP, _CurrentID, body)
    }else if (getArumentChoice == '-Su') { // Search by Support Type Boolean
        SearchBySupportType(_CurrentIP, _CurrentID, body)
    }else if (getArumentChoice == '-Pn') { // Player Name Searching [Only Live Data]
        PlayerNameSearch(_CurrentIP, _CurrentID, body)
    }else if (getArumentChoice == '-Pi') { // Player Identifier Searching [Only Live Data]
        PlayerIdentifierSearch(_CurrentIP, _CurrentID, body)
    }else if (getArumentChoice == '-Sq') { // Scrape All Information from servers and players
        ScrapeAllInformation(_CurrentIP, _CurrentID, body)
    }else{
        log(`Invalid Argument Choice`)
        _exit()
    }
}

async function _ExecuteAgain(_CurrentIP, _CurrentID) {
    var _FailedServerID = ''  // We are going to need this because we are going to retry the request if it fails
    var _FailedServerIP = '' // We are going to need this because we are going to retry the request if it fails
    var _CheckFailed = false // Check if we failed to request a server
    var headers = {	'Content-Type': 'application/json',	'Accept-Encoding': 'gzip','user-agent': 'Mozilla/5.0'};
    var options = {url: `https://servers-frontend.fivem.net/api/servers/single/${_CurrentID}`,method: 'GET',headers: headers,gzip: true};
    http(options, function(error, response, body) {
        var _CurrentIP = _CurrentIP
        var _CurrentID = _CurrentID
        if (!error && response.statusCode == 200) {
            CommitAction(_CurrentIP, _CurrentID, body)
            _TotalRecoveredServers++
        }else{
            if (response.statusCode == 404) {
                _TotalOfflineServers++
                log('[Server Manager]', `${response.statusCode} is offline.`)
                _FailedServerID = _CurrentID
                _FailedServerIP = _CurrentIP
                _CheckFailed = true 
            }else{
                _TotalFailedRequestes++ 
            }
        }
        _TotalServersFinished++
        log(`Total Private Servers - ${_AnonServers.length}`)
        log(`Total Failed Servers - ${_TotalFailedRequestes}`)
        log(`Total Servers Finished - ${_TotalServersFinished} / ${_TotalServersCached} - ${_TotalFoundByArgument}`)
        log(`Total Players Discovered - ${_TotalPlayersFound}`)
        log(`Total Offline Servers - ${_TotalOfflineServers}`)
        log(`Total Recovered Servers - ${_TotalRecoveredServers}`)
    });
    if (_CheckFailed == true) {
        _TotalFailedRequestes++
    }
}

    
async function _Execute() { 
    var _FailedServerID = ''  // We are going to need this because we are going to retry the request if it fails
    var _FailedServerIP = '' // We are going to need this because we are going to retry the request if it fails
    var _CheckFailed = false // Check if we failed to request a server
    for (let i =0; i < _ServerCache.length; i++) {
        if (i % 75 === 0) { // Every 75 servers, wait 3 seconds to prevent rate limit (This is a nice way to prevent ratelimit issues in the future)
            await _delay(3000);
        }
        var headers = {	'Content-Type': 'application/json',	'Accept-Encoding': 'gzip','user-agent': 'Mozilla/5.0'};
        var options = {url: `https://servers-frontend.fivem.net/api/servers/single/${_ServerCache[i].id}`,method: 'GET',headers: headers,gzip: true};
        http(options, function(error, response, body) {
            var _CurrentIP = _ServerCache[i].ip
            var _CurrentID = _ServerCache[i].id
            if (!error && response.statusCode == 200) {
                CommitAction(_CurrentIP, _CurrentID, body)
            }else{
                _FailedServerID = _CurrentID
                _FailedServerIP = _CurrentIP
                _CheckFailed = true 
            }
            _TotalServersFinished++
            log(`Total Private Servers - ${_AnonServers.length}`)
            log(`Total Failed Servers - ${_TotalFailedRequestes}`)
            log(`Total Servers Finished - ${_TotalServersFinished} / ${_TotalServersCached} - ${_TotalFoundByArgument}`)
            log(`Total Players Discovered - ${_TotalPlayersFound}`)
            log(`Total Offline Servers - ${_TotalOfflineServers}`)
            log(`Total Recovered Servers - ${_TotalRecoveredServers}`)
        });
        if (_CheckFailed == true) {
            log(`Failed to get server information for ${_FailedServerID} - Waiting 5 seconds to try again`)
            await _delay(5000);
            _CheckFailed = false
            _ExecuteAgain(_FailedServerIP, _FailedServerID)
        }
    }
}
_getServers()