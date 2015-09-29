FROM       alpine:3.1
MAINTAINER Prometheus Team <prometheus-developers@googlegroups.com>
EXPOSE     3000
ENTRYPOINT [ "./run" ]
CMD        [ "./bin/thin", "start" ]

ENV     RAILS_ENV production
WORKDIR /usr/src/app
COPY    . /usr/src/app
VOLUME ["/data"]

RUN apk add --update -t build-deps openssl ca-certificates make gcc musl-dev libgcc g++ mysql-dev postgresql-dev sqlite-dev \
    && apk add ruby ruby-dev nodejs tzdata \
    && echo 'gem: --no-rdoc --no-ri' >> "$HOME/.gemrc" \
    && cp config/database.yml.example config/database.yml \
    && bin/env gem install bundler --bindir bin/ --no-document \
    && bin/env bin/bundle install --deployment --binstubs --without="development test migration" \
    && rm -rf public/assets/* \
    && bin/env bin/bundle exec rake assets:precompile \
    && apk del --purge build-deps \
    && apk add mysql-libs sqlite-libs libpq \
    && rm -rf /var/cache/apk/* \
    && printf '#!/bin/sh\n \
       [ -z "$DATABASE_URL" ] && { echo "DATABASE_URL not set"; exit 1; }\n \
       export DB_HOST=$(echo $DB_PORT_3306_TCP|sed "s|^tcp://||")\n \
       export DATABASE_URL=$(echo "$DATABASE_URL" | sed "s/\[HOST\]/$DB_HOST/")\n \
       exec $@\n' > run && chmod a+x run
