FROM       ubuntu:13.10
MAINTAINER Prometheus Team <prometheus-developers@googlegroups.com>
ENV        RAILS_ENV production

RUN        apt-get update && apt-get install -yq \
           ruby2.0 ruby2.0-dev gcc make g++ libmysqlclient-dev
RUN        gem install bundler

WORKDIR    /promdash
ENTRYPOINT [ "./run" ]
CMD        [ "thin", "start" ]
ADD        . /promdash
RUN        bundle install --without="development test migration" && \
           bundle exec rake assets:precompile
RUN        printf '#!/bin/sh\n \
           [ -z "$DATABASE_URL" ] && \
           export DATABASE_URL=$(echo $DB_PORT_3306_TCP|sed 's/^tcp/mysql2/')/$PROMDASH_MYSQL_DATABASE\nexec $@' > \
           run && chmod a+x run
EXPOSE     3000
