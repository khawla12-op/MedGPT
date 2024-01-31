$(function () {

  function typeWriter(text, element, delay) {
    let i = 0;
    const typingInterval = setInterval(() => {
      element.append(text.charAt(i));
      i++;
      if (i === text.length) {
        clearInterval(typingInterval);
        document.getElementById("send_message").style.pointerEvents = "fill"
        $('#send').removeClass('spinner-border spinner-border-sm').addClass('bi bi-send');
      }
    }, delay);
  }

  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e){
        $('#image-preview').attr('src', e.target.result);
      }
    }
    reader.readAsDataURL(input.files[0]);
  }

  function copyToClipboard(text) {
    var tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
  }

  function text_to_speech(text) {
    var chunks = text.split(/,./);
    speakChunks(chunks);
  }
  
  function speakChunks(chunks) {
    for (var i = 0; i < chunks.length; i++) {
      speak(chunks[i]);
    }
  }

  function speak(text) {
    var msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.volume = 1;
    msg.rate = 1;
    msg.pitch = 1;
    msg.lang = 'en-US';
    window.speechSynthesis.speak(msg);
  }
  
  var ChatosExamle = {
  Message: {
    add: function (message, type, time, chat, ischatbot ,isloading) {
      var chat_body = $('.chat .chat-body');
      if (chat_body.length > 0) {
        type = type ? type : '';
        chat = chat ? chat : '';
        ischatbot = ischatbot ? ischatbot : false;
        message = message ? message : 'this is really fantastic!';
        isloading = isloading ? isloading : false;

        if (ischatbot) {
          document.getElementById("send_message").style.pointerEvents = "none"
          $('#send').removeClass('bi bi-send').addClass('spinner-border spinner-border-sm');
          $('.chat .chat-body .messages').append(
            '<div class="card ' + type + '">\
              <div class="card-body">\
                <div class="row">\
                  <div class="col-1 d-flex justify-content-center align-items-center mt-3">\
                    ' + chat +'\
                  </div>\
                  <div class="col-11 mt-3 text-justify">\
                    <p class="text-justify">\
                      <span class="typing-effect">\
                      ' + 
                        (
                          isloading ? '<button class="btn btn-primary" type="button" disabled="">\
                          <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>\
                            Loading...\
                          </button>' : ""
                        )
                        + 
                      '\
                      </span>\
                    </p>\
                  </div>\
                </div>\
              </div>\
              <div class="card-footer">\
                <div class="row">\
                  <div class="col-sm-3">\
                    <p class="card-text">' + time + '</p>\
                  </div>\
                  <div class="col-sm-6">\
                  </div> \
                  <div class="col-sm-3">\
                    <div class="d-flex justify-content-end">\
                      <button class="btn btn-primary btn-floating mr-2" id="voice" type="submit">\
                        <i class="bi bi-volume-up"></i>\
                      </button>\
                      <button class="btn btn-primary btn-floating" id="copy" type="submit">\
                        <i class="bi bi-x-diamond"></i>\
                      </button>\
                    </div>\
                  </div>\
                </div>\
              </div>\
            </div>'
          );
  
          var typingEffectElement = $('.chat .chat-body .messages').find('.typing-effect').last();
          if(!isloading){
            setTimeout(function () {
              typeWriter(message, typingEffectElement, 20);
            }, 1000);
          }
          
          } else {
            $('.chat .chat-body .messages').append(
              '<div class="card ' + type + '">\
                <div class="card-body">\
                  <div class="row">\
                    <div class="col-1 d-flex justify-content-center align-items-center mt-3">\
                      ' + chat + '\
                    </div>\
                    <div class="col-11 mt-3">\
                      <p class="text-justify">' + message + '</p>\
                    </div>\
                  </div>\
                </div>\
                <div class="card-footer">\
                  <p class="card-text">' + time + '</p>\
                </div>\
              </div>'
            );
          }
        }
      }
    },
    Image: {
      add: function (type ,time, chat ,path) {
          var chat_body = $('.chat .chat-body .messages');
          if (chat_body.length > 0) {
              $('.chat .chat-body .messages').append(
                '<div class="card ' + type + '">\
                  <div class="card-body">\
                    <div class="row">\
                      <div class="col-1 d-flex justify-content-center align-items-center mt-3">\
                        ' + chat + '\
                      </div>\
                      <div class="col-11 mt-3">\
                        <p class="text-justify">\
                        <img src="'+ path.replace("MedGPT" , '') +'" class="img-fluid">\
                        </p>\
                      </div>\
                    </div>\
                  </div>\
                  <div class="card-footer">\
                    <p class="card-text">' + time + '</p>\
                  </div>\
                </div>'
              );
          }
      }
  }
};

  $(document).on('submit', '.chat .chat-body form', function (e) {
      e.preventDefault();

      var input = $(this).find('input[type=text]');
      var message = input.val();
      message = $.trim(message);

      if (message) {
          if($('.chat-body').find('.container').length > 0){
              $('.chat-body').find('.container').remove();
          }
          ChatosExamle.Message.add(
                  message, 
                  '',
                  new Date().toLocaleTimeString(),
                  '<img width="30" src="/static/assets/img/profile-img.jpg" alt="logo" class="img-fluid" id="app-logo">',
                  false
              );
          sendMessage(message, localStorage.getItem('chat_id'));
          input.val('');
      } else {
          input.focus();
      }
  });

  function getConversation(id) {
      $.ajax({
          url: '/api/get-message',
          type: 'GET',
          data: {
              'conversation_id': id
          },
          success: function (response) {
              $('.chat .chat-body .messages').html('');
              response = JSON.parse(response);
              if (response.length == 0) {
                  check_chat();
              }
              else {
                  for (var i = 0; i < response.length; i++) {
                    if (response[i].fields.image) {
                      ChatosExamle.Image.add(
                          '',
                          response[i].fields.created_at.split('T')[1].split('.')[0],
                          '<img width="30" src="/static/assets/img/profile-img.jpg" alt="logo" class="img-fluid" id="app-logo">',
                          response[i].fields.image
                      );
                    } else{
                      if (i % 2 == 0) {
                        ChatosExamle.Message.add(
                            response[i].fields.content, 
                            '',
                            response[i].fields.created_at.split('T')[1].split('.')[0],
                            '<img width="30" src="/static/assets/img/profile-img.jpg" alt="logo" class="img-fluid" id="app-logo">',
                            false
                            );
                      } else {
                          ChatosExamle.Message.add(
                              response[i].fields.content,
                              'border-info mb-3',
                              response[i].fields.created_at.split('T')[1].split('.')[0],
                              '<img width="30" src="/static/img/logo.png" alt="logo" class="img-fluid" id="app-logo">',
                              false
                          );
                      }
                    }
                  }
              }
          }
      });
  }

  function sendMessage(message, id) {
    waitingForResponse();
      $.ajax({
          url: '/api/send-message/',
          type: 'POST',
          data: {
              'content': message,
              'conversation_id': id,
              "image" : '',
              'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
          },
          success: function (response) {
            response = JSON.parse(response);
            $('.chat .chat-body .messages').find('.card').last().remove();
            ChatosExamle.Message.add(
              response[0].fields.content,
              'border-info mb-3',
              response[0].fields.created_at.split('T')[1].split('.')[0],
              '<img width="30" src="/static/img/logo.png" alt="logo" class="img-fluid" id="app-logo">',
              true
            );
          }
      });
  }

  function waitingForResponse() {
      ChatosExamle.Message.add(
          '',
          'border-info mb-3',
          new Date().toLocaleTimeString(),
          '<img width="30" src="/static/img/logo.png" alt="logo" class="img-fluid" id="app-logo">',
          true,
          true
      );
  }

  $(document).on('change', '#file-input', function (id ) {
    readURL(this);
    var file = document.getElementById('file-input').files[0];
    var formData = new FormData();

    formData.append('image', file);
    formData.append('conversation_id', localStorage.getItem('chat_id'));
    formData.append('csrfmiddlewaretoken', $('input[name=csrfmiddlewaretoken]').val());
    formData.append('message', file.name);

    ChatosExamle.Image.add(
      "",
      new Date().toLocaleTimeString(),
      '<img width="30" src="/static/assets/img/profile-img.jpg" alt="logo" class="img-fluid" id="app-logo">',
      URL.createObjectURL(file)
    );

    waitingForResponse();


    $.ajax({
        url: '/api/send-message/',
        type: 'POST',
        data: formData,
        contentType: 'multipart/form-data',
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
          response = JSON.parse(response);
          $('.chat .chat-body .messages').find('.card').last().remove();
          ChatosExamle.Message.add(
            response[0].fields.content,
            'border-info mb-3',
            response[0].fields.created_at.split('T')[1].split('.')[0],
            '<img width="30" src="/static/img/logo.png" alt="logo" class="img-fluid" id="app-logo">',
            true
          );
        }

    });

  });

  $(document).ready(function () {
      $('#chat-messages').on('click', 'li.list-group-item', function () {
          var id = $(this).attr('data-chat-user-id');
          $(this).addClass('test').siblings().removeClass('test');
          $(this).find('.nav-link').removeClass('collapsed');
          $(this).siblings().find('.nav-link').addClass('collapsed');
          localStorage.setItem('chat_id', id);
          getConversation(id);
      });
  });

  $(document).on('mouseenter', '#send_message', function () {
    if ($('#chat-messages').find('li.test').length == 0) {
        $('#exampleModalError').modal('show');
        $(this).blur();
    }
  });

  // get element with id voice_record , when i click on it , it will start recording
  // and put the result in the input with id message
  $(document).on('click', '#voice_record', function () {
    var message = document.getElementById('message');
    var recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = function (event) {
      message.value = event.results[0][0].transcript;
    }
    recognition.start();
  });

  $(document).on('click', '#copy', function () {
    var textToCopy = $(this).closest('.card-footer').prev('.card-body').find('.text-justify').find('span').text();
    copyToClipboard(textToCopy);
    //change the text of the button to copied
    $(this).find('i').removeClass('bi-x-diamond').addClass('bi-check2');
  });

  $(document).on('click', '#voice', function () {
    var textToCopy = $(this).closest('.card-footer').prev('.card-body').find('.text-justify').find('span').text();
    text_to_speech(textToCopy);
  }
  );


});

function check_chat(){
    var messageBody = $('#message-body');
    if (messageBody.html().trim() === '') {
      var description = `
              <div class="container" style="display: none;margin-top:70px;">
                  <div class="row justify-content-center">
                      <div class="col-md-6">
                        <div class="card">
                          <div class="card-body text-center">
                            <img width="150" src="/static/img/logo.png" alt="logo" class="img-fluid mt-2" id="app-logo">
                            <p class="card-text mt-4">
                              This chatbot is designed to assist you with medical-related inquiries. It offers the following features
                            </p>
                          </div>
                        </div>
                    </div>
                  </div>
                  <div class="row mt-4">
                    <div class="col-md-4">
                      <div class="card">
                        <div class="card-body text-center">
                          <h5 class="card-title">Bridging Medical Frontiers</h5>
                          <p class="card-text">Med GPT incorporates a multidisciplinary approach, integrating knowledge from various medical fields and specialties</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="card">
                        <div class="card-body text-center">
                          <h5 class="card-title">Voice messages</h5>
                          <p class="card-text">Enjoy a hands-free experience with the Med GPT Chatbot. Both you and the chatbot can exchange voice messages</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="card">
                        <div class="card-body text-center">
                          <h5 class="card-title">Extensive Medical Information</h5>
                          <p class="card-text">Serves as a vast repository of medical knowledge, covering numerous fields such as cardiology, neurology, oncology, and more</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
      `;
      messageBody.html(description);
      $('.container').fadeIn(600);
    }
}
  
$(document).ready(function() {
  check_chat();
});