FROM       ruby:2.1.5-onbuild
MAINTAINER Prometheus Team <prometheus-developers@googlegroups.com>
ENV        RAILS_ENV production

ENTRYPOINT [ "./run" ]
CMD        [ "./bin/thin", "start" ]
RUN        cp config/database.yml.example config/database.yml && \
           bundle install --deployment --binstubs --without="development test migration" && \
           bundle exec rake assets:precompile
RUN        printf '#!/bin/sh\n \
           [ -z "$DATABASE_URL" ] && { echo "DATABASE_URL not set"; exit 1; }\n \
           export DB_HOST=$(echo $DB_PORT_3306_TCP|sed "s|^tcp://||")\n \
           export DATABASE_URL=$(echo "$DATABASE_URL" | sed "s/\[HOST\]/$DB_HOST/")\n \
           exec $@\n' > run && chmod a+x run
EXPOSE     3000
