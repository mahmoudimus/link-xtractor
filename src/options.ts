import * as $ from 'jquery';


function message(s) {
    var $status = $('#status');
    $status.val(s);
    //  setTimeout(function() {
    //    status.textContent = '';
    //  }, 750);
}


function isStringArray(x: any): x is Array<String> {
    return Array.isArray(x) && x.every(item => typeof item === "string");
}

function isString(x: any): x is string {
    return (typeof x) === 'string';
}

function saveChanges() {
    const $hosts: string | string[] | number = $('#hosts-of-interest').val();
    if (!$hosts || ($hosts as number)) {
        message('Error: No value specified');
        return;
    }
    let the_hosts;
    if(isStringArray($hosts)) {
        the_hosts = $hosts.join(' ');
    }
    else if(isString($hosts)) {
        the_hosts = $hosts.split(' ');
    }
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

$(function() {
    $('#save').click(saveChanges);
    loadFromStorage($('#hosts-of-interest'));
});

// $(restore_options); // document.addEventListener('DOMContentLoaded', restore_options);
