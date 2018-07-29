function hideErrors() {
  setTimeout(function(){
      $('#flash-box').removeClass('alert-info').addClass('hidden alert-danger');
      $('#refresh').parent().removeClass('has-error');
      $('#url').parent().removeClass('has-error');
      $('#secret').parent().removeClass('has-error');
    }, 3000);
}

function mytrim(str){
  if (typeof str !== 'string') return str;
  return str.replace(/\/*$/, '');
}

KangoAPI.onReady(function() {

  $("input[type=checkbox]").bootstrapSwitch();

  var refresh = kango.storage.getItem('refresh');
  var url = mytrim(kango.storage.getItem('url'));
  var secret = kango.storage.getItem('secret');
  var enabl = kango.storage.getItem('enabl');

  // listen for a message if the enable switch is clicked on the popup
  kango.addMessageListener('UpdateEnable', function(event) {
    $('#enabl').bootstrapSwitch('state', event.data);
  });

  if (!refresh) refresh = 300;
  $('#refresh').val(refresh);

  if(url) $('#url').val(url);
  if(secret) $('#secret').val(secret);

  if (!enabl) enabl = false;
  $('#enabl').bootstrapSwitch('state', enabl);

  $('#url').change(function(){
    var mautic_url = $(this).val();
    if (mautic_url.substring(mautic_url.length - 1) === '/') {
      mautic_url = mautic_url.substring(0, mautic_url.length - 1);
      $(this).val(mautic_url);
    }

    var logo_url = mautic_url + '/plugins/MauticGmailBundle/Assets/icons/icon32.png';
    $('.mautic-icon').css('background', 'url(' + logo_url + ')');
    $('.mautic-icon').html(logo_url + '<br/>The Mautic Logo should be visible on the left');
  });

  $('#save').click(function (e) {
    e.preventDefault();

    var refresh = $('#refresh').val();
    if (!refresh) {
      $('#flash-box').text('You must provide a refresh interval').removeClass('hidden');
      $('#refresh').parent().addClass('has-error');
      hideErrors();
      return false;
    }

    var url = $('#url').val();
    if (!url) {
      $('#flash-box').text('You must provide your Mautic URL').removeClass('hidden');
      $('#url').parent().addClass('has-error');
      hideErrors();
      return false;
    }

    var secret = $('#secret').val();
    if (!secret) {
      $('#flash-box').text('You must provide your Mautic Secret').removeClass('hidden');
      $('#secret').parent().addClass('has-error');
      hideErrors();
      return false;
    }

    var enabl = $('#enabl').prop('checked');

    kango.storage.setItem('refresh', refresh);
    kango.storage.setItem('url', url);
    kango.storage.setItem('secret', secret);
    kango.storage.setItem('enabl', enabl);

    kango.dispatchMessage('RefreshData', 0); // refresh timeline

    $('#flash-box').text('Your settings have been saved').toggleClass('alert-danger alert-info').removeClass('hidden');
    hideErrors();

    if (enabl) {
      kango.ui.browserButton.setIcon('../icons/button.png');
    }  else {
      kango.ui.browserButton.setIcon('../icons/button_d.png');
    }
    
    kango.ui.browserButton.setPopup({url:'../pages/popup.html', width: 600, height:520});

    // enumerate all the browser tabs and log their urls to console
    kango.browser.tabs.getAll(function(tabs) {
      // tabs is Array of KangoBrowserTab
      for(var i = 0; i < tabs.length; i++){
        if (/mail.google.com/.test(tabs[i].getUrl())) {
          tabs[i].navigate(tabs[i].getUrl()); // refresh gmail if open
        }
      }
    });

    return true;
  });

  $('#close').click(function(){
      KangoAPI.closeWindow();
  });

});
