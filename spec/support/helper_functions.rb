def accept_alert
  page.driver.browser.switch_to.alert.accept
end

def open_tab tab_name
  find(".widget_wrapper").hover
  find("[title='#{tab_name}']").click
end

def model_element model
  find("[ng-model='#{model}']")
end

def within_graph
  within '.graph_chart' do
    yield
  end
end
