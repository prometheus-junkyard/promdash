DESTDIR=$(PWD)/system
BUILDDIR=build

RUBY_VERSION=$(shell cat .ruby-version | perl -ne "chomp and print")
RUBY_TAR=ruby-$(RUBY_VERSION).tar.gz
RUBY_SRC=$(BUILDDIR)/ruby-$(RUBY_VERSION)
# RUBY_URL=ftp://ftp.ruby-lang.org/pub/ruby/2.0/$(RUBY_TAR)
RUBY_URL=http://files.int.s-cloud.net/ruby/$(RUBY_TAR)
RUBY_BIN=$(DESTDIR)/bin/ruby

$(DESTDIR):
	mkdir -p $@

$(RUBY_SRC)/Makefile: .ruby-version
	mkdir -p $(RUBY_SRC)
	curl -L $(RUBY_URL) | tar xz -C $(RUBY_SRC) --strip-components 1
	cd $(RUBY_SRC) && ./configure \
		--prefix=$(DESTDIR) \
		--disable-install-doc
	touch $@

$(RUBY_BIN): $(RUBY_SRC)/Makefile
	cd $(RUBY_SRC) && make && make install

build: Gemfile.lock $(RUBY_BIN)
	bin/env gem install bundler --bindir bin/ --no-document
	bin/env bin/bundle install --deployment --binstubs --without="development test migration"
	rm -rf public/assets/*
	bin/env bin/bundle exec rake assets:precompile

clean:
	git clean -f -d -x
