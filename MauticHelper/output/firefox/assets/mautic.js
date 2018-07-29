  var gmail;
  var is_tracking = false;
  var i_a = 0;
  var mautic_url;
  var mautic_secret;

  function check(callback) {
    if ((/in/.test(document.readyState)) || (Gmail === undefined)) {
      setTimeout(function(){
         // console.log('checking false: ' + (++i_a));
         check(callback);
       }, 100);
    } else {
     setTimeout(function(){
         //   console.log('checking true: ' + (++i_a));
         callback();
       }, 100);
   }
 }

 function doCompose(compose_ref, type) {
    // type can be compose, reply or forward
    // console.log('api.dom.compose object:', compose_ref, 'type is:', type );  // gmail.dom.compose object

    is_tracking = false;

    var html = '<div class="mt-email"><div class="mt-control" data-tooltip="Track email with Mautic">' +
    '  <div class="mt-compose">' +
    '    <div class="mt-input mt-checkbox">' +
    '      <div class="mt-checkmark"></div>' +
    '    </div>' +
    '    <div class="mt-label">' +
    '      <img src="' + mautic_url + '/plugins/MauticGmailBundle/Assets/icons/icon32.png"/>' +
    '    </div>' +
    '  </div>' +
    '  <div class="mt-spacer"></div>' +
    '</div></div>';
    /*
    Add tracking with Mautic button
    */
    gmail.tools.add_compose_button(compose_ref, html, function() {
      // set tracking flag
      is_tracking = !is_tracking;
      if (is_tracking) {
        $('.mt-checkmark').css('background', 'url(' + mautic_url + '/plugins/MauticGmailBundle/Assets/icons/checkmark.png)');
        $('.T-I-atl').addClass('mt-button');
      } else {
        $('.mt-checkmark').css('background', '');
        $('.T-I-atl').removeClass('mt-button');
      }
    }, 'mautic-track-btn');

  }

  function addMauticStuff() {
    if (!mautic_url) return;

      /*
          Watch for contacts and display timeline
          */
      // this will register an observer that fires each time the autosuggest listbox pops up / changes
      // as you type an email address into a compose
      gmail.observe.register('compose_email_select', {
        class: 'Jd-axF',
        selector: 'div.Jd-axF:first-child'
      });
      gmail.observe.on('compose_email_select', function(match) {
       // console.log('Mautic email select popup', match);
     });

      // DOM observers
      gmail.observe.on("compose", doCompose);

      if (gmail.dom.composes() && gmail.dom.composes().length > 0) // is compose window open?
        doCompose(gmail.dom.composes()[0]);

      /*
          Watch after sending message and notify if message was tracked
          */
          gmail.observe.after("send_message", function(url, body, data, response, xhr) {
            is_tracking = false;
          //console.log("message sent", "url:", url, 'body', body, 'email_data', data, 'response', response, 'xhr', xhr);
        });

      /*
          Watch before sending message and inject tracking gif
          */
          gmail.observe.before('send_message', function(url, body, data, xhr){
            var body_params = xhr.xhrParams.body_params;

        // // lets cc this email to someone extra if the subject is 'Tracking example'
        // if(data.subject == 'Tracking example') {
        //   if(body_params.cc) {
        //     if(typeof body_params.cc != 'object') body_params.cc = [ body_params.cc ];
        //   } else {
        //     body_params.cc = [];
        //   }
        //   body_params.cc.push('werner.garcia@mautic.com');
        // }

        // // now change the subject
        // body_params.subject = 'This mail is being tracked!';
        // //console.log("sending message, url:", url, 'body', body, 'email_data', data, 'xhr', xhr);

        // Check if email is HTML
        if (is_tracking && !gmail.check.is_plain_text() && body_params.to) {
            console.log("Email is HTML, tracking is possible!");
           var dest = '';
           var to = body_params.to; // format name <email>
           if(typeof to != 'object') {
              dest = to;
            } else {
               to = to.filter(String);
               var re = /[a-z0-9\._%+-]+@[a-z0-9\._%-]+(\.[a-z0-9]{2,})?/img;
               dest = to.join(' ').match(re).join(';');
            }
            var qs = "from=" + encodeURIComponent(body_params.from ) + 
            "&email=" + encodeURIComponent(dest) +
            "&subject=" + encodeURIComponent(body_params.subject) + 
            "&body=" + encodeURIComponent(body_params.body);

            // console.log('query: ', qs);

            var d = encodeURIComponent(btoa(pako.gzip(qs, {'to':'string'})));
          // console.log('encoded: ', d);

          var cr = CryptoJS.PHP_CRYPT_MD5(d, "$1$" + mautic_secret);
          // console.log('crypt: ', cr); 

          var hash = crc32(cr).toString();
          while (hash.length < 8) hash = '0' + hash.toString();
          console.log('hash: ', hash); 

           // now inject the tracking gif
           var trackingGif = '<img style="display: none;" height="1" width="1" src="' +
           mautic_url + '/plugin/Gmail/tracking.gif?d=' + d + '&sig=' + hash + '" ' +
           'alt="Mautic is open source marketing automation">';
           body_params.body += trackingGif;
         }
       });

      /*
          Watch recipient change and update timeline window
          */
          gmail.observe.on('recipient_change', function(match, recipients) {
        //console.log('recipients changed', match, recipients);
      });

      /*
          Watch email view and update timeline window
          */
          gmail.observe.on('view_thread', function(obj) {
        // monitor thread so view_email is enabled
      });
          gmail.observe.on('view_email', function(obj) {
        //console.log('individual email opened', obj);  // gmail.dom.email object
      });

      /*
      gmail.observe.on("open_email", function(id, url, body, xhr) {
        console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
        console.log(gmail.get.email_data(id));
      });
      */


    }

    var mautic = function() {
      // NOTE: Always use the latest version of gmail.js from
      // https://github.com/KartikTalwar/gmail.js
      gmail = new Gmail();
      console.log('Hello, ', gmail.get.user_email());

      // Get Mautic URL from storage
      if (typeof(Storage) !== "undefined") {
        mautic_url = ("null" === localStorage.mautic_url)?null:localStorage.mautic_url;
        mautic_secret = ("null" === localStorage.mautic_secret)?null:localStorage.mautic_secret;
      }
      console.log('Mautic URL: ' + mautic_url);
      //console.log('Mautic Secret: ' + mautic_secret);

      addMauticStuff();
      
    }

    check(mautic);
