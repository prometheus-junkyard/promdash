build:
	gem install bundler --bindir bin/
	bin/bundle install --deployment --binstubs --without="development test migration"
	bin/bundle exec rake assets:precompile

clean:
	git clean -f -d -x
