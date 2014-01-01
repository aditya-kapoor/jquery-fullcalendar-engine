// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
if (typeof(FullcalendarEngine) === 'undefined') { FullcalendarEngine = {}; }


FullcalendarEngine.Form = {
  display: function(options) {

    if (typeof(options) == 'undefined') { options = {} }
    $('#event_form').trigger('reset');

    var startTime = options['starttime'] || new Date(), endTime = options['endtime'] || new Date(startTime.getTime());

    if(startTime.getTime() == endTime.getTime()) { endTime.setMinutes(startTime.getMinutes() + 15); }

    this.setTime('#event_starttime', startTime)
    this.setTime('#event_endtime', endTime)

    $('#event_all_day').attr('checked', options['allDay'])

    // FullcalendarEngine.Form.fetch()

    $('#create_event_dialog').dialog({
      title: 'New Event',
      modal: true,
      width: 500,
      close: function(event, ui) { $('#create_event_dialog').dialog('destroy') }
    });
  },
  setTime: function(type, time) {
    var $year = $(type + '_1i'), $month = $(type + '_2i'), $day = $(type + '_3i'), $hour = $(type + '_4i'), $minute = $(type + '_5i')
    $year.val(time.getFullYear());
    $month.prop('selectedIndex', time.getMonth());
    $day.prop('selectedIndex', time.getDate() - 1);
    $hour.prop('selectedIndex', time.getHours());
    $minute.prop('selectedIndex', time.getMinutes());
  },
  fetch: function(){
    jQuery.ajax({
      type: 'get',
      dataType: 'script',
      async: true,
      url: "/fullcalendar_engine/events/new"
    });
  }
}

function moveEvent(event, dayDelta, minuteDelta, allDay){
  jQuery.ajax({
    data: 'id=' + event.id + '&title=' + event.title + '&day_delta=' + dayDelta + '&minute_delta=' + minuteDelta + '&all_day=' + allDay + '&authenticity_token=' + authenticity_token,
    dataType: 'script',
    type: 'post',
    url: "/fullcalendar_engine/events/move"
  });
}

function resizeEvent(event, dayDelta, minuteDelta){
  jQuery.ajax({
    data: 'id=' + event.id + '&title=' + event.title + '&day_delta=' + dayDelta + '&minute_delta=' + minuteDelta + '&authenticity_token=' + authenticity_token,
    dataType: 'script',
    type: 'post',
    url: "/fullcalendar_engine/events/resize"
  });
}

function showEventDetails(event){
  $('#event_desc_dialog').html('')
  $event_description  = $('<div />').html(event.description).attr("id", "event_description")
  $event_actions      = $('<div />').attr("id", "event_actions")
  $edit_event         = $('<span />').attr("id", "edit_event").html("<a href = 'javascript:void(0);' onclick ='editEvent(" + event.id + ")'>Edit</a>");
  $delete_event       = $('<span />').attr("id", "delete_event")
  if (event.recurring) {
    title = event.title + "(Recurring)";
    $delete_event.html("&nbsp; <a href = 'javascript:void(0);' onclick ='deleteEvent(" + event.id + ", " + false + ")'>Delete Only This Occurrence</a>");
    $delete_event.append("&nbsp;&nbsp; <a href = 'javascript:void(0);' onclick ='deleteEvent(" + event.id + ", " + true + ")'>Delete All In Series</a>")
    $delete_event.append("&nbsp;&nbsp; <a href = 'javascript:void(0);' onclick ='deleteEvent(" + event.id + ", \"future\")'>Delete All Future Events</a>")
  } else {
    title = event.title;
    $delete_event.html("<a href = 'javascript:void(0);' onclick ='deleteEvent(" + event.id + ", " + false + ")'>Delete</a>");
  }
  $event_actions.append($edit_event).append($delete_event)
  $('#event_desc_dialog').append($event_description).append($event_actions)
  $('#event_desc_dialog').dialog({
    title: title,
    modal: true,
    width: 500,
    close: function(event, ui){ $('#event_desc_dialog').html(''); $('#event_desc_dialog').dialog('destroy') }
  });
}

function editEvent(event_id){
  jQuery.ajax({
    url: "/fullcalendar_engine/events/" + event_id + "/edit",
    success: function(data) {
      $('#event_description').html(data['form']);
    }
  });
}

function deleteEvent(event_id, delete_all){
  jQuery.ajax({
    data: 'authenticity_token=' + authenticity_token + '&delete_all=' + delete_all,
    dataType: 'script',
    type: 'delete',
    url: "/fullcalendar_engine/events/" + event_id,
    success: refetch_events_and_close_dialog
  });
}

function refetch_events_and_close_dialog() {
  $('#calendar').fullCalendar( 'refetchEvents' );
  $('.dialog:visible').dialog('destroy');
}

function showPeriodAndFrequency(value){
  switch (value) {
    case 'Daily':
      $('#period').html('day');
      $('#frequency').show();
      break;
    case 'Weekly':
      $('#period').html('week');
      $('#frequency').show();
      break;
    case 'Monthly':
      $('#period').html('month');
      $('#frequency').show();
      break;
    case 'Yearly':
      $('#period').html('year');
      $('#frequency').show();
      break;
    default:
      $('#frequency').hide();
  }
}

$(document).ready(function(){
  $('#create_event_dialog, #event_desc_dialog').on('submit', "#event_form", function(event) {
    var $spinner = $('.spinner');
    event.preventDefault();
    $.ajax({
      type: "POST",
      data: $(this).serialize(),
      url: $(this).attr('action'),
      beforeSend: show_spinner,
      complete: hide_spinner,
      success: refetch_events_and_close_dialog,
      error: handle_error
    });

    function show_spinner() {
      $spinner.show();
    }

    function hide_spinner() {
      $spinner.hide();
    }

    function handle_error(xhr) {
      alert(xhr.responseText);
    }
  })

  $.extend(full_calendar_options, {
    loading: function(bool){
      if (bool)
        $('#loading').show();
      else
        $('#loading').hide();
    },
    eventDrop: function(event, dayDelta, minuteDelta, allDay, revertFunc){
      moveEvent(event, dayDelta, minuteDelta, allDay);
    },
    eventResize: function(event, dayDelta, minuteDelta, revertFunc){
      resizeEvent(event, dayDelta, minuteDelta);
    },
    eventClick: function(event, jsEvent, view){
      showEventDetails(event);
    },
    select: function( startDate, endDate, allDay, jsEvent, view ) {
      FullcalendarEngine.Form.display({ 
        starttime: new Date(startDate.getTime()), 
        endtime:   new Date(endDate.getTime()), 
        allDay:    allDay 
      })
    }
  })
});
