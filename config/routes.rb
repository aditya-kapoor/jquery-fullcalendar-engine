JqueryFullCalendar::Application.routes.draw do
  mount FullcalendarEngine::Engine => "/fullcalendar_engine"
  root to: "welcome#index"
end