class NewslettersController < ApplicationController
	before_action :set_newsletter, only: [:destroy]
	respond_to :json
	def create
		@newsletter = Newsletter.create(newsletter_params)
		if @newsletter.save
			render json: @newsletter, status: :ok
		else
			redirect_to root_path
		end
	end

    private

      def set_newsletter
        @newsletter = Newsletter.find(params[:id])
      end

      def newsletter_params
        params.require(:newsletter).permit(:email)
      end
end
