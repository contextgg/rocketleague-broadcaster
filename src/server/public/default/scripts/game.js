$(document).ready(function() {
  if(!('WebSocket' in window)){
    console.log('No support for websockets');
    return;
  }

  // Template for handlebars
  var template = $('#game-template').html();
  // Compile the template data into a function
  var templateScript = Handlebars.compile(template);
  // game element
  var game = $('#game')
  // create socket
  var socket = new WebSocket('ws://' + location.host);
  // open will send a message to the server
  socket.onopen = function (e) {
    socket.send('game');
  }
  // get a message from the server
  socket.onmessage = function (e) {
    try {
      var data = JSON.parse(e.data);
      console.log(data);
      game.html(templateScript(data));
    } catch (e) {
      console.log(e);
    }
  };
});
