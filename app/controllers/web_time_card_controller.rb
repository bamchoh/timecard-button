class WebTimeCardController < ApplicationController
  def index
    respond_to do |format|
      format.html
    end
  end

  def show
    @edit = params["edit"] ? true : false
    @cards = Card.where(uid: params["uid"]).order("datetime DESC").limit(30)

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
    id = params["id"]
    Card.find(id).destroy
    render status: 200, json: { status: 200, message: "Success" }
  end

  def delete_all
    Card.destroy_all
    redirect_to "/index"
  end

  def post_params
    params["card"]["datetime"] = DateTime.now
    params.require(:card).permit(:datetime, :status, :uid)
  end
end
