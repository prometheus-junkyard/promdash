# PromDash

Dashboard builder for Prometheus.

## Testing

[![Build Status](https://travis-ci.org/prometheus/promdash.svg?branch=master)](https://travis-ci.org/prometheus/promdash)

    # Ruby tests.
    bundle exec rake

    # Javascript tests.
    bundle exec rake spec:javascript

## Deployment

### Development Mode
Install gems:

    bundle

Start the Rails server:

    bundle exec rails s

### Production Mode
In production mode, you need to define a number of environment variables to
configure the database parameters:

    PROMDASH_MYSQL_DATABASE="<db-name>"
    PROMDASH_MYSQL_HOST="<db-host>""
    PROMDASH_MYSQL_PASSWORD="<db-password>""
    PROMDASH_MYSQL_USERNAME="<db-username>"
    RAILS_ENV="production"

Create a self-contained Ruby environment and precompile assets:

    make build

Run the production server from the bundled environment:

    bin/env bin/bundle exec bin/thin -p $PORT start

### Deployment Checklist

*Before* deploying a new version of PromDash, follow this checklist:

- Study what has changed since the last deployment:
  - Do any migrations need to be performed (`bundle exec rake db:migrate`)?
  - Do any new environment variables need to be set?
  - Did any of the stored dashboard JSON formats change in a backwards-incompatible way?
- To be safe, create a backup of the current PromDash database.
- Do tests pass for the new revision?
- Are there any other particularly risky changes?

*After* deploying a new version:

- Perform a hard refresh in the browser to ensure all loaded assets are up-to-date.
- Test basic functionality as appropriate (Prometheus and Graphite graph settings, etc.).
