# Uglifier configuration for production
if Rails.env.production?
  Rails.application.config.assets.configure do |env|
    env.js_compressor = Uglifier.new(
      :harmony => true,
      :compress => {
        :drop_console => true,    # Remove console.log statements
        :drop_debugger => true,   # Remove debugger statements
        :unused => false          # Keep unused variables (safer for AngularJS)
      },
      :mangle => {
        :except => ['$super']     # Don't mangle $super (important for some libraries)
      },
      :output => {
        :comments => :none        # Remove all comments
      }
    )
  end
end