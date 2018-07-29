function MauticHelper() {
    var self = this;
  	if (!self.getUrl()) {
		kango.ui.optionsPage.open();
  	} else {
  		kango.ui.browserButton.setIcon('icons/button.png');
    	kango.ui.browserButton.setPopup({url:'pages/popup.html', width: 500, height:520});
    	self.refresh();
	}

	self._intervalId = window.setInterval(function() { self.refresh(); }, self.getRefreshTimeout()); // initial interval

	kango.addMessageListener('SetItemCount', function(event) {
	    self._setUnreadCount(event.data);
	});

	kango.addMessageListener('RefreshData', function(event) {
		self.refresh();
	});
}

function mytrim(str){
	if (typeof str !== 'string') return str;
	return str.replace(/\/*$/, '');
}

function hashCode(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}

MauticHelper.prototype = {
		_intervalId: 0,

		getUrl: function() { return mytrim(kango.storage.getItem('url')) ; },

        getRefreshTimeout: function() { 
        	var r = kango.storage.getItem('refresh'); 
        	return (r > 1000)? r : ((r > 0)? r * 1000 : 15000); // default check every 15 seconds
        }, // convert to milisenconds

        _isEnabled: function() { return kango.storage.getItem('enabl'); },

        _getFeedUrl: function() { return mytrim(kango.storage.getItem('url')) + '/s/plugin/Gmail/timeline?count=' + kango.storage.getItem('itemCount'); },

        _setOffline: function() {
               // kango.ui.browserButton.setTooltipText(kango.i18n.getMessage('Offline'));
                kango.ui.browserButton.setIcon('icons/button_off.png');
                kango.ui.browserButton.setBadgeValue(0);
        },

        _setUnreadCount: function(count) {
        	var self = this;
            //kango.ui.browserButton.setTooltipText(kango.i18n.getMessage('Unread count') + ': ' + count);
            if (!self._isEnabled()) {
            	kango.ui.browserButton.setIcon('icons/button_d.png');
            } else {
				kango.ui.browserButton.setIcon('icons/button.png');
            }
            kango.ui.browserButton.setBadgeValue(count);
        },

        refresh: function() {
            	var self = this;
        		if (!self._isEnabled() || !self.getRefreshTimeout() || self.getRefreshTimeout() < 10000 ) 
        			return; // not refreshing if less than 10 seconds
                var details = {
                        url: this._getFeedUrl(),
                        method: 'GET',
                        async: true,
                        contentType: 'text'
                };
                kango.xhr.send(details, function(data) {
                        if (data.status == 200 && data.response != null) {
                        	var $rows = $($(data.response).find('.timeline-row'));
                            var count = 0; 
                            var oldCount = kango.storage.getItem('itemCount');
                            var olditem = kango.storage.getItem('lastReadItem');

                           // kango.console.log('Old: ' + olditem);

                            // find new count
                            var $ids = $rows.find('.timeline-row-id');
                        	var lastReadItem = $ids.first().html();
                        	var lastHash = hashCode($(data.response).find('#timeline-details-1').html());

                           // kango.console.log('Last: ' + lastReadItem);
                           // kango.console.log('Last hash: ' + lastHash);

                        	if (lastReadItem === olditem) return; // nothing has changed

                        	$.each($ids, function(i, r){
                        		if ($(r).html() > olditem) count++; // count new items
                        	});

                            // total items
                            self._setUnreadCount(count);
                            kango.storage.setItem('itemCount', count);
                            kango.storage.setItem('lastReadItem', lastReadItem);

                            // notify user
                            if (count > 0) {
                            	var $last = $rows.first();
                            	var msg = $('.timeline-type', $last).html() + 
                            				$('.timeline-lead a', $last).html() + 
                            				$('.timeline-timestamp', $last).html();
                            	var leadId = $('.timeline-row-lead-id', $last).html();

                                kango.ui.notifications.show('Mautic Helper', msg + "\nYou have " + count + ' new events on your timeline.', '../icons/icon48.png', function() {
							        // do something on click
							        kango.browser.tabs.create({url: self.getUrl() + '/s/contacts/view/' + leadId});
							    });
                            }
                        }
                        else { // something went wrong
                                self._setOffline();
                        }
                });

                clearInterval(self._intervalId);
				self._intervalId = window.setInterval(function() { self.refresh(); }, self.getRefreshTimeout()); 
        }
};

var mautic = new MauticHelper();
