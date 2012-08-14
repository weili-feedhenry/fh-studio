// TODO: remove these globals
var change_password_button = null;

$(document).ready(function () {
  $(document).bind('keyup', function (e) {
    try {
      if (e.altKey && e.ctrlKey && e.keyCode === 71) { // Ctrl-Alt-G
        alert('app:' + $fw.data.get('app').guid + '\ninst:' + $fw.data.get('inst').guid);
      }
    }
    catch (e) {
      // fail silently
    }
  });
  console.log('init and set IDEManager as client of FrameworkManager');
  // $fw.client becomes available as well as $fw.app
  $fw.setClient(new IDEManager());
  $fw.initClient();
  
});