class WebTimeCardController < ApplicationController
  def index
    @edit = params["edit"] ? true : false
    @cards = Card.order("datetime")
    unless @cards.empty?
      last = @cards.last
      if last.status.to_s == "start"
        @worktype = "end"
      else
        @worktype = "start"
      end
    else
      @worktype = "start"
    end
  end

  def start
    @cards = Card.new(post_params)
    @cards.save
    redirect_to "/index"
  end

  def delete
    Card.destroy_all
    redirect_to "/index"
  end

  def post_params
    params["card"]["datetime"] = DateTime.now
    params.require(:card).permit(:datetime, :status)
  end
end
