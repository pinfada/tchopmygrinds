# Sprockets 4.2.2 crashes during JS bundling on UTF-8 multi-byte content in
# vendored gem assets — notably rails_admin's flatpickr-with-locales.js, which
# contains bytes like \xC2\xBA (the "º" character) used in Spanish/Portuguese
# locale strings.
#
# Root cause:
#   * Sprockets::Asset#source reads files with File.binread, returning
#     ASCII-8BIT-tagged strings (sprockets-4.2.2/lib/sprockets/asset.rb:101).
#   * Sprockets::Utils.concat_javascript_sources then does
#       source.encode(Encoding::UTF_32LE) unless source.ascii_only?
#     (utils.rb:106) for O(1) byte indexing. Ruby routes
#     ASCII-8BIT → UTF-8 → UTF-32LE, which raises
#     Encoding::UndefinedConversionError on the first byte >= 0x80.
#
# Why we can't just monkey-patch Utils.concat_javascript_sources:
#   sprockets.rb:124 captures Utils.method(:concat_javascript_sources) at gem
#   load time and stores the Method object in its bundle reducer registry.
#   Ruby's Method objects are frozen to their implementation at capture time,
#   so redefining the method on the module afterward has no effect on the
#   stored Method.
#
# Fix: re-register the 'application/javascript' :data bundle reducer with a
# proc that retags ASCII-8BIT sources as UTF-8 (their actual encoding on disk)
# before delegating. The proc is invoked dynamically, so it picks up whatever
# Utils.concat_javascript_sources resolves to at call time — and even if it
# resolves to the original implementation, the source is now properly tagged.
Rails.application.config.assets.configure do |env|
  env.register_bundle_metadata_reducer "application/javascript", :data, +"" do |buf, source|
    if source.encoding == Encoding::ASCII_8BIT
      retagged = source.dup.force_encoding(Encoding::UTF_8)
      source = retagged if retagged.valid_encoding?
    end
    Sprockets::Utils.concat_javascript_sources(buf, source)
  end
end
