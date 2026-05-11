# frozen_string_literal: true

# Windows-only shim: Sprockets::PathUtils.atomic_write uses File.rename to
# replace the cache file, but on Windows rename is not an atomic overwrite and
# fails with Errno::EACCES when the destination is briefly locked (AV scanner,
# indexer, residual handle). Retry a few times with a short backoff so a
# transient lock doesn't blow up the whole precompile.
if Gem.win_platform?
  require "sprockets/path_utils"

  module Sprockets
    module PathUtils
      MAX_ATOMIC_WRITE_ATTEMPTS = 5
      ATOMIC_WRITE_RETRY_DELAY  = 0.05

      def atomic_write(filename)
        dirname, basename = File.split(filename)
        basename = [
          basename,
          Thread.current.object_id,
          Process.pid,
          rand(1_000_000)
        ].join(".")
        tmpname = File.join(dirname, basename)

        File.open(tmpname, "wb+") { |f| yield f }

        attempts = 0
        begin
          File.rename(tmpname, filename)
        rescue Errno::EACCES, Errno::EEXIST
          attempts += 1
          raise if attempts >= MAX_ATOMIC_WRITE_ATTEMPTS

          File.delete(filename) if File.exist?(filename)
          sleep(ATOMIC_WRITE_RETRY_DELAY * attempts)
          retry
        end
      ensure
        File.delete(tmpname) if tmpname && File.exist?(tmpname)
      end
    end
  end
end
