$(window).on('load', function() {
  var config = {
    apiKey: "AIzaSyAMUwIsLui2uoQnARuNOSsu7NDDSCroJV4",
    authDomain: "my-sample-project-ead35.firebaseapp.com",
    databaseURL: "https://my-sample-project-ead35.firebaseio.com",
    projectId: "my-sample-project-ead35",
    storageBucket: "my-sample-project-ead35.appspot.com",
    messagingSenderId: "85638353398"
  };
  if(!firebase.apps.length) {
    firebase.initializeApp(config);
  }

  firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
      document.getElementById('loader').style.display = 'none';
      var worktype = toggleEditState(false);
      addMainButton(worktype);

      $('#display_name').html(user.displayName);
    } else {
      var ui = new firebaseui.auth.AuthUI(firebase.auth());
      var uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: function(currentUser, credential, redirectUrl) {
            console.log("signInSuccess");
            // サインイン成功時のコールバック関数
            // 戻り値で自動的にリダイレクトするかどうかを指定
            return true;
          },
          uiShown: function() {
            document.getElementById('body').style.display = 'none';
            document.getElementById('loader').style.display = 'none';
          }
        },
        // リダイレクトではなく、ポップアップでサインインフローを表示
        signInFlow: 'popup',
        signInSuccessUrl: '/',
        signInOptions: [
          // サポートするプロバイダ(メールアドレス)を指定
          {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD
          }
        ],
        // Terms of service url.
        tosUrl: '/'
      };
      ui.start('#firebaseui-auth-container', uiConfig);
    }
  });

  var predata = [];

  function getDate(date) {
    rawDate = new Date(date);
    var year = rawDate.getFullYear();
    var month = (rawDate.getMonth() + 1);
    var day = rawDate.getDate();
    return year + "-" + ("00"+month).substr(-2) + "-" + ("00"+day).substr(-2);
  }

  function getTime(date) {
    rawDate = new Date(date);
    var hour = rawDate.getHours();
    var minutes = rawDate.getMinutes();
    return ("00"+hour).substr(-2) + ":" + ("00"+minutes).substr(-2);
  }

  function getDateTime(datetime) {
    var date = getDate(datetime);
    var time = getTime(datetime);
    return date+"T"+time;
  }

  function postRecord() {
    var token = $('meta[name="csrf-token"]').attr('content');
    $.ajax({
      async: false,
      type : 'POST',
      url  : '/update',
      contentType: 'application/json',
      headers: { 'X-CSRF-TOKEN': token },
      data : JSON.stringify({"data": predata})
    }).done(function(data, textStatus, jqXHR) {
      console.log("done");
    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.log("fail");
    });
  }

  function postDeleteRow(id) {
    var token = $('meta[name="csrf-token"]').attr('content');
    $.ajax({
      async: false,
      type : 'POST',
      url  : '/delete',
      contentType: 'application/json',
      headers: { 'X-CSRF-TOKEN': token },
      data : JSON.stringify({"id": id})
    }).done(function(data, textStatus, jqXHR) {
      console.log("done");
    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.log("fail");
    });
  }

  function addRecord(edit) {
    var user = firebase.auth().currentUser;
    var worktype = '';
    $.ajax({
      async: false,
      type : 'GET',
      url  : '/show',
      contentType: 'application/json',
      data: {"uid":user.uid },
      success: function(data) {
        $("#tbody").empty();
        predata = data;

        var tr = $("table thead tr");

        if(!edit) {
          tr.empty();
          tr.append('<th scope="col">月日</th>');
          tr.append('<th scope="col">出社</th>');
          tr.append('<th scope="col">退社</th>');
          var fn = function(beginData, finishData) {
            if(finishData == null) {
              var datetime = $('<td></td>').append(getDate(beginData.datetime));
            } else {
              var datetime = $('<td></td>').append(getDate(finishData.datetime));
            }

            var begin = $('<td></td>');
            if(beginData != null) {
              begin.attr({
                class: 'bg-primary text-white text-center',
              }).append(getTime(beginData.datetime));
            }

            var finish = $('<td></td>');
            if(finishData != null) {
              finish.attr({
                class: 'bg-dark text-white text-center',
              }).append(getTime(finishData.datetime));
            }

            var row = $('<tr></tr>');
            row.append(datetime);
            row.append(begin);
            row.append(finish);
            $("#tbody").append(row);
          };
        } else {
          tr.empty();
          tr.append('<th scope="col">出社</th>');
          tr.append('<th scope="col">退社</th>');

          var fn = function(beginData, finishData, beginRowID, finishRowID) {
            if(finishData == null) {
              var tmptime = beginData.datetime;
            } else {
              var tmptime = finishData.datetime;
            }

            var begin = $('<td></td>');
            if(beginData != null) {
              begin.attr({
                class: 'bg-primary text-white text-center'
              }).append($('<input />').attr({
                type: 'datetime-local',
                value: getDateTime(beginData.datetime),
                rowid: beginRowID,
              }));
            }

            var finish = $('<td></td>');
            if(finishData != null) {
              finish.attr({
                class: 'bg-dark text-white text-center'
              }).append($('<input />').attr({
                type: 'datetime-local',
                value: getDateTime(finishData.datetime),
                rowid: finishRowID,
              }));
            }

            var row = $('<tr></tr>');
            row.append(begin);
            row.append(finish);
            $("#tbody").append(row);
          };
        }

        var prevdata = null;
        var previ = null;
        for(var i = 0;i<data.length;i++) {
          if(data[i].status == "start") {
            fn(data[i], prevdata, i, previ);
            prevdata = null;
            previ = null;
          } else {
            if(prevdata != null) {
              fn(null, prevdata, i, previ);
            }
            prevdata = data[i];
            previ = i;
          }
        }

        if(data.length == 0 ){
          worktype = "start";
          return;
        }

        var last_status = data[0].status;
        if(last_status == "start") {
          worktype = "end";
          return;
        }

        worktype = "start";
      }
    });

    return worktype;
  }

  function addMainButton(worktype) {
    var wt_field = $('<input />');
    wt_field.attr({
      type: 'hidden',
      name: 'card[status]',
      id: 'card_status',
      value: worktype,
    });

    var uid = $('<input />');
    uid.attr({
      type: 'hidden',
      name: 'card[uid]',
      id: 'card_uid',
      value: firebase.auth().currentUser.uid,
    });

    var btn = $('<input />');
    btn.attr({
      type: 'submit',
      name: 'commit',
      style: 'font-size: 500%;'
    });

    if(worktype == 'start') {
      btn.attr('class', 'btn btn-primary btn-block');
      btn.attr('value', '出社');
      btn.attr('data-disable-with', '出社');
    } else {
      btn.attr('class', 'btn btn-dark btn-block');
      btn.attr('value', '退社');
      btn.attr('data-disable-with', '退社');
    }

    $('#worktype_form').append(wt_field);
    $('#worktype_form').append(uid);
    $('#worktype_form').append(btn);
  }

  function toggleEditState(flag) {
    var worktype = addRecord(flag);

    var o = $("#edit");
    o.empty();
    if(flag) {
      o.append("キャンセル");

      $("#editdone").css("visibility", "visible");
    } else {
      o.append("編集");

      $("#editdone").css("visibility", "hidden");
    }

    return worktype;
  }

  $('tbody').on('click', 'tr td[id=delrow]', function() {
    var i = $(this).attr('rowid');
    var id = predata[i].id;
    postDeleteRow(id);
    addRecord(true);
  })

  $('#tbody').on('change', 'input[type="datetime-local"]', function() {
    var i = $(this).attr('rowid');
    console.log(i)
    console.log(predata[i])
    var j = predata[i].datetime.lastIndexOf("+")
    var tz = predata[i].datetime.substring(j, predata[i].datetime.length);
    console.log(tz)
    console.log($(this).val()+":00.000"+tz)
    predata[i].datetime = $(this).val()+":00.000"+tz;
  });

  $('#editdone').on('click', function() {
    postRecord();

    toggleEditState(false);
  });

  $('#edit').on('click', function() {
    if($(this).text() == '編集') {
      toggleEditState(true);
    } else {
      toggleEditState(false);
    }
  });
});
