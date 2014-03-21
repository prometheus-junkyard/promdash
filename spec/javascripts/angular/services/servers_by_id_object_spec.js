//= require spec_helper
var serversById = getService('ServersByIdObject');
describe('ThemeManager', function() {
  it('returns a server object keyed by id', function() {
    var server1 = {name:'server1', id:1}
    var server2 = {name:'server2', id:2}
    var server3 = {name:'server3', id:3}
    var server4 = {name:'server4', id:4}
    var servers = [ server1, server2, server3, server4 ];
    var serversObjMap = serversById(servers);

    for (var i = 0; i < servers.length; i++) {
      expect(serversObjMap[i+1]).toEqual(servers[i])
    }
  });
});
