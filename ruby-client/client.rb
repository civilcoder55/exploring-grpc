require 'grpc'
require './def_services_pb'

creds = GRPC::Core::ChannelCredentials.new(File.read('../certs/selfSigned.crt'),
                                           File.read('../certs/selfSigned.key'),
                                           File.read('../certs/selfSigned.crt'))
# stub = UnaryService::Stub.new('localhost:50001', creds)

# begin
#   puts stub.echo(Request.new(message: 'Hello, World!')).echo
#   puts stub.echo(Request.new(message: '')).echo
# rescue GRPC::BadStatus => e
#   puts e.details
# end

stub = StreamService::Stub.new('localhost:50001', creds)

# stub.server_stream_echo(Request.new(message: 'Hello, World!')).each do |r|
#   puts r.echo
# end

# begin
#   stub.server_stream_echo(Request.new(message: '')).each do |r|
#     puts r.echo
#   end
# rescue GRPC::BadStatus => e
#   puts e.details
# end

begin
  puts stub.client_stream_echo([Request.new(message: 'Hello, '), Request.new(message: 'World!')]).echo
rescue GRPC::BadStatus => e
  puts e.details
end
