class WebTimeCardController < ApplicationController
  def index
    _index

    respond_to do |format|
      format.html
    end
  end

  def show
    _index

    respond_to do |format|
      format.json { render json: @cards }
    end
  end

  def update
    params["data"].each do |record|
      card = Card.find(record["id"])
      card.datetime = record["datetime"]
      card.status = record["status"]
      card.save
    end
    render status: 200, json: { status: 200, message: "Success" }
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

  private

  def _index
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
end
