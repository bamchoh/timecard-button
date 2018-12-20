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
      var worktype = toggleEditState(false);
      addMainButton(worktype);

      $('#display_name').html(user.displayName);
    } else {
      var redirect_url = "/login/index" + location.search;
      if(document.referrer) {
        var referrer = "referrer=" + encodeURIComponent(document.referrer);
        redirect_url = redirect_url + (location.search ? '&' : '?') + referrer;
      }
      location.href = redirect_url;
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

        if(edit) {
          var tr = $("table thead tr");
          tr.empty();
          tr.append('<th scope="col">月日</th>');
          tr.append('<th scope="col">時刻</th>');
          tr.append('<th scope="col">状況</th>');
          tr.append('<th scope="col">削除</th>');
        } else {
          var tr = $("table thead tr");
          tr.empty();
          tr.append('<th scope="col">月日</th>');
          tr.append('<th scope="col">時刻</th>');
          tr.append('<th scope="col">状況</th>');
        }

        for (i in data) {
          var date_text = "";
          var time_text = "";
          var s_text = "";
          var opt_text = "";
          if(edit) {
            date_text = '<td><input type="date" value="' + getDate(data[i].datetime) + '" rowid=' + i + '></td>';
            time_text = '<td><input type="time" value="' + getTime(data[i].datetime) + '" rowid=' + i + '></td>';
            if(data[i].status == "start") {
              s_text = '<td class="bg-primary text-white text-center">出社</td>';
            } else {
              s_text = '<td class="bg-dark text-white text-center">退社</td>';
            }
            opt_text = '<td class="text-center" id="delrow" rowid='+i+'><i class="fas fa-trash text-danger"></i></td>';
          } else {
            date_text = '<td>' + getDate(data[i].datetime) + '</td>';
            time_text = '<td>' + getTime(data[i].datetime) + '</td>';
            if(data[i].status == "start") {
              s_text = '<td class="bg-primary text-white text-center">出社</td>';
            } else {
              s_text = '<td class="bg-dark text-white text-center">退社</td>';
            }
          }
          $("#tbody").append("<tr>" + date_text + time_text + s_text + opt_text + "</tr>");
        }

        if(data.length == 0 ){
          worktype = "start";
          return;
        }

        var last_status = data[data.length-1].status;
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

      $("#alldel").css("visibility", "visible");
      $("#editdone").css("visibility", "visible");
    } else {
      o.append("編集");

      $("#alldel").css("visibility", "hidden");
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

  $('#tbody').on('change', 'input[type="date"]', function() {
    var i = $(this).attr('rowid');
    var orig = new Date(predata[i].datetime);
    var mod = new Date($(this).val());
    orig.setFullYear(mod.getFullYear());
    orig.setMonth(mod.getMonth());
    orig.setDate(mod.getDate());
    predata[i].datetime = orig.toJSON();
  });

  $('#tbody').on('change', 'input[type="time"]', function() {
    var i = $(this).attr('rowid');
    var orig = new Date(predata[i].datetime);
    var mod = new Date("2000-01-01T" + $(this).val() + ":00+09:00");
    orig.setHours(mod.getHours());
    orig.setMinutes(mod.getMinutes());
    predata[i].datetime = orig.toJSON();
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
