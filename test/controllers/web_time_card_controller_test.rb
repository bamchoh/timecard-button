require 'test_helper'
require 'pp'

class WebTimeCardControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get web_time_card_index_url
    assert_response :success
    assert_equal 8, Card.all.size
  end

  test "get last status as start" do
    get web_time_card_index_url
    type = @controller.instance_variable_get(:@worktype)
    assert_equal "start", type
  end

  test "get last status as end" do
    post "/start", :params => { :card => {:status => "start" } }
    get web_time_card_index_url
    type = @controller.instance_variable_get(:@worktype)
    assert_equal "end", type
  end

  test "zero record" do
    Card.destroy_all
    get web_time_card_index_url
    type = @controller.instance_variable_get(:@worktype)
    assert_equal "start", type
  end

  test "one record" do
    Card.destroy_all
    post "/start", :params => { :card => {:status => "start" } }
    get web_time_card_index_url
    type = @controller.instance_variable_get(:@worktype)
    assert_equal "end", type
  end
end
