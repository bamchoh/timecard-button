class WebTimeCardController < ApplicationController
  def index
    @cards = Card.all
    unless @cards.empty?
	    last = @cards.last
	    if last.status.to_s == "start"
		    @status = "end"
	    else
		    @status = "start"
	    end
    else
	    @status = "start"
    end
  end

  def start
	  @cards = Card.new(post_params)
	  @cards.save
	  redirect_to "/index"
  end

  def post_params
	  params["card"]["datetime"] = DateTime.now
	  params.require(:card).permit(:datetime, :status)
  end
end
