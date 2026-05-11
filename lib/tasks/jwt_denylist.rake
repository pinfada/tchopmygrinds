namespace :jwt_denylist do
  desc "Delete JwtDenylist rows whose `exp` is in the past (token already expired)."
  task purge_expired: :environment do
    cutoff = Time.current
    scope = JwtDenylist.where("exp < ?", cutoff)
    count = scope.count
    deleted = scope.delete_all
    puts "[jwt_denylist:purge_expired] removed #{deleted} rows (was #{count}) where exp < #{cutoff.iso8601}"
  end
end

# Schedule once a day in production, e.g.:
#
#   Render Cron Job (paid feature):
#     bundle exec rake jwt_denylist:purge_expired
#
#   Or a Ruby scheduler in-process (whenever, sidekiq-cron) — outside the
#   scope of this task. The denylist table is queried on every JWT request,
#   so unbounded growth degrades every authenticated call.
