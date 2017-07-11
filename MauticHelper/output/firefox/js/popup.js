function mytrim(str){
	if (typeof str !== 'string') return str;
	return str.replace(/\/*$/, '');
}

function reset() {
	$('div.loading').hide();
	// On open, clear unread item count
	kango.storage.setItem('itemCount', 0) ;
	kango.dispatchMessage('SetItemCount', 0);
}

KangoAPI.onReady(function() {

	var refresh = kango.storage.getItem('refresh');
	var url = mytrim(kango.storage.getItem('url'));
	var itemCount = kango.storage.getItem('itemCount');

	kango.invokeAsync('kango.storage.getItem', 'enabl', function(state) {
		$("#my-checkbox").bootstrapSwitch({
			'size':'mini', 
			'state':state, 
			'onSwitchChange': function(){
				kango.invokeAsync('kango.storage.setItem', 'enabl', this.checked);
				if (!this.checked) {
					kango.ui.browserButton.setIcon('icons/button_d.png');
				} else {
					kango.ui.browserButton.setIcon('icons/button.png');
				}

				kango.dispatchMessage('UpdateEnable', this.checked); // update options page if opened
			}
		});
	});

	$('div.loading').show();

	document.getElementById('timeline_frame').src = url + '/s/plugin/Gmail/timeline?count=' + itemCount + '&from=iframe';

	$('iframe').load(reset);

	setTimeout(reset, 5000); // in case loading is stuck

});
