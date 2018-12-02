require 'test_helper'

class WebTimeCardControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get web_time_card_index_url
    assert_response :success
  end

end
