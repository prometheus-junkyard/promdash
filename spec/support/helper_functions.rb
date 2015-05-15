def accept_alert
  page.driver.browser.switch_to.alert.accept
end

def dismiss_alert
  page.driver.browser.switch_to.alert.dismiss
end

def fill_in_prompt text
  page.driver.browser.switch_to.alert.send_keys text
  accept_alert
end

def open_tab tab_name
  find(".widget_title").hover
  click_tooltip tab_name
end

def click_tooltip tooltip
  page.execute_script("$(\"[tooltip='#{tooltip}']\").click()")
end

def model_element model
  find("[ng-model='#{model}']")
end

def within_graph
  within '.graph_chart' do
    yield
  end
end

def open_global_config
  find("[title='Dashboard Settings']").click
end
