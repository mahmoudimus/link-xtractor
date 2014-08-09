
function message(s) {
  var $status = $('#status');
  $status.val(s);
//  setTimeout(function() {
//    status.textContent = '';
//  }, 750);
}


function saveChanges() {
  var $hosts = $('#hosts-of-interest').val();
  if (!$hosts) {
    message('Error: No value specified');
    return;
  }
  var the_hosts = $hosts.split(' ');
  chrome.storage.sync.set({
    interesting_hosts: the_hosts
  }, function() {
    // Update status to let user know options were saved.
    message('Options saved');
  });
}

function loadFromStorage($hosts) {
  this.hosts = $hosts;
  var self = this;
  chrome.storage.sync.get('interesting_hosts', function(host_list) {
    console.log(host_list);
    self.hosts.val(host_list['interesting_hosts'].join(' '));
  });

}

$(document).ready(function(){
  $('#save').click(saveChanges);
  loadFromStorage($('#hosts-of-interest'));
});